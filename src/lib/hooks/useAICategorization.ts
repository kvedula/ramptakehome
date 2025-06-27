import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Transaction } from '@/types';
import { 
  aiCategorization, 
  CategorizationResult, 
  ExpenseCategory,
  EXPENSE_CATEGORIES 
} from '@/lib/ai/categorization';

interface BatchCategorizationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentTransaction?: string;
}

interface BatchCategorizationResult {
  results: Map<string, CategorizationResult>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    byMethod: Record<string, number>;
    byCategory: Record<ExpenseCategory, number>;
  };
}

/**
 * Hook for categorizing a single transaction
 */
export function useTransactionCategorization() {
  return useMutation({
    mutationFn: async (transaction: Transaction): Promise<CategorizationResult> => {
      return aiCategorization.categorizeTransaction(transaction);
    },
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error?.message?.includes('Rate limit') || error?.message?.includes('API key')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for batch categorization with progress tracking
 */
export function useBatchCategorization() {
  const [progress, setProgress] = useState<BatchCategorizationProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const categorizeTransactions = useCallback(async (
    transactions: Transaction[]
  ): Promise<BatchCategorizationResult> => {
    setIsRunning(true);
    setProgress({
      completed: 0,
      total: transactions.length,
      percentage: 0,
    });

    try {
      const results = await aiCategorization.categorizeTransactionsBatch(
        transactions,
        (completed, total) => {
          const currentTransaction = transactions[completed - 1]?.merchant_name;
          setProgress({
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
            currentTransaction,
          });
        }
      );

      // Calculate summary statistics
      const summary = {
        total: transactions.length,
        successful: 0,
        failed: 0,
        byMethod: {} as Record<string, number>,
        byCategory: {} as Record<ExpenseCategory, number>,
      };

      results.forEach((result) => {
        if (result.confidence > 0.1) {
          summary.successful++;
        } else {
          summary.failed++;
        }

        // Count by method
        summary.byMethod[result.method] = (summary.byMethod[result.method] || 0) + 1;

        // Count by category
        summary.byCategory[result.category] = (summary.byCategory[result.category] || 0) + 1;
      });

      setIsRunning(false);
      setProgress(null);

      return { results, summary };
    } catch (error) {
      setIsRunning(false);
      setProgress(null);
      throw error;
    }
  }, []);

  const mutation = useMutation({
    mutationFn: categorizeTransactions,
  });

  return {
    categorizeTransactions: mutation.mutateAsync,
    isLoading: mutation.isPending || isRunning,
    error: mutation.error,
    progress,
    reset: () => {
      mutation.reset();
      setProgress(null);
      setIsRunning(false);
    },
  };
}

/**
 * Hook to get AI categorization service status
 */
export function useCategorizationStatus() {
  return useQuery({
    queryKey: ['categorization-status'],
    queryFn: () => aiCategorization.getStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
}

/**
 * Hook for category suggestions based on transaction data
 */
export function useCategorySuggestions(transaction: Transaction | null) {
  return useQuery({
    queryKey: ['category-suggestions', transaction?.id],
    queryFn: async () => {
      if (!transaction) return null;
      
      // Get categorization result
      const result = await aiCategorization.categorizeTransaction(transaction);
      
      // Generate alternative suggestions based on confidence
      const suggestions: Array<{
        category: ExpenseCategory;
        confidence: number;
        reasoning: string;
      }> = [result];

      // If confidence is low, add other potential categories
      if (result.confidence < 0.8) {
        const categories = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];
        
        // Add keyword-based suggestions
        for (const category of categories) {
          if (category === result.category) continue;
          
          const keywords = EXPENSE_CATEGORIES[category].keywords;
          const text = [
            transaction.merchant_name,
            transaction.merchant_descriptor,
            transaction.memo,
          ].filter(Boolean).join(' ').toLowerCase();

          let score = 0;
          for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
              score += 0.1;
            }
          }

          if (score > 0) {
            suggestions.push({
              category,
              confidence: Math.min(score, 0.7),
              reasoning: `Alternative keyword match`,
            });
          }
        }
      }

      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3); // Return top 3 suggestions
    },
    enabled: !!transaction,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for category analytics and insights
 */
export function useCategoryAnalytics(transactions: Transaction[]) {
  return useQuery({
    queryKey: ['category-analytics', transactions.length],
    queryFn: async () => {
      if (transactions.length === 0) return null;

      // Categorize all transactions
      const results = await aiCategorization.categorizeTransactionsBatch(transactions);
      
      // Calculate analytics
      const analytics = {
        totalTransactions: transactions.length,
        categorizedCount: 0,
        averageConfidence: 0,
        methodDistribution: {} as Record<string, number>,
        categoryDistribution: {} as Record<ExpenseCategory, { count: number; amount: number; avgConfidence: number }>,
        lowConfidenceTransactions: [] as Array<{ transaction: Transaction; result: CategorizationResult }>,
        topMerchantsByCategory: {} as Record<ExpenseCategory, Array<{ merchant: string; count: number; amount: number }>>,
      };

      let totalConfidence = 0;

      results.forEach((result, transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        analytics.categorizedCount++;
        totalConfidence += result.confidence;

        // Method distribution
        analytics.methodDistribution[result.method] = 
          (analytics.methodDistribution[result.method] || 0) + 1;

        // Category distribution
        if (!analytics.categoryDistribution[result.category]) {
          analytics.categoryDistribution[result.category] = {
            count: 0,
            amount: 0,
            avgConfidence: 0,
          };
        }

        const categoryData = analytics.categoryDistribution[result.category];
        categoryData.count++;
        categoryData.amount += transaction.amount;
        categoryData.avgConfidence = 
          (categoryData.avgConfidence * (categoryData.count - 1) + result.confidence) / categoryData.count;

        // Low confidence transactions
        if (result.confidence < 0.6) {
          analytics.lowConfidenceTransactions.push({ transaction, result });
        }

        // Top merchants by category
        if (!analytics.topMerchantsByCategory[result.category]) {
          analytics.topMerchantsByCategory[result.category] = [];
        }

        const merchantList = analytics.topMerchantsByCategory[result.category];
        const existingMerchant = merchantList.find(m => m.merchant === transaction.merchant_name);
        
        if (existingMerchant) {
          existingMerchant.count++;
          existingMerchant.amount += transaction.amount;
        } else {
          merchantList.push({
            merchant: transaction.merchant_name,
            count: 1,
            amount: transaction.amount,
          });
        }
      });

      analytics.averageConfidence = analytics.categorizedCount > 0 
        ? totalConfidence / analytics.categorizedCount 
        : 0;

      // Sort merchant lists
      Object.values(analytics.topMerchantsByCategory).forEach(merchants => {
        merchants.sort((a, b) => b.amount - a.amount);
      });

      return analytics;
    },
    enabled: transactions.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for manual category override with learning
 */
export function useManualCategorization() {
  const [overrides, setOverrides] = useState<Map<string, ExpenseCategory>>(new Map());

  const overrideCategory = useCallback((
    transactionId: string, 
    category: ExpenseCategory,
    transaction: Transaction
  ) => {
    setOverrides(prev => new Map(prev).set(transactionId, category));
    
    // TODO: In a real implementation, this could be sent to a learning endpoint
    // to improve future categorization accuracy
    console.log('Manual override recorded:', {
      transactionId,
      merchant: transaction.merchant_name,
      originalCategory: transaction.sk_category_name,
      newCategory: category,
    });
  }, []);

  const getOverriddenCategory = useCallback((transactionId: string): ExpenseCategory | null => {
    return overrides.get(transactionId) || null;
  }, [overrides]);

  const clearOverride = useCallback((transactionId: string) => {
    setOverrides(prev => {
      const newMap = new Map(prev);
      newMap.delete(transactionId);
      return newMap;
    });
  }, []);

  return {
    overrideCategory,
    getOverriddenCategory,
    clearOverride,
    overrides: Array.from(overrides.entries()),
  };
}

/**
 * Hook for category confidence thresholds and settings
 */
export function useCategorizationSettings() {
  const [settings, setSettings] = useState({
    confidenceThreshold: 0.7,
    enableAI: true,
    fallbackToKeywords: true,
    fallbackToMCC: true,
    autoApproveHighConfidence: false,
    reviewLowConfidence: true,
  });

  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    updateSettings,
  };
}

/**
 * Export all available expense categories
 */
export function useExpenseCategories() {
  return {
    categories: EXPENSE_CATEGORIES,
    categoryList: Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[],
    getCategoryInfo: (category: ExpenseCategory) => EXPENSE_CATEGORIES[category],
  };
}
