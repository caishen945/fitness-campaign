console.log('🎯 完整FitChallenge系统测试...\n');

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let testUserId = null;

async function testCompleteSystem() {
    try {
        console.log('1. 测试服务器健康检查...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ 服务器健康:', healthResponse.data.status);

        console.log('\n2. 测试用户注册...');
        const testEmail = `test${Date.now()}@example.com`;
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
            email: testEmail,
            password: 'test123456'
        });
        console.log('✅ 用户注册成功:', registerResponse.data.message);

        console.log('\n3. 测试用户登录...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testEmail,
            password: 'test123456'
        });
        authToken = loginResponse.data.token;
        testUserId = loginResponse.data.user.id;
        console.log('✅ 用户登录成功:', loginResponse.data.message);

        console.log('\n4. 测试获取用户资料...');
        const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 获取用户资料成功:', profileResponse.data.user.username);

        console.log('\n5. 测试钱包功能...');
        const walletResponse = await axios.get(`${BASE_URL}/api/wallet/info`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 获取钱包信息成功:', walletResponse.data.data.wallet.balance);

        console.log('\n6. 测试签到功能...');
        const checkinResponse = await axios.post(`${BASE_URL}/api/checkin`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 签到成功:', checkinResponse.data.message);

        console.log('\n7. 测试成就系统...');
        const achievementResponse = await axios.get(`${BASE_URL}/api/achievements/user/achievements`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 获取成就列表成功:', achievementResponse.data.data.achievements.length, '个成就');

        console.log('\n8. 测试VIP等级系统...');
        const vipResponse = await axios.get(`${BASE_URL}/api/admin/vip-levels`);
        console.log('✅ 获取VIP等级列表成功:', vipResponse.data.count, '个等级');

        console.log('\n9. 测试VIP挑战系统...');
        const challengeResponse = await axios.get(`${BASE_URL}/api/admin/vip-challenges`);
        console.log('✅ 获取VIP挑战列表成功:', challengeResponse.data.count, '个挑战');

        console.log('\n🎉 完整系统测试成功！');
        console.log('✅ 所有核心功能正常工作');
        console.log('✅ 用户认证系统正常');
        console.log('✅ 钱包系统正常');
        console.log('✅ 签到系统正常');
        console.log('✅ 成就系统正常');
        console.log('✅ VIP系统正常');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('错误信息:', error.response.data);
        }
    }
}

testCompleteSystem();
