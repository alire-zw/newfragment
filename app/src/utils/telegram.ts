// Telegram WebApp utility functions

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  initDataUnsafe: {
    user?: TelegramUser;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink?: (url: string, options?: { try_browser?: boolean }) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Check if Telegram WebApp is available
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

// Get Telegram WebApp instance
export function getTelegramWebApp(): TelegramWebApp | null {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp || null;
  }
  return null;
}

// Initialize Telegram WebApp
export function initializeTelegramWebApp(): void {
  try {
    const tg = getTelegramWebApp();
    if (tg && typeof tg.ready === 'function') {
      tg.ready();
      console.log('Telegram WebApp initialized');
      if (typeof tg.expand === 'function') {
        tg.expand();
      }
    }
  } catch (error) {
    console.warn('Failed to initialize Telegram WebApp:', error);
  }
}

// Get user info from Telegram WebApp
export function getTelegramUser(): TelegramUser | null {
  try {
    const tg = getTelegramWebApp();
    console.log('📱 Full initDataUnsafe:', tg?.initDataUnsafe);
    console.log('📱 initData (raw):', (tg as any)?.initData);
    return tg?.initDataUnsafe?.user || null;
  } catch (error) {
    console.warn('Error getting Telegram user:', error);
    return null;
  }
}

// Parse user data from URL hash
export function parseUserFromHash(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash;
  if (!hash.includes('tgWebAppData')) return null;
  
  try {
    const tgWebAppDataMatch = hash.match(/tgWebAppData=([^&]+)/);
    if (!tgWebAppDataMatch) return null;
    
    const tgWebAppData = tgWebAppDataMatch[1];
    const decodedData = decodeURIComponent(tgWebAppData);
    const userMatch = decodedData.match(/user=([^&]+)/);
    if (!userMatch) return null;
    
    const userData = userMatch[1];
    const decodedUser = decodeURIComponent(userData);
    const user = JSON.parse(decodedUser);
    
    console.log('User data parsed from hash:', user);
    return user;
    
  } catch (error) {
    console.error('Failed to parse user data from hash:', error);
    return null;
  }
}

// Setup main button
export function setupMainButton(text: string, callback: () => void) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(callback);
    tg.MainButton.show();
  }
}

// Hide main button
export function hideMainButton() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.MainButton.hide();
  }
}

// Setup back button
export function setupBackButton(callback: () => void) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.BackButton.onClick(callback);
    tg.BackButton.show();
  }
}

// Hide back button
export function hideBackButton() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.BackButton.hide();
  }
}

// Detect Telegram environment
export function detectTelegramEnvironment(): void {
  if (typeof window === 'undefined') return;
  
  const hash = window.location.hash;
  if (hash.includes('tgWebAppData')) {
    console.log('Telegram WebApp detected via URL hash');
    const userFromHash = parseUserFromHash();
    if (userFromHash) {
      console.log('User data available in hash');
    }
  }
}

// Open link strictly inside Telegram WebApp when possible
export function openLinkInTelegramWebApp(url: string): void {
  try {
    const tg = getTelegramWebApp();
    if (tg && typeof tg.openLink === 'function') {
      try {
        tg.openLink(url, { try_browser: false });
        return;
      } catch (e) {
        // fallback below
      }
    }
  } catch (_) {
    // ignore
  }
  // Fallback: navigate in the same webview/tab
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
}
