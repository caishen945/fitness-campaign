import api from '../src/services/api.js';

class PKChallenge {
    constructor(app) {
        this.app = app;
        this.challenges = [];
        this.currentUser = null;
        this._eventHandlers = {};
        this._token = null;
        
        // 将实例存储到window对象
        window.pkChallenge = this;
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="pk-challenge-page">
                    <div class="container" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                        <div style="background: #fff3e0; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: var(--warning); margin-bottom: 1rem;">请先登录</h2>
                            <p style="margin-bottom: 1.5rem;">您需要登录后才能进行PK挑战</p>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    </div>
                </div>
            `;
        }

        this.currentUser = user;

        return `
            <div class="pk-challenge-page">
                <div class="pk-container" style="max-width: 1000px; margin: 0 auto; padding: 2rem;">
                    <h2 style="margin-bottom: 1.5rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">PK挑战</h2>
                    
                    <!-- 发起挑战区域 -->
                    <div class="create-challenge-section" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">发起新挑战</h3>
                        <div class="challenge-form">
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                <div class="form-group">
                                    <label for="opponentInput">对手ID或邮箱</label>
                                    <input type="text" id="opponentInput" placeholder="输入用户ID或邮箱" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    <div id="searchResults" class="search-results" style="display: none; position: absolute; background: white; border: 1px solid #ddd; border-radius: 4px; max-height: 200px; overflow-y: auto; z-index: 1000;"></div>
                        </div>
                                <div class="form-group">
                                    <label for="depositAmount">押金金额 (USDT)</label>
                                    <input type="number" id="depositAmount" placeholder="0.00" min="0.01" step="0.01" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    </div>
                                </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                <div class="form-group">
                                    <label for="stepTarget">步数目标</label>
                                    <input type="number" id="stepTarget" placeholder="10000" min="1000" step="1000" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    </div>
                                <div class="form-group">
                                    <label for="challengeDuration">挑战天数</label>
                                    <select id="challengeDuration" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                        <option value="7">7天</option>
                                        <option value="14">14天</option>
                                        <option value="30">30天</option>
                                    </select>
                                    </div>
                                </div>
                            <button id="createChallengeBtn" class="btn btn-primary" style="padding: 0.75rem 2rem;">发起挑战</button>
                        </div>
                    </div>
                    
                    <!-- 挑战列表区域 -->
                    <div class="challenges-section" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">我的挑战</h3>
                        <div id="challengesList" class="challenges-list">
                            <div class="loading" style="text-align: center; padding: 2rem;">
                                <div class="loading-spinner"></div>
                                <p>加载中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender(token, user) {
        if (!token || !user) return;

        try {
            // 保存token
            this._token = token;
            
            // 绑定事件
            this.bindEvents();
            
            // 加载挑战列表
            await this.loadChallenges();
        } catch (error) {
            console.error('初始化PK挑战页面失败:', error);
            this.app.showToast('加载PK挑战信息失败，请稍后再试', 'error');
        }
    }

    bindEvents() {
        const self = this;
        // 对手搜索输入框事件
        const opponentInput = document.getElementById('opponentInput');
        if (opponentInput) {
            let searchTimeout;
            opponentInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const keyword = e.target.value.trim();
                
                if (keyword.length >= 2) {
                    searchTimeout = setTimeout(() => {
                        self.searchUsers(self._token, keyword);
                    }, 500);
                } else {
                    self.hideSearchResults();
                }
            });

            // 点击外部隐藏搜索结果
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.form-group')) {
                    self.hideSearchResults();
                }
            });
        }

        // 发起挑战按钮事件
        const createBtn = document.getElementById('createChallengeBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                self.createChallenge(self._token);
            });
        }
    }

    async searchUsers(token, keyword) {
        try {
            const response = await api.searchPKUsers(token, keyword);
            
            if (response.success && response.data.length > 0) {
                this.showSearchResults(response.data);
            } else {
                this.hideSearchResults();
            }
        } catch (error) {
            console.error('搜索用户失败:', error);
        }
    }

    showSearchResults(users) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        const resultsHTML = users.map(user => `
            <div class="search-result-item" data-user-id="${user.id}" data-user-email="${user.email}" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold;">ID: ${user.id}</div>
                <div style="color: #666; font-size: 0.9rem;">${user.email}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';

        // 绑定点击事件
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                const userEmail = item.dataset.userEmail;
                document.getElementById('opponentInput').value = `${userId} (${userEmail})`;
                document.getElementById('opponentInput').dataset.selectedUserId = userId;
                this.hideSearchResults();
            });
        });
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    async createChallenge(token) {
        const opponentInput = document.getElementById('opponentInput');
        const depositAmount = document.getElementById('depositAmount');
        const stepTarget = document.getElementById('stepTarget');
        const challengeDuration = document.getElementById('challengeDuration');

        // 验证输入
        if (!opponentInput.value.trim()) {
            this.app.showToast('请输入对手信息', 'error');
            return;
        }

        const selectedUserId = opponentInput.dataset.selectedUserId;
        if (!selectedUserId) {
            this.app.showToast('请从搜索结果中选择对手', 'error');
            return;
        }

        if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
            this.app.showToast('请输入有效的押金金额', 'error');
                    return;
                }
                
        if (!stepTarget.value || parseInt(stepTarget.value) < 1000) {
            this.app.showToast('步数目标至少为1000步', 'error');
                    return;
                }
                
        try {
            // 计算挑战日期
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(challengeDuration.value));

            const challengeData = {
                opponentId: selectedUserId,
                depositAmount: parseFloat(depositAmount.value),
                stepTarget: parseInt(stepTarget.value),
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            };

            const response = await api.createPKChallenge(token, challengeData);

            if (response.success) {
                this.app.showModal(
                    '挑战发起成功',
                    `已向用户ID ${selectedUserId} 发起PK挑战\n押金: ${depositAmount.value} USDT\n步数目标: ${stepTarget.value} 步\n挑战期限: ${challengeDuration.value} 天`,
                    'success'
                );

                // 清空表单
                opponentInput.value = '';
                opponentInput.dataset.selectedUserId = '';
                depositAmount.value = '';
                stepTarget.value = '';
                challengeDuration.value = '7';

                // 重新加载挑战列表
                await this.loadChallenges();
            } else {
                this.app.showToast(response.message || '发起挑战失败', 'error');
            }
        } catch (error) {
            console.error('发起挑战失败:', error);
            this.app.showToast('发起挑战失败，请稍后再试', 'error');
        }
    }

    async loadChallenges() {
        try {
            if (!this._token) {
                console.error('Token不存在');
                this.app.showToast('登录状态已失效，请重新登录', 'error');
                return;
            }
            console.log('使用token获取挑战列表:', this._token);
            const response = await api.getPKChallenges(this._token);
            console.log('获取挑战列表响应:', response);
            
            // 确保response有正确的数据结构
            if (Array.isArray(response)) {
                this.challenges = response;
                this.renderChallenges();
            } else if (response && response.data && Array.isArray(response.data.challenges)) {
                this.challenges = response.data.challenges;
                this.renderChallenges();
            } else if (response && Array.isArray(response.data)) {
                this.challenges = response.data;
                this.renderChallenges();
            } else {
                console.error('无效的挑战列表数据格式:', response);
                this.challenges = [];
                this.renderChallenges();
            }
        } catch (error) {
            console.error('获取挑战列表失败:', error);
            this.app.showToast('获取挑战列表失败，请稍后再试', 'error');
            this.challenges = [];
            this.renderChallenges();
        }
    }

    renderChallenges() {
        const container = document.getElementById('challengesList');
        if (!container) return;

        if (!Array.isArray(this.challenges) || this.challenges.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏃‍♂️</div>
                    <p>暂无PK挑战记录</p>
                    <p>发起一个挑战，与好友一较高下吧！</p>
                </div>
            `;
            return;
        }

        const challengesHTML = this.challenges.map(challenge => {
            // 数据安全检查
            if (!challenge || typeof challenge !== 'object') {
                console.error('无效的挑战数据:', challenge);
                return '';
            }

            // 确保必要的对象和属性存在
            const challenger = challenge.challenger || {};
            const opponent = challenge.opponent || {};
            
            // 确定当前用户是否为挑战者
            const isChallenger = challenger.id === this.currentUser.id;
            
            // 获取对手信息
            const opponentInfo = isChallenger ? opponent : challenger;
            
            // 安全地获取步数
            const mySteps = parseInt(isChallenger ? (challenger.steps || 0) : (opponent.steps || 0));
            const opponentSteps = parseInt(isChallenger ? (opponent.steps || 0) : (challenger.steps || 0));

            let statusText = '';
            let statusClass = '';
            let actionButtons = '';

            switch (challenge.status) {
                case 'pending':
                    if (isChallenger) {
                        statusText = '等待对方接受';
                        statusClass = 'status-pending';
                        actionButtons = `<button class="btn btn-warning btn-sm" onclick="window.pkChallenge._eventHandlers.cancelChallenge('${challenge.id}')">取消挑战</button>`;
                    } else {
                        statusText = '等待您接受';
                        statusClass = 'status-pending';
                        actionButtons = `
                            <button class="btn btn-success btn-sm" onclick="window.pkChallenge._eventHandlers.acceptChallenge('${challenge.id}')">接受挑战</button>
                            <button class="btn btn-danger btn-sm" onclick="window.pkChallenge._eventHandlers.rejectChallenge('${challenge.id}')">拒绝挑战</button>
                        `;
                    }
                    break;
                case 'accepted':
                    statusText = '挑战进行中';
                    statusClass = 'status-active';
                    actionButtons = `<button class="btn btn-primary btn-sm" onclick="window.pkChallenge._eventHandlers.viewChallengeDetails('${challenge.id}')">查看详情</button>`;
                    break;
                case 'completed':
                    statusText = challenge.winnerId ? '挑战已完成' : '挑战平局';
                    statusClass = 'status-completed';
                    actionButtons = `<button class="btn btn-info btn-sm" onclick="window.pkChallenge._eventHandlers.viewChallengeDetails('${challenge.id}')">查看结果</button>`;
                    break;
                case 'rejected':
                    statusText = '挑战被拒绝';
                    statusClass = 'status-rejected';
                    break;
                case 'cancelled':
                    statusText = '挑战已取消';
                    statusClass = 'status-cancelled';
                    break;
            }

            return `
                <div class="challenge-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: #f9f9f9;">
                    <div class="challenge-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div class="challenge-info">
                            <h4 style="margin: 0; color: var(--primary);">挑战 #${challenge.id}</h4>
                            <span class="status ${statusClass}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; background: ${this.getStatusColor(challenge.status)}; color: white;">${statusText}</span>
                        </div>
                        <div class="challenge-actions">
                            ${actionButtons}
                        </div>
                    </div>
                    
                    <div class="challenge-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                        <div class="detail-item">
                            <label>对手:</label>
                            <span>${opponentInfo.email || opponentInfo.name || `用户${opponentInfo.id || '未知'}`}</span>
                        </div>
                        <div class="detail-item">
                            <label>押金:</label>
                            <span>${parseFloat(challenge.depositAmount || 0).toFixed(2)} USDT</span>
                        </div>
                        <div class="detail-item">
                            <label>步数目标:</label>
                            <span>${parseInt(challenge.stepTarget || 0).toLocaleString()} 步</span>
                        </div>
                        <div class="detail-item">
                            <label>挑战期限:</label>
                            <span>${challenge.startDate || '未设置'} 至 ${challenge.endDate || '未设置'}</span>
                        </div>
                    </div>
                    
                    ${challenge.status === 'accepted' || challenge.status === 'completed' ? `
                        <div class="challenge-progress" style="background: white; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                            <h5 style="margin: 0 0 1rem 0;">当前进度</h5>
                            <div class="progress-bars">
                                <div class="progress-item">
                                    <label>我的步数:</label>
                                    <div class="progress-bar" style="background: #eee; border-radius: 4px; height: 20px; overflow: hidden;">
                                        <div class="progress-fill" style="width: ${Math.min((mySteps / (parseInt(challenge.stepTarget) || 1)) * 100, 100)}%; background: var(--primary); height: 100%;"></div>
                                    </div>
                                    <span>${mySteps.toLocaleString()} / ${parseInt(challenge.stepTarget || 0).toLocaleString()}</span>
                                </div>
                                <div class="progress-item">
                                    <label>对手步数:</label>
                                    <div class="progress-bar" style="background: #eee; border-radius: 4px; height: 20px; overflow: hidden;">
                                        <div class="progress-fill" style="width: ${Math.min((opponentSteps / (parseInt(challenge.stepTarget) || 1)) * 100, 100)}%; background: var(--warning); height: 100%;"></div>
                                    </div>
                                    <span>${opponentSteps.toLocaleString()} / ${parseInt(challenge.stepTarget || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${challenge.status === 'completed' && challenge.winnerId ? `
                        <div class="challenge-result" style="background: var(--success); color: white; padding: 1rem; border-radius: 6px; text-align: center;">
                            <h5 style="margin: 0;">🏆 挑战结果</h5>
                            <p style="margin: 0.5rem 0 0 0;">
                                ${challenge.winnerId === this.currentUser.id ? '恭喜您获胜！' : '很遗憾，您未能获胜。'}
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = challengesHTML;

        // 绑定挑战操作事件
        this.bindChallengeEvents();
    }

    getStatusColor(status) {
        switch (status) {
            case 'pending': return '#ff9800';
            case 'accepted': return '#2196f3';
            case 'completed': return '#4caf50';
            case 'rejected': return '#f44336';
            case 'cancelled': return '#9e9e9e';
            default: return '#9e9e9e';
        }
    }

    bindChallengeEvents() {
        const self = this; // 保存this引用

        // 绑定取消挑战事件
        const cancelChallenge = async function(challengeId) {
            if (confirm('确定要取消这个挑战吗？')) {
                try {
                    const response = await api.cancelPKChallenge(self._token, challengeId);
                    if (response.success) {
                        self.app.showToast('挑战已取消', 'success');
                        await self.loadChallenges();
                    } else {
                        self.app.showToast(response.message || '取消挑战失败', 'error');
                    }
                } catch (error) {
                    console.error('取消挑战失败:', error);
                    self.app.showToast('取消挑战失败，请稍后再试', 'error');
                }
            }
        };

        // 绑定接受挑战事件
        const acceptChallenge = async function(challengeId) {
            if (confirm('确定要接受这个挑战吗？')) {
                try {
                    const response = await api.acceptPKChallenge(self._token, challengeId);
                    if (response.success) {
                        self.app.showToast('挑战已接受', 'success');
                        await self.loadChallenges();
                    } else {
                        self.app.showToast(response.message || '接受挑战失败', 'error');
                    }
                } catch (error) {
                    console.error('接受挑战失败:', error);
                    self.app.showToast('接受挑战失败，请稍后再试', 'error');
                }
            }
        };

        // 绑定拒绝挑战事件
        const rejectChallenge = async function(challengeId) {
            if (confirm('确定要拒绝这个挑战吗？')) {
                try {
                    const response = await api.rejectPKChallenge(self._token, challengeId);
                    if (response.success) {
                        self.app.showToast('挑战已拒绝', 'success');
                        await self.loadChallenges();
                    } else {
                        self.app.showToast(response.message || '拒绝挑战失败', 'error');
                    }
                } catch (error) {
                    console.error('拒绝挑战失败:', error);
                    self.app.showToast('拒绝挑战失败，请稍后再试', 'error');
                }
            }
        };

        // 绑定查看详情事件
        const viewChallengeDetails = function(challengeId) {
            // 这里可以跳转到挑战详情页面或显示详情弹窗
            self.app.showToast('查看详情功能开发中...', 'info');
        };

        // 将事件处理函数存储到实例中
        this._eventHandlers = {
            cancelChallenge,
            acceptChallenge,
            rejectChallenge,
            viewChallengeDetails
        };
    }
}

export default PKChallenge;