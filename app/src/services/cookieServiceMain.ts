import { runMigrations } from '../database/runMigrations';
import { startCookieService } from './startCookieService';

async function main() {
  try {
    console.log('🚀 [COOKIE-SERVICE-MAIN] Starting cookie service application...');
    
    // اجرای migrations
    console.log('📊 [COOKIE-SERVICE-MAIN] Running database migrations...');
    await runMigrations();
    
    // شروع سرویس کوکی
    console.log('🍪 [COOKIE-SERVICE-MAIN] Starting cookie refresh service...');
    await startCookieService();
    
    console.log('✅ [COOKIE-SERVICE-MAIN] Cookie service application started successfully');
    console.log('⏰ [COOKIE-SERVICE-MAIN] Service will refresh cookies every 5 minutes');
    console.log('🛑 [COOKIE-SERVICE-MAIN] Press Ctrl+C to stop the service');
    
  } catch (error) {
    console.error('💥 [COOKIE-SERVICE-MAIN] Failed to start application:', error);
    process.exit(1);
  }
}

// اجرای main function
main();
