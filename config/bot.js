module.exports = {
  // Environment configuration
  environment: 'development', // 'development' | 'production'
  
  // Webhook URL configuration
  webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/api',
  
  // Zibal payment gateway configuration
  zibal: {
    // Sandbox configuration (for development/testing)
    sandbox: {
      merchant: 'zibal',
      baseUrl: 'https://gateway.zibal.ir/v1',
      startUrl: 'https://gateway.zibal.ir/start'
    },
    
    // Production configuration
    main: {
      merchant: 'zibal',
      baseUrl: 'https://gateway.zibal.ir/v1',
      startUrl: 'https://gateway.zibal.ir/start'
    }
  },
  
  // Bot configuration
  bot: {
    token: process.env.BOT_TOKEN || '8200827364:AAGVkmbDAHNBrIY31deTelKzbQ1Rob5Y2KE',
    username: process.env.BOT_USERNAME || 'FragmentParsiBot'
  },
  
  // Mini App configuration
  miniApp: {
    name: 'FragmentParsi',
    url: process.env.MINI_APP_URL || 'https://app.numberstar.shop'
  },
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'franumbot_db'
  },
  
  // Referral configuration
  referral: {
    rewardPercentage: 25.00,
    minRewardAmount: 1000
  },
  
  // Messages configuration
  messages: {
    start: `با ربات فرگمنت فارسی میتونید پرمیوم و استارز تلگرام و شماره مجازی رو با ارزون ترین قیمت بخرید اول قیمت ها را مقایسه کنید سپس خرید کنید.`,
    help: `راهنمای استفاده از ربات:`,
    referral: `🎉 شما با لینک رفرال وارد شدید!\n\nاز خدمات ما لذت ببرید و دوستان خود را نیز معرفی کنید.`,
    error: `❌ خطایی رخ داده است. لطفاً دوباره تلاش کنید.`
  }
};
