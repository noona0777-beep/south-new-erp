# South New System - Automated Server Runner
# This script kills old node instances and starts both FE and BE

Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "🚀 Starting Backend (Server)..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "c:\Users\TsT\Desktop\(SRS)\ff4\SouthNewSystem\server"

Write-Host "🚀 Starting Frontend (Vite)..." -ForegroundColor Green
Set-Location "c:\Users\TsT\Desktop\(SRS)\ff4\SouthNewSystem\client"
Start-Process "cmd" -ArgumentList "/c npm run dev" -NoNewWindow

Write-Host "✅ System is running!" -ForegroundColor White
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5173"
