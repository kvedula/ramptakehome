import { NextRequest, NextResponse } from 'next/server';
import { rampApi } from '@/lib/api/client';
import { RampApiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Test authentication and return health check
    const healthStatus = await rampApi.healthCheck();
    
    return NextResponse.json({
      success: true,
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
    });
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof RampApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          status: error.status,
        },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = rampApi.getConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get configuration',
      },
      { status: 500 }
    );
  }
}
