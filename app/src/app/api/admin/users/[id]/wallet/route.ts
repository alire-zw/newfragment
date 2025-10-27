import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '../../../../../../../database/WalletService';
import { requireAdmin, handleAuthError } from '@/utils/auth';
import { logAudit, getRequestMetadata } from '@/utils/audit';
import { strictRateLimit } from '@/utils/rateLimit';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 🔒 احراز هویت و چک دسترسی ادمین
    const adminId = await requireAdmin(request);

    // 🔒 Rate limiting
    const canProceed = await strictRateLimit(`admin:wallet:${adminId}`);
    if (!canProceed) {
      return NextResponse.json(
        { success: false, error: 'تعداد درخواست‌های شما بیش از حد مجاز است' },
        { status: 429 }
      );
    }

    const { id } = await params;
    const userTelegramID = parseInt(id);
    
    if (isNaN(userTelegramID) || userTelegramID <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid User ID' }, { status: 400 });
    }

    const body = await request.json();
    const { balance } = body;

    if (typeof balance !== 'number' || isNaN(balance) || balance < 0) {
      return NextResponse.json({ success: false, error: 'Invalid balance amount' }, { status: 400 });
    }

    // ابتدا بررسی کن که کیف پول وجود دارد یا نه
    let wallet = await WalletService.getWalletByTelegramID(userTelegramID);
    
    if (!wallet) {
      // اگر کیف پول وجود نداشت، آن را بساز
      // ابتدا اطلاعات کاربر را دریافت کن
      const { UserService } = await import('../../../../../../../database/UserService');
      const user = await UserService.getUserByTelegramID(userTelegramID);
      
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      
      // کیف پول جدید بساز
      wallet = await WalletService.createWallet(user.userID, userTelegramID);
    }
    
    // حالا موجودی را به‌روزرسانی کن
    const success = await WalletService.updateWalletBalance(userTelegramID, balance);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to update wallet balance' }, { status: 500 });
    }

    // 📝 ثبت لاگ Audit
    const metadata = getRequestMetadata(request);
    await logAudit({
      userId: adminId,
      action: 'admin.update_wallet',
      resourceType: 'wallet',
      resourceId: userTelegramID.toString(),
      details: { newBalance: balance, targetUserId: userTelegramID },
      ...metadata
    });

    console.log('✅ [ADMIN] Wallet updated by admin:', {
      adminId,
      targetUserId: userTelegramID,
      newBalance: balance
    });

    return NextResponse.json({ success: true, message: 'Wallet balance updated successfully' });
  } catch (error) {
    const { message, status } = handleAuthError(error);
    console.error('Error updating wallet balance:', error);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
