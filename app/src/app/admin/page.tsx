'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useUser } from '@/hooks/useUser';
import { useWallet } from '@/hooks/useWallet';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../profile/ProfilePage.module.css';

// Import icons
import UserGroupIcon from '../../../public/icons/user-group-03-stroke-rounded';
import CreditCardPosIcon from '../../../public/icons/credit-card-pos-stroke-rounded';
import GiftIcon from '../../../public/icons/gift-stroke-rounded';
import PercentSquareIcon from '../../../public/icons/percent-square-stroke-rounded';
import InvoiceIcon from '../../../public/icons/invoice-02-stroke-rounded';
import ClockIcon from '../../../public/icons/transaction-history-stroke-rounded';
import ArrowIcon from '@/components/icons/ArrowIcon';

const defaultAvatar =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOTk5IiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAzYzEuNjYgMCAzIDEuMzQgMyAzcy0xLjM0IDMtMyAzLTMtMS4zNC0zLTMgMS4zNC0zIDMtM3ptMCAxNC4yYy0yLjUgMC00LjcxLTEuMjgtNi0zLjIyLjAzLTEuOTkgNC0zLjA4IDYtMy4wOCAxLjk5IDAgNS45NyAxLjA5IDYgMy4wOC0xLjI5IDEuOTQtMy41IDMuMjItNiAzLjIyeiIvPjwvc3ZnPg==';

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  totalWalletBalance: number;
  totalDeposits: number;
}

