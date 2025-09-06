class Header {
    constructor(app) {
        this.app = app;
    }

    render() {
        return `
            <header class="main-header">
                <div class="container">
                    <div class="header-content">
                        <div class="header-left">
                            <button id="menu-toggle" class="menu-toggle">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            <h1 class="logo">FitChallenge</h1>
                        </div>
                        
                        <div class="header-center">
                            <nav class="main-nav">
                                <ul>
                                    <li><a href="#" data-page="home" class="${this.app.currentPage === 'home' ? 'active' : ''}">首页</a></li>
                                    <li><a href="#" data-page="challenges" class="${this.app.currentPage === 'challenges' ? 'active' : ''}">挑战</a></li>
                                    <li><a href="#" data-page="leaderboard" class="${this.app.currentPage === 'leaderboard' ? 'active' : ''}">排行榜</a></li>
                                    <li><a href="#" data-page="news" class="${this.app.currentPage === 'news' ? 'active' : ''}">新闻</a></li>
                                </ul>
                            </nav>
                        </div>
                        
                        <div class="header-right">
                            <div class="search-box">
                                <input type="text" placeholder="搜索...">
                                <button><i class="fas fa-search"></i></button>
                            </div>
                            
                            <div class="notification-area">
                                <button id="notification-btn" class="icon-btn">
                                    <i class="fas fa-bell"></i>
                                    <span id="notification-badge" class="badge">0</span>
                                </button>
                                
                                <div id="notification-dropdown" class="dropdown-menu">
                                    <div class="dropdown-header">
                                        <h3>通知</h3>
                                        <button id="mark-all-read" class="btn-link">全部标记为已读</button>
                                    </div>
                                    <div class="dropdown-content">
                                        ${this.renderNotifications()}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="user-menu">
                                <button id="user-menu-btn" class="user-avatar">
                                    ${this.app.user ? (this.app.user.id ? `${this.app.user.id}`.charAt(0) : (this.app.user.email ? this.app.user.email.charAt(0).toUpperCase() : 'U')) : 'U'}
                                </button>
                                
                                <div id="user-dropdown" class="dropdown-menu">
                                    <div class="dropdown-header">
                                        <div class="user-info">
                                            <div class="user-avatar-large">
                                                ${this.app.user ? (this.app.user.id ? `${this.app.user.id}`.charAt(0) : (this.app.user.email ? this.app.user.email.charAt(0).toUpperCase() : 'U')) : 'U'}
                                            </div>
                                            <div>
                                                <h4>${this.app.user ? (this.app.user.id ? `ID ${this.app.user.id}` : 'ID')+(this.app.user.email ? ` (${this.app.user.email})` : (this.app.user.telegram_username ? ` (${this.app.user.telegram_username})` : (this.app.user.telegram_id ? ` (TG${this.app.user.telegram_id})` : ''))) : 'ID'}</h4>
                                                <p>${this.app.user ? this.app.user.email : 'user@example.com'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="dropdown-content">
                                        <a href="#" data-page="profile"><i class="fas fa-user"></i> 个人资料</a>
                                        <a href="#" data-page="wallet"><i class="fas fa-wallet"></i> 钱包</a>
                                        <a href="#" data-page="settings"><i class="fas fa-cog"></i> 设置</a>
                                        <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 移动端菜单 -->
                <div id="mobile-menu" class="mobile-menu">
                    <div class="mobile-menu-content">
                        <div class="mobile-menu-header">
                            <h2>FitChallenge</h2>
                            <button id="mobile-menu-close" class="close-btn">&times;</button>
                        </div>
                        <nav>
                            <ul>
                                <li><a href="#" data-page="home">首页</a></li>
                                <li><a href="#" data-page="challenges">挑战</a></li>
                                <li><a href="#" data-page="leaderboard">排行榜</a></li>
                                <li><a href="#" data-page="news">新闻</a></li>
                                <li><a href="#" data-page="profile">个人资料</a></li>
                                <li><a href="#" data-page="wallet">钱包</a></li>
                                <li><a href="#" data-page="settings">设置</a></li>
                                <li><a href="#" id="mobile-logout-btn">退出登录</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    renderNotifications() {
        if (!this.app.notifications || this.app.notifications.length === 0) {
            return '<div class="no-notifications">暂无通知</div>';
        }

        return this.app.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}">
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
                <button class="notification-close" data-id="${notification.id}">&times;</button>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // 菜单切换
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.getElementById('mobile-menu').classList.add('active');
            });
        }

        const mobileMenuClose = document.getElementById('mobile-menu-close');
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                document.getElementById('mobile-menu').classList.remove('active');
            });
        }

        // 通知下拉菜单
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('notification-dropdown').classList.toggle('show');
                document.getElementById('user-dropdown').classList.remove('show');
            });
        }

        // 用户菜单
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('user-dropdown').classList.toggle('show');
                document.getElementById('notification-dropdown').classList.remove('show');
            });
        }

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-area')) {
                document.getElementById('notification-dropdown').classList.remove('show');
            }
            if (!e.target.closest('.user-menu')) {
                document.getElementById('user-dropdown').classList.remove('show');
            }
        });

        // 标记所有为已读
        const markAllRead = document.getElementById('mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.app.notifications.forEach(n => n.read = true);
                this.app.updateNotificationBadge();
                document.querySelector('.dropdown-content').innerHTML = this.renderNotifications();
            });
        }

        // 退出登录
        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.logout();
            });
        }
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.logout();
            });
        }
    }
}

// 导出默认模块
export default Header;