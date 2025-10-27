# اسکریپت راه‌اندازی کامل سیستم FranumBot
Write-Host "🚀 شروع راه‌اندازی سیستم FranumBot..." -ForegroundColor Green

# بررسی وجود Node.js
Write-Host "🔍 بررسی Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js موجود است: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js نصب نشده است. لطفاً ابتدا Node.js را نصب کنید." -ForegroundColor Red
    exit 1
}

# بررسی وجود MySQL
Write-Host "🔍 بررسی MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL موجود است: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL نصب نشده است. لطفاً ابتدا MySQL را نصب کنید." -ForegroundColor Red
    exit 1
}

# نصب dependencies برای Next.js app
Write-Host "📦 نصب dependencies برای Next.js app..." -ForegroundColor Yellow
Set-Location "app"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ خطا در نصب dependencies Next.js app" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies Next.js app نصب شدند" -ForegroundColor Green

# نصب dependencies برای bot
Write-Host "📦 نصب dependencies برای bot..." -ForegroundColor Yellow
Set-Location "bot"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ خطا در نصب dependencies bot" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies bot نصب شدند" -ForegroundColor Green

# بازگشت به دایرکتوری اصلی
Set-Location ".."

# راه‌اندازی دیتابیس
Write-Host "🗄️ راه‌اندازی دیتابیس..." -ForegroundColor Yellow
node setup-database.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ خطا در راه‌اندازی دیتابیس" -ForegroundColor Red
    exit 1
}
Write-Host "✅ دیتابیس راه‌اندازی شد" -ForegroundColor Green

# ایجاد فایل .env.local
Write-Host "⚙️ ایجاد فایل تنظیمات..." -ForegroundColor Yellow
$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=franumbot_db

# Bot Configuration
BOT_TOKEN=8200827364:AAGVkmbDAHNBrIY31deTelKzbQ1Rob5Y2KE
BOT_USERNAME=FragmentParsiBot

# Mini App Configuration
MINI_APP_URL=https://app.numberstar.shop
NEXT_PUBLIC_BASE_URL=https://app.numberstar.shop

# TON Configuration
TON_WALLET_MNEMONIC=example skirt mixed faith purity exact jar dad collect slice prize pole sail fatal rookie hunt early explain piece cross wrist organ soccer bottom
TON_API_KEY=6cb7852c6bfb7e962fb9a3c1e370e17cd77591fef381daedb07dbc627986008b
TON_DEFAULT_ADDRESS=UQBwD9i5KzLLqnOSLEli2XASema8pcyeJ7mmK7FB3UY35zQm
NEXT_PUBLIC_TON_WALLET_MNEMONIC=example skirt mixed faith purity exact jar dad collect slice prize pole sail fatal rookie hunt early explain piece cross wrist organ soccer bottom
NEXT_PUBLIC_TON_API_KEY=6cb7852c6bfb7e962fb9a3c1e370e17cd77591fef381daedb07dbc627986008b

# MarketApp Configuration
MARKETAPP_SESSION=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogImVjOTcyZmIwNjFiMDIzODAiLCAiYWRkcmVzcyI6ICIwOjcwMGZkOGI5MmIzMmNiYWE3MzkyMmM0OTYyZDk3MDEyN2E2NmJjYTVjYzllMjdiOWE2MmJiMTQxZGQ0NjM3ZTciLCAicmVmIjogImNBX1l1U3N5eTZwemtpeEpZdGx3RW5wbXZLWE1uaWU1cGl1eFFkMUdOLWM9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aP05NA.3HOJywEqT8sFGJ-FOv0vgY-9lfM
MARKETAPP_YM_UID=1759356516526866044
MARKETAPP_YM_D=1759356516
MARKETAPP_YM_ISAD=2
MARKETAPP_YM_VISORC=w
MARKETAPP_JS_P=714,1800,0,0,0
MARKETAPP_JHASH=960
MARKETAPP_JUA=Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A144.0%29%20Gecko%2F20100101%20Firefox%2F144.0
MARKETAPP_HASH=1f07f1fcaff146551794f0f3b008bf81
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ فایل .env.local ایجاد شد" -ForegroundColor Green

Write-Host "🎉 راه‌اندازی کامل شد!" -ForegroundColor Green
Write-Host "📝 برای شروع سیستم، دستورات زیر را اجرا کنید:" -ForegroundColor Cyan
Write-Host "   1. npm run dev (برای Next.js app)" -ForegroundColor White
Write-Host "   2. cd bot && npm start (برای ربات تلگرام)" -ForegroundColor White
Write-Host "   3. یا از start-bot.ps1 استفاده کنید" -ForegroundColor White
