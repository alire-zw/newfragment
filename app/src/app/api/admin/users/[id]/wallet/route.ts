import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '../../../../../../../database/WalletService';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    return NextResponse.json({ success: true, message: 'Wallet balance updated successfully' });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wallet balance' }, { status: 500 });
  }
}
