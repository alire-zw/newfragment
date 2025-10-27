const { Telegraf } = require('telegraf');
const { botConfig } = require('./config');

// ID کانال گزارشات
const REPORT_CHANNEL_ID = '-1003271407389';

// ایجاد ربات
const bot = new Telegraf(botConfig.botToken);

// تابع برای فرمت کردن مبلغ
function formatPrice(price) {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// تابع برای فرمت کردن تاریخ
function formatDate(date) {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

async function sendTestReport() {
  try {
    // گزارش تست خرید استارز
    const starsMessage = `⭐ خرید استارز جدید

🆔 شناسه خرید: STARS_1760311010778_deix1beeu
👤 خریدار: کاربر تست
🆔 تلگرام: 221898889
🎯 گیرنده: . (@Y_num)
⭐ تعداد: 50 استارز
💰 قیمت: ${formatPrice(98426)}
💳 آدرس پرداخت: EQCYCA-47lALps90xoFFIPVznOsiHlWVKF3cEDChKgP3JYEf
📅 تاریخ: ${formatDate(new Date())}
✅ وضعیت: تکمیل شده`;

    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, starsMessage);
    
    console.log('✅ گزارش تست استارز ارسال شد');
    
    // گزارش تست خرید شماره مجازی
    const virtualNumberMessage = `📞 خرید شماره مجازی جدید

🆔 شناسه خرید: VN_1758139956510_wzvc5tand
👤 خریدار: کاربر تست
🆔 تلگرام: 1457637832
📱 شماره: +14633636792
🌍 کشور: آمریکا (+1)
📞 رنج: 1
🔧 سرویس: تلگرام (پنل اختصاصی)
⭐ کیفیت: 🔴 کیفیت کشور انتخاب شده ( پایین ) میباشد؛

🌟 امتیاز کیفیــتـ : 10/2
💰 قیمت: ${formatPrice(45500)}
📅 تاریخ: ${formatDate(new Date())}
✅ وضعیت: فعال`;

    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, virtualNumberMessage);
    
    console.log('✅ گزارش تست شماره مجازی ارسال شد');
    
  } catch (error) {
    console.error('❌ خطا در ارسال گزارش تست:', error);
  } finally {
    process.exit(0);
  }
}

sendTestReport();
