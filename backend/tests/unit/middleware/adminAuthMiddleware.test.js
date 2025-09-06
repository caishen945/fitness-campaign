/**
 * adminAuthMiddleware 中间件单元测试
 */

const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware');
const jwt = require('jsonwebtoken');
const { pool } = require('../../../config/database');

// Mock依赖
jest.mock('jsonwebtoken');
jest.mock('../../../config/database', () => ({
    pool: {
        execute: jest.fn(),
        getConnection: jest.fn()
    }
}));

describe('AdminAuthMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let mockConnection;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            headers: {
                authorization: 'Bearer valid-token'
            },
            admin: null
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        mockNext = jest.fn();
        
        mockConnection = {
            execute: jest.fn(),
            release: jest.fn()
        };
        
        pool.getConnection.mockResolvedValue(mockConnection);
    });

    describe('verifyAdminToken', () => {
        test('应该验证有效的JWT令牌', async () => {
            const mockAdmin = {
                id: 1,
                username: 'admin',
                role: 'admin',
                permissions: '[]',
                is_active: 1
            };
            
            jwt.verify.mockReturnValue({ id: 1 });
            mockConnection.execute.mockResolvedValueOnce([[mockAdmin]]);
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
            expect(mockConnection.execute).toHaveBeenCalledWith(
                'SELECT id, username, role, permissions, is_active FROM admin_users WHERE id = ? AND is_active = 1',
                [1]
            );
            expect(mockReq.admin).toEqual({
                id: 1,
                username: 'admin',
                role: 'admin',
                permissions: []
            });
            expect(mockNext).toHaveBeenCalled();
        });

        test('应该拒绝无效的JWT令牌', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token无效或已过期'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该拒绝缺失的授权头', async () => {
            mockReq.headers.authorization = undefined;
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '缺少认证Token'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该拒绝格式错误的授权头', async () => {
            mockReq.headers.authorization = 'InvalidFormat';
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '缺少认证Token'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该处理数据库查询错误', async () => {
            jwt.verify.mockReturnValue({ id: 1 });
            mockConnection.execute.mockRejectedValue(new Error('Database error'));
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token无效或已过期'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该处理用户不存在的情况', async () => {
            jwt.verify.mockReturnValue({ id: 999 });
            mockConnection.execute.mockResolvedValueOnce([[]]);
            
            await adminAuthMiddleware.verifyAdminToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '管理员账户不存在或已被禁用'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('requireRole', () => {
        test('应该允许管理员用户通过', () => {
            mockReq.admin = {
                id: 1,
                username: 'admin',
                role: 'admin'
            };
            
            const middleware = adminAuthMiddleware.requireRole('admin');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test('应该拒绝非管理员用户', () => {
            mockReq.admin = {
                id: 2,
                username: 'user',
                role: 'user'
            };
            
            const middleware = adminAuthMiddleware.requireRole('admin');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '角色权限不足'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该拒绝没有用户信息的请求', () => {
            mockReq.admin = null;
            
            const middleware = adminAuthMiddleware.requireRole('admin');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '未认证'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该允许超级管理员通过任何角色检查', () => {
            mockReq.admin = {
                id: 1,
                username: 'superadmin',
                role: 'super_admin'
            };
            
            const middleware = adminAuthMiddleware.requireRole('admin');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('requirePermission', () => {
        test('应该允许有权限的用户通过', () => {
            mockReq.admin = {
                id: 1,
                username: 'admin',
                role: 'admin',
                permissions: ['create_user', 'delete_user']
            };
            
            const middleware = adminAuthMiddleware.requirePermission('create_user');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test('应该拒绝没有权限的用户', () => {
            mockReq.admin = {
                id: 2,
                username: 'user',
                role: 'user',
                permissions: ['read_user']
            };
            
            const middleware = adminAuthMiddleware.requirePermission('create_user');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: '权限不足'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('应该允许超级管理员通过任何权限检查', () => {
            mockReq.admin = {
                id: 1,
                username: 'superadmin',
                role: 'super_admin',
                permissions: []
            };
            
            const middleware = adminAuthMiddleware.requirePermission('create_user');
            middleware(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('logAuditAction', () => {
        test('应该记录审计日志', async () => {
            const adminId = 1;
            const action = 'create_user';
            const details = { userId: 123, action: 'create_user' };
            const ipAddress = '127.0.0.1';
            
            mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]);
            
            await adminAuthMiddleware.logAuditAction(adminId, action, details, ipAddress);
            
            expect(mockConnection.execute).toHaveBeenCalledWith(
                'INSERT INTO admin_audit_logs (admin_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())',
                [adminId, action, JSON.stringify(details), ipAddress]
            );
        });

        test('应该处理审计日志记录失败', async () => {
            const adminId = 1;
            const action = 'create_user';
            const details = { userId: 123, action: 'create_user' };
            const ipAddress = '127.0.0.1';
            
            mockConnection.execute.mockRejectedValue(new Error('Database error'));
            
            // 不应该抛出错误
            await expect(adminAuthMiddleware.logAuditAction(adminId, action, details, ipAddress))
                .resolves.not.toThrow();
        });
    });

    describe('generateToken', () => {
        test('应该生成有效的JWT令牌', () => {
            const payload = { id: 1, username: 'admin' };
            const mockToken = 'mock.jwt.token';
            
            jwt.sign.mockReturnValue(mockToken);
            
            const result = adminAuthMiddleware.generateToken(payload);
            
            expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), {
                expiresIn: '24h',
                issuer: 'FitChallenge-Admin',
                audience: 'FitChallenge-Admin-Users'
            });
            expect(result).toBe(mockToken);
        });
    });

    describe('verifyToken', () => {
        test('应该验证有效的令牌', () => {
            const mockToken = 'valid.token';
            const mockDecoded = { id: 1, username: 'admin' };
            
            jwt.verify.mockReturnValue(mockDecoded);
            
            const result = adminAuthMiddleware.verifyToken(mockToken);
            
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
            expect(result).toEqual(mockDecoded);
        });

        test('应该拒绝无效的令牌', () => {
            const mockToken = 'invalid.token';
            
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            
            expect(() => adminAuthMiddleware.verifyToken(mockToken)).toThrow('Invalid token');
        });
    });
});
