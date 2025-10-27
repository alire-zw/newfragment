'use client';

import { useState, useEffect } from 'react';
import { isTelegramWebApp, getTelegramUser, initializeTelegramWebApp, detectTelegramEnvironment, parseUserFromHash } from '@/utils/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export function useTelegramUser() {
  const [userInfo, setUserInfo] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔄 Initializing Telegram WebApp...');
        console.log('🔍 window.Telegram exists:', typeof window !== 'undefined' && !!window.Telegram);
        console.log('🔍 window.Telegram.WebApp exists:', typeof window !== 'undefined' && !!window.Telegram?.WebApp);
        
        // Detect Telegram environment
        detectTelegramEnvironment();
        
        // Check if Telegram WebApp is available
        if (isTelegramWebApp()) {
          console.log('✅ Telegram WebApp found');
          
          // Initialize Telegram WebApp
          initializeTelegramWebApp();
          
          // Get user info from WebApp
          const user = getTelegramUser();
          console.log('👤 User from WebApp:', user);
          
          if (user) {
            console.log('✅ User data from WebApp:', user);
            // ذخیره در localStorage فقط برای کاربران واقعی تلگرام
            localStorage.setItem('telegramUser', JSON.stringify(user));
            localStorage.setItem('telegramUserSource', 'webapp');
            setUserInfo(user);
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ Telegram WebApp exists but no user data available');
          }
        } else {
          console.log('❌ Telegram WebApp not available, trying hash...');
          
          // Try to get user data from hash URL
          const userFromHash = parseUserFromHash();
          
          if (userFromHash) {
            console.log('✅ User data from hash:', userFromHash);
            
            // Convert to desired format
            const user: TelegramUser = {
              id: userFromHash.id,
              first_name: userFromHash.first_name,
              last_name: userFromHash.last_name || '',
              username: userFromHash.username,
              photo_url: userFromHash.photo_url,
              language_code: userFromHash.language_code
            };
            
            // ذخیره در localStorage فقط برای کاربران واقعی تلگرام
            localStorage.setItem('telegramUser', JSON.stringify(user));
            localStorage.setItem('telegramUserSource', 'hash');
            setUserInfo(user);
            setLoading(false);
            return;
          } else {
            console.log('❌ No user data in hash');
          }
        }

        // بررسی localStorage برای کاربران ذخیره شده
        const savedUser = localStorage.getItem('telegramUser');
        const savedSource = localStorage.getItem('telegramUserSource');
        
        console.log('💾 Checking localStorage...');
        console.log('💾 savedUser:', savedUser ? 'exists' : 'none');
        console.log('💾 savedSource:', savedSource);
        
        if (savedUser && savedSource) {
          try {
            const parsedUser = JSON.parse(savedUser);
            
            // بررسی که کاربر نمونه نباشد
            if (parsedUser.id === 123456789) {
              console.log('🗑️ Sample user detected in localStorage - clearing...');
              localStorage.removeItem('telegramUser');
              localStorage.removeItem('telegramUserSource');
            } else {
              console.log('✅ Using saved user data from localStorage:', parsedUser);
              setUserInfo(parsedUser);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('❌ Failed to parse saved user data:', e);
            localStorage.removeItem('telegramUser');
            localStorage.removeItem('telegramUserSource');
          }
        } else if (savedUser) {
          // پاک کردن localStorage قدیمی که بدون source هست
          console.log('🗑️ Clearing old localStorage without source');
          localStorage.removeItem('telegramUser');
        }

        // هیچ کاربر تلگرامی پیدا نشد
        console.log('❌ No Telegram user found - user must login via Telegram');
        setUserInfo(null);
        setLoading(false);
        
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to connect to Telegram');
        setLoading(false);
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(initializeApp, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return { userInfo, loading, error };
}

