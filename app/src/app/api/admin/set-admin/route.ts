import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';
import { requireAdmin, handleAuthError } from '@/utils/auth';
import { logAudit, getRequestMetadata } from '@/utils/audit';
import { strictRateLimit } from '@/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    // 🔒 Rate limiting برای اقدامات حساس
    const canProceed = await strictRateLimit(`admin:set-admin:${adminId}`);
    if (!canProceed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { telegramId, isAdmin } = body;

    if (!telegramId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'شناسه تلگرام و وضعیت ادمین الزامی است' },
        { status: 400 }
      );
    }

    // جلوگیری از تغییر دسترسی خودش توسط ادمین
    if (parseInt(telegramId) === adminId) {
      return NextResponse.json(
        { error: 'شما نمی‌توانید دسترسی خودتان را تغییر دهید' },
        { status: 403 }
      );
    }

    const success = await UserService.setUserAdmin(parseInt(telegramId), isAdmin);
    
    if (!success) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // 📝 ثبت لاگ Audit
    const metadata = getRequestMetadata(request);
    await logAudit({
      userId: adminId,
      action: 'admin.set_admin',
      resourceType: 'user',
      resourceId: telegramId.toString(),
      details: { isAdmin, targetUserId: telegramId },
      ...metadata
    });
    
    console.log('✅ [ADMIN] Admin access changed:', {
      adminId,
      targetUserId: telegramId,
      isAdmin
    });

    return NextResponse.json({ 
      success: true, 
      message: isAdmin ? 'کاربر به ادمین تبدیل شد' : 'دسترسی ادمین از کاربر حذف شد'
    });
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در تنظیم وضعیت ادمین:', error);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
