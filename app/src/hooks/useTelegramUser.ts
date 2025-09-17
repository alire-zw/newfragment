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
        console.log('Initializing Telegram WebApp...');
        
        // Detect Telegram environment
        detectTelegramEnvironment();
        
        // Check if Telegram WebApp is available
        if (isTelegramWebApp()) {
          console.log('Telegram WebApp found');
          
          // Initialize Telegram WebApp
          initializeTelegramWebApp();
          
          // Get user info from WebApp
          const user = getTelegramUser();
          if (user) {
            console.log('User data from WebApp:', user);
            setUserInfo(user);
            setLoading(false);
            return;
          }
        } else {
          console.log('Telegram WebApp not available, trying hash...');
          
          // Try to get user data from hash URL
          const userFromHash = parseUserFromHash();
          
          if (userFromHash) {
            console.log('User data from hash:', userFromHash);
            
            // Convert to desired format
            const user: TelegramUser = {
              id: userFromHash.id,
              first_name: userFromHash.first_name,
              last_name: userFromHash.last_name || '',
              username: userFromHash.username,
              photo_url: userFromHash.photo_url,
              language_code: userFromHash.language_code
            };
            
            setUserInfo(user);
            setLoading(false);
            return;
          }
        }

        // Check localStorage for saved user data
        const savedUser = localStorage.getItem('telegramUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('Using saved user data from localStorage');
            setUserInfo(parsedUser);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse saved user data:', e);
          }
        }

        // Fallback to sample data
        console.log('Using sample user data');
        const sampleUser: TelegramUser = {
          id: 123456789,
          first_name: "User",
          last_name: "Telegram",
          username: "telegram_user",
          photo_url: undefined,
          language_code: "fa"
        };
        
        setUserInfo(sampleUser);
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

  // Save user info to localStorage
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('telegramUser', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  return { userInfo, loading, error };
}
