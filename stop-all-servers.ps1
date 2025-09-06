# FitChallenge 停止所有服务器 (PowerShell版本)
# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FitChallenge 停止所有服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在停止所有FitChallenge相关进程..." -ForegroundColor Yellow

# 停止Node.js进程
Write-Host "[1/3] 停止Node.js进程..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Stop-Process -Name "node" -Force
        Write-Host "✅ Node.js进程已停止" -ForegroundColor Green
    } else {
        Write-Host "✅ 没有找到Node.js进程" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ 没有找到Node.js进程" -ForegroundColor Green
}

# 停止特定端口的进程
Write-Host "[2/3] 停止端口占用进程..." -ForegroundColor Yellow
$ports = @(3000, 3002, 8080, 8081)

foreach ($port in $ports) {
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($processes) {
            foreach ($processId in $processes) {
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                } catch {
                    Write-Host "无法终止进程 $processId" -ForegroundColor Red
                }
            }
        }
    } catch {
        # 端口没有进程占用
    }
}
Write-Host "✅ 端口占用进程已停止" -ForegroundColor Green

# 停止数据库服务
Write-Host "[3/3] 停止数据库服务..." -ForegroundColor Yellow
try {
    wsl -d Ubuntu-22.04 --exec sudo systemctl stop mysql 2>$null
    wsl -d Ubuntu-22.04 --exec sudo systemctl stop redis-server 2>$null
    Write-Host "✅ 数据库服务已停止" -ForegroundColor Green
} catch {
    Write-Host "⚠️  数据库服务停止失败，请手动检查" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 所有服务已停止！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "按任意键退出..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
