/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResult:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [user, challenge, achievement, team]
 *           description: 搜索结果类型
 *         id:
 *           type: integer
 *           description: 结果ID
 *         title:
 *           type: string
 *           description: 结果标题
 *         description:
 *           type: string
 *           description: 结果描述
 *         relevance_score:
 *           type: number
 *           description: 相关度评分
 *         metadata:
 *           type: object
 *           description: 额外元数据
 *     
 *     SearchSuggestion:
 *       type: object
 *       properties:
 *         term:
 *           type: string
 *           description: 搜索建议词
 *         type:
 *           type: string
 *           enum: [user, challenge, achievement, team]
 *           description: 建议类型
 *         count:
 *           type: integer
 *           description: 相关结果数量
 *     
 *     TrendingSearch:
 *       type: object
 *       properties:
 *         term:
 *           type: string
 *           description: 热门搜索词
 *         search_count:
 *           type: integer
 *           description: 搜索次数
 *         trend:
 *           type: string
 *           enum: [rising, stable, declining]
 *           description: 趋势状态
 *         last_searched:
 *           type: string
 *           format: date-time
 *           description: 最后搜索时间
 *     
 *     GlobalSearchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 请求是否成功
 *         data:
 *           type: object
 *           properties:
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SearchResult'
 *             total_count:
 *               type: integer
 *               description: 总结果数
 *             search_time:
 *               type: number
 *               description: 搜索耗时(毫秒)
 *         message:
 *           type: string
 *           description: 响应消息
 */

const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();

// ==========================================
// 搜索和过滤API接口
// ==========================================

