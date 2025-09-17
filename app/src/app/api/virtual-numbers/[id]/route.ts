import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const { id: virtualNumberId } = await params;

    if (!telegramId) {
      return NextResponse.json({
        success: false,
        error: 'شناسه تلگرام الزامی است'
      }, { status: 400 });
    }

    if (!virtualNumberId) {
      return NextResponse.json({
        success: false,
        error: 'شناسه شماره مجازی الزامی است'
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

    // دریافت شماره مجازی خاص
    const [virtualNumberRows] = await connection.execute(
      `SELECT 
        virtualNumberID, number, requestID, price, country, 
        countryCode, phoneRange, service, quality, status, 
        isActive, expiresAt, createdAt, updatedAt
       FROM virtual_numbers 
       WHERE userID = ? AND virtualNumberID = ?`,
      [actualUserId, virtualNumberId]
    );

    if (!Array.isArray(virtualNumberRows) || virtualNumberRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'شماره مجازی یافت نشد'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        virtualNumber: virtualNumberRows[0]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching virtual number:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت شماره مجازی'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
