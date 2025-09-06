const mysql = require('mysql2/promise');
const db = require('../config/database');

class AchievementService {
    /**
     * 计算用户所有成就的进度
     */
    async calculateUserAchievements(userId) {
        try {
            // 获取所有成就类型
            const [achievementTypes] = await db.pool.execute(
                'SELECT * FROM achievement_types WHERE is_active = 1 ORDER BY sort_order'
            );
            
            const results = {};
            
            // 为每种成就类型计算进度
            for (const type of achievementTypes) {
                const progress = await this.calculateProgressByType(userId, type);
                results[type.code] = progress;
            }
            
            return results;
            
        } catch (error) {
            console.error('计算用户成就进度失败:', error);
            throw error;
        }
    }
    
    /**
     * 根据成就类型计算进度
     */
    async calculateProgressByType(userId, type) {
        switch (type.code) {
            case 'team_size':
                return await this.calculateTeamSizeProgress(userId);
            case 'team_challenge_participants':
                return await this.calculateTeamChallengeProgress(userId);
            case 'vip_challenge_completions':
                return await this.calculateVipChallengeProgress(userId);
            case 'total_steps':
                return await this.calculateTotalStepsProgress(userId);
            case 'consecutive_checkins':
                return await this.calculateConsecutiveCheckinProgress(userId);
            case 'pk_challenge_wins':
                return await this.calculatePkWinsProgress(userId);
            case 'registration_duration':
                return await this.calculateRegistrationDurationProgress(userId);
            case 'challenge_participation':
                return await this.calculateChallengeParticipationProgress(userId);
            case 'wallet_balance':
                return await this.calculateWalletBalanceProgress(userId);
            case 'exercise_habits':
                return await this.calculateExerciseHabitProgress(userId);
            default:
                return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算团队人数成就进度
     */
    async calculateTeamSizeProgress(userId) {
        try {
            // 获取用户的1级团队成员数量
            const [result] = await db.pool.execute(`
                SELECT COUNT(*) as team_size 
                FROM team_relationships 
                WHERE parent_id = ? AND level = 1
            `, [userId]);
            
            const current = result[0].team_size;
            return { current, target: 0, progress: 0 }; // target将在后续设置
        } catch (error) {
            console.error('计算团队人数进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算团队挑战参与人数成就进度
     */
    async calculateTeamChallengeProgress(userId) {
        try {
            // 获取用户1级团队成员中参与挑战的人数
            const [result] = await db.pool.execute(`
                SELECT COUNT(DISTINCT tr.user_id) as challenge_participants
                FROM team_relationships tr
                LEFT JOIN vip_challenges vc ON tr.user_id = vc.user_id
                WHERE tr.parent_id = ? AND tr.level = 1
                AND vc.user_id IS NOT NULL
            `, [userId]);
            
            const current = result[0].challenge_participants;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算团队挑战进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算VIP挑战完成次数成就进度
     */
    async calculateVipChallengeProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT COUNT(*) as completed_challenges
                FROM vip_challenges
                WHERE user_id = ? AND status = 'completed'
            `, [userId]);
            
            const current = result[0].completed_challenges;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算VIP挑战进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算累计步数成就进度
     */
    async calculateTotalStepsProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT COALESCE(SUM(steps), 0) as total_steps
                FROM step_records
                WHERE user_id = ?
            `, [userId]);
            
            const current = result[0].total_steps;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算累计步数进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算连续签到成就进度
     */
    async calculateConsecutiveCheckinProgress(userId) {
        try {
            // 获取用户最近的签到记录，计算连续天数
            const [result] = await db.pool.execute(`
                SELECT checkin_date, 
                       DATEDIFF(CURDATE(), checkin_date) as days_ago
                FROM user_checkins
                WHERE user_id = ?
                ORDER BY checkin_date DESC
                LIMIT 30
            `, [userId]);
            
            let consecutiveDays = 0;
            let currentDate = new Date();
            
            for (let i = 0; i < result.length; i++) {
                const checkinDate = new Date(result[i].checkin_date);
                const expectedDate = new Date(currentDate);
                expectedDate.setDate(expectedDate.getDate() - i);
                
                if (checkinDate.toDateString() === expectedDate.toDateString()) {
                    consecutiveDays++;
                } else {
                    break;
                }
            }
            
            return { current: consecutiveDays, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算连续签到进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算PK胜利次数成就进度
     */
    async calculatePkWinsProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT COUNT(*) as pk_wins
                FROM pk_challenges
                WHERE (challenger_id = ? OR opponent_id = ?) 
                AND winner_id = ? 
                AND status = 'completed'
            `, [userId, userId, userId]);
            
            const current = result[0].pk_wins;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算PK胜利进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算注册时长成就进度
     */
    async calculateRegistrationDurationProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT DATEDIFF(CURDATE(), created_at) as registration_days
                FROM users
                WHERE id = ?
            `, [userId]);
            
            const current = result[0].registration_days;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算注册时长进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算挑战参与度成就进度
     */
    async calculateChallengeParticipationProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT COUNT(*) as participation_count
                FROM (
                    SELECT user_id FROM vip_challenges WHERE user_id = ?
                    UNION
                    SELECT challenger_id FROM pk_challenges WHERE challenger_id = ?
                    UNION
                    SELECT opponent_id FROM pk_challenges WHERE opponent_id = ?
                ) as all_challenges
            `, [userId, userId, userId]);
            
            const current = result[0].participation_count;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算挑战参与度进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算钱包余额成就进度
     */
    async calculateWalletBalanceProgress(userId) {
        try {
            const [result] = await db.pool.execute(`
                SELECT COALESCE(SUM(amount), 0) as total_earned
                FROM wallet_transactions
                WHERE user_id = ? AND transaction_type = 'reward'
            `, [userId]);
            
            const current = result[0].total_earned;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算钱包余额进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 计算运动习惯成就进度
     */
    async calculateExerciseHabitProgress(userId) {
        try {
            // 计算连续运动天数（有步数记录的天数）
            const [result] = await db.pool.execute(`
                SELECT COUNT(DISTINCT DATE(created_at)) as exercise_days
                FROM step_records
                WHERE user_id = ? 
                AND steps > 0 
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 100 DAY)
            `, [userId]);
            
            const current = result[0].exercise_days;
            return { current, target: 0, progress: 0 };
        } catch (error) {
            console.error('计算运动习惯进度失败:', error);
            return { current: 0, target: 0, progress: 0 };
        }
    }
    
    /**
     * 更新用户成就进度
     */
    async updateUserAchievementProgress(userId) {
        try {
            // 计算所有成就进度
            const progressData = await this.calculateUserAchievements(userId);
            
            // 获取所有成就定义
            const [achievements] = await db.pool.execute(`
                SELECT * FROM achievements WHERE is_active = 1 ORDER BY type_id, sort_order
            `);
            
            // 更新每个成就的进度
            for (const achievement of achievements) {
                const typeCode = await this.getAchievementTypeCode(achievement.type_id);
                const progress = progressData[typeCode] || { current: 0, target: 0, progress: 0 };
                
                // 计算完成百分比
                const target = achievement.target_value;
                const current = Math.min(progress.current, target);
                const progressPercent = target > 0 ? (current / target) * 100 : 0;
                const isCompleted = current >= target;
                
                // 检查是否已存在用户成就记录
                const [existing] = await db.pool.execute(`
                    SELECT * FROM user_achievements 
                    WHERE user_id = ? AND achievement_id = ?
                `, [userId, achievement.id]);
                
                if (existing.length > 0) {
                    // 更新现有记录
                    await db.pool.execute(`
                        UPDATE user_achievements 
                        SET current_value = ?, is_completed = ?, 
                            updated_at = NOW()
                        WHERE user_id = ? AND achievement_id = ?
                    `, [current, isCompleted, userId, achievement.id]);
                } else {
                    // 创建新记录
                    await db.pool.execute(`
                        INSERT INTO user_achievements 
                        (user_id, achievement_id, current_value, is_completed, created_at, updated_at)
                        VALUES (?, ?, ?, ?, NOW(), NOW())
                    `, [userId, achievement.id, current, isCompleted]);
                }
            }
            
            console.log(`✅ 用户 ${userId} 成就进度更新完成`);
            
        } catch (error) {
            console.error('更新用户成就进度失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取成就类型代码
     */
    async getAchievementTypeCode(typeId) {
        const [result] = await db.pool.execute(
            'SELECT code FROM achievement_types WHERE id = ?',
            [typeId]
        );
        return result[0]?.code || '';
    }
    
    /**
     * 检查并触发成就完成
     */
    async checkAndTriggerAchievements(userId) {
        try {
            // 获取用户新完成的成就
            const [newCompleted] = await db.pool.execute(`
                SELECT ua.*, a.name, a.description, a.reward_amount, a.icon, a.color
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ? 
                AND ua.is_completed = 1 
                AND ua.is_claimed = 0
                AND a.is_active = 1
            `, [userId]);
            
            if (newCompleted.length > 0) {
                console.log(`🎉 用户 ${userId} 完成 ${newCompleted.length} 个新成就`);
                return newCompleted;
            }
            
            return [];
            
        } catch (error) {
            console.error('检查成就完成失败:', error);
            throw error;
        }
    }
}

module.exports = new AchievementService();
