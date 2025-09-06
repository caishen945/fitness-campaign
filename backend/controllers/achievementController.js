const { pool } = require('../config/database');
const achievementService = require('../services/achievementService');
const rewardService = require('../services/rewardService');

class AchievementController {
    /**
     * 获取用户成就列表
     */
    async getUserAchievements(req, res) {
        try {
            const userId = req.user.id;
            
            // 先更新用户成就进度
            await achievementService.updateUserAchievementProgress(userId);
            
            // 获取所有成就和用户进度
            const query = `
                SELECT 
                    a.id,
                    a.name,
                    a.description,
                    a.target_value,
                    a.reward_amount,
                    a.icon,
                    a.color,
                    at.name as type_name,
                    at.code as type_code,
                    COALESCE(ua.current_value, 0) as current_value,
                    COALESCE(ua.is_completed, FALSE) as is_completed,
                    COALESCE(ua.is_claimed, FALSE) as is_claimed,
                    ua.completed_at,
                    ua.claimed_at
                FROM achievements a
                JOIN achievement_types at ON a.type_id = at.id
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                WHERE a.is_active = TRUE
                ORDER BY at.sort_order, a.sort_order
            `;
            
            const [achievements] = await pool.execute(query, [userId]);
            
            // 计算统计信息
            const totalAchievements = achievements.length;
            const completedAchievements = achievements.filter(a => a.is_completed).length;
            const claimedAchievements = achievements.filter(a => a.is_claimed).length;
            const totalRewards = achievements
                .filter(a => a.is_completed && !a.is_claimed)
                .reduce((sum, a) => sum + parseFloat(a.reward_amount), 0);
            
            res.json({
                success: true,
                data: {
                    achievements,
                    stats: {
                        total: totalAchievements,
                        completed: completedAchievements,
                        claimed: claimedAchievements,
                        pendingRewards: totalRewards
                    }
                },
                message: '获取成就列表成功'
            });
        } catch (error) {
            console.error('获取用户成就失败:', error);
            res.status(500).json({
                success: false,
                error: '获取成就列表失败'
            });
        }
    }

