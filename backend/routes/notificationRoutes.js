/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 通知ID
 *         type:
 *           type: string
 *           enum: [system, challenge, achievement, reward, reminder, other]
 *           description: 通知类型
 *         title:
 *           type: string
 *           description: 通知标题
 *         content:
 *           type: string
 *           description: 通知内容
 *         data:
 *           type: object
 *           description: 通知相关数据
 *         is_read:
 *           type: boolean
 *           description: 是否已读
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *     
 *     NotificationSettings:
 *       type: object
 *       properties:
 *         email_notifications:
 *           type: boolean
 *           description: 邮件通知开关
 *         sms_notifications:
 *           type: boolean
 *           description: 短信通知开关
 *         push_notifications:
 *           type: boolean
 *           description: 推送通知开关
 *         challenge_notifications:
 *           type: boolean
 *           description: 挑战相关通知
 *         achievement_notifications:
 *           type: boolean
 *           description: 成就相关通知
 *         reward_notifications:
 *           type: boolean
 *           description: 奖励相关通知
 *         system_notifications:
 *           type: boolean
 *           description: 系统通知
 *         reminder_notifications:
 *           type: boolean
 *           description: 提醒通知
 *     
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: 当前页码
 *         limit:
 *           type: integer
 *           description: 每页数量
 *         total:
 *           type: integer
 *           description: 总数量
 *         pages:
 *           type: integer
 *           description: 总页数
 */

const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();

// ==========================================
// 通知系统API接口
// ==========================================

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取用户通知列表
 *     description: 获取当前登录用户的通知列表，支持分页和筛选
 *     tags: [通知系统]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, challenge, achievement, reward, reminder, other]
 *         description: 通知类型筛选
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: 已读状态筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 message:
 *                   type: string
 *                   example: 获取通知列表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
// 获取用户通知列表
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, read } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = ['user_id = ?'];
        const queryParams = [userId];

        if (read !== undefined) {
            whereConditions.push('is_read = ?');
            queryParams.push(read === 'true' ? 1 : 0);
        }

        // 获取通知总数
        const [countRows] = await pool.query(`
            SELECT COUNT(*) as total FROM notifications 
            WHERE ${whereConditions.join(' AND ')}
        `, queryParams);

        const total = countRows[0].total;

        // 获取通知列表
        const [notificationRows] = await pool.query(`
            SELECT 
                id, title, message, is_read, created_at
            FROM notifications 
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // 格式化通知数据
        const notifications = notificationRows.map(notification => ({
            ...notification,
            content: notification.message, // 将message字段映射为content
            is_read: Boolean(notification.is_read)
        }));

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            message: '获取通知列表成功'
        });

    } catch (error) {
        console.error('获取通知列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取通知列表失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量
 *     description: 获取当前登录用户的未读通知数量
 *     tags: [通知系统]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     unread_count:
 *                       type: integer
 *                       description: 未读通知数量
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: 获取未读通知数量成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
// 获取未读通知数量
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [countRows] = await pool.query(`
            SELECT COUNT(*) as count FROM notifications 
            WHERE user_id = ? AND is_read = 0
        `, [userId]);

        res.json({
            success: true,
            data: {
                unread_count: countRows[0].count
            },
            message: '获取未读通知数量成功'
        });

    } catch (error) {
        console.error('获取未读通知数量失败:', error);
        res.status(500).json({
            success: false,
            message: '获取未读通知数量失败',
            error: error.message
        });
    }
});

// 标记通知为已读
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const [result] = await pool.query(`
            UPDATE notifications 
            SET is_read = 1, updated_at = NOW() 
            WHERE id = ? AND user_id = ?
        `, [notificationId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '通知不存在或无权限'
            });
        }

        res.json({
            success: true,
            message: '通知已标记为已读'
        });

    } catch (error) {
        console.error('标记通知已读失败:', error);
        res.status(500).json({
            success: false,
            message: '标记通知已读失败',
            error: error.message
        });
    }
});

// 批量标记通知为已读
router.put('/batch-read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { notification_ids, mark_all = false } = req.body;

        if (mark_all) {
            // 标记所有通知为已读
            await pool.query(`
                UPDATE notifications 
                SET is_read = 1, updated_at = NOW() 
                WHERE user_id = ?
            `, [userId]);
        } else if (notification_ids && Array.isArray(notification_ids)) {
            // 标记指定通知为已读
            if (notification_ids.length > 0) {
                const placeholders = notification_ids.map(() => '?').join(',');
                await pool.query(`
                    UPDATE notifications 
                    SET is_read = 1, updated_at = NOW() 
                    WHERE id IN (${placeholders}) AND user_id = ?
                `, [...notification_ids, userId]);
            }
        } else {
            return res.status(400).json({
                success: false,
                message: '请提供要标记的通知ID列表或设置mark_all为true'
            });
        }

        res.json({
            success: true,
            message: '批量标记通知已读成功'
        });

    } catch (error) {
        console.error('批量标记通知已读失败:', error);
        res.status(500).json({
            success: false,
            message: '批量标记通知已读失败',
            error: error.message
        });
    }
});

// 删除通知
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const [result] = await pool.query(`
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        `, [notificationId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '通知不存在或无权限'
            });
        }

        res.json({
            success: true,
            message: '通知删除成功'
        });

    } catch (error) {
        console.error('删除通知失败:', error);
        res.status(500).json({
            success: false,
            message: '删除通知失败',
            error: error.message
        });
    }
});

// 批量删除通知
router.delete('/batch', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { notification_ids, delete_all = false, delete_read = false } = req.body;

        if (delete_all) {
            // 删除所有通知
            await pool.query(`
                DELETE FROM notifications WHERE user_id = ?
            `, [userId]);
        } else if (delete_read) {
            // 删除所有已读通知
            await pool.query(`
                DELETE FROM notifications WHERE user_id = ? AND is_read = 1
            `, [userId]);
        } else if (notification_ids && Array.isArray(notification_ids)) {
            // 删除指定通知
            if (notification_ids.length > 0) {
                const placeholders = notification_ids.map(() => '?').join(',');
                await pool.query(`
                    DELETE FROM notifications 
                    WHERE id IN (${placeholders}) AND user_id = ?
                `, [...notification_ids, userId]);
            }
        } else {
            return res.status(400).json({
                success: false,
                message: '请提供要删除的通知ID列表或设置删除选项'
            });
        }

        res.json({
            success: true,
            message: '批量删除通知成功'
        });

    } catch (error) {
        console.error('批量删除通知失败:', error);
        res.status(500).json({
            success: false,
            message: '批量删除通知失败',
            error: error.message
        });
    }
});

// 获取通知设置
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [settingsRows] = await pool.query(`
            SELECT 
                notification_email, notification_sms, notification_push,
                email_frequency, sms_frequency, push_frequency
            FROM user_settings WHERE user_id = ?
        `, [userId]);

        let settings = settingsRows[0];
        
        // 如果没有设置记录，创建默认设置
        if (!settings) {
            const defaultSettings = {
                notification_email: true,
                notification_sms: false,
                notification_push: true,
                email_frequency: 'daily',
                sms_frequency: 'never',
                push_frequency: 'immediate'
            };

            await pool.query(`
                INSERT INTO user_settings (user_id, notification_email, notification_sms, 
                notification_push, email_frequency, sms_frequency, push_frequency) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, defaultSettings.notification_email, defaultSettings.notification_sms,
                defaultSettings.notification_push, defaultSettings.email_frequency,
                defaultSettings.sms_frequency, defaultSettings.push_frequency
            ]);

            settings = defaultSettings;
        }

        res.json({
            success: true,
            data: settings,
            message: '获取通知设置成功'
        });

    } catch (error) {
        console.error('获取通知设置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取通知设置失败',
            error: error.message
        });
    }
});

