warning: in the working copy of 'admin/public/src/App.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/admin/public/src/App.js b/admin/public/src/App-fixed.js[m
[1mindex a17fabc..bddd327 100644[m
[1m--- a/admin/public/src/App.js[m
[1m+++ b/admin/public/src/App-fixed.js[m
[36m@@ -11,9 +11,12 @@[m [mimport TeamManagement from './pages/TeamManagement.js';[m
 class AdminApp {[m
     constructor() {[m
         this.currentPage = 'login'; // 默认显示登录页面[m
[31m-        this.isAuthenticated = false; // 认证状�?        this.isLoading = false; // 加载状�?        this.pageCache = new Map(); // 页面缓存[m
[32m+[m[32m        this.isAuthenticated = false; // 认证状态[m
[32m+[m[32m        this.isLoading = false; // 加载状态[m
[32m+[m[32m        this.pageCache = new Map(); // 页面缓存[m
         [m
[31m-        // 页面对象 - 所有管理页面都在这里定�?        this.pages = {[m
[32m+[m[32m        // 页面对象 - 所有管理页面都在这里定义[m
[32m+[m[32m        this.pages = {[m
             // 登录页面[m
             login: {[m
                 instance: null,[m
[36m@@ -30,10 +33,11 @@[m [mclass AdminApp {[m
                 }[m
             },[m
             [m
[31m-            // 仪表盘页�?            dashboard: {[m
[32m+[m[32m            // 仪表盘页面[m
[32m+[m[32m            dashboard: {[m
                 render: () => `[m
                     <div class="dashboard-page">[m
[31m-                        <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">仪表�?/h1>[m
[32m+[m[32m                        <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">仪表盘</h1>[m
                         <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">[m
                             <div class="stat-card" style="background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">[m
                                 <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">👥</div>[m
[36m@@ -43,12 +47,12 @@[m [mclass AdminApp {[m
                             <div class="stat-card" style="background: linear-gradient(135deg, #4cc9f0, #4895ef); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">[m
                                 <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">🏆</div>[m
                                 <div class="stat-value" style="font-size: 2rem; font-weight: bold;">8,742,105</div>[m
[31m-                                <div class="stat-label" style="font-size: 1.1rem;">总步�?/div>[m
[32m+[m[32m                                <div class="stat-label" style="font-size: 1.1rem;">总步数</div>[m
                             </div>[m
                             <div class="stat-card" style="background: linear-gradient(135deg, #f8961e, #f3722c); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">[m
                                 <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">💰</div>[m
                                 <div class="stat-value" style="font-size: 2rem; font-weight: bold;">24,580</div>[m
[31m-                                <div class="stat-label" style="font-size: 1.1rem;">总奖励发�?/div>[m
[32m+[m[32m                                <div class="stat-label" style="font-size: 1.1rem;">总奖励发放</div>[m
                             </div>[m
                             <div class="stat-card" style="background: linear-gradient(135deg, #f94144, #f9844a); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">[m
                                 <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">🚩</div>[m
[36m@@ -126,7 +130,7 @@[m [mclass AdminApp {[m
                     }[m
                 }[m
             },[m
[31m-[m
[32m+[m[41m            [m
             // 团队管理页面[m
             team: {[m
                 instance: null,[m
[36m@@ -164,7 +168,8 @@[m [mclass AdminApp {[m
                 instance: null,[m
                 render: function() {[m
                     if (!this.instance) {[m
[31m-                        // 修复：传递AdminApp实例而不是页面对�?                        this.instance = new PKChallengeManagement(window.adminApp);[m
[32m+[m[32m                        // 修复：传递AdminApp实例而不是页面对象[m
[32m+[m[32m                        this.instance = new PKChallengeManagement(window.adminApp);[m
                     }[m
                     return this.instance.render();[m
                 },[m
[36m@@ -179,97 +184,102 @@[m [mclass AdminApp {[m
         this.user = null;[m
         this.token = null;[m
         [m
[31m-        // 性能优化：防抖搜�?        this.searchDebounceTimer = null;[m
[32m+[m[32m        // 性能优化：防抖搜索[m
[32m+[m[32m        this.searchDebounceTimer = null;[m
         this.lastSearchTime = 0;[m
     }[m
     [m
     init() {[m
[31m-        this.createToastContainer();[m
[31m-        this.setupEventListeners();[m
[31m-        this.checkAuthStatus();[m
[32m+[m[32m            this.createToastContainer();[m
[32m+[m[32m            this.setupEventListeners();[m
[32m+[m[32m                this.checkAuthStatus();[m
         this.render();[m
[31m-        [m
[31m-        // 性能优化：预加载常用页面[m
[31m-        this.preloadCommonPages();[m
[32m+[m[41m                [m
[32m+[m[32m                // 性能优化：预加载常用页面[m
[32m+[m[32m                this.preloadCommonPages();[m
     }[m
     [m
[31m-    // 预加载常用页�?    preloadCommonPages() {[m
[32m+[m[32m    // 预加载常用页面[m
[32m+[m[32m    preloadCommonPages() {[m
         setTimeout(() => {[m
             if (this.isAuthenticated) {[m
[31m-                console.log('🚀 预加载常用页�?..');[m
[31m-                // 预加载仪表盘和用户管理页�?                this.preloadPage('dashboard');[m
[32m+[m[32m                console.log('🚀 预加载常用页面...');[m
[32m+[m[32m                // 预加载仪表盘和用户管理页面[m
[32m+[m[32m                this.preloadPage('dashboard');[m
                 this.preloadPage('users');[m
             }[m
         }, 1000);[m
     }[m
     [m
[31m-    // 预加载页�?    preloadPage(pageName) {[m
[32m+[m[32m    // 预加载页面[m
[32m+[m[32m    preloadPage(pageName) {[m
         if (this.pages[pageName] && !this.pages[pageName].instance) {[m
             try {[m
                 this.pages[pageName].render();[m
[31m-                console.log(`�?页面预加载完�? ${pageName}`);[m
[31m-        } catch (error) {[m
[31m-                console.log(`⚠️ 页面预加载失�? ${pageName}`, error);[m
[32m+[m[32m                console.log(`✅ 页面预加载完成: ${pageName}`);[m
[32m+[m[32m            } catch (error) {[m
[32m+[m[32m                console.log(`⚠️ 页面预加载失败: ${pageName}`, error);[m
             }[m
         }[m
     }[m
     [m
     checkAuthStatus() {[m
[31m-        const adminToken = localStorage.getItem('adminToken');[m
[31m-        const adminUser = localStorage.getItem('adminUser');[m
[31m-        [m
[31m-        if (adminToken && adminUser) {[m
[31m-            try {[m
[31m-                const user = JSON.parse(adminUser);[m
[31m-                [m
[31m-                // 处理JWT格式token[m
[31m-                let tokenData;[m
[31m-                if (adminToken.includes('.')) {[m
[31m-                    // JWT格式：header.payload.signature[m
[31m-                    const parts = adminToken.split('.');[m
[31m-                    if (parts.length === 3) {[m