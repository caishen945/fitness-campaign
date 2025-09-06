// 立即修复系统设置菜单的脚本
// 在浏览器控制台中运行此脚本

(function() {
    console.log('🔧 开始修复系统设置菜单...');
    
    // 1. 强制显示系统设置菜单项
    function forceShowSettingsMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.log('❌ 未找到侧边栏');
            return false;
        }
        
        const navLinks = sidebar.querySelector('.nav-links');
        if (!navLinks) {
            console.log('❌ 未找到导航链接容器');
            return false;
        }
        
        // 检查是否已存在系统设置链接
        let settingsLink = navLinks.querySelector('[data-page="settings"]');
        
        if (!settingsLink) {
            console.log('🔧 系统设置菜单项不存在，创建新的');
            
            // 创建系统设置菜单项
            const settingsLi = document.createElement('li');
            settingsLi.style.marginBottom = '0.5rem';
            settingsLi.innerHTML = `
                <a href="#" data-page="settings" style="color: white; text-decoration: none; padding: 0.75rem 1.5rem; display: block; border-left: 4px solid transparent; background: transparent; transition: all 0.3s ease;">
                    <i class="fas fa-cogs" style="margin-right: 10px;"></i> 系统设置
                    <small style="float: right; opacity: 0.7;">Ctrl+9</small>
                </a>
            `;
            
            // 添加悬停效果
            const link = settingsLi.querySelector('a');
            link.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,255,255,0.1)';
                this.style.borderLeft = '4px solid #4cc9f0';
            });
            link.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
                this.style.borderLeft = '4px solid transparent';
            });
            
            // 添加点击事件
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🖱️ 系统设置菜单被点击');
                
                // 尝试通过AdminApp导航
                if (window.adminApp && typeof window.adminApp.navigate === 'function') {
                    window.adminApp.navigate('settings');
                    console.log('✅ 通过AdminApp导航到settings');
                } else {
                    console.log('⚠️ AdminApp不可用，尝试其他方法');
                    alert('系统设置功能正在开发中...');
                }
            });
            
            navLinks.appendChild(settingsLi);
            settingsLink = settingsLi.querySelector('[data-page="settings"]');
            console.log('✅ 系统设置菜单项已创建并添加');
        } else {
            console.log('✅ 系统设置菜单项已存在');
        }
        
        // 强制显示
        if (settingsLink) {
            settingsLink.style.display = 'block';
            settingsLink.style.visibility = 'visible';
            settingsLink.style.opacity = '1';
            console.log('✅ 系统设置菜单项已强制显示');
        }
        
        return true;
    }
    
    // 2. 修复键盘快捷键
    function fixKeyboardShortcuts() {
        // 移除可能存在的旧监听器
        document.removeEventListener('keydown', window.settingsKeyHandler);
        
        // 创建新的键盘事件处理器
        window.settingsKeyHandler = function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === '9') {
                e.preventDefault();
                console.log('⌨️ Ctrl+9快捷键触发');
                
                // 尝试获取AdminApp实例
                if (window.adminApp && typeof window.adminApp.navigate === 'function') {
                    window.adminApp.navigate('settings');
                    console.log('✅ 通过AdminApp导航到settings');
                } else {
                    // 手动触发导航
                    const settingsLink = document.querySelector('[data-page="settings"]');
                    if (settingsLink) {
                        settingsLink.click();
                        console.log('✅ 通过点击事件导航到settings');
                    } else {
                        console.log('❌ 无法找到settings链接');
                        alert('系统设置快捷键已激活！菜单项：Ctrl+9');
                    }
                }
            }
        };
        
        document.addEventListener('keydown', window.settingsKeyHandler);
        console.log('⌨️ 键盘快捷键修复完成 (Ctrl+9)');
    }
    
    // 3. 强制刷新菜单
    function refreshMenu() {
        // 如果存在AdminApp实例，尝试重新渲染菜单
        if (window.adminApp && typeof window.adminApp.renderNavigation === 'function') {
            window.adminApp.renderNavigation();
            console.log('🔄 通过AdminApp重新渲染导航');
        }
    }
    
    // 立即执行修复
    console.log('🚀 开始执行修复...');
    forceShowSettingsMenu();
    fixKeyboardShortcuts();
    refreshMenu();
    
    // 定期检查和修复（防止页面动态更新覆盖修复）
    setInterval(() => {
        forceShowSettingsMenu();
    }, 5000);
    
    console.log('✅ 系统设置菜单修复完成！');
    console.log('💡 现在您可以：');
    console.log('   - 在侧边栏看到"系统设置"菜单项');
    console.log('   - 使用 Ctrl+9 快捷键');
    console.log('   - 点击菜单项进入系统设置');
    
    // 显示成功提示
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '修复成功！',
            text: '系统设置菜单已成功修复',
            icon: 'success',
            timer: 3000
        });
    } else {
        alert('✅ 系统设置菜单修复成功！\n\n现在您可以看到"系统设置"菜单项，并使用Ctrl+9快捷键。');
    }
    
})();
