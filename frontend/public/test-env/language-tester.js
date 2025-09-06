/**
 * 语言测试器
 * 用于测试多语言功能、语言切换和设备语言检测
 */

class LanguageTester {
    constructor() {
        this.currentLanguage = 'en-US';
        this.supportedLanguages = {
            'en-US': {
                name: 'English',
                nativeName: 'English',
                flag: '🇺🇸',
                direction: 'ltr',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h'
            },
            'zh-CN': {
                name: 'Chinese (Simplified)',
                nativeName: '简体中文',
                flag: '🇨🇳',
                direction: 'ltr',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: '24h'
            },
            'ja-JP': {
                name: 'Japanese',
                nativeName: '日本語',
                flag: '🇯🇵',
                direction: 'ltr',
                dateFormat: 'YYYY/MM/DD',
                timeFormat: '24h'
            },
            'ko-KR': {
                name: 'Korean',
                nativeName: '한국어',
                flag: '🇰🇷',
                direction: 'ltr',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: '24h'
            },
            'ar-SA': {
                name: 'Arabic',
                nativeName: 'العربية',
                flag: '🇸🇦',
                direction: 'rtl',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h'
            }
        };
        
        this.translations = this.loadTranslations();
        this.init();
    }
    
    /**
     * 初始化语言测试器
     */
    init() {
        console.log('🌍 初始化语言测试器...');
        
        // 检测当前语言
        this.detectCurrentLanguage();
        
        // 设置HTML语言属性
        this.setHtmlLanguage();
        
        // 应用当前语言
        this.applyLanguage(this.currentLanguage);
        
        console.log('✅ 语言测试器初始化完成');
    }
    
