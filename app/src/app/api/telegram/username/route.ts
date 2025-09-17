import { NextRequest, NextResponse } from 'next/server';

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

    // کوکی‌های لازم برای احراز هویت
    const cookieString = [
      '_ym_visorc=w',
      '_ym_isad=2',
      '__js_p_=566,1800,0,0,0',
      '_ym_d=1757629548',
      '_ym_uid=1755247663760478843',
      'session=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMNMfg.DCj2PZ8CYoWiX4rbIbLk9WY-XJQ'
    ].join('; ');

    // درخواست به API تلگرام
    const response = await fetch('https://marketapp.ws/fragment/stars/recipient/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
        'Origin': 'https://marketapp.ws',
        'Referer': 'https://marketapp.ws/fragment/?tab=stars',
        'Cookie': cookieString,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: JSON.stringify({ username: cleanUsername })
    });

    if (response.ok) {
      const data: TelegramUserInfo = await response.json();
      
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
    } else {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);

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
    console.error('Telegram username check failed:', error);
    
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
