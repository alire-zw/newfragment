import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

// Zibal configuration - Sandbox Mode
const ZIBAL_CONFIG = {
  merchant: '68a6457ea45c72001333cc4a',
  baseUrl: 'https://gateway.zibal.ir/v1'
};

export async function GET(request: NextRequest) {
  let connection;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.numberstar.shop';
  
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');
    const success = searchParams.get('success');

    console.log('🔍 Payment callback received:', {
      trackId: trackId,
      success: success
    });

    if (!trackId) {
      // ریدایرکت مستقیم به صفحه callback با خطا
      return NextResponse.redirect(`${baseUrl}/charge/callback?error=missing_track_id`);
    }

    if (success !== '1') {
      // ریدایرکت مستقیم به صفحه callback با خطا
      return NextResponse.redirect(`${baseUrl}/charge/callback?error=payment_failed`);
    }

    // تایید پرداخت در زیبال
    const verifyResponse = await fetch(`${ZIBAL_CONFIG.baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        merchant: ZIBAL_CONFIG.merchant,
        trackId: trackId
      })
    });

    const verifyData = await verifyResponse.json();

    console.log('📊 Zibal verification response:', verifyData);

    if (verifyData.result === 100) {
      // پرداخت موفق
      const amountInToman = verifyData.amount / 10; // تبدیل ریال به تومان (برای نمایش)
      const amountInRials = verifyData.amount; // مبلغ ریال (برای ذخیره در دیتابیس)
      const orderId = verifyData.orderId;
      
      console.log('✅ Payment verified successfully:', {
        trackId: trackId,
        amountInToman: amountInToman,
        amountInRials: amountInRials,
        orderId: orderId
      });

      // اتصال به دیتابیس
      connection = await pool.getConnection();
      
      // استخراج userTelegramID از orderId (فرمت: wallet_telegram_userID_timestamp)
      const orderIdParts = orderId.split('_');
      if (orderIdParts.length >= 4) {
        const userTelegramID = orderIdParts[2];
        
        // پیدا کردن userID واقعی از جدول users
        const [userRows] = await connection.execute(
          'SELECT userID FROM users WHERE userTelegramID = ?',
          [parseInt(userTelegramID)]
        );
        
        if (Array.isArray(userRows) && userRows.length > 0) {
          const user = userRows[0] as { userID: string };
          const actualUserID = user.userID;
          
          // ثبت تراکنش در دیتابیس
          const transactionID = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await connection.execute(
            `INSERT INTO transactions (
              transactionID, userID, userTelegramID, type, amount, status, 
              paymentMethod, paymentTrackId, paymentOrderId, description, 
              completedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              transactionID,
              actualUserID,
              parseInt(userTelegramID),
              'charge',
              amountInRials, // استفاده از مبلغ ریال
              'completed',
              'zibal',
              trackId,
              orderId,
              `شارژ حساب کیف پول به مبلغ ${amountInToman} تومان`
            ]
          );
          
          console.log('✅ Transaction recorded successfully:', {
            transactionID,
            userID: actualUserID,
            userTelegramID,
            amountInRials
          });

          // شارژ کیف پول کاربر
          await connection.execute(
            `INSERT INTO wallets (walletID, userID, userTelegramID, balance, totalDeposited, status) 
             VALUES (?, ?, ?, ?, ?, 'active')
             ON DUPLICATE KEY UPDATE 
             balance = balance + ?, 
             totalDeposited = totalDeposited + ?,
             updatedAt = NOW()`,
            [
              `wallet_${actualUserID}`,
              actualUserID,
              parseInt(userTelegramID),
              amountInRials, // استفاده از مبلغ ریال
              amountInRials, // استفاده از مبلغ ریال
              amountInRials, // استفاده از مبلغ ریال
              amountInRials  // استفاده از مبلغ ریال
            ]
          );

          console.log('✅ Wallet charged successfully:', {
            userID: actualUserID,
            amountInRials,
            newBalance: amountInRials
          });
        } else {
          console.error('❌ User not found for telegramID:', userTelegramID);
        }
      } else {
        console.error('❌ Invalid orderId format:', orderId);
      }

      // ریدایرکت مستقیم به صفحه callback با موفقیت
      return NextResponse.redirect(`${baseUrl}/charge/callback?success=true&amount=${amountInToman}&trackId=${trackId}`);
    } else {
      console.error('❌ Payment verification failed:', verifyData);
      // ریدایرکت مستقیم به صفحه callback با خطا
      return NextResponse.redirect(`${baseUrl}/charge/callback?error=verification_failed`);
    }

  } catch (error) {
    console.error('❌ Error processing payment callback:', error);
    // ریدایرکت مستقیم به صفحه callback با خطا
    return NextResponse.redirect(`${baseUrl}/charge/callback?error=server_error`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(request: NextRequest) {
  // برای درخواست‌های POST هم همان منطق GET را اجرا می‌کنیم
  return GET(request);
}
