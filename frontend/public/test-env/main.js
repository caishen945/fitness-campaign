/**
 * 主逻辑文件
 * 整合所有测试功能，提供完整的测试环境
 */

class TestEnvironment {
    constructor() {
        this.consoleOutput = document.getElementById('consoleContent');
        this.deviceFrame = document.getElementById('deviceFrame');
        this.customSizeModal = document.getElementById('customSizeModal');
        
        this.init();
    }
    
    /**
     * 初始化测试环境
     */
    async init() {
        console.log('🚀 初始化测试环境...');
        this.log('🚀 初始化测试环境...');
        
        try {
            // 等待所有模块加载完成
            await this.waitForModules();
            
            this.setupEventListeners();
            this.updateStatus();
            this.log('✅ 测试环境初始化完成');
            
            // 应用响应式样式
            if (window.deviceSimulator) {
                window.deviceSimulator.applyResponsiveStyles();
            }
        } catch (error) {
            console.error('❌ 测试环境初始化失败:', error);
            this.log(`❌ 测试环境初始化失败: ${error.message}`);
            
            // 显示错误信息
            this.showInitializationError(error.message);
        }
    }
    
    /**
     * 等待所有模块加载
     */
    async waitForModules() {
        const modules = ['telegramMock', 'apiMock', 'deviceSimulator', 'languageTester'];
        const maxWaitTime = 10000; // 最大等待时间10秒
        const checkInterval = 100; // 检查间隔100ms
        
        console.log('⏳ 等待模块加载...');
        
        for (const module of modules) {
            const startTime = Date.now();
            console.log(`🔍 等待模块: ${module}`);
            
            while (!window[module]) {
                if (Date.now() - startTime > maxWaitTime) {
                    console.error(`❌ 模块加载超时: ${module}`);
                    this.log(`❌ 模块加载超时: ${module}`);
                    throw new Error(`模块加载超时: ${module}`);
                }
                await new Promise(resolve => setTimeout(resolve, checkInterval));
            }
            
            console.log(`✅ 模块已加载: ${module}`);
            this.log(`✅ 模块已加载: ${module}`);
        }
        
        console.log('✅ 所有模块已加载');
        this.log('✅ 所有模块已加载');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 设备模拟器控制
        this.setupDeviceControls();
        
        // 语言切换器控制
        this.setupLanguageControls();
        
        // Telegram模拟器控制
        this.setupTelegramControls();
        
        // API模拟器控制
        this.setupApiControls();
        
        // 功能测试控制
        this.setupFunctionTests();
        
        // 控制台控制
        this.setupConsoleControls();
        
        // 模态框控制
        this.setupModalControls();
        
        // 监听设备变化事件
        this.setupDeviceEventListeners();
    }
    
    /**
     * 设置设备控制
     */
    setupDeviceControls() {
        const deviceSelect = document.getElementById('deviceSelect');
        const orientationBtn = document.getElementById('orientationBtn');
        const customSizeBtn = document.getElementById('customSizeBtn');
        
        deviceSelect.addEventListener('change', (e) => {
            const deviceType = e.target.value;
            window.deviceSimulator.switchDevice(deviceType);
            this.updateDeviceFrame();
            this.log(`📱 切换到设备: ${deviceType}`);
        });
        
        orientationBtn.addEventListener('click', () => {
            const currentOrientation = window.deviceSimulator.currentOrientation;
            const newOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
            window.deviceSimulator.switchOrientation(newOrientation);
            this.updateDeviceFrame();
            this.log(`🔄 切换到方向: ${newOrientation}`);
        });
        
        customSizeBtn.addEventListener('click', () => {
            this.showCustomSizeModal();
        });
    }
    
    /**
     * 设置语言控制
     */
    setupLanguageControls() {
        const languageSelect = document.getElementById('languageSelect');
        const testTranslationsBtn = document.getElementById('testTranslationsBtn');
        
        languageSelect.addEventListener('change', (e) => {
            const languageCode = e.target.value;
            window.languageTester.switchLanguage(languageCode);
            this.log(`🌍 切换到语言: ${languageCode}`);
        });
        
        testTranslationsBtn.addEventListener('click', () => {
            const results = window.languageTester.testTranslations();
            this.log('🧪 翻译测试完成，结果已输出到控制台');
            console.log('翻译测试结果:', results);
        });
    }
    
