import api from '../src/services/api.js';

class Wallet {
    constructor(app) {
        this.app = app;
        this.walletData = null;
    }

    render(token, user) {
        return `
            <div class="wallet-page">
                <div class="page-header">
                    <h1><i class="fas fa-wallet"></i> 我的钱包</h1>
                </div>
                
                <div class="wallet-content">
                    <div class="wallet-summary">
                        <div class="balance-card">
                            <h3>当前余额</h3>
                            <div class="balance-amount" id="currentBalance">0.00 USDT</div>
                        </div>
                        
                        <div class="wallet-actions">
                            <button class="btn btn-primary" id="depositBtn">
                                <i class="fas fa-plus"></i> 充值
                            </button>
                            <button class="btn btn-outline" id="withdrawBtn">
                                <i class="fas fa-minus"></i> 提现
                            </button>
                        </div>
                    </div>
                    
                    <div class="transaction-history">
                        <h3>交易记录</h3>
                        <div class="transactions-list" id="transactionsList">
                            <div class="loading">加载中...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        this.loadWalletData(token, user);
        this.bindEvents();
    }

    async loadWalletData(token, user) {
        try {
            if (!token) {
                document.getElementById('transactionsList').innerHTML = '<div class="error">请先登录</div>';
                return;
            }

            // 加载钱包信息
            const walletResponse = await api.getWalletInfo(token);
            console.log('钱包数据:', walletResponse); // 添加调试日志
            
            if (walletResponse.success && walletResponse.data) {
                // 存储钱包数据
                this.walletData = walletResponse.data.wallet || walletResponse.data.stats || walletResponse.data;
                
                // 从正确的路径获取余额数据
                const balance = parseFloat(this.walletData.balance || 0);
                document.getElementById('currentBalance').textContent = `${balance.toFixed(2)} USDT`;
            }

            // 加载交易记录
            await this.loadTransactions(token);
        } catch (error) {
            console.error('加载钱包数据失败:', error);
            document.getElementById('transactionsList').innerHTML = '<div class="error">加载失败，请重试</div>';
        }
    }

    async loadTransactions(token) {
        try {
            const response = await api.getWalletTransactions(token);
            console.log('交易记录数据:', response); // 添加调试日志
            
            if (response.success && response.data && response.data.transactions) {
                const transactions = response.data.transactions;
                if (Array.isArray(transactions)) {
                    this.renderTransactions(transactions);
                } else {
                    console.error('交易记录格式错误:', response.data);
                    document.getElementById('transactionsList').innerHTML = '<div class="no-data">暂无交易记录</div>';
                }
            } else {
                document.getElementById('transactionsList').innerHTML = '<div class="no-data">暂无交易记录</div>';
            }
        } catch (error) {
            console.error('加载交易记录失败:', error);
            document.getElementById('transactionsList').innerHTML = '<div class="error">加载失败，请重试</div>';
        }
    }

    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        
        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<div class="no-data">暂无交易记录</div>';
            return;
        }

        const html = transactions.map(tx => {
            const normalizedTx = this.normalizeTransaction(tx);
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type ${normalizedTx.type}">
                            ${this.getTransactionTypeText(normalizedTx.type, normalizedTx.description)}
                        </div>
                        <div class="transaction-amount ${normalizedTx.type}">
                            ${this.getAmountDisplay(normalizedTx)}
                        </div>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-description">${normalizedTx.description || '交易'}</div>
                        <div class="transaction-date">${this.formatDate(normalizedTx.createdAt)}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // 数据标准化函数
    normalizeTransaction(tx) {
        // 数据验证
        if (!tx || typeof tx !== 'object') {
            console.warn('无效的交易数据:', tx);
            return {
                type: 'unknown',
                amount: 0,
                description: '无效交易',
                createdAt: new Date().toISOString(),
                originalAmount: 0
            };
        }

        const amount = parseFloat(tx.amount || 0);
        if (isNaN(amount)) {
            console.warn('无效的金额数据:', tx.amount);
        }

        return {
            type: tx.transaction_type || tx.type || 'unknown',
            amount: Math.abs(amount),
            description: tx.description || '交易',
            createdAt: tx.created_at || tx.createdAt || new Date().toISOString(),
            originalAmount: amount
        };
    }

    // 基于标准化交易类型的金额显示逻辑
    getAmountDisplay(normalizedTx) {
        const { type, amount, description, originalAmount } = normalizedTx;
        
        // 基于标准化的交易类型判断符号
        const deductionTypes = [
            'challenge_deposit',    // 挑战押金（扣款）
            'challenge_penalty',    // 挑战罚金（扣款）
            'withdrawal',          // 提现（扣款）
            'system_deduct'        // 系统扣除（扣款）
        ];
        
        const creditTypes = [
            'deposit',             // 充值（入账）
            'challenge_refund',    // 挑战退款（入账）
            'challenge_reward',    // 挑战奖励（入账）
            'reward',              // 奖励（入账）
            'checkin_reward',      // 签到奖励（入账）
            'referral_reward',     // 推荐奖励（入账）
            'admin_adjust'         // 管理员调整（可正可负，需要特殊处理）
        ];
        
        // 如果原始金额为负数，直接显示为扣除
        if (originalAmount < 0) {
            return `-${amount.toFixed(2)} USDT`;
        }
        
        // 管理员调整需要基于描述判断
        if (type === 'admin_adjust') {
            const isDeduction = description.includes('减少') || description.includes('扣除');
            return isDeduction ? `-${amount.toFixed(2)} USDT` : `+${amount.toFixed(2)} USDT`;
        }
        
        // 基于交易类型判断
        if (deductionTypes.includes(type)) {
            return `-${amount.toFixed(2)} USDT`;
        } else if (creditTypes.includes(type)) {
            return `+${amount.toFixed(2)} USDT`;
        } else {
            // 兜底逻辑：基于描述判断
            const isDeduction = description.includes('扣除') || 
                              description.includes('罚金') ||
                              description.includes('押金') && !description.includes('退还');
            return isDeduction ? `-${amount.toFixed(2)} USDT` : `+${amount.toFixed(2)} USDT`;
        }
    }

    // 日期格式化函数
    formatDate(dateStr) {
        if (!dateStr) return '未知时间';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return '未知时间';
            }
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('日期格式化错误:', error);
            return '未知时间';
        }
    }

    getTransactionTypeText(type, description = '') {
        // 基于描述内容智能判断交易类型显示
        if (description.includes('取消挑战扣除')) {
            return '扣除';
        }
        if (description.includes('取消挑战退还押金') || description.includes('挑战退还')) {
            return '退还';
        }
        if (description.includes('签到奖励')) {
            return '奖励';
        }
        if (description.includes('VIP挑战押金') || description.includes('PK挑战押金')) {
            return '押金';
        }
        if (description.includes('管理员')) {
            return '调整';
        }
        
        // 标准交易类型映射
        const types = {
            'deposit': '充值',
            'withdrawal': '提现', 
            'reward': '奖励',
            'challenge_deposit': '押金',
            'challenge_refund': '退还',
            'challenge_reward': '奖励',
            'vip_challenge_cancel': '扣除',
            'vip_challenge_refund': '退还',
            'checkin_reward': '奖励',
            'admin_adjust': '调整',
            'system_deduct': '扣除',
            'referral_reward': '奖励',
            'pk_challenge_deposit': '押金',
            'pk_challenge_refund': '退还'
        };
        return types[type] || '交易';
    }

    showDepositModal() {
        const modalHtml = `<div class="deposit-modal"><h3><i class="fas fa-plus-circle"></i> 充值</h3><form id="depositForm"><div class="form-group"><label>充值金额 (USDT)</label><input type="number" id="depositAmount" step="0.01" min="0.01" required placeholder="请输入充值金额" class="form-control"></div><div class="form-group"><label>支付方式</label><select id="paymentMethod" class="form-control"><option value="trc20">TRC-20 USDT</option><option value="erc20">ERC-20 USDT</option></select></div><div class="form-group"><label>交易哈希 (可选)</label><input type="text" id="trxHash" placeholder="请输入区块链交易哈希" class="form-control"><small class="form-text">如果您已经转账，请填入交易哈希以加快处理速度</small></div><div class="form-group"><label>备注说明 (可选)</label><textarea id="depositDescription" rows="3" placeholder="充值说明或备注" class="form-control"></textarea></div><div class="deposit-info"><div class="info-card"><h4>充值说明</h4><ul><li>最小充值金额：1.00 USDT</li><li>充值通常在1-30分钟内到账</li><li>如需帮助，请联系客服</li></ul></div></div><div class="modal-actions"><button type="button" class="btn btn-outline" id="cancelDeposit">取消</button><button type="submit" class="btn btn-primary" id="confirmDeposit"><i class="fas fa-paper-plane"></i> 提交充值申请</button></div></form></div>`;
        
        this.app.showModal('充值', modalHtml, 'info', {
            showCancel: false,
            customClass: 'deposit-modal-container'
        });
        
        // 绑定表单事件
        this.bindDepositFormEvents();
    }

    showWithdrawModal() {
        const modalHtml = `<div class="withdraw-modal"><h3><i class="fas fa-minus-circle"></i> 提现</h3><form id="withdrawForm"><div class="form-group"><label>提现金额 (USDT)</label><input type="number" id="withdrawAmount" step="0.01" min="1.00" required placeholder="请输入提现金额" class="form-control"><div class="balance-info">可用余额: <span id="availableBalance">0.00</span> USDT</div></div><div class="form-group"><label>提现地址</label><input type="text" id="withdrawAddress" required placeholder="请输入TRC-20钱包地址" class="form-control"><small class="form-text">请确保地址正确，错误地址可能导致资金丢失</small></div><div class="form-group"><label>资金密码</label><input type="password" id="withdrawPassword" required placeholder="请输入资金密码" class="form-control"></div><div class="withdraw-info"><div class="info-card"><h4>提现说明</h4><ul><li>最小提现金额：10.00 USDT</li><li>提现手续费：2.00 USDT</li><li>审核时间：1-24小时</li><li>到账时间：审核通过后1小时内</li></ul></div></div><div class="modal-actions"><button type="button" class="btn btn-outline" id="cancelWithdraw">取消</button><button type="submit" class="btn btn-primary" id="confirmWithdraw"><i class="fas fa-paper-plane"></i> 提交提现申请</button></div></form></div>`;
        
        this.app.showModal('提现', modalHtml, 'warning', {
            showCancel: false,
            customClass: 'withdraw-modal-container'
        });
        
        // 更新可用余额显示
        this.updateAvailableBalance();
        
        // 绑定表单事件
        this.bindWithdrawFormEvents();
    }

    bindDepositFormEvents() {
        const depositForm = document.getElementById('depositForm');
        const cancelBtn = document.getElementById('cancelDeposit');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.app.hideModal();
            });
        }
        
        if (depositForm) {
            depositForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleDepositSubmit();
            });
        }
    }

    bindWithdrawFormEvents() {
        const withdrawForm = document.getElementById('withdrawForm');
        const cancelBtn = document.getElementById('cancelWithdraw');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.app.hideModal();
            });
        }
        
        if (withdrawForm) {
            withdrawForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleWithdrawSubmit();
            });
        }
    }

    async handleDepositSubmit() {
        const amount = document.getElementById('depositAmount').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const trxHash = document.getElementById('trxHash').value;
        const description = document.getElementById('depositDescription').value;
        
        if (!amount || parseFloat(amount) < 0.01) {
            this.app.showToast('请输入有效的充值金额', 'error');
            return;
        }
        
        try {
            const confirmBtn = document.getElementById('confirmDeposit');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
            
            const response = await this.app.api.request('wallet/deposit', 'POST', {
                amount: parseFloat(amount),
                paymentMethod,
                trxHash: trxHash || null,
                description: description || '用户充值申请'
            }, this.app.token);
            
            if (response.success) {
                this.app.hideModal();
                this.app.showToast('充值申请提交成功！', 'success');
                // 刷新钱包数据
                this.loadWalletData(this.app.token, this.app.user);
            } else {
                throw new Error(response.message || '充值申请失败');
            }
        } catch (error) {
            console.error('充值申请失败:', error);
            this.app.showToast(error.message || '充值申请失败，请重试', 'error');
        } finally {
            const confirmBtn = document.getElementById('confirmDeposit');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交充值申请';
            }
        }
    }

    async handleWithdrawSubmit() {
        const amount = document.getElementById('withdrawAmount').value;
        const address = document.getElementById('withdrawAddress').value;
        const password = document.getElementById('withdrawPassword').value;
        
        if (!amount || parseFloat(amount) < 10.00) {
            this.app.showToast('最小提现金额为10.00 USDT', 'error');
            return;
        }
        
        if (!address) {
            this.app.showToast('请输入提现地址', 'error');
            return;
        }
        
        if (!password) {
            this.app.showToast('请输入资金密码', 'error');
            return;
        }
        
        try {
            const confirmBtn = document.getElementById('confirmWithdraw');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
            
            const response = await this.app.api.request('wallet/withdraw', 'POST', {
                amount: parseFloat(amount),
                trc20Wallet: address,
                password: password
            }, this.app.token);
            
            if (response.success) {
                this.app.hideModal();
                this.app.showToast('提现申请提交成功，等待审核！', 'success');
                // 刷新钱包数据
                this.loadWalletData(this.app.token, this.app.user);
            } else {
                throw new Error(response.message || '提现申请失败');
            }
        } catch (error) {
            console.error('提现申请失败:', error);
            this.app.showToast(error.message || '提现申请失败，请重试', 'error');
        } finally {
            const confirmBtn = document.getElementById('confirmWithdraw');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交提现申请';
            }
        }
    }

    updateAvailableBalance() {
        const balanceEl = document.getElementById('availableBalance');
        if (balanceEl && this.walletData && this.walletData.balance !== undefined) {
            balanceEl.textContent = parseFloat(this.walletData.balance).toFixed(2);
        }
    }

    bindEvents() {
        // 绑定充值按钮事件
        const depositBtn = document.getElementById('depositBtn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => {
                this.showDepositModal();
            });
        }

        // 绑定提现按钮事件
        const withdrawBtn = document.getElementById('withdrawBtn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => {
                this.showWithdrawModal();
            });
        }
    }

    destroy() {
        // 清理资源
    }
}

export default Wallet;
