/**
 * 结构化日志模块
 * 使用winston实现不同级别的日志记录
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// 创建日志记录器
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'fitchallenge-api' },
    transports: [
        // 写入所有日志到文件
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    exitOnError: false
});

// 在开发环境下同时输出到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

// 扩展logger，添加更多上下文信息的方法
logger.requestLogger = (req, message, meta = {}) => {
    return logger.info(message, {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user ? req.user.id : 'anonymous',
        ...meta
    });
};

// 记录API请求的中间件
logger.requestMiddleware = () => {
    return (req, res, next) => {
        // 为每个请求生成唯一ID
        req.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        
        // 记录请求开始
        logger.requestLogger(req, `API请求开始`);
        
        // 记录响应时间
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.requestLogger(req, `API请求完成`, {
                statusCode: res.statusCode,
                duration: `${duration}ms`
            });
        });
        
        next();
    };
};

module.exports = logger;