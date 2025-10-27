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
  [key: string]: string | undefined; // برای کوکی‌های اضافی
}

// Current cookies (these should be updated when they expire)
let currentCookies: CookieInfo = {
  session: 'eyJsb2NhbGUiOiAiZW4iLCAidG9uX3Byb29mIjogIjM5ZmRkYjA1NDVhMjhkNDYiLCAiYWRkcmVzcyI6ICIwOjcwMGZkOGI5MmIzMmNiYWE3MzkyMmM0OTYyZDk3MDEyN2E2NmJjYTVjYzllMjdiOWE2MmJiMTQxZGQ0NjM3ZTciLCAicmVmIjogImNBX1l1U3N5eTZwemtpeEpZdGx3RW5wbXZLWE1uaWU1cGl1eFFkMUdOLWM9IiwgImRuc19yZWNvcmQiOiAiIiwgImFwcF9uYW1lIjogInRvbmtlZXBlciB3aW5kb3dzIiwgIm1heF9tZXNzYWdlcyI6IDR9.aP7FRw.FTdtJcxljYIc2dBmRVw6qQe6XA8',
  _ym_uid: '1759356516526866044',
  _ym_d: '1761427522',
  _ym_isad: '2',
  _ym_visorc: 'w',
  __js_p_: '106,1800,0,0,0',
  __jhash_: '566',
  __jua_: 'Mozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%3B%20rv%3A144.0%29%20Gecko%2F20100101%20Firefox%2F144.0',
  __hash_: '1f07f1fcaff2566ad794f0f3b008bf81'
};

// سرویس کوکی
let cookieService: any = null;

// Initialize cookie service
const initCookieService = async () => {
  if (!cookieService) {
    const CookieRefreshService = (await import('../services/CookieRefreshService')).default;
    cookieService = new CookieRefreshService();
  }
  return cookieService;
};

export const getCurrentCookies = async (): Promise<CookieInfo | Partial<CookieInfo>> => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'franumbot_db'
    });
    
    const [rows] = await connection.execute(`
      SELECT c.name, c.value, c.domain, c.path, c.secure, c.httpOnly, c.sameSite, c.expirationDate
      FROM cookies c
      WHERE c.isActive = TRUE
      ORDER BY c.id
    `);
    
    await connection.end();
    
    if (rows.length > 0) {
      console.log('🍪 [COOKIE-MANAGER] Using cookies from database');
      const dbCookies: Partial<CookieInfo> = {};
      rows.forEach((cookie: any) => {
        dbCookies[cookie.name as keyof CookieInfo] = cookie.value;
      });
      return dbCookies;
    }
  } catch (error) {
    console.warn('⚠️ [COOKIE-MANAGER] Failed to get cookies from database, using fallback:', error);
  }
  
  return currentCookies;
};

// Get cookies synchronously (fallback)
export const getCurrentCookiesSync = (): CookieInfo => {
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
export const cookiesToString = (cookies: CookieInfo | Partial<CookieInfo>): string => {
  return Object.entries(cookies)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

// Get cookie string from database
export const getCookieStringFromDB = async (): Promise<string> => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'franumbot_db'
    });
    
    const [rows] = await connection.execute(`
      SELECT ac.cookieString
      FROM active_cookies ac
      WHERE ac.testResult = TRUE
      ORDER BY ac.id DESC
      LIMIT 1
    `);
    
    await connection.end();
    
    if (rows.length > 0) {
      console.log('🍪 [COOKIE-MANAGER] Using cookie string from database');
      return rows[0].cookieString;
    }
  } catch (error) {
    console.warn('⚠️ [COOKIE-MANAGER] Failed to get cookie string from database:', error);
  }
  
  return cookiesToString(currentCookies);
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
