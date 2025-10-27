'use client';

import { useState, useEffect } from 'react';
import Search01Icon from '../../../public/icons/search-01-stroke-rounded(1)';
import ArrowDown01Icon from '../../../public/icons/arrow-down-01-stroke-rounded';
import StarIcon from '../../../public/icons/star-component';
import Delete01Icon from '../../../public/icons/delete-01-stroke-rounded';
import Cash01Icon from '../../../public/icons/cash-01-stroke-rounded';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import StarsBuyConfirmModal from '@/components/StarsBuyConfirmModal';

interface StarPackage {
  id: string;
  stars: number;
  price?: number;
  discount?: number;
  popular?: boolean;
}

const starPackages: StarPackage[] = [
  { id: '1', stars: 50, popular: false },
  { id: '2', stars: 500, popular: true },
  { id: '3', stars: 2500, popular: false },
];

const moreStarPackages: StarPackage[] = [
  { id: '4', stars: 75, popular: false },
  { id: '5', stars: 100, popular: false },
  { id: '6', stars: 150, popular: false },
  { id: '7', stars: 250, popular: false },
  { id: '8', stars: 350, popular: false },
  { id: '9', stars: 750, popular: false },
  { id: '10', stars: 1000, popular: false },
  { id: '11', stars: 1500, popular: false },
  { id: '12', stars: 5000, popular: false },
  { id: '13', stars: 10000, popular: false },
  { id: '14', stars: 25000, popular: false },
  { id: '15', stars: 35000, popular: false },
  { id: '16', stars: 50000, popular: false },
  { id: '17', stars: 100000, popular: false },
  { id: '18', stars: 150000, popular: false },
  { id: '19', stars: 500000, popular: false },
  { id: '20', stars: 1000000, popular: false },
];

