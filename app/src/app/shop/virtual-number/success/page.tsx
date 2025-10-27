'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckmarkIcon from '../../../../../public/icons/checkmark-icon';
import Cash01Icon from '../../../../../public/icons/cash-01-stroke-rounded';
import PackageDeliveredIcon from '../../../../../public/icons/package-delivered-stroke-rounded';
import NotificationSquareIcon from '../../../../../public/icons/notification-square-stroke-rounded';
import ArrowDataTransferVerticalIcon from '../../../../../public/icons/arrow-data-transfer-vertical-stroke-rounded';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [virtualNumberData, setVirtualNumberData] = useState({
    number: '',
    request_id: '',
    price: 0,
    country: '',
    range: '',
    service: '',
    quality: '',
    userTelegramID: null as number | null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [virtualNumberID, setVirtualNumberID] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [displayCode, setDisplayCode] = useState<string>('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', hiding: false });

  useEffect(() => {
    // دریافت داده‌ها از URL parameters
    const number = searchParams.get('number');
    const request_id = searchParams.get('request_id');
    const price = searchParams.get('price');
    const country = searchParams.get('country');
    const range = searchParams.get('range');
    const service = searchParams.get('service');
    const quality = searchParams.get('quality');
    const userTelegramID = searchParams.get('userTelegramID');
    const virtualNumberID = searchParams.get('virtualNumberID');

    if (number && request_id && price && country && range && service && quality) {
      setVirtualNumberData({
        number,
        request_id,
        price: parseInt(price),
        country,
        range,
        service,
        quality,
        userTelegramID: userTelegramID ? parseInt(userTelegramID) : null
      });
      // استفاده از virtualNumberID از URL parameters
      if (virtualNumberID) {
        console.log('🔍 Using virtualNumberID from URL:', virtualNumberID);
        setVirtualNumberID(virtualNumberID);
      } else {
        // اگر virtualNumberID موجود نباشد، از request_id تولید می‌کنیم
        console.log('⚠️ virtualNumberID not found in URL, generating from request_id:', request_id);
        setVirtualNumberID(`VN_${request_id}`);
      }
      setLoading(false);
    } else {
      // اگر داده‌ها کامل نباشند، خطا نمایش داده می‌شود
      setError('داده‌های شماره مجازی ناقص است');
      setLoading(false);
    }
  }, [searchParams]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
        clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
      }
    };
  }, []);

  const formatPrice = (price: number) => {
    return Math.floor(price).toLocaleString('fa-IR');
  };

  // تابع بستن notification
  const hideNotification = () => {
    if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
      clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
    }
    
    setNotification(prev => ({ ...prev, hiding: true }));
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false, hiding: false }));
    }, 400);
  };

  // تابع نمایش notification
  const showNotification = (message: string, type = 'success') => {
    if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
      clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
    }
    
    setNotification({ show: true, message, type, hiding: false });
    
    (window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer = setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  const formatPhoneNumber = (phoneNumber: string, countryCode?: string) => {
    // حذف کاراکترهای غیر عددی
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length < 10) {
      return phoneNumber;
    }

    let detectedCountryCode = '';
    let remaining = '';

    // اگر کد کشور از پارامتر ورودی موجود باشد، از آن استفاده کن
    if (countryCode) {
      const numericCountryCode = countryCode.replace(/\D/g, '');
      if (cleaned.startsWith(numericCountryCode)) {
        detectedCountryCode = numericCountryCode;
        remaining = cleaned.slice(numericCountryCode.length);
      }
    }

    // اگر کد کشور تشخیص داده نشد، از روش قبلی استفاده کن
    if (!detectedCountryCode) {
      // تشخیص کد کشور بر اساس طول و الگوهای رایج
      if (cleaned.length >= 12) {
        // کدهای 3 رقمی (مثل 880 برای بنگلادش، 977 برای نپال)
        if (cleaned.startsWith('880') || cleaned.startsWith('977') || cleaned.startsWith('977')) {
          detectedCountryCode = cleaned.slice(0, 3);
          remaining = cleaned.slice(3);
        } else {
          // کدهای 2 رقمی
          detectedCountryCode = cleaned.slice(0, 2);
          remaining = cleaned.slice(2);
        }
      } else if (cleaned.length === 11) {
        // کدهای 2 رقمی (مثل 15 برای آمریکا)
        detectedCountryCode = cleaned.slice(0, 2);
        remaining = cleaned.slice(2);
      } else if (cleaned.length === 10) {
        // کدهای 1 رقمی (مثل 1 برای آمریکا)
        detectedCountryCode = cleaned.slice(0, 1);
        remaining = cleaned.slice(1);
      }
    }

    // فرمت کردن باقی‌مانده شماره
    // 4 رقم آخر را جدا می‌کنیم
    const lastFour = remaining.slice(-4);
    const beforeLastFour = remaining.slice(0, -4);
    
    // تقسیم قسمت قبل از 4 رقم آخر به گروه‌های 3 تایی
    const groups = [];
    for (let i = 0; i < beforeLastFour.length; i += 3) {
      groups.push(beforeLastFour.slice(i, i + 3));
    }
    
    // ترکیب نهایی
    const formattedRemaining = groups.length > 0 ? `${groups.join(' ')} ${lastFour}` : lastFour;
    
    return `+${detectedCountryCode} ${formattedRemaining}`;
  };

  const handleGetCode = async () => {
    if (!virtualNumberID) {
      showNotification('خطا در شناسه شماره مجازی. لطفاً صفحه را مجدداً بارگذاری کنید.', 'error');
      return;
    }

    try {
      setCodeLoading(true);
      
      // ارسال درخواست دریافت کد به API
      const requestData = {
        virtualNumberID
      };
      
      console.log('📤 Sending get-code request:', requestData);
      
      const { apiPost } = await import('@/utils/api');
      const result = await apiPost<any>('/api/virtual-numbers/get-code', requestData);

      if (result.success) {
        setReceivedCode(result.data.code);
        setDisplayCode(result.data.code);
        console.log('✅ Code received successfully:', result.data.code);
      } else {
        console.error('❌ Error receiving code:', result.message);
        
        // اگر کد هنوز آماده نیست، پیام مناسب نمایش داده می‌شود
        if (result.data?.status === 'waiting') {
          showNotification(`⏳ ${result.message}`, 'warning');
        } else {
          showNotification(`خطا در دریافت کد: ${result.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('خطا در دریافت کد:', error);
      showNotification('خطا در ارتباط با سرور', 'error');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleBackToShop = () => {
    router.push('/shop/virtual-number');
  };

  const handleGoToHistory = () => {
    router.push('/history');
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    showNotification('در حال توسعه است', 'info');
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(virtualNumberData.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('خطا در کپی کردن:', err);
    }
  };

  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: 'IRANYekanX';
          src: url('/fonts/IRANYekanMobileRegular.woff') format('woff');
          font-weight: normal;
          font-style: normal;
        }
        
        .notification {
          position: fixed;
          top: -100px;
          left: 12px;
          right: 12px;
          background: var(--field-bg-color);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--inactive-color);
          color: var(--field-color);
          padding: 10px 13px;
          border-radius: 15px;
          font-size: 14px;
          font-weight: 400;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          direction: rtl;
          font-family: 'IRANYekanX', tahoma, Arial, sans-serif;
          text-align: right;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          pointer-events: auto;
          transform: translateY(-20px) scale(0.95);
          opacity: 0;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .notification:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }
        
        .notification:active {
          transform: translateY(0) scale(0.98);
        }
        
        .notification.show {
          top: 20px;
          transform: translateY(0) scale(1);
          opacity: 1;
          animation: slideInFromTop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          50% {
            transform: translateY(5px) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToTop {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-30px) scale(0.9);
            opacity: 0;
          }
        }
        
        .notification.hide {
          animation: slideOutToTop 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        .notification.telegram {
          top: 10px;
        }
        
        .notification.telegram.show {
          top: 10px;
        }
        
        .notification::before {
          content: '';
          position: absolute;
          right: 16px;
          top: 12px;
          bottom: 12px;
          width: 4px;
          background: var(--accent-color);
          border-radius: 2px;
        }
        
        .notificationContent {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1px;
          margin-right: 16px;
          text-align: right;
        }
        
        .notificationTitle {
          font-weight: 600;
          font-size: 14px;
          color: var(--accent-color);
          margin: 0;
          text-align: right;
        }
        
        .notificationMessage {
          font-weight: 400;
          font-size: 13px;
          color: var(--field-second-color);
          margin: 0;
          line-height: 1.2;
          text-align: right;
        }
        
        .notification.error::before {
          background: var(--danger-text-color);
        }
        
        .notification.error .notificationTitle {
          color: var(--danger-text-color);
        }
        
        .notification.info::before {
          background: var(--accent-color);
        }
        
        .notification.info .notificationTitle {
          color: var(--accent-color);
        }
        
        .notification.warning::before {
          background: var(--warning-text-color);
        }
        
        .notification.warning .notificationTitle {
          color: var(--warning-text-color);
        }
      `}</style>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Custom Notification */}
      {notification.show && (
        <div 
          className={`notification ${notification.hiding ? 'hide' : 'show'} ${notification.type ? notification.type : ''} ${typeof window !== 'undefined' && window.Telegram?.WebApp ? 'telegram' : ''}`}
          onClick={hideNotification}
        >
          <div className="notificationContent">
            <div className="notificationTitle">
              {notification.type === 'error' ? 'خطا!' : 
               notification.type === 'warning' ? 'هشدار!' : 
               notification.type === 'info' ? 'اطلاعات!' : 'موفق!'}
            </div>
            <div className="notificationMessage">
              {notification.message}
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 pt-4 pb-6">
        <div className="max-w-md mx-auto">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8794a1' }}>در حال پردازش خرید...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm mb-2">خطا در پردازش خرید:</p>
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Success Content */}
          {!loading && !error && (
            <>

              {/* Virtual Number Details */}
              <div className="mb-6">
                <div className="p-4 rounded-lg" 
                     style={{ 
                       backgroundColor: 'var(--field-bg-color)',
                       border: '1px solid var(--border-color)'
                     }}>
                  
                  {/* Number Display */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-white mb-1">
                      شماره مجازی
                    </label>
                    <div className="py-1 px-3 rounded-lg relative" 
                         style={{ 
                           backgroundColor: '#1a2026',
                           border: '1px solid var(--border-color)'
                         }}>
                      {/* شماره در وسط */}
                      <div className="text-lg font-bold text-white text-center" style={{ direction: 'ltr' }}>
                        {formatPhoneNumber(virtualNumberData.number, virtualNumberData.range)}
                      </div>
                      
                      {/* دکمه کپی در گوشه راست */}
                      <button
                        onClick={handleCopyNumber}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 px-3 py-1 rounded text-xs font-medium text-white transition-colors duration-200 hover:opacity-80"
                        style={{ 
                          backgroundColor: copied ? '#22c55e' : '#248bda'
                        }}
                      >
                        {copied ? 'کپی شد!' : 'کپی'}
                      </button>
                    </div>
                  </div>

                  {/* Get Code Field */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-white mb-1">
                      کد تأیید
                    </label>
                    <div className="py-1 px-3 rounded-lg relative" 
                         style={{ 
                           backgroundColor: '#1a2026',
                           border: '1px solid var(--border-color)'
                         }}>
                      {/* کد در وسط */}
                      <div className="text-lg font-bold text-white text-center" style={{ direction: 'ltr' }}>
                        {displayCode || '‌'}
                      </div>
                      
                      {/* دکمه دریافت کد در گوشه راست */}
                      <button
                        onClick={handleGetCode}
                        disabled={codeLoading}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 px-3 py-1 rounded text-xs font-medium text-white transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                        style={{ 
                          backgroundColor: codeLoading ? '#6b7280' : '#248bda'
                        }}
                      >
                        {codeLoading ? 'در حال دریافت...' : 'دریافت کد'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Important Notes */}
                  <div className="mt-4 space-y-2">
                    {/* Note 1: Code Reception */}
                    <div className="p-3 rounded-lg" 
                         style={{ 
                           backgroundColor: 'rgba(34, 197, 94, 0.08)',
                           border: '1px solid rgba(34, 197, 94, 0.15)'
                         }}>
                      <div className="flex items-start gap-2">
                        <CheckmarkIcon size={16} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-white mb-1">دریافت کد</p>
                          <p className="text-xs" style={{ color: '#22c55e' }}>
                            برای دریافت کد تأیید، دکمه <strong>دریافت کد</strong> را فشار دهید
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Note 2: Usage Instructions */}
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
                          <p className="text-xs font-medium text-white mb-1">نحوه استفاده</p>
                          <p className="text-xs" style={{ color: '#3b82f6' }}>
                            شماره مجازی را در <strong>تلگرام دسکتاپ</strong> یا <strong>نسخه‌های غیررسمی تلگرام</strong> وارد نموده و پس از آن به این صفحه مراجعه فرمایید تا کد تأیید را دریافت نمایید
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Note 3: Account Management */}
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
                          <p className="text-xs font-medium text-white mb-1">مدیریت حساب کاربری</p>
                          <p className="text-xs" style={{ color: '#f59e0b' }}>
                            در صورتی که ربات در حساب شما باقی بماند می‌توانید هر موقع نیاز داشتید کد دریافت کنید. در صورت عدم نیاز می‌توانید با دکمه <strong>خروج از حساب کاربری</strong> ربات را لوگ اوت کنید
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-80"
                  style={{ 
                    backgroundColor: '#ef4444',
                    border: '1px solid #ef4444'
                  }}
                >
                  خروج ربات از حساب کاربری
                </button>

                {/* Secondary Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleGoToHistory}
                    className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-80"
                    style={{ 
                      backgroundColor: 'var(--field-bg-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    تاریخچه خریدها
                  </button>
                  
                  <button
                    onClick={handleBackToShop}
                    className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-80"
                    style={{ 
                      backgroundColor: 'var(--field-bg-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    خرید مجدد
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default function VirtualNumberSuccessPage() {
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
                در حال پردازش...
              </h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
