'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions } from '@/lib/hooks/useRampApi';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { 
  Users,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  DollarSign,
  BarChart3,
  Download,
  Filter,
  Eye,
  Award,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PersonSpending {
  name: string;
  department: string;
  location: string;
  totalSpending: number;
  transactionCount: number;
  averageTransaction: number;
  lastTransaction: string;
  topCategory: string;
  pendingAmount: number;
  trend: number; // percentage change from previous period
}

export default function SpendingByPersonPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [sortBy, setSortBy] = useState<'spending' | 'transactions' | 'average'>('spending');
  const [department, setDepartment] = useState('all');

  const { data: transactionsData, isLoading } = useTransactions({ limit: 1000 });
  const transactions = transactionsData?.data || [];

  // Process transactions to get spending by person
  const processSpendingData = (): PersonSpending[] => {
    const personMap = new Map<string, {
      transactions: Transaction[];
      name: string;
      department: string;
      location: string;
    }>();

    transactions.forEach(transaction => {
      const cardHolder = transaction.card_holder;
      if (!cardHolder) return;

      const key = `${cardHolder.first_name} ${cardHolder.last_name}`;
      if (!personMap.has(key)) {
        personMap.set(key, {
          transactions: [],
          name: key,
          department: 'Unknown', // cardHolder.department_name not available in current API
          location: 'Unknown', // cardHolder.location_name not available in current API
        });
      }
      personMap.get(key)!.transactions.push(transaction);
    });

    return Array.from(personMap.entries()).map(([key, data]) => {
      const totalSpending = data.transactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = data.transactions.length;
      const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;
      
      // Get most recent transaction
      const sortedTransactions = data.transactions.sort((a, b) => 
        new Date(b.user_transaction_time).getTime() - new Date(a.user_transaction_time).getTime()
      );
      const lastTransaction = sortedTransactions[0]?.user_transaction_time || '';
      
      // Get top category
      const categoryMap = new Map<string, number>();
      data.transactions.forEach(t => {
        const category = t.sk_category_name || 'Other';
        categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
      });
      const topCategory = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
      
      // Calculate pending amount
      const pendingAmount = data.transactions
        .filter(t => t.state === 'PENDING')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Mock trend calculation (in real app, compare with previous period)
      const trend = Math.random() * 40 - 20; // -20% to +20%

      return {
        name: data.name,
        department: data.department,
        location: data.location,
        totalSpending,
        transactionCount,
        averageTransaction,
        lastTransaction,
        topCategory,
        pendingAmount,
        trend,
      };
    });
  };

  const spendingData = processSpendingData();
  
  // Filter by department
  const filteredData = department === 'all' 
    ? spendingData 
    : spendingData.filter(person => person.department === department);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'spending':
        return b.totalSpending - a.totalSpending;
      case 'transactions':
        return b.transactionCount - a.transactionCount;
      case 'average':
        return b.averageTransaction - a.averageTransaction;
      default:
        return 0;
    }
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(spendingData.map(p => p.department)));

  // Prepare chart data
  const chartData = sortedData.slice(0, 10).map(person => ({
    name: person.name.split(' ')[0], // First name only for chart
    spending: person.totalSpending,
    transactions: person.transactionCount,
  }));

  // Department distribution for pie chart
  const departmentData = departments.map(dept => {
    const deptSpending = spendingData
      .filter(p => p.department === dept)
      .reduce((sum, p) => sum + p.totalSpending, 0);
    return {
      name: dept,
      value: deptSpending,
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const PersonCard = ({ person, index }: { person: PersonSpending; index: number }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {index < 3 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Award className="h-3 w-3 text-yellow-800" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{person.name}</h3>
              <p className="text-xs text-muted-foreground">{person.department}</p>
              <p className="text-xs text-muted-foreground">{person.location}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{formatCurrency(person.totalSpending)}</p>
            <div className="flex items-center gap-1 text-xs">
              {person.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={person.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                {person.trend > 0 ? '+' : ''}{person.trend.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Transactions</p>
            <p className="font-semibold">{person.transactionCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg. Amount</p>
            <p className="font-semibold">{formatCurrency(person.averageTransaction)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Top Category</p>
            <p className="font-semibold truncate">{person.topCategory}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending</p>
            <p className="font-semibold">{formatCurrency(person.pendingAmount)}</p>
          </div>
        </div>
        
        {person.pendingAmount > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-800">Has pending transactions</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div>
              <div className="h-4 w-24 bg-muted rounded mb-1"></div>
              <div className="h-3 w-20 bg-muted rounded mb-1"></div>
              <div className="h-3 w-16 bg-muted rounded"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-6 w-20 bg-muted rounded mb-1"></div>
            <div className="h-3 w-12 bg-muted rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-muted rounded mb-1"></div>
              <div className="h-4 w-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spending by Person</h1>
        <p className="text-gray-600 mt-1">
          Analyze spending patterns and trends across team members
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total People</p>
                <p className="text-2xl font-bold">{spendingData.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(spendingData.reduce((sum, p) => sum + p.totalSpending, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Person</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(spendingData.reduce((sum, p) => sum + p.totalSpending, 0) / (spendingData.length || 1))}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending">Sort by Spending</SelectItem>
                <SelectItem value="transactions">Sort by Transactions</SelectItem>
                <SelectItem value="average">Sort by Average</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="spending" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* People List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Spending Details
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({sortedData.length} people)
              </span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} />
              ))
            ) : (
              sortedData.map((person, index) => (
                <PersonCard key={person.name} person={person} index={index} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
