const { pool } = require('../config/database');

class AdminCheckinController {
    /**
     * 获取所有用户的签到统计
     */
    async getAllCheckinStats(req, res) {
        try {
            // 获取分页参数
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            
            // 获取总记录数
            const [countResult] = await pool.query(`
                SELECT COUNT(DISTINCT user_id) as total FROM user_checkins
            `);
            const total = countResult[0].total;
            
            // 获取用户签到统计
            const [rows] = await pool.query(`
                SELECT 
                    u.id as user_id,
                    u.username,
                    u.email,
                    COUNT(c.id) as total_checkins,
                    MAX(c.consecutive_days) as max_consecutive_days,
                    SUM(c.reward_amount) as total_rewards,
                    MAX(c.checkin_date) as last_checkin_date
                FROM 
                    users u
                LEFT JOIN 
                    user_checkins c ON u.id = c.user_id
                GROUP BY 
                    u.id
                ORDER BY 
                    total_checkins DESC, last_checkin_date DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            res.json({
                success: true,
                data: {
                    stats: rows,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                message: '获取签到统计成功'
            });
        } catch (error) {
            console.error('获取签到统计失败:', error);
            res.status(500).json({
                success: false,
                message: '获取签到统计失败',
                error: error.message
            });
        }
    }
    
    /**
     * 获取特定用户的签到详情
     */
    async getUserCheckinDetails(req, res) {
        try {
            const userId = req.params.userId;
            
            // 获取用户信息
            const [userRows] = await pool.query(`
                SELECT id, username, email FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }
            
            // 获取用户签到记录
            const [checkinRows] = await pool.query(`
                SELECT 
                    id,
                    checkin_date,
                    reward_amount,
                    consecutive_days,
                    created_at
                FROM 
                    user_checkins
                WHERE 
                    user_id = ?
                ORDER BY 
                    checkin_date DESC
            `, [userId]);
            
            // 获取用户签到统计
            const [statsRows] = await pool.query(`
                SELECT 
                    COUNT(*) as total_checkins,
                    MAX(consecutive_days) as max_consecutive_days,
                    SUM(reward_amount) as total_rewards
                FROM 
                    user_checkins
                WHERE 
                    user_id = ?
            `, [userId]);
            
            // 获取当月签到天数
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const [monthlyRows] = await pool.query(`
                SELECT 
                    COUNT(*) as monthly_checkins
                FROM 
                    user_checkins
                WHERE 
                    user_id = ? 
                    AND checkin_date BETWEEN ? AND ?
            `, [userId, firstDayOfMonth, lastDayOfMonth]);
            
            res.json({
                success: true,
                data: {
                    user: userRows[0],
                    checkins: checkinRows,
                    stats: {
                        ...statsRows[0],
                        monthly_checkins: monthlyRows[0].monthly_checkins
                    }
                },
                message: '获取用户签到详情成功'
            });
        } catch (error) {
            console.error('获取用户签到详情失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户签到详情失败',
                error: error.message
            });
        }
    }
    
    /**
     * 获取签到系统概览
     */
    async getCheckinOverview(req, res) {
        try {
            // 获取今日签到人数
            const [todayRows] = await pool.query(`
                SELECT COUNT(DISTINCT user_id) as today_checkins
                FROM user_checkins
                WHERE DATE(checkin_date) = CURDATE()
            `);
            
            // 获取昨日签到人数
            const [yesterdayRows] = await pool.query(`
                SELECT COUNT(DISTINCT user_id) as yesterday_checkins
                FROM user_checkins
                WHERE DATE(checkin_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            `);
            
            // 获取本周签到人数
            const [weekRows] = await pool.query(`
                SELECT COUNT(DISTINCT user_id) as week_checkins
                FROM user_checkins
                WHERE YEARWEEK(checkin_date) = YEARWEEK(NOW())
            `);
            
            // 获取本月签到人数
            const [monthRows] = await pool.query(`
                SELECT COUNT(DISTINCT user_id) as month_checkins
                FROM user_checkins
                WHERE MONTH(checkin_date) = MONTH(NOW()) AND YEAR(checkin_date) = YEAR(NOW())
            `);
            
            // 获取总签到次数和总奖励金额
            const [totalRows] = await pool.query(`
                SELECT 
                    COUNT(*) as total_checkins,
                    SUM(reward_amount) as total_rewards
                FROM user_checkins
            `);
            
            // 获取连续签到7天以上的用户数
            const [consecutiveRows] = await pool.query(`
                SELECT COUNT(*) as consecutive_users
                FROM (
                    SELECT user_id, MAX(consecutive_days) as max_consecutive
                    FROM user_checkins
                    GROUP BY user_id
                    HAVING max_consecutive >= 7
                ) as t
            `);
            
            res.json({
                success: true,
                data: {
                    today_checkins: todayRows[0].today_checkins,
                    yesterday_checkins: yesterdayRows[0].yesterday_checkins,
                    week_checkins: weekRows[0].week_checkins,
                    month_checkins: monthRows[0].month_checkins,
                    total_checkins: totalRows[0].total_checkins,
                    total_rewards: totalRows[0].total_rewards,
                    consecutive_users: consecutiveRows[0].consecutive_users
                },
                message: '获取签到系统概览成功'
            });
        } catch (error) {
            console.error('获取签到系统概览失败:', error);
            res.status(500).json({
                success: false,
                message: '获取签到系统概览失败',
                error: error.message
            });
        }
    }
    
    /**
     * 手动为用户添加签到记录
     */
    async addManualCheckin(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const { userId, rewardAmount, description } = req.body;
            
            if (!userId || rewardAmount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: '用户ID和奖励金额不能为空'
                });
            }
            
            // 检查用户是否存在
            const [userRows] = await connection.query(`
                SELECT id FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }
            
            // 检查今天是否已签到
            const [existingCheckins] = await connection.query(`
                SELECT * FROM user_checkins 
                WHERE user_id = ? 
                AND DATE(checkin_date) = CURDATE()
            `, [userId]);
            
            if (existingCheckins.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '该用户今天已经签到过了'
                });
            }
            
            // 获取用户最近的签到记录
            const [checkinRows] = await connection.query(`
                SELECT * FROM user_checkins 
                WHERE user_id = ? 
                ORDER BY checkin_date DESC
                LIMIT 1
            `, [userId]);
            
            let consecutiveDays = 1;
            
            if (checkinRows.length > 0) {
                const lastCheckinDate = new Date(checkinRows[0].checkin_date);
                lastCheckinDate.setHours(0, 0, 0, 0);
                
                // 检查昨天是否签到
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                
                if (lastCheckinDate.getTime() === yesterday.getTime()) {
                    // 昨天签到了，连续签到天数+1
                    consecutiveDays = checkinRows[0].consecutive_days + 1;
                }
            }
            
            // 记录签到
            await connection.query(`
                INSERT INTO user_checkins (
                    user_id, checkin_date, reward_amount, consecutive_days, created_at
                ) VALUES (?, NOW(), ?, ?, NOW())
            `, [userId, rewardAmount, consecutiveDays]);
            
            // 更新用户钱包余额
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description
                ) VALUES (?, 'reward', ?, ?)
            `, [userId, rewardAmount, description || '管理员手动添加签到奖励']);
            
            // 更新用户钱包余额
            await connection.query(`
                UPDATE user_wallets 
                SET balance = balance + ?, 
                    total_rewarded = total_rewarded + ?
                WHERE user_id = ?
            `, [rewardAmount, rewardAmount, userId]);
            
            await connection.commit();
            
            res.json({
                success: true,
                message: '手动签到添加成功',
                data: {
                    userId,
                    rewardAmount,
                    consecutiveDays
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error('手动添加签到失败:', error);
            res.status(500).json({
                success: false,
                message: '手动添加签到失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 删除用户签到记录
     */
    async deleteCheckin(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const checkinId = req.params.checkinId;
            
            // 获取签到记录信息
            const [checkinRows] = await connection.query(`
                SELECT * FROM user_checkins WHERE id = ?
            `, [checkinId]);
            
            if (checkinRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '签到记录不存在'
                });
            }
            
            const checkin = checkinRows[0];
            
            // 删除签到记录
            await connection.query(`
                DELETE FROM user_checkins WHERE id = ?
            `, [checkinId]);
            
            // 如果有奖励，需要从钱包中扣除
            if (parseFloat(checkin.reward_amount) > 0) {
                // 添加钱包交易记录
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deduction', ?, ?)
                `, [checkin.user_id, -parseFloat(checkin.reward_amount), '管理员删除签到记录']);
                
                // 更新用户钱包余额
                await connection.query(`
                    UPDATE user_wallets 
                    SET balance = balance - ?, 
                        total_rewarded = total_rewarded - ?
                    WHERE user_id = ?
                `, [parseFloat(checkin.reward_amount), parseFloat(checkin.reward_amount), checkin.user_id]);
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                message: '签到记录删除成功'
            });
        } catch (error) {
            await connection.rollback();
            console.error('删除签到记录失败:', error);
            res.status(500).json({
                success: false,
                message: '删除签到记录失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 修改签到配置
     */
    async updateCheckinConfig(req, res) {
        try {
            const { baseReward, consecutiveReward7, consecutiveReward30 } = req.body;
            
            // 更新配置
            await pool.query(`
                INSERT INTO system_configs (config_key, config_value, description)
                VALUES 
                    ('checkin_base_reward', ?, '基础签到奖励'),
                    ('checkin_consecutive_reward_7', ?, '连续签到7天额外奖励'),
                    ('checkin_consecutive_reward_30', ?, '连续签到30天额外奖励')
                ON DUPLICATE KEY UPDATE
                    config_value = VALUES(config_value)
            `, [baseReward, consecutiveReward7, consecutiveReward30]);
            
            res.json({
                success: true,
                message: '签到配置更新成功'
            });
        } catch (error) {
            console.error('更新签到配置失败:', error);
            res.status(500).json({
                success: false,
                message: '更新签到配置失败',
                error: error.message
            });
        }
    }
    
    /**
     * 获取签到配置
     */
    async getCheckinConfig(req, res) {
        try {
            const [rows] = await pool.query(`
                SELECT config_key, config_value, description
                FROM system_configs
                WHERE config_key IN (
                    'checkin_base_reward',
                    'checkin_consecutive_reward_7',
                    'checkin_consecutive_reward_30'
                )
            `);
            
            // 转换为对象
            const config = {};
            rows.forEach(row => {
                config[row.config_key] = row.config_value;
            });
            
            res.json({
                success: true,
                data: {
                    baseReward: config.checkin_base_reward || '0.1',
                    consecutiveReward7: config.checkin_consecutive_reward_7 || '0.1',
                    consecutiveReward30: config.checkin_consecutive_reward_30 || '0.2'
                },
                message: '获取签到配置成功'
            });
        } catch (error) {
            console.error('获取签到配置失败:', error);
            res.status(500).json({
                success: false,
                message: '获取签到配置失败',
                error: error.message
            });
        }
    }
}

module.exports = new AdminCheckinController();
