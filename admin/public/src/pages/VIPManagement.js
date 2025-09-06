import adminApi from '../services/adminApi.js';
import adminLogger from '../utils/logger.js';
import texts from '../shared/ui/texts.js';

class VIPManagement {
    constructor() {
        console.log('VIPManagement 构造函数被调用');
        console.log('adminApi 对象:', adminApi);
        console.log('adminApi 方法列表:', Object.getOwnPropertyNames(Object.getPrototypeOf(adminApi)));
        this.vipLevels = [];
        this.vipChallenges = [];
        this.loading = false;
        this.currentTab = 'levels'; // 'levels' 或 'challenges'
    }

    async loadVipData() {
        console.log('VIPManagement loadVipData 被调用');
        try {
            this.loading = true;
            if (this.currentTab === 'levels') {
                await this.loadVipLevels();
            } else {
                await this.loadVipChallenges();
            }
        } catch (error) {
            console.error('加载VIP数据失败:', error);
            this.showError(error.message);
        } finally {
            this.loading = false;
        }
    }

    async loadVipLevels() {
        console.log('VIPManagement loadVipLevels 被调用');
        const response = await adminApi.getVipLevels();
        console.log('获取到的VIP等级数据:', response);
        
        // 正确处理API响应
        if (response && response.success && response.data) {
            this.vipLevels = response.data;
        } else if (Array.isArray(response)) {
            this.vipLevels = response;
        } else {
            this.vipLevels = [];
        }
        
        console.log('处理后的VIP等级数据:', this.vipLevels);
        console.log('VIP等级状态详情', this.vipLevels.map(level => ({
            id: level.id,
            name: level.name,
            isActive: level.isActive
        })));
        this.updateLevelsTable();
    }

    async loadVipChallenges(searchParams = {}) {
        try {
            console.log('开始加载VIP挑战记录...');
            const response = await adminApi.getVipChallenges(searchParams);
            console.log('VIP挑战记录响应:', response);
            
            // 处理响应数据
            if (response && response.data) {
                this.vipChallenges = response.data.challenges || response.data;
            } else if (Array.isArray(response)) {
                this.vipChallenges = response;
            } else {
                this.vipChallenges = [];
            }
            
            console.log('VIP挑战记录数据:', this.vipChallenges);
            this.updateChallengesTable();
        } catch (error) {
            console.error('加载VIP挑战记录失败:', error);
            this.showChallengesError(error.message);
        }
    }

    showChallengesError(message) {
        const container = document.querySelector('.vip-management-content');
        if (container && this.currentTab === 'challenges') {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>VIP挑战记录加载失败</h3>
                    <p>${message}</p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                        注意：VIP挑战记录需要管理员认证令牌才能访问
                    </p>
                    <button class="btn btn-primary" id="retry-load-challenges" style="margin-top: 1rem;">重新加载</button>
                </div>
            `;
            
            // 绑定重试按钮
            const retryBtn = document.getElementById('retry-load-challenges');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadVipChallenges();
                });
            }
        }
    }

    showError(message) {
        const container = document.querySelector('.vip-management-page');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>VIP数据加载失败</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" id="retry-load-vip" style="margin-top: 1rem;">重新加载</button>
                </div>
            `;
        }
    }

