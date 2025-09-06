// FitChallenge API 配置文件
// 统一管理所有API端点和端口配置

const API_CONFIG = {
    // 开发环境配置
    development: {
        baseUrl: 'http://localhost:3000',
        apiPath: '/api',
        ports: {
            backend: 3000,
            frontend: 8080,
            admin: 8081
        }
    },
    
    // 生产环境配置
    production: {
        baseUrl: 'https://api.fitchallenge.com',
        apiPath: '/api',
        ports: {
            backend: 443,
            frontend: 80,
            admin: 8081
        }
    }
};

// 根据环境变量或当前域名自动选择配置
function getApiConfig() {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.port === '8080' ||
                         window.location.port === '8081';
    
    return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
}

// 导出配置
const config = getApiConfig();

// 为前端和管理后台提供全局配置
if (typeof window !== 'undefined') {
    window.API_CONFIG = config;
    window.API_BASE_URL = config.baseUrl;
}

// 导出配置对象
export default config;


