const mysql = require('mysql2/promise');
const db = require('../config/database');

class RewardService {
    /**
     * 发放成就奖励
     */
    async grantAchievementReward(userId, achievementId, rewardAmount) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 检查是否已经领取过奖励
            const [existing] = await connection.execute(`
                SELECT reward_claimed FROM user_achievements 
                WHERE user_id = ? AND achievement_id = ?
            `, [userId, achievementId]);
            
            if (existing.length === 0) {
                throw new Error('成就记录不存在');
            }
            
            if (existing[0].reward_claimed) {
                throw new Error('奖励已经领取过了');
            }
            
            // 获取用户钱包信息
            const [wallet] = await connection.execute(`
                SELECT * FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (wallet.length === 0) {
                // 创建用户钱包
                await connection.execute(`
                    INSERT INTO user_wallets (user_id, balance, frozen_balance, created_at, updated_at)
                    VALUES (?, 0, 0, NOW(), NOW())
                `, [userId]);
            }
            
            // 更新用户钱包余额
            await connection.execute(`
                UPDATE user_wallets 
                SET balance = balance + ?, updated_at = NOW()
                WHERE user_id = ?
            `, [rewardAmount, userId]);
            
            // 记录钱包交易
            await connection.execute(`
                INSERT INTO wallet_transactions 
                (user_id, type, amount, description, status, created_at)
                VALUES (?, 'achievement_reward', ?, '成就奖励', 'completed', NOW())
            `, [userId, rewardAmount]);
            
            // 标记成就奖励已领取
            await connection.execute(`
                UPDATE user_achievements 
                SET reward_claimed = 1, reward_claimed_at = NOW(), updated_at = NOW()
                WHERE user_id = ? AND achievement_id = ?
            `, [userId, achievementId]);
            
            await connection.commit();
            
            console.log(`✅ 用户 ${userId} 成就 ${achievementId} 奖励 ${rewardAmount} USDT 发放成功`);
            
            return {
                success: true,
                message: '奖励发放成功',
                amount: rewardAmount
            };
            
        } catch (error) {
            await connection.rollback();
            console.error('发放成就奖励失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * 批量发放成就奖励
     */
    async grantMultipleAchievementRewards(userId, achievements) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const results = [];
            let totalAmount = 0;
            
            for (const achievement of achievements) {
                try {
                    const result = await this.grantAchievementReward(
                        userId, 
                        achievement.achievement_id, 
                        parseFloat(achievement.reward_amount)
                    );
                    
                    results.push({
                        achievementId: achievement.achievement_id,
                        achievementName: achievement.name,
                        success: true,
                        amount: achievement.reward_amount
                    });
                    
                    totalAmount += parseFloat(achievement.reward_amount);
                    
                } catch (error) {
                    results.push({
                        achievementId: achievement.achievement_id,
                        achievementName: achievement.name,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            await connection.commit();
            
            return {
                success: true,
                message: `批量发放完成，总计 ${totalAmount} USDT`,
                totalAmount,
                results
            };
            
        } catch (error) {
            await connection.rollback();
            console.error('批量发放成就奖励失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * 获取用户奖励历史
     */
    async getUserRewardHistory(userId, limit = 20, offset = 0) {
        try {
            const connection = await db.getConnection();
            
            const [transactions] = await connection.execute(`
                SELECT wt.*, ua.achievement_id, a.name as achievement_name
                FROM wallet_transactions wt
                LEFT JOIN user_achievements ua ON wt.user_id = ua.user_id 
                    AND wt.type = 'achievement_reward' 
                    AND wt.created_at = ua.reward_claimed_at
                LEFT JOIN achievements a ON ua.achievement_id = a.id
                WHERE wt.user_id = ? AND wt.type = 'achievement_reward'
                ORDER BY wt.created_at DESC
                LIMIT ? OFFSET ?
            `, [userId, limit, offset]);
            
            connection.release();
            
            return transactions;
            
        } catch (error) {
            console.error('获取用户奖励历史失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取用户总奖励统计
     */
    async getUserRewardStats(userId) {
        try {
            const connection = await db.getConnection();
            
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_rewards,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(DISTINCT achievement_id) as unique_achievements
                FROM wallet_transactions wt
                LEFT JOIN user_achievements ua ON wt.user_id = ua.user_id 
                    AND wt.type = 'achievement_reward' 
                    AND wt.created_at = ua.reward_claimed_at
                WHERE wt.user_id = ? AND wt.type = 'achievement_reward'
            `, [userId]);
            
            connection.release();
            
            return stats[0];
            
        } catch (error) {
            console.error('获取用户奖励统计失败:', error);
            throw error;
        }
    }
    
    /**
     * 验证奖励发放权限
     */
    async validateRewardGrant(userId, achievementId) {
        try {
            const connection = await db.getConnection();
            
            const [achievement] = await connection.execute(`
                SELECT ua.*, a.name, a.reward_amount, a.is_active
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ? AND ua.achievement_id = ?
            `, [userId, achievementId]);
            
            connection.release();
            
            if (achievement.length === 0) {
                return { valid: false, error: '成就记录不存在' };
            }
            
            const record = achievement[0];
            
            if (!record.is_active) {
                return { valid: false, error: '成就已禁用' };
            }
            
            if (!record.is_completed) {
                return { valid: false, error: '成就尚未完成' };
            }
            
            if (record.reward_claimed) {
                return { valid: false, error: '奖励已经领取过了' };
            }
            
            return { 
                valid: true, 
                achievement: record 
            };
            
        } catch (error) {
            console.error('验证奖励发放权限失败:', error);
            throw error;
        }
    }
}

module.exports = new RewardService();
