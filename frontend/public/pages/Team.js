import api from '../src/services/api.js';
import { getBadgeClassForStatus } from '../src/shared/mappings/badgeStyles.js';

class Team {
    constructor(app) {
        this.app = app;
        this.teamInfo = null;
        this.currentTab = 'overview';
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="team-page">
                    <div class="container" style="max-width: 1200px; margin: 2rem auto; text-align: center;">
                        <div style="background: #fff3e0; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: var(--warning); margin-bottom: 1rem;">请先登录</h2>
                            <p style="margin-bottom: 1.5rem;">您需要登录后才能查看团队信息</p>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="team-page">
                <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
                    <h2 style="margin-bottom: 2rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">我的团队</h2>
                    
                    <!-- 团队概览卡片 -->
                    <div class="team-overview" style="margin-bottom: 2rem;">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                                    <div class="stat-value" id="level1Count" style="font-size: 2.5rem; font-weight: bold;">-</div>
                                    <div class="stat-label">1级成员</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                                    <div class="stat-value" id="level2Count" style="font-size: 2.5rem; font-weight: bold;">-</div>
                                    <div class="stat-label">2级成员</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                                    <div class="stat-value" id="level3Count" style="font-size: 2.5rem; font-weight: bold;">-</div>
                                    <div class="stat-label">3级成员</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                                    <div class="stat-value" id="totalCommission" style="font-size: 2.5rem; font-weight: bold;">-</div>
                                    <div class="stat-label">累计返佣(USDT)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 邀请链接卡片 -->
                    <div class="invitation-card" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">邀请好友</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--gray);">分享您的专属邀请链接，邀请好友加入团队，获得丰厚返佣奖励！</p>
                        
                        <div class="invitation-link-container" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                            <input type="text" id="invitationLink" readonly style="flex: 1; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 5px; background: #f8f9fa;" value="加载中...">
                            <button class="btn btn-primary" onclick="copyInvitationLink()">
                                <i class="fas fa-copy"></i> 复制链接
                            </button>
                        </div>
                        
                        <div class="invitation-code-container" style="display: flex; gap: 1rem; align-items: center;">
                            <span style="font-weight: bold; color: var(--dark);">邀请码:</span>
                            <input type="text" id="invitationCode" readonly style="flex: 1; max-width: 200px; padding: 0.5rem; border: 2px solid #e9ecef; border-radius: 5px; background: #f8f9fa; text-align: center; font-weight: bold;" value="加载中...">
                            <button class="btn btn-outline-primary" onclick="copyInvitationCode()">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                    </div>
                    
                    <!-- 导航标签 -->
                    <div class="team-tabs" style="margin-bottom: 2rem;">
                        <ul class="nav nav-tabs" id="teamTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" onclick="window.teamPage.switchTab('overview')">
                                    <i class="fas fa-chart-pie"></i> 团队概览
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="members-tab" data-bs-toggle="tab" data-bs-target="#members" type="button" role="tab" onclick="window.teamPage.switchTab('members')">
                                    <i class="fas fa-users"></i> 团队成员
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="commissions-tab" data-bs-toggle="tab" data-bs-target="#commissions" type="button" role="tab" onclick="window.teamPage.switchTab('commissions')">
                                    <i class="fas fa-money-bill-wave"></i> 返佣记录
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="rewards-tab" data-bs-toggle="tab" data-bs-target="#rewards" type="button" role="tab" onclick="window.teamPage.switchTab('rewards')">
                                    <i class="fas fa-gift"></i> 邀请奖励
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- 标签内容 -->
                    <div class="tab-content" id="teamTabContent">
                        <!-- 团队概览 -->
                        <div class="tab-pane fade show active" id="overview" role="tabpanel">
                            <div class="card">
                                <div class="card-body">
                                    <div id="teamOverviewContent">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> 加载中...
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    
                        <!-- 团队成员 -->
                        <div class="tab-pane fade" id="members" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-users"></i> 团队成员</h5>
                                </div>
                                <div class="card-body">
                                    <div id="teamMembersContent">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> 加载中...
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            
                        <!-- 返佣记录 -->
                        <div class="tab-pane fade" id="commissions" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-money-bill-wave"></i> 返佣记录</h5>
                                </div>
                                <div class="card-body">
                                    <div id="commissionRecordsContent">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> 加载中...
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                        <!-- 邀请奖励 -->
                        <div class="tab-pane fade" id="rewards" role="tabpanel">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-gift"></i> 邀请奖励记录</h5>
                                </div>
                                <div class="card-body">
                                    <div id="invitationRewardsContent">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> 加载中...
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

    async afterRender(token, user) {
        if (!token || !user) return;

        // 将实例暴露到全局
        window.teamPage = this;

        try {
            await this.loadTeamInfo(token);
            await this.loadTeamOverview();
            
            // 预加载所有标签页内容
            await this.loadTeamMembers();
            await this.loadCommissionRecords();
            await this.loadInvitationRewards();
        } catch (error) {
            console.error('初始化团队页面失败:', error);
            this.app.showToast('加载团队信息失败，请稍后再试', 'error');
        }
    }

    async loadTeamInfo(token) {
        try {
            const response = await fetch('http://localhost:3000/api/team/info', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取团队信息失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.teamInfo = result.data;
                this.updateTeamDisplay();
            } else {
                throw new Error(result.error || '获取团队信息失败');
            }
        } catch (error) {
            console.error('加载团队信息失败:', error);
            throw error;
        }
    }

    updateTeamDisplay() {
        if (!this.teamInfo) return;

        // 直接使用teamInfo，使用正确的字段名
        const stats = this.teamInfo;
        // 数值规范化，使用驼峰命名（与后端API返回的字段名匹配）
        const level1 = Number(stats.level1Count || 0);
        const level2 = Number(stats.level2Count || 0);
        const level3 = Number(stats.level3Count || 0);
        const totalCommissionNum = Number(stats.totalCommission || 0);
        const totalInvitationRewardsNum = Number(stats.totalInvitationRewards || 0);
        
        // 更新统计卡片
        document.getElementById('level1Count').textContent = level1;
        document.getElementById('level2Count').textContent = level2;
        document.getElementById('level3Count').textContent = level3;
        document.getElementById('totalCommission').textContent = totalCommissionNum.toFixed(2);
        
        // 更新邀请链接
        document.getElementById('invitationLink').value = this.teamInfo.invitationLink || '';
        document.getElementById('invitationCode').value = this.teamInfo.invitationCode || '';
    }

    async loadTeamOverview() {
        const container = document.getElementById('teamOverviewContent');
        const stats = this.teamInfo.statistics;
        // 数值规范化
        const totalCommissionNum = Number(stats.total_commission || 0);
        const totalInvitationRewardsNum = Number(stats.total_invitation_rewards || 0);
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-info-circle text-info"></i> 返佣规则</h5>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check text-success"></i> 1级成员完成VIP挑战，您获得5%返佣</li>
                        <li><i class="fas fa-check text-success"></i> 2级成员完成VIP挑战，您获得3%返佣</li>
                        <li><i class="fas fa-check text-success"></i> 3级成员完成VIP挑战，您获得1%返佣</li>
                        <li><i class="fas fa-check text-success"></i> 邀请好友充值≥30USDT，您获得1USDT奖励</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5><i class="fas fa-chart-line text-success"></i> 收益统计</h5>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 text-success">${totalCommissionNum.toFixed(2)}</div>
                                <small class="text-muted">累计返佣(USDT)</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 text-info">${totalInvitationRewardsNum.toFixed(2)}</div>
                                <small class="text-muted">邀请奖励(USDT)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async switchTab(tabName) {
        this.currentTab = tabName;
        
        switch (tabName) {
            case 'members':
                await this.loadTeamMembers();
                break;
            case 'commissions':
                await this.loadCommissionRecords();
                break;
            case 'rewards':
                await this.loadInvitationRewards();
                break;
        }
    }

    async loadTeamMembers() {
        const container = document.getElementById('teamMembersContent');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/team/members', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取团队成员失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.renderTeamMembers(result.data.members);
            } else {
                throw new Error(result.error || '获取团队成员失败');
            }
        } catch (error) {
            console.error('加载团队成员失败:', error);
            container.innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i> 加载失败: ${error.message}
                </div>
            `;
        }
    }

    renderTeamMembers(members) {
        const container = document.getElementById('teamMembersContent');
        
        if (!members || (members.level1.length === 0 && members.level2.length === 0 && members.level3.length === 0)) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-users"></i> 暂无团队成员
                    <br><small>邀请好友加入您的团队吧！</small>
                </div>
            `;
            return;
        }

        let html = '';
        
        // 1级成员
        if (members.level1.length > 0) {
            html += `
                <h6 class="text-primary mb-3"><i class="fas fa-star"></i> 1级成员 (${members.level1.length}人)</h6>
                <div class="row mb-4">
            `;
            members.level1.forEach(member => {
                html += `
                    <div class="col-md-4 mb-3">
                        <div class="card border-primary">
                            <div class="card-body text-center">
                                <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    ${(member.displayName || member.email || '用户').charAt(0).toUpperCase()}
                                </div>
                                <h6 class="card-title">${member.displayName || member.email || '用户'}</h6>
                                <small class="text-muted">${member.email}</small>
                                <br><small class="text-muted">加入时间: ${new Date(member.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 2级成员
        if (members.level2.length > 0) {
            html += `
                <h6 class="text-warning mb-3"><i class="fas fa-star"></i> 2级成员 (${members.level2.length}人)</h6>
                <div class="row mb-4">
            `;
            members.level2.forEach(member => {
                html += `
                    <div class="col-md-4 mb-3">
                        <div class="card border-warning">
                            <div class="card-body text-center">
                                <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    ${(member.displayName || member.email || '用户').charAt(0).toUpperCase()}
                                </div>
                                <h6 class="card-title">${member.displayName || member.email || '用户'}</h6>
                                <small class="text-muted">${member.email}</small>
                                <br><small class="text-muted">加入时间: ${new Date(member.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 3级成员
        if (members.level3.length > 0) {
            html += `
                <h6 class="text-info mb-3"><i class="fas fa-star"></i> 3级成员 (${members.level3.length}人)</h6>
                <div class="row mb-4">
            `;
            members.level3.forEach(member => {
                html += `
                    <div class="col-md-4 mb-3">
                        <div class="card border-info">
                            <div class="card-body text-center">
                                <div class="avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    ${(member.displayName || member.email || '用户').charAt(0).toUpperCase()}
                                </div>
                                <h6 class="card-title">${member.displayName || member.email || '用户'}</h6>
                                <small class="text-muted">${member.email}</small>
                                <br><small class="text-muted">加入时间: ${new Date(member.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;
    }

    async loadCommissionRecords() {
        const container = document.getElementById('commissionRecordsContent');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/team/commissions?page=1&limit=20', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取返佣记录失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.renderCommissionRecords(result.data.records);
            } else {
                throw new Error(result.error || '获取返佣记录失败');
            }
        } catch (error) {
            console.error('加载返佣记录失败:', error);
            container.innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i> 加载失败: ${error.message}
                </div>
            `;
        }
    }

    renderCommissionRecords(records) {
        const container = document.getElementById('commissionRecordsContent');
        
        if (!records || records.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-money-bill-wave"></i> 暂无返佣记录
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>时间</th>
                            <th>来源用户</th>
                            <th>挑战名称</th>
                            <th>挑战奖励</th>
                            <th>返佣比例</th>
                            <th>返佣金额</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        records.forEach(record => {
            const statusClassName = getBadgeClassForStatus('commissionStatus', record.status);
            const statusText = record.status === 'paid' ? '已发放' : record.status === 'pending' ? '待处理' : '失败';
            
            html += `
                <tr>
                    <td>${new Date(record.created_at).toLocaleString()}</td>
                    <td>${record.from_username}</td>
                    <td>${record.challenge_name}</td>
                    <td>${record.challenge_reward} USDT</td>
                    <td>${(record.commission_rate * 100).toFixed(1)}%</td>
                    <td class="text-success fw-bold">${record.commission_amount} USDT</td>
                    <td><span class="${statusClassName}">${statusText}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    async loadInvitationRewards() {
        const container = document.getElementById('invitationRewardsContent');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/team/invitation-rewards?page=1&limit=20', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取邀请奖励记录失败');
            }

            const result = await response.json();
            
            if (result.success) {
                this.renderInvitationRewards(result.data.records);
            } else {
                throw new Error(result.error || '获取邀请奖励记录失败');
            }
        } catch (error) {
            console.error('加载邀请奖励记录失败:', error);
            container.innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i> 加载失败: ${error.message}
                </div>
            `;
        }
    }

    renderInvitationRewards(records) {
        const container = document.getElementById('invitationRewardsContent');
        
        if (!records || records.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-gift"></i> 暂无邀请奖励记录
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>时间</th>
                            <th>被邀请用户</th>
                            <th>充值金额</th>
                            <th>奖励金额</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        records.forEach(record => {
            const statusClassName = getBadgeClassForStatus('rewardStatus', record.status);
            const statusText = record.status === 'paid' ? '已发放' : record.status === 'pending' ? '待处理' : '失败';
            
            html += `
                <tr>
                    <td>${new Date(record.created_at).toLocaleString()}</td>
                    <td>${record.invited_username} (${record.invited_email})</td>
                    <td>${record.recharge_amount} USDT</td>
                    <td class="text-success fw-bold">${record.reward_amount} USDT</td>
                    <td><span class="${statusClassName}">${statusText}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }
}

// 全局函数
window.copyInvitationLink = function() {
    const linkInput = document.getElementById('invitationLink');
    linkInput.select();
    document.execCommand('copy');
    
    if (window.globalAppInstance) {
        window.globalAppInstance.showToast('邀请链接已复制到剪贴板', 'success');
    }
};

window.copyInvitationCode = function() {
    const codeInput = document.getElementById('invitationCode');
    codeInput.select();
    document.execCommand('copy');
    
    if (window.globalAppInstance) {
        window.globalAppInstance.showToast('邀请码已复制到剪贴板', 'success');
    }
};

export default Team;