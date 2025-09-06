// 前端版本配置文件
const VERSION_CONFIG = {
    // 主版本号
    VERSION: '3.0.2',
    
    // 构建时间戳
    BUILD_TIME: '20250110100000',
    BUILD_TIME_READABLE: '10:00:00',
    
    // 版本描述
    DESCRIPTION: 'FitChallenge用户前端v3.0.2 - 统一版本控制系统',
    
    // 统一版本控制器支持
    USE_UNIFIED_VERSION: true,
    
    // 最近更新记录
    CHANGELOG: [
        '[2025-01-10] 实现统一版本控制系统',
        '[2025-01-10] 添加缓存失效机制',
        '[2025-01-10] 支持版本化资源加载',
        '[2025-08-19] 优化前端模块化架构',
        '[2025-08-19] 统一API端口配置为3002',
        '[2025-08-19] 添加CORS配置支持',
        '[2025-08-19] 实现完整的JWT认证系统'
    ]
};

// 导出配置
export default VERSION_CONFIG;

// 兼容性导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VERSION_CONFIG;
} else if (typeof window !== 'undefined') {
    window.VERSION_CONFIG = VERSION_CONFIG;
}
