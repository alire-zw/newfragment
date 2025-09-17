import { NextRequest, NextResponse } from 'next/server';
import WalletService from '@/services/WalletService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload) {
      return NextResponse.json({
        success: false,
        error: 'Payload الزامی است'
      }, { status: 400 });
    }

    const walletService = new WalletService();
    const result = walletService.testPayloadConversion(payload);

    return NextResponse.json({
      success: result.success,
      data: {
        payload: payload,
        cellSize: result.cell ? result.cell.bits.length : 0,
        cellRefs: result.cell ? result.cell.refs.length : 0
      },
      error: result.error
    });

  } catch (error) {
    console.error('Test payload error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطای داخلی سرور'
    }, { status: 500 });
  }
}
