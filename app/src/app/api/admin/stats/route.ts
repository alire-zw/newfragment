import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../database/connection';

export async function GET() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // تعداد کل کاربران
    const [totalUsersResult] = await connection.execute(
      'SELECT COUNT(*) as totalUsers FROM users'
    );
    const totalUsers = (totalUsersResult as any[])[0].totalUsers;

    // تعداد کل تراکنش‌ها
    const [totalTransactionsResult] = await connection.execute(
      'SELECT COUNT(*) as totalTransactions FROM transactions'
    );
    const totalTransactions = (totalTransactionsResult as any[])[0].totalTransactions;

    // دریافت درصدهای سود از تنظیمات سیستم
    const [profitSettings] = await connection.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE "%_profit_percentage"'
    );
    
    const profitPercentages: { [key: string]: number } = {};
    (profitSettings as any[]).forEach(setting => {
      profitPercentages[setting.setting_key] = parseFloat(setting.setting_value);
    });

    // محاسبه درآمد از شماره‌های مجازی
    const [virtualNumbersRevenue] = await connection.execute(
      'SELECT COALESCE(SUM(price), 0) as total FROM virtual_numbers WHERE status = "active"'
    );
    const virtualNumbersTotal = (virtualNumbersRevenue as any[])[0].total;
    const virtualNumbersProfit = virtualNumbersTotal * (profitPercentages['virtual_number_profit_percentage'] || 0) / 100;

    // محاسبه درآمد از خریدهای استارز
    const [starsRevenue] = await connection.execute(
      'SELECT COALESCE(SUM(price), 0) as total FROM stars_purchases WHERE status = "pending"'
    );
    const starsTotal = (starsRevenue as any[])[0].total;
    const starsProfit = starsTotal * (profitPercentages['stars_profit_percentage'] || 0) / 100;

    // محاسبه درآمد از خریدهای پریمیوم 3 ماهه
    const [premium3Revenue] = await connection.execute(
      'SELECT COALESCE(SUM(price), 0) as total FROM premium_purchases WHERE status = "completed" AND months = 3'
    );
    const premium3Total = (premium3Revenue as any[])[0].total;
    const premium3Profit = premium3Total * (profitPercentages['premium_3_month_profit_percentage'] || 0) / 100;

    // محاسبه درآمد از خریدهای پریمیوم 6 ماهه
    const [premium6Revenue] = await connection.execute(
      'SELECT COALESCE(SUM(price), 0) as total FROM premium_purchases WHERE status = "completed" AND months = 6'
    );
    const premium6Total = (premium6Revenue as any[])[0].total;
    const premium6Profit = premium6Total * (profitPercentages['premium_6_month_profit_percentage'] || 0) / 100;

    // محاسبه درآمد از خریدهای پریمیوم 12 ماهه
    const [premium12Revenue] = await connection.execute(
      'SELECT COALESCE(SUM(price), 0) as total FROM premium_purchases WHERE status = "completed" AND months = 12'
    );
    const premium12Total = (premium12Revenue as any[])[0].total;
    const premium12Profit = premium12Total * (profitPercentages['premium_12_month_profit_percentage'] || 0) / 100;

    // مجموع درآمد کل (سود از همه محصولات)
    const totalRevenue = virtualNumbersProfit + starsProfit + premium3Profit + premium6Profit + premium12Profit;

    // کاربران فعال (کاربرانی که در 7 روز گذشته حداقل یک تراکنش داشته‌اند)
    const [activeUsersResult] = await connection.execute(
      'SELECT COUNT(DISTINCT userID) as activeUsers FROM transactions WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const activeUsers = (activeUsersResult as any[])[0].activeUsers;

    // موجودی کل کیف پول‌ها
    const [totalWalletBalanceResult] = await connection.execute(
      'SELECT COALESCE(SUM(balance), 0) as totalWalletBalance FROM wallets WHERE status = "active"'
    );
    const totalWalletBalance = (totalWalletBalanceResult as any[])[0].totalWalletBalance;

    // کل واریزی‌ها
    const [totalDepositsResult] = await connection.execute(
      'SELECT COALESCE(SUM(totalDeposited), 0) as totalDeposits FROM wallets'
    );
    const totalDeposits = (totalDepositsResult as any[])[0].totalDeposits;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalRevenue,
        activeUsers,
        totalWalletBalance,
        totalDeposits
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در دریافت آمار ادمین:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار ادمین' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
