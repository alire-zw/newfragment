'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useUser } from '@/hooks/useUser';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Search01Icon from '../../../../public/icons/search-01-stroke-rounded(1)';
import UserGroupIcon from '../../../../public/icons/user-group-03-stroke-rounded';
import IdVerifiedIcon from '../../../../public/icons/id-verified-stroke-rounded';
import IdNotVerifiedIcon from '../../../../public/icons/id-not-verified-stroke-rounded';
import ArrowLeft01Icon from '../../../../public/icons/arrow-left-01-stroke-rounded';

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

export default function AdminUsersPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user: dbUser, loading: userLoading } = useUser();
  const { userInfo, loading: telegramLoading, error } = useTelegramUser();
  const router = useRouter();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const { apiGet } = await import('@/utils/api');
        const data = await apiGet<any>('/api/admin/users');
        
        if (data.success) {
          setUsers(data.data);
          setFilteredUsers(data.data);
        } else {
          console.error('خطا در دریافت لیست کاربران:', data.error);
        }
      } catch (error) {
        console.error('خطا در دریافت لیست کاربران:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // جستجو در کاربران
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    setSearchLoading(true);
    
    const filtered = users.filter(user => 
      user.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userTelegramID.toString().includes(searchQuery) ||
      (user.userNationalID && user.userNationalID.includes(searchQuery)) ||
      (user.userPhoneNumber && user.userPhoneNumber.includes(searchQuery))
    );
    
    setFilteredUsers(filtered);
    setSearchLoading(false);
  }, [searchQuery, users]);

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
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                مدیریت کاربران
              </h1>
            </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>مدیریت</strong> و <strong>کنترل</strong> تمام کاربران سیستم
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              برای <strong>جستجو</strong>، <strong>فیلتر</strong> و <strong>مدیریت</strong> کاربران از اینجا استفاده کنید
            </p>
          </div>

          {/* Search Field */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search01Icon 
                  width={16} 
                  height={16} 
                  color={searchLoading ? '#6b7280' : '#8794a1'} 
                />
              </div>
              <input
                type="text"
                placeholder="جستجو در نام، شناسه، کد ملی، شماره موبایل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-lg text-right focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  opacity: searchQuery ? 0.7 : 1
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-row justify-between items-center mb-2 gap-4">
            <h2 className="text-lg font-semibold text-white">
              کاربران
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                disabled={usersLoading}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: 'white',
                  border: '1px solid var(--border-color)'
                }}
              >
                {usersLoading ? '...' : 'تازه‌سازی'}
              </button>
            </div>
          </div>

          {/* Table Headers */}
          <div 
            className="grid px-3 py-1 rounded-t-lg"
            style={{ 
              backgroundColor: '#293440',
              border: '1px solid var(--border-color)',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(80px, 100px) minmax(60px, 80px) minmax(50px, 60px)',
              gap: '8px'
            }}
          >
            <div className="text-right">
              <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                نام کاربر
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                شناسه عددی
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                نقش
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                احراز
              </span>
            </div>
          </div>

          {/* Users List */}
          {usersLoading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`py-0.5 px-3 ${
                    i === 10 ? 'rounded-b-lg' : 'rounded-none'
                  }`}
                  style={{ 
                    backgroundColor: '#212a33',
                    border: '1px solid var(--border-color)',
                    borderTop: i === 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                    borderBottom: i === 10 ? '1px solid var(--border-color)' : '1px solid var(--border-color)'
                  }}
                >
                  <div className="grid w-full" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(80px, 100px) minmax(60px, 80px) minmax(50px, 60px)', gap: '8px' }}>
                    {/* نام کاربر - Skeleton */}
                    <div className="flex items-center gap-2 text-right">
                      <div className="w-6 h-6 bg-gray-600 rounded-md animate-pulse"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-3 w-20 bg-gray-600 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-16 bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* شناسه عددی - Skeleton */}
                    <div className="flex items-center justify-center">
                      <div className="h-3 w-16 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    
                    {/* نقش - Skeleton */}
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-12 bg-gray-600 rounded-md animate-pulse"></div>
                    </div>
                    
                    {/* وضعیت تایید - Skeleton */}
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 bg-gray-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 rounded-b-lg" style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none'
                }}>
                  <UserGroupIcon width={48} height={48} style={{ color: "#6b7280" }} />
                  <p className="text-sm mt-4" style={{ color: '#8794a1' }}>
                    {searchQuery ? 'هیچ کاربری یافت نشد' : 'هیچ کاربری وجود ندارد'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between py-0.5 px-2 sm:px-3 cursor-pointer transition-colors duration-200 hover:opacity-80 ${
                      index === filteredUsers.length - 1 ? 'rounded-b-lg' : 'rounded-none'
                    }`}
                    style={{ 
                      backgroundColor: '#212a33',
                      border: '1px solid var(--border-color)',
                      borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                      borderBottom: index === filteredUsers.length - 1 ? '1px solid var(--border-color)' : '1px solid var(--border-color)'
                    }}
                    onClick={() => router.push(`/admin/users/${user.userTelegramID}`)}
                  >
                    <div className="grid w-full" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(80px, 100px) minmax(60px, 80px) minmax(50px, 60px)', gap: '8px' }}>
                      {/* نام کاربر */}
                      <div className="flex items-center gap-2 text-right">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                          <UserGroupIcon width={16} height={16} style={{ color: "#22c55e" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-xs sm:text-sm text-white truncate" title={user.userFullName}>
                            {user.userFullName.length > 20 ? `${user.userFullName.substring(0, 20)}...` : user.userFullName}
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                            {user.userID}
                          </p>
                        </div>
                      </div>
                      
                      {/* شناسه عددی */}
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm text-white font-medium">
                            {user.userTelegramID}
                          </div>
                        </div>
                      </div>
                      
                      {/* نقش */}
                      <div className="flex items-center justify-center">
                        {user.isAdmin ? (
                          <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs min-w-[50px] sm:min-w-[60px] text-center" style={{ 
                            backgroundColor: 'rgba(124, 58, 237, 0.08)',
                            color: '#7c3aed',
                            border: '1px solid rgba(124, 58, 237, 0.15)'
                          }}>
                            <span className="font-medium">ادمین</span>
                          </div>
                        ) : (
                          <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs min-w-[50px] sm:min-w-[60px] text-center" style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.08)',
                            color: '#6b7280',
                            border: '1px solid rgba(107, 114, 128, 0.15)'
                          }}>
                            <span className="font-medium">کاربر</span>
                          </div>
                        )}
                      </div>
                      
                      {/* وضعیت تایید */}
                      <div className="flex items-center justify-center">
                        {user.isVerified ? (
                          <IdVerifiedIcon width={18} height={18} color="#22c55e" className="sm:w-5 sm:h-5" />
                        ) : (
                          <IdNotVerifiedIcon width={18} height={18} color="#ef4444" className="sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Results Count */}
          {!usersLoading && (
            <div className="mt-4 text-center">
              <p className="text-xs" style={{ color: '#8794a1' }}>
                {searchQuery ? `نتایج جستجو: ${filteredUsers.length} از ${users.length} کاربر` : `مجموع: ${users.length} کاربر`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
