import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // بهینه‌سازی تصاویر
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // بهینه‌سازی کامپایلر
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // بهینه‌سازی bundle
  // حذف experimental.optimizeCss برای جلوگیری از نیاز به critters
  // و حذف swcMinify که در این نسخه پشتیبانی نمی‌شود
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
