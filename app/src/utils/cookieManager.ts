// Cookie management utility
export interface CookieInfo {
  session: string;
  _ym_uid: string;
  _ym_d: string;
  _ym_isad: string;
  _ym_visorc: string;
  __js_p_: string;
  __jhash_: string;
  __jua_: string;
  __hash_: string;
  __lhash_?: string;
}

// Current cookies (these should be updated when they expire)
let currentCookies: CookieInfo = {
  session: 'eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjM5ZmRkYjA1NDVhMjhkNDYiLCAiYWRkcmVzcyI6ICIwOjcwMGZkOGI5MmIzMmNiYWE3MzkyMmM0OTYyZDk3MDEyN2E2NmJjYTVjYzllMjdiOWE2MmJiMTQxZGQ0NjM3ZTciLCAicmVmIjogImNBX1l1U3N5eTZwemtpeEpZdGx3RW5wbXZLWE1uaWU1cGl1eFFkMUdOLWM9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aP603g.9u4n9oH59ND22OyKagKXcqLomhY',
  _ym_uid: '1759356516526866044',
  _ym_d: '1761427522',
  _ym_isad: '2',
  _ym_visorc: 'w',
  __js_p_: '898,1800,0,0,0',
  __jhash_: '508',
  __jua_: 'Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A144.0%29%20Gecko%2F20100101%20Firefox%2F144.0',
  __hash_: '1f07f1fcaffb566dc794f0f3b008bf81',
  __lhash_: '0ae13e3b868640bc6614c9e5634497f7'
};

export const getCurrentCookies = (): CookieInfo => {
  return currentCookies;
};

// Update cookies (for when they expire)
export const updateCookies = (newCookies: CookieInfo): void => {
  currentCookies = { ...newCookies };
  console.log('🍪 [COOKIE-MANAGER] Cookies updated successfully');
};

// Get alternative cookies (fallback options)
export const getAlternativeCookies = (): CookieInfo[] => {
  return [
    // Alternative cookie set 1
    {
      session: 'eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjM5ZmRkYjA1NDVhMjhkNDYiLCAiYWRkcmVzcyI6ICIwOjcwMGZkOGI5MmIzMmNiYWE3MzkyMmM0OTYyZDk3MDEyN2E2NmJjYTVjYzllMjdiOWE2MmJiMTQxZGQ0NjM3ZTciLCAicmVmIjogImNBX1l1U3N5eTZwemtpeEpZdGx3RW5wbXZLWE1uaWU1cGl1eFFkMUdOLWM9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aP1AVA.hkYebsmfsVt3vMj66_cWOifI1BI',
      _ym_uid: '1759356516526866044',
      _ym_d: '1761427522',
      _ym_isad: '2',
      _ym_visorc: 'w',
      __js_p_: '525,1800,0,0,0',
      __jhash_: '861',
      __jua_: 'Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A144.0%29%20Gecko%2F20100101%20Firefox%2F144.0',
      __hash_: '1f07f1fcaff276528794f0f3b008bf81'
    }
  ];
};

// Convert cookies to string format
export const cookiesToString = (cookies: CookieInfo): string => {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

// Check if HTML response indicates expired cookies
export const isCookieExpired = (htmlText: string): boolean => {
  return htmlText.includes('login') || 
         htmlText.includes('signin') || 
         htmlText.includes('auth') ||
         htmlText.includes('session') ||
         htmlText.includes('expired');
};

// Check if response indicates rate limiting
export const isRateLimited = (htmlText: string): boolean => {
  return htmlText.includes('rate limit') || 
         htmlText.includes('blocked') || 
         htmlText.includes('forbidden') ||
         htmlText.includes('too many requests');
};
