import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function POST(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    
    // ایجاد جدول شماره‌های مجازی
    const createTableQuery = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);

    // ایجاد ایندکس‌ها
    const indexes = [
      'CREATE INDEX idx_virtual_number_user_id ON virtual_numbers(userID)',
      'CREATE INDEX idx_virtual_number_telegram_id ON virtual_numbers(userTelegramID)',
      'CREATE INDEX idx_virtual_number_number ON virtual_numbers(number)',
      'CREATE INDEX idx_virtual_number_country ON virtual_numbers(country)',
      'CREATE INDEX idx_virtual_number_status ON virtual_numbers(status)',
      'CREATE INDEX idx_virtual_number_is_active ON virtual_numbers(isActive)',
      'CREATE INDEX idx_virtual_number_created_at ON virtual_numbers(createdAt)'
    ];

    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery);
      } catch (error) {
        // ایندکس ممکن است قبلاً وجود داشته باشد
        console.log('Index might already exist:', indexQuery);
      }
    }

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'جدول شماره‌های مجازی با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('خطا در ایجاد جدول شماره‌های مجازی:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد جدول شماره‌های مجازی',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
