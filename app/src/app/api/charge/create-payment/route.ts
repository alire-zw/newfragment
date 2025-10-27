import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

// Zibal configuration - Sandbox Mode
const ZIBAL_CONFIG = {
  merchant: '68a6457ea45c72001333cc4a',
  baseUrl: 'https://gateway.zibal.ir/v1',
  startUrl: 'https://gateway.zibal.ir/start'
};

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { amount, userId, description, selectedCardId } = await request.json();

    // اعتبارسنجی ورودی
    if (!amount || amount < 1000) {
      return NextResponse.json({
        success: false,
        error: 'حداقل مبلغ شارژ 1,000 تومان است'
      }, { status: 400 });
    }

    if (amount > 10000000) {
      return NextResponse.json({
        success: false,
        error: 'حداکثر مبلغ شارژ 10,000,000 تومان است'
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'شناسه کاربری الزامی است'
      }, { status: 400 });
    }

    // دریافت اطلاعات کاربر از دیتابیس
    connection = await pool.getConnection();
    
    // ابتدا userID را از telegramID پیدا کنیم
    const [userRows] = await connection.execute(
      'SELECT userID, userPhoneNumber, userNationalID FROM users WHERE userTelegramID = ?',
      [userId]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    const user = userRows[0] as { userID: string, userPhoneNumber: string | null, userNationalID: string | null };
    const actualUserId = user.userID;

    // دریافت اطلاعات کارت انتخاب شده (اگر انتخاب شده باشد)
    let selectedCardNumber = null;
    if (selectedCardId) {
      const [cardRows] = await connection.execute(
        'SELECT cardNumber FROM bank_accounts WHERE accountID = ? AND userID = ? AND accountStatus = "active"',
        [selectedCardId, actualUserId]
      );

      if (Array.isArray(cardRows) && cardRows.length > 0) {
        const card = cardRows[0] as { cardNumber: string };
        selectedCardNumber = card.cardNumber;
      }
    }

    // تبدیل تومان به ریال (1 تومان = 10 ریال)
    const amountInRials = amount * 10;
    
    // URL callback - مستقیماً به API callback برگردد (نه صفحه)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.numberstar.shop';
    const callbackUrl = `${baseUrl}/api/charge/callback`;
    
    console.log('🔗 Callback URL:', callbackUrl);
    console.log('🔗 Base URL:', baseUrl);

    // آماده‌سازی داده‌های درخواست زیبال
    const requestData: {
      merchant: string;
      amount: number;
      callbackUrl: string;
      description: string;
      orderId: string;
      mobile?: string;
      nationalCode?: string;
      allowedCards?: string[];
      checkMobileWithCard?: boolean;
    } = {
      merchant: ZIBAL_CONFIG.merchant,
      amount: amountInRials,
      callbackUrl: callbackUrl,
      description: description || 'شارژ حساب کیف پول',
      orderId: `wallet_telegram_${userId}_${Date.now()}`
    };

    // اضافه کردن اطلاعات کاربر اگر موجود باشد
    if (user.userPhoneNumber) {
      requestData.mobile = user.userPhoneNumber;
    }

    if (user.userNationalID) {
      requestData.nationalCode = user.userNationalID;
    }

    // اضافه کردن شماره کارت انتخاب شده اگر موجود باشد
    if (selectedCardNumber) {
      requestData.allowedCards = [selectedCardNumber];
    }

    // فعال کردن تطبیق شماره کارت و موبایل
    if (user.userPhoneNumber && selectedCardNumber) {
      requestData.checkMobileWithCard = true;
    }

    console.log('🔗 Creating Zibal payment request:', {
      amount: amount,
      amountInRials: amountInRials,
      userId: userId,
      callbackUrl: callbackUrl,
      userPhone: user.userPhoneNumber,
      userNationalID: user.userNationalID,
      selectedCard: selectedCardNumber,
      requestData: requestData
    });

    // ارسال درخواست به زیبال
    const response = await fetch(`${ZIBAL_CONFIG.baseUrl}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    console.log('📊 Zibal response:', data);

    if (data.result === 100) {
      const trackId = data.trackId;
      // URL شروع پرداخت زیبال
      const paymentUrl = `${ZIBAL_CONFIG.startUrl}/${trackId}`;

      console.log('✅ Payment created successfully:', {
        trackId: trackId,
        paymentUrl: paymentUrl
      });

      return NextResponse.json({
        success: true,
        trackId: trackId,
        paymentUrl: paymentUrl,
        amount: amount,
        amountInRials: amountInRials
      });
    } else {
      console.error('❌ Payment creation failed:', data);
      
      return NextResponse.json({
        success: false,
        error: getErrorMessage(data.result),
        result: data.result,
        message: data.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطا در ایجاد درخواست پرداخت'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function getErrorMessage(result: number): string {
  const errorMessages: { [key: number]: string } = {
    100: 'با موفقیت تایید شد',
    102: 'merchant یافت نشد',
    103: 'merchant غیرفعال',
    104: 'merchant نامعتبر',
    105: 'amount بایستی بزرگتر از 1,000 ریال باشد',
    106: 'callbackUrl نامعتبر می‌باشد (شروع با http و یا https)',
    113: 'amount مبلغ تراکنش از سقف میزان تراکنش بیشتر است',
    114: 'کدملی ارسالی نامعتبر است',
    201: 'قبلا تایید شده',
    202: 'سفارش پرداخت نشده یا ناموفق بوده است',
    203: 'trackId نامعتبر می‌باشد'
  };

  return errorMessages[result] || 'خطای ناشناخته';
}
