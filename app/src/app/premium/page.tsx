'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import Search01Icon from '../../../public/icons/search-01-stroke-rounded(1)';
import Delete01Icon from '../../../public/icons/delete-01-stroke-rounded';
import Cash01Icon from '../../../public/icons/cash-01-stroke-rounded';
import PremiumBuyConfirmModal from '@/components/PremiumBuyConfirmModal';

interface PremiumPackage {
  id: string;
  duration: string;
  months: number;
  price?: number;
}

const premiumPackages: PremiumPackage[] = [
  { id: '1', duration: '3 ماهه', months: 3 },
  { id: '2', duration: '6 ماهه', months: 6 },
  { id: '3', duration: '1 ساله', months: 12 },
];

export default function PremiumPage() {
  const [recipient, setRecipient] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('2');
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    name: string;
    photo: string;
    username: string;
    recipient: string;
  } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [priceData, setPriceData] = useState<{
    tonRate: number;
    prices: { [key: string]: number };
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [tonToTomanRate, setTonToTomanRate] = useState<number | null>(null);
  const [profitPercentages, setProfitPercentages] = useState<{[key: string]: number}>({});
  const [buyLoading, setBuyLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<{
    months: number;
    price: number;
  } | null>(null);
  const { userInfo } = useTelegramUser();
  const lastSearchRef = useRef<string>('');

  // Helper function to safely encode image URL
  const getSafeImageUrl = (url: string) => {
    if (!url) return '';
    try {
      // Check if URL is already properly formatted
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith('//')) {
        return `https:${url}`;
      }
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
  };

  const allPackages = [...premiumPackages];
  const selectedPackageData = allPackages.find(pkg => pkg.id === selectedPackage);

  // دریافت درصد سود از تنظیمات سیستم
  useEffect(() => {
    const fetchProfitPercentages = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (data.success) {
          const percentages: {[key: string]: number} = {};
          data.data.forEach((setting: any) => {
            if (setting.setting_key.startsWith('premium_') && setting.setting_key.includes('_profit_percentage')) {
              const months = setting.setting_key.includes('3_month') ? '3' : 
                           setting.setting_key.includes('6_month') ? '6' : 
                           setting.setting_key.includes('12_month') ? '12' : '';
              if (months) {
                percentages[months] = parseFloat(setting.setting_value) || 0;
              }
            }
          });
          setProfitPercentages(percentages);
        }
      } catch (error) {
        console.error('خطا در دریافت درصد سود:', error);
      }
    };

    fetchProfitPercentages();
  }, []);

  // Fetch premium prices and TON to Toman rate
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch premium prices
        const priceResponse = await fetch('/api/telegram/premium-price');
        const priceData = await priceResponse.json();
        
        if (priceData.success && priceData.data) {
          setPriceData(priceData.data);
        } else {
          console.error('Failed to fetch premium prices:', priceData.error);
          setPriceData({
            tonRate: 3.08,
            prices: { '3': 3.88, '6': 5.18, '12': 9.39 }
          });
        }

        // Fetch TON to Toman rate
        const tonResponse = await fetch('/api/telegram/convert-price');
        const tonData = await tonResponse.json();
        
        if (tonData.success && tonData.data) {
          setTonToTomanRate(tonData.data.tomanPrice);
        } else {
          console.error('Failed to fetch TON rate:', tonData.error);
          setTonToTomanRate(42000); // Fallback rate
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data
        setPriceData({
          tonRate: 3.08,
          prices: { '3': 3.88, '6': 5.18, '12': 9.39 }
        });
        setTonToTomanRate(42000);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchTelegramUser = useCallback(async (username: string) => {
    if (!username.trim()) {
      setFoundUser(null);
      return;
    }

    const selectedPackageData = allPackages.find(pkg => pkg.id === selectedPackage);
    const months = selectedPackageData ? selectedPackageData.months : 3;
    const searchKey = `${username.trim()}-${months}`;

    // Prevent duplicate requests for the same username and package
    if (lastSearchRef.current === searchKey) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (isSearching) {
      return;
    }

    lastSearchRef.current = searchKey;
    setIsSearching(true);
    setUserSearchLoading(true);
    try {
      const response = await fetch('/api/telegram/premium/recipient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(),
          months: months
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setFoundUser({
          name: data.data.name,
          photo: data.data.photo,
          username: username.trim(),
          recipient: data.data.recipient
        });
      } else {
        setFoundUser(null);
      }
    } catch (error) {
      console.error('User search error:', error);
      setFoundUser(null);
    } finally {
      setUserSearchLoading(false);
      setIsSearching(false);
    }
  }, [selectedPackage, isSearching]);

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (!value.trim()) {
      setFoundUser(null);
      lastSearchRef.current = ''; // Reset search key when input is cleared
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    } else {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for auto-search
      searchTimeoutRef.current = setTimeout(() => {
        searchTelegramUser(value);
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  const handleRecipientKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      searchTelegramUser(recipient);
    }
  };

  // Re-search when package changes if user is already found
  useEffect(() => {
    if (foundUser && recipient && !isSearching) {
      // Only search if the package actually changed and we have a valid recipient
      const timeoutId = setTimeout(() => {
        searchTelegramUser(recipient);
      }, 500); // Add a delay to prevent rapid successive calls
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedPackage]); // Only depend on selectedPackage

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleBuyForMyself = () => {
    if (userInfo?.username) {
      setRecipient(userInfo.username);
      searchTelegramUser(userInfo.username);
    }
  };


  // Calculate package price based on fetched prices
  const getPackagePrice = (months: number) => {
    if (!priceData || !tonToTomanRate) return null;
    
    const tonPrice = priceData.prices[months.toString()];
    if (!tonPrice) return null;
    
    // Convert TON to Toman using the real-time rate
    const baseTomanPrice = Math.round(tonPrice * tonToTomanRate);
    
    // اضافه کردن درصد سود بر اساس ماه
    const profitPercentage = profitPercentages[months.toString()] || 0;
    const priceWithProfit = baseTomanPrice + (baseTomanPrice * profitPercentage / 100);
    
    return {
      tonPrice: tonPrice,
      tomanPrice: Math.round(priceWithProfit)
    };
  };

  const handleBuyPremium = () => {
    if (!foundUser || !selectedPackageData || !userInfo) {
      alert('لطفاً ابتدا گیرنده و پکیج را انتخاب کنید');
      return;
    }

    const packagePrice = getPackagePrice(selectedPackageData.months);
    if (!packagePrice) {
      alert('خطا در دریافت قیمت');
      return;
    }

    setPendingPurchase({
      months: selectedPackageData.months,
      price: packagePrice.tomanPrice
    });
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!foundUser || !pendingPurchase || !userInfo) {
      return;
    }

    setBuyLoading(true);
    setShowConfirmModal(false);

    try {
      const response = await fetch('/api/telegram/premium/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: foundUser.recipient,
          username: foundUser.username,
          name: foundUser.name,
          months: pendingPurchase.months,
          userTelegramID: userInfo.id,
          price: pendingPurchase.price
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.transaction?.messages?.length > 0) {
        // هدایت به صفحه موفقیت با اطلاعات تراکنش
        const message = result.data.transaction.messages[0];
        const successPageId = result.data.successPageId || '';
        const successUrl = `/premium/success?months=${pendingPurchase.months}&price=${pendingPurchase.price}&recipientName=${encodeURIComponent(foundUser.name)}&recipientUsername=${encodeURIComponent(foundUser.username)}&recipientPhoto=${encodeURIComponent(foundUser.photo || '')}&address=${encodeURIComponent(message.address)}&amount=${encodeURIComponent(message.amount)}&payload=${encodeURIComponent(message.payload)}&successPageId=${encodeURIComponent(successPageId)}`;
        window.location.href = successUrl;
      } else {
        // در صورت خطا، نمایش خطا
        alert(result.error || 'خطا در خرید اشتراک پریمیوم');
      }
    } catch (error) {
      console.error('Buy premium error:', error);
      alert('خطا در خرید اشتراک پریمیوم');
    } finally {
      setBuyLoading(false);
      setPendingPurchase(null);
    }
  };

  const cancelPurchase = () => {
    setShowConfirmModal(false);
    setPendingPurchase(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-6 max-w-md">
         {/* Header */}
         <div className="text-center mb-6">
           <div className="flex items-center justify-center gap-1 mb-1">
             <h1 className="text-2xl md:text-3xl font-bold text-white">
               خرید اشتراک پریمیوم تلگرام
             </h1>
             <img 
               src="/icons/Telegram_Premium.png" 
               alt="Telegram Premium" 
               className="w-6 h-6"
             />
           </div>
           <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
             اشتراک <strong>پریمیوم</strong> تلگرام برای <strong>دسترسی</strong> به ویژگی‌های <strong>پیشرفته</strong> و <strong>مزایای</strong> اضافی
           </p>
           <p className="text-xs" style={{ color: '#8794a1' }}>
             تمام اشتراک‌ها <strong>تضمین شده</strong> و <strong>فوری</strong> هستند. پس از <strong>خرید</strong>، اشتراک <strong>بلافاصله</strong> فعال می‌شود.
           </p>
         </div>

        {/* Recipient Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">
              انتخاب گیرنده
            </h3>
            <button
              onClick={handleBuyForMyself}
              className="text-xs font-medium transition-colors duration-200 mr-1"
              style={{ color: 'var(--field-accent-color)', direction: 'ltr', textAlign: 'left' }}
            >
              خرید برای خودم
            </button>
          </div>
          
          <div className="relative" style={{ height: '40px' }}>
            <input
              type="text"
              placeholder={foundUser ? '' : "نام کاربری تلگرام را وارد کنید..."}
              value={foundUser ? '' : recipient}
              onChange={(e) => !foundUser && handleRecipientChange(e.target.value)}
              onKeyPress={handleRecipientKeyPress}
              disabled={userSearchLoading}
              readOnly={!!foundUser}
              className="w-full h-full rounded-lg focus:outline-none disabled:opacity-50 text-right"
              style={{ 
                backgroundColor: 'var(--field-bg-color)',
                color: recipient ? '#ffffff' : 'var(--text-color)',
                border: foundUser ? '1px solid var(--field-accent-color)' : '1px solid var(--border-color)',
                paddingRight: '40px',
                paddingLeft: foundUser ? '140px' : '16px',
                fontSize: '14px',
                lineHeight: '1.4'
              }}
            />
            
            {/* Loading Spinner */}
            {userSearchLoading && (
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Search Icon */}
            {!userSearchLoading && !foundUser && (
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                <Search01Icon className="h-4 w-4" style={{ color: 'var(--text-secondary-color)' }} />
              </div>
            )}
            
            {/* Clear Icon when user is found */}
            {!userSearchLoading && foundUser && (
              <button
                onClick={() => {
                  setFoundUser(null);
                  setRecipient('');
                }}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                <Delete01Icon 
                  className="h-4 w-4" 
                  style={{ color: '#ffffff' }}
                />
              </button>
            )}
            
            {/* User Info Display */}
            {foundUser && !userSearchLoading && (
              <div className="absolute top-1/2 left-3 transform -translate-y-1/2 flex items-center" style={{ gap: '8px' }}>
                <span className="text-white font-medium text-sm" style={{ lineHeight: '1' }}>
                  {foundUser.name}
                </span>
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {foundUser.photo ? (
                    <img 
                      src={getSafeImageUrl(foundUser.photo)} 
                      alt={foundUser.name}
                      className="w-6 h-6 rounded-full object-cover"
                      style={{ lineHeight: '1' }}
                      onError={(e) => {
                        // Hide image on error and show fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-text');
                          if (fallback) {
                            (fallback as HTMLElement).style.display = 'block';
                          }
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-white font-medium text-xs fallback-text" 
                    style={{ 
                      lineHeight: '1',
                      display: foundUser.photo ? 'none' : 'block'
                    }}
                  >
                    {foundUser.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Package Selection */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-white mb-1">
            انتخاب مدت اشتراک
          </h3>
          
          <div className="space-y-1">
            {premiumPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className="cursor-pointer py-3.5 px-3 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  border: selectedPackage === pkg.id ? '2px solid var(--field-accent-color)' : '1px solid var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Radio Button + Package Info */}
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      checked={selectedPackage === pkg.id}
                      onChange={() => setSelectedPackage(pkg.id)}
                    />
                    
                     {/* Package Info - Right */}
                     <div className="flex items-center gap-1.5">
                       <img 
                         src="/icons/Telegram_Premium.png" 
                         alt="Premium" 
                         className="w-4 h-4"
                       />
                       <span className="font-medium text-sm text-white">
                         {pkg.duration}
                       </span>
                     </div>
                  </div>

                  {/* Price - Left */}
                  <div className="flex items-center gap-1">
                    <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                    <span className="font-semibold text-sm text-white">
                      {priceLoading ? '...' : getPackagePrice(pkg.months) ? getPackagePrice(pkg.months)!.tomanPrice.toLocaleString('en-US') : '...'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-color)' }}>
                      تومان
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuyPremium}
          disabled={buyLoading || !foundUser || !selectedPackageData}
          className="w-full py-2 rounded-lg text-white font-semibold text-base mb-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: buyLoading || !foundUser || !selectedPackageData ? '#4a5568' : 'var(--btn-primary-bg-color)'
          }}
          onMouseEnter={(e) => {
            if (!buyLoading && foundUser && selectedPackageData) {
              e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
            }
          }}
          onMouseLeave={(e) => {
            if (!buyLoading && foundUser && selectedPackageData) {
              e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
            }
          }}
        >
          {buyLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>در حال پردازش...</span>
            </div>
          ) : !foundUser ? (
            'ابتدا گیرنده را انتخاب کنید'
          ) : !selectedPackageData ? (
            'ابتدا پکیج را انتخاب کنید'
          ) : (
            `خرید اشتراک ${selectedPackageData.duration} پریمیوم`
          )}
        </button>

        {/* Transaction History Link */}
        <div className="text-center">
          <a 
            href="/transactions" 
            className="text-sm transition-colors duration-200"
            style={{ color: 'var(--field-accent-color)' }}
          >
            مشاهده تاریخچه تراکنش‌ها
          </a>
        </div>
      </div>

      {/* Premium Buy Confirm Modal */}
      {foundUser && pendingPurchase && (
        <PremiumBuyConfirmModal
          isOpen={showConfirmModal}
          onClose={cancelPurchase}
          onConfirm={confirmPurchase}
          months={pendingPurchase.months}
          price={pendingPurchase.price}
          recipient={{
            name: foundUser.name,
            username: foundUser.username,
            photo: foundUser.photo
          }}
          loading={buyLoading}
        />
      )}
    </div>
  );
}
