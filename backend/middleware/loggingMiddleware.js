const logger = require('../utils/logger');

// 请求日志中间件
function requestLogger(req, res, next) {
    const startTime = Date.now();
    
    // 记录请求开始
    logger.apiRequest(
        req.method, 
        req.originalUrl, 
        req.headers, 
        req.body,
        req.ip || req.connection.remoteAddress
    );

    // 拦截响应
    const originalSend = res.send;
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        const responseSize = Buffer.byteLength(data || '', 'utf8');
        
        // 记录响应
        logger.apiResponse(
            req.method,
            req.originalUrl,
            res.statusCode,
            responseTime,
            responseSize
        );

        // 如果是错误响应，记录详细信息
        if (res.statusCode >= 400) {
            logger.error('API-ERROR', `${req.method} ${req.originalUrl} - ${res.statusCode}`, {
                requestBody: logger.sanitizeBody(req.body),
                responseBody: data ? JSON.parse(data) : null,
                headers: logger.sanitizeHeaders(req.headers),
                ip: req.ip || req.connection.remoteAddress
            });
        }

        originalSend.call(this, data);
    };

    next();
}

// 错误处理中间件
function errorLogger(err, req, res, next) {
    logger.error('UNHANDLED-ERROR', `${req.method} ${req.originalUrl}`, {
        error: err.message,
        stack: err.stack,
        requestBody: logger.sanitizeBody(req.body),
        headers: logger.sanitizeHeaders(req.headers),
        ip: req.ip || req.connection.remoteAddress
    });

    // 继续到下一个错误处理器
    next(err);
}

// VIP操作专用日志中间件
function vipOperationLogger(operation) {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function(data) {
            const success = res.statusCode < 400;
            const responseData = data ? JSON.parse(data) : null;
            
            logger.vipOperation(
                operation,
                req.body?.userId,
                req.admin?.id,
                req.params?.id,
                logger.sanitizeBody(req.body),
                success,
                success ? null : responseData
            );

            originalSend.call(this, data);
        };
        next();
    };
}

module.exports = {
    requestLogger,
    errorLogger,
    vipOperationLogger
};
