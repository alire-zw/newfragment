'use client';

import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-jalaali';
import CreditCardPosIcon from '../../../../public/icons/credit-card-pos-stroke-rounded';
import Delete01Icon from '../../../../public/icons/delete-01-stroke-rounded';
import CheckmarkIcon from '@/components/icons/CheckmarkIcon';

interface BankAccount {
  accountID: string;
  cardNumber: string;
  birthDate: string;
  bankName: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  isDefault: boolean;
  createdAt: string;
}

export default function BankAccountsPage() {
  const { userInfo, loading } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();
  
  // State management
  const [cardNumber, setCardNumber] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', hiding: false });
  const [errors, setErrors] = useState({ cardNumber: '', birthDate: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // تبدیل تاریخ شمسی به میلادی
  const convertJalaliToGregorian = (year: string, month: string, day: string) => {
    if (!year || !month || !day) return null;
    
    const jalaliDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
    if (!jalaliDate.isValid()) return null;
    
    return jalaliDate.format('YYYY-MM-DD');
  };

  const fetchBankAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const { apiPost } = await import('@/utils/api');
      const data = await apiPost<any>('/api/bank-accounts/get', {
        telegramId: userInfo?.id
      });
      
      if (data.success) {
        setBankAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('خطا در بارگذاری حساب‌های بانکی:', error);
    } finally {
      setLoadingAccounts(false);
    }
  }, [userInfo?.id]);

  // بارگذاری حساب‌های بانکی و تاریخ تولد
  useEffect(() => {
    if (!userLoading && dbUser) {
      fetchBankAccounts();
      
      // اگر تاریخ تولد در دیتابیس موجود است، فیلدها را پر کن
      if (dbUser.userBirthDate) {
        console.log('تاریخ از دیتابیس:', dbUser.userBirthDate);
        
        // تاریخ به فرمت 1380-11-03T20:34:16.000Z ذخیره شده
        let birthDateString = dbUser.userBirthDate;
        if (birthDateString.includes('T')) {
          // حذف قسمت زمان و Z
          birthDateString = birthDateString.split('T')[0];
        }
        
        const birthDateParts = birthDateString.split('-');
        console.log('تقسیم شده:', birthDateParts);
        
        if (birthDateParts.length === 3) {
          // اضافه کردن یک روز برای جبران timezone
          const day = parseInt(birthDateParts[2]) + 1;
          const paddedDay = day.toString().padStart(2, '0');
          
          setBirthYear(birthDateParts[0]);
          setBirthMonth(birthDateParts[1]);
          setBirthDay(paddedDay);
          console.log('تنظیم شده:', {
            year: birthDateParts[0],
            month: birthDateParts[1],
            day: paddedDay
          });
        }
      }
    }
  }, [userLoading, dbUser, fetchBankAccounts]);

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

  // اعتبارسنجی شماره کارت
  const validateCardNumber = (): boolean => {
    return /^\d{16}$/.test(cardNumber);
  };

  // اعتبارسنجی تاریخ تولد شمسی
  const validateBirthDate = (): boolean => {
    if (!birthYear || !birthMonth || !birthDay) return false;
    
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    
    // اعتبارسنجی محدوده‌های شمسی
    if (year < 1300 || year > 1410) return false; // محدوده سال شمسی
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // تبدیل به میلادی و اعتبارسنجی سن
    const gregorianDate = convertJalaliToGregorian(birthYear, birthMonth, birthDay);
    if (!gregorianDate) return false;
    
    const today = new Date();
    const birth = new Date(gregorianDate);
    const age = today.getFullYear() - birth.getFullYear();
    
    return age >= 18 && age <= 100;
  };

  // اعتبارسنجی فرم
  const validateForm = (): boolean => {
    const newErrors = { cardNumber: '', birthDate: '' };
    let isValid = true;

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'شماره کارت الزامی است';
      isValid = false;
    } else if (!validateCardNumber()) {
      newErrors.cardNumber = 'شماره کارت باید ۱۶ رقم باشد';
      isValid = false;
    }

    if (!birthYear.trim() || !birthMonth.trim() || !birthDay.trim()) {
      newErrors.birthDate = 'تاریخ تولد الزامی است';
      isValid = false;
    } else if (!validateBirthDate()) {
      newErrors.birthDate = 'تاریخ تولد نامعتبر است (حداقل ۱۸ سال)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  // ارسال فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { apiPost } = await import('@/utils/api');
      const data = await apiPost<any>('/api/bank-accounts/add', {
        cardNumber: cardNumber,
        birthDate: convertJalaliToGregorian(birthYear, birthMonth, birthDay), // برای اعتبارسنجی سن
        jalaliDate: `${birthYear}/${birthMonth}/${birthDay}`, // تاریخ شمسی برای ذخیره
        telegramId: userInfo?.id
      });
      
      console.log('پاسخ API:', data);
      
      if (data.success) {
        setShowSuccessModal(true);
        setCardNumber('');
        setBirthYear('');
        setBirthMonth('');
        setBirthDay('');
        setErrors({ cardNumber: '', birthDate: '' });
        setShowAddForm(false);
        fetchBankAccounts(); // بروزرسانی لیست
      } else {
        // نمایش مودال خطا برای خطاهای مهم
        if (data.message && (
          data.message.includes('تطبیق') || 
          data.message.includes('کارت') || 
          data.message.includes('کد ملی') ||
          data.message.includes('وجود ندارد') ||
          data.message.includes('معتبر نیست')
        )) {
          setErrorMessage(data.message);
          setShowErrorModal(true);
        } else {
          showNotification(data.message || 'خطا در ثبت حساب بانکی', 'error');
        }
      }
    } catch (error) {
      console.error('خطا در ثبت حساب بانکی:', error);
      showNotification('خطا در ثبت حساب بانکی', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // ماندن در همان صفحه حساب‌های بانکی
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };


  // نمایش مودال حذف
  const handleDeleteClick = (accountId: string) => {
    setAccountToDelete(accountId);
    setShowDeleteModal(true);
  };

  // بستن مودال حذف
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  // حذف حساب بانکی
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const { apiDelete } = await import('@/utils/api');
      const data = await apiDelete<any>(`/api/bank-accounts/delete?accountId=${accountToDelete}&telegramId=${userInfo?.id}`);
      
      if (data.success) {
        showNotification('حساب بانکی با موفقیت حذف شد', 'success');
        fetchBankAccounts(); // بروزرسانی لیست
        handleDeleteModalClose();
      } else {
        showNotification(data.message || 'خطا در حذف حساب بانکی', 'error');
      }
    } catch (error) {
      console.error('خطا در حذف حساب بانکی:', error);
      showNotification('خطا در حذف حساب بانکی', 'error');
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="mr-2" style={{ color: 'var(--text-color)' }}>در حال بارگذاری...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              حساب‌های بانکی
            </h1>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>مدیریت کارت‌های بانکی</strong> برای <strong>پرداخت</strong> آسان و <strong>امن</strong>
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              <strong>حتماً کارت و تاریخ تولد را صحیح وارد کنید</strong> برای اینکه کارت‌ها <strong>استعلام می‌شوند</strong> و فقط با این کارت‌ها می‌توانید <strong>پرداخت</strong> کنید
            </p>
          </div>

          {/* Add Card Button */}
          <div className="mb-6 flex justify-start">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
              style={{ 
                backgroundColor: 'var(--btn-primary-bg-color)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
              }}
            >
              <div className="flex items-center gap-2">
                <CreditCardPosIcon className="h-4 w-4 text-white" />
                <span>{showAddForm ? 'انصراف' : 'افزودن کارت'}</span>
              </div>
            </button>
          </div>

          {/* Add Card Form */}
          {showAddForm && (
            <div className="mb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">
                      شماره کارت
                    </h3>
                    {errors.cardNumber && (
                      <div className="text-red-400 text-xs">
                        {errors.cardNumber}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative" style={{ height: '36px' }}>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(value);
                      }}
                      maxLength={31}
                      className="w-full h-full rounded-lg text-right focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--field-bg-color)',
                        color: cardNumber ? '#ffffff' : 'var(--text-color)',
                        border: errors.cardNumber ? '1px solid #ef4444' : '1px solid var(--border-color)',
                        paddingRight: '40px',
                        paddingLeft: '16px',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}
                    />
                    
                    {/* Credit Card Icon */}
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                      <CreditCardPosIcon className="h-4 w-4" style={{ color: 'var(--field-accent-color)' }} />
                    </div>
                  </div>
                </div>

                {/* Birth Date Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">
                      تاریخ تولد (شمسی)
                      {dbUser?.userBirthDate && (
                        <span className="text-xs mr-1" style={{ color: 'var(--text-secondary-color)' }}>
                          - از قبل ذخیره شده
                        </span>
                      )}
                    </h3>
                    {errors.birthDate && (
                      <div className="text-red-400 text-xs">
                        {errors.birthDate}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative" style={{ height: '36px' }}>
                      <input
                        type="number"
                        placeholder="روز"
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value.slice(0, 2))}
                        min="1"
                        max="31"
                        disabled={!!dbUser?.userBirthDate}
                        className="w-full h-full rounded-lg text-center focus:outline-none"
                        style={{ 
                          backgroundColor: 'var(--field-bg-color)',
                          color: birthDay ? '#ffffff' : 'var(--text-color)',
                          border: errors.birthDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          paddingRight: '12px',
                          paddingLeft: '12px',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      />
                    </div>
                    <div className="relative" style={{ height: '36px' }}>
                      <input
                        type="number"
                        placeholder="ماه"
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value.slice(0, 2))}
                        min="1"
                        max="12"
                        disabled={!!dbUser?.userBirthDate}
                        className="w-full h-full rounded-lg text-center focus:outline-none"
                        style={{ 
                          backgroundColor: 'var(--field-bg-color)',
                          color: birthMonth ? '#ffffff' : 'var(--text-color)',
                          border: errors.birthDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          paddingRight: '12px',
                          paddingLeft: '12px',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      />
                    </div>
                    <div className="relative" style={{ height: '36px' }}>
                      <input
                        type="number"
                        placeholder="سال"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value.slice(0, 4))}
                        min="1300"
                        max="1410"
                        disabled={!!dbUser?.userBirthDate}
                        className="w-full h-full rounded-lg text-center focus:outline-none"
                        style={{ 
                          backgroundColor: 'var(--field-bg-color)',
                          color: birthYear ? '#ffffff' : 'var(--text-color)',
                          border: errors.birthDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          paddingRight: '12px',
                          paddingLeft: '12px',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      />
                    </div>
                  </div>
                  
                  {dbUser?.userBirthDate && (
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary-color)' }}>
                      تاریخ تولد از کارت قبلی ذخیره شده و قابل تغییر نیست
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'var(--btn-primary-bg-color)',
                    color: 'white'
                  }}
                  disabled={isSubmitting}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال ثبت...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCardPosIcon className="h-4 w-4 text-white" />
                      <span>ثبت حساب بانکی</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Bank Accounts List */}
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="mr-2" style={{ color: 'var(--text-color)' }}>در حال بارگذاری...</span>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardPosIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary-color)' }} />
              <p className="text-white font-medium mb-2">شما حساب بانکی ندارید</p>
              <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                برای افزودن کارت بانکی، دکمه بالا را فشار دهید
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map((account) => (
                <div 
                  key={account.accountID} 
                  className="relative group rounded-lg overflow-hidden transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--field-bg-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {/* Card Background Gradient */}
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                      background: 'linear-gradient(135deg, var(--field-accent-color) 0%, #3b82f6 100%)'
                    }}
                  />
                  
                  {/* Card Content */}
                  <div className="relative p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: 'var(--field-accent-color)' }}
                        >
                          <CreditCardPosIcon className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {account.bankName || 'کارت اعتباری'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className={`px-2 py-1 rounded-md flex items-center justify-center text-xs font-medium ${
                            account.accountStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                            account.accountStatus === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {account.accountStatus === 'active' ? 'فعال' : 
                           account.accountStatus === 'inactive' ? 'غیرفعال' : 'معلق'}
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteClick(account.accountID)}
                          className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                          style={{ 
                            backgroundColor: '#ef4444'
                          }}
                        >
                          <Delete01Icon className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Card Number */}
                    <div className="mb-2">
                      <div className="text-base font-mono text-white tracking-wider">
                        {account.cardNumber.substring(0, 4)} {account.cardNumber.substring(4, 6)}** **** {account.cardNumber.substring(12, 16)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="rounded-lg w-full max-w-md overflow-hidden" style={{ 
            backgroundColor: 'var(--field-bg-color)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e'
              }}>
                <CheckmarkIcon color="currentColor" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">حساب بانکی ثبت شد</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-color)' }}>
                حساب بانکی شما با موفقیت ثبت شد و در لیست حساب‌ها نمایش داده می‌شود.
              </p>
              <button 
                className="w-full py-3 rounded-lg font-semibold transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--btn-primary-bg-color)',
                  color: 'white'
                }}
                onClick={handleSuccessModalClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
                }}
              >
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="rounded-lg w-full max-w-md overflow-hidden" style={{ 
            backgroundColor: 'var(--field-bg-color)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444'
              }}>
                <Delete01Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">حذف حساب بانکی</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-color)' }}>
                آیا مطمئن هستید که می‌خواهید این حساب بانکی را حذف کنید؟ این عمل قابل بازگشت نیست.
              </p>
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-3 rounded-lg font-semibold transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'var(--field-bg-color)',
                    color: 'white',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={handleDeleteModalClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--field-bg-color)';
                  }}
                >
                  انصراف
                </button>
                <button 
                  className="flex-1 py-3 rounded-lg font-semibold transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                  onClick={handleDeleteAccount}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="rounded-lg w-full max-w-md overflow-hidden" style={{ 
            backgroundColor: 'var(--field-bg-color)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444'
              }}>
                <Delete01Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">خطا در ثبت کارت</h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-color)' }}>
                {errorMessage}
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-secondary-color)' }}>
                لطفاً اطلاعات را با دقت بررسی کرده و دوباره تلاش کنید.
              </p>
              <button 
                className="w-full py-3 rounded-lg font-semibold transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--btn-primary-bg-color)',
                  color: 'white'
                }}
                onClick={handleErrorModalClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-color)';
                }}
              >
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 left-4 z-50 p-4 rounded-lg transition-all duration-300 ${
          notification.hiding ? 'opacity-0 transform translate-y-[-100%]' : 'opacity-100 transform translate-y-0'
        }`} style={{
          backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${notification.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
          color: notification.type === 'error' ? '#ef4444' : '#22c55e'
        }}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}></div>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
