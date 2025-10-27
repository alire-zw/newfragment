'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useWallet } from '@/hooks/useWallet';
// Icons removed - not used

interface PurchaseData {
  virtualNumberID: string;
  number: string;
  request_id: string;
  country: string;
  range: string;
  price: number;
  service: string;
  quality: string;
}

function PurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userInfo } = useTelegramUser();
  const { walletData, loading: balanceLoading } = useWallet();
  
  const [countryName, setCountryName] = useState('');
  const [countryPrice, setCountryPrice] = useState(0);
  const [countryId, setCountryId] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseData | null>(null);
  const [error, setError] = useState('');

  const formatPrice = (price: number) => {
    return Math.floor(price).toLocaleString('fa-IR');
  };

  const handlePurchase = useCallback(async () => {
    if (!userInfo) {
      setError('کاربر یافت نشد');
      return;
    }

    setIsPurchasing(true);
    setError('');

    try {
      const { apiPost } = await import('@/utils/api');
      
      const data = await apiPost('/api/virtual-numbers/purchase', {
        userTelegramID: userInfo.id,
        countryId: countryId,
        countryName: countryName,
        price: countryPrice
      });

      if (data.success) {
        setPurchaseResult(data.data);
        
        // Trigger wallet update event
        window.dispatchEvent(new CustomEvent('walletUpdated'));
        
        // The redirect will happen automatically in the render function
      } else {
        setError(data.error || 'خطا در خرید');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsPurchasing(false);
    }
  }, [userInfo, countryId, countryName, countryPrice, router]);

  useEffect(() => {
    const name = searchParams.get('countryName');
    const price = searchParams.get('price');
    const id = searchParams.get('countryId');
    
    if (name) setCountryName(decodeURIComponent(name));
    if (price) setCountryPrice(parseInt(price));
    if (id) setCountryId(id);
  }, [searchParams]);

  // خرید خودکار حذف شد - باید کاربر روی دکمه کلیک کنه

  const handleBackToConfirm = () => {
    router.push(`/shop/virtual-number/confirm?countryId=${countryId}&countryName=${encodeURIComponent(countryName)}&price=${countryPrice}`);
  };

  const handleViewNumbers = () => {
    router.push('/profile'); // یا صفحه نمایش شماره‌های مجازی
  };

  // Redirect to success page when purchase is successful
  useEffect(() => {
    if (purchaseResult) {
      router.push(`/shop/virtual-number/success?number=${encodeURIComponent(purchaseResult.number)}&request_id=${purchaseResult.request_id}&price=${purchaseResult.price}&country=${encodeURIComponent(purchaseResult.country)}&range=${purchaseResult.range}&service=${encodeURIComponent(purchaseResult.service)}&quality=${encodeURIComponent(purchaseResult.quality)}&virtualNumberID=${purchaseResult.virtualNumberID}&userTelegramID=${userInfo?.id}`);
    }
  }, [purchaseResult, router, userInfo]);

  // اگر خرید موفق بود، loading نمایش بده
  if (purchaseResult) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <div className="w-16 h-16 border-4 border-transparent border-t-4 rounded-full animate-spin" 
                     style={{ borderTopColor: 'var(--field-accent-color)' }}></div>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                خرید موفق! در حال انتقال...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">تأیید نهایی خرید</h1>
            <p className="text-sm text-gray-400">
              خرید شماره مجازی {countryName} به مبلغ {formatPrice(countryPrice)} تومان
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg border mb-4"
                 style={{ 
                   backgroundColor: 'rgba(239, 68, 68, 0.1)',
                   borderColor: 'rgba(239, 68, 68, 0.3)'
                 }}>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => router.push('/shop/virtual-number')}
                className="mt-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--field-accent-color)',
                  color: 'white'
                }}
              >
                بازگشت به فروشگاه
              </button>
            </div>
          )}

          {/* Purchase Button */}
          {!error && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg text-center"
                   style={{ 
                     backgroundColor: 'var(--field-bg-color)',
                     border: '1px solid var(--border-color)'
                   }}>
                <h3 className="text-lg font-semibold text-white mb-2">آیا مطمئن هستید؟</h3>
                <p className="text-sm text-gray-400 mb-4">
                  شماره مجازی {countryName} به مبلغ {formatPrice(countryPrice)} تومان از موجودی شما کسر خواهد شد
                </p>
                
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: isPurchasing ? 'var(--inactive-color)' : 'var(--field-accent-color)',
                    border: `1px solid ${isPurchasing ? 'var(--inactive-color)' : 'var(--field-accent-color)'}`
                  }}
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال خرید...</span>
                    </div>
                  ) : (
                    'تأیید و خرید'
                  )}
                </button>
              </div>

              <button
                onClick={handleBackToConfirm}
                className="w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  border: '1px solid var(--border-color)'
                }}
              >
                بازگشت به تأیید
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PurchasePage() {
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
      <PurchaseContent />
    </Suspense>
  );
}
