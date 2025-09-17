'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useUser } from '@/hooks/useUser';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UserGroupIcon from '../../../../../public/icons/user-group-03-stroke-rounded';
import IdVerifiedIcon from '../../../../../public/icons/id-verified-stroke-rounded';
import IdNotVerifiedIcon from '../../../../../public/icons/id-not-verified-stroke-rounded';
import Cash01Icon from '../../../../../public/icons/cash-01-stroke-rounded';
import CheckmarkIcon from '../../../../../public/icons/checkmark-icon';
import ArrowLeft01Icon from '../../../../../public/icons/arrow-left-01-stroke-rounded';
import CreditCardPosIcon from '../../../../../public/icons/credit-card-pos-stroke-rounded';
import StarIcon from '../../../../../public/icons/star-component';
import GiftIcon from '../../../../../public/icons/gift-stroke-rounded';
import WalletChangeModal from '@/components/WalletChangeModal';

interface User {
  id: number;
  userID: string;
  userFullName: string;
  userTelegramID: number;
  userBirthDate?: string | null;
  userNationalID?: string | null;
  userPhoneNumber?: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalTransactions: number;
  totalSpent: number;
  virtualNumbersCount: number;
  starsPurchasesCount: number;
  premiumPurchasesCount: number;
  walletBalance: number;
}

