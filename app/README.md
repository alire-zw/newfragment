# فرگمنت فارسی - مینی اپ تلگرام

مینی اپ تلگرام برای خرید شماره مجازی، استارز و پریمیوم تلگرام با ارزان‌ترین قیمت.

## ویژگی‌ها

- 🛍️ خرید شماره مجازی
- ⭐ خرید استارز تلگرام
- 👑 خرید پریمیوم تلگرام
- 🎯 سیستم رفرال گیری
- 💰 پاداش برای معرفی دوستان
- 📱 رابط کاربری زیبا و مدرن
- 🔐 احراز هویت کاربران

## ساختار پروژه

```
app/
├── src/                    # کدهای Next.js
│   ├── app/               # صفحات و API ها
│   ├── components/        # کامپوننت‌های React
│   ├── hooks/            # Custom hooks
│   └── styles/           # استایل‌ها
├── database/              # دیتابیس و سرویس‌ها
├── bot/                   # ربات تلگرام
├── config/               # فایل‌های کانفیگ
└── public/               # فایل‌های استاتیک
```

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
npm install
```

### 2. راه‌اندازی دیتابیس
```bash
# ایجاد دیتابیس
npm run build
# سپس به http://localhost:3000/api/database/init بروید (POST)
```

### 3. راه‌اندازی مینی اپ
```bash
npm run dev
```

### 4. راه‌اندازی ربات تلگرام
```bash
# نصب وابستگی‌های ربات
npm run bot:install

# راه‌اندازی ربات
npm run bot:start
```

## تنظیمات

### متغیرهای محیطی
فایل `.env.local` ایجاد کنید:

```env
# دیتابیس
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=franumbot_db

# ربات تلگرام
BOT_TOKEN=YOUR_BOT_TOKEN
BOT_USERNAME=EsalatGiftBot
MINI_APP_URL=https://your-domain.com
```

### تنظیمات ربات
فایل `bot/.env` ایجاد کنید:

```env
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
BOT_USERNAME=EsalatGiftBot
MINI_APP_URL=https://your-mini-app-url.com
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=franumbot_db
```

## API Endpoints

### کاربران
- `POST /api/users/save` - ذخیره کاربر
- `GET /api/users/get` - دریافت اطلاعات کاربر

### رفرال
- `GET /api/referrals/stats` - آمار رفرال
- `POST /api/referrals/process` - پردازش رفرال

### دیتابیس
- `POST /api/database/init` - ایجاد دیتابیس

## سیستم رفرال

### نحوه کارکرد
1. کاربر لینک رفرال خود را کپی می‌کند
2. دوستش لینک را باز می‌کند
3. پارامتر `startapp=referred_by_{telegramID}` پردازش می‌شود
4. رفرال در دیتابیس ثبت می‌شود
5. معرف پاداش دریافت می‌کند

### فرمت لینک رفرال
```
https://t.me/EsalatGiftBot/Esalat?startapp=123456789
```

## کامندهای ربات

- `/start` - شروع کار با ربات
- `/help` - راهنمای استفاده
- `/shop` - خرید شماره مجازی
- `/stars` - خرید استارز
- `/premium` - خرید پریمیوم
- `/profile` - مشاهده پروفایل

## تکنولوژی‌ها

### Frontend
- Next.js 15
- React 19
- TypeScript
- CSS Modules

### Backend
- Next.js API Routes
- MySQL
- Node.js

### Bot
- Telegraf
- MySQL2

## پشتیبانی

برای پشتیبانی با [@alire_zw](https://t.me/alire_zw) تماس بگیرید.

## لایسنس

MIT License