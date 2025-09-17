import { useState, useEffect } from 'react';
import { useTelegramUser } from './useTelegramUser';

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
      const response = await fetch(`/api/wallet/balance?telegramId=${userInfo.id}`);
      const data = await response.json();
      
      if (data.success) {
        setWalletData(data.data);
      } else {
        setError(data.error || 'خطا در دریافت موجودی کیف پول');
      }
    } catch (err) {
      console.error('خطا در دریافت موجودی کیف پول:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, [userInfo?.id]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return {
    walletData,
    loading,
    error,
    refetch: fetchWalletBalance,
    formatAmount
  };
}
