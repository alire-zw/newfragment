import type { Metadata } from "next";
import "./globals.css";
import "../styles/fonts.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "فرانوم بات",
  description: "یک اپلیکیشن Next.js با پشتیبانی از فارسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Telegram WebApp Script - باید اول لود شود */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        
        <script src="/disable-zoom.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handler for Telegram WebApp
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('TelegramGameProxy')) {
                  e.preventDefault();
                  console.warn('Telegram WebApp not available in this environment');
                  return false;
                }
              });
              
              // Prevent TelegramGameProxy errors
              if (typeof window !== 'undefined') {
                window.TelegramGameProxy = window.TelegramGameProxy || {
                  receiveEvent: function() {
                    console.warn('TelegramGameProxy not available');
                    return false;
                  }
                };
              }

              // تنظیم viewport به صورت دستی (backup)
              function setViewport() {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover');
                }
              }
              
              // اجرای فوری
              setViewport();
              
              // اجرای مجدد بعد از load
              window.addEventListener('load', setViewport);
              
              // اجرای مجدد در resize
              window.addEventListener('resize', setViewport);
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Header />
        <main className="pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
