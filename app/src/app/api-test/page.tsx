'use client';

import { useState } from 'react';
import CacheDebug from '@/components/CacheDebug';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    duration: number;
    cached: boolean;
    success: boolean;
    error?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const runCacheTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    const results: Array<{
      test: string;
      duration: number;
      cached: boolean;
      success: boolean;
      error?: string;
    }> = [];
    
    // تست 1: اولین درخواست (Cache Miss)
    console.log('🧪 Test 1: First request (Cache Miss)');
    const start1 = Date.now();
    const response1 = await fetch('/api/prices/1?token=221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1');
    const data1 = await response1.json();
    const time1 = Date.now() - start1;
    
    results.push({
      test: 'اولین درخواست',
      duration: time1,
      cached: data1.cached || false,
      success: data1.success || false,
      error: data1.success ? undefined : data1.message
    });

    // تست 2: درخواست دوم (Cache Hit)
    console.log('🧪 Test 2: Second request (Cache Hit)');
    const start2 = Date.now();
    const response2 = await fetch('/api/prices/1?token=221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1');
    const data2 = await response2.json();
    const time2 = Date.now() - start2;
    
    results.push({
      test: 'درخواست دوم',
      duration: time2,
      cached: data2.cached || false,
      success: data2.success || false,
      error: data2.success ? undefined : data2.message
    });

    // تست 3: درخواست سوم (Cache Hit)
    console.log('🧪 Test 3: Third request (Cache Hit)');
    const start3 = Date.now();
    const response3 = await fetch('/api/prices/1?token=221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1');
    const data3 = await response3.json();
    const time3 = Date.now() - start3;
    
    results.push({
      test: 'درخواست سوم',
      duration: time3,
      cached: data3.cached || false,
      success: data3.success || false,
      error: data3.success ? undefined : data3.message
    });

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">
              تست سیستم کش
            </h1>
            <p className="text-xs mb-0" style={{ color: '#8794a1' }}>
              <strong>بررسی</strong> عملکرد <strong>سیستم کش</strong> برای API قیمت‌ها
            </p>
            <p className="text-xs" style={{ color: '#8794a1' }}>
              این تست <strong>سه درخواست</strong> متوالی ارسال می‌کند و <strong>زمان پاسخ</strong> را اندازه‌گیری می‌کند
            </p>
          </div>

          {/* Test Button */}
          <div className="text-center mb-6">
            <button
              onClick={runCacheTest}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--field-accent-color)',
                border: '1px solid var(--field-accent-color)'
              }}
            >
              {loading ? 'در حال تست...' : 'شروع تست کش'}
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">نتایج تست:</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg"
                    style={{ 
                      backgroundColor: result.cached ? 'rgba(34, 197, 94, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                      border: `1px solid ${result.cached ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)'}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{result.test}</h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: result.cached ? '#22c55e' : '#3b82f6',
                            color: 'white'
                          }}
                        >
                          {result.cached ? 'کش' : 'API'}
                        </span>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: result.success ? '#22c55e' : '#ef4444',
                            color: 'white'
                          }}
                        >
                          {result.success ? 'موفق' : 'ناموفق'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm" style={{ color: result.cached ? '#22c55e' : '#3b82f6' }}>
                      <div>زمان پاسخ: <strong>{result.duration}ms</strong></div>
                      {result.error && <div>خطا: {result.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Analysis */}
          {testResults.length >= 2 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">تحلیل عملکرد:</h2>
              <div className="p-4 rounded-lg" style={{ 
                backgroundColor: 'var(--field-bg-color)',
                border: '1px solid var(--border-color)'
              }}>
                <div className="text-sm text-white space-y-2">
                  <div>
                    <strong>اولین درخواست:</strong> {testResults[0].duration}ms (از API خارجی)
                  </div>
                  <div>
                    <strong>درخواست‌های بعدی:</strong> {testResults[1].duration}ms (از کش)
                  </div>
                  <div className="text-green-400">
                    <strong>بهبود سرعت:</strong> {testResults[0].duration}ms → {testResults[1].duration}ms
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Debug Component */}
          <CacheDebug />

        </div>
      </div>
    </div>
  );
}