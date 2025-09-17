// بهینه‌سازی‌های اعمال شده برای بهبود سرعت:

// 1. Lazy Loading برای تصاویر
// - تمام آیکون‌های فروشگاه با loading="lazy"
// - تصویر پروفایل در Header با loading="lazy"

// 2. Prefetch برای Navigation
// - Link های MobileNavbar با prefetch={true}
// - کامپوننت NavLink بهینه شده

// 3. Memoization
// - MobileNavbar با React.memo
// - کامپوننت NavLink با React.memo

// 4. Next.js Config بهینه‌سازی
// - تصاویر WebP و AVIF
// - حذف console در production
// - بهینه‌سازی CSS و Package Imports
// - SWC Minification

// 5. حذف console.log های اضافی
// - حذف تمام console.log از MobileNavbar

// 6. بهینه‌سازی Bundle
// - استفاده از Next.js Image component
// - بهینه‌سازی فونت‌ها

// برای بهبود بیشتر:
// 1. استفاده از Suspense برای lazy loading کامپوننت‌ها
// 2. بهینه‌سازی فونت‌ها با next/font
// 3. استفاده از Service Worker برای caching
// 4. بهینه‌سازی API calls
// 5. استفاده از React Query برای state management
