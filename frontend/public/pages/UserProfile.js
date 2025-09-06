import apiService from '../services/apiService.js';

class UserProfile {
    constructor() {
        this.isLoading = false;
        this.userProfile = null;
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="profile-container">
                    <div class="login-prompt">
                        <div class="login-icon">
                            <i class="fas fa-user-circle fa-3x"></i>
                        </div>
                        <h2>请先登录</h2>
                        <p>登录后可查看个人资料</p>
                        <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                    </div>
                </div>
            `;
        }

        // 显示加载状态
        let profileContent = `
            <div class="user-profile-page">
                <div class="profile-header">
                    <h2>个人资料</h2>
                    <div id="profileLoading" class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> 加载中...
                    </div>
                </div>
                
                <div class="profile-content">
                    <div class="profile-section">
                        <h3>基本信息</h3>
                        <div id="basicInfo" class="loading-placeholder">
                            <div class="form-group">
                                <label class="form-label">姓名</label>
                                <input type="text" class="form-control" value="加载中..." disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">邮箱</label>
                                <input type="email" class="form-control" value="加载中..." disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">用户ID</label>
                                <input type="text" class="form-control" value="加载中..." disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">注册时间</label>
                                <input type="text" class="form-control" value="加载中..." disabled>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3>修改密码</h3>
                        <div id="passwordMessage"></div>
                        <div class="form-group">
                            <label class="form-label">当前密码</label>
                            <input type="password" id="currentPassword" class="form-control" placeholder="请输入当前密码">
                        </div>
                        <div class="form-group">
                            <label class="form-label">新密码</label>
                            <input type="password" id="newPassword" class="form-control" placeholder="请输入新密码">
                        </div>
                        <div class="form-group">
                            <label class="form-label">确认新密码</label>
                            <input type="password" id="confirmPassword" class="form-control" placeholder="请再次输入新密码">
                        </div>
                        <button id="changePasswordBtn" class="btn btn-primary">修改密码</button>
                    </div>
                    
                    <div class="profile-section">
                        <h3>钱包设置</h3>
                        <div id="walletMessage"></div>
                        <div class="form-group">
                            <label class="form-label">TRC-20 钱包地址</label>
                            <input type="text" id="walletAddress" class="form-control" placeholder="请输入您的TRC-20钱包地址" ${user.trc20Wallet ? `value="${user.trc20Wallet}"` : ''}>
                        </div>
                        <button id="saveWalletBtn" class="btn btn-primary">保存钱包地址</button>
                    </div>
                </div>
            </div>
        `;

        return profileContent;
    }

    async afterRender(token, user) {
        if (!token || !user) {
            // 绑定登录按钮事件
            const loginButton = document.querySelector('[data-page="login"]');
            if (loginButton) {
                loginButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const event = new CustomEvent('navigate', { detail: { page: 'login' } });
                    document.dispatchEvent(event);
                });
            }
            return;
        }

        // 加载用户个人资料
        await this.loadUserProfile();

        // 绑定修改密码按钮事件
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange();
            });
        }
        
        // 绑定保存钱包地址按钮事件
        const saveWalletBtn = document.getElementById('saveWalletBtn');
        if (saveWalletBtn) {
            saveWalletBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleWalletSave();
            });
        }
    }

    /**
     * 加载用户个人资料
     */
    async loadUserProfile() {
        try {
            this.isLoading = true;
            this.showLoadingState();

            // 调用API获取用户个人资料
            const response = await apiService.getUserProfile();
            
            if (response.success) {
                this.userProfile = response.data.profile;
                this.userStatistics = response.data.statistics;
                this.updateBasicInfo();
                this.hideLoadingState();
            } else {
                throw new Error(response.error || '获取个人资料失败');
            }
        } catch (error) {
            console.error('加载用户个人资料失败:', error);
            this.showError('加载个人资料失败: ' + error.message);
            this.hideLoadingState();
        }
    }

    /**
     * 更新基本信息显示
     */
    updateBasicInfo() {
        if (!this.userProfile) return;

        const basicInfo = document.getElementById('basicInfo');
        if (basicInfo) {
            // 智能显示逻辑：根据注册方式显示邮箱和Telegram ID
            const emailDisplay = this.getEmailDisplay();
            const telegramDisplay = this.getTelegramDisplay();
            
            basicInfo.innerHTML = `
                <div class="form-group">
                    <label class="form-label">姓名</label>
                    <input type="text" class="form-control" value="${((this.userProfile.first_name || '') + ' ' + (this.userProfile.last_name || '')).trim() || '未设置'}" disabled>
                </div>
                ${emailDisplay}
                ${telegramDisplay}
                <div class="form-group">
                    <label class="form-label">用户ID</label>
                    <input type="text" class="form-control" value="${this.userProfile.id || '未知'}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">注册时间</label>
                    <input type="text" class="form-control" value="${this.userProfile.created_at ? new Date(this.userProfile.created_at).toLocaleString() : '未知'}" disabled>
                </div>
            `;
            
            // 添加绑定功能的事件监听器
            this.attachBindingListeners();
        }
    }

    /**
     * 获取邮箱显示内容
     */
    getEmailDisplay() {
        if (this.userProfile.email) {
            return `
                <div class="form-group">
                    <label class="form-label">邮箱</label>
                    <input type="email" class="form-control" value="${this.userProfile.email}" disabled>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label class="form-label">邮箱</label>
                    <div class="form-control-wrapper">
                        <span class="binding-link" id="emailBindingLink" style="color: #007bff; cursor: pointer; text-decoration: underline;">待绑定</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 获取Telegram ID显示内容
     */
    getTelegramDisplay() {
        if (this.userProfile.telegram_id) {
            return `
                <div class="form-group">
                    <label class="form-label">Telegram ID</label>
                    <input type="text" class="form-control" value="${this.userProfile.telegram_id}" disabled>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label class="form-label">Telegram ID</label>
                    <div class="form-control-wrapper">
                        <span class="binding-link" id="telegramBindingLink" style="color: #007bff; cursor: pointer; text-decoration: underline;">待绑定</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 添加绑定功能的事件监听器
     */
    attachBindingListeners() {
        // 邮箱绑定事件
        const emailBindingLink = document.getElementById('emailBindingLink');
        if (emailBindingLink) {
            emailBindingLink.addEventListener('click', () => {
                this.handleEmailBinding();
            });
        }

        // Telegram绑定事件
        const telegramBindingLink = document.getElementById('telegramBindingLink');
        if (telegramBindingLink) {
            telegramBindingLink.addEventListener('click', () => {
                this.handleTelegramBinding();
            });
        }
    }

    /**
     * 处理邮箱绑定
     */
    async handleEmailBinding() {
        this.showEmailBindingModal();
    }

    /**
     * 处理Telegram绑定
     */
    async handleTelegramBinding() {
        this.showTelegramBindingModal();
    }

    /**
     * 显示邮箱绑定模态框
     */
    showEmailBindingModal() {
        // 创建模态框HTML
        const modalHtml = `
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #333;
                }
                .modal-close {
                    font-size: 28px;
                    cursor: pointer;
                    color: #aaa;
                }
                .modal-close:hover {
                    color: #000;
                }
                .modal-body {
                    padding: 20px;
                }
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .form-control-wrapper {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: #f8f9fa;
                    display: flex;
                    align-items: center;
                    min-height: 38px;
                }
            </style>
            <div id="emailBindingModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>绑定邮箱</h3>
                        <span class="modal-close" id="closeEmailModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div id="emailBindingMessage"></div>
                        <div class="form-group">
                            <label class="form-label">邮箱地址</label>
                            <input type="email" id="bindingEmail" class="form-control" placeholder="请输入邮箱地址">
                        </div>
                        <div class="form-group">
                            <label class="form-label">确认邮箱地址</label>
                            <input type="email" id="confirmBindingEmail" class="form-control" placeholder="请再次输入邮箱地址">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelEmailBinding">取消</button>
                        <button type="button" class="btn btn-primary" id="confirmEmailBinding">确认绑定</button>
                    </div>
                </div>
            </div>
        `;

        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定模态框事件
        this.attachModalEvents();
    }

    /**
     * 绑定模态框事件
     */
    attachModalEvents() {
        const modal = document.getElementById('emailBindingModal');
        const closeBtn = document.getElementById('closeEmailModal');
        const cancelBtn = document.getElementById('cancelEmailBinding');
        const confirmBtn = document.getElementById('confirmEmailBinding');

        // 关闭模态框事件
        const closeModal = () => {
            if (modal) {
                modal.remove();
            }
        };

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        // 点击背景关闭模态框
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // 确认绑定事件
        confirmBtn?.addEventListener('click', async () => {
            await this.processEmailBinding();
        });
    }

    /**
     * 处理邮箱绑定提交
     */
    async processEmailBinding() {
        const email = document.getElementById('bindingEmail').value;
        const confirmEmail = document.getElementById('confirmBindingEmail').value;
        const messageDiv = document.getElementById('emailBindingMessage');

        // 验证输入
        if (!email || !confirmEmail) {
            this.showMessage(messageDiv, '请填写所有邮箱字段', 'danger');
            return;
        }

        if (email !== confirmEmail) {
            this.showMessage(messageDiv, '两次输入的邮箱地址不一致', 'danger');
            return;
        }

        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage(messageDiv, '请输入有效的邮箱地址', 'danger');
            return;
        }

        try {
            this.showMessage(messageDiv, '正在绑定邮箱...', 'info');

            // 调用API绑定邮箱
            const response = await apiService.updateUserProfile({
                email: email
            });

            if (response.success) {
                this.showMessage(messageDiv, '邮箱绑定成功！页面将自动刷新。', 'success');
                
                setTimeout(() => {
                    // 关闭模态框并刷新用户资料
                    document.getElementById('emailBindingModal')?.remove();
                    this.loadUserProfile();
                }, 1500);
            } else {
                throw new Error(response.error || '邮箱绑定失败');
            }
        } catch (error) {
            console.error('邮箱绑定失败:', error);
            this.showMessage(messageDiv, '邮箱绑定失败: ' + error.message, 'danger');
        }
    }

    /**
     * 处理密码修改
     */
    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('passwordMessage');
        
        // 验证输入
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showMessage(messageDiv, '请填写所有密码字段', 'danger');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showMessage(messageDiv, '新密码和确认密码不一致', 'danger');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showMessage(messageDiv, '密码长度至少6位', 'danger');
            return;
        }
        
        try {
            this.showMessage(messageDiv, '正在修改密码...', 'info');
            
            // 调用API修改密码
            const response = await apiService.changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });
            
            if (response.success) {
                this.showMessage(messageDiv, '密码修改成功', 'success');
                
                // 清空密码字段
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                throw new Error(response.error || '密码修改失败');
            }
        } catch (error) {
            console.error('密码修改失败:', error);
            this.showMessage(messageDiv, '密码修改失败: ' + error.message, 'danger');
        }
    }

    /**
     * 处理钱包地址保存
     */
    async handleWalletSave() {
        const walletAddress = document.getElementById('walletAddress').value;
        const messageDiv = document.getElementById('walletMessage');
        
        if (!walletAddress) {
            this.showMessage(messageDiv, '请输入钱包地址', 'danger');
            return;
        }
        
        try {
            this.showMessage(messageDiv, '正在保存...', 'info');
            
            // 调用API保存钱包地址
            const response = await apiService.updateUserProfile({
                trc20_wallet: walletAddress
            });
            
            if (response.success) {
                this.showMessage(messageDiv, '钱包地址保存成功', 'success');
                
                // 更新本地存储的用户信息
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    currentUser.trc20Wallet = walletAddress;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            } else {
                throw new Error(response.error || '保存失败');
            }
        } catch (error) {
            console.error('保存钱包地址失败:', error);
            this.showMessage(messageDiv, '保存失败: ' + error.message, 'danger');
        }
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const loadingElement = document.getElementById('profileLoading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const loadingElement = document.getElementById('profileLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * 显示消息
     */
    showMessage(element, message, type) {
        if (element) {
            element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const basicInfo = document.getElementById('basicInfo');
        if (basicInfo) {
            basicInfo.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> ${message}
                    <button class="btn btn-sm btn-outline-danger ml-2" onclick="location.reload()">重试</button>
                </div>
            `;
        }
    }

