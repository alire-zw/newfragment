'use client';

import { useState } from 'react';
import TransactionConfirmModal from '@/components/TransactionConfirmModal';

interface StarsBuyRequest {
  recipient: string;
  username: string;
  name: string;
  quantity: number;
}

interface StarsBuyResponse {
  success: boolean;
  data?: {
    transaction: {
      validUntil: number;
      messages: Array<{
        address: string;
        amount: string;
        payload: string;
      }>;
    };
  };
  error?: string;
}

interface TransactionData {
  address: string;
  amount: string;
  payload: string;
}

export default function StarsBuyTestPage() {
  const [formData, setFormData] = useState<StarsBuyRequest>({
    recipient: '',
    username: '',
    name: '',
    quantity: 50
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StarsBuyResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [recipientData, setRecipientData] = useState<{
    name: string;
    username: string;
    photo?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram/stars-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);
      
      // اگر درخواست موفق بود، مودال تایید تراکنش را نمایش بده
      if (data.success && data.data?.transaction?.messages?.length > 0) {
        const message = data.data.transaction.messages[0];
        setTransactionData({
          address: message.address,
          amount: message.amount,
          payload: message.payload
        });
        setRecipientData({
          name: formData.name,
          username: formData.username,
          photo: ''
        });
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: 'خطا در ارسال درخواست'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('fa-IR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            تست خرید استارز
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شناسه گیرنده (Recipient)
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pJ74RbGXMwEZo7tSTfMJ7YhI4b8MO_vgVb-JwFSEcFQ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری (Username)
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="y_num"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام (Name)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعداد استارز (Quantity)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="50"
                max="1000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال پردازش...' : 'خرید استارز'}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 rounded-md">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-3">
                    ✅ خرید موفق
                  </h3>
                  {result.data?.transaction && (
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-green-700">اعتبار تا:</span>
                        <span className="mr-2 text-green-600">
                          {formatDate(result.data.transaction.validUntil)}
                        </span>
                      </div>
                      
                      {result.data.transaction.messages.map((message, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="mb-2">
                            <span className="font-medium text-gray-700">آدرس:</span>
                            <span className="mr-2 text-gray-600 font-mono text-sm">
                              {message.address}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium text-gray-700">مبلغ:</span>
                            <span className="mr-2 text-gray-600">
                              {parseInt(message.amount) / 1000000000} TON
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Payload:</span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                              {message.payload}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    ❌ خطا در خرید
                  </h3>
                  <p className="text-red-600">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Confirm Modal */}
      {showConfirmModal && transactionData && recipientData && (
        <TransactionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            setResult({
              success: true,
              data: {
                transaction: {
                  validUntil: Math.floor(Date.now() / 1000) + 3600,
                  messages: [transactionData]
                }
              }
            });
          }}
          transaction={transactionData}
          recipient={recipientData}
          stars={formData.quantity}
          price={parseInt(transactionData.amount) / 1e9 * 312689} // تقریبی
        />
      )}
    </div>
  );
}
