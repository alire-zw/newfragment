import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';
import { requireAuth, requireOwnership, handleAuthError } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // 🔒 احراز هویت
    const authenticatedUserId = await requireAuth(request);

    const body = await request.json();
    const { userID, userFullName, userTelegramID, userBirthDate, userNationalID, userPhoneNumber, isVerified } = body;

    // اعتبارسنجی داده‌های ورودی
    if (!userID || !userFullName || !userTelegramID) {
      return NextResponse.json(
        { error: 'اطلاعات ضروری کاربر ناقص است' },
        { status: 400 }
      );
    }

    // 🔒 چک کردن اینکه کاربر فقط اطلاعات خودش را ذخیره کند
    // برای کاربر جدید، فقط بررسی می‌کنیم که authenticatedUserId با userTelegramID یکی باشد
    if (authenticatedUserId !== userTelegramID) {
      // اگر کاربر در حال ذخیره اطلاعات شخص دیگری است، بررسی دسترسی ادمین
      await requireOwnership(request, parseInt(userTelegramID), true);
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
    const { message, status } = handleAuthError(error);
    console.error('❌ خطا در ذخیره کاربر:', error);
    
    return NextResponse.json(
      { 
        error: message,
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status }
    );
  }
}
