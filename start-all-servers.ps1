# FitChallenge 一键启动所有服务器 (PowerShell版本)
# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FitChallenge 一键启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js是否安装
Write-Host "[1/6] 检查Node.js环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js环境正常: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ 错误: 未检测到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查WSL和数据库服务
Write-Host ""
Write-Host "[2/6] 检查数据库服务..." -ForegroundColor Yellow
Write-Host "正在检查MySQL服务..." -ForegroundColor Gray
try {
    $mysqlStatus = wsl -d Ubuntu-22.04 --exec sudo systemctl is-active mysql 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  MySQL服务未运行，正在启动..." -ForegroundColor Yellow
        wsl -d Ubuntu-22.04 --exec sudo systemctl start mysql
        Start-Sleep -Seconds 3
    }
} catch {
    Write-Host "⚠️  MySQL服务检查失败，请确保WSL已正确配置" -ForegroundColor Yellow
}

Write-Host "正在检查Redis服务..." -ForegroundColor Gray
try {
    $redisStatus = wsl -d Ubuntu-22.04 --exec sudo systemctl is-active redis-server 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Redis服务未运行，正在启动..." -ForegroundColor Yellow
        wsl -d Ubuntu-22.04 --exec sudo systemctl start redis-server
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "⚠️  Redis服务检查失败，请确保WSL已正确配置" -ForegroundColor Yellow
}
Write-Host "✅ 数据库服务检查完成" -ForegroundColor Green

# 检查端口占用并终止进程
Write-Host ""
Write-Host "[3/6] 检查端口占用..." -ForegroundColor Yellow
$ports = @(3000, 3002, 8080, 8081)

foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        Write-Host "⚠️  端口$port已被占用，正在终止进程..." -ForegroundColor Yellow
        foreach ($processId in $processes) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "无法终止进程 $processId" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 2
    }
}
Write-Host "✅ 端口检查完成" -ForegroundColor Green

# 启动后端服务器
Write-Host ""
Write-Host "[4/6] 启动后端服务器..." -ForegroundColor Yellow
Set-Location "backend"
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装后端依赖..." -ForegroundColor Blue
    npm install
}
Write-Host "🚀 启动后端服务器 (端口: 3000)..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/k", "node start-server-simple.js" -WindowStyle Normal -WindowTitle "FitChallenge Backend"
Start-Sleep -Seconds 5
Set-Location ".."

# 启动前端服务器
Write-Host ""
Write-Host "[5/6] 启动前端服务器..." -ForegroundColor Yellow
Set-Location "frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装前端依赖..." -ForegroundColor Blue
    npm install
}
Write-Host "🚀 启动前端服务器 (端口: 8080)..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run dev" -WindowStyle Normal -WindowTitle "FitChallenge Frontend"
Start-Sleep -Seconds 3
Set-Location ".."

# 启动管理后台
Write-Host ""
Write-Host "[6/6] 启动管理后台..." -ForegroundColor Yellow
Set-Location "admin"
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装管理后台依赖..." -ForegroundColor Blue
    npm install
}
Write-Host "📦 构建管理后台项目..." -ForegroundColor Blue
npm run build
Write-Host "🚀 启动管理后台 (端口: 8081)..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run serve" -WindowStyle Normal -WindowTitle "FitChallenge Admin"
Start-Sleep -Seconds 3
Set-Location ".."

# 等待服务启动
Write-Host ""
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 检查服务状态
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   服务启动状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端服务
Write-Host "检查后端服务 (端口: 3000)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 后端服务运行正常" -ForegroundColor Green
    } else {
        Write-Host "❌ 后端服务启动失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 后端服务启动失败" -ForegroundColor Red
}

# 检查前端服务
Write-Host "检查前端服务 (端口: 8080)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 前端服务运行正常" -ForegroundColor Green
    } else {
        Write-Host "❌ 前端服务启动失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 前端服务启动失败" -ForegroundColor Red
}

# 检查管理后台
Write-Host "检查管理后台 (端口: 8081)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 管理后台运行正常" -ForegroundColor Green
    } else {
        Write-Host "❌ 管理后台启动失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 管理后台启动失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 所有服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 访问地址:" -ForegroundColor White
Write-Host "  前端应用: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  管理后台: http://localhost:8081" -ForegroundColor Cyan
Write-Host "  后端API:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  健康检查: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "  系统测试: http://localhost:3000/api/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor White
Write-Host "  - 按 Ctrl+C 可以停止当前服务" -ForegroundColor Gray
Write-Host "  - 关闭对应的命令行窗口可以停止服务" -ForegroundColor Gray
Write-Host "  - 运行 test-complete-system.js 可以测试所有功能" -ForegroundColor Gray
Write-Host ""

Write-Host ""
Write-Host "🎉 启动完成！服务将继续在后台运行。" -ForegroundColor Green
Write-Host ""
Write-Host "📱 访问地址:" -ForegroundColor White
Write-Host "  前端应用: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  管理后台: http://localhost:8081" -ForegroundColor Cyan
Write-Host "  后端API:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  健康检查: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "  系统测试: http://localhost:3000/api/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor White
Write-Host "  - 服务已在后台运行，请勿关闭命令行窗口" -ForegroundColor Gray
Write-Host "  - 按 Ctrl+C 可以停止当前服务" -ForegroundColor Gray
Write-Host "  - 关闭对应的命令行窗口可以停止服务" -ForegroundColor Gray
Write-Host "  - 运行 test-complete-system.js 可以测试所有功能" -ForegroundColor Gray
Write-Host ""

# 询问是否打开浏览器
$openBrowser = Read-Host "是否打开浏览器访问前端应用? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:8080"
    Write-Host "✅ 已打开浏览器" -ForegroundColor Green
} else {
    Write-Host "ℹ️  您可以手动访问: http://localhost:8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 所有服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务将继续在后台运行..." -ForegroundColor Yellow
Write-Host "按任意键退出启动脚本（服务不会停止）..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
