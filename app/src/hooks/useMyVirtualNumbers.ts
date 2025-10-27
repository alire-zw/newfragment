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
  const { userInfo } = useTelegramUser();

  const fetchVirtualNumbers = async () => {
    if (!userInfo?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<{ success: boolean; data: { virtualNumbers: MyVirtualNumber[] }; error?: string }>(
        `/api/virtual-numbers/my-numbers?telegramId=${userInfo.id}`
      );

      if (data.success) {
        setVirtualNumbers(data.data.virtualNumbers);
      } else {
        setError(data.error || 'خطا در دریافت شماره‌های مجازی');
      }
    } catch (err) {
      console.error('خطا در دریافت شماره‌های مجازی:', err);
      setError(err instanceof Error ? err.message : 'خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVirtualNumbers();
  }, [userInfo?.id]);

  return {
    virtualNumbers,
    loading,
    error,
    refetch: fetchVirtualNumbers
  };
}
