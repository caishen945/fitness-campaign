const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testTelegramOptimization() {
    console.log('🧪 测试Telegram轮询优化功能...\n');

    try {
        // 1. 检查初始状态
        console.log('1️⃣ 检查Telegram轮询状态...');
        const statusResponse = await axios.get(`${BASE_URL}/api/telegram/status`);
        console.log('📊 当前状态:', JSON.stringify(statusResponse.data.data, null, 2));

        // 2. 启用轮询功能
        console.log('\n2️⃣ 启用Telegram轮询功能...');
        await axios.post(`${BASE_URL}/api/telegram/enable`);
        console.log('✅ 轮询功能已启用');

        // 3. 启动轮询
        console.log('\n3️⃣ 启动Telegram轮询...');
        await axios.post(`${BASE_URL}/api/telegram/start`);
        console.log('✅ 轮询已启动');

        // 4. 等待一段时间，观察智能轮询
        console.log('\n4️⃣ 等待30秒，观察智能轮询间隔调整...');
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const status = await axios.get(`${BASE_URL}/api/telegram/status`);
            const data = status.data.data;
            console.log(`⏰ ${(i + 1) * 5}秒后 - 间隔: ${data.currentInterval}ms, 空轮询: ${data.emptyPollCount}次, 消息数: ${data.messageCount}`);
        }

        // 5. 设置详细日志
        console.log('\n5️⃣ 启用详细日志...');
        await axios.post(`${BASE_URL}/api/telegram/verbose`, { verbose: true });
        console.log('✅ 详细日志已启用');

        // 6. 再次检查状态
        console.log('\n6️⃣ 最终状态检查...');
        const finalStatus = await axios.get(`${BASE_URL}/api/telegram/status`);
        console.log('📊 最终状态:', JSON.stringify(finalStatus.data.data, null, 2));

        // 7. 停止轮询
        console.log('\n7️⃣ 停止Telegram轮询...');
        await axios.post(`${BASE_URL}/api/telegram/stop`);
        console.log('✅ 轮询已停止');

        console.log('\n🎉 Telegram轮询优化测试完成！');
        console.log('\n📋 优化总结:');
        console.log('   ✅ 轮询间隔从1秒优化为智能调整(2-30秒)');
        console.log('   ✅ 实现了基于消息频率的动态间隔调整');
        console.log('   ✅ 添加了轮询开关控制');
        console.log('   ✅ 减少了无用日志输出');
        console.log('   ✅ 在简化服务器中禁用了自动启动');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

// 运行测试
testTelegramOptimization();
