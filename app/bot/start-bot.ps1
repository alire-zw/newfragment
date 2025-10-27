# اسکریپت راه‌اندازی ربات تلگرام
Write-Host "🤖 راه‌اندازی ربات تلگرام..." -ForegroundColor Green

# بررسی وجود فایل‌های مورد نیاز
if (-not (Test-Path "index.js")) {
    Write-Host "❌ فایل index.js یافت نشد!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "config.js")) {
    Write-Host "❌ فایل config.js یافت نشد!" -ForegroundColor Red
    exit 1
}

# بررسی وجود node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 نصب dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ خطا در نصب dependencies" -ForegroundColor Red
        exit 1
    }
}

# متوقف کردن instance های قبلی ربات
Write-Host "🛑 متوقف کردن instance های قبلی ربات..." -ForegroundColor Yellow
$botProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*index.js*" -or $_.CommandLine -like "*bot*" 
}
if ($botProcesses) {
    $botProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Instance های قبلی متوقف شدند" -ForegroundColor Green
}

# صبر کردن 5 ثانیه برای اطمینان از آزاد شدن پورت
Write-Host "⏳ صبر کردن 5 ثانیه..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# راه‌اندازی ربات
Write-Host "🚀 راه‌اندازی ربات..." -ForegroundColor Green
Write-Host "📱 ربات در حال راه‌اندازی است..." -ForegroundColor Cyan
Write-Host "⚠️ برای متوقف کردن ربات، Ctrl+C را فشار دهید" -ForegroundColor Yellow

try {
    node index.js
} catch {
    Write-Host "❌ خطا در راه‌اندازی ربات: $_" -ForegroundColor Red
    exit 1
}
