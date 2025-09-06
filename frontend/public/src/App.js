import api from './services/api.js';
import Home from '../pages/Home.js';
import Login from '../pages/Login.js';
import Register from '../pages/Register.js';
import Profile from '../pages/Profile.js';
import Challenge from '../pages/Challenge.js';
import Leaderboard from '../pages/Leaderboard.js';
import News from '../pages/News.js';
import History from '../pages/History.js';
import Team from '../pages/Team.js';
import Achievements from '../pages/Achievements.js';
import Checkin from '../pages/Checkin.js';
import Wallet from '../pages/Wallet.js';
import PKChallenge from '../pages/PKChallenge.js';
import Notifications from '../pages/Notifications.js';
import UserProfile from '../pages/UserProfile.js';
import AdminDashboard from '../pages/AdminDashboard.js';

// 定义页面配置
const PAGE_CONFIG = {
    home: { name: '首页', icon: 'home' },
    challenge: { name: '挑战', icon: 'running' },
    leaderboard: { name: '排行', icon: 'trophy' },
    news: { name: '新闻', icon: 'newspaper' }
};

// 定义用户相关页面
const USER_PAGES = [
    'profile', 'history', 'team', 'achievements', 
    'checkin', 'wallet', 'pk', 'notifications'
];

class App {
    constructor() {
        // 应用状态
        this.currentPage = 'home';
        this.user = null;
        this.token = null;
        this.notifications = [];
        this.eventListenersBound = false;
        
        // API服务初始化
        this.api = api;
        
        // 页面实例
        this.pages = {};
        
        // 事件系统
        this.eventListeners = {};
        
        // 初始化页面
        this.initPages();
    }
    
        /**
     * 初始化所有页面实例
     */
    initPages() {
        // 只初始化当前需要的页面，其他页面懒加载
        this.pages = {
            home: new Home(this),
            login: new Login(this),
            register: new Register(this)
        };
        
        console.log('✅ 核心页面初始化完成');
    }
    
    /**
     * 懒加载页面
     */
    async loadPage(pageName) {
        if (this.pages[pageName]) {
            return this.pages[pageName];
        }
        
        try {
            let PageClass;
            switch (pageName) {
                case 'profile':
                    PageClass = (await import('../pages/Profile.js')).default;
                    break;
                case 'challenge':
                    PageClass = (await import('../pages/Challenge.js')).default;
                    break;
                case 'leaderboard':
                    PageClass = (await import('../pages/Leaderboard.js')).default;
                    break;
                case 'news':
                    PageClass = (await import('../pages/News.js')).default;
                    break;
                case 'history':
                    PageClass = (await import('../pages/History.js')).default;
                    break;
                case 'team':
                    PageClass = (await import('../pages/Team.js')).default;
                    break;
                case 'achievements':
                    PageClass = (await import('../pages/Achievements.js')).default;
                    break;
                case 'checkin':
                    PageClass = (await import('../pages/Checkin.js')).default;
                    break;
                case 'wallet':
                    PageClass = (await import('../pages/Wallet.js')).default;
                    break;
                case 'pk':
                    PageClass = (await import('../pages/PKChallenge.js')).default;
                    break;
                case 'notifications':
                    PageClass = (await import('../pages/Notifications.js')).default;
                    break;
                case 'userprofile':
                    PageClass = (await import('../pages/UserProfile.js')).default;
                    break;
                case 'admin':
                    PageClass = (await import('../pages/AdminDashboard.js')).default;
                    break;
                default:
                    throw new Error(`未知页面: ${pageName}`);
            }
            
            this.pages[pageName] = new PageClass(this);
            console.log(`✅ 页面 ${pageName} 懒加载完成`);
            return this.pages[pageName];
        } catch (error) {
            console.error(`❌ 页面 ${pageName} 加载失败:`, error);
            return null;
        }
    }
    
    /**
     * 初始化应用
     */
    init() {
        console.log('🚀 FitChallenge App 开始初始化...');
        
        // 检查模态框初始状态并确保隐藏
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            console.log('🎯 模态框初始状态:', {
                display: modalContainer.style.display,
                computedDisplay: window.getComputedStyle(modalContainer).display
            });
            
            // 强制隐藏模态框
            modalContainer.style.display = 'none';
            console.log('🎯 强制隐藏模态框');
        }
        
