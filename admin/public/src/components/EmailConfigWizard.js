/**
 * 邮箱配置向导组件
 * 提供步骤化的邮箱SMTP配置界面
 */
import { getBadgeClassForStatus } from '../shared/mappings/badgeStyles.js';
class EmailConfigWizard {
    constructor(emailValidator, app) {
        this.emailValidator = emailValidator;
        this.app = app;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.config = {};
        this.isVisible = false;
        this.containerId = 'email-config-wizard';
    }

    // 显示向导
    show() {
        this.isVisible = true;
        this.currentStep = 1;
        this.config = this.emailValidator.getConfig();
        this.render();
        this.bindEvents();
    }

    // 隐藏向导
    hide() {
        this.isVisible = false;
        const container = document.getElementById(this.containerId);
        if (container) {
            container.remove();
        }
    }

    // 渲染向导界面
    render() {
        const existingContainer = document.getElementById(this.containerId);
        if (existingContainer) {
            existingContainer.remove();
        }

        const wizardHTML = `
            <div id="${this.containerId}" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-envelope-open-text me-2"></i>
                                邮箱验证器配置向导
                            </h5>
                            <button type="button" class="btn-close btn-close-white" id="wizard-close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- 进度条 -->
                            <div class="mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted">配置进度</span>
                                    <span class="${getBadgeClassForStatus('progress', 'step')}">${this.currentStep}/${this.totalSteps}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar bg-primary" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                                </div>
                            </div>
                            
                            <!-- 步骤内容 -->
                            <div id="wizard-content">
                                ${this.renderStepContent()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="wizard-prev" ${this.currentStep === 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-left me-1"></i>上一步
                            </button>
                            <button type="button" class="btn btn-primary" id="wizard-next">
                                ${this.currentStep === this.totalSteps ? '完成配置' : '下一步'}
                                ${this.currentStep === this.totalSteps ? '<i class="fas fa-check ms-1"></i>' : '<i class="fas fa-chevron-right ms-1"></i>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', wizardHTML);
    }

    // 渲染步骤内容
    renderStepContent() {
        switch (this.currentStep) {
            case 1:
                return this.renderStep1(); // SMTP基础配置
            case 2:
                return this.renderStep2(); // 认证设置
            case 3:
                return this.renderStep3(); // 邮件模板配置
            case 4:
                return this.renderStep4(); // 测试和完成
            default:
                return '';
        }
    }

    // 步骤1：SMTP基础配置
    renderStep1() {
        return `
            <div class="step-content">
                <h6 class="text-primary mb-3">
                    <i class="fas fa-server me-2"></i>SMTP服务器配置
                </h6>
                <p class="text-muted mb-4">请配置您的SMTP邮件服务器信息</p>
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="mb-3">
                            <label class="form-label">SMTP主机地址 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="smtp-host" 
                                   value="${this.config.smtp?.host || ''}" 
                                   placeholder="例如：smtp.gmail.com">
                            <div class="form-text">常见服务商：Gmail(smtp.gmail.com), QQ邮箱(smtp.qq.com), 163邮箱(smtp.163.com)</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">端口 <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="smtp-port" 
                                   value="${this.config.smtp?.port || 587}" 
                                   min="1" max="65535">
                            <div class="form-text">通常：587(TLS) 或 465(SSL)</div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="smtp-secure" 
                               ${this.config.smtp?.secure ? 'checked' : ''}>
                        <label class="form-check-label" for="smtp-secure">
                            使用SSL/TLS安全连接
                        </label>
                    </div>
                    <div class="form-text">建议启用以确保邮件传输安全</div>
                </div>
                
                <!-- 快速配置模板 -->
                <div class="mt-4">
                    <h6 class="text-muted mb-2">快速配置模板</h6>
                    <div class="row">
                        <div class="col-md-4">
                            <button type="button" class="btn btn-outline-primary btn-sm w-100" id="preset-gmail">
                                <i class="fab fa-google me-1"></i>Gmail
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button type="button" class="btn btn-outline-primary btn-sm w-100" id="preset-qq">
                                <i class="fas fa-envelope me-1"></i>QQ邮箱
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button type="button" class="btn btn-outline-primary btn-sm w-100" id="preset-163">
                                <i class="fas fa-envelope me-1"></i>163邮箱
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 步骤2：认证设置
    renderStep2() {
        return `
            <div class="step-content">
                <h6 class="text-primary mb-3">
                    <i class="fas fa-key me-2"></i>邮箱认证信息
                </h6>
                <p class="text-muted mb-4">请输入您的邮箱账户认证信息</p>
                
                <div class="mb-3">
                    <label class="form-label">邮箱地址 <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="smtp-user" 
                           value="${this.config.smtp?.auth?.user || ''}" 
                           placeholder="your-email@example.com">
                    <div class="form-text">这将作为发件人邮箱地址</div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">邮箱密码或授权码 <span class="text-danger">*</span></label>
                    <div class="input-group">
                        <input type="password" class="form-control" id="smtp-pass" 
                               value="${this.config.smtp?.auth?.pass || ''}" 
                               placeholder="输入密码或授权码">
                        <button class="btn btn-outline-secondary" type="button" id="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="form-text">
                        <strong>注意：</strong>Gmail、QQ邮箱等需要使用<strong>应用专用密码</strong>或<strong>授权码</strong>，而非登录密码
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">发件人显示名称</label>
                    <input type="text" class="form-control" id="from-name" 
                           value="${this.config.settings?.fromName || 'FitChallenge'}" 
                           placeholder="FitChallenge">
                    <div class="form-text">收件人看到的发件人名称</div>
                </div>
                
                <!-- 安全提示 -->
                <div class="alert alert-info">
                    <h6 class="alert-heading">
                        <i class="fas fa-info-circle me-2"></i>安全提示
                    </h6>
                    <ul class="mb-0">
                        <li><strong>Gmail：</strong>需要开启"两步验证"并生成"应用专用密码"</li>
                        <li><strong>QQ邮箱：</strong>需要开启"SMTP服务"并获取"授权码"</li>
                        <li><strong>163邮箱：</strong>需要开启"客户端授权密码"功能</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // 步骤3：邮件模板配置
    renderStep3() {
        return `
            <div class="step-content">
                <h6 class="text-primary mb-3">
                    <i class="fas fa-file-alt me-2"></i>邮件模板配置
                </h6>
                <p class="text-muted mb-4">配置系统发送的邮件模板</p>
                
                <!-- 基础设置 -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">超时时间（毫秒）</label>
                            <input type="number" class="form-control" id="email-timeout" 
                                   value="${this.config.settings?.timeout || 30000}" 
                                   min="5000" max="300000" step="1000">
                            <div class="form-text">邮件发送超时时间（5-300秒）</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">重试次数</label>
                            <input type="number" class="form-control" id="retry-attempts" 
                                   value="${this.config.settings?.retryAttempts || 3}" 
                                   min="1" max="10">
                            <div class="form-text">发送失败时的重试次数</div>
                        </div>
                    </div>
                </div>
                
                <!-- 邮件模板预览 -->
                <div class="mb-3">
                    <label class="form-label">邮件模板预览</label>
                    <div class="nav nav-tabs" id="template-tabs" role="tablist">
                        <button class="nav-link active" id="verification-tab" data-bs-toggle="tab" 
                                data-bs-target="#verification-template" type="button">邮箱验证</button>
                        <button class="nav-link" id="password-reset-tab" data-bs-toggle="tab" 
                                data-bs-target="#password-reset-template" type="button">密码重置</button>
                    </div>
                    <div class="tab-content mt-3" id="template-content">
                        <div class="tab-pane fade show active" id="verification-template">
                            <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto; background: #f8f9fa;">
                                ${this.config.templates?.verification?.html || ''}
                            </div>
                        </div>
                        <div class="tab-pane fade" id="password-reset-template">
                            <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto; background: #f8f9fa;">
                                ${this.config.templates?.passwordReset?.html || ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 启用开关 -->
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="email-enabled" 
                           ${this.config.settings?.enabled ? 'checked' : ''}>
                    <label class="form-check-label" for="email-enabled">
                        <strong>启用邮箱验证功能</strong>
                    </label>
                </div>
                <div class="form-text">启用后，系统将使用配置的SMTP服务发送验证邮件</div>
            </div>
        `;
    }

    // 步骤4：测试和完成
    renderStep4() {
        return `
            <div class="step-content">
                <h6 class="text-primary mb-3">
                    <i class="fas fa-check-circle me-2"></i>测试配置并完成
                </h6>
                <p class="text-muted mb-4">在完成配置前，让我们测试一下邮箱连接</p>
                
                <!-- 配置摘要 -->
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">配置摘要</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>SMTP服务器：</strong> ${this.config.smtp?.host || '未配置'}</p>
                                <p><strong>端口：</strong> ${this.config.smtp?.port || '未配置'}</p>
                                <p><strong>安全连接：</strong> ${this.config.smtp?.secure ? '是' : '否'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>发件人：</strong> ${this.config.smtp?.auth?.user || '未配置'}</p>
                                <p><strong>显示名称：</strong> ${this.config.settings?.fromName || '未配置'}</p>
                                <p><strong>功能状态：</strong> ${this.config.settings?.enabled ? '启用' : '禁用'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 连接测试 -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">连接测试</h6>
                        <button type="button" class="btn btn-outline-primary btn-sm" id="test-connection">
                            <i class="fas fa-plug me-1"></i>测试连接
                        </button>
                    </div>
                    <div id="connection-result" class="alert" style="display: none;"></div>
                </div>
                
                <!-- 邮件发送测试 -->
                <div class="mb-4">
                    <h6 class="mb-2">邮件发送测试</h6>
                    <div class="input-group">
                        <input type="email" class="form-control" id="test-email" 
                               placeholder="输入测试邮箱地址" value="">
                        <button class="btn btn-outline-success" type="button" id="send-test-email">
                            <i class="fas fa-paper-plane me-1"></i>发送测试邮件
                        </button>
                    </div>
                    <div id="email-test-result" class="alert mt-2" style="display: none;"></div>
                </div>
                
                <!-- 最终确认 -->
                <div class="alert alert-success">
                    <h6 class="alert-heading">
                        <i class="fas fa-thumbs-up me-2"></i>准备完成配置
                    </h6>
                    <p class="mb-0">
                        配置完成后，系统将使用新的邮箱设置发送验证邮件。
                        建议先进行连接和邮件测试以确保配置正确。
                    </p>
                </div>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // 关闭按钮
        container.querySelector('#wizard-close')?.addEventListener('click', () => this.hide());

        // 上一步按钮
        container.querySelector('#wizard-prev')?.addEventListener('click', () => this.prevStep());

        // 下一步按钮
        container.querySelector('#wizard-next')?.addEventListener('click', () => this.nextStep());

        // 绑定当前步骤的特定事件
        this.bindStepEvents();
    }

    // 绑定步骤特定事件
    bindStepEvents() {
        switch (this.currentStep) {
            case 1:
                this.bindStep1Events();
                break;
            case 2:
                this.bindStep2Events();
                break;
            case 3:
                this.bindStep3Events();
                break;
            case 4:
                this.bindStep4Events();
                break;
        }
    }

    // 步骤1事件绑定
    bindStep1Events() {
        // 快速配置预设
        document.getElementById('preset-gmail')?.addEventListener('click', () => {
            this.applyPreset('gmail');
        });
        document.getElementById('preset-qq')?.addEventListener('click', () => {
            this.applyPreset('qq');
        });
        document.getElementById('preset-163')?.addEventListener('click', () => {
            this.applyPreset('163');
        });
    }

    // 步骤2事件绑定
    bindStep2Events() {
        // 密码显示/隐藏切换
        document.getElementById('toggle-password')?.addEventListener('click', () => {
            const passInput = document.getElementById('smtp-pass');
            const icon = document.querySelector('#toggle-password i');
            
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }

    // 步骤3事件绑定
    bindStep3Events() {
        // 标签页切换事件已由Bootstrap处理
    }

    // 步骤4事件绑定
    bindStep4Events() {
        // 连接测试
        document.getElementById('test-connection')?.addEventListener('click', async () => {
            await this.testConnection();
        });

        // 发送测试邮件
        document.getElementById('send-test-email')?.addEventListener('click', async () => {
            await this.sendTestEmail();
        });
    }

    // 应用预设配置
    applyPreset(provider) {
        const presets = {
            gmail: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false
            },
            qq: {
                host: 'smtp.qq.com',
                port: 587,
                secure: false
            },
            163: {
                host: 'smtp.163.com',
                port: 465,
                secure: true
            }
        };

        const preset = presets[provider];
        if (preset) {
            document.getElementById('smtp-host').value = preset.host;
            document.getElementById('smtp-port').value = preset.port;
            document.getElementById('smtp-secure').checked = preset.secure;
        }
    }

    // 上一步
    prevStep() {
        if (this.currentStep > 1) {
            this.saveCurrentStepData();
            this.currentStep--;
            this.render();
            this.bindEvents();
        }
    }

    // 下一步
    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.render();
                this.bindEvents();
            } else {
                // 完成配置
                this.completeConfiguration();
            }
        }
    }

    // 验证当前步骤
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            case 4:
                return true; // 最后一步无需验证
            default:
                return false;
        }
    }

