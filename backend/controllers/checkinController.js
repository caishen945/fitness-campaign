const { pool } = require('../config/database');
const achievementService = require('../services/achievementService');

class CheckinController {
    /**
     * 获取用户签到信息
     */
    async getUserCheckinInfo(req, res) {
        try {
            const userId = req.user.id;
            
            // 获取用户签到记录
            const [checkinRows] = await pool.query(`
                SELECT * FROM user_checkins 
                WHERE user_id = ? 
                ORDER BY checkin_date DESC
            `, [userId]);
            
            // 获取当前日期
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // 检查今天是否已签到
            const hasCheckedToday = checkinRows.some(record => {
                const checkinDate = new Date(record.checkin_date);
                checkinDate.setHours(0, 0, 0, 0);
                return checkinDate.getTime() === today.getTime();
            });
            
            // 计算连续签到天数
            let consecutiveDays = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            // 如果今天已签到，从昨天开始计算
            if (hasCheckedToday) {
                currentDate.setDate(currentDate.getDate() - 1);
            }
            
            // 按日期排序的签到记录
            const sortedRecords = [...checkinRows].sort((a, b) => 
                new Date(b.checkin_date) - new Date(a.checkin_date)
            );
            
            // 计算连续签到天数
            for (let i = 0; i < sortedRecords.length; i++) {
                const recordDate = new Date(sortedRecords[i].checkin_date);
                recordDate.setHours(0, 0, 0, 0);
                
                const expectedDate = new Date(currentDate);
                
                if (recordDate.getTime() === expectedDate.getTime()) {
                    consecutiveDays++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break;
                }
            }
            
            // 计算本月签到天数
            const thisMonth = today.getMonth();
            const thisYear = today.getFullYear();
            const monthlyCheckins = checkinRows.filter(record => {
                const recordDate = new Date(record.checkin_date);
                return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
            }).length;
            
            // 计算累计奖励
            const totalReward = checkinRows.reduce((sum, record) => sum + parseFloat(record.reward_amount), 0);
            
            // 获取签到日历数据（当月）
            const firstDay = new Date(thisYear, thisMonth, 1);
            const lastDay = new Date(thisYear, thisMonth + 1, 0);
            
            // 获取该月的签到记录
            const [calendarCheckins] = await pool.query(`
                SELECT DATE(checkin_date) as date 
                FROM user_checkins 
                WHERE user_id = ? 
                AND checkin_date BETWEEN ? AND ?
            `, [userId, firstDay, lastDay]);
            
            // 将签到日期转换为日期字符串集合
            const checkinDates = calendarCheckins.map(row => row.date);
            
            // 构建日历数据
            const calendarData = [];
            
            // 获取该月第一天是星期几（0是星期日，6是星期六）
            const firstDayOfWeek = firstDay.getDay();
            
            // 添加空白天数
            for (let i = 0; i < firstDayOfWeek; i++) {
                calendarData.push({
                    day: 0,
                    isChecked: false,
                    isToday: false
                });
            }
            
            // 添加该月的日期
            const currentToday = new Date();
            currentToday.setHours(0, 0, 0, 0);
            
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const currentDate = new Date(thisYear, thisMonth, day);
                const dateString = currentDate.toISOString().split('T')[0];
                
                calendarData.push({
                    day,
                    isChecked: checkinDates.includes(dateString),
                    isToday: currentDate.getTime() === currentToday.getTime()
                });
            }
            
            res.json({
                success: true,
                data: {
                    hasCheckedToday,
                    consecutiveDays,
                    monthlyCheckins,
                    totalReward: totalReward.toFixed(2),
                    calendarData
                },
                message: '获取签到信息成功'
            });
        } catch (error) {
            console.error('获取签到信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取签到信息失败',
                error: error.message
            });
        }
    }
    
    /**
     * 用户签到
     */
    async checkin(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            
            // 检查今天是否已签到
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const [existingCheckins] = await connection.query(`
                SELECT * FROM user_checkins 
                WHERE user_id = ? 
                AND DATE(checkin_date) = DATE(NOW())
            `, [userId]);
            
            if (existingCheckins.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '今天已经签到过了'
                });
            }
            
            // 获取连续签到天数
            const [checkinRows] = await connection.query(`
                SELECT * FROM user_checkins 
                WHERE user_id = ? 
                ORDER BY checkin_date DESC
            `, [userId]);
            
            let consecutiveDays = 0;
            let lastCheckinDate = null;
            
            if (checkinRows.length > 0) {
                lastCheckinDate = new Date(checkinRows[0].checkin_date);
                lastCheckinDate.setHours(0, 0, 0, 0);
                
                // 检查昨天是否签到
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                
                if (lastCheckinDate.getTime() === yesterday.getTime()) {
                    // 昨天签到了，连续签到天数+1
                    consecutiveDays = checkinRows[0].consecutive_days + 1;
                } else {
                    // 昨天没签到，连续签到重置为1
                    consecutiveDays = 1;
                }
            } else {
                // 第一次签到
                consecutiveDays = 1;
            }
            
            // 计算奖励金额 (基础奖励 + 连续签到奖励)
            let rewardAmount = 0.1; // 基础奖励
            
            // 连续签到奖励
            if (consecutiveDays >= 7) {
                rewardAmount += 0.1; // 连续7天额外奖励
            }
            if (consecutiveDays >= 30) {
                rewardAmount += 0.2; // 连续30天额外奖励
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
                ) VALUES (?, 'reward', ?, '每日签到奖励')
            `, [userId, rewardAmount]);
            
            // 更新用户钱包余额
            await connection.query(`
                UPDATE user_wallets 
                SET balance = balance + ?, 
                    total_rewarded = total_rewarded + ?
                WHERE user_id = ?
            `, [rewardAmount, rewardAmount, userId]);
            
            await connection.commit();
            
            // 触发成就检查
            try {
                await achievementService.updateUserAchievementProgress(userId);
                const newAchievements = await achievementService.checkAndTriggerAchievements(userId);
                
                if (newAchievements.length > 0) {
                    console.log(`🎉 用户 ${userId} 签到后完成 ${newAchievements.length} 个新成就`);
                }
            } catch (achievementError) {
                console.error('成就检查失败:', achievementError);
                // 不影响签到流程
            }
            
            res.json({
                success: true,
                data: {
                    rewardAmount,
                    consecutiveDays
                },
                message: `签到成功！获得 ${rewardAmount.toFixed(2)} USDT 奖励`
            });
        } catch (error) {
            await connection.rollback();
            console.error('签到失败:', error);
            res.status(500).json({
                success: false,
                message: '签到失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
}

// 导出控制器实例
module.exports = new CheckinController();
