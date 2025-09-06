/**
 * 增强的统一错误处理中间件
 * 提供标准化的错误响应格式和结构化日志记录
 */

const logger = require('../utils/logger');

// MySQL错误代码映射
const MYSQL_ERROR_CODES = {
    'ER_DUP_ENTRY': { status: 409, message: '数据已存在' },
    'ER_BAD_NULL_ERROR': { status: 400, message: '必填字段不能为空' },
    'ER_NO_REFERENCED_ROW': { status: 400, message: '引用的记录不存在' },
    'ER_ROW_IS_REFERENCED': { status: 400, message: '该记录被其他数据引用，无法删除' },
    'ER_NO_SUCH_TABLE': { status: 500, message: '表不存在' },
    'ER_PARSE_ERROR': { status: 500, message: 'SQL语法错误' },
    'ER_ACCESS_DENIED_ERROR': { status: 500, message: '数据库访问被拒绝' },
    'ER_LOCK_WAIT_TIMEOUT': { status: 500, message: '数据库锁等待超时' },
    'ER_LOCK_DEADLOCK': { status: 500, message: '数据库死锁' },
    'ER_DATA_TOO_LONG': { status: 400, message: '数据超出长度限制' },
    'ECONNREFUSED': { status: 500, message: '无法连接到数据库服务器' },
    'PROTOCOL_CONNECTION_LOST': { status: 500, message: '数据库连接已断开' },
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR': { status: 500, message: '数据库发生致命错误' },
    'ER_WRONG_VALUE_COUNT_ON_ROW': { status: 400, message: '提供的值与字段数量不匹配' }
};

const errorHandler = (err, req, res, next) => {
    // 使用结构化日志记录错误
    logger.error('请求处理错误', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
        userId: req.user ? req.user.id : 'anonymous',
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
    });

    // 根据错误类型设置状态码和消息
    let statusCode = err.statusCode || 500;
    let message = err.message || '服务器内部错误';
    let errorCode = err.code || 'INTERNAL_SERVER_ERROR';

    // 处理特定类型的错误
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = '数据验证失败';
        errorCode = 'VALIDATION_ERROR';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = '未授权访问';
        errorCode = 'UNAUTHORIZED';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = '禁止访问';
        errorCode = 'FORBIDDEN';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = '资源未找到';
        errorCode = 'NOT_FOUND';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = '令牌已过期';
        errorCode = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = '无效的令牌';
        errorCode = 'INVALID_TOKEN';
    } else if (err.code && MYSQL_ERROR_CODES[err.code]) {
        // 处理MySQL特定错误
        const mysqlError = MYSQL_ERROR_CODES[err.code];
        statusCode = mysqlError.status;
        message = mysqlError.message;
        errorCode = err.code;
    }

    // 构建错误响应
    const errorResponse = {
        success: false,
        error: {
            code: errorCode,
            message: message,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        requestId: req.id
    };

    // 开发环境添加错误堆栈
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.detail = err.message;
        errorResponse.error.stack = err.stack;
    }

    // 发送错误响应
    res.status(statusCode).json(errorResponse);
};

// 异步错误包装器
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 自定义错误类
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = '数据验证失败', details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.details = details;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = '未授权访问') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message = '禁止访问') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends AppError {
    constructor(message = '资源未找到') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = '资源冲突') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = '数据库操作失败', originalError = null) {
        const code = originalError && originalError.code ? originalError.code : 'DATABASE_ERROR';
        const statusCode = originalError && MYSQL_ERROR_CODES[originalError.code] 
            ? MYSQL_ERROR_CODES[originalError.code].status 
            : 500;
        
        super(message, statusCode, code);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

module.exports = {
    errorHandler,
    asyncHandler,
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    DatabaseError
};