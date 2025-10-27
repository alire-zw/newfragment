import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

/**
 * API عمومی برای دریافت تنظیمات عمومی سیستم
 * نیازی به احراز هویت ندارد
 */
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // دریافت تنظیمات عمومی (تنها تنظیماتی که کاربران عادی نیاز دارند)
    const [settings] = await connection.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN (
        'virtual_number_profit_percentage',
        'stars_profit_percentage',
        'premium_3_month_profit_percentage',
        'premium_6_month_profit_percentage',
        'premium_12_month_profit_percentage'
      )
    `);

    const settingsObject: { [key: string]: any } = {};
    (settings as any[]).forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });

    return NextResponse.json({
      success: true,
      data: settingsObject
    });

  } catch (error) {
    console.error('❌ [PUBLIC-SETTINGS] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در دریافت تنظیمات عمومی' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
