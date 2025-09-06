// 紧急修复系统设置菜单显示问题
console.log('🚨 紧急修复系统设置菜单开始...');

// 强制刷新页面并清理所有缓存
function emergencyRefresh() {
    console.log('🔄 执行紧急刷新...');
    
    // 清理所有缓存
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
    }
    
    if ('caches' in window) {
        caches.keys().then(function(names) {
            for(let name of names) {
                caches.delete(name);
            }
        });
    }
    
    // 清理localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('module_') || key.startsWith('page_') || key.startsWith('admin_')) {
            localStorage.removeItem(key);
        }
    });
    
    // 强制刷新
    setTimeout(() => {
        location.reload(true);
    }, 500);
}

// 立即注入系统设置菜单
function injectSystemSettingsNow() {
    console.log('🔧 立即注入系统设置菜单...');
    
    // 等待DOM加载
    function waitAndInject() {
        const adminRoot = document.getElementById('admin-root');
        if (!adminRoot) {
            setTimeout(waitAndInject, 100);
            return;
        }
        
        // 查找或创建导航栏
        let navContainer = document.querySelector('.navbar-nav');
        
        if (!navContainer) {
            // 如果没有导航栏，创建一个
            const navbar = document.createElement('nav');
            navbar.className = 'navbar navbar-expand-lg navbar-dark bg-primary';
            navbar.innerHTML = `
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
                    <div class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="#" data-page="dashboard">
                                <i class="fas fa-tachometer-alt me-2"></i>
                                仪表盘
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" data-page="system-settings" id="emergency-settings-link">
                                <i class="fas fa-cogs me-2"></i>
                                系统设置
                            </a>
                        </li>
                    </div>
                </div>
            `;
            
            adminRoot.insertBefore(navbar, adminRoot.firstChild);
            navContainer = navbar.querySelector('.navbar-nav');
            
            console.log('✅ 导航栏已创建');
        } else {
            // 如果有导航栏但没有系统设置，添加
            const existingSettings = navContainer.querySelector('[data-page="system-settings"]');
            if (!existingSettings) {
                const settingsItem = document.createElement('li');
                settingsItem.className = 'nav-item';
                settingsItem.innerHTML = `
                    <a class="nav-link" href="#" data-page="system-settings" id="emergency-settings-link">
                        <i class="fas fa-cogs me-2"></i>
                        系统设置
                    </a>
                `;
                navContainer.appendChild(settingsItem);
                console.log('✅ 系统设置菜单已添加到现有导航栏');
            }
        }
        
        // 绑定系统设置点击事件
        const settingsLink = document.getElementById('emergency-settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 紧急加载系统设置页面...');
                loadSystemSettingsPage();
            });
        }
        
        // 添加紧急刷新按钮
        addEmergencyRefreshButton();
    }
    
    waitAndInject();
}

// 加载系统设置页面
function loadSystemSettingsPage() {
    const adminRoot = document.getElementById('admin-root');
    if (!adminRoot) return;
    
    // 显示加载状态
    adminRoot.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
                <div class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="location.reload()">
                            <i class="fas fa-tachometer-alt me-2"></i>
                            仪表盘
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="#" data-page="system-settings">
                            <i class="fas fa-cogs me-2"></i>
                            系统设置
                        </a>
                    </li>
                </div>
            </div>
        </nav>
        <div class="container-fluid mt-4">
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
                        <div class="text-center">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p>正在加载系统设置...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 动态加载系统设置模块
    import(/* @vite-ignore */ '../pages/SystemSettings.js?' + 'v=' + Date.now())
        .then(module => {
            console.log('✅ 系统设置模块加载成功');
            const systemSettings = new module.default();
            const settingsHTML = systemSettings.render();
            
            adminRoot.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
                        <div class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="#" onclick="location.reload()">
                                    <i class="fas fa-tachometer-alt me-2"></i>
                                    仪表盘
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="#" data-page="system-settings">
                                    <i class="fas fa-cogs me-2"></i>
                                    系统设置
                                </a>
                            </li>
                        </div>
                    </div>
                </nav>
                ${settingsHTML}
            `;
            
            systemSettings.bindEvents();
            console.log('✅ 系统设置页面已加载');
        })
        .catch(error => {
            console.error('❌ 系统设置模块加载失败:', error);
            adminRoot.innerHTML = `
                <div class="container-fluid mt-4">
                    <div class="alert alert-danger">
                        <h4>系统设置加载失败</h4>
                        <p>错误信息: ${error.message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                        <button class="btn btn-warning" onclick="window.emergencyRefresh()">紧急刷新</button>
                    </div>
                </div>
            `;
        });
}

// 添加紧急刷新按钮
function addEmergencyRefreshButton() {
    const refreshButton = document.createElement('div');
    refreshButton.id = 'emergency-refresh-btn';
    refreshButton.innerHTML = `
        <button class="btn btn-danger" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            border-radius: 50px;
            padding: 12px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        " onclick="window.emergencyRefresh()">
            <i class="fas fa-sync-alt me-2"></i>
            紧急刷新
        </button>
    `;
    
    document.body.appendChild(refreshButton);
    console.log('✅ 紧急刷新按钮已添加');
}

// 导出全局方法
window.emergencyRefresh = emergencyRefresh;
window.injectSystemSettingsNow = injectSystemSettingsNow;
window.loadSystemSettingsPage = loadSystemSettingsPage;

// 立即执行修复
setTimeout(() => {
    injectSystemSettingsNow();
}, 1000);

console.log('✅ 紧急修复脚本已加载');


