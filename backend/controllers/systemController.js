/**
 * 系统管理控制器
 * 处理系统配置、统计信息等管理功能
 */

const { pool } = require('../config/database');
const logger = require('../utils/logger');

class SystemController {
    /**
     * 获取系统概览统计信息
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getSystemOverview(req, res) {
        try {
            // 获取用户统计
            const userStatsQuery = `
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
                    COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d
                FROM users
            `;
            
            const userStats = await pool.query(userStatsQuery);
            
            // 获取挑战统计
            const challengeStatsQuery = `
                SELECT 
                    COUNT(*) as total_challenges,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_challenges_7d
                FROM vip_challenges
            `;
            
            const challengeStats = await pool.query(challengeStatsQuery);
            
            // 获取签到统计
            const checkinStatsQuery = `
                SELECT 
                    COUNT(*) as total_checkins,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as checkins_7d,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as checkins_30d
                FROM checkins
            `;
            
            const checkinStats = await pool.query(checkinStatsQuery);
            
            // 获取系统资源使用情况
            const systemInfo = {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform,
                timestamp: new Date().toISOString()
            };
            
            // 构建概览数据
            const overview = {
                users: {
                    total: userStats[0].total_users || 0,
                    newUsers7d: userStats[0].new_users_7d || 0,
                    newUsers30d: userStats[0].new_users_30d || 0,
                    activeUsers7d: userStats[0].active_users_7d || 0
                },
                challenges: {
                    total: challengeStats[0].total_challenges || 0,
                    completed: challengeStats[0].completed_challenges || 0,
                    active: challengeStats[0].active_challenges || 0,
                    new7d: challengeStats[0].new_challenges_7d || 0
                },
                checkins: {
                    total: checkinStats[0].total_checkins || 0,
                    last7d: checkinStats[0].checkins_7d || 0,
                    last30d: checkinStats[0].checkins_30d || 0
                },
                system: systemInfo
            };
            
            res.json({
                success: true,
                data: overview
            });
            
        } catch (error) {
            logger.error('获取系统概览失败', { error: error.message });
            res.status(500).json({ 
                success: false, 
                error: '获取系统概览失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取系统配置
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getSystemConfigs(req, res) {
        try {
            const query = `
                SELECT config_key, config_value, description, updated_at
                FROM system_configs
                ORDER BY config_key
            `;
            
            const configs = await pool.query(query);
            
            res.json({
                success: true,
                data: configs
            });
            
        } catch (error) {
            logger.error('获取系统配置失败', { error: error.message });
            res.status(500).json({ 
                success: false, 
                error: '获取系统配置失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 更新系统配置
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async updateSystemConfig(req, res) {
        try {
            const { configKey, configValue, description } = req.body;
            
            if (!configKey || configValue === undefined) {
                return res.status(400).json({
                    success: false,
                    error: '配置键和值不能为空'
                });
            }
            
            // 检查配置是否存在
            const checkQuery = `
                SELECT config_key FROM system_configs WHERE config_key = ?
            `;
            
            const existingConfig = await pool.query(checkQuery, [configKey]);
            
            if (existingConfig.length > 0) {
                // 更新现有配置
                const updateQuery = `
                    UPDATE system_configs 
                    SET config_value = ?, description = ?, updated_at = NOW()
                    WHERE config_key = ?
                `;
                
                await pool.query(updateQuery, [configValue, description || '', configKey]);
            } else {
                // 创建新配置
                const insertQuery = `
                    INSERT INTO system_configs (config_key, config_value, description, created_at, updated_at)
                    VALUES (?, ?, ?, NOW(), NOW())
                `;
                
                await pool.query(insertQuery, [configKey, configValue, description || '']);
            }
            
            res.json({
                success: true,
                message: '系统配置更新成功',
                data: {
                    configKey,
                    configValue,
                    description: description || ''
                }
            });
            
        } catch (error) {
            logger.error('更新系统配置失败', { error: error.message, body: req.body });
            res.status(500).json({ 
                success: false, 
                error: '更新系统配置失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取系统日志
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getSystemLogs(req, res) {
        try {
            const { page = 1, limit = 50, level, startDate, endDate } = req.query;
            
            // 构建查询条件
            let whereClause = 'WHERE 1=1';
            let queryParams = [];
            
            if (level) {
                whereClause += ' AND level = ?';
                queryParams.push(level);
            }
            
            if (startDate) {
                whereClause += ' AND created_at >= ?';
                queryParams.push(startDate);
            }
            
            if (endDate) {
                whereClause += ' AND created_at <= ?';
                queryParams.push(endDate);
            }
            
            // 计算偏移量
            const offset = (page - 1) * limit;
            
            // 获取日志列表
            const logsQuery = `
                SELECT id, level, message, details, created_at
                FROM system_logs 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const logs = await pool.query(logsQuery, [...queryParams, parseInt(limit), offset]);
            
            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM system_logs 
                ${whereClause}
            `;
            
            const countResult = await pool.query(countQuery, queryParams);
            const total = countResult[0].total;
            
            // 计算分页信息
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    logs: logs,
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
            logger.error('获取系统日志失败', { error: error.message });
            res.status(500).json({ 
                success: false, 
                error: '获取系统日志失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 清理系统日志
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async cleanSystemLogs(req, res) {
        try {
            const { days = 30 } = req.query;
            
            // 删除指定天数之前的日志
            const deleteQuery = `
                DELETE FROM system_logs 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
            `;
            
            const result = await pool.query(deleteQuery, [parseInt(days)]);
            
            res.json({
                success: true,
                message: `已清理${days}天前的系统日志`,
                data: {
                    deletedCount: result.affectedRows
                }
            });
            
        } catch (error) {
            logger.error('清理系统日志失败', { error: error.message });
            res.status(500).json({ 
                success: false, 
                error: '清理系统日志失败',
                message: '服务器内部错误'
            });
        }
    }
}

module.exports = new SystemController();
