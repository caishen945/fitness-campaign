// 强制修复系统设置导航栏显示问题
console.log('🔧 强制修复系统设置导航栏开始...');

// 等待DOM完全加载
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`元素 ${selector} 超时未找到`));
                return;
            }
            
            setTimeout(check, 100);
        }
        
        check();
    });
}

// 强制注入系统设置菜单项
function forceInjectSystemSettings() {
    console.log('🔧 开始强制注入系统设置菜单...');
    
    // 等待导航栏容器
    waitForElement('#admin-root')
        .then(() => {
            console.log('✅ 找到admin-root容器');
            
            // 等待一段时间让应用初始化
            setTimeout(() => {
                // 查找导航菜单容器
                const navContainer = document.querySelector('.navbar-nav') || 
                                   document.querySelector('[class*="nav"]') ||
                                   document.querySelector('nav ul') ||
                                   document.querySelector('ul[class*="menu"]');
                
                if (navContainer) {
                    console.log('✅ 找到导航菜单容器:', navContainer);
                    
                    // 检查是否已存在系统设置菜单
                    const existingSettings = navContainer.querySelector('[data-page="system-settings"]') ||
                                            navContainer.querySelector('[href*="system"]') ||
                                            navContainer.querySelector('a:contains("系统设置")');
                    
                    if (!existingSettings) {
                        console.log('⚠️ 未找到系统设置菜单，开始注入...');
                        
                        // 创建系统设置菜单项
                        const settingsMenuItem = document.createElement('li');
                        settingsMenuItem.className = 'nav-item';
                        settingsMenuItem.innerHTML = `
                            <a class="nav-link" href="#" data-page="system-settings" id="force-system-settings">
                                <i class="fas fa-cogs me-2"></i>
                                系统设置
                            </a>
                        `;
                        
                        // 添加到导航菜单
                        navContainer.appendChild(settingsMenuItem);
                        
                        // 绑定点击事件
                        const settingsLink = settingsMenuItem.querySelector('#force-system-settings');
                        settingsLink.addEventListener('click', function(e) {
                            e.preventDefault();
                            console.log('🔧 强制导航到系统设置页面');
                            
                            // 尝试调用应用的导航方法
                            if (window.app && typeof window.app.navigateToSettingsWithCacheClear === 'function') {
                                window.app.navigateToSettingsWithCacheClear();
                            } else if (window.app && typeof window.app.navigateTo === 'function') {
                                window.app.navigateTo('system-settings');
                            } else {
                                // 直接设置页面内容
                                forceLoadSystemSettings();
                            }
                        });
                        
                        console.log('✅ 系统设置菜单已强制注入');
                    } else {
                        console.log('✅ 系统设置菜单已存在');
                    }
                } else {
                    console.log('⚠️ 未找到导航菜单容器，尝试其他方法...');
                    // 尝试在页面任何位置添加浮动按钮
                    addFloatingSettingsButton();
                }
            }, 2000); // 等待2秒让应用完全初始化
        })
        .catch(error => {
            console.error('❌ 强制修复失败:', error);
            // 作为最后手段，添加浮动按钮
            addFloatingSettingsButton();
        });
}

// 添加浮动的系统设置按钮
function addFloatingSettingsButton() {
    console.log('🔧 添加浮动系统设置按钮...');
    
    const floatingButton = document.createElement('div');
    floatingButton.id = 'floating-settings-btn';
    floatingButton.innerHTML = `
        <button class="btn btn-primary" style="
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            border-radius: 50px;
            padding: 12px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            <i class="fas fa-cogs me-2"></i>
            系统设置
        </button>
    `;
    
    document.body.appendChild(floatingButton);
    
    // 绑定点击事件
    floatingButton.querySelector('button').addEventListener('click', function() {
        console.log('🔧 通过浮动按钮导航到系统设置');
        forceLoadSystemSettings();
    });
    
    console.log('✅ 浮动系统设置按钮已添加');
}

// 强制加载系统设置页面
function forceLoadSystemSettings() {
    console.log('🔧 强制加载系统设置页面...');
    
    const adminRoot = document.getElementById('admin-root');
    if (adminRoot) {
        // 显示加载状态
        adminRoot.innerHTML = `
            <div class="container-fluid">
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
        import('./src/pages/SystemSettings.js?' + 'v=' + Date.now())
            .then(module => {
                console.log('✅ 系统设置模块加载成功');
                const systemSettings = new module.default();
                adminRoot.innerHTML = systemSettings.render();
                systemSettings.bindEvents();
                console.log('✅ 系统设置页面已强制加载');
            })
            .catch(error => {
                console.error('❌ 系统设置模块加载失败:', error);
                adminRoot.innerHTML = `
                    <div class="container-fluid">
                        <div class="alert alert-danger">
                            <h4>系统设置加载失败</h4>
                            <p>错误信息: ${error.message}</p>
                            <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                        </div>
                    </div>
                `;
            });
    }
}

// 页面加载完成后执行强制修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceInjectSystemSettings);
} else {
    forceInjectSystemSettings();
}

// 导出全局方法供调试使用
window.forceFixSettings = {
    inject: forceInjectSystemSettings,
    load: forceLoadSystemSettings,
    addFloating: addFloatingSettingsButton
};

console.log('✅ 强制修复脚本已加载，可通过 window.forceFixSettings 调试');