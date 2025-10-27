# 🍪 Cookie Refresh Service

سرویس خودکار برای بروزرسانی کوکی‌های `marketapp.ws` هر 5 دقیقه.

## 🚀 ویژگی‌ها

- **بروزرسانی خودکار**: هر 5 دقیقه کوکی‌های جدید دریافت می‌کند
- **ذخیره در دیتابیس**: کوکی‌ها در دیتابیس ذخیره می‌شوند
- **تست خودکار**: کوکی‌ها قبل از ذخیره تست می‌شوند
- **مدیریت خطا**: در صورت خطا، کوکی‌های قبلی حفظ می‌شوند
- **API مدیریت**: امکان شروع/توقف سرویس از طریق API

## 📁 فایل‌ها

- `CookieRefreshService.ts` - سرویس اصلی
- `startCookieService.ts` - مدیریت سرویس
- `cookieServiceMain.ts` - فایل اجرایی اصلی
- `runMigrations.ts` - اجرای migration های دیتابیس

## 🗄️ جداول دیتابیس

### `cookies`
ذخیره کوکی‌های استخراج شده

### `active_cookies`
کوکی‌های فعال و معتبر

### `cookie_refresh_logs`
لاگ‌های بروزرسانی کوکی

## 🛠️ نصب و راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
npm install
```

### 2. اجرای Migration
```bash
npm run migrate
```

### 3. شروع سرویس
```bash
npm run cookie-service
```

## 🔧 API Endpoints

### مدیریت سرویس
```
POST /api/admin/cookie-service
```

**Actions:**
- `start` - شروع سرویس
- `stop` - توقف سرویس
- `status` - وضعیت سرویس
- `refresh` - بروزرسانی فوری

**مثال:**
```bash
curl -X POST http://localhost:6592/api/admin/cookie-service \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

## 📊 استفاده در کد

### دریافت کوکی‌ها از دیتابیس
```typescript
import { getCurrentCookies, getCookieStringFromDB } from '../utils/cookieManager';

// دریافت کوکی‌ها به صورت object
const cookies = await getCurrentCookies();

// دریافت کوکی‌ها به صورت string
const cookieString = await getCookieStringFromDB();
```

## 🔄 فرآیند کار

1. **شروع سرویس**: Browser راه‌اندازی می‌شود
2. **رفتن به سایت**: `marketapp.ws` باز می‌شود
3. **استخراج کوکی‌ها**: کوکی‌های جدید استخراج می‌شوند
4. **تست کوکی‌ها**: API های مختلف تست می‌شوند
5. **ذخیره در دیتابیس**: کوکی‌های معتبر ذخیره می‌شوند
6. **انتظار**: 5 دقیقه صبر می‌کند
7. **تکرار**: فرآیند تکرار می‌شود

## ⚠️ نکات مهم

- سرویس در حالت `headless` اجرا می‌شود
- در صورت خطا، کوکی‌های قبلی حفظ می‌شوند
- لاگ‌های کامل در console نمایش داده می‌شوند
- سرویس با `Ctrl+C` متوقف می‌شود

## 🐛 عیب‌یابی

### بررسی وضعیت سرویس
```bash
curl http://localhost:6592/api/admin/cookie-service
```

### بررسی لاگ‌ها
```sql
SELECT * FROM cookie_refresh_logs ORDER BY createdAt DESC LIMIT 10;
```

### بررسی کوکی‌های فعال
```sql
SELECT * FROM active_cookies WHERE testResult = TRUE;
```