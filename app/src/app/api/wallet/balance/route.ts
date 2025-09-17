import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';
import { WalletService } from '../../../../../database/WalletService';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

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

    // دریافت موجودی کیف پول
    const [walletRows] = await connection.execute(
      'SELECT balance, frozenBalance, totalDeposited, totalWithdrawn, status FROM wallets WHERE userID = ?',
      [actualUserId]
    );

    if (Array.isArray(walletRows) && walletRows.length > 0) {
      const wallet = walletRows[0] as { 
        balance: number, 
        frozenBalance: number, 
        totalDeposited: number, 
        totalWithdrawn: number, 
        status: string 
      };

      return NextResponse.json({
        success: true,
        data: {
          balance: wallet.balance,
          frozenBalance: wallet.frozenBalance,
          availableBalance: wallet.balance - wallet.frozenBalance,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
          status: wallet.status
        }
      });
    } else {
      // اگر کیف پول وجود نداشت، یک کیف پول جدید ایجاد کن
      try {
        const newWallet = await WalletService.createWallet(actualUserId, parseInt(telegramId));
        
        return NextResponse.json({
          success: true,
          data: {
            balance: newWallet.balance,
            frozenBalance: newWallet.frozenBalance,
            availableBalance: newWallet.balance - newWallet.frozenBalance,
            totalDeposited: newWallet.totalDeposited,
            totalWithdrawn: newWallet.totalWithdrawn,
            status: newWallet.status
          }
        });
      } catch (createError) {
        console.error('❌ Error creating wallet:', createError);
        return NextResponse.json({
          success: false,
          error: 'خطا در ایجاد کیف پول'
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ Error fetching wallet balance:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت موجودی کیف پول'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
