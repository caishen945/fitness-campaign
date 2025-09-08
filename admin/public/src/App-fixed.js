import adminApi from './services/adminApi.js';
import VIPManagement from './pages/VIPManagement.js';
import WalletManagement from './pages/WalletManagement.js';
import CheckinManagement from './pages/CheckinManagement.js';
import PKChallengeManagement from './pages/PKChallengeManagement.js';
import AdminLogin from './pages/Login.js';
import UserManagement from './pages/UserManagement.js'; // Added import for UserManagement
import AchievementManagement from './pages/AchievementManagement.js';
import TeamManagement from './pages/TeamManagement.js';
import SystemSettings from './pages/SystemSettings.js';
import TelegramManagement from './pages/TelegramManagement.js';
import NotificationManagement from './pages/NotificationManagement.js';
import TemplateManagement from './pages/TemplateManagement.js';

class AdminApp {
    constructor() {
        this.currentPage = 'login';
        this.isAuthenticated = false;
        this.isLoading = false;
        this.pageCache = new Map();

        // 页面对象
        this.pages = {
            // 登录页面
            login: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new AdminLogin(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 仪表盘页面
            dashboard: {
                render: () => `
                    <div class="dashboard-page">
                        <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">仪表盘</h1>
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                            <div class="stat-card" style="background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">👥</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">1,258</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总用户数</div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #4cc9f0, #4895ef); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">🏆</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">8,742,105</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总步数</div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #f8961e, #f3722c); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">💰</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">24,580</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总奖励发放</div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #f94144, #f9844a); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">🚩</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">3,421</div>
                                <div class="stat-label" style="font-size: 1.1rem;">进行中的挑战</div>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: function() {
                    // 仪表盘页面渲染完成后的逻辑
                }
            },
            
            // 用户管理页面
            users: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new UserManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // VIP管理页面
            vip: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new VIPManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 钱包管理页面
            wallet: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new WalletManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 成就管理页面
            achievements: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new AchievementManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 模板管理页面
            templates: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new TemplateManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 通知管理页面
            notifications: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new NotificationManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 团队管理页面
            team: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new TeamManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 系统设置（注册为SPA路由）
            'system-settings': {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new SystemSettings(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance && typeof this.instance.afterRender === 'function') {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // 签到管理页面
            checkin: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new CheckinManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // PK挑战管理页面
            pk: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new PKChallengeManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            },
            
            // Telegram管理页面
            telegram: {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new TelegramManagement(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance) {
                        return this.instance.afterRender();
                    }
                }
            }
        };
        
        this.user = null;
        this.token = null;
        this.searchDebounceTimer = null;
        this.lastSearchTime = 0;
    }
    
    init() {
        window.adminLogger?.info('APP', 'AdminApp.init 开始');
        this.createToastContainer();
        this.setupEventListeners();
        this.checkAuthStatus();
        this.render();
        // 确保首次渲染后的页面事件已绑定（例如登录页表单提交监听）
        if (this.pages[this.currentPage] && typeof this.pages[this.currentPage].afterRender === 'function') {
            setTimeout(() => {
                try {
                    this.pages[this.currentPage].afterRender();
                    window.adminLogger?.success('APP', '初始页面 afterRender 完成', { page: this.currentPage });
                } catch (error) {
                    console.error('初始 afterRender 执行失败', error);
                    window.adminLogger?.error('APP', '初始 afterRender 执行失败', { page: this.currentPage }, error);
                }
            }, 0);
        }
        this.preloadCommonPages();
        window.adminLogger?.success('APP', 'AdminApp.init 完成', { isAuthenticated: this.isAuthenticated, currentPage: this.currentPage });
    }

    // 统一确认对话框（Promise）
    showConfirm({ title = '确认操作', message = '是否继续？', confirmText = '确定', cancelText = '取消' } = {}) {
        return new Promise((resolve) => {
            let dialog = document.getElementById('admin-confirm-dialog');
            if (!dialog) {
                dialog = document.createElement('div');
                dialog.id = 'admin-confirm-dialog';
                dialog.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                dialog.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 8px; width: 360px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;" id="admin-confirm-title"></div>
                        <div style="font-size: 14px; margin-bottom: 16px; color: #444;" id="admin-confirm-message"></div>
                        <div style="text-align: right;">
                            <button id="admin-confirm-cancel" class="btn btn-sm btn-secondary" style="margin-right: 8px;">${cancelText}</button>
                            <button id="admin-confirm-ok" class="btn btn-sm btn-primary">${confirmText}</button>
                        </div>
                    </div>`;
                document.body.appendChild(dialog);
            }

            dialog.querySelector('#admin-confirm-title').textContent = title;
            dialog.querySelector('#admin-confirm-message').textContent = message;
            dialog.style.display = 'flex';

            const onCancel = () => {
                dialog.style.display = 'none';
                dialog.querySelector('#admin-confirm-cancel').removeEventListener('click', onCancel);
                dialog.querySelector('#admin-confirm-ok').removeEventListener('click', onOk);
                window.adminLogger?.info('CONFIRM', '操作取消', { title });
                resolve(false);
            };
            const onOk = () => {
                dialog.style.display = 'none';
                dialog.querySelector('#admin-confirm-cancel').removeEventListener('click', onCancel);
                dialog.querySelector('#admin-confirm-ok').removeEventListener('click', onOk);
                window.adminLogger?.success('CONFIRM', '操作确认', { title });
                resolve(true);
            };

            dialog.querySelector('#admin-confirm-cancel').addEventListener('click', onCancel);
            dialog.querySelector('#admin-confirm-ok').addEventListener('click', onOk);
        });
    }
    
