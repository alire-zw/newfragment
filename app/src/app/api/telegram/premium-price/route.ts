import { NextResponse } from 'next/server';

interface PremiumPriceResponse {
  success: boolean;
  data?: {
    tonRate: number;
    prices: {
      '3': number;
      '6': number;
      '12': number;
    };
  };
  error?: string;
}

export async function GET() {
  try {
    const externalApiUrl = 'https://marketapp.ws/fragment/?tab=premium';

    // Hardcoded cookies and headers from the user's provided request
    const cookies = {
      session: 'eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjlkZTRjYzk4MGVmMzE0YWMiLCAiYWRkcmVzcyI6ICIwOmExYzVhYTNjZDhiOGZkMTczZGRmMGM2M2EwMTczZDc2NTMwMTdiYjRhZmJkNjM3NGY0ZWRlMDdkOGQ5YzI5MGMiLCAicmVmIjogIm9jV3FQTmk0X1JjOTN3eGpvQmM5ZGxNQmU3U3Z2V04wOU8zZ2ZZMmNLUXc9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aMNMfg.DCj2PZ8CYoWiX4rbIbLk9WY-XJQ',
      _ym_uid: '1755247663760478843',
      _ym_d: '1757629548',
      __js_p_: '566,1800,0,0,0',
      _ym_isad: '2',
      _ym_visorc: 'w',
    };

    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Cookie': cookieString,
      'Host': 'marketapp.ws',
      'Priority': 'u=0, i',
      'Referer': 'https://marketapp.ws/fragment/?tab=stars',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
    };

    const externalApiResponse = await fetch(externalApiUrl, {
      method: 'GET',
      headers: headers,
    });

    const responseText = await externalApiResponse.text();

    if (!externalApiResponse.ok) {
      console.error('External API error:', externalApiResponse.status, responseText);
      return NextResponse.json(
        { success: false, error: `خطا از سرویس خارجی: ${externalApiResponse.status}` },
        { status: externalApiResponse.status }
      );
    }

    // Parse the HTML response to extract premium prices
    // Looking for the premium options with TON prices
    const priceRegex = /<div class="tm-value icon-before icon-ton">\s*(\d+)\s*<span class="mini-frac">\s*\.(\d+)\s*<\/span>\s*<\/div>/g;
    const matches = [...responseText.matchAll(priceRegex)];
    
    // Extract TON rate from the footer - looking for the actual TON rate
    const tonRateMatch = responseText.match(/Based on&nbsp;<span class="icon-before icon-ton">TON<\/span>&nbsp;[\w]+<\/div>\s*<div>\s*<span class="icon-before icon-ton">~?\$(\d+\.\d+)<\/span>/);
    const tonRate = tonRateMatch ? parseFloat(tonRateMatch[1]) : 3.08; // Default fallback

    if (matches.length >= 3) {
      // The order should be: 12 months, 6 months, 3 months (based on the HTML structure)
      const prices = {
        '12': parseFloat(`${matches[0][1]}.${matches[0][2]}`), // 1 year: 9.39
        '6': parseFloat(`${matches[1][1]}.${matches[1][2]}`),  // 6 months: 5.18
        '3': parseFloat(`${matches[2][1]}.${matches[2][2]}`),  // 3 months: 3.88
      };

      return NextResponse.json<PremiumPriceResponse>({
        success: true,
        data: {
          tonRate,
          prices,
        },
      });
    } else {
      return NextResponse.json<PremiumPriceResponse>(
        { success: false, error: 'قیمت‌های پریمیوم یافت نشد.' },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در سرور';
    console.error('Telegram premium price API Error:', error);
    return NextResponse.json<PremiumPriceResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
