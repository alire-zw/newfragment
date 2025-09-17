'use client';

import Modal from './Modal';
import { useWallet } from '@/hooks/useWallet';
import Cash01Icon from '../../public/icons/cash-01-stroke-rounded';
import CheckmarkIcon from '../../public/icons/checkmark-icon';

interface StarsBuyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stars: number;
  price: number;
  recipient: {
    name: string;
    username: string;
    photo: string;
  };
  loading?: boolean;
}

export default function StarsBuyConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  stars,
  price,
  recipient,
  loading = false
}: StarsBuyConfirmModalProps) {
  const { walletData, loading: balanceLoading } = useWallet();
  
  // بررسی کافی بودن موجودی
  const isBalanceSufficient = walletData && !balanceLoading && (walletData.balance || 0) >= (price * 10);
  const isConfirmDisabled = loading || balanceLoading || !isBalanceSufficient;
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تایید خرید استارز"
      onConfirm={onConfirm}
      confirmText={
        loading 
          ? 'در حال پردازش...' 
          : balanceLoading 
            ? 'در حال بررسی موجودی...'
            : !isBalanceSufficient 
              ? 'موجودی کافی نیست'
              : 'تایید خرید'
      }
      cancelText="بازگشت"
      confirmDisabled={isConfirmDisabled}
    >
      <div className="space-y-4">
        {/* Purchase Details */}
        <div className="space-y-3">
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: 'var(--accent-bg-color, rgba(77, 178, 255, 0.1))',
            border: '1px solid var(--accent-color, #4db2ff)'
          }}>
            <div className="text-center">
              <div className="text-sm mb-2" style={{ color: 'var(--field-color, #ffffff)' }}>
                آیا از خرید {formatStars(stars)} استارز به قیمت {formatPrice(price)} تومان اطمینان دارید؟
              </div>
              <div className="text-xs" style={{ color: 'var(--accent-color, #4db2ff)' }}>
                پس از تایید، تراکنش ایجاد شده و باید پرداخت را انجام دهید
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Info */}
        <div className="flex flex-row-reverse items-center gap-3 p-3 rounded-lg" style={{ 
          backgroundColor: '#1a2026',
          border: '1px solid var(--dropdown-bg-hover-color, #384553)'
        }}>
          {recipient.photo && (
            <img
              src={recipient.photo}
              alt={recipient.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="text-left">
            <div className="font-medium" style={{ color: 'var(--field-color, #ffffff)' }}>
              {recipient.name}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-color, #8794a1)' }}>
              {recipient.username}
            </div>
          </div>
        </div>

        {/* Wallet Balance Check */}
        <div className="p-3 rounded-lg" 
             style={{ 
               backgroundColor: '#1a2026',
               border: '1px solid var(--dropdown-bg-hover-color, #384553)'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
              <span className="text-sm text-white">موجودی شما:</span>
              <span className="text-sm font-semibold text-white">
                {balanceLoading ? '...' : `${(walletData?.balance ? Math.floor(walletData.balance / 10) : 0).toLocaleString('fa-IR')} تومان`}
              </span>
            </div>
            
            {!balanceLoading && walletData && (
              <div className="flex items-center gap-2">
                {isBalanceSufficient ? (
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                    <CheckmarkIcon size={14} color="#22c55e" />
                    <span>کافی است</span>
                  </div>
                ) : (
                  <button
                    onClick={() => window.location.href = '/charge'}
                    className="px-3 py-1 text-xs rounded-lg font-medium transition-colors duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--field-accent-color)',
                      color: 'white'
                    }}
                  >
                    شارژ حساب
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-lg p-3" style={{ 
          backgroundColor: !isBalanceSufficient && !balanceLoading 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(255, 193, 7, 0.1)',
          border: !isBalanceSufficient && !balanceLoading 
            ? '1px solid rgba(239, 68, 68, 0.3)' 
            : '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <div className="flex items-start gap-2">
            <div className="text-sm" style={{ 
              color: !isBalanceSufficient && !balanceLoading ? '#ef4444' : '#ffc107' 
            }}>
              {!isBalanceSufficient && !balanceLoading ? '❌' : '⚠️'}
            </div>
            <div className="text-sm" style={{ color: 'var(--field-color, #ffffff)' }}>
              {!isBalanceSufficient && !balanceLoading ? (
                <>
                  <strong>موجودی ناکافی:</strong> موجودی شما برای این خرید کافی نیست. لطفاً ابتدا حساب خود را شارژ کنید.
                </>
              ) : (
                <>
                  <strong>توجه:</strong> پس از تایید، امکان لغو تراکنش وجود ندارد. لطفاً از صحت اطلاعات اطمینان حاصل کنید.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
