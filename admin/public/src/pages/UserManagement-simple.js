// 简化版用户管理模块 - 不依赖复杂的依赖�?
class UserManagement {
    constructor(app) {
        this.app = app;
        this.users = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.totalUsers = 0;
        this.searchTerm = '';
        this.statusFilter = '';
        this.isLoading = false;
    }

    render() {
        return `
            <div class="user-management-page">
                <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">
                    <i class="fas fa-users" style="margin-right: 10px;"></i>用户管理
                </h1>
                
                <!-- 搜索和筛选工具栏 -->
                <div class="toolbar" style="margin-bottom: 2rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <div class="search-box" style="flex: 1; min-width: 200px;">
                            <input type="text" id="searchInput" placeholder="搜索用户名或邮箱..." 
                                   style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                        </div>
                        
                        <div class="status-filter">
                            <select id="statusFilter" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                                <option value="">所有状�?/option>
                                <option value="active">活跃</option>
                                <option value="inactive">非活�?/option>
                            </select>
                        </div>
                        
                        <button id="searchBtn" class="btn btn-primary" style="padding: 0.5rem 1rem;">
                            <i class="fas fa-search" style="margin-right: 5px;"></i>搜索
                        </button>
                        
                        <button id="refreshBtn" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                            <i class="fas fa-sync-alt" style="margin-right: 5px;"></i>刷新
                        </button>
                    </div>
                </div>
                
                <!-- 用户统计 -->
                <div class="stats" style="margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #4cc9f0, #4895ef); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;" id="totalUsersCount">-</div>
                        <div style="font-size: 1rem;">总用户数</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;" id="activeUsersCount">-</div>
                        <div style="font-size: 1rem;">活跃用户</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;" id="newUsersCount">-</div>
                        <div style="font-size: 1rem;">本月新增</div>
                    </div>
                </div>
                
                <!-- 用户列表 -->
                <div class="user-list" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    <div class="table-header" style="padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                        <h3 style="margin: 0; color: #495057;">用户列表</h3>
                    </div>
                    
                    <div class="table-container" style="overflow-x: auto;">
                        <table class="table" style="width: 100%; margin: 0;">
                            <thead style="background: #f8f9fa;">
                                <tr>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">用户ID</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">用户�?/th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">邮箱</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">状�?/th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">钱包地址</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">余额</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">注册时间</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #dee2e6;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="userTableBody">
                                <tr>
                                    <td colspan="8" style="padding: 2rem; text-align: center; color: #6c757d;">
                                        <div id="loadingMessage">加载�?..</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 分页 -->
                    <div class="pagination" style="padding: 1rem; background: #f8f9fa; border-top: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
                        <div class="pagination-info">
                            显示�?<span id="currentPageInfo">1</span> 页，�?<span id="totalPagesInfo">1</span> 页，
                            总计 <span id="totalUsersInfo">0</span> 个用�?
                        </div>
                        
                        <div class="pagination-controls">
                            <button id="prevPage" class="btn btn-sm btn-outline-secondary" disabled>上一�?/button>
                            <span style="margin: 0 1rem;">�?${this.currentPage} �?/span>
                            <button id="nextPage" class="btn btn-sm btn-outline-secondary" disabled>下一�?/button>
                        </div>
                    </div>
                </div>
                
                <!-- 用户详情模态框 -->
                <div id="userModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
                    <div class="modal-content" style="position: relative; background: white; margin: 5% auto; padding: 2rem; width: 90%; max-width: 600px; border-radius: 8px;">
                        <span class="close" onclick="closeUserModal()" style="position: absolute; right: 1rem; top: 1rem; font-size: 1.5rem; cursor: pointer;">&times;</span>
                        <h2 id="modalTitle">用户详情</h2>
                        <div id="modalContent">
                            <!-- 用户详情内容 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 初始化方�?
    afterRender() {
        console.log('�?UserManagement 简化版初始化完�?);
        this.setupEventListeners();
        this.loadUsers();
    }

    // 设置事件监听�?
    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUsers());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }

    // 加载用户数据
    async loadUsers() {
        try {
            this.isLoading = true;
            this.updateLoadingState(true);
            
            // 模拟API调用
            const mockUsers = [
                {
                    id: 1,
                    username: 'testuser1',
                    email: 'test1@example.com',
                    status: 'active',
                    wallet_address: '0x1234...5678',
                    balance: '100.00',
                    created_at: '2025-01-01'
                },
                {
                    id: 2,
                    username: 'testuser2',
                    email: 'test2@example.com',
                    status: 'inactive',
                    wallet_address: '0x8765...4321',
                    balance: '50.00',
                    created_at: '2025-01-02'
                }
            ];

            this.users = mockUsers;
            this.totalUsers = mockUsers.length;
            this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
            
            this.renderUsers();
            this.updateStats();
            
        } catch (error) {
            console.error('加载用户失败:', error);
            this.showError('加载用户失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.updateLoadingState(false);
        }
    }

    // 渲染用户列表
    renderUsers() {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 2rem; text-align: center; color: #6c757d;">
                        暂无用户数据
                    </td>
                </tr>
            `;
            return;
        }

        const html = this.users.map(user => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;">${user.id}</td>
                <td style="padding: 1rem;">${user.username}</td>
                <td style="padding: 1rem;">${user.email}</td>
                <td style="padding: 1rem;">
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: ${user.status === 'active' ? '#28a745' : '#dc3545'}; color: white;">
                        ${user.status === 'active' ? '活跃' : '非活�?}
                    </span>
                </td>
                <td style="padding: 1rem; font-family: monospace; font-size: 0.9rem;">${user.wallet_address}</td>
                <td style="padding: 1rem; font-weight: 500;">${user.balance} USDT</td>
                <td style="padding: 1rem; font-size: 0.9rem;">${user.created_at}</td>
                <td style="padding: 1rem;">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${user.id})">查看</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editUser(${user.id})">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">删除</button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    // 更新统计信息
    updateStats() {
        const totalUsersEl = document.getElementById('totalUsersCount');
        const activeUsersEl = document.getElementById('activeUsersCount');
        const newUsersEl = document.getElementById('newUsersCount');

        if (totalUsersEl) totalUsersEl.textContent = this.totalUsers;
        if (activeUsersEl) activeUsersEl.textContent = this.users.filter(u => u.status === 'active').length;
        if (newUsersEl) newUsersEl.textContent = this.users.filter(u => u.created_at.includes('2025-01')).length;
    }

    // 更新加载状�?
    updateLoadingState(loading) {
        const loadingEl = document.getElementById('loadingMessage');
        if (loadingEl) {
            loadingEl.textContent = loading ? '加载�?..' : '暂无数据';
        }
    }

    // 执行搜索
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.searchTerm = searchInput.value.trim();
            console.log('执行搜索:', this.searchTerm);
            // 这里可以实现实际的搜索逻辑
        }
    }

    // 显示错误信息
    showError(message) {
        console.error('UserManagement Error:', message);
        // 可以在这里实现错误提示UI
    }
}

// 导出模块
export default UserManagement;
