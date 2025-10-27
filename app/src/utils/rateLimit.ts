import LRUCache from 'lru-cache';

interface RateLimitConfig {
  interval: number; // میلی‌ثانیه
  uniqueTokenPerInterval: number;
}

const limiters = new Map<string, LRUCache<string, number>>();

/**
 * Rate limiting برای API ها
 * @param identifier شناسه یکتا (مثلاً user ID یا IP)
 * @param limit تعداد مجاز درخواست
 * @param interval بازه زمانی (میلی‌ثانیه)
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  interval: number = 60000 // 1 دقیقه
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limitKey = `${limit}:${interval}`;
  
  let limiter = limiters.get(limitKey);
  
  if (!limiter) {
    limiter = new LRUCache<string, number>({
      max: 500, // حداکثر 500 کاربر را track کن
      ttl: interval,
    });
    limiters.set(limitKey, limiter);
  }

  const count = limiter.get(identifier) || 0;
  
  if (count >= limit) {
    const reset = Date.now() + interval;
    return {
      success: false,
      remaining: 0,
      reset
    };
  }

  limiter.set(identifier, count + 1);
  
  return {
    success: true,
    remaining: limit - (count + 1),
    reset: Date.now() + interval
  };
}

/**
 * Rate limiting برای اقدامات حساس (مثل تغییر تنظیمات)
 */
export async function strictRateLimit(identifier: string): Promise<boolean> {
  const result = await rateLimit(identifier, 5, 60000); // 5 بار در دقیقه
  return result.success;
}

/**
 * Rate limiting برای خریدها
 */
export async function purchaseRateLimit(identifier: string): Promise<boolean> {
  const result = await rateLimit(identifier, 10, 60000); // 10 خرید در دقیقه
  return result.success;
}

/**
 * Rate limiting برای احراز هویت
 */
export async function authRateLimit(identifier: string): Promise<boolean> {
  const result = await rateLimit(identifier, 3, 300000); // 3 بار در 5 دقیقه
  return result.success;
}

