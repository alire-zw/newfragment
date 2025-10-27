import { NextRequest } from 'next/server';
import { UserService } from '@/database/UserService';

interface AuthenticatedUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

/**
 * دریافت اطلاعات کاربر احراز هویت شده از request headers
 * این اطلاعات توسط middleware تنظیم شده‌اند
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser {
  const userId = request.headers.get('X-User-Id');
  const userData = request.headers.get('X-User-Data');

  if (!userId || !userData) {
    throw new Error('کاربر احراز هویت نشده است');
  }

  try {
    // دیکد base64 برای سازگاری با emoji و کاراکترهای unicode
    const userDataJson = Buffer.from(userData, 'base64').toString('utf-8');
    const user = JSON.parse(userDataJson);
    return user;
  } catch (error) {
    throw new Error('اطلاعات کاربر نامعتبر است');
  }
}

/**
 * دریافت شناسه تلگرام کاربر احراز هویت شده
 */
export function getAuthenticatedUserId(request: NextRequest): number {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    throw new Error('کاربر احراز هویت نشده است');
  }

  return parseInt(userId);
}

/**
 * احراز هویت ساده - فقط چک می‌کند که کاربر لاگین است
 * @throws Error اگر کاربر احراز هویت نشده باشد
 */
export async function requireAuth(request: NextRequest): Promise<number> {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    throw new Error('احراز هویت الزامی است');
  }

  return parseInt(userId);
}

/**
 * احراز هویت با چک ادمین
 * @throws Error اگر کاربر احراز هویت نشده یا ادمین نباشد
 */
export async function requireAdmin(request: NextRequest): Promise<number> {
  const userId = await requireAuth(request);
  const isAdmin = await UserService.isUserAdmin(userId);

  if (!isAdmin) {
    throw new Error('دسترسی ادمین الزامی است');
  }

  return userId;
}

/**
 * بررسی اینکه کاربر احراز هویت شده صاحب منبع است
 * @param request درخواست HTTP
 * @param resourceOwnerId شناسه صاحب منبع (مثلاً کیف پول یا تراکنش)
 * @param allowAdmin اگر true باشد، ادمین‌ها هم اجازه دسترسی دارند
 * @throws Error اگر کاربر دسترسی نداشته باشد
 */
export async function requireOwnership(
  request: NextRequest,
  resourceOwnerId: number,
  allowAdmin: boolean = true
): Promise<number> {
  const userId = await requireAuth(request);

  // اگر کاربر صاحب منبع است، اجازه بده
  if (userId === resourceOwnerId) {
    return userId;
  }

  // اگر allowAdmin فعال است، بررسی کن که ادمین است یا نه
  if (allowAdmin) {
    try {
      const isAdmin = await UserService.isUserAdmin(userId);
      if (isAdmin) {
        // Admin accessing resource
        return userId;
      }
    } catch (error) {
      console.error(`❌ [AUTH] Error checking admin status for ${userId}:`, error);
      // در صورت خطا در بررسی ادمین، ادامه بده و دسترسی را رد کن
    }
  }

  // Access denied
  throw new Error('شما دسترسی به این منبع ندارید');
}

/**
 * wrapper برای handle کردن خطاهای احراز هویت
 */
export function withAuth<T>(
  handler: (request: NextRequest, userId: number, ...args: any[]) => Promise<T>
) {
  return async (request: NextRequest, ...args: any[]): Promise<T> => {
    try {
      const userId = await requireAuth(request);
      return await handler(request, userId, ...args);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * wrapper برای handle کردن خطاهای دسترسی ادمین
 */
export function withAdmin<T>(
  handler: (request: NextRequest, adminId: number, ...args: any[]) => Promise<T>
) {
  return async (request: NextRequest, ...args: any[]): Promise<T> => {
    try {
      const adminId = await requireAdmin(request);
      return await handler(request, adminId, ...args);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Helper برای handle کردن خطاها و برگرداندن پاسخ JSON مناسب
 */
export function handleAuthError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message.includes('احراز هویت الزامی است') || 
        error.message.includes('احراز هویت نشده')) {
      return { message: error.message, status: 401 };
    }
    
    if (error.message.includes('دسترسی ادمین') || 
        error.message.includes('دسترسی به این منبع ندارید')) {
      return { message: error.message, status: 403 };
    }
    
    return { message: error.message, status: 500 };
  }
  
  return { message: 'خطای ناشناخته', status: 500 };
}

