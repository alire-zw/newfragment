import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/prices/${serviceId}?token=${AUTH_TOKEN}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setCountries(data.data);
          // نمایش پیام کش در کنسول
          if (data.cached) {
            console.log('📦 Data loaded from cache');
          } else {
            console.log('🌐 Data loaded from API');
          }
        } else {
          throw new Error(data.message || 'خطا در دریافت داده‌ها');
        }
      } catch (err) {
        console.error('خطا در دریافت لیست کشورها:', err);
        setError(err instanceof Error ? err.message : 'خطای نامشخص');
        
        // در صورت خطا، داده‌های پیش‌فرض نمایش داده می‌شود
        setCountries([
          { id: '1', name: 'ایران', flag: '🇮🇷', code: '+98', price: 25000, available: true },
          { id: '2', name: 'آمریکا', flag: '🇺🇸', code: '+1', price: 35000, available: true },
          { id: '3', name: 'انگلیس', flag: '🇬🇧', code: '+44', price: 40000, available: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [serviceId]);

  return {
    countries,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // دوباره fetch کردن
      const fetchCountries = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/prices/${serviceId}?token=${AUTH_TOKEN}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: ApiResponse = await response.json();

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
