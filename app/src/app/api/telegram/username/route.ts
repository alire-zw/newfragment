import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCookies, cookiesToString, isCookieExpired, isRateLimited } from '@/utils/cookieManager';

// Interface برای پاسخ API
interface TelegramUserInfo {
  recipient: string;
  name: string;
  photo: string;
}

// Interface برای پاسخ ما
interface ApiResponse {
  success: boolean;
  data?: {
    recipient: string;
    name: string;
    photo: string;
    username: string;
    hasPhoto: boolean;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    // بررسی وجود username
    if (!username || typeof username !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'نام کاربری الزامی است'
      } as ApiResponse, { status: 400 });
    }

    // پاک کردن @ از ابتدای username
    const cleanUsername = username.replace(/^@/, '');

    // بررسی فرمت username
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      return NextResponse.json({
        success: false,
        error: 'فرمت نام کاربری نامعتبر است'
      } as ApiResponse, { status: 400 });
    }

    console.log(`Checking Telegram username: ${cleanUsername}`);

    // استفاده از کوکی‌های به‌روز از cookieManager
    const cookies = getCurrentCookies();
    const cookieString = cookiesToString(cookies);
    
    console.log('🍪 [USERNAME-API] Using updated cookies:', cookieString.substring(0, 100) + '...');

    // درخواست به API تلگرام
    console.log('🚀 [USERNAME-API] Making request to external API...');
    
    // استفاده از endpoint صحیح و تست شده
    const endpoint = 'https://marketapp.ws/fragment/stars/recipient/';
    
    console.log(`🔗 [USERNAME-API] Using endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Content-Length': JSON.stringify({ username: cleanUsername }).length.toString(),
        'Content-Type': 'application/json',
        'Cookie': cookieString,
        'Host': 'marketapp.ws',
        'Origin': 'https://marketapp.ws',
        'Referer': 'https://marketapp.ws/fragment/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
      },
      body: JSON.stringify({ username: cleanUsername })
    });
    
    console.log(`📡 [USERNAME-API] Response status:`, response.status);
    console.log('📡 [USERNAME-API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      console.log('🔍 [USERNAME-API] Response content-type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        console.log('⚠️ [USERNAME-API] Received HTML response instead of JSON');
        const htmlText = await response.text();
        console.log('📄 [USERNAME-API] HTML response preview:', htmlText.substring(0, 200) + '...');
        
        // Check if it's a login page or error page
        if (isCookieExpired(htmlText)) {
          console.log('🔐 [USERNAME-API] Authentication required - cookies may be expired');
          return NextResponse.json({
            success: false,
            error: 'احراز هویت ناموفق - کوکی‌ها منقضی شده‌اند'
          } as ApiResponse, { status: 401 });
        }
        
        // Check if it's a rate limit or blocked page
        if (isRateLimited(htmlText)) {
          console.log('🚫 [USERNAME-API] Rate limited or blocked');
          return NextResponse.json({
            success: false,
            error: 'درخواست محدود شده است'
          } as ApiResponse, { status: 429 });
        }
        
        // Try to extract any useful information from HTML
        console.log('🔍 [USERNAME-API] Analyzing HTML response...');
        
        // Check if it's a loading page or maintenance page
        if (htmlText.includes('loading') || htmlText.includes('maintenance') || htmlText.includes('temporarily')) {
          console.log('⏳ [USERNAME-API] Service appears to be under maintenance');
          return NextResponse.json({
            success: false,
            error: 'سرویس در حال بروزرسانی است',
            details: 'لطفاً بعداً تلاش کنید'
          } as ApiResponse, { status: 503 });
        }
        
        // Check if it's a captcha or verification page
        if (htmlText.includes('captcha') || htmlText.includes('verification') || htmlText.includes('verify')) {
          console.log('🤖 [USERNAME-API] Captcha or verification required');
          return NextResponse.json({
            success: false,
            error: 'نیاز به تأیید هویت',
            details: 'لطفاً از طریق مرورگر وارد شوید و captcha را حل کنید'
          } as ApiResponse, { status: 403 });
        }
        
        // Check if it's a rate limit page
        if (htmlText.includes('rate') || htmlText.includes('limit') || htmlText.includes('too many')) {
          console.log('🚫 [USERNAME-API] Rate limit detected');
          return NextResponse.json({
            success: false,
            error: 'درخواست محدود شده است',
            details: 'لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید'
          } as ApiResponse, { status: 429 });
        }
        
        // Try to extract any error message from HTML
        const errorMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const errorTitle = errorMatch ? errorMatch[1] : 'Unknown Error';
        
        console.log('📄 [USERNAME-API] HTML title:', errorTitle);
        
        return NextResponse.json({
          success: false,
          error: 'سرور پاسخ HTML برمی‌گرداند',
          details: 'کوکی‌ها ممکن است منقضی شده باشند',
          htmlTitle: errorTitle,
          htmlPreview: htmlText.substring(0, 200) + '...',
          suggestion: 'لطفاً کوکی‌های جدید را از طریق /api/cookies/update بروزرسانی کنید'
        } as ApiResponse, { status: 500 });
      }
      
      try {
        const data: TelegramUserInfo = await response.json();
        console.log('✅ [USERNAME-API] JSON response received:', data);
      
        // پردازش photo - استخراج URL از HTML
        let photoUrl = '';
        if (data.photo) {
          const srcMatch = data.photo.match(/src="([^"]+)"/);
          if (srcMatch) {
            photoUrl = srcMatch[1];
          }
        }

        const result: ApiResponse = {
          success: true,
          data: {
            recipient: data.recipient,
            name: data.name || cleanUsername,
            photo: photoUrl,
            username: cleanUsername,
            hasPhoto: !!photoUrl
          }
        };

        return NextResponse.json(result);
      } catch (jsonError) {
        console.error('❌ [USERNAME-API] JSON parsing failed:', jsonError);
        return NextResponse.json({
          success: false,
          error: 'خطا در پردازش پاسخ سرور'
        } as ApiResponse, { status: 500 });
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ [USERNAME-API] Request failed: ${response.status} - ${errorText}`);

      let errorMessage = 'خطا در تشخیص نام کاربری';
      
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail === 'invalid recipient') {
            errorMessage = 'نام کاربری یافت نشد یا قابل دریافت استارز نیست';
          }
        } catch {
          errorMessage = 'نام کاربری نامعتبر است';
        }
      } else if (response.status === 404) {
        errorMessage = 'نام کاربری یافت نشد';
      } else if (response.status === 401) {
        errorMessage = 'خطا در احراز هویت';
      } else if (response.status >= 500) {
        errorMessage = 'خطای سرور';
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      } as ApiResponse, { status: response.status });
    }

    } catch (error) {
    console.error('❌ [USERNAME-API] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطای داخلی سرور'
    } as ApiResponse, { status: 500 });
  }
}

// پشتیبانی از GET برای تست
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) {
    return NextResponse.json({
      success: false,
      error: 'پارامتر username الزامی است'
    } as ApiResponse, { status: 400 });
  }

  // تبدیل GET به POST
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }));
}

