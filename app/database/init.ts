import mysql from 'mysql2/promise';

// تنظیمات اتصال بدون نام دیتابیس
const initConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
};

export async function initializeDatabase() {
  let connection;
  
  try {
    // اتصال بدون نام دیتابیس
    connection = await mysql.createConnection(initConfig);
    
    // ایجاد دیتابیس
    await connection.execute(`
      CREATE DATABASE IF NOT EXISTS franumbot_db 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    
    console.log('✅ دیتابیس franumbot_db ایجاد شد');
    
    // بستن اتصال قبلی
    await connection.end();
    
    // اتصال جدید با نام دیتابیس
    connection = await mysql.createConnection({
      ...initConfig,
      database: 'franumbot_db'
    });
    
    // ایجاد جدول کاربران
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا کاربر',
        userFullName VARCHAR(255) NOT NULL COMMENT 'نام کامل کاربر',
        userTelegramID BIGINT UNIQUE NOT NULL COMMENT 'شناسه عددی تلگرام',
        userBirthDate DATE NULL COMMENT 'تاریخ تولد',
        userNationalID VARCHAR(20) NULL COMMENT 'کد ملی',
        userPhoneNumber VARCHAR(20) NULL COMMENT 'شماره موبایل',
        isVerified BOOLEAN DEFAULT FALSE COMMENT 'وضعیت احراز هویت',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ جدول users ایجاد شد');
    
    // ایجاد جدول رفرال‌ها
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrerID VARCHAR(255) NOT NULL COMMENT 'شناسه معرف',
        referredID VARCHAR(255) NOT NULL COMMENT 'شناسه معرف شده',
        referrerTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام معرف',
        referredTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام معرف شده',
        referralCode VARCHAR(255) UNIQUE NOT NULL COMMENT 'کد رفرال',
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت رفرال',
        rewardPercentage DECIMAL(5,2) DEFAULT 25.00 COMMENT 'درصد پاداش',
        rewardAmount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'مبلغ پاداش',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ جدول referrals ایجاد شد');
    
    // ایجاد ایندکس‌ها
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_user_telegram_id ON users(userTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_user_id ON users(userID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_is_verified ON users(isVerified)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_referrer_telegram_id ON referrals(referrerTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_referred_telegram_id ON referrals(referredTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals(referralCode)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_referral_status ON referrals(status)');
    
    console.log('✅ ایندکس‌ها ایجاد شدند');
    
  } catch (error) {
    console.error('❌ خطا در ایجاد دیتابیس:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
