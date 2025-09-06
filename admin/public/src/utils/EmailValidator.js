/**
 * 邮箱验证器管理模块
 * 负责SMTP配置管理、邮件发送测试和验证功能
 */
class EmailValidator {
    constructor(app) {
        this.app = app;
        this.config = {
            smtp: {
                host: '',
                port: 587,
                secure: false,
                auth: {
                    user: '',
                    pass: ''
                }
            },
            templates: {
                verification: {
                    subject: '邮箱验证 - FitChallenge',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50;">邮箱验证</h2>
                            <p>您好！</p>
                            <p>感谢您注册FitChallenge健身挑战平台。请点击下面的按钮验证您的邮箱地址：</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{verificationLink}}" style="background-color: #4cc9f0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">验证邮箱</a>
                            </div>
                            <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
                            <p style="word-break: break-all; color: #666;">{{verificationLink}}</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
                        </div>
                    `
                },
                passwordReset: {
                    subject: '密码重置 - FitChallenge',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50;">密码重置</h2>
                            <p>您好！</p>
                            <p>您请求重置FitChallenge账户密码。请点击下面的按钮设置新密码：</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{resetLink}}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">重置密码</a>
                            </div>
                            <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
                            <p style="word-break: break-all; color: #666;">{{resetLink}}</p>
                            <p style="color: #e74c3c;"><strong>注意：此链接将在24小时后失效。</strong></p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px;">如果您没有请求重置密码，请忽略此邮件。</p>
                        </div>
                    `
                }
            },
            settings: {
                enabled: false,
                timeout: 30000,
                retryAttempts: 3,
                fromName: 'FitChallenge',
                fromEmail: ''
            }
        };
        this.isInitialized = false;
    }

    // 初始化邮箱验证器
    async initialize() {
        try {
            console.log('🚀 初始化邮箱验证器...');
            
            // 从服务器加载配置
            await this.loadConfig();
            
            this.isInitialized = true;
            console.log('✅ 邮箱验证器初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 邮箱验证器初始化失败:', error);
            return false;
        }
    }

    // 从服务器加载邮箱配置
    async loadConfig() {
        try {
            const response = await fetch('/api/admin/email/config', {
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const serverConfig = await response.json();
                // 合并服务器配置和默认配置
                this.config = this.mergeConfig(this.config, serverConfig);
                console.log('✅ 邮箱配置加载成功');
            } else {
                console.warn('⚠️ 服务器邮箱配置加载失败，使用默认配置');
                // 尝试从localStorage加载
                this.loadConfigFromStorage();
            }
        } catch (error) {
            console.warn('⚠️ 邮箱配置加载异常，使用默认配置:', error);
            this.loadConfigFromStorage();
        }
    }

    // 从localStorage加载配置
    loadConfigFromStorage() {
        try {
            const storedConfig = localStorage.getItem('email_config');
            if (storedConfig) {
                const parsedConfig = JSON.parse(storedConfig);
                this.config = this.mergeConfig(this.config, parsedConfig);
                console.log('✅ 从本地存储加载邮箱配置');
            }
        } catch (error) {
            console.warn('⚠️ 本地邮箱配置加载失败:', error);
        }
    }

    // 保存邮箱配置
    async saveConfig(newConfig) {
        try {
            console.log('💾 保存邮箱配置...');
            
            // 验证配置
            const validationResult = this.validateConfig(newConfig);
            if (!validationResult.valid) {
                throw new Error('配置验证失败: ' + validationResult.errors.join(', '));
            }

            // 合并新配置
            this.config = this.mergeConfig(this.config, newConfig);

            // 保存到服务器
            const response = await fetch('/api/admin/email/config', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.config)
            });

            if (response.ok) {
                console.log('✅ 邮箱配置保存到服务器成功');
            } else {
                console.warn('⚠️ 服务器保存失败，保存到本地存储');
            }

            // 备份到localStorage
            localStorage.setItem('email_config', JSON.stringify(this.config));
            console.log('✅ 邮箱配置保存完成');
            
            return true;
        } catch (error) {
            console.error('❌ 邮箱配置保存失败:', error);
            throw error;
        }
    }

    // 测试邮箱连接
    async testConnection(testConfig = null) {
        const configToTest = testConfig || this.config;
        
        try {
            console.log('🔍 测试邮箱连接...');
            
            const response = await fetch('/api/admin/email/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    smtp: configToTest.smtp,
                    settings: configToTest.settings
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('✅ 邮箱连接测试成功');
                return {
                    success: true,
                    message: '连接测试成功',
                    details: result.details
                };
            } else {
                console.error('❌ 邮箱连接测试失败:', result.message);
                return {
                    success: false,
                    message: result.message || '连接测试失败',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('❌ 邮箱连接测试异常:', error);
            return {
                success: false,
                message: '连接测试异常: ' + error.message,
                error: error
            };
        }
    }

    // 发送测试邮件
    async sendTestEmail(recipient, testConfig = null) {
        const configToTest = testConfig || this.config;
        
        try {
            console.log('📧 发送测试邮件到:', recipient);
            
            const response = await fetch('/api/admin/email/send-test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.app.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: recipient,
                    config: configToTest,
                    template: 'test'
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('✅ 测试邮件发送成功');
                return {
                    success: true,
                    message: '测试邮件发送成功',
                    messageId: result.messageId
                };
            } else {
                console.error('❌ 测试邮件发送失败:', result.message);
                return {
                    success: false,
                    message: result.message || '邮件发送失败',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('❌ 测试邮件发送异常:', error);
            return {
                success: false,
                message: '邮件发送异常: ' + error.message,
                error: error
            };
        }
    }

    // 验证邮箱配置
    validateConfig(config) {
        const errors = [];
        
        // SMTP配置验证
        if (!config.smtp) {
            errors.push('缺少SMTP配置');
        } else {
            if (!config.smtp.host) {
                errors.push('SMTP主机地址不能为空');
            }
            if (!config.smtp.port || config.smtp.port < 1 || config.smtp.port > 65535) {
                errors.push('SMTP端口必须在1-65535之间');
            }
            if (config.smtp.auth) {
                if (!config.smtp.auth.user) {
                    errors.push('SMTP用户名不能为空');
                }
                if (!config.smtp.auth.pass) {
                    errors.push('SMTP密码不能为空');
                }
            }
        }

        // 设置验证
        if (config.settings) {
            if (config.settings.timeout && (config.settings.timeout < 5000 || config.settings.timeout > 300000)) {
                errors.push('超时时间必须在5-300秒之间');
            }
            if (config.settings.retryAttempts && (config.settings.retryAttempts < 1 || config.settings.retryAttempts > 10)) {
                errors.push('重试次数必须在1-10次之间');
            }
            if (config.settings.fromEmail && !this.isValidEmail(config.settings.fromEmail)) {
                errors.push('发件人邮箱格式不正确');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // 邮箱格式验证
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 合并配置对象
    mergeConfig(defaultConfig, newConfig) {
        const merged = JSON.parse(JSON.stringify(defaultConfig));
        
        if (newConfig.smtp) {
            Object.assign(merged.smtp, newConfig.smtp);
            if (newConfig.smtp.auth) {
                Object.assign(merged.smtp.auth, newConfig.smtp.auth);
            }
        }
        
        if (newConfig.templates) {
            Object.assign(merged.templates, newConfig.templates);
        }
        
        if (newConfig.settings) {
            Object.assign(merged.settings, newConfig.settings);
        }
        
        return merged;
    }

    // 获取当前配置
    getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }

    // 获取配置状态信息
    getStatus() {
        return {
            initialized: this.isInitialized,
            enabled: this.config.settings.enabled,
            hasValidSMTP: this.validateConfig(this.config).valid,
            lastUpdated: localStorage.getItem('email_config_timestamp') || 'Never'
        };
    }

    // 重置配置为默认值
    resetToDefaults() {
        this.config = {
            smtp: {
                host: '',
                port: 587,
                secure: false,
                auth: {
                    user: '',
                    pass: ''
                }
            },
            templates: this.config.templates, // 保留模板
            settings: {
                enabled: false,
                timeout: 30000,
                retryAttempts: 3,
                fromName: 'FitChallenge',
                fromEmail: ''
            }
        };
        
        localStorage.removeItem('email_config');
        console.log('✅ 邮箱配置已重置为默认值');
    }
}

export default EmailValidator;
