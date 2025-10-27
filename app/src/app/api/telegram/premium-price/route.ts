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
    usdPrices?: {
      '3': number;
      '6': number;
      '12': number;
    };
  };
  error?: string;
}

export async function GET() {
  try {
    // استفاده از fragment.com به جای marketapp.ws
    const externalApiUrl = 'https://fragment.com/premium/gift?months=12';

    // کوکی‌های جدید از fragment.com
    const cookies = {
      cf_clearance: 'V4LSWzyGIbYJQ2sVGVT5AM0x89SJieZPpDdnAfd1cMo-1755465745-1.2.1.1-3SDrFrHqAKtgP40E1mRSn_9cQtcY1IIrwkzAmCYNSjmrBfYfBnUHPyQY9Yxj6AL4mdS.papJ56H7oP7dY2YVqta4W1prfFGNXFhNyfh6_E736nctXXLJ6BilAkqrt3WSsB2TRlBA4Eu9zZ7vszbfKbb0LSKKlpEinY6Df19rH8RWNHXCP1CUWVTOrwOGrvOqU0ObJ9sc6kNuL6VwzHmJG_r8i3t44u8docmzsVm7Q.Y',
      stel_dt: '-210',
      stel_ssid: '161ae9c330b4d4e0d3_14523495577108219405',
      stel_token: '4e486a8a6161cca8268cccf5e208acfb4e486a914e4866b0f70d59adbb73aacae9d8e',
      stel_ton_token: 'cPxexsyeT3SAFYRhtBQIiJ7HJtWh9EslojHIdUaEEPaXhX0MBT0N6_V4Oj_4dZ6QkrOhc_TiS9lxDCvk7ibDB4N7-M6wKq9LQWBVFpyhUkmzIFn1j90zv_cc0Pd5jkwYtQgbB1b93rjD8VDv0RQeygHNT89MUqg901DtVxZOyBZjr1h5M5lcX6RCzaS8tGeb3XF3TBM_'
    };

    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    console.log('🍪 [PREMIUM-PRICE] Using cookies:', cookieString.substring(0, 100) + '...');

    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Cookie': cookieString,
      'Host': 'fragment.com',
      'Priority': 'u=0, i',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
    };

    // بهینه‌سازی: استفاده از timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه timeout

    try {
      const externalApiResponse = await fetch(externalApiUrl, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await externalApiResponse.text();

      if (!externalApiResponse.ok) {
        console.error('External API error:', externalApiResponse.status, responseText);
        return NextResponse.json(
          { success: false, error: `خطا از سرویس خارجی: ${externalApiResponse.status}` },
          { status: externalApiResponse.status }
        );
      }

      console.log('📄 [PREMIUM-PRICE] HTML response received, length:', responseText.length);

      // Extract TON prices using the working regex pattern
      const tonPriceMatches = responseText.match(/<div class="tm-value icon-before icon-ton">(\d+)<span class="mini-frac">\.(\d+)<\/span><\/div>/g);
      
      // Extract USD prices
      const usdPriceMatches = responseText.match(/~&nbsp;&#036;([\d,]+)/g);
      
      // Extract TON rate from JavaScript
      const tonRateMatch = responseText.match(/"tonRate":(\d+\.\d+)/);
      const tonRate = tonRateMatch ? parseFloat(tonRateMatch[1]) : 2.22; // Default fallback

      if (tonPriceMatches && tonPriceMatches.length >= 3) {
        // Extract individual TON prices
        const tonPrices: { [key: string]: number } = {};
        tonPriceMatches.forEach((match, index) => {
          const priceMatch = match.match(/<div class="tm-value icon-before icon-ton">(\d+)<span class="mini-frac">\.(\d+)<\/span><\/div>/);
          if (priceMatch) {
            const months = ['12', '6', '3'][index];
            if (months) {
              tonPrices[months] = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
            }
          }
        });

        // Extract individual USD prices
        const usdPrices: { [key: string]: number } = {};
        if (usdPriceMatches && usdPriceMatches.length >= 3) {
          usdPriceMatches.forEach((match, index) => {
            const usdMatch = match.match(/~&nbsp;&#036;([\d,]+)/);
            if (usdMatch) {
              const months = ['12', '6', '3'][index];
              if (months) {
                usdPrices[months] = parseInt(usdMatch[1].replace(',', ''));
              }
            }
          });
        }

        console.log('💰 [PREMIUM-PRICE] Extracted prices:', { tonPrices, usdPrices, tonRate });

        return NextResponse.json<PremiumPriceResponse>({
          success: true,
          data: {
            tonRate,
            prices: tonPrices as { '3': number; '6': number; '12': number },
            usdPrices: usdPrices as { '3': number; '6': number; '12': number },
          },
        });
      } else {
        console.error('❌ [PREMIUM-PRICE] Not enough price matches found:', tonPriceMatches?.length || 0);
        return NextResponse.json<PremiumPriceResponse>(
          { success: false, error: 'قیمت‌های پریمیوم یافت نشد.' },
          { status: 404 }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout');
        return NextResponse.json<PremiumPriceResponse>(
          { success: false, error: 'زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.' },
          { status: 408 }
        );
      }
      throw fetchError;
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
