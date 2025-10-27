import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';
import { requireAdmin, handleAuthError } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    const users = await UserService.getAllUsers();
    
    console.log('✅ [ADMIN] Users list viewed by admin:', adminId);
    
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در دریافت لیست کاربران:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
