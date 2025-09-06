class Profile {
    render(token, user) {
        if (!token || !user) {
            return `
                <div class="profile-page">
                    <div class="login-prompt">
                        <div class="login-icon">
                            <i class="fas fa-user-circle fa-3x"></i>
                        </div>
                        <h2>请先登录</h2>
                        <p>登录后可查看个人资料和使用全部功能</p>
                        <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="profile-page">
                <!-- 用户信息头部 -->
                <div class="profile-header">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <h2>${user.email ? `${user.email}` : (user.telegram_username ? `${user.telegram_username}` : (user.telegram_id ? `TG${user.telegram_id}` : `ID ${user.id || '未知'}`))}</h2>
                        <p>用户ID: ${user.id || '未知'}</p>
                    </div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-value">1250</span>
                            <span class="stat-label">总步数</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">5</span>
                            <span class="stat-label">挑战</span>
                        </div>
                    </div>
                </div>
                
                <!-- 功能菜单 -->
                <div class="profile-section">
                    <h3>我的功能</h3>
                    <div class="menu-grid">
                        <div class="menu-item" data-page="userprofile">
                            <div class="menu-icon bg-blue">
                                <i class="fas fa-user"></i>
                            </div>
                            <span class="menu-text">个人资料</span>
                        </div>
                        
                        <div class="menu-item" data-page="wallet">
                            <div class="menu-icon bg-green">
                                <i class="fas fa-wallet"></i>
                            </div>
                            <span class="menu-text">钱包</span>
                        </div>
                        
                        <div class="menu-item" data-page="checkin">
                            <div class="menu-icon bg-orange">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <span class="menu-text">签到</span>
                        </div>
                        
                        <div class="menu-item" data-page="pk">
                            <div class="menu-icon bg-red">
                                <i class="fas fa-fist-raised"></i>
                            </div>
                            <span class="menu-text">PK挑战</span>
                        </div>
                        
                        <div class="menu-item" data-page="history">
                            <div class="menu-icon bg-purple">
                                <i class="fas fa-history"></i>
                            </div>
                            <span class="menu-text">运动历史</span>
                        </div>
                        
                        <div class="menu-item" data-page="achievements">
                            <div class="menu-icon bg-yellow">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <span class="menu-text">成就</span>
                        </div>
                        
                        <div class="menu-item" data-page="team">
                            <div class="menu-icon bg-teal">
                                <i class="fas fa-users"></i>
                            </div>
                            <span class="menu-text">团队</span>
                        </div>
                        
                        <div class="menu-item" data-page="notifications">
                            <div class="menu-icon bg-indigo">
                                <i class="fas fa-bell"></i>
                            </div>
                            <span class="menu-text">通知</span>
                        </div>
                        
                        <div class="menu-item" id="logout-btn">
                            <div class="menu-icon bg-gray">
                                <i class="fas fa-sign-out-alt"></i>
                            </div>
                            <span class="menu-text">退出登录</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        if (!token || !user) {
            // 绑定登录按钮事件
            const loginButton = document.querySelector('[data-page="login"]');
            if (loginButton) {
                loginButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const event = new CustomEvent('navigate', { detail: { page: 'login' } });
                    document.dispatchEvent(event);
                });
            }
            return;
        }

        // 绑定功能菜单项点击事件
        const menuItems = document.querySelectorAll('.menu-item[data-page]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    // 触发全局导航事件
                    const event = new CustomEvent('navigate', { detail: { page: page } });
                    document.dispatchEvent(event);
                }
            });
        });
        
        // 绑定退出登录按钮事件
        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                const event = new CustomEvent('logout');
                document.dispatchEvent(event);
            });
        }
    }
}

export default Profile;