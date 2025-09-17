import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';

export async function GET(request: NextRequest) {
  try {
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

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ خطا در دریافت اطلاعات کاربر:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت اطلاعات کاربر',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
