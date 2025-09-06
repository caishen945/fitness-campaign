const VIPChallenge = require('../models/VIPChallengeMySQL');
const VIPLevel = require('../models/VIPLevelMySQL');
const { pool } = require('../config/database');
const achievementService = require('../services/achievementService');

class VIPChallengeController {
    // 获取所有挑战记录（管理员查询）
    async getAllChallenges(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                status, 
                vipLevelId, 
                userId,
                email,
                telegram,
                startDate,
                endDate,
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = req.query;
            
            const offset = (page - 1) * limit;
            let whereConditions = [];
            let queryParams = [];
            
            // 构建查询条件
            if (status) {
                whereConditions.push('vc.status = ?');
                queryParams.push(status);
            }
            
            if (vipLevelId) {
                whereConditions.push('vc.vip_level_id = ?');
                queryParams.push(vipLevelId);
            }
            
            if (userId) {
                whereConditions.push('vc.user_id = ?');
                queryParams.push(userId);
            }

            // 邮箱搜索
            if (email) {
                whereConditions.push('u.email LIKE ?');
                queryParams.push(`%${email}%`);
            }

            // Telegram搜索（ID、姓名）
            if (telegram) {
                const telegramId = parseInt(telegram);
                if (isNaN(telegramId)) {
                    // 如果不是数字，只搜索姓名
                    whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ?)');
                    queryParams.push(`%${telegram}%`, `%${telegram}%`);
                } else {
                    // 如果是数字，搜索ID和姓名
                    whereConditions.push('(u.telegram_id = ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
                    queryParams.push(telegramId, `%${telegram}%`, `%${telegram}%`);
                }
            }
            
            if (startDate) {
                whereConditions.push('vc.created_at >= ?');
                queryParams.push(startDate);
            }
            
            if (endDate) {
                whereConditions.push('vc.created_at <= ?');
                queryParams.push(endDate);
            }
            
            const whereClause = whereConditions.length > 0 ? 
                'WHERE ' + whereConditions.join(' AND ') : '';
            
            // 查询总数
            const [countRows] = await pool.query(`
                SELECT COUNT(*) as total FROM vip_challenges vc
                LEFT JOIN users u ON vc.user_id = u.id
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                ${whereClause}
            `, queryParams);
            
            const total = countRows[0].total;
            
            // 查询数据
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    u.email,
                    u.telegram_id,
                    u.first_name,
                    u.last_name,
                    vl.name as level_name,
                    vl.icon as level_icon,
                    vl.color as level_color
                FROM vip_challenges vc
                LEFT JOIN users u ON vc.user_id = u.id
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                ${whereClause}
                ORDER BY vc.${sortBy} ${sortOrder}
                LIMIT ? OFFSET ?
            `, [...queryParams, parseInt(limit), offset]);
            
            // 转换为模型对象
            const challenges = rows.map(row => {
                const challenge = VIPChallenge.fromDatabase(row);
                challenge.user = {
                    id: row.user_id,
                    email: row.email,
                    telegramId: row.telegram_id,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    displayName: row.first_name && row.last_name ? 
                        `${row.first_name} ${row.last_name}` : 
                        (row.first_name || (row.email ? row.email.split('@')[0] : `用户${row.user_id}`))
                };
                challenge.vipLevel = {
                    id: row.vip_level_id,
                    name: row.level_name,
                    icon: row.level_icon,
                    color: row.level_color
                };
                return challenge;
            });
            
            const displayChallenges = challenges.map(function(challenge) {
                return challenge.getDisplayInfo();
            });
            
            res.json({
                success: true,
                data: {
                    challenges: displayChallenges,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                message: '获取挑战记录成功'
            });
        } catch (error) {
            console.error('获取挑战记录失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战记录失败',
                error: error.message
            });
        }
    }

    // 获取单个挑战记录详情
    async getChallengeById(req, res) {
        try {
            const { id } = req.params;
            
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    u.email,
                    u.telegram_id,
                    u.first_name,
                    u.last_name,
                    u.created_at as user_created_at,
                    vl.name as level_name,
                    vl.description as level_description,
                    vl.icon as level_icon,
                    vl.color as level_color,
                    vl.cancel_deduct_ratio,
                    vl.cancel_reward_ratio
                FROM vip_challenges vc
                LEFT JOIN users u ON vc.user_id = u.id
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }
            
            const row = rows[0];
            const challenge = VIPChallenge.fromDatabase(row);
            challenge.user = {
                id: row.user_id,
                email: row.email,
                telegramId: row.telegram_id,
                firstName: row.first_name,
                lastName: row.last_name,
                displayName: row.first_name && row.last_name ? 
                    `${row.first_name} ${row.last_name}` : 
                    (row.first_name || (row.email ? row.email.split('@')[0] : `用户${row.user_id}`)),
                createdAt: row.user_created_at
            };
            challenge.vipLevel = {
                id: row.vip_level_id,
                name: row.level_name,
                description: row.level_description,
                icon: row.level_icon,
                color: row.level_color,
                cancelDeductRatio: row.cancel_deduct_ratio,
                cancelRewardRatio: row.cancel_reward_ratio
            };
            
            const displayInfo = challenge.getDisplayInfo();
            
            res.json({
                success: true,
                data: displayInfo,
                message: '获取挑战记录详情成功'
            });
        } catch (error) {
            console.error('获取挑战记录详情失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战记录详情失败',
                error: error.message
            });
        }
    }

    // 获取挑战统计信息
    async getChallengeStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            let dateCondition = '';
            let dateParams = [];
            
            if (startDate && endDate) {
                dateCondition = 'WHERE created_at BETWEEN ? AND ?';
                dateParams = [startDate, endDate];
            }
            
            // 总体统计
            const [totalStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_challenges,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_challenges,
                    SUM(deposit_amount) as total_deposits,
                    SUM(reward_amount) as total_rewards,
                    SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as completed_rewards
                FROM vip_challenges
                ${dateCondition}
            `, dateParams);
            
