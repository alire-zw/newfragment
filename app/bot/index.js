const { Telegraf } = require('telegraf');
const mysql = require('mysql2/promise');
const { botConfig } = require('./config');

// ایجاد اتصال دیتابیس
const dbConfig = {
  host: botConfig.database.host,
  user: botConfig.database.user,
  password: botConfig.database.password,
  database: botConfig.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// ایجاد ربات
const bot = new Telegraf(botConfig.botToken);

// Middleware برای لاگ کردن
bot.use((ctx, next) => {
  console.log(`📱 پیام از کاربر ${ctx.from.id}: ${ctx.message?.text || 'کامند'}`);
  return next();
});

// کامند /start
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || `user_${userId}`;
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'بدون نام';
    
    // بررسی پارامتر startapp
    const startParam = ctx.startPayload;
    let referralMessage = '';
    
    if (startParam && /^\d+$/.test(startParam)) {
      const referrerId = startParam;
      
      // ثبت رفرال در دیتابیس
      try {
        const connection = await pool.getConnection();
        
        // بررسی وجود کاربر معرف
        const [referrerUsers] = await connection.execute(
          'SELECT userID FROM users WHERE userTelegramID = ?',
          [referrerId]
        );
        
        if (referrerUsers.length > 0) {
          // ثبت رفرال
          await connection.execute(
            `INSERT INTO referrals (referrerID, referredID, referrerTelegramID, referredTelegramID, referralCode, status, rewardPercentage)
             VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
            [
              referrerUsers[0].userID,
              username,
              referrerId,
              userId,
              startParam,
              botConfig.referral.rewardPercentage
            ]
          );
          
          referralMessage = `\n\n${botConfig.messages.referral}`;
        }
        
        connection.release();
      } catch (error) {
        console.error('❌ خطا در ثبت رفرال:', error);
      }
    }
    
    // ارسال پیام خوش‌آمدگویی
    await ctx.reply(botConfig.messages.start + referralMessage, {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📞 خرید شماره مجازی',
            web_app: { url: `${botConfig.miniAppUrl}/shop/virtual-number` }
          }],
          [{
            text: '⭐ خرید استارز',
            web_app: { url: `${botConfig.miniAppUrl}/stars` }
          }, {
            text: '💎 خرید پریمیوم',
            web_app: { url: `${botConfig.miniAppUrl}/premium` }
          }],
          [{
            text: '👤 پروفایل',
            web_app: { url: `${botConfig.miniAppUrl}/profile` }
          }]
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در کامند start:', error);
    await ctx.reply(botConfig.messages.error);
  }
});

// کامند /help
bot.help(async (ctx) => {
  await ctx.reply(botConfig.messages.help, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📞 خرید شماره مجازی',
          web_app: { url: `${botConfig.miniAppUrl}/shop/virtual-number` }
        }],
        [{
          text: '⭐ خرید استارز',
          web_app: { url: `${botConfig.miniAppUrl}/stars` }
        }, {
          text: '💎 خرید پریمیوم',
          web_app: { url: `${botConfig.miniAppUrl}/premium` }
        }],
        [{
          text: '👤 پروفایل',
          web_app: { url: `${botConfig.miniAppUrl}/profile` }
        }]
      ]
    }
  });
});

// کامند /shop
bot.command('shop', async (ctx) => {
  await ctx.reply('📞 برای خرید شماره مجازی، روی دکمه زیر کلیک کنید:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📞 خرید شماره مجازی',
          web_app: { url: `${botConfig.miniAppUrl}/shop/virtual-number` }
        }]
      ]
    }
  });
});

// کامند /stars
bot.command('stars', async (ctx) => {
  await ctx.reply('⭐ برای خرید استارز، روی دکمه زیر کلیک کنید:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '⭐ خرید استارز',
          web_app: { url: `${botConfig.miniAppUrl}/stars` }
        }]
      ]
    }
  });
});

// کامند /premium
bot.command('premium', async (ctx) => {
  await ctx.reply('💎 برای خرید پریمیوم، روی دکمه زیر کلیک کنید:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '💎 خرید پریمیوم',
          web_app: { url: `${botConfig.miniAppUrl}/premium` }
        }]
      ]
    }
  });
});

// کامند /profile
bot.command('profile', async (ctx) => {
  await ctx.reply('👤 برای مشاهده پروفایل، روی دکمه زیر کلیک کنید:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '👤 پروفایل',
          web_app: { url: `${botConfig.miniAppUrl}/profile` }
        }]
      ]
    }
  });
});

// پردازش callback query ها - حذف شده چون دکمه‌ها حالا مستقیماً لینک هستند

// پردازش پیام‌های متنی
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  if (text.includes('شماره') || text.includes('مجازی')) {
    await ctx.reply('📞 برای خرید شماره مجازی، روی دکمه زیر کلیک کنید:', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📞 خرید شماره مجازی',
            web_app: { url: `${botConfig.miniAppUrl}/shop/virtual-number` }
          }]
        ]
      }
    });
  } else if (text.includes('استارز') || text.includes('ستاره')) {
    await ctx.reply('⭐ برای خرید استارز، روی دکمه زیر کلیک کنید:', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '⭐ خرید استارز',
            web_app: { url: `${botConfig.miniAppUrl}/stars` }
          }]
        ]
      }
    });
  } else if (text.includes('پریمیوم') || text.includes('premium')) {
    await ctx.reply('💎 برای خرید پریمیوم، روی دکمه زیر کلیک کنید:', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '💎 خرید پریمیوم',
            web_app: { url: `${botConfig.miniAppUrl}/premium` }
          }]
        ]
      }
    });
  } else {
    await ctx.reply('برای استفاده از ربات، از کامند /start استفاده کنید:', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📞 خرید شماره مجازی',
            web_app: { url: `${botConfig.miniAppUrl}/shop/virtual-number` }
          }],
          [{
            text: '⭐ خرید استارز',
            web_app: { url: `${botConfig.miniAppUrl}/stars` }
          }, {
            text: '💎 خرید پریمیوم',
            web_app: { url: `${botConfig.miniAppUrl}/premium` }
          }],
          [{
            text: '👤 پروفایل',
            web_app: { url: `${botConfig.miniAppUrl}/profile` }
          }]
        ]
      }
    });
  }
});

// مدیریت خطاها
bot.catch((err, ctx) => {
  console.error('❌ خطا در ربات:', err);
  ctx.reply(botConfig.messages.error);
});

// راه‌اندازی ربات
async function startBot() {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 تلاش ${retryCount + 1} برای راه‌اندازی ربات...`);
      
      // راه‌اندازی ربات
      await bot.launch();
      
      console.log('🤖 ربات تلگرام راه‌اندازی شد!');
      console.log(`📱 نام ربات: ${botConfig.botUsername}`);
      console.log(`🌐 مینی اپ: ${botConfig.miniAppName}`);
      console.log(`🔗 لینک مینی اپ: ${botConfig.miniAppUrl}`);
      
      // اگر موفق شد، از حلقه خارج شو
      break;
      
    } catch (err) {
      console.error('❌ خطا در راه‌اندازی ربات:', err);
      
      // اگر خطای 409 (Conflict) بود، کمی صبر کن و دوباره تلاش کن
      if (err.response && err.response.error_code === 409) {
        retryCount++;
        if (retryCount < maxRetries) {
          const waitTime = retryCount * 10; // 10, 20, 30 ثانیه
          console.log(`⏳ صبر کردن ${waitTime} ثانیه برای حل تداخل... (تلاش ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        } else {
          console.error('❌ حداکثر تعداد تلاش‌ها به پایان رسید. ربات راه‌اندازی نشد.');
          process.exit(1);
        }
      } else {
        // برای خطاهای دیگر، فوراً خروج کن
        console.error('❌ خطای غیرقابل حل در راه‌اندازی ربات');
        process.exit(1);
      }
    }
  }
}

// صبر کردن 2 ثانیه قبل از شروع
setTimeout(() => {
  startBot();
}, 2000);

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
