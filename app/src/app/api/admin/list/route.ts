import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/database/UserService';

export async function GET(request: NextRequest) {
  try {
    const admins = await UserService.getAdmins();
    
    return NextResponse.json({ admins });
  } catch (error) {
    console.error('خطا در دریافت لیست ادمین‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست ادمین‌ها' },
      { status: 500 }
    );
  }
}