            // 按等级统计
            const [levelStats] = await pool.query(`
                SELECT 
                    vl.name as level_name,
                    vl.icon as level_icon,
                    vl.color as level_color,
                    COUNT(vc.id) as challenge_count,
                    COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_count,
                    SUM(vc.deposit_amount) as total_deposits,
                    SUM(vc.reward_amount) as total_rewards
                FROM vip_levels vl
                LEFT JOIN vip_challenges vc ON vl.id = vc.vip_level_id
                ${dateCondition ? 'AND ' + dateCondition.replace('WHERE', '') : ''}
                GROUP BY vl.id, vl.name, vl.icon, vl.color
                ORDER BY vl.deposit_amount ASC
            `, dateParams);
            
            // 按状态统计
            const [statusStats] = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count,
                    SUM(deposit_amount) as total_deposits,
                    SUM(reward_amount) as total_rewards
                FROM vip_challenges
                ${dateCondition}
                GROUP BY status
            `, dateParams);
            
            // 每日统计
            const [dailyStats] = await pool.query(`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as challenge_count,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                    SUM(deposit_amount) as total_deposits,
                    SUM(reward_amount) as total_rewards
                FROM vip_challenges
                ${dateCondition}
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            `, dateParams);
            
            res.json({
                success: true,
                data: {
                    total: totalStats[0],
                    byLevel: levelStats,
                    byStatus: statusStats,
                    daily: dailyStats
                },
                message: '获取挑战统计信息成功'
            });
        } catch (error) {
            console.error('获取挑战统计信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战统计信息失败',
                error: error.message
            });
        }
    }

    // 获取用户挑战记录
    async getUserChallenges(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20, status } = req.query;
            
            const offset = (page - 1) * limit;
            let whereConditions = ['vc.user_id = ?'];
            let queryParams = [userId];
            
            if (status) {
                whereConditions.push('vc.status = ?');
                queryParams.push(status);
            }
            
            const whereClause = 'WHERE ' + whereConditions.join(' AND ');
            
            // 查询总数
            const [countRows] = await pool.query(`
                SELECT COUNT(*) as total FROM vip_challenges vc
                ${whereClause}
            `, queryParams);
            
            const total = countRows[0].total;
            
            // 查询数据
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.icon as level_icon,
                    vl.color as level_color
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                ${whereClause}
                ORDER BY vc.created_at DESC
                LIMIT ? OFFSET ?
            `, [...queryParams, parseInt(limit), offset]);
            
            const challenges = rows.map(row => {
                const challenge = VIPChallenge.fromDatabase(row);
                challenge.vipLevel = {
                    id: row.vip_level_id,
                    name: row.level_name,
                    icon: row.level_icon,
                    color: row.level_color
                };
                return challenge;
            });
            
            const displayChallenges = challenges.map(function(challenge) {
                return challenge.getDisplayInfo();
            });
            
            res.json({
                success: true,
                data: {
                    challenges: displayChallenges,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                message: '获取用户挑战记录成功'
            });
        } catch (error) {
            console.error('获取用户挑战记录失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户挑战记录失败',
                error: error.message
            });
        }
    }

    // 管理员手动完成挑战
    async adminCompleteChallenge(req, res) {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;
            
            // 检查挑战是否存在
            const [rows] = await pool.query(`
                SELECT * FROM vip_challenges WHERE id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }
            
            const challenge = VIPChallenge.fromDatabase(rows[0]);
            
            if (challenge.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: '只能完成进行中的挑战'
                });
            }
            
            // 更新挑战状态
            await pool.query(`
                UPDATE vip_challenges SET
                    status = 'completed',
                    completed_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `, [id]);
            
            res.json({
                success: true,
                message: '挑战已完成'
            });
        } catch (error) {
            console.error('管理员完成挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '管理员完成挑战失败',
                error: error.message
            });
        }
    }

    // 管理员手动取消挑战
    async adminCancelChallenge(req, res) {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;
            
            // 检查挑战是否存在
            const [rows] = await pool.query(`
                SELECT * FROM vip_challenges WHERE id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }
            
            const challenge = VIPChallenge.fromDatabase(rows[0]);
            
            if (challenge.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: '只能取消进行中的挑战'
                });
            }
            
            // 更新挑战状态
            await pool.query(`
                UPDATE vip_challenges SET
                    status = 'cancelled',
                    updated_at = NOW()
                WHERE id = ?
            `, [id]);
            
            res.json({
                success: true,
                message: '挑战已取消'
            });
        } catch (error) {
            console.error('管理员取消挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '管理员取消挑战失败',
                error: error.message
            });
        }
    }

    // ==========================================
    // 用户端VIP挑战方法
    // ==========================================

    // 获取用户当前挑战
    async getCurrentChallenge(req, res) {
        try {
            const userId = req.user.id;
            
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.icon as level_icon,
                    vl.color as level_color,
                    vl.step_target,
                    vl.reward_amount
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.user_id = ? AND vc.status = 'active'
                ORDER BY vc.created_at DESC
                LIMIT 1
            `, [userId]);
            
            if (rows.length === 0) {
                return res.json({
                    success: true,
                    data: null,
                    message: '没有进行中的挑战'
                });
            }
            
            const challenge = VIPChallenge.fromDatabase(rows[0]);
            challenge.vipLevel = {
                id: rows[0].vip_level_id,
                name: rows[0].level_name,
                icon: rows[0].level_icon,
                color: rows[0].level_color,
                stepTarget: rows[0].step_target,
                rewardAmount: rows[0].reward_amount
            };
            
            res.json({
                success: true,
                data: challenge.getDisplayInfo(),
                message: '获取当前挑战成功'
            });
        } catch (error) {
            console.error('获取当前挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '获取当前挑战失败',
                error: error.message
            });
        }
    }

    // 开始VIP挑战
    async startChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const userId = req.user.id;
            const { vipLevelId } = req.body;
            
            if (!vipLevelId) {
                return res.status(400).json({
                    success: false,
                    message: 'VIP等级ID不能为空'
                });
            }
            
            // 检查VIP等级是否存在
            const [levelRows] = await connection.query(`
                SELECT * FROM vip_levels WHERE id = ?
            `, [vipLevelId]);
            
            if (levelRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }

            const vipLevel = levelRows[0];
            
            // 检查用户是否已有进行中的挑战
            const [activeRows] = await connection.query(`
                SELECT * FROM vip_challenges 
                WHERE user_id = ? AND status = 'active'
            `, [userId]);
            
            if (activeRows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '您已有进行中的挑战，请先完成或取消'
                });
            }

            // 检查用户余额
            const [walletRows] = await connection.query(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);

            if (walletRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '用户钱包不存在'
                });
            }

            const currentBalance = parseFloat(walletRows[0].balance);
            const requiredAmount = parseFloat(vipLevel.deposit_amount);

            if (currentBalance < requiredAmount) {
                return res.status(400).json({
                    success: false,
                    message: `余额不足，当前余额 ${currentBalance.toFixed(2)} USDT，需要 ${requiredAmount.toFixed(2)} USDT`
                });
            }

            // 检查余额是否会变成负数
            if (currentBalance - requiredAmount < 0) {
                return res.status(400).json({
                    success: false,
                    message: `余额不足，扣除押金后余额不能为负数`
                });
            }

            // 扣除押金
            await connection.query(`
                UPDATE user_wallets 
                SET balance = balance - ?,
                    frozen_balance = frozen_balance + ?
                WHERE user_id = ?
            `, [vipLevel.deposit_amount, vipLevel.deposit_amount, userId]);

            // 记录押金交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_deposit', ?, ?, ?, ?)
            `, [userId, vipLevel.deposit_amount, 'VIP挑战押金', challengeId, 'vip_challenge']);
            
            // 创建新挑战
            const [result] = await connection.query(`
                INSERT INTO vip_challenges (
                    user_id, vip_level_id, status, deposit_amount,
                    created_at, updated_at
                ) VALUES (?, ?, 'active', ?, NOW(), NOW())
            `, [userId, vipLevelId, vipLevel.deposit_amount]);
            
            const challengeId = result.insertId;
            
            // 获取创建的挑战详情
            const [challengeRows] = await connection.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.icon as level_icon,
                    vl.color as level_color,
                    vl.step_target,
                    vl.reward_amount
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ?
            `, [challengeId]);

            await connection.commit();
            
            const challenge = VIPChallenge.fromDatabase(challengeRows[0]);
            challenge.vipLevel = {
                id: challengeRows[0].vip_level_id,
                name: challengeRows[0].level_name,
                icon: challengeRows[0].level_icon,
                color: challengeRows[0].level_color,
                stepTarget: challengeRows[0].step_target,
                rewardAmount: challengeRows[0].reward_amount
            };
            
            res.json({
                success: true,
                data: challenge.getDisplayInfo(),
                message: '挑战开始成功'
            });
        } catch (error) {
            await connection.rollback();
            console.error('开始挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '开始挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }

    // 取消VIP挑战
    async cancelChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const userId = req.user.id;
            const { challengeId } = req.params;
            
            console.log('开始取消挑战:', { userId, challengeId });
            
            // 检查挑战是否存在且属于当前用户
            const [rows] = await connection.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.cancel_deduct_ratio,
                    vl.cancel_reward_ratio
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ? AND vc.user_id = ?
            `, [challengeId, userId]);
            
            console.log('查询挑战记录结果:', rows);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }
            
            const challenge = VIPChallenge.fromDatabase(rows[0]);
            console.log('挑战记录:', challenge);
            
            if (challenge.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: '只能取消进行中的挑战'
                });
            }

            // 获取押金金额
            const depositAmount = rows[0].deposit_amount;
            if (!depositAmount) {
                console.error('押金金额为空:', rows[0]);
                throw new Error('押金金额不能为空');
            }
            
            console.log('准备退还押金:', depositAmount);
            
            // 检查用户钱包
            const [walletRows] = await connection.query(`
                SELECT * FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0) {
                console.error('用户钱包不存在:', userId);
                throw new Error('用户钱包不存在');
            }
            
            const wallet = walletRows[0];
            console.log('用户钱包状态:', wallet);
            
            if (wallet.frozen_balance < depositAmount) {
                console.error('冻结余额不足:', { frozen: wallet.frozen_balance, needed: depositAmount });
                throw new Error('冻结余额不足');
            }
            
            // 计算扣除金额和奖励金额
            const cancelDeductRatio = parseFloat(rows[0].cancel_deduct_ratio) || 0;
            // 取消挑战不发放奖励
            const cancelRewardRatio = 0;
            
            console.log('取消挑战配置:', {
                depositAmount,
                cancelDeductRatio,
                cancelRewardRatio
            });
            
            const deductAmount = parseFloat((depositAmount * cancelDeductRatio).toFixed(2));
            // 取消挑战不发放奖励
            const rewardAmount = 0; 
            // 退还金额 = 押金 - 扣除金额（不加奖励）
            const returnAmount = parseFloat((depositAmount - deductAmount).toFixed(2));

            console.log('取消挑战计算:', {
                depositAmount,
                cancelDeductRatio,
                cancelRewardRatio,
                deductAmount,
                rewardAmount,
                returnAmount
            });

            // 检查计算结果
            if (isNaN(returnAmount) || returnAmount < 0) {
                throw new Error('退还金额计算错误');
            }

            // 退还押金（扣除惩罚后的金额）
            const [updateResult] = await connection.query(`
                UPDATE user_wallets 
                SET balance = balance + ?,
                    frozen_balance = frozen_balance - ?
                WHERE user_id = ?
            `, [returnAmount, depositAmount, userId]);

            if (updateResult.affectedRows === 0) {
                throw new Error('更新钱包余额失败');
            }

            console.log('钱包更新结果:', updateResult);

            console.log('押金已退还到余额');

            // 记录扣除交易
            if (deductAmount > 0) {
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description, reference_id, reference_type
                    ) VALUES (?, 'challenge_penalty', ?, ?, ?, ?)
                `, [userId, deductAmount, '取消挑战扣除', challengeId, 'vip_challenge']);
            }

            // 取消挑战不发放奖励，所以这里不再需要记录奖励交易

            // 记录退还押金交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_refund', ?, ?, ?, ?)
            `, [userId, returnAmount, '取消挑战退还押金', challengeId, 'vip_challenge']);
            
            console.log('已记录退还押金交易');
            
            // 更新挑战状态
            await connection.query(`
                UPDATE vip_challenges SET
                    status = 'cancelled',
                    updated_at = NOW()
                WHERE id = ?
            `, [challengeId]);

            console.log('已更新挑战状态为已取消');

            await connection.commit();
            console.log('事务已提交');
            
            res.json({
                success: true,
                message: `挑战已取消，押金 ${depositAmount} USDT 已退还`
            });
        } catch (error) {
            await connection.rollback();
            console.error('取消挑战失败:', error);
            // 返回更详细的错误信息
            res.status(500).json({
                success: false,
                message: error.message || '取消挑战失败',
                details: error.stack
            });
        } finally {
            connection.release();
        }
    }

    // 完成VIP挑战
    async completeChallenge(req, res) {
        try {
            const userId = req.user.id;
            const { challengeId } = req.params;
            const { steps } = req.body;
            
            if (!steps || steps < 0) {
                return res.status(400).json({
                    success: false,
                    message: '步数不能为空且必须大于等于0'
                });
            }
            
            // 检查挑战是否存在且属于当前用户
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.step_target,
                    vl.reward_amount
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ? AND vc.user_id = ?
            `, [challengeId, userId]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }
            
            const challenge = VIPChallenge.fromDatabase(rows[0]);
            
            if (challenge.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: '只能完成进行中的挑战'
                });
            }
            
            const stepTarget = rows[0].step_target;
            const rewardAmount = rows[0].reward_amount;
            
            // 判断是否达到目标
            const isCompleted = steps >= stepTarget;
            const status = isCompleted ? 'completed' : 'failed';
            
            // 更新挑战状态
            await pool.query(`
                UPDATE vip_challenges SET
                    status = ?,
                    steps = ?,
                    completed_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `, [status, steps, challengeId]);
            
            // 如果挑战成功，给用户发放奖励
            if (isCompleted) {
                const connection = await pool.getConnection();
                try {
                    await connection.beginTransaction();
                    
                    // 更新用户钱包余额
                    await connection.execute(
                        'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                        [rewardAmount, userId]
                    );

                    // 记录钱包交易
                    await connection.execute(`
                        INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, reference_id, reference_type, created_at)
                        VALUES (?, ?, 'challenge_reward', ?, ?, ?, NOW())
                    `, [userId, rewardAmount, `VIP挑战奖励: ${challenge.vipLevel?.name || 'VIP挑战'}`, challengeId, 'vip_challenge']);

                    await connection.commit();
                    
                    console.log(`用户 ${userId} 完成挑战，获得奖励 ${rewardAmount}`);
                    
                    // 处理团队返佣
                    try {
                        const teamService = require('../services/teamService');
                        await teamService.processVipChallengeCommission(userId, challengeId, rewardAmount);
                    } catch (error) {
                        console.error('处理VIP挑战返佣失败:', error);
                        // 返佣失败不影响挑战完成
                    }
                    
                    // 触发成就检查
                    try {
                        await achievementService.updateUserAchievementProgress(userId);
                        const newAchievements = await achievementService.checkAndTriggerAchievements(userId);
                        
                        if (newAchievements.length > 0) {
                            console.log(`🎉 用户 ${userId} VIP挑战完成后完成 ${newAchievements.length} 个新成就`);
                        }
                    } catch (achievementError) {
                        console.error('VIP挑战成就检查失败:', achievementError);
                        // 不影响挑战完成流程
                    }
                } catch (error) {
                    await connection.rollback();
                    throw error;
                } finally {
                    connection.release();
                }
            }
            
            res.json({
                success: true,
                data: {
                    isCompleted,
                    steps,
                    stepTarget,
                    rewardAmount: isCompleted ? rewardAmount : 0
                },
                message: isCompleted ? '挑战完成！恭喜获得奖励！' : '挑战失败，步数未达到目标'
            });
        } catch (error) {
            console.error('完成挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '完成挑战失败',
                error: error.message
            });
        }
    }

    // 获取挑战统计信息
    async getChallengeStats(req, res) {
        try {
            const userId = req.user.id;
            
            // 获取用户挑战统计
            const [statsRows] = await pool.query(`
                SELECT 
                    COUNT(*) as totalChallenges,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedChallenges,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeChallenges,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledChallenges,
                    SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as totalRewards,
                    AVG(CASE WHEN status = 'completed' THEN reward_amount ELSE NULL END) as avgReward
                FROM vip_challenges 
                WHERE user_id = ?
            `, [userId]);
            
            // 获取用户当前活跃挑战
            const [activeRows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.deposit_amount,
                    vl.step_target,
                    vl.reward_amount
                FROM vip_challenges vc
                JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.user_id = ? AND vc.status = 'active'
                ORDER BY vc.created_at DESC
                LIMIT 1
            `, [userId]);
            
            const stats = statsRows[0] || {
                totalChallenges: 0,
                completedChallenges: 0,
                activeChallenges: 0,
                cancelledChallenges: 0,
                totalRewards: 0,
                avgReward: 0
            };
            
            const currentChallenge = activeRows[0] || null;
            
            res.json({
                success: true,
                data: {
                    stats: {
                        totalChallenges: parseInt(stats.totalChallenges),
                        completedChallenges: parseInt(stats.completedChallenges),
                        activeChallenges: parseInt(stats.activeChallenges),
                        cancelledChallenges: parseInt(stats.cancelledChallenges),
                        totalRewards: parseFloat(stats.totalRewards) || 0,
                        avgReward: parseFloat(stats.avgReward) || 0,
                        successRate: stats.totalChallenges > 0 ? 
                            ((stats.completedChallenges / stats.totalChallenges) * 100).toFixed(1) : 0
                    },
                    currentChallenge: currentChallenge ? {
                        id: currentChallenge.id,
                        levelName: currentChallenge.level_name,
                        depositAmount: parseFloat(currentChallenge.deposit_amount),
                        stepTarget: parseInt(currentChallenge.step_target),
                        rewardAmount: parseFloat(currentChallenge.reward_amount),
                        currentSteps: parseInt(currentChallenge.current_steps),
                        startDate: currentChallenge.start_date,
                        endDate: currentChallenge.end_date,
                        status: currentChallenge.status
                    } : null
                },
                message: '获取挑战统计成功'
            });
        } catch (error) {
            console.error('获取挑战统计失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战统计失败',
                error: error.message
            });
        }
    }
}

module.exports = new VIPChallengeController();
