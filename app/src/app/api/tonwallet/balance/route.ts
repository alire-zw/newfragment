import { NextRequest, NextResponse } from 'next/server';
import WalletService from '@/services/WalletService';

interface TonWalletBalanceResponse {
  success: boolean;
  data?: {
    balance: number;
    balanceFormatted: string;
    address: string;
    currency: string;
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const apiKey = searchParams.get('apiKey');

    // ایجاد سرویس ولت با کلیدهای پیش‌فرض
    const walletService = new WalletService(apiKey || undefined);

    let targetAddress: string;

    if (address) {
      // اگر آدرس مشخص شده، از آن استفاده کن
      targetAddress = address;
    } else {
      // در غیر این صورت از آدرس پیش‌فرض استفاده کن
      targetAddress = walletService.getDefaultAddress();
    }

    // دریافت موجودی
    const balance = await walletService.getBalance(targetAddress);

    return NextResponse.json({
      success: true,
      data: {
        balance: balance,
        balanceFormatted: `${balance.toFixed(4)} TON`,
        address: targetAddress,
        currency: 'TON'
      }
    } as TonWalletBalanceResponse);

  } catch (error) {
    console.error('Get TON wallet balance error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطا در دریافت موجودی ولت'
    } as TonWalletBalanceResponse, { status: 500 });
  }
}

// POST endpoint برای دریافت موجودی با پارامترهای مختلف
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, apiKey, mnemonic } = body;

    // ایجاد سرویس ولت
    const walletService = new WalletService(apiKey);

    let targetAddress: string;

    if (address) {
      targetAddress = address;
    } else if (mnemonic && Array.isArray(mnemonic) && mnemonic.length === 24) {
      // اگر mnemonic داده شده، آدرس را از آن محاسبه کن
      targetAddress = await walletService.getCurrentAddress();
    } else {
      // در غیر این صورت از آدرس پیش‌فرض استفاده کن
      targetAddress = walletService.getDefaultAddress();
    }

    // دریافت موجودی
    const balance = await walletService.getBalance(targetAddress);

    return NextResponse.json({
      success: true,
      data: {
        balance: balance,
        balanceFormatted: `${balance.toFixed(4)} TON`,
        address: targetAddress,
        currency: 'TON'
      }
    } as TonWalletBalanceResponse);

  } catch (error) {
    console.error('Get TON wallet balance error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطا در دریافت موجودی ولت'
    } as TonWalletBalanceResponse, { status: 500 });
  }
}
