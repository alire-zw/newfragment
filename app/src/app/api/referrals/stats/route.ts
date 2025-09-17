import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '../../../../../database/ReferralService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramID = searchParams.get('telegramID');

    if (!telegramID) {
      return NextResponse.json(
        { error: 'شناسه تلگرام الزامی است' },
        { status: 400 }
      );
    }

    const stats = await ReferralService.getReferralStats(Number(telegramID));

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ خطا در دریافت آمار رفرال:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت آمار رفرال',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
