'use client';

import { useState } from 'react';
import Modal from './Modal';
import Cash01Icon from '../../public/icons/cash-01-stroke-rounded';

interface WalletChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBalance: number) => void;
  currentBalance: number;
  userName: string;
  loading?: boolean;
}

export default function WalletChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentBalance,
  userName,
  loading = false
}: WalletChangeModalProps) {
  const [newBalance, setNewBalance] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.floor(num));
  };

  const handleBalanceChange = (value: string) => {
    // حذف کاماها و فاصه‌ها
    const cleanValue = value.replace(/[,\s]/g, '');
    
    // فقط اعداد مجاز
    if (!/^[0-9]*$/.test(cleanValue)) {
      return;
    }
    
    setNewBalance(cleanValue);
    setError('');
  };

  const handleConfirm = () => {
    if (!newBalance.trim()) {
      setError('لطفاً مقدار جدید را وارد کنید');
      return;
    }
    
    const numValue = Number(newBalance);
    
    if (isNaN(numValue) || numValue < 0) {
      setError('مقدار نامعتبر است');
      return;
    }
    
    // ارسال مقدار به تومان (بدون تبدیل)
    onConfirm(numValue);
  };

  return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="تغییر موجودی کیف پول"
          onConfirm={handleConfirm}
          confirmText={loading ? 'در حال پردازش...' : 'تایید تغییر'}
          cancelText="بازگشت"
          confirmDisabled={loading || !newBalance.trim() || !!error}
        >
      <div className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ 
          backgroundColor: '#1a2026',
          border: '1px solid var(--dropdown-bg-hover-color, #384553)'
        }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#22c55e20' }}>
            <Cash01Icon width={24} height={24} color="#22c55e" />
          </div>
          <div className="text-right">
            <div className="font-medium text-white">
              {userName}
            </div>
            <div className="text-sm text-gray-400">
              تغییر موجودی کیف پول
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="p-3 rounded-lg" 
             style={{ 
               backgroundColor: '#1a2026',
               border: '1px solid var(--dropdown-bg-hover-color, #384553)'
             }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                <span className="text-sm text-white">موجودی فعلی:</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {formatNumber(currentBalance)} تومان
              </span>
            </div>
        </div>

        {/* New Balance Input */}
        <div className="space-y-2">
          {/* فیلد ورودی */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white">موجودی جدید:</label>
              <div className="text-sm font-semibold text-white">
                {newBalance ? formatNumber(Number(newBalance)) : '0'} تومان
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={newBalance}
                onChange={(e) => handleBalanceChange(e.target.value)}
                placeholder="مقدار جدید را وارد کنید..."
                className="w-full p-3 rounded-lg text-right focus:outline-none pr-12"
                style={{ 
                  backgroundColor: '#1a2026',
                  color: '#ffffff',
                  border: error ? '1px solid #ef4444' : '1px solid #384553',
                  fontSize: '14px'
                }}
                disabled={loading}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
              </div>
            </div>
            {error && (
              <div className="text-xs text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-lg p-3" style={{ 
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <div className="flex items-start gap-2">
            <div className="text-sm" style={{ color: '#ffc107' }}>
              ⚠️
            </div>
            <div className="text-sm text-white">
              <strong>توجه:</strong> تغییر موجودی کیف پول کاربر تأثیر مستقیم بر حساب کاربر دارد. لطفاً از صحت مقدار وارد شده اطمینان حاصل کنید.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
