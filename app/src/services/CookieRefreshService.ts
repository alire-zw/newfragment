import pool from '../database/connection';
import puppeteer from 'puppeteer';

interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  expirationDate?: number;
}

interface TestResult {
  username: boolean;
  price: boolean;
  premium: boolean;
}

class CookieRefreshService {
  private browser: any = null;
  private page: any = null;
  private isRunning = false;

  async start() {
    if (this.isRunning) {
      console.log('🔄 [COOKIE-SERVICE] Service already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 [COOKIE-SERVICE] Starting cookie refresh service...');

    // اجرای اولیه
    await this.refreshCookies();

    // تنظیم interval برای هر 5 دقیقه
    setInterval(async () => {
      if (this.isRunning) {
        await this.refreshCookies();
      }
    }, 5 * 60 * 1000); // 5 دقیقه

    console.log('✅ [COOKIE-SERVICE] Service started successfully');
  }

  async stop() {
    this.isRunning = false;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log('🛑 [COOKIE-SERVICE] Service stopped');
  }

  private async initBrowser() {
    if (this.browser) return;

    console.log('🌐 [COOKIE-SERVICE] Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: true, // در production از headless استفاده می‌کنیم
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0');
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  private async refreshCookies() {
    const startTime = Date.now();
    let status: 'success' | 'failed' | 'partial' = 'failed';
    let message = '';
    let cookiesCount = 0;
    let testResults: TestResult = { username: false, price: false, premium: false };

    try {
      console.log('🔄 [COOKIE-SERVICE] Starting cookie refresh...');

      await this.initBrowser();

      // رفتن به صفحه marketapp.ws
      console.log('🌐 [COOKIE-SERVICE] Navigating to marketapp.ws...');
      await this.page.goto('https://marketapp.ws/fragment/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // صبر برای بارگذاری کامل صفحه
      await new Promise(resolve => setTimeout(resolve, 3000));

      // دریافت کوکی‌های موجود از دیتابیس
      let existingCookies = await this.getExistingCookies();
      
      // اگر کوکی‌ای در دیتابیس نیست، از cookieManager استفاده کن
      if (existingCookies.length === 0) {
        console.log('🍪 [COOKIE-SERVICE] No cookies in database, using fallback cookies...');
        const { getCurrentCookiesSync } = await import('../utils/cookieManager');
        const fallbackCookies = getCurrentCookiesSync();
        
        // تبدیل fallback cookies به فرمت Puppeteer
        existingCookies = Object.entries(fallbackCookies).map(([name, value]) => ({
          name,
          value: value || '',
          domain: name === 'session' ? 'marketapp.ws' : '.marketapp.ws',
          path: '/',
          secure: name === 'session',
          httpOnly: name === 'session',
          sameSite: name === 'session' ? 'Lax' : 'None'
        }));
      }
      
      if (existingCookies.length > 0) {
        console.log('🍪 [COOKIE-SERVICE] Setting existing cookies...');
        await this.page.setCookie(...existingCookies);
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
        console.log('✅ [COOKIE-SERVICE] Cookies set, waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // استخراج کوکی‌های جدید
      const newCookies = await this.page.cookies();
      console.log(`📊 [COOKIE-SERVICE] Extracted ${newCookies.length} cookies`);

      // تست کوکی‌ها
      testResults = await this.testCookies(newCookies);
      console.log('🧪 [COOKIE-SERVICE] Test results:', testResults);

      // ذخیره کوکی‌های جدید در دیتابیس
      if (newCookies.length > 0) {
        await this.saveCookiesToDatabase(newCookies);
        cookiesCount = newCookies.length;
        status = 'success';
        message = `Successfully refreshed ${cookiesCount} cookies`;
      } else {
        status = 'failed';
        message = 'No cookies extracted';
      }

    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Cookie refresh failed:', error);
      status = 'failed';
      message = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      // لاگ کردن نتیجه
      await this.logRefreshResult(status, message, cookiesCount, testResults);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ [COOKIE-SERVICE] Refresh completed in ${duration}ms`);
    }
  }

  private async getExistingCookies(): Promise<CookieData[]> {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(`
        SELECT c.name, c.value, c.domain, c.path, c.secure, c.httpOnly, c.sameSite, c.expirationDate
        FROM cookies c
        WHERE c.isActive = TRUE
        ORDER BY c.id
      `);
      conn.release();

      console.log('🍪 [COOKIE-SERVICE] Retrieved existing cookies:', (rows as any[]).length);
      return (rows as any[]).map(row => ({
        name: row.name,
        value: row.value,
        domain: row.domain,
        path: row.path,
        secure: Boolean(row.secure),
        httpOnly: Boolean(row.httpOnly),
        sameSite: row.sameSite,
        expirationDate: row.expirationDate
      }));
    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Error getting existing cookies:', error);
      return [];
    }
  }

  private async testCookies(cookies: any[]): Promise<TestResult> {
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const results: TestResult = { username: false, price: false, premium: false };

    try {
      // تست Username API
      const usernameTest = await this.page.evaluate(async (cookies: string) => {
        try {
          const response = await fetch('https://marketapp.ws/fragment/stars/recipient/', {
            method: 'POST',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
            },
            body: JSON.stringify({ username: 'test_user' })
          });
          return response.ok && response.headers.get('content-type')?.includes('application/json');
        } catch {
          return false;
        }
      }, cookieString);

      // تست Price API
      const priceTest = await this.page.evaluate(async (cookies: string) => {
        try {
          const response = await fetch('https://marketapp.ws/fragment/stars/price/', {
            method: 'POST',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
            },
            body: JSON.stringify({ quantity: 50 })
          });
          return response.ok && response.headers.get('content-type')?.includes('application/json');
        } catch {
          return false;
        }
      }, cookieString);

      // تست Premium API
      const premiumTest = await this.page.evaluate(async (cookies: string) => {
        try {
          const response = await fetch('https://marketapp.ws/fragment/premium/recipient/', {
            method: 'POST',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
            },
            body: JSON.stringify({ username: 'test_user', months: 6 })
          });
          return response.ok && response.headers.get('content-type')?.includes('application/json');
        } catch {
          return false;
        }
      }, cookieString);

      results.username = usernameTest;
      results.price = priceTest;
      results.premium = premiumTest;

    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Error testing cookies:', error);
    }

    return results;
  }

  private async saveCookiesToDatabase(cookies: any[]) {
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction();

      // غیرفعال کردن کوکی‌های قبلی
      await conn.execute('UPDATE cookies SET isActive = FALSE WHERE isActive = TRUE');

      // ذخیره کوکی‌های جدید
      const cookieIds: number[] = [];
      
      for (const cookie of cookies) {
        const [result] = await conn.execute(`
          INSERT INTO cookies (name, value, domain, path, secure, httpOnly, sameSite, expirationDate, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        `, [
          cookie.name || '',
          cookie.value || '',
          cookie.domain || '',
          cookie.path || '/',
          cookie.secure || false,
          cookie.httpOnly || false,
          cookie.sameSite || 'None',
          cookie.expires ? Math.floor(cookie.expires) : null
        ]);

        cookieIds.push((result as any).insertId);
      }

      // غیرفعال کردن active_cookies قبلی
      await conn.execute('UPDATE active_cookies SET testResult = FALSE');

      // ایجاد active_cookies جدید
      const cookieString = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

      await conn.execute(`
        INSERT INTO active_cookies (cookieId, cookieString, testResult)
        VALUES (?, ?, TRUE)
      `, [cookieIds[0], cookieString]);

      console.log('🍪 [COOKIE-SERVICE] Saved cookie string:', cookieString.substring(0, 100) + '...');

      await conn.commit();
      console.log('✅ [COOKIE-SERVICE] Cookies saved to database');

    } catch (error) {
      await conn.rollback();
      console.error('❌ [COOKIE-SERVICE] Error saving cookies:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  private async logRefreshResult(
    status: 'success' | 'failed' | 'partial',
    message: string,
    cookiesCount: number,
    testResults: TestResult
  ) {
    try {
      const conn = await pool.getConnection();
      await conn.execute(`
        INSERT INTO cookie_refresh_logs (status, message, cookiesCount, testResults)
        VALUES (?, ?, ?, ?)
      `, [status, message, cookiesCount, JSON.stringify(testResults)]);
      conn.release();
    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Error logging result:', error);
    }
  }

  // متد برای دریافت کوکی‌های فعال از دیتابیس
  async getActiveCookies(): Promise<{ [key: string]: string }> {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(`
        SELECT c.name, c.value
        FROM cookies c
        WHERE c.isActive = TRUE
        ORDER BY c.id
      `);
      conn.release();

      const cookies: { [key: string]: string } = {};
      (rows as any[]).forEach(row => {
        cookies[row.name] = row.value;
      });

      console.log('🍪 [COOKIE-SERVICE] Retrieved active cookies:', Object.keys(cookies).length);
      return cookies;
    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Error getting active cookies:', error);
      return {};
    }
  }

  // متد برای دریافت cookie string
  async getActiveCookieString(): Promise<string> {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(`
        SELECT cookieString
        FROM active_cookies
        WHERE testResult = TRUE
        ORDER BY id DESC
        LIMIT 1
      `);
      conn.release();

      if ((rows as any[]).length > 0) {
        console.log('🍪 [COOKIE-SERVICE] Retrieved cookie string from database');
        return (rows as any[])[0].cookieString;
      }

      return '';
    } catch (error) {
      console.error('❌ [COOKIE-SERVICE] Error getting cookie string:', error);
      return '';
    }
  }
}

export default CookieRefreshService;
