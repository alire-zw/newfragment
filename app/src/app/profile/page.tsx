'use client';

import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUser } from '@/hooks/useUser';
import { useReferral } from '@/hooks/useReferral';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProfilePage.module.css';

// Import icons
import VerifyIcon from '@/components/icons/VerifyIcon';
import CreditCardIcon from '@/components/icons/CreditCardIcon';
import ArrowIcon from '@/components/icons/ArrowIcon';
import CopyIcon from '@/components/icons/CopyIcon';
import UserGroupIcon from '../../../public/icons/user-group-03-stroke-rounded';
import CreditCardPosIcon from '../../../public/icons/credit-card-pos-stroke-rounded';
import GiftIcon from '../../../public/icons/gift-stroke-rounded';
import PercentSquareIcon from '../../../public/icons/percent-square-stroke-rounded';
import InvoiceIcon from '../../../public/icons/invoice-02-stroke-rounded';
import ClockIcon from '../../../public/icons/transaction-history-stroke-rounded';


const defaultAvatar =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOTk5IiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAzYzEuNjYgMCAzIDEuMzQgMyAzcy0xLjM0IDMtMyAzLTMtMS4zNC0zLTMgMS4zNC0zIDMtM3ptMCAxNC4yYy0yLjUgMC00LjcxLTEuMjgtNi0zLjIyLjAzLTEuOTkgNC0zLjA4IDYtMy4wOCAxLjk5IDAgNS45NyAxLjA5IDYgMy4wOC0xLjI5IDEuOTQtMy41IDMuMjItNiAzLjIyeiIvPjwvc3ZnPg==';

