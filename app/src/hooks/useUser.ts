import { useState, useEffect, useCallback } from 'react';
import { useTelegramUser } from './useTelegramUser';
import { useReferral } from './useReferral';

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
      const response = await fetch('/api/users/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ذخیره اطلاعات کاربر');
      }

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
      const response = await fetch(`/api/users/get?telegramID=${telegramID}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // کاربر در دیتابیس وجود ندارد
          return null;
        }
        throw new Error(result.error || 'خطا در دریافت اطلاعات کاربر');
      }

      return result.user;
    } catch (err) {
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
    const handleUserSave = async () => {
      if (!userInfo || telegramLoading) return;

      setLoading(true);
      setError(null);

      try {
        // ابتدا بررسی کنیم که کاربر در دیتابیس وجود دارد یا نه
        const existingUser = await fetchUser(userInfo.id);
        
        if (existingUser) {
          // کاربر موجود است
          setUser(existingUser);
        } else {
          // کاربر جدید است، اطلاعاتش را ذخیره کنیم
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

          setUser(newUser);
        }

        // پردازش پارامتر startapp
        await processStartAppParam();

      } catch (err) {
        console.error('❌ خطا در مدیریت کاربر:', err);
        setError(err instanceof Error ? err.message : 'خطای نامشخص');
      } finally {
        setLoading(false);
      }
    };

    handleUserSave();
  }, [userInfo, telegramLoading, processStartAppParam]);

  return {
    user,
    loading: loading || telegramLoading,
    error,
    saveUser,
    fetchUser
  };
};
