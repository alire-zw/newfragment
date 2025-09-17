import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userID, userFullName, userTelegramID, userBirthDate, userNationalID, userPhoneNumber, isVerified } = body;

    // اعتبارسنجی داده‌های ورودی
    if (!userID || !userFullName || !userTelegramID) {
      return NextResponse.json(
        { error: 'اطلاعات ضروری کاربر ناقص است' },
        { status: 400 }
      );
    }

    // ذخیره یا بروزرسانی کاربر
    const user = await UserService.saveOrUpdateUser({
      userID,
      userFullName,
      userTelegramID: Number(userTelegramID),
      userBirthDate: userBirthDate || null,
      userNationalID: userNationalID || null,
      userPhoneNumber: userPhoneNumber || null,
      isVerified: isVerified || false
    });

    console.log('✅ کاربر با موفقیت ذخیره شد:', user);

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت ذخیره شد',
      user
    });

  } catch (error) {
    console.error('❌ خطا در ذخیره کاربر:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در ذخیره اطلاعات کاربر',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
