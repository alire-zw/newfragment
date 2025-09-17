import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryName = searchParams.get('countryName');
    const serviceId = searchParams.get('serviceId') || '1';

    if (!countryName) {
      return NextResponse.json({
        success: false,
        message: 'نام کشور ارسال نشده است'
      }, { status: 400 });
    }

    console.log('🔍 Getting price from cached API for:', { countryName, serviceId });

    try {
      // استفاده از API prices که کش شده و فقط قیمت‌ها رو برمی‌گردونه
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/prices/${serviceId}?token=221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'خطا در دریافت قیمت‌ها');
      }

      // پیدا کردن کشور مورد نظر در لیست قیمت‌ها
      const country = data.data.find((c: any) => c.name === countryName);
      
      if (!country) {
        throw new Error('کشور مورد نظر در لیست قیمت‌ها یافت نشد');
      }

      console.log('✅ Price found for country:', country);

      return NextResponse.json({
        success: true,
        data: {
          price: country.price,
          country: country.name,
          service: 'تلگرام (پنل اختصاصی)',
          quality: country.quality || 'کیفیت استاندارد'
        }
      });

    } catch (apiError) {
      console.error('❌ API Error:', apiError);
      
      // در صورت خطا، قیمت پیش‌فرض را برگردان
      return NextResponse.json({
        success: false,
        message: apiError instanceof Error ? apiError.message : 'خطا در دریافت قیمت واقعی',
        fallback: true
      });
    }

  } catch (error) {
    console.error('خطا در دریافت قیمت واقعی:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'خطای داخلی سرور'
    }, { status: 500 });
  }
}
