-- ایجاد جدول تراکنش‌ها
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های تراکنش‌ها
CREATE INDEX idx_transaction_user_id ON transactions(userID);
CREATE INDEX idx_transaction_telegram_id ON transactions(userTelegramID);
CREATE INDEX idx_transaction_type ON transactions(type);
CREATE INDEX idx_transaction_status ON transactions(status);
CREATE INDEX idx_transaction_payment_track_id ON transactions(paymentTrackId);
CREATE INDEX idx_transaction_created_at ON transactions(createdAt);
