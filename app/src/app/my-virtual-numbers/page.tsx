'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyVirtualNumbers, MyVirtualNumber } from '@/hooks/useMyVirtualNumbers';
import CheckmarkIcon from '../../../public/icons/checkmark-icon';
import InvoiceIcon from '../../../public/icons/invoice-02-stroke-rounded';
import PackageDeliveredIcon from '../../../public/icons/package-delivered-stroke-rounded';

export default function MyVirtualNumbersPage() {
  const router = useRouter();
  const { virtualNumbers, loading, error } = useMyVirtualNumbers();

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'expired':
        return '#f59e0b';
      case 'cancelled':
      case 'suspended':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'expired':
        return 'منقضی شده';
      case 'cancelled':
        return 'لغو شده';
      case 'suspended':
        return 'مسدود شده';
      default:
        return 'نامشخص';
    }
  };

  const handleVirtualNumberClick = (virtualNumber: MyVirtualNumber) => {
    // Navigate to virtual number details page
    router.push(`/my-virtual-numbers/${virtualNumber.virtualNumberID}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                شماره‌های مجازی من
              </h1>
            </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>مدیریت</strong> تمام <strong>شماره‌های مجازی</strong> خریداری شده
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              برای <strong>دریافت کد</strong> و <strong>مدیریت</strong> شماره‌ها از اینجا استفاده کنید
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

          {/* Virtual Numbers List */}
          {!loading && !error && (
            <>
              {virtualNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <PackageDeliveredIcon width={48} height={48} style={{ color: "#6b7280" }} />
                  <p className="text-sm mt-4" style={{ color: '#8794a1' }}>
                    هیچ شماره مجازی خریداری نشده است
                  </p>
                  <button
                    onClick={() => router.push('/shop/virtual-number')}
                    className="mt-4 px-4 py-2 text-sm rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--field-accent-color)',
                      border: '1px solid var(--field-accent-color)'
                    }}
                  >
                    خرید شماره مجازی
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {virtualNumbers.map((virtualNumber) => (
                    <div
                      key={virtualNumber.virtualNumberID}
                      onClick={() => handleVirtualNumberClick(virtualNumber)}
                      className="p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      style={{ 
                        backgroundColor: '#242e38',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <PackageDeliveredIcon width={20} height={20} style={{ color: "#22c55e" }} />
                          <span className="text-sm font-medium text-white">
                            {virtualNumber.number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {formatPrice(virtualNumber.price)} تومان
                          </span>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: getStatusColor(virtualNumber.status) + '20',
                              color: getStatusColor(virtualNumber.status)
                            }}
                          >
                            {getStatusText(virtualNumber.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#8794a1' }}>
                            {virtualNumber.country}
                          </span>
                          <span className="text-xs" style={{ color: '#8794a1' }}>
                            {virtualNumber.service}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: '#8794a1' }}>
                          {formatDate(virtualNumber.createdAt)}
                        </span>
                      </div>

                      {virtualNumber.quality && (
                        <div className="text-xs" style={{ color: '#8794a1' }}>
                          {virtualNumber.quality}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs" style={{ color: '#8794a1' }}>
                          شناسه: {virtualNumber.virtualNumberID}
                        </span>
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                          <CheckmarkIcon size={12} color="#22c55e" />
                          <span>کلیک کنید</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
