import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';
import { requireAuth, requireOwnership, handleAuthError } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // 🔒 احراز هویت
    const authenticatedUserId = await requireAuth(request);

    const body = await request.json();
    const { virtualNumberID } = body;

    // بررسی وجود پارامترهای لازم
    if (!virtualNumberID) {
      return NextResponse.json({
        success: false,
        message: 'شناسه شماره مجازی ارسال نشده است'
      }, { status: 400 });
    }

    // دریافت request_id از دیتابیس
    const conn = await pool.getConnection();
    
    console.log('🔍 Searching for virtualNumberID:', virtualNumberID);
    
    try {
      // ابتدا با virtualNumberID جستجو می‌کنیم
      let [rows] = await conn.execute(
        `SELECT requestID, number, country, service
         FROM virtual_numbers 
         WHERE virtualNumberID = ? AND isActive = true`,
        [virtualNumberID]
      );

      // اگر پیدا نشد، با request_id جستجو می‌کنیم
      if (!Array.isArray(rows) || rows.length === 0) {
        console.log('🔍 Not found by virtualNumberID, trying with request_id pattern');
        const requestId = virtualNumberID.replace('VN_', '');
        [rows] = await conn.execute(
          `SELECT requestID, number, country, service
           FROM virtual_numbers 
           WHERE requestID = ? AND isActive = true`,
          [requestId]
        );
      }

      console.log('📊 Database query result:', {
        virtualNumberID,
        rowsFound: Array.isArray(rows) ? rows.length : 0
      });

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'شماره مجازی یافت نشد یا غیرفعال است'
        }, { status: 404 });
      }

      const virtualNumber = rows[0] as {
        requestID: string;
        number: string;
        country: string;
        service: string;
      };
      
      // 🔒 بررسی اینکه شماره مجازی متعلق به کاربر است
      const [ownerRows] = await conn.execute(
        'SELECT userTelegramID FROM virtual_numbers WHERE virtualNumberID = ? OR requestID = ?',
        [virtualNumberID, virtualNumberID.replace('VN_', '')]
      );
      
      if (Array.isArray(ownerRows) && ownerRows.length > 0) {
        const ownerTelegramID = (ownerRows[0] as { userTelegramID: number }).userTelegramID;
        await requireOwnership(request, ownerTelegramID, false);
      }

      // دریافت کد از API خارجی
      const requestId = virtualNumber.requestID;
      const token = '221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1';
      const apiUrl = `https://api.ozvinoo.xyz/web/${token}/getCode/${requestId}`;
      
      console.log('🌐 Calling getCode API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GetCode API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('توکن احراز هویت نامعتبر است');
        } else if (response.status === 404) {
          throw new Error('شماره مجازی یافت نشد یا کد هنوز آماده نیست');
        } else if (response.status === 500) {
          throw new Error('خطای داخلی سرور سرویس دهنده');
        } else {
          throw new Error(`خطا در دریافت کد: ${response.status}`);
        }
      }

      const apiData = await response.json();
      console.log('✅ GetCode API Response:', apiData);

      // بررسی وضعیت پاسخ
      if (apiData.error_code === 'wait_code') {
        return NextResponse.json({
          success: false,
          message: 'کد تأیید هنوز دریافت نشده است. لطفاً چند لحظه دیگر تلاش کنید.',
          data: {
            status: 'waiting',
            error_code: apiData.error_code,
            error_msg: apiData.error_msg
          }
        }, { status: 202 }); // 202 Accepted - درخواست پذیرفته شده اما هنوز پردازش نشده
      }

      // بررسی موفقیت‌آمیز بودن پاسخ
      if (!apiData.code) {
        throw new Error('کد تأیید دریافت نشد');
      }

      // ذخیره کد در دیتابیس (اختیاری - برای تاریخچه)
      await conn.execute(
        `UPDATE virtual_numbers 
         SET updatedAt = CURRENT_TIMESTAMP 
         WHERE virtualNumberID = ?`,
        [virtualNumberID]
      );

      return NextResponse.json({
        success: true,
        message: 'کد تأیید با موفقیت دریافت شد',
        data: {
          virtualNumberID: virtualNumberID,
          number: virtualNumber.number,
          request_id: virtualNumber.requestID,
          country: virtualNumber.country,
          service: virtualNumber.service,
          code: apiData.code,
          receivedAt: new Date().toISOString()
        }
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('❌ خطا در دریافت کد تأیید:', error);
    
    return NextResponse.json({
      success: false,
      message: message || (error instanceof Error ? error.message : 'خطای داخلی سرور')
    }, { status: status || 500 });
  }
}