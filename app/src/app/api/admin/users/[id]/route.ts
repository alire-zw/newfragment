import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../../database/UserService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('خطا در دریافت جزئیات کاربر:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت جزئیات کاربر' },
      { status: 500 }
    );
  }
}
