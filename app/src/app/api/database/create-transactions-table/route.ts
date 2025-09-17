import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // ایجاد جدول transactions
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
    
    // ایجاد ایندکس‌ها
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON transactions(userID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_telegram_id ON transactions(userTelegramID)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_type ON transactions(type)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_payment_track_id ON transactions(paymentTrackId)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON transactions(createdAt)');
    
    console.log('✅ Transactions table created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'جدول transactions با موفقیت ایجاد شد'
    });
    
  } catch (error) {
    console.error('❌ Error creating transactions table:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطا در ایجاد جدول transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
