import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../database/connection';
import { WalletService } from '../../../../../../database/WalletService';
import TONWalletService from '../.../../../../../../services/WalletService';

interface PremiumBuyRequest {
  recipient: string;
  username: string;
  name: string;
  months: number;
  userTelegramID: number;
  price: number;
}

interface PremiumBuyResponse {
  success: boolean;
  data?: {
    transaction: {
      validUntil: number;
      messages: Array<{
        address: string;
        amount: string;
        payload: string;
      }>;
    };
    successPageId?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  let purchaseID: string | undefined;
  const premiumPurchase: any = null;
  let successPageId: string | undefined;
  
  try {
    console.log('🚀 [PREMIUM-BUY] Starting premium purchase request');
    
    const body: PremiumBuyRequest = await request.json();
    const { recipient, username, name, months, userTelegramID, price } = body;

    console.log('📥 [PREMIUM-BUY] Request data:', {
      recipient: recipient,
      username: username,
      name: name,
      months: months,
      userTelegramID: userTelegramID,
      price: price
    });

    // Validate input
    if (!recipient || !username || !name || !months || !userTelegramID || !price) {
      console.error('❌ [PREMIUM-BUY] Invalid input data:', {
        hasRecipient: !!recipient,
        hasUsername: !!username,
        hasName: !!name,
        hasMonths: !!months,
        hasUserTelegramID: !!userTelegramID,
        hasPrice: !!price
      });
      
      return NextResponse.json({
        success: false,
        error: 'تمام فیلدها الزامی است'
      } as PremiumBuyResponse, { status: 400 });
    }

    // اعتبارسنجی تعداد ماه
    if (![3, 6, 12].includes(months)) {
      console.error('❌ [PREMIUM-BUY] Invalid months:', months);
      return NextResponse.json({
        success: false,
        error: 'تعداد ماه باید 3، 6 یا 12 باشد'
      } as PremiumBuyResponse, { status: 400 });
    }

    console.log('✅ [PREMIUM-BUY] Input validation passed');

    // شروع تراکنش دیتابیس
    console.log('🗄️ [PREMIUM-BUY] Starting database transaction...');
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 1. بررسی وجود کاربر
      console.log('👤 [PREMIUM-BUY] Checking user existence...');
      const [userRows] = await conn.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [userTelegramID]
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        console.error('❌ [PREMIUM-BUY] User not found for telegramID:', userTelegramID);
        throw new Error('کاربر یافت نشد');
      }

      const user = userRows[0] as { userID: string };
      const actualUserID = user.userID;
      console.log('✅ [PREMIUM-BUY] User found:', { userID: actualUserID });

      // 2. دریافت یا ایجاد کیف پول
      console.log('💰 [PREMIUM-BUY] Getting or creating wallet...');
      const wallet = await WalletService.getOrCreateWallet(actualUserID, userTelegramID);
      
      // تبدیل تومان به ریال (1 تومان = 10 ریال)
      const priceInRials = price * 10;
      
      console.log('💰 [PREMIUM-BUY] Balance check:', { 
        walletBalance: wallet.balance, 
        requiredAmount: priceInRials,
        priceInToman: price,
        sufficient: wallet.balance >= priceInRials
      });
      
      if (wallet.balance < priceInRials) {
        console.error('❌ [PREMIUM-BUY] Insufficient balance');
        throw new Error(`موجودی کافی نیست. موجودی شما: ${Math.floor(wallet.balance / 10)} تومان، مبلغ مورد نیاز: ${price} تومان`);
      }

      // 3. ایجاد خرید پریمیوم در دیتابیس (بدون کسر موجودی)
      purchaseID = `PREMIUM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      successPageId = `SUCCESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('📝 [PREMIUM-BUY] Creating premium purchase record:', { purchaseID, successPageId });
      
      // ایجاد رکورد خرید پریمیوم در دیتابیس
      await conn.execute(
        `INSERT INTO premium_purchases (
          purchaseID, userID, userTelegramID, recipient, username, name,
          months, price, priceInRials, status, successPageId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          purchaseID,
          actualUserID,
          userTelegramID,
          recipient,
          username,
          name,
          months,
          price,
          priceInRials,
          'pending',
          successPageId
        ]
      );

      console.log('✅ [PREMIUM-BUY] Premium purchase record created');

      // تأیید تراکنش دیتابیس
      console.log('✅ [PREMIUM-BUY] Committing database transaction...');
      await conn.commit();
      console.log('✅ [PREMIUM-BUY] Database transaction committed successfully');

    } catch (error) {
      // برگشت تراکنش در صورت خطا
      console.error('❌ [PREMIUM-BUY] Database transaction failed, rolling back:', error);
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
      console.log('🔓 [PREMIUM-BUY] Database connection released');
    }

    // کوکی‌های بروزرسانی شده
    console.log('🌐 [PREMIUM-BUY] Preparing external API request...');
    const cookies = [
      '__lhash_=f2fc97f9d2b9cc83b86382599686fc18',
      'session=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMliQg.X9stX8yG8JTVNjxXNCfMUUGRW0I',
      '_ym_uid=1755247663760478843',
      '_ym_d=1757629548',
      '__js_p_=222,1800,0,0,0',
      '__jhash_=552',
      '__jua_=Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A142.0%29%20Gecko%2F20100101%20Firefox%2F142.0',
      '__hash_=50d685215ffa13109798b882e1e6ec9b',
      '_ym_isad=2',
      '_ym_visorc=w'
    ].join('; ');

    // درخواست به API خرید پریمیوم
    console.log('🚀 [PREMIUM-BUY] Calling external API...');
    console.log('📤 [PREMIUM-BUY] Request body:', {
      recipient: recipient.trim(),
      username: username.trim(),
      name: name.trim(),
      months: months
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response;
    try {
      response = await fetch('https://marketapp.ws/fragment/premium/buy/', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'Host': 'marketapp.ws',
          'Origin': 'https://marketapp.ws',
          'Priority': 'u=0',
          'Referer': 'https://marketapp.ws/fragment/?tab=premium',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'TE': 'trailers',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
        },
        body: JSON.stringify({
          recipient: recipient.trim(),
          username: username.trim(),
          name: name.trim(),
          months: months
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ [PREMIUM-BUY] Request timeout after 30 seconds');
        throw new Error('درخواست به سرور خارجی timeout شد');
      }
      console.error('❌ [PREMIUM-BUY] Network error:', error);
      throw error;
    }

    console.log('📡 [PREMIUM-BUY] External API response status:', response.status);
    console.log('📡 [PREMIUM-BUY] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PREMIUM-BUY] External API error:', {
        status: response.status,
        error: errorText
      });
      
      if (response.status === 401) {
        console.error('❌ [PREMIUM-BUY] Authentication failed');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق'
        } as PremiumBuyResponse, { status: 401 });
      }
      
      if (response.status === 400) {
        console.error('❌ [PREMIUM-BUY] Invalid request data');
        return NextResponse.json({
          success: false,
          error: 'اطلاعات درخواست نامعتبر است'
        } as PremiumBuyResponse, { status: 400 });
      }
      
      console.error('❌ [PREMIUM-BUY] Unknown API error');
      return NextResponse.json({
        success: false,
        error: `خطا در خرید پریمیوم: ${response.status}`
      } as PremiumBuyResponse, { status: response.status });
    }

    console.log('✅ [PREMIUM-BUY] External API call successful');
    console.log('📥 [PREMIUM-BUY] Parsing response JSON...');
    const data = await response.json();
    console.log('📥 [PREMIUM-BUY] External API response data:', {
      hasTransaction: !!data.transaction,
      hasMessages: !!data.transaction?.messages,
      messagesCount: data.transaction?.messages?.length || 0,
      fullResponse: data
    });

    if (data.transaction && data.transaction.messages && data.transaction.messages.length > 0) {
      console.log('✅ [PREMIUM-BUY] Valid transaction received, processing payment...');
      // بروزرسانی خرید پریمیوم با اطلاعات تراکنش
      const message = data.transaction.messages[0];
      console.log('💳 [PREMIUM-BUY] Transaction message details:', {
        address: message.address,
        amount: message.amount,
        payloadLength: message.payload?.length || 0
      });
      
      // تایید تراکنش در ولت
      console.log('🔧 [PREMIUM-BUY] Confirming transaction in wallet...');
      const walletService = new TONWalletService();
      const confirmResult = await walletService.confirmPremiumTransaction({
        address: message.address,
        amount: message.amount,
        payload: message.payload
      });
      
      if (!confirmResult.success) {
        console.error('❌ [PREMIUM-BUY] Wallet confirmation failed:', confirmResult.error);
        throw new Error(`تایید تراکنش در ولت ناموفق: ${confirmResult.error}`);
      }
      
      console.log('✅ [PREMIUM-BUY] Wallet confirmation successful');
      
      // شروع تراکنش دیتابیس برای کسر موجودی و بروزرسانی وضعیت
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      
      try {
        // دریافت اطلاعات کاربر و کیف پول
        const [userRows] = await conn.execute(
          'SELECT userID FROM users WHERE userTelegramID = ?',
          [userTelegramID]
        );
        const user = (userRows as any[])[0] as { userID: string };
        const actualUserID = user.userID;
        
        // تبدیل تومان به ریال (1 تومان = 10 ریال)
        const priceInRials = price * 10;
        
        // کسر موجودی از کیف پول (به ریال)
        console.log('💸 [PREMIUM-BUY] Subtracting balance from wallet...');
        const balanceUpdated = await WalletService.subtractBalance(userTelegramID, priceInRials);
        
        if (!balanceUpdated) {
          console.error('❌ [PREMIUM-BUY] Failed to subtract balance');
          throw new Error('موجودی کافی نیست یا خطا در کسر موجودی');
        }

        console.log('✅ [PREMIUM-BUY] Balance subtracted successfully');

        // ثبت تراکنش خرید پریمیوم
        const transactionID = `PREMIUM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await conn.execute(
          `INSERT INTO transactions (
            transactionID, userID, userTelegramID, type, amount, 
            status, paymentMethod, description, metadata, 
            createdAt, completedAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            transactionID,
            actualUserID,
            userTelegramID,
            'premium_purchase',
            priceInRials, // استفاده از مبلغ ریال
            'completed',
            'wallet',
            `خرید اشتراک پریمیوم ${months} ماهه تلگرام برای ${name} (@${username})`,
            JSON.stringify({
              recipient: recipient,
              username: username,
              name: name,
              months: months,
              priceInToman: price, // ذخیره مبلغ تومان در metadata
              priceInRials: priceInRials // ذخیره مبلغ ریال در metadata
            })
          ]
        );

        // بروزرسانی وضعیت خرید در دیتابیس
        await conn.execute(
          `UPDATE premium_purchases SET 
            status = 'completed',
            externalTransactionID = ?,
            validUntil = ?,
            paymentAddress = ?,
            paymentAmount = ?,
            paymentPayload = ?,
            completedAt = CURRENT_TIMESTAMP,
            updatedAt = CURRENT_TIMESTAMP
          WHERE purchaseID = ?`,
          [
            `EXT_${Date.now()}`,
            new Date(data.transaction.validUntil * 1000),
            message.address,
            message.amount,
            message.payload,
            purchaseID
          ]
        );

        // تأیید تراکنش دیتابیس
        await conn.commit();
        console.log('✅ [PREMIUM-BUY] Purchase status updated to completed');
        console.log('🎉 [PREMIUM-BUY] Premium purchase completed successfully');
        
      } catch (error) {
        // برگشت تراکنش در صورت خطا
        console.error('❌ [PREMIUM-BUY] Database transaction failed, rolling back:', error);
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
        console.log('🔓 [PREMIUM-BUY] Database connection released');
      }
      
      return NextResponse.json({
        success: true,
        data: {
          transaction: {
            validUntil: data.transaction.validUntil,
            messages: data.transaction.messages.map((msg: any) => ({
              address: msg.address,
              amount: msg.amount,
              payload: msg.payload
            }))
          },
          successPageId: successPageId
        }
      } as PremiumBuyResponse);
    } else {
      console.error('❌ [PREMIUM-BUY] Invalid transaction response from external API');
      // بروزرسانی وضعیت خرید به failed
      await conn.execute(
        `UPDATE premium_purchases SET 
          status = 'failed',
          updatedAt = CURRENT_TIMESTAMP
        WHERE purchaseID = ?`,
        [purchaseID]
      );

      console.error('❌ [PREMIUM-BUY] Purchase status updated to failed');
      return NextResponse.json({
        success: false,
        error: 'پاسخ نامعتبر از سرور'
      } as PremiumBuyResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [PREMIUM-BUY] Unexpected error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // در صورت خطا، وضعیت خرید را به failed تغییر دهیم
    try {
      if (typeof purchaseID !== 'undefined') {
        console.log('🔄 [PREMIUM-BUY] Updating purchase status to failed...');
        const conn = await pool.getConnection();
        await conn.execute(
          `UPDATE premium_purchases SET 
            status = 'failed',
            updatedAt = CURRENT_TIMESTAMP
          WHERE purchaseID = ?`,
          [purchaseID]
        );
        conn.release();
        console.log('✅ [PREMIUM-BUY] Purchase status updated to failed');
      }
    } catch (updateError) {
      console.error('❌ [PREMIUM-BUY] Error updating purchase status:', updateError);
    }
    
    console.error('❌ [PREMIUM-BUY] Premium purchase failed');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطای داخلی سرور'
    } as PremiumBuyResponse, { status: 500 });
  }
}
