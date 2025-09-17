'use client';

import { useState } from 'react';

interface TelegramUserData {
  recipient: string;
  name: string;
  photo: string;
  username: string;
  hasPhoto: boolean;
}

export default function TelegramTestPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: TelegramUserData;
    error?: string;
  } | null>(null);

  const testUsername = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();
      setResult(data);
      } catch {
      setResult({
        success: false,
        error: 'خطا در ارسال درخواست'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      testUsername();
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          تست API تشخیص یوزرنیم تلگرام
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            نام کاربری تلگرام:
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="مثال: alire_zw یا @alire_zw"
              className="flex-1 px-4 py-3 rounded-lg text-white focus:outline-none"
              style={{ 
                backgroundColor: 'var(--field-bg-color)',
                border: '1px solid var(--border-color)'
              }}
            />
            <button
              onClick={testUsername}
              disabled={loading || !username.trim()}
              className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--btn-primary-bg-color)' }}
            >
              {loading ? 'بررسی...' : 'تست'}
            </button>
          </div>
        </div>

        {result && (
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--field-bg-color)' }}>
            {result.success ? (
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-4">✅ موفق!</h2>
                {result.data && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      {result.data.hasPhoto && result.data.photo && (
                        <img 
                          src={result.data.photo} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {result.data.name}
                        </h3>
                        <p className="text-gray-400">@{result.data.username}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                      <h4 className="font-medium text-white mb-2">اطلاعات تکنیکی:</h4>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><span className="font-medium">Recipient ID:</span> {result.data.recipient}</p>
                        <p><span className="font-medium">Has Photo:</span> {result.data.hasPhoto ? 'بله' : 'خیر'}</p>
                        {result.data.photo && (
                          <p><span className="font-medium">Photo URL:</span> 
                            <a href={result.data.photo} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-2">
                              مشاهده
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-2">❌ خطا</h2>
                <p className="text-white">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <h3 className="font-medium text-white mb-2">راهنما:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>نام کاربری باید بین ۵ تا ۳۲ کاراکتر باشد</li>
            <li>فقط حروف انگلیسی، اعداد و _ مجاز است</li>
            <li>می‌توانید با @ شروع کنید یا بدون آن</li>
            <li>مثال‌های معتبر: alire_zw, telegram, durov</li>
          </ul>
        </div>

        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--field-bg-color)' }}>
          <h3 className="font-medium text-white mb-2">نمونه‌های تست:</h3>
          <div className="flex gap-2 flex-wrap">
            {['alire_zw', 'telegram', 'durov', 'fragment'].map((testUser) => (
              <button
                key={testUser}
                onClick={() => setUsername(testUser)}
                className="px-3 py-1 text-sm rounded text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                style={{ border: '1px solid var(--field-accent-color)' }}
              >
                @{testUser}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