    /**
     * 加载翻译数据
     */
    loadTranslations() {
        return {
            'en-US': {
                // 通用
                common: {
                    loading: 'Loading...',
                    error: 'Error',
                    success: 'Success',
                    cancel: 'Cancel',
                    confirm: 'Confirm',
                    close: 'Close',
                    save: 'Save',
                    edit: 'Edit',
                    delete: 'Delete',
                    search: 'Search',
                    filter: 'Filter',
                    sort: 'Sort',
                    refresh: 'Refresh',
                    back: 'Back',
                    next: 'Next',
                    previous: 'Previous',
                    finish: 'Finish'
                },
                // 导航
                navigation: {
                    home: 'Home',
                    profile: 'Profile',
                    settings: 'Settings',
                    help: 'Help',
                    about: 'About',
                    logout: 'Logout',
                    login: 'Login',
                    register: 'Register'
                },
                // 用户相关
                user: {
                    username: 'Username',
                    email: 'Email',
                    password: 'Password',
                    confirmPassword: 'Confirm Password',
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    phone: 'Phone',
                    avatar: 'Avatar',
                    bio: 'Biography',
                    location: 'Location',
                    birthday: 'Birthday',
                    gender: 'Gender'
                },
                // 认证
                auth: {
                    loginTitle: 'Welcome Back',
                    loginSubtitle: 'Sign in to your account',
                    registerTitle: 'Create Account',
                    registerSubtitle: 'Join our community',
                    forgotPassword: 'Forgot Password?',
                    rememberMe: 'Remember Me',
                    alreadyHaveAccount: 'Already have an account?',
                    dontHaveAccount: "Don't have an account?",
                    signIn: 'Sign In',
                    signUp: 'Sign Up',
                    signOut: 'Sign Out'
                },
                // Telegram相关
                telegram: {
                    quickLogin: 'Quick Login with Telegram',
                    quickRegister: 'Quick Register with Telegram',
                    telegramBot: 'Telegram Bot',
                    telegramUser: 'Telegram User',
                    telegramAuth: 'Telegram Authentication',
                    telegramLogin: 'Login via Telegram',
                    telegramRegister: 'Register via Telegram',
                    telegramProfile: 'Telegram Profile',
                    telegramSettings: 'Telegram Settings'
                },
                // 表单验证
                validation: {
                    required: 'This field is required',
                    invalidEmail: 'Please enter a valid email address',
                    passwordTooShort: 'Password must be at least 8 characters',
                    passwordsDoNotMatch: 'Passwords do not match',
                    usernameTooShort: 'Username must be at least 3 characters',
                    usernameTooLong: 'Username must be less than 20 characters',
                    invalidPhone: 'Please enter a valid phone number'
                },
                // 消息
                messages: {
                    loginSuccess: 'Login successful!',
                    loginFailed: 'Login failed. Please check your credentials.',
                    registerSuccess: 'Registration successful!',
                    registerFailed: 'Registration failed. Please try again.',
                    profileUpdated: 'Profile updated successfully!',
                    profileUpdateFailed: 'Failed to update profile.',
                    logoutSuccess: 'Logout successful!',
                    sessionExpired: 'Your session has expired. Please login again.',
                    networkError: 'Network error. Please check your connection.',
                    serverError: 'Server error. Please try again later.'
                }
            },
            'zh-CN': {
                // 通用
                common: {
                    loading: '加载中...',
                    error: '错误',
                    success: '成功',
                    cancel: '取消',
                    confirm: '确认',
                    close: '关闭',
                    save: '保存',
                    edit: '编辑',
                    delete: '删除',
                    search: '搜索',
                    filter: '筛选',
                    sort: '排序',
                    refresh: '刷新',
                    back: '返回',
                    next: '下一步',
                    previous: '上一步',
                    finish: '完成'
                },
                // 导航
                navigation: {
                    home: '首页',
                    profile: '个人资料',
                    settings: '设置',
                    help: '帮助',
                    about: '关于',
                    logout: '退出登录',
                    login: '登录',
                    register: '注册'
                },
                // 用户相关
                user: {
                    username: '用户名',
                    email: '邮箱',
                    password: '密码',
                    confirmPassword: '确认密码',
                    firstName: '名字',
                    lastName: '姓氏',
                    phone: '手机号',
                    avatar: '头像',
                    bio: '个人简介',
                    location: '位置',
                    birthday: '生日',
                    gender: '性别'
                },
                // 认证
                auth: {
                    loginTitle: '欢迎回来',
                    loginSubtitle: '登录您的账户',
                    registerTitle: '创建账户',
                    registerSubtitle: '加入我们的社区',
                    forgotPassword: '忘记密码？',
                    rememberMe: '记住我',
                    alreadyHaveAccount: '已有账户？',
                    dontHaveAccount: '没有账户？',
                    signIn: '登录',
                    signUp: '注册',
                    signOut: '退出'
                },
                // Telegram相关
                telegram: {
                    quickLogin: 'Telegram快捷登录',
                    quickRegister: 'Telegram快捷注册',
                    telegramBot: 'Telegram机器人',
                    telegramUser: 'Telegram用户',
                    telegramAuth: 'Telegram认证',
                    telegramLogin: '通过Telegram登录',
                    telegramRegister: '通过Telegram注册',
                    telegramProfile: 'Telegram资料',
                    telegramSettings: 'Telegram设置'
                },
                // 表单验证
                validation: {
                    required: '此字段为必填项',
                    invalidEmail: '请输入有效的邮箱地址',
                    passwordTooShort: '密码至少需要8个字符',
                    passwordsDoNotMatch: '密码不匹配',
                    usernameTooShort: '用户名至少需要3个字符',
                    usernameTooLong: '用户名不能超过20个字符',
                    invalidPhone: '请输入有效的手机号码'
                },
                // 消息
                messages: {
                    loginSuccess: '登录成功！',
                    loginFailed: '登录失败，请检查您的凭据。',
                    registerSuccess: '注册成功！',
                    registerFailed: '注册失败，请重试。',
                    profileUpdated: '个人资料更新成功！',
                    profileUpdateFailed: '更新个人资料失败。',
                    logoutSuccess: '退出登录成功！',
                    sessionExpired: '您的会话已过期，请重新登录。',
                    networkError: '网络错误，请检查您的连接。',
                    serverError: '服务器错误，请稍后重试。'
                }
            }
        };
    }
    
