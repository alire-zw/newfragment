const puppeteer = require('puppeteer');
const axios = require('axios');
const mysql = require('mysql2/promise');

async function testCookies() {
  console.log('🚀 [COOKIE-TEST] Starting cookie test...');
  
  let browser;
  try {
    // دریافت کوکی‌ها از دیتابیس
    console.log('🍪 [COOKIE-TEST] Getting cookies from database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Alireza1380#',
      database: process.env.DB_NAME || 'franumbot_db'
    });
    
    const [rows] = await connection.execute(`
      SELECT c.name, c.value, c.domain, c.path, c.secure, c.httpOnly, c.sameSite, c.expirationDate
      FROM cookies c
      WHERE c.isActive = TRUE
      ORDER BY c.id
    `);
    
    await connection.end();
    
    if (rows.length === 0) {
      console.log('❌ [COOKIE-TEST] No active cookies found in database');
      return;
    }
    
    console.log('📊 [COOKIE-TEST] Found cookies in database:', rows.length);
    
    // تبدیل به فرمت string
    const cookieString = rows
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    console.log('🍪 [COOKIE-TEST] Cookie string:', cookieString.substring(0, 100) + '...');
    
    // راه‌اندازی browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0');
    
    console.log('🌐 [COOKIE-TEST] Navigating to marketapp.ws...');
    await page.goto('https://marketapp.ws/fragment/', { waitUntil: 'domcontentloaded' });
    
    // تنظیم کوکی‌ها در مرورگر
    console.log('🍪 [COOKIE-TEST] Setting cookies in browser...');
    const cookiesToSet = rows.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: Boolean(cookie.secure),
      httpOnly: Boolean(cookie.httpOnly),
      sameSite: cookie.sameSite || 'None',
      expirationDate: cookie.expirationDate ? new Date(cookie.expirationDate).getTime() / 1000 : undefined
    }));
    
    await page.setCookie(...cookiesToSet);
    console.log('✅ [COOKIE-TEST] Cookies set in browser');
    
    // رفرش صفحه برای اعمال کوکی‌ها
    console.log('🔄 [COOKIE-TEST] Reloading page to apply cookies...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // استخراج کوکی‌های جدید از مرورگر
    console.log('🍪 [COOKIE-TEST] Extracting updated cookies...');
    const updatedCookies = await page.cookies();
    
    // فیلتر کردن کوکی‌های مربوط به marketapp.ws
    const marketappCookies = updatedCookies.filter(cookie => 
      cookie.domain.includes('marketapp.ws') || 
      cookie.domain.includes('.marketapp.ws')
    );
    
    console.log('📊 [COOKIE-TEST] Updated cookies:', marketappCookies.length);
    
    // تبدیل به فرمت string جدید
    const updatedCookieString = marketappCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    console.log('🍪 [COOKIE-TEST] Updated cookie string:', updatedCookieString.substring(0, 100) + '...');
    
    // تست کوکی‌ها با axios
    console.log('\n🧪 [COOKIE-TEST] Testing cookies with axios...');
    
    try {
      // تست Username API
      console.log('1️⃣ [COOKIE-TEST] Testing Username API...');
      const usernameResponse = await axios.post('https://marketapp.ws/fragment/stars/recipient/', 
        { username: 'alire_zw' },
        {
          headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Content-Length': '23',
            'Content-Type': 'application/json',
            'Cookie': updatedCookieString,
            'Host': 'marketapp.ws',
            'Origin': 'https://marketapp.ws',
            'Referer': 'https://marketapp.ws/fragment/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
          },
          timeout: 15000
        }
      );
      
      console.log('  - Status:', usernameResponse.status);
      console.log('  - Content-Type:', usernameResponse.headers['content-type']);
      console.log('  - Is JSON:', usernameResponse.headers['content-type']?.includes('application/json'));
      
      if (usernameResponse.headers['content-type']?.includes('application/json')) {
        console.log('  - Data:', JSON.stringify(usernameResponse.data, null, 2));
        console.log('✅ [COOKIE-TEST] Username API working!');
      } else {
        console.log('  - Data (HTML):', usernameResponse.data.substring(0, 200) + '...');
        console.log('❌ [COOKIE-TEST] Username API still returning HTML');
      }
      
    } catch (error) {
      console.log('  - Error:', error.message);
      if (error.response) {
        console.log('  - Response Status:', error.response.status);
        const data = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
        console.log('  - Response Data:', data.substring(0, 200) + '...');
      }
    }
    
    try {
      // تست Price API
      console.log('\n2️⃣ [COOKIE-TEST] Testing Price API...');
      const priceResponse = await axios.post('https://marketapp.ws/fragment/stars/price/', 
        { quantity: 50 },
        {
          headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Content-Length': '18',
            'Content-Type': 'application/json',
            'Cookie': updatedCookieString,
            'Host': 'marketapp.ws',
            'Origin': 'https://marketapp.ws',
            'Referer': 'https://marketapp.ws/fragment/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0'
          },
          timeout: 30000
        }
      );
      
      console.log('  - Status:', priceResponse.status);
      console.log('  - Content-Type:', priceResponse.headers['content-type']);
      console.log('  - Is JSON:', priceResponse.headers['content-type']?.includes('application/json'));
      
      if (priceResponse.headers['content-type']?.includes('application/json')) {
        console.log('  - Data:', JSON.stringify(priceResponse.data, null, 2));
        console.log('✅ [COOKIE-TEST] Price API working!');
      } else {
        console.log('  - Data (HTML):', priceResponse.data.substring(0, 200) + '...');
        console.log('❌ [COOKIE-TEST] Price API still returning HTML');
      }
      
    } catch (error) {
      console.log('  - Error:', error.message);
      if (error.response) {
        console.log('  - Response Status:', error.response.status);
        const data = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
        console.log('  - Response Data:', data.substring(0, 200) + '...');
      }
    }
    
    // ذخیره کوکی‌ها در دیتابیس
    console.log('\n💾 [COOKIE-TEST] Saving cookies to database...');
    
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Alireza1380#',
        database: process.env.DB_NAME || 'franumbot_db'
      });
      
      await connection.beginTransaction();
      
      // غیرفعال کردن کوکی‌های قبلی
      await connection.execute('UPDATE cookies SET isActive = FALSE WHERE isActive = TRUE');
      await connection.execute('UPDATE active_cookies SET testResult = FALSE');
      
      // ذخیره کوکی‌های جدید
      const cookieIds = [];
      
      for (const cookie of marketappCookies) {
        const [result] = await connection.execute(`
          INSERT INTO cookies (name, value, domain, path, secure, httpOnly, sameSite, expirationDate, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        `, [
          cookie.name,
          cookie.value,
          cookie.domain,
          cookie.path,
          cookie.secure,
          cookie.httpOnly,
          cookie.sameSite || 'None',
          cookie.expirationDate ? new Date(cookie.expirationDate * 1000) : null
        ]);
        
        cookieIds.push(result.insertId);
      }
      
      // ایجاد active_cookies جدید
      await connection.execute(`
        INSERT INTO active_cookies (cookieId, cookieString, testResult)
        VALUES (?, ?, TRUE)
      `, [cookieIds[0], updatedCookieString]);
      
      // لاگ کردن نتیجه
      await connection.execute(`
        INSERT INTO cookie_refresh_logs (status, message, cookiesCount, testResults)
        VALUES (?, ?, ?, ?)
      `, ['success', 'Cookies updated from fresh test', marketappCookies.length, JSON.stringify({username: false, price: false, premium: false})]);
      
      await connection.commit();
      console.log('✅ [COOKIE-TEST] Cookies saved to database successfully!');
      
      await connection.end();
    } catch (dbError) {
      console.error('❌ [COOKIE-TEST] Database error:', dbError.message);
    }
    
    // ذخیره کوکی‌ها در فایل
    const fs = require('fs');
    const cookieData = {
      timestamp: new Date().toISOString(),
      cookies: marketappCookies,
      cookieString: cookieString
    };
    
    await fs.promises.writeFile('cookie-test-result.json', JSON.stringify(cookieData, null, 2));
    console.log('💾 [COOKIE-TEST] Cookies saved to cookie-test-result.json');
    
    console.log('\n✅ [COOKIE-TEST] Test completed!');
    
  } catch (error) {
    console.error('❌ [COOKIE-TEST] Test failed:', error);
  } finally {
    if (browser) {
      console.log('⏳ [COOKIE-TEST] Keeping browser open for 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await browser.close();
    }
  }
}

testCookies();
