'use client';

import { useState } from 'react';

export default function PriceTestPage() {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: {
      tonPrice: number;
      usdPrice: number;
    };
    error?: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleTestPrice = async () => {
    if (!quantity) {
      setError('لطفاً مقدار استارز را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/telegram/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: parseInt(quantity) })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'خطا در دریافت قیمت');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Price test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          تست API قیمت استارز
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              مقدار استارز:
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="مثال: 67767"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <button
            onClick={handleTestPrice}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'در حال محاسبه...' : 'محاسبه قیمت'}
          </button>

          {error && (
            <div className="bg-red-900 border border-red-700 p-3 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-900 border border-green-700 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-green-300">نتیجه:</h3>
              <p><strong>مقدار استارز:</strong> {result.data?.tonPrice ? '50' : 'نامشخص'}</p>
              {result.data?.tonPrice && (
                <p><strong>قیمت TON:</strong> {result.data.tonPrice}</p>
              )}
              {result.data?.usdPrice && (
                <p><strong>قیمت دلار:</strong> ${result.data.usdPrice?.toLocaleString()}</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-green-400">جزئیات پاسخ</summary>
                <pre className="text-xs bg-gray-800 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/stars" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            بازگشت به صفحه استارز
          </a>
        </div>
      </div>
    </div>
  );
}
