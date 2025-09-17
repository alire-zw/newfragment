import Image from 'next/image';
import Link from 'next/link';

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-5 md:space-y-6">
          {/* شماره مجازی - بالا */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-40 md:h-48" style={{ backgroundColor: 'var(--field-bg-color)' }}>
            <div className="p-3.5 md:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-2 md:mb-3">
                  <Image 
                    src="/icons/00-ezgif.com-gif-maker-1.webp"
                    alt="شماره مجازی"
                    width={48}
                    height={48}
                    className="w-8 h-8 md:w-12 md:h-12 ml-2"
                    loading="lazy"
                  />
                  <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--field-color)' }}>
                    شماره مجازی
                  </h3>
                </div>
                <p className="text-sm md:text-sm leading-snug md:leading-normal" style={{ color: 'var(--field-second-color)' }}>
                  دریافت شماره مجازی برای استفاده در شبکه‌های اجتماعی
                </p>
              </div>
              <div className="flex justify-center mt-2.5 md:mt-4">
                <Link href="/shop/virtual-number" className="w-full">
                  <button 
                    className="px-3.5 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-sm font-medium transition-colors duration-200 w-full"
                    style={{ 
                      backgroundColor: 'var(--btn-primary-bg-color)',
                      color: 'var(--btn-primary-color)'
                    }}
                  >
                    خرید شماره
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* استارز و پریمیوم - پایین در یک ردیف */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {/* استارز */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-40 md:h-48" style={{ backgroundColor: 'var(--field-bg-color)' }}>
              <div className="p-3.5 md:p-6 h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <div className="flex items-center mb-2 md:mb-3">
                    <Image 
                      src="/icons/00-ezgif.com-gif-maker-2.webp"
                      alt="استارز"
                      width={48}
                      height={48}
                      className="w-8 h-8 md:w-12 md:h-12 ml-2"
                      loading="lazy"
                    />
                    <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--field-color)' }}>
                      استارز
                    </h3>
                  </div>
                  <p 
                    className="text-sm md:text-sm leading-snug md:leading-normal"
                    style={{ 
                      color: 'var(--field-second-color)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    خرید استارز برای ارتقای سطح، افزایش امتیاز و بازکردن قابلیت‌های ویژه
                  </p>
                </div>
                <div className="flex justify-center mt-2.5 md:mt-4 shrink-0">
                  <button 
                    className="px-3.5 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-sm font-medium transition-colors duration-200 w-full"
                    style={{ 
                      backgroundColor: 'var(--btn-primary-bg-color)',
                      color: 'var(--btn-primary-color)'
                    }}
                  >
                    خرید استارز
                  </button>
                </div>
              </div>
            </div>

            {/* پریمیوم */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-40 md:h-48" style={{ backgroundColor: 'var(--field-bg-color)' }}>
              <div className="p-3.5 md:p-6 h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <div className="flex items-center mb-2 md:mb-3">
                    <Image 
                      src="/icons/00-ezgif.com-gif-maker-3.webp"
                      alt="پریمیوم"
                      width={48}
                      height={48}
                      className="w-8 h-8 md:w-12 md:h-12 ml-2"
                      loading="lazy"
                    />
                    <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--field-color)' }}>
                      پریمیوم
                    </h3>
                  </div>
                  <p 
                    className="text-sm md:text-sm leading-snug md:leading-normal"
                    style={{ 
                      color: 'var(--field-second-color)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    اشتراک پریمیوم با دسترسی کامل، ابزارهای پیشرفته و پشتیبانی اولویت‌دار
                  </p>
                </div>
                <div className="flex justify-center mt-2.5 md:mt-4 shrink-0">
                  <button 
                    className="px-3.5 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-sm font-medium transition-colors duration-200 w-full"
                    style={{ 
                      backgroundColor: 'var(--btn-primary-bg-color)',
                      color: 'var(--btn-primary-color)'
                    }}
                  >
                    خرید پریمیوم
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* تبلیغات تلگرام - بزودی */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-40 md:h-48 relative" style={{ backgroundColor: 'var(--field-bg-color)' }}>
            <div className="p-3.5 md:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-2 md:mb-3">
                  <Image 
                    src="/icons/00-ezgif.com-gif-maker-4.webp"
                    alt="تبلیغات تلگرام"
                    width={48}
                    height={48}
                    className="w-8 h-8 md:w-12 md:h-12 ml-2"
                    loading="lazy"
                  />
                  <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--field-color)' }}>
                    تبلیغات تلگرام
                  </h3>
                </div>
                <p className="text-sm md:text-sm leading-snug md:leading-normal" style={{ color: 'var(--field-second-color)' }}>
                  ثبت تبلیغات کانال یا ربات به‌زودی فعال می‌شود
                </p>
              </div>
              <div className="flex justify-center mt-2.5 md:mt-4">
                <button 
                  disabled
                  className="px-3.5 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-sm font-medium transition-colors duration-200 w-full sm:w-auto opacity-50 cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'var(--btn-primary-bg-color)',
                    color: 'var(--btn-primary-color)'
                  }}
                >
                  بزودی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
