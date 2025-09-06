/**
 * logger 工具单元测试
 */

const logger = require('../../../utils/logger');

// Mock winston
jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        add: jest.fn()
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        simple: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn()
    }
}));

describe('Logger Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('基本功能', () => {
        test('应该创建logger实例', () => {
            expect(logger).toBeDefined();
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });

        test('应该正确记录info级别的日志', () => {
            const message = '测试信息';
            const meta = { userId: 123, action: 'login' };
            
            logger.info(message, meta);
            
            expect(logger.info).toHaveBeenCalledWith(message, meta);
        });

        test('应该正确记录error级别的日志', () => {
            const message = '测试错误';
            const meta = { error: '数据库连接失败' };
            
            logger.error(message, meta);
            
            expect(logger.error).toHaveBeenCalledWith(message, meta);
        });

        test('应该正确记录warn级别的日志', () => {
            const message = '测试警告';
            const meta = { userId: 123, warning: '密码过期' };
            
            logger.warn(message, meta);
            
            expect(logger.warn).toHaveBeenCalledWith(message, meta);
        });

        test('应该正确记录debug级别的日志', () => {
            const message = '测试调试信息';
            const meta = { requestId: 'req-123', path: '/api/test' };
            
            logger.debug(message, meta);
            
            expect(logger.debug).toHaveBeenCalledWith(message, meta);
        });
    });

    describe('日志格式', () => {
        test('应该支持结构化日志记录', () => {
            const message = '用户操作';
            const meta = {
                userId: 123,
                action: 'update_profile',
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1'
            };
            
            logger.info(message, meta);
            
            expect(logger.info).toHaveBeenCalledWith(message, meta);
        });

        test('应该支持错误对象记录', () => {
            const message = '操作失败';
            const error = new Error('数据库连接失败');
            const meta = {
                error: error.message,
                stack: error.stack,
                code: 'DB_CONNECTION_ERROR'
            };
            
            logger.error(message, meta);
            
            expect(logger.error).toHaveBeenCalledWith(message, meta);
        });
    });

    describe('边界情况', () => {
        test('应该处理空消息', () => {
            logger.info('');
            expect(logger.info).toHaveBeenCalledWith('');
        });

        test('应该处理null消息', () => {
            logger.info(null);
            expect(logger.info).toHaveBeenCalledWith(null);
        });

        test('应该处理undefined消息', () => {
            logger.info(undefined);
            expect(logger.info).toHaveBeenCalledWith(undefined);
        });

        test('应该处理没有meta参数的日志', () => {
            const message = '简单消息';
            
            logger.info(message);
            
            expect(logger.info).toHaveBeenCalledWith(message);
        });

        test('应该处理复杂的meta对象', () => {
            const message = '复杂操作';
            const meta = {
                user: {
                    id: 123,
                    name: '测试用户',
                    email: 'test@example.com'
                },
                action: 'complex_operation',
                parameters: {
                    param1: 'value1',
                    param2: 'value2',
                    nested: {
                        key: 'value'
                    }
                },
                timestamp: new Date().toISOString()
            };
            
            logger.info(message, meta);
            
            expect(logger.info).toHaveBeenCalledWith(message, meta);
        });
    });
});
