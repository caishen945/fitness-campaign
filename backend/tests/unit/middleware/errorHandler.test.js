/**
 * errorHandler 中间件单元测试
 */

const { errorHandler, asyncHandler } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');

// Mock logger
jest.mock('../../../utils/logger', () => ({
    error: jest.fn()
}));

describe('errorHandler Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            method: 'GET',
            originalUrl: '/api/test',
            id: 'req-123',
            user: { id: 1 },
            get: jest.fn().mockReturnValue('Mozilla/5.0'),
            ip: '127.0.0.1'
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        mockNext = jest.fn();
    });

    describe('errorHandler', () => {
        test('应该处理一般错误', () => {
            const error = new Error('一般错误');
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(logger.error).toHaveBeenCalledWith('请求处理错误', {
                error: '一般错误',
                stack: error.stack,
                method: 'GET',
                url: '/api/test',
                requestId: 'req-123',
                userId: 1,
                userAgent: 'Mozilla/5.0',
                ip: '127.0.0.1'
            });
            
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '一般错误'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理ValidationError', () => {
            const error = new Error('验证失败');
            error.name = 'ValidationError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '数据验证失败'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理UnauthorizedError', () => {
            const error = new Error('未授权');
            error.name = 'UnauthorizedError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '未授权访问'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理ForbiddenError', () => {
            const error = new Error('禁止访问');
            error.name = 'ForbiddenError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: '禁止访问'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理NotFoundError', () => {
            const error = new Error('资源未找到');
            error.name = 'NotFoundError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '资源未找到'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理TokenExpiredError', () => {
            const error = new Error('令牌已过期');
            error.name = 'TokenExpiredError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'TOKEN_EXPIRED',
                    message: '令牌已过期'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理JsonWebTokenError', () => {
            const error = new Error('无效的令牌');
            error.name = 'JsonWebTokenError';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: '无效的令牌'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理MySQL错误代码', () => {
            const error = new Error('数据已存在');
            error.code = 'ER_DUP_ENTRY';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'ER_DUP_ENTRY',
                    message: '数据已存在'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理其他MySQL错误代码', () => {
            const mysqlErrors = [
                { code: 'ER_BAD_NULL_ERROR', status: 400, message: '必填字段不能为空' },
                { code: 'ER_NO_REFERENCED_ROW', status: 400, message: '引用的记录不存在' },
                { code: 'ER_ROW_IS_REFERENCED', status: 400, message: '该记录被其他数据引用，无法删除' },
                { code: 'ER_NO_SUCH_TABLE', status: 500, message: '表不存在' },
                { code: 'ER_PARSE_ERROR', status: 500, message: 'SQL语法错误' },
                { code: 'ER_ACCESS_DENIED_ERROR', status: 500, message: '数据库访问被拒绝' },
                { code: 'ER_LOCK_WAIT_TIMEOUT', status: 500, message: '数据库锁等待超时' },
                { code: 'ER_LOCK_DEADLOCK', status: 500, message: '数据库死锁' },
                { code: 'ER_DATA_TOO_LONG', status: 400, message: '数据超出长度限制' },
                { code: 'ECONNREFUSED', status: 500, message: '无法连接到数据库服务器' },
                { code: 'PROTOCOL_CONNECTION_LOST', status: 500, message: '数据库连接已断开' },
                { code: 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', status: 500, message: '数据库发生致命错误' },
                { code: 'ER_WRONG_VALUE_COUNT_ON_ROW', status: 400, message: '提供的值与字段数量不匹配' }
            ];
            
            mysqlErrors.forEach(({ code, status, message }) => {
                const error = new Error(message);
                error.code = code;
                
                errorHandler(error, mockReq, mockRes, mockNext);
                
                expect(mockRes.status).toHaveBeenCalledWith(status);
                expect(mockRes.json).toHaveBeenCalledWith({
                    success: false,
                    error: {
                        code: code,
                        message: message
                    },
                    timestamp: expect.any(String),
                    path: '/api/test',
                    method: 'GET',
                    requestId: 'req-123'
                });
                
                // 重置mock
                jest.clearAllMocks();
            });
        });

        test('应该处理自定义状态码和错误代码', () => {
            const error = new Error('自定义错误');
            error.statusCode = 422;
            error.code = 'CUSTOM_ERROR';
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(422);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'CUSTOM_ERROR',
                    message: '自定义错误'
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
        });

        test('应该处理没有用户的请求', () => {
            const error = new Error('一般错误');
            mockReq.user = null;
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(logger.error).toHaveBeenCalledWith('请求处理错误', {
                error: '一般错误',
                stack: error.stack,
                method: 'GET',
                url: '/api/test',
                requestId: 'req-123',
                userId: 'anonymous',
                userAgent: 'Mozilla/5.0',
                ip: '127.0.0.1'
            });
        });

        test('应该处理没有IP地址的请求', () => {
            const error = new Error('一般错误');
            mockReq.ip = null;
            mockReq.connection = { remoteAddress: '192.168.1.1' };
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(logger.error).toHaveBeenCalledWith('请求处理错误', {
                error: '一般错误',
                stack: error.stack,
                method: 'GET',
                url: '/api/test',
                requestId: 'req-123',
                userId: 1,
                userAgent: 'Mozilla/5.0',
                ip: '192.168.1.1'
            });
        });

        test('应该在开发环境下包含错误详情', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';
            
            const error = new Error('开发环境错误');
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '开发环境错误',
                    detail: '开发环境错误',
                    stack: error.stack
                },
                timestamp: expect.any(String),
                path: '/api/test',
                method: 'GET',
                requestId: 'req-123'
            });
            
            // 恢复环境变量
            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('asyncHandler', () => {
        test.skip('应该处理同步函数中的错误', () => {
            const error = new Error('同步错误');
            const syncFn = jest.fn().mockImplementation(() => {
                throw error;
            });
            const wrappedFn = asyncHandler(syncFn);
            
            // 重置mock状态
            jest.clearAllMocks();
            
            // 调用包装后的函数
            wrappedFn(mockReq, mockRes, mockNext);
            
            // 验证next被调用，并且传递了错误
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
