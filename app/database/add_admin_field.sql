-- اضافه کردن فیلد isAdmin به جدول کاربران
ALTER TABLE users ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE COMMENT 'وضعیت ادمین بودن کاربر';

-- ایجاد ایندکس برای جستجوی سریع ادمین‌ها
CREATE INDEX idx_is_admin ON users(isAdmin);
