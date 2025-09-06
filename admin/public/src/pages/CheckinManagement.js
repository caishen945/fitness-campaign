import adminApi from '../services/adminApi.js';

class CheckinManagement {
    constructor(app) {
        this.app = app;
        this.currentPage = 1;
        this.totalPages = 1;
        this.limit = 10;
        this.checkinStats = [];
        this.checkinConfig = {
            baseReward: 0.1,
            consecutiveReward7: 0.1,
            consecutiveReward30: 0.2
        };
        this.overview = null;
    }

    render() {
        return `
            <div class="checkin-management">
                <h1>签到管理</h1>
                
                <!-- 签到系统概览 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h2>签到系统概览</h2>
                    </div>
                    <div class="card-body">
                        <div class="row" id="checkin-overview">
                            <div class="col-md-3 mb-3">
                                <div class="stat-card bg-primary">
                                    <h3>今日签到人数</h3>
                                    <div class="stat-value" id="today-checkins">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="stat-card bg-success">
                                    <h3>昨日签到人数</h3>
                                    <div class="stat-value" id="yesterday-checkins">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="stat-card bg-info">
                                    <h3>本周签到人数</h3>
                                    <div class="stat-value" id="week-checkins">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="stat-card bg-warning">
                                    <h3>本月签到人数</h3>
                                    <div class="stat-value" id="month-checkins">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="stat-card bg-secondary">
                                    <h3>总签到次数</h3>
                                    <div class="stat-value" id="total-checkins">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="stat-card bg-danger">
                                    <h3>总奖励金额</h3>
                                    <div class="stat-value" id="total-rewards">加载中...</div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="stat-card bg-dark">
                                    <h3>连续签到7天以上用户</h3>
                                    <div class="stat-value" id="consecutive-users">加载中...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 签到配置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h2>签到配置</h2>
                    </div>
                    <div class="card-body">
                        <form id="checkin-config-form">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="baseReward">基础签到奖励 (USDT)</label>
                                        <input type="number" class="form-control" id="baseReward" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="consecutiveReward7">连续签到7天额外奖励 (USDT)</label>
                                        <input type="number" class="form-control" id="consecutiveReward7" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="consecutiveReward30">连续签到30天额外奖励 (USDT)</label>
                                        <input type="number" class="form-control" id="consecutiveReward30" step="0.01" min="0" required>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">保存配置</button>
                        </form>
                    </div>
                </div>
                
                <!-- 手动添加签到 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h2>手动添加签到</h2>
                    </div>
                    <div class="card-body">
                        <form id="manual-checkin-form">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="userId">用户ID</label>
                                        <input type="number" class="form-control" id="userId" required>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="rewardAmount">奖励金额 (USDT)</label>
                                        <input type="number" class="form-control" id="rewardAmount" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-group">
                                        <label for="description">描述</label>
                                        <input type="text" class="form-control" id="description" placeholder="管理员手动添加签到">
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success">添加签到</button>
                        </form>
                    </div>
                </div>
                
                <!-- 用户签到统计列表 -->
                <div class="card">
                    <div class="card-header">
                        <h2>用户签到统计</h2>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>用户ID</th>
                                        <th>用户名</th>
                                        <th>邮箱</th>
                                        <th>总签到次数</th>
                                        <th>最大连续签到</th>
                                        <th>总奖励</th>
                                        <th>最后签到时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="checkin-stats-table">
                                    <tr>
                                        <td colspan="8" class="text-center">加载中...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- 分页控件 -->
                        <div class="pagination-container">
                            <button id="prev-page" class="btn btn-sm btn-outline-primary">上一页</button>
                            <span id="pagination-info">第1 页，共1 页</span>
                            <button id="next-page" class="btn btn-sm btn-outline-primary">下一页</button>
                        </div>
                    </div>
                </div>
                
                <!-- 用户签到详情模态框 -->
                <div class="modal fade" id="userCheckinModal" tabindex="-1" role="dialog" aria-labelledby="userCheckinModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="userCheckinModalLabel">用户签到详情</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="userCheckinModalBody">
                                <div class="user-info mb-4">
                                    <h4>用户信息</h4>
                                    <p><strong>用户ID:</strong> <span id="detail-user-id"></span></p>
                                    <p><strong>邮箱:</strong> <span id="detail-user-email"></span></p>
                                    <p><strong>邮箱:</strong> <span id="detail-email"></span></p>
                                </div>
                                
                                <div class="user-stats mb-4">
                                    <h4>签到统计</h4>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="stat-card bg-primary">
                                                <h5>总签到次数</h5>
                                                <div class="stat-value" id="detail-total-checkins"></div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="stat-card bg-success">
                                                <h5>最大连续签到</h5>
                                                <div class="stat-value" id="detail-max-consecutive"></div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="stat-card bg-info">
                                                <h5>本月签到天数</h5>
                                                <div class="stat-value" id="detail-monthly-checkins"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-4">
                                            <div class="stat-card bg-warning">
                                                <h5>总奖励金额</h5>
                                                <div class="stat-value" id="detail-total-rewards"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="checkin-history">
                                    <h4>签到历史</h4>
                                    <div class="table-responsive">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>签到日期</th>
                                                    <th>奖励金额</th>
                                                    <th>连续天数</th>
                                                    <th>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody id="checkin-history-table">
                                                <tr>
                                                    <td colspan="5" class="text-center">加载中...</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 确认删除模态框 -->
                <div class="modal fade" id="deleteCheckinModal" tabindex="-1" role="dialog" aria-labelledby="deleteCheckinModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="deleteCheckinModalLabel">确认删除</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p>确定要删除这条签到记录吗？此操作不可逆，并且会从用户钱包中扣除相应的奖励金额。</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                                <button type="button" class="btn btn-danger" id="confirmDeleteCheckin">确认删除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        try {
            // 获取签到系统概览
            await this.loadCheckinOverview();
            
            // 获取签到配置
            await this.loadCheckinConfig();
            
            // 获取用户签到统计
            await this.loadCheckinStats();
            
            // 绑定事件
            this.bindEvents();
        } catch (error) {
            console.error('初始化签到管理页面失败', error);
            this.app.showToast('加载签到管理数据失败', 'error');
        }
    }
    
    async loadCheckinOverview() {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await adminApi.getCheckinOverview(token);
            
            if (!response.success) {
                throw new Error(response.message || '获取签到系统概览失败');
            }
            
            this.overview = response.data;
            this.updateOverviewUI();
        } catch (error) {
            console.error('获取签到系统概览失败:', error);
            throw error;
        }
    }
    
    updateOverviewUI() {
        if (!this.overview) return;
        
        document.getElementById('today-checkins').textContent = this.overview.today_checkins;
        document.getElementById('yesterday-checkins').textContent = this.overview.yesterday_checkins;
        document.getElementById('week-checkins').textContent = this.overview.week_checkins;
        document.getElementById('month-checkins').textContent = this.overview.month_checkins;
        document.getElementById('total-checkins').textContent = this.overview.total_checkins;
        document.getElementById('total-rewards').textContent = `${parseFloat(this.overview.total_rewards).toFixed(2)} USDT`;
        document.getElementById('consecutive-users').textContent = this.overview.consecutive_users;
    }
    
    async loadCheckinConfig() {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await adminApi.getCheckinConfig(token);
            
            if (!response.success) {
                throw new Error(response.message || '获取签到配置失败');
            }
            
            this.checkinConfig = response.data;
            this.updateConfigFormUI();
        } catch (error) {
            console.error('获取签到配置失败:', error);
            throw error;
        }
    }
    
    updateConfigFormUI() {
        const baseRewardEl = document.getElementById('baseReward');
        const consecutiveReward7El = document.getElementById('consecutiveReward7');
        const consecutiveReward30El = document.getElementById('consecutiveReward30');
        
        if (baseRewardEl) baseRewardEl.value = this.checkinConfig?.baseReward || '';
        if (consecutiveReward7El) consecutiveReward7El.value = this.checkinConfig?.consecutiveReward7 || '';
        if (consecutiveReward30El) consecutiveReward30El.value = this.checkinConfig?.consecutiveReward30 || '';
    }
    
    async loadCheckinStats() {
        try {
            const response = await adminApi.getCheckinStats();
            
            if (response.success) {
                // 确保checkinStats是数组
                if (Array.isArray(response.data)) {
                    this.checkinStats = response.data;
                } else if (response.data && Array.isArray(response.data.stats)) {
                    this.checkinStats = response.data.stats;
                } else {
                    this.checkinStats = [];
                }
                
                this.totalPages = response.data?.pagination?.totalPages || 1;
                this.currentPage = response.data?.pagination?.page || 1;
                
                console.log('📊 加载签到统计数据:', this.checkinStats);
                this.updateCheckinStatsUI();
                this.updatePaginationUI();
            }
        } catch (error) {
            console.error('获取签到统计失败:', error);
            // 确保checkinStats是数组
            this.checkinStats = [];
            this.updateCheckinStatsUI();
        }
    }
    
    updateCheckinStatsUI() {
        const tableBody = document.getElementById('checkin-stats-table');
        
        if (!this.checkinStats || this.checkinStats.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.checkinStats.map(stat => `
            <tr>
                <td>${stat.user_id}</td>
                <td>${stat.email || `ID ${stat.user_id}`}</td>
                <td>${stat.email}</td>
                <td>${stat.total_checkins || 0}</td>
                <td>${stat.max_consecutive_days || 0}</td>
                <td>${parseFloat(stat.total_rewards || 0).toFixed(2)} USDT</td>
                <td>${stat.last_checkin_date ? new Date(stat.last_checkin_date).toLocaleString() : '未知'}</td>
                <td>
                    <button class="btn btn-sm btn-info view-details" data-user-id="${stat.user_id}">查看详情</button>
                </td>
            </tr>
        `).join('');
        
        // 绑定详情按钮事件
        const viewButtons = document.querySelectorAll('.view-details');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-user-id');
                this.showUserCheckinDetails(userId);
            });
        });
    }
    
    updatePaginationUI() {
        document.getElementById('pagination-info').textContent = `第${this.currentPage} 页，共${this.totalPages} 页`;
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
    }
    
    async showUserCheckinDetails(userId) {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await adminApi.getUserCheckinDetails(token, userId);
            
            if (!response.success) {
                throw new Error(response.message || '获取用户签到详情失败');
            }
            
            const { user, checkins, stats } = response.data;
            
            // 更新用户信息
            document.getElementById('detail-user-id').textContent = user.id;
            document.getElementById('detail-user-email').textContent = user.email || '未设置';
            document.getElementById('detail-email').textContent = user.email;
            
            // 更新统计信息
            document.getElementById('detail-total-checkins').textContent = stats.total_checkins || 0;
            document.getElementById('detail-max-consecutive').textContent = stats.max_consecutive_days || 0;
            document.getElementById('detail-monthly-checkins').textContent = stats.monthly_checkins || 0;
            document.getElementById('detail-total-rewards').textContent = `${parseFloat(stats.total_rewards || 0).toFixed(2)} USDT`;
            
            // 更新签到历史
            const historyTable = document.getElementById('checkin-history-table');
            
            if (!checkins || checkins.length === 0) {
                historyTable.innerHTML = '<tr><td colspan="5" class="text-center">暂无签到记录</td></tr>';
            } else {
                historyTable.innerHTML = checkins.map(checkin => `
                    <tr>
                        <td>${checkin.id}</td>
                        <td>${new Date(checkin.checkin_date).toLocaleString()}</td>
                        <td>${parseFloat(checkin.reward_amount).toFixed(2)} USDT</td>
                        <td>${checkin.consecutive_days}</td>
                        <td>
                            <button class="btn btn-sm btn-danger delete-checkin" data-checkin-id="${checkin.id}">删除</button>
                        </td>
                    </tr>
                `).join('');
                
                // 绑定删除按钮事件
                const deleteButtons = document.querySelectorAll('.delete-checkin');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const checkinId = button.getAttribute('data-checkin-id');
                        this.showDeleteCheckinConfirm(checkinId);
                    });
                });
            }
            
            // 显示模态框
            $('#userCheckinModal').modal('show');
        } catch (error) {
            console.error('获取用户签到详情失败:', error);
            this.app.showToast('获取用户签到详情失败', 'error');
        }
    }
    
    showDeleteCheckinConfirm(checkinId) {
        // 保存要删除的签到ID
        this.checkinIdToDelete = checkinId;
        
        // 显示确认模态框
        $('#deleteCheckinModal').modal('show');
    }
    
    async deleteCheckin(checkinId) {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await adminApi.deleteCheckin(token, checkinId);
            
            if (!response.success) {
                throw new Error(response.message || '删除签到记录失败');
            }
            
            this.app.showToast('签到记录已删除', 'success');
            
            // 关闭确认模态框
            $('#deleteCheckinModal').modal('hide');
            
            // 关闭用户详情模态框
            $('#userCheckinModal').modal('hide');
            
            // 重新加载数据
            await this.loadCheckinOverview();
            await this.loadCheckinStats();
        } catch (error) {
            console.error('删除签到记录失败:', error);
            this.app.showToast('删除签到记录失败: ' + error.message, 'error');
        }
    }
    
    async updateCheckinConfig() {
        try {
            const token = localStorage.getItem('admin_token');
            const baseReward = parseFloat(document.getElementById('baseReward').value);
            const consecutiveReward7 = parseFloat(document.getElementById('consecutiveReward7').value);
            const consecutiveReward30 = parseFloat(document.getElementById('consecutiveReward30').value);
            
            const response = await adminApi.updateCheckinConfig(token, {
                baseReward,
                consecutiveReward7,
                consecutiveReward30
            });
            
            if (!response.success) {
                throw new Error(response.message || '更新签到配置失败');
            }
            
            this.app.showToast('签到配置已更新', 'success');
            
            // 更新本地配置
            this.checkinConfig = {
                baseReward,
                consecutiveReward7,
                consecutiveReward30
            };
        } catch (error) {
            console.error('更新签到配置失败:', error);
            this.app.showToast('更新签到配置失败: ' + error.message, 'error');
        }
    }
    
    async addManualCheckin() {
        try {
            const token = localStorage.getItem('admin_token');
            const userId = parseInt(document.getElementById('userId').value);
            const rewardAmount = parseFloat(document.getElementById('rewardAmount').value);
            const description = document.getElementById('description').value || '管理员手动添加签到';
            
            const response = await adminApi.addManualCheckin(token, {
                userId,
                rewardAmount,
                description
            });
            
            if (!response.success) {
                throw new Error(response.message || '手动添加签到失败');
            }
            
            this.app.showToast('签到记录已添加', 'success');
            
            // 重置表单
            document.getElementById('manual-checkin-form').reset();
            
            // 重新加载数据
            await this.loadCheckinOverview();
            await this.loadCheckinStats();
        } catch (error) {
            console.error('手动添加签到失败:', error);
            this.app.showToast('手动添加签到失败: ' + error.message, 'error');
        }
    }
    
    bindEvents() {
        // 分页按钮事件
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadCheckinStats();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadCheckinStats();
            }
        });
        
        // 配置表单提交事件
        document.getElementById('checkin-config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCheckinConfig();
        });
        
        // 手动添加签到表单提交事件
        document.getElementById('manual-checkin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addManualCheckin();
        });
        
        // 确认删除事件
        document.getElementById('confirmDeleteCheckin').addEventListener('click', () => {
            if (this.checkinIdToDelete) {
                this.deleteCheckin(this.checkinIdToDelete);
            }
        });
    }
}

export default CheckinManagement;
