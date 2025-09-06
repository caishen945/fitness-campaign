/**
 * Telegram Web App 环境模拟器
 * 用于在本地浏览器中模拟Telegram环境，测试Telegram相关功能
 */

class TelegramMock {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.initData = '';
        this.initDataUnsafe = {};
        this.platform = 'unknown';
        this.themeParams = {};
        this.colorScheme = 'light';
        this.viewportHeight = 0;
        this.viewportStableHeight = 0;
        this.headerColor = '#ffffff';
        this.backgroundColor = '#ffffff';
        this.isExpanded = false;
        this.isClosingConfirmationEnabled = false;
        this.backButton = {
            isVisible: false,
            onClick: null
        };
        this.mainButton = {
            text: '',
            color: '#2481cc',
            textColor: '#ffffff',
            isVisible: false,
            isProgressVisible: false,
            isActive: true,
            onClick: null
        };
        this.hapticFeedback = {
            impactOccurred: () => console.log('🔔 Haptic feedback: impact'),
            notificationOccurred: () => console.log('🔔 Haptic feedback: notification'),
            selectionChanged: () => console.log('🔔 Haptic feedback: selection')
        };
        
        this.init();
    }
    
    /**
     * 初始化模拟环境
     */
    init() {
        console.log('🚀 初始化Telegram模拟环境...');
        
        // 设置默认值
        this.setDefaultUser();
        this.setDefaultTheme();
        this.setDefaultViewport();
        
        // 创建全局对象
        this.createGlobalObject();
        
        this.isInitialized = true;
        console.log('✅ Telegram模拟环境初始化完成');
    }
    
    /**
     * 设置默认测试用户
     */
    setDefaultUser() {
        this.currentUser = {
            id: 123456789,
            is_bot: false,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en',
            is_premium: false,
            added_to_attachment_menu: false,
            allows_write_to_pm: true,
            photo_url: 'https://via.placeholder.com/100x100/2481cc/ffffff?text=TU'
        };
        
        // 生成模拟的initData
        this.generateInitData();
    }
    
    /**
     * 生成模拟的初始化数据
     */
    generateInitData() {
        const mockData = {
            user: this.currentUser,
            chat_instance: 'test_chat_instance',
            chat_type: 'private',
            start_param: 'test_start_param',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mock_hash_' + Date.now()
        };
        
        this.initDataUnsafe = mockData;
        this.initData = btoa(JSON.stringify(mockData));
    }
    
    /**
     * 设置默认主题
     */
    setDefaultTheme() {
        this.themeParams = {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff'
        };
        this.colorScheme = 'light';
    }
    
    /**
     * 设置默认视口
     */
    setDefaultViewport() {
        this.viewportHeight = 600;
        this.viewportStableHeight = 600;
    }
    
    /**
     * 创建全局Telegram对象
     */
    createGlobalObject() {
        const telegramMock = {
            WebApp: {
                // 基本属性
                initData: this.initData,
                initDataUnsafe: this.initDataUnsafe,
                version: '6.9',
                platform: this.platform,
                colorScheme: this.colorScheme,
                themeParams: this.themeParams,
                isExpanded: this.isExpanded,
                viewportHeight: this.viewportHeight,
                viewportStableHeight: this.viewportStableHeight,
                headerColor: this.headerColor,
                backgroundColor: this.backgroundColor,
                isClosingConfirmationEnabled: this.isClosingConfirmationEnabled,
                
                // 用户信息
                initDataUnsafe: this.initDataUnsafe,
                
                // 方法
                ready: () => {
                    console.log('📱 Telegram WebApp.ready() 被调用');
                    return Promise.resolve();
                },
                
                expand: () => {
                    console.log('📱 Telegram WebApp.expand() 被调用');
                    this.isExpanded = true;
                    return Promise.resolve();
                },
                
                close: () => {
                    console.log('📱 Telegram WebApp.close() 被调用');
                    return Promise.resolve();
                },
                
                // 主题相关
                setHeaderColor: (color) => {
                    console.log('📱 设置头部颜色:', color);
                    this.headerColor = color;
                },
                
                setBackgroundColor: (color) => {
                    console.log('📱 设置背景颜色:', color);
                    this.backgroundColor = color;
                },
                
                // 主按钮
                MainButton: {
                    text: this.mainButton.text,
                    color: this.mainButton.color,
                    textColor: this.mainButton.textColor,
                    isVisible: this.mainButton.isVisible,
                    isProgressVisible: this.mainButton.isProgressVisible,
                    isActive: this.mainButton.isActive,
                    
                    setText: (text) => {
                        console.log('📱 设置主按钮文本:', text);
                        this.mainButton.text = text;
                    },
                    
                    show: () => {
                        console.log('📱 显示主按钮');
                        this.mainButton.isVisible = true;
                    },
                    
                    hide: () => {
                        console.log('📱 隐藏主按钮');
                        this.mainButton.isVisible = false;
                    },
                    
                    showProgress: (leaveActive = false) => {
                        console.log('📱 显示主按钮进度条');
                        this.mainButton.isProgressVisible = true;
                        this.mainButton.isActive = !leaveActive;
                    },
                    
                    hideProgress: () => {
                        console.log('📱 隐藏主按钮进度条');
                        this.mainButton.isProgressVisible = false;
                    },
                    
                    enable: () => {
                        console.log('📱 启用主按钮');
                        this.mainButton.isActive = true;
                    },
                    
                    disable: () => {
                        console.log('📱 禁用主按钮');
                        this.mainButton.isActive = false;
                    },
                    
                    onClick: (callback) => {
                        console.log('📱 设置主按钮点击回调');
                        this.mainButton.onClick = callback;
                    },
                    
                    offClick: (callback) => {
                        console.log('📱 移除主按钮点击回调');
                        this.mainButton.onClick = null;
                    }
                },
                
                // 返回按钮
                BackButton: {
                    isVisible: this.backButton.isVisible,
                    
                    show: () => {
                        console.log('📱 显示返回按钮');
                        this.backButton.isVisible = true;
                    },
                    
                    hide: () => {
                        console.log('📱 隐藏返回按钮');
                        this.backButton.isVisible = false;
                    },
                    
                    onClick: (callback) => {
                        console.log('📱 设置返回按钮点击回调');
                        this.backButton.onClick = callback;
                    },
                    
                    offClick: (callback) => {
                        console.log('📱 移除返回按钮点击回调');
                        this.backButton.onClick = null;
                    }
                },
                
                // 触觉反馈
                HapticFeedback: this.hapticFeedback,
                
                // 事件
                onEvent: (eventType, eventData) => {
                    console.log('📱 触发事件:', eventType, eventData);
                },
                
                offEvent: (eventType, eventData) => {
                    console.log('📱 移除事件:', eventType);
                },
                
                sendData: (data) => {
                    console.log('📱 发送数据到Telegram:', data);
                    return Promise.resolve();
                },
                
                switchInlineQuery: (query, chooseChatTypes) => {
                    console.log('📱 切换内联查询:', query, chooseChatTypes);
                    return Promise.resolve();
                },
                
                openLink: (url, options) => {
                    console.log('📱 打开链接:', url, options);
                    return Promise.resolve();
                },
                
                openTelegramLink: (url) => {
                    console.log('📱 打开Telegram链接:', url);
                    return Promise.resolve();
                },
                
                openInvoice: (url) => {
                    console.log('📱 打开发票:', url);
                    return Promise.resolve();
                },
                
                showPopup: (params) => {
                    console.log('📱 显示弹窗:', params);
                    return Promise.resolve();
                },
                
                showAlert: (message) => {
                    console.log('📱 显示警告:', message);
                    return Promise.resolve();
                },
                
                showConfirm: (message) => {
                    console.log('📱 显示确认:', message);
                    return Promise.resolve();
                },
                
                showScanQrPopup: (params) => {
                    console.log('📱 显示二维码扫描弹窗:', params);
                    return Promise.resolve();
                },
                
                closeScanQrPopup: () => {
                    console.log('📱 关闭二维码扫描弹窗');
                    return Promise.resolve();
                },
                
                readTextFromClipboard: () => {
                    console.log('📱 从剪贴板读取文本');
                    return Promise.resolve('模拟剪贴板文本');
                },
                
                requestWriteAccess: () => {
                    console.log('📱 请求写入权限');
                    return Promise.resolve(true);
                },
                
                requestContact: () => {
                    console.log('📱 请求联系人');
                    return Promise.resolve({
                        phone_number: '+1234567890',
                        first_name: 'Test',
                        last_name: 'Contact'
                    });
                },
                
                invokeCustomMethod: (method, params) => {
                    console.log('📱 调用自定义方法:', method, params);
                    return Promise.resolve({ success: true });
                },
                
                version: '6.9',
                platform: this.platform,
                colorScheme: this.colorScheme,
                themeParams: this.themeParams,
                isExpanded: this.isExpanded,
                viewportHeight: this.viewportHeight,
                viewportStableHeight: this.viewportStableHeight,
                headerColor: this.headerColor,
                backgroundColor: this.backgroundColor,
                isClosingConfirmationEnabled: this.isClosingConfirmationEnabled,
                initData: this.initData,
                initDataUnsafe: this.initDataUnsafe
            }
        };
        
        // 设置到全局对象
        window.Telegram = telegramMock;
        
        // 触发初始化事件
        setTimeout(() => {
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('telegram-webapp-ready'));
            }
        }, 100);
    }
    
    /**
     * 更新用户信息
     */
    updateUser(userData) {
        this.currentUser = { ...this.currentUser, ...userData };
        this.generateInitData();
        this.createGlobalObject();
        console.log('✅ 用户信息已更新:', this.currentUser);
    }
    
    /**
     * 切换平台
     */
    switchPlatform(platform) {
        this.platform = platform;
        this.createGlobalObject();
        console.log('✅ 平台已切换到:', platform);
    }
    
    /**
     * 切换主题
     */
    switchTheme(theme) {
        this.colorScheme = theme;
        if (theme === 'dark') {
            this.themeParams = {
                bg_color: '#1a1a1a',
                text_color: '#ffffff',
                hint_color: '#999999',
                link_color: '#64baf1',
                button_color: '#64baf1',
                button_text_color: '#ffffff'
            };
        } else {
            this.setDefaultTheme();
        }
        this.createGlobalObject();
        console.log('✅ 主题已切换到:', theme);
    }
    
    /**
     * 模拟用户授权
     */
    simulateAuth() {
        console.log('🔐 模拟用户授权...');
        this.generateInitData();
        this.createGlobalObject();
        
        // 触发授权完成事件
        setTimeout(() => {
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('telegram-auth-complete', {
                    detail: { user: this.currentUser }
                }));
            }
        }, 500);
        
        console.log('✅ 用户授权模拟完成');
    }
    
    /**
     * 重置到默认状态
     */
    reset() {
        console.log('🔄 重置Telegram模拟环境...');
        this.isInitialized = false;
        this.setDefaultUser();
        this.setDefaultTheme();
        this.setDefaultViewport();
        this.createGlobalObject();
        console.log('✅ 环境已重置');
    }
    
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentUser: this.currentUser,
            platform: this.platform,
            colorScheme: this.colorScheme,
            isExpanded: this.isExpanded,
            viewportHeight: this.viewportHeight,
            headerColor: this.headerColor,
            backgroundColor: this.backgroundColor
        };
    }
}

// 导出模拟器类
window.TelegramMock = TelegramMock;

// 自动创建默认实例
window.telegramMock = new TelegramMock();

console.log('📱 Telegram模拟器已加载，全局对象: window.telegramMock');
