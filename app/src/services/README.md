# 🔐 Wallet Service Configuration

این سرویس برای مدیریت تراکنش‌های TON و Telegram استفاده می‌شود.

## ⚙️ تنظیمات Environment Variables

### 1. کپی کردن فایل مثال
```bash
cp env.example .env
```

### 2. ویرایش فایل `.env`
```env
TON_WALLET_MNEMONIC="your-24-word-mnemonic-here"
TON_API_KEY="your-ton-center-api-key-here"
TON_DEFAULT_ADDRESS="your-wallet-address-here"
```

### 3. دریافت API Key جدید
- به [TON Center](https://toncenter.com) مراجعه کنید
- حساب کاربری بسازید
- API Key دریافت کنید

## 🔒 نکات امنیتی

### ⚠️ مهم:
- **هرگز** کلیدهای واقعی را در git commit نکنید
- فایل `.env` را به `.gitignore` اضافه کنید
- از کلیدهای قوی و منحصر به فرد استفاده کنید
- کلیدها را به صورت دوره‌ای تغییر دهید

### 🛡️ محافظت:
- فایل `.env` فقط در سرور production قابل دسترسی باشد
- از متغیرهای محیطی سیستم استفاده کنید
- لاگ‌های حاوی کلیدها را فیلتر کنید

## 📝 استفاده در کد

```typescript
import WalletService from './WalletService';

// استفاده خودکار از environment variables
const walletService = new WalletService();

// یا استفاده با API key سفارشی
const walletService = new WalletService('your-custom-api-key');
```

## 🚀 تست

برای تست تنظیمات:

```typescript
const walletService = new WalletService();
const address = await walletService.getCurrentAddress();
console.log('Wallet Address:', address);
```

## 📞 پشتیبانی

در صورت مشکل:
1. لاگ‌های کنسول را بررسی کنید
2. تنظیمات `.env` را چک کنید
3. اتصال اینترنت را بررسی کنید
