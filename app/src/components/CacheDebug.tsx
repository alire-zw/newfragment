'use client';

import { useState } from 'react';

interface CacheInfo {
  key: string;
  exists: boolean;
  age: number;
  ttl: number;
}

export default function CacheDebug() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/clear?key=prices_1');
      const data = await response.json();
      
      if (data.success) {
        setCacheInfo(data.data);
        setMessage('');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('خطا در دریافت اطلاعات کش');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/clear?key=prices_1', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message);
      setCacheInfo(null);
    } catch (error) {
      setMessage('خطا در پاک کردن کش');
    } finally {
      setLoading(false);
    }
  };

  const clearAllCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message);
      setCacheInfo(null);
    } catch (error) {
      setMessage('خطا در پاک کردن کش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg" style={{ 
      backgroundColor: 'var(--field-bg-color)',
      border: '1px solid var(--border-color)'
    }}>
      <h3 className="text-lg font-semibold text-white mb-4">مدیریت کش</h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={checkCache}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--field-accent-color)',
              border: '1px solid var(--field-accent-color)'
            }}
          >
            {loading ? '...' : 'بررسی کش'}
          </button>
          
          <button
            onClick={clearCache}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: '#f59e0b',
              border: '1px solid #f59e0b'
            }}
          >
            پاک کردن کش قیمت‌ها
          </button>
          
          <button
            onClick={clearAllCache}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: '#ef4444',
              border: '1px solid #ef4444'
            }}
          >
            پاک کردن تمام کش
          </button>
        </div>

        {cacheInfo && (
          <div className="p-3 rounded-lg" style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.15)'
          }}>
            <h4 className="text-sm font-medium text-white mb-2">اطلاعات کش:</h4>
            <div className="text-xs space-y-1" style={{ color: '#22c55e' }}>
              <div>کلید: {cacheInfo.key}</div>
              <div>موجود: {cacheInfo.exists ? 'بله' : 'خیر'}</div>
              <div>سن: {cacheInfo.age} ثانیه</div>
              <div>TTL: {cacheInfo.ttl} ثانیه</div>
              <div>انقضا: {cacheInfo.exists ? (cacheInfo.ttl - cacheInfo.age > 0 ? `${cacheInfo.ttl - cacheInfo.age} ثانیه` : 'منقضی شده') : 'نامشخص'}</div>
            </div>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-lg" style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}>
            <p className="text-sm" style={{ color: '#3b82f6' }}>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
