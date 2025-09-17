import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const virtualNumberId = searchParams.get('virtualNumberId');

    if (!telegramId) {
      return NextResponse.json({
        success: false,
        error: 'شناسه تلگرام الزامی است'
      }, { status: 400 });
    }

    // اتصال به دیتابیس
    connection = await pool.getConnection();
    
    // پیدا کردن userID از telegramID
    const [userRows] = await connection.execute(
      'SELECT userID FROM users WHERE userTelegramID = ?',
      [parseInt(telegramId)]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    const user = userRows[0] as { userID: string };
    const actualUserId = user.userID;

    // دریافت شماره‌های مجازی کاربر
    let query = `SELECT 
      virtualNumberID, number, requestID, price, country, 
      countryCode, phoneRange, service, quality, status, 
      isActive, expiresAt, createdAt, updatedAt
     FROM virtual_numbers 
     WHERE userID = ?`;
    
    const params = [actualUserId];
    
    // اگر virtualNumberId مشخص شده، فقط آن شماره را برگردان
    if (virtualNumberId) {
      query += ' AND virtualNumberID = ?';
      params.push(virtualNumberId);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const [virtualNumberRows] = await connection.execute(query, params);

    return NextResponse.json({
      success: true,
      data: {
        virtualNumbers: virtualNumberRows || []
      }
    });

  } catch (error) {
    console.error('❌ Error fetching virtual numbers:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت شماره‌های مجازی'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
