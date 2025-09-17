import { NextRequest, NextResponse } from 'next/server';
import { getFlagUrl } from '@/utils/countryMapping';
import { cacheService } from '@/services/CacheService';

// توکن احراز هویت
const AUTH_TOKEN = '221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1';

// کلید کش برای هر سرویس
const getCacheKey = (serviceId: string) => `prices_${serviceId}`;

// API برای دریافت قیمت سرویس‌ها
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // بررسی وجود پارامترهای لازم
    if (!serviceId) {
      return NextResponse.json({
        success: false,
        message: 'شناسه سرویس الزامی است'
      }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'توکن احراز هویت الزامی است'
      }, { status: 400 });
    }

    // بررسی صحت توکن
    if (token !== AUTH_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    // بررسی کش
    const cacheKey = getCacheKey(serviceId);
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log(`📦 Cache hit for service ${serviceId}`);
      return NextResponse.json({
        success: true,
        data: cachedData,
        message: 'لیست قیمت‌ها از کش دریافت شد',
        cached: true
      });
    }

    console.log(`🌐 Cache miss for service ${serviceId}, fetching from API...`);

    // درخواست به API اصلی
    const apiUrl = `https://api.ozvinoo.xyz/web/${token}/get-prices/${serviceId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // 10 ثانیه timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // پردازش پاسخ و تبدیل به فرمت مورد نظر
    const processedData = data.map((item: { country: string; range: number; price: number; count: string }) => {
      // کشورهای خاص که ایموجی به جای اسم نمایش می‌دهند
      const specialCountries: { [key: string]: string } = {
        '🇾🇪': 'یمن',
        '🇳🇵': 'نپال', 
        '🇹🇭': 'تایلند',
        '🇨🇫': 'آفریقای مرکزی',
        '🇵🇸': 'فلسطین',
        '🇳🇱': 'هلند'
      };

      let countryName = item.country.split(' ')[0];
      
      // بررسی اینکه آیا نام کشور یکی از ایموجی‌های خاص است
      if (specialCountries[countryName]) {
        countryName = specialCountries[countryName];
      }

      return {
        id: Math.random().toString(36).substr(2, 9), // تولید ID منحصر به فرد
        name: countryName, // نام کشور
        flag: getFlagUrl(item.range), // URL پرچم واقعی
        code: `+${item.range}`, // کد کشور
        price: item.price, // قیمت
        available: item.count === '✅ موجود' // وضعیت موجودی
      };
    });

    // ذخیره در کش برای 30 دقیقه
    cacheService.set(cacheKey, processedData, 30);
    console.log(`💾 Data cached for service ${serviceId} for 30 minutes`);

    return NextResponse.json({
      success: true,
      data: processedData,
      message: 'لیست قیمت‌ها با موفقیت دریافت شد',
      cached: false
    });

  } catch (error) {
    console.error('خطا در دریافت قیمت‌ها:', error);
    
    // بررسی نوع خطا
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json({
          success: false,
          message: 'زمان انتظار برای دریافت پاسخ به پایان رسید'
        }, { status: 408 });
      }
    }

    // خطای عمومی
    return NextResponse.json({
      success: false,
      message: 'خطای داخلی سرور'
    }, { status: 500 });
  }
}

// پشتیبانی از POST method
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  return GET(request, { params });
}