    /**
     * 检测当前语言
     */
    detectCurrentLanguage() {
        // 优先级：localStorage > 浏览器语言 > 默认语言
        const storedLanguage = localStorage.getItem('preferred-language');
        if (storedLanguage && this.supportedLanguages[storedLanguage]) {
            this.currentLanguage = storedLanguage;
            console.log('🌍 从localStorage恢复语言:', this.currentLanguage);
            return;
        }
        
        // 检测浏览器语言
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage) {
            // 尝试匹配完整语言代码
            if (this.supportedLanguages[browserLanguage]) {
                this.currentLanguage = browserLanguage;
                console.log('🌍 检测到浏览器语言:', this.currentLanguage);
                return;
            }
            
            // 尝试匹配语言部分
            const languagePart = browserLanguage.split('-')[0];
            const matchedLanguage = Object.keys(this.supportedLanguages).find(lang => 
                lang.startsWith(languagePart)
            );
            
            if (matchedLanguage) {
                this.currentLanguage = matchedLanguage;
                console.log('🌍 匹配到语言:', this.currentLanguage);
                return;
            }
        }
        
        // 使用默认语言
        this.currentLanguage = 'en-US';
        console.log('🌍 使用默认语言:', this.currentLanguage);
    }
    
    /**
     * 设置HTML语言属性
     */
    setHtmlLanguage() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.supportedLanguages[this.currentLanguage].direction;
        console.log('🌍 设置HTML语言属性:', this.currentLanguage);
    }
    
    /**
     * 应用语言
     */
    applyLanguage(languageCode) {
        if (!this.supportedLanguages[languageCode]) {
            console.error('❌ 不支持的语言:', languageCode);
            return;
        }
        
        this.currentLanguage = languageCode;
        localStorage.setItem('preferred-language', languageCode);
        
        // 设置HTML属性
        this.setHtmlLanguage();
        
        // 更新页面文本
        this.updatePageText();
        
        // 触发语言变化事件
        this.dispatchLanguageChangeEvent(languageCode);
        
        console.log('✅ 语言已切换到:', this.supportedLanguages[languageCode].name);
    }
    
    /**
     * 更新页面文本
     */
    updatePageText() {
        const language = this.supportedLanguages[this.currentLanguage];
        const translations = this.translations[this.currentLanguage];
        
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getTranslation(key, translations);
            if (text) {
                element.textContent = text;
            }
        });
        
        // 更新所有带有data-i18n-placeholder属性的元素
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const text = this.getTranslation(key, translations);
            if (text) {
                element.placeholder = text;
            }
        });
        
        // 更新页面标题
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `FitChallenge - ${language.name}`;
        }
        
        console.log('📝 页面文本已更新为:', language.name);
    }
    
    /**
     * 获取翻译文本
     */
    getTranslation(key, translations) {
        const keys = key.split('.');
        let result = translations;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return null;
            }
        }
        
        return result;
    }
    
    /**
     * 切换语言
     */
    switchLanguage(languageCode) {
        if (this.currentLanguage === languageCode) {
            console.log('🌍 语言已经是:', this.supportedLanguages[languageCode].name);
            return;
        }
        
        this.applyLanguage(languageCode);
    }
    
    /**
     * 获取当前语言信息
     */
    getCurrentLanguageInfo() {
        return {
            code: this.currentLanguage,
            ...this.supportedLanguages[this.currentLanguage]
        };
    }
    
    /**
     * 获取所有支持的语言
     */
    getSupportedLanguages() {
        return Object.entries(this.supportedLanguages).map(([code, info]) => ({
            code,
            ...info
        }));
    }
    
    /**
     * 检测文本方向
     */
    detectTextDirection(text) {
        // 简单的RTL检测（阿拉伯语、希伯来语等）
        const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
        return rtlPattern.test(text) ? 'rtl' : 'ltr';
    }
    
    /**
     * 格式化日期
     */
    formatDate(date, format = null) {
        const language = this.supportedLanguages[this.currentLanguage];
        const dateFormat = format || language.dateFormat;
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        switch (dateFormat) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'YYYY/MM/DD':
                return `${year}/${month}/${day}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }
    
    /**
     * 格式化时间
     */
    formatTime(date, format = null) {
        const language = this.supportedLanguages[this.currentLanguage];
        const timeFormat = format || language.timeFormat;
        
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        if (timeFormat === '12h') {
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes} ${period}`;
        } else {
            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
    }
    
    /**
     * 获取数字格式
     */
    getNumberFormat() {
        const language = this.supportedLanguages[this.currentLanguage];
        
        // 不同语言的数字分隔符
        const separators = {
            'en-US': { decimal: '.', thousands: ',' },
            'zh-CN': { decimal: '.', thousands: ',' },
            'ja-JP': { decimal: '.', thousands: ',' },
            'ko-KR': { decimal: '.', thousands: ',' },
            'ar-SA': { decimal: '.', thousands: ',' }
        };
        
        return separators[this.currentLanguage] || separators['en-US'];
    }
    
    /**
     * 格式化数字
     */
    formatNumber(number, options = {}) {
        const format = this.getNumberFormat();
        const { decimals = 2, showThousands = true } = options;
        
        let result = number.toFixed(decimals);
        
        if (showThousands && number >= 1000) {
            const parts = result.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
            result = parts.join(format.decimal);
        }
        
        return result;
    }
    
    /**
     * 触发语言变化事件
     */
    dispatchLanguageChangeEvent(languageCode) {
        const event = new CustomEvent('language-changed', {
            detail: {
                language: languageCode,
                languageInfo: this.supportedLanguages[languageCode],
                translations: this.translations[languageCode]
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * 添加语言变化监听器
     */
    onLanguageChange(callback) {
        window.addEventListener('language-changed', callback);
    }
    
    /**
     * 移除语言变化监听器
     */
    offLanguageChange(callback) {
        window.removeEventListener('language-changed', callback);
    }
    
    /**
     * 测试翻译功能
     */
    testTranslations() {
        console.log('🧪 开始测试翻译功能...');
        
        const testKeys = [
            'common.loading',
            'common.success',
            'navigation.home',
            'user.username',
            'auth.loginTitle',
            'telegram.quickLogin'
        ];
        
        const results = {};
        
        Object.keys(this.supportedLanguages).forEach(langCode => {
            results[langCode] = {};
            const translations = this.translations[langCode];
            
            testKeys.forEach(key => {
                const translation = this.getTranslation(key, translations);
                results[langCode][key] = translation || 'MISSING';
            });
        });
        
        console.log('📊 翻译测试结果:', results);
        return results;
    }
    
    /**
     * 重置到默认语言
     */
    reset() {
        console.log('🔄 重置语言设置...');
        localStorage.removeItem('preferred-language');
        this.applyLanguage('en-US');
        console.log('✅ 语言设置已重置');
    }
    
    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            currentLanguage: this.currentLanguage,
            currentLanguageInfo: this.getCurrentLanguageInfo(),
            supportedLanguages: this.getSupportedLanguages(),
            translations: this.translations[this.currentLanguage],
            htmlLang: document.documentElement.lang,
            htmlDir: document.documentElement.dir
        };
    }
}

// 导出语言测试器类
window.LanguageTester = LanguageTester;

// 自动创建默认实例
window.languageTester = new LanguageTester();

console.log('🌍 语言测试器已加载，全局对象: window.languageTester');
