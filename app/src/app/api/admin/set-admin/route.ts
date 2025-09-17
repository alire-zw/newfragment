import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, isAdmin } = body;

    if (!telegramId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'شناسه تلگرام و وضعیت ادمین الزامی است' },
        { status: 400 }
      );
    }

    const success = await UserService.setUserAdmin(parseInt(telegramId), isAdmin);
    
    if (!success) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: isAdmin ? 'کاربر به ادمین تبدیل شد' : 'دسترسی ادمین از کاربر حذف شد'
    });
  } catch (error) {
    console.error('خطا در تنظیم وضعیت ادمین:', error);
    return NextResponse.json(
      { error: 'خطا در تنظیم وضعیت ادمین' },
      { status: 500 }
    );
  }
}