export default function ProfilePage() {
  const { userInfo, loading, error } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();
  const { stats: referralStats, loading: referralLoading, generateReferralLink, copyReferralLink } = useReferral();
  const router = useRouter();
  
  // State management
  const [deviceType, setDeviceType] = useState('other');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', hiding: false });

  // تابع تبدیل وضعیت احراز هویت به متن فارسی
  const getVerificationStatus = (isVerified: boolean | undefined) => {
    if (isVerified === undefined) return 'نامشخص';
    return isVerified ? 'احراز شده' : 'احراز نشده';
  };

  // تابع تبدیل وضعیت احراز هویت به رنگ
  const getVerificationColor = (isVerified: boolean | undefined) => {
    if (isVerified === undefined) return '#999999';
    return isVerified ? '#22c55e' : '#ef4444';
  };

  // تابع بستن notification
  const hideNotification = () => {
    if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
      clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
    }
    
    setNotification(prev => ({ ...prev, hiding: true }));
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false, hiding: false }));
    }, 400);
  };

  // تابع نمایش notification
  const showNotification = (message: string, type = 'success') => {
    if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
      clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
    }
    
    setNotification({ show: true, message, type, hiding: false });
    
    (window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer = setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  // تابع کپی کردن شناسه کاربری
  const copyUserId = async () => {
    if (!userInfo) return;
    
    try {
      const userId = userInfo.id.toString();
      await navigator.clipboard.writeText(userId);
      console.log('✅ User ID copied to clipboard:', userId);
      showNotification('شناسه کاربری کپی شد!', 'success');
    } catch (err) {
      console.error('❌ Failed to copy user ID:', err);
      
      try {
        const userId = userInfo.id.toString();
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showNotification('شناسه کاربری کپی شد!', 'success');
      } catch (fallbackErr) {
        console.error('❌ Fallback copy failed:', fallbackErr);
        showNotification('خطا در کپی کردن', 'error');
      }
    }
  };

  // Navigation functions
  const navigateToUserVerify = () => {
    router.push('/profile/verify');
  };

  const navigateToAddBankCard = () => {
    router.push('/profile/bank-accounts');
  };


  const navigateToCharge = () => {
    router.push('/charge');
  };

  const navigateToHistory = () => {
    router.push('/history');
  };


  // تابع ذخیره اطلاعات کاربر در دیتابیس
  const saveUserToDatabase = async () => {
    // API endpoint temporarily disabled - /api/users/profile not available
    console.log('💾 User data save disabled - API endpoint not available');
    return;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // تشخیص نوع دستگاه
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isAndroid) {
      setDeviceType('android');
      console.log('📱 ProfileMain: Android device detected');
    } else if (isIOS) {
      setDeviceType('ios');
      console.log('📱 ProfileMain: iOS device detected');
    } else {
      setDeviceType('other');
      console.log('📱 ProfileMain: Other device detected');
    }
    
    // تنظیم اطلاعات کاربر
    if (userInfo) {
      const fullName = (userInfo.first_name || '') + (userInfo.last_name ? ' ' + userInfo.last_name : '') || 'بدون نام';
      console.log('👤 User:', fullName);
      
      // ذخیره اطلاعات کاربر در دیتابیس
      saveUserToDatabase();
    }
  }, [userInfo]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
        clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
      }
    };
  }, []);

  const iconColor = 'var(--field-color)';
  
  // تنظیم padding بر اساس نوع دستگاه
  const containerStyle = {
    paddingBottom: deviceType === 'android' ? '70px' : '80px'
  };

  if (loading) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.content}>
          <div className={styles.header}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              <div className="w-14 h-14 bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
            <div className={styles.profileText}>
              <div className="h-5 w-32 bg-gray-600 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className={styles.flexSpacer}></div>
            <div className="h-8 w-24 bg-gray-600 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Referral Box Skeleton */}
        <div className={styles.referralBox}>
          <div className="h-5 w-28 bg-gray-600 rounded animate-pulse mx-auto"></div>
          <div className={styles.referralStats}>
            <div className={styles.referralStat}>
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-3.5 w-12 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-3.5 w-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div className={styles.referralStat}>
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-3.5 w-16 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-3.5 w-8 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div className={styles.referralStat}>
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-3.5 w-12 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-3.5 w-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div className={styles.referralStat}>
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-3.5 w-12 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-3.5 w-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className={styles.referralLinkSection}>
            <div className="h-2 w-20 bg-gray-600 rounded animate-pulse"></div>
            <div className={styles.referralLinkContainer}>
              <div className="h-7 flex-1 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-7 w-12 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Action Box Skeleton */}
        <div className={styles.actionBox}>
          <div className="h-10 flex-1 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-10 flex-1 bg-gray-600 rounded animate-pulse"></div>
        </div>
        
         <div className={styles.menuBox}>
          <div className={styles.menuList}>
            {[1, 2].map((i) => (
              <div key={i}>
                <div className={styles.menuItem}>
                  <div className={styles.menuItemStart}>
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className={styles.menuItemEnd}>
                    <div className="h-4 w-16 bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
                {i < 2 && <div className={styles.menuDivider}></div>}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className="text-center py-12">
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 mx-4">
            <h2 className="text-xl font-semibold mb-2 text-blue-200">
              لطفاً از طریق تلگرام وارد شوید
            </h2>
            <p className="text-sm text-blue-100">
              {error || 'برای استفاده از این سرویس، باید از طریق مینی‌اپ تلگرام وارد شوید'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={containerStyle}>
      {/* Custom Notification */}
      {notification.show && (
        <div 
          className={`${styles.notification} ${notification.hiding ? styles.hide : styles.show} ${notification.type ? styles[notification.type] : ''} ${typeof window !== 'undefined' && window.Telegram?.WebApp ? styles.telegram : ''}`}
          onClick={hideNotification}
        >
          <div className={styles.notificationContent}>
            <div className={styles.notificationTitle}>
              {notification.type === 'error' ? 'خطا!' : 
               notification.type === 'warning' ? 'هشدار!' : 
               notification.type === 'info' ? 'اطلاعات!' : 'موفق!'}
            </div>
            <div className={styles.notificationMessage}>
              {notification.message}
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            <Image 
              src={userInfo.photo_url || defaultAvatar} 
              alt="avatar" 
              width={56} 
              height={56} 
            />
          </div>
          <div className={styles.profileText}>
            <div className={styles.name}>
              {(userInfo.first_name || '') + (userInfo.last_name ? ' ' + userInfo.last_name : '') || 'بدون نام'}
            </div>
            <div className={styles.userId}>
              شناسه کاربری: {userInfo.id}
              <span className={styles.copyIcon} onClick={copyUserId} title="کپی شناسه کاربری">
                <CopyIcon color="var(--field-second-color)" size={14} />
              </span>
            </div>
          </div>
          <div className={styles.flexSpacer}></div>
          {!userLoading && dbUser && (
            <div className={styles.verificationBadge} style={{ 
              backgroundColor: `${getVerificationColor(dbUser.isVerified)}20`, 
              border: `1px solid ${getVerificationColor(dbUser.isVerified)}40`,
              color: getVerificationColor(dbUser.isVerified)
            }}>
              {getVerificationStatus(dbUser.isVerified)}
            </div>
          )}
        </div>
      </div>
      
      {/* Referral Box */}
      <div className={styles.referralBox}>
        <h3 className={styles.referralTitle}>معرفی به دوستان</h3>
        
        <div className={styles.referralStats}>
          <div className={styles.referralStat}>
            <div className={`${styles.referralStatIcon} ${styles.people}`}>
              <UserGroupIcon color="currentColor" width={19} height={19} />
            </div>
            <div className={styles.referralStatContent}>
              <div className={styles.referralStatLabel}>افراد</div>
              <div className={styles.referralStatValue}>
                {referralLoading ? '...' : referralStats.totalReferrals}
              </div>
            </div>
          </div>
          
          <div className={styles.referralStat}>
            <div className={`${styles.referralStatIcon} ${styles.transactions}`}>
              <CreditCardPosIcon color="currentColor" width={19} height={19} />
            </div>
            <div className={styles.referralStatContent}>
              <div className={styles.referralStatLabel}>تکمیل شده</div>
              <div className={styles.referralStatValue}>
                {referralLoading ? '...' : referralStats.completedReferrals}
              </div>
            </div>
          </div>
          
          <div className={styles.referralStat}>
            <div className={`${styles.referralStatIcon} ${styles.rewards}`}>
              <GiftIcon color="currentColor" width={19} height={19} />
            </div>
            <div className={styles.referralStatContent}>
              <div className={styles.referralStatLabel}>پاداش</div>
              <div className={styles.referralStatValue}>
                {referralLoading ? '...' : referralStats.totalReward.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className={styles.referralStat}>
            <div className={`${styles.referralStatIcon} ${styles.percent}`}>
              <PercentSquareIcon color="currentColor" width={19} height={19} />
            </div>
            <div className={styles.referralStatContent}>
              <div className={styles.referralStatLabel}>درصد</div>
              <div className={styles.referralStatValue}>
                {referralLoading ? '...' : `${referralStats.rewardPercentage}%`}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.referralLinkSection}>
          <div className={styles.referralLinkLabel}>لینک معرفی شما</div>
          <div className={styles.referralLinkContainer}>
            <input 
              type="text" 
              value={userInfo ? generateReferralLink(userInfo.id) : '...'} 
              readOnly 
              className={styles.referralLinkInput}
            />
            <button 
              className={styles.referralCopyButton}
              onClick={async () => {
                if (userInfo) {
                  const result = await copyReferralLink(userInfo.id);
                  showNotification(result.message, result.success ? 'success' : 'error');
                }
              }}
            >
              کپی
            </button>
          </div>
        </div>
      </div>
      
      {/* Action Box */}
      <div className={styles.actionBox}>
        <button className={styles.actionButton} onClick={navigateToCharge}>
          <InvoiceIcon color="currentColor" width={16} height={16} />
          شارژ حساب
        </button>
        <button className={styles.actionButton} onClick={navigateToHistory}>
          <ClockIcon color="currentColor" width={16} height={16} />
          تاریخچه
        </button>
      </div>
      
       <div className={styles.menuBox}>
         <div className={styles.menuList}>
          <MenuItem 
            icon={<VerifyIcon color={dbUser?.isVerified ? 'var(--field-second-color)' : iconColor} />} 
            text={dbUser?.isVerified ? 'احراز شده' : 'احراز هویت'} 
            textColor={dbUser?.isVerified ? 'var(--field-second-color)' : iconColor} 
            onClick={dbUser?.isVerified ? () => {} : navigateToUserVerify}
            disabled={dbUser?.isVerified}
          />
          <div className={styles.menuDivider}></div>
          <MenuItem 
            icon={<CreditCardIcon color={dbUser?.isVerified ? iconColor : 'var(--field-second-color)'} />} 
            text="حساب های بانکی" 
            textColor={dbUser?.isVerified ? iconColor : 'var(--field-second-color)'} 
            onClick={dbUser?.isVerified ? navigateToAddBankCard : () => {}}
            disabled={!dbUser?.isVerified}
            badge={!dbUser?.isVerified ? 'احراز هویت کنید' : undefined}
            badgeColor={!dbUser?.isVerified ? '#ef4444' : undefined}
          />
        </div>
      </div>
      </div>
      
      <div className={styles.footer}>
        <p>ساخته شده با <span className={styles.heartBeat}>🤍</span> توسط <a href="https://t.me/alire_zw" target="_blank" rel="noopener noreferrer">علیرضا میرحسینی</a></p>
      </div>
    </div>
  );
}

function MenuItem({ icon, text, badge, badgeColor, textColor, onClick, disabled }: {
  icon: React.ReactNode;
  text: string;
  badge?: string;
  badgeColor?: string;
  textColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div 
      className={`${styles.menuItem} ${disabled ? styles.menuItemDisabled : ''}`} 
      onClick={disabled ? undefined : onClick}
    >
      <div className={styles.menuItemStart}>
        <span className={styles.menuIcon}>{icon}</span>
        <span className={styles.menuText} style={{ color: textColor }}>{text}</span>
      </div>
      <div className={styles.menuItemEnd}>
        {badge && (
          <span 
            className={styles.badge} 
            style={{ 
              backgroundColor: `${badgeColor}20`, 
              color: badgeColor,
              border: `1px solid ${badgeColor}40`
            }}
          >
            {badge}
          </span>
        )}
        <ArrowIcon color="var(--field-color)" />
      </div>
    </div>
  );
}
