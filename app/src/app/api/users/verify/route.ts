import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function POST(request: NextRequest) {
  try {
    const { nationalId, phoneNumber, telegramId } = await request.json();

    // اعتبارسنجی ورودی‌ها
    if (!nationalId || !phoneNumber || !telegramId) {
      return NextResponse.json(
        { message: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد ملی
    if (!/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { message: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: 'شماره موبایل نامعتبر است' },
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
        return NextResponse.json(
          { message: 'کاربر یافت نشد' },
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
        return NextResponse.json(
          { message: 'کاربر قبلاً احراز هویت شده است' },
          { status: 400 }
        );
      }

      // اجازه ارسال مجدد درخواست احراز هویت

      // بررسی تطبیق کد ملی و شماره موبایل با سرویس زیبال
      const shahkarResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/verify/shahkar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          nationalCode: nationalId
        })
      });

      const shahkarData = await shahkarResponse.json();

      if (!shahkarData.success || !shahkarData.data?.matched) {
        return NextResponse.json(
          { message: shahkarData.message || 'کد ملی و شماره موبایل تطبیق ندارند' },
          { status: 400 }
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
