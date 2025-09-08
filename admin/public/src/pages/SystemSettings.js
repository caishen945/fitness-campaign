/**
 * 系统设置页面 - 包含版本管理功能和邮箱验证器配置
 */
import { getBadgeClassForStatus } from '../shared/mappings/badgeStyles.js';
class SystemSettings {
    constructor(app) {
        this.app = app;
        this.versionInfo = null;
        this.emailValidator = null;
        this.emailWizard = null;
        this.isInitialized = false;
    }

    async loadVersionInfo() {
        try {
            const response = await fetch('/api/version/info', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`
                }
            });
            
            if (response.ok) {
                this.versionInfo = await response.json();
            } else {
                this.versionInfo = {
                    version: '3.0.2',
                    timestamp: Date.now(),
                    lastUpdated: new Date().toISOString(),
                    formattedTime: new Date().toLocaleString('zh-CN')
                };
            }
        } catch (error) {
            console.error('版本信息加载失败:', error);
            this.versionInfo = {
                version: '3.0.2',
                timestamp: Date.now(),
                lastUpdated: new Date().toISOString(),
                formattedTime: new Date().toLocaleString('zh-CN')
            };
        }
    }

    // 初始化邮箱验证器模块
    async initializeEmailModules() {
        try {
            console.log('🚀 初始化邮箱验证器模块...');
            
            // 动态导入邮箱模块
            const EmailValidator = await import('../utils/EmailValidator.js');
            const EmailConfigWizard = await import('../components/EmailConfigWizard.js');
            
            this.emailValidator = new EmailValidator.default(this.app);
            this.emailWizard = new EmailConfigWizard.default(this.emailValidator, this.app);
            
            // 初始化邮箱验证器
            await this.emailValidator.initialize();
            
            console.log('✅ 邮箱验证器模块初始化完成');
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ 邮箱验证器模块初始化失败:', error);
            this.isInitialized = false;
            return false;
        }
    }

    async updateSystemVersion() {
        try {
            const newVersion = prompt('请输入新版本号（例如: 3.0.3）：');
            if (!newVersion || newVersion.trim() === '') {
                return;
            }

            const confirmUpdate = confirm(`确认将系统版本从 ${this.versionInfo.version} 更新为 ${newVersion.trim()} 吗？\n\n这将：\n- 更新所有前端和管理端版本\n- 清除所有浏览器缓存\n- 强制重新加载所有模块`);
            
            if (!confirmUpdate) {
                return;
            }

            // 显示加载状态
            const updateBtn = document.getElementById('update-version-btn');
            const originalText = updateBtn.textContent;
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';

            // 模拟版本更新API调用
            const response = await fetch('/api/version/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.app.token}`
                },
                body: JSON.stringify({
                    newVersion: newVersion.trim()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.app.showToast('版本更新成功！页面将3秒后刷新...', 'success');
                
                // 更新本地版本信息显示
                this.versionInfo = result.versionInfo;
                this.updateVersionDisplay();

                // 3秒后刷新页面
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                throw new Error('版本更新失败');
            }

        } catch (error) {
            console.error('版本更新错误:', error);
            this.app.showToast('版本更新失败: ' + error.message, 'error');
            
            // 恢复按钮状态
            const updateBtn = document.getElementById('update-version-btn');
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.textContent = '更新版本';
            }
        }
    }

