class AdminDashboard {
    constructor(app) {
        this.app = app;
        this.currentSection = 'overview';
    }

    render() {
        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>管理员仪表板</h1>
                    <p>FitChallenge平台管理后台，管理VIP等级和挑战记录</p>
                </div>

                <!-- 导航菜单 -->
                <div class="admin-nav" style="display: flex; gap: 1rem; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <button class="nav-button ${this.currentSection === 'overview' ? 'active' : ''}" data-section="overview">
                        <span style="font-size: 20px;">📊</span>
                        概览
                    </button>
                    <button class="nav-button ${this.currentSection === 'vip-levels' ? 'active' : ''}" data-section="vip-levels">
                        <span style="font-size: 20px;">🏆</span>
                        VIP等级管理
                    </button>
                    <button class="nav-button ${this.currentSection === 'challenge-records' ? 'active' : ''}" data-section="challenge-records">
                        <span style="font-size: 20px;">📋</span>
                        挑战记录查询
                    </button>
                </div>

                <!-- 内容区域 -->
                <div class="admin-content" id="admin-content">
                    <!-- 概览页面 -->
                    <div class="content-section ${this.currentSection === 'overview' ? 'active' : ''}" id="overview-section">
                        <div class="overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                            <div class="overview-card" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 1rem;">👥</div>
                                <h3 style="margin: 0 0 0.5rem 0; color: #333;">总用户数</h3>
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #007AFF;" id="total-users">-</p>
                            </div>
                            <div class="overview-card" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 1rem;">🏆</div>
                                <h3 style="margin: 0 0 0.5rem 0; color: #333;">VIP等级数</h3>
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #34C759;" id="total-levels">-</p>
                            </div>
                            <div class="overview-card" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 1rem;">📊</div>
                                <h3 style="margin: 0 0 0.5rem 0; color: #333;">总挑战数</h3>
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF9500;" id="total-challenges">-</p>
                            </div>
                            <div class="overview-card" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 1rem;">💰</div>
                                <h3 style="margin: 0 0 0.5rem 0; color: #333;">总押金</h3>
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF3B30;" id="total-deposits">-</p>
                            </div>
                        </div>

                        <div class="quick-actions" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 1.5rem 0; color: #333;">快速操作</h3>
                            <div class="actions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                <button class="ios-button ios-button-primary" data-action="create-level">
                                    <span style="font-size: 20px;">➕</span>
                                    创建VIP等级
                                </button>
                                <button class="ios-button ios-button-secondary" data-action="view-records">
                                    <span style="font-size: 20px;">📋</span>
                                    查看挑战记录
                                </button>
                                <button class="ios-button ios-button-success" data-action="view-stats">
                                    <span style="font-size: 20px;">📊</span>
                                    查看统计信息
                                </button>
                                <button class="ios-button ios-button-warning" data-action="export-data">
                                    <span style="font-size: 20px;">📤</span>
                                    导出数据
                                </button>
                            </div>
                        </div>

                        <div class="recent-activity" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 2rem;">
                            <h3 style="margin: 0 0 1.5rem 0; color: #333;">最近活动</h3>
                            <div class="activity-list" id="activity-list">
                                <div class="activity-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #f1f3f4;">
                                    <div style="font-size: 24px;">🆕</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #333;">新用户注册</div>
                                        <div style="font-size: 12px; color: #666;">用户 "testuser" 刚刚注册了账号</div>
                                    </div>
                                    <div style="font-size: 12px; color: #666;">2分钟前</div>
                                </div>
                                <div class="activity-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #f1f3f4;">
                                    <div style="font-size: 24px;">✅</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #333;">挑战完成</div>
                                        <div style="font-size: 12px; color: #666;">用户 "user123" 完成了青铜挑战</div>
                                    </div>
                                    <div style="font-size: 12px; color: #666;">5分钟前</div>
                                </div>
                                <div class="activity-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                                    <div style="font-size: 24px;">🏆</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #333;">VIP等级创建</div>
                                        <div style="font-size: 12px; color: #666;">管理员创建了新的钻石挑战等级</div>
                                    </div>
                                    <div style="font-size: 12px; color: #666;">10分钟前</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- VIP等级管理页面 -->
                    <div class="content-section ${this.currentSection === 'vip-levels' ? 'active' : ''}" id="vip-levels-section">
                        <div id="vip-levels-content">
                            <!-- VIP等级管理内容将在这里动态加载 -->
                        </div>
                    </div>

                    <!-- 挑战记录查询页面 -->
                    <div class="content-section ${this.currentSection === 'challenge-records' ? 'active' : ''}" id="challenge-records-section">
                        <div id="challenge-records-content">
                            <!-- 挑战记录查询内容将在这里动态加载 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
        this.loadOverviewData();
    }

    bindEvents() {
        // 导航按钮事件
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // 快速操作事件
        document.querySelector('[data-action="create-level"]').addEventListener('click', () => {
            this.switchSection('vip-levels');
        });

        document.querySelector('[data-action="view-records"]').addEventListener('click', () => {
            this.switchSection('challenge-records');
        });

        document.querySelector('[data-action="view-stats"]').addEventListener('click', () => {
            this.switchSection('challenge-records');
        });

        document.querySelector('[data-action="export-data"]').addEventListener('click', () => {
            this.exportData();
        });
    }

    switchSection(section) {
        this.currentSection = section;
        
        // 更新导航按钮状态
        document.querySelectorAll('.nav-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // 更新内容区域
        document.querySelectorAll('.content-section').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // 加载对应内容
        if (section === 'vip-levels') {
            this.loadVIPLevelsContent();
        } else if (section === 'challenge-records') {
            this.loadChallengeRecordsContent();
        }
    }

    async loadOverviewData() {
        try {
            // 加载统计信息
            const [statsResponse, levelsResponse] = await Promise.all([
                fetch('/api/admin/vip-challenges/stats', {
                    headers: {
                        'Authorization': `Bearer ${this.app.token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('/api/admin/vip-levels', {
                    headers: {
                        'Authorization': `Bearer ${this.app.token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                const total = stats.data.total || {};
                document.getElementById('total-challenges').textContent = total.total_challenges || 0;
                document.getElementById('total-deposits').textContent = total.total_deposits ? `${total.total_deposits.toFixed(2)} USDT` : '0 USDT';
            }

            if (levelsResponse.ok) {
                const levels = await levelsResponse.json();
                document.getElementById('total-levels').textContent = levels.data.length || 0;
            }

            // 模拟用户数据（实际项目中应该从API获取）
            document.getElementById('total-users').textContent = '1,234';
        } catch (error) {
            console.error('加载概览数据失败:', error);
        }
    }

    async loadVIPLevelsContent() {
        const content = document.getElementById('vip-levels-content');
        if (content.innerHTML.trim() === '') {
            // 动态加载VIP等级管理页面
            const VIPLevelManagement = (await import('./VIPLevelManagement.js')).default;
            const vipLevelPage = new VIPLevelManagement(this.app);
            content.innerHTML = vipLevelPage.render();
            vipLevelPage.afterRender();
        }
    }

    async loadChallengeRecordsContent() {
        const content = document.getElementById('challenge-records-content');
        if (content.innerHTML.trim() === '') {
            // 动态加载挑战记录查询页面
            const ChallengeRecords = (await import('./ChallengeRecords.js')).default;
            const challengeRecordsPage = new ChallengeRecords(this.app);
            content.innerHTML = challengeRecordsPage.render();
            challengeRecordsPage.afterRender();
        }
    }

    exportData() {
        this.app.showToast('导出功能开发中...', 'info');
    }
}

export default AdminDashboard;
