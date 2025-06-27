import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Transaction, 
  TransactionFilters, 
  User, 
  Card, 
  Business, 
  Category,
  DashboardStats,
  RampApiResponse,
  RampApiSingleResponse 
} from '@/types';

// API endpoints
const API_BASE = '/api';

// Query keys
export const queryKeys = {
  transactions: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  cards: ['cards'] as const,
  card: (id: string) => ['cards', id] as const,
  business: ['business'] as const,
  categories: ['categories'] as const,
  dashboardStats: ['dashboard', 'stats'] as const,
  auth: ['auth'] as const,
};

// Helper function to build query string
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
}

// API fetch wrapper
async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: response.statusText 
    }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// ==================
// TRANSACTION HOOKS
// ==================

/**
 * Hook to fetch paginated transactions with filters
 */
export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.transactions, filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const endpoint = `${API_BASE}/transactions${queryString ? `?${queryString}` : ''}`;
      const response = await apiFetch<{
        success: true;
        data: Transaction[];
        page?: { next?: string; prev?: string };
        filters: TransactionFilters;
      }>(endpoint);
      
      return {
        data: response.data,
        page: response.page,
        filters: response.filters,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch infinite scrolling transactions
 */
export function useInfiniteTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.transactions, 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const queryString = buildQueryString({ ...filters, start: pageParam });
      const endpoint = `${API_BASE}/transactions${queryString ? `?${queryString}` : ''}`;
      const response = await apiFetch<{
        success: true;
        data: Transaction[];
        page?: { next?: string; prev?: string };
      }>(endpoint);
      
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.page?.next,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: async () => {
      const response = await apiFetch<{
        success: true;
        data: Transaction;
      }>(`${API_BASE}/transactions/${id}`);
      
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// ==================
// DASHBOARD HOOKS
// ==================

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.dashboardStats, filters],
    queryFn: async (): Promise<DashboardStats> => {
      // This would typically be a separate endpoint, but for now we'll
      // compute stats from transactions data
      const queryString = buildQueryString({ ...filters, limit: 1000 });
      const endpoint = `${API_BASE}/transactions${queryString ? `?${queryString}` : ''}`;
      const response = await apiFetch<{
        success: true;
        data: Transaction[];
      }>(endpoint);
      
      const transactions = response.data;
      
      // Calculate dashboard stats
      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const pendingTransactions = transactions.filter(t => t.state === 'PENDING').length;
      
      // Calculate this month's spending
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthTransactions = transactions.filter(t => 
        new Date(t.user_transaction_time) >= startOfMonth
      );
      const thisMonthSpending = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const averageTransactionAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
      
      // Calculate top categories
      const categoryMap = new Map<string, { amount: number; count: number }>();
      transactions.forEach(t => {
        const category = t.sk_category_name || 'Uncategorized';
        const current = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
          amount: current.amount + t.amount,
          count: current.count + 1,
        });
      });
      
      const topCategories = Array.from(categoryMap.entries())
        .map(([category, { amount, count }]) => ({
          category,
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          transactionCount: count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      // Calculate top merchants
      const merchantMap = new Map<string, { amount: number; count: number }>();
      transactions.forEach(t => {
        const merchant = t.merchant_name || 'Unknown';
        const current = merchantMap.get(merchant) || { amount: 0, count: 0 };
        merchantMap.set(merchant, {
          amount: current.amount + t.amount,
          count: current.count + 1,
        });
      });
      
      const topMerchants = Array.from(merchantMap.entries())
        .map(([merchant, { amount, count }]) => ({
          merchant,
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          transactionCount: count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      // Calculate spending trend (last 30 days)
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentTransactions = transactions.filter(t => 
        new Date(t.user_transaction_time) >= last30Days
      );
      
      const spendingTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        const dayTransactions = recentTransactions.filter(t => {
          const transactionDate = new Date(t.user_transaction_time);
          return transactionDate.toDateString() === date.toDateString();
        });
        
        return {
          date: date.toISOString().split('T')[0],
          amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactionCount: dayTransactions.length,
        };
      });
      
      return {
        totalTransactions,
        totalAmount,
        pendingTransactions,
        thisMonthSpending,
        averageTransactionAmount,
        topCategories,
        topMerchants,
        spendingTrend,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// ==================
// AUTH HOOKS
// ==================

/**
 * Hook to test API authentication
 */
export function useAuthStatus() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      const response = await apiFetch<{ success: true; status: 'ok' | 'error'; timestamp: string }>(`${API_BASE}/auth/token`);
      
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      return failureCount < 2 && !error.message.includes('401');
    },
  });
}

/**
 * Hook to fetch business information
 */
export function useBusiness() {
  return useQuery({
    queryKey: queryKeys.business,
    queryFn: async (): Promise<Business | null> => {
      try {
        const response = await apiFetch<{ success: true; data: Business }>(`${API_BASE}/business`);
        
        return response.data || null;
      } catch (error) {
        console.warn('Business data fetch failed:', error);
        // Return null instead of undefined to satisfy React Query
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: (failureCount, error) => {
      // Don't retry if we're just showing "Ramp Admin" anyway
      return false;
    },
  });
}

/**
 * Mutation to test authentication
 */
export function useTestAuth() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: response.statusText 
        }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Authentication test failed');
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate auth queries on successful test
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
}

// ==================
// UTILITY HOOKS
// ==================

/**
 * Hook to prefetch transaction data
 */
export function usePrefetchTransaction() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.transaction(id),
      queryFn: async () => {
        const response = await apiFetch<{
          success: true;
          data: Transaction;
        }>(`${API_BASE}/transactions/${id}`);
        
        return response.data;
      },
      staleTime: 1000 * 60 * 10,
    });
  };
}

/**
 * Hook to invalidate transaction queries
 */
export function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
  };
}
