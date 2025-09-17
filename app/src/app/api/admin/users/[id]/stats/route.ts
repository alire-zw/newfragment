import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../../database/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر نامعتبر است' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // دریافت userID از userTelegramID
    const [userRows] = await connection.execute(
      'SELECT userID FROM users WHERE userTelegramID = ?',
      [userId]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const user = userRows[0] as { userID: string };
    const actualUserId = user.userID;

    // تعداد کل تراکنش‌ها
    const [totalTransactionsResult] = await connection.execute(
      'SELECT COUNT(*) as totalTransactions FROM transactions WHERE userID = ?',
      [actualUserId]
    );
    const totalTransactions = (totalTransactionsResult as any[])[0].totalTransactions;

    // مجموع خریدها
    const [totalSpentResult] = await connection.execute(
      'SELECT COALESCE(SUM(amount), 0) as totalSpent FROM transactions WHERE userID = ? AND status = "completed"',
      [actualUserId]
    );
    const totalSpent = (totalSpentResult as any[])[0].totalSpent;

    // تعداد شماره‌های مجازی
    const [virtualNumbersResult] = await connection.execute(
      'SELECT COUNT(*) as virtualNumbersCount FROM virtual_numbers WHERE userID = ?',
      [actualUserId]
    );
    const virtualNumbersCount = (virtualNumbersResult as any[])[0].virtualNumbersCount;

    // تعداد خریدهای استارز
    const [starsPurchasesResult] = await connection.execute(
      'SELECT COUNT(*) as starsPurchasesCount FROM stars_purchases WHERE userTelegramID = ?',
      [userId]
    );
    const starsPurchasesCount = (starsPurchasesResult as any[])[0].starsPurchasesCount;

    // تعداد خریدهای پریمیوم
    const [premiumPurchasesResult] = await connection.execute(
      'SELECT COUNT(*) as premiumPurchasesCount FROM premium_purchases WHERE userID = ?',
      [actualUserId]
    );
    const premiumPurchasesCount = (premiumPurchasesResult as any[])[0].premiumPurchasesCount;

    // موجودی کیف پول
    const [walletBalanceResult] = await connection.execute(
      'SELECT COALESCE(balance, 0) as walletBalance FROM wallets WHERE userID = ?',
      [actualUserId]
    );
    const walletBalance = (walletBalanceResult as any[])[0]?.walletBalance || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        totalSpent,
        virtualNumbersCount,
        starsPurchasesCount,
        premiumPurchasesCount,
        walletBalance
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت آمار کاربر:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار کاربر' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
