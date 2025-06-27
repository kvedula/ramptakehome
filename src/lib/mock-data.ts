import { Transaction, DashboardStats, TransactionState } from '@/types';

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1234567890',
    amount: 1250.00,
    merchant_name: 'Amazon Web Services',
    merchant_descriptor: 'AWS CLOUD SERVICES',
    merchant_category_code: '5734',
    merchant_category_code_description: 'Computer Software Stores',
    state: 'CLEARED' as TransactionState,
    user_transaction_time: '2023-12-15T10:30:00Z',
    card_id: 'card_abc123',
    card: {
      id: 'card_abc123',
      last_four: '1234',
      cardholder_name: 'John Doe',
      display_name: 'John\'s Corporate Card',
      is_physical: true,
      spending_restrictions: {
        amount: 5000,
        interval: 'MONTHLY',
      },
      state: 'ACTIVE',
      fulfillment: {},
      user_id: 'user_john',
      user: {
        id: 'user_john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        role: 'Engineering Manager',
        department_id: 'dept_eng',
        business_id: 'biz_123',
        business: {
          id: 'biz_123',
          business_name: 'Acme Corp',
          phone: '+1-555-0123',
        },
      },
    },
    user_id: 'user_john',
    user: {
      id: 'user_john',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@company.com',
      role: 'Engineering Manager',
      department_id: 'dept_eng',
      business_id: 'biz_123',
      business: {
        id: 'biz_123',
        business_name: 'Acme Corp',
        phone: '+1-555-0123',
      },
    },
    receipts: [
      {
        id: 'receipt_1',
        created_at: '2023-12-15T10:35:00Z',
        original_filename: 'aws-invoice-dec-2023.pdf',
      },
    ],
    memo: 'Monthly AWS infrastructure costs',
    sk_category_id: 'cat_software',
    sk_category_name: 'Software & SaaS',
    currency_code: 'USD',
  },
  {
    id: 'txn_2345678901',
    amount: 89.99,
    merchant_name: 'Office Depot',
    merchant_descriptor: 'OFFICE DEPOT #1234',
    merchant_category_code: '5943',
    merchant_category_code_description: 'Office Supplies',
    state: 'PENDING' as TransactionState,
    user_transaction_time: '2023-12-14T14:22:00Z',
    card_id: 'card_def456',
    card: {
      id: 'card_def456',
      last_four: '5678',
      cardholder_name: 'Sarah Smith',
      display_name: 'Sarah\'s Team Card',
      is_physical: false,
      spending_restrictions: {
        amount: 1000,
        interval: 'MONTHLY',
      },
      state: 'ACTIVE',
      fulfillment: {},
      user_id: 'user_sarah',
      user: {
        id: 'user_sarah',
        first_name: 'Sarah',
        last_name: 'Smith',
        email: 'sarah.smith@company.com',
        role: 'Operations Manager',
        department_id: 'dept_ops',
        business_id: 'biz_123',
        business: {
          id: 'biz_123',
          business_name: 'Acme Corp',
          phone: '+1-555-0123',
        },
      },
    },
    user_id: 'user_sarah',
    user: {
      id: 'user_sarah',
      first_name: 'Sarah',
      last_name: 'Smith',
      email: 'sarah.smith@company.com',
      role: 'Operations Manager',
      department_id: 'dept_ops',
      business_id: 'biz_123',
      business: {
        id: 'biz_123',
        business_name: 'Acme Corp',
        phone: '+1-555-0123',
      },
    },
    receipts: [],
    sk_category_id: 'cat_office',
    sk_category_name: 'Office Supplies',
    currency_code: 'USD',
  },
  {
    id: 'txn_3456789012',
    amount: 45.50,
    merchant_name: 'Starbucks',
    merchant_descriptor: 'STARBUCKS #12345',
    merchant_category_code: '5814',
    merchant_category_code_description: 'Eating Places, Restaurants',
    state: 'CLEARED' as TransactionState,
    user_transaction_time: '2023-12-14T09:15:00Z',
    card_id: 'card_ghi789',
    card: {
      id: 'card_ghi789',
      last_four: '9012',
      cardholder_name: 'Mike Johnson',
      display_name: 'Mike\'s Expense Card',
      is_physical: true,
      spending_restrictions: {
        amount: 500,
        interval: 'WEEKLY',
      },
      state: 'ACTIVE',
      fulfillment: {},
      user_id: 'user_mike',
      user: {
        id: 'user_mike',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@company.com',
        role: 'Sales Representative',
        department_id: 'dept_sales',
        business_id: 'biz_123',
        business: {
          id: 'biz_123',
          business_name: 'Acme Corp',
          phone: '+1-555-0123',
        },
      },
    },
    user_id: 'user_mike',
    user: {
      id: 'user_mike',
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.johnson@company.com',
      role: 'Sales Representative',
      department_id: 'dept_sales',
      business_id: 'biz_123',
      business: {
        id: 'biz_123',
        business_name: 'Acme Corp',
        phone: '+1-555-0123',
      },
    },
    receipts: [
      {
        id: 'receipt_2',
        created_at: '2023-12-14T09:20:00Z',
        original_filename: 'starbucks-receipt.jpg',
      },
    ],
    memo: 'Client meeting refreshments',
    sk_category_id: 'cat_meals',
    sk_category_name: 'Meals & Entertainment',
    currency_code: 'USD',
  },
  {
    id: 'txn_4567890123',
    amount: 799.99,
    merchant_name: 'Dell Technologies',
    merchant_descriptor: 'DELL DIRECT SALES',
    merchant_category_code: '5734',
    merchant_category_code_description: 'Computer and Computer Peripheral Equipment',
    state: 'CLEARED' as TransactionState,
    user_transaction_time: '2023-12-13T16:45:00Z',
    card_id: 'card_abc123',
    card: {
      id: 'card_abc123',
      last_four: '1234',
      cardholder_name: 'John Doe',
      display_name: 'John\'s Corporate Card',
      is_physical: true,
      spending_restrictions: {
        amount: 5000,
        interval: 'MONTHLY',
      },
      state: 'ACTIVE',
      fulfillment: {},
      user_id: 'user_john',
      user: {
        id: 'user_john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        role: 'Engineering Manager',
        department_id: 'dept_eng',
        business_id: 'biz_123',
        business: {
          id: 'biz_123',
          business_name: 'Acme Corp',
          phone: '+1-555-0123',
        },
      },
    },
    user_id: 'user_john',
    user: {
      id: 'user_john',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@company.com',
      role: 'Engineering Manager',
      department_id: 'dept_eng',
      business_id: 'biz_123',
      business: {
        id: 'biz_123',
        business_name: 'Acme Corp',
        phone: '+1-555-0123',
      },
    },
    receipts: [
      {
        id: 'receipt_3',
        created_at: '2023-12-13T16:50:00Z',
        original_filename: 'dell-purchase-order.pdf',
      },
    ],
    memo: 'New laptop for team member',
    sk_category_id: 'cat_equipment',
    sk_category_name: 'Computer Equipment',
    currency_code: 'USD',
  },
  {
    id: 'txn_5678901234',
    amount: 150.00,
    merchant_name: 'Uber',
    merchant_descriptor: 'UBER TRIP',
    merchant_category_code: '4121',
    merchant_category_code_description: 'Taxicabs and Limousines',
    state: 'DECLINED' as TransactionState,
    user_transaction_time: '2023-12-12T18:30:00Z',
    card_id: 'card_def456',
    card: {
      id: 'card_def456',
      last_four: '5678',
      cardholder_name: 'Sarah Smith',
      display_name: 'Sarah\'s Team Card',
      is_physical: false,
      spending_restrictions: {
        amount: 1000,
        interval: 'MONTHLY',
      },
      state: 'ACTIVE',
      fulfillment: {},
      user_id: 'user_sarah',
      user: {
        id: 'user_sarah',
        first_name: 'Sarah',
        last_name: 'Smith',
        email: 'sarah.smith@company.com',
        role: 'Operations Manager',
        department_id: 'dept_ops',
        business_id: 'biz_123',
        business: {
          id: 'biz_123',
          business_name: 'Acme Corp',
          phone: '+1-555-0123',
        },
      },
    },
    user_id: 'user_sarah',
    user: {
      id: 'user_sarah',
      first_name: 'Sarah',
      last_name: 'Smith',
      email: 'sarah.smith@company.com',
      role: 'Operations Manager',
      department_id: 'dept_ops',
      business_id: 'biz_123',
      business: {
        id: 'biz_123',
        business_name: 'Acme Corp',
        phone: '+1-555-0123',
      },
    },
    receipts: [],
    memo: 'Airport transportation - policy violation',
    sk_category_id: 'cat_travel',
    sk_category_name: 'Travel & Transportation',
    currency_code: 'USD',
    policy_violations: [
      {
        policy_id: 'policy_transport',
        policy_name: 'Transportation Policy',
        violation_type: 'Amount exceeds limit',
      },
    ],
  },
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalTransactions: 156,
  totalAmount: 24567.89,
  pendingTransactions: 12,
  thisMonthSpending: 8934.56,
  averageTransactionAmount: 157.49,
  topCategories: [
    {
      category: 'Software & SaaS',
      amount: 8234.56,
      percentage: 33.5,
      transactionCount: 23,
    },
    {
      category: 'Office Supplies',
      amount: 4567.89,
      percentage: 18.6,
      transactionCount: 45,
    },
    {
      category: 'Meals & Entertainment',
      amount: 3456.78,
      percentage: 14.1,
      transactionCount: 67,
    },
    {
      category: 'Travel & Transportation',
      amount: 2890.45,
      percentage: 11.8,
      transactionCount: 15,
    },
    {
      category: 'Computer Equipment',
      amount: 2345.67,
      percentage: 9.5,
      transactionCount: 8,
    },
  ],
  topMerchants: [
    {
      merchant: 'Amazon Web Services',
      amount: 5234.56,
      percentage: 21.3,
      transactionCount: 12,
    },
    {
      merchant: 'Office Depot',
      amount: 2345.67,
      percentage: 9.5,
      transactionCount: 23,
    },
    {
      merchant: 'Starbucks',
      amount: 1890.45,
      percentage: 7.7,
      transactionCount: 34,
    },
    {
      merchant: 'Dell Technologies',
      amount: 1567.89,
      percentage: 6.4,
      transactionCount: 5,
    },
    {
      merchant: 'Uber',
      amount: 1234.56,
      percentage: 5.0,
      transactionCount: 18,
    },
  ],
  spendingTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 2000) + 500,
      transactionCount: Math.floor(Math.random() * 20) + 5,
    };
  }),
};

// Helper functions for mock data
export const getTransactionStatusVariant = (state: TransactionState) => {
  switch (state) {
    case 'CLEARED':
      return 'success';
    case 'PENDING':
      return 'pending';
    case 'DECLINED':
      return 'destructive';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const getMockTransactionsByDateRange = (
  startDate?: string,
  endDate?: string
): Transaction[] => {
  if (!startDate && !endDate) {
    return mockTransactions;
  }
  
  return mockTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.user_transaction_time);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    
    return transactionDate >= start && transactionDate <= end;
  });
};

export const getMockTransactionsByCategory = (category?: string): Transaction[] => {
  if (!category) {
    return mockTransactions;
  }
  
  return mockTransactions.filter(
    transaction => transaction.sk_category_name === category
  );
};

export const getMockTransactionsByMerchant = (merchant?: string): Transaction[] => {
  if (!merchant) {
    return mockTransactions;
  }
  
  return mockTransactions.filter(
    transaction => transaction.merchant_name.toLowerCase().includes(merchant.toLowerCase())
  );
};
