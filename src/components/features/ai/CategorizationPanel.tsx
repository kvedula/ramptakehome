'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  useTransactionCategorization,
  useBatchCategorization,
  useCategorizationStatus,
  useCategorySuggestions,
  useExpenseCategories,
  useManualCategorization,
} from '@/lib/hooks/useAICategorization';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Download,
  Upload,
} from 'lucide-react';

interface CategorizationPanelProps {
  transactions: Transaction[];
  onCategoryUpdate?: (transactionId: string, category: string) => void;
  selectedTransaction?: Transaction | null;
}

export function CategorizationPanel({ 
  transactions, 
  onCategoryUpdate,
  selectedTransaction 
}: CategorizationPanelProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  // Hooks
  const { data: status } = useCategorizationStatus();
  const singleCategorization = useTransactionCategorization();
  const batchCategorization = useBatchCategorization();
  const { data: suggestions } = useCategorySuggestions(selectedTransaction || null);
  const { categoryList, getCategoryInfo } = useExpenseCategories();
  const { overrideCategory, getOverriddenCategory } = useManualCategorization();

  const handleSingleCategorization = async (transaction: Transaction) => {
    try {
      const result = await singleCategorization.mutateAsync(transaction);
      if (onCategoryUpdate) {
        onCategoryUpdate(transaction.id, result.category);
      }
    } catch (error) {
      console.error('Categorization failed:', error);
    }
  };

  const handleBatchCategorization = async () => {
    const transactionsToProcess = selectedTransactions.length > 0 
      ? transactions.filter(t => selectedTransactions.includes(t.id))
      : transactions;

    try {
      const { results } = await batchCategorization.categorizeTransactions(transactionsToProcess);
      
      if (onCategoryUpdate) {
        results.forEach((result, transactionId) => {
          onCategoryUpdate(transactionId, result.category);
        });
      }
    } catch (error) {
      console.error('Batch categorization failed:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Categorization Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${status?.initialized ? 'text-green-600' : 'text-gray-400'}`}>
                {status?.initialized ? <CheckCircle className="h-8 w-8 mx-auto" /> : <AlertTriangle className="h-8 w-8 mx-auto" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status?.initialized ? 'Active' : 'Disabled'}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${status?.hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
                {status?.hasApiKey ? '✓' : '✗'}
              </div>
              <p className="text-sm text-gray-600 mt-1">API Key</p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${status?.rateLimited ? 'text-red-600' : 'text-green-600'}`}>
                {status?.rateLimited ? <Clock className="h-8 w-8 mx-auto" /> : <Zap className="h-8 w-8 mx-auto" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status?.rateLimited ? 'Rate Limited' : 'Available'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categoryList.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Batch Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedTransactions.length > 0 
                    ? `${selectedTransactions.length} transactions selected`
                    : `All ${transactions.length} transactions`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  AI will categorize transactions using multiple strategies
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTransactions([])}
                  disabled={selectedTransactions.length === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={handleBatchCategorization}
                  disabled={batchCategorization.isLoading || transactions.length === 0}
                  className="flex items-center gap-2"
                >
                  {batchCategorization.isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Categorize {selectedTransactions.length > 0 ? 'Selected' : 'All'}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {batchCategorization.progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing transactions...</span>
                  <span>{batchCategorization.progress.percentage}%</span>
                </div>
                <Progress value={batchCategorization.progress.percentage} />
                {batchCategorization.progress.currentTransaction && (
                  <p className="text-xs text-gray-500">
                    Current: {batchCategorization.progress.currentTransaction}
                  </p>
                )}
              </div>
            )}

            {batchCategorization.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {batchCategorization.error.message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Single Transaction Categorization */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Transaction Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Transaction Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Merchant</label>
                    <p className="font-semibold">{selectedTransaction.merchant_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Category</label>
                    <p className="font-semibold">{selectedTransaction.sk_category_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">MCC Code</label>
                    <p className="font-semibold">{selectedTransaction.merchant_category_code}</p>
                  </div>
                </div>
                {selectedTransaction.memo && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-600">Memo</label>
                    <p className="text-sm">{selectedTransaction.memo}</p>
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">AI Categorization Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{suggestion.category}</span>
                            <Badge variant={getConfidenceBadge(suggestion.confidence)}>
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {suggestion.reasoning}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={index === 0 ? "default" : "outline"}
                          onClick={() => {
                            overrideCategory(selectedTransaction.id, suggestion.category, selectedTransaction);
                            if (onCategoryUpdate) {
                              onCategoryUpdate(selectedTransaction.id, suggestion.category);
                            }
                          }}
                        >
                          {index === 0 ? 'Apply' : 'Use'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Categorization */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSingleCategorization(selectedTransaction)}
                  disabled={singleCategorization.isPending}
                  className="flex items-center gap-2"
                >
                  {singleCategorization.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  Re-analyze
                </Button>
                
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manual Override
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Available Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryList.slice(0, -1).map((category) => { // Exclude 'Other'
              const info = getCategoryInfo(category);
              return (
                <div key={category} className="p-3 border rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {info.keywords.slice(0, 3).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {info.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{info.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
