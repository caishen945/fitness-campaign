@echo off
chcp 65001 >nul
title FitChallenge 修复管理后台构建

echo.
echo ========================================
echo    FitChallenge 修复管理后台构建
echo ========================================
echo.

echo 正在修复管理后台构建问题...

:: 进入管理后台目录
cd admin

:: 检查node_modules是否存在
if not exist "node_modules" (
    echo 📦 安装管理后台依赖...
    npm install
) else (
    echo ✅ 依赖已安装
)

:: 清理之前的构建
if exist "dist" (
    echo 🗑️ 清理之前的构建文件...
    rmdir /s /q dist
)

:: 重新构建项目
echo 📦 重新构建管理后台项目...
npm run build

if errorlevel 1 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
) else (
    echo ✅ 构建成功！
)

:: 检查dist目录是否存在
if exist "dist" (
    echo ✅ dist目录已创建
    echo 📁 构建文件列表:
    dir dist /b
) else (
    echo ❌ dist目录未创建，构建可能失败
)

cd ..

echo.
echo ========================================
echo    🎉 修复完成！
echo ========================================
echo.
echo 现在可以运行启动脚本了：
echo   - start-all-servers.bat
echo   - quick-start.bat
echo.
echo 按任意键退出...
pause >nul