export default function StarsPage() {
  const [recipient, setRecipient] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('1');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceData, setPriceData] = useState<{
    tonPrice: number;
    tomanPrice: number;
    stars: number;
  } | null>(null);
  const [pricePerStar, setPricePerStar] = useState<{
    tonPrice: number;
    tomanPrice: number;
  } | null>(null);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const [amountError, setAmountError] = useState('');
  const [foundUser, setFoundUser] = useState<{
    name: string;
    photo: string;
    username: string;
    recipient: string;
  } | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyResult, setBuyResult] = useState<{
    success: boolean;
    data?: any;
    error?: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<{
    stars: number;
    price: number;
  } | null>(null);
  const { userInfo } = useTelegramUser();


  const formatStars = (stars: number) => {
    if (stars >= 1000000) {
      const millions = (stars / 1000000).toFixed(1).replace('.0', '');
      return `${millions} میلیون`;
    } else if (stars >= 1000) {
      const thousands = (stars / 1000).toFixed(1).replace('.0', '');
      return `${thousands} هزار`;
    }
    return stars.toString();
  };

  const allPackages = [...starPackages, ...moreStarPackages];
  const selectedPackageData = allPackages.find(pkg => pkg.id === selectedPackage);
  
  // Sort packages by stars count
  const sortedPackages = allPackages.sort((a, b) => a.stars - b.stars);
  const sortedStarPackages = starPackages.sort((a, b) => a.stars - b.stars);

  // دریافت درصد سود از تنظیمات سیستم
  useEffect(() => {
    const fetchProfitPercentage = async () => {
      try {
        const { apiGet } = await import('@/utils/api');
        const data = await apiGet<any>('/api/settings/public');
        
        if (data.success && data.data.stars_profit_percentage) {
          setProfitPercentage(parseFloat(data.data.stars_profit_percentage) || 0);
        }
      } catch (error) {
        console.error('خطا در دریافت درصد سود:', error);
      }
    };

    fetchProfitPercentage();
  }, []);

  // Calculate price per star once, then use it for all packages
  useEffect(() => {
    const calculatePricePerStar = async () => {
      try {
        const { apiPost } = await import('@/utils/api');
        
        // Get price for 50 stars as base
        const priceResult = await apiPost<any>('/api/telegram/price', { quantity: 50 });
        
        if (priceResult.success && priceResult.data) {
          const tonPrice = priceResult.data.tonPrice;
          
          // Convert TON to Toman
          const convertResult = await apiPost<any>('/api/telegram/convert-price', { tonAmount: tonPrice });
          
          if (convertResult.success && convertResult.data) {
            // Calculate price per star
            const tonPricePerStar = tonPrice / 50;
            const baseTomanPricePerStar = convertResult.data.tomanAmount / 50;
            // اضافه کردن درصد سود
            const tomanPricePerStar = baseTomanPricePerStar + (baseTomanPricePerStar * profitPercentage / 100);
            
            setPricePerStar({
              tonPrice: tonPricePerStar,
              tomanPrice: tomanPricePerStar
            });
          }
        }
      } catch (error) {
        console.error('Price per star calculation error:', error);
      }
    };
    
    calculatePricePerStar();
  }, []);

  const searchTelegramUser = async (username: string) => {
    if (!username.trim()) {
      setFoundUser(null);
      return;
    }

    setUserSearchLoading(true);
    try {
      const { apiPost } = await import('@/utils/api');
      const data = await apiPost<any>('/api/telegram/username', { username: username.trim() });
      
      if (data.success && data.data) {
        setFoundUser({
          name: data.data.name,
          photo: data.data.photo,
          username: data.data.username,
          recipient: data.data.recipient
        });
      } else {
        setFoundUser(null);
        console.error('User not found:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      setFoundUser(null);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (!value.trim()) {
      setFoundUser(null);
    }
  };

  const handleRecipientKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchTelegramUser(recipient);
    }
  };

  const calculatePrice = async (stars: number) => {
    if (!stars || stars < 50 || stars > 1000000) {
      setPriceData(null);
      return;
    }

    setPriceLoading(true);
    try {
      const { apiPost } = await import('@/utils/api');
      
      // First get the TON price for the stars
      const priceResult = await apiPost<any>('/api/telegram/price', { quantity: stars });
      
      if (priceResult.success && priceResult.data) {
        const tonPrice = priceResult.data.tonPrice;
        
        // Then convert TON to Toman
        const convertResult = await apiPost<any>('/api/telegram/convert-price', { tonAmount: tonPrice });
        
        if (convertResult.success && convertResult.data) {
          const baseTomanPrice = convertResult.data.tomanAmount;
          // اضافه کردن درصد سود
          const priceWithProfit = baseTomanPrice + (baseTomanPrice * profitPercentage / 100);
          
          setPriceData({
            tonPrice: tonPrice,
            tomanPrice: Math.round(priceWithProfit),
            stars: stars
          });
        } else {
          setPriceData(null);
          console.error('Convert error:', convertResult.error);
        }
      } else {
        setPriceData(null);
        console.error('Price error:', priceResult.error);
      }
    } catch (error) {
      console.error('Price calculation error:', error);
      setPriceData(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers - reject any non-numeric input
    if (!/^[0-9]*$/.test(value)) {
      return; // Don't update state if input contains non-numeric characters
    }
    
    setCustomAmount(value);
    
    // اگر مقدار سفارشی وارد شد، پکیج انتخاب شده را پاک کن
    if (value) {
      setSelectedPackage('');
    }
    
    // Check limits and show error
    const numValue = parseInt(value);
    if (value && (numValue < 50 || numValue > 1000000)) {
      if (numValue < 50) {
        setAmountError('حداقل تعداد استارز 50 است');
      } else if (numValue > 1000000) {
        setAmountError('حداکثر تعداد استارز 1,000,000 است');
      }
    } else {
      setAmountError('');
    }
    
    if (!value.trim()) {
      setPriceData(null);
      setAmountError('');
    }
  };

  const buyStars = async () => {
    if (!foundUser) {
      return;
    }

    // تعیین مقدار استارز بر اساس نوع انتخاب
    let starsToBuy: number;
    if (customAmount && parseInt(customAmount) > 0) {
      // اگر مقدار سفارشی وارد شده، از آن استفاده کن
      starsToBuy = parseInt(customAmount);
    } else if (selectedPackageData) {
      // اگر پکیج انتخاب شده، از آن استفاده کن
      starsToBuy = selectedPackageData.stars;
    } else {
      setAmountError('لطفاً مقدار استارز را انتخاب کنید');
      return;
    }
    
    if (!starsToBuy || starsToBuy < 50 || starsToBuy > 1000000) {
      setAmountError('تعداد استارز معتبر نیست');
      return;
    }

    // محاسبه قیمت دقیق
    let calculatedPrice = 0;
    if (priceData && priceData.stars === starsToBuy) {
      calculatedPrice = priceData.tomanPrice;
    } else {
      // محاسبه قیمت جدید
      try {
        const { apiPost } = await import('@/utils/api');
        
        const priceResult = await apiPost<any>('/api/telegram/price', { quantity: starsToBuy });
        
        if (priceResult.success && priceResult.data) {
          const tonPrice = priceResult.data.tonPrice;
          
          const convertResult = await apiPost<any>('/api/telegram/convert-price', { tonAmount: tonPrice });
          
          if (convertResult.success && convertResult.data) {
            const baseTomanPrice = convertResult.data.tomanAmount;
            // اضافه کردن درصد سود
            calculatedPrice = baseTomanPrice + (baseTomanPrice * profitPercentage / 100);
          } else {
            setAmountError('خطا در محاسبه قیمت');
            return;
          }
        } else {
          setAmountError('خطا در دریافت قیمت');
          return;
        }
      } catch (error) {
        console.error('Price calculation error:', error);
        setAmountError('خطا در محاسبه قیمت');
        return;
      }
    }

    setPendingPurchase({
      stars: starsToBuy,
      price: calculatedPrice
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
      const { apiPost } = await import('@/utils/api');
      const result = await apiPost<any>('/api/telegram/stars-buy', {
        recipient: foundUser.recipient,
        username: foundUser.username,
        name: foundUser.name,
        quantity: pendingPurchase.stars,
        userTelegramID: userInfo.id,
        price: pendingPurchase.price
      });
      
      if (result.success && result.data?.transaction?.messages?.length > 0) {
        // هدایت به صفحه موفقیت با اطلاعات تراکنش
        const message = result.data.transaction.messages[0];
        const successPageId = result.data.successPageId || '';
        const successUrl = `/stars/success?stars=${pendingPurchase.stars}&price=${pendingPurchase.price}&recipientName=${encodeURIComponent(foundUser.name)}&recipientUsername=${encodeURIComponent(foundUser.username)}&recipientPhoto=${encodeURIComponent(foundUser.photo || '')}&address=${encodeURIComponent(message.address)}&amount=${encodeURIComponent(message.amount)}&payload=${encodeURIComponent(message.payload)}&successPageId=${encodeURIComponent(successPageId)}`;
        window.location.href = successUrl;
      } else {
        // در صورت خطا، نمایش خطا در همان صفحه
        setBuyResult(result);
        setBuyLoading(false);
        setPendingPurchase(null);
      }
    } catch (error) {
      console.error('Buy stars error:', error);
      setBuyResult({
        success: false,
        error: 'خطا در خرید استارز'
      });
      setBuyLoading(false);
      setPendingPurchase(null);
    }
  };

  const cancelPurchase = () => {
    setShowConfirmModal(false);
    setPendingPurchase(null);
  };

  const handleCustomAmountKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers, backspace, delete, arrow keys, and enter
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Tab'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault(); // Prevent non-numeric input
      return;
    }
    
    if (e.key === 'Enter') {
      const stars = parseInt(customAmount) || 0;
      if (stars > 0) {
        calculatePrice(stars);
      }
    }
  };

  // Calculate package price based on price per star
  const getPackagePrice = (stars: number) => {
    if (!pricePerStar) return null;
    
    const baseTomanPrice = Math.round(pricePerStar.tomanPrice * stars);
    // اضافه کردن درصد سود
    const priceWithProfit = baseTomanPrice + (baseTomanPrice * profitPercentage / 100);
    
    return {
      tonPrice: pricePerStar.tonPrice * stars,
      tomanPrice: Math.round(priceWithProfit)
    };
  };

  const handleBuyStars = () => {
    const recipientInfo = foundUser ? {
      username: foundUser.username,
      name: foundUser.name,
      recipientId: foundUser.recipient
    } : {
      username: recipient || userInfo?.username || userInfo?.first_name,
      name: userInfo?.first_name,
      recipientId: null
    };

    if (customAmount) {
      // خرید بر اساس مقدار وارد شده
      const stars = parseInt(customAmount) || 0;
      console.log('خرید استارز:', {
        recipient: recipientInfo,
        stars: stars,
        price: stars * 0.004856 // قیمت تقریبی بر اساس نرخ تلگرام
      });
    } else if (selectedPackageData) {
      // خرید بر اساس پکیج انتخاب شده
      console.log('خرید استارز:', {
        recipient: recipientInfo,
        stars: selectedPackageData.stars,
        price: selectedPackageData.price
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                خرید استارز تلگرام
              </h1>
              <StarIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>استارز</strong> تلگرام برای ارسال <strong>هدیه</strong> و <strong>پشتیبانی</strong> از کانال‌ها و ربات‌ها
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              تمام استارزها <strong>تضمین شده</strong> و <strong>فوری</strong> هستند. پس از <strong>خرید</strong>، استارز <strong>بلافاصله</strong> واریز می‌شود.
            </p>
          </div>

          {/* Choose Recipient */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                انتخاب گیرنده
              </h3>
              <button 
                onClick={() => {
                  if (userInfo?.username) {
                    setRecipient(userInfo.username);
                    searchTelegramUser(userInfo.username);
                  } else if (userInfo?.first_name) {
                    setRecipient(userInfo.first_name);
                  }
                }}
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
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <Delete01Icon className="w-4 h-4" style={{ color: '#ffffff' }} />
                </button>
              )}
              
              {/* User Photo and Name */}
              {foundUser && !userSearchLoading && (
                <div className="absolute top-1/2 left-3 transform -translate-y-1/2 flex items-center" style={{ gap: '8px' }}>
                  <span className="text-white font-medium text-sm" style={{ lineHeight: '1' }}>
                    {foundUser.name}
                  </span>
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {foundUser.photo ? (
                      <img 
                        src={foundUser.photo} 
                        alt={foundUser.name}
                        className="w-6 h-6 rounded-full object-cover"
                        style={{ lineHeight: '1' }}
                      />
                    ) : (
                      <span className="text-white font-medium text-xs" style={{ lineHeight: '1' }}>
                        {foundUser.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Choose Quantity */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                انتخاب مقدار استارز
              </h3>
              {amountError && (
                <div className="text-red-400 text-xs">
                  {amountError}
                </div>
              )}
            </div>
            
            <div className="relative" style={{ height: '40px' }}>
              <input
                type="text"
                placeholder={priceData ? '' : "مقدار را از ۵۰ تا ۱,۰۰۰,۰۰۰ وارد کنید"}
                value={priceData ? '' : customAmount}
                onChange={(e) => !priceData && handleCustomAmountChange(e.target.value)}
                onKeyPress={handleCustomAmountKeyPress}
                disabled={priceLoading}
                readOnly={!!priceData}
                className="w-full h-full rounded-lg text-right focus:outline-none disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--field-bg-color)',
                  color: customAmount ? '#ffffff' : 'var(--text-color)',
                  border: priceData ? '1px solid var(--field-accent-color)' : '1px solid var(--border-color)',
                  paddingRight: '40px',
                  paddingLeft: priceData ? '260px' : '16px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  // Hide number input spinners
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              
              {/* Star Icon */}
              {!priceLoading && !priceData && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                </div>
              )}
              
              {/* Loading Spinner */}
              {priceLoading && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Clear Icon when price is calculated */}
              {!priceLoading && priceData && (
                <button
                  onClick={() => {
                    setPriceData(null);
                    setCustomAmount('');
                  }}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <Delete01Icon className="w-4 h-4" style={{ color: '#ffffff' }} />
                </button>
              )}
              
              {/* استارز Display (Center-Right) */}
              {priceData && !priceLoading && (
                <div className="absolute top-1/2 flex items-center gap-1" style={{ right: '50%', transform: 'translateY(-50%) translateX(50%)' }}>
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium text-sm" style={{ lineHeight: '1' }}>
                    {priceData.stars.toLocaleString('fa-IR')} استارز
                  </span>
                </div>
              )}
              
              {/* Price Display (Left side) */}
              {priceData && !priceLoading && (
                <div className="absolute top-1/2 left-3 transform -translate-y-1/2 flex items-center gap-1">
                  <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                  <span className="font-semibold text-sm text-white">
                    {Math.floor(priceData.tomanPrice).toLocaleString('en-US')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-color)' }}>
                    تومان
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Or Select Package */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white mb-1">
              یا یک پکیج انتخاب کنید
            </h3>
            
                                      <div className="space-y-1">
               {!showMoreOptions ? sortedStarPackages.map((pkg) => (
                 <div
                   key={pkg.id}
                   onClick={() => {
                     setSelectedPackage(pkg.id);
                     setCustomAmount(''); // پاک کردن مقدار سفارشی وقتی پکیج انتخاب می‌شود
                   }}
                   className="cursor-pointer py-3.5 px-3 rounded-lg transition-colors duration-200"
                   style={{ 
                     backgroundColor: 'var(--field-bg-color)',
                     border: selectedPackage === pkg.id ? '2px solid var(--field-accent-color)' : '1px solid var(--border-color)'
                   }}
                 >
                   <div className="flex items-center justify-between">
                     {/* Radio Button + Stars Info */}
                     <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          checked={selectedPackage === pkg.id}
                          onChange={() => {
                            setSelectedPackage(pkg.id);
                            setCustomAmount(''); // پاک کردن مقدار سفارشی وقتی پکیج انتخاب می‌شود
                          }}
                        />
                       
                       {/* Package Info - Right */}
                       <div className="flex items-center gap-1">
                         <StarIcon className="w-4 h-4 text-yellow-400" />
                         <span className="font-medium text-sm text-white">
                           {formatStars(pkg.stars)} استارز
                         </span>
                       </div>
                     </div>

                     {/* Price - Left */}
                     <div className="flex items-center gap-1">
                       <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                       <span className="font-semibold text-sm text-white">
                         {getPackagePrice(pkg.stars) ? Math.floor(getPackagePrice(pkg.stars)!.tomanPrice).toLocaleString('en-US') : '...'}
                       </span>
                       <span className="text-xs" style={{ color: 'var(--text-color)' }}>
                         تومان
                       </span>
                     </div>
                   </div>
                 </div>
               )) : sortedPackages.map((pkg) => (
                 <div
                   key={pkg.id}
                   onClick={() => {
                     setSelectedPackage(pkg.id);
                     setCustomAmount(''); // پاک کردن مقدار سفارشی وقتی پکیج انتخاب می‌شود
                   }}
                   className="cursor-pointer py-3.5 px-3 rounded-lg transition-colors duration-200"
                   style={{ 
                     backgroundColor: 'var(--field-bg-color)',
                     border: selectedPackage === pkg.id ? '2px solid var(--field-accent-color)' : '1px solid var(--border-color)'
                   }}
                 >
                   <div  className="flex items-center justify-between">
                     {/* Radio Button + Stars Info */}
                     <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          checked={selectedPackage === pkg.id}
                          onChange={() => {
                            setSelectedPackage(pkg.id);
                            setCustomAmount(''); // پاک کردن مقدار سفارشی وقتی پکیج انتخاب می‌شود
                          }}
                        />
                       
                       {/* Package Info - Right */}
                       <div className="flex items-center gap-1">
                         <StarIcon className="w-4 h-4 text-yellow-400" />
                         <span className="font-medium text-sm text-white">
                           {formatStars(pkg.stars)} استارز
                         </span>
                       </div>
                     </div>

                     {/* Price - Left */}
                     <div className="flex items-center gap-1">
                       <Cash01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                       <span className="font-semibold text-sm text-white">
                         {getPackagePrice(pkg.stars) ? Math.floor(getPackagePrice(pkg.stars)!.tomanPrice).toLocaleString('en-US') : '...'}
                       </span>
                       <span className="text-xs" style={{ color: 'var(--text-color)' }}>
                         تومان
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
            </div>

            {!showMoreOptions && (
              <button 
                onClick={() => setShowMoreOptions(true)}
                className="w-full mt-1 text-center py-3.5 rounded-lg transition-colors duration-200"
                style={{ 
                  color: 'var(--field-accent-color)',
                  backgroundColor: 'var(--field-bg-color)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">نمایش گزینه‌های بیشتر</span>
                  <ArrowDown01Icon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                </div>
              </button>
            )}
          </div>

          {/* Buy Button */}
          <button
            onClick={buyStars}
            className="w-full py-2 rounded-lg text-white font-semibold text-base mb-4 transition-colors duration-200"
            style={{ 
              backgroundColor: !foundUser || (!customAmount && !selectedPackageData) || buyLoading ? '#4a5568' : 'var(--btn-primary-bg-color)',
              cursor: !foundUser || (!customAmount && !selectedPackageData) || buyLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!buyLoading && foundUser && (customAmount || selectedPackageData)) {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (!buyLoading && foundUser && (customAmount || selectedPackageData)) {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
              }
            }}
            disabled={!foundUser || (!customAmount && !selectedPackageData) || buyLoading}
          >
            {buyLoading 
              ? 'در حال پردازش...'
              : !foundUser 
                ? 'ابتدا گیرنده را انتخاب کنید'
                : (!customAmount && !selectedPackageData)
                  ? 'ابتدا مقدار استارز را انتخاب کنید'
                  : customAmount 
                    ? `خرید ${formatStars(parseInt(customAmount) || 0)} استارز تلگرام`
                    : selectedPackageData && `خرید ${formatStars(selectedPackageData.stars)} استارز تلگرام`
             }
          </button>

          {/* Error Display */}
          {buyResult && !buyResult.success && (
            <div className="mb-4 p-4 rounded-lg" style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #ef4444'
            }}>
              <div>
                <h3 className="text-lg font-medium mb-2" style={{ color: '#ef4444' }}>
                  ❌ خطا در خرید
                </h3>
                <p style={{ color: '#ef4444' }}>{buyResult.error}</p>
              </div>
            </div>
          )}

          {/* Transaction History Link */}
          <button 
            onClick={() => window.location.href = '/history'}
            className="w-full text-center py-2"
            style={{ color: 'var(--field-accent-color)' }}
          >
            <span className="text-sm font-medium">مشاهده تاریخچه تراکنش‌ها</span>
          </button>

        </div>
      </div>

      {/* Stars Buy Confirm Modal */}
      {foundUser && pendingPurchase && (
        <StarsBuyConfirmModal
          isOpen={showConfirmModal}
          onClose={cancelPurchase}
          onConfirm={confirmPurchase}
          stars={pendingPurchase.stars}
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
