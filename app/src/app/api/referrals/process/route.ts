import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '../../../../../database/ReferralService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramID, startAppParam } = body;

    if (!telegramID || !startAppParam) {
      return NextResponse.json(
        { error: 'شناسه تلگرام و پارامتر startapp الزامی است' },
        { status: 400 }
      );
    }

    const referral = await ReferralService.processStartAppParam(Number(telegramID), startAppParam);

    if (!referral) {
      return NextResponse.json({
        success: false,
        message: 'پارامتر رفرال نامعتبر است یا کاربر قبلاً معرفی شده'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'رفرال با موفقیت ثبت شد',
      referral
    });

  } catch (error) {
    console.error('❌ خطا در پردازش رفرال:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در پردازش رفرال',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
