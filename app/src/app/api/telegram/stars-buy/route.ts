import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';
import { WalletService } from '../../../../../database/WalletService';
import { StarsPurchaseService } from '../../../../../database/StarsPurchaseService';

interface StarsBuyRequest {
  recipient: string;
  username: string;
  name: string;
  quantity: number;
  userTelegramID: number;
  price: number;
}

interface StarsBuyResponse {
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
  let starsPurchase: any = null;
  let successPageId: string | undefined;
  
  try {
    console.log('🚀 [STARS-BUY] Starting stars purchase request');
    
    const body: StarsBuyRequest = await request.json();
    const { recipient, username, name, quantity, userTelegramID, price } = body;

    console.log('📥 [STARS-BUY] Request data:', {
      recipient: recipient,
      username: username,
      name: name,
      quantity: quantity,
      userTelegramID: userTelegramID,
      price: price
    });

    // Validate input
    if (!recipient || !username || !name || !quantity || !userTelegramID || !price) {
      console.error('❌ [STARS-BUY] Invalid input data:', {
        hasRecipient: !!recipient,
        hasUsername: !!username,
        hasName: !!name,
        hasQuantity: !!quantity,
        hasUserTelegramID: !!userTelegramID,
        hasPrice: !!price
      });
      
      return NextResponse.json({
        success: false,
        error: 'تمام فیلدها الزامی است'
      } as StarsBuyResponse, { status: 400 });
    }

    if (quantity < 50 || quantity > 1000000) {
      console.error('❌ [STARS-BUY] Invalid quantity:', quantity);
      return NextResponse.json({
        success: false,
        error: 'تعداد استارز باید بین 50 تا 1000000 باشد'
      } as StarsBuyResponse, { status: 400 });
    }

    console.log('✅ [STARS-BUY] Input validation passed');

    // بررسی خرید تکراری در 5 دقیقه گذشته
    console.log('🔍 [STARS-BUY] Checking for duplicate purchases...');
    const duplicatePurchase = await StarsPurchaseService.checkDuplicatePurchase(
      userTelegramID, 
      recipient, 
      quantity, 
      price
    );

    if (duplicatePurchase) {
      console.log('⚠️ [STARS-BUY] Duplicate purchase found:', {
        purchaseID: duplicatePurchase.id,
        status: duplicatePurchase.status,
        createdAt: duplicatePurchase.createdAt
      });
      
      if (duplicatePurchase.status === 'completed') {
        console.log('✅ [STARS-BUY] Returning completed duplicate purchase');
        return NextResponse.json({
          success: true,
          data: {
            transaction: {
              validUntil: duplicatePurchase.validUntil ? Math.floor(duplicatePurchase.validUntil.getTime() / 1000) : 0,
              messages: duplicatePurchase.paymentAddress ? [{
                address: duplicatePurchase.paymentAddress,
                amount: duplicatePurchase.paymentAmount || '0',
                payload: duplicatePurchase.paymentPayload || ''
              }] : []
            }
          },
          message: 'این خرید قبلاً انجام شده است'
        } as StarsBuyResponse);
      } else if (duplicatePurchase.status === 'pending') {
        console.log('⏳ [STARS-BUY] Duplicate purchase is pending');
        return NextResponse.json({
          success: false,
          error: 'خرید مشابه در حال پردازش است. لطفاً چند دقیقه صبر کنید.'
        } as StarsBuyResponse, { status: 409 });
      }
    }

    console.log('✅ [STARS-BUY] No duplicate purchases found');

    // شروع تراکنش دیتابیس
    console.log('🗄️ [STARS-BUY] Starting database transaction...');
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 1. بررسی وجود کاربر
      console.log('👤 [STARS-BUY] Checking user existence...');
      const [userRows] = await conn.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [userTelegramID]
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        console.error('❌ [STARS-BUY] User not found for telegramID:', userTelegramID);
        throw new Error('کاربر یافت نشد');
      }

      const user = userRows[0] as { userID: string };
      const actualUserID = user.userID;
      console.log('✅ [STARS-BUY] User found:', { userID: actualUserID });

      // 2. دریافت یا ایجاد کیف پول
      console.log('💰 [STARS-BUY] Getting or creating wallet...');
      const wallet = await WalletService.getOrCreateWallet(actualUserID, userTelegramID);
      
      // تبدیل تومان به ریال (1 تومان = 10 ریال)
      const priceInRials = price * 10;
      
      console.log('💰 [STARS-BUY] Balance check:', { 
        walletBalance: wallet.balance, 
        requiredAmount: priceInRials,
        priceInToman: price,
        sufficient: wallet.balance >= priceInRials
      });
      
      if (wallet.balance < priceInRials) {
        console.error('❌ [STARS-BUY] Insufficient balance');
        throw new Error(`موجودی کافی نیست. موجودی شما: ${Math.floor(wallet.balance / 10)} تومان، مبلغ مورد نیاز: ${price} تومان`);
      }

      // 3. کسر موجودی از کیف پول (به ریال)
      console.log('💸 [STARS-BUY] Subtracting balance from wallet...');
      const balanceUpdated = await WalletService.subtractBalance(userTelegramID, priceInRials);
      
      if (!balanceUpdated) {
        console.error('❌ [STARS-BUY] Failed to subtract balance');
        throw new Error('موجودی کافی نیست یا خطا در کسر موجودی');
      }

      console.log('✅ [STARS-BUY] Balance subtracted successfully');

      // 4. ایجاد خرید استارز در دیتابیس
      purchaseID = `STARS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      successPageId = `SUCCESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('📝 [STARS-BUY] Creating stars purchase record:', { purchaseID, successPageId });
      