        try {
            console.log('📋 步骤1: 恢复认证状态');
            this.restoreAuthState();
            
            console.log('📋 步骤2: 加载通知');
            this.loadNotifications();
            
            console.log('📋 步骤3: 设置事件监听器');
            this.setupEventListeners();
            
            console.log('📋 步骤4: 渲染应用');
            this.render();
            
            console.log('✅ FitChallenge App 初始化完成');
            console.log('最终App状态 - user:', this.user, 'token:', this.token ? '存在' : '不存在');
            
            // 再次检查模态框状态
            const modalContainer = document.getElementById('modal-container');
            if (modalContainer) {
                console.log('🎯 初始化完成后模态框状态:', {
                    display: modalContainer.style.display,
                    computedDisplay: window.getComputedStyle(modalContainer).display
                });
            }
        } catch (error) {
            console.error('❌ 应用初始化错误:', error);
        }
    }
    
    /**
     * 从本地存储恢复认证状态
     */
    async restoreAuthState() {
        console.log('🔍 开始恢复认证状态...');
        
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('localStorage中的token:', storedToken ? '存在' : '不存在');
        console.log('localStorage中的user:', storedUser ? '存在' : '不存在');
        
        if (storedToken && storedUser) {
            try {
                this.token = storedToken;
                this.user = JSON.parse(storedUser);
                console.log('✅ 认证状态恢复成功');
                console.log('恢复的用户:', this.user);
                console.log('恢复的token:', this.token ? '存在' : '不存在');
                
                // 尝试刷新token
                await this.refreshToken();
            } catch (error) {
                console.error('❌ 解析用户信息失败:', error);
                this.clearAuthState();
            }
        } else {
            console.log('❌ localStorage中没有认证信息');
        }
        
        console.log('恢复后的App状态 - user:', this.user, 'token:', this.token ? '存在' : '不存在');
    }
    
    /**
     * 刷新token
     */
    async refreshToken() {
        try {
            if (!this.token) {
                console.log('没有token，无法刷新');
                return;
            }
            
            console.log('尝试刷新token...');
            const response = await api.refreshToken(this.token);
            
            if (response.success && response.token) {
                console.log('✅ Token刷新成功');
                this.setToken(response.token);
                
                if (response.user) {
                    this.setUser(response.user);
                }
                
                return true;
            } else {
                console.error('❌ Token刷新失败:', response.error || '未知错误');
                // Token刷新失败，跳转到修复指导页面
                this.handleTokenFailure();
                return false;
            }
        } catch (error) {
            console.error('❌ Token刷新出错:', error);
            // 检查是否是网络错误
            if (error.message.includes('Failed to fetch') || error.message.includes('网络')) {
                console.log('网络问题导致token刷新失败，不跳转到修复页面');
                // 这种情况下不跳转到修复指导页面，因为可能是临时网络问题
                return false;
            }
            
            // 其他错误情况下跳转到修复指导页面
            this.handleTokenFailure();
            return false;
        }
    }

    /**
     * 处理token失败的情况
     */
    handleTokenFailure() {
        console.log('🔄 Token验证失败，清除认证状态并跳转到登录页面');
        this.clearAuthState();
        
        // 直接跳转到登录页面
        this.navigate('login');
    }
    
    /**
     * 清除认证状态
     */
    clearAuthState() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.user = null;
        this.token = null;
    }
    
            /**
     * 设置事件监听器
     */
    setupEventListeners() {
        if (this.eventListenersBound) return;
        
        // 使用事件委托来处理页面导航，提高性能
        document.addEventListener('click', (e) => {
            // 处理 data-page 属性的链接
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                const page = pageLink.getAttribute('data-page');
                if (page) {
                    this.navigate(page);
                }
            }
        });
        
        // 监听logout事件
        document.addEventListener('logout', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // 浏览器后退/前进按钮支持
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            const page = hash || 'home';
            if (this.pages[page]) {
                this.navigate(page);
            }
        });
        
        this.eventListenersBound = true;
    }
    
        /**
     * 处理导航点击事件
     * @param {Event} e - 事件对象
     */
    handleNavigationClick(e) {
        // 阻止默认行为
        e.preventDefault();
        
        // 检查事件目标
        if (!e || !e.target) {
            return;
        }
        
        // 查找具有data-page属性的元素
        let target = e.target;
        while (target && target !== document) {
            if (target.hasAttribute('data-page')) {
                break;
            }
            target = target.parentElement;
        }
        
        // 如果找到具有data-page属性的元素
        if (target && target.hasAttribute('data-page')) {
            const page = target.getAttribute('data-page');
            if (page) {
                this.navigate(page);
            }
        }
    }
    
                  /**
     * 页面导航
     * @param {string} page - 要导航到的页面
     * @param {boolean} force - 是否强制导航，即使页面相同
     */
    async navigate(page, force = false) {
        console.log('导航到页面:', page);
        console.log('导航前状态 - currentPage:', this.currentPage, 'user:', this.user, 'token:', this.token);
        
        // 检查页面参数
        if (!page) {
            console.error('导航页面参数为空');
            return;
        }
        
        // 特殊处理：如果点击的是用户相关页面，确保导航正确
        if (USER_PAGES.includes(page)) {
            // 这些页面是独立的，不需要特殊处理
        }
        
        // 如果页面相同且不强制导航，则不执行任何操作
        if (this.currentPage === page && !force) {
            console.log('页面相同，无需切换');
            return;
        }
        
        // 懒加载页面（如果需要）
        if (!this.pages[page]) {
            console.log(`页面 ${page} 不存在，尝试懒加载...`);
            const loadedPage = await this.loadPage(page);
            if (!loadedPage) {
                console.error(`页面 ${page} 加载失败`);
                return;
            }
        }
        
        // 更新当前页面
        console.log(`从 ${this.currentPage} 切换到 ${page}`);
        this.currentPage = page;
        
        // 重新渲染整个应用以确保导航栏正确更新
        this.render();
        
        // 执行页面特定的后渲染逻辑
        this.executeAfterRender();
        
        console.log('导航后状态 - currentPage:', this.currentPage, 'user:', this.user, 'token:', this.token);
    }
    
    /**
     * 更新主内容区域
     */
    updateMainContent() {
        const mainContent = document.querySelector('main .container');
        if (mainContent) {
            const currentPage = this.pages[this.currentPage];
            let pageContent = '<h1>页面未找到</h1>';
            
            try {
                if (currentPage) {
                    // 检查页面是否有render方法
                    if (typeof currentPage.render === 'function') {
                        // 如果render方法需要参数，传递token和user
                        if (currentPage.render.length > 0) {
                            pageContent = currentPage.render(this.token, this.user);
                        } else {
                            pageContent = currentPage.render();
                        }
                    } else {
                        pageContent = '<h1>页面渲染方法不存在</h1>';
                    }
                } else {
                    pageContent = '<h1>页面未找到</h1>';
                }
            } catch (error) {
                console.error('页面渲染错误:', error);
                pageContent = '<h1>页面渲染错误</h1>';
            }
            
            mainContent.innerHTML = pageContent;
        }
    }
    
            /**
     * 更新底部导航栏的活动状态
     */
    updateActiveNavigation() {
        console.log('更新导航栏状态 - currentPage:', this.currentPage, 'user:', this.user, 'token:', this.token);
        
        // 更新导航项的活动状态
        const navItems = document.querySelectorAll('.nav-item');
        console.log('找到导航项数量:', navItems.length);
        
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page) {
                // 对于"我的"导航项，当访问任何用户相关页面时都保持高亮
                if (page === 'profile') {
                    if (USER_PAGES.includes(this.currentPage)) {
                        item.classList.add('active');
                        console.log('激活profile导航项');
                    } else {
                        item.classList.remove('active');
                        console.log('移除profile导航项激活状态');
                    }
                } 
                // 对于其他导航项，只有当直接访问对应页面时才高亮
                else if (page === this.currentPage) {
                    item.classList.add('active');
                    console.log('激活导航项:', page);
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }
    
    /**
     * 用户登录
     * @param {Object} user - 用户对象
     * @param {string} token - 认证令牌
     */
    async login(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.showToast('登录成功！', 'success');
        await this.navigate('home');
    }

    /**
     * 设置用户认证令牌
     * @param {string} token - 认证令牌
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * 设置用户信息
     * @param {Object} user - 用户对象
     */
    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateActiveNavigation();
    }

    /**
     * 检查用户是否已认证
     * @returns {boolean} 是否已认证
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * 用户登出
     */
    async logout() {
        // 清除用户状态
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 显示登出提示
        this.showToast('已登出', 'info');
        
        // 确保home页面已加载
        if (!this.pages['home']) {
            await this.loadPage('home');
        }
        
        // 重置当前页面为home
        this.currentPage = 'home';
        
        // 强制重新渲染整个应用
        this.render();
        
        // 执行页面后渲染逻辑
        this.executeAfterRender();
        
        // 更新导航栏状态
        this.updateActiveNavigation();
        
        console.log('✅ 用户登出完成，页面已刷新');
    }
    
    /**
     * 显示加载动画
     */
    showLoading() {
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) {
            loadingEl.style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
    
        /**
     * 加载通知
     */
    async loadNotifications() {
        try {
            // 模拟加载通知
            this.notifications = [
                { id: 1, message: '您今天的步数挑战已完成！', time: '刚刚', read: false },
                { id: 2, message: '您获得了新的成就徽章', time: '2小时前', read: false },
                { id: 3, message: '您的好友邀请您参加PK挑战', time: '1天前', read: true }
            ];
            this.updateNotificationBadge();
        } catch (error) {
            console.error('加载通知失败:', error);
            this.notifications = []; // 确保在出错时notifications是空数组
        }
    }
    
        /**
     * 更新通知徽章
     */
    updateNotificationBadge() {
        // 只在页面已经渲染后才尝试更新徽章
        if (document.getElementById('root')) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            const badge = document.getElementById('notification-badge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }
    
    /**
     * 显示Toast通知
     * @param {string} message - 要显示的消息
     * @param {string} type - 通知类型（success, error, info）
     */
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
    
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
    
        // 根据消息长度和类型调整样式
        if (message.length > 50) {
            toast.style.maxWidth = '80%';
            toast.style.whiteSpace = 'normal';
            toast.style.textAlign = 'left';
            toast.style.padding = '12px 16px';
        }
        
        if (type === 'error') {
            toast.style.backgroundColor = '#ff4444';
            toast.style.color = 'white';
            duration = Math.max(duration, 5000); // 错误消息至少显示5秒
        }
    
        toastContainer.appendChild(toast);
    
        // 自动移除
        const hideToast = () => {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };
    
        // 指定时间后自动隐藏
        setTimeout(hideToast, duration);
    
        // 手动关闭
        toast.querySelector('.toast-close').addEventListener('click', () => {
            hideToast();
        });
    }
    
            /**
     * 渲染应用
     */
    render() {
        const appElement = document.getElementById('root');
        if (!appElement) {
            console.error('找不到根元素 #root');
            return;
        }
    
        try {
            // 构建导航栏
            const navItems = Object.entries(PAGE_CONFIG).map(([page, config]) => {
                const isActive = this.currentPage === page;
                return this.renderNavItem(page, config, isActive);
            }).join('');
            
            // 构建用户导航项
            const userNavItem = this.user ? 
                this.renderUserNavItem() : 
                this.renderLoginNavItem();
            
            // 构建页面内容
            const currentPage = this.pages[this.currentPage];
            let pageContent = '<h1>页面未找到</h1>';
            
            try {
                if (currentPage) {
                    // 检查页面是否有render方法
                    if (typeof currentPage.render === 'function') {
                        // 如果render方法需要参数，传递token和user
                        if (currentPage.render.length > 0) {
                            pageContent = currentPage.render(this.token, this.user);
                        } else {
                            pageContent = currentPage.render();
                        }
                    } else {
                        pageContent = '<h1>页面渲染方法不存在</h1>';
                    }
                } else {
                    pageContent = '<h1>页面未找到</h1>';
                }
            } catch (error) {
                console.error('页面渲染错误:', error);
                pageContent = '<h1>页面渲染错误</h1>';
            }
            
            // 渲染整个应用
            appElement.innerHTML = `
                <div class="app">
                    ${this.renderHeader()}
                    <main>
                        <div class="container">${pageContent}</div>
                    </main>
                    <nav class="bottom-nav">
                        ${navItems}
                        ${userNavItem}
                    </nav>
                    ${this.renderLoadingOverlay()}
                    ${this.renderToastContainer()}
                </div>
            `;
            
            // 绑定事件监听器
            this.setupEventListeners();
        } catch (error) {
            console.error('应用渲染错误:', error);
            appElement.innerHTML = '<div class="app"><h1>应用渲染错误</h1></div>';
        }
    }
    
    /**
     * 执行页面后渲染逻辑
     */
    executeAfterRender() {
        if (this.pages[this.currentPage] && 
            typeof this.pages[this.currentPage].afterRender === 'function') {
            // 延迟执行以确保DOM已渲染
            setTimeout(() => {
                this.pages[this.currentPage].afterRender(this.token, this.user);
            }, 0);
        }
    }
    
    /**
     * 渲染导航项
     * @param {string} page - 页面名称
     * @param {Object} config - 页面配置
     * @param {boolean} isActive - 是否为当前页面
     */
    renderNavItem(page, config, isActive) {
        return `
            <a href="#" class="nav-item ${isActive ? 'active' : ''}" data-page="${page}">
                <i class="fas fa-${config.icon}"></i>
                <span>${config.name}</span>
            </a>
        `;
    }
    
               /**
     * 渲染用户导航项（用户已登录时）
     */
    renderUserNavItem() {
        return `
            <a href="#" class="nav-item ${USER_PAGES.includes(this.currentPage) ? 'active' : ''}" data-page="profile">
                <i class="fas fa-user"></i>
                <span>我的</span>
            </a>
        `;
    }
    
    /**
     * 渲染登录导航项（用户未登录时）
     */
    renderLoginNavItem() {
        return `
            <a href="#" class="nav-item ${this.currentPage === 'login' ? 'active' : ''}" data-page="login">
                <i class="fas fa-user"></i>
                <span>我的</span>
            </a>
        `;
    }
    
    /**
     * 渲染头部
     */
    renderHeader() {
        return `
            <header>
                <div class="container">
                    <nav style="justify-content: center; padding: 16px 0;">
                        <div class="logo" style="font-size: 20px; font-weight: 700;">
                            <i class="fas fa-running"></i> FitChallenge
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }
    
    /**
     * 渲染加载遮罩
     */
    renderLoadingOverlay() {
        return `
            <div id="loading-overlay">
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    /**
     * 渲染Toast容器
     */
    renderToastContainer() {
        return `
            <div id="toast-container"></div>
            <div id="modal-container" class="modal-container">
                <div class="modal">
                    <div class="modal-content">
                        <h3 class="modal-title"></h3>
                        <p class="modal-message"></p>
                        <div class="modal-buttons">
                            <button class="btn btn-secondary modal-cancel" style="display: none;">取消</button>
                            <button class="btn btn-primary modal-confirm">确定</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示模态弹窗
     * @param {string} title - 弹窗标题
     * @param {string} message - 弹窗消息
     * @param {string} type - 弹窗类型（success, error, info, warning）
     * @param {Object} options - 额外选项
     * @param {Function} options.onConfirm - 确认按钮回调
     * @param {Function} options.onCancel - 取消按钮回调
     * @param {boolean} options.showCancel - 是否显示取消按钮
     */
    showModal(title, message, type = 'info', options = {}) {
        console.log('🎯 showModal 被调用:', { title, message: message.substring(0, 100) + '...', type, options });
        
        const modalContainer = document.getElementById('modal-container');
        
        if (!modalContainer) {
            console.error('❌ 找不到 modal-container 元素');
            return;
        }
        
        const modal = modalContainer.querySelector('.modal');
        const titleEl = modal.querySelector('.modal-title');
        const messageEl = modal.querySelector('.modal-message');
        const confirmBtn = modal.querySelector('.modal-confirm');
        const cancelBtn = modal.querySelector('.modal-cancel');

        // 设置内容
        titleEl.textContent = title;
        messageEl.innerHTML = message;

        // 设置样式
        modal.className = `modal modal-${type}`;
        modalContainer.style.display = 'flex';
        
        // 强制设置模态框背景色，使用 !important
        modal.style.setProperty('background', 'white', 'important');
        modal.style.setProperty('background-color', 'white', 'important');
        
        // 强制设置模态框定位，确保它能正确参与flex布局
        modal.style.setProperty('position', 'relative', 'important');
        modal.style.setProperty('display', 'block', 'important');
        modal.style.setProperty('width', '100%', 'important');
        modal.style.setProperty('max-width', '400px', 'important');
        
        console.log('🎯 模态框已显示，display:', modalContainer.style.display);
        console.log('🎯 模态框容器样式:', {
            display: modalContainer.style.display,
            position: modalContainer.style.position,
            zIndex: modalContainer.style.zIndex,
            width: modalContainer.style.width,
            height: modalContainer.style.height
        });
        console.log('🎯 模态框容器计算样式:', {
            display: window.getComputedStyle(modalContainer).display,
            position: window.getComputedStyle(modalContainer).position,
            zIndex: window.getComputedStyle(modalContainer).zIndex,
            width: window.getComputedStyle(modalContainer).width,
            height: window.getComputedStyle(modalContainer).height
        });
        console.log('🎯 模态框内容样式:', {
            background: modal.style.background,
            borderRadius: modal.style.borderRadius,
            padding: modal.style.padding,
            maxWidth: modal.style.maxWidth,
            width: modal.style.width
        });
        console.log('🎯 模态框内容计算样式:', {
            background: window.getComputedStyle(modal).background,
            borderRadius: window.getComputedStyle(modal).borderRadius,
            padding: window.getComputedStyle(modal).padding,
            maxWidth: window.getComputedStyle(modal).maxWidth,
            width: window.getComputedStyle(modal).width,
            opacity: window.getComputedStyle(modal).opacity,
            visibility: window.getComputedStyle(modal).visibility,
            zIndex: window.getComputedStyle(modal).zIndex
        });
        
        console.log('🎯 检查模态框内容元素:', {
            titleText: titleEl.textContent,
            messageHTML: messageEl.innerHTML,
            titleVisible: window.getComputedStyle(titleEl).visibility,
            messageVisible: window.getComputedStyle(messageEl).visibility,
            titleOpacity: window.getComputedStyle(titleEl).opacity,
            messageOpacity: window.getComputedStyle(messageEl).opacity,
            titleDisplay: window.getComputedStyle(titleEl).display,
            messageDisplay: window.getComputedStyle(messageEl).display
        });
        
        // 检查模态框是否被其他元素覆盖
        const modalRect = modal.getBoundingClientRect();
        const elementsAtPoint = document.elementsFromPoint(
            modalRect.left + modalRect.width / 2,
            modalRect.top + modalRect.height / 2
        );
        
        console.log('🎯 模态框位置检查:', {
            modalRect: {
                top: modalRect.top,
                left: modalRect.left,
                width: modalRect.width,
                height: modalRect.height
            },
            elementsAtModalCenter: elementsAtPoint.map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                zIndex: window.getComputedStyle(el).zIndex
            }))
        });
        
        // 检查模态框DOM结构
        console.log('🎯 模态框DOM结构检查:', {
            modalContainerHTML: modalContainer.outerHTML.substring(0, 200) + '...',
            modalHTML: modal.outerHTML.substring(0, 200) + '...',
            modalContainerChildren: modalContainer.children.length,
            modalChildren: modal.children.length,
            modalContentExists: !!modal.querySelector('.modal-content'),
            titleExists: !!modal.querySelector('.modal-title'),
            messageExists: !!modal.querySelector('.modal-message'),
            buttonsExist: !!modal.querySelector('.modal-buttons')
        });
        
        // 检查模态框CSS样式问题
        const modalComputedStyle = window.getComputedStyle(modal);
        const modalContainerComputedStyle = window.getComputedStyle(modalContainer);
        
        console.log('🎯 模态框CSS样式检查:', {
            modal: {
                display: modalComputedStyle.display,
                position: modalComputedStyle.position,
                width: modalComputedStyle.width,
                height: modalComputedStyle.height,
                maxWidth: modalComputedStyle.maxWidth,
                maxHeight: modalComputedStyle.maxHeight,
                padding: modalComputedStyle.padding,
                margin: modalComputedStyle.margin,
                boxSizing: modalComputedStyle.boxSizing,
                overflow: modalComputedStyle.overflow,
                flex: modalComputedStyle.flex,
                flexGrow: modalComputedStyle.flexGrow,
                flexShrink: modalComputedStyle.flexShrink,
                flexBasis: modalComputedStyle.flexBasis
            },
            modalContainer: {
                display: modalContainerComputedStyle.display,
                position: modalContainerComputedStyle.position,
                width: modalContainerComputedStyle.width,
                height: modalContainerComputedStyle.height,
                justifyContent: modalContainerComputedStyle.justifyContent,
                alignItems: modalContainerComputedStyle.alignItems,
                flexDirection: modalContainerComputedStyle.flexDirection
            }
        });
        
        // 检查模态框内容元素的尺寸
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            const contentRect = modalContent.getBoundingClientRect();
            const contentStyle = window.getComputedStyle(modalContent);
            console.log('🎯 模态框内容元素尺寸检查:', {
                contentRect: {
                    top: contentRect.top,
                    left: contentRect.left,
                    width: contentRect.width,
                    height: contentRect.height
                },
                contentStyle: {
                    display: contentStyle.display,
                    width: contentStyle.width,
                    height: contentStyle.height,
                    maxWidth: contentStyle.maxWidth,
                    maxHeight: contentStyle.maxHeight,
                    padding: contentStyle.padding,
                    margin: contentStyle.margin,
                    boxSizing: contentStyle.boxSizing
                }
            });
        }

        // 显示/隐藏取消按钮
        cancelBtn.style.display = options.showCancel ? 'block' : 'none';

        // 绑定关闭事件
        const closeModal = () => {
            modalContainer.style.display = 'none';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        // 处理确认
        const handleConfirm = async () => {
            closeModal();
            if (options.onConfirm) {
                await options.onConfirm();
            }
        };

        // 处理取消
        const handleCancel = () => {
            closeModal();
            if (options.onCancel) {
                options.onCancel();
            }
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    /**
     * 隐藏模态框
     */
    hideModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.style.display = 'none';
            console.log('🎯 模态框已隐藏');
        }
    }
    
    /**
     * 事件系统方法
     */
    
    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
        console.log(`📡 注册事件监听器: ${event}`);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            console.log(`📡 触发事件: ${event}`, data);
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件回调执行失败: ${event}`, error);
                }
            });
        } else {
            console.log(`📡 事件无监听器: ${event}`);
        }
    }
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    off(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
                console.log(`📡 移除事件监听器: ${event}`);
            }
        }
    }
    
    /**
     * 移除所有事件监听器
     * @param {string} event - 事件名称（可选，如果不提供则移除所有事件）
     */
    removeAllListeners(event) {
        if (event) {
            delete this.eventListeners[event];
            console.log(`📡 移除所有事件监听器: ${event}`);
        } else {
            this.eventListeners = {};
            console.log('📡 移除所有事件监听器');
        }
    }
    
    /**
     * 获取事件监听器数量
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
    listenerCount(event) {
        return this.eventListeners[event] ? this.eventListeners[event].length : 0;
    }
    
    /**
     * 测试App状态（用于调试）
     */
    testAppStatus() {
        console.log('🧪 开始测试App状态...');
        console.log('当前App状态:', {
            currentPage: this.currentPage,
            user: this.user,
            token: this.token ? '存在' : '不存在',
            isAuthenticated: this.isAuthenticated()
        });
        
        // 检查localStorage
        const localStorageToken = localStorage.getItem('token');
        const localStorageUser = localStorage.getItem('user');
        
        console.log('localStorage状态:', {
            token: localStorageToken ? '存在' : '不存在',
            user: localStorageUser ? '存在' : '不存在'
        });
        
        if (localStorageUser) {
            try {
                const user = JSON.parse(localStorageUser);
                console.log('localStorage用户信息:', user);
            } catch (error) {
                console.error('解析localStorage用户信息失败:', error);
            }
        }
        
        // 显示测试结果
        this.showToast('App状态测试完成，请查看控制台', 'info');
    }
}

