import { useState, useEffect } from 'react';
import { useTelegramUser } from './useTelegramUser';
import { apiGet } from '@/utils/api';

export interface MyVirtualNumber {
  virtualNumberID: string;
  number: string;
  requestID: string | null;
  price: number;
  country: string;
  countryCode: string;
  phoneRange: string;
  service: string;
  quality: string | null;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useMyVirtualNumbers() {
  const [virtualNumbers, setVirtualNumbers] = useState<MyVirtualNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { userInfo } = useTelegramUser();

  const fetchVirtualNumbers = async (isRetry = false) => {
    if (!userInfo?.id) {
      setLoading(false);
      return;
    }

    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await apiGet<{ success: boolean; data: { virtualNumbers: MyVirtualNumber[] }; error?: string }>(
        `/api/virtual-numbers/my-numbers?telegramId=${userInfo.id}`
      );

      if (data.success) {
        setVirtualNumbers(data.data.virtualNumbers);
        setError(null);
        setRetryCount(0);
      } else {
        // اگر خطای احراز هویت است، retry کن
        if (data.error?.includes('احراز هویت') && retryCount < 3) {
          console.log(`🔄 [VIRTUAL-NUMBERS] Auth error, retrying... (${retryCount + 1}/3)`);
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchVirtualNumbers(true), 1000 * (retryCount + 1));
          return;
        }
        setError(data.error || 'خطا در دریافت شماره‌های مجازی');
      }
    } catch (err) {
      console.error('خطا در دریافت شماره‌های مجازی:', err);
      
      // اگر خطای احراز هویت است، retry کن
      if (err instanceof Error && err.message.includes('احراز هویت') && retryCount < 3) {
        console.log(`🔄 [VIRTUAL-NUMBERS] Auth error, retrying... (${retryCount + 1}/3)`);
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchVirtualNumbers(true), 1000 * (retryCount + 1));
        return;
      }
      
      setError(err instanceof Error ? err.message : 'خطا در ارتباط با سرور');
    } finally {
      if (!isRetry) {
        setLoading(false);
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      // اضافه کردن delay کوچک برای اطمینان از تکمیل احراز هویت
      const timer = setTimeout(() => {
        fetchVirtualNumbers();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userInfo?.id]);

  return {
    virtualNumbers,
    loading: loading || isRetrying,
    error,
    isRetrying,
    refetch: fetchVirtualNumbers
  };
}
