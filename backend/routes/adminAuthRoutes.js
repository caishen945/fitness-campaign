/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: 管理员登录
 *     description: 管理员用户登录系统
 *     tags: [管理员认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 管理员用户名
 *               password:
 *                 type: string
 *                 description: 管理员密码
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 认证失败
 *       429:
 *         description: 请求频率过高
 */
const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/database');

// 速率限制：登录尝试限制
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 最大5次尝试
    message: {
        success: false,
        message: '登录尝试次数过多，请15分钟后再试',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 速率限制：通用API请求限制
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最大100次请求
    message: {
        success: false,
        message: '请求频率过高，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 管理员登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 输入校验
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({
                success: false,
                message: '用户名长度必须在3-50个字符之间'
            });
        }

        if (password.length < 8 || password.length > 100) {
            return res.status(400).json({
                success: false,
            message: '密码长度必须在8-100个字符之间'
            });
        }

        // 验证管理员账号
        const result = await adminAuthMiddleware.authenticateAdmin(username, password);

        // 记录登录审计日志
        await adminAuthMiddleware.logAuditAction(
            result.admin.id,
            'ADMIN_LOGIN',
            {
                username: username,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
            },
            req.ip || req.connection.remoteAddress
        );

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token: result.token,
                admin: result.admin
            }
        });
    } catch (error) {
        console.error('管理员登录失败:', error);
        res.status(401).json({
            success: false,
            message: error.message || '登录失败'
        });
    }
});

// 验证Token
router.get('/verify', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), (req, res) => {
    res.json({
        success: true,
        message: 'Token有效',
        data: {
            admin: req.admin
        }
    });
});

// 刷新Token
router.post('/refresh', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        // 生成新的Token
        const tokenPayload = {
            id: req.admin.id,
            username: req.admin.username,
            role: req.admin.role,
            permissions: req.admin.permissions
        };

        const newToken = adminAuthMiddleware.generateToken(tokenPayload);

        // 记录Token刷新审计日志
        await adminAuthMiddleware.logAuditAction(
            req.admin.id,
            'TOKEN_REFRESH',
            {
                username: req.admin.username,
                ip: req.ip || req.connection.remoteAddress
            },
            req.ip || req.connection.remoteAddress
        );

        res.json({
            success: true,
            message: 'Token刷新成功',
            data: {
                token: newToken,
                admin: req.admin
            }
        });
    } catch (error) {
        console.error('Token刷新失败:', error);
        res.status(500).json({
            success: false,
            message: 'Token刷新失败'
        });
    }
});

// 管理员退出
router.post('/logout', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        // 记录退出审计日志
        await adminAuthMiddleware.logAuditAction(
            req.admin.id,
            'ADMIN_LOGOUT',
            {
                username: req.admin.username,
                ip: req.ip || req.connection.remoteAddress
            },
            req.ip || req.connection.remoteAddress
        );

        res.json({
            success: true,
            message: '退出成功'
        });
    } catch (error) {
        console.error('管理员退出失败:', error);
        res.status(500).json({
            success: false,
            message: '退出失败'
        });
    }
});

// 获取当前管理员信息
router.get('/profile', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id, username, role, permissions, email, created_at, last_login FROM admin_users WHERE id = ?',
                [req.admin.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '管理员不存在'
                });
            }

            const admin = rows[0];
            res.json({
                success: true,
                data: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
                    email: admin.email,
                    createdAt: admin.created_at,
                    lastLogin: admin.last_login
                }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('获取管理员信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取管理员信息失败'
        });
    }
});

// 修改密码
router.post('/change-password', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 输入校验
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '当前密码和新密码不能为空'
            });
        }

        if (newPassword.length < 8 || newPassword.length > 100) {
            return res.status(400).json({
                success: false,
                message: '新密码长度必须在8-100个字符之间'
            });
        }

        const connection = await getConnection();
        try {
            // 验证当前密码
            const [rows] = await connection.execute(
                'SELECT password_hash FROM admin_users WHERE id = ?',
                [req.admin.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '管理员不存在'
                });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: '当前密码错误'
                });
            }

            // 加密新密码
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 更新密码
            await connection.execute(
                'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
                [newPasswordHash, req.admin.id]
            );

            // 记录密码修改审计日志
            await adminAuthMiddleware.logAuditAction(
                req.admin.id,
                'PASSWORD_CHANGE',
                {
                    username: req.admin.username,
                    ip: req.ip || req.connection.remoteAddress
                },
                req.ip || req.connection.remoteAddress
            );

            res.json({
                success: true,
                message: '密码修改成功'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('密码修改失败:', error);
        res.status(500).json({
            success: false,
            message: '密码修改失败'
        });
    }
});

module.exports = router;

