import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getTransactionStatusVariant } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { 
  ArrowUpRight, 
  Receipt, 
  User, 
  Building,
  Eye,
  ExternalLink 
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  title?: string;
  showViewAll?: boolean;
  totalCount?: number;
  isCountingTotal?: boolean;
}

export function RecentTransactions({ 
  transactions, 
  isLoading = false, 
  title = 'Recent Transactions',
  showViewAll = true,
  totalCount,
  isCountingTotal = false
}: RecentTransactionsProps) {
  const router = useRouter();
  const TransactionSkeleton = () => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-full"></div>
        <div>
          <div className="h-4 w-32 bg-muted rounded mb-1"></div>
          <div className="h-3 w-24 bg-muted rounded"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-4 w-20 bg-muted rounded mb-1"></div>
        <div className="h-3 w-16 bg-muted rounded"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse">
            <div className="h-5 w-48 bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {transactions.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {Math.min(transactions.length, 5)} of {totalCount || transactions.length}{isCountingTotal && '+'} recent transactions
              {isCountingTotal && (
                <span className="ml-2 text-xs text-blue-600 animate-pulse">
                  (counting...)
                </span>
              )}
            </p>
          )}
        </div>
        {showViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80"
            onClick={() => router.push('/transactions')}
          >
            View All
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Receipt className="mx-auto h-12 w-12 text-muted mb-4" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Merchant Logo */}
                  <MerchantLogo 
                    merchantName={transaction.merchant_name} 
                    size="lg" 
                    showTooltip
                  />
                  
                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {transaction.merchant_name}
                      </p>
                      <Badge variant={getTransactionStatusVariant(transaction.state) as any}>
                        {transaction.state}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {transaction.card_holder?.first_name} {transaction.card_holder?.last_name}
                      </span>
                      <span>{transaction.sk_category_name}</span>
                      <span>
                        {formatDate(new Date(transaction.user_transaction_time), {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    {transaction.memo && (
                      <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                        {transaction.memo}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Amount and Actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.state === 'DECLINED' 
                        ? 'text-muted-foreground line-through' 
                        : 'text-foreground'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {transaction.receipts && transaction.receipts.length > 0 && (
                        <Receipt className="h-3 w-3" />
                      )}
                      <span>••{transaction.card_id?.slice(-4) || 'XXXX'}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show View All in footer if there are more transactions */}
        {transactions.length > 5 && showViewAll && (
          <div className="p-4 border-t bg-muted/30">
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => router.push('/transactions')}
            >
              View All {transactions.length} Transactions
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
