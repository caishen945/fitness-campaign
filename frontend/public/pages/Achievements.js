class Achievements {
    constructor(app) {
        this.app = app;
        this.achievements = [];
        this.stats = {};
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="achievements-page">
                    <div class="container">
                        <div class="auth-required">
                            <h2>🔐 需要登录</h2>
                            <p>请先登录以查看您的成就</p>
                            <button class="btn btn-primary" data-page="login">立即登录</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="achievements-page">
                <div class="container">
                    <!-- 成就统计头部 -->
                    <div class="achievements-header">
                        <h1>🏆 我的成就</h1>
                        <div class="achievements-stats">
                            <div class="stat-item">
                                <div class="stat-value" id="total-achievements">-</div>
                                <div class="stat-label">总成就</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="completed-achievements">-</div>
                                <div class="stat-label">已完成</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="pending-rewards">-</div>
                                <div class="stat-label">待领取奖励</div>
                            </div>
                        </div>
                    </div>

                    <!-- 成就类型筛选 -->
                    <div class="achievements-filter">
                        <button class="filter-btn active" data-filter="all">全部</button>
                        <button class="filter-btn" data-filter="team_size">团队成就</button>
                        <button class="filter-btn" data-filter="vip_challenge_completions">挑战成就</button>
                        <button class="filter-btn" data-filter="total_steps">步数成就</button>
                        <button class="filter-btn" data-filter="consecutive_checkins">签到成就</button>
                        <button class="filter-btn" data-filter="pk_challenge_wins">PK成就</button>
                        <button class="filter-btn" data-filter="registration_duration">时长成就</button>
                        <button class="filter-btn" data-filter="challenge_participation">参与成就</button>
                        <button class="filter-btn" data-filter="wallet_balance">财富成就</button>
                        <button class="filter-btn" data-filter="exercise_habits">习惯成就</button>
                    </div>

                    <!-- 成就列表 -->
                    <div class="achievements-grid" id="achievements-grid">
                        <div class="loading">加载中...</div>
                    </div>

                    <!-- 无成就提示 -->
                    <div class="no-achievements" id="no-achievements" style="display: none;">
                        <div class="empty-state">
                            <i class="fas fa-trophy" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                            <h3>暂无成就</h3>
                            <p>继续努力，解锁更多成就吧！</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        if (!token || !user) {
            this.bindAuthButtons();
            return;
        }

        this.loadAchievements();
        this.bindFilterButtons();
    }

    /**
     * 绑定认证按钮事件
     */
    bindAuthButtons() {
        const loginButton = document.querySelector('[data-page="login"]');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.navigate('login');
            });
        }
    }

    /**
     * 绑定筛选按钮事件
     */
    bindFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 更新按钮状态
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 筛选成就
                const filter = btn.getAttribute('data-filter');
                this.filterAchievements(filter);
            });
        });
    }

    /**
     * 筛选成就
     */
    filterAchievements(filter) {
        const achievementCards = document.querySelectorAll('.achievement-card');
        
        achievementCards.forEach(card => {
            const typeCode = card.getAttribute('data-type');
            
            if (filter === 'all' || typeCode === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * 加载成就数据
     */
    async loadAchievements() {
        try {
            const response = await fetch('http://localhost:3000/api/achievements/user/achievements', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取成就失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.achievements = result.data.achievements;
                this.stats = result.data.stats;
                this.renderAchievements();
                this.updateStats();
            } else {
                throw new Error(result.error || '获取成就失败');
            }
        } catch (error) {
            console.error('加载成就失败:', error);
            this.showError('加载成就失败: ' + error.message);
        }
    }

    /**
     * 渲染成就列表
     */
    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        
        if (!this.achievements || this.achievements.length === 0) {
            document.getElementById('no-achievements').style.display = 'block';
            grid.innerHTML = '';
            return;
        }

        document.getElementById('no-achievements').style.display = 'none';
        
        const achievementsHtml = this.achievements.map(achievement => {
            return this.renderAchievementCard(achievement);
        }).join('');

        grid.innerHTML = achievementsHtml;
        
        // 绑定成就卡片事件
        this.bindAchievementCardEvents();
    }

    /**
     * 渲染单个成就卡片
     */
    renderAchievementCard(achievement) {
        const progress = achievement.current_value / achievement.target_value;
        const progressPercent = Math.min(progress * 100, 100);
        
        let cardClass = 'achievement-card';
        let statusText = '';
        let actionButton = '';
        
        if (achievement.is_completed) {
            if (achievement.is_claimed) {
                cardClass += ' completed claimed';
                statusText = '<span class="status-badge claimed">已领取</span>';
            } else {
                cardClass += ' completed unclaimed';
                statusText = '<span class="status-badge unclaimed">待领取</span>';
                actionButton = `
                    <button class="btn btn-primary claim-btn" data-achievement-id="${achievement.id}">
                        <i class="fas fa-gift"></i> 领取奖励
                    </button>
                `;
            }
        } else {
            cardClass += ' incomplete';
            statusText = `<span class="status-badge incomplete">进行中</span>`;
        }

        return `
            <div class="${cardClass}" data-type="${achievement.type_code}">
                <div class="achievement-icon" style="background-color: ${achievement.color}20; border-color: ${achievement.color}">
                    <i class="fas fa-${achievement.icon}" style="color: ${achievement.color}"></i>
                </div>
                
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.name}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%; background-color: ${achievement.color}"></div>
                        </div>
                        <div class="progress-text">
                            ${achievement.current_value} / ${achievement.target_value}
                        </div>
                    </div>
                    
                    <div class="achievement-reward">
                        <i class="fas fa-coins"></i>
                        <span>${achievement.reward_amount} USDT</span>
                    </div>
                    
                    <div class="achievement-status">
                        ${statusText}
                    </div>
                    
                    ${actionButton}
                </div>
            </div>
        `;
    }

    /**
     * 绑定成就卡片事件
     */
    bindAchievementCardEvents() {
        const claimButtons = document.querySelectorAll('.claim-btn');
        claimButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const achievementId = btn.getAttribute('data-achievement-id');
                this.claimAchievement(achievementId);
            });
        });
    }

    /**
     * 领取成就奖励
     */
    async claimAchievement(achievementId) {
        try {
            const response = await fetch(`/api/achievements/user/claim/${achievementId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('领取奖励失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.app.showToast(`🎉 恭喜获得 ${result.data.reward_amount} USDT 奖励！`, 'success');
                
                // 重新加载成就数据
                await this.loadAchievements();
                
                // 刷新用户钱包信息（如果有相关方法）
                if (this.app.refreshUserInfo) {
                    this.app.refreshUserInfo();
                }
            } else {
                throw new Error(result.error || '领取奖励失败');
            }
        } catch (error) {
            console.error('领取奖励失败:', error);
            this.app.showToast('领取奖励失败: ' + error.message, 'error');
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (this.stats) {
            document.getElementById('total-achievements').textContent = this.stats.total || 0;
            document.getElementById('completed-achievements').textContent = this.stats.completed || 0;
            document.getElementById('pending-rewards').textContent = 
                this.stats.pendingRewards ? `${this.stats.pendingRewards} USDT` : '0 USDT';
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.app.showToast(message, 'error');
    }
}

export default Achievements;