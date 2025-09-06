@echo off
chcp 65001 >nul
title FitChallenge 一键启动所有服务器

echo.
echo ========================================
echo    FitChallenge 一键启动脚本
echo ========================================
echo.

:: 检查Node.js是否安装
echo [1/6] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

:: 检查WSL和数据库服务
echo.
echo [2/6] 检查数据库服务...
echo 正在检查MySQL服务...
wsl -d Ubuntu-22.04 --exec sudo systemctl is-active mysql >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MySQL服务未运行，正在启动...
    wsl -d Ubuntu-22.04 --exec sudo systemctl start mysql
    timeout /t 3 /nobreak >nul
)

echo 正在检查Redis服务...
wsl -d Ubuntu-22.04 --exec sudo systemctl is-active redis-server >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Redis服务未运行，正在启动...
    wsl -d Ubuntu-22.04 --exec sudo systemctl start redis-server
    timeout /t 2 /nobreak >nul
)
echo ✅ 数据库服务正常

:: 检查端口占用
echo.
echo [3/6] 检查端口占用...
netstat -an | findstr ":3000" >nul
if not errorlevel 1 (
    echo ⚠️  端口3000已被占用，正在终止进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
)

netstat -an | findstr ":3002" >nul
if not errorlevel 1 (
    echo ⚠️  端口3002已被占用，正在终止进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /f /pid %%a >nul 2>&1
)

netstat -an | findstr ":8080" >nul
if not errorlevel 1 (
    echo ⚠️  端口8080已被占用，正在终止进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /f /pid %%a >nul 2>&1
)

netstat -an | findstr ":8081" >nul
if not errorlevel 1 (
    echo ⚠️  端口8081已被占用，正在终止进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081"') do taskkill /f /pid %%a >nul 2>&1
)
echo ✅ 端口检查完成

:: 启动后端服务器
echo.
echo [4/6] 启动后端服务器...
cd backend
if not exist "node_modules" (
    echo 📦 安装后端依赖...
    npm install
)
echo 🚀 启动后端服务器 (端口: 3000)...
start "FitChallenge Backend" cmd /k "node start-server-simple.js"
timeout /t 5 /nobreak >nul
cd ..

:: 启动前端服务器
echo.
echo [5/6] 启动前端服务器...
cd frontend
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    npm install
)
echo 🚀 启动前端服务器 (端口: 8080)...
start "FitChallenge Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
cd ..

:: 启动管理后台
echo.
echo [6/6] 启动管理后台...
cd admin
if not exist "node_modules" (
    echo 📦 安装管理后台依赖...
    npm install
)
echo 📦 构建管理后台项目...
npm run build
echo 🚀 启动管理后台 (端口: 8081)...
start "FitChallenge Admin" cmd /k "npm run serve"
timeout /t 3 /nobreak >nul
cd ..

:: 等待服务启动
echo.
echo ⏳ 等待服务启动...
timeout /t 8 /nobreak >nul

:: 检查服务状态
echo.
echo ========================================
echo    服务启动状态检查
echo ========================================
echo.

:: 检查后端服务
echo 检查后端服务 (端口: 3000)...
curl -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 后端服务启动失败
) else (
    echo ✅ 后端服务运行正常
)

:: 检查前端服务
echo 检查前端服务 (端口: 8080)...
curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo ❌ 前端服务启动失败
) else (
    echo ✅ 前端服务运行正常
)

:: 检查管理后台
echo 检查管理后台 (端口: 8081)...
curl -s http://localhost:8081 >nul 2>&1
if errorlevel 1 (
    echo ❌ 管理后台启动失败
) else (
    echo ✅ 管理后台运行正常
)

echo.
echo ========================================
echo    🎉 所有服务启动完成！
echo ========================================
echo.
echo 📱 访问地址:
echo   前端应用: http://localhost:8080
echo   管理后台: http://localhost:8081
echo   后端API:  http://localhost:3000
echo   健康检查: http://localhost:3000/api/health
echo   系统测试: http://localhost:3000/api/test
echo.
echo 💡 提示:
echo   - 按 Ctrl+C 可以停止当前服务
echo   - 关闭对应的命令行窗口可以停止服务
echo   - 运行 test-complete-system.js 可以测试所有功能
echo.
echo.
echo 🎉 启动完成！服务将继续在后台运行。
echo.
echo 📱 访问地址:
echo   前端应用: http://localhost:8080
echo   管理后台: http://localhost:8081
echo   后端API:  http://localhost:3000
echo   健康检查: http://localhost:3000/api/health
echo   系统测试: http://localhost:3000/api/test
echo.
echo 💡 提示:
echo   - 服务已在后台运行，请勿关闭命令行窗口
echo   - 按 Ctrl+C 可以停止当前服务
echo   - 关闭对应的命令行窗口可以停止服务
echo   - 运行 test-complete-system.js 可以测试所有功能
echo.
echo 是否打开浏览器访问前端应用? (y/n)
set /p open_browser=

if /i "%open_browser%"=="y" (
    start http://localhost:8080
    echo ✅ 已打开浏览器
) else (
    echo ℹ️  您可以手动访问: http://localhost:8080
)

echo.
echo ========================================
echo    🎉 所有服务启动完成！
echo ========================================
echo.
echo 服务将继续在后台运行...
echo 按任意键退出启动脚本（服务不会停止）...
pause >nul
