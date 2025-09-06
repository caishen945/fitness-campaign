const { pool } = require('../config/database');

class WalletService {
    // 获取用户钱包信息
    static async getUserWallet(userId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT * FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (rows.length === 0) {
                // 如果钱包不存在，创建一个
                return await this.createUserWallet(userId);
            }
            
            return rows[0];
        } finally {
            connection.release();
        }
    }

    // 创建用户钱包
    static async createUserWallet(userId) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(`
                INSERT INTO user_wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded)
                VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)
            `, [userId]);
            
            return {
                id: result.insertId,
                user_id: userId,
                balance: 0.00,
                frozen_balance: 0.00,
                total_deposited: 0.00,
                total_withdrawn: 0.00,
                total_rewarded: 0.00
            };
        } finally {
            connection.release();
        }
    }

    // 生成充值订单号
    static generateDepositOrderNo() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `DEP${date}${timestamp.toString().slice(-6)}${random}`;
    }

    // 生成提现申请号
    static generateWithdrawalRequestNo() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `WD${date}${timestamp.toString().slice(-6)}${random}`;
    }

    // 充值
    static async deposit(userId, amount, paymentMethod = 'admin', trxHash = null, description = '管理员充值') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 生成标准化订单号
            const orderNo = this.generateDepositOrderNo();
            
            // 创建充值订单
            const [orderResult] = await connection.execute(`
                INSERT INTO deposit_orders (order_no, user_id, amount, payment_method, trx_hash, status, admin_notes)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
            `, [orderNo, userId, amount, paymentMethod, trxHash, description]);
            
            await connection.commit();
            
            return {
                success: true,
                orderNo,
                message: '充值申请已提交，等待处理',
                data: {
                    orderNo,
                    amount,
                    paymentMethod,
                    status: 'pending',
                    trxHash
                }
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 提现申请
    static async requestWithdrawal(userId, amount, trc20Wallet, description = '用户提现申请') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 检查余额是否足够
            const wallet = await this.getUserWallet(userId);
            if (wallet.balance < amount) {
                throw new Error('余额不足');
            }
            
            // 检查最小提现金额
            if (amount < 10.00) {
                throw new Error('最小提现金额为10.00 USDT');
            }
            
            // 生成标准化申请号
            const requestNo = this.generateWithdrawalRequestNo();
            
            // 创建提现申请
            const [result] = await connection.execute(`
                INSERT INTO withdrawal_requests (request_no, user_id, amount, trc20_wallet, status, admin_notes)
                VALUES (?, ?, ?, ?, 'pending', ?)
            `, [requestNo, userId, amount, trc20Wallet, description]);
            
            await connection.commit();
            
            return {
                success: true,
                requestNo,
                message: '提现申请已提交，等待审核',
                data: {
                    requestNo,
                    amount,
                    trc20Wallet,
                    status: 'pending'
                }
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 处理充值订单（管理员操作）
    static async processDeposit(orderNo, status, adminNotes = '') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 获取充值订单信息
            const [orderRows] = await connection.execute(`
                SELECT * FROM deposit_orders WHERE order_no = ? AND status = 'pending'
            `, [orderNo]);
            
            if (orderRows.length === 0) {
                throw new Error('订单不存在或已处理');
            }
            
            const order = orderRows[0];
            
            if (status === 'completed') {
                // 获取当前余额
                const [walletRows] = await connection.execute(`
                    SELECT balance FROM user_wallets WHERE user_id = ?
                `, [order.user_id]);
                
                let balanceBefore = 0.00;
                if (walletRows.length > 0) {
                    balanceBefore = walletRows[0].balance;
                } else {
                    // 创建钱包
                    await this.createUserWallet(order.user_id);
                }
                
                // 更新余额
                await connection.execute(`
                    UPDATE user_wallets 
                    SET balance = balance + ?, 
                        total_deposited = total_deposited + ?,
                        updated_at = NOW()
                    WHERE user_id = ?
                `, [order.amount, order.amount, order.user_id]);
                
                // 获取更新后余额
                const [newWalletRows] = await connection.execute(`
                    SELECT balance FROM user_wallets WHERE user_id = ?
                `, [order.user_id]);
                const balanceAfter = newWalletRows[0].balance;
                
                // 记录交易
                await connection.execute(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, balance_before, balance_after,
                        description, reference_id, reference_type, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [order.user_id, 'deposit', order.amount, balanceBefore, balanceAfter, 
                    adminNotes || '充值到账', orderNo, 'deposit_order', 'completed']);
            }
            
            // 更新订单状态
            await connection.execute(`
                UPDATE deposit_orders 
                SET status = ?, admin_notes = ?, completed_at = NOW(), updated_at = NOW()
                WHERE order_no = ?
            `, [status, adminNotes, orderNo]);
            
            await connection.commit();
            
            return {
                success: true,
                message: `充值订单已${status === 'completed' ? '完成' : '处理'}`
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 处理提现申请（管理员操作）
    static async processWithdrawal(requestId, status, adminNotes = '') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 获取提现申请信息
            const [requestRows] = await connection.execute(`
                SELECT * FROM withdrawal_requests WHERE id = ?
            `, [requestId]);
            
            if (requestRows.length === 0) {
                throw new Error('提现申请不存在');
            }
            
            const request = requestRows[0];
            
            // 更新申请状态
            await connection.execute(`
                UPDATE withdrawal_requests 
                SET status = ?, admin_notes = ?, processed_at = NOW()
                WHERE id = ?
            `, [status, adminNotes, requestId]);
            
            if (status === 'approved') {
                // 如果批准，扣除余额
                const [walletRows] = await connection.execute(`
                    SELECT balance FROM user_wallets WHERE user_id = ?
                `, [request.user_id]);
                
                const balanceBefore = walletRows[0].balance;
                const balanceAfter = balanceBefore - request.amount;
                
                // 更新余额
                await connection.execute(`
                    UPDATE user_wallets 
                    SET balance = ?, 
                        total_withdrawn = total_withdrawn + ?,
                        updated_at = NOW()
                    WHERE user_id = ?
                `, [balanceAfter, request.amount, request.user_id]);
                
                // 记录交易
                await connection.execute(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, balance_before, balance_after,
                        description, reference_id, reference_type, created_at
                    ) VALUES (?, 'withdrawal', ?, ?, ?, ?, ?, 'withdrawal_request', NOW())
                `, [request.user_id, request.amount, balanceBefore, balanceAfter, 
                     `提现到钱包: ${request.trc20_wallet}`, request.request_no]);
            }
            
            await connection.commit();
            
            return {
                success: true,
                message: `提现申请已${status === 'approved' ? '批准' : '拒绝'}`
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 发放奖励
    static async giveReward(userId, rewardType, amount, description, referenceId = null, referenceType = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 获取奖励配置
            const [configRows] = await connection.execute(`
                SELECT * FROM reward_configs WHERE reward_type = ? AND is_active = TRUE
            `, [rewardType]);
            
            if (configRows.length === 0) {
                throw new Error('奖励类型不存在或已禁用');
            }
            
            const config = configRows[0];
            
            // 获取当前余额
            const [walletRows] = await connection.execute(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            let balanceBefore = 0.00;
            if (walletRows.length > 0) {
                balanceBefore = walletRows[0].balance;
            } else {
                // 创建钱包
                await this.createUserWallet(userId);
            }
            
            // 更新余额
            await connection.execute(`
                UPDATE user_wallets 
                SET balance = balance + ?, 
                    total_rewarded = total_rewarded + ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `, [amount, amount, userId]);
            
            // 获取更新后余额
            const [newWalletRows] = await connection.execute(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            const balanceAfter = newWalletRows[0].balance;
            
            // 记录交易
            await connection.execute(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, balance_before, balance_after,
                    description, reference_id, reference_type, created_at
                ) VALUES (?, 'reward', ?, ?, ?, ?, ?, ?, NOW())
            `, [userId, amount, balanceBefore, balanceAfter, description, referenceId, referenceType]);
            
            // 记录奖励
            await connection.execute(`
                INSERT INTO user_rewards (
                    user_id, reward_config_id, amount, reference_id, reference_type, status, credited_at
                ) VALUES (?, ?, ?, ?, ?, 'credited', NOW())
            `, [userId, config.id, amount, referenceId, referenceType]);
            
            await connection.commit();
            
            return {
                success: true,
                balanceBefore,
                balanceAfter,
                message: '奖励发放成功'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 冻结余额（用于挑战押金等）
    static async freezeBalance(userId, amount, description, referenceId, referenceType) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 检查可用余额
            const [walletRows] = await connection.execute(`
                SELECT balance, frozen_balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0) {
                throw new Error('钱包不存在');
            }
            
            const wallet = walletRows[0];
            if (wallet.balance < amount) {
                throw new Error('可用余额不足');
            }
            
            // 冻结余额
            await connection.execute(`
                UPDATE user_wallets 
                SET balance = balance - ?,
                    frozen_balance = frozen_balance + ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `, [amount, amount, userId]);
            
            // 记录交易
            await connection.execute(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, balance_before, balance_after,
                    description, reference_id, reference_type, created_at
                ) VALUES (?, 'challenge_deposit', ?, ?, ?, ?, ?, ?, NOW())
            `, [userId, amount, wallet.balance, wallet.balance - amount, description, referenceId, referenceType]);
            
            await connection.commit();
            
            return {
                success: true,
                message: '余额冻结成功'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 解冻余额（挑战完成或取消时）
    static async unfreezeBalance(userId, amount, description, referenceId, referenceType) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 检查冻结余额
            const [walletRows] = await connection.execute(`
                SELECT balance, frozen_balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0) {
                throw new Error('钱包不存在');
            }
            
            const wallet = walletRows[0];
            if (wallet.frozen_balance < amount) {
                throw new Error('冻结余额不足');
            }
            
            // 解冻余额
            await connection.execute(`
                UPDATE user_wallets 
                SET balance = balance + ?,
                    frozen_balance = frozen_balance - ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `, [amount, amount, userId]);
            
            // 记录交易
            await connection.execute(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, balance_before, balance_after,
                    description, reference_id, reference_type, created_at
                ) VALUES (?, 'challenge_refund', ?, ?, ?, ?, ?, ?, NOW())
            `, [userId, amount, wallet.balance, wallet.balance + amount, description, referenceId, referenceType]);
            
            await connection.commit();
            
            return {
                success: true,
                message: '余额解冻成功'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 获取用户交易记录
    static async getTransactionHistory(userId, page = 1, limit = 20) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            
            // 获取总记录数
            const [countRows] = await connection.execute(`
                SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?
            `, [userId]);
            
            const total = countRows[0].total;
            
            // 获取交易记录
            const [transactions] = await connection.execute(`
                SELECT * FROM wallet_transactions 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `, [userId, limit, offset]);
            
            // 标准化数据格式
            const normalizedTransactions = transactions.map(tx => ({
                id: tx.id,
                userId: tx.user_id,
                type: tx.transaction_type,
                transaction_type: tx.transaction_type,
                amount: tx.amount,
                description: tx.description,
                createdAt: tx.created_at,
                created_at: tx.created_at,
                status: tx.status,
                reference_id: tx.reference_id,
                reference_type: tx.reference_type
            }));
            
            return {
                transactions: normalizedTransactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } finally {
            connection.release();
        }
    }
    
    // 获取用户交易记录（管理员查看）
    static async getUserTransactionHistory(userId, page = 1, limit = 20) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            
            // 获取用户信息
            const [userRows] = await connection.execute(`
                SELECT id, email, telegram_id, first_name, last_name FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0) {
                throw new Error('用户不存在');
            }
            
            // 获取用户钱包信息
            const [walletRows] = await connection.execute(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            const currentBalance = walletRows.length > 0 ? walletRows[0].balance : 0.00;
            
            // 获取总记录数
            const [countRows] = await connection.execute(`
                SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?
            `, [userId]);
            
            const total = countRows[0].total;
            
            // 获取交易记录
            const [transactions] = await connection.execute(`
                SELECT 
                    id,
                    user_id,
                    transaction_type,
                    amount,
                    description,
                    created_at
                FROM wallet_transactions 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `, [userId, limit, offset]);
            
            return {
                user: {
                    id: userRows[0].id,
                    displayName: userRows[0].first_name && userRows[0].last_name ? 
                        `${userRows[0].first_name} ${userRows[0].last_name}` : 
                        (userRows[0].first_name || (userRows[0].email ? userRows[0].email.split('@')[0] : `用户${userRows[0].id}`)),
                    email: userRows[0].email,
                    telegramId: userRows[0].telegram_id,
                    firstName: userRows[0].first_name,
                    lastName: userRows[0].last_name,
                    currentBalance: currentBalance
                },
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } finally {
            connection.release();
        }
    }

    // 获取钱包统计信息
    static async getWalletStats(userId) {
        const connection = await pool.getConnection();
        try {
            const [walletRows] = await connection.execute(`
                SELECT * FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0) {
                return {
                    balance: 0.00,
                    frozenBalance: 0.00,
                    totalDeposited: 0.00,
                    totalWithdrawn: 0.00,
                    totalRewarded: 0.00,
                    totalBalance: 0.00
                };
            }
            
            const wallet = walletRows[0];
            
            // 获取本月统计
            const [monthlyStats] = await connection.execute(`
                SELECT 
                    SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as monthly_deposits,
                    SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as monthly_withdrawals,
                    SUM(CASE WHEN transaction_type = 'reward' THEN amount ELSE 0 END) as monthly_rewards
                FROM wallet_transactions 
                WHERE user_id = ? 
                AND MONTH(created_at) = MONTH(NOW()) 
                AND YEAR(created_at) = YEAR(NOW())
            `, [userId]);
            
            return {
                balance: wallet.balance,
                frozenBalance: wallet.frozen_balance,
                totalDeposited: wallet.total_deposited,
                totalWithdrawn: wallet.total_withdrawn,
                totalRewarded: wallet.total_rewarded,
                totalBalance: wallet.balance + wallet.frozen_balance,
                monthlyStats: monthlyStats[0]
            };
        } finally {
            connection.release();
        }
    }
    
    // 管理员调整用户余额
    static async adjustUserBalance(userId, type, amount, reason) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 检查用户是否存在
            const [userRows] = await connection.execute(`
                SELECT id, email, telegram_id, first_name, last_name FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0) {
                throw new Error('用户不存在');
            }
            
            // 获取当前钱包信息
            const [walletRows] = await connection.execute(`
                SELECT * FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            let balanceBefore = 0.00;
            if (walletRows.length === 0) {
                // 创建钱包
                try {
                    await connection.execute(`
                        INSERT INTO user_wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded)
                        VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)
                    `, [userId]);
                    balanceBefore = 0.00;
                    console.log('新钱包创建成功:', { userId });
                } catch (insertError) {
                    // 如果插入失败，可能是由于并发插入导致的唯一约束冲突
                    // 重新查询钱包信息
                    console.log('钱包插入失败，重新查询:', insertError.message);
                    const [retryRows] = await connection.execute(`
                        SELECT * FROM user_wallets WHERE user_id = ?
                    `, [userId]);
                    
                    if (retryRows.length > 0) {
                        balanceBefore = parseFloat(retryRows[0].balance);
                        console.log('重新查询到钱包:', { userId, balanceBefore });
                    } else {
                        throw new Error('无法创建或查询钱包');
                    }
                }
            } else {
                balanceBefore = parseFloat(walletRows[0].balance);
                console.log('当前余额:', { userId, balanceBefore, type: typeof balanceBefore });
            }
            
            // 计算调整后的余额
            const adjustmentAmount = type === 'add' ? parseFloat(amount) : -parseFloat(amount);
            const balanceAfter = parseFloat(balanceBefore) + adjustmentAmount;
            console.log('余额计算:', { balanceBefore, adjustmentAmount, balanceAfter });
            
            if (balanceAfter < 0) {
                throw new Error('余额不足，无法减少');
            }
            
            // 更新钱包余额
            console.log('更新余额:', { userId, balanceAfter: balanceAfter.toFixed(2) });
            const [updateResult] = await connection.execute(`
                UPDATE user_wallets 
                SET balance = ?, 
                    updated_at = NOW()
                WHERE user_id = ?
            `, [balanceAfter.toFixed(2), userId]);
            console.log('更新结果:', updateResult);
            
            // 记录交易
            const transactionType = 'admin_adjust';
            const description = `管理员${type === 'add' ? '增加' : '减少'}余额: ${reason}`;
            
            // 记录交易
            await connection.execute(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, balance_before, balance_after,
                    description, reference_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'admin_operation', NOW())
            `, [userId, transactionType, amount, balanceBefore, balanceAfter, description]);
            console.log('交易记录成功');
            
            await connection.commit();
            console.log('事务提交成功');
            
            // 验证更新结果
            const [verifyRows] = await connection.execute(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            console.log('验证结果:', verifyRows[0]);
            
            return {
                success: true,
                data: {
                    userId,
                    displayName: userRows[0].first_name && userRows[0].last_name ? 
                        `${userRows[0].first_name} ${userRows[0].last_name}` : 
                        (userRows[0].first_name || (userRows[0].email ? userRows[0].email.split('@')[0] : `用户${userRows[0].id}`)),
                    email: userRows[0].email,
                    telegramId: userRows[0].telegram_id,
                    firstName: userRows[0].first_name,
                    lastName: userRows[0].last_name,
                    type,
                    amount,
                    balanceBefore: parseFloat(balanceBefore).toFixed(2),
                    balanceAfter: balanceAfter.toFixed(2),
                    reason
                },
                message: '余额调整成功'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 获取充值记录
    static async getDepositRecords(page = 1, limit = 50) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            
            const [records] = await connection.execute(`
                SELECT 
                    do.*, 
                    u.email,
                    u.first_name,
                    u.last_name
                FROM deposit_orders do
                LEFT JOIN users u ON do.user_id = u.id
                ORDER BY do.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            // 获取总数
            const [countResult] = await connection.execute(`
                SELECT COUNT(*) as total FROM deposit_orders
            `);
            
            return {
                records,
                total: countResult[0].total,
                page,
                limit,
                totalPages: Math.ceil(countResult[0].total / limit)
            };
        } finally {
            connection.release();
        }
    }

    // 获取所有交易记录
    static async getAllTransactions(page = 1, limit = 50) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            
            const [transactions] = await connection.execute(`
                SELECT 
                    wt.*, 
                    u.email,
                    u.first_name,
                    u.last_name
                FROM wallet_transactions wt
                LEFT JOIN users u ON wt.user_id = u.id
                ORDER BY wt.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            // 获取总数
            const [countResult] = await connection.execute(`
                SELECT COUNT(*) as total FROM wallet_transactions
            `);
            
            return {
                transactions,
                total: countResult[0].total,
                page,
                limit,
                totalPages: Math.ceil(countResult[0].total / limit)
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = WalletService;
