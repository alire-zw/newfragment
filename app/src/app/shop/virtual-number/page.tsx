'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Search01Icon from '../../../../public/icons/search-01-stroke-rounded(1)';
import ArrowDown01Icon from '../../../../public/icons/arrow-down-01-stroke-rounded';
import ArrowDataTransferVerticalIcon from '../../../../public/icons/arrow-data-transfer-vertical-stroke-rounded';
import ArrowLeft01Icon from '../../../../public/icons/arrow-left-01-stroke-rounded';
import PackageDeliveredIcon from '../../../../public/icons/package-delivered-stroke-rounded';
import PackageRemoveIcon from '../../../../public/icons/package-remove-stroke-rounded';
import Cash01Icon from '../../../../public/icons/cash-01-stroke-rounded';
import { useVirtualNumbers, Country } from '@/hooks/useVirtualNumbers';
import { useUser } from '@/hooks/useUser';
import { useState as useStateReact, useEffect as useEffectReact } from 'react';

export default function VirtualNumberPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // دریافت داده‌ها از API
  const { countries, loading, error, refetch } = useVirtualNumbers(1);
  
  // مدیریت اطلاعات کاربر
  useUser();

  // دریافت درصد سود از تنظیمات سیستم
  useEffectReact(() => {
    const fetchProfitPercentage = async () => {
      try {
        const { apiGet } = await import('@/utils/api');
        const data = await apiGet<any>('/api/settings/public');
        
        if (data.success && data.data.virtual_number_profit_percentage) {
          setProfitPercentage(parseFloat(data.data.virtual_number_profit_percentage) || 0);
        }
      } catch (error) {
        console.error('خطا در دریافت درصد سود:', error);
      }
    };

    fetchProfitPercentage();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCountries = countries
    .filter((country: Country) => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
    )
    .sort((a: Country, b: Country) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc' 
          ? a.price - b.price
          : b.price - a.price;
      }
    });

  const formatPrice = (price: number) => {
    // اضافه کردن درصد سود به قیمت
    const priceWithProfit = price + (price * profitPercentage / 100);
    return Math.floor(priceWithProfit).toLocaleString('en-US');
  };

  const handleImageError = (countryId: string) => {
    setImageErrors(prev => new Set(prev).add(countryId));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
                     {/* Header */}
           <div className="text-center mb-6">
             <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">
               خرید شماره مجازی مخصوص تلگرام
             </h1>
             <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
               شماره‌های <strong>مجازی</strong> برای استفاده در <strong>تلگرام</strong> بدون نیاز به سیم‌کارت فیزیکی
             </p>
             <p className="text-xs" style={{ color: '#8794a1' }}>
               تمام شماره‌ها <strong>تضمین شده</strong> و <strong>فعال</strong> هستند. پس از <strong>خرید</strong>، شماره <strong>بلافاصله</strong> در دسترس خواهد بود.
             </p>
           </div>

                     {/* Search Bar */}
           <div className="mb-6">
             <div className="relative">
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                 <Search01Icon className="h-4 w-4" style={{ color: 'var(--text-secondary-color)' }} />
               </div>
               <input
                 type="text"
                 placeholder="جستجو در کشورها..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pr-10 pl-4 py-2 rounded-lg text-right focus:outline-none"
                 style={{ 
                   backgroundColor: 'var(--field-bg-color)',
                   color: 'var(--text-color)',
                   border: '1px solid var(--border-color)',
                   opacity: searchTerm ? 0.7 : 1
                 }}
               />
             </div>
           </div>

          {/* Controls */}
          <div className="flex flex-row justify-between items-center mb-2 gap-4">
            <h2 className="text-lg font-semibold text-white">
              کشورها
            </h2>
            <div className="flex gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: 'white',
                  border: '1px solid var(--border-color)'
                }}
              >
                {loading ? '...' : 'تازه‌سازی'}
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-1.5 pl-8 pr-3 rounded-lg text-sm text-right font-medium focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--field-bg-color)',
                    color: 'white',
                    border: 'none',
                    fontFamily: 'IRANYekan, system-ui, sans-serif',
                    fontWeight: 500
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#248bda';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--field-bg-color)';
                  }}
                >
                  {sortBy === 'name' ? 'نام کشور' : 'قیمت'}
                </button>
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <ArrowDown01Icon className="h-4 w-4" style={{ color: 'var(--text-secondary-color)' }} />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-right font-medium hover:bg-opacity-80"
                      style={{ 
                        backgroundColor: '#2e3a47',
                        color: 'white',
                        fontFamily: 'IRANYekan, system-ui, sans-serif',
                        fontWeight: 500
                      }}
                    >
                      نام کشور
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-right font-medium hover:bg-opacity-80"
                      style={{ 
                        backgroundColor: '#2e3a47',
                        color: 'white',
                        fontFamily: 'IRANYekan, system-ui, sans-serif',
                        fontWeight: 500
                      }}
                    >
                      قیمت
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: 'white',
                  border: '1px solid var(--border-color)'
                }}
              >
                <span className="text-right">
                  {sortBy === 'name' 
                    ? (sortOrder === 'asc' ? 'الف تا ی' : 'ی تا الف')
                    : (sortOrder === 'asc' ? 'ارزان‌ترین' : 'گران‌ترین')
                  }
                </span>
                <ArrowDataTransferVerticalIcon className="h-4 w-4" style={{ color: 'var(--text-secondary-color)' }} />
              </button>
            </div>
          </div>

                     {/* Table Headers */}
           <div 
             className="grid grid-cols-3 gap-4 px-3 py-1 rounded-t-lg"
             style={{ 
               backgroundColor: '#293440',
               border: '1px solid var(--border-color)'
             }}
           >
             <div className="text-right">
               <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                 نام کشور
               </span>
             </div>
             <div className="text-center">
               <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                 وضعیت موجودی
               </span>
             </div>
             <div className="text-right">
               <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                 قیمت
               </span>
             </div>
           </div>

                     {/* Loading State */}
           {loading && (
             <div className="space-y-0">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                 <div
                   key={i}
                   className={`flex items-center justify-between py-0.5 px-3 ${
                     i === 10 ? 'rounded-b-lg' : 'rounded-none'
                   }`}
                   style={{ 
                     backgroundColor: '#212a33',
                     border: '1px solid var(--border-color)',
                     borderTop: i === 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                     borderBottom: i === 10 ? '1px solid var(--border-color)' : '1px solid var(--border-color)'
                   }}
                 >
                   <div className="grid grid-cols-3 gap-4 w-full">
                     {/* نام کشور - Skeleton */}
                     <div className="flex items-center gap-2 text-right">
                       <div className="w-6 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
                       <div>
                         <div className="h-4 w-20 bg-gray-600 rounded animate-pulse mb-1"></div>
                         <div className="h-3 w-12 bg-gray-600 rounded animate-pulse"></div>
                       </div>
                     </div>
                     
                     {/* وضعیت موجودی - Skeleton */}
                     <div className="flex items-center justify-center">
                       <div className="h-6 w-20 bg-gray-600 rounded-md animate-pulse"></div>
                     </div>
                     
                     {/* قیمت - Skeleton */}
                     <div className="flex items-center justify-between">
                       <div className="text-left">
                         <div className="flex items-center gap-1 mb-1">
                           <div className="h-4 w-4 bg-gray-600 rounded animate-pulse"></div>
                           <div className="h-4 w-16 bg-gray-600 rounded animate-pulse"></div>
                         </div>
                         <div className="h-3 w-8 bg-gray-600 rounded animate-pulse"></div>
                       </div>
                       <div className="h-3 w-3 bg-gray-600 rounded animate-pulse"></div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {/* Error State */}
           {error && (
             <div className="text-center py-8">
               <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                 <p className="text-red-400 text-sm mb-2">خطا در دریافت داده‌ها:</p>
                 <p className="text-red-300 text-xs">{error}</p>
               </div>
               <button
                 onClick={refetch}
                 className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
               >
                 تلاش مجدد
               </button>
             </div>
           )}

          {/* Countries List */}
          {!loading && !error && (
            <div className="space-y-0">
              {filteredCountries.map((country: Country, index: number) => (
               <div
                 key={country.id}
                 onClick={() => router.push(`/shop/virtual-number/confirm?countryId=${country.id}&countryName=${encodeURIComponent(country.name)}&price=${country.price}`)}
                 className={`flex items-center justify-between py-0.5 px-3 cursor-pointer transition-colors duration-200 hover:opacity-80 ${
                   index === filteredCountries.length - 1 ? 'rounded-b-lg' : 
                   'rounded-none'
                 }`}
                 style={{ 
                   backgroundColor: '#212a33',
                   border: '1px solid var(--border-color)',
                   borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                   borderBottom: index === filteredCountries.length - 1 ? '1px solid var(--border-color)' : '1px solid var(--border-color)'
                 }}
               >
                 <div className="grid grid-cols-3 gap-4 w-full">
                   {/* نام کشور */}
                   <div className="flex items-center gap-2 text-right">
                     <div className="w-6 h-4 flex items-center justify-center">
                       {imageErrors.has(country.id) ? (
                         <span className="text-lg">🏳️</span>
                       ) : (
                         <img 
                           src={country.flag} 
                           alt={`پرچم ${country.name}`}
                           className="w-6 h-4 object-cover rounded-sm"
                           onError={() => handleImageError(country.id)}
                         />
                       )}
                     </div>
                     <div>
                       <h3 className="font-semibold text-sm text-white">
                         {country.name}
                       </h3>
                       <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                         {country.code}
                       </p>
                     </div>
                   </div>
                   
                   {/* وضعیت موجودی */}
                   <div className="flex items-center justify-center">
                     {country.available ? (
                       <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs min-w-[80px]" style={{ 
                         backgroundColor: 'rgba(34, 197, 94, 0.08)',
                         color: '#22c55e',
                         border: '1px solid rgba(34, 197, 94, 0.15)'
                       }}>
                         <span className="font-medium">موجود</span>
                         <PackageDeliveredIcon className="h-4 w-4" style={{ color: '#16a34a' }} />
                       </div>
                     ) : (
                       <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs min-w-[80px]" style={{ 
                         backgroundColor: 'rgba(239, 68, 68, 0.08)',
                         color: '#ef4444',
                         border: '1px solid rgba(239, 68, 68, 0.15)'
                       }}>
                         <span className="font-medium">ناموجود</span>
                         <PackageRemoveIcon className="h-4 w-4" style={{ color: '#dc2626' }} />
                       </div>
                     )}
                   </div>
                   
                   {/* قیمت */}
                   <div className="flex items-center justify-between">
                     <div className="text-left">
                       <div className="flex items-center gap-1">
                         <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                         <span className="font-semibold text-sm text-white">
                           {formatPrice(country.price)}
                         </span>
                       </div>
                       <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                         تومان
                       </p>
                     </div>
                     <ArrowLeft01Icon className="h-3 w-3" style={{ color: '#8c9aa9' }} />
                   </div>
                 </div>
               </div>
             ))}
             </div>
           )}

          {/* Spacer to maintain bottom spacing */}
          <div className="mt-8"></div>
        </div>
      </div>
    </div>
  );
}