// 将测试函数暴露到全局
window.testAppStatus = function() {
    if (window.globalAppInstance) {
        window.globalAppInstance.testAppStatus();
    } else {
        console.error('全局App实例不存在');
    }
};

// 将事件系统测试函数暴露到全局
window.testEventSystem = function() {
    if (window.globalAppInstance) {
        const app = window.globalAppInstance;
        
        console.log('🧪 开始测试事件系统...');
        
        // 测试事件监听器注册
        let testCallbackCalled = false;
        const testCallback = (data) => {
            console.log('✅ 测试事件回调被调用:', data);
            testCallbackCalled = true;
        };
        
        app.on('testEvent', testCallback);
        console.log('📡 注册测试事件监听器');
        
        // 测试事件触发
        app.emit('testEvent', { message: 'Hello Event System!' });
        
        // 验证回调是否被调用
        setTimeout(() => {
            if (testCallbackCalled) {
                console.log('✅ 事件系统测试成功！');
                app.showToast('事件系统测试成功！', 'success');
            } else {
                console.log('❌ 事件系统测试失败！');
                app.showToast('事件系统测试失败！', 'error');
            }
            
            // 清理测试监听器
            app.off('testEvent', testCallback);
        }, 100);
        
    } else {
        console.error('全局App实例不存在');
    }
};

// 将登出函数暴露到全局
window.logout = function() {
    if (window.globalAppInstance) {
        window.globalAppInstance.logout();
    } else {
        console.error('全局App实例不存在');
    }
};

// 导出App类
export default App;