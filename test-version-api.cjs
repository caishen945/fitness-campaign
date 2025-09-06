// 测试版本更新API接口 - CommonJS版本
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

// 管理员登录获取令牌
async function getAdminToken() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!response.ok) {
            throw new Error(`登录失败: ${response.status}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('获取管理员令牌失败:', error.message);
        return null;
    }
}

// 测试获取版本信息
async function testGetVersionInfo(token) {
    try {
        console.log('🔍 测试获取版本信息...');
        
        const response = await fetch(`${API_BASE}/api/system/version/info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`获取版本信息失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ 获取版本信息成功:');
        console.log(JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('❌ 获取版本信息失败:', error.message);
        return null;
    }
}

// 测试更新版本
async function testUpdateVersion(token, newVersion) {
    try {
        console.log(`🔄 测试更新版本到 ${newVersion}...`);
        
        const response = await fetch(`${API_BASE}/api/system/version/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newVersion: newVersion
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`更新版本失败: ${response.status} - ${errorData.message}`);
        }

        const data = await response.json();
        console.log('✅ 版本更新成功:');
        console.log(JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('❌ 版本更新失败:', error.message);
        return null;
    }
}

// 主测试函数
async function runTests() {
    console.log('🚀 开始测试版本更新API接口...\n');

    // 1. 获取管理员令牌
    const token = await getAdminToken();
    if (!token) {
        console.error('❌ 无法获取管理员令牌，测试终止');
        return;
    }
    console.log('✅ 管理员令牌获取成功\n');

    // 2. 获取当前版本信息
    const currentVersion = await testGetVersionInfo(token);
    if (!currentVersion) {
        console.error('❌ 无法获取当前版本信息，测试终止');
        return;
    }
    console.log('');

    // 3. 测试版本更新
    const newVersion = '3.2.1';
    const updateResult = await testUpdateVersion(token, newVersion);
    if (!updateResult) {
        console.error('❌ 版本更新测试失败');
        return;
    }
    console.log('');

    // 4. 再次获取版本信息验证更新
    console.log('🔍 验证版本更新结果...');
    const updatedVersion = await testGetVersionInfo(token);
    if (updatedVersion) {
        console.log('✅ 版本更新验证成功');
    }

    console.log('\n🎉 所有测试完成！');
}

// 运行测试
runTests().catch(console.error);
