const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';

// 测试结果存储
const testResults = {
    pages: {},
    api: {},
    issues: [],
    recommendations: []
};

let authToken = null;
let testUser = null;

console.log('🌐 开始前端页面功能测试...\n');

// 创建测试用户
async function createTestUser() {
    console.log('👤 创建测试用户...');
    const timestamp = Date.now();
    testUser = {
        email: 'test' + timestamp + '@example.com',
        password: 'Test123456!'
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        if (response.data.message === '注册成功' && response.data.token) {
            authToken = response.data.token;
            console.log('✅ 测试用户创建成功');
            return true;
        }
    } catch (error) {
        console.log('❌ 测试用户创建失败');
        return false;
    }
}

// 测试前端页面加载
async function testFrontendPages() {
    console.log('📄 测试前端页面加载...');
    
    const pages = [
        { name: '首页', path: '/' },
        { name: '登录页', path: '/#login' },
        { name: '注册页', path: '/#register' },
        { name: '个人资料', path: '/#profile' },
        { name: '挑战页面', path: '/#challenge' },
        { name: '排行榜', path: '/#leaderboard' },
        { name: '新闻页面', path: '/#news' },
        { name: '运动历史', path: '/#history' },
        { name: '团队功能', path: '/#team' },
        { name: '成就页面', path: '/#achievements' },
        { name: '签到功能', path: '/#checkin' },
        { name: '钱包功能', path: '/#wallet' },
        { name: 'PK挑战', path: '/#pk' },
        { name: '通知系统', path: '/#notifications' }
    ];
    
    for (const page of pages) {
        try {
            const response = await axios.get(`${FRONTEND_URL}${page.path}`);
            if (response.status === 200) {
                testResults.pages[page.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${page.name}: 可访问`);
            } else {
                testResults.pages[page.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${page.name}访问失败`);
                console.log(`❌ ${page.name}: 访问失败 (${response.status})`);
            }
        } catch (error) {
            testResults.pages[page.name] = { status: 'error', error: error.message };
            testResults.issues.push(`${page.name}访问错误`);
            console.log(`❌ ${page.name}: 访问错误`);
        }
    }
}

// 测试前端核心文件
async function testFrontendCoreFiles() {
    console.log('📁 测试前端核心文件...');
    
    const coreFiles = [
        { name: '应用入口', path: '/src/index.js' },
        { name: '主应用', path: '/src/App.js' },
        { name: 'API服务', path: '/src/services/api.js' },
        { name: 'API配置', path: '/config/api-config.js' },
        { name: '首页组件', path: '/pages/Home.js' },
        { name: '登录组件', path: '/pages/Login.js' },
        { name: '注册组件', path: '/pages/Register.js' },
        { name: '个人资料组件', path: '/pages/Profile.js' },
        { name: '挑战组件', path: '/pages/Challenge.js' },
        { name: '排行榜组件', path: '/pages/Leaderboard.js' },
        { name: '新闻组件', path: '/pages/News.js' },
        { name: '运动历史组件', path: '/pages/History.js' },
        { name: '团队组件', path: '/pages/Team.js' },
        { name: '成就组件', path: '/pages/Achievements.js' },
        { name: '签到组件', path: '/pages/Checkin.js' },
        { name: '钱包组件', path: '/pages/Wallet.js' },
        { name: 'PK挑战组件', path: '/pages/PKChallenge.js' },
        { name: '通知组件', path: '/pages/Notifications.js' }
    ];
    
    for (const file of coreFiles) {
        try {
            const response = await axios.get(`${FRONTEND_URL}${file.path}`);
            if (response.status === 200) {
                testResults.pages[file.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${file.name}: 可访问`);
            } else {
                testResults.pages[file.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${file.name}访问失败`);
                console.log(`❌ ${file.name}: 访问失败 (${response.status})`);
            }
        } catch (error) {
            testResults.pages[file.name] = { status: 'error', error: error.message };
            testResults.issues.push(`${file.name}访问错误`);
            console.log(`❌ ${file.name}: 访问错误`);
        }
    }
}

// 测试API接口
async function testApiEndpoints() {
    console.log('🔌 测试API接口...');
    
    if (!authToken) {
        console.log('⚠️ 跳过API测试 - 无认证令牌');
        return;
    }
    
    const apiEndpoints = [
        { name: '用户资料', method: 'GET', path: '/api/user/profile' },
        { name: '用户设置', method: 'GET', path: '/api/user/settings' },
        { name: '挑战列表', method: 'GET', path: '/api/challenges' },
        { name: '排行榜', method: 'GET', path: '/api/leaderboard' },
        { name: '新闻列表', method: 'GET', path: '/api/news' },
        { name: '运动历史', method: 'GET', path: '/api/user/steps' },
        { name: '团队信息', method: 'GET', path: '/api/teams' },
        { name: '成就列表', method: 'GET', path: '/api/achievements' },
        { name: '签到状态', method: 'GET', path: '/api/checkin/status' },
        { name: '钱包余额', method: 'GET', path: '/api/wallet/balance' },
        { name: 'PK挑战', method: 'GET', path: '/api/pk-challenges' },
        { name: '通知列表', method: 'GET', path: '/api/notifications' }
    ];
    
    for (const endpoint of apiEndpoints) {
        try {
            const config = {
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.path}`,
                headers: { Authorization: `Bearer ${authToken}` }
            };
            
            const response = await axios(config);
            if (response.status === 200 || response.status === 201) {
                testResults.api[endpoint.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${endpoint.name}: 正常`);
            } else {
                testResults.api[endpoint.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${endpoint.name}接口异常`);
                console.log(`❌ ${endpoint.name}: 异常 (${response.status})`);
            }
        } catch (error) {
            const statusCode = error.response?.status || 'unknown';
            testResults.api[endpoint.name] = { status: 'error', error: error.message, statusCode };
            testResults.issues.push(`${endpoint.name}接口错误`);
            console.log(`❌ ${endpoint.name}: 错误 (${statusCode})`);
        }
    }
}

// 生成测试报告
function generateReport() {
    console.log('\n📊 前端页面功能测试报告\n');
    
    const totalTests = Object.keys(testResults.pages).length + Object.keys(testResults.api).length;
    const passedTests = Object.values(testResults.pages).filter(t => t.status === 'success').length +
                       Object.values(testResults.api).filter(t => t.status === 'success').length;
    
    console.log(`📈 测试统计:`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过测试: ${passedTests}`);
    console.log(`   失败测试: ${totalTests - passedTests}`);
    console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    if (testResults.issues.length > 0) {
        console.log('⚠️ 发现的问题:');
        testResults.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        console.log('');
    }
    
    if (testResults.recommendations.length > 0) {
        console.log('🎯 建议:');
        testResults.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
        console.log('');
    }
    
    console.log('🌐 访问地址:');
    console.log(`   前端应用: ${FRONTEND_URL}`);
    console.log(`   后端API: ${BASE_URL}/api`);
    if (authToken) {
        console.log(`   用户令牌: ${authToken.substring(0, 20)}...`);
    }
}

// 主测试函数
async function runTests() {
    try {
        const userCreated = await createTestUser();
        if (!userCreated) {
            console.log('❌ 无法创建测试用户，测试终止');
            return null;
        }
        
        await testFrontendPages();
        await testFrontendCoreFiles();
        await testApiEndpoints();
        
        generateReport();
        
        return {
            authToken,
            testUser,
            testResults
        };
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        return null;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    runTests();
}

module.exports = { runTests, testResults };
