import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SpendingTrendData } from '@/types';

interface SpendingChartProps {
  data: SpendingTrendData[];
  isLoading?: boolean;
  title?: string;
  chartType?: 'line' | 'area';
}

export function SpendingChart({ 
  data, 
  isLoading = false, 
  title = 'Spending Trend (Last 30 Days)',
  chartType = 'area'
}: SpendingChartProps) {
  const formatXAxisLabel = (dateString: string) => {
    const date = new Date(dateString);
    return formatDate(date, { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">
            {formatDate(new Date(label), { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-blue-600">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-gray-600">
            Transactions: {data.transactionCount}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse">
            <div className="h-5 w-48 bg-gray-200 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxisLabel}
                  className="text-sm text-gray-600"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-sm text-gray-600"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxisLabel}
                  className="text-sm text-gray-600"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-sm text-gray-600"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
