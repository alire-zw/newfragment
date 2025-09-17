'use client';

import { useTelegramUser } from './useTelegramUser';
import { useUser } from './useUser';
import { useEffect, useState } from 'react';
import { User } from '../../database/UserService';

export function useAdmin() {
  const { userInfo } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminIds, setAdminIds] = useState<number[]>([]);

  // لیست ایدی‌های ادمین (می‌توانید این ایدی‌ها را تغییر دهید)
  const ADMIN_TELEGRAM_IDS = [
    123456789, // ایدی ادمین اول
    987654321, // ایدی ادمین دوم
    // ایدی‌های بیشتر را اینجا اضافه کنید
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userInfo?.id || userLoading) {
        setLoading(true);
        return;
      }

      try {
        // بررسی ایدی تلگرام در لیست ادمین‌ها
        const isInAdminList = ADMIN_TELEGRAM_IDS.includes(userInfo.id);
        
        // بررسی وضعیت ادمین در دیتابیس
        const isAdminInDB = (dbUser as User)?.isAdmin || false;
        
        // کاربر ادمین است اگر در لیست ایدی‌ها باشد یا در دیتابیس ادمین باشد
        const adminStatus = isInAdminList || isAdminInDB;
        
        setIsAdmin(adminStatus);
        setAdminIds(ADMIN_TELEGRAM_IDS);
      } catch (error) {
        console.error('خطا در بررسی وضعیت ادمین:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userInfo?.id, (dbUser as User)?.isAdmin, userLoading]);

  return {
    isAdmin,
    loading,
    adminIds,
    userTelegramId: userInfo?.id,
  };
}