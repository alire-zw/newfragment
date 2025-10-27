-- ایجاد دیتابیس
CREATE DATABASE IF NOT EXISTS franumbot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- استفاده از دیتابیس
USE franumbot_db;

-- جدول کاربران
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس برای جستجوی سریع
CREATE INDEX idx_user_telegram_id ON users(userTelegramID);
CREATE INDEX idx_user_id ON users(userID);
CREATE INDEX idx_is_verified ON users(isVerified);

-- جدول رفرال‌ها
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های رفرال
CREATE INDEX idx_referrer_telegram_id ON referrals(referrerTelegramID);
CREATE INDEX idx_referred_telegram_id ON referrals(referredTelegramID);
CREATE INDEX idx_referral_code ON referrals(referralCode);
CREATE INDEX idx_referral_status ON referrals(status);
CREATE INDEX idx_referral_created_at ON referrals(createdAt);

-- جدول حساب‌های بانکی
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های حساب‌های بانکی
CREATE INDEX idx_bank_user_id ON bank_accounts(userID);
CREATE INDEX idx_bank_telegram_id ON bank_accounts(userTelegramID);
CREATE INDEX idx_bank_card_number ON bank_accounts(cardNumber);
CREATE INDEX idx_bank_status ON bank_accounts(accountStatus);
CREATE INDEX idx_bank_is_default ON bank_accounts(isDefault);
CREATE INDEX idx_bank_created_at ON bank_accounts(createdAt);

-- جدول تراکنش‌ها
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionID VARCHAR(255) UNIQUE NOT NULL COMMENT 'شناسه یکتا تراکنش',
    userID VARCHAR(255) NOT NULL COMMENT 'شناسه کاربری',
    userTelegramID BIGINT NOT NULL COMMENT 'شناسه تلگرام کاربر',
    type ENUM('charge', 'purchase', 'refund', 'reward') NOT NULL COMMENT 'نوع تراکنش',
    amount DECIMAL(12,0) NOT NULL COMMENT 'مبلغ تراکنش (تومان)',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'وضعیت تراکنش',
    paymentMethod ENUM('zibal', 'manual', 'wallet') DEFAULT 'zibal' COMMENT 'روش پرداخت',
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

-- جدول کیف پول
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ایندکس‌های کیف پول
CREATE INDEX idx_wallet_user_id ON wallets(userID);
CREATE INDEX idx_wallet_telegram_id ON wallets(userTelegramID);
CREATE INDEX idx_wallet_status ON wallets(status);
CREATE INDEX idx_wallet_balance ON wallets(balance);
CREATE INDEX idx_wallet_created_at ON wallets(createdAt);

-- جدول شماره‌های مجازی
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

-- ایجاد ایندکس‌های شماره‌های مجازی
CREATE INDEX idx_virtual_number_user_id ON virtual_numbers(userID);
CREATE INDEX idx_virtual_number_telegram_id ON virtual_numbers(userTelegramID);
CREATE INDEX idx_virtual_number_number ON virtual_numbers(number);
CREATE INDEX idx_virtual_number_country ON virtual_numbers(country);
CREATE INDEX idx_virtual_number_status ON virtual_numbers(status);
CREATE INDEX idx_virtual_number_is_active ON virtual_numbers(isActive);
CREATE INDEX idx_virtual_number_created_at ON virtual_numbers(createdAt);

-- جدول خریدهای استارز
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
    successPageId VARCHAR(255) UNIQUE NULL COMMENT 'شناسه منحصر به فرد برای صفحه success',
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

-- جدول خریدهای پریمیوم
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
