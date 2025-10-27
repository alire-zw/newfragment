import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';
import { requireAuth, requireOwnership, handleAuthError } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔒 احراز هویت
    const authenticatedUserId = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const telegramID = searchParams.get('telegramID');
    const userID = searchParams.get('userID');

    if (!telegramID && !userID) {
      return NextResponse.json(
        { error: 'شناسه تلگرام یا شناسه کاربری الزامی است' },
        { status: 400 }
      );
    }

    let user;
    if (telegramID) {
      user = await UserService.getUserByTelegramID(Number(telegramID));
    } else if (userID) {
      user = await UserService.getUserByUserID(userID);
    }

    // اگر کاربر وجود ندارد، قبل از 404، بررسی دسترسی
    if (!user) {
      // فقط اگر کاربر در حال درخواست اطلاعات خودش است، 404 برگردان
      if (telegramID && authenticatedUserId === parseInt(telegramID)) {
        return NextResponse.json(
          { error: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }
      // در غیر این صورت، دسترسی غیرمجاز
      return NextResponse.json(
        { error: 'شما دسترسی به این منبع ندارید' },
        { status: 403 }
      );
    }

    // 🔒 چک کردن اینکه کاربر فقط اطلاعات خودش را ببیند (یا ادمین باشد)
    if (telegramID) {
      await requireOwnership(request, parseInt(telegramID), true);
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('❌ خطا در دریافت اطلاعات کاربر:', error);
    
    return NextResponse.json(
      { 
        error: message,
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status }
    );
  }
}
