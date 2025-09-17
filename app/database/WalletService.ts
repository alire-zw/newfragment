import pool from './connection';

export interface WalletData {
  id?: number;
  walletID: string;
  userID: string;
  userTelegramID: number;
  balance: number;
  frozenBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: 'active' | 'suspended' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

export class WalletService {
  // ایجاد کیف پول برای کاربر
  static async createWallet(userID: string, userTelegramID: number): Promise<WalletData> {
    const connection = await pool.getConnection();
    
    try {
      const walletID = `WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const [result] = await connection.execute(
        `INSERT INTO wallets (walletID, userID, userTelegramID, balance, frozenBalance, totalDeposited, totalWithdrawn, status)
         VALUES (?, ?, ?, 0, 0, 0, 0, 'active')`,
        [walletID, userID, userTelegramID]
      );

      const insertResult = result as any;
      const [newWallet] = await connection.execute(
        'SELECT * FROM wallets WHERE id = ?',
        [insertResult.insertId]
      );

      return (newWallet as WalletData[])[0];
    } catch (error) {
      console.error('❌ خطا در ایجاد کیف پول:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت کیف پول بر اساس شناسه تلگرام
  static async getWalletByTelegramID(telegramID: number): Promise<WalletData | null> {
    const connection = await pool.getConnection();
    
    try {
      const [wallets] = await connection.execute(
        'SELECT * FROM wallets WHERE userTelegramID = ?',
        [telegramID]
      );

      const walletArray = wallets as WalletData[];
      return walletArray.length > 0 ? walletArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در دریافت کیف پول:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت کیف پول بر اساس شناسه کاربری
  static async getWalletByUserID(userID: string): Promise<WalletData | null> {
    const connection = await pool.getConnection();
    
    try {
      const [wallets] = await connection.execute(
        'SELECT * FROM wallets WHERE userID = ?',
        [userID]
      );

      const walletArray = wallets as WalletData[];
      return walletArray.length > 0 ? walletArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در دریافت کیف پول:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بروزرسانی موجودی کیف پول
  static async updateBalance(telegramID: number, newBalance: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE wallets SET balance = ?, updatedAt = CURRENT_TIMESTAMP WHERE userTelegramID = ?',
        [newBalance, telegramID]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در بروزرسانی موجودی:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بروزرسانی موجودی کیف پول (نام مستعار)
  static async updateWalletBalance(telegramID: number, newBalance: number): Promise<boolean> {
    return this.updateBalance(telegramID, newBalance);
  }

  // افزایش موجودی (شارژ)
  static async addBalance(telegramID: number, amount: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        `UPDATE wallets 
         SET balance = balance + ?, 
             totalDeposited = totalDeposited + ?, 
             updatedAt = CURRENT_TIMESTAMP 
         WHERE userTelegramID = ?`,
        [amount, amount, telegramID]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در افزایش موجودی:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // کاهش موجودی (خرید)
  static async subtractBalance(telegramID: number, amount: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        `UPDATE wallets 
         SET balance = balance - ?, 
             totalWithdrawn = totalWithdrawn + ?, 
             updatedAt = CURRENT_TIMESTAMP 
         WHERE userTelegramID = ? AND balance >= ?`,
        [amount, amount, telegramID, amount]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در کاهش موجودی:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بررسی موجودی کافی
  static async hasEnoughBalance(telegramID: number, requiredAmount: number): Promise<boolean> {
    const wallet = await this.getWalletByTelegramID(telegramID);
    return wallet ? wallet.balance >= requiredAmount : false;
  }

  // دریافت یا ایجاد کیف پول (اگر وجود نداشته باشد)
  static async getOrCreateWallet(userID: string, userTelegramID: number): Promise<WalletData> {
    let wallet = await this.getWalletByTelegramID(userTelegramID);
    
    if (!wallet) {
      wallet = await this.createWallet(userID, userTelegramID);
    }
    
    return wallet;
  }
}