export default function UserDetailsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user: dbUser, loading: userLoading } = useUser();
  const { userInfo, loading: telegramLoading, error: telegramError } = useTelegramUser();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // دریافت اطلاعات کاربر
        const userResponse = await fetch(`/api/admin/users/${userId}`);
        const userData = await userResponse.json();
        
        if (!userData.success) {
          throw new Error(userData.error || 'کاربر یافت نشد');
        }
        
        setUser(userData.data);
        
        // دریافت آمار کاربر
        const statsResponse = await fetch(`/api/admin/users/${userId}/stats`);
        const statsData = await statsResponse.json();
        
         if (statsData.success) {
           setUserStats(statsData.data);
         }

         // جستجوی کاربر در تلگرام برای دریافت عکس پروفایل
         if (userData.data && userData.data.userID) {
           // استفاده از userID به عنوان username برای جستجو
           await searchTelegramUser(userData.data.userID);
         }
         
       } catch (error) {
        console.error('خطا در دریافت جزئیات کاربر:', error);
        setError(error instanceof Error ? error.message : 'خطا در دریافت جزئیات کاربر');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && userId) {
      fetchUserDetails();
    }
  }, [isAdmin, userId]);

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  // تابع جستجوی کاربر در تلگرام برای دریافت عکس پروفایل
  const searchTelegramUser = async (username: string) => {
    if (!username.trim()) {
      setUserAvatar(null);
      return;
    }

    try {
      const response = await fetch('/api/telegram/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();
      
      if (data.success && data.data && data.data.photo) {
        setUserAvatar(data.data.photo);
      } else {
        setUserAvatar(null);
      }
    } catch (error) {
      console.error('خطا در دریافت عکس پروفایل:', error);
      setUserAvatar(null);
    }
  };

  // تابع تغییر موجودی کیف پول
  const handleWalletChange = async (newBalance: number) => {
    if (!user) return;

    setWalletLoading(true);
    try {
      // تبدیل تومان به ریال (ضرب در 10)
      const rialBalance = newBalance * 10;
      
      const response = await fetch(`/api/admin/users/${user.userTelegramID}/wallet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: rialBalance })
      });

      const data = await response.json();
      
      if (data.success) {
        // به‌روزرسانی موجودی در state (ریال)
        if (userStats) {
          setUserStats({
            ...userStats,
            walletBalance: rialBalance
          });
        }
        setShowWalletModal(false);
        // می‌توانید notification اضافه کنید
        console.log('موجودی کیف پول با موفقیت تغییر کرد');
      } else {
        console.error('خطا در تغییر موجودی:', data.error);
      }
    } catch (error) {
      console.error('خطا در تغییر موجودی کیف پول:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  if (adminLoading || userLoading || telegramLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 mx-4">
            <h2 className="text-xl font-semibold mb-2 text-red-200">
              خطا در بارگذاری صفحه
            </h2>
            <p className="text-sm text-red-100">
              {error}
            </p>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 px-4 py-2 text-sm rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: '1px solid var(--field-accent-color)'
              }}
            >
              بازگشت به لیست کاربران
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 mx-4">
            <h2 className="text-xl font-semibold mb-2 text-red-200">
              دسترسی غیرمجاز
            </h2>
            <p className="text-sm text-red-100">
              شما دسترسی به این صفحه ندارید
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 pt-4 pb-6">
        <div className="max-w-md mx-auto">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: '#8794a1' }}>در حال بارگذاری...</p>
            </div>
          )}

           {/* User Info Header - Similar to Profile */}
           {!loading && user && (
             <div className="mb-6">
               <div className="flex items-center gap-3">
                 {/* User Avatar */}
                 <div className="w-14 h-14 rounded-lg overflow-hidden border-2 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--bg-color)',
                        borderColor: 'var(--inactive-color)'
                      }}>
                   {userAvatar ? (
                     <img 
                       src={userAvatar} 
                       alt={user.userFullName}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <UserGroupIcon width={28} height={28} style={{ color: '#22c55e' }} />
                   )}
                 </div>
                 
                 {/* User Info Text */}
                 <div className="flex-1 text-right">
                   <div className="text-lg font-light text-white mb-1">
                     ({user.userTelegramID}) {user.userFullName}
                   </div>
                   <div className="text-xs text-gray-400">
                     شناسه کاربری: {user.userID}
                   </div>
                 </div>
                 
                 {/* Verification Badge */}
                 <div className="flex items-center gap-2">
                   <div className="px-3 py-1 rounded-lg" style={{ 
                     backgroundColor: user.isVerified ? '#22c55e20' : '#ef444420',
                     border: `1px solid ${user.isVerified ? '#22c55e40' : '#ef444440'}`,
                     color: user.isVerified ? '#22c55e' : '#ef4444',
                     fontSize: '12px',
                     fontWeight: '500'
                   }}>
                     {user.isVerified ? 'احراز شده' : 'احراز نشده'}
                   </div>
                   {user.isAdmin && (
                     <div className="px-3 py-1 rounded-lg" style={{ 
                       backgroundColor: '#7c3aed20',
                       border: '1px solid #7c3aed40',
                       color: '#7c3aed',
                       fontSize: '12px',
                       fontWeight: '500'
                     }}>
                       ادمین
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

          {/* User Stats */}
          {!loading && user && userStats && (
            <div className="mb-4 space-y-3">
              {/* موجودی کیف پول */}
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-lg" 
                     style={{ 
                       backgroundColor: 'var(--field-bg-color)',
                       border: '1px solid var(--border-color)'
                     }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cash01Icon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                      <span className="text-sm text-white">موجودی کیف پول:</span>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">
                        {formatNumber(userStats.walletBalance / 10)}
                      </span>
                      <span className="text-sm text-white mr-1">تومان</span>
                    </div>
                  </div>
                </div>
                
                {/* دکمه تغییر */}
                <button 
                  onClick={() => setShowWalletModal(true)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                  style={{ 
                    backgroundColor: 'var(--field-accent-color)',
                    border: '1px solid var(--field-accent-color)',
                    height: '48px'
                  }}
                >
                  تغییر
                </button>
              </div>

               {/* شماره موبایل و کد ملی در یک ردیف */}
               <div className="grid grid-cols-2 gap-3">
                 {/* شماره موبایل */}
                 <div className="p-3 rounded-lg" 
                      style={{ 
                        backgroundColor: 'var(--field-bg-color)',
                        border: '1px solid var(--border-color)'
                      }}>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <UserGroupIcon width={14} height={14} style={{ color: 'var(--field-accent-color)' }} />
                       <span className="text-xs text-white">موبایل:</span>
                     </div>
                     <div className="text-left">
                       <span className="text-xs font-semibold text-white">
                         {user.userPhoneNumber || 'ثبت نشده'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* کد ملی */}
                 <div className="p-3 rounded-lg" 
                      style={{ 
                        backgroundColor: 'var(--field-bg-color)',
                        border: '1px solid var(--border-color)'
                      }}>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <UserGroupIcon width={14} height={14} style={{ color: 'var(--field-accent-color)' }} />
                       <span className="text-xs text-white">کد ملی:</span>
                     </div>
                     <div className="text-left">
                       <span className="text-xs font-semibold text-white">
                         {user.userNationalID || 'ثبت نشده'}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* تاریخ عضویت */}
               <div className="p-3 rounded-lg" 
                    style={{ 
                      backgroundColor: 'var(--field-bg-color)',
                      border: '1px solid var(--border-color)'
                    }}>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <UserGroupIcon width={16} height={16} style={{ color: 'var(--field-accent-color)' }} />
                     <span className="text-sm text-white">تاریخ عضویت:</span>
                   </div>
                   <div className="text-left">
                     <span className="text-sm font-semibold text-white">
                       {formatDate(user.createdAt)}
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          )}

           {/* User Details */}
           {!loading && user && (
             <div className="mb-4 space-y-2">

              {/* Activity Stats */}
              {userStats && (
                <div className="p-3 rounded-lg" 
                     style={{ 
                       backgroundColor: 'var(--field-bg-color)',
                       border: '1px solid var(--border-color)'
                     }}>
                  <h3 className="text-sm font-medium text-white mb-3 text-center">آمار فعالیت کاربر</h3>
                  
                  {/* Row 1: مجموع خریدها (ردیف کامل) */}
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--inactive-color)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Cash01Icon width={19} height={19} color="#ffc107" />
                        </div>
                        <div className="text-sm text-white">مجموع خریدها</div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(userStats.totalSpent)} تومان
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 2: تراکنش‌ها و شماره‌های مجازی */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--inactive-color)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <CreditCardPosIcon width={19} height={19} color="#8a2be2" />
                        </div>
                        <div className="text-sm text-white">تراکنش‌ها</div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(userStats.totalTransactions)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--inactive-color)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <UserGroupIcon width={19} height={19} color="#ff69b4" />
                        </div>
                        <div className="text-sm text-white">شماره‌های مجازی</div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(userStats.virtualNumbersCount)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 3: خریدهای استارز و پریمیوم */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--inactive-color)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <StarIcon className="w-5 h-5" style={{ color: '#ffc107' }} />
                        </div>
                        <div className="text-sm text-white">خریدهای استارز</div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(userStats.starsPurchasesCount)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--inactive-color)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <GiftIcon width={19} height={19} color="#ffc107" />
                        </div>
                        <div className="text-sm text-white">خریدهای پریمیوم</div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(userStats.premiumPurchasesCount)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/users')}
              className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: '1px solid var(--field-accent-color)'
              }}
            >
              بازگشت به لیست
            </button>
            
          </div>
        </div>
      </div>

      {/* Wallet Change Modal */}
      {user && userStats && (
        <WalletChangeModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConfirm={handleWalletChange}
          currentBalance={userStats.walletBalance / 10}
          userName={user.userFullName}
          loading={walletLoading}
        />
      )}
    </div>
  );
}
