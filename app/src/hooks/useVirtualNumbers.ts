import { useState, useEffect } from 'react';
import { apiGet } from '@/utils/api';

export interface Country {
  id: string;
  name: string;
  flag: string; // URL پرچم
  code: string;
  price: number;
  available: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Country[];
  message: string;
  cached?: boolean;
}

// استفاده از API داخلی Next.js
const API_BASE_URL = '/api';
const AUTH_TOKEN = '221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1';

export const useVirtualNumbers = (serviceId: number = 1) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const fetchCountries = async (isRetry = false) => {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      try {
        const url = `${API_BASE_URL}/prices/${serviceId}?token=${AUTH_TOKEN}`;
        const data = await apiGet<ApiResponse>(url);

        if (data.success) {
          setCountries(data.data);
          setError(null);
          setRetryCount(0);
          // نمایش پیام کش در کنسول
          if (data.cached) {
            console.log('📦 Data loaded from cache');
          } else {
            console.log('🌐 Data loaded from API');
          }
        } else {
          // اگر خطای احراز هویت است، retry کن
          if (data.message?.includes('احراز هویت') && retryCount < 3) {
            console.log(`🔄 [VIRTUAL-NUMBERS] Auth error, retrying... (${retryCount + 1}/3)`);
            setIsRetrying(true);
            setRetryCount(prev => prev + 1);
            setTimeout(() => fetchCountries(true), 1000 * (retryCount + 1));
            return;
          }
          throw new Error(data.message || 'خطا در دریافت داده‌ها');
        }
      } catch (err) {
        console.error('خطا در دریافت لیست کشورها:', err);
        
        // اگر خطای احراز هویت است، retry کن
        if (err instanceof Error && err.message.includes('احراز هویت') && retryCount < 3) {
          console.log(`🔄 [VIRTUAL-NUMBERS] Auth error, retrying... (${retryCount + 1}/3)`);
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchCountries(true), 1000 * (retryCount + 1));
          return;
        }
        
        setError(err instanceof Error ? err.message : 'خطای نامشخص');
        
        // در صورت خطا، داده‌های پیش‌فرض نمایش داده می‌شود
        setCountries([
          { id: '1', name: 'ایران', flag: '🇮🇷', code: '+98', price: 25000, available: true },
          { id: '2', name: 'آمریکا', flag: '🇺🇸', code: '+1', price: 35000, available: true },
          { id: '3', name: 'انگلیس', flag: '🇬🇧', code: '+44', price: 40000, available: true },
        ]);
      } finally {
        if (!isRetry) {
          setLoading(false);
          setIsRetrying(false);
        }
      }
    };

    // اضافه کردن delay کوچک برای اطمینان از تکمیل احراز هویت
    const timer = setTimeout(() => {
      fetchCountries();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [serviceId]);

  return {
    countries,
    loading: loading || isRetrying,
    error,
    isRetrying,
    refetch: () => {
      setLoading(true);
      setError(null);
      setRetryCount(0);
      // دوباره fetch کردن
      const fetchCountries = async () => {
        try {
          const url = `${API_BASE_URL}/prices/${serviceId}?token=${AUTH_TOKEN}`;
          const data = await apiGet<ApiResponse>(url);

          if (data.success) {
            setCountries(data.data);
            // نمایش پیام کش در کنسول
            if (data.cached) {
              console.log('📦 Data refreshed from cache');
            } else {
              console.log('🌐 Data refreshed from API');
            }
          } else {
            throw new Error(data.message || 'خطا در دریافت داده‌ها');
          }
        } catch (err) {
          console.error('خطا در دریافت لیست کشورها:', err);
          setError(err instanceof Error ? err.message : 'خطای نامشخص');
        } finally {
          setLoading(false);
        }
      };
      fetchCountries();
    }
  };
};
