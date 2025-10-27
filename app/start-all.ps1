# اسکریپت راه‌اندازی کامل سیستم FranumBot
Write-Host "🚀 راه‌اندازی کامل سیستم FranumBot..." -ForegroundColor Green

# بررسی وجود فایل‌های مورد نیاز
if (-not (Test-Path "package.json")) {
    Write-Host "❌ فایل package.json یافت نشد! لطفاً در دایرکتوری app باشید." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "bot/index.js")) {
    Write-Host "❌ فایل bot/index.js یافت نشد!" -ForegroundColor Red
    exit 1
}

# متوقف کردن instance های قبلی
Write-Host "🛑 متوقف کردن instance های قبلی..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# بررسی وجود dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 نصب dependencies Next.js..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ خطا در نصب dependencies Next.js" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path "bot/node_modules")) {
    Write-Host "📦 نصب dependencies Bot..." -ForegroundColor Yellow
    Set-Location "bot"
    npm install
    Set-Location ".."
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ خطا در نصب dependencies Bot" -ForegroundColor Red
        exit 1
    }
}

# راه‌اندازی Next.js در background
Write-Host "🌐 راه‌اندازی Next.js app..." -ForegroundColor Green
$nextjsJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# صبر کردن 5 ثانیه برای راه‌اندازی Next.js
Write-Host "⏳ صبر کردن 5 ثانیه برای راه‌اندازی Next.js..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# راه‌اندازی ربات در background
Write-Host "🤖 راه‌اندازی ربات تلگرام..." -ForegroundColor Green
$botJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "bot"
    node index.js
}

Write-Host "✅ سیستم راه‌اندازی شد!" -ForegroundColor Green
Write-Host "📱 Next.js app: http://localhost:6592" -ForegroundColor Cyan
Write-Host "🤖 ربات تلگرام در حال اجرا است" -ForegroundColor Cyan
Write-Host "⚠️ برای متوقف کردن سیستم، Ctrl+C را فشار دهید" -ForegroundColor Yellow

# نمایش وضعیت jobs
try {
    while ($true) {
        $nextjsStatus = Get-Job -Id $nextjsJob.Id | Select-Object -ExpandProperty State
        $botStatus = Get-Job -Id $botJob.Id | Select-Object -ExpandProperty State
        
        Write-Host "📊 وضعیت سیستم:" -ForegroundColor Blue
        Write-Host "   Next.js: $nextjsStatus" -ForegroundColor White
        Write-Host "   Bot: $botStatus" -ForegroundColor White
        
        if ($nextjsStatus -eq "Failed" -or $botStatus -eq "Failed") {
            Write-Host "❌ یکی از سرویس‌ها با خطا مواجه شد!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "🛑 متوقف کردن سیستم..." -ForegroundColor Yellow
} finally {
    # متوقف کردن jobs
    Stop-Job -Id $nextjsJob.Id -ErrorAction SilentlyContinue
    Stop-Job -Id $botJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $nextjsJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $botJob.Id -ErrorAction SilentlyContinue
    
    Write-Host "✅ سیستم متوقف شد" -ForegroundColor Green
}
