class AdminLogin {
    constructor(app) {
        this.app = app;
        // 移除硬编码凭据，改为从配置读取
        this.adminCredentials = this.getAdminCredentials();
    }

    getAdminCredentials() {
        // 使用浏览器兼容的配置方式
        return {
            username: window.ADMIN_USERNAME || 'admin',
            password: window.ADMIN_PASSWORD || 'Admin123!@#'
        };
    }

    render() {
        return `
            <div class="login-page" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="login-container" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 100%; max-width: 400px;">
                    <div class="text-center mb-4">
                        <h2 style="color: #2c3e50; margin-bottom: 0.5rem;">
                            <i class="fas fa-cogs" style="margin-right: 10px;"></i>
                            FitChallenge 管理后台
                        </h2>
                        <p style="color: #7f8c8d; font-size: 0.9rem;">请输入管理员凭据</p>
                    </div>
                    
                    <form id="loginForm">
                        <div class="form-group mb-3">
                            <label for="username" style="display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 500;">用户名</label>
                            <input type="text" id="username" class="form-control" placeholder="请输入用户名" required>
                        </div>
                        
                        <div class="form-group mb-4">
                            <label for="password" style="display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 500;">密码</label>
                            <input type="password" id="password" class="form-control" placeholder="请输入密码" required>
                        </div>
                        
                        <button type="submit" id="loginBtn" class="btn btn-primary w-100" style="padding: 0.75rem; font-size: 1rem;">
                            <span class="button-text">登录</span>
                            <span class="loading-spinner" style="display: none;">
                                <i class="fas fa-spinner fa-spin"></i>
                            </span>
                        </button>
                    </form>
                    
                    <div class="text-center mt-3">
                        <small style="color: #95a5a6;">
                            默认账号: admin / admin123
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                
                if (!this.validateInput(username, password)) {
                    return;
                }
                
                this.setLoadingState(true);
                
                try {
                    const base = window.API_BASE_URL || (window.API_CONFIG && window.API_CONFIG.baseUrl) || 'http://localhost:3000';
                    const resp = await fetch(`${base}/api/admin/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const result = await resp.json();

                    if (result && result.success) {
                        const adminToken = result.data.token;
                        const adminUser = result.data.admin;
                        localStorage.setItem('adminToken', adminToken);
                        localStorage.setItem('adminUser', JSON.stringify(adminUser));
                        this.showSuccess('登录成功！正在跳转...');
                        if (this.app && typeof this.app.setToken === 'function') {
                            this.app.setToken(adminToken);
                            this.app.user = adminUser;
                            this.app.isAuthenticated = true;
                        }
                        setTimeout(() => {
                            if (this.app && typeof this.app.navigate === 'function') {
                                this.app.navigate('dashboard');
                            } else {
                                window.location.reload();
                            }
                        }, 500);
                    } else {
                        this.showError(result?.message || '用户名或密码错误');
                    }
                } catch (err) {
                    console.error('登录失败:', err);
                    this.showError('登录失败，请稍后再试');
                } finally {
                    this.setLoadingState(false);
                }
            });
        }
    }

    setLoadingState(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const buttonText = loginBtn.querySelector('.button-text');
        const spinner = loginBtn.querySelector('.loading-spinner');
        
        if (loading) {
            loginBtn.disabled = true;
            buttonText.textContent = '登录中...';
            spinner.style.display = 'inline-block';
        } else {
            loginBtn.disabled = false;
            buttonText.textContent = '登录';
            spinner.style.display = 'none';
        }
    }

    validateInput(username, password) {
        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return false;
        }
        if (username.length < 3 || username.length > 50) {
            this.showError('用户名长度必须在3-50个字符之间');
            return false;
        }
        if (password.length < 6 || password.length > 100) {
            this.showError('密码长度必须在6-100个字符之间');
            return false;
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            this.showError('用户名只能包含字母、数字和下划线');
            return false;
        }
        return true;
    }

    showError(message) {
        if (this.app && typeof this.app.showToast === 'function') {
            this.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (this.app && typeof this.app.showToast === 'function') {
            this.app.showToast(message, 'success');
        } else {
            alert(message);
        }
    }
}

export default AdminLogin;
