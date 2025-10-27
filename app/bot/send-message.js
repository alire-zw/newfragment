const { Telegraf } = require('telegraf');
const { botConfig } = require('./config');

// ایجاد ربات
const bot = new Telegraf(botConfig.botToken);

// ID کانال
const CHANNEL_ID = '-1003271407389';

async function sendMessage() {
  try {
    // ارسال پیام به کانال
    await bot.telegram.sendMessage(CHANNEL_ID, '🤖 ربات آماده دریافت گزارش‌های خرید است!');
    console.log('✅ پیام با موفقیت ارسال شد!');
  } catch (error) {
    console.error('❌ خطا در ارسال پیام:', error);
  } finally {
    process.exit(0);
  }
}

sendMessage();
