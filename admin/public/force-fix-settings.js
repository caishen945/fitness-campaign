// 紧急修复系统设置菜单显示问题
console.log('🚨 紧急修复系统设置菜单开始...');

// 1. 检测问题并自动修复
function detectAndFix() {
    const adminRoot = document.getElementById('admin-root');
    if (!adminRoot) {
        console.log('⏳ 等待admin-root容器...');
        setTimeout(detectAndFix, 500);
        return;
    }
    
    // 检查是否存在系统设置菜单
    const existingSettings = document.querySelector('[data-page="system-settings"]');
    if (existingSettings) {
        console.log('✅ 系统设置菜单已存在');
        return;
    }
    
    // 检查是否存在导航容器
    const navContainer = document.querySelector('.navbar-nav');
    if (!navContainer) {
        console.log('⚠️ 未找到导航容器，创建紧急导航');
        createEmergencyNavigation();
    } else {
        console.log('⚠️ 未找到系统设置菜单，开始注入');
        injectSystemSettingsMenu(navContainer);
    }
}

// 2. 创建紧急导航
function createEmergencyNavigation() {
    const adminRoot = document.getElementById('admin-root');
    const navbar = document.createElement('nav');
    navbar.className = 'navbar navbar-expand-lg navbar-dark bg-primary';
    navbar.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
            <div class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="location.reload()">
                        <i class="fas fa-tachometer-alt me-2"></i>仪表盘
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-page="system-settings" id="emergency-settings-link">
                        <i class="fas fa-cogs me-2"></i>系统设置
                    </a>
                </li>
            </div>
        </div>
    `;
    
    adminRoot.insertBefore(navbar, adminRoot.firstChild);
    bindEmergencyEvents();
}

// 3. 注入系统设置菜单
function injectSystemSettingsMenu(navContainer) {
    const settingsItem = document.createElement('li');
    settingsItem.className = 'nav-item';
    settingsItem.innerHTML = `
        <a class="nav-link" href="#" data-page="system-settings" id="emergency-settings-link">
            <i class="fas fa-cogs me-2"></i>系统设置
        </a>
    `;
    
    navContainer.appendChild(settingsItem);
    bindEmergencyEvents();
}

// 4. 绑定紧急事件
function bindEmergencyEvents() {
    const settingsLink = document.getElementById('emergency-settings-link');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔧 紧急加载系统设置页面');
            
            // 尝试使用应用的导航方法
            if (window.app && typeof window.app.navigateToSettingsWithCacheClear === 'function') {
                window.app.navigateToSettingsWithCacheClear();
            } else if (window.app && typeof window.app.navigate === 'function') {
                window.app.navigate('system-settings');
            } else {
                // 直接加载页面
                loadSystemSettingsDirectly();
            }
        });
    }
}

// 5. 直接加载系统设置页面
function loadSystemSettingsDirectly() {
    const adminRoot = document.getElementById('admin-root');
    adminRoot.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
                <div class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="location.reload()">
                            <i class="fas fa-tachometer-alt me-2"></i>仪表盘
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="#" data-page="system-settings">
                            <i class="fas fa-cogs me-2"></i>系统设置
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
    import('../src/pages/SystemSettings.js?' + Date.now())
        .then(module => {
            const systemSettings = new module.default(window.app);
            const settingsHTML = systemSettings.render();
            
            adminRoot.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">FitChallenge 管理后台</a>
                        <div class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="#" onclick="location.reload()">
                                    <i class="fas fa-tachometer-alt me-2"></i>仪表盘
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="#" data-page="system-settings">
                                    <i class="fas fa-cogs me-2"></i>系统设置
                                </a>
                            </li>
                        </div>
                    </div>
                </nav>
                ${settingsHTML}
            `;
            
            systemSettings.bindEvents();
            console.log('✅ 系统设置页面已直接加载');
        })
        .catch(error => {
            console.error('❌ 系统设置模块加载失败:', error);
            adminRoot.innerHTML += `
                <div class="alert alert-danger mt-4">
                    <h4>加载失败</h4>
                    <p>系统设置页面加载失败，请刷新页面重试。</p>
                    <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                </div>
            `;
        });
}

// 启动检测和修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectAndFix);
} else {
    detectAndFix();
}
