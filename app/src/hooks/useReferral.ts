import { useState, useEffect } from 'react';
import { useTelegramUser } from './useTelegramUser';
import { apiGet, apiPost } from '@/utils/api';

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalReward: number;
  rewardPercentage: number;
}

export const useReferral = () => {
  const { userInfo } = useTelegramUser();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalReward: 0,
    rewardPercentage: 25
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت آمار رفرال
  const fetchReferralStats = async (telegramID: number) => {
    try {
      const result = await apiGet<{ stats: ReferralStats }>(`/api/referrals/stats?telegramID=${telegramID}`);
      setStats(result.stats);
    } catch (err) {
      console.error('❌ خطا در دریافت آمار رفرال:', err);
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  // پردازش پارامتر startapp
  const processStartApp = async (telegramID: number, startAppParam: string) => {
    try {
      const result = await apiPost('/api/referrals/process', {
        telegramID,
        startAppParam
      });
      return result;
    } catch (err) {
      console.error('❌ خطا در پردازش رفرال:', err);
      throw err;
    }
  };

  // تولید لینک رفرال
  const generateReferralLink = (telegramID: number) => {
    return `t.me/FragmentParsiBot/fragmentparsi?startapp=${telegramID}`;
  };

  // کپی کردن لینک رفرال
  const copyReferralLink = async (telegramID: number) => {
    try {
      const link = generateReferralLink(telegramID);
      await navigator.clipboard.writeText(link);
      return { success: true, message: 'لینک کپی شد' };
    } catch (err) {
      console.error('❌ خطا در کپی لینک:', err);
      return { success: false, message: 'خطا در کپی کردن' };
    }
  };

  // بارگذاری آمار هنگام تغییر کاربر
  useEffect(() => {
    if (userInfo?.id) {
      setLoading(true);
      setError(null);
      fetchReferralStats(userInfo.id);
    }
  }, [userInfo?.id]);

  return {
    stats,
    loading,
    error,
    fetchReferralStats,
    processStartApp,
    generateReferralLink,
    copyReferralLink
  };
};