// 更新通知设置
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // 验证设置值
        const validSettings = {
            notification_email: 'boolean',
            notification_sms: 'boolean',
            notification_push: 'boolean',
            email_frequency: ['never', 'daily', 'weekly'],
            sms_frequency: ['never', 'daily', 'weekly'],
            push_frequency: ['never', 'immediate', 'daily']
        };

        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (validSettings[key]) {
                if (Array.isArray(validSettings[key])) {
                    if (validSettings[key].includes(value)) {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                } else if (validSettings[key] === 'boolean') {
                    if (typeof value === 'boolean') {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                }
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有提供有效的设置字段'
            });
        }

        updateValues.push(userId);

        // 检查是否已有设置记录
        const [existingRows] = await pool.query(`
            SELECT id FROM user_settings WHERE user_id = ?
        `, [userId]);

        if (existingRows.length > 0) {
            // 更新现有设置
            await pool.query(`
                UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?
            `, updateValues);
        } else {
            // 创建新设置记录
            const allFields = Object.keys(validSettings);
            const allValues = allFields.map(field => updateData[field] || getDefaultNotificationValue(field));
            allValues.push(userId);

            await pool.query(`
                INSERT INTO user_settings (${allFields.join(', ')}, user_id) VALUES (${allFields.map(() => '?').join(', ')})
            `, allValues);
        }

        res.json({
            success: true,
            message: '通知设置更新成功'
        });

    } catch (error) {
        console.error('更新通知设置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新通知设置失败',
            error: error.message
        });
    }
});

// 获取默认通知设置值
function getDefaultNotificationValue(setting) {
    const defaults = {
        notification_email: true,
        notification_sms: false,
        notification_push: true,
        email_frequency: 'daily',
        sms_frequency: 'never',
        push_frequency: 'immediate'
    };
    return defaults[setting] || null;
}

module.exports = router;
