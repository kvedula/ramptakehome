import { NextRequest, NextResponse } from 'next/server';
import { aiCategorization } from '@/lib/ai/categorization';
import { Transaction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction, transactions } = body;

    // Validate request
    if (!transaction && !transactions) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either transaction or transactions array is required',
        },
        { status: 400 }
      );
    }

    // Single transaction categorization
    if (transaction) {
      try {
        const result = await aiCategorization.categorizeTransaction(transaction);
        
        return NextResponse.json({
          success: true,
          result,
          transaction: {
            id: transaction.id,
            merchant: transaction.merchant_name,
          },
        });
      } catch (error: any) {
        console.error('Single transaction categorization error:', error);
        
        return NextResponse.json({
          success: false,
          error: error.message || 'Categorization failed',
          fallback: {
            category: 'Other',
            confidence: 0.1,
            reasoning: 'Categorization service unavailable',
            method: 'fallback',
          },
        });
      }
    }

    // Batch transaction categorization
    if (transactions && Array.isArray(transactions)) {
      if (transactions.length === 0) {
        return NextResponse.json({
          success: true,
          results: {},
          summary: {
            total: 0,
            successful: 0,
            failed: 0,
            byMethod: {},
            byCategory: {},
          },
        });
      }

      if (transactions.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Maximum batch size is 100 transactions',
          },
          { status: 400 }
        );
      }

      try {
        const results = await aiCategorization.categorizeTransactionsBatch(transactions);
        
        // Convert Map to object for JSON serialization
        const resultsObject: Record<string, any> = {};
        results.forEach((result, transactionId) => {
          resultsObject[transactionId] = result;
        });

        // Calculate summary
        const summary = {
          total: transactions.length,
          successful: 0,
          failed: 0,
          byMethod: {} as Record<string, number>,
          byCategory: {} as Record<string, number>,
        };

        results.forEach((result) => {
          if (result.confidence > 0.1) {
            summary.successful++;
          } else {
            summary.failed++;
          }

          summary.byMethod[result.method] = (summary.byMethod[result.method] || 0) + 1;
          summary.byCategory[result.category] = (summary.byCategory[result.category] || 0) + 1;
        });

        return NextResponse.json({
          success: true,
          results: resultsObject,
          summary,
        });
      } catch (error: any) {
        console.error('Batch categorization error:', error);
        
        return NextResponse.json({
          success: false,
          error: error.message || 'Batch categorization failed',
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request format',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('API categorization error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = aiCategorization.getStatus();
    
    return NextResponse.json({
      success: true,
      status,
      categories: {
        'Office Supplies': 'Office supplies and stationery',
        'Software & SaaS': 'Software licenses and SaaS subscriptions',
        'Meals & Entertainment': 'Business meals and entertainment',
        'Travel & Transportation': 'Business travel and transportation',
        'Marketing & Advertising': 'Marketing and advertising expenses',
        'Professional Services': 'Professional and consulting services',
        'Equipment & Hardware': 'Computer equipment and hardware',
        'Utilities & Internet': 'Utilities and communication services',
        'Insurance': 'Business insurance premiums',
        'Training & Education': 'Employee training and education',
        'Other': 'Other business expenses',
      },
    });
  } catch (error) {
    console.error('API status error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
