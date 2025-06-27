'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TransactionFilters, Transaction } from '@/types';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface PaginatedTransactionsResult extends PaginationState {
  data: { data: Transaction[] } | null;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
  isCountingTotal: boolean;
}

interface TransactionChunk {
  transactions: Transaction[];
  startCursor?: string;
  nextCursor?: string;
  totalInChunk: number;
}

export function usePaginatedTransactions(
  initialFilters: TransactionFilters = {}
): PaginatedTransactionsResult {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chunks, setChunks] = useState<Map<number, TransactionChunk>>(new Map());
  const [totalEstimate, setTotalEstimate] = useState<number | null>(null);
  const [isCountingTotal, setIsCountingTotal] = useState(false);
  
  const pageSize = initialFilters.limit || 20;
  const chunkSize = 100; // Load 100 transactions per chunk
  
  // Check if we're in search mode
  const isSearchMode = !!initialFilters.merchant_name;
  
  // Calculate which chunk the current page belongs to (only for non-search mode)
  const currentChunkIndex = isSearchMode ? 0 : Math.floor((currentPage - 1) * pageSize / chunkSize);
  const pageWithinChunk = isSearchMode ? currentPage : currentPage - (currentChunkIndex * Math.floor(chunkSize / pageSize));
  
  // Get current chunk data
  const currentChunk = chunks.get(currentChunkIndex);
  
  // Calculate current page data from chunk
  const getCurrentPageData = useCallback(() => {
    if (!currentChunk) return null;
    
    if (isSearchMode) {
      // For search, just return the data as-is (API already handles pagination)
      return { data: currentChunk.transactions };
    } else {
      // For normal browsing, slice the chunk data
      const startIndex = (pageWithinChunk - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageTransactions = currentChunk.transactions.slice(startIndex, endIndex);
      
      return { data: pageTransactions };
    }
  }, [currentChunk, pageWithinChunk, pageSize, isSearchMode]);

  // Fetch a chunk of transactions
  const fetchChunk = useCallback(async (chunkIndex: number, startCursor?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Add base filters
      Object.entries(initialFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'limit' && key !== 'start') {
          params.append(key, value.toString());
        }
      });
      
      if (startCursor) {
        params.append('start', startCursor);
      }
      params.append('limit', chunkSize.toString());

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }

      const newChunk: TransactionChunk = {
        transactions: result.data || [],
        startCursor,
        nextCursor: result.page?.next ? new URL(result.page.next).searchParams.get('start') || undefined : undefined,
        totalInChunk: result.data?.length || 0,
      };

      setChunks(prev => {
        const newChunks = new Map(prev);
        newChunks.set(chunkIndex, newChunk);
        return newChunks;
      });
      
      // Update total estimate
      if (newChunk.totalInChunk < chunkSize && !newChunk.nextCursor) {
        // This is the last chunk, we can calculate exact total
        const exactTotal = chunkIndex * chunkSize + newChunk.totalInChunk;
        setTotalEstimate(exactTotal);
      } else if (totalEstimate === null) {
        // Estimate based on current chunk
        const minTotal = (chunkIndex + 1) * chunkSize + (newChunk.nextCursor ? 1 : 0);
        setTotalEstimate(minTotal);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [initialFilters, chunkSize, totalEstimate]);

  // Load chunk if needed
  useEffect(() => {
    if (!chunks.has(currentChunkIndex)) {
      // Need to load this chunk
      let startCursor: string | undefined;
      
      // If this isn't the first chunk, we need to find the start cursor
      if (currentChunkIndex > 0) {
        const previousChunk = chunks.get(currentChunkIndex - 1);
        if (previousChunk?.nextCursor) {
          startCursor = previousChunk.nextCursor;
        } else {
          // Previous chunk doesn't exist or doesn't have next cursor
          // We need to load chunks sequentially
          for (let i = 0; i < currentChunkIndex; i++) {
            if (!chunks.has(i)) {
              // Load missing chunk first
              return;
            }
          }
          const lastChunk = chunks.get(currentChunkIndex - 1);
          startCursor = lastChunk?.nextCursor;
        }
      }
      
      fetchChunk(currentChunkIndex, startCursor);
    }
  }, [currentChunkIndex, chunks, fetchChunk]);

  // Background count total transactions (for display purposes)
  const fetchTotalCount = useCallback(async () => {
    if (isCountingTotal) return;
    
    setIsCountingTotal(true);
    try {
      let totalCount = 0;
      let nextCursor: string | undefined = undefined;
      let attempts = 0;
      const maxAttempts = 20;

      // Create a filters object without pagination for counting
      const countFilters = { ...initialFilters };
      delete countFilters.start;
      delete countFilters.limit;

      do {
        const params = new URLSearchParams();
        Object.entries(countFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        if (nextCursor) {
          params.append('start', nextCursor);
        }
        params.append('limit', '100');

        const response = await fetch(`/api/transactions?${params.toString()}`);
        const result = await response.json();

        if (!result.success) break;

        totalCount += result.data?.length || 0;
        const hasMore = result.page?.next;
        
        if (hasMore) {
          const nextUrl = new URL(result.page.next);
          nextCursor = nextUrl.searchParams.get('start') || undefined;
        } else {
          nextCursor = undefined;
        }

        attempts++;
      } while (nextCursor && attempts < maxAttempts);

      setTotalEstimate(totalCount);
      
    } catch (error) {
      console.error('Error counting total transactions:', error);
    } finally {
      setIsCountingTotal(false);
    }
  }, [initialFilters, isCountingTotal]);

  // Reset everything when filters change
  useEffect(() => {
    setChunks(new Map());
    setCurrentPage(1);
    setTotalEstimate(null);
    setIsCountingTotal(false);
    setError(null);
  }, [JSON.stringify(initialFilters)]);

  // Start background total count on mount
  useEffect(() => {
    if (totalEstimate === null && !isCountingTotal && chunks.size > 0) {
      fetchTotalCount();
    }
  }, [fetchTotalCount, totalEstimate, isCountingTotal, chunks.size]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  }, []);

  const nextPage = useCallback(() => {
    const maxPages = totalEstimate ? Math.ceil(totalEstimate / pageSize) : currentPage + 1;
    if (currentPage < maxPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalEstimate, pageSize]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const refresh = useCallback(() => {
    setChunks(new Map());
    setCurrentPage(1);
    setTotalEstimate(null);
    setIsCountingTotal(false);
    setError(null);
  }, []);

  // Get current page data
  const data = getCurrentPageData();
  
  // Calculate total pages
  const totalPages = totalEstimate ? Math.ceil(totalEstimate / pageSize) : 
    Math.max(currentPage, 1);

  // Determine if there are more pages
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    data,
    currentPage,
    totalPages,
    totalItems: totalEstimate || 0,
    pageSize,
    hasNext,
    hasPrev,
    isLoading,
    error,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    isCountingTotal,
  };
}
