import { NextResponse } from 'next/server';

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'سرور در حال اجرا است',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0
  });
}
