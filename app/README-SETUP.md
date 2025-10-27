# FranumBot - راهنمای راه‌اندازی

## 📋 پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- MySQL (نسخه 8.0 یا بالاتر)
- PowerShell (برای اجرای اسکریپت‌ها)

## 🚀 راه‌اندازی سریع

### روش 1: راه‌اندازی کامل خودکار
```powershell
# در دایرکتوری app اجرا کنید
.\start-system.ps1
```

### روش 2: راه‌اندازی دستی

#### 1. نصب Dependencies
```bash
# نصب dependencies برای Next.js app
npm install

# نصب dependencies برای bot
cd bot
npm install
cd ..
```

#### 2. راه‌اندازی دیتابیس
```bash
# اجرای اسکریپت راه‌اندازی دیتابیس
node setup-database.js
```

#### 3. ایجاد فایل تنظیمات
فایل `.env.local` را با محتوای زیر ایجاد کنید:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Alireza1380#
DB_NAME=franumbot_db

# Bot Configuration
BOT_TOKEN=8200827364:AAGVkmbDAHNBrIY31deTelKzbQ1Rob5Y2KE
BOT_USERNAME=FragmentParsiBot

# Mini App Configuration
MINI_APP_URL=https://app.numberstar.shop
NEXT_PUBLIC_BASE_URL=https://app.numberstar.shop
```

#### 4. راه‌اندازی سرویس‌ها

**راه‌اندازی Next.js app:**
```bash
npm run dev
```

**راه‌اندازی ربات تلگرام:**
```bash
cd bot
.\start-bot.ps1
```

**یا راه‌اندازی همزمان:**
```bash
.\start-all.ps1
```

## 🔧 عیب‌یابی

### مشکل Hash Mismatch
اگر با خطای "Hash mismatch" مواجه شدید:
1. مطمئن شوید که `BOT_TOKEN` صحیح است
2. در محیط development، این خطا نادیده گرفته می‌شود
3. برای production، باید hash validation را اصلاح کنید

### مشکل دسترسی دیتابیس
اگر با خطای دسترسی MySQL مواجه شدید:
1. مطمئن شوید که MySQL در حال اجرا است
2. رمز عبور کاربر `root` را بررسی کنید
3. دسترسی‌های کاربر را بررسی کنید

### مشکل تداخل ربات (409 Conflict)
اگر ربات با خطای 409 مواجه شد:
1. تمام instance های قبلی ربات را متوقف کنید
2. چند ثانیه صبر کنید
3. دوباره ربات را راه‌اندازی کنید

## 📁 ساختار پروژه

```
app/
├── src/                    # کدهای Next.js
│   ├── app/               # صفحات و API routes
│   ├── components/        # کامپوننت‌های React
│   ├── database/          # سرویس‌های دیتابیس
│   ├── hooks/             # Custom hooks
│   ├── services/          # سرویس‌های خارجی
│   └── utils/             # توابع کمکی
├── bot/                   # کدهای ربات تلگرام
│   ├── index.js          # فایل اصلی ربات
│   ├── config.js          # تنظیمات ربات
│   └── start-bot.ps1     # اسکریپت راه‌اندازی ربات
├── database/              # فایل‌های دیتابیس
├── public/                # فایل‌های استاتیک
├── setup-database.js      # اسکریپت راه‌اندازی دیتابیس
├── start-system.ps1      # اسکریپت راه‌اندازی کامل
└── start-all.ps1         # اسکریپت راه‌اندازی همزمان
```

## 🌐 دسترسی‌ها

- **Next.js App:** http://localhost:6592
- **API Endpoints:** http://localhost:6592/api/*
- **Bot:** از طریق تلگرام

## 📞 پشتیبانی

در صورت بروز مشکل، لاگ‌های کنسول را بررسی کنید و با تیم توسعه تماس بگیرید.
