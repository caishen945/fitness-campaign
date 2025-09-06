/**
 * 测试专用的服务器模拟
 * 这个文件用于集成测试，避免依赖真实的server.js中可能存在的MongoDB依赖
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../../middleware/errorHandler');
const userService = require('../../services/userService');

// 创建Express应用
const app = express();
const JWT_SECRET = 'test_secret_key';

// 中间件
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8001', 'http://127.0.0.1:8001'],
    credentials: true
}));
app.use(express.json());

// 工具函数
const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username || user.email
    };
    
    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' }
    );
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

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test API is running' });
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

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

        // 生成随机用户名
        const emailPrefix = email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000);
        const username = `${emailPrefix}${randomSuffix}`;

        // 创建新用户
        const newUser = await userService.createUser(username, email, password);

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
        
        // 查找用户
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: '邮箱或密码错误' });
        }
        
        // 验证密码
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(400).json({ error: '邮箱或密码错误' });
        }

        // 更新最后登录时间
        await userService.updateLastLogin(user.id);

        // 生成JWT令牌
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

// 获取用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userService.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json(user.toJSON());
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 全局错误处理中间件
app.use(errorHandler);

module.exports = app;
