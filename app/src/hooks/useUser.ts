import { useState, useEffect, useCallback } from 'react';
import { useTelegramUser } from './useTelegramUser';
import { useReferral } from './useReferral';
import { apiGet, apiPost } from '@/utils/api';

export interface User {
  id?: number;
  userID: string;
  userFullName: string;
  userTelegramID: number;
  userBirthDate?: string | null;
  userNationalID?: string | null;
  userPhoneNumber?: string | null;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const useUser = () => {
  const { userInfo, loading: telegramLoading } = useTelegramUser();
  const { processStartApp } = useReferral();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ذخیره اطلاعات کاربر در دیتابیس
  const saveUser = async (userData: Partial<User>) => {
    try {
      const result = await apiPost<{ user: User }>('/api/users/save', userData);
      setUser(result.user);
      return result.user;
    } catch (err) {
      console.error('❌ خطا در ذخیره کاربر:', err);
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
      throw err;
    }
  };

  // دریافت اطلاعات کاربر از دیتابیس
  const fetchUser = async (telegramID: number) => {
    try {
      const result = await apiGet<{ user: User }>(`/api/users/get?telegramID=${telegramID}`);
      return result.user;
    } catch (err) {
      // اگر 404 بود یا پیام "کاربر یافت نشد"، کاربر وجود نداره
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('کاربر یافت نشد'))) {
        console.log('ℹ️ کاربر در دیتابیس یافت نشد، کاربر جدید محسوب می‌شود');
        return null;
      }
      console.error('❌ خطا در دریافت کاربر:', err);
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
      throw err;
    }
  };

  // پردازش پارامتر startapp
  const processStartAppParam = useCallback(async () => {
    if (typeof window === 'undefined' || !userInfo) return;

    try {
      // دریافت پارامتر startapp از URL
      const urlParams = new URLSearchParams(window.location.search);
      const startAppParam = urlParams.get('tgWebAppStartParam');
      
      if (startAppParam) {
        // بررسی اینکه آیا قبلاً پردازش شده یا نه
        const processedKey = `processed_${userInfo.id}_${startAppParam}`;
        if (localStorage.getItem(processedKey)) {
          console.log('ℹ️ رفرال قبلاً پردازش شده است');
          return;
        }

        console.log('🔗 پردازش پارامتر startapp:', startAppParam);
        const result = await processStartApp(userInfo.id, startAppParam);
        
        if (result.success) {
          console.log('✅ رفرال با موفقیت ثبت شد:', result.referral);
          // علامت‌گذاری که پردازش شده
          localStorage.setItem(processedKey, 'true');
        } else {
          console.log('ℹ️ رفرال ثبت نشد:', result.message);
          // حتی اگر موفق نبود، علامت‌گذاری کن تا دوباره تلاش نکند
          localStorage.setItem(processedKey, 'failed');
        }
      }
    } catch (err) {
      console.error('❌ خطا در پردازش پارامتر startapp:', err);
    }
  }, [userInfo]);

  // ذخیره خودکار کاربر هنگام ورود
  useEffect(() => {
    let isMounted = true;

    const handleUserSave = async () => {
      if (!userInfo || telegramLoading) return;

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 بررسی وجود کاربر در دیتابیس...', userInfo.id);
        // ابتدا بررسی کنیم که کاربر در دیتابیس وجود دارد یا نه
        const existingUser = await fetchUser(userInfo.id);
        
        if (!isMounted) return;

        if (existingUser) {
          // کاربر موجود است
          console.log('✅ کاربر موجود یافت شد:', existingUser.userID);
          setUser(existingUser);
        } else {
          // کاربر جدید است، اطلاعاتش را ذخیره کنیم
          console.log('➕ کاربر جدید، در حال ذخیره...');
          const fullName = (userInfo.first_name || '') + (userInfo.last_name ? ' ' + userInfo.last_name : '') || 'بدون نام';
          const username = userInfo.username || `user_${userInfo.id}`;
          
          const newUser = await saveUser({
            userID: username,
            userFullName: fullName,
            userTelegramID: userInfo.id,
            userBirthDate: null,
            userNationalID: null,
            userPhoneNumber: null,
            isVerified: false
          });

          if (!isMounted) return;

          console.log('✅ کاربر جدید ذخیره شد:', newUser.userID);
          setUser(newUser);
        }

        // پردازش پارامتر startapp
        if (isMounted) {
          await processStartAppParam();
        }

      } catch (err) {
        if (!isMounted) return;
        console.error('❌ خطا در مدیریت کاربر:', err);
        setError(err instanceof Error ? err.message : 'خطای نامشخص');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    handleUserSave();

    return () => {
      isMounted = false;
    };
  }, [userInfo?.id, telegramLoading]);

  return {
    user,
    loading: loading || telegramLoading,
    error,
    saveUser,
    fetchUser
  };
};
