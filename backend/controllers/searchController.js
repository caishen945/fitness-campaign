/**
 * 搜索功能控制器
 * 处理全局搜索、搜索建议等搜索相关功能
 */

const { pool } = require('../config/database');
const logger = require('../utils/logger');

class SearchController {
    /**
     * 全局搜索
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async globalSearch(req, res) {
        try {
            const { q, type, page = 1, limit = 20 } = req.query;
            
            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '搜索关键词不能为空'
                });
            }
            
            const searchTerm = `%${q.trim()}%`;
            const offset = (page - 1) * limit;
            
            let results = {};
            let totalCount = 0;
            
            // 根据类型进行搜索
            if (!type || type === 'all' || type === 'users') {
                // 搜索用户
                const userQuery = `
                    SELECT id, username, email, avatar, created_at, 'user' as result_type
                    FROM users 
                    WHERE username LIKE ? OR email LIKE ?
                    LIMIT ? OFFSET ?
                `;
                
                const users = await pool.query(userQuery, [searchTerm, searchTerm, parseInt(limit), offset]);
                results.users = users;
                
                // 获取用户总数
                const userCountQuery = `
                    SELECT COUNT(*) as total
                    FROM users 
                    WHERE username LIKE ? OR email LIKE ?
                `;
                
                const userCount = await pool.query(userCountQuery, [searchTerm, searchTerm]);
                totalCount += userCount[0].total;
            }
            
            if (!type || type === 'all' || type === 'challenges') {
                // 搜索挑战
                const challengeQuery = `
                    SELECT id, title, description, reward_amount, status, created_at, 'challenge' as result_type
                    FROM vip_challenges 
                    WHERE title LIKE ? OR description LIKE ?
                    LIMIT ? OFFSET ?
                `;
                
                const challenges = await pool.query(challengeQuery, [searchTerm, searchTerm, parseInt(limit), offset]);
                results.challenges = challenges;
                
                // 获取挑战总数
                const challengeCountQuery = `
                    SELECT COUNT(*) as total
                    FROM vip_challenges 
                    WHERE title LIKE ? OR description LIKE ?
                `;
                
                const challengeCount = await pool.query(challengeCountQuery, [searchTerm, searchTerm]);
                totalCount += challengeCount[0].total;
            }
            
            if (!type || type === 'all' || type === 'achievements') {
                // 搜索成就
                const achievementQuery = `
                    SELECT id, name, description, reward_amount, created_at, 'achievement' as result_type
                    FROM achievements 
                    WHERE name LIKE ? OR description LIKE ?
                    LIMIT ? OFFSET ?
                `;
                
                const achievements = await pool.query(achievementQuery, [searchTerm, searchTerm, parseInt(limit), offset]);
                results.achievements = achievements;
                
                // 获取成就总数
                const achievementCountQuery = `
                    SELECT COUNT(*) as total
                    FROM achievements 
                    WHERE name LIKE ? OR description LIKE ?
                `;
                
                const achievementCount = await pool.query(achievementCountQuery, [searchTerm, searchTerm]);
                totalCount += achievementCount[0].total;
            }
            
            // 计算分页信息
            const totalPages = Math.ceil(totalCount / limit);
            
            // 记录搜索日志
            try {
                const logQuery = `
                    INSERT INTO search_logs (search_term, result_count, user_id, created_at)
                    VALUES (?, ?, ?, NOW())
                `;
                
                const userId = req.user ? req.user.id : null;
                await pool.query(logQuery, [q.trim(), totalCount, userId]);
            } catch (logError) {
                // 搜索日志记录失败不影响搜索结果
                logger.warn('搜索日志记录失败', { error: logError.message });
            }
            
            res.json({
                success: true,
                data: {
                    query: q.trim(),
                    results,
                    totalCount,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: totalCount,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            });
            
        } catch (error) {
            logger.error('全局搜索失败', { error: error.message, query: req.query });
            res.status(500).json({ 
                success: false, 
                error: '搜索失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取搜索建议
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getSearchSuggestions(req, res) {
        try {
            const { q, type = 'all' } = req.query;
            
            if (!q || q.trim().length === 0) {
                return res.json({
                    success: true,
                    data: {
                        suggestions: []
                    }
                });
            }
            
            const searchTerm = `%${q.trim()}%`;
            let suggestions = [];
            
            // 根据类型获取建议
            if (type === 'all' || type === 'users') {
                // 用户建议
                const userQuery = `
                    SELECT username, 'user' as type
                    FROM users 
                    WHERE username LIKE ?
                    LIMIT 5
                `;
                
                const userSuggestions = await pool.query(userQuery, [searchTerm]);
                suggestions.push(...userSuggestions);
            }
            
            if (type === 'all' || type === 'challenges') {
                // 挑战建议
                const challengeQuery = `
                    SELECT title as name, 'challenge' as type
                    FROM vip_challenges 
                    WHERE title LIKE ?
                    LIMIT 5
                `;
                
                const challengeSuggestions = await pool.query(challengeQuery, [searchTerm]);
                suggestions.push(...challengeSuggestions);
            }
            
            if (type === 'all' || type === 'achievements') {
                // 成就建议
                const achievementQuery = `
                    SELECT name, 'achievement' as type
                    FROM achievements 
                    WHERE name LIKE ?
                    LIMIT 5
                `;
                
                const achievementSuggestions = await pool.query(achievementQuery, [searchTerm]);
                suggestions.push(...achievementSuggestions);
            }
            
            // 去重并限制结果数量
            const uniqueSuggestions = suggestions
                .filter((item, index, self) => 
                    index === self.findIndex(t => t.name === item.name && t.type === item.type)
                )
                .slice(0, 10);
            
            res.json({
                success: true,
                data: {
                    suggestions: uniqueSuggestions
                }
            });
            
        } catch (error) {
            logger.error('获取搜索建议失败', { error: error.message, query: req.query });
            res.status(500).json({ 
                success: false, 
                error: '获取搜索建议失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取热门搜索
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getTrendingSearches(req, res) {
        try {
            const { days = 7, limit = 10 } = req.query;
            
            const query = `
                SELECT search_term, COUNT(*) as search_count
                FROM search_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY search_term
                ORDER BY search_count DESC
                LIMIT ?
            `;
            
            const trending = await pool.query(query, [parseInt(days), parseInt(limit)]);
            
            res.json({
                success: true,
                data: {
                    trending,
                    period: `${days}天`
                }
            });
            
        } catch (error) {
            logger.error('获取热门搜索失败', { error: error.message });
            res.status(500).json({ 
                success: false, 
                error: '获取热门搜索失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 获取搜索历史
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async getSearchHistory(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT search_term, result_count, created_at
                FROM search_logs 
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const history = await pool.query(query, [userId, parseInt(limit), offset]);
            
            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM search_logs 
                WHERE user_id = ?
            `;
            
            const countResult = await pool.query(countQuery, [userId]);
            const total = countResult[0].total;
            
            // 计算分页信息
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    history,
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
            logger.error('获取搜索历史失败', { error: error.message, userId: req.user.id });
            res.status(500).json({ 
                success: false, 
                error: '获取搜索历史失败',
                message: '服务器内部错误'
            });
        }
    }
    
    /**
     * 清除搜索历史
     * @param {Object} req - Express请求对象
     * @param {Object} res - Express响应对象
     */
    async clearSearchHistory(req, res) {
        try {
            const userId = req.user.id;
            
            const deleteQuery = `
                DELETE FROM search_logs 
                WHERE user_id = ?
            `;
            
            const result = await pool.query(deleteQuery, [userId]);
            
            res.json({
                success: true,
                message: '搜索历史已清除',
                data: {
                    deletedCount: result.affectedRows
                }
            });
            
        } catch (error) {
            logger.error('清除搜索历史失败', { error: error.message, userId: req.user.id });
            res.status(500).json({ 
                success: false, 
                error: '清除搜索历史失败',
                message: '服务器内部错误'
            });
        }
    }
}

module.exports = new SearchController();
