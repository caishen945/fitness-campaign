const { pool } = require('../config/database');

class UserController {
    // 获取所有用户
    async getAllUsers(req, res) {
        const startTime = Date.now();
        try {
            const {
                page = 1,
                limit = 20,
                userId,
                email,
                telegram,
                balance,
                wallet,
                status
            } = req.query;

            // 限制最大查询数量，防止性能问题
            const maxLimit = Math.min(parseInt(limit) || 20, 100);
            const currentPage = Math.max(parseInt(page) || 1, 1);

            // 从数据库获取用户数据，包含钱包信息
            const connection = await pool.getConnection();
            const queryStartTime = Date.now();
            
            try {

            // 优化查询：联接用户表和钱包表，支持多种搜索条件
            let userQuery = `
                SELECT
                    u.id,
                    u.email,
                    u.telegram_id,
                    u.first_name,
                    u.last_name,
                    u.phone,
                    u.avatar,
                    u.is_active as status,
                    u.created_at as createdAt,
                    u.updated_at as updatedAt,
                    u.last_login as lastLoginAt,
                    u.trc20_wallet as trc20Wallet,
                    COALESCE(w.balance, 0) as balance
                FROM users u
                LEFT JOIN user_wallets w ON u.id = w.user_id
                WHERE 1=1
            `;

            const userParams = [];

            // 用户ID搜索
            if (userId) {
                userQuery += ` AND u.id = ?`;
                userParams.push(parseInt(userId));
            }

            // 邮箱搜索
            if (email) {
                userQuery += ` AND u.email LIKE ?`;
                userParams.push(`%${email}%`);
            }

            // Telegram搜索（ID、姓名）
            if (telegram) {
                userQuery += ` AND (u.telegram_id = ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
                const telegramId = parseInt(telegram);
                if (isNaN(telegramId)) {
                    // 如果不是数字，只搜索姓名
                    userParams.push(null, `%${telegram}%`, `%${telegram}%`);
                } else {
                    // 如果是数字，搜索ID和姓名
                    userParams.push(telegramId, `%${telegram}%`, `%${telegram}%`);
                }
            }

            // 余额搜索
            if (balance) {
                const balanceValue = parseFloat(balance);
                if (!isNaN(balanceValue)) {
                    userQuery += ` AND COALESCE(w.balance, 0) >= ?`;
                    userParams.push(balanceValue);
                }
            }

            // 钱包地址搜索
            if (wallet) {
                userQuery += ` AND u.trc20_wallet LIKE ?`;
                userParams.push(`%${wallet}%`);
            }

            // 状态搜索
            if (status) {
                userQuery += ` AND u.is_active = ?`;
                userParams.push(status === 'active' ? 1 : 0);
            }

            userQuery += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
            const offset = (currentPage - 1) * maxLimit;
            userParams.push(maxLimit, offset);

            // 获取用户列表
            const [users] = await connection.execute(userQuery, userParams);
            const userQueryTime = Date.now() - queryStartTime;

            // 获取总数（优化：使用单独的COUNT查询）
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM users u
                LEFT JOIN user_wallets w ON u.id = w.user_id
                WHERE 1=1
            `;
            const countParams = [];

            // 用户ID搜索
            if (userId) {
                countQuery += ` AND u.id = ?`;
                countParams.push(parseInt(userId));
            }

            // 邮箱搜索
            if (email) {
                countQuery += ` AND u.email LIKE ?`;
                countParams.push(`%${email}%`);
            }

            // Telegram搜索（ID、姓名）
            if (telegram) {
                countQuery += ` AND (u.telegram_id = ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
                const telegramId = parseInt(telegram);
                if (isNaN(telegramId)) {
                    // 如果不是数字，只搜索姓名
                    countParams.push(null, `%${telegram}%`, `%${telegram}%`);
                } else {
                    // 如果是数字，搜索ID和姓名
                    countParams.push(telegramId, `%${telegram}%`, `%${telegram}%`);
                }
            }

            // 余额搜索
            if (balance) {
                const balanceValue = parseFloat(balance);
                if (!isNaN(balanceValue)) {
                    countQuery += ` AND COALESCE(w.balance, 0) >= ?`;
                    countParams.push(balanceValue);
                }
            }

            // 钱包地址搜索
            if (wallet) {
                countQuery += ` AND u.trc20_wallet LIKE ?`;
                countParams.push(`%${wallet}%`);
            }

            // 状态搜索
            if (status) {
                countQuery += ` AND u.is_active = ?`;
                countParams.push(status === 'active' ? 1 : 0);
            }

            const [countResult] = await connection.execute(countQuery, countParams);
            const total = countResult[0].total;

            // 批量获取钱包信息（优化：减少JOIN查询）
            let walletQueryTime = 0;
            if (users.length > 0) {
                const walletStartTime = Date.now();
                const userIds = users.map(u => u.id);
                const walletQuery = `
                    SELECT user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded
                    FROM user_wallets
                    WHERE user_id IN (${userIds.map(() => '?').join(',')})
                `;

                const [wallets] = await connection.execute(walletQuery, userIds);
                const walletMap = new Map(wallets.map(w => [w.user_id, w]));
                walletQueryTime = Date.now() - walletStartTime;

                // 合并用户和钱包信息
                const formattedUsers = users.map(user => {
                    const wallet = walletMap.get(user.id) || {};
                    return {
                        ...user,
                        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
                        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
                        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
                        balance: parseFloat(wallet.balance || 0),
                        frozenBalance: parseFloat(wallet.frozen_balance || 0),
                        totalDeposited: parseFloat(wallet.total_deposited || 0),
                        totalWithdrawn: parseFloat(wallet.total_withdrawn || 0),
                        totalRewarded: parseFloat(wallet.total_rewarded || 0)
                    };
                });

                const totalTime = Date.now() - startTime;
                console.log(`🚀 用户列表API性能报告:`);
                console.log(`   📊 总响应时间: ${totalTime}ms`);
                console.log(`   👥 用户查询时间: ${userQueryTime}ms`);
                console.log(`   💰 钱包查询时间: ${walletQueryTime}ms`);
                console.log(`   📈 返回用户数量: ${formattedUsers.length}`);
                console.log(`   🔍 查询参数: page=${currentPage}, limit=${maxLimit}, userId=${userId || '无'}, email=${email || '无'}, telegram=${telegram || '无'}, balance=${balance || '无'}, wallet=${wallet || '无'}, status=${status || '无'}`);

                res.json({
                    success: true,
                    data: {
                        users: formattedUsers,
                        pagination: {
                            page: currentPage,
                            limit: maxLimit,
                            total_users: total,
                            total_pages: Math.ceil(total / maxLimit)
                        }
                    },
                    message: '获取用户列表成功',
                    performance: {
                        totalTime,
                        userQueryTime,
                        walletQueryTime,
                        userCount: formattedUsers.length
                    }
                });
            } else {
                const totalTime = Date.now() - startTime;
                console.log(`🚀 用户列表API性能报告 (无数据):`);
                console.log(`   📊 总响应时间: ${totalTime}ms`);
                console.log(`   👥 用户查询时间: ${userQueryTime}ms`);
                console.log(`   📈 返回用户数量: 0`);

                res.json({
                    success: true,
                    data: {
                        users: [],
                        pagination: {
                            page: currentPage,
                            limit: maxLimit,
                            total_users: 0,
                            total_pages: 0
                        }
                    },
                    message: '获取用户列表成功',
                    performance: {
                        totalTime,
                        userQueryTime,
                        walletQueryTime: 0,
                        userCount: 0
                    }
                });
            }
        } finally {
            connection.release();
        }
        } catch (error) {
            const totalTime = Date.now() - startTime;
            console.error('❌ 获取用户列表失败:', error);
            console.error(`⏱️ 失败耗时: ${totalTime}ms`);
            res.status(500).json({
                success: false,
                error: '获取用户列表失败',
                performance: { totalTime }
            });
        }
    }

    // 获取单个用户
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            const connection = await pool.getConnection();

            const query = `
                SELECT
                    u.id,
                    u.email,
                    u.telegram_id,
                    u.first_name,
                    u.last_name,
                    u.phone,
                    u.avatar,
                    u.is_active as status,
                    u.created_at as createdAt,
                    u.updated_at as updatedAt,
                    u.last_login as lastLoginAt,
                    u.trc20_wallet as trc20Wallet,
                    COALESCE(uw.balance, 0) as balance,
                    COALESCE(uw.frozen_balance, 0) as frozenBalance,
                    COALESCE(uw.total_deposited, 0) as totalDeposited,
                    COALESCE(uw.total_withdrawn, 0) as totalWithdrawn,
                    COALESCE(uw.total_rewarded, 0) as totalRewarded
                FROM users u
                LEFT JOIN user_wallets uw ON u.id = uw.user_id
                WHERE u.id = ?
            `;

            const [users] = await connection.execute(query, [id]);
            connection.release();

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            const user = users[0];

            // 格式化数据
            const formattedUser = {
                ...user,
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
                updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
                lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
                balance: parseFloat(user.balance || 0),
                frozenBalance: parseFloat(user.frozenBalance || 0),
                totalDeposited: parseFloat(user.totalDeposited || 0),
                totalWithdrawn: parseFloat(user.totalWithdrawn || 0),
                totalRewarded: parseFloat(user.totalRewarded || 0)
            };

            res.json({
                success: true,
                data: formattedUser,
                message: '获取用户信息成功'
            });
        } catch (error) {
            console.error('获取用户信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户信息失败',
                error: error.message
            });
        }
    }

    // 创建用户
    async createUser(req, res) {
        try {
            const userData = req.body;

            // 模拟创建用户
            const newUser = {
                id: Date.now(),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                status: userData.status || 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
                trc20Wallet: null,
                totalSteps: 0,
                totalRewards: 0
            };

            res.status(201).json({
                success: true,
                data: newUser,
                message: '创建用户成功'
            });
        } catch (error) {
            console.error('创建用户失败:', error);
            res.status(500).json({
                success: false,
                message: '创建用户失败',
                error: error.message
            });
        }
    }

    // 更新用户
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const connection = await pool.getConnection();

            // 构建更新字段
            const updateFields = [];
            const updateValues = [];

            if (updateData.firstName !== undefined) {
                updateFields.push('first_name = ?');
                updateValues.push(updateData.firstName);
            }

            if (updateData.lastName !== undefined) {
                updateFields.push('last_name = ?');
                updateValues.push(updateData.lastName);
            }

            if (updateData.email !== undefined) {
                updateFields.push('email = ?');
                updateValues.push(updateData.email);
            }

            if (updateData.trc20Wallet !== undefined) {
                updateFields.push('trc20_wallet = ?');
                updateValues.push(updateData.trc20Wallet);
            }

            if (updateData.status !== undefined) {
                updateFields.push('is_active = ?');
                updateValues.push(updateData.status === 'active' ? 1 : 0);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '没有提供要更新的字段'
                });
            }

            updateFields.push('updated_at = NOW()');
            updateValues.push(parseInt(id));

            // 执行更新
            const [result] = await connection.execute(`
                UPDATE users
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, updateValues);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            // 获取更新后的用户信息
            const [userRows] = await connection.execute(`
                SELECT
                    u.id,
                    u.email,
                    u.telegram_id,
                    u.first_name,
                    u.last_name,
                    u.phone,
                    u.avatar,
                    u.is_active as status,
                    u.trc20_wallet,
                    u.created_at,
                    u.updated_at,
                    u.last_login,
                    COALESCE(uw.balance, 0.00) as balance,
                    COALESCE(uw.frozen_balance, 0.00) as frozen_balance,
                    COALESCE(uw.total_deposited, 0.00) as total_deposited,
                    COALESCE(uw.total_withdrawn, 0.00) as total_withdrawn,
                    COALESCE(uw.total_rewarded, 0.00) as total_rewarded
                FROM users u
                LEFT JOIN user_wallets uw ON u.id = uw.user_id
                WHERE u.id = ?
            `, [id]);

            connection.release();

            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            const user = userRows[0];

            res.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    telegramId: user.telegram_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    avatar: user.avatar,
                    status: user.status ? 'active' : 'inactive',
                    trc20Wallet: user.trc20_wallet,
                    displayName: user.first_name && user.last_name ? 
                        `${user.first_name} ${user.last_name}` : 
                        (user.first_name || (user.email ? user.email.split('@')[0] : `用户${user.id}`)),
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    lastLoginAt: user.last_login,
                    balance: user.balance,
                    frozenBalance: user.frozen_balance,
                    totalDeposited: user.total_deposited,
                    totalWithdrawn: user.total_withdrawn,
                    totalRewarded: user.total_rewarded
                },
                message: '更新用户成功'
            });
        } catch (error) {
            console.error('更新用户失败:', error);
            res.status(500).json({
                success: false,
                message: '更新用户失败',
                error: error.message
            });
        }
    }

    // 删除用户
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            res.json({
                success: true,
                message: '删除用户成功'
            });
        } catch (error) {
            console.error('删除用户失败:', error);
            res.status(500).json({
                success: false,
                message: '删除用户失败',
                error: error.message
            });
        }
    }

    // 批量更新用户状态
    async batchUpdateStatus(req, res) {
        try {
            const { userIds, status } = req.body;

            res.json({
                success: true,
                message: `批量${status === 'active' ? '启用' : '禁用'}用户成功`
            });
        } catch (error) {
            console.error('批量更新用户状态失败:', error);
            res.status(500).json({
                success: false,
                message: '批量更新用户状态失败',
                error: error.message
            });
        }
    }

    // ==========================================
    // 用户余额管理方法
    // ==========================================

    // 为用户增加余额
    async addUserBalance(req, res) {
        try {
            const { userId, amount, note } = req.body;
            const connection = await pool.getConnection();

            // 验证用户是否存在
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            // 检查用户钱包是否存在，不存在则创建
            const [walletRows] = await connection.execute(
                'SELECT id FROM user_wallets WHERE user_id = ?',
                [userId]
            );

            if (walletRows.length === 0) {
                await connection.execute(
                    'INSERT INTO user_wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded) VALUES (?, 0, 0, 0, 0, 0)',
                    [userId]
                );
            }

            // 增加余额
            await connection.execute(
                'UPDATE user_wallets SET balance = balance + ?, total_deposited = total_deposited + ? WHERE user_id = ?',
                [amount, amount, userId]
            );

            // 获取更新后的余额以记录交易
            const [updatedWalletRows] = await connection.execute(
                'SELECT balance FROM user_wallets WHERE user_id = ?',
                [userId]
            );
            const balanceAfter = parseFloat(updatedWalletRows[0].balance);
            const balanceBefore = balanceAfter - parseFloat(amount);

            // 记录交易
            await connection.execute(
                'INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [userId, 'admin_adjust', amount, balanceBefore.toFixed(2), balanceAfter.toFixed(2), note || '管理员余额调整']
            );

            connection.release();

            res.json({
                success: true,
                message: '增加余额成功',
                data: { userId, amount, note }
            });
        } catch (error) {
            console.error('增加余额失败:', error);
            res.status(500).json({
                success: false,
                message: '增加余额失败',
                error: error.message
            });
        }
    }

    // 为用户减少余额
    async subtractUserBalance(req, res) {
        try {
            const { userId, amount, note } = req.body;
            const connection = await pool.getConnection();

            // 验证用户是否存在
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            // 检查余额是否足够
            const [walletRows] = await connection.execute(
                'SELECT balance FROM user_wallets WHERE user_id = ?',
                [userId]
            );

            if (walletRows.length === 0 || walletRows[0].balance < amount) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: '余额不足'
                });
            }

            // 减少余额
            await connection.execute(
                'UPDATE user_wallets SET balance = balance - ?, total_withdrawn = total_withdrawn + ? WHERE user_id = ?',
                [amount, amount, userId]
            );

            // 记录交易
            await connection.execute(
                'INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_change, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, 'withdrawal', amount, -amount, note || '管理员减少余额']
            );

            connection.release();

            res.json({
                success: true,
                message: '减少余额成功',
                data: { userId, amount, note }
            });
        } catch (error) {
            console.error('减少余额失败:', error);
            res.status(500).json({
                success: false,
                message: '减少余额失败',
                error: error.message
            });
        }
    }

    // 冻结用户余额
    async freezeUserBalance(req, res) {
        try {
            const { userId, amount, note } = req.body;
            const connection = await pool.getConnection();

            // 验证用户是否存在
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            // 检查余额是否足够
            const [walletRows] = await connection.execute(
                'SELECT balance, frozen_balance FROM user_wallets WHERE user_id = ?',
                [userId]
            );

            if (walletRows.length === 0 || walletRows[0].balance < amount) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: '余额不足'
                });
            }

            // 冻结余额
            await connection.execute(
                'UPDATE user_wallets SET balance = balance - ?, frozen_balance = frozen_balance + ? WHERE user_id = ?',
                [amount, amount, userId]
            );

            // 记录交易
            await connection.execute(
                'INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_change, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, 'withdrawal', amount, -amount, note || '管理员冻结余额']
            );

            connection.release();

            res.json({
                success: true,
                message: '冻结余额成功',
                data: { userId, amount, note }
            });
        } catch (error) {
            console.error('冻结余额失败:', error);
            res.status(500).json({
                success: false,
                message: '冻结余额失败',
                error: error.message
            });
        }
    }

    // 获取用户个人资料
    async getUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            
            try {
                const [rows] = await connection.execute(
                    'SELECT id, email, telegram_id, first_name, last_name, phone, avatar, is_active, created_at, updated_at, last_login FROM users WHERE id = ?',
                    [userId]
                );
                
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: '用户不存在'
                    });
                }
                
                res.json({
                    success: true,
                    data: rows[0]
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取用户资料失败:', error);
            res.status(500).json({
                success: false,
                error: '获取用户资料失败'
            });
        }
    }

    // 更新用户个人资料
    async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const { email, phone, avatar } = req.body;
            const connection = await pool.getConnection();
            
            try {
                // 检查邮箱是否已被其他用户使用
                if (email) {
                    const [existingUsers] = await connection.execute(
                        'SELECT id FROM users WHERE email = ? AND id != ?',
                        [email, userId]
                    );
                    
                    if (existingUsers.length > 0) {
                        return res.status(400).json({
                            success: false,
                            error: '邮箱已被其他用户使用'
                        });
                    }
                }
                
                // 构建更新字段
                const updateFields = [];
                const updateValues = [];
                
                if (email !== undefined) {
                    updateFields.push('email = ?');
                    updateValues.push(email);
                }
                
                if (phone !== undefined) {
                    updateFields.push('phone = ?');
                    updateValues.push(phone);
                }
                
                if (avatar !== undefined) {
                    updateFields.push('avatar = ?');
                    updateValues.push(avatar);
                }
                
                if (updateFields.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: '没有提供要更新的字段'
                    });
                }
                
                updateFields.push('updated_at = NOW()');
                updateValues.push(userId);
                
                const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
                await connection.execute(updateQuery, updateValues);
                
                // 获取更新后的用户信息
                const [updatedUser] = await connection.execute(
                    'SELECT id, email, telegram_id, first_name, last_name, phone, avatar, is_active, created_at, updated_at, last_login FROM users WHERE id = ?',
                    [userId]
                );
                
                res.json({
                    success: true,
                    message: '用户资料更新成功',
                    data: updatedUser[0]
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('更新用户资料失败:', error);
            res.status(500).json({
                success: false,
                error: '更新用户资料失败'
            });
        }
    }

    // 解冻用户余额
    async unfreezeUserBalance(req, res) {
        try {
            const { userId, amount, note } = req.body;
            const connection = await pool.getConnection();

            // 验证用户是否存在
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            // 检查冻结余额是否足够
            const [walletRows] = await connection.execute(
                'SELECT frozen_balance FROM user_wallets WHERE user_id = ?',
                [userId]
            );

            if (walletRows.length === 0 || walletRows[0].frozen_balance < amount) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: '冻结余额不足'
                });
            }

            // 解冻余额
            await connection.execute(
                'UPDATE user_wallets SET balance = balance + ?, frozen_balance = frozen_balance - ? WHERE user_id = ?',
                [amount, amount, userId]
            );

            // 记录交易
            await connection.execute(
                'INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_change, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, 'reward', amount, amount, note || '管理员解冻余额']
            );

            connection.release();

            res.json({
                success: true,
                message: '解冻余额成功',
                data: { userId, amount, note }
            });
        } catch (error) {
            console.error('解冻余额失败:', error);
            res.status(500).json({
                success: false,
                message: '解冻余额失败',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();