    /**
     * 领取成就奖励
     */
    async claimAchievement(req, res) {
        try {
            const userId = req.user.id;
            const achievementId = req.params.achievementId;
            
            // 验证奖励发放权限
            const validation = await rewardService.validateRewardGrant(userId, achievementId);
            
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }
            
            // 发放奖励
            const result = await rewardService.grantAchievementReward(
                userId, 
                achievementId, 
                parseFloat(validation.achievement.reward_amount)
            );
            
            res.json({
                success: true,
                data: result,
                message: '奖励领取成功'
            });
            
        } catch (error) {
            console.error('领取成就奖励失败:', error);
            res.status(500).json({
                success: false,
                error: '领取奖励失败: ' + error.message
            });
        }
    }

    /**
     * 获取用户成就进度
     */
    async getUserProgress(req, res) {
        try {
            const userId = req.user.id;
            
            // 获取用户各项成就的当前进度
            const query = `
                SELECT 
                    at.code as type_code,
                    at.name as type_name,
                    COUNT(a.id) as total_achievements,
                    COUNT(CASE WHEN ua.is_completed = TRUE THEN 1 END) as completed_achievements,
                    SUM(CASE WHEN ua.is_completed = TRUE AND ua.is_claimed = FALSE THEN a.reward_amount ELSE 0 END) as pending_rewards
                FROM achievement_types at
                LEFT JOIN achievements a ON at.id = a.type_id AND a.is_active = TRUE
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                GROUP BY at.id, at.code, at.name
                ORDER BY at.sort_order
            `;
            
            const [progress] = await pool.execute(query, [userId]);
            
            res.json({
                success: true,
                data: progress,
                message: '获取成就进度成功'
            });
        } catch (error) {
            console.error('获取用户成就进度失败:', error);
            res.status(500).json({
                success: false,
                error: '获取成就进度失败'
            });
        }
    }

    // ==================== 管理员功能 ====================

    /**
     * 获取成就类型列表
     */
    async getAchievementTypes(req, res) {
        try {
            const [types] = await pool.execute(`
                SELECT * FROM achievement_types ORDER BY sort_order
            `);
            
            res.json({
                success: true,
                data: types,
                message: '获取成就类型成功'
            });
        } catch (error) {
            console.error('获取成就类型失败:', error);
            res.status(500).json({
                success: false,
                error: '获取成就类型失败'
            });
        }
    }

    /**
     * 获取所有成就
     */
    async getAllAchievements(req, res) {
        try {
            const [achievements] = await pool.execute(`
                SELECT 
                    a.*,
                    at.name as type_name,
                    at.code as type_code,
                    COUNT(ua.id) as total_users,
                    COUNT(CASE WHEN ua.is_completed = TRUE THEN 1 END) as completed_users,
                    COUNT(CASE WHEN ua.is_claimed = TRUE THEN 1 END) as claimed_users
                FROM achievements a
                JOIN achievement_types at ON a.type_id = at.id
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
                GROUP BY a.id
                ORDER BY at.sort_order, a.sort_order
            `);
            
            res.json({
                success: true,
                data: achievements,
                message: '获取成就列表成功'
            });
        } catch (error) {
            console.error('获取成就列表失败:', error);
            res.status(500).json({
                success: false,
                error: '获取成就列表失败'
            });
        }
    }

    /**
     * 创建新成就
     */
    async createAchievement(req, res) {
        try {
            const {
                type_id,
                name,
                description,
                target_value,
                reward_amount,
                reward_type = 'usdt',
                icon = 'trophy',
                color = '#FFD700',
                sort_order = 0
            } = req.body;
            
            // 验证必填字段
            if (!type_id || !name || !target_value || reward_amount === undefined) {
                return res.status(400).json({
                    success: false,
                    error: '缺少必填字段'
                });
            }
            
            const [result] = await pool.execute(`
                INSERT INTO achievements (type_id, name, description, target_value, reward_amount, reward_type, icon, color, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [type_id, name, description, target_value, reward_amount, reward_type, icon, color, sort_order]);
            
            res.json({
                success: true,
                data: { id: result.insertId },
                message: '成就创建成功'
            });
        } catch (error) {
            console.error('创建成就失败:', error);
            res.status(500).json({
                success: false,
                error: '创建成就失败'
            });
        }
    }

    /**
     * 更新成就
     */
    async updateAchievement(req, res) {
        try {
            const achievementId = req.params.id;
            const {
                name,
                description,
                target_value,
                reward_amount,
                reward_type,
                icon,
                color,
                sort_order,
                is_active
            } = req.body;
            
            const updateFields = [];
            const updateValues = [];
            
            if (name !== undefined) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (description !== undefined) {
                updateFields.push('description = ?');
                updateValues.push(description);
            }
            if (target_value !== undefined) {
                updateFields.push('target_value = ?');
                updateValues.push(target_value);
            }
            if (reward_amount !== undefined) {
                updateFields.push('reward_amount = ?');
                updateValues.push(reward_amount);
            }
            if (reward_type !== undefined) {
                updateFields.push('reward_type = ?');
                updateValues.push(reward_type);
            }
            if (icon !== undefined) {
                updateFields.push('icon = ?');
                updateValues.push(icon);
            }
            if (color !== undefined) {
                updateFields.push('color = ?');
                updateValues.push(color);
            }
            if (sort_order !== undefined) {
                updateFields.push('sort_order = ?');
                updateValues.push(sort_order);
            }
            if (is_active !== undefined) {
                updateFields.push('is_active = ?');
                updateValues.push(is_active);
            }
            
            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '没有要更新的字段'
                });
            }
            
            updateValues.push(achievementId);
            
            await pool.execute(`
                UPDATE achievements 
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = ?
            `, updateValues);
            
            res.json({
                success: true,
                message: '成就更新成功'
            });
        } catch (error) {
            console.error('更新成就失败:', error);
            res.status(500).json({
                success: false,
                error: '更新成就失败'
            });
        }
    }

    /**
     * 删除成就
     */
    async deleteAchievement(req, res) {
        try {
            const achievementId = req.params.id;
            
            // 检查是否有用户已经获得此成就
            const [userAchievements] = await pool.execute(`
                SELECT COUNT(*) as count FROM user_achievements WHERE achievement_id = ?
            `, [achievementId]);
            
            if (userAchievements[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    error: '该成就已有用户获得，无法删除'
                });
            }
            
            await pool.execute('DELETE FROM achievements WHERE id = ?', [achievementId]);
            
            res.json({
                success: true,
                message: '成就删除成功'
            });
        } catch (error) {
            console.error('删除成就失败:', error);
            res.status(500).json({
                success: false,
                error: '删除成就失败'
            });
        }
    }

    /**
     * 切换成就启用状态
     */
    async toggleAchievement(req, res) {
        try {
            const achievementId = req.params.id;
            
            const [result] = await pool.execute(`
                UPDATE achievements 
                SET is_active = NOT is_active, updated_at = NOW()
                WHERE id = ?
            `, [achievementId]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: '成就不存在'
                });
            }
            
            res.json({
                success: true,
                message: '成就状态切换成功'
            });
        } catch (error) {
            console.error('切换成就状态失败:', error);
            res.status(500).json({
                success: false,
                error: '切换成就状态失败'
            });
        }
    }

    /**
     * 获取成就统计信息
     */
    async getAchievementStats(req, res) {
        try {
            // 总体统计
            const [totalStats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_achievements,
                    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_achievements,
                    SUM(reward_amount) as total_rewards
                FROM achievements
            `);
            
            // 用户完成统计
            const [userStats] = await pool.execute(`
                SELECT 
                    COUNT(DISTINCT user_id) as total_users_with_achievements,
                    COUNT(*) as total_user_achievements,
                    COUNT(CASE WHEN is_completed = TRUE THEN 1 END) as completed_achievements,
                    COUNT(CASE WHEN is_claimed = TRUE THEN 1 END) as claimed_achievements
                FROM user_achievements
            `);
            
            // 按类型统计
            const [typeStats] = await pool.execute(`
                SELECT 
                    at.name as type_name,
                    COUNT(a.id) as achievement_count,
                    COUNT(CASE WHEN ua.is_completed = TRUE THEN 1 END) as completed_count,
                    COUNT(CASE WHEN ua.is_claimed = TRUE THEN 1 END) as claimed_count
                FROM achievement_types at
                LEFT JOIN achievements a ON at.id = a.type_id
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
                GROUP BY at.id, at.name
                ORDER BY at.sort_order
            `);
            
            res.json({
                success: true,
                data: {
                    total: totalStats[0],
                    users: userStats[0],
                    byType: typeStats
                },
                message: '获取成就统计成功'
            });
        } catch (error) {
            console.error('获取成就统计失败:', error);
            res.status(500).json({
                success: false,
                error: '获取成就统计失败'
            });
        }
    }

    /**
     * 管理员查看指定用户的成就
     */
    async getUserAchievementsByAdmin(req, res) {
        try {
            const userId = req.params.userId;
            
            const [achievements] = await pool.execute(`
                SELECT 
                    a.id,
                    a.name,
                    a.description,
                    a.target_value,
                    a.reward_amount,
                    at.name as type_name,
                    COALESCE(ua.current_value, 0) as current_value,
                    COALESCE(ua.is_completed, FALSE) as is_completed,
                    COALESCE(ua.is_claimed, FALSE) as is_claimed,
                    ua.completed_at,
                    ua.claimed_at
                FROM achievements a
                JOIN achievement_types at ON a.type_id = at.id
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                WHERE a.is_active = TRUE
                ORDER BY at.sort_order, a.sort_order
            `, [userId]);
            
            res.json({
                success: true,
                data: achievements,
                message: '获取用户成就成功'
            });
        } catch (error) {
            console.error('获取用户成就失败:', error);
            res.status(500).json({
                success: false,
                error: '获取用户成就失败'
            });
        }
    }
}

module.exports = new AchievementController();
