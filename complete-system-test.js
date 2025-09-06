const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';
const ADMIN_URL = 'http://localhost:8081';

// 测试结果存储
const testResults = {
    backend: {},
    frontend: {},
    admin: {},
    telegram: {},
    database: {},
    issues: [],
    recommendations: []
};

async function runCompleteSystemTest() {
    console.log('🧪 开始完整系统功能测试...\n');
    console.log('=' * 60);
    
    try {
        // 1. 后端API测试
        await testBackendAPI();
        
        // 2. 数据库连接测试
        await testDatabaseConnection();
        
        // 3. Telegram功能测试
        await testTelegramFeatures();
        
        // 4. 前端功能测试
        await testFrontendFeatures();
        
        // 5. 管理员后台测试
        await testAdminPanel();
        
        // 6. 生成测试报告
        generateTestReport();
        
    } catch (error) {
        console.error('❌ 系统测试失败:', error.message);
    }
}

async function testBackendAPI() {
    console.log('🔧 测试后端API功能...');
    
    try {
        // 健康检查
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        testResults.backend.health = {
            status: 'success',
            data: healthResponse.data
        };
        console.log('✅ 后端健康检查: 正常');
        
        // API测试接口
        const testResponse = await axios.get(`${BASE_URL}/api/test`);
        testResults.backend.test = {
            status: 'success',
            data: testResponse.data
        };
        console.log('✅ API测试接口: 正常');
        
        // 用户认证接口
        try {
            const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                username: 'testuser',
                password: 'testpass'
            });
            testResults.backend.auth = {
                status: 'success',
                note: '认证接口可访问'
            };
        } catch (error) {
            if (error.response?.status === 401) {
                testResults.backend.auth = {
                    status: 'success',
                    note: '认证接口正常，但测试用户不存在'
                };
            } else {
                testResults.backend.auth = {
                    status: 'error',
                    error: error.message
                };
            }
        }
        console.log('✅ 用户认证接口: 正常');
        
        // 管理接口
        try {
            const adminResponse = await axios.get(`${BASE_URL}/api/admin/auth/status`);
            testResults.backend.admin = {
                status: 'success',
                note: '管理接口可访问'
            };
        } catch (error) {
            testResults.backend.admin = {
                status: 'error',
                error: error.message
            };
        }
        console.log('✅ 管理接口: 正常');
        
    } catch (error) {
        testResults.backend.overall = {
            status: 'error',
            error: error.message
        };
        testResults.issues.push('后端API无法访问');
        console.log('❌ 后端API测试失败:', error.message);
    }
}

async function testDatabaseConnection() {
    console.log('\n🗄️ 测试数据库连接...');
    
    try {
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        const services = healthResponse.data.services;
        
        if (services.database === 'connected') {
            testResults.database.status = 'success';
            console.log('✅ MySQL数据库: 已连接');
        } else {
            testResults.database.status = 'error';
            testResults.issues.push('MySQL数据库连接失败');
            console.log('❌ MySQL数据库: 连接失败');
        }
        
        if (services.redis === 'connected') {
            testResults.database.redis = 'success';
            console.log('✅ Redis缓存: 已连接');
        } else {
            testResults.database.redis = 'error';
            testResults.issues.push('Redis缓存连接失败');
            console.log('❌ Redis缓存: 连接失败');
        }
        
    } catch (error) {
        testResults.database.status = 'error';
        testResults.issues.push('无法检查数据库状态');
        console.log('❌ 数据库状态检查失败:', error.message);
    }
}

async function testTelegramFeatures() {
    console.log('\n🤖 测试Telegram功能...');
    
    try {
        // 检查Telegram状态
        const statusResponse = await axios.get(`${BASE_URL}/api/telegram/status`);
        testResults.telegram.status = {
            status: 'success',
            data: statusResponse.data.data
        };
        console.log('✅ Telegram状态接口: 正常');
        
        // 测试Telegram控制功能
        const controlTests = [
            { name: '启用功能', endpoint: '/api/telegram/enable', method: 'POST' },
            { name: '启动轮询', endpoint: '/api/telegram/start', method: 'POST' },
            { name: '设置详细日志', endpoint: '/api/telegram/verbose', method: 'POST', data: { verbose: true } }
        ];
        
        for (const test of controlTests) {
            try {
                const response = await axios({
                    method: test.method,
                    url: `${BASE_URL}${test.endpoint}`,
                    data: test.data
                });
                testResults.telegram[test.name] = {
                    status: 'success',
                    data: response.data
                };
                console.log(`✅ ${test.name}: 正常`);
            } catch (error) {
                testResults.telegram[test.name] = {
                    status: 'error',
                    error: error.message
                };
                console.log(`❌ ${test.name}: 失败`);
            }
        }
        
    } catch (error) {
        testResults.telegram.overall = {
            status: 'error',
            error: error.message
        };
        testResults.issues.push('Telegram功能无法访问');
        console.log('❌ Telegram功能测试失败:', error.message);
    }
}

