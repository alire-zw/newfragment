import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function GET(request: NextRequest) {
  try {
    // دریافت telegramId از query parameters
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { message: 'شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // دریافت اطلاعات کاربر
      const [users] = await connection.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [telegramId]
      );

      if ((users as { userID: string }[]).length === 0) {
        return NextResponse.json(
          { message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      const user = (users as { userID: string }[])[0];

      // دریافت حساب‌های بانکی کاربر
      const [accounts] = await connection.execute(
        `SELECT 
          accountID,
          cardNumber,
          birthDate,
          bankName,
          accountStatus,
          isDefault,
          createdAt
         FROM bank_accounts 
         WHERE userID = ? 
         ORDER BY isDefault DESC, createdAt DESC`,
        [user.userID]
      );

      interface BankAccount {
        accountID: string;
        cardNumber: string;
        birthDate: string;
        bankName: string;
        accountStatus: string;
        isDefault: boolean;
        createdAt: string;
      }

      console.log('✅ حساب‌های بانکی دریافت شد:', {
        telegramId,
        accountsCount: (accounts as BankAccount[]).length
      });

      return NextResponse.json({
        success: true,
        accounts: accounts as BankAccount[]
      });

    } catch (error) {
      console.error('❌ خطا در دریافت حساب‌های بانکی:', error);
      return NextResponse.json(
        { message: 'خطا در دریافت حساب‌های بانکی' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { message: 'شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // دریافت اطلاعات کاربر
      const [users] = await connection.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [telegramId]
      );

      if ((users as { userID: string }[]).length === 0) {
        return NextResponse.json(
          { message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      const user = (users as { userID: string }[])[0];

      // دریافت حساب‌های بانکی کاربر
      const [accounts] = await connection.execute(
        `SELECT 
          accountID,
          cardNumber,
          birthDate,
          bankName,
          accountStatus,
          isDefault,
          createdAt
         FROM bank_accounts 
         WHERE userID = ? 
         ORDER BY isDefault DESC, createdAt DESC`,
        [user.userID]
      );

      interface BankAccount {
        accountID: string;
        cardNumber: string;
        birthDate: string;
        bankName: string;
        accountStatus: string;
        isDefault: boolean;
        createdAt: string;
      }

      console.log('✅ حساب‌های بانکی دریافت شد:', {
        telegramId,
        accountsCount: (accounts as BankAccount[]).length
      });

      return NextResponse.json({
        success: true,
        accounts: accounts as BankAccount[]
      });

    } catch (error) {
      console.error('❌ خطا در دریافت حساب‌های بانکی:', error);
      return NextResponse.json(
        { message: 'خطا در دریافت حساب‌های بانکی' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}
