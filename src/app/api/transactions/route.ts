import { NextRequest, NextResponse } from 'next/server';
import { rampApi } from '@/lib/api/client';
import { RampApiError, TransactionFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters into filters
    const filters: TransactionFilters = {};
    
    if (searchParams.get('from_date')) {
      filters.from_date = searchParams.get('from_date')!;
    }
    
    if (searchParams.get('to_date')) {
      filters.to_date = searchParams.get('to_date')!;
    }
    
    if (searchParams.get('merchant_name')) {
      filters.merchant_name = searchParams.get('merchant_name')!;
    }
    
    if (searchParams.get('sk_category_name')) {
      filters.sk_category_name = searchParams.get('sk_category_name')!;
    }
    
    if (searchParams.get('state')) {
      filters.state = searchParams.get('state') as any;
    }
    
    if (searchParams.get('card_id')) {
      filters.card_id = searchParams.get('card_id')!;
    }
    
    if (searchParams.get('user_id')) {
      filters.user_id = searchParams.get('user_id')!;
    }
    
    if (searchParams.get('amount_greater_than')) {
      filters.amount_greater_than = Number(searchParams.get('amount_greater_than'));
    }
    
    if (searchParams.get('amount_less_than')) {
      filters.amount_less_than = Number(searchParams.get('amount_less_than'));
    }
    
    if (searchParams.get('has_receipts')) {
      filters.has_receipts = searchParams.get('has_receipts') === 'true';
    }
    
    if (searchParams.get('start')) {
      filters.start = searchParams.get('start')!;
    }
    
    if (searchParams.get('limit')) {
      filters.limit = Number(searchParams.get('limit'));
    }
    
    // Check if there's a search term
    const searchTerm = searchParams.get('merchant_name');
    
    // For merchant searches, we need to handle this differently
    // The Ramp API doesn't support partial merchant name searches,
    // so we'll use a hybrid approach
    
    let response;
    let filteredData;
    
    if (searchTerm) {
      // For searches, we fetch more data and filter client-side
      // This ensures we find matching transactions across pages
      const searchFilters = { ...filters };
      delete searchFilters.merchant_name;
      
      // Increase limit for search to get more results to filter from
      const originalLimit = searchFilters.limit || 20;
      searchFilters.limit = Math.max(originalLimit, 100); // Get at least 100 for better search results
      
      response = await rampApi.getTransactions(searchFilters);
      
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = response.data.filter(transaction => {
        const merchantName = transaction.merchant_name?.toLowerCase() || '';
        const merchantDescriptor = transaction.merchant_descriptor?.toLowerCase() || '';
        
        // Check for exact matches first, then partial matches
        return (
          merchantName === searchLower ||
          merchantDescriptor === searchLower ||
          merchantName.includes(searchLower) ||
          merchantDescriptor.includes(searchLower)
        );
      });
      
      // Sort filtered results by relevance (exact matches first)
      filteredData.sort((a, b) => {
        const aName = a.merchant_name?.toLowerCase() || '';
        const bName = b.merchant_name?.toLowerCase() || '';
        const aDesc = a.merchant_descriptor?.toLowerCase() || '';
        const bDesc = b.merchant_descriptor?.toLowerCase() || '';
        
        // Exact name matches get highest priority
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;
        
        // Exact descriptor matches get second priority
        if (aDesc === searchLower && bDesc !== searchLower) return -1;
        if (bDesc === searchLower && aDesc !== searchLower) return 1;
        
        // Name starts with search term gets third priority
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
        
        // Sort by most recent date for remaining matches
        return new Date(b.user_transaction_time).getTime() - new Date(a.user_transaction_time).getTime();
      });
      
      // For search results, we need to limit to the requested page size
      const pageSize = originalLimit;
      const startIndex = 0; // Since we're filtering, start from beginning
      filteredData = filteredData.slice(startIndex, startIndex + pageSize);
      
    } else {
      // No search term, use normal API filtering
      response = await rampApi.getTransactions(filters);
      filteredData = response.data;
    }
    
    // Calculate pagination info
    const limit = filters.limit || 20;
    const hasMore = response.page?.next;
    const currentPage = filters.start ? 'unknown' : 1; // We can't determine exact page without more API info
    
    return NextResponse.json({
      success: true,
      data: filteredData,
      page: response.page,
      filters: filters,
      searchApplied: !!searchTerm,
      originalCount: response.data.length,
      filteredCount: filteredData.length,
      pagination: {
        currentPage,
        pageSize: limit,
        totalItems: searchTerm ? filteredData.length : 'unknown', // API doesn't provide total count
        hasMore,
      },
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    
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
        error: 'Failed to fetch transactions',
      },
      { status: 500 }
    );
  }
}
