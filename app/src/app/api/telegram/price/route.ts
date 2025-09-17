import { NextRequest, NextResponse } from 'next/server';

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

    // Hardcoded cookies from the user's session
    const cookies = [
      'session=eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMNMfg.DCj2PZ8CYoWiX4rbIbLk9WY-XJQ',
      '_ym_uid=1755247663760478843',
      '_ym_d=1757629548',
      '__js_p_=566,1800,0,0,0',
      '_ym_isad=2',
      '_ym_visorc=w'
    ].join('; ');

    const response = await fetch('https://marketapp.ws/fragment/stars/price/', {
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
        'Referer': 'https://marketapp.ws/fragment/?tab=stars',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
      },
      body: JSON.stringify({ quantity })
    });

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

    const data = await response.json();
    
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
          usdPrice: usdPrice ? parseInt(usdPrice) : null,
          rawHtml: htmlString
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'فرمت پاسخ نامعتبر' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Price API Error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
