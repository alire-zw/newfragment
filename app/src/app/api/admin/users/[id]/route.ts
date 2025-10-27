import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../../database/UserService';
import { requireAdmin, handleAuthError } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    const { id } = await params;
    const userTelegramID = parseInt(id);

    if (isNaN(userTelegramID)) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر نامعتبر است' },
        { status: 400 }
      );
    }

    // دریافت اطلاعات کاربر بر اساس userTelegramID
    const user = await UserService.getUserByTelegramID(userTelegramID);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ [ADMIN] User viewed by admin:', {
      adminId,
      targetUserId: userTelegramID
    });

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('خطا در دریافت جزئیات کاربر:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
