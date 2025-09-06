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

// 閫熺巼闄愬埗锛氱櫥褰曞皾璇曢檺鍒?
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 鏈€澶?娆″皾璇?
    message: {
        success: false,
        message: '登录尝试次数过多，请15分钟后再试',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 閫熺巼闄愬埗锛欰PI璇锋眰闄愬埗
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 鏈€澶?00娆¤姹?
    message: {
        success: false,
        message: '请求频率过高，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 绠＄悊鍛樼櫥褰?
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 杈撳叆楠岃瘉
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

        // 楠岃瘉绠＄悊鍛樺嚟鎹?
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
        console.error('绠＄悊鍛樼櫥褰曞け璐?', error);
        res.status(401).json({
            success: false,
            message: error.message || '登录失败'
        });
    }
});

// 楠岃瘉Token
router.get('/verify', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), (req, res) => {
    res.json({
        success: true,
        message: 'Token鏈夋晥',
        data: {
            admin: req.admin
        }
    });
});

// 鍒锋柊Token
router.post('/refresh', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        // 鐢熸垚鏂扮殑Token
        const tokenPayload = {
            id: req.admin.id,
            username: req.admin.username,
            role: req.admin.role,
            permissions: req.admin.permissions
        };

        const newToken = adminAuthMiddleware.generateToken(tokenPayload);

        // 璁板綍Token鍒锋柊瀹¤鏃ュ織
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
            message: 'Token鍒锋柊鎴愬姛',
            data: {
                token: newToken,
                admin: req.admin
            }
        });
    } catch (error) {
        console.error('Token鍒锋柊澶辫触:', error);
        res.status(500).json({
            success: false,
            message: 'Token鍒锋柊澶辫触'
        });
    }
});

// 绠＄悊鍛樼櫥鍑?
router.post('/logout', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        // 璁板綍鐧诲嚭瀹¤鏃ュ織
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
            message: '鐧诲嚭鎴愬姛'
        });
    } catch (error) {
        console.error('绠＄悊鍛樼櫥鍑哄け璐?', error);
        res.status(500).json({
            success: false,
            message: '鐧诲嚭澶辫触'
        });
    }
});

// 鑾峰彇褰撳墠绠＄悊鍛樹俊鎭?
router.get('/profile', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        const connection = await adminAuthMiddleware.pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id, username, role, permissions, email, created_at, last_login FROM admin_users WHERE id = ?',
                [req.admin.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '绠＄悊鍛樹笉瀛樺湪'
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
        console.error('鑾峰彇绠＄悊鍛樹俊鎭け璐?', error);
        res.status(500).json({
            success: false,
            message: '获取管理员信息失败'
        });
    }
});

// 淇敼瀵嗙爜
router.post('/change-password', apiLimiter, adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 杈撳叆楠岃瘉
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '褰撳墠瀵嗙爜鍜屾柊瀵嗙爜涓嶈兘涓虹┖'
            });
        }

        if (newPassword.length < 8 || newPassword.length > 100) {
            return res.status(400).json({
                success: false,
                message: '新密码长度必须在8-100个字符之间'
            });
        }

        const connection = await adminAuthMiddleware.pool.getConnection();
        try {
            // 楠岃瘉褰撳墠瀵嗙爜
            const [rows] = await connection.execute(
                'SELECT password_hash FROM admin_users WHERE id = ?',
                [req.admin.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '绠＄悊鍛樹笉瀛樺湪'
                });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: '褰撳墠瀵嗙爜閿欒'
                });
            }

            // 鍔犲瘑鏂板瘑鐮?
            const bcrypt = require('bcryptjs');
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 鏇存柊瀵嗙爜
            await connection.execute(
                'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
                [newPasswordHash, req.admin.id]
            );

            // 璁板綍瀵嗙爜淇敼瀹¤鏃ュ織
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
                message: '瀵嗙爜淇敼鎴愬姛'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('瀵嗙爜淇敼澶辫触:', error);
        res.status(500).json({
            success: false,
            message: '瀵嗙爜淇敼澶辫触'
        });
    }
});

module.exports = router;

