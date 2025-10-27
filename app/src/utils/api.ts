/**
 * 🔒 Utility برای ارسال درخواست‌های امن به API
 * تمام درخواست‌ها باید از این function استفاده کنن
 */

// دریافت initData از Telegram WebApp
export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // بررسی وجود Telegram WebApp
    const webApp = (window as any).Telegram?.WebApp;
    if (!webApp) {
      console.warn('⚠️ Telegram WebApp not available');
      return null;
    }

    const initData = webApp.initData;
    if (!initData) {
      console.warn('⚠️ initData not available');
      return null;
    }

    return initData;
  } catch (error) {
    console.error('❌ Error getting initData:', error);
    return null;
  }
}

// ایجاد headers برای درخواست‌های API
export function createApiHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  // اضافه کردن initData به header
  const initData = getTelegramInitData();
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }

  return headers;
}

// Wrapper برای fetch که به صورت خودکار initData رو اضافه میکنه
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = createApiHeaders(
    options.headers as Record<string, string> || {}
  );

  return fetch(url, {
    ...options,
    headers
  });
}

// Wrapper برای GET requests
export async function apiGet<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'GET' });
  
  if (!response.ok) {
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ [API] Received HTML response instead of JSON:', {
        url,
        status: response.status,
        htmlPreview: htmlText.substring(0, 200) + '...'
      });
      throw new Error('سرور پاسخ HTML برمی‌گرداند - کوکی‌ها ممکن است منقضی شده باشند');
    }
    
    const error = await response.json().catch(() => ({ error: 'خطای ناشناخته' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Wrapper برای POST requests
export async function apiPost<T = any>(url: string, data: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ [API] Received HTML response instead of JSON:', {
        url,
        status: response.status,
        htmlPreview: htmlText.substring(0, 200) + '...'
      });
      throw new Error('سرور پاسخ HTML برمی‌گرداند - کوکی‌ها ممکن است منقضی شده باشند');
    }
    
    const error = await response.json().catch(() => ({ error: 'خطای ناشناخته' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Wrapper برای PUT requests
export async function apiPut<T = any>(url: string, data: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ [API] Received HTML response instead of JSON:', {
        url,
        status: response.status,
        htmlPreview: htmlText.substring(0, 200) + '...'
      });
      throw new Error('سرور پاسخ HTML برمی‌گرداند - کوکی‌ها ممکن است منقضی شده باشند');
    }
    
    const error = await response.json().catch(() => ({ error: 'خطای ناشناخته' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Wrapper برای DELETE requests
export async function apiDelete<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'DELETE' });
  
  if (!response.ok) {
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ [API] Received HTML response instead of JSON:', {
        url,
        status: response.status,
        htmlPreview: htmlText.substring(0, 200) + '...'
      });
      throw new Error('سرور پاسخ HTML برمی‌گرداند - کوکی‌ها ممکن است منقضی شده باشند');
    }
    
    const error = await response.json().catch(() => ({ error: 'خطای ناشناخته' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