    /**
     * 设置Telegram控制
     */
    setupTelegramControls() {
        const simulateAuthBtn = document.getElementById('simulateAuthBtn');
        const switchThemeBtn = document.getElementById('switchThemeBtn');
        const resetTelegramBtn = document.getElementById('resetTelegramBtn');
        
        simulateAuthBtn.addEventListener('click', () => {
            window.telegramMock.simulateAuth();
            this.log('🔐 模拟Telegram用户授权');
        });
        
        switchThemeBtn.addEventListener('click', () => {
            const currentTheme = window.telegramMock.colorScheme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            window.telegramMock.switchTheme(newTheme);
            this.log(`🎨 切换到主题: ${newTheme}`);
        });
        
        resetTelegramBtn.addEventListener('click', () => {
            window.telegramMock.reset();
            this.log('🔄 Telegram模拟器已重置');
        });
    }
    
    /**
     * 设置API控制
     */
    setupApiControls() {
        const setDelayBtn = document.getElementById('setDelayBtn');
        const resetApiBtn = document.getElementById('resetApiBtn');
        
        setDelayBtn.addEventListener('click', () => {
            const delay = parseInt(document.getElementById('apiDelayInput').value);
            if (delay >= 0) {
                window.apiMock.setDelay(delay);
                this.log(`⏱️ API延迟设置为: ${delay}ms`);
            }
        });
        
        resetApiBtn.addEventListener('click', () => {
            window.apiMock.reset();
            this.log('🔄 API模拟器已重置');
        });
    }
    
    /**
     * 设置设备事件监听器
     */
    setupDeviceEventListeners() {
        // 监听设备变化事件
        if (window.deviceSimulator) {
            // 使用自定义事件监听
            window.addEventListener('deviceChange', () => {
                this.updateDeviceFrame();
                this.log('📱 设备已切换，设备框架已更新');
            });
            
            window.addEventListener('orientationChange', () => {
                this.updateDeviceFrame();
                this.log('🔄 方向已切换，设备框架已更新');
            });
        }
    }
    
    /**
     * 显示初始化错误
     */
    showInitializationError(errorMessage) {
        // 在控制台输出区域显示错误
        const errorDiv = document.createElement('div');
        errorDiv.className = 'console-line error';
        errorDiv.innerHTML = `
            <div style="color: #ff4444; font-weight: bold; margin-bottom: 10px;">
                ❌ 测试环境初始化失败
            </div>
            <div style="color: #ff6666; margin-bottom: 10px;">
                错误信息: ${errorMessage}
            </div>
            <div style="color: #888; font-size: 12px;">
                请检查浏览器控制台获取更多信息，或刷新页面重试
            </div>
        `;
        
        this.consoleOutput.appendChild(errorDiv);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }
    
    /**
     * 设置功能测试
     */
    setupFunctionTests() {
        // Telegram功能测试
        document.getElementById('testTelegramBtn').addEventListener('click', () => {
            this.testTelegramFunctions();
        });
        
        document.getElementById('testWebAppBtn').addEventListener('click', () => {
            this.testWebAppFunctions();
        });
        
        document.getElementById('testAuthBtn').addEventListener('click', () => {
            this.testAuthFunctions();
        });
        
        // API功能测试
        document.getElementById('testLoginBtn').addEventListener('click', () => {
            this.testApiLogin();
        });
        
        document.getElementById('testRegisterBtn').addEventListener('click', () => {
            this.testApiRegister();
        });
        
        document.getElementById('testProfileBtn').addEventListener('click', () => {
            this.testApiProfile();
        });
        
        // 多语言测试
        document.getElementById('testLanguageBtn').addEventListener('click', () => {
            this.testLanguageFunctions();
        });
        
        document.getElementById('testFormatBtn').addEventListener('click', () => {
            this.testFormatFunctions();
        });
        
        document.getElementById('testDirectionBtn').addEventListener('click', () => {
            this.testDirectionFunctions();
        });
        
        // 响应式测试
        document.getElementById('testResponsiveBtn').addEventListener('click', () => {
            this.testResponsiveFunctions();
        });
        
        document.getElementById('testOrientationBtn').addEventListener('click', () => {
            this.testOrientationFunctions();
        });
        
        document.getElementById('testTouchBtn').addEventListener('click', () => {
            this.testTouchFunctions();
        });
    }
    
    /**
     * 设置控制台控制
     */
    setupConsoleControls() {
        document.getElementById('clearConsoleBtn').addEventListener('click', () => {
            this.clearConsole();
        });
        
        document.getElementById('exportConsoleBtn').addEventListener('click', () => {
            this.exportConsole();
        });
    }
    
