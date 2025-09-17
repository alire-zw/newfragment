'use client';

import { useEffect, useState, memo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './MobileNavbar.module.css';

const navItems = [
  { label: 'فروشگاه', path: '/shop' },
  { label: 'شماره‌های من', path: '/my-virtual-numbers' },
  { label: 'پروفایل', path: '/profile' },
];

const MobileNavbar = memo(() => {
  const pathname = usePathname();
  const [deviceType, setDeviceType] = useState('');
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(userAgent);
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                  /iPad/.test(navigator.userAgent);
    
    if (isAndroid) {
      setDeviceType('android');
    } else if (isIOSDevice) {
      setDeviceType('ios');
    } else {
      setDeviceType('other');
    }
  }, []);

  const isActiveItem = (itemPath: string) => {
    if (itemPath === '/shop') {
      return pathname === '/shop';
    }
    if (itemPath === '/my-virtual-numbers') {
      return pathname.startsWith('/my-virtual-numbers');
    }
    if (itemPath === '/profile') {
      return pathname === '/profile';
    }
    return pathname === itemPath;
  };

  const navbarClasses = `${styles['mobile-navbar']} ${deviceType ? styles[deviceType] || '' : ''}`;

  return (
    <nav className={navbarClasses} data-device={deviceType}>
      {navItems.map((item) => {
        const isActive = isActiveItem(item.path);
        return (
          <Link 
            href={item.path} 
            key={item.label}
            className={`${styles['nav-item']} ${isActive ? styles.active : ''}`}
            prefetch={true}
          >
            <div className={styles['nav-icon']}>
              {item.label === 'فروشگاه' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9m-9 0a2 2 0 100 4 2 2 0 000-4zm9 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : item.label === 'شماره‌های من' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={styles['nav-label']}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});

MobileNavbar.displayName = 'MobileNavbar';

export default MobileNavbar;
