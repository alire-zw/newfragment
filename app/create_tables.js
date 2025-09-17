const mysql = require('mysql2/promise');

async function createTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'franumbot_db'
  });

  try {
    console.log('Creating transactions table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transactionID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا تراکنش',
        userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری',
        userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام کاربر',
        type ENUM('charge', 'purchase', 'refund', 'reward') NOT NULL COMMENT 'نوع تراکنش',
        amount DECIMAL(12,0) NOT NULL COMMENT 'مبلغ تراکنش (تومان)',
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
    
    console.log('✅ Transactions table created successfully!');

    console.log('Creating wallets table...');
    
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
    
    console.log('✅ Wallets table created successfully!');

    // ایجاد ایندکس‌های تراکنش‌ها
    console.log('Creating transaction indexes...');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON transactions(userID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_telegram_id ON transactions(userTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_type ON transactions(type)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_payment_track_id ON transactions(paymentTrackId)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON transactions(createdAt)');
    console.log('✅ Transaction indexes created successfully!');

    // ایجاد ایندکس‌های کیف پول
    console.log('Creating wallet indexes...');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallets(userID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_wallet_telegram_id ON wallets(userTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallets(status)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_wallet_balance ON wallets(balance)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON wallets(createdAt)');
    console.log('✅ Wallet indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createTables();
