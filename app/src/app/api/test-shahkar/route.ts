import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین (فقط برای تست)
    await requireAdmin(request);
    console.log('🧪 Testing Shahkar API...');
    
    const testData = {
      mobile: "09123456789",
      nationalCode: "1234567890"
    };

    const response = await fetch('https://gateway.zibal.ir/v1/facility/shahkarInquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ca2325c1ab61456a8a7d2104c93646dc',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Raw Response:', responseText);

    return NextResponse.json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      isJson: (() => {
        try {
          JSON.parse(responseText);
          return true;
        } catch {
          return false;
        }
      })()
    });

  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('❌ Test Error:', error);
    return NextResponse.json({ 
      error: message
    }, { status });
  }
}
