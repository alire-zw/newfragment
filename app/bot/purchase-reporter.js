const { Telegraf } = require('telegraf');
const mysql = require('mysql2/promise');
const { botConfig } = require('./config');
const moment = require('moment-jalaali');

// ID کانال گزارشات
const REPORT_CHANNEL_ID = '-1003271407389';

// ایجاد اتصال دیتابیس
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Alireza1380#',
  database: process.env.DB_NAME || 'franumbot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// ایجاد ربات
const bot = new Telegraf(botConfig.botToken);

// متغیرهای رصد
let lastVirtualNumberId = 0;
let lastStarsPurchaseId = 0;
let lastPremiumPurchaseId = 0;

// تابع برای دریافت آخرین ID از جدول
async function getLastIds() {
  try {
    const connection = await pool.getConnection();
    
    // دریافت آخرین ID از هر جدول
    const [virtualNumbers] = await connection.execute(
      'SELECT MAX(id) as maxId FROM virtual_numbers'
    );
    
    const [starsPurchases] = await connection.execute(
      'SELECT MAX(id) as maxId FROM stars_purchases'
    );
    
    const [premiumPurchases] = await connection.execute(
      'SELECT MAX(id) as maxId FROM premium_purchases'
    );
    
    lastVirtualNumberId = virtualNumbers[0].maxId || 0;
    lastStarsPurchaseId = starsPurchases[0].maxId || 0;
    lastPremiumPurchaseId = premiumPurchases[0].maxId || 0;
    
    connection.release();
    
    console.log(`📊 آخرین ID ها: شماره مجازی=${lastVirtualNumberId}, استارز=${lastStarsPurchaseId}, پریمیوم=${lastPremiumPurchaseId}`);
    console.log(`🔍 VirtualNumbers maxId:`, virtualNumbers[0]);
  } catch (error) {
    console.error('❌ خطا در دریافت آخرین ID ها:', error);
  }
}

// تابع برای تولید UUID کوتاه
function generateShortUUID() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // تولید 3 بخش با خط تیره بینشان
  for (let i = 0; i < 3; i++) {
    if (i > 0) result += '-';
    
    // هر بخش 3 کاراکتر
    for (let j = 0; j < 3; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

// تابع برای فرمت کردن تاریخ به انگلیسی
function formatDateEnglish(date) {
  try {
    // استفاده از moment-jalaali برای تبدیل به تاریخ شمسی
    const m = moment(date);
    
    const persianMonths = {
      'فروردین': 'Farvardin',
      'اردیبهشت': 'Ordibehesht', 
      'خرداد': 'Khordad',
      'تیر': 'Tir',
      'مرداد': 'Mordad',
      'شهریور': 'Shahrivar',
      'مهر': 'Mehr',
      'آبان': 'Aban',
      'آذر': 'Azar',
      'دی': 'Dey',
      'بهمن': 'Bahman',
      'اسفند': 'Esfand'
    };
    
    // دریافت نام ماه شمسی
    const monthName = m.format('jMMMM');
    const englishMonth = persianMonths[monthName] || monthName;
    
    // دریافت روز، ساعت و دقیقه
    const day = m.format('jD');
    const hour = m.format('HH');
    const minute = m.format('mm');
    
    return `${day} ${englishMonth} - ${hour}:${minute}`;
  } catch (error) {
    console.log('خطا در moment-jalaali:', error.message);
    // اگر moment کار نکرد، از تاریخ میلادی استفاده کن
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month} - ${hour}:${minute}`;
  }
}

// تابع برای ارسال گزارش خرید شماره مجازی
async function reportVirtualNumberPurchase(purchase) {
  try {
    const uuid = generateShortUUID();
    const userId = purchase.userTelegramID.toString();
    const number = purchase.number || 'نامشخص';
    const quality = purchase.quality || 'نامشخص';
    // استخراج فقط عدد کیفیت از متن
    const qualityMatch = quality.toString().match(/(\d+)\/(\d+)/);
    const qualityScore = qualityMatch ? `${qualityMatch[1]}/${qualityMatch[2]}` : quality;
    const date = formatDateEnglish(purchase.createdAt);
    const price = new Intl.NumberFormat('en-US').format(purchase.price);
    
    const message = `☎️ خرید شماره جدید | شناسه : \`${purchase.id}\`

📟 UUID : \`${uuid}\`

🙋🏻‍♂️ UserID : \`${userId.substring(0, 5)}...\`
📞 Number : \`${number.substring(0, 8)}...\`
🎖️ Quality: \`${qualityScore}\`
🗓️ Date : \`${date}\`

💸 Price : \`${price} Toman\``;

    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📢 کانال اصلی',
            url: 'https://t.me/NumberStarNews'
          }, {
            text: '📞 خرید شماره مجازی',
            url: `https://t.me/${botConfig.botUsername}?startapp=virtual-number`
          }]
        ]
      }
    });
    
    console.log(`✅ گزارش خرید شماره مجازی ارسال شد: ${purchase.id}`);
  } catch (error) {
    console.error('❌ خطا در ارسال گزارش شماره مجازی:', error);
  }
}

