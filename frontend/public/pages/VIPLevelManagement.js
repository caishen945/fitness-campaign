class VIPLevelManagement {
    constructor(app) {
        this.app = app;
        this.levels = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.isLoading = false;
    }

    render() {
        return `
            <div class="page-container">
                <div class="page-header">
                    <h1>VIP等级管理</h1>
                    <p>管理系统中的VIP等级配置，包括押金、奖励、目标步数等参数</p>
                </div>

                <!-- 操作栏 -->
                <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div class="left-actions">
                        <button class="ios-button ios-button-primary" data-action="create-level">
                            <span style="font-size: 20px;">➕</span>
                            创建新等级
                        </button>
                        <button class="ios-button ios-button-secondary" data-action="refresh-levels">
                            <span style="font-size: 20px;">🔄</span>
                            刷新
                        </button>
                    </div>
                    <div class="right-actions">
                        <button class="ios-button ios-button-success" data-action="batch-enable" style="display: none;">
                            <span style="font-size: 20px;">✅</span>
                            批量启用
                        </button>
                        <button class="ios-button ios-button-warning" data-action="batch-disable" style="display: none;">
                            <span style="font-size: 20px;">❌</span>
                            批量禁用
                        </button>
                    </div>
                </div>

                <!-- 等级列表 -->
                <div class="levels-container">
                    <div class="loading-overlay" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                    
                    <div class="levels-grid" id="levels-grid">
                        <!-- 等级卡片将在这里动态生成 -->
                    </div>

                    <!-- 空状态 -->
                    <div class="empty-state" style="display: none; text-align: center; padding: 4rem 2rem;">
                        <div style="font-size: 64px; margin-bottom: 1rem;">🏆</div>
                        <h3>暂无VIP等级</h3>
                        <p>点击"创建新等级"按钮来添加第一个VIP等级</p>
                    </div>
                </div>

                <!-- 创建/编辑等级模态框 -->
                <div class="modal-overlay" id="level-modal" style="display: none;">
                    <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                        <div class="modal-header">
                            <h2 id="modal-title">创建VIP等级</h2>
                            <button class="modal-close" data-action="close-modal">✕</button>
                        </div>
                        <div class="modal-body">
                            <form id="level-form">
                                <div class="form-group">
                                    <label for="level-name">等级名称 *</label>
                                    <input type="text" id="level-name" name="name" required placeholder="例如：青铜挑战">
                                </div>
                                
                                <div class="form-group">
                                    <label for="level-description">等级描述</label>
                                    <textarea id="level-description" name="description" rows="3" placeholder="描述这个等级的特点和适用人群"></textarea>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="level-deposit">押金金额 (USDT) *</label>
                                        <input type="number" id="level-deposit" name="depositAmount" step="0.01" min="0" required placeholder="500.00">
                                    </div>
                                    <div class="form-group">
                                        <label for="level-reward">奖励金额 (USDT) *</label>
                                        <input type="number" id="level-reward" name="rewardAmount" step="0.01" min="0" required placeholder="0.50">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="level-steps">目标步数 *</label>
                                        <input type="number" id="level-steps" name="stepTarget" min="1" required placeholder="1000">
                                    </div>
                                    <div class="form-group">
                                        <label for="level-duration">持续时间 (天) *</label>
                                        <input type="number" id="level-duration" name="duration" min="1" required placeholder="1" value="1">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="level-icon">等级图标</label>
                                        <input type="text" id="level-icon" name="icon" placeholder="🥉" value="🏆">
                                    </div>
                                    <div class="form-group">
                                        <label for="level-color">等级颜色</label>
                                        <input type="color" id="level-color" name="color" value="#FFD700">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="level-deduct-ratio">取消扣除比例</label>
                                        <input type="number" id="level-deduct-ratio" name="cancelDeductRatio" step="0.01" min="0" max="1" placeholder="0.05" value="0.05">
                                    </div>
                                    <div class="form-group">
                                        <label for="level-reward-ratio">取消奖励比例</label>
                                        <input type="number" id="level-reward-ratio" name="cancelRewardRatio" step="0.01" min="0" max="1" placeholder="0.02" value="0.02">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="level-max-challenges">每日挑战次数限制</label>
                                    <input type="number" id="level-max-challenges" name="maxChallenges" min="-1" placeholder="-1 (无限制)" value="-1">
                                    <small>输入 -1 表示无限制</small>
                                </div>

                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="level-active" name="isActive" checked>
                                        <span class="checkmark"></span>
                                        启用此等级
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="ios-button ios-button-secondary" data-action="close-modal">取消</button>
                            <button class="ios-button ios-button-primary" data-action="save-level">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 确认删除模态框 -->
                <div class="modal-overlay" id="delete-modal" style="display: none;">
                    <div class="modal-content" style="max-width: 400px;">
                        <div class="modal-header">
                            <h3>确认删除</h3>
                            <button class="modal-close" data-action="close-delete-modal">✕</button>
                        </div>
                        <div class="modal-body">
                            <p>确定要删除这个VIP等级吗？此操作不可撤销。</p>
                            <p><strong>等级名称：</strong><span id="delete-level-name"></span></p>
                        </div>
                        <div class="modal-footer">
                            <button class="ios-button ios-button-secondary" data-action="close-delete-modal">取消</button>
                            <button class="ios-button ios-button-danger" data-action="confirm-delete">确认删除</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
        this.loadLevels();
    }

    bindEvents() {
        // 创建新等级
        document.querySelector('[data-action="create-level"]').addEventListener('click', () => {
            this.showCreateModal();
        });

        // 刷新列表
        document.querySelector('[data-action="refresh-levels"]').addEventListener('click', () => {
            this.loadLevels();
        });

        // 批量操作
        document.querySelector('[data-action="batch-enable"]').addEventListener('click', () => {
            this.batchUpdateStatus(true);
        });

        document.querySelector('[data-action="batch-disable"]').addEventListener('click', () => {
            this.batchUpdateStatus(false);
        });

        // 模态框事件
        document.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('[data-action="save-level"]').addEventListener('click', () => {
            this.saveLevel();
        });

        // 删除模态框事件
        document.querySelector('[data-action="close-delete-modal"]').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.querySelector('[data-action="confirm-delete"]').addEventListener('click', () => {
            this.confirmDelete();
        });

        // 点击模态框背景关闭
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal();
                    this.hideDeleteModal();
                }
            });
        });
    }

    async loadLevels() {
        this.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch('/api/admin/vip-levels', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取VIP等级列表失败');
            }

            const result = await response.json();
            this.levels = result.data;
            this.renderLevels();
        } catch (error) {
            console.error('加载VIP等级失败:', error);
            this.app.showToast('加载VIP等级失败: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderLevels() {
        const grid = document.getElementById('levels-grid');
        const emptyState = document.querySelector('.empty-state');

        if (this.levels.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = this.levels.map(level => `
            <div class="level-card ${level.isActive ? 'active' : 'inactive'}" data-level-id="${level.id}">
                <div class="level-header">
                    <div class="level-icon" style="background: ${level.color}20; color: ${level.color};">
                        ${level.icon}
                    </div>
                    <div class="level-info">
                        <h3>${level.name}</h3>
                        <p>${level.description || '暂无描述'}</p>
                    </div>
                    <div class="level-status">
                        <span class="status-badge ${level.isActive ? 'active' : 'inactive'}">
                            ${level.isActive ? '启用' : '禁用'}
                        </span>
                    </div>
                </div>
                
                <div class="level-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="label">押金金额</span>
                            <span class="value">${level.depositAmount} USDT</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">奖励金额</span>
                            <span class="value">${level.rewardAmount} USDT</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="label">目标步数</span>
                            <span class="value">${level.stepTarget.toLocaleString()} 步</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">持续时间</span>
                            <span class="value">${level.duration} 天</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="label">取消扣除</span>
                            <span class="value">${(level.cancelDeductRatio * 100).toFixed(1)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">取消奖励</span>
                            <span class="value">${(level.cancelRewardRatio * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div class="level-actions">
                    <button class="ios-button ios-button-small ios-button-primary" data-action="edit-level" data-level-id="${level.id}">
                        编辑
                    </button>
                    <button class="ios-button ios-button-small ${level.isActive ? 'ios-button-warning' : 'ios-button-success'}" 
                            data-action="toggle-status" data-level-id="${level.id}">
                        ${level.isActive ? '禁用' : '启用'}
                    </button>
                    <button class="ios-button ios-button-small ios-button-danger" data-action="delete-level" data-level-id="${level.id}">
                        删除
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定等级卡片事件
        this.bindLevelCardEvents();
    }

    bindLevelCardEvents() {
        // 编辑等级
        document.querySelectorAll('[data-action="edit-level"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const levelId = e.target.dataset.levelId;
                this.showEditModal(levelId);
            });
        });

        // 切换状态
        document.querySelectorAll('[data-action="toggle-status"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const levelId = e.target.dataset.levelId;
                this.toggleLevelStatus(levelId);
            });
        });

        // 删除等级
        document.querySelectorAll('[data-action="delete-level"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const levelId = e.target.dataset.levelId;
                this.showDeleteModal(levelId);
            });
        });
    }

    showCreateModal() {
        document.getElementById('modal-title').textContent = '创建VIP等级';
        document.getElementById('level-form').reset();
        document.getElementById('level-modal').style.display = 'flex';
        this.currentEditingId = null;
    }

    showEditModal(levelId) {
        const level = this.levels.find(l => l.id == levelId);
        if (!level) return;

        document.getElementById('modal-title').textContent = '编辑VIP等级';
        this.fillFormWithLevel(level);
        document.getElementById('level-modal').style.display = 'flex';
        this.currentEditingId = levelId;
    }

    fillFormWithLevel(level) {
        document.getElementById('level-name').value = level.name;
        document.getElementById('level-description').value = level.description || '';
        document.getElementById('level-deposit').value = level.depositAmount;
        document.getElementById('level-reward').value = level.rewardAmount;
        document.getElementById('level-steps').value = level.stepTarget;
        document.getElementById('level-duration').value = level.duration;
        document.getElementById('level-icon').value = level.icon;
        document.getElementById('level-color').value = level.color;
        document.getElementById('level-deduct-ratio').value = level.cancelDeductRatio;
        document.getElementById('level-reward-ratio').value = level.cancelRewardRatio;
        document.getElementById('level-max-challenges').value = level.maxChallenges;
        document.getElementById('level-active').checked = level.isActive;
    }

    hideModal() {
        document.getElementById('level-modal').style.display = 'none';
    }

    async saveLevel() {
        const form = document.getElementById('level-form');
        const formData = new FormData(form);
        
        const levelData = {
            name: formData.get('name'),
            description: formData.get('description'),
            depositAmount: parseFloat(formData.get('depositAmount')),
            rewardAmount: parseFloat(formData.get('rewardAmount')),
            stepTarget: parseInt(formData.get('stepTarget')),
            duration: parseInt(formData.get('duration')),
            icon: formData.get('icon'),
            color: formData.get('color'),
            cancelDeductRatio: parseFloat(formData.get('cancelDeductRatio')),
            cancelRewardRatio: parseFloat(formData.get('cancelRewardRatio')),
            maxChallenges: parseInt(formData.get('maxChallenges')),
            isActive: formData.get('isActive') === 'on'
        };

        try {
            const url = this.currentEditingId 
                ? `/api/admin/vip-levels/${this.currentEditingId}`
                : '/api/admin/vip-levels';
            
            const method = this.currentEditingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(levelData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '保存失败');
            }

            this.app.showToast(
                this.currentEditingId ? 'VIP等级更新成功' : 'VIP等级创建成功', 
                'success'
            );
            
            this.hideModal();
            this.loadLevels();
        } catch (error) {
            console.error('保存VIP等级失败:', error);
            this.app.showToast('保存失败: ' + error.message, 'error');
        }
    }

    async toggleLevelStatus(levelId) {
        const level = this.levels.find(l => l.id == levelId);
        if (!level) return;

        try {
            const response = await fetch(`/api/admin/vip-levels/${levelId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isActive: !level.isActive
                })
            });

            if (!response.ok) {
                throw new Error('状态更新失败');
            }

            this.app.showToast(
                level.isActive ? 'VIP等级已禁用' : 'VIP等级已启用', 
                'success'
            );
            
            this.loadLevels();
        } catch (error) {
            console.error('切换状态失败:', error);
            this.app.showToast('状态更新失败: ' + error.message, 'error');
        }
    }

    showDeleteModal(levelId) {
        const level = this.levels.find(l => l.id == levelId);
        if (!level) return;

        document.getElementById('delete-level-name').textContent = level.name;
        document.getElementById('delete-modal').style.display = 'flex';
        this.currentDeletingId = levelId;
    }

    hideDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
    }

    async confirmDelete() {
        if (!this.currentDeletingId) return;

        try {
            const response = await fetch(`/api/admin/vip-levels/${this.currentDeletingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            this.app.showToast('VIP等级删除成功', 'success');
            this.hideDeleteModal();
            this.loadLevels();
        } catch (error) {
            console.error('删除VIP等级失败:', error);
            this.app.showToast('删除失败: ' + error.message, 'error');
        }
    }

    async batchUpdateStatus(isActive) {
        const selectedLevels = this.levels.filter(level => 
            document.querySelector(`[data-level-id="${level.id}"] .level-checkbox:checked`)
        );

        if (selectedLevels.length === 0) {
            this.app.showToast('请选择要操作的等级', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/admin/vip-levels/batch-status', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    levelIds: selectedLevels.map(l => l.id),
                    isActive: isActive
                })
            });

            if (!response.ok) {
                throw new Error('批量操作失败');
            }

            this.app.showToast(
                `已${isActive ? '启用' : '禁用'} ${selectedLevels.length} 个等级`, 
                'success'
            );
            
            this.loadLevels();
        } catch (error) {
            console.error('批量操作失败:', error);
            this.app.showToast('批量操作失败: ' + error.message, 'error');
        }
    }

    showLoading() {
        document.querySelector('.loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.querySelector('.loading-overlay').style.display = 'none';
    }
}

export default VIPLevelManagement;
