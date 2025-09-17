import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    const isAdmin = await UserService.isUserAdmin(parseInt(telegramId));
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('خطا در بررسی وضعیت ادمین:', error);
    return NextResponse.json(
      { error: 'خطا در بررسی وضعیت ادمین' },
      { status: 500 }
    );
  }
}