/**
 * @swagger
 * /api/search/global:
 *   get:
 *     summary: 全局搜索
 *     description: 在所有类型的内容中进行全局搜索
 *     tags: [搜索功能]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *         name: types
 *         schema:
 *           type: string
 *         description: 搜索类型，多个用逗号分隔
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [relevance, date, popularity]
 *           default: relevance
 *         description: 排序方式
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalSearchResponse'
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/global', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, type, page = 1, limit = 20 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: '搜索关键词至少需要2个字符'
            });
        }

        const searchQuery = `%${query.trim()}%`;
        const offset = (page - 1) * limit;
        const results = {};

        // 搜索用户
        if (!type || type === 'users') {
            const [userRows] = await pool.query(`
                SELECT 
                    u.id, u.username, u.created_at,
                    uw.balance,
                    COUNT(vc.id) as total_challenges,
                    COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_challenges
                FROM users u
                LEFT JOIN user_wallets uw ON u.id = uw.user_id
                LEFT JOIN vip_challenges vc ON u.id = vc.user_id
                WHERE u.username LIKE ? OR u.email LIKE ?
                GROUP BY u.id, u.username, u.created_at, uw.balance
                ORDER BY 
                    CASE WHEN u.username LIKE ? THEN 1 ELSE 2 END,
                    u.created_at DESC
                LIMIT ? OFFSET ?
            `, [searchQuery, searchQuery, query.trim(), limit, offset]);

            results.users = userRows.map(user => ({
                ...user,
                type: 'user',
                relevance_score: user.username.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
            }));
        }

        // 搜索VIP等级
        if (!type || type === 'vip_levels') {
            const [levelRows] = await pool.query(`
                SELECT 
                    id, name, description, deposit_amount, step_target, reward_amount,
                    icon, color, is_active
                FROM vip_levels
                WHERE name LIKE ? OR description LIKE ?
                ORDER BY deposit_amount ASC
                LIMIT ? OFFSET ?
            `, [searchQuery, searchQuery, limit, offset]);

            results.vip_levels = levelRows.map(level => ({
                ...level,
                type: 'vip_level',
                relevance_score: level.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
            }));
        }

        // 搜索挑战
        if (!type || type === 'challenges') {
            const [challengeRows] = await pool.query(`
                SELECT 
                    vc.id, vc.status, vc.current_steps, vc.step_target,
                    vc.created_at, vc.updated_at,
                    vl.name as level_name, vl.icon as level_icon, vl.color as level_color,
                    u.username
                FROM vip_challenges vc
                JOIN vip_levels vl ON vc.vip_level_id = vl.id
                JOIN users u ON vc.user_id = u.id
                WHERE vl.name LIKE ? OR u.username LIKE ?
                ORDER BY vc.created_at DESC
                LIMIT ? OFFSET ?
            `, [searchQuery, searchQuery, limit, offset]);

            results.challenges = challengeRows.map(challenge => ({
                ...challenge,
                type: 'challenge',
                relevance_score: challenge.level_name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
            }));
        }

        // 搜索成就
        if (!type || type === 'achievements') {
            const [achievementRows] = await pool.query(`
                SELECT 
                    id, name, description, icon, color, target_value, reward_type
                FROM achievements
                WHERE name LIKE ? OR description LIKE ? OR is_active = 1
                ORDER BY target_value DESC
                LIMIT ? OFFSET ?
            `, [searchQuery, searchQuery, limit, offset]);

            results.achievements = achievementRows.map(achievement => ({
                ...achievement,
                type: 'achievement',
                relevance_score: achievement.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
            }));
        }

        // 计算总结果数
        const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0);

        res.json({
            success: true,
            data: {
                results,
                total_results: totalResults,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalResults
                },
                query: query.trim()
            },
            message: '搜索完成'
        });

    } catch (error) {
        console.error('全局搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '搜索失败',
            error: error.message
        });
    }
});

// 用户搜索
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const { query, filters = {}, page = 1, limit = 20 } = req.body;

        const whereConditions = [];
        const queryParams = [];

        // 基础搜索
        if (query && query.trim().length >= 2) {
            whereConditions.push('(u.username LIKE ? OR u.email LIKE ?)');
            const searchQuery = `%${query.trim()}%`;
            queryParams.push(searchQuery, searchQuery);
        }

        // 应用过滤器
        if (filters.min_balance !== undefined) {
            whereConditions.push('uw.balance >= ?');
            queryParams.push(filters.min_balance);
        }

        if (filters.max_balance !== undefined) {
            whereConditions.push('uw.balance <= ?');
            queryParams.push(filters.max_balance);
        }

        if (filters.min_challenges !== undefined) {
            whereConditions.push('(SELECT COUNT(*) FROM vip_challenges WHERE user_id = u.id) >= ?');
            queryParams.push(filters.min_challenges);
        }

        if (filters.max_challenges !== undefined) {
            whereConditions.push('(SELECT COUNT(*) FROM vip_challenges WHERE user_id = u.id) <= ?');
            queryParams.push(filters.max_challenges);
        }

        if (filters.created_after) {
            whereConditions.push('u.created_at >= ?');
            queryParams.push(filters.created_after);
        }

        if (filters.created_before) {
            whereConditions.push('u.created_at <= ?');
            queryParams.push(filters.created_before);
        }

        if (filters.is_active !== undefined) {
            whereConditions.push('u.is_active = ?');
            queryParams.push(filters.is_active ? 1 : 0);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        // 获取用户总数
        const [countRows] = await pool.query(`
            SELECT COUNT(*) as total FROM users u
            LEFT JOIN user_wallets uw ON u.id = uw.user_id
            ${whereClause}
        `, queryParams);

        const total = countRows[0].total;

        // 获取用户列表
        const [userRows] = await pool.query(`
            SELECT 
                u.id, u.username, u.email, u.avatar, u.created_at, u.last_login,
                uw.balance, uw.frozen_balance,
                COUNT(vc.id) as total_challenges,
                COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_challenges,
                COUNT(CASE WHEN vc.status = 'active' THEN 1 END) as active_challenges,
                SUM(c.reward_amount) as total_checkin_rewards
            FROM users u
            LEFT JOIN user_wallets uw ON u.id = uw.user_id
            LEFT JOIN vip_challenges vc ON u.id = vc.user_id
            LEFT JOIN checkins c ON u.id = c.user_id
            ${whereClause}
            GROUP BY u.id, u.username, u.email, u.avatar, u.created_at, u.last_login, uw.balance, uw.frozen_balance
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        // 格式化用户数据
        const users = userRows.map(user => ({
            ...user,
            total_checkin_rewards: user.total_checkin_rewards || 0,
            challenge_success_rate: user.total_challenges > 0 
                ? Math.round((user.completed_challenges / user.total_challenges) * 100) 
                : 0
        }));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters_applied: filters
            },
            message: '用户搜索完成'
        });

    } catch (error) {
        console.error('用户搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '用户搜索失败',
            error: error.message
        });
    }
});

// 挑战搜索
router.get('/challenges', authenticateToken, async (req, res) => {
    try {
        const { query, filters = {}, page = 1, limit = 20 } = req.body;

        const whereConditions = [];
        const queryParams = [];

        // 基础搜索
        if (query && query.trim().length >= 2) {
            whereConditions.push('(vl.name LIKE ? OR u.username LIKE ?)');
            const searchQuery = `%${query.trim()}%`;
            queryParams.push(searchQuery, searchQuery);
        }

        // 应用过滤器
        if (filters.status) {
            whereConditions.push('vc.status = ?');
            queryParams.push(filters.status);
        }

        if (filters.min_deposit !== undefined) {
            whereConditions.push('vl.deposit_amount >= ?');
            queryParams.push(filters.min_deposit);
        }

        if (filters.max_deposit !== undefined) {
            whereConditions.push('vl.deposit_amount <= ?');
            queryParams.push(filters.max_deposit);
        }

        if (filters.min_steps !== undefined) {
            whereConditions.push('vl.step_target >= ?');
            queryParams.push(filters.min_steps);
        }

        if (filters.max_steps !== undefined) {
            whereConditions.push('vl.step_target <= ?');
            queryParams.push(filters.max_steps);
        }

        if (filters.created_after) {
            whereConditions.push('vc.created_at >= ?');
            queryParams.push(filters.created_after);
        }

        if (filters.created_before) {
            whereConditions.push('vc.created_at <= ?');
            queryParams.push(filters.created_before);
        }

        if (filters.user_id) {
            whereConditions.push('vc.user_id = ?');
            queryParams.push(filters.user_id);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        // 获取挑战总数
        const [countRows] = await pool.query(`
            SELECT COUNT(*) as total FROM vip_challenges vc
            JOIN vip_levels vl ON vc.vip_level_id = vl.id
            JOIN users u ON vc.user_id = u.id
            ${whereClause}
        `, queryParams);

        const total = countRows[0].total;

        // 获取挑战列表
        const [challengeRows] = await pool.query(`
            SELECT 
                vc.id, vc.status, vc.current_steps, vc.current_consecutive_days,
                vc.created_at, vc.updated_at, vc.completed_at,
                vl.id as level_id, vl.name as level_name, vl.icon as level_icon, 
                vl.color as level_color, vl.deposit_amount, vl.step_target, vl.reward_amount,
                u.id as user_id, u.username, u.avatar,
                CASE 
                    WHEN vc.status = 'completed' THEN '已完成'
                    WHEN vc.status = 'active' THEN '进行中'
                    WHEN vc.status = 'failed' THEN '已失败'
                    WHEN vc.status = 'cancelled' THEN '已取消'
                    ELSE '未知状态'
                END as status_text
            FROM vip_challenges vc
            JOIN vip_levels vl ON vc.vip_level_id = vl.id
            JOIN users u ON vc.user_id = u.id
            ${whereClause}
            ORDER BY vc.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        // 格式化挑战数据
        const challenges = challengeRows.map(challenge => ({
            ...challenge,
            progress_percentage: challenge.step_target > 0 
                ? Math.round((challenge.current_steps / challenge.step_target) * 100) 
                : 0,
            days_remaining: challenge.status === 'active' 
                ? Math.max(0, 30 - Math.floor((Date.now() - new Date(challenge.created_at)) / (1000 * 60 * 60 * 24)))
                : 0
        }));

        res.json({
            success: true,
            data: {
                challenges,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters_applied: filters
            },
            message: '挑战搜索完成'
        });

    } catch (error) {
        console.error('挑战搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '挑战搜索失败',
            error: error.message
        });
    }
});

// 成就搜索
router.get('/achievements', authenticateToken, async (req, res) => {
    try {
        const { query, filters = {}, page = 1, limit = 20 } = req.body;

        const whereConditions = [];
        const queryParams = [];

        // 基础搜索
        if (query && query.trim().length >= 2) {
            whereConditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchQuery = `%${query.trim()}%`;
            queryParams.push(searchQuery, searchQuery, searchQuery);
        }

        // 应用过滤器
        if (filters.category) {
            whereConditions.push('category = ?');
            queryParams.push(filters.category);
        }

        if (filters.min_points !== undefined) {
            whereConditions.push('points >= ?');
            queryParams.push(filters.min_points);
        }

        if (filters.max_points !== undefined) {
            whereConditions.push('points <= ?');
            queryParams.push(filters.max_points);
        }

        if (filters.is_active !== undefined) {
            whereConditions.push('is_active = ?');
            queryParams.push(filters.is_active ? 1 : 0);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        // 获取成就总数
        const [countRows] = await pool.query(`
            SELECT COUNT(*) as total FROM achievements ${whereClause}
        `, queryParams);

        const total = countRows[0].total;

        // 获取成就列表
        const [achievementRows] = await pool.query(`
            SELECT 
                id, name, description, icon, color, points, category,
                requirements, reward_type, reward_value, is_active, created_at
            FROM achievements 
            ${whereClause}
            ORDER BY points DESC, created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]);

        // 格式化成就数据
        const achievements = achievementRows.map(achievement => ({
            ...achievement,
            requirements: achievement.requirements ? JSON.parse(achievement.requirements) : null,
            reward: {
                type: achievement.reward_type,
                value: achievement.reward_value
            }
        }));

        res.json({
            success: true,
            data: {
                achievements,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters_applied: filters
            },
            message: '成就搜索完成'
        });

    } catch (error) {
        console.error('成就搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '成就搜索失败',
            error: error.message
        });
    }
});

// 获取搜索建议
router.get('/suggestions', authenticateToken, async (req, res) => {
    try {
        const { query, type = 'all', limit = 10 } = req.query;

        if (!query || query.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }

        const searchQuery = `%${query.trim()}%`;
        const suggestions = [];

        if (type === 'all' || type === 'users') {
            // 用户建议
            const [userSuggestions] = await pool.query(`
                SELECT username, 'user' as type FROM users 
                WHERE username LIKE ? 
                ORDER BY 
                    CASE WHEN username LIKE ? THEN 1 ELSE 2 END,
                    created_at DESC
                LIMIT ?
            `, [searchQuery, query.trim(), limit]);

            suggestions.push(...userSuggestions);
        }

        if (type === 'all' || type === 'vip_levels') {
            // VIP等级建议
            const [levelSuggestions] = await pool.query(`
                SELECT name, 'vip_level' as type FROM vip_levels 
                WHERE name LIKE ? AND is_active = 1
                ORDER BY deposit_amount ASC
                LIMIT ?
            `, [searchQuery, limit]);

            suggestions.push(...levelSuggestions);
        }

        if (type === 'all' || type === 'achievements') {
            // 成就建议
            const [achievementSuggestions] = await pool.query(`
                SELECT name, 'achievement' as type FROM achievements 
                WHERE name LIKE ? AND is_active = 1
                ORDER BY points DESC
                LIMIT ?
            `, [searchQuery, limit]);

            suggestions.push(...achievementSuggestions);
        }

        // 去重并限制总数
        const uniqueSuggestions = suggestions
            .filter((item, index, self) => 
                index === self.findIndex(t => t.name === item.name && t.type === item.type)
            )
            .slice(0, limit);

        res.json({
            success: true,
            data: {
                suggestions: uniqueSuggestions,
                query: query.trim()
            },
            message: '获取搜索建议成功'
        });

    } catch (error) {
        console.error('获取搜索建议失败:', error);
        res.status(500).json({
            success: false,
            message: '获取搜索建议失败',
            error: error.message
        });
    }
});

// 获取热门搜索
router.get('/trending', authenticateToken, async (req, res) => {
    try {
        const { period = '7d', limit = 10 } = req.query;

        let dateCondition = '';
        switch (period) {
            case '1d':
                dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
                break;
            case '7d':
                dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case '30d':
                dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            default:
                dateCondition = '';
        }

        // 获取热门搜索词（这里模拟，实际应该从搜索日志中统计）
        const trendingSearches = [
            { term: '健身挑战', count: 156, trend: 'up' },
            { term: 'VIP等级', count: 89, trend: 'up' },
            { term: '团队协作', count: 67, trend: 'stable' },
            { term: '成就系统', count: 45, trend: 'down' },
            { term: '签到奖励', count: 34, trend: 'up' }
        ].slice(0, limit);

        res.json({
            success: true,
            data: {
                trending_searches: trendingSearches,
                period,
                generated_at: new Date().toISOString()
            },
            message: '获取热门搜索成功'
        });

    } catch (error) {
        console.error('获取热门搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '获取热门搜索失败',
            error: error.message
        });
    }
});

module.exports = router;
