import pool from './connection';

export interface Referral {
  id?: number;
  referrerID: string;
  referredID: string;
  referrerTelegramID: number;
  referredTelegramID: number;
  referralCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  rewardAmount?: number;
  rewardPercentage?: number;
  createdAt?: Date;
  completedAt?: Date;
  updatedAt?: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalReward: number;
  rewardPercentage: number;
}

export class ReferralService {
  // ایجاد کد رفرال منحصربه‌فرد
  static generateReferralCode(telegramID: number): string {
    return `${telegramID}`;
  }

  // ثبت رفرال جدید
  static async createReferral(referrerTelegramID: number, referredTelegramID: number): Promise<Referral | null> {
    const connection = await pool.getConnection();
    
    try {
      // بررسی وجود کاربران
      const [referrerUsers] = await connection.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [referrerTelegramID]
      );
      
      const [referredUsers] = await connection.execute(
        'SELECT userID FROM users WHERE userTelegramID = ?',
        [referredTelegramID]
      );

      const referrerUser = (referrerUsers as any[])[0];
      const referredUser = (referredUsers as any[])[0];

      if (!referrerUser || !referredUser) {
        throw new Error('کاربر معرف یا معرفی شده یافت نشد');
      }

      // بررسی وجود رفرال قبلی
      const [existingReferrals] = await connection.execute(
        'SELECT id FROM referrals WHERE referrerTelegramID = ? AND referredTelegramID = ?',
        [referrerTelegramID, referredTelegramID]
      );

      if ((existingReferrals as any[]).length > 0) {
        console.log('ℹ️ این رفرال قبلاً ثبت شده است');
        return null; // به جای throw کردن، null برگردان
      }

      // ایجاد کد رفرال
      const referralCode = this.generateReferralCode(referrerTelegramID);

      // ثبت رفرال
      try {
        const [result] = await connection.execute(
          `INSERT INTO referrals (referrerID, referredID, referrerTelegramID, referredTelegramID, referralCode, status, rewardPercentage)
           VALUES (?, ?, ?, ?, ?, 'pending', 25.00)`,
          [
            referrerUser.userID,
            referredUser.userID,
            referrerTelegramID,
            referredTelegramID,
            referralCode
          ]
        );

        const insertResult = result as any;
        const [newReferral] = await connection.execute(
          'SELECT * FROM referrals WHERE id = ?',
          [insertResult.insertId]
        );

        return (newReferral as Referral[])[0];
      } catch (error: any) {
        // اگر duplicate entry بود، رفرال موجود را برگردان
        if (error.code === 'ER_DUP_ENTRY') {
          const [existingReferrals] = await connection.execute(
            'SELECT * FROM referrals WHERE referralCode = ?',
            [referralCode]
          );
          
          if ((existingReferrals as any[]).length > 0) {
            return (existingReferrals as any[])[0];
          }
        }
        throw error;
      }

    } catch (error) {
      console.error('❌ خطا در ایجاد رفرال:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت آمار رفرال کاربر
  static async getReferralStats(telegramID: number): Promise<ReferralStats> {
    const connection = await pool.getConnection();
    
    try {
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as totalReferrals,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedReferrals,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingReferrals,
          COALESCE(SUM(rewardAmount), 0) as totalReward,
          COALESCE(AVG(rewardPercentage), 0) as rewardPercentage
        FROM referrals 
        WHERE referrerTelegramID = ?
      `, [telegramID]);

      const statsResult = (stats as any[])[0];
      
      return {
        totalReferrals: statsResult.totalReferrals || 0,
        completedReferrals: statsResult.completedReferrals || 0,
        pendingReferrals: statsResult.pendingReferrals || 0,
        totalReward: parseFloat(statsResult.totalReward) || 0,
        rewardPercentage: parseFloat(statsResult.rewardPercentage) || 0
      };

    } catch (error) {
      console.error('❌ خطا در دریافت آمار رفرال:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت لیست رفرال‌های کاربر
  static async getUserReferrals(telegramID: number): Promise<Referral[]> {
    const connection = await pool.getConnection();
    
    try {
      const [referrals] = await connection.execute(
        'SELECT * FROM referrals WHERE referrerTelegramID = ? ORDER BY createdAt DESC',
        [telegramID]
      );

      return referrals as Referral[];

    } catch (error) {
      console.error('❌ خطا در دریافت لیست رفرال‌ها:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بروزرسانی وضعیت رفرال
  static async updateReferralStatus(referralId: number, status: 'pending' | 'completed' | 'cancelled'): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE referrals SET status = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, status === 'completed' ? new Date() : null, referralId]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;

    } catch (error) {
      console.error('❌ خطا در بروزرسانی وضعیت رفرال:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بررسی وجود رفرال برای کاربر
  static async checkUserReferral(telegramID: number): Promise<Referral | null> {
    const connection = await pool.getConnection();
    
    try {
      const [referrals] = await connection.execute(
        'SELECT * FROM referrals WHERE referredTelegramID = ? ORDER BY createdAt DESC LIMIT 1',
        [telegramID]
      );

      const referralArray = referrals as Referral[];
      return referralArray.length > 0 ? referralArray[0] : null;

    } catch (error) {
      console.error('❌ خطا در بررسی رفرال کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // پردازش پارامتر startapp
  static async processStartAppParam(telegramID: number, startAppParam: string): Promise<Referral | null> {
    try {
      // بررسی اینکه پارامتر فقط عدد باشد
      if (!/^\d+$/.test(startAppParam)) {
        return null;
      }

      const referrerTelegramID = parseInt(startAppParam);
      
      // بررسی اینکه کاربر خودش را معرفی نکرده باشد
      if (referrerTelegramID === telegramID) {
        return null;
      }

      // ایجاد رفرال
      return await this.createReferral(referrerTelegramID, telegramID);

    } catch (error) {
      console.error('❌ خطا در پردازش پارامتر startapp:', error);
      return null;
    }
  }
}
