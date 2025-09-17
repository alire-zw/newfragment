import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // محاسبه offset
    const offset = (page - 1) * limit;

    // دریافت تراکنش‌ها
    const [transactionRows] = await connection.execute(
      `SELECT 
        transactionID, type, amount, status, paymentMethod, 
        paymentTrackId, description, createdAt, completedAt
       FROM transactions 
       WHERE userID = ? 
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [actualUserId, limit, offset]
    );

    // شمارش کل تراکنش‌ها
    const [countRows] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE userID = ?',
      [actualUserId]
    );

    const totalTransactions = Array.isArray(countRows) && countRows.length > 0 
      ? (countRows[0] as { total: number }).total 
      : 0;

    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactionRows || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transaction history:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت تاریخچه تراکنش‌ها'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
