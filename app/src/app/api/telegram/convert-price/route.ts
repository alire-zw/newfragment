import { NextRequest, NextResponse } from 'next/server';
import BitpinService from '@/services/BitpinService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tonAmount } = body;

    // Validate input
    if (!tonAmount || typeof tonAmount !== 'number' || tonAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'مقدار TON معتبر نیست' },
        { status: 400 }
      );
    }

    const bitpinService = new BitpinService();
    const result = await bitpinService.convertTONToToman(tonAmount);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          tonAmount: result.data!.tonAmount,
          tomanAmount: result.data!.tomanAmount,
          rate: result.data!.rate,
          source: result.data!.source,
          formattedPrice: `${result.data!.tomanAmount.toLocaleString('fa-IR')} تومان`
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'خطا در تبدیل قیمت' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Convert Price API Error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

// GET endpoint for getting current TON price
export async function GET() {
  try {
    const bitpinService = new BitpinService();
    const result = await bitpinService.getTONPrice();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          price: result.data!.price,
          priceFloat: result.data!.priceFloat,
          currency: result.data!.currency,
          source: result.data!.source,
          lastUpdate: result.data!.lastUpdate,
          formattedPrice: `${result.data!.price.toLocaleString('fa-IR')} تومان`,
          tomanPrice: result.data!.price, // Add tomanPrice field
          cached: result.cached || false
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'خطا در دریافت قیمت' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Get Price API Error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
