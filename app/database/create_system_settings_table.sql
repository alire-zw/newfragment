-- جدول تنظیمات سیستم
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- درج تنظیمات پیش‌فرض
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('virtual_number_profit_percentage', '10', 'درصد سود شماره مجازی'),
('stars_profit_percentage', '15', 'درصد سود استارز'),
('premium_3_month_profit_percentage', '20', 'درصد سود پریمیوم 3 ماهه'),
('premium_6_month_profit_percentage', '25', 'درصد سود پریمیوم 6 ماهه'),
('premium_12_month_profit_percentage', '30', 'درصد سود پریمیوم 12 ماهه')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;
