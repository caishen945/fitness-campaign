const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const { 
    securityHeaders, 
    generalLimiter, 
    authLimiter, 
    apiLimiter,
    requestLogger 
} = require('./middleware/securityMiddleware');
require('dotenv').config();

// 导入错误处理中间件和日志模块
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const userService = require('./services/userService');
const stepService = require('./services/stepService');
const telegramService = require('./services/telegramService');
const telegramPolling = require('./services/telegramPolling');

// 导入管理路由
const vipLevelRoutes = require('./routes/vipLevelRoutes');
const vipChallengeRoutes = require('./routes/vipChallengeRoutes');
const userRoutes = require('./routes/userRoutes');
const userVipLevelRoutes = require('./routes/userVipLevelRoutes');
const userVipChallengeRoutes = require('./routes/userVipChallengeRoutes');
const walletRoutes = require('./routes/walletRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const adminCheckinRoutes = require('./routes/adminCheckinRoutes');
const pkChallengeRoutes = require('./routes/pkChallengeRoutes');
const adminPkChallengeRoutes = require('./routes/adminPkChallengeRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// 导入用户认证路由
const authRoutes = require('./routes/authRoutes');

// 导入管理员认证路由
const adminAuthRoutes = require('./routes/adminAuthRoutes');

// 导入新增管理路由
const logRoutes = require('./routes/logRoutes');
const adminWalletRoutes = require('./routes/adminWalletRoutes');
const adminTeamRoutes = require('./routes/adminTeamRoutes');

const exampleRoutes = require('./routes/example-route');
const app = express();
const PORT = process.env.PORT || 3000;
// 使用环境变量中的JWT密钥，确保安全性
const JWT_SECRET = process.env.JWT_SECRET || 'fitchallenge_secret_key_2025';

// 中间件
// 安全头设置 - 必须在其他中间件之前
app.use(securityHeaders);

// 请求日志记录
app.use(requestLogger);

// 配置CORS（需在限流之前，避免预检被限流拦截）
const corsAllowedOrigins = [
    'http://localhost:8080', 'http://127.0.0.1:8080',
    'http://localhost:8081', 'http://127.0.0.1:8081',
    'http://localhost:8082', 'http://127.0.0.1:8082',
    'http://localhost:8000', 'http://127.0.0.1:8000',
    'http://localhost:8001', 'http://127.0.0.1:8001'
];
const corsConfig = {
    origin: corsAllowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};
app.use(cors(corsConfig));

// 显式处理所有预检请求，快速返回204并带上CORS头
app.options('*', cors(corsConfig));

// 通用速率限制（置于CORS之后）
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' })); // 添加请求体大小限制
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// 添加请求日志中间件
app.use(logger.requestMiddleware());
// 移除静态文件服务，只提供API
// app.use(express.static('public'));

// 工具函数
const generateToken = (user) => {
    // 使用与前端已有token相同的格式
    const payload = {
        id: user.id,
        username: user.username || user.email
    };
    
    console.log('生成token的payload:', payload);
    
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    return token;
};

// 认证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// Swagger API文档
const { specs: swaggerSpecs, swaggerJsonRoute } = require('./config/swagger');
// 专门的Swagger JSON路由 - 必须在UI路由之前注册
app.get('/api-docs/swagger.json', swaggerJsonRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FitChallenge API 文档'
}));




// 根路径
app.get('/', (req, res) => {
    res.json({ 
        message: 'FitChallenge API 服务器',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            vip: '/api/admin/vip-levels',
            challenges: '/api/admin/vip-challenges',
            users: '/api/admin/users'
        },
        docs: '/api-docs',
        note: '这是一个API服务器，前端请访问 http://localhost:8000，API文档请访问 /api-docs'
    });
});

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: 'FitChallenge API 正常运行' });
});



