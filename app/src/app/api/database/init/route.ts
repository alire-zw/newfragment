import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../../database/init';

export async function POST() {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'دیتابیس با موفقیت ایجاد شد'
    });
    
  } catch (error) {
    console.error('❌ خطا در ایجاد دیتابیس:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در ایجاد دیتابیس',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
