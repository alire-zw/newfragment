-- اضافه کردن فیلد successPageId به جدول stars_purchases
-- این فیلد برای جلوگیری از تکرار خرید در صفحه success استفاده می‌شود

USE franumbot_db;

-- اضافه کردن فیلد successPageId
ALTER TABLE stars_purchases 
ADD COLUMN successPageId VARCHAR(255) UNIQUE NULL COMMENT 'شناسه منحصر به فرد برای صفحه success';

-- ایجاد ایندکس برای successPageId
CREATE INDEX idx_stars_purchase_success_page_id ON stars_purchases(successPageId);

-- اضافه کردن فیلد successPageId به unique constraint موجود
-- ابتدا constraint موجود را حذف می‌کنیم
ALTER TABLE stars_purchases DROP INDEX unique_purchase;

-- سپس constraint جدید را اضافه می‌کنیم
ALTER TABLE stars_purchases 
ADD CONSTRAINT unique_purchase_with_success_page 
UNIQUE KEY (userTelegramID, recipient, quantity, price, createdAt, successPageId);
