import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';
import { requireAdmin, handleAuthError } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    const admins = await UserService.getAdmins();

    console.log('✅ [ADMIN] Admin list viewed by admin:', adminId);
    
    return NextResponse.json({ admins });
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در دریافت لیست ادمین‌ها:', error);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
