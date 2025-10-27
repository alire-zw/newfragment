import pool from './connection';
import fs from 'fs';
import path from 'path';

export const runMigrations = async () => {
  const conn = await pool.getConnection();
  
  try {
    console.log('🔄 [MIGRATIONS] Starting database migrations...');
    
    // خواندن فایل migration
    const migrationPath = path.join(__dirname, 'migrations', '001_create_cookies_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // تقسیم SQL به statements جداگانه
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // اجرای هر statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 [MIGRATIONS] Executing:', statement.substring(0, 50) + '...');
        await conn.execute(statement);
      }
    }
    
    console.log('✅ [MIGRATIONS] Database migrations completed successfully');
    
  } catch (error) {
    console.error('❌ [MIGRATIONS] Migration failed:', error);
    throw error;
  } finally {
    conn.release();
  }
};

// اجرای migration اگر فایل مستقیماً اجرا شود
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 [MIGRATIONS] All migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [MIGRATIONS] Migration failed:', error);
      process.exit(1);
    });
}
