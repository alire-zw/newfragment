import { useState, useEffect } from 'react';
import { useTelegramUser } from './useTelegramUser';
import { apiGet } from '@/utils/api';

interface WalletData {
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: string;
}

export function useWallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useTelegramUser();

  const fetchWalletBalance = async () => {
    if (!userInfo?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiGet<{ success: boolean; data: WalletData; error?: string }>(
        `/api/wallet/balance?telegramId=${userInfo.id}`
      );
      
      if (data.success) {
        setWalletData(data.data);
      } else {
        setError(data.error || 'خطا در دریافت موجودی کیف پول');
      }
    } catch (err) {
      console.error('خطا در دریافت موجودی کیف پول:', err);
      setError(err instanceof Error ? err.message : 'خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    
    // Auto-refresh هر 30 ثانیه
    const interval = setInterval(fetchWalletBalance, 30000);
    
    // Event listener برای به‌روزرسانی فوری بعد از تراکنش‌ها
    const handleWalletUpdate = () => {
      fetchWalletBalance();
    };
    
    window.addEventListener('walletUpdated', handleWalletUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('walletUpdated', handleWalletUpdate);
    };
  }, [userInfo?.id]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.floor(amount));
  };

  // Function برای trigger کردن به‌روزرسانی موجودی از خارج
  const triggerWalletUpdate = () => {
    window.dispatchEvent(new CustomEvent('walletUpdated'));
  };

  return {
    walletData,
    loading,
    error,
    refetch: fetchWalletBalance,
    triggerUpdate: triggerWalletUpdate,
    formatAmount
  };
}
