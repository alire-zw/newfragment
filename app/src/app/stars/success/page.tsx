'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StarIcon from '../../../../public/icons/star-component';
import Cash01Icon from '../../../../public/icons/cash-01-stroke-rounded';
import CheckmarkIcon from '../../../../public/icons/checkmark-icon';
import UserStrokeRoundedIcon from '../../../../public/icons/user-stroke-rounded';

interface TransactionConfirmation {
  success: boolean;
  data?: {
    txHash: string;
    message: string;
    status: 'pending' | 'confirmed' | 'failed';
  };
  error?: string;
}

interface TransactionState {
  transactionId: string;
  confirmationResult: TransactionConfirmation | null;
  isProcessed: boolean;
  timestamp: number;
}

export default function StarsPurchaseSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmationResult, setConfirmationResult] = useState<TransactionConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // دریافت اطلاعات از URL parameters
  const stars = searchParams.get('stars');
  const price = searchParams.get('price');
  const recipientName = searchParams.get('recipientName');
  const recipientUsername = searchParams.get('recipientUsername');
  const recipientPhoto = searchParams.get('recipientPhoto');
  const transactionAddress = searchParams.get('address');
  const transactionAmount = searchParams.get('amount');
  const transactionPayload = searchParams.get('payload');
  const successPageId = searchParams.get('successPageId');

  // ایجاد شناسه منحصر به فرد برای تراکنش
  const generateTransactionId = () => {
    if (!transactionAddress || !transactionAmount || !transactionPayload) return null;
    
    // ایجاد شناسه بر اساس آدرس، مبلغ، payload و timestamp
    const timestamp = Date.now();
    const data = `${transactionAddress}_${transactionAmount}_${transactionPayload}_${timestamp}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  };

  useEffect(() => {
    const processTransaction = async () => {
      if (!successPageId) {
        setError('شناسه صفحه موفقیت یافت نشد');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [SUCCESS-PAGE] Looking up purchase by successPageId:', successPageId);
        
        // جستجوی خرید بر اساس successPageId
        const response = await fetch(`/api/stars-purchase/${successPageId}`);
        const purchaseData = await response.json();
        
        if (!purchaseData.success || !purchaseData.data) {
          setError('خرید یافت نشد یا خطا در دریافت اطلاعات');
          setLoading(false);
          return;
        }

        const purchase = purchaseData.data;
        console.log('✅ [SUCCESS-PAGE] Purchase found:', {
          id: purchase.id,
          status: purchase.status,
          quantity: purchase.quantity,
          price: purchase.price
        });

        // بررسی وضعیت خرید
        if (purchase.status === 'completed') {
          // اگر خرید قبلاً تکمیل شده، نتیجه موفق را نمایش دهیم
          setConfirmationResult({
            success: true,
            data: {
              txHash: purchase.externalTransactionID || 'completed',
              message: 'خرید با موفقیت تکمیل شد',
              status: 'confirmed'
            }
          });
          setLoading(false);
          return;
        }

        if (purchase.status === 'failed') {
          setConfirmationResult({
            success: false,
            error: 'خرید ناموفق بود'
          });
          setLoading(false);
          return;
        }

        // اگر خرید در حال پردازش است، تایید تراکنش را انجام دهیم
        if (purchase.status === 'pending' && transactionAddress && transactionAmount && transactionPayload) {
          console.log('🚀 [SUCCESS-PAGE] Confirming pending transaction...');
          
          const confirmResponse = await fetch('/api/telegram/confirm-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction: {
                address: transactionAddress,
                amount: transactionAmount,
                payload: transactionPayload
              }
            })
          });

          const confirmResult = await confirmResponse.json();
          setConfirmationResult(confirmResult);
        } else {
          setConfirmationResult({
            success: false,
            error: 'وضعیت خرید نامشخص است'
          });
        }
        
      } catch (error) {
        console.error('❌ [SUCCESS-PAGE] Error processing transaction:', error);
        setError('خطا در پردازش تراکنش');
      } finally {
        setLoading(false);
      }
    };

    processTransaction();
  }, [successPageId, transactionAddress, transactionAmount, transactionPayload]);

  const formatStars = (stars: number) => {
    if (stars >= 1000000) {
      const millions = (stars / 1000000).toFixed(1).replace('.0', '');
      return `${millions} میلیون`;
    } else if (stars >= 1000) {
      const thousands = (stars / 1000).toFixed(1).replace('.0', '');
      return `${thousands} هزار`;
    }
    return stars.toString();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  const handleBackToStars = () => {
    router.push('/stars');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال تایید تراکنش...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">×</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">خطا در تایید تراکنش</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleBackToStars}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            بازگشت به خرید استارز
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
            {confirmationResult?.success ? (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckmarkIcon size={32} color="white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">×</span>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {confirmationResult?.success ? 'تراکنش تایید شد!' : 'خطا در تایید تراکنش'}
            </h1>
            <p className="text-sm text-gray-400">
              {confirmationResult?.success ? 'خرید استارز با موفقیت تکمیل شد' : 'تراکنش تایید نشد'}
            </p>
          </div>

          {/* Transaction Details */}
          {confirmationResult?.success && confirmationResult.data && (
            <div className="mb-6 p-4 rounded-lg" style={{ 
              backgroundColor: 'var(--field-bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 className="text-lg font-semibold text-white mb-4 text-center">جزئیات تراکنش</h3>
              
              <div className="space-y-4">

                {/* Stars Info */}
                <div className="p-3 rounded-lg" style={{ 
                  backgroundColor: '#1a2026',
                  border: '1px solid var(--dropdown-bg-hover-color, #384553)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-white">تعداد استارز:</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {stars ? formatStars(parseInt(stars)) : 'نامشخص'} استارز
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
                      {price ? `${formatPrice(parseInt(price))} تومان` : 'نامشخص'}
                    </span>
                  </div>
                </div>

                {/* Recipient Info */}
                {recipientName && (
                  <div className="flex flex-row-reverse items-center gap-3 p-3 rounded-lg" style={{ 
                    backgroundColor: '#1a2026',
                    border: '1px solid var(--dropdown-bg-hover-color, #384553)'
                  }}>
                    {recipientPhoto && (
                      <img
                        src={recipientPhoto}
                        alt={recipientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="text-left">
                      <div className="font-medium" style={{ color: 'var(--field-color, #ffffff)' }}>
                        {recipientName}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-color, #8794a1)' }}>
                        {recipientUsername}
                      </div>
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
                      <p className="text-xs font-medium text-white mb-1">وضعیت ارسال</p>
                      <p className="text-xs" style={{ color: '#22c55e' }}>
                        استار شما تا دقایقی دیگر ارسال خواهد شد
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {!confirmationResult?.success && confirmationResult?.error && (
            <div className="mb-6 p-4 rounded-lg" style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #ef4444'
            }}>
              <h3 className="text-lg font-semibold text-red-800 mb-2">جزئیات خطا</h3>
              <p className="text-red-600">{confirmationResult.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBackToStars}
              className="py-1.5 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-sm"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: `1px solid var(--field-accent-color)`
              }}
            >
              خرید استارز بیشتر
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
