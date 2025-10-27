import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCookies, cookiesToString, isCookieExpired, isRateLimited } from '@/utils/cookieManager';

interface PremiumRecipientRequest {
  username: string;
  months: number;
}

interface PremiumRecipientResponse {
  success: boolean;
  data?: {
    recipient: string;
    photo: string;
    name: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PREMIUM-RECIPIENT] Starting premium recipient request');
    
    const body: PremiumRecipientRequest = await request.json();
    const { username, months } = body;

    console.log('📥 [PREMIUM-RECIPIENT] Request data:', {
      username: username,
      months: months
    });

    // اعتبارسنجی ورودی
    if (!username || !months) {
      console.error('❌ [PREMIUM-RECIPIENT] Invalid input data:', {
        hasUsername: !!username,
        hasMonths: !!months
      });
      
      return NextResponse.json({
        success: false,
        error: 'نام کاربری و تعداد ماه الزامی است'
      } as PremiumRecipientResponse, { status: 400 });
    }

    // اعتبارسنجی تعداد ماه
    if (![3, 6, 12].includes(months)) {
      console.error('❌ [PREMIUM-RECIPIENT] Invalid months:', months);
      return NextResponse.json({
        success: false,
        error: 'تعداد ماه باید 3، 6 یا 12 باشد'
      } as PremiumRecipientResponse, { status: 400 });
    }

    console.log('✅ [PREMIUM-RECIPIENT] Input validation passed');

    // استفاده از کوکی‌های به‌روز از cookieManager
    const cookies = await getCurrentCookies();
    const cookieString = cookiesToString(cookies);
    
    console.log('🍪 [PREMIUM-RECIPIENT] Using updated cookies:', cookieString.substring(0, 100) + '...');

    // درخواست به API دریافت کاربر پریمیوم
    console.log('🚀 [PREMIUM-RECIPIENT] Calling external API...');
    const response = await fetch('https://marketapp.ws/fragment/premium/recipient/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Content-Length': JSON.stringify({
          username: username.trim(),
          months: months.toString()
        }).length.toString(),
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
      body: JSON.stringify({
        username: username.trim(),
        months: months.toString()
      })
    });

    console.log('📡 [PREMIUM-RECIPIENT] External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PREMIUM-RECIPIENT] External API error:', {
        status: response.status,
        error: errorText
      });
      
      if (response.status === 401) {
        console.error('❌ [PREMIUM-RECIPIENT] Authentication failed');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق'
        } as PremiumRecipientResponse, { status: 401 });
      }
      
      if (response.status === 400) {
        console.error('❌ [PREMIUM-RECIPIENT] Invalid request data');
        return NextResponse.json({
          success: false,
          error: 'اطلاعات درخواست نامعتبر است'
        } as PremiumRecipientResponse, { status: 400 });
      }
      
      console.error('❌ [PREMIUM-RECIPIENT] Unknown API error');
      return NextResponse.json({
        success: false,
        error: `خطا در دریافت کاربر پریمیوم: ${response.status}`
      } as PremiumRecipientResponse, { status: response.status });
    }

    console.log('✅ [PREMIUM-RECIPIENT] External API call successful');
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    console.log('🔍 [PREMIUM-RECIPIENT] Response content-type:', contentType);
    
    if (contentType && contentType.includes('text/html')) {
      console.log('⚠️ [PREMIUM-RECIPIENT] Received HTML response instead of JSON');
      const htmlText = await response.text();
      console.log('📄 [PREMIUM-RECIPIENT] HTML response preview:', htmlText.substring(0, 200) + '...');
      
      // Check if it's a login page or error page
      if (isCookieExpired(htmlText)) {
        console.log('🔐 [PREMIUM-RECIPIENT] Authentication required - cookies may be expired');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق - کوکی‌ها منقضی شده‌اند'
        } as PremiumRecipientResponse, { status: 401 });
      }
      
      // Check if it's a rate limit or blocked page
      if (isRateLimited(htmlText)) {
        console.log('🚫 [PREMIUM-RECIPIENT] Rate limited or blocked');
        return NextResponse.json({
          success: false,
          error: 'درخواست محدود شده است'
        } as PremiumRecipientResponse, { status: 429 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'سرور پاسخ HTML برمی‌گرداند',
        details: 'کوکی‌ها ممکن است منقضی شده باشند'
      } as PremiumRecipientResponse, { status: 500 });
    }
    
    const data = await response.json();
    console.log('📥 [PREMIUM-RECIPIENT] External API response data:', {
      hasRecipient: !!data.recipient,
      hasPhoto: !!data.photo,
      hasName: !!data.name,
      recipient: data.recipient,
      name: data.name,
      photo: data.photo
    });

    if (data.recipient && data.name) {
      console.log('✅ [PREMIUM-RECIPIENT] Valid recipient data received');
      console.log('🎉 [PREMIUM-RECIPIENT] Premium recipient found successfully');
      
      // Extract photo URL from HTML img tag
      let photoUrl = '';
      console.log('🖼️ [PREMIUM-RECIPIENT] Original photo data:', data.photo);
      
      if (data.photo) {
        // Extract URL from <img src="URL" /> tag
        const imgMatch = data.photo.match(/src="([^"]+)"/);
        if (imgMatch && imgMatch[1]) {
          photoUrl = imgMatch[1];
          console.log('🖼️ [PREMIUM-RECIPIENT] Extracted photo URL:', photoUrl);
        } else {
          // If it's already a plain URL, use it directly
          photoUrl = data.photo.replace(/<[^>]*>/g, '');
          console.log('🖼️ [PREMIUM-RECIPIENT] Cleaned photo URL:', photoUrl);
        }
        
        // Ensure it's a proper URL
        if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
          if (photoUrl.startsWith('//')) {
            photoUrl = `https:${photoUrl}`;
          } else if (photoUrl.startsWith('/')) {
            photoUrl = `https://marketapp.ws${photoUrl}`;
          }
        }
        
        console.log('🖼️ [PREMIUM-RECIPIENT] Final photo URL:', photoUrl);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          recipient: data.recipient,
          photo: photoUrl,
          name: data.name
        }
      } as PremiumRecipientResponse);
    } else {
      console.error('❌ [PREMIUM-RECIPIENT] Invalid recipient response from external API');
      return NextResponse.json({
        success: false,
        error: 'پاسخ نامعتبر از سرور'
      } as PremiumRecipientResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [PREMIUM-RECIPIENT] Unexpected error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('❌ [PREMIUM-RECIPIENT] Premium recipient request failed');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطای داخلی سرور'
    } as PremiumRecipientResponse, { status: 500 });
  }
}
