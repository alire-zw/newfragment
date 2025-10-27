'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Cash01Icon from '../../../../public/icons/cash-01-stroke-rounded';
import CheckmarkIcon from '../../../../public/icons/checkmark-icon';
import UserStrokeRoundedIcon from '../../../../public/icons/user-stroke-rounded';

function PremiumSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [transactionData, setTransactionData] = useState<{
    months: string;
    price: string;
    recipientName: string;
    recipientUsername: string;
    recipientPhoto: string;
    address: string;
    amount: string;
    payload: string;
    successPageId: string;
  } | null>(null);

  useEffect(() => {
    // استخراج پارامترها از URL
    const months = searchParams.get('months');
    const price = searchParams.get('price');
    const recipientName = searchParams.get('recipientName');
    const recipientUsername = searchParams.get('recipientUsername');
    const recipientPhoto = searchParams.get('recipientPhoto');
    const address = searchParams.get('address');
    const amount = searchParams.get('amount');
    const payload = searchParams.get('payload');
    const successPageId = searchParams.get('successPageId');

    if (months && price && recipientName && recipientUsername && address && amount && payload) {
      setTransactionData({
        months,
        price,
        recipientName: decodeURIComponent(recipientName),
        recipientUsername: decodeURIComponent(recipientUsername),
        recipientPhoto: recipientPhoto ? decodeURIComponent(recipientPhoto) : '',
        address: decodeURIComponent(address),
        amount: decodeURIComponent(amount),
        payload: decodeURIComponent(payload),
        successPageId: successPageId || ''
      });
      
      // Trigger wallet update event
      window.dispatchEvent(new CustomEvent('walletUpdated'));
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString('fa-IR');
  };

  const formatMonths = (months: string) => {
    const monthNum = parseInt(months);
    if (monthNum === 3) return '3 ماهه';
    if (monthNum === 6) return '6 ماهه';
    if (monthNum === 12) return '1 ساله';
    return `${months} ماهه`;
  };

  const getSafeImageUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('//')) {
        return `https:${url}`;
      }
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
  };

  const handleBackToPremium = () => {
    router.push('/premium');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">×</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">خطا در دریافت اطلاعات تراکنش</h1>
          <p className="text-gray-400 mb-4">اطلاعات تراکنش یافت نشد</p>
          <button
            onClick={handleBackToPremium}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            بازگشت به خرید پریمیوم
          </button>
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
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckmarkIcon size={32} color="white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              تراکنش تایید شد!
            </h1>
            <p className="text-sm text-gray-400">
              خرید پریمیوم با موفقیت تکمیل شد
            </p>
          </div>

          {/* Transaction Details */}
          <div className="mb-6 p-4 rounded-lg" style={{ 
            backgroundColor: 'var(--field-bg-color)',
            border: '1px solid var(--border-color)'
          }}>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">جزئیات تراکنش</h3>
            
            <div className="space-y-4">

              {/* Package Info */}
              <div className="p-3 rounded-lg" style={{ 
                backgroundColor: '#1a2026',
                border: '1px solid var(--dropdown-bg-hover-color, #384553)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/icons/Telegram_Premium.png" 
                      alt="Premium" 
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-white">پکیج خریداری شده:</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatMonths(transactionData.months)}
                  </span>
                </div>
              </div>

              {/* Price Info */}
              <div className="p-3 rounded-lg" style={{ 
                backgroundColor: '#1a2026',
                border: '1px solid var(--dropdown-bg-hover-color, #384553)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                    <span className="text-sm text-white">مبلغ پرداخت:</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatPrice(transactionData.price)} تومان
                  </span>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="flex flex-row-reverse items-center gap-3 p-3 rounded-lg" style={{ 
                backgroundColor: '#1a2026',
                border: '1px solid var(--dropdown-bg-hover-color, #384553)'
              }}>
                {transactionData.recipientPhoto && (
                  <img
                    src={getSafeImageUrl(transactionData.recipientPhoto)}
                    alt={transactionData.recipientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium" style={{ color: 'var(--field-color, #ffffff)' }}>
                    {transactionData.recipientName}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-color, #8794a1)' }}>
                    {transactionData.recipientUsername}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-lg" 
                   style={{ 
                     backgroundColor: 'rgba(34, 197, 94, 0.08)',
                     border: '1px solid rgba(34, 197, 94, 0.15)'
                   }}>
                <div className="flex items-start gap-2">
                  <CheckmarkIcon size={16} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white mb-1">وضعیت فعال‌سازی</p>
                    <p className="text-xs" style={{ color: '#22c55e' }}>
                      اشتراک پریمیوم شما فعال شده است
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBackToPremium}
              className="py-1.5 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-sm"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: `1px solid var(--field-accent-color)`
              }}
            >
              خرید پریمیوم بیشتر
            </button>
            
            <button
              onClick={handleViewHistory}
              className="py-1.5 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-sm"
              style={{ 
                backgroundColor: 'var(--field-bg-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              مشاهده تاریخچه تراکنش‌ها
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <PremiumSuccessContent />
    </Suspense>
  );
}