const axios = require('axios');

async function testTelegramFix() {
    console.log('🔧 测试Telegram管理页面API修复...\n');
    
    try {
        // 测试后端API
        console.log('1️⃣ 测试后端Telegram API...');
        const response = await axios.get('http://localhost:3000/api/telegram/status');
        console.log('✅ 后端API正常:', response.data.success);
        
        // 测试管理员后台
        console.log('\n2️⃣ 测试管理员后台...');
        const adminResponse = await axios.get('http://localhost:8081');
        console.log('✅ 管理员后台正常:', adminResponse.status === 200);
        
        // 测试Telegram控制功能
        console.log('\n3️⃣ 测试Telegram控制功能...');
        
        const controlTests = [
            { name: '启用功能', endpoint: 'http://localhost:3000/api/telegram/enable', method: 'POST' },
            { name: '设置详细日志', endpoint: 'http://localhost:3000/api/telegram/verbose', method: 'POST', data: { verbose: true } }
        ];
        
        for (const test of controlTests) {
            try {
                const response = await axios({
                    method: test.method,
                    url: test.endpoint,
                    data: test.data
                });
                console.log(`✅ ${test.name}: 正常`);
            } catch (error) {
                console.log(`❌ ${test.name}: 失败 - ${error.message}`);
            }
        }
        
        console.log('\n🎉 修复验证完成！');
        console.log('📝 现在可以访问管理员后台: http://localhost:8081');
        console.log('🤖 进入Telegram管理页面测试功能');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testTelegramFix();