    /**
     * 设置模态框控制
     */
    setupModalControls() {
        document.getElementById('applyCustomSizeBtn').addEventListener('click', () => {
            this.applyCustomSize();
        });
        
        document.getElementById('cancelCustomSizeBtn').addEventListener('click', () => {
            this.hideCustomSizeModal();
        });
    }
    

    
    /**
     * 更新设备框架
     */
    updateDeviceFrame() {
        if (!window.deviceSimulator) return;
        
        const deviceInfo = window.deviceSimulator.getCurrentDeviceInfo();
        const frame = this.deviceFrame;
        
        // 更新框架类名
        frame.className = `device-frame ${deviceInfo.platform}`;
        
        // 更新尺寸
        frame.style.width = `${deviceInfo.actualWidth}px`;
        frame.style.height = `${deviceInfo.actualHeight}px`;
        
        // 更新内容
        const content = frame.querySelector('.device-content');
        if (content) {
            content.style.width = `${deviceInfo.actualWidth - 60}px`;
            content.style.height = `${deviceInfo.actualHeight - 60}px`;
        }
    }
    
    /**
     * 更新状态显示
     */
    updateStatus() {
        // 设备状态
        if (window.deviceSimulator) {
            const deviceStatus = document.getElementById('deviceStatus');
            const status = window.deviceSimulator.getStatus();
            deviceStatus.innerHTML = `
                <div><strong>当前设备:</strong> ${status.deviceInfo.name}</div>
                <div><strong>尺寸:</strong> ${status.deviceInfo.actualWidth}x${status.deviceInfo.actualHeight}</div>
                <div><strong>方向:</strong> ${status.orientation}</div>
                <div><strong>平台:</strong> ${status.deviceInfo.platform}</div>
            `;
        }
        
        // 语言状态
        if (window.languageTester) {
            const languageStatus = document.getElementById('languageStatus');
            const status = window.languageTester.getStatus();
            languageStatus.innerHTML = `
                <div><strong>当前语言:</strong> ${status.currentLanguageInfo.name}</div>
                <div><strong>代码:</strong> ${status.currentLanguageInfo.code}</div>
                <div><strong>方向:</strong> ${status.currentLanguageInfo.direction}</div>
                <div><strong>HTML:</strong> ${status.htmlLang}</div>
            `;
        }
        
        // Telegram状态
        if (window.telegramMock) {
            const telegramStatus = document.getElementById('telegramStatus');
            const status = window.telegramMock.getStatus();
            telegramStatus.innerHTML = `
                <div><strong>平台:</strong> ${status.platform}</div>
                <div><strong>主题:</strong> ${status.colorScheme}</div>
                <div><strong>视口高度:</strong> ${status.viewportHeight}</div>
                <div><strong>用户:</strong> ${status.currentUser?.username || '无'}</div>
            `;
        }
        
        // API状态
        if (window.apiMock) {
            const apiStatus = document.getElementById('apiStatus');
            const status = window.apiMock.getStatus();
            apiStatus.innerHTML = `
                <div><strong>延迟:</strong> ${status.delay}ms</div>
                <div><strong>用户数:</strong> ${status.userCount}</div>
                <div><strong>Token数:</strong> ${status.tokenCount}</div>
                <div><strong>基础URL:</strong> ${status.baseUrl}</div>
            `;
        }
    }
    
    /**
     * 显示自定义尺寸模态框
     */
    showCustomSizeModal() {
        this.customSizeModal.classList.add('show');
    }
    
    /**
     * 隐藏自定义尺寸模态框
     */
    hideCustomSizeModal() {
        this.customSizeModal.classList.remove('show');
    }
    
    /**
     * 应用自定义尺寸
     */
    applyCustomSize() {
        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);
        
