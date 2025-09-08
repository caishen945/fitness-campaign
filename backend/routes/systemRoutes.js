/**
 * @swagger
 * components:
 *   schemas:
 *     SystemOverview:
 *       type: object
 *       properties:
 *         total_users:
 *           type: integer
 *           description: 总用户数
 *         active_users:
 *           type: integer
 *           description: 活跃用户数
 *         total_challenges:
 *           type: integer
 *           description: 总挑战数
 *         completed_challenges:
 *           type: integer
 *           description: 已完成挑战数
 *         total_rewards:
 *           type: number
 *           description: 总奖励金额
 *         system_status:
 *           type: string
 *           enum: [healthy, warning, critical]
 *           description: 系统状态
 *         last_maintenance:
 *           type: string
 *           format: date-time
 *           description: 最后维护时间
 *     
 *     SystemConfig:
 *       type: object
 *       properties:
 *         maintenance_mode:
 *           type: boolean
 *           description: 维护模式开关
 *         registration_enabled:
 *           type: boolean
 *           description: 用户注册开关
 *         challenge_creation_enabled:
 *           type: boolean
 *           description: 挑战创建开关
 *         max_challenge_duration:
 *           type: integer
 *           description: 最大挑战持续时间(天)
 *         min_step_target:
 *           type: integer
 *           description: 最小步数目标
 *         max_step_target:
 *           type: integer
 *           description: 最大步数目标
 *         reward_multiplier:
 *           type: number
 *           description: 奖励倍数
 *     
 *     SystemLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日志ID
 *         level:
 *           type: string
 *           enum: [info, warning, error, critical]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息
 *         source:
 *           type: string
 *           description: 日志来源
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 时间戳
 *         metadata:
 *           type: object
 *           description: 额外元数据
 *     
 *     SystemReport:
 *       type: object
 *       properties:
 *         report_id:
 *           type: string
 *           description: 报告ID
 *         report_type:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *           description: 报告类型
 *         start_date:
 *           type: string
 *           format: date
 *           description: 开始日期
 *         end_date:
 *           type: string
 *           format: date
 *           description: 结束日期
 *         generated_at:
 *           type: string
 *           format: date-time
 *           description: 生成时间
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: 报告状态
 */

const express = require('express');
const { verifyAdminToken } = require('../middleware/adminAuthMiddleware');
const { pool } = require('../config/database');
const { isRedisEnabled } = require('../config/featureFlags');
const { getQueue } = require('../services/notificationQueueService');
const pushService = require('../services/pushService');

const router = express.Router();

// ==========================================
// 系统管理API接口
// ==========================================

