const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');

// JWT密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'FitChallenge-Admin-Secret-Key-2024';
const JWT_EXPIRES_IN = '24h';

class AdminAuthMiddleware {
    constructor() {
        this.pool = pool;
    }

    // 生成JWT Token
    generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { 
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'FitChallenge-Admin',
            audience: 'FitChallenge-Admin-Users'
        });
    }

    // 验证JWT Token
    verifyToken(token) {
        try {
            console.log('🔍 验证token:', token.substring(0, 50) + '...');
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('✅ Token验证成功:', decoded);
            return decoded;
        } catch (error) {
            console.error('❌ Token验证失败:', error.message);
            throw new Error('Invalid token');
        }
    }

    // 管理员登录验证
    async authenticateAdmin(username, password) {
        const connection = await this.pool.getConnection();
        try {
            // 查询管理员用户
            const [rows] = await connection.execute(
                'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
                [username]
            );

            if (rows.length === 0) {
                throw new Error('用户名或密码错误');
            }

            const admin = rows[0];

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            if (!isValidPassword) {
                throw new Error('用户名或密码错误');
            }

            // 更新最后登录时间
            await connection.execute(
                'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
                [admin.id]
            );

            // 生成Token
            const tokenPayload = {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions ? JSON.parse(admin.permissions) : []
            };

            const token = this.generateToken(tokenPayload);

            return {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    permissions: tokenPayload.permissions,
                    lastLogin: admin.last_login
                }
            };
        } finally {
            connection.release();
        }
    }

    // 中间件：验证管理员Token
    async verifyAdminToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: '缺少认证Token'
                });
            }

            const token = authHeader.substring(7);
            const decoded = this.verifyToken(token);

            // 验证管理员是否仍然存在且活跃
            const connection = await this.pool.getConnection();
            try {
                const [rows] = await connection.execute(
                    'SELECT id, username, role, permissions, is_active FROM admin_users WHERE id = ? AND is_active = 1',
                    [decoded.id]
                );

                if (rows.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: '管理员账户不存在或已被禁用'
                    });
                }

                const admin = rows[0];
                req.admin = {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    permissions: admin.permissions ? JSON.parse(admin.permissions) : []
                };

                next();
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Token验证失败:', error);
            return res.status(401).json({
                success: false,
                message: 'Token无效或已过期'
            });
        }
    }

    // 权限验证中间件
    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: '未认证'
                });
            }

            if (req.admin.role === 'super_admin') {
                return next(); // 超级管理员拥有所有权限
            }

            if (!req.admin.permissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: '权限不足'
                });
            }

            next();
        };
    }

    // 角色验证中间件
    requireRole(role) {
        return (req, res, next) => {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: '未认证'
                });
            }

            if (req.admin.role === 'super_admin') {
                return next(); // 超级管理员拥有所有角色权限
            }

            if (req.admin.role !== role) {
                return res.status(403).json({
                    success: false,
                    message: '角色权限不足'
                });
            }

            next();
        };
    }

    // 记录审计日志
    async logAuditAction(adminId, action, details, ipAddress) {
        const connection = await this.pool.getConnection();
        try {
            await connection.execute(
                'INSERT INTO admin_audit_logs (admin_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())',
                [adminId, action, JSON.stringify(details), ipAddress]
            );
        } catch (error) {
            console.error('审计日志记录失败:', error);
        } finally {
            connection.release();
        }
    }

    // 审计日志中间件
    auditAction(action) {
        return async (req, res, next) => {
            const originalSend = res.send;
            res.send = function(data) {
                // 记录审计日志
                if (req.admin && res.statusCode < 400) {
                    const details = {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                        params: req.params,
                        query: req.query,
                        response: JSON.parse(data)
                    };

                    adminAuthMiddleware.logAuditAction(
                        req.admin.id,
                        action,
                        details,
                        req.ip || req.connection.remoteAddress
                    );
                }

                originalSend.call(this, data);
            };

            next();
        };
    }
}

// 创建单例实例
const adminAuthMiddleware = new AdminAuthMiddleware();

// 导出实例和静态方法
module.exports = {
    authenticateAdmin: adminAuthMiddleware.authenticateAdmin.bind(adminAuthMiddleware),
    verifyAdminToken: adminAuthMiddleware.verifyAdminToken.bind(adminAuthMiddleware),
    requirePermission: adminAuthMiddleware.requirePermission.bind(adminAuthMiddleware),
    requireRole: adminAuthMiddleware.requireRole.bind(adminAuthMiddleware),
    logAuditAction: adminAuthMiddleware.logAuditAction.bind(adminAuthMiddleware),
    auditAction: adminAuthMiddleware.auditAction.bind(adminAuthMiddleware),
    // 额外导出令牌工具以便单测直接调用
    generateToken: adminAuthMiddleware.generateToken.bind(adminAuthMiddleware),
    verifyToken: adminAuthMiddleware.verifyToken.bind(adminAuthMiddleware)
};
