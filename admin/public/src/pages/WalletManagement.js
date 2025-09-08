import adminApi from '../services/adminApi.js';

class WalletManagement {
    constructor(app) {
        this.app = app;
        this.walletStats = null;
        this.withdrawals = []; // 初始化数组
        this.transactions = [];
        this.users = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.limit = 10;
        
        // 用户交易记录相关状态
        this.showTransactionModal = false;
        this.selectedUserId = null;
        this.userTransactions = [];
        this.transactionPagination = { page: 1, limit: 20, total: 0, pages: 0 };
    }

    render() {
        return `
            <div class="wallet-management-page">
                <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">💰 钱包管理</h1>
                
                <!-- 钱包统计 -->
                <div class="wallet-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1rem; margin-bottom: 0.5rem;">总余额</div>
                        <div style="font-size: 1.5rem; font-weight: bold;" id="totalBalance">加载中...</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f72585, #7209b7); color: white; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1rem; margin-bottom: 0.5rem;">冻结余额</div>
                        <div style="font-size: 1.5rem; font-weight: bold;" id="totalFrozen">加载中...</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #4cc9f0, #4895ef); color: white; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1rem; margin-bottom: 0.5rem;">总充值</div>
                        <div style="font-size: 1.5rem; font-weight: bold;" id="totalDeposited">加载中...</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f8961e, #f9c74f); color: white; padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1rem; margin-bottom: 0.5rem;">总提现</div>
                        <div style="font-size: 1.5rem; font-weight: bold;" id="totalWithdrawn">加载中...</div>
                    </div>
                </div>


                <!-- 钱包操作标签页 -->
                <div class="wallet-tabs">
                    <ul class="nav nav-tabs" style="margin-bottom: 2rem;">
                        <li class="nav-item">
                            <button class="nav-link active" id="withdrawalsTab" onclick="window.walletManagement.showTab('withdrawals')">
                                <i class="fas fa-money-bill-alt"></i> 提现管理
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="depositsTab" onclick="window.walletManagement.showTab('deposits')">
                                <i class="fas fa-plus-circle"></i> 充值管理
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="transactionsTab" onclick="window.walletManagement.showTab('transactions')">
                                <i class="fas fa-list"></i> 交易记录
                            </button>
                        </li>
                    </ul>
                    
                    <!-- 提现管理 -->
                    <div id="withdrawalsContent" class="tab-content active">
                        <h3 style="margin-bottom: 1rem; color: #2c3e50;">待审核提现申请</h3>
                        
                        <!-- 搜索框 -->
                        <div class="search-section" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                            <h4 style="margin-bottom: 1rem; color: #2c3e50;">搜索用户</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">用户ID：</label>
                                    <input type="text" id="withdrawalSearchUserId" placeholder="输入用户ID" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">邮箱：</label>
                                    <input type="text" id="withdrawalSearchEmail" placeholder="输入邮箱地址" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Telegram：</label>
                                    <input type="text" id="withdrawalSearchTelegram" placeholder="输入Telegram信息" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <button id="searchWithdrawalsBtn" class="btn btn-primary" style="margin-right: 1rem; padding: 0.5rem 1.5rem;">
                                    <i class="fas fa-search"></i> 搜索
                                </button>
                                <button id="clearWithdrawalsSearchBtn" class="btn btn-outline" style="margin-right: 1rem; padding: 0.5rem 1.5rem;">
                                    <i class="fas fa-times"></i> 清空
                                </button>
                                <button id="refreshStatsBtn" class="btn btn-outline" style="padding: 0.5rem 1.5rem;">
                                    <i class="fas fa-sync-alt"></i> 刷新数据
                                </button>
                            </div>
                        </div>
                        
                        <div id="withdrawalsContainer">
                            <div style="text-align: center; padding: 2rem; color: #666;">加载中...</div>
                        </div>
                    </div>
                    
                    <!-- 充值管理 -->
                    <div id="depositsContent" class="tab-content" style="display: none;">
                        <h3 style="margin-bottom: 1rem; color: #2c3e50;">充值管理</h3>
                        
                        
                        
                        <!-- 搜索框 -->
                        <div class="search-section" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                            <h4 style="margin-bottom: 1rem; color: #2c3e50;">搜索充值记录</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">用户ID：</label>
                                    <input type="text" id="depositSearchUserId" placeholder="输入用户ID" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">邮箱：</label>
                                    <input type="text" id="depositSearchEmail" placeholder="输入邮箱地址" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Telegram：</label>
                                    <input type="text" id="depositSearchTelegram" placeholder="输入Telegram信息" 
                                           style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <button id="searchDepositsBtn" class="btn btn-primary" style="margin-right: 1rem; padding: 0.5rem 1.5rem;">
                                    <i class="fas fa-search"></i> 搜索
                                </button>
                                <button id="clearDepositsSearchBtn" class="btn btn-outline" style="padding: 0.5rem 1.5rem;">
                                    <i class="fas fa-times"></i> 清空
                                </button>
                            </div>
                        </div>
                        
                        <!-- 充值记录列表 -->
                        <div class="deposit-records" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                                <h4 style="margin: 0;">充值记录</h4>
                            </div>
                            <div id="depositRecordsContainer" style="padding: 1rem;">
                                <div style="text-align: center; padding: 2rem; color: #666;">加载中...</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 交易记录 -->
                    <div id="transactionsContent" class="tab-content" style="display: none;">
                        <h3 style="margin-bottom: 1rem; color: #2c3e50;">所有交易记录</h3>
                        <div id="allTransactionsContainer">
                            <div style="text-align: center; padding: 2rem; color: #666;">加载中...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        // 设置全局引用，供HTML中的onclick调用
        window.walletManagement = this;
        console.log('✅ 设置全局引用完成');
        
        await this.loadWalletStats();
        await this.loadWithdrawals();
        await this.loadUsers();
        await this.loadDepositRecords();
        this.bindEvents();
    }

    async loadWalletStats() {
        try {
            const response = await adminApi.getWalletStats();
            if (response.success) {
                this.walletStats = response.data;
                this.updateWalletStatsDisplay();
            }
        } catch (error) {
            console.error('加载钱包统计出错:', error);
        }
    }

    async loadWithdrawals(searchParams = {}) {
        try {
            console.log('🔄 开始加载提现申请列表...', searchParams);
            
            const response = await adminApi.getWithdrawals(searchParams);
            console.log('📥 API 响应:', response);
            
            if (response && response.success) {
                this.withdrawals = response.data || [];
                console.log('📊 提现申请数据条数:', this.withdrawals.length);
                console.log('📊 提现申请详细数据:', this.withdrawals);
                this.renderWithdrawals();
            } else {
                console.error('❌ API响应失败:', response);
                throw new Error(response?.message || '获取提现申请失败');
            }
        } catch (error) {
            console.error('❌ 加载提现申请失败:', error);
            this.withdrawals = [];
            const container = document.getElementById('withdrawalsContainer');
            if (container) {
                container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i><br/>
                    加载失败: ${error.message}<br/>
                    <button onclick="window.walletManagement.loadWithdrawals()" class="btn btn-primary" style="margin-top: 1rem;">重试</button>
                </div>`;
            }
        }
    }

    async loadUsers() {
        try {
            const response = await adminApi.getUsers();
            if (response.success) {
                this.users = response.data.wallets || [];
            }
        } catch (error) {
            console.error('加载用户列表出错:', error);
        }
    }

    updateWalletStatsDisplay() {
        if (!this.walletStats) return;
        
        // 适配后端返回的数据结构
        const { 
            totalBalance = 0, 
            frozenAmount = 0, 
            totalDeposits = 0, 
            totalWithdrawals = 0,
            // 兼容旧的数据结构
            total_balance = 0, 
            total_frozen = 0, 
            total_deposited = 0, 
            total_withdrawn = 0 
        } = this.walletStats;
        
        const totalBalanceEl = document.getElementById('totalBalance');
        const totalFrozenEl = document.getElementById('totalFrozen');
        const totalDepositedEl = document.getElementById('totalDeposited');
        const totalWithdrawnEl = document.getElementById('totalWithdrawn');
        
        if (totalBalanceEl) totalBalanceEl.textContent = `${totalBalance || total_balance} USDT`;
        if (totalFrozenEl) totalFrozenEl.textContent = `${frozenAmount || total_frozen} USDT`;
        if (totalDepositedEl) totalDepositedEl.textContent = `${totalDeposits || total_deposited} USDT`;
        if (totalWithdrawnEl) totalWithdrawnEl.textContent = `${totalWithdrawals || total_withdrawn} USDT`;
    }

    renderWithdrawals() {
        console.log('🎨 开始渲染提现申请列表...');
        const container = document.getElementById('withdrawalsContainer');
        if (!container) {
            console.error('❌ 找不到 withdrawalsContainer 元素');
            return;
        }
        
        console.log('📊 提现申请数据:', this.withdrawals);
        if (!this.withdrawals || this.withdrawals.length === 0) {
            console.log('📝 暂无提现申请数据');
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">暂无待审核的提现申请</div>';
            return;
        }
        
        const withdrawalsHtml = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fb;">
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">申请时间</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">用户</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">提现金额</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">提现地址</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">状态</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.withdrawals.map(withdrawal => {
                            const userInfo = this.formatUserInfo(withdrawal);
                            return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 1rem;">${new Date(withdrawal.createdAt || withdrawal.created_at).toLocaleString('zh-CN')}</td>
                                <td style="padding: 1rem;">${userInfo}</td>
                                <td style="padding: 1rem; color: #e74c3c; font-weight: bold;">${withdrawal.amount} USDT</td>
                                <td style="padding: 1rem; font-family: monospace; font-size: 0.9rem;">${withdrawal.trc20Wallet || withdrawal.trc20_wallet || 'N/A'}</td>
                                <td style="padding: 1rem;">
                                    <span style="color: ${this.getWithdrawalStatusColor(withdrawal.status)};">${this.getWithdrawalStatusText(withdrawal.status)}</span>
                                </td>
                                <td style="padding: 1rem;">
                                    ${withdrawal.status === 'pending' ? `
                                        <button class="btn btn-success btn-sm" onclick="window.walletManagement.approveWithdrawal(${withdrawal.id})" style="margin-right: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.8rem;">批准</button>
                                        <button class="btn btn-danger btn-sm" onclick="window.walletManagement.rejectWithdrawal(${withdrawal.id})" style="margin-right: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.8rem;">拒绝</button>
                                        <button class="btn btn-info btn-sm" onclick="window.walletManagement.showUserTransactions(${withdrawal.userId || withdrawal.user_id})" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">账变</button>
                                    ` : withdrawal.status === 'approved' || withdrawal.status === 'rejected' ? `
                                        <button class="btn btn-info btn-sm" onclick="window.walletManagement.showUserTransactions(${withdrawal.userId || withdrawal.user_id})" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">账变</button>
                                    ` : '-'}
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = withdrawalsHtml;
    }

    bindEvents() {
        const refreshStatsBtn = document.getElementById('refreshStatsBtn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', async () => {
                await this.loadWalletStats();
                await this.loadWithdrawals();
                await this.loadDepositRecords();
            });
        }

        // 充值表单提交
        const depositForm = document.getElementById('depositForm');
        if (depositForm) {
            depositForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDepositSubmit();
            });
        }

        // 提现搜索事件
        const searchWithdrawalsBtn = document.getElementById('searchWithdrawalsBtn');
        if (searchWithdrawalsBtn) {
            searchWithdrawalsBtn.addEventListener('click', () => {
                this.searchWithdrawals();
            });
        }

        const clearWithdrawalsSearchBtn = document.getElementById('clearWithdrawalsSearchBtn');
        if (clearWithdrawalsSearchBtn) {
            clearWithdrawalsSearchBtn.addEventListener('click', () => {
                this.clearWithdrawalsSearch();
            });
        }

        // 充值搜索事件
        const searchDepositsBtn = document.getElementById('searchDepositsBtn');
        if (searchDepositsBtn) {
            searchDepositsBtn.addEventListener('click', () => {
                this.searchDeposits();
            });
        }

        const clearDepositsSearchBtn = document.getElementById('clearDepositsSearchBtn');
        if (clearDepositsSearchBtn) {
            clearDepositsSearchBtn.addEventListener('click', () => {
                this.clearDepositsSearch();
            });
        }
    }

    async approveWithdrawal(withdrawalId) {
        const notes = prompt('请输入处理备注(可选):') || '管理员批准提现';
        
        try {
            const response = await adminApi.approveWithdrawal(withdrawalId, notes);
            
            if (response.success) {
                alert('提现申请已批准');
                await this.loadWithdrawals();
                await this.loadWalletStats();
            } else {
                alert(`批准失败: ${response.message}`);
            }
        } catch (error) {
            console.error('批准提现申请失败:', error);
            alert('操作失败，请稍后重试');
        }
    }

    async rejectWithdrawal(withdrawalId) {
        const reason = prompt('请输入拒绝原因:');
        if (!reason) return;
        
        try {
            const response = await adminApi.rejectWithdrawal(withdrawalId, reason);
            
            if (response.success) {
                alert('提现申请已拒绝');
                await this.loadWithdrawals();
                await this.loadWalletStats();
            } else {
                alert(`拒绝失败: ${response.message}`);
            }
        } catch (error) {
            console.error('拒绝提现申请失败:', error);
            alert('操作失败，请稍后重试');
        }
    }

    getWithdrawalStatusColor(status) {
        const colorMap = {
            'pending': '#f39c12',
            'approved': '#27ae60',
            'rejected': '#e74c3c',
            'processing': '#3498db',
            'completed': '#27ae60',
            'failed': '#e74c3c'
        };
        return colorMap[status] || '#95a5a6';
    }

    getWithdrawalStatusText(status) {
        const statusMap = {
            'pending': '待处理',
            'approved': '已批准',
            'rejected': '已拒绝',
            'processing': '处理中',
            'completed': '已完成',
            'failed': '失败'
        };
        return statusMap[status] || status;
    }

    // 标签页切换
    showTab(tabName) {
        // 隐藏所有标签内容
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        // 移除所有标签的active状态
        const tabLinks = document.querySelectorAll('.nav-link');
        tabLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 显示选中的标签内容
        const activeContent = document.getElementById(`${tabName}Content`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }

        // 激活选中的标签
        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // 加载对应的数据
        if (tabName === 'deposits') {
            this.loadDepositRecords();
            this.populateUserSelect();
        } else if (tabName === 'transactions') {
            this.loadAllTransactions();
        }
    }

    // 加载充值记录
    async loadDepositRecords(searchParams = {}) {
        try {
            console.log('加载充值记录...', searchParams);
            
            const response = await adminApi.getDepositRecords(searchParams);
            
            if (response.success) {
                this.depositRecords = response.data || [];
                console.log('📊 加载充值订单数据:', this.depositRecords);
                this.renderDepositRecords();
            } else {
                throw new Error(response.message || '获取充值记录失败');
            }
        } catch (error) {
            console.error('加载充值记录失败:', error);
            this.depositRecords = [];
            document.getElementById('depositRecordsContainer').innerHTML = '<div style="text-align: center; padding: 2rem; color: #e74c3c;">加载失败: ' + error.message + '</div>';
        }
    }

    // 渲染充值记录
    renderDepositRecords() {
        const container = document.getElementById('depositRecordsContainer');
        if (!container) return;

        if (!this.depositRecords || this.depositRecords.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">暂无充值记录</div>';
            return;
        }

        const recordsHtml = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fb;">
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">订单号</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">用户</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">充值金额</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">支付方式</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">状态</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">创建时间</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.depositRecords.map(record => {
                            const userInfo = this.formatUserInfo(record);
                            return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 0.8rem; font-family: monospace; font-size: 0.9rem;">${record.order_no}</td>
                                <td style="padding: 0.8rem;">${userInfo}</td>
                                <td style="padding: 0.8rem; color: #27ae60; font-weight: bold;">+${record.amount} USDT</td>
                                <td style="padding: 0.8rem;">${this.getPaymentMethodText(record.payment_method)}</td>
                                <td style="padding: 0.8rem;">
                                    <span style="color: ${this.getDepositStatusColor(record.status)};">${this.getDepositStatusText(record.status)}</span>
                                </td>
                                <td style="padding: 0.8rem;">${new Date(record.created_at).toLocaleString('zh-CN')}</td>
                                <td style="padding: 0.8rem;">
                                    ${record.status === 'pending' ? `
                                        <button class="btn btn-success btn-sm" onclick="window.walletManagement.approveDeposit('${record.order_no}')" style="margin-right: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.8rem;">完成</button>
                                        <button class="btn btn-danger btn-sm" onclick="window.walletManagement.rejectDeposit('${record.order_no}')" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">拒绝</button>
                                    ` : '-'}
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = recordsHtml;
    }

    // 填充用户选择下拉框
    populateUserSelect() {
        const userSelect = document.getElementById('depositUserId');
        if (!userSelect || !this.users) return;

        userSelect.innerHTML = '<option value="">请选择用户</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.email} (ID: ${user.id})`;
            userSelect.appendChild(option);
        });
    }

    // 处理充值表单提交
    async handleDepositSubmit() {
        const form = document.getElementById('depositForm');
        const formData = new FormData(form);
        
        const depositData = {
            userId: parseInt(document.getElementById('depositUserId').value),
            amount: parseFloat(document.getElementById('depositAmount').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            trxHash: document.getElementById('trxHash').value,
            description: document.getElementById('depositDescription').value || '管理员充值'
        };

        // 验证数据
        if (!depositData.userId) {
            alert('请选择用户');
            return;
        }
        if (!depositData.amount || depositData.amount <= 0) {
            alert('请输入有效的充值金额');
            return;
        }

        try {
            const response = await adminApi.adminDeposit(depositData);
            if (response.success) {
                alert(`充值成功！订单号：${response.data.orderNo}`);
                form.reset();
                await this.loadDepositRecords();
                await this.loadWalletStats();
            } else {
                alert(`充值失败：${response.message}`);
            }
        } catch (error) {
            console.error('充值失败:', error);
            alert('充值失败，请稍后重试');
        }
    }

    // 加载所有交易记录
    async loadAllTransactions() {
        try {
            const response = await adminApi.getAllTransactions();
            if (response.success) {
                this.allTransactions = response.data || [];
                this.renderAllTransactions();
            }
        } catch (error) {
            console.error('加载交易记录出错:', error);
            this.allTransactions = [];
            this.renderAllTransactions();
        }
    }

    // 渲染所有交易记录
    renderAllTransactions() {
        const container = document.getElementById('allTransactionsContainer');
        if (!container) return;

        if (!this.allTransactions || this.allTransactions.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">暂无交易记录</div>';
            return;
        }

        const transactionsHtml = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fb;">
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">交易时间</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">用户</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">交易类型</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">金额</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">说明</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.allTransactions.map(tx => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 0.8rem;">${new Date(tx.created_at).toLocaleString('zh-CN')}</td>
                                <td style="padding: 0.8rem;">${tx.username || '未知用户'}</td>
                                <td style="padding: 0.8rem;">${this.getTransactionTypeText(tx.transaction_type)}</td>
                                <td style="padding: 0.8rem; color: ${tx.amount >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                                    ${tx.amount >= 0 ? '+' : ''}${tx.amount} USDT
                                </td>
                                <td style="padding: 0.8rem;">${tx.description}</td>
                                <td style="padding: 0.8rem;">
                                    <span style="color: ${this.getTransactionStatusColor(tx.status)};">${this.getTransactionStatusText(tx.status)}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = transactionsHtml;
    }

    // 辅助方法
    getPaymentMethodText(method) {
        const methodMap = {
            'admin': '管理员充值',
            'bank': '银行转账',
            'usdt': 'USDT转账',
            'manual': '手动调整'
        };
        return methodMap[method] || method;
    }

    getDepositStatusColor(status) {
        const colorMap = {
            'pending': '#f39c12',
            'completed': '#27ae60',
            'failed': '#e74c3c'
        };
        return colorMap[status] || '#95a5a6';
    }

    getDepositStatusText(status) {
        const statusMap = {
            'pending': '处理中',
            'completed': '已完成',
            'failed': '失败'
        };
        return statusMap[status] || status;
    }

    getTransactionTypeText(type) {
        const typeMap = {
            'deposit': '充值',
            'withdrawal': '提现',
            'reward': '奖励',
            'challenge_deposit': '挑战押金',
            'challenge_refund': '挑战退款',
            'admin_adjust': '管理员调整'
        };
        return typeMap[type] || type;
    }

    getTransactionStatusColor(status) {
        const colorMap = {
            'pending': '#f39c12',
            'completed': '#27ae60',
            'failed': '#e74c3c'
        };
        return colorMap[status] || '#95a5a6';
    }

    getTransactionStatusText(status) {
        const statusMap = {
            'pending': '待处理',
            'completed': '已完成',
            'failed': '失败'
        };
        return statusMap[status] || status;
    }

    // 充值订单状态处理
    async approveDeposit(orderNo) {
        const notes = prompt('请输入处理备注(可选):') || '管理员确认充值';
        
        try {
            const response = await adminApi.request(`/api/admin/wallet/deposits/${orderNo}`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'completed',
                    adminNotes: notes
                })
            });
            
            if (response.success) {
                alert('充值订单处理成功');
                await this.loadDepositRecords();
                await this.loadWalletStats();
            } else {
                alert(`处理失败: ${response.message}`);
            }
        } catch (error) {
            console.error('处理充值订单失败:', error);
            alert('操作失败，请稍后重试');
        }
    }

    async rejectDeposit(orderNo) {
        const reason = prompt('请输入拒绝原因:');
        if (!reason) return;
        
        try {
            const response = await adminApi.request(`/api/admin/wallet/deposits/${orderNo}`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'failed',
                    adminNotes: reason
                })
            });
            
            if (response.success) {
                alert('充值订单已拒绝');
                await this.loadDepositRecords();
                await this.loadWalletStats();
            } else {
                alert(`拒绝失败: ${response.message}`);
            }
        } catch (error) {
            console.error('拒绝充值订单失败:', error);
            alert('操作失败，请稍后重试');
        }
    }

    // 支付方式文本映射
    getPaymentMethodText(method) {
        const methodMap = {
            'trc20': 'TRC-20 USDT',
            'erc20': 'ERC-20 USDT',
            'admin': '管理员充值',
            'bank': '银行转账',
            'usdt': 'USDT转账',
            'manual': '手动调整'
        };
        return methodMap[method] || method;
    }

    // 充值状态颜色映射
    getDepositStatusColor(status) {
        const colorMap = {
            'pending': '#f39c12',
            'processing': '#3498db',
            'completed': '#27ae60',
            'failed': '#e74c3c',
            'cancelled': '#95a5a6'
        };
        return colorMap[status] || '#95a5a6';
    }

    // 充值状态文本映射
    getDepositStatusText(status) {
        const statusMap = {
            'pending': '待处理',
            'processing': '处理中',
            'completed': '已完成',
            'failed': '失败',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }

    // 搜索提现记录
    async searchWithdrawals() {
        const userId = document.getElementById('withdrawalSearchUserId')?.value?.trim();
        const email = document.getElementById('withdrawalSearchEmail')?.value?.trim();
        const telegram = document.getElementById('withdrawalSearchTelegram')?.value?.trim();

        const searchParams = {};
        if (userId) searchParams.userId = userId;
        if (email) searchParams.email = email;
        if (telegram) searchParams.telegram = telegram;

        await this.loadWithdrawals(searchParams);
    }

    // 清空提现搜索
    clearWithdrawalsSearch() {
        document.getElementById('withdrawalSearchUserId').value = '';
        document.getElementById('withdrawalSearchEmail').value = '';
        document.getElementById('withdrawalSearchTelegram').value = '';
        this.loadWithdrawals();
    }

    // 搜索充值记录
    async searchDeposits() {
        const userId = document.getElementById('depositSearchUserId')?.value?.trim();
        const email = document.getElementById('depositSearchEmail')?.value?.trim();
        const telegram = document.getElementById('depositSearchTelegram')?.value?.trim();

        const searchParams = {};
        if (userId) searchParams.userId = userId;
        if (email) searchParams.email = email;
        if (telegram) searchParams.telegram = telegram;

        await this.loadDepositRecords(searchParams);
    }

    // 清空充值搜索
    clearDepositsSearch() {
        document.getElementById('depositSearchUserId').value = '';
        document.getElementById('depositSearchEmail').value = '';
        document.getElementById('depositSearchTelegram').value = '';
        this.loadDepositRecords();
    }

    // 格式化用户信息显示
    formatUserInfo(record) {
        console.log('🏷️ 格式化用户信息:', record);
        const parts = [];
        
        // 用户ID - 兼容不同的字段命名
        const userId = record.userId || record.user_id;
        parts.push(`ID: ${userId}`);
        
        // 邮箱 - 兼容不同的字段命名
        const email = record.userEmail || record.email;
        if (email) {
            parts.push(`📧 ${email}`);
        } else {
            parts.push(`📧 <span style="color: #e74c3c;">缺少邮箱</span>`);
        }
        
        // Telegram信息 - 兼容不同的字段命名和数据结构
        const telegramId = record.telegram_id;
        const firstName = record.first_name || record.firstName;
        const lastName = record.last_name || record.lastName;
        const userName = record.userName;
        
        console.log('📱 Telegram信息字段:', { telegramId, firstName, lastName, userName });
        
        if (telegramId || firstName || lastName) {
            const telegramInfo = [];
            if (telegramId) telegramInfo.push(`@${telegramId}`);
            if (firstName) telegramInfo.push(firstName);
            if (lastName) telegramInfo.push(lastName);
            parts.push(`📱 ${telegramInfo.join(' ')}`);
        } else if (userName && userName !== email) {
            parts.push(`📱 ${userName}`);
        } else {
            parts.push(`📱 <span style="color: #e74c3c;">缺少Telegram</span>`);
        }
        
        const result = parts.join('<br/>');
        console.log('🎨 格式化结果:', result);
        return result;
    }

    // 显示用户交易记录
    async showUserTransactions(userId) {
        try {
            this.selectedUserId = userId;
            this.transactionPagination.page = 1;
            
            const response = await adminApi.getUserTransactions(userId, this.transactionPagination.page, this.transactionPagination.limit);
            
            if (response.success) {
                this.userTransactions = response.data.transactions || [];
                this.transactionPagination.total = response.data.total || 0;
                this.transactionPagination.pages = response.data.totalPages || 1;
                
                this.showTransactionModal = true;
                this.renderTransactionModal();
            } else {
                alert('获取用户交易记录失败: ' + (response.message || '未知错误'));
            }
        } catch (error) {
            console.error('获取用户交易记录失败:', error);
            alert('获取用户交易记录失败，请稍后重试');
        }
    }

    // 渲染交易记录模态框
    renderTransactionModal() {
        if (!this.showTransactionModal) return;

        // 检查是否已存在模态框，如果存在则先移除
        const existingModal = document.getElementById('transactionModal');
        if (existingModal) {
            existingModal.remove();
        }

        const userInfo = this.userTransactions.length > 0 ? this.userTransactions[0].userInfo : { email: '未知用户', first_name: '', last_name: '' };
        
        const modalHtml = `
            <div id="transactionModal" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.5); 
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white; 
                    border-radius: 8px; 
                    width: 90%; 
                    max-width: 800px; 
                    max-height: 80vh; 
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: #2c3e50;">
                            <i class="fas fa-exchange-alt"></i> 
                            用户交易记录 - ${userInfo.email || userInfo.first_name || '用户ID: ' + this.selectedUserId}
                        </h3>
                        <button onclick="window.walletManagement.closeTransactionModal()" style="
                            background: none; 
                            border: none; 
                            font-size: 1.5rem; 
                            cursor: pointer; 
                            color: #666;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">×</button>
                    </div>
                    <div style="padding: 1.5rem; overflow-y: auto; flex: 1;">
                        ${this.renderTransactionList()}
                    </div>
                    <div style="padding: 1rem 1.5rem; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        ${this.renderTransactionPagination()}
                        <button onclick="window.walletManagement.closeTransactionModal()" class="btn btn-outline">关闭</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 渲染交易记录列表
    renderTransactionList() {
        if (!this.userTransactions || this.userTransactions.length === 0) {
            return '<div style="text-align: center; padding: 2rem; color: #666;">暂无交易记录</div>';
        }

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fb;">
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">时间</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">类型</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">金额</th>
                            <th style="padding: 0.8rem; text-align: left; border-bottom: 2px solid #e0e0e0;">描述</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.userTransactions.map(transaction => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 0.8rem; font-size: 0.9rem;">${new Date(transaction.created_at).toLocaleString('zh-CN')}</td>
                                <td style="padding: 0.8rem;">
                                    <span style="
                                        background: ${this.getTransactionTypeColor(transaction.transaction_type)}; 
                                        color: white; 
                                        padding: 0.2rem 0.5rem; 
                                        border-radius: 3px; 
                                        font-size: 0.8rem;
                                    ">
                                        ${this.getTransactionTypeText(transaction.transaction_type)}
                                    </span>
                                </td>
                                <td style="padding: 0.8rem; font-weight: bold; color: ${transaction.amount > 0 ? '#27ae60' : '#e74c3c'};">
                                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount} USDT
                                </td>
                                <td style="padding: 0.8rem; font-size: 0.9rem;">${transaction.description || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 渲染交易记录分页
    renderTransactionPagination() {
        if (this.transactionPagination.pages <= 1) return '';

        return `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button 
                    onclick="window.walletManagement.loadUserTransactionsPage(${this.transactionPagination.page - 1})"
                    ${this.transactionPagination.page <= 1 ? 'disabled' : ''}
                    class="btn btn-sm"
                    style="padding: 0.3rem 0.6rem;">
                    上一页
                </button>
                <span style="font-size: 0.9rem; color: #666;">
                    第 ${this.transactionPagination.page} / ${this.transactionPagination.pages} 页
                </span>
                <button 
                    onclick="window.walletManagement.loadUserTransactionsPage(${this.transactionPagination.page + 1})"
                    ${this.transactionPagination.page >= this.transactionPagination.pages ? 'disabled' : ''}
                    class="btn btn-sm"
                    style="padding: 0.3rem 0.6rem;">
                    下一页
                </button>
            </div>
        `;
    }

    // 加载用户交易记录的指定页面
    async loadUserTransactionsPage(page) {
        if (page < 1 || page > this.transactionPagination.pages) return;
        
        try {
            this.transactionPagination.page = page;
            const response = await adminApi.getUserTransactions(this.selectedUserId, page, this.transactionPagination.limit);
            
            if (response.success) {
                this.userTransactions = response.data.transactions || [];
                this.renderTransactionModal();
            }
        } catch (error) {
            console.error('加载交易记录页面失败:', error);
            alert('加载失败，请稍后重试');
        }
    }

    // 关闭交易记录模态框
    closeTransactionModal() {
        this.showTransactionModal = false;
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.remove();
        }
    }

    // 获取交易类型颜色
    getTransactionTypeColor(type) {
        const colorMap = {
            'deposit': '#27ae60',
            'withdrawal': '#e74c3c', 
            'reward': '#f39c12',
            'commission': '#3498db',
            'admin_adjust': '#9b59b6',
            'achievement': '#1abc9c'
        };
        return colorMap[type] || '#95a5a6';
    }

    // 获取交易类型文本
    getTransactionTypeText(type) {
        const typeMap = {
            'deposit': '充值',
            'withdrawal': '提现',
            'reward': '奖励',
            'commission': '佣金',
            'admin_adjust': '管理员调整',
            'achievement': '成就奖励'
        };
        return typeMap[type] || type;
    }
}

export default WalletManagement;
