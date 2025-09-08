#!/usr/bin/env node

/**
 * FitChallenge 环境配置检查脚本
 * 验证所有必需的环境变量是否已正确配置
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

// 日志函数
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.magenta}${msg}${colors.reset}\n`)
};

// 配置检查规则
const configChecks = {
    // 必填配置
    required: [
        { key: 'DB_PASSWORD', name: '数据库密码', description: '数据库连接必需' },
        { key: 'JWT_SECRET', name: 'JWT密钥', description: '用户认证必需', minLength: 32 },
        { key: 'TELEGRAM_BOT_TOKEN', name: 'Telegram Bot Token', description: 'Telegram功能必需' },
        { key: 'TRC20_API_KEY', name: 'TRC20 API密钥', description: '钱包功能必需' }
    ],
    
    // 重要配置
    important: [
        { key: 'SMTP_HOST', name: 'SMTP服务器', description: '邮件功能需要' },
        { key: 'SMTP_USER', name: 'SMTP用户', description: '邮件功能需要' },
        { key: 'SMTP_PASS', name: 'SMTP密码', description: '邮件功能需要' },
        { key: 'PAYMENT_API_KEY', name: '支付API密钥', description: '支付功能需要（生产环境）' },
        { key: 'PAYMENT_SECRET', name: '支付密钥', description: '支付功能需要（生产环境）' }
    ],
    
    // 可选配置
    optional: [
        { key: 'NODE_ENV', name: '运行环境', default: 'development' },
        { key: 'PORT', name: '后端端口', default: '3001' },
        { key: 'ADMIN_PORT', name: '管理端口', default: '8081' },
        { key: 'FRONTEND_PORT', name: '前端端口', default: '8080' },
        { key: 'DB_HOST', name: '数据库主机', default: 'localhost' },
        { key: 'DB_PORT', name: '数据库端口', default: '3306' },
        { key: 'DB_NAME', name: '数据库名', default: 'fitchallenge' },
        { key: 'DB_USER', name: '数据库用户', default: 'root' },
        { key: 'CORS_ORIGIN', name: 'CORS源', default: '*' }
    ]
};

// 加载环境变量
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        log.error('.env 文件不存在');
        log.info('请先复制 .env.example 为 .env 并填入配置');
        return null;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    return envVars;
}

// 检查必填配置
function checkRequired(envVars) {
    log.title('📋 检查必填配置');
    let allPassed = true;
    
    configChecks.required.forEach(check => {
        const value = envVars[check.key];
        if (!value || value === '') {
            log.error(`${check.name} (${check.key}) 未配置 - ${check.description}`);
            allPassed = false;
        } else if (check.minLength && value.length < check.minLength) {
            log.warning(`${check.name} (${check.key}) 长度不足 ${check.minLength} 位`);
            allPassed = false;
        } else {
            log.success(`${check.name} (${check.key}) 已配置`);
        }
    });
    
    return allPassed;
}

// 检查重要配置
function checkImportant(envVars) {
    log.title('🔧 检查重要配置');
    let emailConfigured = true;
    let paymentConfigured = true;
    
    // 检查邮件配置
    const emailKeys = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    emailKeys.forEach(key => {
        const value = envVars[key];
        if (!value || value === '') {
            if (emailConfigured) {
                log.warning('邮件服务配置不完整 - 影响邮件发送功能');
                emailConfigured = false;
            }
        }
    });
    
    if (emailConfigured) {
        log.success('邮件服务配置完整');
    }
    
    // 检查支付配置
    const paymentKeys = ['PAYMENT_API_KEY', 'PAYMENT_SECRET'];
    paymentKeys.forEach(key => {
        const value = envVars[key];
        if (!value || value === '') {
            if (paymentConfigured) {
                log.warning('支付网关配置不完整 - 影响支付功能');
                paymentConfigured = false;
            }
        }
    });
    
    if (paymentConfigured) {
        log.success('支付网关配置完整');
    }
    
    return emailConfigured && paymentConfigured;
}

// 检查可选配置
function checkOptional(envVars) {
    log.title('⚙️ 检查可选配置');
    
    configChecks.optional.forEach(check => {
        const value = envVars[check.key];
        if (!value || value === '') {
            log.info(`${check.name} (${check.key}) 使用默认值: ${check.default || '未设置'}`);
        } else {
            log.success(`${check.name} (${check.key}) 已配置: ${value}`);
        }
    });
}

// 生成配置报告
function generateReport(envVars, requiredPassed, importantPassed) {
    log.title('📊 配置检查报告');
    
    console.log(`配置文件: ${colors.cyan}.env${colors.reset}`);
    console.log(`必填配置: ${requiredPassed ? colors.green + '通过' : colors.red + '未通过'}${colors.reset}`);
    console.log(`重要配置: ${importantPassed ? colors.green + '完整' : colors.yellow + '不完整'}${colors.reset}`);
    console.log(`运行环境: ${colors.cyan}${envVars.NODE_ENV || 'development'}${colors.reset}`);
    
    if (requiredPassed) {
        log.success('项目可以启动');
        if (!importantPassed) {
            log.warning('部分功能可能不可用，建议完善重要配置');
        }
    } else {
        log.error('项目无法启动，请完善必填配置');
    }
    
    console.log(`\n${colors.blue}📖 配置文档: ENVIRONMENT_CONFIG_GUIDE.md${colors.reset}`);
    console.log(`${colors.blue}📝 配置模板: .env.example${colors.reset}`);
}

// 主函数
function main() {
    console.log(`${colors.magenta}🔍 FitChallenge 环境配置检查${colors.reset}`);
    console.log(`${colors.cyan}====================================${colors.reset}\n`);
    
    // 加载环境变量
    const envVars = loadEnvFile();
    if (!envVars) {
        return;
    }
    
    // 执行检查
    const requiredPassed = checkRequired(envVars);
    const importantPassed = checkImportant(envVars);
    checkOptional(envVars);
    
    // 生成报告
    generateReport(envVars, requiredPassed, importantPassed);
    
    // 退出码
    process.exit(requiredPassed ? 0 : 1);
}

// 运行检查
if (require.main === module) {
    main();
}

module.exports = { loadEnvFile, checkRequired, checkImportant, checkOptional };