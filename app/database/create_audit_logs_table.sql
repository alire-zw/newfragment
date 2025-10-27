-- جدول لاگ‌های Audit برای ردیابی اقدامات حساس
CREATE TABLE IF NOT EXISTS audit_logs (
  logID BIGINT AUTO_INCREMENT PRIMARY KEY,
  userTelegramID BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resourceType VARCHAR(50),
  resourceId VARCHAR(255),
  details JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (userTelegramID),
  INDEX idx_action (action),
  INDEX idx_created (createdAt),
  INDEX idx_resource (resourceType, resourceId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