      starsPurchase = await StarsPurchaseService.createPurchase({
        userID: actualUserID,
        userTelegramID: userTelegramID,
        recipient: recipient,
        username: username,
        name: name,
        quantity: quantity,
        price: price,
        priceInRials: priceInRials,
        status: 'pending',
        successPageId: successPageId
      });

      console.log('✅ [STARS-BUY] Stars purchase record created:', { 
        purchaseID: starsPurchase.id,
        status: starsPurchase.status
      });

      // 5. ثبت تراکنش خرید استارز
      const transactionID = `STARS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
          'stars_purchase',
          priceInRials, // استفاده از مبلغ ریال
          'completed',
          'wallet',
          `خرید ${quantity} استارز تلگرام برای ${name} (@${username})`,
          JSON.stringify({
            recipient: recipient,
            username: username,
            name: name,
            quantity: quantity,
            priceInToman: price, // ذخیره مبلغ تومان در metadata
            priceInRials: priceInRials // ذخیره مبلغ ریال در metadata
          })
        ]
      );

      // تأیید تراکنش دیتابیس
      console.log('✅ [STARS-BUY] Committing database transaction...');
      await conn.commit();
      console.log('✅ [STARS-BUY] Database transaction committed successfully');

    } catch (error) {
      // برگشت تراکنش در صورت خطا
      console.error('❌ [STARS-BUY] Database transaction failed, rolling back:', error);
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
      console.log('🔓 [STARS-BUY] Database connection released');
    }

    // کوکی‌های بروزرسانی شده
    console.log('🌐 [STARS-BUY] Preparing external API request...');
    const cookies = [
      '__lhash_=f2fc97f9d2b9cc83b86382599686fc18',
      'session=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMNNRw.xCdNaaeHSxyq2JizDHWol-se3GQ',
      '_ym_uid=1755247663760478843',
      '_ym_d=1757629548',
      '_ym_isad=2',
      '_ym_visorc=w',
      '__js_p_=566,1800,0,0,0'
    ].join('; ');

    // درخواست به API خرید استارز
    console.log('🚀 [STARS-BUY] Calling external API...');
    const response = await fetch('https://marketapp.ws/fragment/stars/buy/', {
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
        'Referer': 'https://marketapp.ws/fragment/',
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
        quantity: quantity
      })
    });

    console.log('📡 [STARS-BUY] External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [STARS-BUY] External API error:', {
        status: response.status,
        error: errorText
      });
      
      if (response.status === 401) {
        console.error('❌ [STARS-BUY] Authentication failed');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق'
        } as StarsBuyResponse, { status: 401 });
      }
      
      if (response.status === 400) {
        console.error('❌ [STARS-BUY] Invalid request data');
        return NextResponse.json({
          success: false,
          error: 'اطلاعات درخواست نامعتبر است'
        } as StarsBuyResponse, { status: 400 });
      }
      
      console.error('❌ [STARS-BUY] Unknown API error');
      return NextResponse.json({
        success: false,
        error: `خطا در خرید استارز: ${response.status}`
      } as StarsBuyResponse, { status: response.status });
    }

    console.log('✅ [STARS-BUY] External API call successful');
    const data = await response.json();
    console.log('📥 [STARS-BUY] External API response data:', {
      hasTransaction: !!data.transaction,
      hasMessages: !!data.transaction?.messages,
      messagesCount: data.transaction?.messages?.length || 0
    });

    if (data.transaction && data.transaction.messages && data.transaction.messages.length > 0) {
      console.log('✅ [STARS-BUY] Valid transaction received, updating purchase status...');
      // بروزرسانی خرید استارز با اطلاعات تراکنش
      const message = data.transaction.messages[0];
      console.log('💳 [STARS-BUY] Transaction message details:', {
        address: message.address,
        amount: message.amount,
        payloadLength: message.payload?.length || 0
      });
      
      await StarsPurchaseService.updatePurchaseStatus(purchaseID, 'completed', {
        externalTransactionID: `EXT_${Date.now()}`,
        validUntil: new Date(data.transaction.validUntil * 1000),
        paymentAddress: message.address,
        paymentAmount: message.amount,
        paymentPayload: message.payload,
        metadata: {
          externalResponse: data,
          purchaseID: purchaseID
        }
      });

      console.log('✅ [STARS-BUY] Purchase status updated to completed');
      console.log('🎉 [STARS-BUY] Stars purchase completed successfully');
      
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
      } as StarsBuyResponse);
    } else {
      console.error('❌ [STARS-BUY] Invalid transaction response from external API');
      // بروزرسانی وضعیت خرید به failed
      await StarsPurchaseService.updatePurchaseStatus(purchaseID, 'failed', {
        metadata: {
          error: 'پاسخ نامعتبر از سرور',
          externalResponse: data
        }
      });

      console.error('❌ [STARS-BUY] Purchase status updated to failed');
      return NextResponse.json({
        success: false,
        error: 'پاسخ نامعتبر از سرور'
      } as StarsBuyResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [STARS-BUY] Unexpected error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // در صورت خطا، وضعیت خرید را به failed تغییر دهیم
    try {
      if (typeof purchaseID !== 'undefined') {
        console.log('🔄 [STARS-BUY] Updating purchase status to failed...');
        await StarsPurchaseService.updatePurchaseStatus(starsPurchase?.id?.toString() || '', 'failed', {
          metadata: {
            error: error instanceof Error ? error.message : 'خطای داخلی سرور',
            stack: error instanceof Error ? error.stack : undefined
          }
        });
        console.log('✅ [STARS-BUY] Purchase status updated to failed');
      }
    } catch (updateError) {
      console.error('❌ [STARS-BUY] Error updating purchase status:', updateError);
    }
    
    console.error('❌ [STARS-BUY] Stars purchase failed');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطای داخلی سرور'
    } as StarsBuyResponse, { status: 500 });
  }
}
