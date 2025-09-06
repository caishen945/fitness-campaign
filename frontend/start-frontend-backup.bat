@echo off
chcp 65001 >nul
echo 🌐 启动前端服务器（备用方案）...
echo.

REM 检查Node.js版本
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或不在PATH中
    pause
    exit /b 1
)

echo 📋 当前目录: %cd%
echo 📂 检查public目录...

if not exist "public" (
    echo ❌ public目录不存在
    pause
    exit /b 1
)

echo ✅ public目录存在

REM 方案1：尝试使用http-server
echo.
echo 🔄 尝试方案1: http-server
npm list http-server >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ http-server 已安装
    echo 🚀 启动前端服务器（端口8080）...
    start "FitChallenge Frontend" npx http-server public -p 8080 --cors -c-1
    echo.
    echo 🌐 前端服务器已启动
    echo 📱 访问地址: http://localhost:8080
    echo 💡 提示: 服务器窗口已打开，请勿关闭
    pause
    exit /b 0
)

REM 方案2：使用Node.js内置方案
echo.
echo 🔄 尝试方案2: Node.js 内置服务器
echo 🚀 创建临时服务器...

echo const http = require('http'); > temp_server.js
echo const fs = require('fs'); >> temp_server.js
echo const path = require('path'); >> temp_server.js
echo const url = require('url'); >> temp_server.js
echo. >> temp_server.js
echo const PORT = 8080; >> temp_server.js
echo const PUBLIC_DIR = path.join(__dirname, 'public'); >> temp_server.js
echo. >> temp_server.js
echo const mimeTypes = { >> temp_server.js
echo   '.html': 'text/html', >> temp_server.js
echo   '.js': 'text/javascript', >> temp_server.js
echo   '.css': 'text/css', >> temp_server.js
echo   '.json': 'application/json', >> temp_server.js
echo   '.png': 'image/png', >> temp_server.js
echo   '.jpg': 'image/jpg', >> temp_server.js
echo   '.gif': 'image/gif', >> temp_server.js
echo   '.ico': 'image/x-icon' >> temp_server.js
echo }; >> temp_server.js
echo. >> temp_server.js
echo const server = http.createServer((req, res) =^> { >> temp_server.js
echo   res.setHeader('Access-Control-Allow-Origin', '*'); >> temp_server.js
echo   const parsedUrl = url.parse(req.url); >> temp_server.js
echo   let filePath = path.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname); >> temp_server.js
echo   const extname = path.extname(filePath); >> temp_server.js
echo   const contentType = mimeTypes[extname] ^|^| 'application/octet-stream'; >> temp_server.js
echo   fs.readFile(filePath, (err, content) =^> { >> temp_server.js
echo     if (err) { >> temp_server.js
echo       res.writeHead(404); >> temp_server.js
echo       res.end('File not found'); >> temp_server.js
echo     } else { >> temp_server.js
echo       res.writeHead(200, { 'Content-Type': contentType }); >> temp_server.js
echo       res.end(content); >> temp_server.js
echo     } >> temp_server.js
echo   }); >> temp_server.js
echo }); >> temp_server.js
echo. >> temp_server.js
echo server.listen(PORT, () =^> { >> temp_server.js
echo   console.log(`🌐 前端服务器运行在 http://localhost:${PORT}`); >> temp_server.js
echo }); >> temp_server.js

start "FitChallenge Frontend" node temp_server.js

echo ✅ 临时服务器已启动
echo 🌐 访问地址: http://localhost:8080
echo 💡 提示: 服务器窗口已打开，请勿关闭
echo.
echo ⚠️ 这是临时解决方案，建议修复http-server问题
pause