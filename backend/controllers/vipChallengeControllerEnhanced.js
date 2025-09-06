/**
 * 改进后的VIP挑战控制器
 * 提供完整的API接口，包括连续挑战、处罚管理、统计等
 */

const vipChallengeService = require('../services/vipChallengeServiceEnhanced');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

class VIPChallengeControllerEnhanced {
    constructor() {
        // 启动超时检查服务
        vipChallengeService.startTimeoutCheckService();
    }

    /**
     * 获取所有VIP等级
     */
    async getAllVIPLevels(req, res) {
        try {
            const { pool } = require('../config/database');
            const [rows] = await pool.query(`
                SELECT * FROM vip_levels WHERE is_active = TRUE ORDER BY deposit_amount ASC
            `);

            res.json({
                success: true,
                data: rows,
                message: '获取VIP等级成功'
            });

        } catch (error) {
            logger.error('获取VIP等级失败:', error);
            res.status(500).json({
                success: false,
                message: '获取VIP等级失败',
                error: error.message
            });
        }
    }

    /**
     * 获取VIP等级详情
     */
    async getVIPLevelById(req, res) {
        try {
            const { id } = req.params;
            const { pool } = require('../config/database');
            
            const [rows] = await pool.query(`
                SELECT * FROM vip_levels WHERE id = ? AND is_active = TRUE
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }

            res.json({
                success: true,
                data: rows[0],
                message: '获取VIP等级详情成功'
            });

        } catch (error) {
            logger.error('获取VIP等级详情失败:', error);
            res.status(500).json({
                success: false,
                message: '获取VIP等级详情失败',
                error: error.message
            });
        }
    }

    /**
     * 开始VIP挑战
     */
    async startChallenge(req, res) {
        try {
            const { vipLevelId, challengeType = 'daily' } = req.body;
            const userId = req.user.id;

            if (!vipLevelId) {
                return res.status(400).json({
                    success: false,
                    message: '请选择VIP等级'
                });
            }

            const result = await vipChallengeService.startChallenge(userId, vipLevelId, challengeType);

            res.json(result);

        } catch (error) {
            logger.error('开始VIP挑战失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '开始挑战失败'
            });
        }
    }

    /**
     * 提交每日步数
     */
    async submitDailySteps(req, res) {
        try {
            const { challengeId, steps, dataSource = 'manual', sourceData } = req.body;
            const userId = req.user.id;

            if (!challengeId || !steps) {
                return res.status(400).json({
                    success: false,
                    message: '请提供挑战ID和步数'
                });
            }

            if (steps < 0) {
                return res.status(400).json({
                    success: false,
                    message: '步数不能为负数'
                });
            }

            const result = await vipChallengeService.submitDailySteps(
                userId, challengeId, steps, dataSource, sourceData
            );

            res.json(result);

        } catch (error) {
            logger.error('提交每日步数失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '提交步数失败'
            });
        }
    }

    /**
     * 领取每日奖励
     */
    async claimDailyReward(req, res) {
        try {
            const { challengeId, recordDate } = req.body;
            const userId = req.user.id;

            if (!challengeId || !recordDate) {
                return res.status(400).json({
                    success: false,
                    message: '请提供挑战ID和记录日期'
                });
            }

            const result = await vipChallengeService.claimDailyReward(userId, challengeId, recordDate);

            res.json(result);

        } catch (error) {
            logger.error('领取每日奖励失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '领取奖励失败'
            });
        }
    }

    /**
     * 获取用户当前挑战
     */
    async getUserCurrentChallenge(req, res) {
        try {
            const userId = req.user.id;
            const { pool } = require('../config/database');

            const [rows] = await pool.query(`
                SELECT * FROM vip_challenge_details_enhanced 
                WHERE user_id = ? AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            `, [userId]);

            if (rows.length === 0) {
                return res.json({
                    success: true,
                    data: null,
                    message: '暂无进行中的挑战'
                });
            }

            const challenge = rows[0];
            const status = await vipChallengeService.getChallengeStatus(challenge.id);

            res.json({
                success: true,
                data: {
                    ...challenge,
                    status: status
                },
                message: '获取当前挑战成功'
            });

        } catch (error) {
            logger.error('获取用户当前挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '获取当前挑战失败',
                error: error.message
            });
        }
    }

    /**
     * 获取用户挑战历史
     */
    async getUserChallengeHistory(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, status } = req.query;
            const { pool } = require('../config/database');

            let query = 'SELECT * FROM vip_challenge_details_enhanced WHERE user_id = ?';
            let params = [userId];

            if (status && status !== 'all') {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params.push(parseInt(limit), offset);

            const [rows] = await pool.query(query, params);

            // 获取总数
            let countQuery = 'SELECT COUNT(*) as total FROM vip_challenges WHERE user_id = ?';
            let countParams = [userId];

            if (status && status !== 'all') {
                countQuery += ' AND status = ?';
                countParams.push(status);
            }

            const [countRows] = await pool.query(countQuery, countParams);
            const total = countRows[0].total;

            res.json({
                success: true,
                data: {
                    challenges: rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: '获取挑战历史成功'
            });

        } catch (error) {
            logger.error('获取用户挑战历史失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战历史失败',
                error: error.message
            });
        }
    }

    /**
     * 获取挑战每日记录
     */
    async getChallengeDailyRecords(req, res) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            const { pool } = require('../config/database');

            // 验证挑战属于当前用户
            const [challengeRows] = await pool.query(`
                SELECT id FROM vip_challenges WHERE id = ? AND user_id = ?
            `, [challengeId, userId]);

            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }

            const [rows] = await pool.query(`
                SELECT * FROM vip_challenge_daily_records 
                WHERE challenge_id = ? 
                ORDER BY record_date DESC
            `, [challengeId]);

            res.json({
                success: true,
                data: rows,
                message: '获取每日记录成功'
            });

        } catch (error) {
            logger.error('获取挑战每日记录失败:', error);
            res.status(500).json({
                success: false,
                message: '获取每日记录失败',
                error: error.message
            });
        }
    }

    /**
     * 获取用户挑战统计
     */
    async getUserChallengeStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await vipChallengeService.getUserChallengeStats(userId);

            res.json({
                success: true,
                data: stats,
                message: '获取挑战统计成功'
            });

        } catch (error) {
            logger.error('获取用户挑战统计失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战统计失败',
                error: error.message
            });
        }
    }

    /**
     * 取消挑战
     */
    async cancelChallenge(req, res) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            const { pool } = require('../config/database');

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // 检查挑战是否存在且属于当前用户
                const [challengeRows] = await connection.query(`
                    SELECT vc.*, vl.cancel_deduct_ratio, vl.name as level_name
                    FROM vip_challenges vc
                    LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                    WHERE vc.id = ? AND vc.user_id = ? AND vc.status = 'active'
                `, [challengeId, userId]);

                if (challengeRows.length === 0) {
                    throw new Error('挑战记录不存在或无法取消');
                }

                const challenge = challengeRows[0];

                // 计算扣除金额
                const deductAmount = parseFloat(challenge.deposit_amount) * parseFloat(challenge.cancel_deduct_ratio);
                const refundAmount = parseFloat(challenge.deposit_amount) - deductAmount;

                // 更新挑战状态
                await connection.query(`
                    UPDATE vip_challenges SET
                        status = 'cancelled',
                        updated_at = NOW()
                    WHERE id = ?
                `, [challengeId]);

                // 处理押金
                if (deductAmount > 0) {
                    await connection.query(`
                        UPDATE user_wallets 
                        SET frozen_balance = frozen_balance - ?
                        WHERE user_id = ?
                    `, [deductAmount, userId]);

                    // 记录扣除交易
                    await connection.query(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, description, created_at
                        ) VALUES (?, 'vip_challenge_cancel', ?, ?)
                    `, [userId, -deductAmount, `VIP挑战取消扣除: ${challenge.level_name}`]);
                }

                // 退还剩余押金
                if (refundAmount > 0) {
                    await connection.query(`
                        UPDATE user_wallets 
                        SET frozen_balance = frozen_balance - ?,
                            balance = balance + ?
                        WHERE user_id = ?
                    `, [refundAmount, refundAmount, userId]);

                    // 记录退还交易
                    await connection.query(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, description, created_at
                        ) VALUES (?, 'vip_challenge_refund', ?, ?)
                    `, [userId, refundAmount, `VIP挑战取消退还: ${challenge.level_name}`]);
                }

                // 记录处罚
                await vipChallengeService.recordPenalty(
                    challengeId, userId, challenge.vip_level_id,
                    'cancel', '用户主动取消挑战', deductAmount, challenge.cancel_deduct_ratio
                );

                await connection.commit();

                res.json({
                    success: true,
                    data: {
                        deductAmount,
                        refundAmount,
                        totalRefund: refundAmount
                    },
                    message: '挑战取消成功'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            logger.error('取消挑战失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '取消挑战失败'
            });
        }
    }

    /**
     * 获取挑战进度
     */
    async getChallengeProgress(req, res) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;

            // 验证挑战属于当前用户
            const { pool } = require('../config/database');
            const [challengeRows] = await pool.query(`
                SELECT id FROM vip_challenges WHERE id = ? AND user_id = ?
            `, [challengeId, userId]);

            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战记录不存在'
                });
            }

            const status = await vipChallengeService.getChallengeStatus(challengeId);

            if (!status) {
                return res.status(404).json({
                    success: false,
                    message: '挑战状态获取失败'
                });
            }

            res.json({
                success: true,
                data: status,
                message: '获取挑战进度成功'
            });

        } catch (error) {
            logger.error('获取挑战进度失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战进度失败',
                error: error.message
            });
        }
    }

    /**
     * 管理员：获取所有挑战
     */
    async getAllChallenges(req, res) {
        try {
            const { page = 1, limit = 20, status, vipLevelId, userId } = req.query;
            const { pool } = require('../config/database');

            let query = 'SELECT * FROM vip_challenge_details_enhanced WHERE 1=1';
            let params = [];

            if (status && status !== 'all') {
                query += ' AND status = ?';
                params.push(status);
            }

            if (vipLevelId) {
                query += ' AND vip_level_id = ?';
                params.push(vipLevelId);
            }

            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params.push(parseInt(limit), offset);

            const [rows] = await pool.query(query, params);

            // 获取总数
            let countQuery = 'SELECT COUNT(*) as total FROM vip_challenges WHERE 1=1';
            let countParams = [];

            if (status && status !== 'all') {
                countQuery += ' AND status = ?';
                countParams.push(status);
            }

            if (vipLevelId) {
                countQuery += ' AND vip_level_id = ?';
                countParams.push(vipLevelId);
            }

            if (userId) {
                countQuery += ' AND user_id = ?';
                countParams.push(userId);
            }

            const [countRows] = await pool.query(countQuery, countParams);
            const total = countRows[0].total;

            res.json({
                success: true,
                data: {
                    challenges: rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: '获取所有挑战成功'
            });

        } catch (error) {
            logger.error('获取所有挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '获取所有挑战失败',
                error: error.message
            });
        }
    }

    /**
     * 管理员：获取挑战统计
     */
    async getChallengeStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const { pool } = require('../config/database');

            // 获取总体统计
            const [overallStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_challenges,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_challenges,
                    COUNT(CASE WHEN status = 'timeout' THEN 1 END) as timeout_challenges,
                    SUM(deposit_amount) as total_deposits,
                    SUM(frozen_deposit_amount) as total_frozen_deposits,
                    SUM(total_earned_reward) as total_earned_rewards,
                    SUM(total_claimed_reward) as total_claimed_rewards
                FROM vip_challenges
            `);

            // 获取每日统计
            const dailyStats = await vipChallengeService.getChallengeDailyStats(startDate, endDate);

            // 获取VIP等级统计
            const [levelStats] = await pool.query(`
                SELECT 
                    vl.name as level_name,
                    COUNT(vc.id) as total_challenges,
                    COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_challenges,
                    COUNT(CASE WHEN vc.status = 'failed' THEN 1 END) as failed_challenges,
                    ROUND(AVG(CASE WHEN vc.status = 'completed' THEN (vc.total_earned_reward - vc.deposit_amount) / vc.deposit_amount * 100 ELSE NULL END), 2) as avg_roi
                FROM vip_levels vl
                LEFT JOIN vip_challenges vc ON vl.id = vc.vip_level_id
                WHERE vl.is_active = TRUE
                GROUP BY vl.id, vl.name
                ORDER BY vl.deposit_amount ASC
            `);

            res.json({
                success: true,
                data: {
                    overall: overallStats[0],
                    daily: dailyStats,
                    byLevel: levelStats
                },
                message: '获取挑战统计成功'
            });

        } catch (error) {
            logger.error('获取挑战统计失败:', error);
            res.status(500).json({
                success: false,
                message: '获取挑战统计失败',
                error: error.message
            });
        }
    }

    /**
     * 管理员：强制完成挑战
     */
    async adminCompleteChallenge(req, res) {
        try {
            const { challengeId } = req.params;
            const { reason } = req.body;
            const adminId = req.user.id;
            const { pool } = require('../config/database');

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // 检查挑战是否存在
                const [challengeRows] = await connection.query(`
                    SELECT * FROM vip_challenges WHERE id = ? AND status = 'active'
                `, [challengeId]);

                if (challengeRows.length === 0) {
                    throw new Error('挑战记录不存在或无法强制完成');
                }

                const challenge = challengeRows[0];

                // 强制完成挑战
                await vipChallengeService.completeChallenge(connection, challengeId, challenge.user_id);

                // 记录管理员操作
                await connection.query(`
                    INSERT INTO vip_challenge_penalties (
                        challenge_id, user_id, vip_level_id,
                        penalty_type, penalty_reason, penalty_amount, penalty_ratio,
                        status, created_by, notes, created_at, updated_at
                    ) VALUES (?, ?, ?, 'other', ?, 0, 0, 'executed', ?, ?, NOW(), NOW())
                `, [challengeId, challenge.user_id, challenge.vip_level_id, 
                    `管理员强制完成: ${reason}`, adminId, reason]);

                await connection.commit();

                res.json({
                    success: true,
                    message: '挑战强制完成成功'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            logger.error('强制完成挑战失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '强制完成挑战失败'
            });
        }
    }

    /**
     * 管理员：强制失败挑战
     */
    async adminFailChallenge(req, res) {
        try {
            const { challengeId } = req.params;
            const { reason } = req.body;
            const adminId = req.user.id;
            const { pool } = require('../config/database');

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // 检查挑战是否存在
                const [challengeRows] = await connection.query(`
                    SELECT * FROM vip_challenges WHERE id = ? AND status = 'active'
                `, [challengeId]);

                if (challengeRows.length === 0) {
                    throw new Error('挑战记录不存在或无法强制失败');
                }

                const challenge = challengeRows[0];

                // 强制失败挑战
                await vipChallengeService.failChallenge(connection, challengeId, challenge.user_id);

                // 记录管理员操作
                await connection.query(`
                    INSERT INTO vip_challenge_penalties (
                        challenge_id, user_id, vip_level_id,
                        penalty_type, penalty_reason, penalty_amount, penalty_ratio,
                        status, created_by, notes, created_at, updated_at
                    ) VALUES (?, ?, ?, 'other', ?, 0, 0, 'executed', ?, ?, NOW(), NOW())
                `, [challengeId, challenge.user_id, challenge.vip_level_id, 
                    `管理员强制失败: ${reason}`, adminId, reason]);

                await connection.commit();

                res.json({
                    success: true,
                    message: '挑战强制失败成功'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            logger.error('强制失败挑战失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '强制失败挑战失败'
            });
        }
    }

    /**
     * 获取处罚记录
     */
    async getPenaltyRecords(req, res) {
        try {
            const { challengeId, userId, penaltyType, status, page = 1, limit = 20 } = req.query;
            const { pool } = require('../config/database');

            let query = 'SELECT * FROM vip_challenge_penalties WHERE 1=1';
            let params = [];

            if (challengeId) {
                query += ' AND challenge_id = ?';
                params.push(challengeId);
            }

            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }

            if (penaltyType && penaltyType !== 'all') {
                query += ' AND penalty_type = ?';
                params.push(penaltyType);
            }

            if (status && status !== 'all') {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params.push(parseInt(limit), offset);

            const [rows] = await pool.query(query, params);

            // 获取总数
            let countQuery = 'SELECT COUNT(*) as total FROM vip_challenge_penalties WHERE 1=1';
            let countParams = [];

            if (challengeId) {
                countQuery += ' AND challenge_id = ?';
                countParams.push(challengeId);
            }

            if (userId) {
                countQuery += ' AND user_id = ?';
                countParams.push(userId);
            }

            if (penaltyType && penaltyType !== 'all') {
                countQuery += ' AND penalty_type = ?';
                countParams.push(penaltyType);
            }

            if (status && status !== 'all') {
                countQuery += ' AND status = ?';
                countParams.push(status);
            }

            const [countRows] = await pool.query(countQuery, countParams);
            const total = countRows[0].total;

            res.json({
                success: true,
                data: {
                    penalties: rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                },
                message: '获取处罚记录成功'
            });

        } catch (error) {
            logger.error('获取处罚记录失败:', error);
            res.status(500).json({
                success: false,
                message: '获取处罚记录失败',
                error: error.message
            });
        }
    }
}

module.exports = new VIPChallengeControllerEnhanced();
