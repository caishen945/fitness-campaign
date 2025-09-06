const path = require('path');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 各模块目录
const PATHS = {
    // 根目录
    ROOT: ROOT_DIR,
    
    // 后端相关
    BACKEND: path.join(ROOT_DIR, 'backend'),
    BACKEND_CONFIG: path.join(ROOT_DIR, 'backend', 'config'),
    BACKEND_CONTROLLERS: path.join(ROOT_DIR, 'backend', 'controllers'),
    BACKEND_MODELS: path.join(ROOT_DIR, 'backend', 'models'),
    BACKEND_SERVICES: path.join(ROOT_DIR, 'backend', 'services'),
    BACKEND_ROUTES: path.join(ROOT_DIR, 'backend', 'routes'),
    BACKEND_MIDDLEWARE: path.join(ROOT_DIR, 'backend', 'middleware'),
    BACKEND_UTILS: path.join(ROOT_DIR, 'backend', 'utils'),
    
    // 前端相关
    FRONTEND: path.join(ROOT_DIR, 'frontend'),
    FRONTEND_PUBLIC: path.join(ROOT_DIR, 'frontend', 'public'),
    FRONTEND_SRC: path.join(ROOT_DIR, 'frontend', 'public', 'src'),
    FRONTEND_PAGES: path.join(ROOT_DIR, 'frontend', 'public', 'pages'),
    FRONTEND_SERVICES: path.join(ROOT_DIR, 'frontend', 'public', 'services'),
    FRONTEND_ASSETS: path.join(ROOT_DIR, 'frontend', 'public', 'assets'),
    
    // 管理后台相关
    ADMIN: path.join(ROOT_DIR, 'admin'),
    ADMIN_PUBLIC: path.join(ROOT_DIR, 'admin', 'public'),
    ADMIN_SRC: path.join(ROOT_DIR, 'admin', 'public', 'src'),
    ADMIN_PAGES: path.join(ROOT_DIR, 'admin', 'public', 'src', 'pages'),
    ADMIN_SERVICES: path.join(ROOT_DIR, 'admin', 'public', 'src', 'services'),
    
    // 数据库相关
    DATABASE: path.join(ROOT_DIR, 'database'),
    DATABASE_SCHEMAS: path.join(ROOT_DIR, 'database', 'schemas'),
    DATABASE_MIGRATIONS: path.join(ROOT_DIR, 'database', 'migrations'),
    
    // 脚本相关
    SCRIPTS: path.join(ROOT_DIR, 'scripts'),
    
    // 文档相关
    DOCS: path.join(ROOT_DIR, 'docs'),
};

// 环境变量配置
const ENV_PATHS = {
    // 开发环境
    DEV: {
        STATIC_DIR: PATHS.FRONTEND_PUBLIC,
        UPLOAD_DIR: path.join(ROOT_DIR, 'uploads', 'dev'),
        LOG_DIR: path.join(ROOT_DIR, 'logs', 'dev'),
    },
    
    // 生产环境
    PROD: {
        STATIC_DIR: path.join(ROOT_DIR, 'dist', 'frontend'),
        UPLOAD_DIR: path.join(ROOT_DIR, 'uploads', 'prod'),
        LOG_DIR: path.join(ROOT_DIR, 'logs', 'prod'),
    }
};

// 获取当前环境的路径配置
const getEnvPaths = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? ENV_PATHS.PROD : ENV_PATHS.DEV;
};

// 路径解析工具函数
const resolvePath = (relativePath) => path.resolve(ROOT_DIR, relativePath);
const joinPaths = (...paths) => path.join(...paths);

// 模块路径别名（用于简化导入）
const ALIASES = {
    '@root': ROOT_DIR,
    '@backend': PATHS.BACKEND,
    '@frontend': PATHS.FRONTEND,
    '@admin': PATHS.ADMIN,
    '@config': PATHS.BACKEND_CONFIG,
    '@controllers': PATHS.BACKEND_CONTROLLERS,
    '@models': PATHS.BACKEND_MODELS,
    '@services': PATHS.BACKEND_SERVICES,
    '@routes': PATHS.BACKEND_ROUTES,
    '@middleware': PATHS.BACKEND_MIDDLEWARE,
    '@utils': PATHS.BACKEND_UTILS,
    '@pages': PATHS.FRONTEND_PAGES,
    '@frontend-services': PATHS.FRONTEND_SERVICES,
    '@admin-pages': PATHS.ADMIN_PAGES,
    '@admin-services': PATHS.ADMIN_SERVICES,
};

module.exports = {
    PATHS,
    ENV_PATHS,
    getEnvPaths,
    resolvePath,
    joinPaths,
    ALIASES,
    ROOT_DIR
};
