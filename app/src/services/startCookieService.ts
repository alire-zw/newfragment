import CookieRefreshService from './CookieRefreshService';

let cookieService: CookieRefreshService | null = null;

export const startCookieService = async () => {
  if (cookieService) {
    console.log('🔄 [COOKIE-SERVICE] Service already running');
    return cookieService;
  }

  console.log('🚀 [COOKIE-SERVICE] Starting cookie refresh service...');
  
  try {
    cookieService = new CookieRefreshService();
    await cookieService.start();
    
    console.log('✅ [COOKIE-SERVICE] Cookie service started successfully');
    return cookieService;
  } catch (error) {
    console.error('❌ [COOKIE-SERVICE] Failed to start cookie service:', error);
    throw error;
  }
};

export const stopCookieService = async () => {
  if (cookieService) {
    await cookieService.stop();
    cookieService = null;
    console.log('🛑 [COOKIE-SERVICE] Cookie service stopped');
  }
};

export const getCookieService = () => {
  return cookieService;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 [COOKIE-SERVICE] Received SIGINT, stopping service...');
  await stopCookieService();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 [COOKIE-SERVICE] Received SIGTERM, stopping service...');
  await stopCookieService();
  process.exit(0);
});