export default function AdminPanel() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user: dbUser, loading: userLoading } = useUser();
  const { walletData, loading: walletLoading, formatAmount } = useWallet();
  const { userInfo, loading, error } = useTelegramUser();
  const router = useRouter();
  
  // State management
  const [deviceType, setDeviceType] = useState('other');
  const [tgName, setTgName] = useState('بدون نام');
  const [tgAvatar, setTgAvatar] = useState(defaultAvatar);
  const [tgId, setTgId] = useState('123456789');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalWalletBalance: 0,
    totalDeposits: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // تشخیص نوع دستگاه
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isAndroid) {
      setDeviceType('android');
    } else if (isIOS) {
      setDeviceType('ios');
    } else {
      setDeviceType('other');
    }
    
    // تنظیم اطلاعات کاربر
    if (userInfo) {
      const fullName = (userInfo.first_name || '') + (userInfo.last_name ? ' ' + userInfo.last_name : '') || 'بدون نام';
      const userId = userInfo.id ? userInfo.id.toString() : '123456789';
      const userAvatar = userInfo.photo_url || defaultAvatar;
      
      setTgName(fullName);
      setTgId(userId);
      setTgAvatar(userAvatar);
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          console.error('خطا در دریافت آمار:', data.error);
          // در صورت خطا، مقادیر پیش‌فرض نمایش داده می‌شود
          setStats({
            totalUsers: 0,
            totalTransactions: 0,
            totalRevenue: 0,
            activeUsers: 0,
            totalWalletBalance: 0,
            totalDeposits: 0,
          });
        }
      } catch (error) {
        console.error('خطا در دریافت آمار:', error);
        // در صورت خطا، مقادیر پیش‌فرض نمایش داده می‌شود
        setStats({
          totalUsers: 0,
          totalTransactions: 0,
          totalRevenue: 0,
          activeUsers: 0,
          totalWalletBalance: 0,
          totalDeposits: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  // تنظیم padding بر اساس نوع دستگاه
  const containerStyle = {
    paddingBottom: deviceType === 'android' ? '70px' : '80px'
  };

  if (adminLoading || userLoading || loading) {
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
          
           {/* Stats Box Skeleton */}
           <div className={styles.referralBox}>
             <div className="h-5 w-28 bg-gray-600 rounded animate-pulse mx-auto"></div>
             
             {/* Row 1: کل کاربران و تراکنش‌ها (کنار هم) */}
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
                   <div className="h-3.5 w-12 bg-gray-600 rounded animate-pulse"></div>
                   <div className="h-3.5 w-6 bg-gray-600 rounded animate-pulse"></div>
                 </div>
               </div>
             </div>
             
             {/* Rows 2-5: هر کدام در یک ردیف کامل */}
             {[...Array(4)].map((_, i) => (
               <div key={i} className={styles.referralStats} style={{ gridTemplateColumns: '1fr' }}>
                 <div className={styles.referralStat}>
                   <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                   <div className="flex-1 flex items-center gap-1">
                     <div className="h-3.5 w-12 bg-gray-600 rounded animate-pulse"></div>
                     <div className="h-3.5 w-6 bg-gray-600 rounded animate-pulse"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
          
          {/* Action Box Skeleton */}
          <div className={styles.actionBox}>
            <div className="h-10 flex-1 bg-gray-600 rounded animate-pulse"></div>
            <div className="h-10 flex-1 bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          <div className={styles.menuBox}>
            <div className={styles.menuList}>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className={styles.menuItem}>
                    <div className={styles.menuItemStart}>
                      <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className={styles.menuItemEnd}>
                      <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                  {i < 3 && <div className={styles.menuDivider}></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className="text-center py-12">
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 mx-4">
            <h2 className="text-xl font-semibold mb-2 text-red-200">
              خطا در بارگذاری پنل ادمین
            </h2>
            <p className="text-sm text-red-100">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className="text-center py-12">
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
    <div className={styles.container} style={containerStyle}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              <Image src={tgAvatar} alt="avatar" width={56} height={56} />
            </div>
            <div className={styles.profileText}>
              <div className={styles.name}>{tgName}</div>
              <div className={styles.userId}>
                شناسه ادمین: {tgId}
              </div>
            </div>
            <div className={styles.flexSpacer}></div>
            <div className={styles.verificationBadge} style={{ 
              backgroundColor: '#7c3aed20', 
              border: '1px solid #7c3aed40',
              color: '#7c3aed'
            }}>
              ادمین
            </div>
          </div>
        </div>
        
         {/* Stats Box */}
         <div className={styles.referralBox}>
           <h3 className={styles.referralTitle}>آمار سیستم</h3>
           
           {/* Row 1: کل کاربران و تراکنش‌ها (کنار هم) */}
           <div className={styles.referralStats}>
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.people}`}>
                 <UserGroupIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>کل کاربران</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : formatNumber(stats.totalUsers)}
                 </div>
               </div>
             </div>
             
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.transactions}`}>
                 <CreditCardPosIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>تراکنش‌ها</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : formatNumber(stats.totalTransactions)}
                 </div>
               </div>
             </div>
           </div>
           
           {/* Row 2: درآمد کل (ردیف کامل) */}
           <div className={styles.referralStats} style={{ gridTemplateColumns: '1fr' }}>
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.rewards}`}>
                 <GiftIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>درآمد کل</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : `${formatNumber(stats.totalRevenue)} تومان`}
                 </div>
               </div>
             </div>
           </div>
           
           {/* Row 3: کاربران فعال (ردیف کامل) */}
           <div className={styles.referralStats} style={{ gridTemplateColumns: '1fr' }}>
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.percent}`}>
                 <PercentSquareIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>کاربران فعال</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : formatNumber(stats.activeUsers)}
                 </div>
               </div>
             </div>
           </div>
           
           {/* Row 4: موجودی کیف پول (ردیف کامل) */}
           <div className={styles.referralStats} style={{ gridTemplateColumns: '1fr' }}>
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.people}`}>
                 <InvoiceIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>موجودی کیف پول</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : `${formatNumber(stats.totalWalletBalance)} تومان`}
                 </div>
               </div>
             </div>
           </div>
           
           {/* Row 5: کل واریزی‌ها (ردیف کامل) */}
           <div className={styles.referralStats} style={{ gridTemplateColumns: '1fr' }}>
             <div className={styles.referralStat}>
               <div className={`${styles.referralStatIcon} ${styles.transactions}`}>
                 <ClockIcon color="currentColor" width={19} height={19} />
               </div>
               <div className={styles.referralStatContent}>
                 <div className={styles.referralStatLabel}>کل واریزی‌ها</div>
                 <div className={styles.referralStatValue}>
                   {statsLoading ? '...' : `${formatNumber(stats.totalDeposits)} تومان`}
                 </div>
               </div>
             </div>
           </div>
         </div>
        
        {/* Action Box */}
        <div className={styles.actionBox}>
          <button className={styles.actionButton} onClick={() => router.push('/admin/users')}>
            <UserGroupIcon color="currentColor" width={16} height={16} />
            مدیریت کاربران
          </button>
          <button 
            className={styles.actionButton} 
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            disabled
          >
            <ClockIcon color="currentColor" width={16} height={16} />
            تراکنش‌ها
          </button>
        </div>
        
        <div className={styles.menuBox}>
          <div className={styles.menuList}>
            <MenuItem 
              icon={<UserGroupIcon color="var(--field-color)" />} 
              text="مدیریت کاربران" 
              textColor="var(--field-color)" 
              onClick={() => router.push('/admin/users')}
            />
            <div className={styles.menuDivider}></div>
            <div style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <MenuItem 
                icon={<CreditCardPosIcon color="var(--field-color)" />} 
                text="مدیریت تراکنش‌ها" 
                textColor="var(--field-color)" 
                onClick={() => {}}
              />
            </div>
            <div className={styles.menuDivider}></div>
            <MenuItem 
              icon={<InvoiceIcon color="var(--field-color)" />} 
              text="تنظیمات سیستم" 
              textColor="var(--field-color)" 
              onClick={() => router.push('/admin/settings')}
            />
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <p>پنل ادمین - <span className={styles.heartBeat}>🔧</span> مدیریت سیستم</p>
      </div>
    </div>
  );
}

function MenuItem({ icon, text, textColor, onClick }: {
  icon: React.ReactNode;
  text: string;
  textColor: string;
  onClick: () => void;
}) {
  return (
    <div 
      className={styles.menuItem} 
      onClick={onClick}
    >
      <div className={styles.menuItemStart}>
        <span className={styles.menuIcon}>{icon}</span>
        <span className={styles.menuText} style={{ color: textColor }}>{text}</span>
      </div>
      <div className={styles.menuItemEnd}>
        <ArrowIcon color="var(--field-color)" />
      </div>
    </div>
  );
}
