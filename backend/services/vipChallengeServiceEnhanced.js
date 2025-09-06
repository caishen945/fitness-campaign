/**
 * 改进后的VIP挑战服务类
 * 实现连续挑战逻辑、管理员可配置处罚机制、超时检查等
 */

const { pool } = require('../config/database');
const logger = require('../utils/logger');

class VIPChallengeServiceEnhanced {
    constructor() {
        this.isRunning = false;
        this.timeoutCheckInterval = null;
    }

    /**
     * 开始VIP挑战
     */
    async startChallenge(userId, vipLevelId, challengeType = 'daily') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 检查VIP等级是否存在
            const [levelRows] = await connection.query(`
                SELECT * FROM vip_levels WHERE id = ? AND is_active = TRUE
            `, [vipLevelId]);

            if (levelRows.length === 0) {
                throw new Error('VIP等级不存在或已禁用');
            }

            const vipLevel = levelRows[0];

            // 检查用户是否已有进行中的挑战
            const [activeRows] = await connection.query(`
                SELECT * FROM vip_challenges 
                WHERE user_id = ? AND status = 'active'
            `, [userId]);

            if (activeRows.length > 0) {
                throw new Error('您已有进行中的挑战，请先完成或取消');
            }

            // 检查用户余额
            const [walletRows] = await connection.query(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);

            if (walletRows.length === 0) {
                throw new Error('用户钱包不存在');
            }

            const currentBalance = parseFloat(walletRows[0].balance);
            const requiredAmount = parseFloat(vipLevel.deposit_amount);

            if (currentBalance < requiredAmount) {
                throw new Error(`余额不足，当前余额 ${currentBalance.toFixed(2)} USDT，需要 ${requiredAmount.toFixed(2)} USDT`);
            }

