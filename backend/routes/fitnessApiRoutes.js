const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();

// ==========================================
// 运动步数API接口
// ==========================================

// 提交步数（手动输入）
router.post('/steps/manual', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { steps, date, challengeId } = req.body;

        if (!steps || steps < 0) {
            return res.status(400).json({
                success: false,
                message: '步数不能为空且必须大于等于0'
            });
        }

        const targetDate = date || new Date().toISOString().split('T')[0];

        // 检查是否有进行中的挑战
        if (challengeId) {
            const [challengeRows] = await pool.query(`
                SELECT 
                    vc.*,
                    vl.step_target,
                    vl.required_consecutive_days,
                    vl.max_failed_days
                FROM vip_challenges vc
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE vc.id = ? AND vc.user_id = ? AND vc.status = 'active'
            `, [challengeId, userId]);

            if (challengeRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '挑战不存在或已结束'
                });
            }

            const challenge = challengeRows[0];
            
            // 更新挑战步数
            await pool.query(`
                UPDATE vip_challenges SET
                    current_steps = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [steps, challengeId]);

            // 检查是否完成今日目标
            if (steps >= challenge.step_target) {
                await pool.query(`
                    UPDATE vip_challenges SET
                        current_consecutive_days = current_consecutive_days + 1,
                        current_steps = 0,
                        updated_at = NOW()
                    WHERE id = ?
                `, [challengeId]);

                // 检查是否完成所有连续挑战
                const [updatedChallenge] = await pool.query(`
                    SELECT current_consecutive_days, required_consecutive_days
                    FROM vip_challenges WHERE id = ?
                `, [challengeId]);

                if (updatedChallenge[0].current_consecutive_days >= updatedChallenge[0].required_consecutive_days) {
                    // 完成挑战
                    await pool.query(`
                        UPDATE vip_challenges SET
                            status = 'completed',
                            completed_at = NOW(),
                            updated_at = NOW()
                        WHERE id = ?
                    `, [challengeId]);

                    // 发放奖励
                    const [rewardInfo] = await pool.query(`
                        SELECT vl.final_reward, vl.name
                        FROM vip_challenges vc
                        LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                        WHERE vc.id = ?
                    `, [challengeId]);

                    if (rewardInfo[0].final_reward > 0) {
                        await pool.query(`
                            UPDATE user_wallets 
                            SET balance = balance + ?
                            WHERE user_id = ?
                        `, [rewardInfo[0].final_reward, userId]);

                        await pool.query(`
                            INSERT INTO wallet_transactions (
                                user_id, transaction_type, amount, description
                            ) VALUES (?, 'vip_challenge_reward', ?, ?)
                        `, [userId, rewardInfo[0].final_reward, `VIP挑战完成奖励: ${rewardInfo[0].name}`]);
                    }

                    return res.json({
                        success: true,
                        message: '🎉 恭喜完成挑战！获得最终奖励！',
                        data: {
                            isCompleted: true,
                            steps,
                            stepTarget: challenge.step_target,
                            rewardAmount: rewardInfo[0].final_reward
                        }
                    });
                }

                return res.json({
                    success: true,
                    message: '✅ 今日目标完成！继续加油！',
                    data: {
                        isCompleted: false,
                        steps,
                        stepTarget: challenge.step_target,
                        consecutiveDays: updatedChallenge[0].current_consecutive_days,
                        requiredDays: updatedChallenge[0].required_consecutive_days
                    }
                });
            } else {
                return res.json({
                    success: true,
                    message: '📊 步数已记录，继续努力！',
                    data: {
                        isCompleted: false,
                        steps,
                        stepTarget: challenge.step_target,
                        remainingSteps: challenge.step_target - steps
                    }
                });
            }
        }

        // 记录步数历史
        await pool.query(`
            INSERT INTO user_steps (user_id, steps, date, created_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                steps = VALUES(steps),
                updated_at = NOW()
        `, [userId, steps, targetDate]);

        res.json({
            success: true,
            message: '步数记录成功',
            data: { steps, date: targetDate }
        });

    } catch (error) {
        console.error('提交步数失败:', error);
        res.status(500).json({
            success: false,
            message: '提交步数失败',
            error: error.message
        });
    }
});

// 获取用户步数历史
router.get('/steps/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, limit = 30 } = req.query;

        let whereClause = 'WHERE user_id = ?';
        let queryParams = [userId];

        if (startDate && endDate) {
            whereClause += ' AND date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        const [rows] = await pool.query(`
            SELECT steps, date, created_at
            FROM user_steps
            ${whereClause}
            ORDER BY date DESC
            LIMIT ?
        `, [...queryParams, parseInt(limit)]);

        res.json({
            success: true,
            data: rows,
            message: '获取步数历史成功'
        });

    } catch (error) {
        console.error('获取步数历史失败:', error);
        res.status(500).json({
            success: false,
            message: '获取步数历史失败',
            error: error.message
        });
    }
});

// ==========================================
// 第三方运动API接口（预留）
// ==========================================

// 谷歌Fit API接入点
router.post('/steps/google-fit', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { accessToken, startTime, endTime } = req.body;

        // TODO: 实现谷歌Fit API集成
        // 1. 验证accessToken
        // 2. 调用谷歌Fit API获取步数
        // 3. 处理步数数据
        // 4. 更新挑战进度

        res.json({
            success: true,
            message: '谷歌Fit API接入点（待实现）',
            data: { userId, source: 'google-fit' }
        });

    } catch (error) {
        console.error('谷歌Fit API调用失败:', error);
        res.status(500).json({
            success: false,
            message: '谷歌Fit API调用失败',
            error: error.message
        });
    }
});

// iOS HealthKit API接入点
router.post('/steps/healthkit', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { healthData, startTime, endTime } = req.body;

        // TODO: 实现iOS HealthKit API集成
        // 1. 验证healthData
        // 2. 解析HealthKit数据
        // 3. 处理步数数据
        // 4. 更新挑战进度

        res.json({
            success: true,
            message: 'iOS HealthKit API接入点（待实现）',
            data: { userId, source: 'healthkit' }
        });

    } catch (error) {
        console.error('iOS HealthKit API调用失败:', error);
        res.status(500).json({
            success: false,
            message: 'iOS HealthKit API调用失败',
            error: error.message
        });
    }
});

// 获取支持的第三方API列表
router.get('/steps/sources', authenticateToken, async (req, res) => {
    try {
        const supportedSources = [
            {
                id: 'manual',
                name: '手动输入',
                description: '用户手动输入步数',
                isActive: true
            },
            {
                id: 'google-fit',
                name: '谷歌Fit',
                description: '通过谷歌Fit API自动获取步数',
                isActive: false,
                comingSoon: true
            },
            {
                id: 'healthkit',
                name: 'iOS HealthKit',
                description: '通过iOS HealthKit自动获取步数',
                isActive: false,
                comingSoon: true
            }
        ];

        res.json({
            success: true,
            data: supportedSources,
            message: '获取支持的步数来源成功'
        });

    } catch (error) {
        console.error('获取步数来源失败:', error);
        res.status(500).json({
            success: false,
            message: '获取步数来源失败',
            error: error.message
        });
    }
});

// ==========================================
// 挑战统计接口
// ==========================================

// 获取用户挑战统计
router.get('/challenge/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'all' } = req.query;

        let dateCondition = '';
        let queryParams = [userId];

        switch (period) {
            case 'week':
                dateCondition = 'AND vc.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'AND vc.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            case 'year':
                dateCondition = 'AND vc.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                break;
            default:
                dateCondition = '';
        }

        // 总体统计
        const [totalStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_challenges,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_challenges,
                SUM(CASE WHEN status = 'completed' THEN final_reward ELSE 0 END) as total_rewards,
                SUM(deposit_amount) as total_deposits
            FROM vip_challenges vc
            WHERE vc.user_id = ? ${dateCondition}
        `, queryParams);

        // 按等级统计
        const [levelStats] = await pool.query(`
            SELECT 
                vl.name as level_name,
                vl.icon as level_icon,
                vl.color as level_color,
                COUNT(vc.id) as challenge_count,
                COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_count,
                AVG(CASE WHEN vc.status = 'completed' THEN vc.current_consecutive_days END) as avg_consecutive_days
            FROM vip_levels vl
            LEFT JOIN vip_challenges vc ON vl.id = vc.vip_level_id AND vc.user_id = ? ${dateCondition}
            GROUP BY vl.id, vl.name, vl.icon, vl.color
            ORDER BY vl.deposit_amount ASC
        `, queryParams);

        // 连续挑战统计
        const [consecutiveStats] = await pool.query(`
            SELECT 
                required_consecutive_days,
                COUNT(*) as challenge_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                AVG(current_consecutive_days) as avg_consecutive_days
            FROM vip_challenges vc
            WHERE vc.user_id = ? ${dateCondition}
            GROUP BY required_consecutive_days
            ORDER BY required_consecutive_days ASC
        `, queryParams);

        res.json({
            success: true,
            data: {
                total: totalStats[0],
                byLevel: levelStats,
                byConsecutive: consecutiveStats,
                period: period
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
});

module.exports = router;
