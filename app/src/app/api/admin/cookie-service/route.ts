import { NextRequest, NextResponse } from 'next/server';
import { startCookieService, stopCookieService, getCookieService } from '../../../../services/startCookieService';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start':
        if (getCookieService()) {
          return NextResponse.json({
            success: false,
            message: 'Cookie service is already running'
          });
        }
        
        await startCookieService();
        return NextResponse.json({
          success: true,
          message: 'Cookie service started successfully'
        });

      case 'stop':
        if (!getCookieService()) {
          return NextResponse.json({
            success: false,
            message: 'Cookie service is not running'
          });
        }
        
        await stopCookieService();
        return NextResponse.json({
          success: true,
          message: 'Cookie service stopped successfully'
        });

      case 'status':
        const service = getCookieService();
        return NextResponse.json({
          success: true,
          running: !!service,
          message: service ? 'Cookie service is running' : 'Cookie service is not running'
        });

      case 'refresh':
        const activeService = getCookieService();
        if (!activeService) {
          return NextResponse.json({
            success: false,
            message: 'Cookie service is not running'
          });
        }
        
        // Force refresh
        await (activeService as any).refreshCookies();
        return NextResponse.json({
          success: true,
          message: 'Cookie refresh triggered successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: start, stop, status, or refresh'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [COOKIE-SERVICE-API] Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const service = getCookieService();
    return NextResponse.json({
      success: true,
      running: !!service,
      message: service ? 'Cookie service is running' : 'Cookie service is not running'
    });
  } catch (error) {
    console.error('❌ [COOKIE-SERVICE-API] Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
