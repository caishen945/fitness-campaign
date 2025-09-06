// 系统配置文件
require('dotenv').config();
const { PATHS, getEnvPaths } = require('../config/paths');

module.exports = {
    // 服务器配置
    port: process.env.PORT || 3001,
    
    // 路径配置
    paths: PATHS,
    envPaths: getEnvPaths(),
    
    // 环境配置
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    
    // JWT 配置
    jwtSecret: process.env.JWT_SECRET || 'fitchallenge_secret_key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    
    // 数据库配置
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'fc137888', // 请替换为您在安装 MariaDB 时设置的实际密码
        database: process.env.DB_NAME || 'fitchallenge'
    },
    
    // TRC20 钱包配置
    trc20: {
        apiKey: process.env.TRC20_API_KEY || 'your_trc20_api_key'
    }
};