import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats } from '@/types';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Receipt,
  AlertTriangle 
} from 'lucide-react';

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const statCards = [
    {
      title: 'Total Spending',
      value: formatCurrency(stats?.totalAmount || 0),
      icon: DollarSign,
      description: `${stats?.totalTransactions || 0} transactions`,
      trend: '+12.3% from last month',
      color: 'text-green-600',
    },
    {
      title: 'This Month',
      value: formatCurrency(stats?.thisMonthSpending || 0),
      icon: TrendingUp,
      description: 'Month-to-date spending',
      trend: '+8.1% from last month',
      color: 'text-blue-600',
    },
    {
      title: 'Pending Transactions',
      value: (stats?.pendingTransactions || 0).toString(),
      icon: Clock,
      description: 'Awaiting approval',
      trend: '-2 from yesterday',
      color: 'text-yellow-600',
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(stats?.averageTransactionAmount || 0),
      icon: Receipt,
      description: 'Per transaction',
      trend: '+5.2% from last month',
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-28 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              <p className={`text-xs mt-1 ${card.color}`}>
                {card.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