    async incrementVersion() {
        try {
            const confirmUpdate = confirm(`确认自动递增版本号吗？\n\n当前版本: ${this.versionInfo.version}\n新版本: ${this.getNextVersion()}\n\n这将清除所有浏览器缓存并强制重新加载所有模块。`);
            
            if (!confirmUpdate) {
                return;
            }

            // 显示加载状态
            const incrementBtn = document.getElementById('increment-version-btn');
            const originalText = incrementBtn.textContent;
            incrementBtn.disabled = true;
            incrementBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 更新中...';

            // 模拟版本递增API调用
            const response = await fetch('/api/version/increment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.app.showToast('版本递增成功！页面将3秒后刷新...', 'success');
                
                // 更新本地版本信息显示
                this.versionInfo = result.versionInfo;
                this.updateVersionDisplay();

                // 3秒后刷新页面
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                throw new Error('版本递增失败');
            }

        } catch (error) {
            console.error('版本递增错误:', error);
            this.app.showToast('版本递增失败: ' + error.message, 'error');
            
            // 恢复按钮状态
            const incrementBtn = document.getElementById('increment-version-btn');
            if (incrementBtn) {
                incrementBtn.disabled = false;
                incrementBtn.textContent = '递增版本';
            }
        }
    }

    getNextVersion() {
        try {
            const safeVersion = this?.versionInfo?.version || '3.0.2';
            const parts = String(safeVersion).split('.');
            const major = parseInt(parts[0] || '0') || 0;
            const minor = parseInt(parts[1] || '0') || 0;
            const patch = (parseInt(parts[2] || '0') || 0) + 1;
            return `${major}.${minor}.${patch}`;
        } catch (_) {
            return '0.0.1';
        }
    }

    updateVersionDisplay() {
        const versionElement = document.getElementById('current-version');
        const timestampElement = document.getElementById('version-timestamp');
        const updatedElement = document.getElementById('last-updated');

        if (versionElement) versionElement.textContent = this.versionInfo.version;
        if (timestampElement) timestampElement.textContent = this.versionInfo.timestamp;
        if (updatedElement) updatedElement.textContent = this.versionInfo.formattedTime;
    }

