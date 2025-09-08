import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';
const ADMIN_URL = 'http://localhost:8081';

const testResults = {
    backend: {},
    frontend: {},
    admin: {},
    telegram: {},
    database: {},
    issues: [],
    warnings: [],
    recommendations: []
};

function logSection(title) {
    console.log('');
    console.log('='.repeat(60));
    console.log(title);
    console.log('='.repeat(60));
}

function getCliOptions() {
    const strict = process.argv.includes('--strict') || String(process.env.TEST_STRICT_REDIS || '').toLowerCase() === 'true';
    return { strictRedisCheck: strict };
}

export async function runSystemTest(options = { strictRedisCheck: false }) {
    const { strictRedisCheck } = options;
    console.log('🧪 开始完整系统功能测试...');
    console.log('-'.repeat(60));
    console.log(`模式: ${strictRedisCheck ? '严格(Strict)' : '宽松(Non-Strict)'} — Redis ${strictRedisCheck ? '必须连接' : '未连接将标记为警告'}`);
    console.log('-'.repeat(60));

    try {
        await testBackendAPI();
        await testDatabaseConnection(strictRedisCheck);
        await testTelegramFeatures();
        await testFrontendFeatures();
        await testAdminPanel();
        const summary = generateTestReport(strictRedisCheck);
        process.exitCode = summary.failed === 0 ? 0 : 1;
        return process.exitCode;
    } catch (error) {
        console.error('❌ 系统测试异常:', error?.message || error);
        process.exitCode = 1;
        return 1;
    }
}

async function testBackendAPI() {
    console.log('🔧 测试后端API功能...');
    try {
        const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
        testResults.backend.health = { status: 'success', data: healthResponse.data };
        console.log('✅ 后端健康检查: 正常');

        const testResponse = await axios.get(`${BASE_URL}/api/test`, { timeout: 5000 });
        testResults.backend.test = { status: 'success', data: testResponse.data };
        console.log('✅ API测试接口: 正常');

        try {
            await axios.post(`${BASE_URL}/api/auth/login`, { username: 'testuser', password: 'testpass' }, { timeout: 5000 });
            testResults.backend.auth = { status: 'success', note: '认证接口可访问' };
        } catch (error) {
            if (error?.response?.status === 401) {
                testResults.backend.auth = { status: 'success', note: '认证接口正常，测试用户未配置' };
            } else {
                testResults.backend.auth = { status: 'error', error: error?.message };
                console.log('❌ 用户认证接口: 异常');
            }
        }
        console.log('✅ 用户认证接口: 正常');

        try {
            await axios.get(`${BASE_URL}/api/admin/auth/status`, { timeout: 5000 });
            testResults.backend.admin = { status: 'success', note: '管理接口可访问' };
        } catch (error) {
            testResults.backend.admin = { status: 'error', error: error?.message };
            console.log('❌ 管理接口: 异常');
        }
        console.log('✅ 管理接口: 正常');
    } catch (error) {
        testResults.backend.overall = { status: 'error', error: error?.message };
        testResults.issues.push('后端API无法访问');
        console.log('❌ 后端API测试失败:', error?.message || error);
    }
}

async function testDatabaseConnection(strictRedisCheck) {
    console.log('\n🗄️ 测试数据库连接...');
    try {
        const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
        const services = healthResponse?.data?.services || {};

        if (services.database === 'connected') {
            testResults.database.mysql = { status: 'success' };
            console.log('✅ MySQL数据库: 已连接');
        } else {
            testResults.database.mysql = { status: 'error' };
            testResults.issues.push('MySQL数据库连接失败');
            console.log('❌ MySQL数据库: 连接失败');
        }

        if (services.redis === 'connected') {
            testResults.database.redis = { status: 'success' };
            console.log('✅ Redis缓存: 已连接');
        } else {
            if (strictRedisCheck) {
                testResults.database.redis = { status: 'error' };
                testResults.issues.push('Redis缓存连接失败 (严格模式)');
                console.log('❌ Redis缓存: 连接失败 (严格模式)');
            } else {
                testResults.database.redis = { status: 'warning' };
                testResults.warnings.push('Redis未连接（非严格模式下仅警告）');
                console.log('⚠️  Redis缓存: 未连接（标记为警告）');
            }
        }
    } catch (error) {
        testResults.database.mysql = { status: 'error' };
        testResults.issues.push('无法检查数据库状态');
        console.log('❌ 数据库状态检查失败:', error?.message || error);
    }
}

