@echo off
chcp 65001 >nul
title FitChallenge 停止所有服务器

echo.
echo ========================================
echo    FitChallenge 停止所有服务器
echo ========================================
echo.

echo 正在停止所有FitChallenge相关进程...

:: 停止Node.js进程
echo [1/3] 停止Node.js进程...
taskkill /f /im node.exe >nul 2>&1
if errorlevel 1 (
    echo ✅ 没有找到Node.js进程
) else (
    echo ✅ Node.js进程已停止
)

:: 停止特定端口的进程
echo [2/3] 停止端口占用进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ 端口占用进程已停止

:: 停止数据库服务
echo [3/3] 停止数据库服务...
wsl -d Ubuntu-22.04 --exec sudo systemctl stop mysql >nul 2>&1
wsl -d Ubuntu-22.04 --exec sudo systemctl stop redis-server >nul 2>&1
echo ✅ 数据库服务已停止

echo.
echo ========================================
echo    🎉 所有服务已停止！
echo ========================================
echo.
echo 按任意键退出...
pause >nul
