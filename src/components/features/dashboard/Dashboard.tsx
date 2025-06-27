'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCards } from './StatsCards';
import { SpendingChart } from './SpendingChart';
import { CategoryChart } from './CategoryChart';
import { RecentTransactions } from './RecentTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactions, useDashboardStats } from '@/lib/hooks/useRampApi';
import { usePaginatedTransactions } from '@/lib/hooks/usePaginatedTransactions';
import { formatCurrency } from '@/lib/utils';
import { CategorizationProgress } from '../ai/CategorizationProgress';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import {
  CalendarDays,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Brain,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export function Dashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState({
    progress: 0,
    currentStep: 'Initializing',
    processedCount: 0,
    totalCount: 0,
    currentTransaction: '',
  });
  
  // Fetch real data from API
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading,
    totalItems,
    isCountingTotal,
  } = usePaginatedTransactions({ limit: 8 });
  
  const isLoading = statsLoading || transactionsLoading;
  const recentTransactions = transactionsData?.data || [];
  const spendingTrendData = dashboardStats?.spendingTrend || [];
  const categoryData = dashboardStats?.topCategories || [];
  const merchantData = dashboardStats?.topMerchants || [];

  const handleRefresh = () => {
    // Refresh will be handled by React Query automatically
    window.location.reload();
  };

  const handleAICategorization = async () => {
    if (!recentTransactions.length) {
      alert('No transactions available to categorize.');
      return;
    }

    setIsCategorizingAI(true);
    
    const steps = [
      { name: 'Initializing', duration: 500 },
      { name: 'Analyzing Transactions', duration: 1000 },
      { name: 'AI Processing', duration: 0 }, // Real API call time varies
      { name: 'Applying Categories', duration: 500 },
      { name: 'Finalizing', duration: 300 },
    ];
    
    const totalTransactions = recentTransactions.length;
    setAiProgress(prev => ({ ...prev, totalCount: totalTransactions }));
    
    try {
      // Step 1: Initializing
      setAiProgress(prev => ({ ...prev, currentStep: steps[0].name, progress: 0 }));
      await new Promise(resolve => setTimeout(resolve, steps[0].duration));
      
      // Step 2: Analyzing Transactions
      setAiProgress(prev => ({ 
        ...prev, 
        currentStep: steps[1].name, 
        progress: 20,
        processedCount: 0 
      }));
      await new Promise(resolve => setTimeout(resolve, steps[1].duration));
      
      // Step 3: AI Processing (Real API calls)
      setAiProgress(prev => ({ 
        ...prev, 
        currentStep: steps[2].name, 
        progress: 30 
      }));
      
      // Make real API call to categorize transactions
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: recentTransactions,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Categorization failed');
      }
      
      // Step 4: Applying Categories
      setAiProgress(prev => ({ 
        ...prev, 
        currentStep: steps[3].name, 
        progress: 85,
        processedCount: totalTransactions 
      }));
      await new Promise(resolve => setTimeout(resolve, steps[3].duration));
      
      // Step 5: Finalizing
      setAiProgress(prev => ({ 
        ...prev, 
        currentStep: steps[4].name, 
        progress: 95 
      }));
      await new Promise(resolve => setTimeout(resolve, steps[4].duration));
      
      // Complete
      setAiProgress(prev => ({
        ...prev,
        progress: 100,
        processedCount: totalTransactions,
        currentStep: 'Finalizing',
        currentTransaction: '',
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success with real results
      const summary = result.summary;
      const successRate = Math.round((summary.successful / summary.total) * 100);
      alert(`🎉 AI Categorization completed!\n\n` +
            `📊 Results:\n` +
            `• ${summary.total} transactions processed\n` +
            `• ${summary.successful} successfully categorized\n` +
            `• ${successRate}% success rate\n\n` +
            `🤖 Real OpenAI API calls made!`);
            
    } catch (error) {
      console.error('AI Categorization error:', error);
      alert(`❌ AI Categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your OpenAI API key and try again.`);
    } finally {
      setIsCategorizingAI(false);
      setAiProgress({
        progress: 0,
        currentStep: 'Initializing',
        processedCount: 0,
        totalCount: 0,
        currentTransaction: '',
      });
    }
  };

  // Quick stats for alerts and notifications
  const quickAlerts = [
    {
      type: 'warning',
      message: 'Spending increased 23% this week',
      icon: TrendingUp,
      color: 'text-yellow-600',
    },
    {
      type: 'success',
      message: '12 receipts uploaded automatically',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      type: 'info',
      message: '3 transactions pending approval',
      icon: Clock,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your company spending and transactions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAICategorization} 
            disabled={isCategorizingAI || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isCategorizingAI ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                AI Categorizing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                AI Categorization
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Alerts */}
      <div className="grid gap-2 md:grid-cols-3">
        {quickAlerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-5 w-5 ${alert.color}`} />
              <span className="text-sm text-gray-700 flex-1">{alert.message}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <SpendingChart 
          data={spendingTrendData} 
          isLoading={isLoading}
          chartType="area"
        />
        <CategoryChart 
          data={categoryData} 
          isLoading={isLoading}
          chartType="pie"
        />
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {merchantData.map((merchant, index) => (
                <div key={merchant.merchant} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <MerchantLogo 
                        merchantName={merchant.merchant} 
                        size="lg" 
                        showTooltip
                      />
                      {/* Ranking badge */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{merchant.merchant}</p>
                      <p className="text-xs text-gray-500">
                        {merchant.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(merchant.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {merchant.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold">{formatCurrency(dashboardStats?.thisMonthSpending || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="font-semibold">{formatCurrency(7234.12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Change</span>
                <Badge variant="success">+23.5%</Badge>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. per day</span>
                  <span className="font-semibold">{formatCurrency((dashboardStats?.thisMonthSpending || 0) / 30)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Transactions
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/spending')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Spending by Person
              </Button>
              <Button variant="default" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions 
        transactions={recentTransactions} 
        isLoading={isLoading}
        title="Recent Transactions"
        showViewAll={true}
        totalCount={totalItems}
        isCountingTotal={isCountingTotal}
      />
      
      {/* AI Categorization Progress Modal */}
      <CategorizationProgress
        isVisible={isCategorizingAI}
        progress={aiProgress.progress}
        currentStep={aiProgress.currentStep}
        processedCount={aiProgress.processedCount}
        totalCount={aiProgress.totalCount}
        currentTransaction={aiProgress.currentTransaction}
      />
    </div>
  );
}
