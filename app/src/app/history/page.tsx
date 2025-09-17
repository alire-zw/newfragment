'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import Cash01Icon from '../../../public/icons/cash-01-stroke-rounded';
import InvoiceIcon from '../../../public/icons/invoice-02-stroke-rounded';
import CheckmarkIcon from '../../../public/icons/checkmark-icon';

interface Transaction {
  transactionID: string;
  type: 'charge' | 'purchase' | 'refund' | 'reward';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'zibal' | 'manual';
  paymentTrackId: string | null;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const { userInfo } = useTelegramUser();
  const router = useRouter();

  // دریافت تاریخچه تراکنش‌ها
  const fetchTransactions = async (page: number = 1) => {
    if (!userInfo?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/transactions/history?telegramId=${userInfo.id}&page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setHasNextPage(data.data.pagination.hasNextPage);
        setHasPrevPage(data.data.pagination.hasPrevPage);
      } else {
        setError(data.error || 'خطا در دریافت تاریخچه تراکنش‌ها');
      }
    } catch (err) {
      console.error('خطا در دریافت تاریخچه تراکنش‌ها:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userInfo?.id]);

  // فرمت کردن مبلغ
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.floor(amount / 10));
  };

  // فرمت کردن تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // دریافت آیکون نوع تراکنش
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
        return <Cash01Icon width={20} height={20} style={{ color: "#3b82f6" }} />;
      case 'purchase':
        return <InvoiceIcon width={20} height={20} style={{ color: "#22c55e" }} />;
      case 'refund':
        return <Cash01Icon width={20} height={20} style={{ color: "#f59e0b" }} />;
      case 'reward':
        return <CheckmarkIcon size={20} color="#8b5cf6" />;
      default:
        return <InvoiceIcon width={20} height={20} style={{ color: "#6b7280" }} />;
    }
  };

  // دریافت رنگ وضعیت
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'failed':
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // دریافت متن وضعیت
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'pending':
        return 'در انتظار';
      case 'failed':
        return 'ناموفق';
      case 'cancelled':
        return 'لغو شده';
      default:
        return 'نامشخص';
    }
  };

  // دریافت متن نوع تراکنش
  const getTypeText = (type: string) => {
    switch (type) {
      case 'charge':
        return 'شارژ حساب';
      case 'purchase':
        return 'خرید';
      case 'refund':
        return 'بازگشت';
      case 'reward':
        return 'پاداش';
      default:
        return 'تراکنش';
    }
  };

  // بررسی اینکه آیا تراکنش خرید شماره مجازی است
  const isVirtualNumberPurchase = (transaction: Transaction) => {
    return transaction.type === 'purchase' && 
           transaction.description && 
           transaction.description.includes('شماره مجازی');
  };

  // استخراج نام کشور از description
  const extractCountryFromDescription = (description: string) => {
    const match = description.match(/کشور (.+?)$/);
    return match ? match[1] : null;
  };

  // هدایت به صفحه شماره‌های مجازی کاربر
  const handleVirtualNumberClick = (transaction: Transaction) => {
    if (isVirtualNumberPurchase(transaction)) {
      router.push('/my-virtual-numbers');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                تاریخچه تراکنش‌ها
              </h1>
            </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>تاریخچه کامل</strong> تمام <strong>تراکنش‌های</strong> شما
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              تمام <strong>پرداخت‌ها</strong>، <strong>شارژها</strong> و <strong>خریدها</strong> در اینجا ثبت می‌شوند
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8794a1' }}>در حال بارگذاری...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Transactions List */}
          {!loading && !error && (
            <>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <InvoiceIcon width={48} height={48} style={{ color: "#6b7280" }} />
                  <p className="text-sm mt-4" style={{ color: '#8794a1' }}>
                    هیچ تراکنشی یافت نشد
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.transactionID}
                      onClick={() => isVirtualNumberPurchase(transaction) ? handleVirtualNumberClick(transaction) : null}
                      className={`p-3 rounded-lg ${isVirtualNumberPurchase(transaction) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
                      style={{ 
                        backgroundColor: '#242e38',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="text-sm font-medium text-white">
                            {getTypeText(transaction.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {formatAmount(transaction.amount)} تومان
                          </span>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: getStatusColor(transaction.status) + '20',
                              color: getStatusColor(transaction.status)
                            }}
                          >
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#8794a1' }}>
                            {formatDate(transaction.createdAt)}
                          </span>
                          {transaction.paymentTrackId && (
                            <span className="text-xs" style={{ color: '#8794a1' }}>
                              شناسه: {transaction.paymentTrackId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.description && (
                            <span className="text-xs" style={{ color: '#8794a1' }}>
                              {transaction.description}
                            </span>
                          )}
                          {isVirtualNumberPurchase(transaction) && (
                            <span className="text-xs px-2 py-1 rounded" style={{ 
                              backgroundColor: 'var(--field-accent-color)',
                              color: 'white'
                            }}>
                              کلیک کنید
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => fetchTransactions(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: hasPrevPage ? 'var(--field-accent-color)' : 'var(--border-color)',
                      color: 'white'
                    }}
                  >
                    قبلی
                  </button>
                  
                  <span className="text-sm" style={{ color: '#8794a1' }}>
                    {currentPage} از {totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchTransactions(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: hasNextPage ? 'var(--field-accent-color)' : 'var(--border-color)',
                      color: 'white'
                    }}
                  >
                    بعدی
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
