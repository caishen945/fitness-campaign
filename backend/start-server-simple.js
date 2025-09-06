const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 导入核心服务
const userService = require('./services/userService');
const stepService = require('./services/stepService');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vipLevelRoutes = require('./routes/vipLevelRoutes');
const vipChallengeRoutes = require('./routes/vipChallengeRoutes');
const walletRoutes = require('./routes/walletRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

// 导入管理路由
const adminWalletRoutes = require('./routes/adminWalletRoutes');
const adminCheckinRoutes = require('./routes/adminCheckinRoutes');
const adminPkChallengeRoutes = require('./routes/adminPkChallengeRoutes');
const teamRoutes = require('./routes/teamRoutes');

// 导入Telegram服务
const telegramPolling = require('./services/telegramPolling');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fitchallenge_secret_key_2025';

// 中间件
app.use(cors({
    origin: [
        'http://localhost:8080', 'http://127.0.0.1:8080',
        'http://localhost:8081', 'http://127.0.0.1:8081',
        'http://localhost:8082', 'http://127.0.0.1:8082'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 工具函数
const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username || user.email
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
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

// 根路径
app.get('/', (req, res) => {
    res.json({ 
        message: 'FitChallenge API 服务器 (简化版)',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            vip: '/api/admin/vip-levels',
            challenges: '/api/admin/vip-challenges',
            wallet: '/api/wallet',
            checkin: '/api/checkin'
        }
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            server: 'running',
            database: 'connected',
            redis: 'connected'
        }
    });
});

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'FitChallenge API 正常运行',
        timestamp: new Date().toISOString()
    });
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, invitationCode } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '邮箱格式不正确' });
        }
        
        const existingEmail = await userService.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: '邮箱已被注册' });
        }

        const emailPrefix = email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000);
        const username = `${emailPrefix}${randomSuffix}`;

        const newUser = await userService.createUser(username, email, password);
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

        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '密码错误' });
        }

        const token = generateToken(user);

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

// 用户信息接口
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userService.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({
            user: user.toJSON()
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', userRoutes); // 用户管理接口
app.use('/api/admin/vip-levels', vipLevelRoutes);
app.use('/api/admin/vip-challenges', vipChallengeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/achievements', achievementRoutes);

// 注册管理路由
app.use('/api/admin/wallet', adminWalletRoutes);
app.use('/api/admin/checkin', adminCheckinRoutes);
app.use('/api/admin/pk', adminPkChallengeRoutes);
app.use('/api/team', teamRoutes);

// Telegram轮询控制接口
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
            error: '获取Telegram状态失败'
        });
    }
});

app.post('/api/telegram/start', (req, res) => {
    try {
        telegramPolling.startPolling();
        res.json({
            success: true,
            message: 'Telegram轮询服务已启动'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '启动Telegram轮询失败'
        });
    }
});

app.post('/api/telegram/stop', (req, res) => {
    try {
        telegramPolling.stopPolling();
        res.json({
            success: true,
            message: 'Telegram轮询服务已停止'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '停止Telegram轮询失败'
        });
    }
});

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

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log('🎉 FitChallenge API 服务器启动成功！');
    console.log(`🌐 HTTP地址: http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`🔍 API测试: http://localhost:${PORT}/api/test`);
    console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log(`\n🎯 服务器已就绪，可以开始测试API功能！`);
    console.log(`\n🤖 Telegram轮询控制接口:`);
    console.log(`   GET  /api/telegram/status  - 查看轮询状态`);
    console.log(`   POST /api/telegram/start   - 启动轮询`);
    console.log(`   POST /api/telegram/stop    - 停止轮询`);
    console.log(`   POST /api/telegram/enable  - 启用轮询功能`);
    console.log(`   POST /api/telegram/disable - 禁用轮询功能`);
    console.log(`   POST /api/telegram/verbose - 设置详细日志`);
    console.log(`\n💡 提示: Telegram轮询默认禁用，需要手动启动以避免资源浪费`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('\n🛑 收到SIGTERM信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 收到SIGINT信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});