            // 计算挑战结束时间
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + vipLevel.duration * 24 * 60 * 60 * 1000);

            // 扣除押金并冻结
            await connection.query(`
                UPDATE user_wallets 
                SET balance = balance - ?,
                    frozen_balance = frozen_balance + ?
                WHERE user_id = ?
            `, [vipLevel.deposit_amount, vipLevel.deposit_amount, userId]);

            // 记录押金交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, created_at
                ) VALUES (?, 'deposit', ?, ?)
            `, [userId, vipLevel.deposit_amount, 'VIP挑战押金']);

            // 创建新挑战
            const [result] = await connection.query(`
                INSERT INTO vip_challenges (
                    user_id, vip_level_id, challenge_type, status,
                    deposit_amount, frozen_deposit_amount,
                    required_consecutive_days, max_failed_days,
                    start_date, end_date, last_activity_date,
                    created_at, updated_at
                ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                userId, vipLevelId, challengeType,
                vipLevel.deposit_amount, vipLevel.deposit_amount,
                vipLevel.required_consecutive_days, vipLevel.max_failed_days,
                startDate, endDate, startDate.toISOString().split('T')[0]
            ]);

            const challengeId = result.insertId;

            // 创建第一天的记录
            await connection.query(`
                INSERT INTO vip_challenge_daily_records (
                    challenge_id, user_id, vip_level_id, record_date,
                    step_target, daily_reward, data_source,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'manual', NOW(), NOW())
            `, [
                challengeId, userId, vipLevelId, startDate.toISOString().split('T')[0],
                vipLevel.step_target, vipLevel.daily_reward
            ]);

            await connection.commit();

            // 获取创建的挑战详情
            const challenge = await this.getChallengeById(challengeId);
            
            return {
                success: true,
                data: challenge,
                message: '挑战开始成功'
            };

        } catch (error) {
            await connection.rollback();
            logger.error('开始VIP挑战失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 提交每日步数
     */
    async submitDailySteps(userId, challengeId, steps, dataSource = 'manual', sourceData = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 检查挑战是否存在且属于当前用户
            const [challengeRows] = await connection.query(`
                SELECT vc.*, vl.step_target, vl.daily_reward, vl.reward_delay_hours
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ? AND vc.user_id = ? AND vc.status = 'active'
            `, [challengeId, userId]);

            if (challengeRows.length === 0) {
                throw new Error('挑战记录不存在或已结束');
            }

            const challenge = challengeRows[0];
            const today = new Date().toISOString().split('T')[0];

            // 检查是否已提交过今天的步数
            const [existingRows] = await connection.query(`
                SELECT * FROM vip_challenge_daily_records 
                WHERE challenge_id = ? AND record_date = ?
            `, [challengeId, today]);

            if (existingRows.length > 0) {
                throw new Error('今日步数已提交，无法重复提交');
            }

            // 判断是否完成今日目标
            const isCompleted = steps >= challenge.step_target;
            const completionTime = isCompleted ? new Date() : null;

            // 计算奖励可领取时间
            const rewardAvailableAt = new Date();
            rewardAvailableAt.setHours(rewardAvailableAt.getHours() + challenge.reward_delay_hours);

            // 创建今日记录
            await connection.query(`
                INSERT INTO vip_challenge_daily_records (
                    challenge_id, user_id, vip_level_id, record_date,
                    step_target, actual_steps, is_completed, completion_time,
                    daily_reward, is_reward_available, reward_available_at,
                    data_source, source_data, is_verified,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                challengeId, userId, challenge.vip_level_id, today,
                challenge.step_target, steps, isCompleted, completionTime,
                challenge.daily_reward, false, rewardAvailableAt,
                dataSource, sourceData ? JSON.stringify(sourceData) : null, false
            ]);

            // 更新挑战进度
            if (isCompleted) {
                await connection.query(`
                    UPDATE vip_challenges SET
                        current_consecutive_days = current_consecutive_days + 1,
                        total_earned_reward = total_earned_reward + ?,
                        last_activity_date = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `, [challenge.daily_reward, today, challengeId]);

                // 检查是否完成整个挑战
                const [updatedChallenge] = await connection.query(`
                    SELECT * FROM vip_challenges WHERE id = ?
                `, [challengeId]);

                if (updatedChallenge[0].current_consecutive_days >= updatedChallenge[0].required_consecutive_days) {
                    await this.completeChallenge(connection, challengeId, userId);
                }
            } else {
                // 失败，增加失败天数
                await connection.query(`
                    UPDATE vip_challenges SET
                        failed_days = failed_days + 1,
                        current_consecutive_days = 0,
                        last_activity_date = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `, [today, challengeId]);

                // 检查是否超过最大失败天数
                const [updatedChallenge] = await connection.query(`
                    SELECT * FROM vip_challenges WHERE id = ?
                `, [challengeId]);

                if (updatedChallenge[0].failed_days > updatedChallenge[0].max_failed_days) {
                    await this.failChallenge(connection, challengeId, userId);
                }
            }

            await connection.commit();

            return {
                success: true,
                data: {
                    isCompleted,
                    steps,
                    stepTarget: challenge.step_target,
                    dailyReward: challenge.daily_reward,
                    rewardAvailableAt: rewardAvailableAt.toISOString(),
                    challengeStatus: await this.getChallengeStatus(challengeId)
                },
                message: isCompleted ? '今日目标完成！' : '今日目标未完成，继续加油！'
            };

        } catch (error) {
            await connection.rollback();
            logger.error('提交每日步数失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 领取每日奖励
     */
    async claimDailyReward(userId, challengeId, recordDate) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 检查记录是否存在
            const [recordRows] = await connection.query(`
                SELECT * FROM vip_challenge_daily_records 
                WHERE challenge_id = ? AND user_id = ? AND record_date = ?
            `, [challengeId, userId, recordDate]);

            if (recordRows.length === 0) {
                throw new Error('记录不存在');
            }

            const record = recordRows[0];

            if (!record.is_completed) {
                throw new Error('该日未完成目标，无法领取奖励');
            }

            if (!record.is_reward_available) {
                throw new Error('奖励尚未可领取');
            }

            if (record.is_reward_claimed) {
                throw new Error('奖励已领取');
            }

            // 检查奖励可领取时间
            if (new Date() < new Date(record.reward_available_at)) {
                throw new Error('奖励尚未到可领取时间');
            }

            // 更新记录状态
            await connection.query(`
                UPDATE vip_challenge_daily_records SET
                    is_reward_claimed = TRUE,
                    reward_claimed_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `, [record.id]);

            // 更新挑战总领取奖励
            await connection.query(`
                UPDATE vip_challenges SET
                    total_claimed_reward = total_claimed_reward + ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [record.daily_reward, challengeId]);

            // 发放奖励到用户钱包
            await connection.query(`
                UPDATE user_wallets 
                SET balance = balance + ?
                WHERE user_id = ?
            `, [record.daily_reward, userId]);

            // 记录奖励交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, created_at
                ) VALUES (?, 'vip_challenge_reward', ?, ?)
            `, [userId, record.daily_reward, `VIP挑战每日奖励: ${recordDate}`]);

            await connection.commit();

            return {
                success: true,
                data: {
                    dailyReward: record.daily_reward,
                    claimedAt: new Date().toISOString()
                },
                message: '奖励领取成功！'
            };

        } catch (error) {
            await connection.rollback();
            logger.error('领取每日奖励失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 完成挑战
     */
    async completeChallenge(connection, challengeId, userId) {
        try {
            // 获取挑战信息
            const [challengeRows] = await connection.query(`
                SELECT vc.*, vl.final_reward, vl.bonus_reward, vl.name as level_name
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ?
            `, [challengeId]);

            if (challengeRows.length === 0) {
                throw new Error('挑战记录不存在');
            }

            const challenge = challengeRows[0];
            const totalReward = parseFloat(challenge.final_reward) + parseFloat(challenge.bonus_reward);

            // 更新挑战状态
            await connection.query(`
                UPDATE vip_challenges SET
                    status = 'completed',
                    completed_at = NOW(),
                    total_earned_reward = total_earned_reward + ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [totalReward, challengeId]);

            // 解冻押金
            await connection.query(`
                UPDATE user_wallets 
                SET frozen_balance = frozen_balance - ?
                WHERE user_id = ?
            `, [challenge.deposit_amount, userId]);

            // 发放最终奖励
            if (totalReward > 0) {
                await connection.query(`
                    UPDATE user_wallets 
                    SET balance = balance + ?
                    WHERE user_id = ?
                `, [totalReward, userId]);

                // 记录奖励交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description, created_at
                    ) VALUES (?, 'vip_challenge_reward', ?, ?)
                `, [userId, totalReward, `VIP挑战完成奖励: ${challenge.level_name}`]);
            }

            logger.info(`用户 ${userId} 完成挑战 ${challengeId}，获得奖励 ${totalReward}`);

        } catch (error) {
            logger.error('完成挑战失败:', error);
            throw error;
        }
    }

    /**
     * 挑战失败
     */
    async failChallenge(connection, challengeId, userId) {
        try {
            // 获取挑战信息
            const [challengeRows] = await connection.query(`
                SELECT vc.*, vl.deposit_deduct_ratio, vl.partial_refund_ratio, vl.name as level_name
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ?
            `, [challengeId]);

            if (challengeRows.length === 0) {
                throw new Error('挑战记录不存在');
            }

            const challenge = challengeRows[0];

            // 计算扣除金额和退还金额
            const deductAmount = parseFloat(challenge.deposit_amount) * parseFloat(challenge.deposit_deduct_ratio);
            const refundAmount = parseFloat(challenge.deposit_amount) * parseFloat(challenge.partial_refund_ratio);
            const finalDeductAmount = parseFloat(challenge.deposit_amount) - refundAmount;

            // 更新挑战状态
            await connection.query(`
                UPDATE vip_challenges SET
                    status = 'failed',
                    updated_at = NOW()
                WHERE id = ?
            `, [challengeId]);

            // 处理押金
            if (finalDeductAmount > 0) {
                // 扣除部分押金
                await connection.query(`
                    UPDATE user_wallets 
                    SET frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [finalDeductAmount, userId]);

                // 记录扣除交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description, created_at
                    ) VALUES (?, 'vip_challenge_penalty', ?, ?)
                `, [userId, -finalDeductAmount, `VIP挑战失败扣除: ${challenge.level_name}`]);
            }

            // 退还部分押金
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
                `, [userId, refundAmount, `VIP挑战失败退还: ${challenge.level_name}`]);
            }

            // 记录处罚
            await this.recordPenalty(challengeId, userId, challenge.vip_level_id, 'challenge_fail', 
                '挑战失败，超过最大失败天数', finalDeductAmount, challenge.deposit_deduct_ratio);

            logger.info(`用户 ${userId} 挑战 ${challengeId} 失败，扣除押金 ${finalDeductAmount}，退还 ${refundAmount}`);

        } catch (error) {
            logger.error('处理挑战失败失败:', error);
            throw error;
        }
    }

    /**
     * 记录处罚
     */
    async recordPenalty(challengeId, userId, vipLevelId, penaltyType, reason, amount, ratio) {
        try {
            await pool.query(`
                INSERT INTO vip_challenge_penalties (
                    challenge_id, user_id, vip_level_id,
                    penalty_type, penalty_reason, penalty_amount, penalty_ratio,
                    status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'executed', NOW(), NOW())
            `, [challengeId, userId, vipLevelId, penaltyType, reason, amount, ratio]);

        } catch (error) {
            logger.error('记录处罚失败:', error);
        }
    }

    /**
     * 获取挑战状态
     */
    async getChallengeStatus(challengeId) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.name as level_name,
                    vl.step_target,
                    vl.daily_reward,
                    vl.final_reward,
                    vl.bonus_reward
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ?
            `, [challengeId]);

            if (rows.length === 0) {
                return null;
            }

            const challenge = rows[0];
            const progress = challenge.required_consecutive_days > 0 ? 
                (challenge.current_consecutive_days / challenge.required_consecutive_days) * 100 : 0;

            return {
                id: challenge.id,
                status: challenge.status,
                progress: Math.round(progress * 100) / 100,
                currentConsecutiveDays: challenge.current_consecutive_days,
                requiredConsecutiveDays: challenge.required_consecutive_days,
                failedDays: challenge.failed_days,
                maxFailedDays: challenge.max_failed_days,
                totalEarnedReward: challenge.total_earned_reward,
                totalClaimedReward: challenge.total_claimed_reward,
                remainingDays: Math.max(0, challenge.required_consecutive_days - challenge.current_consecutive_days)
            };

        } catch (error) {
            logger.error('获取挑战状态失败:', error);
            return null;
        }
    }

    /**
     * 获取挑战详情
     */
    async getChallengeById(challengeId) {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM vip_challenge_details_enhanced WHERE id = ?
            `, [challengeId]);

            return rows.length > 0 ? rows[0] : null;

        } catch (error) {
            logger.error('获取挑战详情失败:', error);
            return null;
        }
    }

    /**
     * 启动超时检查服务
     */
    startTimeoutCheckService() {
        if (this.isRunning) {
            logger.warn('超时检查服务已在运行');
            return;
        }

        this.isRunning = true;
        this.timeoutCheckInterval = setInterval(async () => {
            try {
                await this.checkTimeoutChallenges();
            } catch (error) {
                logger.error('超时检查失败:', error);
            }
        }, 5 * 60 * 1000); // 每5分钟检查一次

        logger.info('VIP挑战超时检查服务已启动');
    }

    /**
     * 停止超时检查服务
     */
    stopTimeoutCheckService() {
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }
        this.isRunning = false;
        logger.info('VIP挑战超时检查服务已停止');
    }

    /**
     * 检查超时挑战
     */
    async checkTimeoutChallenges() {
        try {
            // 查找超时的挑战
            const [timeoutChallenges] = await pool.query(`
                SELECT vc.*, vl.auto_timeout_hours, vl.timeout_deduct_ratio
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.status = 'active' 
                AND vc.last_activity_date < DATE_SUB(CURDATE(), INTERVAL ? HOUR)
            `, [48]); // 默认48小时无活动视为超时

            for (const challenge of timeoutChallenges) {
                await this.handleTimeoutChallenge(challenge);
            }

            if (timeoutChallenges.length > 0) {
                logger.info(`处理了 ${timeoutChallenges.length} 个超时挑战`);
            }

        } catch (error) {
            logger.error('检查超时挑战失败:', error);
        }
    }

    /**
     * 处理超时挑战
     */
    async handleTimeoutChallenge(challenge) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 更新挑战状态
            await connection.query(`
                UPDATE vip_challenges SET
                    status = 'timeout',
                    timeout_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `, [challenge.id]);

            // 计算扣除金额
            const deductAmount = parseFloat(challenge.deposit_amount) * parseFloat(challenge.timeout_deduct_ratio);
            const refundAmount = parseFloat(challenge.deposit_amount) - deductAmount;

            // 处理押金
            if (deductAmount > 0) {
                await connection.query(`
                    UPDATE user_wallets 
                    SET frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [deductAmount, challenge.user_id]);

                // 记录扣除交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description, created_at
                    ) VALUES (?, 'vip_challenge_timeout', ?, ?)
                `, [challenge.user_id, -deductAmount, 'VIP挑战超时扣除']);
            }

            // 退还剩余押金
            if (refundAmount > 0) {
                await connection.query(`
                    UPDATE user_wallets 
                    SET frozen_balance = frozen_balance - ?,
                        balance = balance + ?
                    WHERE user_id = ?
                `, [refundAmount, refundAmount, challenge.user_id]);

                // 记录退还交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description, created_at
                    ) VALUES (?, 'vip_challenge_refund', ?, ?)
                `, [challenge.user_id, refundAmount, 'VIP挑战超时退还']);
            }

            // 记录处罚
            await this.recordPenalty(challenge.id, challenge.user_id, challenge.vip_level_id,
                'timeout', '挑战超时，超过最大无活动时间', deductAmount, challenge.timeout_deduct_ratio);

            await connection.commit();

            logger.info(`挑战 ${challenge.id} 超时处理完成，用户 ${challenge.user_id}，扣除 ${deductAmount}，退还 ${refundAmount}`);

        } catch (error) {
            await connection.rollback();
            logger.error('处理超时挑战失败:', error);
        } finally {
            connection.release();
        }
    }

    /**
     * 获取用户挑战统计
     */
    async getUserChallengeStats(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM user_challenge_stats WHERE user_id = ?
            `, [userId]);

            return rows.length > 0 ? rows[0] : null;

        } catch (error) {
            logger.error('获取用户挑战统计失败:', error);
            return null;
        }
    }

    /**
     * 获取挑战每日统计
     */
    async getChallengeDailyStats(startDate = null, endDate = null) {
        try {
            let query = 'SELECT * FROM vip_challenge_daily_stats';
            let params = [];

            if (startDate && endDate) {
                query += ' WHERE date BETWEEN ? AND ?';
                params = [startDate, endDate];
            }

            query += ' ORDER BY date DESC, vip_level_id';

            const [rows] = await pool.query(query, params);
            return rows;

        } catch (error) {
            logger.error('获取挑战每日统计失败:', error);
            return [];
        }
    }
}

module.exports = new VIPChallengeServiceEnhanced();
