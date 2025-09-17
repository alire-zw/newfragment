-- ایجاد جدول خریدهای پریمیوم
CREATE TABLE IF NOT EXISTS premium_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchaseID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا خرید پریمیوم',
    userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری خریدار',
    userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام خریدار',
    recipient VARCHAR(255) NOT NULL COMMENT 'شناسه گیرنده پریمیوم',
    username VARCHAR(255) NOT NULL COMMENT 'نام کاربری گیرنده',
    name VARCHAR(255) NOT NULL COMMENT 'نام گیرنده',
    months INT NOT NULL COMMENT 'تعداد ماه اشتراک',
    price DECIMAL(12,0) NOT NULL COMMENT 'قیمت خرید (تومان)',
    priceInRials DECIMAL(12,0) NOT NULL COMMENT 'قیمت خرید (ریال)',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت خرید',
    externalTransactionID VARCHAR(255) NULL COMMENT 'شناسه تراکنش خارجی',
    validUntil TIMESTAMP NULL COMMENT 'اعتبار تراکنش تا',
    paymentAddress VARCHAR(255) NULL COMMENT 'آدرس پرداخت',
    paymentAmount VARCHAR(50) NULL COMMENT 'مبلغ پرداخت',
    paymentPayload TEXT NULL COMMENT 'Payload پرداخت',
    successPageId VARCHAR(255) UNIQUE NULL COMMENT 'شناسه منحصر به فرد برای صفحه success',
    metadata JSON NULL COMMENT 'اطلاعات اضافی خرید',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'تاریخ ایجاد',
    completedAt TIMESTAMP NULL COMMENT 'تاریخ تکمیل',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'تاریخ آخرین بروزرسانی',
    
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (userTelegramID) REFERENCES users(userTelegramID) ON DELETE CASCADE,
    UNIQUE KEY unique_premium_purchase (userTelegramID, recipient, months, price, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های خریدهای پریمیوم
CREATE INDEX idx_premium_purchase_user_id ON premium_purchases(userID);
CREATE INDEX idx_premium_purchase_telegram_id ON premium_purchases(userTelegramID);
CREATE INDEX idx_premium_purchase_recipient ON premium_purchases(recipient);
CREATE INDEX idx_premium_purchase_status ON premium_purchases(status);
CREATE INDEX idx_premium_purchase_external_transaction_id ON premium_purchases(externalTransactionID);
CREATE INDEX idx_premium_purchase_created_at ON premium_purchases(createdAt);
CREATE INDEX idx_premium_purchase_success_page_id ON premium_purchases(successPageId);
CREATE INDEX idx_premium_purchase_unique ON premium_purchases(userTelegramID, recipient, months, price, createdAt);
