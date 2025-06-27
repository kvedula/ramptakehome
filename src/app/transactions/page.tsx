'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePaginatedTransactions } from '@/lib/hooks/usePaginatedTransactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getTransactionStatusVariant } from '@/lib/mock-data';
import { Transaction, TransactionFilters } from '@/types';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { Pagination } from '@/components/ui/pagination';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Receipt,
  User,
  Calendar,
  ArrowUpDown,
  RefreshCw,
  X
} from 'lucide-react';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle search query from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setFilters(prev => ({
        ...prev,
        merchant_name: searchFromUrl,
      }));
    }
  }, [searchParams]);

  const { 
    data: transactionsData, 
    isLoading, 
    error, 
    refresh,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    isCountingTotal,
  } = usePaginatedTransactions(filters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      merchant_name: query || undefined,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      state: status === 'all' ? undefined : status,
    }));
  };

  const handleSort = (field: 'date' | 'amount' | 'merchant') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };


  const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <MerchantLogo 
            merchantName={transaction.merchant_name} 
            size="md" 
            showTooltip
          />
          <div>
            <p className="font-medium text-sm">{transaction.merchant_name}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.merchant_descriptor}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
        <p className="text-xs text-muted-foreground">{transaction.currency_code}</p>
      </td>
      <td className="py-3 px-4">
        <Badge variant={getTransactionStatusVariant(transaction.state) as any}>
          {transaction.state}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span className="text-sm">
            {transaction.card_holder?.first_name} {transaction.card_holder?.last_name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm">{transaction.sk_category_name}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm">
          {formatDate(new Date(transaction.user_transaction_time), {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {transaction.receipts && transaction.receipts.length > 0 && (
            <Receipt className="h-4 w-4 text-green-600" />
          )}
          <span className="text-xs text-muted-foreground">
            ••{transaction.card_id?.slice(-4) || 'XXXX'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );

  const LoadingSkeleton = () => (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1"></div>
            <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1"></div>
        <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
        <p className="text-gray-600 mt-1">
          View and manage all your transactions
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="CLEARED">Cleared</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="merchant">Sort by Merchant</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Transactions
              {transactionsData?.data && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({transactionsData.data.length} 
                  {(transactionsData as any)?.searchApplied ? 'filtered' : ''} results
                  {(transactionsData as any)?.searchApplied && (transactionsData as any)?.originalCount && (
                    <span> from {(transactionsData as any).originalCount} total</span>
                  )})
                </span>
              )}
            </CardTitle>
            {searchQuery && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Searching: "{searchQuery}"
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters(prev => ({ ...prev, merchant_name: undefined }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('merchant')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Merchant
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Amount
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">User</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Card</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-red-600">
                      Error loading transactions: {error.message}
                    </td>
                  </tr>
                ) : transactionsData?.data && transactionsData.data.length > 0 ? (
                  transactionsData.data.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {transactionsData && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            {(() => {
              const currentCount = transactionsData.data?.length || 0;
              const searchApplied = (transactionsData as any)?.searchApplied;
              const originalCount = (transactionsData as any)?.originalCount;
              const startIndex = (currentPage - 1) * 20 + 1;
              const endIndex = (currentPage - 1) * 20 + currentCount;
              
              if (searchApplied && originalCount) {
                return (
                  <>
                    Showing <span className="font-medium">{currentCount}</span> filtered results 
                    from <span className="font-medium">{originalCount}</span> total transactions
                  </>
                );
              } else if (totalItems > 0) {
                return (
                  <>
                    Showing <span className="font-medium">{startIndex}-{endIndex}</span> of{' '}
                    <span className="font-medium">{totalItems}{isCountingTotal && '+'}</span> transactions
                    {isCountingTotal && (
                      <span className="ml-2 text-xs text-blue-600 animate-pulse">
                        (counting...)
                      </span>
                    )}
                  </>
                );
              } else {
                return (
                  <>
                    Showing <span className="font-medium">{currentCount}</span> 
                    {currentCount === 1 ? ' transaction' : ' transactions'}
                  </>
                );
              }
            })()} 
          </div>
          
          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
