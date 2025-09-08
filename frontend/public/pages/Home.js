class Home {
    render(token, user) {
        const isAuthenticated = !!(token && user);
        console.log('Home 页面渲染:', { isAuthenticated, token, user }); // 调试信息
        
        return `
            <div class="fitness-home">
                ${isAuthenticated ? this.renderAuthenticatedHome(user) : this.renderUnauthenticatedHome()}
            </div>
        `;
    }
    
    renderAuthenticatedHome(user) {
        return `
            <!-- 欢迎卡片 -->
            <div class="fitness-welcome-card">
                <div class="fitness-welcome-content">
                    <h1 class="fitness-welcome-title">早安，健康达人！</h1>
                    <p class="fitness-welcome-subtitle">今天也要保持活力哦</p>
                    <p style="font-size: 14px; opacity: 0.8; margin-top: 12px;">
                        欢迎您，<strong>${user.id ? `ID ${user.id}` : 'ID'}${user.email ? ` (${user.email})` : (user.telegram_username ? ` (${user.telegram_username})` : (user.telegram_id ? ` (TG${user.telegram_id})` : ''))}</strong>！
                    </p>
                    <button id="logoutBtn" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 12px;
                        font-size: 14px;
                        cursor: pointer;
                        margin-top: 16px;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-sign-out-alt" style="margin-right: 6px;"></i>
                        退出登录
                    </button>
                </div>
            </div>
            
            <!-- 当前课程状态 -->
            <div class="fitness-activity-card">
                <div class="fitness-activity-header">
                    <h3 class="fitness-activity-title">Current Session</h3>
                    <div class="fitness-activity-icon">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="fitness-circular-progress">
                        <svg>
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#667eea"/>
                                    <stop offset="100%" style="stop-color:#764ba2"/>
                                </linearGradient>
                            </defs>
                            <circle class="progress-bg" cx="50" cy="50" r="40"></circle>
                            <circle class="progress-fill" cx="50" cy="50" r="40" style="stroke-dashoffset: 100.48;"></circle>
                        </svg>
                        <div class="fitness-progress-text">60%</div>
                    </div>
                    <div style="flex: 1;">
                        <p style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">40 min</p>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Medium Intensity</p>
                        <div style="background: var(--gray-200); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: var(--primary-gradient); height: 100%; width: 60%; border-radius: 3px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 今日统计 -->
            <div class="fitness-stats-grid">
                <div class="fitness-stat-item">
                    <div class="fitness-stat-icon">
                        <i class="fas fa-walking"></i>
                    </div>
                    <div class="fitness-stat-value">6,543</div>
                    <div class="fitness-stat-label">步数</div>
                </div>
                <div class="fitness-stat-item">
                    <div class="fitness-stat-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="fitness-stat-value">187</div>
                    <div class="fitness-stat-label">卡路里</div>
                </div>
                <div class="fitness-stat-item">
                    <div class="fitness-stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="fitness-stat-value">12</div>
                    <div class="fitness-stat-label">挑战</div>
                </div>
            </div>
            
            <!-- 今日挑战 -->
            <div class="fitness-activity-card">
                <div class="fitness-activity-header">
                    <h3 class="fitness-activity-title">今日挑战</h3>
                    <div class="fitness-activity-icon">
                        <i class="fas fa-target"></i>
                    </div>
                </div>
                <div style="text-align: center; padding: 20px 0;">
                    <div style="display: inline-block; position: relative; margin-bottom: 16px;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--primary-500) 0deg 234deg, var(--gray-200) 234deg 360deg); display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: var(--text-primary);">65%</div>
                        </div>
                    </div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">青铜步数挑战</h4>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">目标: 10,000 步</p>
                    <button class="fitness-btn" style="width: auto; padding: 8px 24px; font-size: 14px;">
                        继续挑战
                    </button>
                </div>
            </div>
            
            <!-- 功能入口 -->
            <div style="margin-top: 24px;">
                <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);">平台功能</h2>
                ${this.renderFeatureCards()}
            </div>
        `;
    }
    
    renderUnauthenticatedHome() {
        return `
            <div class="fitness-welcome-card">
                <div class="fitness-welcome-content">
                    <h1 class="fitness-welcome-title">欢迎来到 FitChallenge</h1>
                    <p class="fitness-welcome-subtitle">通过每日步数挑战，改善您的健康状况，赢取丰厚奖励</p>
                    <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                        <a href="#" class="fitness-btn" data-page="register" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user-plus" style="margin-right: 8px;"></i>
                            立即注册
                        </a>
                        <a href="#" data-page="login" style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            padding: 16px;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 20px;
                            font-size: 18px;
                            font-weight: 600;
                            text-decoration: none;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                           onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                            <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
                            用户登录
                        </a>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 24px;">
                <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary); text-align: center;">平台功能</h2>
                ${this.renderFeatureCards()}
            </div>
        `;
    }
    
    renderFeatureCards() {
        const features = [
            {
                icon: 'trophy',
                title: '排行榜',
                desc: '实时查看步数排行榜，与全球用户竞争',
                iconClass: 'fas fa-trophy'
            },
            {
                icon: 'users',
                title: '团队系统',
                desc: '邀请好友加入，建立您的健康团队',
                iconClass: 'fas fa-users'
            },
            {
                icon: 'wallet',
                title: '数字钱包',
                desc: '集成TRC-20钱包，安全存储奖励',
                iconClass: 'fas fa-wallet'
            },
            {
                icon: 'target',
                title: '挑战系统',
                desc: '参与步数挑战，赢取USDT奖励',
                iconClass: 'fas fa-bullseye'
            }
        ];
        
        return features.map(feature => `
            <div class="fitness-feature-card">
                <div class="fitness-feature-content">
                    <div class="fitness-feature-icon ${feature.icon}">
                        <i class="${feature.iconClass}"></i>
                    </div>
                    <div class="fitness-feature-info">
                        <h3 class="fitness-feature-title">${feature.title}</h3>
                        <p class="fitness-feature-desc">${feature.desc}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    afterRender(token, user) {
        // 绑定登出按钮事件
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.globalAppInstance) {
                    window.globalAppInstance.logout();
                }
            });
        }
    }
}

export default Home;