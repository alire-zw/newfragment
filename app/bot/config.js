const botConfig = {
  // تنظیمات ربات تلگرام
  botToken: process.env.BOT_TOKEN || '8200827364:AAGVkmbDAHNBrIY31deTelKzbQ1Rob5Y2KE',
  botUsername: process.env.BOT_USERNAME || 'FragmentParsiBot',
  
  // تنظیمات مینی اپ
  miniAppName: 'FragmentFarsi',
  miniAppUrl: process.env.MINI_APP_URL || 'https://app.numberstar.shop',
  
  // تنظیمات دیتابیس
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Alireza1380#',
    database: process.env.DB_NAME || 'franumbot_db'
  },
  
  // تنظیمات رفرال
  referral: {
    rewardPercentage: 25.00,
    minRewardAmount: 1000
  },
  
  // پیام‌های ربات
  messages: {
    start: `🤖 با ربات فرگمنت فارسی میتونید پرمیوم و استارز تلگرام و شماره مجازی رو با ارزون ترین قیمت بخرید 💰 اول قیمت ها را مقایسه کنید سپس خرید کنید 🛒`,
    help: `راهنمای استفاده از ربات:
 `,
    
    referral: `🎉 شما با لینک رفرال وارد شدید!
    
از خدمات ما لذت ببرید و دوستان خود را نیز معرفی کنید.`,
    
    error: `❌ خطایی رخ داده است. لطفاً دوباره تلاش کنید.`
  }
};

module.exports = { botConfig };
