import adminApi from '../services/adminApi.js';

class AchievementManagement {
    constructor(app) {
        this.app = app;
        this.achievements = [];
        this.achievementTypes = [];
        this.currentFilter = 'all';
    }

    render() {
        return `
            <div class="achievement-management-page">
                <div class="page-header">
                    <h1>🏆 成就管理</h1>
                    <button class="btn btn-primary" id="add-achievement-btn">
                        <i class="fas fa-plus"></i> 添加成就
                    </button>
                </div>

                <!-- 统计信息 -->
                <div class="stats-section">
                    <div class="stat-card">
                        <div class="stat-value" id="total-achievements">-</div>
                        <div class="stat-label">总成就数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="active-achievements">-</div>
                        <div class="stat-label">启用成就</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total-rewards">-</div>
                        <div class="stat-label">总奖励金额</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="completed-users">-</div>
                        <div class="stat-label">完成用户数</div>
                    </div>
                </div>

                <!-- 筛选和搜索 -->
                <div class="filters-section">
                    <div class="filter-group">
                        <label>成就类型:</label>
                        <select id="type-filter">
                            <option value="all">全部类型</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>状态</label>
                        <select id="status-filter">
                            <option value="all">全部状态</option>
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                    <div class="search-group">
                        <input type="text" id="search-input" placeholder="搜索成就名称..." />
                        <button class="btn btn-secondary" id="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <!-- 成就列表 -->
                <div class="achievements-table-container">
                    <table class="achievements-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>类型</th>
                                <th>名称</th>
                                <th>描述</th>
                                <th>目标值</th>
                                <th>奖励金额</th>
                                <th>图标</th>
                                <th>状态</th>
                                <th>排序</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="achievements-tbody">
                            <tr>
                                <td colspan="10" class="loading">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <div class="pagination" id="pagination" style="display: none;">
                    <!-- 分页内容 -->
                </div>
            </div>

            <!-- 添加/编辑成就模态框 -->
            <div class="modal" id="achievement-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">添加成就</h3>
                        <button class="close-btn" id="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="achievement-form">
                            <div class="form-group">
                                <label for="achievement-type">成就类型 *</label>
                                <select id="achievement-type" required>
                                    <option value="">请选择成就类型</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="achievement-name">成就名称 *</label>
                                <input type="text" id="achievement-name" required placeholder="例如：团队新秀">
                            </div>
                            
                            <div class="form-group">
                                <label for="achievement-description">成就描述</label>
                                <textarea id="achievement-description" placeholder="例如：团队成员达到指定人数"></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="achievement-target">目标值 *</label>
                                    <input type="number" id="achievement-target" required min="1" placeholder="例如：10">
                                </div>
                                
                                <div class="form-group">
                                    <label for="achievement-reward">奖励金额(USDT) *</label>
                                    <input type="number" id="achievement-reward" required min="0" step="0.01" placeholder="例如：5.00">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="achievement-icon">图标</label>
                                    <input type="text" id="achievement-icon" placeholder="例如：users, trophy, star">
                                </div>
                                
                                <div class="form-group">
                                    <label for="achievement-color">颜色</label>
                                    <input type="color" id="achievement-color" value="#FFD700">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="achievement-sort">排序</label>
                                <input type="number" id="achievement-sort" min="0" value="0">
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="achievement-active" checked>
                                    <span>启用成就</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-btn">取消</button>
                        <button class="btn btn-primary" id="save-btn">保存</button>
                    </div>
                </div>
            </div>

            <!-- 确认删除模态框 -->
            <div class="modal" id="delete-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>确认删除</h3>
                        <button class="close-btn" id="close-delete-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>确定要删除成就 "<span id="delete-achievement-name"></span>" 吗？</p>
                        <p class="warning">⚠️ 删除后无法恢复，如果已有用户获得此成就，将无法删除。</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-delete-btn">取消</button>
                        <button class="btn btn-danger" id="confirm-delete-btn">确认删除</button>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.loadAchievementTypes();
        this.loadAchievements();
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 添加成就按钮
        const addBtn = document.getElementById('add-achievement-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // 筛选器
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // 搜索
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.applyFilters());
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }

        // 模态框关闭
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModal());
        }

        const closeDeleteModal = document.getElementById('close-delete-modal');
        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => this.hideDeleteModal());
        }

        // 保存按钮
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAchievement());
        }

        // 取消按钮
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        }

        // 确认删除按钮
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
    }

    /**
     * 加载成就类型
     */
    async loadAchievementTypes() {
        try {
            const result = await adminApi.getAchievementTypes();
            
            if (result.success) {
                // 确保achievementTypes是数组
                this.achievementTypes = result.data || [];
                console.log('📊 加载成就类型数据:', this.achievementTypes);
                this.populateTypeFilters();
                this.populateTypeSelect();
            } else {
                // 如果API返回失败，初始化为空数组
                this.achievementTypes = [];
                console.warn('成就类型API返回失败，使用空数组');
            }
        } catch (error) {
            console.error('加载成就类型失败:', error);
            // 确保achievementTypes是数组
            this.achievementTypes = [];
            if (this.app.showToast) {
                this.app.showToast('加载成就类型失败: ' + error.message, 'error');
            } else {
                console.error('showToast方法不存在');
            }
        }
    }

    /**
     * 加载成就列表
     */
    async loadAchievements() {
        try {
            const result = await adminApi.getAchievements();
            
            if (result.success) {
                // 确保achievements是数组
                this.achievements = result.data.achievements || result.data || [];
                console.log('📊 加载成就数据:', this.achievements);
                this.renderAchievements();
                this.updateStats();
            }
        } catch (error) {
            console.error('加载成就失败:', error);
            // 确保achievements是数组
            this.achievements = [];
            if (this.app.showToast) {
                this.app.showToast('加载成就失败: ' + error.message, 'error');
            } else {
                console.error('showToast方法不存在');
            }
        }
    }

    /**
     * 填充类型筛选器
     */
    populateTypeFilters() {
        const typeFilter = document.getElementById('type-filter');
        if (!typeFilter) return;

        const options = this.achievementTypes.map(type => 
            `<option value="${type.code}">${type.name}</option>`
        ).join('');

        typeFilter.innerHTML = '<option value="all">全部类型</option>' + options;
    }

    /**
     * 填充类型选择
     */
    populateTypeSelect() {
        const typeSelect = document.getElementById('achievement-type');
        if (!typeSelect) return;

        const options = this.achievementTypes.map(type => 
            `<option value="${type.id}">${type.name}</option>`
        ).join('');

        typeSelect.innerHTML = '<option value="">请选择成就类型</option>' + options;
    }

    /**
     * 渲染成就列表
     */
    renderAchievements() {
        const tbody = document.getElementById('achievements-tbody');
        if (!tbody) return;

        if (!this.achievements || this.achievements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="no-data">暂无成就数据</td></tr>';
            return;
        }

        const rows = this.achievements.map(achievement => this.renderAchievementRow(achievement)).join('');
        tbody.innerHTML = rows;

        // 绑定行内操作按钮事件
        this.bindRowEvents();
    }

    /**
     * 渲染成就行
     */
    renderAchievementRow(achievement) {
        const statusClass = achievement.is_active ? 'status-active' : 'status-inactive';
        const statusText = achievement.is_active ? '启用' : '禁用';
        
        return `
            <tr data-achievement-id="${achievement.id}">
                <td>${achievement.id}</td>
                <td>${achievement.type_name}</td>
                <td>${achievement.name}</td>
                <td>${achievement.description || '-'}</td>
                <td>${achievement.target_value}</td>
                <td>${achievement.reward_amount} USDT</td>
                <td>
                    <i class="fas fa-${achievement.icon}" style="color: ${achievement.color}"></i>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>${achievement.sort_order}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary edit-btn" data-achievement-id="${achievement.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning toggle-btn" data-achievement-id="${achievement.id}">
                            <i class="fas fa-${achievement.is_active ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-achievement-id="${achievement.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 绑定行内事件
     */
    bindRowEvents() {
        // 编辑按钮
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = btn.getAttribute('data-achievement-id');
                this.showEditModal(achievementId);
            });
        });

