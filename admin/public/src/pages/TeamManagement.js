import adminApi from '../services/adminApi.js';
import texts from '../shared/ui/texts.js';

class TeamManagement {
    constructor(app) {
        this.app = app;
        this.currentTab = 'statistics';
        this.currentPage = 1;
        this.searchTerm = '';
    }

    render() {
        return `
            <div class="team-management-page">
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2><i class="fas fa-users"></i> 团队管理</h2>
                    </div>

                    <!-- 导航标签 -->
                    <ul class="nav nav-tabs mb-4" id="teamTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="statistics-tab" data-bs-toggle="tab" data-bs-target="#statistics" type="button" role="tab">
                                <i class="fas fa-chart-pie"></i> 团队统计
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="config-tab" data-bs-toggle="tab" data-bs-target="#config" type="button" role="tab">
                                <i class="fas fa-cog"></i> 团队配置
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="commissions-tab" data-bs-toggle="tab" data-bs-target="#commissions" type="button" role="tab">
                                <i class="fas fa-money-bill-wave"></i> 返佣记录
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="rewards-tab" data-bs-toggle="tab" data-bs-target="#rewards" type="button" role="tab">
                                <i class="fas fa-gift"></i> 邀请奖励
                            </button>
                        </li>
                    </ul>

                    <!-- 标签内容 -->
                    <div class="tab-content" id="teamTabContent">
                        <!-- 团队统计 -->
                        <div class="tab-pane fade show active" id="statistics" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5><i class="fas fa-chart-pie"></i> 团队统计</h5>
                                        <div class="d-flex gap-2">
                                            <input type="text" class="form-control" id="searchInput" placeholder="搜索用户名或邮箱..." style="width: 250px;">
                                            <button class="btn btn-primary" onclick="window.teamManagement.search()">
                                                <i class="fas fa-search"></i> 搜索
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="teamStatisticsContent">
                                        <div class="text-center">
                                            <div class="spinner-border" role="status">
                                                <span class="visually-hidden">${texts.common.loading}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 团队配置 -->
                        <div class="tab-pane fade" id="config" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-cog"></i> 团队配置</h5>
                                </div>
                                <div class="card-body">
                                    <div id="teamConfigContent">
                                        <div class="text-center">
                                            <div class="spinner-border" role="status">
                                                <span class="visually-hidden">${texts.common.loading}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 返佣记录 -->
                        <div class="tab-pane fade" id="commissions" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5><i class="fas fa-money-bill-wave"></i> 返佣记录</h5>
                                        <div class="d-flex gap-2">
                                            <select class="form-select" id="commissionStatusFilter" style="width: 150px;">
                                                <option value="">全部状态</option>
                                                <option value="pending">待处理</option>
                                                <option value="paid">已发放</option>
                                                <option value="failed">失败</option>
                                            </select>
                                            <button class="btn btn-primary" onclick="window.teamManagement.loadCommissionRecords()">
                                                <i class="fas fa-filter"></i> 筛选
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="commissionRecordsContent">
                                        <div class="text-center">
                                            <div class="spinner-border" role="status">
                                                <span class="visually-hidden">${texts.common.loading}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 邀请奖励 -->
                        <div class="tab-pane fade" id="rewards" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5><i class="fas fa-gift"></i> 邀请奖励记录</h5>
                                        <div class="d-flex gap-2">
                                            <select class="form-select" id="rewardStatusFilter" style="width: 150px;">
                                                <option value="">全部状态</option>
                                                <option value="pending">待处理</option>
                                                <option value="paid">已发放</option>
                                                <option value="failed">失败</option>
                                            </select>
                                            <button class="btn btn-primary" onclick="window.teamManagement.loadInvitationRewards()">
                                                <i class="fas fa-filter"></i> 筛选
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="invitationRewardsContent">
                                        <div class="text-center">
                                            <div class="spinner-border" role="status">
                                                <span class="visually-hidden">${texts.common.loading}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        // 绑定事件
        this.bindEvents();
        
        // 加载初始数据
        await this.loadTeamStatistics();
        
        // 暴露到全局
        window.teamManagement = this;
    }

    bindEvents() {
        // 标签页切换事件
        const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                this.currentTab = target.replace('#', '');
                this.loadTabContent();
            });
        });

        // 搜索输入框回车事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.search();
                }
            });
        }
    }

    async loadTabContent() {
        switch (this.currentTab) {
            case 'config':
                await this.loadTeamConfig();
                break;
            case 'commissions':
                await this.loadCommissionRecords();
                break;
            case 'rewards':
                await this.loadInvitationRewards();
                break;
        }
    }

    async loadTeamStatistics() {
        try {
            const response = await adminApi.getTeamStatistics({
                page: this.currentPage,
                search: this.searchTerm
            });

            if (response.success) {
                this.renderTeamStatistics(response.data);
            } else {
                throw new Error(response.error || '获取团队统计失败');
            }
        } catch (error) {
            console.error('加载团队统计失败:', error);
            this.app.showToast('加载团队统计失败', 'error');
        }
    }

    renderTeamStatistics(data) {
        const container = document.getElementById('teamStatisticsContent');
        
        if (data.statistics && data.statistics.length > 0) {
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>用户ID</th>
                                <th>用户名</th>
                                <th>邮箱</th>
                                <th>1级成员</th>
                                <th>2级成员</th>
                                <th>3级成员</th>
                                <th>累计返佣</th>
                                <th>邀请奖励</th>
                                <th>注册时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.statistics.map(stat => `
                                <tr>
                                    <td>${stat.user_id}</td>
                                    <td>${stat.email || `ID ${stat.user_id}`}</td>
                                    <td>${stat.email}</td>
                                    <td><span class="badge bg-primary">${stat.level1_count}</span></td>
                                    <td><span class="badge bg-info">${stat.level2_count}</span></td>
                                    <td><span class="badge bg-secondary">${stat.level3_count}</span></td>
                                    <td class="text-success">${parseFloat(stat.total_commission).toFixed(2)} USDT</td>
                                    <td class="text-info">${parseFloat(stat.total_invitation_rewards).toFixed(2)} USDT</td>
                                    <td>${new Date(stat.user_created_at).toLocaleString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="window.teamManagement.viewUserDetail(${stat.user_id})">
                                            <i class="fas fa-eye"></i> 查看详情
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- 分页 -->
                <nav aria-label="团队统计分页">
                    <ul class="pagination justify-content-center">
                        <li class="page-item ${data.pagination.page <= 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="window.teamManagement.changePage(${data.pagination.page - 1})">${texts.pagination.prev}</a>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">${data.pagination.page} / ${data.pagination.pages}</span>
                        </li>
                        <li class="page-item ${data.pagination.page >= data.pagination.pages ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="window.teamManagement.changePage(${data.pagination.page + 1})">${texts.pagination.next}</a>
                        </li>
                    </ul>
                </nav>
            `;
        } else {
            container.innerHTML = `<div class="text-center text-muted">${texts.common.empty}</div>`;
        }
    }

    async loadTeamConfig() {
        try {
            const response = await adminApi.getTeamConfig();

            if (response.success) {
                this.renderTeamConfig(response.data);
            } else {
                throw new Error(response.error || '获取团队配置失败');
            }
        } catch (error) {
            console.error('加载团队配置失败:', error);
            this.app.showToast('加载团队配置失败', 'error');
        }
    }

    renderTeamConfig(config) {
        const container = document.getElementById('teamConfigContent');
        
        container.innerHTML = `
            <form id="teamConfigForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">1级成员返佣比例</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="level1_commission_rate" 
                                       value="${parseFloat(config.level1_commission_rate?.value || 0.05) * 100}" 
                                       step="0.01" min="0" max="100">
                                <span class="input-group-text">%</span>
                            </div>
                            <small class="form-text text-muted">${config.level1_commission_rate?.description || ''}</small>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">2级成员返佣比例</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="level2_commission_rate" 
                                       value="${parseFloat(config.level2_commission_rate?.value || 0.03) * 100}" 
                                       step="0.01" min="0" max="100">
                                <span class="input-group-text">%</span>
                            </div>
                            <small class="form-text text-muted">${config.level2_commission_rate?.description || ''}</small>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">3级成员返佣比例</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="level3_commission_rate" 
                                       value="${parseFloat(config.level3_commission_rate?.value || 0.01) * 100}" 
                                       step="0.01" min="0" max="100">
                                <span class="input-group-text">%</span>
                            </div>
                            <small class="form-text text-muted">${config.level3_commission_rate?.description || ''}</small>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">邀请奖励金额</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="invitation_reward_amount" 
                                       value="${parseFloat(config.invitation_reward_amount?.value || 1.00)}" 
                                       step="0.01" min="0">
                                <span class="input-group-text">USDT</span>
                            </div>
                            <small class="form-text text-muted">${config.invitation_reward_amount?.description || ''}</small>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">邀请充值门槛</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="invitation_recharge_threshold" 
                                       value="${parseFloat(config.invitation_recharge_threshold?.value || 30.00)}" 
                                       step="0.01" min="0">
                                <span class="input-group-text">USDT</span>
                            </div>
                            <small class="form-text text-muted">${config.invitation_recharge_threshold?.description || ''}</small>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">最大团队层级</label>
                            <input type="number" class="form-control" id="max_team_level" 
                                   value="${parseInt(config.max_team_level?.value || 3)}" 
                                   min="1" max="10">
                            <small class="form-text text-muted">${config.max_team_level?.description || ''}</small>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> 保存配置
                    </button>
                </div>
            </form>
        `;

        // 绑定表单提交事件
        const form = document.getElementById('teamConfigForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeamConfig();
        });
    }

    async saveTeamConfig() {
        try {
            const configs = [
                { key: 'level1_commission_rate', value: (parseFloat(document.getElementById('level1_commission_rate').value) / 100).toString() },
                { key: 'level2_commission_rate', value: (parseFloat(document.getElementById('level2_commission_rate').value) / 100).toString() },
                { key: 'level3_commission_rate', value: (parseFloat(document.getElementById('level3_commission_rate').value) / 100).toString() },
                { key: 'invitation_reward_amount', value: document.getElementById('invitation_reward_amount').value },
                { key: 'invitation_recharge_threshold', value: document.getElementById('invitation_recharge_threshold').value },
                { key: 'max_team_level', value: document.getElementById('max_team_level').value }
            ];

            for (const config of configs) {
                await adminApi.updateTeamConfig(config.key, config.value);
            }

            this.app.showToast('团队配置保存成功', 'success');
        } catch (error) {
            console.error('保存团队配置失败:', error);
            this.app.showToast('保存团队配置失败', 'error');
        }
    }

    async loadCommissionRecords() {
        try {
            const status = document.getElementById('commissionStatusFilter').value;
            const response = await adminApi.getCommissionRecords({
                page: 1,
                status: status
            });

            if (response.success) {
                this.renderCommissionRecords(response.data);
            } else {
                throw new Error(response.error || '获取返佣记录失败');
            }
        } catch (error) {
            console.error('加载返佣记录失败:', error);
            this.app.showToast('加载返佣记录失败', 'error');
        }
    }

    renderCommissionRecords(data) {
        const container = document.getElementById('commissionRecordsContent');
        
        if (data.records && data.records.length > 0) {
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>获得返佣用户</th>
                                <th>产生返佣用户</th>
                                <th>挑战名称</th>
                                <th>挑战奖励</th>
                                <th>返佣比例</th>
                                <th>返佣金额</th>
                                <th>层级</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.records.map(record => `
                                <tr>
                                    <td>${new Date(record.created_at).toLocaleString()}</td>
                                    <td>${record.user_email || `ID ${record.user_id}`}</td>
                                    <td>${record.from_email || `ID ${record.from_user_id}`}</td>
                                    <td>${record.challenge_name}</td>
                                    <td>${record.challenge_reward} USDT</td>
                                    <td>${(parseFloat(record.commission_rate) * 100).toFixed(1)}%</td>
                                    <td class="text-success">${record.commission_amount} USDT</td>
                                    <td><span class="badge bg-primary">${record.level}级</span></td>
                                    <td>
                                        <span class="badge bg-${record.status === 'paid' ? 'success' : record.status === 'pending' ? 'warning' : 'danger'}">
                                            ${record.status === 'paid' ? '已发放' : record.status === 'pending' ? '待处理' : '失败'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center text-muted">暂无返佣记录</div>';
        }
    }

    async loadInvitationRewards() {
        try {
            const status = document.getElementById('rewardStatusFilter').value;
            const response = await adminApi.getInvitationRewards({
                page: 1,
                status: status
            });

            if (response.success) {
                this.renderInvitationRewards(response.data);
            } else {
                throw new Error(response.error || '获取邀请奖励记录失败');
            }
        } catch (error) {
            console.error('加载邀请奖励记录失败', error);
            this.app.showToast('加载邀请奖励记录失败', 'error');
        }
    }

    renderInvitationRewards(data) {
        const container = document.getElementById('invitationRewardsContent');
        
        if (data.records && data.records.length > 0) {
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>获得奖励用户</th>
                                <th>被邀请用户</th>
                                <th>充值金额</th>
                                <th>奖励金额</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.records.map(record => `
                                <tr>
                                    <td>${new Date(record.created_at).toLocaleString()}</td>
                                    <td>${record.user_email || `ID ${record.user_id}`}</td>
                                    <td>${record.invited_email || `ID ${record.invited_user_id}`}</td>
                                    <td>${record.recharge_amount} USDT</td>
                                    <td class="text-success">${record.reward_amount} USDT</td>
                                    <td>
                                        <span class="badge bg-${record.status === 'paid' ? 'success' : record.status === 'pending' ? 'warning' : 'danger'}">
                                            ${record.status === 'paid' ? '已发放' : record.status === 'pending' ? '待处理' : '失败'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center text-muted">暂无邀请奖励记录</div>';
        }
    }

    async viewUserDetail(userId) {
        try {
            const response = await adminApi.getUserTeamDetail(userId);

            if (response.success) {
                this.showUserDetailModal(response.data);
            } else {
                throw new Error(response.error || '获取用户团队详情失败');
            }
        } catch (error) {
            console.error('获取用户团队详情失败:', error);
            this.app.showToast('获取用户团队详情失败', 'error');
        }
    }

    showUserDetailModal(data) {
        const modal = `
            <div class="modal fade" id="userDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">用户团队详情 - ID ${data.user.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>用户信息</h6>
                                    <p><strong>用户ID:</strong> ${data.user.id}</p>
                                    <p><strong>邮箱:</strong> ${data.user.email || '未设置'}</p>
                                    <p><strong>邮箱:</strong> ${data.user.email}</p>
                                    <p><strong>注册时间:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>团队统计</h6>
                                    <p><strong>1级成员</strong> <span class="badge bg-primary">${data.statistics.level1_count}</span></p>
                                    <p><strong>2级成员</strong> <span class="badge bg-info">${data.statistics.level2_count}</span></p>
                                    <p><strong>3级成员</strong> <span class="badge bg-secondary">${data.statistics.level3_count}</span></p>
                                    <p><strong>累计返佣:</strong> <span class="text-success">${parseFloat(data.statistics.total_commission).toFixed(2)} USDT</span></p>
                                    <p><strong>邀请奖励</strong> <span class="text-info">${parseFloat(data.statistics.total_invitation_rewards).toFixed(2)} USDT</span></p>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <h6>团队成员</h6>
                            <ul class="nav nav-tabs" id="memberTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#level1Members">1级成员(${data.members.level1.length})</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#level2Members">2级成员(${data.members.level2.length})</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#level3Members">3级成员(${data.members.level3.length})</button>
                                </li>
                            </ul>
                            
                            <div class="tab-content mt-3">
                                <div class="tab-pane fade show active" id="level1Members">
                                    ${this.renderMemberList(data.members.level1)}
                                </div>
                                <div class="tab-pane fade" id="level2Members">
                                    ${this.renderMemberList(data.members.level2)}
                                </div>
                                <div class="tab-pane fade" id="level3Members">
                                    ${this.renderMemberList(data.members.level3)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 移除现有模态框
        const existingModal = document.getElementById('userDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // 显示模态框
        const modalElement = document.getElementById('userDetailModal');
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
    }

    renderMemberList(members) {
        if (members.length === 0) {
            return '<div class="text-center text-muted">暂无成员</div>';
        }

        return `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>邮箱</th>
                            <th>加入时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${members.map(member => `
                            <tr>
                                <td>${member.email || `ID ${member.user_id || member.id}`}</td>
                                <td>${member.email}</td>
                                <td>${new Date(member.join_date).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    search() {
        this.searchTerm = document.getElementById('searchInput').value;
        this.currentPage = 1;
        this.loadTeamStatistics();
    }

    changePage(page) {
        this.currentPage = page;
        this.loadTeamStatistics();
    }
}

export default TeamManagement;
