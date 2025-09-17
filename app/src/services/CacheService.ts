// سرویس کش برای ذخیره داده‌ها در حافظه
class CacheService {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  // ذخیره داده در کش
  set(key: string, data: unknown, ttlMinutes: number = 30): void {
    const ttl = ttlMinutes * 60 * 1000; // تبدیل به میلی‌ثانیه
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // دریافت داده از کش
  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // بررسی انقضای کش
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // بررسی وجود داده در کش
  has(key: string): boolean {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    // بررسی انقضای کش
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // حذف داده از کش
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // پاک کردن تمام کش
  clear(): void {
    this.cache.clear();
  }

  // دریافت اطلاعات کش
  getInfo(key: string): { exists: boolean; age: number; ttl: number } | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return { exists: false, age: 0, ttl: 0 };
    }

    const now = Date.now();
    const age = now - cached.timestamp;
    
    return {
      exists: true,
      age: Math.floor(age / 1000), // سن به ثانیه
      ttl: Math.floor(cached.ttl / 1000) // TTL به ثانیه
    };
  }
}

// ایجاد instance یکتا
export const cacheService = new CacheService();
