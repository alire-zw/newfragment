import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function DELETE(request: NextRequest) {
  try {
    const { accountId, telegramId } = await request.json();

    // اعتبارسنجی ورودی‌ها
    if (!accountId || !telegramId) {
      return NextResponse.json(
        { message: 'شناسه حساب و شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // بررسی وجود حساب
      const [accounts] = await connection.execute(
        'SELECT accountID FROM bank_accounts WHERE accountID = ? AND userTelegramID = ?',
        [accountId, telegramId]
      );

      if ((accounts as { accountID: string }[]).length === 0) {
        return NextResponse.json(
          { message: 'حساب بانکی یافت نشد' },
          { status: 404 }
        );
      }

      // حذف حساب
      await connection.execute(
        'DELETE FROM bank_accounts WHERE accountID = ? AND userTelegramID = ?',
        [accountId, telegramId]
      );

      console.log('✅ حساب بانکی حذف شد:', {
        accountId,
        telegramId
      });

      return NextResponse.json({
        message: 'حساب بانکی با موفقیت حذف شد',
        success: true
      });

    } catch (error) {
      console.error('❌ خطا در حذف حساب بانکی:', error);
      return NextResponse.json(
        { message: 'خطا در حذف حساب بانکی' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست حذف:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}
