import { NextRequest, NextResponse } from 'next/server';
import { rampApi } from '@/lib/api/client';
import { RampApiError } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction ID is required',
        },
        { status: 400 }
      );
    }
    
    const response = await rampApi.getTransaction(id);
    
    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Transaction API error:', error);
    
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
        error: 'Failed to fetch transaction',
      },
      { status: 500 }
    );
  }
}