        // 切换状态按钮
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = btn.getAttribute('data-achievement-id');
                this.toggleAchievement(achievementId);
            });
        });

        // 删除按钮
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = btn.getAttribute('data-achievement-id');
                this.showDeleteModal(achievementId);
            });
        });
    }

    /**
     * 应用筛选器
     */
    applyFilters() {
        const typeFilter = document.getElementById('type-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const searchTerm = document.getElementById('search-input')?.value || '';

        const filteredAchievements = this.achievements.filter(achievement => {
            // 类型筛选
            if (typeFilter !== 'all' && achievement.type_code !== typeFilter) {
                return false;
            }

            // 状态筛选
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                if (achievement.is_active !== isActive) {
                    return false;
                }
            }

            // 搜索筛选
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return achievement.name.toLowerCase().includes(searchLower) ||
                       achievement.description.toLowerCase().includes(searchLower);
            }

            return true;
        });

        this.renderFilteredAchievements(filteredAchievements);
    }

    /**
     * 渲染筛选后的成就
     */
    renderFilteredAchievements(filteredAchievements) {
        const tbody = document.getElementById('achievements-tbody');
        if (!tbody) return;

        if (filteredAchievements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="no-data">没有找到匹配的成就</td></tr>';
            return;
        }

        const rows = filteredAchievements.map(achievement => this.renderAchievementRow(achievement)).join('');
        tbody.innerHTML = rows;
        this.bindRowEvents();
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (!this.achievements) return;

        const totalAchievements = this.achievements.length;
        const activeAchievements = this.achievements.filter(a => a.is_active).length;
        const totalRewards = this.achievements.reduce((sum, a) => sum + parseFloat(a.reward_amount), 0);
        const completedUsers = this.achievements.reduce((sum, a) => sum + (a.completed_users || 0), 0);

        // 更新统计显示
        const totalEl = document.getElementById('total-achievements');
        const activeEl = document.getElementById('active-achievements');
        const rewardsEl = document.getElementById('total-rewards');
        const usersEl = document.getElementById('completed-users');

        if (totalEl) totalEl.textContent = totalAchievements;
        if (activeEl) activeEl.textContent = activeAchievements;
        if (rewardsEl) rewardsEl.textContent = totalRewards.toFixed(2) + ' USDT';
        if (usersEl) usersEl.textContent = completedUsers;
    }

    /**
     * 显示添加模态框
     */
    showAddModal() {
        this.currentAchievementId = null;
        document.getElementById('modal-title').textContent = '添加成就';
        document.getElementById('achievement-form').reset();
        document.getElementById('achievement-color').value = '#FFD700';
        document.getElementById('achievement-sort').value = '0';
        document.getElementById('achievement-active').checked = true;
        
        document.getElementById('achievement-modal').style.display = 'flex';
    }

    /**
     * 显示编辑模态框
     */
    showEditModal(achievementId) {
        const achievement = this.achievements.find(a => a.id == achievementId);
        if (!achievement) return;

        this.currentAchievementId = achievementId;
        document.getElementById('modal-title').textContent = '编辑成就';
        
        // 填充表单
        document.getElementById('achievement-type').value = achievement.type_id;
        document.getElementById('achievement-name').value = achievement.name;
        document.getElementById('achievement-description').value = achievement.description || '';
        document.getElementById('achievement-target').value = achievement.target_value;
        document.getElementById('achievement-reward').value = achievement.reward_amount;
        document.getElementById('achievement-icon').value = achievement.icon;
        document.getElementById('achievement-color').value = achievement.color;
        document.getElementById('achievement-sort').value = achievement.sort_order;
        document.getElementById('achievement-active').checked = achievement.is_active;
        
        document.getElementById('achievement-modal').style.display = 'flex';
    }

    /**
     * 隐藏模态框
     */
    hideModal() {
        document.getElementById('achievement-modal').style.display = 'none';
    }

    /**
     * 显示删除确认模态框
     */
    showDeleteModal(achievementId) {
        const achievement = this.achievements.find(a => a.id == achievementId);
        if (!achievement) return;

        this.currentAchievementId = achievementId;
        document.getElementById('delete-achievement-name').textContent = achievement.name;
        document.getElementById('delete-modal').style.display = 'flex';
    }

    /**
     * 隐藏删除模态框
     */
    hideDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
    }

    /**
     * 保存成就
     */
    async saveAchievement() {
        const form = document.getElementById('achievement-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = {
            type_id: document.getElementById('achievement-type').value,
            name: document.getElementById('achievement-name').value,
            description: document.getElementById('achievement-description').value,
            target_value: parseInt(document.getElementById('achievement-target').value),
            reward_amount: parseFloat(document.getElementById('achievement-reward').value),
            icon: document.getElementById('achievement-icon').value || 'trophy',
            color: document.getElementById('achievement-color').value,
            sort_order: parseInt(document.getElementById('achievement-sort').value) || 0,
            is_active: document.getElementById('achievement-active').checked
        };

        try {
            let result;
            
            if (this.currentAchievementId) {
                // 更新现有成就
                result = await adminApi.updateAchievement(this.currentAchievementId, formData);
            } else {
                // 创建新成就
                result = await adminApi.createAchievement(formData);
            }
            
            if (result.success) {
                this.app.showToast('成就保存成功', 'success');
                this.hideModal();
                this.loadAchievements();
            } else {
                throw new Error(result.error || '保存成就失败');
            }
        } catch (error) {
            console.error('保存成就失败:', error);
            this.app.showToast('保存成就失败: ' + error.message, 'error');
        }
    }

    /**
     * 切换成就状态
     */
    async toggleAchievement(achievementId) {
        try {
            const result = await adminApi.toggleAchievement(achievementId);
            
            if (result.success) {
                this.app.showToast('成就状态切换成功', 'success');
                this.loadAchievements();
            } else {
                throw new Error(result.error || '切换成就状态失败');
            }
        } catch (error) {
            console.error('切换成就状态失败', error);
            this.app.showToast('切换成就状态失败 ' + error.message, 'error');
        }
    }

    /**
     * 确认删除成就
     */
    async confirmDelete() {
        if (!this.currentAchievementId) return;

        try {
            const result = await adminApi.deleteAchievement(this.currentAchievementId);
            
            if (result.success) {
                this.app.showToast('成就删除成功', 'success');
                this.hideDeleteModal();
                this.loadAchievements();
            } else {
                throw new Error(result.error || '删除成就失败');
            }
        } catch (error) {
            console.error('删除成就失败:', error);
            this.app.showToast('删除成就失败: ' + error.message, 'error');
        }
    }
}

export default AchievementManagement;
