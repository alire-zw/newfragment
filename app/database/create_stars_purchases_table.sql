-- ایجاد جدول خریدهای استارز
CREATE TABLE IF NOT EXISTS stars_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchaseID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا خرید استارز',
    userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری خریدار',
    userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام خریدار',
    recipient VARCHAR(255) NOT NULL COMMENT 'شناسه گیرنده استارز',
    recipientUsername VARCHAR(255) NOT NULL COMMENT 'نام کاربری گیرنده',
    recipientName VARCHAR(255) NOT NULL COMMENT 'نام گیرنده',
    quantity INT NOT NULL COMMENT 'تعداد استارز',
    price DECIMAL(12,0) NOT NULL COMMENT 'قیمت خرید (تومان)',
    priceInRials DECIMAL(12,0) NOT NULL COMMENT 'قیمت خرید (ریال)',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت خرید',
    transactionID VARCHAR(255) NULL COMMENT 'شناسه تراکنش مرتبط',
    externalTransactionID VARCHAR(255) NULL COMMENT 'شناسه تراکنش خارجی',
    validUntil TIMESTAMP NULL COMMENT 'اعتبار تراکنش تا',
    paymentAddress VARCHAR(255) NULL COMMENT 'آدرس پرداخت',
    paymentAmount VARCHAR(50) NULL COMMENT 'مبلغ پرداخت',
    paymentPayload TEXT NULL COMMENT 'Payload پرداخت',
    metadata JSON NULL COMMENT 'اطلاعات اضافی خرید',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
    completedAt TIMESTAMP NULL COMMENT 'تاریخ تکمیل',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
    
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
    UNIQUE KEY unique_purchase (userTelegramID, recipient, quantity, price, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های خریدهای استارز
CREATE INDEX idx_stars_purchase_user_id ON stars_purchases(userID);
CREATE INDEX idx_stars_purchase_telegram_id ON stars_purchases(userTelegramID);
CREATE INDEX idx_stars_purchase_recipient ON stars_purchases(recipient);
CREATE INDEX idx_stars_purchase_status ON stars_purchases(status);
CREATE INDEX idx_stars_purchase_transaction_id ON stars_purchases(transactionID);
CREATE INDEX idx_stars_purchase_created_at ON stars_purchases(createdAt);
CREATE INDEX idx_stars_purchase_unique ON stars_purchases(userTelegramID, recipient, quantity, price, createdAt);
