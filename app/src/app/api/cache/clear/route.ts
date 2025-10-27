import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/services/CacheService';
import { requireAdmin, handleAuthError } from '@/utils/auth';
import { logAudit, getRequestMetadata } from '@/utils/audit';

// API برای پاک کردن کش
export async function POST(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // پاک کردن کش خاص
      const deleted = cacheService.delete(key);

      // 📝 ثبت لاگ
      const metadata = getRequestMetadata(request);
      await logAudit({
        userId: adminId,
        action: 'cache.clear',
        resourceType: 'cache',
        resourceId: key,
        details: { deleted },
        ...metadata
      });

      return NextResponse.json({
        success: true,
        message: deleted ? `کش ${key} پاک شد` : `کش ${key} یافت نشد`,
        deleted
      });
    } else {
      // پاک کردن تمام کش
      cacheService.clear();

      // 📝 ثبت لاگ
      const metadata = getRequestMetadata(request);
      await logAudit({
        userId: adminId,
        action: 'cache.clear',
        resourceType: 'cache',
        resourceId: 'all',
        details: { action: 'clear_all' },
        ...metadata
      });

      console.log('✅ [ADMIN] All cache cleared by admin:', adminId);

      return NextResponse.json({
        success: true,
        message: 'تمام کش پاک شد'
      });
    }
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در پاک کردن کش:', error);
    return NextResponse.json({
      success: false,
      message
    }, { status });
  }
}

// API برای دریافت اطلاعات کش
export async function GET(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // اطلاعات کش خاص
      const info = cacheService.getInfo(key);
      return NextResponse.json({
        success: true,
        data: {
          key,
          ...info
        }
      });
    } else {
      // لیست تمام کلیدهای کش (برای debug)
      return NextResponse.json({
        success: true,
        message: 'برای دریافت اطلاعات کش، کلید را مشخص کنید'
      });
    }
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در دریافت اطلاعات کش:', error);
    return NextResponse.json({
      success: false,
      message
    }, { status });
  }
}
