'use client';

import { useState } from 'react';
import Cash01Icon from '../../public/icons/cash-01-stroke-rounded';
import StarIcon from '../../public/icons/star-component';
import UserIcon from '../../public/icons/user-stroke-rounded';

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: {
    address: string;
    amount: string;
    payload: string;
  };
  recipient: {
    name: string;
    username: string;
    photo?: string;
  };
  stars: number;
  price: number;
  loading?: boolean;
}

export default function TransactionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  recipient,
  stars,
  price,
  loading = false
}: TransactionConfirmModalProps) {
  // کلیدهای پیش‌فرض
  const defaultMnemonic = 'quantum castle lecture range tourist lunch slam early daring innocent sword metal shuffle push thumb hurdle pet hockey rotate carry involve pumpkin head february';
  const defaultApiKey = '6cb7852c6bfb7e962fb9a3c1e370e17cd77591fef381daedb07dbc627986008b';
  
  const [mnemonic, setMnemonic] = useState(defaultMnemonic);
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!mnemonic.trim() || !apiKey.trim()) {
      setError('لطفاً کلیدهای ولت و API Key را وارد کنید');
      return;
    }

    setConfirmLoading(true);
    setError('');

    try {
      const mnemonicArray = mnemonic.trim().split(' ');
      if (mnemonicArray.length !== 24) {
        throw new Error('کلیدهای ولت باید 24 کلمه باشد');
      }

      const response = await fetch('/api/telegram/confirm-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction,
          mnemonic: mnemonicArray,
          apiKey: apiKey.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        onConfirm();
        onClose();
      } else {
        setError(result.error || 'خطا در تایید تراکنش');
      }
    } catch (error) {
      console.error('Confirm transaction error:', error);
      setError('خطا در ارسال درخواست');
    } finally {
      setConfirmLoading(false);
    }
  };

  const formatStars = (stars: number) => {
    if (stars >= 1000000) {
      const millions = (stars / 1000000).toFixed(1).replace('.0', '');
      return `${millions} میلیون`;
    } else if (stars >= 1000) {
      const thousands = (stars / 1000).toFixed(1).replace('.0', '');
      return `${thousands} هزار`;
    }
    return stars.toString();
  };

  const formatAmount = (amount: string) => {
    const tonAmount = parseInt(amount) / 1e9;
    return tonAmount.toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              تایید تراکنش استارز
            </h2>
            <p className="text-sm text-gray-600">
              برای تکمیل خرید، تراکنش را در ولت خود تایید کنید
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 mb-6">
            {/* Recipient */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {recipient.photo ? (
                  <img 
                    src={recipient.photo} 
                    alt={recipient.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{recipient.name}</p>
                <p className="text-sm text-gray-500">@{recipient.username}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900">تعداد استارز</span>
              </div>
              <span className="font-bold text-yellow-600">
                {formatStars(stars)} استارز
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Cash01Icon className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">قیمت</span>
              </div>
              <span className="font-bold text-green-600">
                {price.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            {/* Transaction Details */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">جزئیات تراکنش</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">آدرس مقصد:</span>
                  <span className="font-mono text-xs text-gray-800 break-all">
                    {transaction.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">مبلغ TON:</span>
                  <span className="font-mono text-gray-800">
                    {formatAmount(transaction.amount)} TON
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Configuration */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">تنظیمات ولت</h3>
              <button
                onClick={() => {
                  setMnemonic(defaultMnemonic);
                  setApiKey(defaultApiKey);
                  setError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={confirmLoading}
              >
                استفاده از کلیدهای پیش‌فرض
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کلیدهای ولت (24 کلمه)
              </label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="کلمات کلید ولت را با فاصله وارد کنید..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
                disabled={confirmLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TON API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="کلید API TON را وارد کنید..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={confirmLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={confirmLoading}
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmLoading || !mnemonic.trim() || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {confirmLoading ? 'در حال تایید...' : 'تایید تراکنش'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
