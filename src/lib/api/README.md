# Ramp API Client

A comprehensive TypeScript client for the Ramp API with full type safety, error handling, and retry logic.

## Features

- ✅ **Full TypeScript Support** - Complete type definitions based on Ramp API documentation
- ✅ **Authentication Handling** - Automatic OAuth2 client credentials flow
- ✅ **Token Management** - Automatic token refresh with expiry handling
- ✅ **Error Handling** - Structured error responses with retry logic
- ✅ **Request Retry** - Exponential backoff for transient errors
- ✅ **Timeout Support** - Configurable request timeouts
- ✅ **Comprehensive Testing** - Full test suite with Jest

## Usage

### Basic Setup

```typescript
import { rampApi } from '@/lib/api/client';
import { useTransactions } from '@/lib/hooks/useRampApi';

// Using the singleton instance (recommended)
const transactions = await rampApi.getTransactions({
  from_date: '2023-01-01',
  to_date: '2023-12-31',
  limit: 50
});

// Using React Query hooks (recommended for React components)
function TransactionsComponent() {
  const { data, isLoading, error } = useTransactions({
    from_date: '2023-01-01',
    to_date: '2023-12-31',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(transaction => (
        <div key={transaction.id}>{transaction.merchant_name}</div>
      ))}
    </div>
  );
}
```

### Custom Configuration

```typescript
import { RampApiClient } from '@/lib/api/client';

const customClient = new RampApiClient({
  baseURL: 'https://api.ramp.com',
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  timeout: 30000,
  retries: 3,
});
```

## API Methods

### Transactions

```typescript
// Get paginated transactions with filters
const transactions = await rampApi.getTransactions({
  from_date: '2023-01-01',
  to_date: '2023-12-31',
  merchant_name: 'Amazon',
  sk_category_name: 'Office Supplies',
  state: 'CLEARED',
  amount_greater_than: 100,
  amount_less_than: 1000,
  has_receipts: true,
  limit: 25,
});

// Get single transaction
const transaction = await rampApi.getTransaction('txn_123');

// Get all transactions (handles pagination automatically)
const allTransactions = await rampApi.getAllTransactions({
  from_date: '2023-01-01',
  to_date: '2023-12-31',
});
```

### Users

```typescript
// Get users
const users = await rampApi.getUsers({
  department_id: 'dept_123',
  role: 'admin',
  limit: 50,
});

// Get single user
const user = await rampApi.getUser('user_123');
```

### Cards

```typescript
// Get cards
const cards = await rampApi.getCards({
  user_id: 'user_123',
  state: 'ACTIVE',
});

// Get single card
const card = await rampApi.getCard('card_123');
```

### Business Data

```typescript
// Get business information
const business = await rampApi.getBusiness();

// Get departments
const departments = await rampApi.getDepartments();

// Get locations
const locations = await rampApi.getLocations();

// Get spending categories
const categories = await rampApi.getCategories();
```

## React Query Hooks

### Available Hooks

- `useTransactions(filters)` - Paginated transactions
- `useInfiniteTransactions(filters)` - Infinite scroll transactions
- `useTransaction(id)` - Single transaction
- `useDashboardStats(filters)` - Dashboard analytics
- `useAuthStatus()` - Authentication status
- `useTestAuth()` - Test authentication mutation

### Example Usage

```typescript
import { 
  useTransactions, 
  useDashboardStats, 
  useInfiniteTransactions 
} from '@/lib/hooks/useRampApi';

function Dashboard() {
  const { data: stats } = useDashboardStats();
  const { data: transactions } = useTransactions({ limit: 10 });
  
  return (
    <div>
      <h1>Total Spending: ${stats?.totalAmount}</h1>
      <TransactionsList transactions={transactions?.data} />
    </div>
  );
}

function InfiniteTransactionsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions({ limit: 25 });

  const transactions = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <div>
      {transactions.map(transaction => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Error Handling

The client includes comprehensive error handling with structured error types:

```typescript
import { RampApiError } from '@/types';

try {
  const transactions = await rampApi.getTransactions();
} catch (error) {
  if (error instanceof RampApiError) {
    console.error('API Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    });
    
    // Handle specific error codes
    switch (error.code) {
      case 'AUTH_FAILED':
        // Handle authentication error
        break;
      case 'RATE_LIMITED':
        // Handle rate limiting
        break;
      default:
        // Handle other errors
        break;
    }
  }
}
```

## Filter Types

### Transaction Filters

```typescript
interface TransactionFilters {
  from_date?: string;           // ISO 8601 date
  to_date?: string;             // ISO 8601 date
  merchant_name?: string;       // Merchant name filter
  sk_category_name?: string;    // Category name filter
  state?: TransactionState;     // PENDING | CLEARED | DECLINED | CANCELLED
  card_id?: string | string[];  // Card ID(s)
  user_id?: string | string[];  // User ID(s)
  department_id?: string | string[];
  location_id?: string | string[];
  amount_greater_than?: number;
  amount_less_than?: number;
  has_receipts?: boolean;
  start?: string;               // Pagination cursor
  limit?: number;               // Page size (max: 50)
}
```

## Testing

The client includes comprehensive tests. Run them with:

```bash
npm test src/lib/api/__tests__/client.test.ts
```

## Environment Variables

Required environment variables:

```env
RAMP_CLIENT_ID=your_client_id
RAMP_CLIENT_SECRET=your_client_secret
RAMP_API_BASE_URL=https://demo-api.ramp.com
```

## Health Check

Test API connectivity:

```typescript
const health = await rampApi.healthCheck();
console.log('API Status:', health.status); // 'ok' | 'error'
```

## Configuration

Get current configuration (without sensitive data):

```typescript
const config = rampApi.getConfig();
console.log('API Config:', config);
// { baseURL, clientId, timeout, retries }
```

## Rate Limiting

The client automatically handles rate limiting with exponential backoff retry logic for 429 responses.

## Security

- Client secrets are never exposed in configuration responses
- All requests use HTTPS
- OAuth2 tokens are automatically managed and refreshed
- Request timeouts prevent hanging connections
