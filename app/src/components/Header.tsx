'use client';

import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUser } from '@/hooks/useUser';
import { useWallet } from '@/hooks/useWallet';
import { useAdmin } from '@/hooks/useAdmin';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import IdVerifiedIcon from '../../public/icons/id-verified-stroke-rounded';
import IdNotVerifiedIcon from '../../public/icons/id-not-verified-stroke-rounded';
import Cash01Icon from '../../public/icons/cash-01-stroke-rounded';


export default function Header() {
  const { userInfo, loading, error } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();
  const { walletData, loading: walletLoading, formatAmount } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { label: 'شماره‌ها', path: '/shop/virtual-number', active: isMounted && (pathname === '/shop' || pathname === '/shop/virtual-number') },
    { label: 'استارز', path: '/stars', active: isMounted && pathname === '/stars' },
    { label: 'پریمیوم', path: '/premium', active: isMounted && pathname === '/premium' },
    { label: 'تبلیغات', path: '/ads', active: false, disabled: true },
    { label: 'پروفایل', path: '/profile', active: isMounted && pathname === '/profile' },
    ...(isAdmin ? [{ label: 'پنل ادمین', path: '/admin', active: isMounted && pathname === '/admin' }] : []),
  ];

  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#202931]">
        {/* Main Header */}
        <div className="h-11 flex items-center justify-between px-4">
          {/* Wallet Section - Skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex items-center px-2 py-0.5 rounded-lg" style={{ backgroundColor: '#293440', height: '32px', gap: '6px' }}>
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="flex items-center gap-1">
                <div className="w-12 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-8 h-3 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Profile Section - Skeleton */}
          <div className="flex items-center gap-2">
            {/* Right Side Box - Skeleton */}
            <div className="flex items-center px-2 py-0.5 rounded-lg" style={{ backgroundColor: '#293440', height: '32px' }}>
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
            
            {/* Profile Section - Skeleton */}
            <div className="flex items-center px-2 py-0.5 rounded-lg" style={{ direction: 'ltr', gap: '6px', backgroundColor: '#293440', height: '32px' }}>
              <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="text-left">
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Bar - Skeleton */}
        <div className="h-12 flex items-center px-4">
          <nav className="flex gap-4">
            {navItems.map((item, i) => (
              <div key={item.path} className="relative">
                <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                {i === 0 && (
                  <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gray-600 rounded-t-sm animate-pulse"></div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#202931]">
      {/* Main Header */}
      <div className="h-11 flex items-center justify-between px-4">
        {/* Wallet Section - Right Side */}
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center px-2 py-0.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
            style={{ backgroundColor: '#293440', height: '32px', gap: '6px' }}
            onClick={() => router.push('/charge')}
          >
            {walletLoading ? (
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
            ) : (
              <Cash01Icon className="w-4 h-4" style={{ color: '#248bda' }} />
            )}
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'ProductSansRegular, ProductSans, IRANYekanMobileBold, IRANYekan, tahoma, Arial, sans-serif' }}>
                {walletLoading ? '...' : walletData ? formatAmount(Math.floor(walletData.balance / 10)) : '0'}
              </span>
              <span className="text-white text-xs" style={{ fontFamily: 'ProductSansRegular, ProductSans, IRANYekanMobileBold, IRANYekan, tahoma, Arial, sans-serif' }}>
                تومان
              </span>
            </div>
          </div>
        </div>

        {/* Profile Section - Left Side */}
        <div className="flex items-center gap-2">
          {/* Right Side Box - Verification Status */}
          <div 
            className="flex items-center px-2 py-0.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
            style={{ backgroundColor: '#293440', height: '32px' }}
            onClick={() => {
              // فقط اگر احراز هویت نشده باشد، به صفحه احراز هویت برود
              if (!userLoading && dbUser && !dbUser.isVerified) {
                router.push('/profile/verify');
              }
            }}
          >
            {userLoading ? (
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
            ) : dbUser ? (
              dbUser.isVerified ? (
                <IdVerifiedIcon className="w-4 h-4" style={{ color: '#22c55e' }} />
              ) : (
                <IdNotVerifiedIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
              )
            ) : (
              <IdNotVerifiedIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
            )}
          </div>
          
          <div 
            className="flex items-center px-2 py-0.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
            style={{ direction: 'rtl', gap: '6px', backgroundColor: '#293440', height: '32px' }}
            onClick={() => router.push('/profile')}
          >
          {loading ? (
            <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
          ) : error ? (
            <div className="text-right">
              <h1 
                className="text-white font-bold text-sm whitespace-nowrap" 
                style={{ 
                  fontFamily: 'ProductSansRegular, ProductSans, IRANYekanMobileBold, IRANYekan, tahoma, Arial, sans-serif'
                }}
              >
                با تلگرام وارد شوید
              </h1>
            </div>
          ) : userInfo ? (
            <>
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                {userInfo.photo_url ? (
                  <Image 
                    src={userInfo.photo_url} 
                    alt="Profile" 
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.fallback-text');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'block';
                        }
                      }
                    }}
                  />
                ) : null}
                <span className="fallback-text text-white font-medium text-sm" style={{ display: userInfo.photo_url ? 'none' : 'block' }}>
                  {userInfo.first_name.charAt(0)}
                </span>
              </div>
              <div className="text-right">
                <h1 
                  className="text-white font-bold text-sm" 
                  style={{ 
                    fontFamily: 'ProductSansRegular, ProductSans, IRANYekanMobileBold, IRANYekan, tahoma, Arial, sans-serif'
                  }}
                >
                  {`${userInfo.first_name} ${userInfo.last_name || ''}`}
                </h1>
              </div>
            </>
          ) : (
            <div className="text-right">
              <h1 
                className="text-white font-bold text-sm whitespace-nowrap" 
                style={{ 
                  fontFamily: 'ProductSansRegular, ProductSans, IRANYekanMobileBold, IRANYekan, tahoma, Arial, sans-serif'
                }}
              >
                با تلگرام وارد شوید
              </h1>
            </div>
          )}
          </div>
        </div>

      </div>

      {/* Navigation Bar */}
      <div className="h-12 flex items-center px-4">
        <nav className="flex gap-4">
          {navItems.map((item) => (
            item.disabled ? (
              <span
                key={item.path}
                className="relative text-sm font-medium text-gray-600 cursor-not-allowed"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.path}
                href={item.path}
                className={`relative text-sm font-medium transition-colors ${
                  item.active 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
                {item.active && (
                  <div className="absolute -bottom-3 left-0 right-0 h-1 rounded-t-sm" style={{ backgroundColor: 'var(--field-accent-color)' }}></div>
                )}
              </Link>
            )
          ))}
        </nav>
      </div>
    </header>
  );
}
