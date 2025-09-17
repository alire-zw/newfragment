import { NextRequest, NextResponse } from 'next/server';

interface PremiumPriceRequest {
  months: number;
}

interface PremiumPriceResponse {
  success: boolean;
  data?: {
    tonPrice: number;
    tomanPrice: number;
    months: number;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PREMIUM-PRICE] Starting premium price request');
    
    const body: PremiumPriceRequest = await request.json();
    const { months } = body;

    console.log('📥 [PREMIUM-PRICE] Request data:', {
      months: months
    });

    // اعتبارسنجی ورودی
    if (!months) {
      console.error('❌ [PREMIUM-PRICE] Invalid input data:', {
        hasMonths: !!months
      });
      
      return NextResponse.json({
        success: false,
        error: 'تعداد ماه الزامی است'
      } as PremiumPriceResponse, { status: 400 });
    }

    // اعتبارسنجی تعداد ماه
    if (![3, 6, 12].includes(months)) {
      console.error('❌ [PREMIUM-PRICE] Invalid months:', months);
      return NextResponse.json({
        success: false,
        error: 'تعداد ماه باید 3، 6 یا 12 باشد'
      } as PremiumPriceResponse, { status: 400 });
    }

    console.log('✅ [PREMIUM-PRICE] Input validation passed');

    // کوکی‌های بروزرسانی شده
    const cookies = [
      '__lhash_=f2fc97f9d2b9cc83b86382599686fc18',
      'session=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMliQg.X9stX8yG8JTVNjxXNCfMUUGRW0I',
      '_ym_uid=1755247663760478843',
      '_ym_d=1757629548',
      '__js_p_=222,1800,0,0,0',
      '__jhash_=552',
      '__jua_=Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A142.0%29%20Gecko%2F20100101%20Firefox%2F142.0',
      '__hash_=50d685215ffa13109798b882e1e6ec9b',
      '_ym_isad=2',
      '_ym_visorc=w'
    ].join('; ');

    // درخواست به API قیمت پریمیوم
    console.log('🚀 [PREMIUM-PRICE] Calling external API...');
    const response = await fetch('https://marketapp.ws/fragment/premium/price/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'Host': 'marketapp.ws',
        'Origin': 'https://marketapp.ws',
        'Priority': 'u=0',
        'Referer': 'https://marketapp.ws/fragment/?tab=premium',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
      },
      body: JSON.stringify({
        months: months
      })
    });

    console.log('📡 [PREMIUM-PRICE] External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PREMIUM-PRICE] External API error:', {
        status: response.status,
        error: errorText
      });
      
      if (response.status === 401) {
        console.error('❌ [PREMIUM-PRICE] Authentication failed');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق'
        } as PremiumPriceResponse, { status: 401 });
      }
      
      if (response.status === 400) {
        console.error('❌ [PREMIUM-PRICE] Invalid request data');
        return NextResponse.json({
          success: false,
          error: 'اطلاعات درخواست نامعتبر است'
        } as PremiumPriceResponse, { status: 400 });
      }
      
      console.error('❌ [PREMIUM-PRICE] Unknown API error');
      return NextResponse.json({
        success: false,
        error: `خطا در دریافت قیمت پریمیوم: ${response.status}`
      } as PremiumPriceResponse, { status: response.status });
    }

    console.log('✅ [PREMIUM-PRICE] External API call successful');
    const data = await response.json();
    console.log('📥 [PREMIUM-PRICE] External API response data:', {
      hasTonPrice: !!data.tonPrice,
      hasTomanPrice: !!data.tomanPrice,
      tonPrice: data.tonPrice,
      tomanPrice: data.tomanPrice
    });

    if (data.tonPrice && data.tomanPrice) {
      console.log('✅ [PREMIUM-PRICE] Valid price data received');
      console.log('🎉 [PREMIUM-PRICE] Premium price retrieved successfully');
      
      return NextResponse.json({
        success: true,
        data: {
          tonPrice: data.tonPrice,
          tomanPrice: data.tomanPrice,
          months: months
        }
      } as PremiumPriceResponse);
    } else {
      console.error('❌ [PREMIUM-PRICE] Invalid price response from external API');
      return NextResponse.json({
        success: false,
        error: 'پاسخ نامعتبر از سرور'
      } as PremiumPriceResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [PREMIUM-PRICE] Unexpected error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('❌ [PREMIUM-PRICE] Premium price request failed');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطای داخلی سرور'
    } as PremiumPriceResponse, { status: 500 });
  }
}
