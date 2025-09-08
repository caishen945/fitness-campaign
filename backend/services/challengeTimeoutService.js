const { query, transaction } = require('../config/database');
const VIPChallenge = require('../models/VIPChallenge');
const logger = require('../utils/logger');
const { isChallengeTimeoutEnabled, getChallengeTimeoutIntervalMs } = require('../config/featureFlags');

class ChallengeTimeoutService {
    constructor() {
        this.isRunning = false;
        this.checkInterval = 5 * 60 * 1000; // 5分钟检查一次
        this.timerId = null;
        this.lastRunAt = null;
        this.lastSuccessAt = null;
        this.lastErrorAt = null;
        this.lastRunError = null;
    }

    // 启动超时检查服务
    start() {
        if (this.isRunning) {
            logger.info('挑战超时检查服务已在运行中');
            return;
        }

        if (!isChallengeTimeoutEnabled()) {
            logger.info('挑战超时检查服务未启用（CHALLENGE_TIMEOUT_ENABLED=false），跳过启动');
            return;
        }

        const intervalFromEnv = getChallengeTimeoutIntervalMs();
        if (Number.isFinite(intervalFromEnv) && intervalFromEnv > 0) {
            this.checkInterval = intervalFromEnv;
        }

        this.isRunning = true;
        logger.info('🚀 启动挑战超时检查服务');
        
        this.runTimeoutCheck();
        this.scheduleNextCheck();
    }

    // 停止超时检查服务
    stop() {
        this.isRunning = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        logger.info('🛑 停止挑战超时检查服务');
    }

    // 安排下次检查
    scheduleNextCheck() {
        if (!this.isRunning) return;

        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this.timerId = setTimeout(() => {
            this.runTimeoutCheck();
            this.scheduleNextCheck();
        }, this.checkInterval);
    }

    // 运行超时检查
    async runTimeoutCheck() {
        try {
            this.lastRunAt = new Date().toISOString();
            logger.info('⏰ 开始检查超时挑战...');
            
            const expiredChallenges = await this.findExpiredChallenges();
            logger.info(`发现 ${expiredChallenges.length} 个超时挑战`);
            
            for (const challenge of expiredChallenges) {
                await this.processExpiredChallenge(challenge);
            }
            
            this.lastSuccessAt = new Date().toISOString();
            this.lastRunError = null;
            logger.info('✅ 超时挑战检查完成');
        } catch (error) {
            this.lastErrorAt = new Date().toISOString();
            this.lastRunError = error?.message || String(error);
            logger.error('❌ 超时挑战检查失败:', error);
        }
    }

    // 查找超时挑战
    async findExpiredChallenges() {
        const rows = await query(`
            SELECT 
                vc.*,
                vl.name as level_name,
                vl.partial_refund_ratio,
                vl.max_failed_days
            FROM vip_challenges vc
            LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
            WHERE vc.status = 'active' 
            AND vc.end_date < NOW()
        `);

        return rows.map(row => VIPChallenge.fromDatabase(row));
    }

    // 处理超时挑战
    async processExpiredChallenge(challenge) {
        try {
            await transaction(async (connection) => {
                logger.info(`处理超时挑战 ID: ${challenge.id}, 用户: ${challenge.userId}`);

                // 检查挑战状态
                if (challenge.currentConsecutiveDays >= challenge.requiredConsecutiveDays) {
                    // 完成挑战
                    await this.completeChallenge(connection, challenge);
                } else if (challenge.failedDays <= challenge.maxFailedDays) {
                    // 部分失败，退还部分押金
                    await this.handlePartialFailure(connection, challenge);
                } else {
                    // 完全失败，扣除全部押金
                    await this.handleCompleteFailure(connection, challenge);
                }
            });
            
            logger.info(`✅ 超时挑战 ${challenge.id} 处理完成`);
        } catch (error) {
            logger.error(`❌ 处理超时挑战 ${challenge.id} 失败:`, error);
        }
    }

