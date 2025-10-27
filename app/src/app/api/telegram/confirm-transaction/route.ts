import { NextRequest, NextResponse } from 'next/server';
import WalletService from '@/services/WalletService';

interface ConfirmTransactionRequest {
  transaction: {
    address: string;
    amount: string;
    payload: string;
  };
  mnemonic?: string[];
  apiKey?: string;
  transactionId?: string; // شناسه منحصر به فرد تراکنش
}

interface ConfirmTransactionResponse {
  success: boolean;
  data?: {
    txHash: string;
    message: string;
  };
  error?: string;
}

// کش سرور را حذف کردیم تا از تکرار تراکنش‌ها جلوگیری کنیم
// فقط از کش کلاینت استفاده می‌کنیم

export async function POST(request: NextRequest) {
  let body: ConfirmTransactionRequest | null = null;
  
  try {
    console.log('🚀 [CONFIRM-TRANSACTION] Starting transaction confirmation request');
    
    body = await request.json();
    if (!body) {
      return NextResponse.json({
        success: false,
        error: 'بدنه درخواست خالی است'
      } as ConfirmTransactionResponse, { status: 400 });
    }
    
    const { transaction, mnemonic, apiKey, transactionId } = body;

    console.log('📥 [CONFIRM-TRANSACTION] Request data:', {
      hasTransaction: !!transaction,
      hasMnemonic: !!mnemonic,
      hasApiKey: !!apiKey,
      hasTransactionId: !!transactionId,
      transactionAddress: transaction?.address,
      transactionAmount: transaction?.amount,
      payloadLength: transaction?.payload?.length
    });

    // اعتبارسنجی ورودی
    if (!transaction || !transaction.address || !transaction.amount || !transaction.payload) {
      console.error('❌ [CONFIRM-TRANSACTION] Invalid input data:', {
        hasAddress: !!transaction?.address,
        hasAmount: !!transaction?.amount,
        hasPayload: !!transaction?.payload
      });
      
      return NextResponse.json({
        success: false,
        error: 'اطلاعات تراکنش ناقص است'
      } as ConfirmTransactionResponse, { status: 400 });
    }

    // ایجاد شناسه تراکنش اگر ارائه نشده
    const finalTransactionId = transactionId || 
      btoa(`${transaction.address}_${transaction.amount}_${transaction.payload}_${Date.now()}`)
        .replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);

    console.log('🔍 [CONFIRM-TRANSACTION] Transaction ID:', finalTransactionId);

    console.log('✅ [CONFIRM-TRANSACTION] Input validation passed, processing new transaction');

    // ایجاد سرویس ولت با کلیدهای پیش‌فرض
    const walletService = new WalletService(apiKey);
    console.log('🔧 [CONFIRM-TRANSACTION] WalletService created with API key:', !!apiKey);
    
    // اگر کلیدهای سفارشی ارائه شده، از آنها استفاده کن
    if (mnemonic && Array.isArray(mnemonic) && mnemonic.length === 24) {
      console.log('🔑 [CONFIRM-TRANSACTION] Using custom mnemonic (24 words)');
      walletService.setWalletConfig(mnemonic, apiKey || process.env.TON_API_KEY || '');
    } else {
      console.log('🔑 [CONFIRM-TRANSACTION] Using default wallet configuration');
    }

    console.log('💰 [CONFIRM-TRANSACTION] Transaction details:', {
      address: transaction.address,
      amount: transaction.amount,
      payloadPreview: transaction.payload.substring(0, 50) + '...',
      payloadLength: transaction.payload.length
    });

    // تایید تراکنش
    console.log('🔄 [CONFIRM-TRANSACTION] Calling confirmStarsTransaction...');
    const result = await walletService.confirmStarsTransaction(transaction);

    console.log('📊 [CONFIRM-TRANSACTION] Transaction result:', {
      success: result.success,
      txHash: result.txHash,
      error: result.error
    });

    if (result.success) {
      console.log('✅ [CONFIRM-TRANSACTION] Transaction confirmed successfully');
      
      const successResponse: ConfirmTransactionResponse = {
        success: true,
        data: {
          txHash: result.txHash || 'pending',
          message: 'تراکنش با موفقیت ارسال شد'
        }
      };
      
      // کش سرور حذف شد - فقط از کش کلاینت استفاده می‌کنیم
      
      return NextResponse.json(successResponse);
    } else {
      console.error('❌ [CONFIRM-TRANSACTION] Transaction confirmation failed:', result.error);
      
      const errorResponse: ConfirmTransactionResponse = {
        success: false,
        error: result.error || 'خطا در تایید تراکنش'
      };
      
      // کش سرور حذف شد - فقط از کش کلاینت استفاده می‌کنیم
      
      return NextResponse.json(errorResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [CONFIRM-TRANSACTION] Unexpected error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse: ConfirmTransactionResponse = {
      success: false,
      error: 'خطای داخلی سرور'
    };
    
    // کش سرور حذف شد - فقط از کش کلاینت استفاده می‌کنیم
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET endpoint برای دریافت وضعیت تراکنش
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');
    const apiKey = searchParams.get('apiKey');

    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: 'شناسه تراکنش الزامی است'
      }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'کلید API الزامی است'
      }, { status: 400 });
    }

    const walletService = new WalletService(apiKey);
    const status = await walletService.getTransactionStatus(txHash);

    return NextResponse.json({
      success: status.success,
      data: {
        confirmed: status.confirmed,
        txHash: txHash
      },
      error: status.error
    });

  } catch (error) {
    console.error('Get transaction status error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطای داخلی سرور'
    }, { status: 500 });
  }
}
