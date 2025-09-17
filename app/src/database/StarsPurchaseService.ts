import pool from './connection';

export interface StarsPurchaseData {
  id?: number;
  userID: string;
  userTelegramID: number;
  recipient: string;
  username?: string;
  name?: string;
  quantity: number;
  price: number;
  priceInRials: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionID?: string;
  externalTransactionID?: string;
  validUntil?: Date;
  paymentAddress?: string;
  paymentAmount?: string;
  paymentPayload?: string;
  successPageId?: string; // شناسه منحصر به فرد برای صفحه success
  metadata?: any;
  createdAt?: Date;
  completedAt?: Date;
  updatedAt?: Date;
}

export class StarsPurchaseService {
  // ایجاد خرید استارز جدید
  static async createPurchase(purchaseData: Omit<StarsPurchaseData, 'id' | 'createdAt' | 'updatedAt'>): Promise<StarsPurchaseData> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        `INSERT INTO stars_purchases (
          userID, userTelegramID, recipient, username, name,
          quantity, price, priceInRials, status, transactionID, externalTransactionID,
          validUntil, paymentAddress, paymentAmount, paymentPayload, successPageId, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseData.userID,
          purchaseData.userTelegramID,
          purchaseData.recipient,
          purchaseData.username,
          purchaseData.name,
          purchaseData.quantity,
          purchaseData.price,
          purchaseData.priceInRials,
          purchaseData.status,
          purchaseData.transactionID || null,
          purchaseData.externalTransactionID || null,
          purchaseData.validUntil || null,
          purchaseData.paymentAddress || null,
          purchaseData.paymentAmount || null,
          purchaseData.paymentPayload || null,
          purchaseData.successPageId || null,
          purchaseData.metadata ? JSON.stringify(purchaseData.metadata) : null
        ]
      );

      const insertResult = result as any;
      const [newPurchase] = await connection.execute(
        'SELECT * FROM stars_purchases WHERE id = ?',
        [insertResult.insertId]
      );

      return (newPurchase as StarsPurchaseData[])[0];
    } catch (error) {
      console.error('❌ خطا در ایجاد خرید استارز:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // جستجوی خرید بر اساس successPageId
  static async getPurchaseBySuccessPageId(successPageId: string): Promise<StarsPurchaseData | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM stars_purchases WHERE successPageId = ?',
        [successPageId]
      );
      
      const purchases = rows as StarsPurchaseData[];
      return purchases.length > 0 ? purchases[0] : null;
    } catch (error) {
      console.error('❌ خطا در جستجوی خرید بر اساس successPageId:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بررسی وجود خرید تکراری در 5 دقیقه گذشته
  static async checkDuplicatePurchase(
    userTelegramID: number, 
    recipient: string, 
    quantity: number, 
    price: number
  ): Promise<StarsPurchaseData | null> {
    const connection = await pool.getConnection();
    
    try {
      const [purchases] = await connection.execute(
        `SELECT * FROM stars_purchases 
         WHERE userTelegramID = ? 
           AND recipient = ? 
           AND quantity = ? 
           AND price = ? 
           AND status IN ('pending', 'completed')
           AND createdAt > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         ORDER BY createdAt DESC 
         LIMIT 1`,
        [userTelegramID, recipient, quantity, price]
      );

      const purchaseArray = purchases as StarsPurchaseData[];
      return purchaseArray.length > 0 ? purchaseArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در بررسی خرید تکراری:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // بروزرسانی وضعیت خرید
  static async updatePurchaseStatus(
    purchaseID: string, 
    status: 'pending' | 'completed' | 'failed' | 'cancelled',
    additionalData?: {
      externalTransactionID?: string;
      validUntil?: Date;
      paymentAddress?: string;
      paymentAmount?: string;
      paymentPayload?: string;
      metadata?: any;
    }
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      let updateQuery = 'UPDATE stars_purchases SET status = ?';
      const updateParams: any[] = [status];

      if (additionalData) {
        if (additionalData.externalTransactionID) {
          updateQuery += ', externalTransactionID = ?';
          updateParams.push(additionalData.externalTransactionID);
        }
        if (additionalData.validUntil) {
          updateQuery += ', validUntil = ?';
          updateParams.push(additionalData.validUntil);
        }
        if (additionalData.paymentAddress) {
          updateQuery += ', paymentAddress = ?';
          updateParams.push(additionalData.paymentAddress);
        }
        if (additionalData.paymentAmount) {
          updateQuery += ', paymentAmount = ?';
          updateParams.push(additionalData.paymentAmount);
        }
        if (additionalData.paymentPayload) {
          updateQuery += ', paymentPayload = ?';
          updateParams.push(additionalData.paymentPayload);
        }
        if (additionalData.metadata) {
          updateQuery += ', metadata = ?';
          updateParams.push(JSON.stringify(additionalData.metadata));
        }
      }

      if (status === 'completed') {
        updateQuery += ', completedAt = NOW()';
      }

      updateQuery += ', updatedAt = NOW() WHERE id = ?';
      updateParams.push(purchaseID);

      const [result] = await connection.execute(updateQuery, updateParams);
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('❌ خطا در بروزرسانی وضعیت خرید:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت خرید بر اساس شناسه
  static async getPurchaseByID(purchaseID: string): Promise<StarsPurchaseData | null> {
    const connection = await pool.getConnection();
    
    try {
      const [purchases] = await connection.execute(
        'SELECT * FROM stars_purchases WHERE id = ?',
        [purchaseID]
      );

      const purchaseArray = purchases as StarsPurchaseData[];
      return purchaseArray.length > 0 ? purchaseArray[0] : null;
    } catch (error) {
      console.error('❌ خطا در دریافت خرید:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // دریافت خریدهای کاربر
  static async getUserPurchases(
    userTelegramID: number, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<StarsPurchaseData[]> {
    const connection = await pool.getConnection();
    
    try {
      const [purchases] = await connection.execute(
        `SELECT * FROM stars_purchases 
         WHERE userTelegramID = ? 
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        [userTelegramID, limit, offset]
      );

      return purchases as StarsPurchaseData[];
    } catch (error) {
      console.error('❌ خطا در دریافت خریدهای کاربر:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // حذف خریدهای قدیمی (بیش از 30 روز)
  static async cleanupOldPurchases(): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'DELETE FROM stars_purchases WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      const deleteResult = result as any;
      return deleteResult.affectedRows;
    } catch (error) {
      console.error('❌ خطا در پاکسازی خریدهای قدیمی:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
