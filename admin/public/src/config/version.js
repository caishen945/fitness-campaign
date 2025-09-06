// 版本配置文件
const VERSION_CONFIG = {
    // 主版本号
    VERSION: '3.2.0',
    
    // 构建时间
    BUILD_TIME: '20250114190000',
    BUILD_TIME_READABLE: '19:00:00',
    
    // 版本描述
    DESCRIPTION: 'FitChallenge管理员系统v3.2.0 - 超级缓存清理版',
    
    // 统一版本控制器支持
    USE_UNIFIED_VERSION: true,
    
    // 最近更新记录
    CHANGELOG: [
        '[2025-01-14] 超级缓存清理版 - 解决构建文件缓存问题',
        '[2025-01-14] 自动检测旧版本文件并强制清理',
        '[2025-01-14] 创建专用缓存清理工具页面',
        '[2025-01-14] 紧急修复导航栏显示问题 - 立即生效版本',
        '[2025-01-14] 实施激进缓存清理策略',
        '[2025-01-14] 添加内嵌导航栏注入机制',
        '[2025-01-10] 实现统一版本控制系统',
        '[2025-01-10] 添加缓存失效机制',
        '[2025-01-10] 集成管理员后台版本管理',
        '[2025-08-19] 修复VIP管理、签到管理、团队管理问题',
        '[2025-08-19] 修复前端和管理员登录问题',
        '[2025-08-19] 统一API端口配置为3000',
        '[2025-08-19] 添加CORS配置支持前端和管理员',
        '[2025-08-19] 实现完整的JWT认证系统',
        '[2025-08-19] 添加权限控制和审计日志',
        '[2025-08-19] 优化前端模块化架构'
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