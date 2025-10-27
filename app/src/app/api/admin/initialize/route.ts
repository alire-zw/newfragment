import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';

/**
 * 🔐 راه‌اندازی اولین ادمین سیستم
 * فقط یکبار قابل اجرا است و نیاز به کلید امنیتی دارد
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, secretKey } = body;

    // بررسی کلید امنیتی
    const validSecretKey = process.env.ADMIN_INIT_SECRET_KEY || 'default-secret-change-me';
    
    if (secretKey !== validSecretKey) {
      return NextResponse.json(
        { error: 'کلید امنیتی نامعتبر است' },
        { status: 403 }
      );
    }

    if (!telegramId) {
      return NextResponse.json(
        { error: 'شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    // بررسی اینکه آیا قبلاً ادمینی وجود دارد یا نه
    const existingAdmins = await UserService.getAdmins();
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'سیستم قبلاً راه‌اندازی شده است' },
        { status: 409 }
      );
    }

    // تنظیم اولین ادمین
    const success = await UserService.setUserAdmin(parseInt(telegramId), true);
    
    if (!success) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد یا خطا در تنظیم ادمین' },
        { status: 500 }
      );
    }

    console.log('🔐 [ADMIN-INIT] First admin initialized:', telegramId);

    return NextResponse.json({ 
      success: true, 
      message: 'اولین ادمین با موفقیت تنظیم شد',
      adminId: telegramId
    });

  } catch (error) {
    console.error('❌ [ADMIN-INIT] Error:', error);
    return NextResponse.json(
      { error: 'خطا در راه‌اندازی ادمین' },
      { status: 500 }
    );
  }
}
