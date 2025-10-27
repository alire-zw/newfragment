const mysql = require('mysql2/promise');
const { botConfig } = require('./config');

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

async function testPurchase() {
  try {
    const connection = await pool.getConnection();
    
    // ایجاد یک کاربر تست
    const testUserId = 'test_user_' + Date.now();
    const testTelegramId = 22222222222;
    
    // اضافه کردن کاربر
    await connection.execute(
      `INSERT INTO users (userID, userFullName, userTelegramID, isVerified) 
       VALUES (?, ?, ?, ?)`,
      [testUserId, 'کاربر تست', testTelegramId, true]
    );
    
    // تست خرید شماره مجازی
    const virtualNumberId = 'VN_' + Date.now() + '_test';
    await connection.execute(
      `INSERT INTO virtual_numbers 
       (virtualNumberID, userID, userTelegramID, number, requestID, price, country, countryCode, phoneRange, service, quality, status, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [virtualNumberId, testUserId, testTelegramId, '+14633636792', '916875224', 45500, 'آمریکا', '+1', '1', 'تلگرام (پنل اختصاصی)', '🔴 کیفیت کشور انتخاب شده ( پایین ) میباشد؛\r\n\r\n🌟 امتیاز کیفیــتـ : 10/2', 'active', 1]
    );
    
    console.log('✅ خرید شماره مجازی تست اضافه شد');
    
    // تست خرید استارز
    const starsPurchaseId = 'STARS_' + Date.now() + '_test';
    await connection.execute(
      `INSERT INTO stars_purchases 
       (purchaseID, userID, userTelegramID, recipient, username, name, quantity, price, priceInRials, status, externalTransactionID, validUntil, paymentAddress, paymentAmount, paymentPayload, successPageId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [starsPurchaseId, testUserId, testTelegramId, 'pJ74RbGXMwEZo7tSTfMJ7YhI4b8MO_vgVb-JwFSEcFQ', 'Y_num', '.', 50, 98426, 984262, 'completed', 'EXT_' + Date.now(), new Date(Date.now() + 24*60*60*1000), 'EQCYCA-47lALps90xoFFIPVznOsiHlWVKF3cEDChKgP3JYEf', '336498000', 'te6ccgEBAwEAlwABiD8rktJMnWzjBMHpsv0I6VDcno5HE7A7spxUvGs1+ef+XDgP3wbv+GoC2k8lV0Geumy0HjWiY+8PJfRuLRtzTH9qtOMAAQFLgBCkiH8LM/zUu0afyGCTWJwX1mDjdlf2rMa9UoQlD4UHSCdTv8ECAEoAAAAANTAgVGVsZWdyYW0gU3RhcnMgCgpSZWYjQldXazlCaWlR', 'SUCCESS_' + Date.now() + '_test']
    );
    
    console.log('✅ خرید استارز تست اضافه شد');
    
    // تست خرید پریمیوم
    const premiumPurchaseId = 'pp_' + Date.now();
    await connection.execute(
      `INSERT INTO premium_purchases 
       (purchaseID, userID, userTelegramID, recipient, username, name, months, price, priceInRials, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [premiumPurchaseId, testUserId, testTelegramId, '123456789', 'testuser', 'کاربر تست', 3, 150000, 1500000, 'completed']
    );
    
    console.log('✅ خرید پریمیوم تست اضافه شد');
    
    connection.release();
    console.log('🎉 تمام تست‌ها با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا در تست:', error);
  } finally {
    process.exit(0);
  }
}

testPurchase();
