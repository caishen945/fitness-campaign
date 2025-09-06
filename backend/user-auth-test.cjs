const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';

// 测试结果存储
const testResults = {
    auth: {},
    frontend: {},
    admin: {},
    issues: [],
    recommendations: []
};

// 测试用户数据
const timestamp = Date.now();
const testUser = {
    email: 'test' + timestamp + '@example.com',
    password: 'Test123456!'
};

let authToken = null;
let adminToken = null;

console.log('🧪 开始用户认证系统测试...\n');

// 测试用户注册
async function testUserRegistration() {
    console.log('📝 测试用户注册功能...');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        if (response.data.message === '注册成功' && response.data.token) {
            authToken = response.data.token;
            testResults.auth.registration = { status: 'success', data: response.data };
            console.log('✅ 用户注册: 成功');
            console.log(`   用户令牌: ${response.data.token.substring(0, 20)}...`);
        } else {
            testResults.auth.registration = { status: 'error', error: response.data.message };
            testResults.issues.push('用户注册失败');
            console.log('❌ 用户注册: 失败');
            console.log(`   错误信息: ${response.data.message || response.data.error}`);
        }
    } catch (error) {
        testResults.auth.registration = { status: 'error', error: error.message };
        testResults.issues.push('用户注册接口错误');
        console.log('❌ 用户注册: 接口错误');
        console.log(`   错误详情: ${error.response?.data?.error || error.message}`);
    }
}

// 测试用户登录
async function testUserLogin() {
    console.log('🔐 测试用户登录功能...');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        if (response.data.message === '登录成功' && response.data.token) {
            authToken = response.data.token;
            testResults.auth.login = { status: 'success', data: response.data };
            console.log('✅ 用户登录: 成功');
            console.log(`   用户令牌: ${response.data.token.substring(0, 20)}...`);
        } else {
            testResults.auth.login = { status: 'error', error: response.data.message };
            testResults.issues.push('用户登录失败');
            console.log('❌ 用户登录: 失败');
            console.log(`   错误信息: ${response.data.message || response.data.error}`);
        }
    } catch (error) {
        testResults.auth.login = { status: 'error', error: error.message };
        testResults.issues.push('用户登录接口错误');
        console.log('❌ 用户登录: 接口错误');
        console.log(`   错误详情: ${error.response?.data?.error || error.message}`);
    }
}

// 测试用户信息获取
async function testUserProfile() {
    console.log('👤 测试用户信息获取...');
    if (!authToken) {
        console.log('⚠️ 跳过用户信息测试 - 无认证令牌');
        return;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (response.data.success && response.data.data && response.data.data.profile) {
            testResults.auth.profile = { status: 'success', data: response.data };
            console.log('✅ 用户信息获取: 成功');
            console.log(`   用户名: ${response.data.data.profile.username}`);
        } else {
            testResults.auth.profile = { status: 'error', error: response.data.message };
            testResults.issues.push('用户信息获取失败');
            console.log('❌ 用户信息获取: 失败');
        }
    } catch (error) {
        testResults.auth.profile = { status: 'error', error: error.message };
        testResults.issues.push('用户信息获取接口错误');
        console.log('❌ 用户信息获取: 接口错误');
    }
}

// 测试管理员登录
async function testAdminLogin() {
    console.log('👨‍💼 测试管理员登录...');
    try {
        const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        if (response.data.success && response.data.data && response.data.data.token) {
            adminToken = response.data.data.token;
            testResults.admin.login = { status: 'success', data: response.data };
            console.log('✅ 管理员登录: 成功');
            console.log(`   管理员令牌: ${response.data.data.token.substring(0, 20)}...`);
        } else {
            testResults.admin.login = { status: 'error', error: response.data.message };
            testResults.issues.push('管理员登录失败');
            console.log('❌ 管理员登录: 失败');
            console.log(`   错误信息: ${response.data.message || response.data.error}`);
        }
    } catch (error) {
        testResults.admin.login = { status: 'error', error: error.message };
        testResults.issues.push('管理员登录接口错误');
        console.log('❌ 管理员登录: 接口错误');
        console.log(`   错误详情: ${error.response?.data?.error || error.message}`);
    }
}

// 测试前端页面访问
async function testFrontendPages() {
    console.log('🌐 测试前端页面访问...');
    
    const pages = [
        { name: '首页', path: '/' },
        { name: '登录页', path: '/#login' },
        { name: '注册页', path: '/#register' }
    ];
    
    for (const page of pages) {
        try {
            const response = await axios.get(`${FRONTEND_URL}${page.path}`);
            if (response.status === 200) {
                testResults.frontend[page.name] = { status: 'success' };
                console.log(`✅ ${page.name}: 可访问`);
            } else {
                testResults.frontend[page.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${page.name}访问失败`);
                console.log(`❌ ${page.name}: 访问失败`);
            }
        } catch (error) {
            testResults.frontend[page.name] = { status: 'error', error: error.message };
            testResults.issues.push(`${page.name}访问错误`);
            console.log(`❌ ${page.name}: 访问错误`);
        }
    }
}

// 生成测试报告
function generateReport() {
    console.log('\n📊 用户认证系统测试报告\n');
    
    const totalTests = Object.keys(testResults.auth).length + 
                      Object.keys(testResults.frontend).length + 
                      Object.keys(testResults.admin).length;
    const passedTests = Object.values(testResults.auth).filter(t => t.status === 'success').length +
                       Object.values(testResults.frontend).filter(t => t.status === 'success').length +
                       Object.values(testResults.admin).filter(t => t.status === 'success').length;
    
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
    console.log(`   测试用户: ${testUser.username}`);
    if (authToken) {
        console.log(`   用户令牌: ${authToken.substring(0, 20)}...`);
    }
    if (adminToken) {
        console.log(`   管理员令牌: ${adminToken.substring(0, 20)}...`);
    }
}

// 主测试函数
async function runTests() {
    try {
        await testUserRegistration();
        await testUserLogin();
        await testUserProfile();
        await testAdminLogin();
        await testFrontendPages();
        
        generateReport();
        
        // 返回测试结果供后续使用
        return {
            authToken,
            adminToken,
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

module.exports = { runTests, testUser, testResults };