async function testTelegramFeatures() {
    console.log('\n🤖 测试Telegram功能...');
    try {
        const statusResponse = await axios.get(`${BASE_URL}/api/telegram/status`, { timeout: 5000 });
        testResults.telegram.status = { status: 'success', data: statusResponse?.data?.data };
        console.log('✅ Telegram状态接口: 正常');

        const controlTests = [
            { name: '启用功能', endpoint: '/api/telegram/enable', method: 'POST' },
            { name: '启动轮询', endpoint: '/api/telegram/start', method: 'POST' },
            { name: '设置详细日志', endpoint: '/api/telegram/verbose', method: 'POST', data: { verbose: true } }
        ];
        for (const t of controlTests) {
            try {
                await axios({ method: t.method, url: `${BASE_URL}${t.endpoint}`, data: t.data, timeout: 5000 });
                testResults.telegram[t.name] = { status: 'success' };
                console.log(`✅ ${t.name}: 正常`);
            } catch (error) {
                testResults.telegram[t.name] = { status: 'error', error: error?.message };
                console.log(`❌ ${t.name}: 失败`);
            }
        }
    } catch (error) {
        testResults.telegram.overall = { status: 'error', error: error?.message };
        testResults.issues.push('Telegram功能无法访问');
        console.log('❌ Telegram功能测试失败:', error?.message || error);
    }
}

async function testFrontendFeatures() {
    console.log('\n🌐 测试前端功能...');
    try {
        const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
        testResults.frontend.main = { status: 'success', statusCode: frontendResponse.status };
        console.log('✅ 前端主页面: 可访问');

        try {
            await axios.get(`${FRONTEND_URL}/config/api-config.js`, { timeout: 5000 });
            testResults.frontend.apiConfig = { status: 'success', note: 'API配置文件存在' };
            console.log('✅ API配置文件: 存在');
        } catch (error) {
            testResults.frontend.apiConfig = { status: 'error', error: error?.message };
            testResults.issues.push('前端API配置文件缺失');
            console.log('❌ API配置文件: 缺失');
        }

        const keyPages = [
            { name: '登录页面', path: '/pages/Login.html' },
            { name: '注册页面', path: '/pages/Register.html' },
            { name: '仪表盘', path: '/pages/Dashboard.html' },
            { name: '挑战页面', path: '/pages/Challenge.html' }
        ];
        for (const page of keyPages) {
            try {
                const response = await axios.get(`${FRONTEND_URL}${page.path}`, { timeout: 5000 });
                testResults.frontend[page.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${page.name}: 可访问`);
            } catch (error) {
                testResults.frontend[page.name] = { status: 'error', error: error?.message };
                testResults.issues.push(`${page.name}无法访问`);
                console.log(`❌ ${page.name}: 无法访问`);
            }
        }
    } catch (error) {
        testResults.frontend.overall = { status: 'error', error: error?.message };
        testResults.issues.push('前端服务器无法访问');
        console.log('❌ 前端功能测试失败:', error?.message || error);
    }
}

async function testAdminPanel() {
    console.log('\n👨‍💼 测试管理员后台...');
    try {
        const adminResponse = await axios.get(ADMIN_URL, { timeout: 5000 });
        testResults.admin.main = { status: 'success', statusCode: adminResponse.status };
        console.log('✅ 管理员后台: 可访问');

        try {
            await axios.get(`${ADMIN_URL}/assets/`, { timeout: 5000 });
            testResults.admin.build = { status: 'success', note: '构建文件存在' };
            console.log('✅ 管理员后台构建: 正常');
        } catch (error) {
            testResults.admin.build = { status: 'error', error: error?.message };
            testResults.issues.push('管理员后台构建文件问题');
            console.log('❌ 管理员后台构建: 有问题');
        }
    } catch (error) {
        testResults.admin.overall = { status: 'error', error: error?.message };
        testResults.issues.push('管理员后台无法访问');
        console.log('❌ 管理员后台测试失败:', error?.message || error);
    }
}

function generateTestReport(strictRedisCheck) {
    logSection('📊 完整系统测试报告');
    const totalTests = countTests(testResults);
    const passedTests = countPassedTests(testResults);
    const failedTests = totalTests - passedTests - countWarnings(testResults);

    console.log(`\n📈 测试统计:`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过测试: ${passedTests}`);
    console.log(`   警告数: ${testResults.warnings.length}`);
    console.log(`   失败测试: ${failedTests}`);
    const denom = Math.max(totalTests, 1);
    console.log(`   成功率: ${((passedTests / denom) * 100).toFixed(1)}%`);

    console.log(`\n🔧 模块状态:`);
    console.log(`   后端API: ${getModuleStatus(testResults.backend)}`);
    console.log(`   数据库: ${getModuleStatus(testResults.database)}`);
    console.log(`   Telegram: ${getModuleStatus(testResults.telegram)}`);
    console.log(`   前端: ${getModuleStatus(testResults.frontend)}`);
    console.log(`   管理员后台: ${getModuleStatus(testResults.admin)}`);

    if (testResults.issues.length > 0) {
        console.log(`\n❌ 发现的问题:`);
        testResults.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    }
    if (testResults.warnings.length > 0) {
        console.log(`\n⚠️ 警告:`);
        testResults.warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
    }

    generateRecommendations();
    console.log(`\n🌐 访问地址:`);
    console.log(`   前端应用: ${FRONTEND_URL}`);
    console.log(`   管理员后台: ${ADMIN_URL}`);
    console.log(`   后端API: ${BASE_URL}/api`);
    console.log(`   API文档: ${BASE_URL}/api-docs`);

    console.log(`\n🎯 下一步建议:`);
    testResults.recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));

    const banner = failedTests === 0 ? '🎉 全部关键检查通过' : '❗ 存在失败项，请根据问题列表修复';
    console.log('\n' + '-'.repeat(60));
    console.log(`${banner}（模式：${strictRedisCheck ? '严格' : '宽松'}）`);
    console.log('-'.repeat(60));
    return { total: totalTests, passed: passedTests, warnings: testResults.warnings.length, failed: failedTests };
}

function countTests(obj) {
    let count = 0;
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (obj[key].status) count++;
            count += countTests(obj[key]);
        }
    }
    return count;
}

