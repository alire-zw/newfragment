const mysql = require('mysql2/promise');

// تنظیمات اتصال به دیتابیس
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // بدون رمز عبور برای لوکال
  database: process.env.DB_NAME || 'franumbot_db',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ اتصال به دیتابیس موفق بود');
    
    // بررسی وجود دیتابیس
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [dbConfig.database]);
    
    if (databases.length === 0) {
      console.log('📦 ایجاد دیتابیس...');
      await connection.execute(`CREATE DATABASE \`${dbConfig.database}\``);
      console.log('✅ دیتابیس ایجاد شد');
    } else {
      console.log('✅ دیتابیس موجود است');
    }
    
    // انتخاب دیتابیس
    await connection.execute(`USE \`${dbConfig.database}\``);
    
    // ایجاد جداول
    console.log('📋 ایجاد جداول...');
    
    // جدول users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        userID INT AUTO_INCREMENT PRIMARY KEY,
        userTelegramID BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        fullName VARCHAR(255),
        languageCode VARCHAR(10),
        isPremium BOOLEAN DEFAULT FALSE,
        isAdmin BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // جدول system_settings
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // جدول referrals
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrerID INT,
        referredID VARCHAR(255),
        referrerTelegramID BIGINT,
        referredTelegramID BIGINT,
        referralCode VARCHAR(255),
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        rewardPercentage DECIMAL(5,2) DEFAULT 25.00,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referrerID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // جدول stars_purchases
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stars_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID INT,
        telegramUserID BIGINT,
        recipient VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        profit DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        transactionID VARCHAR(255),
        errorMessage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // جدول premium_purchases
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS premium_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID INT,
        telegramUserID BIGINT,
        recipient VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        profit DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        transactionID VARCHAR(255),
        errorMessage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // جدول transactions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID INT,
        type ENUM('stars', 'premium', 'virtual_number') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // جدول audit_logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ جداول ایجاد شدند');
    
    // اضافه کردن تنظیمات پیش‌فرض
    console.log('⚙️ اضافه کردن تنظیمات پیش‌فرض...');
    
    const defaultSettings = [
      ['virtual_number_profit_percentage', '25.00', 'درصد سود شماره مجازی'],
      ['stars_profit_percentage', '25.00', 'درصد سود استارز'],
      ['premium_3_month_profit_percentage', '25.00', 'درصد سود پریمیوم 3 ماهه'],
      ['premium_6_month_profit_percentage', '25.00', 'درصد سود پریمیوم 6 ماهه'],
      ['premium_12_month_profit_percentage', '25.00', 'درصد سود پریمیوم 12 ماهه']
    ];
    
    for (const [key, value, description] of defaultSettings) {
      await connection.execute(`
        INSERT IGNORE INTO system_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?)
      `, [key, value, description]);
    }
    
    console.log('✅ تنظیمات پیش‌فرض اضافه شدند');
    
    // اضافه کردن ادمین اول
    console.log('👤 اضافه کردن ادمین اول...');
    
    const adminTelegramID = 123456789; // تغییر دهید به ID تلگرام خودتان
    
    await connection.execute(`
      INSERT IGNORE INTO users (userTelegramID, username, firstName, lastName, fullName, isAdmin) 
      VALUES (?, 'admin', 'Admin', 'User', 'Admin User', TRUE)
    `, [adminTelegramID]);
    
    console.log('✅ ادمین اول اضافه شد');
    console.log('🎉 راه‌اندازی دیتابیس کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی دیتابیس:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اجرای اسکریپت
setupDatabase();