    async clearAllCaches() {
        try {
            const confirmClear = confirm(`确认清除所有缓存吗？\n\n这将：\n- 清除浏览器缓存\n- 清除本地存储\n- 强制重新加载所有资源`);
            
            if (!confirmClear) {
                return;
            }

            // 清除本地存储
            localStorage.clear();
            sessionStorage.clear();

            // 清除缓存并刷新
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            this.app.showToast('缓存已清除！页面将在2秒后刷新...', 'success');

            setTimeout(() => {
                window.location.reload(true);
            }, 2000);

        } catch (error) {
            console.error('清除缓存错误:', error);
            this.app.showToast('清除缓存失败: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        // 使用更可靠的事件绑定机制，处理DOM时序问题
        this.bindEventsWithRetry();
    }
    
    // 带重试机制的事件绑定
    async bindEventsWithRetry(maxRetries = 5, delay = 100) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 系统设置事件绑定尝试 ${attempt}/${maxRetries}`);
                
                // 等待DOM完全就绪
                await this.waitForDOMReady();
                
                // 检查关键元素是否存在
                const criticalElements = [
                    'update-version-btn',
                    'increment-version-btn', 
                    'clear-cache-btn',
                    'email-config-btn',
                    'email-test-btn',
                    'email-status-btn'
                ];
                
                const missingElements = criticalElements.filter(id => !document.getElementById(id));
                if (missingElements.length > 0) {
                    console.warn(`缺少关键元素: ${missingElements.join(', ')}`);
                    throw new Error(`缺少关键元素: ${missingElements.join(', ')}`);
                }
                
                // 绑定所有事件
                this.bindVersionEvents();
                this.bindCacheEvents();
                this.bindEmailEvents();
                
                console.log('✅ 所有事件绑定成功');
                return true;
                
            } catch (error) {
                console.warn(`事件绑定尝试 ${attempt} 失败:`, error);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 1.5; // 渐进式退避
                }
            }
        }
        
        console.error('❌ 事件绑定最终失败');
        return false;
    }
    
    // 添加DOM就绪检测
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    // 分离事件绑定逻辑
    bindVersionEvents() {
        const updateBtn = document.getElementById('update-version-btn');
        const incrementBtn = document.getElementById('increment-version-btn');
        
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateSystemVersion());
            console.log('✅ 版本更新按钮事件已绑定');
        }
        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => this.incrementVersion());
            console.log('✅ 版本递增按钮事件已绑定');
        }
    }
    
    bindCacheEvents() {
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearAllCaches());
            console.log('✅ 清除缓存按钮事件已绑定');
        }
    }
    
    bindEmailEvents() {
        const emailConfigBtn = document.getElementById('email-config-btn');
        const emailTestBtn = document.getElementById('email-test-btn');
        const emailStatusBtn = document.getElementById('email-status-btn');
        
        if (emailConfigBtn) {
            emailConfigBtn.addEventListener('click', () => this.openEmailConfigWizard());
            console.log('✅ 邮箱配置按钮事件已绑定');
        }
        if (emailTestBtn) {
            emailTestBtn.addEventListener('click', () => this.testEmailConfig());
            console.log('✅ 邮箱测试按钮事件已绑定');
        }
        if (emailStatusBtn) {
            emailStatusBtn.addEventListener('click', () => this.refreshEmailStatus());
            console.log('✅ 邮箱状态按钮事件已绑定');
        }
    }

    // 打开邮箱配置向导
    async openEmailConfigWizard() {
        try {
            console.log('🔧 打开邮箱配置向导...');
            
            // 确保邮箱模块已初始化
            if (!this.isInitialized) {
                const initSuccess = await this.initializeEmailModules();
                if (!initSuccess) {
                    this.showError('邮箱模块初始化失败，无法打开配置向导');
                    return;
                }
            }
            
            // 显示配置向导
            this.emailWizard.show();
            
        } catch (error) {
            console.error('❌ 打开邮箱配置向导失败:', error);
            this.showError('打开配置向导失败: ' + error.message);
        }
    }

    // 测试邮箱配置
    async testEmailConfig() {
        try {
            console.log('🧪 测试邮箱配置...');
            
            // 确保邮箱模块已初始化
            if (!this.isInitialized) {
                const initSuccess = await this.initializeEmailModules();
                if (!initSuccess) {
                    this.showError('邮箱模块初始化失败，无法进行测试');
                    return;
                }
            }

            // 获取测试邮箱地址
            const testEmail = prompt('请输入测试邮箱地址:');
            if (!testEmail || !this.emailValidator.isValidEmail(testEmail)) {
                this.showError('请输入有效的邮箱地址');
                return;
            }

            // 显示测试进度
            this.showSuccess('正在测试邮箱配置，请稍候...');

            // 执行连接测试
            const connectionResult = await this.emailValidator.testConnection();
            if (!connectionResult.success) {
                this.showError('连接测试失败: ' + connectionResult.message);
                return;
            }

            // 发送测试邮件
            const emailResult = await this.emailValidator.sendTestEmail(testEmail);
            if (emailResult.success) {
                this.showSuccess('测试邮件发送成功！请检查收件箱。');
            } else {
                this.showError('测试邮件发送失败: ' + emailResult.message);
            }

        } catch (error) {
            console.error('❌ 邮箱配置测试失败:', error);
            this.showError('测试失败: ' + error.message);
        }
    }

    // 刷新邮箱状态
    async refreshEmailStatus() {
        try {
            console.log('🔄 刷新邮箱状态...');
            
            // 确保邮箱模块已初始化
            if (!this.isInitialized) {
                await this.initializeEmailModules();
            }

            // 更新状态显示
            this.updateEmailStatusDisplay();
            this.showSuccess('邮箱状态已刷新');

        } catch (error) {
            console.error('❌ 刷新邮箱状态失败:', error);
            this.showError('刷新状态失败: ' + error.message);
        }
    }

    // 更新邮箱状态显示
    updateEmailStatusDisplay() {
        if (!this.emailValidator) return;

        const status = this.emailValidator.getStatus();
        const statusElement = document.getElementById('email-status-display');
        
        if (statusElement) {
            const statusHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="text-center">
                            <i class="fas fa-${status.initialized ? 'check-circle text-success' : 'times-circle text-danger'} fa-2x mb-2"></i>
                            <div class="small">模块状态</div>
                            <div class="fw-bold">${status.initialized ? '已初始化' : '未初始化'}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <i class="fas fa-${status.enabled ? 'toggle-on text-success' : 'toggle-off text-secondary'} fa-2x mb-2"></i>
                            <div class="small">功能状态</div>
                            <div class="fw-bold">${status.enabled ? '已启用' : '已禁用'}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <i class="fas fa-${status.hasValidSMTP ? 'server text-success' : 'exclamation-triangle text-warning'} fa-2x mb-2"></i>
                            <div class="small">SMTP配置</div>
                            <div class="fw-bold">${status.hasValidSMTP ? '已配置' : '未配置'}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <i class="fas fa-clock text-info fa-2x mb-2"></i>
                            <div class="small">最后更新</div>
                            <div class="fw-bold small">${status.lastUpdated !== 'Never' ? new Date(status.lastUpdated).toLocaleString('zh-CN') : '从未'}</div>
                        </div>
                    </div>
                </div>
            `;
            statusElement.innerHTML = statusHTML;
        }
    }

