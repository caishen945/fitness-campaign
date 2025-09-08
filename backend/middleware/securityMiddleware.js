/**
 * 安全中间件
 * 提供安全头、速率限制、CSRF防护等安全功能
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// 通用速率限制
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100个请求
    message: {
        error: '请求过于频繁，请稍后再试',
        retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 跳过预检与低价值上报端点，避免放大效应
    skip: (req) => req.method === 'OPTIONS' || req.path === '/api/logs/admin',
    handler: (req, res) => {
        logger.warn(`速率限制触发 - IP: ${req.ip}, URL: ${req.url}`);
        res.status(429).json({
            error: '请求过于频繁，请稍后再试',
            retryAfter: '15分钟'
        });
    }
});

// 认证相关的严格速率限制
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 每个IP最多5次登录尝试
    message: {
        error: '登录尝试过于频繁，请15分钟后再试',
        retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // 成功的请求不计入限制
    handler: (req, res) => {
        logger.warn(`登录速率限制触发 - IP: ${req.ip}, URL: ${req.url}`);
        res.status(429).json({
            error: '登录尝试过于频繁，请15分钟后再试',
            retryAfter: '15分钟'
        });
    }
});

// API速率限制
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000, // 每个IP最多1000个API请求
    message: {
        error: 'API请求过于频繁，请稍后再试',
        retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 跳过预检与低价值上报端点
    skip: (req) => req.method === 'OPTIONS' || req.path === '/api/logs/admin'
});

// 安全头配置
const securityHeaders = helmet({
    // 内容安全策略
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    
    // 跨站点脚本保护
    crossOriginEmbedderPolicy: false, // 关闭以支持跨域资源
    
    // 其他安全头
    frameguard: { action: 'deny' }, // 防止点击劫持
    hidePoweredBy: true, // 隐藏X-Powered-By头
    hsts: {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true, // 防止IE执行下载文件
    noSniff: true, // 防止MIME类型嗅探
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "same-origin" },
    xssFilter: true // XSS过滤器
});

// CSRF令牌验证中间件
const csrfProtection = (req, res, next) => {
    // 对于GET请求和某些安全的方法，跳过CSRF检查
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // 检查CSRF令牌
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
        logger.warn(`CSRF令牌验证失败 - IP: ${req.ip}, URL: ${req.url}`);
        return res.status(403).json({
            error: 'CSRF令牌无效或缺失'
        });
    }
    
    next();
};

// 生成CSRF令牌
const generateCsrfToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

// 设置CSRF令牌
const setCsrfToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCsrfToken();
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

// IP白名单检查
const ipWhitelist = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [];
const ipWhitelistCheck = (req, res, next) => {
    if (ipWhitelist.length === 0) {
        return next(); // 如果没有配置白名单，则跳过检查
    }
    
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!ipWhitelist.includes(clientIP)) {
        logger.warn(`IP不在白名单中被拒绝 - IP: ${clientIP}, URL: ${req.url}`);
        return res.status(403).json({
            error: '访问被拒绝'
        });
    }
    
    next();
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            ip: req.ip,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer')
        };
        
        if (res.statusCode >= 400) {
            logger.warn('HTTP请求异常', logData);
        } else {
            logger.info('HTTP请求', logData);
        }
    });
    
    next();
};

module.exports = {
    securityHeaders,
    generalLimiter,
    authLimiter,
    apiLimiter,
    csrfProtection,
    setCsrfToken,
    ipWhitelistCheck,
    requestLogger,
    generateCsrfToken
};