    // 预加载常用页面
    preloadCommonPages() {
        setTimeout(() => {
            if (this.isAuthenticated) {
                window.adminLogger?.info('PRELOAD', '开始预加载常用页面');
                this.preloadPage('dashboard');
                this.preloadPage('users');
                window.adminLogger?.success('PRELOAD', '预加载常用页面完成');
            }
        }, 1000);
    }
    
    // 预加载页面
    preloadPage(pageName) {
        if (this.pages[pageName] && !this.pages[pageName].instance) {
            try {
                this.pages[pageName].render();
                window.adminLogger?.info('PRELOAD', '页面预加载完成', { page: pageName });
            } catch (error) {
                window.adminLogger?.error('PRELOAD', '页面预加载失败', { page: pageName }, error);
            }
        }
    }
    
    checkAuthStatus() {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        if (!adminToken || !adminUser) {
            this.clearAuth();
            window.adminLogger?.warn('ADMIN-AUTH', '未检测到认证信息，切换到登录页');
            return;
        }

        try {
            const user = JSON.parse(adminUser);
            let expMs = null;
            if (adminToken.includes('.')) {
                const parts = adminToken.split('.');
                if (parts.length === 3) {
                    try {
                        const payload = JSON.parse(atob(parts[1]));
                        if (payload && typeof payload.exp === 'number') {
                            expMs = payload.exp * 1000;
                        }
                    } catch (e) {
                        console.error('JWT payload解析失败:', e);
                        window.adminLogger?.error('ADMIN-AUTH', 'JWT payload解析失败', null, e);
                    }
                }
            } else {
                expMs = Date.now() + (24 * 60 * 60 * 1000);
            }

            if (expMs && expMs <= Date.now()) {
                window.adminLogger?.warn('ADMIN-AUTH', 'Token已过期，清除登录状态');
                this.clearAuth();
                return;
            }

            this.isAuthenticated = true;
            this.currentPage = 'dashboard';
            this.token = adminToken;
            this.user = user;
            window.adminLogger?.success('ADMIN-AUTH', '管理员已登录', { username: user?.username });
        } catch (error) {
            console.error('解析认证信息失败:', error);
            window.adminLogger?.error('ADMIN-AUTH', '解析认证信息失败', null, error);
            this.clearAuth();
        }
    }
    
