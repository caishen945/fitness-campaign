import App from './App.js';

// 前端应用入口
document.addEventListener('DOMContentLoaded', () => {
    console.log('主应用开始初始化...');
    console.log('导入的App实例:', App);
    console.log('App实例类型:', typeof App);
    console.log('App实例构造函数:', App.constructor.name);
    
    // 创建App实例
    const app = new App();
    console.log('使用的app实例:', app);
    console.log('app实例类型:', typeof app);
    console.log('app实例构造函数:', app.constructor.name);
    
    // 将App实例暴露到全局，供页面组件使用
    window.globalAppInstance = app;
    console.log('App实例已暴露到全局: window.globalAppInstance');
    console.log('验证全局实例:', window.globalAppInstance);
    console.log('全局实例类型:', typeof window.globalAppInstance);
    console.log('全局实例构造函数:', window.globalAppInstance?.constructor?.name);
    
    // 测试全局实例的方法
    console.log('全局实例setToken方法:', typeof window.globalAppInstance.setToken);
    console.log('全局实例setUser方法:', typeof window.globalAppInstance.setUser);
    console.log('全局实例navigate方法:', typeof window.globalAppInstance.navigate);
    
    app.init();
});