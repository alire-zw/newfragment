import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { mobile, nationalCode } = await request.json();

    // اعتبارسنجی ورودی‌ها
    if (!mobile || !nationalCode) {
      return NextResponse.json(
        { message: 'شماره موبایل و کد ملی الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت کد ملی
    if (!/^\d{10}$/.test(nationalCode)) {
      return NextResponse.json(
        { message: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت شماره موبایل
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { message: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    try {
      // درخواست به API زیبال
      const shahkarResponse = await fetch('https://sandbox.zibal.ir/v1/facility/shahkarInquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ca2325c1ab61456a8a7d2104c93646dc',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          mobile: mobile,
          nationalCode: nationalCode
        })
      });

      // بررسی وضعیت پاسخ
      if (!shahkarResponse.ok) {
        console.error('❌ Shahkar API Error:', {
          status: shahkarResponse.status,
          statusText: shahkarResponse.statusText
        });
        
        const errorText = await shahkarResponse.text();
        console.error('❌ Error Response:', errorText);
        
        return NextResponse.json({
          success: false,
          message: 'خطا در ارتباط با سرویس احراز هویت'
        });
      }

      const responseText = await shahkarResponse.text();
      console.log('🔍 Raw Response:', responseText);
      
      let shahkarData;
      try {
        shahkarData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response was not JSON:', responseText);
        
        return NextResponse.json({
          success: false,
          message: 'پاسخ نامعتبر از سرویس احراز هویت'
        });
      }

      console.log('🔍 Shahkar API Response:', {
        mobile: mobile.substring(0, 4) + '****' + mobile.substring(7),
        nationalCode: nationalCode.substring(0, 3) + '****' + nationalCode.substring(6),
        result: shahkarData.result,
        matched: shahkarData.data?.matched,
        message: shahkarData.message
      });

      // بررسی نتیجه
      if (shahkarData.result === 1 && shahkarData.data?.matched === true) {
        return NextResponse.json({
          success: true,
          message: 'کد ملی و شماره موبایل تطبیق دارند',
          data: {
            matched: true
          }
        });
      } else if (shahkarData.result === 1 && shahkarData.data?.matched === false) {
        return NextResponse.json({
          success: false,
          message: 'کد ملی و شماره موبایل تطبیق ندارند',
          data: {
            matched: false
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: shahkarData.message || 'خطا در بررسی تطبیق',
          data: {
            matched: false
          }
        });
      }

    } catch (error) {
      console.error('❌ خطا در ارتباط با API زیبال:', error);
      return NextResponse.json(
        { 
          success: false,
          message: 'خطا در ارتباط با سرویس احراز هویت' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست احراز هویت:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'خطا در پردازش درخواست' 
      },
      { status: 500 }
    );
  }
}