    /**
     * 显示Telegram绑定引导模态框
     */
    showTelegramBindingModal() {
        const modalHtml = `
            <style>
                .telegram-binding-modal .modal-body {
                    text-align: center;
                    padding: 30px 20px;
                }
                .telegram-binding-modal .telegram-icon {
                    font-size: 48px;
                    color: #0088cc;
                    margin-bottom: 20px;
                }
                .telegram-binding-modal .step-list {
                    text-align: left;
                    margin: 20px 0;
                }
                .telegram-binding-modal .step-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }
                .telegram-binding-modal .step-number {
                    background-color: #0088cc;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                .telegram-binding-modal .step-text {
                    flex: 1;
                    line-height: 1.5;
                }
                .telegram-binding-modal .bot-link {
                    display: inline-block;
                    background-color: #0088cc;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                    margin: 20px 0;
                    transition: background-color 0.3s;
                }
                .telegram-binding-modal .bot-link:hover {
                    background-color: #006699;
                    color: white;
                    text-decoration: none;
                }
            </style>
            <div id="telegramBindingModal" class="modal-overlay telegram-binding-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>绑定Telegram账号</h3>
                        <span class="modal-close" id="closeTelegramModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="telegram-icon">
                            <i class="fab fa-telegram-plane"></i>
                        </div>
                        <h4>请按照以下步骤完成绑定</h4>
                        
                        <div class="step-list">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-text">点击下方按钮打开FitChallenge官方机器人</div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-text">在Telegram中发送 <strong>/start</strong> 命令启动机器人</div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-text">发送 <strong>/bind</strong> 命令开始绑定流程</div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">4</div>
                                <div class="step-text">按机器人提示完成身份验证</div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">5</div>
                                <div class="step-text">返回此页面刷新查看绑定结果</div>
                            </div>
                        </div>

                        <a href="https://t.me/Fit_FitChallengeBOT" target="_blank" class="bot-link">
                            <i class="fab fa-telegram-plane"></i> 打开FitChallenge机器人
                        </a>

                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            <i class="fas fa-info-circle"></i> 
                            绑定后您可以使用Telegram快捷登录，享受更便捷的体验
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelTelegramBinding">稍后绑定</button>
                        <button type="button" class="btn btn-primary" id="refreshAfterBinding">我已完成绑定</button>
                    </div>
                </div>
            </div>
        `;

        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定模态框事件
        this.bindTelegramModalEvents();
    }

    /**
     * 绑定Telegram模态框事件
     */
    bindTelegramModalEvents() {
        const modal = document.getElementById('telegramBindingModal');
        const closeBtn = document.getElementById('closeTelegramModal');
        const cancelBtn = document.getElementById('cancelTelegramBinding');
        const refreshBtn = document.getElementById('refreshAfterBinding');

        // 关闭模态框函数
        const closeModal = () => {
            modal?.remove();
        };

        // 绑定关闭事件
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        
        // 点击背景关闭
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // 刷新按钮事件
        refreshBtn?.addEventListener('click', async () => {
            try {
                // 显示加载状态
                refreshBtn.disabled = true;
                refreshBtn.textContent = '刷新中...';
                
                // 重新加载用户资料
                await this.loadUserProfile();
                
                // 关闭模态框
                closeModal();
                
                // 显示成功消息
                alert('资料已刷新！如果绑定成功，Telegram ID将会显示。');
            } catch (error) {
                console.error('刷新用户资料失败:', error);
                alert('刷新失败，请稍后重试');
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.textContent = '我已完成绑定';
            }
        });
    }
}

export default UserProfile;