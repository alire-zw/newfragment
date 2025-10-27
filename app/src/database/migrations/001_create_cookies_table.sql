-- جدول کوکی‌ها برای ذخیره کوکی‌های تازه
CREATE TABLE IF NOT EXISTS cookies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    path VARCHAR(255) DEFAULT '/',
    secure BOOLEAN DEFAULT FALSE,
    httpOnly BOOLEAN DEFAULT FALSE,
    sameSite VARCHAR(50) DEFAULT 'None',
    expirationDate BIGINT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_domain (domain),
    INDEX idx_active (isActive),
    INDEX idx_created (createdAt)
);

-- جدول کوکی‌های فعال (آخرین کوکی‌های معتبر)
CREATE TABLE IF NOT EXISTS active_cookies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cookieId INT NOT NULL,
    cookieString TEXT NOT NULL,
    lastTested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    testResult BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cookieId) REFERENCES cookies(id) ON DELETE CASCADE,
    INDEX idx_active (testResult),
    INDEX idx_tested (lastTested)
);

-- جدول لاگ‌های بروزرسانی کوکی
CREATE TABLE IF NOT EXISTS cookie_refresh_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('success', 'failed', 'partial') NOT NULL,
    message TEXT,
    cookiesCount INT DEFAULT 0,
    testResults JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_created (createdAt)
);
