import App from './App.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    // 创建App实例
    const app = new App();
    
    // 将实例暴露到全局，以便其他地方可以访问
    window.globalAppInstance = app;
    
    // 初始化应用（异步）
    await app.init();
    
    // 监听全局事件
    document.addEventListener('navigate', (e) => {
        if (e.detail && e.detail.page) {
            app.navigate(e.detail.page);
        }
    });
    
    document.addEventListener('logout', () => {
        app.logout();
    });
});