/**
 * 通知系统控制器
 * 处理用户通知相关的业务逻辑
 */

const { pool } = require('../config/database');
const logger = require('../utils/logger');

class NotificationController {
    /**
     * 获取用户通知列表
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, type, isRead } = req.query;
            
            // 构建查询条件
            let whereClause = 'WHERE user_id = ?';
            let queryParams = [userId];
            
            if (type) {
                whereClause += ' AND type = ?';
                queryParams.push(type);
            }
            
            if (isRead !== undefined) {
                whereClause += ' AND is_read = ?';
                queryParams.push(isRead === 'true');
            }
            
            // 计算偏移量
            const offset = (page - 1) * limit;
            
            // 获取通知列表
            const notificationsQuery = `
                SELECT id, type, title, content, data, is_read, created_at, updated_at
                FROM notifications 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const notifications = await pool.query(notificationsQuery, [...queryParams, parseInt(limit), offset]);
            
            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM notifications 
                ${whereClause}
            `;
            
            const countResult = await pool.query(countQuery, queryParams);
            const total = countResult[0].total;
            
            // 计算分页信息
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    notifications: notifications,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            });
            
        } catch (error) {
            logger.error('获取用户通知列表失败', { error: error.message, userId: req.user.id });
            res.status(500).json({ 
                success: false, 
                error: '获取通知列表失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取用户未读通知数量
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            
            const query = `
                SELECT COUNT(*) as count
                FROM notifications 
                WHERE user_id = ? AND is_read = false
            `;
            
            const result = await pool.query(query, [userId]);
            const unreadCount = result[0].count;
            
            res.json({
                success: true,
                data: {
                    unreadCount: unreadCount
                }
            });
            
        } catch (error) {
            logger.error('获取未读通知数量失败', { error: error.message, userId: req.user.id });
            res.status(500).json({ 
                success: false, 
                error: '获取未读通知数量失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 标记通知为已读
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;
            
            // 验证通知是否存在且属于当前用户
            const checkQuery = `
                SELECT id FROM notifications 
                WHERE id = ? AND user_id = ?
            `;
            
            const checkResult = await pool.query(checkQuery, [notificationId, userId]);
            
            if (checkResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '通知不存在或无权限访问'
                });
            }
            
            // 更新通知状态
            const updateQuery = `
                UPDATE notifications 
                SET is_read = true, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;
            
            await pool.query(updateQuery, [notificationId, userId]);
            
            res.json({
                success: true,
                message: '通知已标记为已读'
            });
            
        } catch (error) {
            logger.error('标记通知为已读失败', { error: error.message, userId: req.user.id, notificationId: req.params.id });
            res.status(500).json({ 
                success: false, 
                error: '标记通知失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 创建新通知
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async createNotification(req, res) {
        try {
            const { userId, type, title, content, data } = req.body;
            
            // 验证必填字段
            if (!userId || !type || !title || !content) {
                return res.status(400).json({
                    success: false,
                    error: '缺少必填字段',
                    required: ['userId', 'type', 'title', 'content']
                });
            }
            
            // 验证通知类型
            const validTypes = ['system', 'challenge', 'achievement', 'reward', 'reminder', 'other'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的通知类型',
                    validTypes
                });
            }
            
            const insertQuery = `
                INSERT INTO notifications (user_id, type, title, content, data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const result = await pool.query(insertQuery, [userId, type, title, content, JSON.stringify(data || {})]);
            
            res.status(201).json({
                success: true,
                message: '通知创建成功',
                data: {
                    id: result.insertId,
                    userId,
                    type,
                    title,
                    content,
                    data: data || {}
                }
            });
            
        } catch (error) {
            logger.error('创建通知失败', { error: error.message, body: req.body });
            res.status(500).json({ 
                success: false, 
                error: '创建通知失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 删除通知
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;
            
            // 验证通知是否存在且属于当前用户
            const checkQuery = `
                SELECT id FROM notifications 
                WHERE id = ? AND user_id = ?
            `;
            
            const checkResult = await pool.query(checkQuery, [notificationId, userId]);
            
            if (checkResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '通知不存在或无权限删除'
                });
            }
            
            // 删除通知
            const deleteQuery = `
                DELETE FROM notifications 
                WHERE id = ? AND user_id = ?
            `;
            
            await pool.query(deleteQuery, [notificationId, userId]);
            
            res.json({
                success: true,
                message: '通知删除成功'
            });
            
        } catch (error) {
            logger.error('删除通知失败', { error: error.message, userId: req.user.id, notificationId: req.params.id });
            res.status(500).json({ 
                success: false, 
                error: '删除通知失败',
                message: '服务器内部错误'
            });
        }
    }
}

module.exports = new NotificationController();