    // 显示成功消息
    showSuccess(message) {
        if (this.app.showToast) {
            this.app.showToast(message, 'success');
        } else {
            console.log('✅ ' + message);
        }
    }

    // 显示错误消息
    showError(message) {
        if (this.app.showToast) {
            this.app.showToast(message, 'error');
        } else {
            console.error('❌ ' + message);
        }
    }

    render() {
        return `
            <div class="page-content">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-cogs" style="margin-right: 10px;"></i>
                        系统设置
                    </h1>
                </div>

                <!-- 版本管理卡片 -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-code-branch" style="margin-right: 8px;"></i>
                            统一版本控制系统
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-muted">当前版本信息</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>版本号</strong></td>
                                        <td><span class="${getBadgeClassForStatus('versionStatus', 'current')}" id="current-version">${this.versionInfo?.version || '3.0.2'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>时间戳</strong></td>
                                        <td><code id="version-timestamp">${this.versionInfo?.timestamp || Date.now()}</code></td>
                                    </tr>
                                    <tr>
                                        <td><strong>最后更新</strong></td>
                                        <td id="last-updated">${this.versionInfo?.formattedTime || new Date().toLocaleString('zh-CN')}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted">版本控制操作</h6>
                                <div class="d-grid gap-2">
                                    <button id="increment-version-btn" class="btn btn-success">
                                        <i class="fas fa-arrow-up" style="margin-right: 5px;"></i>
                                        递增版本 (${this.getNextVersion?.() || '3.0.3'})
                                    </button>
                                    <button id="update-version-btn" class="btn btn-warning">
                                        <i class="fas fa-edit" style="margin-right: 5px;"></i>
                                        自定义版本
                                    </button>
                                    <button id="clear-cache-btn" class="btn btn-danger">
                                        <i class="fas fa-trash-alt" style="margin-right: 5px;"></i>
                                        清除所有缓存
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                            <strong>统一版本控制说明:</strong>
                            <ul class="mb-0 mt-2">
                                <li>所有前端和管理端模块共享同一版本</li>
                                <li>版本更新会自动清除浏览器缓存</li>
                                <li>支持自动递增和自定义版本</li>
                                <li>确保所有用户获得最新版本的代码</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 系统状态卡片 -->
                <div class="card mb-4">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-server" style="margin-right: 8px;"></i>
                            系统状态
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="text-success" style="font-size: 2rem;">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h6 class="mt-2">前端服务</h6>
                                    <span class="${getBadgeClassForStatus('serviceStatus', 'running')}">运行中</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="text-success" style="font-size: 2rem;">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h6 class="mt-2">管理端服务</h6>
                                    <span class="${getBadgeClassForStatus('serviceStatus', 'running')}">运行中</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="text-success" style="font-size: 2rem;">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h6 class="mt-2">后端API</h6>
                                    <span class="${getBadgeClassForStatus('serviceStatus', 'running')}">运行中</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 缓存管理卡片 -->
                <div class="card">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-database" style="margin-right: 8px;"></i>
                            缓存管理
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                            <strong>缓存策略:</strong>
                            <ul class="mb-0 mt-2">
                                <li>JavaScript/CSS文件: 无缓存策略 (no-cache, must-revalidate)</li>
                                <li>静态资源: 版本化URL + ETag验证</li>
                                <li>API响应: 版本头信息控制</li>
                                <li>模块导入: 动态时间戳参数</li>
                            </ul>
                        </div>
                        
                        <div class="mt-3">
                            <h6>缓存控制工具</h6>
                            <p class="text-muted">使用上面的「清除所有缓存」按钮可以强制清除所有浏览器缓存和本地存储。</p>
                        </div>
                    </div>
                </div>

                <!-- 邮箱验证器配置卡片 -->
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-envelope-open-text" style="margin-right: 8px;"></i>
                            邮箱验证器配置
                        </h5>
                    </div>
                    <div class="card-body">
                        <!-- 邮箱状态显示区域 -->
                        <div id="email-status-display" class="mb-4">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <i class="fas fa-question-circle text-secondary fa-2x mb-2"></i>
                                        <div class="small">模块状态</div>
                                        <div class="fw-bold">未初始化</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <i class="fas fa-toggle-off text-secondary fa-2x mb-2"></i>
                                        <div class="small">功能状态</div>
                                        <div class="fw-bold">未知</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                                        <div class="small">SMTP配置</div>
                                        <div class="fw-bold">未配置</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <i class="fas fa-clock text-info fa-2x mb-2"></i>
                                        <div class="small">最后更新</div>
                                        <div class="fw-bold small">从未</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 操作按钮区域 -->
                        <div class="row">
                            <div class="col-md-4">
                                <button type="button" class="btn btn-primary w-100" id="email-config-btn">
                                    <i class="fas fa-cog" style="margin-right: 8px;"></i>
                                    配置邮箱验证器
                                </button>
                                <div class="text-muted small mt-1">设置SMTP服务器和邮件模板</div>
                            </div>
                            <div class="col-md-4">
                                <button type="button" class="btn btn-outline-success w-100" id="email-test-btn">
                                    <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                                    测试邮箱配置
                                </button>
                                <div class="text-muted small mt-1">发送测试邮件验证配置</div>
                            </div>
                            <div class="col-md-4">
                                <button type="button" class="btn btn-outline-info w-100" id="email-status-btn">
                                    <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>
                                    刷新状态
                                </button>
                                <div class="text-muted small mt-1">更新邮箱验证器状态信息</div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                            <strong>邮箱验证器功能说明:</strong>
                            <ul class="mb-0 mt-2">
                                <li>支持主流邮箱服务商（Gmail、QQ邮箱、163邮箱等）</li>
                                <li>提供向导式配置界面，简化SMTP设置过程</li>
                                <li>内置邮件模板，支持邮箱验证和密码重置</li>
                                <li>具备连接测试和邮件发送测试功能</li>
                                <li>配置完成后可用于用户注册邮箱验证</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // 页面加载完成后设置事件监听器
                document.addEventListener('DOMContentLoaded', async function() {
                    if (window.adminApp && window.adminApp.currentPage === 'settings') {
                        console.log('系统设置页面已加载');
                        
                        // 获取系统设置实例
                        const settingsInstance = window.adminApp.pages.settings?.instance;
                        if (settingsInstance) {
                            // 异步初始化邮箱模块
                            setTimeout(async () => {
                                try {
                                    await settingsInstance.initializeEmailModules();
                                    settingsInstance.updateEmailStatusDisplay();
                                    console.log('✅ 邮箱模块异步初始化完成');
                                } catch (error) {
                                    console.warn('⚠️ 邮箱模块初始化失败:', error);
                                }
                            }, 1000);
                        }
                    }
                });
            </script>
        `;
    }
}

export default SystemSettings;
