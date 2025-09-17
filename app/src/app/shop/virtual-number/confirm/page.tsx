'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckmarkIcon from '../../../../../public/icons/checkmark-icon';
import Cash01Icon from '../../../../../public/icons/cash-01-stroke-rounded';
import { useVirtualNumbers } from '@/hooks/useVirtualNumbers';
import { useWallet } from '@/hooks/useWallet';

function ConfirmSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryName, setCountryName] = useState('');
  const [countryPrice, setCountryPrice] = useState(0);
  const [countryId, setCountryId] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [imageError, setImageError] = useState(false);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  
  // دریافت داده‌ها از API
  const { countries, loading, error } = useVirtualNumbers(1);
  const { walletData, loading: balanceLoading } = useWallet();

  useEffect(() => {
    const name = searchParams.get('countryName');
    const price = searchParams.get('price');
    const id = searchParams.get('countryId');

    console.log('🔍 URL Params:', { name, price, id });

    if (name) setCountryName(decodeURIComponent(name));
    if (price) setCountryPrice(parseInt(price));
    if (id) setCountryId(id);
  }, [searchParams]);

  // دریافت درصد سود از تنظیمات سیستم
  useEffect(() => {
    const fetchProfitPercentage = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (data.success) {
          const virtualNumberSetting = data.data.find((setting: any) => 
            setting.setting_key === 'virtual_number_profit_percentage'
          );
          if (virtualNumberSetting) {
            setProfitPercentage(parseFloat(virtualNumberSetting.setting_value) || 0);
          }
        }
      } catch (error) {
        console.error('خطا در دریافت درصد سود:', error);
      }
    };

    fetchProfitPercentage();
  }, []);

  // قیمت از قبل در URL آمده - نیازی به دریافت مجدد نیست

  // پیدا کردن کشور بر اساس نام برای دریافت پرچم
  useEffect(() => {
    if (countryName && countries.length > 0) {
      const country = countries.find(c => c.name === countryName);
      if (country) {
        setCountryFlag(country.flag);
        console.log('🏳️ Found country by name:', country.name, 'Flag URL:', country.flag);
      } else {
        console.log('❌ Country not found for name:', countryName);
        console.log('📋 Available countries:', countries.map(c => ({ name: c.name, flag: c.flag })));
      }
    }
  }, [countryName, countries]);

  const formatPrice = (price: number) => {
    // اضافه کردن درصد سود به قیمت
    const priceWithProfit = price + (price * profitPercentage / 100);
    return priceWithProfit.toLocaleString('en-US');
  };

  const handleBackToSelection = () => {
    router.push('/shop/virtual-number');
  };

  const handleProceedToPurchase = () => {
    // محاسبه قیمت با سود
    const priceWithProfit = countryPrice + (countryPrice * profitPercentage / 100);
    
    // Navigate to purchase page to complete the actual purchase
    router.push(`/shop/virtual-number/purchase?countryId=${countryId}&countryName=${encodeURIComponent(countryName)}&price=${Math.round(priceWithProfit)}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 pt-4 pb-6">
        <div className="max-w-md mx-auto">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8794a1' }}>در حال بارگذاری...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm mb-2">خطا در دریافت داده‌ها:</p>
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Country Info Header - Similar to Profile */}
          {!loading && !error && (
            <div className="mb-6">
            <div className="flex items-center gap-3">
               {/* Flag Avatar */}
               <div className="w-20 h-14 rounded-lg overflow-hidden border-2"
                    style={{ 
                      backgroundColor: 'var(--bg-color)',
                      borderColor: 'var(--inactive-color)'
                    }}>
                 {countryFlag && !imageError ? (
                   <img 
                     src={countryFlag}
                     alt={`پرچم ${countryName}`}
                     className="w-full h-full object-cover"
                     onError={() => {
                       console.log('❌ Flag image failed to load:', countryFlag);
                       setImageError(true);
                     }}
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-2xl">
                     🏳️
                   </div>
                 )}
               </div>
              
               {/* Country Info Text */}
               <div className="flex-1 text-right">
                 <div className="flex items-center justify-between mb-1">
                   <div className="text-lg font-light text-white">
                     {countryName}
                   </div>
                   <div className="text-lg font-light text-white">
                     {formatPrice(countryPrice)} <span className="text-sm" style={{ color: 'var(--field-accent-color)' }}>تومان</span>
                   </div>
                 </div>
                 <div className="text-xs text-gray-400">
                   کشور انتخاب شده برای شماره مجازی
                 </div>
               </div>
             </div>
           </div>
          )}

          {/* Wallet Balance Check */}
          {!loading && !error && (
            <div className="mb-4">
              <div className="p-3 rounded-lg" 
                   style={{ 
                     backgroundColor: 'var(--field-bg-color)',
                     border: '1px solid var(--border-color)'
                   }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                    <span className="text-sm text-white">موجودی شما:</span>
                    <span className="text-sm font-semibold text-white">
                      {balanceLoading ? '...' : `${(walletData?.balance ? Math.floor(walletData.balance / 10) : 0).toLocaleString('fa-IR')} تومان`}
                    </span>
                  </div>
                  
                  {!balanceLoading && walletData && (
                    <div className="flex items-center gap-2">
                      {(walletData.balance || 0) >= ((countryPrice + (countryPrice * profitPercentage / 100)) * 10) ? (
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                          <CheckmarkIcon size={14} color="#22c55e" />
                          <span>کافی است</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push('/charge')}
                          className="px-3 py-1 text-xs rounded-lg font-medium transition-colors duration-200"
                          style={{ 
                            backgroundColor: 'var(--field-accent-color)',
                            color: 'white'
                          }}
                        >
                          شارژ حساب
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Important Notes */}
          {!loading && !error && (
            <div className="mb-4 space-y-2">
              {/* Note 1: Guarantee */}
              <div className="p-3 rounded-lg" 
                   style={{ 
                     backgroundColor: 'rgba(34, 197, 94, 0.08)',
                     border: '1px solid rgba(34, 197, 94, 0.15)'
                   }}>
                <div className="flex items-start gap-2">
                  <CheckmarkIcon size={16} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white mb-1">تضمین کیفیت</p>
                    <p className="text-xs" style={{ color: '#22c55e' }}>
                      تمام شماره‌ها <strong>تضمین شده</strong> هستند و <strong>کددهی قطعی</strong> می‌باشد
                    </p>
                  </div>
                </div>
              </div>

              {/* Note 2: Login Duration */}
              <div className="p-3 rounded-lg" 
                   style={{ 
                     backgroundColor: 'rgba(59, 130, 246, 0.08)',
                     border: '1px solid rgba(59, 130, 246, 0.15)'
                   }}>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs text-white">i</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-1">مدت زمان دسترسی</p>
                    <p className="text-xs" style={{ color: '#3b82f6' }}>
                      بعد از <strong>ورود</strong> می‌توانید تا زمانی که ربات در اکانت <strong>لاگین</strong> است کد دریافت کنید. برای <strong>خروج ربات</strong> از اکانت از بخش <strong>تاریخچه</strong> استفاده کنید
                    </p>
                  </div>
                </div>
              </div>

              {/* Note 3: Price Warning */}
              <div className="p-3 rounded-lg" 
                   style={{ 
                     backgroundColor: 'rgba(245, 158, 11, 0.08)',
                     border: '1px solid rgba(245, 158, 11, 0.15)'
                   }}>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs text-white">!</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-1">هشدار کیفیت</p>
                    <p className="text-xs" style={{ color: '#f59e0b' }}>
                      شماره‌های زیر <strong>100 هزار تومان</strong> ممکن است <strong>ریپورت</strong> باشند و <strong>کیفیت کمتری</strong> دارند
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleProceedToPurchase}
              disabled={!balanceLoading && !!walletData && (walletData.balance || 0) < ((countryPrice + (countryPrice * profitPercentage / 100)) * 10)}
              className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: (!balanceLoading && !!walletData && (walletData.balance || 0) < ((countryPrice + (countryPrice * profitPercentage / 100)) * 10)) 
                  ? 'var(--inactive-color)' 
                  : 'var(--field-accent-color)',
                border: '1px solid ' + ((!balanceLoading && !!walletData && (walletData.balance || 0) < ((countryPrice + (countryPrice * profitPercentage / 100)) * 10)) 
                  ? 'var(--inactive-color)' 
                  : 'var(--field-accent-color)')
              }}
            >
              ادامه و خرید
            </button>
            
            <button
              onClick={handleBackToSelection}
              className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--field-bg-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              تغییر کشور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmSelectionPage() {
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
      <ConfirmSelectionContent />
    </Suspense>
  );
}