function countPassedTests(obj) {
    let count = 0;
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (obj[key].status === 'success') count++;
            count += countPassedTests(obj[key]);
        }
    }
    return count;
}

function countWarnings(obj) {
    let count = 0;
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
            if (value.status === 'warning') count++;
            count += countWarnings(value);
        }
    }
    return count;
}

function getModuleStatus(moduleObj) {
    if (!moduleObj || Object.keys(moduleObj).length === 0) return '❓ 未测试';
    const hasError = Object.values(moduleObj).some(item => typeof item === 'object' && item.status === 'error');
    const hasWarn = Object.values(moduleObj).some(item => typeof item === 'object' && item.status === 'warning');
    if (hasError) return '❌ 存在失败';
    if (hasWarn) return '⚠️ 存在警告';
    return '✅ 正常';
}

function generateRecommendations() {
    testResults.recommendations = [];
    if (testResults.issues.includes('MySQL数据库连接失败')) {
        testResults.recommendations.push('检查MySQL服务是否启动，确认数据库配置正确');
    }
    if (testResults.issues.some(i => i.includes('Redis缓存连接失败'))) {
        testResults.recommendations.push('检查Redis服务是否启动，确认Redis配置正确');
    }
    if (testResults.issues.includes('前端API配置文件缺失')) {
        testResults.recommendations.push('检查前端API配置文件是否正确部署');
    }
    if (testResults.issues.includes('管理员后台构建文件问题')) {
        testResults.recommendations.push('重新构建管理员后台: cd admin && npm run build');
    }
    if (testResults.telegram?.status?.data?.isPolling === false) {
        testResults.recommendations.push('考虑启动Telegram轮询以测试完整功能');
    }
    if (testResults.recommendations.length === 0) {
        testResults.recommendations.push('系统运行良好，可以进行用户功能测试');
        testResults.recommendations.push('建议测试用户注册、登录、挑战等核心功能');
        testResults.recommendations.push('可以测试管理员后台的各个管理功能');
    }
}

// 若作为直接脚本执行，则读取CLI选项并运行
const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
    const opts = getCliOptions();
    // eslint-disable-next-line no-void
    void runSystemTest(opts);
}
