import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

// دریافت تمام تنظیمات سیستم
export async function GET() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM system_settings ORDER BY setting_key'
    );
    
    return NextResponse.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت تنظیمات سیستم:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت تنظیمات سیستم' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// به‌روزرسانی تنظیمات سیستم
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const { settings } = await request.json();
    
    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: 'داده‌های نامعتبر' },
        { status: 400 }
      );
    }
    
    connection = await pool.getConnection();
    
    // شروع تراکنش
    await connection.beginTransaction();
    
    try {
      // به‌روزرسانی هر تنظیم
      for (const setting of settings) {
        const { setting_key, setting_value } = setting;
        
        if (!setting_key || setting_value === undefined) {
          throw new Error('کلید یا مقدار تنظیم نامعتبر');
        }
        
        // اعتبارسنجی درصد (باید بین 0 تا 100 باشد)
        if (setting_value === '' || setting_value === null || setting_value === undefined) {
          throw new Error(`مقدار خالی برای ${setting_key}`);
        }
        
        const percentage = parseFloat(setting_value);
        if (isNaN(percentage)) {
          throw new Error(`مقدار نامعتبر برای ${setting_key}: ${setting_value}`);
        }
        
        if (percentage < 0 || percentage > 100) {
          throw new Error(`درصد باید بین 0 تا 100 باشد برای ${setting_key}: ${setting_value}`);
        }
        
        await connection.execute(
          'UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
          [setting_value, setting_key]
        );
      }
      
      // تایید تراکنش
      await connection.commit();
      
      return NextResponse.json({
        success: true,
        message: 'تنظیمات با موفقیت به‌روزرسانی شد'
      });
      
    } catch (error) {
      // برگشت تراکنش در صورت خطا
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی تنظیمات سیستم:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در به‌روزرسانی تنظیمات سیستم' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