// 注册接口
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, invitationCode } = req.body;

        // 验证输入
        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '邮箱格式不正确' });
        }
        
        // 检查邮箱是否已存在
        const existingEmail = await userService.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: '邮箱已被注册' });
        }

        // 生成随机用户名（邮箱前缀 + 随机数字）
        const emailPrefix = email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000);
        const username = `${emailPrefix}${randomSuffix}`;

        // 创建新用户（密码加密在User.create中处理）
        const newUser = await userService.createUser(username, email, password);

        // 处理邀请关系
        if (invitationCode) {
            try {
                const teamService = require('./services/teamService');
                const inviterId = await teamService.findInviterByCode(invitationCode);
                
                if (inviterId && inviterId !== newUser.id) {
                    await teamService.establishTeamRelationship(inviterId, newUser.id);
                    console.log(`✅ 邀请关系建立成功: ${inviterId} -> ${newUser.id}`);
                }
            } catch (error) {
                console.error('处理邀请关系失败:', error);
                // 邀请关系失败不影响用户注册
            }
        }

        // 生成JWT令牌
        const token = generateToken(newUser);

        res.status(201).json({
            message: '注册成功',
            token,
            user: newUser.toJSON()
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 验证输入
        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        console.log('尝试登录用户:', email);
        
        // 查找用户（通过邮箱）
        const user = await userService.findByEmail(email);
        if (!user) {
            console.log('用户不存在:', email);
            return res.status(400).json({ error: '邮箱或密码错误' });
        }

        console.log('找到用户:', user.username);
        
        // 验证密码
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            console.log('密码验证失败');
            return res.status(400).json({ error: '邮箱或密码错误' });
        }

        console.log('密码验证成功');
        
        // 更新最后登录时间
        await userService.updateLastLogin(user.id);

        // 生成JWT令牌
        const token = generateToken(user);

        console.log('生成的token:', token.substring(0, 20) + '...');
        
        res.json({
            message: '登录成功',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 刷新token接口
app.post('/api/auth/refresh-token', authenticateToken, async (req, res) => {
    try {
        // 用户已通过认证中间件验证
        const userId = req.user.id;
        
        // 获取用户信息
        const user = await userService.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        // 生成新token
        const token = generateToken(user);
        console.log('刷新生成的token:', token);
        
        res.json({
            success: true,
            message: 'Token刷新成功',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('刷新token错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// Telegram登录接口
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const authData = req.body;
        
        // 验证Telegram认证数据
        const telegramData = await telegramService.validateTelegramAuth(authData);
        
        // 查找或创建用户
        const result = await telegramService.findOrCreateUserByTelegram(telegramData);
        
        if (!result.success) {
            return res.status(400).json({ error: 'Telegram登录失败' });
        }

        // 生成JWT令牌
        const token = generateToken(result.user);

        // 更新最后登录时间
        await userService.updateLastLogin(result.user.id);

        res.json({
            success: true,
            message: 'Telegram登录成功',
            token,
            user: result.user,
            isNewUser: result.isNewUser
        });
    } catch (error) {
        console.error('Telegram登录错误:', error);
        res.status(500).json({ error: 'Telegram登录失败: ' + error.message });
    }
 });

// 获取Telegram Bot信息
app.get('/api/auth/telegram/bot-info', async (req, res) => {
    try {
        const botInfo = await telegramService.getBotInfo();
        res.json({
            success: true,
            data: botInfo,
            message: '获取Bot信息成功'
        });
    } catch (error) {
        console.error('获取Bot信息错误:', error);
        res.status(500).json({ error: '获取Bot信息失败' });
    }
});

// Telegram Bot管理API
app.get('/api/telegram/status', (req, res) => {
    try {
        const status = telegramPolling.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取Bot状态失败'
        });
    }
});

app.post('/api/telegram/start', (req, res) => {
    try {
        telegramPolling.startPolling();
        res.json({
            success: true,
            message: 'Telegram Bot轮询服务已启动'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '启动Bot服务失败'
        });
    }
});

app.post('/api/telegram/stop', (req, res) => {
    try {
        telegramPolling.stopPolling();
        res.json({
            success: true,
            message: 'Telegram Bot轮询服务已停止'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '停止Bot服务失败'
        });
    }
});

app.post('/api/telegram/send-message', async (req, res) => {
    try {
        const { chat_id, text } = req.body;
        
        if (!chat_id || !text) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：chat_id 和 text'
            });
        }

        const result = await telegramService.sendMessage(chat_id, text);
        
        if (result.success) {
            res.json({
                success: true,
                message: '消息发送成功',
                data: result
            });
            return;
        }
        
        res.status(500).json({
            success: false,
            error: '消息发送失败: ' + result.error
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '发送消息失败: ' + error.message
        });
    }
});

// 新增的Telegram轮询控制接口
app.post('/api/telegram/enable', (req, res) => {
    try {
        telegramPolling.enable();
        res.json({
            success: true,
            message: 'Telegram轮询功能已启用'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '启用Telegram轮询失败'
        });
    }
});

app.post('/api/telegram/disable', (req, res) => {
    try {
        telegramPolling.disable();
        res.json({
            success: true,
            message: 'Telegram轮询功能已禁用'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '禁用Telegram轮询失败'
        });
    }
});

app.post('/api/telegram/verbose', (req, res) => {
    try {
        const { verbose } = req.body;
        telegramPolling.setVerboseLogging(verbose);
        res.json({
            success: true,
            message: `Telegram详细日志已${verbose ? '启用' : '禁用'}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '设置Telegram日志模式失败'
        });
    }
});

// 用户信息API已通过模块化路由处理

// 更新钱包地址
app.put('/api/user/wallet', authenticateToken, async (req, res) => {
    try {
        const { trc20_wallet } = req.body;
        const user = await userService.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        const updatedUser = await userService.updateUserWallet(req.user.id, trc20_wallet);

        res.json({ message: '钱包地址更新成功', trc20_wallet: updatedUser.trc20Wallet });
    } catch (error) {
        console.error('更新钱包地址错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 提交步数
app.post('/api/steps', authenticateToken, async (req, res) => {
    try {
        const { steps, date } = req.body;
        const userId = req.user.id;

        // 验证输入
        if (!steps || !date) {
            return res.status(400).json({ error: '步数和日期不能为空' });
        }

        if (steps < 0) {
            return res.status(400).json({ error: '步数不能为负数' });
        }

        // 创建或更新步数记录
        const stepRecord = await stepService.createOrUpdateStepRecord(userId, date, steps);

        res.json({ message: '步数提交成功', record: stepRecord });
    } catch (error) {
        console.error('步数提交错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取用户步数历史
app.get('/api/steps/history', authenticateToken, async (req, res) => {
    try {
        const { month, year } = req.query;
        
        if (!month || !year) {
            return res.status(400).json({ error: '月份和年份参数不能为空' });
        }

        const stepHistory = await stepService.getStepHistory(req.user.id, month, year);

        res.json(stepHistory);
    } catch (error) {
        console.error('获取步数历史错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { date } = req.query;
        const leaderboard = await stepService.getLeaderboard(date);
        
        // 补充用户信息
        const leaderboardWithNames = await Promise.all(leaderboard.map(async (item) => {
            const user = await userService.findById(item.userId);
            return {
                userId: item.userId,
                username: user ? user.username : 'Unknown',
                steps: item.steps
            };
        }));

        res.json(leaderboardWithNames);
    } catch (error) {
        console.error('获取排行榜错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取新闻列表
app.get('/api/news', (req, res) => {
    try {
        // 模拟新闻数据
        const news = [
            {
                id: 1,
                title: '每日步行对心血管健康的益处',
                content: '研究表明，每天步行至少30分钟可以显著降低心脏病和中风的风险。步行是一种简单而有效的有氧运动，可以帮助加强心脏肌肉，降低血压，并改善血液循环。',
                author: '健康专家',
                publishedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: '久坐不动对身体的危害',
                content: '长时间坐着已被证实与多种健康问题相关，包括肥胖、糖尿病和心血管疾病。专家建议每小时起身活动5-10分钟，以减少久坐带来的健康风险。',
                author: '健康专家',
                publishedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }
        ];

        res.json(news);
    } catch (error) {
        console.error('获取新闻错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取新闻详情
app.get('/api/news/:id', (req, res) => {
    try {
        const newsId = parseInt(req.params.id);
        
        // 模拟获取特定新闻
        const newsItem = {
            id: newsId,
            title: '每日步行对心血管健康的益处',
            content: '研究表明，每天步行至少30分钟可以显著降低心脏病和中风的风险。步行是一种简单而有效的有氧运动，可以帮助加强心脏肌肉，降低血压，并改善血液循环。此外，步行还可以帮助控制体重，增强骨骼和肌肉，改善情绪和睡眠质量。',
            author: '健康专家',
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        res.json(newsItem);
    } catch (error) {
        console.error('获取新闻详情错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});



// 通知API已通过模块化路由处理

// 用户管理路由已通过模块化路由处理

// VIP等级管理路由已通过模块化路由处理

app.get('/api/admin/system-configs', (req, res) => {
    try {
        // 模拟获取系统配置
        const configs = [
            {
                key: 'max_login_attempts',
                value: '5',
                description: '最大登录尝试次数'
            },
            {
                key: 'session_timeout',
                value: '24',
                description: '会话超时时间(小时)'
            }
        ];
        
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: '服务器内部错误' });
    }
});

app.post('/api/admin/system-configs', (req, res) => {
    try {
        const { key, value } = req.body;
        // 模拟更新系统配置
        res.json({ 
            message: '系统配置更新成功',
            config: { key, value }
        });
    } catch (error) {
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// API路由速率限制 - 对所有API路由应用速率限制
app.use('/api', apiLimiter);

// 用户端VIP等级路由（不需要管理员权限）
app.use('/api/vip-levels', userVipLevelRoutes);
app.use('/api/user/vip-challenge', userVipChallengeRoutes);

// 运动步数API路由
const fitnessApiRoutes = require('./routes/fitnessApiRoutes');
app.use('/api/fitness', fitnessApiRoutes);

// 钱包路由
app.use('/api/wallet', walletRoutes);

// 签到路由
app.use('/api/checkin', checkinRoutes);

// PK挑战路由
app.use('/api/pk', pkChallengeRoutes);

// 注册管理路由 - 添加管理员认证速率限制
app.use('/api/admin/auth/login', authLimiter);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/vip-levels', vipLevelRoutes);
app.use('/api/admin/vip-challenges', vipChallengeRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/checkin', adminCheckinRoutes);
app.use('/api/admin/pk', adminPkChallengeRoutes);
app.use('/api/achievements', achievementRoutes);

// 注册新增管理路由
app.use('/api/logs', logRoutes);
app.use('/api/admin/wallet', adminWalletRoutes);
app.use('/api/admin/team-statistics', adminTeamRoutes);
// 新增模板与批次管理路由
const adminTemplateRoutes = require('./routes/adminTemplateRoutes');
const adminBatchRoutes = require('./routes/adminBatchRoutes');
app.use('/api/admin/notification-templates', adminTemplateRoutes);
app.use('/api/admin/notification-batches', adminBatchRoutes);

// 团队路由
const teamRoutes = require('./routes/teamRoutes');
app.use('/api/team', teamRoutes);

// 用户认证路由 - 添加认证速率限制
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

// 用户个人资料和设置路由
const userProfileRoutes = require('./routes/userProfileRoutes');
app.use('/api/user', userProfileRoutes);

// 用户通知偏好路由
const userPreferenceRoutes = require('./routes/userPreferenceRoutes');
app.use('/api/user/notification-preferences', userPreferenceRoutes);

// 通知系统路由
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// 系统配置和统计路由
const systemRoutes = require('./routes/systemRoutes');
app.use('/api/system', systemRoutes);

// 管理员通知管理路由
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
app.use('/api/admin/notifications', adminNotificationRoutes);
const adminDeliveryRoutes = require('./routes/adminDeliveryRoutes');
app.use('/api/admin/notification-monitor', adminDeliveryRoutes);

// 管理员挑战超时服务控制路由
const adminChallengeTimeoutRoutes = require('./routes/adminChallengeTimeoutRoutes');
app.use('/api/admin/challenge-timeout', adminChallengeTimeoutRoutes);

// 搜索和过滤路由
const searchRoutes = require('./routes/searchRoutes');
app.use('/api/search', searchRoutes);

// 健康检查接口（放在所有路由之后，错误处理之前）
app.get('/api/health', (req, res) => {
    const { isRedisEnabled } = require('./config/featureFlags');
    const redisStatus = isRedisEnabled() ? 'connected' : 'disabled';
    let challengeTimeout = undefined;
    try {
        const challengeTimeoutService = require('./services/challengeTimeoutService');
        challengeTimeout = challengeTimeoutService.getStatus();
    } catch (e) {
        challengeTimeout = { error: 'unavailable' };
    }
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: 'connected',
            redis: redisStatus,
            challengeTimeout
        }
    });
});

// CORS头保底中间件（在错误处理之前），确保4xx/5xx也包含CORS响应头
app.use((req, res, next) => {
    if (res.headersSent) return next();
    const origin = req.headers.origin;
    if (origin && corsAllowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    }
    next();
});

// 全局错误处理中间件（放在所有路由之后）
app.use(errorHandler);

// 优雅关闭处理
process.on('SIGTERM', () => {
    logger.info('📡 收到SIGTERM信号，优雅关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('📡 收到SIGINT信号，优雅关闭服务器...');
    process.exit(0);
});

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常', { error: error.message, stack: error.stack });
    // 给进程一些时间来记录错误，然后退出
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝', { reason, promise });
});

// 创建HTTP服务器
const server = http.createServer(app);

// 启动服务器
const SERVER_PORT = process.env.PORT || 3000; // 使用3000端口

server.listen(SERVER_PORT, () => {
    logger.info('✅ MySQL数据库连接成功');
    logger.info(`🚀 FitChallenge MySQL API服务器运行在端口 ${SERVER_PORT}`);
    logger.info('📊 数据库: MySQL (fitchallenge)');
    logger.info(`🌐 API地址: http://localhost:${SERVER_PORT}`);
    logger.info('🔧 环境变量: PORT=' + (process.env.PORT || '未设置') + ', API_PORT=' + (process.env.API_PORT || '未设置'));
    logger.info(`\n🤖 Telegram轮询控制接口:`);
    logger.info(`   GET  /api/telegram/status  - 查看轮询状态`);
    logger.info(`   POST /api/telegram/start   - 启动轮询`);
    logger.info(`   POST /api/telegram/stop    - 停止轮询`);
    logger.info(`   POST /api/telegram/enable  - 启用轮询功能`);
    logger.info(`   POST /api/telegram/disable - 禁用轮询功能`);
    logger.info(`   POST /api/telegram/verbose - 设置详细日志`);
    logger.info(`\n💡 提示: Telegram轮询默认禁用，需要手动启动以避免资源浪费`);
    
    // 启动WebSocket服务器
    try {
        const WebSocketServer = require('./websocket/websocketServer');
        const websocketServer = new WebSocketServer(server, {
            path: '/ws'
        });
        logger.info('🔌 WebSocket服务器已启动，路径: /ws');
        
        // 将WebSocket服务器实例添加到app中，供其他模块使用
        app.set('websocketServer', websocketServer);
    } catch (error) {
        logger.error('❌ 启动WebSocket服务器失败:', error);
    }
    
    // 启动挑战超时检查服务
    try {
        const challengeTimeoutService = require('./services/challengeTimeoutService');
        challengeTimeoutService.start();
        logger.info('⏰ 挑战超时检查服务已启动');
    } catch (error) {
        logger.error('❌ 启动挑战超时检查服务失败:', error);
    }

    // 启动通知Worker（BullMQ）
    try {
        const { start: startNotificationWorker } = require('./services/notificationWorker');
        startNotificationWorker();
        logger.info('📬 通知Worker已启动');
    } catch (error) {
        logger.error('❌ 启动通知Worker失败:', error);
    }

    // Telegram轮询服务默认禁用，需要手动启动
    logger.info('🤖 Telegram轮询服务默认禁用，可通过API手动启动');
});

module.exports = app;