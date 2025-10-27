import mysql from 'mysql2/promise';

// تنظیمات اتصال به دیتابیس
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // بدون رمز عبور برای لوکال
  database: process.env.DB_NAME || 'franumbot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// ایجاد connection pool
const pool = mysql.createPool(dbConfig);

export default pool;
