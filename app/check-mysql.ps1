# اسکریپت بررسی وضعیت MySQL
Write-Host "🔍 بررسی وضعیت MySQL..." -ForegroundColor Green

# بررسی وجود MySQL
Write-Host "📋 بررسی وجود MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL موجود است: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL نصب نشده است یا در PATH نیست" -ForegroundColor Red
    Write-Host "💡 لطفاً MySQL را نصب کنید یا مسیر آن را به PATH اضافه کنید" -ForegroundColor Yellow
    exit 1
}

# بررسی اتصال به MySQL بدون رمز عبور
Write-Host "🔌 تست اتصال به MySQL بدون رمز عبور..." -ForegroundColor Yellow
try {
    $result = mysql -u root -e "SELECT VERSION();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ اتصال به MySQL موفق بود" -ForegroundColor Green
        Write-Host "📊 نسخه MySQL: $($result[0])" -ForegroundColor Cyan
    } else {
        Write-Host "❌ اتصال به MySQL ناموفق بود" -ForegroundColor Red
        Write-Host "🔍 خطا: $result" -ForegroundColor Red
        
        # تست با رمز عبور خالی
        Write-Host "🔌 تست اتصال با رمز عبور خالی..." -ForegroundColor Yellow
        $result2 = mysql -u root -p -e "SELECT VERSION();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ اتصال با رمز عبور خالی موفق بود" -ForegroundColor Green
        } else {
            Write-Host "❌ اتصال با رمز عبور خالی هم ناموفق بود" -ForegroundColor Red
            Write-Host "💡 ممکن است نیاز به تنظیم رمز عبور MySQL باشد" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ خطا در تست اتصال: $_" -ForegroundColor Red
}

# بررسی وجود دیتابیس franumbot_db
Write-Host "🗄️ بررسی وجود دیتابیس franumbot_db..." -ForegroundColor Yellow
try {
    $dbCheck = mysql -u root -e "SHOW DATABASES LIKE 'franumbot_db';" 2>&1
    if ($dbCheck -match "franumbot_db") {
        Write-Host "✅ دیتابیس franumbot_db موجود است" -ForegroundColor Green
    } else {
        Write-Host "⚠️ دیتابیس franumbot_db موجود نیست" -ForegroundColor Yellow
        Write-Host "💡 اجرای setup-database.js برای ایجاد دیتابیس" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ خطا در بررسی دیتابیس: $_" -ForegroundColor Red
}

Write-Host "🎯 پیشنهادات:" -ForegroundColor Cyan
Write-Host "1. اگر MySQL رمز عبور دارد، آن را در فایل .env.local تنظیم کنید" -ForegroundColor White
Write-Host "2. اگر MySQL رمز عبور ندارد، فایل‌های connection را بدون رمز عبور نگه دارید" -ForegroundColor White
Write-Host "3. برای ایجاد دیتابیس: node setup-database.js" -ForegroundColor White
Write-Host "4. برای راه‌اندازی کامل: .\start-system.ps1" -ForegroundColor White
