import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';
import { WalletService } from '../../../../../database/WalletService';
import { VirtualNumberService } from '../../../../services/VirtualNumberService';
import { requireAuth, requireOwnership, handleAuthError } from '@/utils/auth';
import { logAudit, getRequestMetadata } from '@/utils/audit';
import { purchaseRateLimit } from '@/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 🔒 احراز هویت
    const authenticatedUserId = await requireAuth(request);

    const body = await request.json();
    const { 
      userTelegramID, 
      countryId, 
      countryName, 
      price 
    } = body;

    // بررسی وجود پارامترهای لازم
    if (!userTelegramID || !countryId || !countryName || !price) {
      return NextResponse.json({
        success: false,
        message: 'پارامترهای لازم ارسال نشده است'
      }, { status: 400 });
    }

    // 🔒 چک کردن اینکه کاربر فقط برای خودش خرید کند
    await requireOwnership(request, parseInt(userTelegramID), false);

    // 🔒 Rate limiting برای خریدها
    const canProceed = await purchaseRateLimit(`purchase:virtual-number:${authenticatedUserId}`);
    if (!canProceed) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.'
      }, { status: 429 });
    }

      // دریافت شماره مجازی از API خارجی
      console.log('🛒 Starting virtual number purchase:', { countryId, countryName, price });
      
      const countryCode = VirtualNumberService.getCountryCode(countryName);
      console.log('🌍 Country code for API:', countryCode);
      
      const virtualNumberResponse = await VirtualNumberService.getVirtualNumber(1, countryCode);
      console.log('✅ Virtual number received:', virtualNumberResponse);
      
      const virtualNumberData = {
        number: virtualNumberResponse.number,
        request_id: virtualNumberResponse.request_id.toString(),
        price: virtualNumberResponse.price,
        country: virtualNumberResponse.country,
        range: virtualNumberResponse.range.toString(),
        service: virtualNumberResponse.service,
        quality: virtualNumberResponse.quality
      };

      // استفاده از قیمت ارسال شده از صفحه (که شامل درصد سود است)
      const finalPrice = parseInt(price);
      virtualNumberData.price = finalPrice;
      console.log(`💰 Using final price with profit: ${finalPrice}`);

    // تولید شناسه‌های یکتا
    const virtualNumberID = `VN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // شروع تراکنش دیتابیس
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 1. بررسی وجود کاربر
      const [userRows] = await conn.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [userTelegramID]
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        throw new Error('کاربر یافت نشد');
      }

      const user = userRows[0] as { userID: string };
      const actualUserID = user.userID;

      // 2. دریافت یا ایجاد کیف پول
      const wallet = await WalletService.getOrCreateWallet(actualUserID, userTelegramID);
      
      // تبدیل تومان به ریال (1 تومان = 10 ریال)
      const priceInRials = virtualNumberData.price * 10;
      
      console.log('💰 Balance check:', { 
        walletBalance: wallet.balance, 
        requiredAmount: priceInRials,
        priceInToman: virtualNumberData.price 
      });
      
      if (wallet.balance < priceInRials) {
        throw new Error(`موجودی کافی نیست. موجودی شما: ${Math.floor(wallet.balance / 10)} تومان، مبلغ مورد نیاز: ${virtualNumberData.price} تومان`);
      }

      // 3. کسر موجودی از کیف پول (به ریال)
      const balanceUpdated = await WalletService.subtractBalance(parseInt(userTelegramID), priceInRials);
      
      if (!balanceUpdated) {
        throw new Error('موجودی کافی نیست یا خطا در کسر موجودی');
      }

      // 4. ذخیره شماره مجازی
      await conn.execute(
        `INSERT INTO virtual_numbers (
          virtualNumberID, userID, userTelegramID, number, requestID, 
          price, country, countryCode, phoneRange, service, quality, 
          status, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          virtualNumberID,
          actualUserID,
          userTelegramID,
          virtualNumberData.number,
          virtualNumberData.request_id,
          virtualNumberData.price,
          countryName, // استفاده از نام کشور از پارامتر ورودی
          `+${virtualNumberData.range}`, // کد کشور با علامت +
          virtualNumberData.range.toString(), // رنج شماره به صورت رشته
          virtualNumberData.service,
          virtualNumberData.quality,
          'active',
          true
        ]
      );

      // 5. ثبت تراکنش خرید
      const transactionID = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
          'purchase',
          priceInRials, // استفاده از مبلغ ریال
          'completed',
          'wallet',
          `خرید شماره مجازی ${virtualNumberData.number} برای کشور ${virtualNumberData.country}`,
          JSON.stringify({
            virtualNumberID,
            number: virtualNumberData.number,
            country: virtualNumberData.country,
            service: virtualNumberData.service,
            priceInToman: virtualNumberData.price, // ذخیره مبلغ تومان در metadata
            priceInRials: priceInRials // ذخیره مبلغ ریال در metadata
          })
        ]
      );

      // تأیید تراکنش
      await conn.commit();

      // 📝 ثبت لاگ Audit
      const metadata = getRequestMetadata(request);
      await logAudit({
        userId: parseInt(userTelegramID),
        action: 'purchase.virtual_number',
        resourceType: 'virtual_number',
        resourceId: virtualNumberID,
        details: { 
          number: virtualNumberData.number, 
          country: countryName, 
          price: virtualNumberData.price 
        },
        ...metadata
      });

      console.log('✅ [VIRTUAL-NUMBER] Purchase completed:', {
        userId: userTelegramID,
        virtualNumberID,
        number: virtualNumberData.number
      });

      return NextResponse.json({
        success: true,
        message: 'شماره مجازی با موفقیت خریداری شد',
        data: {
          virtualNumberID,
          number: virtualNumberData.number,
          request_id: virtualNumberData.request_id,
          price: virtualNumberData.price,
          country: virtualNumberData.country,
          range: virtualNumberData.range,
          service: virtualNumberData.service,
          quality: virtualNumberData.quality
        }
      });

    } catch (error) {
      // برگشت تراکنش در صورت خطا
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در خرید شماره مجازی:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : message
    }, { status: error instanceof Error && (error.message.includes('احراز هویت') || error.message.includes('دسترسی')) ? status : 500 });
  }
}