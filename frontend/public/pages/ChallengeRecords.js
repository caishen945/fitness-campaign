class ChallengeRecords {
    constructor(app) {
        this.app = app;
        this.challenges = [];
        this.stats = {};
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.totalRecords = 0;
        this.filters = {
            status: '',
            vipLevelId: '',
            userId: '',
            startDate: '',
            endDate: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };
        this.isLoading = false;
    }

    render() {
        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>挑战记录查询</h1>
                    <p>查看和管理所有VIP挑战记录，支持多维度筛选和统计</p>
                </div>

                <!-- 统计卡片 -->
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 32px;">📊</div>
                            <div>
                                <h3 style="margin: 0; color: #333;">总挑战数</h3>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #007AFF;" id="total-challenges">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 32px;">✅</div>
                            <div>
                                <h3 style="margin: 0; color: #333;">已完成</h3>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #34C759;" id="completed-challenges">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 32px;">⏳</div>
                            <div>
                                <h3 style="margin: 0; color: #333;">进行中</h3>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #FF9500;" id="active-challenges">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 32px;">💰</div>
                            <div>
                                <h3 style="margin: 0; color: #333;">总押金</h3>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #FF3B30;" id="total-deposits">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 筛选栏 -->
                <div class="filter-bar" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                    <h3 style="margin: 0 0 1rem 0;">筛选条件</h3>
                    <div class="filter-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="filter-group">
                            <label>挑战状态</label>
                            <select id="filter-status" class="ios-select">
                                <option value="">全部状态</option>
                                <option value="active">进行中</option>
                                <option value="completed">已完成</option>
                                <option value="failed">失败</option>
                                <option value="cancelled">已取消</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>VIP等级</label>
                            <select id="filter-level" class="ios-select">
                                <option value="">全部等级</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>用户ID</label>
                            <input type="text" id="filter-user" class="ios-input" placeholder="输入用户ID">
                        </div>
                        <div class="filter-group">
                            <label>开始日期</label>
                            <input type="date" id="filter-start-date" class="ios-input">
                        </div>
                        <div class="filter-group">
                            <label>结束日期</label>
                            <input type="date" id="filter-end-date" class="ios-input">
                        </div>
                        <div class="filter-group">
                            <label>排序方式</label>
                            <select id="filter-sort" class="ios-select">
                                <option value="created_at:DESC">创建时间 (最新)</option>
                                <option value="created_at:ASC">创建时间 (最早)</option>
                                <option value="deposit_amount:DESC">押金金额 (高到低)</option>
                                <option value="deposit_amount:ASC">押金金额 (低到高)</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="ios-button ios-button-primary" data-action="apply-filters">
                            <span style="font-size: 16px;">🔍</span>
                            应用筛选
                        </button>
                        <button class="ios-button ios-button-secondary" data-action="clear-filters">
                            <span style="font-size: 16px;">🔄</span>
                            清除筛选
                        </button>
                    </div>
                </div>

                <!-- 记录列表 -->
                <div class="records-container">
                    <div class="loading-overlay" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                    
                    <div class="records-table" id="records-table">
                        <!-- 记录表格将在这里动态生成 -->
                    </div>

                    <!-- 空状态 -->
                    <div class="empty-state" style="display: none; text-align: center; padding: 4rem 2rem;">
                        <div style="font-size: 64px; margin-bottom: 1rem;">📋</div>
                        <h3>暂无挑战记录</h3>
                        <p>当前筛选条件下没有找到任何挑战记录</p>
                    </div>

                    <!-- 分页 -->
                    <div class="pagination" id="pagination" style="display: none;">
                        <!-- 分页控件将在这里动态生成 -->
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
        this.loadStats();
        this.loadLevels();
        this.loadChallenges();
    }

    bindEvents() {
        // 筛选操作
        document.querySelector('[data-action="apply-filters"]').addEventListener('click', () => {
            this.applyFilters();
        });

        document.querySelector('[data-action="clear-filters"]').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    async loadStats() {
        try {
            const response = await fetch('/api/admin/vip-challenges/stats', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取统计信息失败');
            }

            const result = await response.json();
            this.stats = result.data;
            this.updateStatsDisplay();
        } catch (error) {
            console.error('加载统计信息失败:', error);
            this.app.showToast('加载统计信息失败: ' + error.message, 'error');
        }
    }

    updateStatsDisplay() {
        const total = this.stats.total || {};
        document.getElementById('total-challenges').textContent = total.total_challenges || 0;
        document.getElementById('completed-challenges').textContent = total.completed_challenges || 0;
        document.getElementById('active-challenges').textContent = total.active_challenges || 0;
        document.getElementById('total-deposits').textContent = total.total_deposits ? `${total.total_deposits.toFixed(2)} USDT` : '0 USDT';
    }

    async loadLevels() {
        try {
            const response = await fetch('/api/admin/vip-levels/active', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取VIP等级失败');
            }

            const result = await response.json();
            const levelSelect = document.getElementById('filter-level');
            
            // 清空现有选项（保留"全部等级"）
            levelSelect.innerHTML = '<option value="">全部等级</option>';
            
            // 添加等级选项
            result.data.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = `${level.icon} ${level.name}`;
                levelSelect.appendChild(option);
            });
        } catch (error) {
            console.error('加载VIP等级失败:', error);
        }
    }

    async loadChallenges() {
        this.isLoading = true;
        this.showLoading();

        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filters
            });

            const response = await fetch(`/api/admin/vip-challenges?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取挑战记录失败');
            }

            const result = await response.json();
            this.challenges = result.data.challenges;
            this.totalPages = result.data.pagination.totalPages;
            this.totalRecords = result.data.pagination.total;
            
            this.renderChallenges();
            this.renderPagination();
        } catch (error) {
            console.error('加载挑战记录失败:', error);
            this.app.showToast('加载挑战记录失败: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderChallenges() {
        const table = document.getElementById('records-table');
        const emptyState = document.querySelector('.empty-state');

        if (this.challenges.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'block';
        emptyState.style.display = 'none';

        table.innerHTML = `
            <div class="table-container" style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">ID</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">用户</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">等级</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">状态</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">进度</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">押金</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">奖励</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">创建时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.challenges.map(challenge => `
                            <tr style="border-bottom: 1px solid #f1f3f4;">
                                <td style="padding: 1rem;">${challenge.id}</td>
                                <td style="padding: 1rem;">
                                    <div>
                                        <div style="font-weight: 500;">${challenge.user?.displayName || challenge.user?.email || '未知用户'}</div>
                                        <div style="font-size: 12px; color: #666;">${challenge.user?.email || ''}</div>
                                    </div>
                                </td>
                                <td style="padding: 1rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 20px;">${challenge.vipLevel?.icon || '🏆'}</span>
                                        <span>${challenge.vipLevel?.name || '未知等级'}</span>
                                    </div>
                                </td>
                                <td style="padding: 1rem;">
                                    <span class="status-badge ${challenge.status}">
                                        ${this.getStatusText(challenge.status)}
                                    </span>
                                </td>
                                <td style="padding: 1rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <div style="width: 60px; height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                                            <div style="width: ${challenge.progress}%; height: 100%; background: ${this.getProgressColor(challenge.progress)}; transition: width 0.3s;"></div>
                                        </div>
                                        <span style="font-size: 12px;">${challenge.progress.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td style="padding: 1rem;">${challenge.depositAmount} USDT</td>
                                <td style="padding: 1rem;">${challenge.rewardAmount} USDT</td>
                                <td style="padding: 1rem;">
                                    <div style="font-size: 12px;">
                                        ${new Date(challenge.startDate).toLocaleDateString()}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        
        let paginationHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem;">
                <button class="ios-button ios-button-small ${this.currentPage === 1 ? 'ios-button-disabled' : 'ios-button-secondary'}" 
                        data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                    上一页
                </button>
        `;

        // 显示页码
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="ios-button ios-button-small ${i === this.currentPage ? 'ios-button-primary' : 'ios-button-secondary'}" 
                        data-action="go-page" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
                <button class="ios-button ios-button-small ${this.currentPage === this.totalPages ? 'ios-button-disabled' : 'ios-button-secondary'}" 
                        data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                    下一页
                </button>
            </div>
            <div style="text-align: center; margin-top: 1rem; color: #666;">
                共 ${this.totalRecords} 条记录，第 ${this.currentPage} / ${this.totalPages} 页
            </div>
        `;

        pagination.innerHTML = paginationHTML;

        // 绑定分页事件
        this.bindPaginationEvents();
    }

    bindPaginationEvents() {
        document.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadChallenges();
            }
        });

        document.querySelector('[data-action="next-page"]')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadChallenges();
            }
        });

        document.querySelectorAll('[data-action="go-page"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                this.currentPage = page;
                this.loadChallenges();
            });
        });
    }

    applyFilters() {
        this.filters.status = document.getElementById('filter-status').value;
        this.filters.vipLevelId = document.getElementById('filter-level').value;
        this.filters.userId = document.getElementById('filter-user').value;
        this.filters.startDate = document.getElementById('filter-start-date').value;
        this.filters.endDate = document.getElementById('filter-end-date').value;
        
        const sortValue = document.getElementById('filter-sort').value;
        const [sortBy, sortOrder] = sortValue.split(':');
        this.filters.sortBy = sortBy;
        this.filters.sortOrder = sortOrder;

        this.currentPage = 1;
        this.loadChallenges();
    }

    clearFilters() {
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-level').value = '';
        document.getElementById('filter-user').value = '';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        document.getElementById('filter-sort').value = 'created_at:DESC';

        this.filters = {
            status: '',
            vipLevelId: '',
            userId: '',
            startDate: '',
            endDate: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };

        this.currentPage = 1;
        this.loadChallenges();
    }

    getStatusText(status) {
        const statusMap = {
            'active': '进行中',
            'completed': '已完成',
            'failed': '失败',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }

    getProgressColor(progress) {
        if (progress >= 100) return '#34C759';
        if (progress >= 80) return '#007AFF';
        if (progress >= 50) return '#FF9500';
        return '#FF3B30';
    }

    showLoading() {
        document.querySelector('.loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.querySelector('.loading-overlay').style.display = 'none';
    }
}

export default ChallengeRecords;
