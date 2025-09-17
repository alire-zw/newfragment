import { NextRequest, NextResponse } from 'next/server';

// توکن احراز هویت
const AUTH_TOKEN = '221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1';

// API برای دریافت لیست سرویس‌های موجود
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'توکن احراز هویت الزامی است'
      }, { status: 400 });
    }

    if (token !== AUTH_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    // لیست سرویس‌های موجود
    const services = [
      {
        id: 1,
        name: 'شماره مجازی تلگرام',
        description: 'شماره‌های مجازی برای استفاده در تلگرام',
        icon: '📱',
        active: true
      },
      {
        id: 2,
        name: 'شماره مجازی واتساپ',
        description: 'شماره‌های مجازی برای استفاده در واتساپ',
        icon: '💬',
        active: true
      },
      {
        id: 3,
        name: 'شماره مجازی اینستاگرام',
        description: 'شماره‌های مجازی برای استفاده در اینستاگرام',
        icon: '📸',
        active: false
      }
    ];

    return NextResponse.json({
      success: true,
      data: services,
      message: 'لیست سرویس‌ها با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('خطا در دریافت سرویس‌ها:', error);
    
    return NextResponse.json({
      success: false,
      message: 'خطای داخلی سرور'
    }, { status: 500 });
  }
}
