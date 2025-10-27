import { NextRequest, NextResponse } from 'next/server';
import { StarsPurchaseService } from '@/database/StarsPurchaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ successPageId: string }> }
) {
  try {
    const { successPageId } = await params;

    if (!successPageId) {
      return NextResponse.json({
        success: false,
        error: 'شناسه صفحه موفقیت الزامی است'
      }, { status: 400 });
    }

    console.log('🔍 [STARS-PURCHASE] Looking up purchase by successPageId:', successPageId);

    const purchase = await StarsPurchaseService.getPurchaseBySuccessPageId(successPageId);

    if (!purchase) {
      return NextResponse.json({
        success: false,
        error: 'خرید یافت نشد'
      }, { status: 404 });
    }

    console.log('✅ [STARS-PURCHASE] Purchase found:', {
      id: purchase.id,
      status: purchase.status,
      quantity: purchase.quantity,
      price: purchase.price
    });

    return NextResponse.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.error('❌ [STARS-PURCHASE] Error looking up purchase:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطای داخلی سرور'
    }, { status: 500 });
  }
}
