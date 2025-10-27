'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isTelegramWebApp, getTelegramWebApp } from '@/utils/telegram';
import CheckmarkIcon from '../../../../public/icons/checkmark-icon';
import Cash01Icon from '../../../../public/icons/cash-01-stroke-rounded';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const amountParam = searchParams.get('amount');
    const trackIdParam = searchParams.get('trackId');

    console.log('🔍 Callback params:', { success, error, amountParam, trackIdParam });

    if (success === 'true' && amountParam) {
      setStatus('success');
      setAmount(parseInt(amountParam));
      setTrackId(trackIdParam);
      setMessage(`پرداخت ${formatAmount(parseInt(amountParam))} تومان با موفقیت انجام شد!`);
      
      // Trigger wallet update event
      window.dispatchEvent(new CustomEvent('walletUpdated'));
    } else if (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));
    } else {
      setStatus('error');
      setMessage('خطا در پردازش پرداخت');
    }
  }, [searchParams]);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'missing_track_id': 'شناسه تراکنش یافت نشد',
      'payment_failed': 'پرداخت ناموفق بود',
      'verification_failed': 'تایید پرداخت ناموفق بود',
      'server_error': 'خطا در سرور',
      'timeout': 'زمان پرداخت به پایان رسید',
      'cancelled': 'پرداخت لغو شد'
    };
    
    return errorMessages[error] || 'خطای ناشناخته در پرداخت';
  };

  const handleBackToCharge = () => {
    if (isTelegramWebApp()) {
      // در مینی اپ تلگرام، به ربات برگرد
      const tg = getTelegramWebApp();
      if (tg && typeof tg.close === 'function') {
        tg.close();
      }
    } else {
      // در مرورگر عادی، به صفحه شارژ برگرد
      router.push('/charge');
    }
  };

  const handleViewHistory = () => {
    if (isTelegramWebApp()) {
      // در مینی اپ تلگرام، به ربات برگرد
      const tg = getTelegramWebApp();
      if (tg && typeof tg.close === 'function') {
        tg.close();
      }
    } else {
      // در مرورگر عادی، به صفحه تاریخچه برگرد
      router.push('/history');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال پردازش پرداخت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
          {/* Transaction Confirmation Status */}
          <div className="text-center mb-6">
            {status === 'success' ? (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckmarkIcon size={32} color="white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">×</span>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {status === 'success' ? 'پرداخت موفق!' : 'پرداخت ناموفق'}
            </h1>
            <p className="text-sm text-gray-400">
              {status === 'success' ? 'شارژ حساب با موفقیت تکمیل شد' : 'پرداخت انجام نشد'}
            </p>
            {isTelegramWebApp() && status === 'success' && (
              <p className="text-xs text-blue-400 mt-2">
                در حال بازگشت به ربات تلگرام...
              </p>
            )}
          </div>

          {/* Transaction Details */}
          {status === 'success' && (
            <div className="mb-6 p-4 rounded-lg" style={{ 
              backgroundColor: 'var(--field-bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 className="text-lg font-semibold text-white mb-4 text-center">جزئیات تراکنش</h3>
              
              <div className="space-y-4">

                {/* Amount Info */}
                <div className="p-3 rounded-lg" style={{ 
                  backgroundColor: '#1a2026',
                  border: '1px solid var(--dropdown-bg-hover-color, #384553)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                      <span className="text-sm text-white">مبلغ واریز شده:</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {amount ? `${formatAmount(Math.floor(amount / 10))} تومان` : 'نامشخص'}
                    </span>
                  </div>
                </div>

                {/* Track ID */}
                {trackId && (
                  <div className="p-3 rounded-lg" style={{ 
                    backgroundColor: '#1a2026',
                    border: '1px solid var(--dropdown-bg-hover-color, #384553)'
                  }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">شناسه تراکنش:</span>
                      <span className="font-mono text-xs text-white break-all">
                        {trackId}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Note */}
                <div className="p-3 rounded-lg" 
                     style={{ 
                       backgroundColor: 'rgba(34, 197, 94, 0.08)',
                       border: '1px solid rgba(34, 197, 94, 0.15)'
                     }}>
                  <div className="flex items-start gap-2">
                    <CheckmarkIcon size={16} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white mb-1">وضعیت واریز</p>
                      <p className="text-xs" style={{ color: '#22c55e' }}>
                        مبلغ بلافاصله به حساب شما واریز شده است
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {status === 'error' && (
            <div className="mb-6 p-4 rounded-lg" style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #ef4444'
            }}>
              <h3 className="text-lg font-semibold text-red-800 mb-2">جزئیات خطا</h3>
              <p className="text-red-600">{message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBackToCharge}
              className="py-1.5 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-sm"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: `1px solid var(--field-accent-color)`
              }}
            >
              {isTelegramWebApp() ? 'بازگشت به ربات' : (status === 'success' ? 'شارژ مجدد' : 'تلاش مجدد')}
            </button>
            
            <button
              onClick={handleViewHistory}
              className="py-1.5 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-sm"
              style={{ 
                backgroundColor: 'var(--field-bg-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              {isTelegramWebApp() ? 'مشاهده تاریخچه' : 'مشاهده تاریخچه تراکنش‌ها'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <div className="w-16 h-16 border-4 border-transparent border-t-4 rounded-full animate-spin" 
                     style={{ borderTopColor: 'var(--field-accent-color)' }}></div>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                در حال بارگذاری...
              </h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}