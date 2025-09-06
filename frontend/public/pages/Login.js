import api from '../src/services/api.js';

class Login {
    constructor(app) {
        this.app = app;
    }

    render() {
        return `
            <div class="login-container">
                <div class="login-box">
                    <h2>用户登录</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="email">邮箱地址</label>
                            <input type="email" id="email" name="email" required placeholder="请输入邮箱地址">
                        </div>
                        <div class="form-group">
                            <label for="password">密码</label>
                            <input type="password" id="password" name="password" required placeholder="请输入密码">
                        </div>
                        <button type="submit" class="btn btn-primary">登录</button>
                    </form>
                    
                    <!-- Telegram快捷登录 -->
                    <div class="social-login">
                        <div class="divider">
                            <span>或</span>
                        </div>
                        <button type="button" class="btn btn-telegram" id="telegramLogin">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.48.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.178.164.172.213.421.227.59-.001.187-.033.321-.1.425z"/>
                            </svg>
                            Telegram 快捷登录
                        </button>
                    </div>
                    
                    <div class="login-links">
                        <a href="#register">还没有账号？立即注册</a>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // 显示加载动画
                this.app.showLoading();
                
                try {
                    const result = await api.login(email, password);
                    console.log('登录结果:', result); // 调试信息
                    
                    if (result.token && result.user) {
                        // 保存用户信息到本地存储
                        localStorage.setItem('token', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                        
                        // 更新应用状态
                        this.app.setToken(result.token);
                        this.app.setUser(result.user);
                        
                        // 跳转到主页
                        this.app.navigate('home');
                        
                        // 显示成功消息
                        this.app.showToast('登录成功！', 'success');
                    } else {
                        // 显示错误消息
                        this.app.showToast(result.error || '登录失败', 'error');
                    }
                } catch (error) {
                    console.error('登录错误:', error);
                    this.app.showToast('登录过程中发生错误: ' + error.message, 'error');
                } finally {
                    this.app.hideLoading();
                }
            });
        }

        // Telegram快捷登录
        const telegramLoginBtn = document.getElementById('telegramLogin');
        if (telegramLoginBtn) {
            telegramLoginBtn.addEventListener('click', () => {
                this.handleTelegramLogin();
            });
        }
    }

    // Telegram快捷登录处理
    async handleTelegramLogin() {
        try {
            console.log('🔍 开始Telegram登录检查...');
            
            // 检查Telegram Web App脚本是否加载
            if (!window.Telegram) {
                console.error('❌ window.Telegram 未定义');
                this.app.showToast('Telegram脚本加载失败，请刷新页面重试', 'error');
                return;
            }
            
            if (!window.Telegram.WebApp) {
                console.error('❌ window.Telegram.WebApp 未定义');
                this.app.showToast('Telegram Web App初始化失败', 'error');
                return;
            }
            
            // 显示加载状态
            this.app.showLoading('正在初始化Telegram登录...');

            const webApp = window.Telegram.WebApp;
            console.log('📱 Telegram Web App对象:', webApp);
            console.log('🔑 initData:', webApp.initData);
            console.log('🔓 initDataUnsafe:', webApp.initDataUnsafe);
            console.log('📱 platform:', webApp.platform);
            console.log('📊 version:', webApp.version);
            
            // 尝试初始化Telegram Web App
            try {
                webApp.ready();
                webApp.expand();
                console.log('✅ Telegram Web App初始化成功');
            } catch (initError) {
                console.warn('⚠️ Telegram Web App初始化警告:', initError);
            }
            
            // 检查用户是否已授权
            if (!webApp.initDataUnsafe) {
                console.error('❌ initDataUnsafe 为空');
                this.app.hideLoading();
                this.app.showToast('Telegram数据初始化失败，请在Telegram应用中打开此页面', 'error');
                return;
            }
            
            if (!webApp.initDataUnsafe.user) {
                console.error('❌ initDataUnsafe.user 为空');
                console.log('🔍 可用的initDataUnsafe数据:', Object.keys(webApp.initDataUnsafe));
                
                this.app.hideLoading();
                // 提供更详细的错误信息和解决建议
                if (webApp.platform === 'unknown') {
                    this.app.showToast('请在Telegram应用中打开此页面，普通浏览器无法使用此功能', 'info');
                    this.app.showToast('💡 提示：在Telegram中搜索 @Fit_FitChallengeBOT 并点击开始按钮', 'info');
                } else {
                    this.app.showToast('无法获取Telegram用户信息，请确保已在Telegram中授权', 'error');
                    this.app.showToast('💡 提示：请重新在Telegram中打开此页面', 'info');
                }
                return;
            }

            const telegramUser = webApp.initDataUnsafe.user;
            console.log('Telegram用户信息:', telegramUser);

            // 更新加载状态
            this.app.showLoading('正在验证Telegram身份...');

            try {
                const result = await api.telegramLogin(telegramUser);
                console.log('Telegram登录结果:', result);

                if (result.token && result.user) {
                    // 保存用户信息到本地存储
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    
                    // 更新应用状态
                    this.app.setToken(result.token);
                    this.app.setUser(result.user);
                    
                    // 跳转到主页
                    this.app.navigate('home');
                    
                    // 显示成功消息
                    this.app.showToast('Telegram登录成功！', 'success');
                } else {
                    this.app.showToast(result.error || 'Telegram登录失败', 'error');
                }
            } catch (error) {
                console.error('Telegram登录错误:', error);
                this.app.showToast('Telegram登录过程中发生错误: ' + error.message, 'error');
            } finally {
                this.app.hideLoading();
            }
        } catch (error) {
            console.error('Telegram登录处理错误:', error);
            this.app.showToast('Telegram登录处理失败', 'error');
        }
    }
}

export default Login;