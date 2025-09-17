import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/services/CacheService';

// API برای پاک کردن کش
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // پاک کردن کش خاص
      const deleted = cacheService.delete(key);
      return NextResponse.json({
        success: true,
        message: deleted ? `کش ${key} پاک شد` : `کش ${key} یافت نشد`,
        deleted
      });
    } else {
      // پاک کردن تمام کش
      cacheService.clear();
      return NextResponse.json({
        success: true,
        message: 'تمام کش پاک شد'
      });
    }
  } catch (error) {
    console.error('خطا در پاک کردن کش:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در پاک کردن کش'
    }, { status: 500 });
  }
}

// API برای دریافت اطلاعات کش
export async function GET(request: NextRequest) {
  try {
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
    console.error('خطا در دریافت اطلاعات کش:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت اطلاعات کش'
    }, { status: 500 });
  }
}
