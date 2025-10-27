import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // بررسی احراز هویت
    const initData = request.headers.get('X-Telegram-Init-Data');
    const userId = request.headers.get('X-User-Id');
    
    if (!initData && !userId) {
      return NextResponse.json(
        { message: 'احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    const { nationalCode, birthDate, cardNumber } = await request.json();

    // اعتبارسنجی ورودی‌ها
    if (!nationalCode || !birthDate || !cardNumber) {
      return NextResponse.json(
        { message: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی کد ملی
    if (!/^\d{10}$/.test(nationalCode)) {
      return NextResponse.json(
        { message: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره کارت
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return NextResponse.json(
        { message: 'شماره کارت باید ۱۶ رقم باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی تاریخ تولد (شمسی)
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(birthDate)) {
      return NextResponse.json(
        { message: 'فرمت تاریخ تولد نامعتبر است' },
        { status: 400 }
      );
    }

    try {
      // درخواست به API زیبال
      const zibalResponse = await fetch('https://gateway.zibal.ir/v1/facility/checkCardWithNationalCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ca2325c1ab61456a8a7d2104c93646dc',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nationalCode: nationalCode,
          birthDate: birthDate,
          cardNumber: cleanCardNumber
        })
      });

      if (!zibalResponse.ok) {
        const errorText = await zibalResponse.text();
        console.error('❌ خطا در پاسخ زیبال:', {
          status: zibalResponse.status,
          statusText: zibalResponse.statusText,
          response: errorText
        });
        
        // پارس کردن پاسخ خطا
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { result: 0, message: 'خطا در ارتباط با سرویس استعلام' };
        }
        
        // ترجمه پیام‌های خطای زیبال
        let errorMessage = 'خطا در ارتباط با سرویس استعلام';
        
        if (errorData.result === 6) {
          if (errorData.errorCode === 'CARD_NOT_FOUND') {
            errorMessage = 'کارت وارد شده در سیستم بانکی وجود ندارد';
          } else if (errorData.errorCode === 'CARD_NUMBER_NOT_VALID') {
            errorMessage = 'شماره کارت معتبر نیست';
          } else {
            errorMessage = 'کارت وارد شده در سیستم بانکی وجود ندارد';
          }
        } else if (errorData.result === 7) {
          errorMessage = 'کد ملی و شماره کارت تطبیق ندارند';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        return NextResponse.json(
          { 
            success: false,
            message: errorMessage,
            matched: false
          },
          { status: 400 }
        );
      }

      const zibalData = await zibalResponse.json();
      console.log('✅ پاسخ زیبال:', zibalData);

      // بررسی نتیجه
      if (zibalData.result === 1 && zibalData.data?.matched === true) {
        return NextResponse.json({
          success: true,
          message: 'کارت بانکی با کد ملی تطبیق دارد',
          matched: true
        });
      } else {
        // ترجمه پیام‌های خطای زیبال
        let errorMessage = 'کارت بانکی با کد ملی تطبیق ندارد';
        
        if (zibalData.result === 6) {
          errorMessage = 'کارت وارد شده در سیستم بانکی وجود ندارد';
        } else if (zibalData.result === 7) {
          errorMessage = 'کد ملی و شماره کارت تطبیق ندارند';
        } else if (zibalData.message) {
          errorMessage = zibalData.message;
        }
        
        return NextResponse.json({
          success: false,
          message: errorMessage,
          matched: false
        });
      }

    } catch (error) {
      console.error('❌ خطا در استعلام کارت بانکی:', error);
      return NextResponse.json(
        { message: 'خطا در استعلام کارت بانکی' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطا در پردازش درخواست:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}
