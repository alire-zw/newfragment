# راهنمای راه‌اندازی دیتابیس

## پیش‌نیازها
- XAMPP نصب شده باشد
- MySQL در XAMPP فعال باشد
- phpMyAdmin در دسترس باشد

## مراحل راه‌اندازی

### 1. ایجاد دیتابیس
1. XAMPP را اجرا کنید
2. Apache و MySQL را start کنید
3. به phpMyAdmin بروید (http://localhost/phpmyadmin)
4. فایل `schema.sql` را اجرا کنید تا دیتابیس و جدول‌ها ایجاد شوند

### 2. تنظیمات اتصال
فایل `connection.ts` را بررسی کنید و در صورت نیاز تنظیمات زیر را تغییر دهید:
- `host`: آدرس سرور دیتابیس (پیش‌فرض: localhost)
- `user`: نام کاربری دیتابیس (پیش‌فرض: root)
- `password`: رمز عبور دیتابیس (پیش‌فرض: خالی)
- `database`: نام دیتابیس (پیش‌فرض: franumbot_db)

### 3. ساختار جدول کاربران
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID VARCHAR(255) UNIQUE NOT NULL,
    userFullName VARCHAR(255) NOT NULL,
    userTelegramID BIGINT UNIQUE NOT NULL,
    userBirthDate DATE NULL,
    userNationalID VARCHAR(20) NULL,
    userPhoneNumber VARCHAR(20) NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. API Endpoints
- `POST /api/users/save` - ذخیره یا بروزرسانی کاربر
- `GET /api/users/get?telegramID=123` - دریافت اطلاعات کاربر بر اساس شناسه تلگرام
- `GET /api/users/get?userID=username` - دریافت اطلاعات کاربر بر اساس شناسه کاربری

### 5. استفاده در کد
```typescript
import { useUser } from '@/hooks/useUser';

const { user, loading, error } = useUser();
```

## نکات مهم
- دیتابیس به صورت خودکار هنگام ورود کاربر به صفحه اصلی ایجاد می‌شود
- اطلاعات کاربران در جدول `users` ذخیره می‌شود
- از connection pool برای بهبود عملکرد استفاده شده است