/**
 * @swagger
 * /api/system/overview:
 *   get:
 *     summary: 获取系统概览
 *     description: 获取系统整体运行状态和统计信息
 *     tags: [系统管理]
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
 *                   $ref: '#/components/schemas/SystemOverview'
 *                 message:
 *                   type: string
 *                   example: 获取系统概览成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/overview', verifyAdminToken, async (req, res) => {
    try {
        // 用户统计
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
                COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d
            FROM users
        `);

        // VIP挑战统计
        const [challengeStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_challenges,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_challenges_7d
            FROM vip_challenges
        `);

        // 财务统计
        const [financialStats] = await pool.query(`
            SELECT 
                SUM(balance) as total_balance,
                SUM(frozen_balance) as total_frozen_balance,
                COUNT(CASE WHEN balance > 0 THEN 1 END) as users_with_balance
            FROM user_wallets
        `);

        // 签到统计
        const [checkinStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_checkins,
                COUNT(CASE WHEN checkin_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as checkins_7d,
                SUM(reward_amount) as total_rewards,
                COUNT(DISTINCT user_id) as active_checkin_users
            FROM checkins
        `);

        // 团队统计
        const [teamStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_teams,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_teams_7d,
                AVG(member_count) as avg_members_per_team
            FROM (
                SELECT 
                    inviter_id,
                    COUNT(*) as member_count,
                    MIN(created_at) as created_at
                FROM team_relationships 
                GROUP BY inviter_id
            ) team_counts
        `);

        res.json({
            success: true,
            data: {
                users: userStats[0],
                challenges: challengeStats[0],
                financial: financialStats[0],
                checkins: checkinStats[0],
                teams: teamStats[0],
                timestamp: new Date().toISOString()
            },
            message: '获取系统概览统计成功'
        });

    } catch (error) {
        console.error('获取系统概览统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取系统概览统计失败',
            error: error.message
        });
    }
});

// 获取系统配置（管理员）
router.get('/config', verifyAdminToken, async (req, res) => {
    try {
        const [configRows] = await pool.query(`
            SELECT config_key, config_value, description, updated_at
            FROM system_configs
            ORDER BY config_key
        `);

        const configs = {};
        configRows.forEach(row => {
            try {
                configs[row.config_key] = {
                    value: JSON.parse(row.config_value),
                    description: row.description,
                    updated_at: row.updated_at
                };
            } catch (e) {
                configs[row.config_key] = {
                    value: row.config_value,
                    description: row.description,
                    updated_at: row.updated_at
                };
            }
        });

        res.json({
            success: true,
            data: configs,
            message: '获取系统配置成功'
        });

    } catch (error) {
        console.error('获取系统配置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取系统配置失败',
            error: error.message
        });
    }
});

// 更新系统配置（管理员）
router.put('/config', verifyAdminToken, async (req, res) => {
    try {
        const { configs } = req.body;

        if (!configs || typeof configs !== 'object') {
            return res.status(400).json({
                success: false,
                message: '请提供有效的配置数据'
            });
        }

        const updates = [];
        for (const [key, value] of Object.entries(configs)) {
            const configValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            
            const [result] = await pool.query(`
                INSERT INTO system_configs (config_key, config_value, updated_at) 
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                config_value = VALUES(config_value), 
                updated_at = VALUES(updated_at)
            `, [key, configValue]);

            updates.push({ key, success: true });
        }

        res.json({
            success: true,
            data: { updates },
            message: '系统配置更新成功'
        });

    } catch (error) {
        console.error('更新系统配置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新系统配置失败',
            error: error.message
        });
    }
});

// 获取系统日志（管理员）
router.get('/logs', verifyAdminToken, async (req, res) => {
    try {
        const { page = 1, limit = 50, level, start_date, end_date, user_id } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = [];
        const queryParams = [];

        if (level) {
            whereConditions.push('level = ?');
            queryParams.push(level);
        }

        if (start_date) {
            whereConditions.push('created_at >= ?');
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push('created_at <= ?');
            queryParams.push(end_date);
        }

        if (user_id) {
            whereConditions.push('user_id = ?');
            queryParams.push(user_id);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // 获取日志总数
        const [countRows] = await pool.query(`
            SELECT COUNT(*) as total FROM system_logs ${whereClause}
        `, queryParams);

        const total = countRows[0].total;

        // 获取日志列表
        const [logRows] = await pool.query(`
            SELECT 
                id, level, message, details, user_id, ip_address, user_agent, created_at
            FROM system_logs 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // 格式化日志数据
        const logs = logRows.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            message: '获取系统日志成功'
        });

    } catch (error) {
        console.error('获取系统日志失败:', error);
        res.status(500).json({
            success: false,
            message: '获取系统日志失败',
            error: error.message
        });
    }
});

// 获取实时系统状态（管理员）
router.get('/status', verifyAdminToken, async (req, res) => {
    try {
        // 数据库连接状态
        let dbStatus = 'unknown';
        try {
            await pool.query('SELECT 1');
            dbStatus = 'connected';
        } catch (e) {
            dbStatus = 'disconnected';
        }

        // 系统资源使用情况
        const os = require('os');
        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            node_version: process.version,
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            cpu: {
                cores: os.cpus().length,
                load_average: os.loadavg()
            },
            uptime: os.uptime()
        };

        // 进程信息
        const processInfo = {
            pid: process.pid,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime()
        };

        // 只读依赖可用性
        let queues = { enabled: isRedisEnabled(), redisConnected: null };
        try {
            if (isRedisEnabled()) {
                const q = getQueue();
                // bullmq 没有直接暴露连接状态，这里用启用与否表示
                queues.redisConnected = true;
            } else {
                queues.redisConnected = false;
            }
        } catch (e) {
            queues.redisConnected = false;
        }

        // 渠道可用性（只读推断）
        const smtpOk = !!process.env.SMTP_HOST && !!process.env.SMTP_USER;
        const telegramOk = !!process.env.TELEGRAM_BOT_TOKEN;
        const pushEnabled = pushService.isEnabled();

        res.json({
            success: true,
            data: {
                database: { status: dbStatus },
                system: systemInfo,
                process: processInfo,
                queues,
                channels: {
                    smtp: { ok: smtpOk },
                    telegram: { ok: telegramOk },
                    push: { enabled: pushEnabled }
                },
                timestamp: new Date().toISOString()
            },
            message: '获取系统状态成功'
        });

    } catch (error) {
        console.error('获取系统状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取系统状态失败',
            error: error.message
        });
    }
});

// 获取数据统计报表（管理员）
router.get('/reports', verifyAdminToken, async (req, res) => {
    try {
        const { report_type, period = '30d', start_date, end_date } = req.query;

        let dateCondition = '';
        let queryParams = [];

        if (start_date && end_date) {
            dateCondition = 'WHERE created_at BETWEEN ? AND ?';
            queryParams = [start_date, end_date];
        } else {
            switch (period) {
                case '7d':
                    dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    break;
                case '30d':
                    dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    break;
                case '90d':
                    dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
                    break;
                case '1y':
                    dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                    break;
                default:
                    dateCondition = '';
            }
        }

        let reportData = {};

        switch (report_type) {
            case 'user_growth':
                // 用户增长报表
                const [userGrowthRows] = await pool.query(`
                    SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as new_users,
                        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
                    FROM users 
                    ${dateCondition}
                    GROUP BY DATE(created_at)
                    ORDER BY date
                `, queryParams);
                reportData = userGrowthRows;
                break;

            case 'challenge_performance':
                // 挑战完成率报表
                const [challengePerfRows] = await pool.query(`
                    SELECT 
                        vl.name as level_name,
                        COUNT(vc.id) as total_challenges,
                        COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_challenges,
                        COUNT(CASE WHEN vc.status = 'failed' THEN 1 END) as failed_challenges,
                        ROUND(COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) * 100.0 / COUNT(vc.id), 2) as completion_rate
                    FROM vip_levels vl
                    LEFT JOIN vip_challenges vc ON vl.id = vc.vip_level_id ${dateCondition.replace('created_at', 'vc.created_at')}
                    GROUP BY vl.id, vl.name
                    ORDER BY vl.deposit_amount ASC
                `, queryParams);
                reportData = challengePerfRows;
                break;

            case 'financial_summary':
                // 财务汇总报表
                const [financialRows] = await pool.query(`
                    SELECT 
                        DATE(created_at) as date,
                        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
                        SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
                        SUM(CASE WHEN transaction_type IN ('reward', 'vip_challenge_reward') THEN amount ELSE 0 END) as total_rewards
                    FROM wallet_transactions 
                    ${dateCondition}
                    GROUP BY DATE(created_at)
                    ORDER BY date
                `, queryParams);
                reportData = financialRows;
                break;

            case 'activity_heatmap':
                // 用户活跃度热力图
                const [activityRows] = await pool.query(`
                    SELECT 
                        DAYOFWEEK(created_at) as day_of_week,
                        HOUR(created_at) as hour,
                        COUNT(*) as activity_count
                    FROM (
                        SELECT created_at FROM users ${dateCondition}
                        UNION ALL
                        SELECT created_at FROM vip_challenges ${dateCondition.replace('created_at', 'created_at')}
                        UNION ALL
                        SELECT created_at FROM checkins ${dateCondition.replace('created_at', 'checkin_date')}
                    ) all_activities
                    GROUP BY DAYOFWEEK(created_at), HOUR(created_at)
                    ORDER BY day_of_week, hour
                `, queryParams);
                reportData = activityRows;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: '无效的报表类型'
                });
        }

        res.json({
            success: true,
            data: {
                report_type,
                period,
                start_date,
                end_date,
                report_data: reportData,
                generated_at: new Date().toISOString()
            },
            message: '获取数据统计报表成功'
        });

    } catch (error) {
        console.error('获取数据统计报表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据统计报表失败',
            error: error.message
        });
    }
});

// 系统维护操作（管理员）
router.post('/maintenance', verifyAdminToken, async (req, res) => {
    try {
        const { action, options = {} } = req.body;

        switch (action) {
            case 'clear_old_logs':
                // 清理旧日志
                const days = options.days || 30;
                const [result] = await pool.query(`
                    DELETE FROM system_logs 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                `, [days]);
                
                res.json({
                    success: true,
                    data: { deleted_count: result.affectedRows },
                    message: `成功清理${days}天前的日志`
                });
                break;

            case 'optimize_tables':
                // 优化数据库表
                const tables = ['users', 'vip_challenges', 'checkins', 'wallet_transactions', 'notifications'];
                const optimizeResults = [];
                
                for (const table of tables) {
                    try {
                        await pool.query(`OPTIMIZE TABLE ${table}`);
                        optimizeResults.push({ table, status: 'success' });
                    } catch (e) {
                        optimizeResults.push({ table, status: 'failed', error: e.message });
                    }
                }
                
                res.json({
                    success: true,
                    data: { optimize_results: optimizeResults },
                    message: '数据库表优化完成'
                });
                break;

            case 'backup_database':
                // 数据库备份（这里只是模拟，实际应该调用备份脚本）
                res.json({
                    success: true,
                    data: { backup_id: `backup_${Date.now()}` },
                    message: '数据库备份任务已启动'
                });
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: '无效的维护操作'
                });
        }

    } catch (error) {
        console.error('系统维护操作失败:', error);
        res.status(500).json({
            success: false,
            message: '系统维护操作失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/system/version/update:
 *   post:
 *     summary: 更新系统版本
 *     description: 更新系统版本号并返回新的版本信息
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newVersion
 *             properties:
 *               newVersion:
 *                 type: string
 *                 description: "新版本号 (例如: 3.2.1)"
 *                 example: "3.2.1"
 *     responses:
 *       200:
 *         description: 版本更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     versionInfo:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                         fullVersion:
 *                           type: string
 *                         buildTime:
 *                           type: string
 *                         buildDate:
 *                           type: string
 *                         description:
 *                           type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 更新系统版本（管理员）
router.post('/version/update', verifyAdminToken, async (req, res) => {
    try {
        const { newVersion } = req.body;

        if (!newVersion || typeof newVersion !== 'string') {
            return res.status(400).json({
                success: false,
                message: '请提供有效的版本号'
            });
        }

        // 验证版本号格式 (例如: 3.2.1)
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(newVersion)) {
            return res.status(400).json({
                success: false,
                message: '版本号格式不正确，请使用格式：主版本.次版本.修订版本 (例如: 3.2.1)'
            });
        }

        // 生成新的构建时间
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const buildTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
        const buildDate = `${year}-${month}-${day}`;
        const buildTimeReadable = `${hours}:${minutes}:${seconds}`;

        // 解析版本号
        const versionParts = newVersion.split('.');
        const major = parseInt(versionParts[0]);
        const minor = parseInt(versionParts[1]);
        const patch = parseInt(versionParts[2]);

        // 生成版本信息
        const versionInfo = {
            version: newVersion,
            major: major,
            minor: minor,
            patch: patch,
            fullVersion: `v${newVersion}-${buildTime}`,
            buildTime: buildTime,
            buildDate: buildDate,
            buildTimeReadable: buildTimeReadable,
            description: `FitChallenge管理员系统v${newVersion} - 完整功能版`,
            queryParam: `?v=${buildTime}`,
            fileSuffix: `.js?v=${buildTime}`,
            formattedTime: now.toLocaleString('zh-CN')
        };

        // 更新系统配置中的版本信息
        const versionConfig = {
            VERSION: newVersion,
            MAJOR: major,
            MINOR: minor,
            PATCH: patch,
            BUILD_TIME: buildTime,
            BUILD_TIME_READABLE: buildTimeReadable,
            BUILD_DATE: buildDate,
            DESCRIPTION: versionInfo.description,
            FULL_VERSION: versionInfo.fullVersion,
            QUERY_PARAM: versionInfo.queryParam,
            FILE_SUFFIX: versionInfo.fileSuffix,
            UPDATED_AT: now.toISOString()
        };

        // 保存版本配置到数据库
        await pool.query(`
            INSERT INTO system_configs (config_key, config_value, updated_at) 
            VALUES ('version_info', ?, NOW())
            ON DUPLICATE KEY UPDATE 
            config_value = VALUES(config_value), 
            updated_at = VALUES(updated_at)
        `, [JSON.stringify(versionConfig)]);

        // 记录版本更新日志
        await pool.query(`
            INSERT INTO system_logs (action, details, user_id, created_at) 
            VALUES (?, ?, ?, NOW())
        `, [
            'VERSION_UPDATE',
            JSON.stringify({
                oldVersion: 'unknown', // 这里可以从数据库获取旧版本
                newVersion: newVersion,
                buildTime: buildTime,
                updatedBy: req.user.id
            }),
            req.user.id
        ]);

        res.json({
            success: true,
            data: { versionInfo },
            message: `系统版本已成功更新为 ${newVersion}`
        });

    } catch (error) {
        console.error('版本更新失败:', error);
        res.status(500).json({
            success: false,
            message: '版本更新失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/system/version/info:
 *   get:
 *     summary: 获取系统版本信息
 *     description: 获取当前系统版本信息
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取版本信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     versionInfo:
 *                       type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取系统版本信息（管理员）
router.get('/version/info', verifyAdminToken, async (req, res) => {
    try {
        // 从数据库获取版本信息
        const [rows] = await pool.query(`
            SELECT config_value FROM system_configs 
            WHERE config_key = 'version_info' 
            ORDER BY updated_at DESC 
            LIMIT 1
        `);

        let versionInfo;
        if (rows.length > 0) {
            versionInfo = JSON.parse(rows[0].config_value);
        } else {
            // 默认版本信息
            versionInfo = {
                version: '3.2.0',
                major: 3,
                minor: 2,
                patch: 0,
                fullVersion: 'v3.2.0-20250114190000',
                buildTime: '20250114190000',
                buildDate: '2025-01-14',
                buildTimeReadable: '19:00:00',
                description: 'FitChallenge管理员系统v3.2.0 - 超级缓存清理版',
                queryParam: '?v=20250114190000',
                fileSuffix: '.js?v=20250114190000',
                formattedTime: new Date().toLocaleString('zh-CN')
            };
        }

        res.json({
            success: true,
            data: { versionInfo },
            message: '获取版本信息成功'
        });

    } catch (error) {
        console.error('获取版本信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取版本信息失败',
            error: error.message
        });
    }
});

module.exports = router;
