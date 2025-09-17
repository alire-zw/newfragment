import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../database/UserService';

export async function GET() {
  try {
    const users = await UserService.getAllUsers();
    
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('خطا در دریافت لیست کاربران:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لیست کاربران' },
      { status: 500 }
    );
  }
}