// تابع برای ارسال گزارش خرید استارز
async function reportStarsPurchase(purchase) {
  try {
    const uuid = generateShortUUID();
    const userId = purchase.userTelegramID.toString();
    const receiver = purchase.username || 'unknown';
    const count = new Intl.NumberFormat('en-US').format(purchase.quantity);
    const date = formatDateEnglish(purchase.createdAt);
    const price = new Intl.NumberFormat('en-US').format(purchase.price);
    
    const message = `⭐️ خرید استارز جدید | شناسه : \`${purchase.id}\`

📟 UUID : \`${uuid}\`

🙋🏻‍♂️ UserID : \`${userId.substring(0, 5)}...\`
💌 Receiver : \`@${receiver.substring(0, 5)}...\`
✨ Count : \`${count} Stars\`
🗓️ Date : \`${date}\`

💸 Price : \`${price} Toman\``;

    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📢 کانال اصلی',
            url: 'https://t.me/NumberStarNews'
          }, {
            text: '⭐ خرید استارز',
            url: `https://t.me/${botConfig.botUsername}?startapp=stars`
          }]
        ]
      }
    });
    
    console.log(`✅ گزارش خرید استارز ارسال شد: ${purchase.purchaseID}`);
  } catch (error) {
    console.error('❌ خطا در ارسال گزارش استارز:', error);
  }
}

// تابع برای ارسال گزارش خرید پریمیوم
async function reportPremiumPurchase(purchase) {
  try {
    const uuid = generateShortUUID();
    const userId = purchase.userTelegramID.toString();
    const receiver = purchase.username || 'unknown';
    const duration = purchase.months === 1 ? '1 Month' : `${purchase.months} Months`;
    const date = formatDateEnglish(purchase.createdAt);
    const price = new Intl.NumberFormat('en-US').format(purchase.price);
    
    const message = `💎 خرید پریمیوم جدید | شناسه : \`${purchase.id}\`

📟 UUID : \`${uuid}\`

🙋🏻‍♂️ UserID : \`${userId.substring(0, 5)}...\`
💌 Receiver : \`@${receiver.substring(0, 5)}...\`
⏳ Duration : \`${duration}\`
🗓️ Date : \`${date}\`

💸 Price : \`${price} Toman\``;

    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📢 کانال اصلی',
            url: 'https://t.me/NumberStarNews'
          }, {
            text: '💎 خرید پریمیوم',
            url: `https://t.me/${botConfig.botUsername}?startapp=premium`
          }]
        ]
      }
    });
    
    console.log(`✅ گزارش خرید پریمیوم ارسال شد: ${purchase.purchaseID}`);
  } catch (error) {
    console.error('❌ خطا در ارسال گزارش پریمیوم:', error);
  }
}

// تابع برای بررسی خریدهای جدید
async function checkNewPurchases() {
  try {
    const connection = await pool.getConnection();
    
    // بررسی شماره‌های مجازی جدید (بر اساس ID)
    const [newVirtualNumbers] = await connection.execute(
      `SELECT vn.id, vn.virtualNumberID, vn.userID, vn.userTelegramID, vn.number, vn.country, vn.countryCode, vn.phoneRange, vn.service, vn.quality, vn.price, vn.status, vn.createdAt, u.userFullName 
       FROM virtual_numbers vn 
       LEFT JOIN users u ON vn.userID = u.userID 
       WHERE vn.id > ?
       ORDER BY vn.id ASC`,
      [lastVirtualNumberId]
    );
    
    console.log(`🔍 جستجوی شماره‌های مجازی: lastId=${lastVirtualNumberId}, یافت شده=${newVirtualNumbers.length}`);
    
    for (const purchase of newVirtualNumbers) {
      if (purchase.id > lastVirtualNumberId) {
        await reportVirtualNumberPurchase(purchase);
        lastVirtualNumberId = purchase.id;
      }
    }
    
    // بررسی خریدهای استارز جدید (بر اساس ID)
    const [newStarsPurchases] = await connection.execute(
      `SELECT sp.*, u.userFullName 
       FROM stars_purchases sp 
       LEFT JOIN users u ON sp.userID = u.userID 
       WHERE sp.id > ?
       ORDER BY sp.id ASC`,
      [lastStarsPurchaseId]
    );
    
    for (const purchase of newStarsPurchases) {
      if (purchase.id > lastStarsPurchaseId) {
        await reportStarsPurchase(purchase);
        lastStarsPurchaseId = purchase.id;
      }
    }
    
    // بررسی خریدهای پریمیوم جدید (بر اساس ID)
    const [newPremiumPurchases] = await connection.execute(
      `SELECT pp.*, u.userFullName 
       FROM premium_purchases pp 
       LEFT JOIN users u ON pp.userID = u.userID 
       WHERE pp.id > ?
       ORDER BY pp.id ASC`,
      [lastPremiumPurchaseId]
    );
    
    for (const purchase of newPremiumPurchases) {
      if (purchase.id > lastPremiumPurchaseId) {
        await reportPremiumPurchase(purchase);
        lastPremiumPurchaseId = purchase.id;
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ خطا در بررسی خریدهای جدید:', error);
  }
}

// تابع اصلی
async function startPurchaseReporter() {
  try {
    console.log('🤖 راه‌اندازی ربات گزارش خرید...');
    
    // دریافت آخرین ID ها
    await getLastIds();
    
    // ارسال پیام شروع
    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, 
      '🤖 ربات گزارش خرید راه‌اندازی شد!\n\nاز این پس تمام خریدهای جدید گزارش داده خواهد شد.'
    );
    
    console.log('✅ ربات گزارش خرید راه‌اندازی شد!');
    
    // بررسی هر 5 ثانیه
    setInterval(async () => {
      await checkNewPurchases();
    }, 5000);
    
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی ربات گزارش خرید:', error);
    process.exit(1);
  }
}

// راه‌اندازی ربات
startPurchaseReporter();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 خاموش کردن ربات گزارش خرید...');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('🛑 خاموش کردن ربات گزارش خرید...');
  process.exit(0);
});