    clearAuth() {
        this.isAuthenticated = false;
        this.currentPage = 'login';
        this.token = null;
        this.user = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    }
    
    // 获取token
    getToken() {
        return this.token;
    }
    
    // 设置token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.removeItem('adminToken');
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('data-page'));
            }
            
            // 退出登录按钮
            if (e.target.matches('#logoutBtn') || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
        
        // 性能优化：键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigate('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigate('users');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigate('vip');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigate('wallet');
                        break;
                    case '5':
                        e.preventDefault();
                        this.navigate('pk');
                        break;
                    case '6':
                        e.preventDefault();
                        this.navigate('achievements');
                        break;
                    case '7':
                        e.preventDefault();
                        this.navigate('team');
                        break;
                    case '8':
                        e.preventDefault();
                        this.navigate('telegram');
                        break;
                    case '9':
                        e.preventDefault();
                        this.navigate('system-settings');
                        break;
                }
            }
        });
    }
    
    logout() {
        window.adminLogger?.info('AUTH', '管理员触发退出登录');
        this.clearAuth();
        if (this.showToast) {
            this.showToast('已成功退出登录', 'success');
        }
        this.render();
        window.adminLogger?.success('AUTH', '退出登录完成');
    }

    navigate(page) {
        window.adminLogger?.info('NAVIGATION', '导航到页面', { targetPage: page, isAuthenticated: this.isAuthenticated });
        
        if (!this.isAuthenticated && page !== 'login') {
            window.adminLogger?.warn('NAVIGATION', '未登录，重定向到登录页面', { attemptedPage: page });
            this.currentPage = 'login';
            this.render();
            return;
        }
        
        // 允许所有已注册页面访问
        if (!this.pages[page]) {
            if (this.showToast) {
                this.showToast('页面不存在', 'error');
            }
            return;
        }
        if (page === this.currentPage) {
            return;
        }

        this.showLoadingState();
        
        this.currentPage = page;
        this.render();
        
        if (this.pages[this.currentPage] && typeof this.pages[this.currentPage].afterRender === 'function') {
            setTimeout(() => {
                try {
                    this.pages[this.currentPage].afterRender();
                    window.adminLogger?.success('NAVIGATION', '页面加载完成', { page: this.currentPage });
                } catch (error) {
                    console.error('afterRender 执行失败', error);
                    window.adminLogger?.error('NAVIGATION', 'afterRender 执行失败', { page: this.currentPage }, error);
                } finally {
                    this.hideLoadingState();
                }
            }, 0);
        } else {
            this.hideLoadingState();
            window.adminLogger?.success('NAVIGATION', '页面渲染完成（无afterRender）', { page: this.currentPage });
        }
    }
    
    // 导航到系统设置并清理缓存
    navigateToSettingsWithCacheClear() {
        this.showToast('正在清理缓存并加载系统设置...', 'info');
        
        // 清理缓存
        this.clearAllCaches().then(() => {
            // 确保系统设置页面已加载
            if (!this.pages['system-settings']) {
                this.loadSystemSettingsPage().then(() => {
                    this.navigate('system-settings');
                });
            } else {
                this.navigate('system-settings');
            }
        });
    }
    
    // 增强缓存清理方法
    async clearAllCaches() {
        try {
            // 清理Service Worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }
            
            // 清理所有存储
            localStorage.clear();
            sessionStorage.clear();
            
            // 清理Cache API
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // 清理模块缓存（通过版本参数）
            this.cacheVersion = Date.now();
            
            console.log('✅ 所有缓存已清理');
            return true;
        } catch (error) {
            console.error('❌ 缓存清理失败:', error);
            return false;
        }
    }
    
    // 动态加载系统设置页面
    async loadSystemSettingsPage() {
        try {
            const SystemSettingsModule = await import('./pages/SystemSettings.js');
            this.pages['system-settings'] = {
                instance: null,
                render: function() {
                    if (!this.instance) {
                        this.instance = new SystemSettingsModule.default(window.adminApp);
                    }
                    return this.instance.render();
                },
                afterRender: function() {
                    if (this.instance && typeof this.instance.afterRender === 'function') {
                        return this.instance.afterRender();
                    }
                }
            };
            console.log('✅ 系统设置页面已动态加载');
        } catch (error) {
            console.error('❌ 系统设置页面加载失败:', error);
            this.createFallbackSystemSettings();
        }
    }
    
    // 创建回退系统设置页面
    createFallbackSystemSettings() {
        this.pages['system-settings'] = {
            render: () => `
                <div class="container-fluid mt-4">
                    <div class="row">
                        <div class="col-12">
                            <div class="alert alert-warning">
                                <h4>系统设置页面加载失败</h4>
                                <p>正在尝试重新加载...</p>
                                <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            bindEvents: () => {},
            afterRender: () => {
                // 尝试重新加载
                setTimeout(() => {
                    this.loadSystemSettingsPage();
                }, 2000);
            }
        };
    }
    
    // 显示加载状态
    showLoadingState() {
        this.isLoading = true;
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
        window.adminLogger?.info('APP', '进入加载状态');
    }
    
    // 隐藏加载状态
    hideLoadingState() {
        this.isLoading = false;
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        window.adminLogger?.info('APP', '退出加载状态');
    }

    render() {
        const appElement = document.getElementById('admin-root');
        if (!appElement) return;

        appElement.innerHTML = `
            <div class="admin-app" style="display: flex; min-height: 100vh;">
                <!-- 加载指示器 -->
                <div id="loading-indicator" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center;">
                        <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                        <div>加载中..</div>
                    </div>
                </div>
                
                ${this.isAuthenticated ? `
                <!-- 左侧导航栏 -->
                <div class="sidebar" style="width: 240px; background: #2c3e50; color: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); position: fixed; height: 100vh; overflow-y: auto;">
                    <div class="logo" style="font-size: 1.5rem; font-weight: bold; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <i class="fas fa-cogs"></i> FitChallenge
                    </div>
                    <div class="user-info" style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="color: #ecf0f1; font-size: 0.9rem;">
                            <i class="fas fa-user" style="margin-right: 8px;"></i>
                            ${this.user ? this.user.username : '管理员'}
                        </div>
                        <button id="logoutBtn" class="btn btn-sm btn-outline-light mt-2" style="width: 100%; font-size: 0.8rem;">
                            <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>
                            退出登录
                        </button>
                    </div>
                    <nav style="padding: 1rem 0;">
                        <ul class="nav-links" style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="dashboard" class="${this.currentPage === 'dashboard' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'dashboard' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                   <i class="fas fa-tachometer-alt" style="margin-right: 10px;"></i> 仪表盘
                                   <small style="float: right; opacity: 0.7;">Ctrl+1</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="users" class="${this.currentPage === 'users' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'users' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-users" style="margin-right: 10px;"></i> 用户管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+2</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="vip" class="${this.currentPage === 'vip' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'vip' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'vip' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-crown" style="margin-right: 10px;"></i> VIP管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+3</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="wallet" class="${this.currentPage === 'wallet' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'wallet' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'wallet' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-wallet" style="margin-right: 10px;"></i> 钱包管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+4</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="checkin" class="${this.currentPage === 'checkin' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'checkin' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'checkin' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-calendar-check" style="margin-right: 10px;"></i> 签到管理
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="pk" class="${this.currentPage === 'pk' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'pk' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'pk' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-trophy" style="margin-right: 10px;"></i> PK挑战管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+5</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="achievements" class="${this.currentPage === 'achievements' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'achievements' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'achievements' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-medal" style="margin-right: 10px;"></i> 成就管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+6</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="templates" class="${this.currentPage === 'templates' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'templates' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'templates' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-file-alt" style="margin-right: 10px;"></i> 模板管理
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="notifications" class="${this.currentPage === 'notifications' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'notifications' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'notifications' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-bell" style="margin-right: 10px;"></i> 通知管理
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="team" class="${this.currentPage === 'team' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'team' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'team' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-users" style="margin-right: 10px;"></i> 团队管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+7</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="telegram" class="${this.currentPage === 'telegram' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'telegram' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'telegram' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fab fa-telegram" style="margin-right: 10px;"></i> Telegram管理
                                    <small style="float: right; opacity: 0.7;">Ctrl+8</small>
                                </a>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="system-settings" class="${this.currentPage === 'system-settings' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'system-settings' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'system-settings' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                    <i class="fas fa-cog" style="margin-right: 10px;"></i> 系统设置
                                    <small style="float: right; opacity: 0.7;">Ctrl+9</small>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                ` : ''}
                
                <!-- 主内容区 -->
                <div class="main-content" style="flex: 1; margin-left: ${this.isAuthenticated ? '240px' : '0'}; padding: 2rem; background: #f8f9fa; min-height: 100vh;">
                    ${this.pages[this.currentPage] ? this.pages[this.currentPage].render() : '<div>页面不存在</div>'}
                </div>
            </div>
            
            <!-- 性能优化：CSS动画 -->
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .nav-links a {
                    transition: all 0.3s ease;
                }
                
                .nav-links a:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: translateX(5px);
                }
                
                .stat-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
            </style>
        `;
    }
    
    // 创建Toast容器
    createToastContainer() {
        if (!document.getElementById('toastContainer')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 300px;
            `;
            document.body.appendChild(toastContainer);
        }
        return document.getElementById('toastContainer');
    }
    
    // 显示Toast消息
    showToast(message, type = 'info') {
        const container = this.createToastContainer();
        const toast = document.createElement('div');
        const color = type === 'success' ? '#28a745' : (type === 'error' ? '#dc3545' : (type === 'warn' ? '#ffc107' : '#17a2b8'));
        toast.style.cssText = `
            background: ${color};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 统一打开 Bootstrap Modal
    openModal(modalOrId) {
        try {
            const el = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
            if (!el) {
                window.adminLogger?.warn('MODAL', '未找到模态框元素', { modalOrId });
                return null;
            }
            const instance = this.getBootstrapModal(el);
            if (instance) {
                instance.show();
                window.adminLogger?.info('MODAL', '显示模态框', { id: el.id });
            }
            return instance;
        } catch (error) {
            console.error('打开模态框失败:', error);
            window.adminLogger?.error('MODAL', '打开模态框失败', null, error);
            return null;
        }
    }

    // 统一关闭 Bootstrap Modal
    closeModal(modalOrId) {
        try {
            const el = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
            if (!el) {
                window.adminLogger?.warn('MODAL', '未找到模态框元素', { modalOrId });
                return null;
            }
            const instance = this.getBootstrapModal(el);
            if (instance) {
                instance.hide();
                window.adminLogger?.info('MODAL', '隐藏模态框', { id: el.id });
            }
            return instance;
        } catch (error) {
            console.error('关闭模态框失败:', error);
            window.adminLogger?.error('MODAL', '关闭模态框失败', null, error);
            return null;
        }
    }

    // 获取或创建 Bootstrap Modal 实例（兼容不同版本）
    getBootstrapModal(el) {
        try {
            const bs = (typeof window !== 'undefined' && window.bootstrap) ? window.bootstrap : (typeof bootstrap !== 'undefined' ? bootstrap : null);
            if (!bs || !bs.Modal) {
                window.adminLogger?.warn('MODAL', 'Bootstrap.Modal 不可用');
                return null;
            }
            if (typeof bs.Modal.getOrCreateInstance === 'function') {
                return bs.Modal.getOrCreateInstance(el);
            }
            const existing = typeof bs.Modal.getInstance === 'function' ? bs.Modal.getInstance(el) : null;
            return existing || new bs.Modal(el);
        } catch (error) {
            console.error('获取Bootstrap Modal实例失败:', error);
            return null;
        }
    }
}

// 导出默认模块
export default AdminApp;