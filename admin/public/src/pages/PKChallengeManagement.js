import adminApi from '../services/adminApi.js';
import texts from '../shared/ui/texts.js';
import { getBadgeClass, getStatusText } from '../shared/mappings/statusMaps.js';

class PKChallengeManagement {
    constructor(app) {
        this.app = app;
        this.challenges = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.limit = 10;
        this.filters = {
            status: '',
            userId: ''
        };
    }

    render() {
        return `
            <div class="pk-challenge-management">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h4>PK挑战管理</h4>
                                </div>
                                <div class="card-body">
                                    <!-- 过滤器 -->
                                    <div class="filters mb-4">
                                        <div class="row">
                                            <div class="col-md-3 mb-2">
                                                <select id="statusFilter" class="form-control">
                                                    <option value="">所有状态</option>
                                                    <option value="pending">待接收</option>
                                                    <option value="accepted">进行中</option>
                                                    <option value="completed">已完成</option>
                                                    <option value="rejected">已拒绝</option>
                                                    <option value="cancelled">已取消</option>
                                                </select>
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <input type="text" id="userIdFilter" class="form-control" placeholder="用户ID">
                                            </div>
                                            <div class="col-md-2 mb-2">
                                                <button id="applyFilters" class="btn btn-primary">应用过滤</button>
                                            </div>
                                            <div class="col-md-2 mb-2">
                                                <button id="resetFilters" class="btn btn-secondary">重置</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 挑战列表 -->
                                    <div class="table-responsive">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>状态</th>
                                                    <th>挑战者</th>
                                                    <th>对手</th>
                                                    <th>押金</th>
                                                    <th>步数目标</th>
                                                    <th>开始时间</th>
                                                    <th>结束时间</th>
                                                    <th>创建时间</th>
                                                    <th>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody id="challengesTableBody">
                                                <tr>
                                                    <td colspan="10" class="text-center">加载中...</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- 分页 -->
                                    <div class="pagination-container mt-4 d-flex justify-content-between align-items-center">
                                        <div class="page-info">
                                            显示 <span id="pageInfo">0-0</span> 条，共 <span id="totalItems">0</span> 条
                                        </div>
                                        <nav>
                                            <ul class="pagination" id="pagination">
                                                <!-- 分页将通过JavaScript动态生成 -->
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 用户PK权限管理 -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h4>用户PK权限管理</h4>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <input type="text" id="userIdInput" class="form-control" placeholder="用户ID">
                                        </div>
                                        <div class="col-md-4">
                                            <select id="pkEnabledSelect" class="form-control">
                                                <option value="1">启用PK功能</option>
                                                <option value="0">禁用PK功能</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <button id="updatePkPermission" class="btn btn-primary">更新权限</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 挑战详情模态框 -->
            <div class="modal fade" id="challengeDetailsModal" tabindex="-1" role="dialog" aria-labelledby="challengeDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="challengeDetailsModalLabel">挑战详情</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="challengeDetailsContent">
                            加载中...
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 结算挑战模态框 -->
            <div class="modal fade" id="settleChallengeModal" tabindex="-1" role="dialog" aria-labelledby="settleChallengeModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="settleChallengeModalLabel">结算挑战</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="settleChallengeId">
                            <div class="form-group">
                                <label>选择获胜者</label>
                                <select id="winnerSelect" class="form-control">
                                    <option value="">平局（退还双方押金）</option>
                                    <!-- 挑战者和对手选项将通过JavaScript动态添加 -->
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="confirmSettleBtn">确认结算</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        try {
            // 先检查app是否存在
            if (!this.app && window.adminApp) {
                this.app = window.adminApp;
            }
            
            if (!this.app) {
                console.error('应用实例不存在');
                return;
            }
            
            // 检查getToken方法是否存在
            if (typeof this.app.getToken !== 'function') {
                console.error('getToken方法不存在');
                this.token = localStorage.getItem('adminToken');
            } else {
                this.token = this.app.getToken();
            }
            
            if (!this.token) {
                console.warn('未找到登录令牌');
                this.showLoginRequired();
                return;
            }

            this.bindEvents();
            await this.loadChallenges();
        } catch (error) {
            console.error('PK挑战管理初始化错误:', error);
        }
    }

    showLoginRequired() {
        const container = document.querySelector('.pk-challenge-management');
        if (container) {
            container.innerHTML = `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h4>需要登录</h4>
                                </div>
                                <div class="card-body">
                                    <div class="alert alert-warning">
                                        <p>您需要先登录才能访问PK挑战管理功能。</p>
                                        <p>请使用管理员账号登录系统。</p>
                                    </div>
                                    <button id="goToLoginBtn" class="btn btn-primary">前往登录</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 绑定前往登录按钮事件
            const goToLoginBtn = document.getElementById('goToLoginBtn');
            if (goToLoginBtn) {
                goToLoginBtn.addEventListener('click', () => {
                    if (this.app && typeof this.app.navigate === 'function') {
                        this.app.navigate('login');
                    }
                });
            }
        }
    }

    bindEvents() {
        // 过滤器事件
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.filters.status = document.getElementById('statusFilter').value;
            this.filters.userId = document.getElementById('userIdFilter').value;
            this.currentPage = 1;
            this.loadChallenges();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            document.getElementById('statusFilter').value = '';
            document.getElementById('userIdFilter').value = '';
            this.filters = { status: '', userId: '' };
            this.currentPage = 1;
            this.loadChallenges();
        });

        // 用户PK权限管理
        document.getElementById('updatePkPermission').addEventListener('click', () => {
            const userId = document.getElementById('userIdInput').value;
            const pkEnabled = document.getElementById('pkEnabledSelect').value === '1';
            
            if (!userId) {
                this.app.showToast('请输入用户ID', 'error');
                return;
            }
            
            this.updatePkPermission(userId, pkEnabled);
        });

        // 结算挑战确认按钮
        document.getElementById('confirmSettleBtn').addEventListener('click', async () => {
            const challengeId = document.getElementById('settleChallengeId').value;
            const winnerId = document.getElementById('winnerSelect').value;
            
            try {
                await this.settleChallenge(challengeId, winnerId);
                // 关闭模态框
                this.hideSettleChallengeModal();
            } catch (error) {
                console.error('结算挑战失败:', error);
            }
        });
    }

    bindActionButtons() {
        // 绑定查看按钮事件
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                this.showChallengeDetails(challengeId);
            });
        });

        // 绑定取消按钮事件
        document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const challengeId = btn.dataset.id;
                this.confirmCancelChallenge(challengeId);
            });
        });

        // 绑定结算按钮事件
        document.querySelectorAll('[data-action="settle"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                const challengerId = btn.dataset.challengerId;
                const opponentId = btn.dataset.opponentId;
                this.showSettleChallengeModal(challengeId, challengerId, opponentId);
            });
        });
    }

    async loadChallenges() {
        try {
            const params = new URLSearchParams();
            if (this.filters.status) params.append('status', this.filters.status);
            if (this.filters.userId) params.append('userId', this.filters.userId);
            params.append('page', this.currentPage);
            params.append('limit', this.limit);
            
            const response = await adminApi.getPkChallenges(params);
            
            if (response.success) {
                this.challenges = response.data.challenges;
                this.totalPages = response.data.pagination.pages;
                this.renderChallenges(response.data);
                this.renderPagination(response.data.pagination);
            } else {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(response.message || '加载挑战列表失败', 'error');
                } else {
                    console.error('加载挑战列表失败:', response.message);
                }
            }
        } catch (error) {
            console.error('加载挑战列表失败:', error);
            if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('加载挑战列表失败', 'error');
            }
        }
    }
    
    // 获取模拟数据
    getMockChallengeData() {
        return {
            challenges: [
                {
                    id: 1,
                    status: 'pending',
                    challenger: { id: 101, email: 'user1@example.com', name: '用户A' },
                    opponent: { id: 102, email: 'user2@example.com', name: '用户B' },
                    depositAmount: 50.0,
                    stepTarget: 10000,
                    startDate: '2025-08-15',
                    endDate: '2025-08-22',
                    createdAt: '2025-08-15T08:30:00Z'
                },
                {
                    id: 2,
                    status: 'accepted',
                    challenger: { id: 103, email: 'user3@example.com', name: '用户C' },
                    opponent: { id: 104, email: 'user4@example.com', name: '用户D' },
                    depositAmount: 100.0,
                    stepTarget: 15000,
                    startDate: '2025-08-14',
                    endDate: '2025-08-21',
                    createdAt: '2025-08-14T10:15:00Z'
                },
                {
                    id: 3,
                    status: 'completed',
                    challenger: { id: 105, email: 'user5@example.com', name: '用户E' },
                    opponent: { id: 106, email: 'user6@example.com', name: '用户F' },
                    depositAmount: 75.0,
                    stepTarget: 12000,
                    startDate: '2025-08-10',
                    endDate: '2025-08-17',
                    createdAt: '2025-08-10T09:45:00Z'
                },
                {
                    id: 4,
                    status: 'rejected',
                    challenger: { id: 107, email: 'user7@example.com', name: '用户G' },
                    opponent: { id: 108, email: 'user8@example.com', name: '用户H' },
                    depositAmount: 60.0,
                    stepTarget: 8000,
                    startDate: '2025-08-12',
                    endDate: '2025-08-19',
                    createdAt: '2025-08-12T14:20:00Z'
                },
                {
                    id: 5,
                    status: 'cancelled',
                    challenger: { id: 109, email: 'user9@example.com', name: '用户I' },
                    opponent: { id: 110, email: 'user10@example.com', name: '用户J' },
                    depositAmount: 120.0,
                    stepTarget: 20000,
                    startDate: '2025-08-11',
                    endDate: '2025-08-18',
                    createdAt: '2025-08-11T11:30:00Z'
                }
            ],
            pagination: {
                total: 5,
                page: 1,
                pages: 1,
                limit: 10
            }
        };
    }

    renderChallenges(data) {
        const tableBody = document.getElementById('challengesTableBody');
        if (!tableBody) return;

        // 更新分页信息
        if (data.pagination) {
            const total = data.pagination.total;
            document.getElementById('totalItems').textContent = total;
            
            const start = (this.currentPage - 1) * this.limit + 1;
            const end = Math.min(start + (data.challenges ? data.challenges.length : 0) - 1, total);
            document.getElementById('pageInfo').textContent = `${start}-${end}`;
        }

        if (!data.challenges || data.challenges.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted">
                        <div style="padding: 2rem;">
                            <i class="fas fa-inbox" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                            <p>${texts.common.empty}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // 渲染挑战列表
        tableBody.innerHTML = data.challenges.map(challenge => `
            <tr>
                <td>${challenge.id}</td>
                <td>
                    <span class="badge badge-${getBadgeClass(challenge.status)}">
                        ${getStatusText(challenge.status)}
                    </span>
                </td>
                <td>
                    <div>
                        <div><strong>${challenge.challengerName || challenge.challenger?.name || '未知'}</strong></div>
                        <small class="text-muted">${challenge.challengerEmail || challenge.challenger?.email || 'N/A'}</small>
                    </div>
                </td>
                <td>
                    <div>
                        <div><strong>${challenge.opponentName || challenge.opponent?.name || '未知'}</strong></div>
                        <small class="text-muted">${challenge.opponentEmail || challenge.opponent?.email || 'N/A'}</small>
                    </div>
                </td>
                <td>${(challenge.depositAmount || challenge.deposit || 0).toFixed(2)} USDT</td>
                <td>${challenge.stepTarget}</td>
                <td>${new Date(challenge.startDate).toLocaleDateString()}</td>
                <td>${new Date(challenge.endDate).toLocaleDateString()}</td>
                <td>${new Date(challenge.createdAt).toLocaleString()}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-info" data-id="${challenge.id}" data-action="view">
                            <i class="fas fa-eye"></i> 查看
                        </button>
                        ${challenge.status === 'pending' ? `
                            <button class="btn btn-sm btn-warning" data-id="${challenge.id}" data-action="cancel">
                                <i class="fas fa-times"></i> 取消
                            </button>
                        ` : ''}
                        ${challenge.status === 'accepted' ? `
                            <button class="btn btn-sm btn-success" data-id="${challenge.id}" data-action="settle"
                                data-challenger-id="${challenge.challenger?.id || challenge.challengerId || ''}"
                                data-opponent-id="${challenge.opponent?.id || challenge.opponentId || ''}">
                                <i class="fas fa-trophy"></i> 结算
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        // 绑定操作按钮事件
        this.bindActionButtons();
    }

    renderPagination(pagination) {
        const paginationElement = document.getElementById('pagination');
        const { page, pages } = pagination;
        
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // 页码按钮
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // 下一页按钮
        paginationHTML += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        
        paginationElement.innerHTML = paginationHTML;
        
        // 绑定分页事件
        paginationElement.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.parentElement.classList.contains('disabled')) return;
                
                const page = parseInt(link.dataset.page);
                this.currentPage = page;
                this.loadChallenges();
            });
        });
    }

    bindTableEvents() {
        // 查看挑战详情
        document.querySelectorAll('.view-challenge').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                this.showChallengeDetails(challengeId);
            });
        });
        
        // 取消挑战
        document.querySelectorAll('.cancel-challenge').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                this.confirmCancelChallenge(challengeId);
            });
        });
        
        // 结算挑战
        document.querySelectorAll('.settle-challenge').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                const challengerId = btn.dataset.challengerId;
                const challengerName = btn.dataset.challengerName;
                const opponentId = btn.dataset.opponentId;
                const opponentName = btn.dataset.opponentName;
                
                this.showSettleChallengeModal(challengeId, challengerId, challengerName, opponentId, opponentName);
            });
        });
    }

    showChallengeDetails(challengeId) {
        try {
            const challenge = this.challenges.find(c => c.id == challengeId);
            if (!challenge) {
                console.error('未找到挑战记录', challengeId);
                // 使用模拟数据作为备用
                const mockChallenge = this.getMockChallengeDetail(challengeId);
                if (mockChallenge) {
                    const content = this.buildChallengeDetailsContent(mockChallenge);
                    document.getElementById('challengeDetailsContent').innerHTML = content;
                    
                    const modal = document.getElementById('challengeDetailsModal');
                    if (modal) {
                        const bootstrapModal = new bootstrap.Modal(modal);
                        bootstrapModal.show();
                    }
                }
                return;
            }

            // 构建挑战详情内容
            const content = this.buildChallengeDetailsContent(challenge);
            document.getElementById('challengeDetailsContent').innerHTML = content;

            // 显示模态框
            const modal = document.getElementById('challengeDetailsModal');
            if (modal) {
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
            }
        } catch (error) {
            console.error('显示挑战详情失败:', error);
        }
    }

    hideChallengeDetails() {
        const modal = document.getElementById('challengeDetailsModal');
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }
    
    // 获取模拟挑战详情
    getMockChallengeDetail(challengeId) {
        // 根据挑战ID返回对应的模拟详情数据
        const mockChallenges = {
            1: {
                id: 1,
                status: 'pending',
                challenger: { 
                    id: 101, 
                    email: 'user1@example.com', 
                    name: '用户A',
                    steps: 5000
                },
                opponent: { 
                    id: 102, 
                    email: 'user2@example.com', 
                    name: '用户B',
                    steps: 0
                },
                depositAmount: 50.0,
                rewardAmount: 10.0,
                stepTarget: 10000,
                startDate: '2025-08-15',
                endDate: '2025-08-22',
                createdAt: '2025-08-15T08:30:00Z',
                history: [],
                messages: []
            },
            2: {
                id: 2,
                status: 'accepted',
                challenger: { 
                    id: 103, 
                    email: 'user3@example.com', 
                    name: '用户C',
                    steps: 8000
                },
                opponent: { 
                    id: 104, 
                    email: 'user4@example.com', 
                    name: '用户D',
                    steps: 7500
                },
                depositAmount: 100.0,
                rewardAmount: 20.0,
                stepTarget: 15000,
                startDate: '2025-08-14',
                endDate: '2025-08-21',
                createdAt: '2025-08-14T10:15:00Z',
                history: [
                    { userId: 103, email: 'userc@example.com', date: '2025-08-15', steps: 3000 },
                    { userId: 103, email: 'userc@example.com', date: '2025-08-16', steps: 5000 },
                    { userId: 104, email: 'userd@example.com', date: '2025-08-15', steps: 3500 },
                    { userId: 104, email: 'userd@example.com', date: '2025-08-16', steps: 4000 }
                ],
                messages: [
                    { senderId: 103, senderName: '用户C', message: '加油！我们一起达成目标！', createdAt: '2025-08-15T12:30:00Z' },
                    { senderId: 104, senderName: '用户D', message: '我也在努力中', createdAt: '2025-08-15T14:45:00Z' }
                ]
            },
            3: {
                id: 3,
                status: 'completed',
                challenger: { 
                    id: 105, 
                    email: 'user5@example.com', 
                    name: '用户E',
                    steps: 12500
                },
                opponent: { 
                    id: 106, 
                    email: 'user6@example.com', 
                    name: '用户F',
                    steps: 11800
                },
                depositAmount: 75.0,
                rewardAmount: 15.0,
                stepTarget: 12000,
                startDate: '2025-08-10',
                endDate: '2025-08-17',
                createdAt: '2025-08-10T09:45:00Z',
                winnerId: 105,
                winnerName: '用户E',
                history: [
                    { userId: 105, email: 'usere@example.com', date: '2025-08-11', steps: 4000 },
                    { userId: 105, email: 'usere@example.com', date: '2025-08-12', steps: 4500 },
                    { userId: 105, email: 'usere@example.com', date: '2025-08-13', steps: 4000 },
                    { userId: 106, email: 'userf@example.com', date: '2025-08-11', steps: 3800 },
                    { userId: 106, email: 'userf@example.com', date: '2025-08-12', steps: 4000 },
                    { userId: 106, email: 'userf@example.com', date: '2025-08-13', steps: 4000 }
                ],
                messages: [
                    { senderId: 105, senderName: '用户E', message: '我们完成了挑战！', createdAt: '2025-08-13T18:30:00Z' },
                    { senderId: 106, senderName: '用户F', message: '恭喜你获胜！', createdAt: '2025-08-13T19:15:00Z' }
                ]
            }
        };
        
        return mockChallenges[challengeId] || mockChallenges[1]; // 如果没找到就返回第一条
    }

    renderChallengeDetails(challenge) {
        const statusClass = this.getStatusClass(challenge.status);
        const statusText = this.getStatusText(challenge.status);
        
        // 处理挑战历史记录
        let historyHTML = '';
        if (challenge.history && challenge.history.length > 0) {
            historyHTML = `
                <h6 class="mt-4">步数历史记录</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>用户</th>
                                <th>日期</th>
                                <th>步数</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${challenge.history.map(record => `
                                <tr>
                                    <td>${record.email || `ID ${record.userId}`}</td>
                                    <td>${record.date}</td>
                                    <td>${record.steps.toLocaleString()} 步</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            historyHTML = '<p class="mt-4">暂无步数历史记录</p>';
        }
        
        // 处理挑战消息
        let messagesHTML = '';
        if (challenge.messages && challenge.messages.length > 0) {
            messagesHTML = `
                <h6 class="mt-4">挑战消息</h6>
                <div class="messages-container">
                    ${challenge.messages.map(message => `
                        <div class="message">
                            <div class="message-header">
                                <strong>${message.senderName} (ID: ${message.senderId})</strong>
                                <span class="text-muted">${new Date(message.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="message-body">
                                ${message.message}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            messagesHTML = '<p class="mt-4">暂无挑战消息</p>';
        }
        
        return `
            <div class="challenge-details">
                <div class="row">
                    <div class="col-md-6">
                        <h6>基本信息</h6>
                        <p><strong>挑战ID:</strong> ${challenge.id}</p>
                        <p><strong>状态:</strong> <span class="badge badge-${statusClass}">${statusText}</span></p>
                        <p><strong>创建时间:</strong> ${new Date(challenge.createdAt).toLocaleString()}</p>
                        <p><strong>挑战期限:</strong> ${challenge.startDate} 至 ${challenge.endDate}</p>
                        <p><strong>押金金额:</strong> ${challenge.depositAmount.toFixed(2)} USDT</p>
                        <p><strong>奖励金额:</strong> ${challenge.rewardAmount.toFixed(2)} USDT</p>
                        <p><strong>步数目标:</strong> ${challenge.stepTarget.toLocaleString()} 步</p>
                    </div>
                    <div class="col-md-6">
                        <h6>参与者信息</h6>
                        <div class="challenger-info mb-3">
                            <p><strong>挑战者:</strong> ${challenge.challenger.email || challenge.challenger.name} (ID: ${challenge.challenger.id})</p>
                            <p><strong>当前步数:</strong> ${challenge.challenger.steps.toLocaleString()} 步</p>
                            <div class="progress">
                                <div class="progress-bar bg-primary" role="progressbar" 
                                    style="width: ${Math.min((challenge.challenger.steps / challenge.stepTarget) * 100, 100)}%" 
                                    aria-valuenow="${challenge.challenger.steps}" aria-valuemin="0" aria-valuemax="${challenge.stepTarget}">
                                    ${Math.round((challenge.challenger.steps / challenge.stepTarget) * 100)}%
                                </div>
                            </div>
                        </div>
                        <div class="opponent-info">
                            <p><strong>对手:</strong> ${challenge.opponent.email || challenge.opponent.name} (ID: ${challenge.opponent.id})</p>
                            <p><strong>当前步数:</strong> ${challenge.opponent.steps.toLocaleString()} 步</p>
                            <div class="progress">
                                <div class="progress-bar bg-warning" role="progressbar" 
                                    style="width: ${Math.min((challenge.opponent.steps / challenge.stepTarget) * 100, 100)}%" 
                                    aria-valuenow="${challenge.opponent.steps}" aria-valuemin="0" aria-valuemax="${challenge.stepTarget}">
                                    ${Math.round((challenge.opponent.steps / challenge.stepTarget) * 100)}%
                                </div>
                            </div>
                        </div>
                        ${challenge.winnerId ? `
                            <div class="winner-info mt-3">
                                <p><strong>获胜者:</strong> ${challenge.winnerName} (ID: ${challenge.winnerId})</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${historyHTML}
                
                ${messagesHTML}
            </div>
        `;
    }

    confirmCancelChallenge(challengeId) {
        const title = texts.pk.cancelTitle;
        const message = texts.pk.cancelMessage;
        if (this.app && typeof this.app.showConfirm === 'function') {
            this.app.showConfirm(title, message, () => this.cancelChallenge(challengeId));
        } else {
            if (confirm(message)) {
                this.cancelChallenge(challengeId);
            }
        }
    }

    async cancelChallenge(challengeId) {
        try {
            const response = await adminApi.cancelPkChallenge(challengeId);
            
            if (response.success) {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(texts.pk.cancelSuccess, 'success');
                } else {
                    console.log(texts.pk.cancelSuccess);
                }
                await this.loadChallenges();
            } else {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(response.message || '取消挑战失败', 'error');
                } else {
                    console.error('取消挑战失败:', response.message);
                }
            }
        } catch (error) {
            console.error('取消挑战失败:', error);
            if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('取消挑战失败', 'error');
            }
        }
    }

    showSettleChallengeModal(challengeId, challengerId, opponentId) {
        try {
            // 设置挑战ID
            document.getElementById('settleChallengeId').value = challengeId;
            
            // 清空并重新填充获胜者选择
            const winnerSelect = document.getElementById('winnerSelect');
            winnerSelect.innerHTML = '<option value="">平局（退还双方押金）</option>';
            
            // 添加挑战者选项（仅显示ID）
            const challengerOption = document.createElement('option');
            challengerOption.value = challengerId;
            challengerOption.textContent = `${challengerId}`;
            winnerSelect.appendChild(challengerOption);

            // 添加对手选项（仅显示ID）
            const opponentOption = document.createElement('option');
            opponentOption.value = opponentId;
            opponentOption.textContent = `${opponentId}`;
            winnerSelect.appendChild(opponentOption);
            
            // 显示模态框
            const modal = document.getElementById('settleChallengeModal');
            if (modal) {
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
            }
        } catch (error) {
            console.error('显示结算挑战模态框失败:', error);
        }
    }

    hideSettleChallengeModal() {
        const modal = document.getElementById('settleChallengeModal');
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }

    buildChallengeDetailsContent(challenge) {
        return `
            <div class="challenge-details">
                <div class="row">
                    <div class="col-md-6">
                        <h6>挑战者信息</h6>
                        <p><strong>ID:</strong> ${challenge.challenger.id}</p>
                        <p><strong>姓名:</strong> ${challenge.challenger.name}</p>
                        <p><strong>邮箱:</strong> ${challenge.challenger.email}</p>
                        <p><strong>当前步数:</strong> ${challenge.challenger.steps || 0}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>对手信息</h6>
                        <p><strong>ID:</strong> ${challenge.opponent.id}</p>
                        <p><strong>姓名:</strong> ${challenge.opponent.name}</p>
                        <p><strong>邮箱:</strong> ${challenge.opponent.email}</p>
                        <p><strong>当前步数:</strong> ${challenge.opponent.steps || 0}</p>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <h6>挑战信息</h6>
                        <p><strong>状态:</strong> <span class="badge badge-${this.getStatusBadgeClass(challenge.status)}">${this.getStatusText(challenge.status)}</span></p>
                        <p><strong>押金金额:</strong> ${challenge.depositAmount.toFixed(2)} USDT</p>
                        <p><strong>奖励金额:</strong> ${challenge.rewardAmount.toFixed(2)} USDT</p>
                        <p><strong>步数目标:</strong> ${challenge.stepTarget}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>时间信息</h6>
                        <p><strong>开始时间:</strong> ${new Date(challenge.startDate).toLocaleDateString()}</p>
                        <p><strong>结束日期:</strong> ${new Date(challenge.endDate).toLocaleDateString()}</p>
                        <p><strong>创建时间:</strong> ${new Date(challenge.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                ${challenge.winnerId ? `
                <hr>
                <div class="row">
                    <div class="col-12">
                        <h6>结果</h6>
                        <p><strong>获胜者:</strong> ${challenge.winnerId == challenge.challenger.id ? challenge.challenger.name : challenge.opponent.name}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'warning',
            'accepted': 'info',
            'completed': 'success',
            'rejected': 'danger',
            'cancelled': 'secondary'
        };
        return statusMap[status] || 'secondary';
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '待接收',
            'accepted': '进行中',
            'completed': '已完成',
            'rejected': '已拒绝',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }

    async settleChallenge(challengeId, winnerId) {
        try {
            const response = await adminApi.settlePkChallenge(challengeId, winnerId);
            
            if (response.success) {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(texts.pk.settleSuccess, 'success');
                } else {
                    console.log(texts.pk.settleSuccess);
                }

                // 统一使用 Bootstrap v5 Modal 隐藏
                this.hideSettleChallengeModal();

                await this.loadChallenges();
            } else {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(response.message || '结算挑战失败', 'error');
                } else {
                    console.error('结算挑战失败:', response.message);
                }
            }
        } catch (error) {
            console.error('结算挑战失败:', error);
            if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('结算挑战失败', 'error');
            }
        }
    }

    async updatePkPermission(userId, pkEnabled) {
        try {
            const response = await adminApi.managePkPermission(userId, pkEnabled);
            
            if (response.success) {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(`${pkEnabled ? '启用' : '禁用'}用户 ${userId} 的PK功能成功`, 'success');
                } else {
                    console.log(`${pkEnabled ? '启用' : '禁用'}用户 ${userId} 的PK功能成功`);
                }
            } else {
                if (typeof this.app.showToast === 'function') {
                    this.app.showToast(response.message || '更新PK权限失败', 'error');
                } else {
                    console.error('更新PK权限失败:', response.message);
                }
            }
        } catch (error) {
            console.error('更新PK权限失败:', error);
            if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('更新PK权限失败', 'error');
            }
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'primary';
            case 'completed': return 'success';
            case 'rejected': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'light';
        }
    }
}

export default PKChallengeManagement;
