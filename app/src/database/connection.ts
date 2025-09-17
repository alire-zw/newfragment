import mysql from 'mysql2/promise';

// تنظیمات اتصال به دیتابیس
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Alireza1380#',
  database: 'franumbot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// ایجاد connection pool
const pool = mysql.createPool(dbConfig);

export default pool;
