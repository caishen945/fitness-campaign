/**
 * FitChallenge 前端功能全面测试脚本
 * 用于自动化测试前端所有功能模块和响应
 */

import axios from 'axios';
import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:8082';
const API_BASE_URL = 'http://localhost:3000';

// 测试结果记录
const testResults = {
    basic: {},
    navigation: {},
    auth: {},
    userProfile: {},
    challenge: {},
    wallet: {},
    checkin: {},
    achievements: {},
    pkChallenge: {},
    team: {},
    notifications: {},
    leaderboard: {},
    apiIntegration: {},
    responsive: {},
    errorHandling: {},
    issues: [],
    summary: {}
};

/**
 * 基础访问测试
 */
async function testBasicAccess() {
    console.log('\n=== 🔍 基础访问测试 ===');
    
    try {
        // 测试主页加载
        const response = await axios.get(BASE_URL);
        testResults.basic.pageLoad = {
            status: response.status === 200 ? 'success' : 'error',
            statusCode: response.status,
            title: response.data.includes('FitChallenge') ? 'found' : 'missing'
        };
        console.log('✅ 主页加载: 成功');
        
        // 测试关键文件可访问性
        const keyFiles = [
            '/src/index.js',
            '/src/App.js',
            '/pages/Home.js',
            '/pages/Login.js',
            '/style.css'
        ];
        
        testResults.basic.fileAccess = {};
        for (const file of keyFiles) {
            try {
                const fileResponse = await axios.get(`${BASE_URL}${file}`);
                testResults.basic.fileAccess[file] = fileResponse.status === 200 ? 'success' : 'error';
                console.log(`✅ 文件 ${file}: 可访问`);
            } catch (error) {
                testResults.basic.fileAccess[file] = 'error';
                console.log(`❌ 文件 ${file}: 不可访问`);
            }
        }
    } catch (error) {
        testResults.basic.error = error.message;
        testResults.issues.push('基础访问测试失败');
        console.log('❌ 基础访问测试: 失败');
    }
}

/**
 * 导航功能测试（使用Puppeteer）
 */
