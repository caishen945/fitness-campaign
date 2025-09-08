@echo off
chcp 65001 >nul
title FitChallenge 快速启动

echo.
echo ========================================
echo    FitChallenge 快速启动菜单
echo ========================================
echo.
echo 请选择要启动的服务:
echo.
echo [1] 启动后端服务器 (端口: 3000)
echo [2] 启动前端服务器 (端口: 8080)
echo [3] 启动管理后台 (端口: 8081)
echo [4] 启动所有服务
echo [5] 测试系统功能
echo [6] 退出
echo.
set /p choice=请输入选择 (1-6): 

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_admin
if "%choice%"=="4" goto start_all
if "%choice%"=="5" goto test_system
if "%choice%"=="6" goto exit
goto invalid

:start_backend
echo.
echo 🚀 启动后端服务器...
cd backend
if not exist "node_modules" (
    echo 📦 安装后端依赖...
    npm install
)
echo 启动后端服务器 (端口: 3000)...
start "FitChallenge Backend" cmd /k "node server.js"
cd ..
echo ✅ 后端服务器已启动
echo 访问地址: http://localhost:3000
pause
goto menu

:start_frontend
echo.
echo 🚀 启动前端服务器...
cd frontend
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    npm install
)
echo 启动前端服务器 (端口: 8080)...
start "FitChallenge Frontend" cmd /k "npm run dev"
cd ..
echo ✅ 前端服务器已启动
echo 访问地址: http://localhost:8080
pause
goto menu

:start_admin
echo.
echo 🚀 启动管理后台...
cd admin
if not exist "node_modules" (
    echo 📦 安装管理后台依赖...
    npm install
)
echo 📦 构建管理后台项目...
npm run build
echo 启动管理后台 (端口: 8081)...
start "FitChallenge Admin" cmd /k "npm run serve"
cd ..
echo ✅ 管理后台已启动
echo 访问地址: http://localhost:8081
pause
goto menu

:start_all
echo.
echo 🚀 启动所有服务...
call start-all-servers.bat
goto menu

:test_system
echo.
echo 🧪 测试系统功能...
cd backend
node test-complete-system.js
cd ..
pause
goto menu

:invalid
echo.
echo ❌ 无效选择，请重新输入
pause
goto menu

:menu
cls
echo.
echo ========================================
echo    FitChallenge 快速启动菜单
echo ========================================
echo.
echo 请选择要启动的服务:
echo.
echo [1] 启动后端服务器 (端口: 3000)
echo [2] 启动前端服务器 (端口: 8080)
echo [3] 启动管理后台 (端口: 8081)
echo [4] 启动所有服务
echo [5] 测试系统功能
echo [6] 退出
echo.
set /p choice=请输入选择 (1-6): 

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_admin
if "%choice%"=="4" goto start_all
if "%choice%"=="5" goto test_system
if "%choice%"=="6" goto exit
goto invalid

:exit
echo.
echo 👋 再见！
exit /b 0
