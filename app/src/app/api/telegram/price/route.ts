import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCookies, cookiesToString, isCookieExpired, isRateLimited } from '@/utils/cookieManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity } = body;

    // Validate input
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'مقدار استارز معتبر نیست' },
        { status: 400 }
      );
    }

    // Cookies with direct values
    const cookies = getCurrentCookies();
    const cookieString = cookiesToString(cookies);
    
    console.log('🍪 [PRICE-API] Using cookies:', cookieString.substring(0, 100) + '...');

    // بهینه‌سازی: استفاده از cache headers و timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه timeout

    try {
      const response = await fetch('https://marketapp.ws/fragment/stars/price/', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Content-Length': JSON.stringify({ quantity }).length.toString(),
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
        body: JSON.stringify({ quantity }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json(
            { success: false, error: 'احراز هویت ناموفق' },
            { status: 401 }
          );
        }
        if (response.status === 400) {
          return NextResponse.json(
            { success: false, error: 'مقدار استارز معتبر نیست' },
            { status: 400 }
          );
        }
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, error: 'سرویس قیمت‌گذاری در دسترس نیست' },
            { status: 404 }
          );
        }
              return NextResponse.json(
        { success: false, error: 'خطا در دریافت قیمت' },
        { status: response.status }
      );
    }

    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    console.log('🔍 [PRICE-API] Response content-type:', contentType);
    
    if (contentType && contentType.includes('text/html')) {
      console.log('⚠️ [PRICE-API] Received HTML response instead of JSON');
      const htmlText = await response.text();
      console.log('📄 [PRICE-API] HTML response preview:', htmlText.substring(0, 200) + '...');
      
      // Check if it's a login page or error page
      if (isCookieExpired(htmlText)) {
        console.log('🔐 [PRICE-API] Authentication required - cookies may be expired');
        return NextResponse.json({
          success: false,
          error: 'احراز هویت ناموفق - کوکی‌ها منقضی شده‌اند'
        }, { status: 401 });
      }
      
      // Check if it's a rate limit or blocked page
      if (isRateLimited(htmlText)) {
        console.log('🚫 [PRICE-API] Rate limited or blocked');
        return NextResponse.json({
          success: false,
          error: 'درخواست محدود شده است'
        }, { status: 429 });
      }
      
      // Try to extract price information from HTML
      const tonMatch = htmlText.match(/>(\d+(?:\.\d+)?)<span class="mini-frac">\.(\d+)<\/span>/);
      const tonPrice = tonMatch ? `${tonMatch[1]}.${tonMatch[2]}` : null;
      
      const usdMatch = htmlText.match(/~&nbsp;&#036;([\d,]+)/);
      const usdPrice = usdMatch ? usdMatch[1].replace(',', '') : null;
      
      console.log('💰 [PRICE-API] Extracted prices:', { tonPrice, usdPrice });
      
      if (tonPrice || usdPrice) {
        return NextResponse.json({
          success: true,
          data: {
            quantity,
            tonPrice: tonPrice ? parseFloat(tonPrice) : null,
            usdPrice: usdPrice ? parseInt(usdPrice) : null
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'نمی‌توان قیمت را از پاسخ HTML استخراج کرد - کوکی‌ها ممکن است منقضی شده باشند',
          details: 'لطفاً کوکی‌های جدید را از طریق /api/cookies/update بروزرسانی کنید',
          htmlPreview: htmlText.substring(0, 200) + '...'
        }, { status: 500 });
      }
    }
    
    // Try to parse as JSON
    try {
      const data = await response.json();
      console.log('✅ [PRICE-API] JSON response received:', data);
      
      if (data.h) {
        // Parse the HTML response to extract price information
        const htmlString = data.h;
        
        // Extract TON price (e.g., "329.1809")
        const tonMatch = htmlString.match(/>(\d+(?:\.\d+)?)<span class="mini-frac">\.(\d+)<\/span>/);
        const tonPrice = tonMatch ? `${tonMatch[1]}.${tonMatch[2]}` : null;
        
        // Extract USD price (e.g., "$1,017")
        const usdMatch = htmlString.match(/~&nbsp;&#036;([\d,]+)/);
        const usdPrice = usdMatch ? usdMatch[1].replace(',', '') : null;
        
        return NextResponse.json({
          success: true,
          data: {
            quantity,
            tonPrice: tonPrice ? parseFloat(tonPrice) : null,
            usdPrice: usdPrice ? parseInt(usdPrice) : null
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'فرمت پاسخ نامعتبر' },
          { status: 500 }
        );
      }
    } catch (jsonError) {
      console.error('❌ [PRICE-API] JSON parsing failed:', jsonError);
      return NextResponse.json(
        { success: false, error: 'خطا در پردازش پاسخ سرور' },
        { status: 500 }
      );
    }

    } catch (innerError) {
      clearTimeout(timeoutId);
      console.error('❌ [PRICE-API] Request failed:', innerError);
      return NextResponse.json(
        { success: false, error: 'خطای داخلی سرور' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ [PRICE-API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
