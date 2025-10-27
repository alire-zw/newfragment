'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useUser } from '@/hooks/useUser';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import icons
import PercentSquareIcon from '../../../../public/icons/percent-square-stroke-rounded';
import CheckmarkIcon from '../../../../public/icons/checkmark-icon';

interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function SystemSettingsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user: dbUser, loading: userLoading } = useUser();
  const { userInfo, loading: telegramLoading, error } = useTelegramUser();
  const router = useRouter();
  
  // State management
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', hiding: false });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { apiGet } = await import('@/utils/api');
        const data = await apiGet<any>('/api/admin/settings');
        
        if (data.success) {
          setSettings(data.data);
        } else {
          showNotification('خطا در دریافت تنظیمات', 'error');
        }
      } catch (error) {
        console.error('خطا در دریافت تنظیمات:', error);
        showNotification('خطا در دریافت تنظیمات', 'error');
      } finally {
        setSettingsLoading(false);
      }
    };

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

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

  // به‌روزرسانی تنظیمات
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      const { apiPut } = await import('@/utils/api');
      const data = await apiPut<any>('/api/admin/settings', {
        settings: settings.map(setting => ({
          setting_key: setting.setting_key,
          setting_value: setting.setting_value
        }))
      });
      
      if (data.success) {
        showNotification('تنظیمات با موفقیت ذخیره شد', 'success');
      } else {
        showNotification('خطا در ذخیره تنظیمات', 'error');
      }
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات:', error);
      showNotification('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setSaving(false);
    }
  };

  // تغییر تنظیمات
  const handleSettingChange = (key: string, value: string) => {
    setSettings(settings.map(setting =>
      setting.setting_key === key
        ? { ...setting, setting_value: value }
        : setting
    ));
  };

  if (adminLoading || userLoading || telegramLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
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
                تنظیمات سیستم
              </h1>
            </div>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>مدیریت</strong> و <strong>کنترل</strong> درصد سود محصولات مختلف
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              برای <strong>تنظیم</strong>، <strong>تغییر</strong> و <strong>ذخیره</strong> درصد سود از اینجا استفاده کنید
            </p>
          </div>

          {/* Settings Container */}
          <div className="rounded-lg" style={{ 
            backgroundColor: '#293440',
            border: '1px solid var(--border-color)'
          }}>
            
            {/* Settings Header */}
            <div 
              className="grid px-3 py-1 rounded-t-lg"
              style={{ 
                backgroundColor: '#293440',
                border: '1px solid var(--border-color)',
                gridTemplateColumns: '2fr 1fr',
                gap: '8px'
              }}
            >
              <div className="text-right">
                <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                  محصول
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs font-bold" style={{ color: '#8c9aa9', fontFamily: 'IRANYekan, system-ui, sans-serif', fontWeight: 700 }}>
                  درصد سود
                </span>
              </div>
            </div>

            {/* Settings List */}
            <div className="space-y-0">
              {/* Virtual Number Profit */}
              <div 
                className="grid py-0.5 px-3"
                style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px'
                }}
              >
                <div className="flex items-center gap-2 text-right">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                    <PercentSquareIcon width={16} height={16} style={{ color: "#4db2ff" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate">
                      شماره مجازی
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                      درصد سود شماره‌های مجازی
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.find(s => s.setting_key === 'virtual_number_profit_percentage')?.setting_value || '0'}
                    onChange={(e) => handleSettingChange('virtual_number_profit_percentage', e.target.value)}
                    className="w-16 px-2 py-1 rounded text-sm text-white text-center"
                    style={{ 
                      backgroundColor: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  />
                  <span className="text-sm text-white font-medium">%</span>
                </div>
              </div>

              {/* Stars Profit */}
              <div 
                className="grid py-0.5 px-3"
                style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px'
                }}
              >
                <div className="flex items-center gap-2 text-right">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                    <PercentSquareIcon width={16} height={16} style={{ color: "#ffc107" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate">
                      استارز تلگرام
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                      درصد سود استارز
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.find(s => s.setting_key === 'stars_profit_percentage')?.setting_value || '0'}
                    onChange={(e) => handleSettingChange('stars_profit_percentage', e.target.value)}
                    className="w-16 px-2 py-1 rounded text-sm text-white text-center"
                    style={{ 
                      backgroundColor: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  />
                  <span className="text-sm text-white font-medium">%</span>
                </div>
              </div>

              {/* Premium 3 Month Profit */}
              <div 
                className="grid py-0.5 px-3"
                style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px'
                }}
              >
                <div className="flex items-center gap-2 text-right">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                    <PercentSquareIcon width={16} height={16} style={{ color: "#22c55e" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate">
                      پریمیوم 3 ماهه
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                      درصد سود پریمیوم 3 ماهه
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.find(s => s.setting_key === 'premium_3_month_profit_percentage')?.setting_value || '0'}
                    onChange={(e) => handleSettingChange('premium_3_month_profit_percentage', e.target.value)}
                    className="w-16 px-2 py-1 rounded text-sm text-white text-center"
                    style={{ 
                      backgroundColor: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  />
                  <span className="text-sm text-white font-medium">%</span>
                </div>
              </div>

              {/* Premium 6 Month Profit */}
              <div 
                className="grid py-0.5 px-3"
                style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px'
                }}
              >
                <div className="flex items-center gap-2 text-right">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                    <PercentSquareIcon width={16} height={16} style={{ color: "#8b5cf6" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate">
                      پریمیوم 6 ماهه
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                      درصد سود پریمیوم 6 ماهه
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.find(s => s.setting_key === 'premium_6_month_profit_percentage')?.setting_value || '0'}
                    onChange={(e) => handleSettingChange('premium_6_month_profit_percentage', e.target.value)}
                    className="w-16 px-2 py-1 rounded text-sm text-white text-center"
                    style={{ 
                      backgroundColor: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  />
                  <span className="text-sm text-white font-medium">%</span>
                </div>
              </div>

              {/* Premium 12 Month Profit */}
              <div 
                className="grid py-0.5 px-3 rounded-b-lg"
                style={{ 
                  backgroundColor: '#212a33',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px'
                }}
              >
                <div className="flex items-center gap-2 text-right">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2026' }}>
                    <PercentSquareIcon width={16} height={16} style={{ color: "#f59e0b" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate">
                      پریمیوم 12 ماهه
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-color)' }}>
                      درصد سود پریمیوم 12 ماهه
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.find(s => s.setting_key === 'premium_12_month_profit_percentage')?.setting_value || '0'}
                    onChange={(e) => handleSettingChange('premium_12_month_profit_percentage', e.target.value)}
                    className="w-16 px-2 py-1 rounded text-sm text-white text-center"
                    style={{ 
                      backgroundColor: 'var(--bg-color)', 
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  />
                  <span className="text-sm text-white font-medium">%</span>
                </div>
              </div>
            </div>
          </div>

           {/* Save Button */}
           <div className="mt-4">
             <button
               onClick={handleSaveSettings}
               disabled={saving}
               className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               style={{ 
                 backgroundColor: 'var(--btn-primary-bg-color)'
               }}
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
               {saving ? (
                 <div className="flex items-center justify-center gap-2">
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   <span>در حال ذخیره...</span>
                 </div>
               ) : (
                 <span>ذخیره تنظیمات</span>
               )}
             </button>
           </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
            notification.hiding ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
          }`}
          style={{ 
            backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444'
          }}
        >
          <div className="flex items-center gap-2">
            <CheckmarkIcon size={16} color="white" />
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}