    // 验证步骤1
    validateStep1() {
        const host = document.getElementById('smtp-host')?.value.trim();
        const port = document.getElementById('smtp-port')?.value;

        if (!host) {
            this.showError('请输入SMTP主机地址');
            return false;
        }

        if (!port || port < 1 || port > 65535) {
            this.showError('请输入有效的端口号（1-65535）');
            return false;
        }

        return true;
    }

    // 验证步骤2
    validateStep2() {
        const user = document.getElementById('smtp-user')?.value.trim();
        const pass = document.getElementById('smtp-pass')?.value.trim();

        if (!user) {
            this.showError('请输入邮箱地址');
            return false;
        }

        if (!this.emailValidator.isValidEmail(user)) {
            this.showError('请输入有效的邮箱地址');
            return false;
        }

        if (!pass) {
            this.showError('请输入邮箱密码或授权码');
            return false;
        }

        return true;
    }

    // 验证步骤3
    validateStep3() {
        const timeout = document.getElementById('email-timeout')?.value;
        const retryAttempts = document.getElementById('retry-attempts')?.value;

        if (timeout && (timeout < 5000 || timeout > 300000)) {
            this.showError('超时时间必须在5-300秒之间');
            return false;
        }

        if (retryAttempts && (retryAttempts < 1 || retryAttempts > 10)) {
            this.showError('重试次数必须在1-10次之间');
            return false;
        }

        return true;
    }

