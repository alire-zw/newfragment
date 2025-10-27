'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUser } from '@/hooks/useUser';
import { isTelegramWebApp, getTelegramWebApp, initializeTelegramWebApp, openLinkInTelegramWebApp } from '@/utils/telegram';
import Cash01Icon from '../../../public/icons/cash-01-stroke-rounded';
import InvoiceIcon from '../../../public/icons/invoice-02-stroke-rounded';
import CreditCardPosIcon from '../../../public/icons/credit-card-pos-stroke-rounded';

export default function ChargePage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{accountID: string, cardNumber: string, bankName?: string, accountHolderName?: string} | null>(null);
  const [userCards, setUserCards] = useState<{accountID: string, cardNumber: string, bankName?: string, accountHolderName?: string}[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const { userInfo } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();

  // پیشنهادات مبلغ
  const suggestedAmounts = [
    { value: 50000, label: '50 هزار تومان' },
    { value: 100000, label: '100 هزار تومان' },
    { value: 200000, label: '200 هزار تومان' },
    { value: 500000, label: '500 هزار تومان' },
    { value: 1000000, label: '1 میلیون تومان' },
    { value: 2000000, label: '2 میلیون تومان' }
  ];

  const handleAmountChange = (value: string) => {
    // فقط اعداد مجاز
    if (!/^[0-9]*$/.test(value)) {
      return;
    }
    
    setAmount(value);
    setError('');
    setSuccess('');
  };

  // اطمینان از initialize و expand شدن وب‌ویو تلگرام
  useEffect(() => {
    if (isTelegramWebApp()) {
      initializeTelegramWebApp();
    }
  }, []);

  const handleSuggestedAmount = (value: number) => {
    setAmount(value.toString());
    setError('');
    setSuccess('');
  };

  const handleCharge = async () => {
    const amountNum = parseInt(amount);
    
    // اعتبارسنجی
    if (!amountNum || amountNum < 1000) {
      setError('حداقل مبلغ شارژ 1,000 تومان است');
      return;
    }

    if (amountNum > 10000000) {
      setError('حداکثر مبلغ شارژ 10,000,000 تومان است');
      return;
    }

    if (!selectedCard) {
      setError('لطفاً کارت بانکی را انتخاب کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { apiPost } = await import('@/utils/api');
      const data = await apiPost<any>('/api/charge/create-payment', {
        amount: amountNum,
        userId: userInfo?.id,
        description: 'شارژ حساب کیف پول',
        selectedCardId: selectedCard?.accountID
      });

      if (data.success && data.paymentUrl) {
        // هدایت به درگاه پرداخت - باید در همان WebView باز شود
        console.log('🔗 Redirecting to payment gateway:', data.paymentUrl);
        console.log('🔍 isTelegramWebApp:', isTelegramWebApp());
        console.log('🔍 User Agent:', navigator.userAgent);
        
        // تست: آیا در WebView هستیم؟
        if (isTelegramWebApp()) {
          console.log('✅ Inside Telegram WebApp - using location.href');
          window.location.href = data.paymentUrl;
        } else {
          console.log('❌ Outside Telegram WebApp - using location.href');
          window.location.href = data.paymentUrl;
        }
      } else {
        setError(data.error || 'خطا در ایجاد درخواست پرداخت');
      }
    } catch (error) {
      console.error('Charge error:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return Math.floor(amount).toLocaleString('fa-IR');
  };

  // بارگذاری کارت‌های بانکی کاربر
  const loadUserCards = async () => {
    if (!userInfo?.id) {
      console.error('User ID not available');
      setUserCards([]);
      return;
    }

    setCardsLoading(true);
    try {
      const { apiGet } = await import('@/utils/api');
      const data = await apiGet<any>(`/api/bank-accounts/get?telegramId=${userInfo.id}`);
      
      if (data.success && data.accounts) {
        setUserCards(data.accounts);
      } else {
        setUserCards([]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setUserCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  // باز کردن مودال انتخاب کارت
  const handleSelectCard = () => {
    setShowCardModal(true);
    if (userCards.length === 0) {
      loadUserCards();
    }
  };

  // انتخاب کارت
  const handleCardSelect = (card: {accountID: string, cardNumber: string, bankName?: string, accountHolderName?: string}) => {
    setSelectedCard(card);
    setShowCardModal(false);
  };

  // بستن مودال
  const handleCloseModal = () => {
    setShowCardModal(false);
  };

  // بررسی احراز هویت کاربر
  useEffect(() => {
    if (!userLoading && dbUser && !dbUser.isVerified) {
      router.push('/profile/verify');
    }
  }, [dbUser, userLoading, router]);

  // بررسی URL parameters برای نمایش پیام‌های موفقیت یا خطا
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const successParam = urlParams.get('success');
      const errorParam = urlParams.get('error');
      const amountParam = urlParams.get('amount');

      if (successParam === 'true' && amountParam) {
        setSuccess(`پرداخت ${formatAmount(parseInt(amountParam))} تومان با موفقیت انجام شد!`);
        setAmount('');
        // پاک کردن URL parameters
        window.history.replaceState({}, '', '/charge');
      } else if (errorParam) {
        let errorMessage = 'خطا در پردازش پرداخت';
        
        switch (errorParam) {
          case 'missing_track_id':
            errorMessage = 'شناسه تراکنش یافت نشد';
            break;
          case 'payment_failed':
            errorMessage = 'پرداخت ناموفق بود';
            break;
          case 'verification_failed':
            errorMessage = 'تایید پرداخت ناموفق بود';
            break;
          case 'server_error':
            errorMessage = 'خطا در سرور';
            break;
        }
        
        setError(errorMessage);
        // پاک کردن URL parameters
        window.history.replaceState({}, '', '/charge');
      }
    }
  }, []);



  // نمایش loading در حال بارگذاری اطلاعات کاربر
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
           {/* Header */}
           <div className="text-center mb-6">
             <div className="mb-1">
               <h1 className="text-2xl md:text-3xl font-bold text-white">
                 شارژ حساب
               </h1>
             </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>شارژ حساب</strong> برای <strong>خرید</strong> خدمات و <strong>پرداخت</strong> آسان
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              تمام پرداخت‌ها <strong>امن</strong> و <strong>فوری</strong> هستند. پس از <strong>پرداخت</strong>، مبلغ <strong>بلافاصله</strong> به حساب شما اضافه می‌شود.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e'
            }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                مبلغ شارژ (تومان)
              </h3>
              {error && (
                <div className="text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
            
            <div className="relative" style={{ height: '40px' }}>
              <input
                type="text"
                placeholder="مبلغ را وارد کنید..."
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isLoading}
                className="w-full h-full rounded-lg text-right focus:outline-none disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: amount ? '#ffffff' : 'var(--text-color)',
                  border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  paddingRight: '40px',
                  paddingLeft: '16px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  // Hide number input spinners
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              
              {/* Cash Icon */}
              {!isLoading && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                </div>
              )}
              
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Amounts */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white mb-3">
              مبالغ پیشنهادی
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {suggestedAmounts.map((suggestion) => (
                <button
                  key={suggestion.value}
                  onClick={() => handleSuggestedAmount(suggestion.value)}
                  className="py-3 px-3 rounded-lg text-right transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'var(--field-bg-color)',
                    border: amount === suggestion.value.toString() ? '2px solid var(--field-accent-color)' : '1px solid var(--border-color)',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                    <span className="text-sm font-medium">
                      {formatAmount(suggestion.value)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

           {/* Card Selection */}
           <div className="mb-6">
             <h3 className="text-sm font-medium text-white mb-2">
               انتخاب کارت بانکی
             </h3>
             
             <button
               onClick={handleSelectCard}
               className="w-full p-4 rounded-lg text-right transition-colors duration-200"
               style={{ 
                 backgroundColor: 'var(--field-bg-color)',
                 border: selectedCard ? '2px solid var(--field-accent-color)' : '1px solid var(--border-color)',
                 color: 'white'
               }}
             >
               {selectedCard ? (
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <CreditCardPosIcon className="h-5 w-5" style={{ color: 'var(--field-accent-color)' }} />
                     <div className="text-right">
                       <div className="text-sm font-medium">
                         {selectedCard.bankName} - {selectedCard.cardNumber}
                       </div>
                       <div className="text-xs" style={{ color: '#8794a1' }}>
                         {selectedCard.accountHolderName}
                       </div>
                     </div>
                   </div>
                   <div className="text-xs" style={{ color: 'var(--field-accent-color)' }}>
                     تغییر
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <CreditCardPosIcon className="h-5 w-5" style={{ color: 'var(--text-secondary-color)' }} />
                     <span className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>
                       کارت بانکی را انتخاب کنید
                     </span>
                   </div>
                   <div className="text-xs" style={{ color: 'var(--field-accent-color)' }}>
                     انتخاب
                   </div>
                 </div>
               )}
             </button>
           </div>

          {/* Charge Button */}
          <button
            onClick={handleCharge}
            disabled={!amount || !selectedCard || isLoading}
            className="w-full py-3 rounded-lg text-white font-semibold text-base mb-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'var(--btn-primary-bg-color)'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال پردازش...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <InvoiceIcon className="h-5 w-5" />
                <span>شارژ {amount ? formatAmount(parseInt(amount)) : ''} تومان</span>
              </div>
            )}
          </button>

           {/* Transaction History Link */}
           <div className="text-center">
             <button 
               onClick={() => window.location.href = '/history'}
               className="text-sm transition-colors duration-200"
               style={{ color: 'var(--field-accent-color)' }}
             >
               مشاهده تاریخچه تراکنش‌ها
             </button>
           </div>

         </div>
       </div>

       {/* Card Selection Modal */}
       {showCardModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ 
           backgroundColor: 'rgba(0, 0, 0, 0.6)',
           backdropFilter: 'blur(8px)'
         }}>
           <div className="rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden" style={{ 
             backgroundColor: 'var(--field-bg-color)',
             border: '1px solid var(--border-color)'
           }}>
             {/* Modal Header */}
             <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-white">
                   انتخاب کارت بانکی
                 </h3>
                 <button
                   onClick={handleCloseModal}
                   className="text-gray-400 hover:text-white transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>

             {/* Modal Content */}
             <div className="p-4 max-h-96 overflow-y-auto">
               {cardsLoading ? (
                 <div className="flex items-center justify-center py-8">
                   <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="mr-2" style={{ color: 'var(--text-color)' }}>در حال بارگذاری...</span>
                 </div>
               ) : userCards.length === 0 ? (
                 <div className="text-center py-8">
                   <CreditCardPosIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary-color)' }} />
                   <p className="mb-4" style={{ color: 'var(--text-color)' }}>هیچ کارت بانکی ثبت نشده است</p>
                   <button
                     onClick={() => {
                       setShowCardModal(false);
                       // هدایت به صفحه اضافه کردن کارت
                       window.location.href = '/profile/bank-accounts';
                     }}
                     className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                     style={{ 
                       backgroundColor: 'var(--btn-primary-bg-color)',
                       color: 'white'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
                     }}
                   >
                     اضافه کردن کارت بانکی
                   </button>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {userCards.map((card, index) => (
                     <button
                       key={index}
                       onClick={() => handleCardSelect(card)}
                       className="w-full p-3 text-right rounded-lg transition-colors"
                       style={{ 
                         backgroundColor: 'var(--bg-color)',
                         border: 'none',
                         color: 'white'
                       }}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <CreditCardPosIcon className="w-5 h-5" style={{ color: 'var(--field-accent-color)' }} />
                           <div>
                             <div className="text-sm font-medium text-white">
                               {card.bankName} - {card.cardNumber}
                             </div>
                             <div className="text-xs" style={{ color: 'var(--text-color)' }}>
                               {card.accountHolderName}
                             </div>
                           </div>
                         </div>
                         <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ 
                           border: '2px solid var(--border-color)'
                         }}>
                            {selectedCard?.accountID === card.accountID && (
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--field-accent-color)' }}></div>
                           )}
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             {userCards.length > 0 && (
               <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                 <button
                   onClick={handleCloseModal}
                   className="w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                   style={{ 
                     backgroundColor: 'var(--btn-primary-bg-color)',
                     color: 'white'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
                   }}
                 >
                   بستن
                 </button>
               </div>
             )}
           </div>
         </div>
       )}

     </div>
   );
 }
