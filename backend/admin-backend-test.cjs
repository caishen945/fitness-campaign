const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const ADMIN_URL = 'http://localhost:8081';

// 测试结果存储
const testResults = {
    admin: {},
    api: {},
    issues: [],
    recommendations: []
};

let adminToken = null;

console.log('👨‍💼 开始管理员后台功能测试...\n');

// 管理员登录
async function adminLogin() {
    console.log('🔐 管理员登录...');
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
            return true;
        } else {
            testResults.admin.login = { status: 'error', error: response.data.message };
            testResults.issues.push('管理员登录失败');
            console.log('❌ 管理员登录: 失败');
            return false;
        }
    } catch (error) {
        testResults.admin.login = { status: 'error', error: error.message };
        testResults.issues.push('管理员登录接口错误');
        console.log('❌ 管理员登录: 接口错误');
        return false;
    }
}

// 测试管理员后台页面
async function testAdminPages() {
    console.log('📄 测试管理员后台页面...');
    
    const pages = [
        { name: '管理员首页', path: '/' },
        { name: '用户管理', path: '/#user-management' },
        { name: '挑战管理', path: '/#challenge-management' },
        { name: '系统设置', path: '/#system-settings' },
        { name: 'Telegram管理', path: '/#telegram-management' },
        { name: '数据统计', path: '/#statistics' },
        { name: 'VIP等级管理', path: '/#vip-levels' },
        { name: '钱包管理', path: '/#wallet-management' },
        { name: '团队统计', path: '/#team-statistics' }
    ];
    
    for (const page of pages) {
        try {
            const response = await axios.get(`${ADMIN_URL}${page.path}`);
            if (response.status === 200) {
                testResults.admin[page.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${page.name}: 可访问`);
            } else {
                testResults.admin[page.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${page.name}访问失败`);
                console.log(`❌ ${page.name}: 访问失败 (${response.status})`);
            }
        } catch (error) {
            testResults.admin[page.name] = { status: 'error', error: error.message };
            testResults.issues.push(`${page.name}访问错误`);
            console.log(`❌ ${page.name}: 访问错误`);
        }
    }
}

// 测试管理员API接口
async function testAdminApiEndpoints() {
    console.log('🔌 测试管理员API接口...');
    
    if (!adminToken) {
        console.log('⚠️ 跳过管理员API测试 - 无认证令牌');
        return;
    }
    
    const apiEndpoints = [
        { name: '用户列表', method: 'GET', path: '/api/admin/users' },
        { name: 'VIP等级列表', method: 'GET', path: '/api/admin/vip-levels' },
        { name: 'VIP挑战列表', method: 'GET', path: '/api/admin/vip-challenges' },
        { name: '签到管理', method: 'GET', path: '/api/admin/checkin' },
        { name: 'PK挑战管理', method: 'GET', path: '/api/admin/pk' },
        { name: '钱包管理', method: 'GET', path: '/api/admin/wallet' },
        { name: '团队统计', method: 'GET', path: '/api/admin/team-statistics' },
        { name: '系统配置', method: 'GET', path: '/api/admin/system-configs' },
        { name: 'Telegram状态', method: 'GET', path: '/api/telegram/status' },
        { name: '日志列表', method: 'GET', path: '/api/logs' }
    ];
    
    for (const endpoint of apiEndpoints) {
        try {
            const config = {
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.path}`,
                headers: { Authorization: `Bearer ${adminToken}` }
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

// 测试Telegram管理功能
async function testTelegramManagement() {
    console.log('🤖 测试Telegram管理功能...');
    
    if (!adminToken) {
        console.log('⚠️ 跳过Telegram测试 - 无认证令牌');
        return;
    }
    
    const telegramTests = [
        { name: '获取Telegram状态', method: 'GET', path: '/api/telegram/status' },
        { name: '启用Telegram', method: 'POST', path: '/api/telegram/enable' },
        { name: '禁用Telegram', method: 'POST', path: '/api/telegram/disable' },
        { name: '启动轮询', method: 'POST', path: '/api/telegram/start' },
        { name: '停止轮询', method: 'POST', path: '/api/telegram/stop' },
        { name: '设置详细日志', method: 'POST', path: '/api/telegram/verbose', data: { verbose: true } }
    ];
    
    for (const test of telegramTests) {
        try {
            const config = {
                method: test.method,
                url: `${BASE_URL}${test.path}`,
                headers: { Authorization: `Bearer ${adminToken}` },
                data: test.data
            };
            
            const response = await axios(config);
            if (response.status === 200 || response.status === 201) {
                testResults.api[test.name] = { status: 'success', statusCode: response.status };
                console.log(`✅ ${test.name}: 正常`);
            } else {
                testResults.api[test.name] = { status: 'error', statusCode: response.status };
                testResults.issues.push(`${test.name}异常`);
                console.log(`❌ ${test.name}: 异常 (${response.status})`);
            }
        } catch (error) {
            const statusCode = error.response?.status || 'unknown';
            testResults.api[test.name] = { status: 'error', error: error.message, statusCode };
            testResults.issues.push(`${test.name}错误`);
            console.log(`❌ ${test.name}: 错误 (${statusCode})`);
        }
    }
}

// 生成测试报告
function generateReport() {
    console.log('\n📊 管理员后台功能测试报告\n');
    
    const totalTests = Object.keys(testResults.admin).length + Object.keys(testResults.api).length;
    const passedTests = Object.values(testResults.admin).filter(t => t.status === 'success').length +
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
    console.log(`   管理员后台: ${ADMIN_URL}`);
    console.log(`   后端API: ${BASE_URL}/api`);
    if (adminToken) {
        console.log(`   管理员令牌: ${adminToken.substring(0, 20)}...`);
    }
}

// 主测试函数
async function runTests() {
    try {
        const loginSuccess = await adminLogin();
        if (!loginSuccess) {
            console.log('❌ 管理员登录失败，测试终止');
            return null;
        }
        
        await testAdminPages();
        await testAdminApiEndpoints();
        await testTelegramManagement();
        
        generateReport();
        
        return {
            adminToken,
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