    render() {
        return `
            <div class="vip-management-page">
                <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
                    <h1 style="color: #2c3e50; margin: 0 0 1rem 0;">VIP等级管理</h1>
                    
                    <!-- 标签页导航 -->
                    <div style="border-bottom: 2px solid #e9ecef; margin-bottom: 1.5rem;">
                        <button class="tab-btn ${this.currentTab === 'levels' ? 'active' : ''}" data-tab="levels" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.currentTab === 'levels' ? '#007bff' : 'transparent'}; color: ${this.currentTab === 'levels' ? '#007bff' : '#6c757d'};">
                            VIP等级管理
                        </button>
                        <button class="tab-btn ${this.currentTab === 'challenges' ? 'active' : ''}" data-tab="challenges" style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.currentTab === 'challenges' ? '#007bff' : 'transparent'}; color: ${this.currentTab === 'challenges' ? '#007bff' : '#6c757d'};">
                            挑战记录查询
                        </button>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div class="vip-management-content">
                        ${this.currentTab === 'levels' ? this.renderLevelsContent() : this.renderChallengesContent()}
                    </div>
                </div>
                
                <!-- VIP等级编辑模态框 -->
                <div class="modal fade" id="levelModal" tabindex="-1" aria-labelledby="levelModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="levelModalLabel">添加VIP等级</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <form id="levelForm">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label for="levelName" class="form-label">等级名称</label>
                                        <input type="text" class="form-control" id="levelName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="levelDescription" class="form-label">等级描述</label>
                                        <textarea class="form-control" id="levelDescription" rows="2"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="stepGoal" class="form-label">每日目标步数</label>
                                        <input type="number" class="form-control" id="stepGoal" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="deposit" class="form-label">解锁金额 (USDT)</label>
                                        <input type="number" class="form-control" id="deposit" step="0.01" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="dailyReward" class="form-label">次日奖励 (USDT)</label>
                                        <input type="number" class="form-control" id="dailyReward" step="0.01" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="challengeDays" class="form-label">挑战天数</label>
                                        <input type="number" class="form-control" id="challengeDays" min="1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="challengeTimes" class="form-label">每个账号总共可挑战次数</label>
                                        <input type="number" class="form-control" id="challengeTimes" min="1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="maxFailedDays" class="form-label">最大失败天数</label>
                                        <input type="number" class="form-control" id="maxFailedDays" min="1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="cancelDeductRatio" class="form-label">取消挑战扣除押金比例 (%)</label>
                                        <input type="number" class="form-control" id="cancelDeductRatio" min="0" max="100" step="0.1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="cancelRewardRatio" class="form-label">取消挑战是否可获得当日奖励</label>
                                        <select class="form-control" id="cancelRewardRatio">
                                            <option value="0">不获得</option>
                                            <option value="1">正常获得</option>
                                            <option value="0.5">获得50%</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="partialRefundRatio" class="form-label">连续挑战失败扣除押金比例 (%)</label>
                                        <input type="number" class="form-control" id="partialRefundRatio" min="0" max="100" step="0.1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="levelColor" class="form-label">等级颜色</label>
                                        <input type="color" class="form-control" id="levelColor" value="#FFD700">
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="isActive" checked>
                                            <label class="form-check-label" for="isActive">启用状态</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                                    <button type="submit" class="btn btn-primary">保存</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLevelsContent() {
        console.log('🔍 渲染VIP等级表格，数据', this.vipLevels);
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #2c3e50; margin: 0;">VIP等级列表</h2>
                <button class="btn btn-primary" id="add-vip-level" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-plus"></i> 添加VIP等级
                </button>
            </div>
            
            <div class="vip-levels-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">等级名称</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">解锁金额</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">每日目标</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">次日奖励</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">挑战天数</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">最大挑战次数</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">状态</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.vipLevels.length > 0 ? this.vipLevels.map(level => {
                            console.log('🔍 处理VIP等级数据:', level);
                            // 安全地获取数据，提供默认值
                            const name = level.name || level.level_name || '未知等级';
                            const depositAmount = level.deposit_amount || level.depositAmount || 0;
                            const stepTarget = level.step_target || level.stepTarget || 0;
                            const rewardAmount = level.dailyReward || level.reward_amount || level.rewardAmount || 0;
                            const challengeDays = level.duration || level.challenge_days || level.challengeDays || 0;
                            const challengeTimes = level.maxChallenges || level.challenge_times || level.challengeTimes || 0;
                            const maxFailedDays = level.max_failed_days || level.maxFailedDays || 0;
                            const cancelDeductRatio = level.cancel_deduct_ratio || level.cancelDeductRatio || 0;
                            const cancelRewardRatio = level.cancel_reward_ratio || level.cancelRewardRatio || 0;
                            const partialRefundRatio = level.partial_refund_ratio || level.partialRefundRatio || 0;
                            const isActive = level.is_active !== undefined ? level.is_active : (level.isActive !== undefined ? level.isActive : true);
                            const icon = level.icon || '🥉';
                            
                            return `
                                <tr style="border-bottom: 1px solid #dee2e6;">
                                    <td style="padding: 1rem;">
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <span style="font-size: 1.2rem;">${icon}</span>
                                            <span>${name}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem;">${depositAmount} USDT</td>
                                    <td style="padding: 1rem;">${stepTarget} 步</td>
                                    <td style="padding: 1rem;">${rewardAmount} USDT</td>
                                    <td style="padding: 1rem;">${challengeDays} 天</td>
                                    <td style="padding: 1rem;">${challengeTimes} 次</td>
                                    <td style="padding: 1rem;">
                                        <span style="color: ${isActive ? '#28a745' : '#dc3545'};">
                                            ${isActive ? '启用' : '禁用'}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <button class="btn btn-outline edit-level" data-id="${level.id}" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;">
                                            <i class="fas fa-edit"></i> 编辑
                                        </button>
                                        <button class="btn btn-${isActive ? 'warning' : 'success'} toggle-status" data-id="${level.id}" data-active="${isActive}" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;">
                                            ${isActive ? '禁用' : '启用'}
                                        </button>
                                        <button class="btn btn-danger delete-level" data-id="${level.id}" style="padding: 0.25rem 0.5rem;">
                                            <i class="fas fa-trash"></i> 删除
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('') : `
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 2rem;">暂无VIP等级数据</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderChallengesContent() {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #2c3e50; margin: 0;">挑战记录列表</h2>
                <div>
                    <button class="btn btn-outline" id="refresh-challenges" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                        <i class="fas fa-refresh"></i> 刷新
                    </button>
                    <button class="btn btn-primary" id="export-challenges" style="padding: 0.5rem 1rem;">
                        <i class="fas fa-download"></i> 导出数据
                    </button>
                </div>
            </div>
            
            <!-- 搜索工具栏 -->
            <div class="search-toolbar" style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div class="search-box">
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: #555;">用户ID</label>
                        <input type="number" id="challengeUserIdInput" placeholder="输入用户ID..." 
                               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div class="search-box">
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: #555;">邮箱</label>
                        <input type="email" id="challengeEmailInput" placeholder="输入邮箱..." 
                               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div class="search-box">
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: #555;">Telegram</label>
                        <input type="text" id="challengeTelegramInput" placeholder="Telegram ID或姓名..." 
                               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div class="search-box">
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: #555;">VIP等级</label>
                        <select id="challengeVipLevelInput" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                            <option value="">所有等级</option>
                            ${this.vipLevels.map(level => `<option value="${level.id}">${level.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="search-box">
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: #555;">状态</label>
                        <select id="challengeStatusInput" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                            <option value="">所有状态</option>
                            <option value="active">🔄 进行中</option>
                            <option value="completed">✅ 已完成</option>
                            <option value="failed">❌ 已失败</option>
                            <option value="cancelled">🚫 已取消</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button id="searchChallengesBtn" class="btn btn-primary" style="padding: 0.5rem 1rem;">
                        <i class="fas fa-search" style="margin-right: 5px;"></i>搜索
                    </button>
                    
                    <button id="clearChallengesBtn" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                        <i class="fas fa-times" style="margin-right: 5px;"></i>清除
                    </button>
                </div>
            </div>
            
            <div class="vip-challenges-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">用户ID</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">用户信息</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">VIP等级</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">押金金额</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">当前步数</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">目标步数</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">状态</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">开始时间</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #dee2e6;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.vipChallenges.length > 0 ? this.vipChallenges.map(challenge => `
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 1rem;">${challenge.user?.id || challenge.userId || 'N/A'}</td>
                                <td style="padding: 1rem;">
                                    <div style="font-weight: 500;">${challenge.user?.displayName || `用户${challenge.user?.id || challenge.userId || 'N/A'}`}</div>
                                    ${challenge.user?.email ? `<div style="font-size: 0.8rem; color: #6c757d;">📧 ${challenge.user.email}</div>` : ''}
                                    ${challenge.user?.telegramId ? `<div style="font-size: 0.8rem; color: #6c757d;">📱 TG: ${challenge.user.telegramId}</div>` : ''}
                                </td>
                                <td style="padding: 1rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span>${challenge.vipLevel?.icon || '🏆'}</span>
                                        <span>${challenge.vipLevel?.name || challenge.levelName || 'N/A'}</span>
                                    </div>
                                </td>
                                <td style="padding: 1rem;">${challenge.depositAmount} USDT</td>
                                <td style="padding: 1rem;">${challenge.currentSteps}</td>
                                <td style="padding: 1rem;">${challenge.stepTarget}</td>
                                <td style="padding: 1rem;">
                                    <span style="color: ${this.getStatusColor(challenge.status)};">
                                        ${this.getStatusText(challenge.status)}
                                    </span>
                                </td>
                                <td style="padding: 1rem;">${new Date(challenge.startDate).toLocaleDateString()}</td>
                                <td style="padding: 1rem;">
                                    <button class="btn btn-outline view-challenge" data-id="${challenge.id}" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;">
                                        <i class="fas fa-eye"></i> 查看
                                    </button>
                                    ${challenge.status === 'active' ? `
                                        <button class="btn btn-success complete-challenge" data-id="${challenge.id}" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;">
                                            <i class="fas fa-check"></i> 完成
                                        </button>
                                        <button class="btn btn-warning cancel-challenge" data-id="${challenge.id}" style="padding: 0.25rem 0.5rem;">
                                            <i class="fas fa-times"></i> 取消
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 2rem;">暂无挑战记录数据</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'active': '#007bff',
            'completed': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#ffc107',
            'expired': '#6c757d'
        };
        return colors[status] || '#6c757d';
    }

    getStatusText(status) {
        const texts = {
            'active': '🔄 进行中',
            'completed': '✅ 已完成',
            'failed': '❌ 已失败',
            'cancelled': '🚫 已取消',
            'expired': '⌛ 已过期'
        };
        return texts[status] || status;
    }

    updateLevelsTable() {
        console.log('🔄 开始更新VIP等级表格...');
        const container = document.querySelector('.vip-management-content');
        console.log('📦 找到容器:', container);
        console.log('📊 当前标签', this.currentTab);
        console.log('📋 VIP等级数据:', this.vipLevels);
        
        if (container && this.currentTab === 'levels') {
            console.log('开始重新渲染VIP等级表格');
            container.innerHTML = this.renderLevelsContent();
            console.log('VIP等级表格重新渲染完成');
            
            // 延迟绑定事件，确保DOM元素已经渲染
            setTimeout(() => {
                console.log('🔗 开始绑定VIP等级事件');
                this.bindLevelsEvents();
                console.log('VIP等级事件绑定完成');
            }, 0);
        } else {
            console.warn('⚠️ 无法更新VIP等级表格:', {
                hasContainer: !!container,
                currentTab: this.currentTab
            });
        }
    }

    updateChallengesTable() {
        const container = document.querySelector('.vip-management-content');
        if (container && this.currentTab === 'challenges') {
            container.innerHTML = this.renderChallengesContent();
            // 延迟绑定事件，确保DOM元素已经渲染
            setTimeout(() => {
                this.bindChallengesEvents();
            }, 0);
        }
    }

    afterRender() {
        console.log('VIPManagement afterRender 被调用');
        // 设置全局引用，用于模态框中的方法调用
        window.vipManagement = this;
        this.loadVipData();
        this.bindEvents();
    }

    bindEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.currentTab = tab;
                this.loadVipData();
                
                // 更新标签页样式
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.borderBottomColor = 'transparent';
                    b.style.color = '#6c757d';
                });
                e.target.classList.add('active');
                e.target.style.borderBottomColor = '#007bff';
                e.target.style.color = '#007bff';
            });
        });

        // 重新加载按钮
        const retryBtn = document.getElementById('retry-load-vip');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadVipData();
            });
        }
    }

    bindLevelsEvents() {
        // 添加VIP等级
        const addBtn = document.getElementById('add-vip-level');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showLevelModal();
            });
        }

        // VIP等级表单提交事件绑定
        const levelForm = document.getElementById('levelForm');
        if (levelForm) {
            levelForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // 阻止默认表单提交行为
                await this.saveLevelData();
            });
        }

        // 编辑VIP等级
        document.querySelectorAll('.edit-level').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const levelId = e.target.closest('.edit-level').getAttribute('data-id');
                const level = this.vipLevels.find(l => l.id == levelId);
                this.showLevelModal(level);
            });
        });

        // 切换状态
        document.querySelectorAll('.toggle-status').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const levelId = e.target.closest('.toggle-status').getAttribute('data-id');
                const isActive = e.target.closest('.toggle-status').getAttribute('data-active') === 'true';
                console.log('切换状态按钮被点击，levelId:', levelId, 'isActive:', isActive);
                console.log('adminApi.toggleVipLevelStatus 方法:', adminApi.toggleVipLevelStatus);
                try {
                    await adminApi.toggleVipLevelStatus(levelId, !isActive);
                    this.loadVipData();
                } catch (error) {
                    console.error('切换状态失败', error);
                    if (error.message.includes('认证失败，请重新登录') || 
                        error.message.includes('Token无效或已过期')) {
                        // 真正的认证失败，adminApi.js已经处理了重定向
                        return;
                    }
                    alert('切换状态失败: ' + error.message);
                }
            });
        });

        // 删除VIP等级
        document.querySelectorAll('.delete-level').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const levelId = e.target.closest('.delete-level').getAttribute('data-id');
                console.log('删除按钮被点击，levelId:', levelId);
                console.log('adminApi.deleteVipLevel 方法:', adminApi.deleteVipLevel);
                const doDelete = async () => {
                    try {
                        await adminApi.deleteVipLevel(levelId);
                        this.loadVipData();
                        this.showSuccessMessage(texts.vip.saveSuccess);
                    } catch (error) {
                        console.error('删除失败:', error);
                        if (error.message.includes('认证失败，请重新登录') || 
                            error.message.includes('Token无效或已过期')) {
                            return;
                        }
                        this.showErrorMessage('删除失败: ' + error.message);
                    }
                };

                if (window.adminApp && typeof window.adminApp.showConfirm === 'function') {
                    window.adminApp.showConfirm(texts.vip.deleteTitle, texts.vip.deleteMessage, doDelete);
                } else {
                    if (confirm(texts.vip.deleteMessage)) {
                        await doDelete();
                    }
                }
            });
        });
    }

    bindChallengesEvents() {
        // 搜索挑战记录
        const searchBtn = document.getElementById('searchChallengesBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchChallenges();
            });
        }

        // 清除搜索条件
        const clearBtn = document.getElementById('clearChallengesBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearChallengesSearch();
            });
        }

        // 搜索输入框回车事�?
        const searchInputs = ['challengeUserIdInput', 'challengeEmailInput', 'challengeTelegramInput'];
        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchChallenges();
                    }
                });
            }
        });

        // 下拉框变化事�?
        const selectInputs = ['challengeVipLevelInput', 'challengeStatusInput'];
        selectInputs.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.searchChallenges();
                });
            }
        });

        // 刷新挑战记录
        const refreshBtn = document.getElementById('refresh-challenges');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.clearChallengesSearch();
            });
        }

        // 导出数据
        const exportBtn = document.getElementById('export-challenges');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportChallengesData();
            });
        }

        // 查看挑战详情
        document.querySelectorAll('.view-challenge').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.target.closest('.view-challenge').getAttribute('data-id');
                this.showChallengeModal(challengeId);
            });
        });

        // 完成挑战
        document.querySelectorAll('.complete-challenge').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const challengeId = e.target.closest('.complete-challenge').getAttribute('data-id');
                if (confirm('确定要标记这个挑战为完成吗？')) {
                    try {
                        await adminApi.adminCompleteChallenge(challengeId);
                        this.loadVipChallenges();
                        this.showSuccessMessage('挑战已标记为完成');
                    } catch (error) {
                        console.error('操作失败:', error);
                        this.showErrorMessage('操作失败: ' + error.message);
                    }
                }
            });
        });

        // 取消挑战
        document.querySelectorAll('.cancel-challenge').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const challengeId = e.target.closest('.cancel-challenge').getAttribute('data-id');
                if (confirm('确定要取消这个挑战吗？')) {
                    try {
                        await adminApi.adminCancelChallenge(challengeId);
                        this.loadVipChallenges();
                        this.showSuccessMessage('挑战已取消');
                    } catch (error) {
                        console.error('操作失败:', error);
                        this.showErrorMessage('操作失败: ' + error.message);
                    }
                }
            });
        });
    }

    async saveLevelData() {
        let formData = null;
        try {
            formData = {
                name: document.getElementById('levelName').value,
                description: document.getElementById('levelDescription').value,
                stepTarget: parseInt(document.getElementById('stepGoal').value) || 0,
                depositAmount: parseFloat(document.getElementById('deposit').value) || 0,
                dailyReward: parseFloat(document.getElementById('dailyReward').value) || 0,
                duration: parseInt(document.getElementById('challengeDays').value) || 1,
                maxChallenges: parseInt(document.getElementById('challengeTimes').value) || 1,
                maxFailedDays: parseInt(document.getElementById('maxFailedDays').value) || 3,
                cancelDeductRatio: parseFloat(document.getElementById('cancelDeductRatio').value) || 0.1,
                cancelRewardRatio: parseFloat(document.getElementById('cancelRewardRatio').value) || 0,
                partialRefundRatio: parseFloat(document.getElementById('partialRefundRatio').value) || 0.8,
                color: document.getElementById('levelColor').value,
                isActive: document.getElementById('isActive').checked
            };
            
            // 添加调试日志
            console.log('发送的formData:', formData);

            adminLogger.vipManagement(
                this.currentLevel ? 'UPDATE' : 'CREATE',
                this.currentLevel?.id || 'NEW',
                formData,
                false, // 暂时设为false，成功后会更�?
                null
            );

            if (this.currentLevel) {
                // 编辑现有等级
                await adminApi.updateVipLevel(this.currentLevel.id, formData);
                adminLogger.vipManagement('UPDATE', this.currentLevel.id, formData, true, null);
            } else {
                // 添加新等�?
                const result = await adminApi.createVipLevel(formData);
                adminLogger.vipManagement('CREATE', result.data?.id || 'UNKNOWN', formData, true, null);
            }

            // 关闭模态框
            const levelModalEl = document.getElementById('levelModal');
            if (window.adminApp && typeof window.adminApp.closeModal === 'function') {
                window.adminApp.closeModal(levelModalEl || 'levelModal');
            } else {
                const modal = bootstrap.Modal.getInstance(levelModalEl);
                if (modal) {
                    modal.hide();
                }
            }

            // 重新加载数据
            await this.loadVipData();

            // 显示成功消息（使用Toast而不是alert）
            this.showSuccessMessage(texts.vip.saveSuccess);

        } catch (error) {
            adminLogger.vipManagement(
                this.currentLevel ? 'UPDATE' : 'CREATE',
                this.currentLevel?.id || 'NEW',
                formData,
                false,
                error
            );
            
            // 只有确实是认证相关的错误才静默处理
            if (error.message.includes('认证失败，请重新登录') || 
                error.message.includes('Token无效或已过期')) {
                adminLogger.error('VIP-MANAGEMENT', '认证失败，自动重定向', { error: error.message });
                return;
            }
            
            adminLogger.error('VIP-MANAGEMENT', '保存VIP等级失败', { error: error.message, formData });
            this.showErrorMessage('保存失败: ' + error.message);
        }
    }

    showLevelModal(level = null) {
        this.currentLevel = level;
        const modal = document.getElementById('levelModal');
        const modalTitle = document.getElementById('levelModalLabel');
        const form = document.getElementById('levelForm');
        
        if (level) {
            modalTitle.textContent = '编辑VIP等级';
            // 修复数据字段映射，支持多种字段名格式
            document.getElementById('levelName').value = level.name || '';
            document.getElementById('levelDescription').value = level.description || '';
            document.getElementById('stepGoal').value = level.stepTarget || level.step_target || '';
            document.getElementById('deposit').value = level.depositAmount || level.deposit_amount || '';
            document.getElementById('dailyReward').value = level.dailyReward || level.daily_reward || '';
            document.getElementById('challengeDays').value = level.duration || level.challenge_days || '';
            document.getElementById('challengeTimes').value = level.maxChallenges || level.challenge_times || '';
            document.getElementById('maxFailedDays').value = level.maxFailedDays || level.max_failed_days || '';
            document.getElementById('cancelDeductRatio').value = level.cancelDeductRatio || level.cancel_deduct_ratio || '';
            document.getElementById('cancelRewardRatio').value = level.cancelRewardRatio || level.cancel_reward_ratio || '';
            document.getElementById('partialRefundRatio').value = level.partialRefundRatio || level.partial_refund_ratio || '';
            document.getElementById('levelColor').value = level.color || '#FFD700';
            document.getElementById('isActive').checked = level.isActive !== false && level.is_active !== false;
        } else {
            modalTitle.textContent = '添加VIP等级';
            form.reset();
            document.getElementById('levelColor').value = '#FFD700';
            document.getElementById('isActive').checked = true;
        }
        
        if (window.adminApp && typeof window.adminApp.openModal === 'function') {
            window.adminApp.openModal(modal);
        } else {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    async showChallengeModal(challengeId) {
        try {
            // 获取挑战详情数据
            const challenge = this.vipChallenges.find(c => c.id == challengeId);
            if (!challenge) {
                alert('未找到挑战记录');
                return;
            }

            // 创建挑战详情模态框
            const modalHtml = `
                <div class="modal fade" id="challengeDetailModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">挑战详情 - ${challenge.vipLevel?.name || 'VIP挑战'}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${this.renderChallengeDetails(challenge)}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                                ${challenge.status === 'active' ? `
                                    <button type="button" class="btn btn-success" onclick="vipManagement.adminCompleteChallenge(${challengeId})">
                                        <i class="fas fa-check"></i> 标记完成
                                    </button>
                                    <button type="button" class="btn btn-warning" onclick="vipManagement.adminCancelChallenge(${challengeId})">
                                        <i class="fas fa-times"></i> 取消挑战
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 移除已存在的模态框
            const existingModal = document.getElementById('challengeDetailModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 添加新的模态框到页面
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 显示模态框
            const modal = new bootstrap.Modal(document.getElementById('challengeDetailModal'));
            modal.show();

            // 模态框关闭时清理
            document.getElementById('challengeDetailModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });

        } catch (error) {
            console.error('显示挑战详情失败:', error);
            alert('显示挑战详情失败: ' + error.message);
        }
    }

    renderChallengeDetails(challenge) {
        const user = challenge.user || {};
        const vipLevel = challenge.vipLevel || {};
        const startDate = new Date(challenge.startDate);
        const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
        const completedAt = challenge.completedAt ? new Date(challenge.completedAt) : null;
        
        // 计算挑战持续时间
        const durationDays = endDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;
        const elapsedDays = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
        
        // 生成每日任务状态（模拟数据，实际应该从后端获取）
        const dailyTasks = this.generateDailyTasks(challenge, durationDays);

        return `
            <div class="challenge-details">
                <!-- 基本信息 -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-user"></i> 用户信息</h6>
                            </div>
                            <div class="card-body">
                                <p><strong>用户ID:</strong> ${user.id || 'N/A'}</p>
                                <p><strong>显示名称:</strong> ${user.displayName || 'N/A'}</p>
                                <p><strong>邮箱:</strong> ${user.email || 'N/A'}</p>
                                <p><strong>Telegram ID:</strong> ${user.telegramId || 'N/A'}</p>
                                ${user.firstName || user.lastName ? `<p><strong>姓名:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-trophy"></i> 挑战信息</h6>
                            </div>
                            <div class="card-body">
                                <p><strong>VIP等级:</strong> ${vipLevel.icon || '🏆'} ${vipLevel.name || 'N/A'}</p>
                                <p><strong>挑战状态:</strong> 
                                    <span style="color: ${this.getStatusColor(challenge.status)};">
                                        ${this.getStatusText(challenge.status)}
                                    </span>
                                </p>
                                <p><strong>押金金额:</strong> ${challenge.depositAmount} USDT</p>
                                <p><strong>奖励金额:</strong> ${challenge.rewardAmount} USDT</p>
                                <p><strong>目标步数:</strong> ${challenge.stepTarget.toLocaleString()} 步</p>
                                <p><strong>当前步数:</strong> ${challenge.currentSteps.toLocaleString()} 步</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 进度信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-chart-line"></i> 挑战进度</h6>
                    </div>
                    <div class="card-body">
                        <div class="progress mb-3" style="height: 20px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${challenge.progress || 0}%; background-color: ${vipLevel.color || '#007bff'};"
                                 aria-valuenow="${challenge.progress || 0}" aria-valuemin="0" aria-valuemax="100">
                                ${(challenge.progress || 0).toFixed(1)}%
                            </div>
                        </div>
                        <div class="row text-center">
                            <div class="col">
                                <h6>剩余步数</h6>
                                <p class="mb-0">${challenge.remainingSteps?.toLocaleString() || '0'}</p>
                            </div>
                            <div class="col">
                                <h6>已完成天数</h6>
                                <p class="mb-0">${elapsedDays} 天</p>
                            </div>
                            <div class="col">
                                <h6>预计ROI</h6>
                                <p class="mb-0" style="color: ${challenge.potentialProfit >= 0 ? '#28a745' : '#dc3545'};">
                                    ${challenge.roi || '0%'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 时间信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-clock"></i> 时间信息</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>开始时间:</strong> ${startDate.toLocaleString()}</p>
                        ${endDate ? `<p><strong>结束时间:</strong> ${endDate.toLocaleString()}</p>` : ''}
                        ${completedAt ? `<p><strong>完成时间:</strong> ${completedAt.toLocaleString()}</p>` : ''}
                        <p><strong>挑战周期:</strong> ${durationDays} 天</p>
                        <p><strong>已进行:</strong> ${elapsedDays} 天</p>
                    </div>
                </div>

                <!-- 每日任务进度 -->
                ${dailyTasks.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-calendar-check"></i> 每日任务进度</h6>
                    </div>
                    <div class="card-body">
                        <div class="daily-tasks-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">
                            ${dailyTasks.map(task => `
                                <div class="daily-task-card" style="border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; text-align: center; background: ${task.completed ? '#f8f9fa' : '#fff'};">
                                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                                        ${task.completed ? '✅' : (task.isToday ? '🔄' : '🕒')}
                                    </div>
                                    <div style="font-weight: 500; margin-bottom: 0.25rem;">第${task.day}天</div>
                                    <div style="font-size: 0.9rem; color: #6c757d;">${task.date}</div>
                                    <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                                        ${task.steps ? `${task.steps.toLocaleString()}步` : '待完成'}
                                    </div>
                                    ${task.completed ? `<div style="color: #28a745; font-size: 0.8rem;">已完成</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    generateDailyTasks(challenge, durationDays) {
        const tasks = [];
        const startDate = new Date(challenge.startDate);
        const today = new Date();
        
        // 如果是连续挑战，生成每日任务
        if (durationDays > 1) {
            for (let i = 0; i < durationDays; i++) {
                const taskDate = new Date(startDate);
                taskDate.setDate(startDate.getDate() + i);
                
                const isToday = taskDate.toDateString() === today.toDateString();
                const isPast = taskDate < today;
                const completed = isPast && (challenge.status === 'completed' || Math.random() > 0.3); // 模拟完成状态
                
                tasks.push({
                    day: i + 1,
                    date: taskDate.toLocaleDateString(),
                    isToday,
                    isPast,
                    completed,
                    steps: completed ? Math.floor(challenge.stepTarget * (0.8 + Math.random() * 0.4)) : (isToday ? challenge.currentSteps : 0),
                    target: challenge.stepTarget
                });
            }
        } else {
            // 单日挑战
            tasks.push({
                day: 1,
                date: startDate.toLocaleDateString(),
                isToday: startDate.toDateString() === today.toDateString(),
                isPast: startDate < today,
                completed: challenge.status === 'completed',
                steps: challenge.currentSteps,
                target: challenge.stepTarget
            });
        }
        
        return tasks;
    }

    async adminCompleteChallenge(challengeId) {
        const onConfirm = async () => {
            try {
                await adminApi.adminCompleteChallenge(challengeId);
                const el = document.getElementById('challengeDetailModal');
                if (window.adminApp && typeof window.adminApp.closeModal === 'function') {
                    window.adminApp.closeModal(el || 'challengeDetailModal');
                } else {
                    const modal = bootstrap.Modal.getInstance(el);
                    if (modal) modal.hide();
                }
                this.loadVipChallenges();
                this.showSuccessMessage('挑战已标记为完成');
            } catch (error) {
                console.error('操作失败:', error);
                this.showErrorMessage('操作失败: ' + error.message);
            }
        };
        if (window.adminApp && typeof window.adminApp.showConfirm === 'function') {
            window.adminApp.showConfirm('确认操作', '确定要标记这个挑战为完成吗？', onConfirm);
        } else if (confirm('确定要标记这个挑战为完成吗？')) {
            await onConfirm();
        }
    }

    async adminCancelChallenge(challengeId) {
        const onConfirm = async () => {
            try {
                await adminApi.adminCancelChallenge(challengeId);
                const el = document.getElementById('challengeDetailModal');
                if (window.adminApp && typeof window.adminApp.closeModal === 'function') {
                    window.adminApp.closeModal(el || 'challengeDetailModal');
                } else {
                    const modal = bootstrap.Modal.getInstance(el);
                    if (modal) modal.hide();
                }
                this.loadVipChallenges();
                this.showSuccessMessage('挑战已取消');
            } catch (error) {
                console.error('操作失败:', error);
                this.showErrorMessage('操作失败: ' + error.message);
            }
        };
        if (window.adminApp && typeof window.adminApp.showConfirm === 'function') {
            window.adminApp.showConfirm('确认操作', '确定要取消这个挑战吗？', onConfirm);
        } else if (confirm('确定要取消这个挑战吗？')) {
            await onConfirm();
        }
    }

    exportChallengesData() {
        try {
            // 准备导出数据
            const exportData = this.vipChallenges.map(challenge => ({
                '挑战ID': challenge.id,
                '用户ID': challenge.user?.id || 'N/A',
                '用户邮箱': challenge.user?.email || 'N/A',
                'Telegram ID': challenge.user?.telegramId || 'N/A',
                '显示名称': challenge.user?.displayName || 'N/A',
                'VIP等级': challenge.vipLevel?.name || 'N/A',
                '押金金额': challenge.depositAmount,
                '奖励金额': challenge.rewardAmount,
                '目标步数': challenge.stepTarget,
                '当前步数': challenge.currentSteps,
                '进度百分比': (challenge.progress || 0).toFixed(1) + '%',
                '状态': this.getStatusText(challenge.status),
                '开始时间': new Date(challenge.startDate).toLocaleString(),
                '完成时间': challenge.completedAt ? new Date(challenge.completedAt).toLocaleString() : 'N/A',
                'ROI': challenge.roi || '0%'
            }));

            // 转换为CSV格式
            const headers = Object.keys(exportData[0] || {});
            const csvContent = [
                headers.join(','),
                ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            // 下载CSV文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `vip_challenges_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccessMessage('数据导出成功');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showErrorMessage('导出数据失败: ' + error.message);
        }
    }

    // Toast消息方法
    showSuccessMessage(message) {
        // 使用全局的Toast系统
        if (window.adminApp && window.adminApp.showToast) {
            window.adminApp.showToast(message, 'success');
        } else {
            // 备用方案：使用简单的提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; 
                background: #28a745; color: white; padding: 15px; 
                border-radius: 5px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 3000);
        }
    }

    showErrorMessage(message) {
        // 使用全局的Toast系统
        if (window.adminApp && window.adminApp.showToast) {
            window.adminApp.showToast(message, 'error');
        } else {
            // 备用方案：使用简单的提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; 
                background: #dc3545; color: white; padding: 15px; 
                border-radius: 5px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
        }
    }

    // 搜索挑战记录
    searchChallenges() {
        const searchParams = {};

        // 获取搜索参数
        const userIdInput = document.getElementById('challengeUserIdInput');
        const emailInput = document.getElementById('challengeEmailInput');
        const telegramInput = document.getElementById('challengeTelegramInput');
        const vipLevelInput = document.getElementById('challengeVipLevelInput');
        const statusInput = document.getElementById('challengeStatusInput');

        if (userIdInput?.value) searchParams.userId = userIdInput.value.trim();
        if (emailInput?.value) searchParams.email = emailInput.value.trim();
        if (telegramInput?.value) searchParams.telegram = telegramInput.value.trim();
        if (vipLevelInput?.value) searchParams.vipLevelId = vipLevelInput.value.trim();
        if (statusInput?.value) searchParams.status = statusInput.value.trim();

        console.log('搜索参数:', searchParams);
        this.loadVipChallenges(searchParams);
    }

    // 清除搜索条件
    clearChallengesSearch() {
        // 清除所有搜索输入框
        const searchInputs = ['challengeUserIdInput', 'challengeEmailInput', 'challengeTelegramInput'];
        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
        });

        // 重置下拉�?
        const selectInputs = ['challengeVipLevelInput', 'challengeStatusInput'];
        selectInputs.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.value = '';
            }
        });

        // 重新加载所有数�?
        this.loadVipChallenges();
    }
}

export default VIPManagement;