    // 完成挑战
    async completeChallenge(connection, challenge) {
        logger.info(`🎉 挑战 ${challenge.id} 完成，发放最终奖励`);
        
        // 更新挑战状态
        await connection.execute(`
            UPDATE vip_challenges SET
                status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        `, [challenge.id]);

        // 发放最终奖励
        await connection.execute(`
            UPDATE user_wallets 
            SET balance = balance + ?
            WHERE user_id = ?
        `, [challenge.finalReward, challenge.userId]);

        // 记录奖励交易
        await connection.execute(`
            INSERT INTO wallet_transactions (
                user_id, transaction_type, amount, description
            ) VALUES (?, 'vip_challenge_reward', ?, ?)
        `, [challenge.userId, challenge.finalReward, `VIP挑战完成奖励: ${challenge.vipLevel?.name || 'VIP挑战'}`]);

        // 解冻押金
        await connection.execute(`
            UPDATE user_wallets 
            SET frozen_balance = frozen_balance - ?
            WHERE user_id = ?
        `, [challenge.depositAmount, challenge.userId]);
    }

    // 处理部分失败
    async handlePartialFailure(connection, challenge) {
        logger.info(`⚠️ 挑战 ${challenge.id} 部分失败，退还部分押金`);
        
        const refundAmount = parseFloat((challenge.depositAmount * challenge.partialRefundRatio).toFixed(2));
        const deductAmount = challenge.depositAmount - refundAmount;

        // 更新挑战状态
        await connection.query(`
            UPDATE vip_challenges SET
                status = 'failed',
                updated_at = NOW()
            WHERE id = ?
        `, [challenge.id]);

        // 退还部分押金
        await connection.query(`
            UPDATE user_wallets 
            SET balance = balance + ?,
                frozen_balance = frozen_balance - ?
            WHERE user_id = ?
        `, [refundAmount, challenge.depositAmount, challenge.userId]);

        // 记录扣除交易
        if (deductAmount > 0) {
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description
                ) VALUES (?, 'withdrawal', ?, ?)
            `, [challenge.userId, deductAmount, '挑战超时扣除']);
        }

        // 记录退还交易
        await connection.query(`
            INSERT INTO wallet_transactions (
                user_id, transaction_type, amount, description
            ) VALUES (?, 'deposit', ?, ?)
        `, [challenge.userId, refundAmount, '挑战超时退还押金']);
    }

    // 处理完全失败
    async handleCompleteFailure(connection, challenge) {
        logger.info(`❌ 挑战 ${challenge.id} 完全失败，扣除全部押金`);
        
        // 更新挑战状态
        await connection.query(`
            UPDATE vip_challenges SET
                status = 'failed',
                updated_at = NOW()
            WHERE id = ?
        `, [challenge.id]);

        // 扣除全部押金
        await connection.query(`
            UPDATE user_wallets 
            SET frozen_balance = frozen_balance - ?
            WHERE user_id = ?
        `, [challenge.depositAmount, challenge.userId]);

        // 记录扣除交易
        await connection.query(`
            INSERT INTO wallet_transactions (
                user_id, transaction_type, amount, description
            ) VALUES (?, 'withdrawal', ?, ?)
        `, [challenge.userId, challenge.depositAmount, '挑战完全失败扣除']);
    }

    // 手动触发超时检查
    async manualCheck() {
        logger.info('🔍 手动触发超时检查');
        await this.runTimeoutCheck();
    }

    // 设置检查间隔（毫秒）并重新调度
    setCheckInterval(ms) {
        const parsed = Number(ms);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error('intervalMs 必须为正数');
        }
        this.checkInterval = parsed;
        if (this.isRunning) {
            this.scheduleNextCheck();
        }
    }

    // 获取服务状态
    getStatus() {
        return {
            isRunning: this.isRunning,
            checkInterval: this.checkInterval,
            lastRunAt: this.lastRunAt,
            lastSuccessAt: this.lastSuccessAt,
            lastErrorAt: this.lastErrorAt,
            lastRunError: this.lastRunError
        };
    }
}

module.exports = new ChallengeTimeoutService();
