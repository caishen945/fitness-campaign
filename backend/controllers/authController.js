const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    // 用户注册
    async register(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;

            // 验证输入
            if (!email || !password || !confirmPassword) {
                return res.status(400).json({ error: '邮箱和密码都是必填的' });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ error: '密码确认不匹配' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: '密码长度至少6位' });
            }

            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: '邮箱格式无效' });
            }

            const connection = await pool.getConnection();
            
            try {
                // 检查邮箱是否已存在
                const [existingUsers] = await connection.execute(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );

                if (existingUsers.length > 0) {
                    return res.status(400).json({ error: '邮箱已存在' });
                }

                // 加密密码
                const hashedPassword = await bcrypt.hash(password, 10);

                // 创建用户
                const [result] = await connection.execute(
                    'INSERT INTO users (email, password_hash, is_active, created_at) VALUES (?, ?, 1, NOW())',
                    [email, hashedPassword]
                );

                // 生成JWT token
                const token = jwt.sign(
                    { id: result.insertId, email },
                    process.env.JWT_SECRET || 'fitchallenge_secret_key_2025',
                    { expiresIn: '24h' }
                );

                // 获取用户信息
                const [newUser] = await connection.execute(
                    'SELECT id, email, telegram_id, first_name, last_name, is_active, created_at FROM users WHERE id = ?',
                    [result.insertId]
                );

                res.status(201).json({
                    message: '注册成功',
                    token,
                    user: newUser[0]
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('用户注册失败:', error);
            res.status(500).json({ error: '注册失败，请稍后重试' });
        }
    }

    // 用户登录
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // 验证输入
            if (!email || !password) {
                return res.status(400).json({ error: '邮箱和密码不能为空' });
            }

            const connection = await pool.getConnection();
            
            try {
                // 查找用户
                const [users] = await connection.execute(
                    'SELECT * FROM users WHERE email = ? AND is_active = 1',
                    [email]
                );

                if (users.length === 0) {
                    return res.status(400).json({ error: '邮箱或密码错误' });
                }

                const user = users[0];

                // 验证密码
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(400).json({ error: '邮箱或密码错误' });
                }

                // 生成JWT token
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET || 'fitchallenge_secret_key_2025',
                    { expiresIn: '24h' }
                );

                // 更新最后登录时间
                await connection.execute(
                    'UPDATE users SET last_login = NOW() WHERE id = ?',
                    [user.id]
                );

                // 返回用户信息（不包含密码）
                const userInfo = {
                    id: user.id,
                    email: user.email,
                    telegramId: user.telegram_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    trc20Wallet: user.trc20_wallet,
                    isActive: user.is_active,
                    createdAt: user.created_at,
                    lastLogin: user.last_login,
                    displayName: user.first_name && user.last_name ? 
                        `${user.first_name} ${user.last_name}` : 
                        (user.first_name || (user.email ? user.email.split('@')[0] : `用户${user.id}`))
                };

                res.json({
                    success: true,
                    message: '登录成功',
                    token,
                    user: userInfo
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('用户登录失败:', error);
            res.status(500).json({ error: '登录失败，请稍后重试' });
        }
    }

    // 验证token
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: '访问令牌缺失' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitchallenge_secret_key_2025');
            
            const connection = await pool.getConnection();
            
            try {
                const [users] = await connection.execute(
                    'SELECT id, email, telegram_id, first_name, last_name, is_active FROM users WHERE id = ? AND is_active = 1',
                    [decoded.id]
                );

                if (users.length === 0) {
                    return res.status(401).json({ error: '无效的访问令牌' });
                }

                res.json({
                    success: true,
                    message: 'Token有效',
                    user: users[0]
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: '无效的访问令牌' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: '访问令牌已过期' });
            }
            
            console.error('Token验证失败:', error);
            res.status(500).json({ error: 'Token验证失败' });
        }
    }

    // 刷新token
    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({ error: '访问令牌缺失' });
            }

            // 验证当前token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitchallenge_secret_key_2025');
            
            const connection = await pool.getConnection();
            
            try {
                // 检查用户是否仍然存在且活跃
                const [users] = await connection.execute(
                    'SELECT id, email, telegram_id, first_name, last_name, is_active FROM users WHERE id = ? AND is_active = 1',
                    [decoded.id]
                );

                if (users.length === 0) {
                    return res.status(401).json({ error: '用户不存在或已被禁用' });
                }

                const user = users[0];

                // 生成新的JWT token
                const newToken = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET || 'fitchallenge_secret_key_2025',
                    { expiresIn: '24h' }
                );

                res.json({
                    success: true,
                    message: 'Token刷新成功',
                    token: newToken,
                    user: user
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: '无效的访问令牌' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: '访问令牌已过期' });
            }
            
            console.error('Token刷新失败:', error);
            res.status(500).json({ error: 'Token刷新失败' });
        }
    }
}

module.exports = new AuthController();