        if (width >= 200 && height >= 200 && width <= 3000 && height <= 3000) {
            window.deviceSimulator.setCustomDimensions(width, height);
            this.hideCustomSizeModal();
            this.log(`📐 自定义尺寸已设置: ${width}x${height}`);
        } else {
            alert('请输入有效的尺寸 (200-3000px)');
        }
    }
    
    /**
     * 测试Telegram功能
     */
    testTelegramFunctions() {
        this.log('🧪 开始测试Telegram功能...');
        
        try {
            // 测试WebApp对象
            if (window.Telegram && window.Telegram.WebApp) {
                this.log('✅ Telegram WebApp对象存在');
                
                // 测试基本属性
                const webApp = window.Telegram.WebApp;
                this.log(`📱 平台: ${webApp.platform}`);
                this.log(`📱 版本: ${webApp.version}`);
                this.log(`📱 主题: ${webApp.colorScheme}`);
                
                // 测试方法
                webApp.ready().then(() => {
                    this.log('✅ WebApp.ready() 成功');
                });
                
                webApp.expand().then(() => {
                    this.log('✅ WebApp.expand() 成功');
                });
                
            } else {
                this.log('❌ Telegram WebApp对象不存在');
            }
            
            // 测试用户信息
            if (window.telegramMock) {
                const user = window.telegramMock.currentUser;
                this.log(`👤 当前用户: ${user.username} (${user.first_name} ${user.last_name})`);
            }
            
        } catch (error) {
            this.log(`❌ Telegram功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试WebApp功能
     */
    testWebAppFunctions() {
        this.log('🧪 开始测试WebApp功能...');
        
        try {
            const webApp = window.Telegram?.WebApp;
            if (!webApp) {
                this.log('❌ WebApp不可用');
                return;
            }
            
            // 测试按钮功能
            const mainButton = webApp.MainButton;
            if (mainButton) {
                mainButton.setText('测试按钮');
                mainButton.show();
                this.log('✅ 主按钮显示成功');
                
                setTimeout(() => {
                    mainButton.hide();
                    this.log('✅ 主按钮隐藏成功');
                }, 2000);
            }
            
            // 测试触觉反馈
            const haptic = webApp.HapticFeedback;
            if (haptic) {
                haptic.impactOccurred();
                this.log('✅ 触觉反馈测试成功');
            }
            
        } catch (error) {
            this.log(`❌ WebApp功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试认证功能
     */
    testAuthFunctions() {
        this.log('🧪 开始测试认证功能...');
        
        try {
            // 模拟认证
            window.telegramMock.simulateAuth();
            this.log('✅ 认证模拟成功');
            
            // 检查认证状态
            setTimeout(() => {
                const user = window.telegramMock.currentUser;
                if (user) {
                    this.log(`✅ 用户认证成功: ${user.username}`);
                } else {
                    this.log('❌ 用户认证失败');
                }
            }, 1000);
            
        } catch (error) {
            this.log(`❌ 认证功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试API登录
     */
    async testApiLogin() {
        this.log('🧪 开始测试API登录...');
        
        try {
            const response = await window.apiMock.request('/api/auth/login', 'POST', {
                email: 'test1@example.com',
                password: 'password123'
            });
            
            if (response.success) {
                this.log('✅ API登录测试成功');
                this.log(`👤 用户: ${response.user.username}`);
                this.log(`🔑 Token: ${response.token.substring(0, 20)}...`);
            } else {
                this.log('❌ API登录测试失败');
            }
            
        } catch (error) {
            this.log(`❌ API登录测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试API注册
     */
    async testApiRegister() {
        this.log('🧪 开始测试API注册...');
        
        try {
            const response = await window.apiMock.request('/api/auth/register', 'POST', {
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'password123'
            });
            
            if (response.success) {
                this.log('✅ API注册测试成功');
                this.log(`👤 新用户: ${response.user.username}`);
            } else {
                this.log('❌ API注册测试失败');
            }
            
        } catch (error) {
            this.log(`❌ API注册测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试API资料
     */
    async testApiProfile() {
        this.log('🧪 开始测试API资料...');
        
        try {
            // 先登录获取token
            const loginResponse = await window.apiMock.request('/api/auth/login', 'POST', {
                email: 'test1@example.com',
                password: 'password123'
            });
            
            if (loginResponse.success) {
                const token = loginResponse.token;
                
                // 获取资料
                const profileResponse = await window.apiMock.request('/api/users/profile', 'GET', { token });
                
                if (profileResponse.success) {
                    this.log('✅ API资料获取成功');
                    this.log(`👤 用户资料: ${profileResponse.user.username}`);
                } else {
                    this.log('❌ API资料获取失败');
                }
            } else {
                this.log('❌ 登录失败，无法测试资料功能');
            }
            
        } catch (error) {
            this.log(`❌ API资料测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试语言功能
     */
    testLanguageFunctions() {
        this.log('🧪 开始测试语言功能...');
        
        try {
            const results = window.languageTester.testTranslations();
            this.log('✅ 语言功能测试完成');
            
            // 显示测试结果
            Object.entries(results).forEach(([lang, translations]) => {
                this.log(`🌍 ${lang}: ${Object.values(translations).filter(t => t !== 'MISSING').length}/${Object.keys(translations).length} 翻译可用`);
            });
            
        } catch (error) {
            this.log(`❌ 语言功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试格式功能
     */
    testFormatFunctions() {
        this.log('🧪 开始测试格式功能...');
        
        try {
            const now = new Date();
            const number = 1234567.89;
            
            // 测试日期格式
            const dateFormats = ['en-US', 'zh-CN', 'ja-JP'];
            dateFormats.forEach(lang => {
                window.languageTester.switchLanguage(lang);
                const formattedDate = window.languageTester.formatDate(now);
                this.log(`📅 ${lang}: ${formattedDate}`);
            });
            
            // 测试数字格式
            const formattedNumber = window.languageTester.formatNumber(number, { showThousands: true });
            this.log(`🔢 数字格式: ${formattedNumber}`);
            
            // 恢复当前语言
            const currentLang = window.languageTester.getCurrentLanguageInfo().code;
            window.languageTester.switchLanguage(currentLang);
            
            this.log('✅ 格式功能测试完成');
            
        } catch (error) {
            this.log(`❌ 格式功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试方向功能
     */
    testDirectionFunctions() {
        this.log('🧪 开始测试方向功能...');
        
        try {
            const languages = window.languageTester.getSupportedLanguages();
            
            languages.forEach(lang => {
                const direction = lang.direction;
                const testText = lang.nativeName;
                const detectedDirection = window.languageTester.detectTextDirection(testText);
                
                this.log(`🌍 ${lang.code}: ${direction} (检测: ${detectedDirection})`);
            });
            
            this.log('✅ 方向功能测试完成');
            
        } catch (error) {
            this.log(`❌ 方向功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试响应式功能
     */
    testResponsiveFunctions() {
        this.log('🧪 开始测试响应式功能...');
        
        try {
            const devices = window.deviceSimulator.getAvailableDevices();
            
            devices.forEach(device => {
                this.log(`📱 ${device.name}: ${device.width}x${device.height} (${device.platform})`);
            });
            
            this.log('✅ 响应式功能测试完成');
            
        } catch (error) {
            this.log(`❌ 响应式功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试方向功能
     */
    testOrientationFunctions() {
        this.log('🧪 开始测试方向功能...');
        
        try {
            const currentOrientation = window.deviceSimulator.currentOrientation;
            this.log(`📐 当前方向: ${currentOrientation}`);
            
            // 测试方向切换
            const newOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
            window.deviceSimulator.switchOrientation(newOrientation);
            
            setTimeout(() => {
                this.log(`📐 方向切换完成: ${newOrientation}`);
                // 恢复原方向
                window.deviceSimulator.switchOrientation(currentOrientation);
            }, 1000);
            
        } catch (error) {
            this.log(`❌ 方向功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 测试触摸功能
     */
    testTouchFunctions() {
        this.log('🧪 开始测试触摸功能...');
        
        try {
            const deviceInfo = window.deviceSimulator.getCurrentDeviceInfo();
            
            this.log(`📱 设备类型: ${deviceInfo.platform}`);
            this.log(`📱 是否移动设备: ${deviceInfo.isMobile}`);
            this.log(`📱 触摸点数量: ${navigator.maxTouchPoints || 0}`);
            
            if (deviceInfo.isMobile) {
                this.log('✅ 触摸功能可用');
            } else {
                this.log('ℹ️ 触摸功能不可用（非移动设备）');
            }
            
        } catch (error) {
            this.log(`❌ 触摸功能测试失败: ${error.message}`);
        }
    }
    
    /**
     * 添加日志
     */
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = 'console-line';
        line.textContent = `[${timestamp}] ${message}`;
        
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
        
        // 同时输出到控制台
        console.log(message);
    }
    
    /**
     * 清空控制台
     */
    clearConsole() {
        this.consoleOutput.innerHTML = '';
        this.log('🧹 控制台已清空');
    }
    
    /**
     * 导出控制台
     */
    exportConsole() {
        const content = this.consoleOutput.textContent;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-console-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.log('📁 控制台已导出');
    }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化测试环境...');
    window.testEnvironment = new TestEnvironment();
});

// 全局测试函数
window.testAll = function() {
    if (window.testEnvironment) {
        window.testEnvironment.log('🧪 开始执行所有测试...');
        
        // 执行所有测试
        setTimeout(() => window.testEnvironment.testTelegramFunctions(), 100);
        setTimeout(() => window.testEnvironment.testWebAppFunctions(), 200);
        setTimeout(() => window.testEnvironment.testAuthFunctions(), 300);
        setTimeout(() => window.testEnvironment.testApiLogin(), 400);
        setTimeout(() => window.testEnvironment.testApiRegister(), 500);
        setTimeout(() => window.testEnvironment.testLanguageFunctions(), 600);
        setTimeout(() => window.testEnvironment.testResponsiveFunctions(), 700);
        
        window.testEnvironment.log('🎯 所有测试已启动，请查看控制台输出');
    } else {
        console.error('测试环境未初始化');
    }
};

console.log('📱 测试环境主逻辑已加载');