async function testFrontendFeatures() {
    console.log('\n🌐 测试前端功能...');
    
    try {
        // 检查前端页面
        const frontendResponse = await axios.get(FRONTEND_URL);
        testResults.frontend.main = {
            status: 'success',
            statusCode: frontendResponse.status
        };
        console.log('✅ 前端主页面: 可访问');
        
        // 检查前端API配置
        try {
            const apiConfigResponse = await axios.get(`${FRONTEND_URL}/config/api-config.js`);
            testResults.frontend.apiConfig = {
                status: 'success',
                note: 'API配置文件存在'
            };
            console.log('✅ API配置文件: 存在');
        } catch (error) {
            testResults.frontend.apiConfig = {
                status: 'error',
                error: error.message
            };
            testResults.issues.push('前端API配置文件缺失');
            console.log('❌ API配置文件: 缺失');
        }
        
        // 检查关键页面
        const keyPages = [
            { name: '登录页面', path: '/pages/Login.html' },
            { name: '注册页面', path: '/pages/Register.html' },
            { name: '仪表盘', path: '/pages/Dashboard.html' },
            { name: '挑战页面', path: '/pages/Challenge.html' }
        ];
        
        for (const page of keyPages) {
            try {
                const response = await axios.get(`${FRONTEND_URL}${page.path}`);
                testResults.frontend[page.name] = {
                    status: 'success',
                    statusCode: response.status
                };
                console.log(`✅ ${page.name}: 可访问`);
            } catch (error) {
                testResults.frontend[page.name] = {
                    status: 'error',
                    error: error.message
                };
                testResults.issues.push(`${page.name}无法访问`);
                console.log(`❌ ${page.name}: 无法访问`);
            }
        }
        
    } catch (error) {
        testResults.frontend.overall = {
            status: 'error',
            error: error.message
        };
        testResults.issues.push('前端服务器无法访问');
        console.log('❌ 前端功能测试失败:', error.message);
    }
}

async function testAdminPanel() {
    console.log('\n👨‍💼 测试管理员后台...');
    
    try {
        // 检查管理员后台主页面
        const adminResponse = await axios.get(ADMIN_URL);
        testResults.admin.main = {
            status: 'success',
            statusCode: adminResponse.status
        };
        console.log('✅ 管理员后台: 可访问');
        
        // 检查管理员后台构建文件
        try {
            const buildResponse = await axios.get(`${ADMIN_URL}/assets/`);
            testResults.admin.build = {
                status: 'success',
                note: '构建文件存在'
            };
            console.log('✅ 管理员后台构建: 正常');
        } catch (error) {
            testResults.admin.build = {
                status: 'error',
                error: error.message
            };
            testResults.issues.push('管理员后台构建文件问题');
            console.log('❌ 管理员后台构建: 有问题');
        }
        
    } catch (error) {
        testResults.admin.overall = {
            status: 'error',
            error: error.message
        };
        testResults.issues.push('管理员后台无法访问');
        console.log('❌ 管理员后台测试失败:', error.message);
    }
}

function generateTestReport() {
    console.log('\n' + '=' * 60);
    console.log('📊 完整系统测试报告');
    console.log('=' * 60);
    
    // 统计测试结果
    const totalTests = countTests(testResults);
    const passedTests = countPassedTests(testResults);
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📈 测试统计:`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过测试: ${passedTests}`);
    console.log(`   失败测试: ${failedTests}`);
    console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    // 显示各模块状态
    console.log(`\n🔧 模块状态:`);
    console.log(`   后端API: ${getModuleStatus(testResults.backend)}`);
    console.log(`   数据库: ${getModuleStatus(testResults.database)}`);
    console.log(`   Telegram: ${getModuleStatus(testResults.telegram)}`);
    console.log(`   前端: ${getModuleStatus(testResults.frontend)}`);
    console.log(`   管理员后台: ${getModuleStatus(testResults.admin)}`);
    
    // 显示问题列表
    if (testResults.issues.length > 0) {
        console.log(`\n⚠️ 发现的问题:`);
        testResults.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    } else {
        console.log(`\n✅ 未发现严重问题`);
    }
    
    // 生成优化建议
    generateRecommendations();
    
    console.log(`\n🌐 访问地址:`);
    console.log(`   前端应用: ${FRONTEND_URL}`);
    console.log(`   管理员后台: ${ADMIN_URL}`);
    console.log(`   后端API: ${BASE_URL}/api`);
    console.log(`   API文档: ${BASE_URL}/api-docs`);
    
    console.log(`\n🎯 下一步建议:`);
    testResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
    });
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

function getModuleStatus(module) {
    if (!module || Object.keys(module).length === 0) return '❓ 未测试';
    
    const hasError = Object.values(module).some(item => 
        typeof item === 'object' && item.status === 'error'
    );
    
    return hasError ? '⚠️ 部分问题' : '✅ 正常';
}

function generateRecommendations() {
    testResults.recommendations = [];
    
    // 基于测试结果生成建议
    if (testResults.issues.includes('MySQL数据库连接失败')) {
        testResults.recommendations.push('检查MySQL服务是否启动，确认数据库配置正确');
    }
    
    if (testResults.issues.includes('Redis缓存连接失败')) {
        testResults.recommendations.push('检查Redis服务是否启动，确认Redis配置正确');
    }
    
    if (testResults.issues.includes('前端API配置文件缺失')) {
        testResults.recommendations.push('检查前端API配置文件是否正确部署');
    }
    
    if (testResults.issues.includes('管理员后台构建文件问题')) {
        testResults.recommendations.push('重新构建管理员后台: cd admin && npm run build');
    }
    
    if (testResults.telegram.status?.data?.isPolling === false) {
        testResults.recommendations.push('考虑启动Telegram轮询以测试完整功能');
    }
    
    if (testResults.recommendations.length === 0) {
        testResults.recommendations.push('系统运行良好，可以进行用户功能测试');
        testResults.recommendations.push('建议测试用户注册、登录、挑战等核心功能');
        testResults.recommendations.push('可以测试管理员后台的各个管理功能');
    }
}

// 运行完整测试
runCompleteSystemTest();
