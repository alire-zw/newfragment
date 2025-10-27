import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function POST(request: NextRequest) {
  try {
    const { nationalId, phoneNumber, telegramId } = await request.json();
    console.log('📥 [VERIFY] Request data:', { nationalId: nationalId?.substring(0,3)+'***', phoneNumber: phoneNumber?.substring(0,4)+'***', telegramId });

    // اعتبارسنجی ورودی‌ها
    if (!nationalId || !phoneNumber || !telegramId) {
      console.error('❌ [VERIFY] Missing fields:', { nationalId: !!nationalId, phoneNumber: !!phoneNumber, telegramId: !!telegramId });
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی است', message: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد ملی
    if (!/^\d{10}$/.test(nationalId)) {
      console.error('❌ [VERIFY] Invalid nationalId format:', nationalId?.length);
      return NextResponse.json(
        { error: 'کد ملی باید ۱۰ رقم باشد', message: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(phoneNumber)) {
      console.error('❌ [VERIFY] Invalid phoneNumber format:', phoneNumber);
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است', message: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // بررسی وجود کاربر
      const [users] = await connection.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [telegramId]
      );

      if ((users as { userID: string }[]).length === 0) {
        console.error('❌ [VERIFY] User not found:', telegramId);
        return NextResponse.json(
          { error: 'کاربر یافت نشد', message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      const user = (users as { userID: string }[])[0];

      // بررسی اینکه آیا قبلاً احراز هویت شده یا نه
      const [existingVerification] = await connection.execute(
        'SELECT verificationStatus FROM users WHERE userID = ?',
        [user.userID]
      );

      const verificationData = (existingVerification as { verificationStatus: string }[])[0];
      if (verificationData && verificationData.verificationStatus === 'verified') {
        console.warn('⚠️ [VERIFY] User already verified:', telegramId);
        return NextResponse.json(
          { error: 'کاربر قبلاً احراز هویت شده است', message: 'کاربر قبلاً احراز هویت شده است' },
          { status: 400 }
        );
      }

      // اجازه ارسال مجدد درخواست احراز هویت

      // بررسی تطبیق کد ملی و شماره موبایل با سرویس زیبال
      try {
        const shahkarResponse = await fetch('https://gateway.zibal.ir/v1/facility/shahkarInquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ca2325c1ab61456a8a7d2104c93646dc',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            mobile: phoneNumber,
            nationalCode: nationalId
          })
        });

        if (!shahkarResponse.ok) {
          console.error('❌ Shahkar API Error:', {
            status: shahkarResponse.status,
            statusText: shahkarResponse.statusText
          });
          
          const errorText = await shahkarResponse.text();
          console.error('❌ Error Response:', errorText);
          
          return NextResponse.json(
            { error: 'خطا در ارتباط با سرویس احراز هویت', message: 'خطا در ارتباط با سرویس احراز هویت' },
            { status: 400 }
          );
        }

        const shahkarData = await shahkarResponse.json();
        console.log('📡 [VERIFY] Shahkar response:', { result: shahkarData.result, matched: shahkarData.data?.matched });

        if (shahkarData.result !== 1 || !shahkarData.data?.matched) {
          console.error('❌ [VERIFY] Shahkar mismatch:', shahkarData);
          return NextResponse.json(
            { error: shahkarData.message || 'کد ملی و شماره موبایل تطبیق ندارند', message: shahkarData.message || 'کد ملی و شماره موبایل تطبیق ندارند' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('❌ خطا در ارتباط با API زیبال:', error);
        return NextResponse.json(
          { error: 'خطا در ارتباط با سرویس احراز هویت', message: 'خطا در ارتباط با سرویس احراز هویت' },
          { status: 500 }
        );
      }

      // بروزرسانی اطلاعات احراز هویت
      await connection.execute(
        `UPDATE users 
         SET userNationalID = ?, userPhoneNumber = ?, verificationStatus = 'verified', isVerified = true, updatedAt = CURRENT_TIMESTAMP
         WHERE userID = ?`,
        [nationalId, phoneNumber, user.userID]
      );

      console.log('✅ احراز هویت موفق:', {
        telegramId,
        nationalId: nationalId.substring(0, 3) + '****' + nationalId.substring(6),
        phoneNumber: phoneNumber.substring(0, 4) + '****' + phoneNumber.substring(7)
      });

      return NextResponse.json({
        message: 'احراز هویت با موفقیت انجام شد',
        success: true,
        verified: true
      });

    } catch (error) {
      console.error('❌ خطا در ثبت درخواست احراز هویت:', error);
      return NextResponse.json(
        { message: 'خطا در ثبت درخواست احراز هویت' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست احراز هویت:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}
