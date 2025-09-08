import adminApi from './services/adminApi.js';
import VIPManagement from './pages/VIPManagement.js';
import WalletManagement from './pages/WalletManagement.js';
import CheckinManagement from './pages/CheckinManagement.js';
import PKChallengeManagement from './pages/PKChallengeManagement.js';
import AdminLogin from './pages/Login.js';
import UserManagement from './pages/UserManagement.js'; // Added import for UserManagement
import AchievementManagement from './pages/AchievementManagement.js';
import TeamManagement from './pages/TeamManagement.js';
import NotificationManagement from './pages/NotificationManagement.js';

class AdminApp {
    constructor() {
        this.currentPage = 'login'; // 默认显示登录页面
        this.isAuthenticated = false; // 认证状�?        this.isLoading = false; // 加载状�?        this.pageCache = new Map(); // 页面缓存
        
        // 页面对象 - 所有管理页面都在这里定�?        this.pages = {
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
            
            // 仪表盘页�?            dashboard: {
                render: () => `
                    <div class="dashboard-page">
                        <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">仪表�?/h1>
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                            <div class="stat-card" style="background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">👥</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">1,258</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总用户数</div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #4cc9f0, #4895ef); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">🏆</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">8,742,105</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总步�?/div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #f8961e, #f3722c); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">💰</div>
                                <div class="stat-value" style="font-size: 2rem; font-weight: bold;">24,580</div>
                                <div class="stat-label" style="font-size: 1.1rem;">总奖励发�?/div>
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
                        // 修复：传递AdminApp实例而不是页面对�?                        this.instance = new PKChallengeManagement(window.adminApp);
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
            }
        };
        
        this.user = null;
        this.token = null;
        
        // 性能优化：防抖搜�?        this.searchDebounceTimer = null;
        this.lastSearchTime = 0;
    }
    
    init() {
        this.createToastContainer();
        this.setupEventListeners();
        this.checkAuthStatus();
        this.render();
        
        // 性能优化：预加载常用页面
        this.preloadCommonPages();
    }
    
    // 预加载常用页�?    preloadCommonPages() {
        setTimeout(() => {
            if (this.isAuthenticated) {
                console.log('🚀 预加载常用页�?..');
                // 预加载仪表盘和用户管理页�?                this.preloadPage('dashboard');
                this.preloadPage('users');
            }
        }, 1000);
    }
    
    // 预加载页�?    preloadPage(pageName) {
        if (this.pages[pageName] && !this.pages[pageName].instance) {
            try {
                this.pages[pageName].render();
                console.log(`�?页面预加载完�? ${pageName}`);
        } catch (error) {
                console.log(`⚠️ 页面预加载失�? ${pageName}`, error);
            }
        }
    }
    
    checkAuthStatus() {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        if (adminToken && adminUser) {
            try {
                const user = JSON.parse(adminUser);
                
                // 处理JWT格式token
                let tokenData;
                if (adminToken.includes('.')) {
                    // JWT格式：header.payload.signature
                    const parts = adminToken.split('.');
                    if (parts.length === 3) {
                        try {
                            tokenData = JSON.parse(atob(parts[1])); // 解析payload部分
                        } catch (e) {
                            console.error('JWT payload解析失败:', e);
                            tokenData = null;
                        }
                    }
                } else {
                    // 普通字符串格式，创建简单的token数据
                    tokenData = {
                        exp: Date.now() + (24 * 60 * 60 * 1000), // 24小时后过�?                        username: user.username || 'admin'
                    };
                }
                
                // 检查token是否过期
                if (tokenData && tokenData.exp) {
                    // JWT的exp是秒级时间戳，需要转换为毫秒
                    const expTime = tokenData.exp * 1000;
                    if (expTime > Date.now()) {
                        this.isAuthenticated = true;
                        this.currentPage = 'dashboard';
                        this.token = adminToken;
                        this.user = user;
                        console.log('管理员已登录:', user.username);
                    } else {
                        console.log('Token已过期，清除登录状�?);
                        this.clearAuth();
                    }
                } else {
                    // 没有过期时间，假设Token有效
                    this.isAuthenticated = true;
                    this.currentPage = 'dashboard';
                    this.token = adminToken;
                    this.user = user;
                    console.log('管理员已登录:', user.username);
                }
        } catch (error) {
                console.error('解析认证信息失败:', error);
                this.clearAuth();
            }
        } else {
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
            
            // 退出登录按�?            if (e.target.matches('#logoutBtn') || e.target.closest('#logoutBtn')) {
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
                }
            }
        });
    }
    
    logout() {
        // 清除认证状�?        this.clearAuth();
        
        // 显示退出成功消�?        if (this.showToast) {
            this.showToast('已成功退出登�?, 'success');
        }
        
        // 重新渲染页面
        this.render();
    }

    navigate(page) {
        console.log('导航到页�?', page, '当前认证状�?', this.isAuthenticated);
        
        // 检查认证状�?        if (!this.isAuthenticated && page !== 'login') {
            console.log('未登录，重定向到登录页面');
            this.currentPage = 'login';
            this.render();
            return;
        }
        
        // 性能优化：显示加载状�?        if (page !== this.currentPage) {
            this.showLoadingState();
        }
        
        this.currentPage = page;
        console.log('设置当前页面�?', this.currentPage);
        this.render();
        
        // 如果当前页面有afterRender方法，则执行�?        if (this.pages[this.currentPage] && typeof this.pages[this.currentPage].afterRender === 'function') {
            setTimeout(() => {
                this.pages[this.currentPage].afterRender();
                this.hideLoadingState();
            }, 0);
            } else {
            this.hideLoadingState();
        }
    }
    
    // 显示加载状�?    showLoadingState() {
        this.isLoading = true;
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }
    
    // 隐藏加载状�?    hideLoadingState() {
        this.isLoading = false;
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    render() {
        const appElement = document.getElementById('admin-root');
        if (!appElement) return;

        appElement.innerHTML = `
            <div class="admin-app" style="display: flex; min-height: 100vh;">
                <!-- 加载指示�?-->
                <div id="loading-indicator" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center;">
                        <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                        <div>加载�?..</div>
                    </div>
                </div>
                
                ${this.isAuthenticated ? `
                <!-- 左侧导航�?-->
                <div class="sidebar" style="width: 240px; background: #2c3e50; color: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); position: fixed; height: 100vh; overflow-y: auto;">
                    <div class="logo" style="font-size: 1.5rem; font-weight: bold; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <i class="fas fa-cogs"></i> FitChallenge
                    </div>
                    <div class="user-info" style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="color: #ecf0f1; font-size: 0.9rem;">
                            <i class="fas fa-user" style="margin-right: 8px;"></i>
                            ${this.user ? this.user.username : '管理�?}
                    </div>
                        <button id="logoutBtn" class="btn btn-sm btn-outline-light mt-2" style="width: 100%; font-size: 0.8rem;">
                            <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>
                            退出登�?                        </button>
                </div>
                    <nav style="padding: 1rem 0;">
                        <ul class="nav-links" style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 0.5rem;">
                                <a href="#" data-page="dashboard" class="${this.currentPage === 'dashboard' ? 'active' : ''}" 
                                   style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid ${this.currentPage === 'dashboard' ? '#4cc9f0' : 'transparent'}; background: ${this.currentPage === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent'};">
                                   <i class="fas fa-tachometer-alt" style="margin-right: 10px;"></i> 仪表�?                                   <small style="float: right; opacity: 0.7;">Ctrl+1</small>
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
                        </ul>
                    </nav>
            </div>
                ` : ''}
                
                <!-- 主内容区�?-->
                <div class="main-content" style="flex: 1; margin-left: ${this.isAuthenticated ? '240px' : '0'}; padding: 2rem; background: #f8f9fa; min-height: 100vh;">
                    ${this.pages[this.currentPage] ? this.pages[this.currentPage].render() : '<div>页面不存�?/div>'}
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
    }
    
    // 显示Toast消息
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
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
        
        // 显示动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 导出默认模块
export default AdminApp;