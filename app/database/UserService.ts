import pool from './connection';

export interface User {
  id?: number;
  userID: string;
  userFullName: string;
  userTelegramID: number;
  userBirthDate?: string | null;
  userNationalID?: string | null;
  userPhoneNumber?: string | null;
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserService {
  // ذخیره یا بروزرسانی کاربر
  static async saveOrUpdateUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const connection = await pool.getConnection();
    
    try {
      // بررسی وجود کاربر
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE userTelegramID = ?',
        [userData.userTelegramID]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        // بروزرسانی کاربر موجود
        await connection.execute(
          `UPDATE users 
           SET userID = ?, userFullName = ?, userBirthDate = ?, 
               userNationalID = ?, userPhoneNumber = ?, isVerified = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE userTelegramID = ?`,
          [
            userData.userID,
            userData.userFullName,
            userData.userBirthDate,
            userData.userNationalID,
            userData.userPhoneNumber,
            userData.isVerified || false,
            userData.userTelegramID
          ]
        );

        // دریافت اطلاعات بروزرسانی شده
        const [updatedUser] = await connection.execute(
          'SELECT * FROM users WHERE userTelegramID = ?',
          [userData.userTelegramID]
        );

        return (updatedUser as User[])[0];
      } else {
        // ایجاد کاربر جدید
        try {
          const [result] = await connection.execute(
            `INSERT INTO users (userID, userFullName, userTelegramID, userBirthDate, userNationalID, userPhoneNumber, isVerified)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userData.userID,
              userData.userFullName,
              userData.userTelegramID,
              userData.userBirthDate,
              userData.userNationalID,
              userData.userPhoneNumber,
              userData.isVerified || false
            ]
          );

          const insertResult = result as any;
          const [newUser] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [insertResult.insertId]
          );

          return (newUser as User[])[0];
        } catch (error: any) {
          // اگر duplicate entry بود، کاربر را از دیتابیس بخوان
          if (error.code === 'ER_DUP_ENTRY') {
            const [existingUsers] = await connection.execute(
              'SELECT * FROM users WHERE userID = ?',
              [userData.userID]
            );
            
            if ((existingUsers as any[]).length > 0) {
              return (existingUsers as any[])[0];
            }
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ خطا در ذخیره کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت کاربر بر اساس شناسه تلگرام
  static async getUserByTelegramID(telegramID: number): Promise<User | null> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE userTelegramID = ?',
        [telegramID]
      );

      const userArray = users as User[];
      return userArray.length > 0 ? userArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در دریافت کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت کاربر بر اساس شناسه کاربری
  static async getUserByUserID(userID: string): Promise<User | null> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE userID = ?',
        [userID]
      );

      const userArray = users as User[];
      return userArray.length > 0 ? userArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در دریافت کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بروزرسانی وضعیت احراز هویت
  static async updateVerificationStatus(telegramID: number, isVerified: boolean): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE users SET isVerified = ?, updatedAt = CURRENT_TIMESTAMP WHERE userTelegramID = ?',
        [isVerified, telegramID]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در بروزرسانی وضعیت احراز هویت:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت تمام کاربران (برای ادمین)
  static async getAllUsers(): Promise<User[]> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );

      return users as User[];
    } catch (error) {
      console.error('❌ خطا در دریافت لیست کاربران:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بررسی ادمین بودن کاربر
  static async isUserAdmin(telegramID: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT isAdmin FROM users WHERE userTelegramID = ?',
        [telegramID]
      );

      const userArray = users as any[];
      return userArray.length > 0 ? userArray[0].isAdmin === 1 : false;
    } catch (error) {
      console.error('❌ خطا در بررسی ادمین بودن کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // تنظیم ادمین بودن کاربر
  static async setUserAdmin(telegramID: number, isAdmin: boolean): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE users SET isAdmin = ?, updatedAt = CURRENT_TIMESTAMP WHERE userTelegramID = ?',
        [isAdmin, telegramID]
      );

      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در تنظیم ادمین بودن کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت لیست ادمین‌ها
  static async getAdmins(): Promise<User[]> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE isAdmin = TRUE ORDER BY createdAt DESC'
      );

      return users as User[];
    } catch (error) {
      console.error('❌ خطا در دریافت لیست ادمین‌ها:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
