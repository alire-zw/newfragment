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

  // حذف hardcode - فقط از دیتابیس استفاده میکنیم
  const ADMIN_TELEGRAM_IDS: number[] = [];

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userInfo?.id || userLoading) {
        setLoading(true);
        return;
      }

      try {
        // فقط از دیتابیس چک میکنیم - بدون hardcode
        const isAdminInDB = (dbUser as User)?.isAdmin || false;
        
        // کاربر فقط از طریق دیتابیس ادمین است
        const adminStatus = isAdminInDB;
        
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