'use client';

import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './VerifyPage.module.css';

// Import icons
import ArrowIcon from '@/components/icons/ArrowIcon';
import VerifyIcon from '@/components/icons/VerifyIcon';

export default function VerifyPage() {
  const { userInfo, loading, error } = useTelegramUser();
  const { user: dbUser, loading: userLoading } = useUser();
  const router = useRouter();
  
  // State management
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', hiding: false });
  const [errors, setErrors] = useState({ nationalId: '', phoneNumber: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // اعتبارسنجی کد ملی
  const validateNationalId = (id: string): boolean => {
    if (!/^\d{10}$/.test(id)) return false;
    
    const digits = id.split('').map(Number);
    const checkDigit = digits[9];
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
  };

  // اعتبارسنجی شماره موبایل
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(cleanPhone);
  };

  // اعتبارسنجی فرم
  const validateForm = (): boolean => {
    const newErrors = { nationalId: '', phoneNumber: '' };
    let isValid = true;

    if (!nationalId.trim()) {
      newErrors.nationalId = 'کد ملی الزامی است';
      isValid = false;
    } else if (!validateNationalId(nationalId)) {
      newErrors.nationalId = 'کد ملی نامعتبر است';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'شماره موبایل الزامی است';
      isValid = false;
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'شماره موبایل نامعتبر است';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ارسال فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('لطفاً اطلاعات را صحیح وارد کنید', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nationalId: nationalId.trim(),
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          telegramId: userInfo?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.verified) {
          setShowSuccessModal(true);
        } else {
          showNotification(data.message || 'درخواست احراز هویت با موفقیت ارسال شد', 'success');
        }
      } else {
        showNotification(data.message || 'خطا در ارسال درخواست', 'error');
      }
    } catch (error) {
      console.error('❌ خطا در ارسال درخواست احراز هویت:', error);
      showNotification('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // بازگشت به پروفایل
  const goBack = () => {
    router.push('/profile');
  };

  // بستن مودال موفقیت و انتقال به پروفایل
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/profile');
  };

  // ریدایرکت اگر کاربر احراز شده باشد
  useEffect(() => {
    if (!userLoading && dbUser && dbUser.isVerified) {
      router.push('/profile');
    }
  }, [dbUser, userLoading, router]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if ((window as unknown as { notificationTimer?: NodeJS.Timeout }).notificationTimer) {
        clearTimeout((window as unknown as { notificationTimer: NodeJS.Timeout }).notificationTimer);
      }
    };
  }, []);

  // تنظیم padding بر اساس نوع دستگاه
  const containerStyle = {
    paddingBottom: '80px'
  };

  if (loading || userLoading) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className="h-6 w-32 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className={styles.formBox}>
            <div className="space-y-4">
              <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-600 rounded animate-pulse"></div>
              <div className="h-4 w-28 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-600 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // اگر کاربر احراز شده باشد، loading نمایش داده شود
  if (dbUser && dbUser.isVerified) {
    return (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.content}>
          <div className="text-center py-12">
            <div className="bg-green-900 border border-green-600 rounded-lg p-6 mx-4">
              <h2 className="text-xl font-semibold mb-2 text-green-200">
                در حال انتقال...
              </h2>
              <p className="text-sm text-green-100">
                شما قبلاً احراز هویت شده‌اید
              </p>
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
              خطا در بارگذاری
            </h2>
            <p className="text-sm text-red-100">
              {error}
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
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={goBack}>
            <ArrowIcon color="var(--field-color)" />
          </button>
          <h1 className={styles.title}>احراز هویت</h1>
          <div className={styles.flexSpacer}></div>
        </div>


        {/* Form */}
        <div className={styles.formBox}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* National ID Field */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                کد ملی <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setNationalId(value);
                    if (errors.nationalId) {
                      setErrors(prev => ({ ...prev, nationalId: '' }));
                    }
                  }
                }}
                placeholder="کد ملی ۱۰ رقمی خود را وارد کنید"
                className={`${styles.fieldInput} ${errors.nationalId ? styles.fieldInputError : ''}`}
                maxLength={10}
                dir="ltr"
              />
              {errors.nationalId && (
                <span className={styles.fieldError}>{errors.nationalId}</span>
              )}
            </div>

            {/* Phone Number Field */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                شماره موبایل <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setPhoneNumber(value);
                    if (errors.phoneNumber) {
                      setErrors(prev => ({ ...prev, phoneNumber: '' }));
                    }
                  }
                }}
                placeholder="شماره موبایل ۱۱ رقمی خود را وارد کنید"
                className={`${styles.fieldInput} ${errors.phoneNumber ? styles.fieldInputError : ''}`}
                maxLength={11}
                dir="ltr"
              />
              {errors.phoneNumber && (
                <span className={styles.fieldError}>{errors.phoneNumber}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${styles.submitButton} ${isSubmitting ? styles.submitButtonDisabled : ''}`}
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال درخواست احراز هویت'}
            </button>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className={styles.privacyBox}>
          <p className={styles.privacyText}>
            اطلاعات شما با امنیت کامل ذخیره می‌شود و تنها برای احراز هویت استفاده می‌شود
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <VerifyIcon color="var(--accent-color)" />
            </div>
            <h3 className={styles.modalTitle}>احراز هویت موفق</h3>
            <p className={styles.modalMessage}>
              احراز هویت شما با موفقیت انجام شد. حالا می‌توانید از تمامی خدمات استفاده کنید.
            </p>
            <button 
              className={styles.modalButton}
              onClick={handleSuccessModalClose}
            >
              تایید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
