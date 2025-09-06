const path = require('path');
const { PATHS, getEnvPaths } = require('./paths');

// 环境配置
const ENV_CONFIG = {
    // 基础配置
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3001,
    ADMIN_PORT: process.env.ADMIN_PORT || 8081,
    FRONTEND_PORT: process.env.FRONTEND_PORT || 8080,
    
    // 数据库配置
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 3306,
    DB_NAME: process.env.DB_NAME || 'fitchallenge',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    
    // JWT配置
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    
    // 文件上传配置
    UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || '10mb',
    UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES || 'jpg,jpeg,png,gif',
    
    // 日志配置
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || 'app.log',
    
    // 缓存配置
    CACHE_TTL: process.env.CACHE_TTL || 3600,
    
    // 安全配置
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15分钟
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
    
    // 第三方服务配置
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME || '',
    
    // 邮件配置
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    
    // 支付配置
    PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY || 'test',
    PAYMENT_API_KEY: process.env.PAYMENT_API_KEY || '',
    PAYMENT_SECRET: process.env.PAYMENT_SECRET || '',
};

// 根据环境获取路径配置
const envPaths = getEnvPaths();

// 完整配置对象
const config = {
    ...ENV_CONFIG,
    paths: PATHS,
    envPaths,
    
    // 开发环境特殊配置
    isDevelopment: ENV_CONFIG.NODE_ENV === 'development',
    isProduction: ENV_CONFIG.NODE_ENV === 'production',
    isTest: ENV_CONFIG.NODE_ENV === 'test',
    
    // 服务器配置
    server: {
        port: ENV_CONFIG.PORT,
        adminPort: ENV_CONFIG.ADMIN_PORT,
        frontendPort: ENV_CONFIG.FRONTEND_PORT,
        corsOrigin: ENV_CONFIG.CORS_ORIGIN,
    },
    
    // 数据库配置
    database: {
        host: ENV_CONFIG.DB_HOST,
        port: ENV_CONFIG.DB_PORT,
        name: ENV_CONFIG.DB_NAME,
        user: ENV_CONFIG.DB_USER,
        password: ENV_CONFIG.DB_PASSWORD,
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
    },
    
    // JWT配置
    jwt: {
        secret: ENV_CONFIG.JWT_SECRET,
        expiresIn: ENV_CONFIG.JWT_EXPIRES_IN,
        algorithm: 'HS256',
    },
    
    // 文件上传配置
    upload: {
        maxSize: ENV_CONFIG.UPLOAD_MAX_SIZE,
        allowedTypes: ENV_CONFIG.UPLOAD_ALLOWED_TYPES.split(','),
        directory: envPaths.UPLOAD_DIR,
    },
    
    // 日志配置
    logging: {
        level: ENV_CONFIG.LOG_LEVEL,
        file: path.join(envPaths.LOG_DIR, ENV_CONFIG.LOG_FILE),
        directory: envPaths.LOG_DIR,
    },
    
    // 缓存配置
    cache: {
        ttl: ENV_CONFIG.CACHE_TTL,
        checkPeriod: 600,
    },
    
    // 安全配置
    security: {
        rateLimit: {
            windowMs: ENV_CONFIG.RATE_LIMIT_WINDOW,
            max: ENV_CONFIG.RATE_LIMIT_MAX,
        },
        cors: {
            origin: ENV_CONFIG.CORS_ORIGIN,
            credentials: true,
        },
    },
    
    // 第三方服务配置
    services: {
        telegram: {
            botToken: ENV_CONFIG.TELEGRAM_BOT_TOKEN,
            botUsername: ENV_CONFIG.TELEGRAM_BOT_USERNAME,
        },
        email: {
            host: ENV_CONFIG.SMTP_HOST,
            port: ENV_CONFIG.SMTP_PORT,
            user: ENV_CONFIG.SMTP_USER,
            pass: ENV_CONFIG.SMTP_PASS,
        },
        payment: {
            gateway: ENV_CONFIG.PAYMENT_GATEWAY,
            apiKey: ENV_CONFIG.PAYMENT_API_KEY,
            secret: ENV_CONFIG.PAYMENT_SECRET,
        },
    },
};

module.exports = config;
