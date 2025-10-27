import pool from '../database/connection';

export type AuditAction = 
  | 'admin.set_admin'
  | 'admin.update_settings'
  | 'admin.update_wallet'
  | 'admin.view_user'
  | 'wallet.balance_updated'
  | 'wallet.charge'
  | 'purchase.premium'
  | 'purchase.stars'
  | 'purchase.virtual_number'
  | 'user.verify'
  | 'cache.clear'
  | 'transaction.create';

interface AuditLogData {
  userId: number;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * ثبت لاگ Audit برای اقدامات حساس
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    await connection.execute(
      `INSERT INTO audit_logs (
        userTelegramID, 
        action, 
        resourceType, 
        resourceId, 
        details, 
        ipAddress, 
        userAgent,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        data.userId,
        data.action,
        data.resourceType || null,
        data.resourceId || null,
        data.details ? JSON.stringify(data.details) : null,
        data.ipAddress || null,
        data.userAgent || null
      ]
    );

    console.log('📝 [AUDIT]', {
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId
    });

  } catch (error) {
    // در صورت خطا، فقط لاگ کن و exception throw نکن
    // چون نباید عملیات اصلی به خاطر مشکل لاگ fail بشود
    console.error('❌ [AUDIT] Failed to log audit:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * helper برای گرفتن IP و User Agent از request
 */
export function getRequestMetadata(request: Request) {
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