    // 保存当前步骤数据
    saveCurrentStepData() {
        switch (this.currentStep) {
            case 1:
                this.config.smtp = {
                    ...this.config.smtp,
                    host: document.getElementById('smtp-host')?.value.trim() || '',
                    port: parseInt(document.getElementById('smtp-port')?.value) || 587,
                    secure: document.getElementById('smtp-secure')?.checked || false
                };
                break;
                
            case 2:
                this.config.smtp.auth = {
                    user: document.getElementById('smtp-user')?.value.trim() || '',
                    pass: document.getElementById('smtp-pass')?.value.trim() || ''
                };
                this.config.settings = {
                    ...this.config.settings,
                    fromName: document.getElementById('from-name')?.value.trim() || 'FitChallenge',
                    fromEmail: document.getElementById('smtp-user')?.value.trim() || ''
                };
                break;
                
            case 3:
                this.config.settings = {
                    ...this.config.settings,
                    timeout: parseInt(document.getElementById('email-timeout')?.value) || 30000,
                    retryAttempts: parseInt(document.getElementById('retry-attempts')?.value) || 3,
                    enabled: document.getElementById('email-enabled')?.checked || false
                };
                break;
        }
    }

    // 连接测试
    async testConnection() {
        const button = document.getElementById('test-connection');
        const resultDiv = document.getElementById('connection-result');
        
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>测试中...';
        
        try {
            const result = await this.emailValidator.testConnection(this.config);
            
            resultDiv.style.display = 'block';
            if (result.success) {
                resultDiv.className = 'alert alert-success';
                resultDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i>${result.message}`;
            } else {
                resultDiv.className = 'alert alert-danger';
                resultDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${result.message}`;
            }
        } catch (error) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'alert alert-danger';
            resultDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>测试异常: ${error.message}`;
        }
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-plug me-1"></i>测试连接';
    }

    // 发送测试邮件
    async sendTestEmail() {
        const emailInput = document.getElementById('test-email');
        const button = document.getElementById('send-test-email');
        const resultDiv = document.getElementById('email-test-result');
        
        const testEmail = emailInput.value.trim();
        if (!testEmail) {
            this.showError('请输入测试邮箱地址');
            return;
        }
        
        if (!this.emailValidator.isValidEmail(testEmail)) {
            this.showError('请输入有效的邮箱地址');
            return;
        }
        
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>发送中...';
        
        try {
            const result = await this.emailValidator.sendTestEmail(testEmail, this.config);
            
            resultDiv.style.display = 'block';
            if (result.success) {
                resultDiv.className = 'alert alert-success';
                resultDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i>${result.message}`;
            } else {
                resultDiv.className = 'alert alert-danger';
                resultDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${result.message}`;
            }
        } catch (error) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'alert alert-danger';
            resultDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>发送异常: ${error.message}`;
        }
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane me-1"></i>发送测试邮件';
    }

    // 完成配置
    async completeConfiguration() {
        try {
            // 保存配置
            await this.emailValidator.saveConfig(this.config);
            
            // 显示成功消息
            if (this.app.showToast) {
                this.app.showToast('邮箱验证器配置完成！', 'success');
            }
            
            // 隐藏向导
            this.hide();
            
            // 刷新父页面
            if (typeof window.location !== 'undefined') {
                window.location.reload();
            }
            
        } catch (error) {
            this.showError('配置保存失败: ' + error.message);
        }
    }

    // 显示错误信息
    showError(message) {
        if (this.app.showToast) {
            this.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

export default EmailConfigWizard;