async function testNavigationWithBrowser() {
    console.log('\n=== 🧭 导航功能测试 ===');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // 设置视口
        await page.setViewport({ width: 1280, height: 720 });
        
        // 访问主页
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        
        // 等待页面完全加载
        await page.waitForTimeout(2000);
        
        // 测试页面标题
        const title = await page.title();
        testResults.navigation.pageTitle = title.includes('FitChallenge') ? 'success' : 'error';
        console.log(`页面标题: ${title}`);
        
        // 测试主要导航元素
        const navTests = [
            { selector: '[data-page="challenge"]', name: '挑战页面' },
            { selector: '[data-page="leaderboard"]', name: '排行榜页面' },
            { selector: '[data-page="login"]', name: '登录页面' },
            { selector: '[data-page="register"]', name: '注册页面' }
        ];
        
        testResults.navigation.elements = {};
        for (const navTest of navTests) {
            try {
                const element = await page.$(navTest.selector);
                testResults.navigation.elements[navTest.name] = element ? 'found' : 'missing';
                console.log(`${element ? '✅' : '❌'} ${navTest.name}: ${element ? '找到' : '缺失'}`);
            } catch (error) {
                testResults.navigation.elements[navTest.name] = 'error';
                console.log(`❌ ${navTest.name}: 检测错误`);
            }
        }
        
        // 测试页面切换
        try {
            // 点击登录链接
            await page.click('[data-page="login"]');
            await page.waitForTimeout(1000);
            
            // 检查是否切换到登录页面
            const loginForm = await page.$('#loginForm, .login-form, form[action*="login"]');
            testResults.navigation.pageSwitch = loginForm ? 'success' : 'error';
            console.log(`${loginForm ? '✅' : '❌'} 页面切换: ${loginForm ? '成功' : '失败'}`);
        } catch (error) {
            testResults.navigation.pageSwitch = 'error';
            console.log('❌ 页面切换: 测试失败');
        }
        
    } catch (error) {
        testResults.navigation.error = error.message;
        testResults.issues.push('导航功能测试失败');
        console.log('❌ 导航功能测试: 失败');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * API集成测试
 */
async function testAPIIntegration() {
    console.log('\n=== 🔌 API集成测试 ===');
    
    try {
        // 测试API连通性
        const healthResponse = await axios.get(`${API_BASE_URL}/health`).catch(() => null);
        testResults.apiIntegration.connectivity = healthResponse ? 'success' : 'error';
        console.log(`${healthResponse ? '✅' : '❌'} API连通性: ${healthResponse ? '正常' : '异常'}`);
        
        // 测试主要API端点
        const apiEndpoints = [
            { url: '/api/auth/verify', method: 'GET', name: '认证验证' },
            { url: '/api/vip-levels', method: 'GET', name: 'VIP等级' },
            { url: '/api/fitness/leaderboard', method: 'GET', name: '排行榜' }
        ];
        
        testResults.apiIntegration.endpoints = {};
        for (const endpoint of apiEndpoints) {
            try {
                const response = await axios({
                    method: endpoint.method,
                    url: `${API_BASE_URL}${endpoint.url}`,
                    timeout: 5000
                });
                testResults.apiIntegration.endpoints[endpoint.name] = {
                    status: 'reachable',
                    statusCode: response.status
                };
                console.log(`✅ ${endpoint.name}: 可访问 (${response.status})`);
            } catch (error) {
                testResults.apiIntegration.endpoints[endpoint.name] = {
                    status: 'error',
                    error: error.response ? error.response.status : 'network_error'
                };
                console.log(`❌ ${endpoint.name}: ${error.response ? error.response.status : '网络错误'}`);
            }
        }
    } catch (error) {
        testResults.apiIntegration.error = error.message;
        testResults.issues.push('API集成测试失败');
        console.log('❌ API集成测试: 失败');
    }
}

/**
 * 用户认证系统测试
 */
async function testAuthSystem() {
    console.log('\n=== 🔐 用户认证系统测试 ===');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);
        
        // 测试注册页面
        try {
            await page.click('[data-page="register"]');
            await page.waitForTimeout(1000);
            
            const registerForm = await page.$('#registerForm, .register-form');
            testResults.auth.registerPage = registerForm ? 'success' : 'error';
            console.log(`${registerForm ? '✅' : '❌'} 注册页面: ${registerForm ? '正常' : '异常'}`);
            
            if (registerForm) {
                // 检查注册表单字段
                const emailField = await page.$('input[type="email"], input[name="email"]');
                const passwordField = await page.$('input[type="password"], input[name="password"]');
                const submitBtn = await page.$('button[type="submit"], .register-btn');
                
                testResults.auth.registerForm = {
                    email: emailField ? 'found' : 'missing',
                    password: passwordField ? 'found' : 'missing',
                    submit: submitBtn ? 'found' : 'missing'
                };
                console.log(`  邮箱字段: ${emailField ? '✅' : '❌'}`);
                console.log(`  密码字段: ${passwordField ? '✅' : '❌'}`);
                console.log(`  提交按钮: ${submitBtn ? '✅' : '❌'}`);
            }
        } catch (error) {
            testResults.auth.registerPage = 'error';
            console.log('❌ 注册页面测试失败');
        }
        
        // 测试登录页面
        try {
            await page.click('[data-page="login"]');
            await page.waitForTimeout(1000);
            
            const loginForm = await page.$('#loginForm, .login-form');
            testResults.auth.loginPage = loginForm ? 'success' : 'error';
            console.log(`${loginForm ? '✅' : '❌'} 登录页面: ${loginForm ? '正常' : '异常'}`);
            
            if (loginForm) {
                // 检查登录表单字段
                const emailField = await page.$('input[type="email"], input[name="email"]');
                const passwordField = await page.$('input[type="password"], input[name="password"]');
                const submitBtn = await page.$('button[type="submit"], .login-btn');
                
                testResults.auth.loginForm = {
                    email: emailField ? 'found' : 'missing',
                    password: passwordField ? 'found' : 'missing',
                    submit: submitBtn ? 'found' : 'missing'
                };
                console.log(`  邮箱字段: ${emailField ? '✅' : '❌'}`);
                console.log(`  密码字段: ${passwordField ? '✅' : '❌'}`);
                console.log(`  提交按钮: ${submitBtn ? '✅' : '❌'}`);
            }
        } catch (error) {
            testResults.auth.loginPage = 'error';
            console.log('❌ 登录页面测试失败');
        }
        
    } catch (error) {
        testResults.auth.error = error.message;
        testResults.issues.push('认证系统测试失败');
        console.log('❌ 认证系统测试: 失败');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 响应式设计测试
 */
async function testResponsiveDesign() {
    console.log('\n=== 📱 响应式设计测试 ===');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        const viewports = [
            { width: 320, height: 568, name: '手机竖屏' },
            { width: 768, height: 1024, name: '平板竖屏' },
            { width: 1280, height: 720, name: '桌面' },
            { width: 1920, height: 1080, name: '大屏桌面' }
        ];
        
        testResults.responsive.viewports = {};
        
        for (const viewport of viewports) {
            try {
                await page.setViewport({ width: viewport.width, height: viewport.height });
                await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
                await page.waitForTimeout(1000);
                
                // 检查页面是否正常渲染
                const bodyElement = await page.$('body');
                const isRendered = bodyElement !== null;
                
                // 检查导航栏是否适配
                const navElement = await page.$('.navbar, .nav, .header');
                const hasNavigation = navElement !== null;
                
                testResults.responsive.viewports[viewport.name] = {
                    rendered: isRendered ? 'success' : 'error',
                    navigation: hasNavigation ? 'success' : 'error',
                    width: viewport.width,
                    height: viewport.height
                };
                
                console.log(`${isRendered ? '✅' : '❌'} ${viewport.name} (${viewport.width}x${viewport.height}): ${isRendered ? '正常' : '异常'}`);
            } catch (error) {
                testResults.responsive.viewports[viewport.name] = {
                    rendered: 'error',
                    error: error.message
                };
                console.log(`❌ ${viewport.name}: 测试失败`);
            }
        }
    } catch (error) {
        testResults.responsive.error = error.message;
        testResults.issues.push('响应式设计测试失败');
        console.log('❌ 响应式设计测试: 失败');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 错误处理测试
 */
async function testErrorHandling() {
    console.log('\n=== ⚠️ 错误处理测试 ===');
    
    try {
        // 测试无效API端点
        try {
            await axios.get(`${API_BASE_URL}/api/invalid-endpoint`);
            testResults.errorHandling.invalidEndpoint = 'unexpected_success';
        } catch (error) {
            testResults.errorHandling.invalidEndpoint = {
                status: 'expected_error',
                statusCode: error.response ? error.response.status : 'network_error'
            };
            console.log(`✅ 无效端点处理: 正确返回错误 (${error.response ? error.response.status : '网络错误'})`);
        }
        
        // 测试网络超时处理
        try {
            await axios.get(`${API_BASE_URL}/api/slow-endpoint`, { timeout: 100 });
            testResults.errorHandling.timeout = 'unexpected_success';
        } catch (error) {
            testResults.errorHandling.timeout = {
                status: 'expected_error',
                type: error.code === 'ECONNABORTED' ? 'timeout' : 'other'
            };
            console.log(`✅ 超时处理: 正确处理 (${error.code})`);
        }
        
    } catch (error) {
        testResults.errorHandling.error = error.message;
        testResults.issues.push('错误处理测试失败');
        console.log('❌ 错误处理测试: 失败');
    }
}

/**
 * 生成测试报告
 */
function generateTestReport() {
    console.log('\n=== 📊 测试报告生成 ===');
    
    // 统计测试结果
    const totalTests = Object.keys(testResults).length - 2; // 减去issues和summary
    const passedTests = Object.values(testResults).filter(result => 
        typeof result === 'object' && 
        result !== null && 
        !result.error && 
        Object.keys(result).length > 0
    ).length;
    
    testResults.summary = {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        issues: testResults.issues.length,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n🎯 测试总结:');
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过: ${passedTests}`);
    console.log(`  失败: ${totalTests - passedTests}`);
    console.log(`  问题数: ${testResults.issues.length}`);
    
    if (testResults.issues.length > 0) {
        console.log('\n❌ 发现的问题:');
        testResults.issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
        });
    }
    
    // 保存测试报告到文件
    fs.writeFileSync(
        'frontend-test-report.json', 
        JSON.stringify(testResults, null, 2)
    );
    console.log('\n📄 详细报告已保存到: frontend-test-report.json');
}

/**
 * 主测试函数
 */
async function runComprehensiveTest() {
    console.log('🚀 开始 FitChallenge 前端功能全面测试...\n');
    
    // 按顺序执行测试
    await testBasicAccess();
    await testNavigationWithBrowser();
    await testAPIIntegration();
    await testAuthSystem();
    await testResponsiveDesign();
    await testErrorHandling();
    
    // 生成报告
    generateTestReport();
    
    console.log('\n✨ 前端功能全面测试完成！');
}

// 执行测试
runComprehensiveTest().catch(console.error);

export { runComprehensiveTest, testResults };