const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Alireza1380#',
  database: process.env.DB_NAME || 'franumbot_db',
  charset: 'utf8mb4'
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to database successfully');
    
    // ایجاد جدول users
    console.log('📋 Creating users table...');
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
        verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'pending' COMMENT 'وضعیت درخواست احراز هویت',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ایجاد جدول referrals
    console.log('📋 Creating referrals table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrerID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری معرف',
        referredID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری معرفی شده',
        referrerTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام معرف',
        referredTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام معرفی شده',
        referralCode VARCHAR(50) NOT NULL COMMENT 'کد رفرال',
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت رفرال',
        rewardAmount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'مبلغ پاداش',
        rewardPercentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'درصد پاداش',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        completedAt TIMESTAMP NULL COMMENT 'تاریخ تکمیل',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
        
        FOREIGN KEY (referrerTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
        FOREIGN KEY (referredTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
        UNIQUE KEY unique_referral (referrerTelegramID, referredTelegramID)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ایجاد جدول bank_accounts
    console.log('📋 Creating bank_accounts table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        accountID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا حساب بانکی',
        userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری صاحب حساب',
        userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام صاحب حساب',
        cardNumber VARCHAR(19) NOT NULL COMMENT 'شماره کارت بانکی',
        birthDate DATE NOT NULL COMMENT 'تاریخ تولد صاحب کارت',
        bankName VARCHAR(100) NULL COMMENT 'نام بانک',
        accountStatus ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'وضعیت حساب',
        isDefault BOOLEAN DEFAULT FALSE COMMENT 'حساب پیش‌فرض',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
        
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
        UNIQUE KEY unique_user_card (userID, cardNumber)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ایجاد جدول transactions
    console.log('📋 Creating transactions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transactionID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا تراکنش',
        userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری',
        userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام کاربر',
        type ENUM('charge', 'purchase', 'refund', 'reward') NOT NULL COMMENT 'نوع تراکنش',
        amount DECIMAL(12,2) NOT NULL COMMENT 'مبلغ تراکنش (تومان)',
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت تراکنش',
        paymentMethod ENUM('zibal', 'manual') DEFAULT 'zibal' COMMENT 'روش پرداخت',
        paymentTrackId VARCHAR(255) NULL COMMENT 'شناسه پیگیری پرداخت',
        paymentOrderId VARCHAR(255) NULL COMMENT 'شناسه سفارش پرداخت',
        description TEXT NULL COMMENT 'توضیحات تراکنش',
        metadata JSON NULL COMMENT 'اطلاعات اضافی تراکنش',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        completedAt TIMESTAMP NULL COMMENT 'تاریخ تکمیل',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
        
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ایجاد جدول wallets
    console.log('📋 Creating wallets table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        walletID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا کیف پول',
        userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری صاحب کیف پول',
        userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام صاحب کیف پول',
        balance DECIMAL(12,0) DEFAULT 0 COMMENT 'موجودی کیف پول (تومان)',
        frozenBalance DECIMAL(12,0) DEFAULT 0 COMMENT 'موجودی مسدود شده (تومان)',
        totalDeposited DECIMAL(12,0) DEFAULT 0 COMMENT 'کل واریزی‌ها (تومان)',
        totalWithdrawn DECIMAL(12,0) DEFAULT 0 COMMENT 'کل برداشت‌ها (تومان)',
        status ENUM('active', 'suspended', 'closed') DEFAULT 'active' COMMENT 'وضعیت کیف پول',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
        
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
        UNIQUE KEY unique_user_wallet (userID)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ایجاد جدول virtual_numbers
    console.log('📋 Creating virtual_numbers table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS virtual_numbers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        virtualNumberID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا شماره مجازی',
        userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری خریدار',
        userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام خریدار',
        number VARCHAR(20) NOT NULL COMMENT 'شماره مجازی',
        requestID VARCHAR(50) NULL COMMENT 'شناسه درخواست از سرویس',
        price DECIMAL(12,0) NOT NULL COMMENT 'قیمت خرید (تومان)',
        country VARCHAR(100) NOT NULL COMMENT 'نام کشور',
        countryCode VARCHAR(10) NOT NULL COMMENT 'کد کشور',
        phoneRange VARCHAR(10) NOT NULL COMMENT 'رنج شماره',
        service VARCHAR(100) NOT NULL COMMENT 'نام سرویس',
        quality TEXT NULL COMMENT 'کیفیت و توضیحات',
        status ENUM('active', 'expired', 'cancelled', 'suspended') DEFAULT 'active' COMMENT 'وضعیت شماره',
        isActive BOOLEAN DEFAULT TRUE COMMENT 'فعال بودن شماره',
        expiresAt TIMESTAMP NULL COMMENT 'تاریخ انقضا',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
        
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ایجاد ایندکس‌ها
    console.log('📋 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_telegram_id ON users(userTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_user_id ON users(userID)',
      'CREATE INDEX IF NOT EXISTS idx_is_verified ON users(isVerified)',
      'CREATE INDEX IF NOT EXISTS idx_referrer_telegram_id ON referrals(referrerTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_referred_telegram_id ON referrals(referredTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals(referralCode)',
      'CREATE INDEX IF NOT EXISTS idx_referral_status ON referrals(status)',
      'CREATE INDEX IF NOT EXISTS idx_referral_created_at ON referrals(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_bank_user_id ON bank_accounts(userID)',
      'CREATE INDEX IF NOT EXISTS idx_bank_telegram_id ON bank_accounts(userTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_bank_card_number ON bank_accounts(cardNumber)',
      'CREATE INDEX IF NOT EXISTS idx_bank_status ON bank_accounts(accountStatus)',
      'CREATE INDEX IF NOT EXISTS idx_bank_is_default ON bank_accounts(isDefault)',
      'CREATE INDEX IF NOT EXISTS idx_bank_created_at ON bank_accounts(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON transactions(userID)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_telegram_id ON transactions(userTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_payment_track_id ON transactions(paymentTrackId)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON transactions(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallets(userID)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_telegram_id ON wallets(userTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallets(status)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_balance ON wallets(balance)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON wallets(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_user_id ON virtual_numbers(userID)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_telegram_id ON virtual_numbers(userTelegramID)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_number ON virtual_numbers(number)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_country ON virtual_numbers(country)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_status ON virtual_numbers(status)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_is_active ON virtual_numbers(isActive)',
      'CREATE INDEX IF NOT EXISTS idx_virtual_number_created_at ON virtual_numbers(createdAt)'
    ];
    
    for (const indexQuery of indexes) {
      await connection.execute(indexQuery);
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Tables created: users, referrals, bank_accounts, transactions, wallets, virtual_numbers');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اجرای setup
setupDatabase();
