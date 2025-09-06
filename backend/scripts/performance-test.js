/**
 * API性能测试脚本
 * 使用autocannon进行负载测试
 */

const autocannon = require('autocannon');
const logger = require('../utils/logger');

// 测试配置
const testConfigs = {
    // 基础性能测试
    basic: {
        url: 'http://localhost:3002',
        connections: 10,
        duration: 10,
        pipelining: 1
    },
    // 负载测试
    load: {
        url: 'http://localhost:3002',
        connections: 50,
        duration: 30,
        pipelining: 1
    },
    // 压力测试
    stress: {
        url: 'http://localhost:3002',
        connections: 100,
        duration: 60,
        pipelining: 1
    },
    // API端点测试
    api: {
        url: 'http://localhost:3002/api/auth/login',
        connections: 20,
        duration: 20,
        pipelining: 1,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword'
        })
    }
};

// 运行测试
async function runPerformanceTest(configName = 'basic') {
    const config = testConfigs[configName];
    
    if (!config) {
        console.error(`❌ 未知的测试配置: ${configName}`);
        console.log('可用的测试配置:', Object.keys(testConfigs));
        return;
    }
    
    console.log(`🚀 开始运行 ${configName} 性能测试...`);
    console.log('配置:', JSON.stringify(config, null, 2));
    
    try {
        const result = await autocannon(config);
        
        console.log('\n📊 测试结果:');
        console.log('==================');
        console.log(`总请求数: ${result.requests?.total || 'N/A'}`);
        console.log(`总响应数: ${result.responses?.total || 'N/A'}`);
        console.log(`平均延迟: ${result.latency?.average || 'N/A'}ms`);
        console.log(`95%延迟: ${result.latency?.p95 || 'N/A'}ms`);
        console.log(`99%延迟: ${result.latency?.p99 || 'N/A'}ms`);
        console.log(`平均吞吐量: ${result.throughput?.average || 'N/A'} req/sec`);
        console.log(`错误率: ${result.errors || 'N/A'}%`);
        console.log(`超时数: ${result.timeouts || 'N/A'}`);
        
        // 显示原始结果用于调试
        console.log('\n🔍 原始结果数据:');
        console.log(JSON.stringify(result, null, 2));
        
        // 记录到日志
        logger.info('性能测试完成', {
            testName: configName,
            totalRequests: result.requests?.total || 0,
            totalResponses: result['2xx'] || 0,
            averageLatency: result.latency?.average || 0,
            p95Latency: result.latency?.p97_5 || 0,
            p99Latency: result.latency?.p99 || 0,
            averageThroughput: result.throughput?.average || 0,
            errorRate: result.errors || 0,
            timeouts: result.timeouts || 0
        });
        
    } catch (error) {
        console.error('❌ 性能测试失败:', error);
        logger.error('性能测试失败', { error: error.message, testName: configName });
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('🧪 开始运行所有性能测试...\n');
    
    for (const testName of Object.keys(testConfigs)) {
        await runPerformanceTest(testName);
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 测试间隔
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ 所有性能测试完成！');
}

// 命令行参数处理
const args = process.argv.slice(2);
const testName = args[0];

if (testName === 'all') {
    runAllTests();
} else if (testName) {
    runPerformanceTest(testName);
} else {
    console.log('🧪 FitChallenge API 性能测试工具');
    console.log('使用方法:');
    console.log('  node scripts/performance-test.js [test-name]');
    console.log('');
    console.log('可用的测试:');
    Object.keys(testConfigs).forEach(name => {
        console.log(`  - ${name}`);
    });
    console.log('  - all (运行所有测试)');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/performance-test.js basic');
    console.log('  node scripts/performance-test.js load');
    console.log('  node scripts/performance-test.js all');
}

module.exports = { runPerformanceTest, runAllTests };
