import { NextRequest, NextResponse } from 'next/server';
import { rampApi } from '@/lib/api/client';
import { RampApiError } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const business = await rampApi.getBusiness();
    
    return NextResponse.json({
      success: true,
      data: business.data,
    });
  } catch (error) {
    console.error('Business fetch error:', error);
    
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
