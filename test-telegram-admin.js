const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const ADMIN_URL = 'http://localhost:8081';

async function testTelegramAdminIntegration() {
    console.log('🧪 测试管理员后台Telegram集成功能...\n');

    try {
        // 1. 检查后端API是否正常
        console.log('1️⃣ 检查后端API状态...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ 后端API正常:', healthResponse.data.status);

        // 2. 检查Telegram状态接口
        console.log('\n2️⃣ 检查Telegram状态接口...');
        const statusResponse = await axios.get(`${BASE_URL}/api/telegram/status`);
        console.log('📊 Telegram状态:', JSON.stringify(statusResponse.data.data, null, 2));

        // 3. 测试Telegram控制接口
        console.log('\n3️⃣ 测试Telegram控制接口...');
        
        // 启用轮询功能
        console.log('   启用轮询功能...');
        await axios.post(`${BASE_URL}/api/telegram/enable`);
        console.log('   ✅ 轮询功能已启用');

        // 启动轮询
        console.log('   启动轮询...');
        await axios.post(`${BASE_URL}/api/telegram/start`);
        console.log('   ✅ 轮询已启动');

        // 设置详细日志
        console.log('   设置详细日志...');
        await axios.post(`${BASE_URL}/api/telegram/verbose`, { verbose: true });
        console.log('   ✅ 详细日志已启用');

        // 4. 检查管理员后台是否可访问
        console.log('\n4️⃣ 检查管理员后台...');
        const adminResponse = await axios.get(ADMIN_URL);
        console.log('✅ 管理员后台可访问:', adminResponse.status === 200 ? '是' : '否');

        // 5. 最终状态检查
        console.log('\n5️⃣ 最终状态检查...');
        const finalStatus = await axios.get(`${BASE_URL}/api/telegram/status`);
        console.log('📊 最终Telegram状态:', JSON.stringify(finalStatus.data.data, null, 2));

        console.log('\n🎉 Telegram管理员后台集成测试完成！');
        console.log('\n📋 测试结果总结:');
        console.log('   ✅ 后端API接口正常');
        console.log('   ✅ Telegram状态接口正常');
        console.log('   ✅ Telegram控制接口正常');
        console.log('   ✅ 管理员后台可访问');
        console.log('   ✅ 轮询功能已启用并启动');
        console.log('   ✅ 详细日志已启用');
        
        console.log('\n🌐 访问地址:');
        console.log(`   管理员后台: ${ADMIN_URL}`);
        console.log('   登录后点击左侧菜单的"Telegram管理"即可使用');
        console.log('   或使用快捷键 Ctrl+8 快速访问');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

// 运行测试
testTelegramAdminIntegration();
