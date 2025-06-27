// API Response Types
export interface RampApiResponse<T> {
  data: T[];
  page?: {
    next?: string;
    prev?: string;
  };
}

export interface RampApiSingleResponse<T> {
  data: T;
}

export interface RampApiErrorResponse {
  error: {
    message: string;
    details?: Record<string, unknown>;
  };
  error_v2?: {
    message: string;
    notes: string;
    additional_info: Record<string, unknown>;
    error_code: string;
  };
}

// Authentication Types
export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Business and User Types
export interface Business {
  id: string;
  business_name: string;
  phone: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  idp_user_id?: string;
  department_id?: string;
  location_id?: string;
  manager_id?: string;
  direct_manager_id?: string;
  business_id: string;
  business: Business;
}

export interface Department {
  id: string;
  name: string;
  business_id: string;
}

export interface Location {
  id: string;
  name: string;
  business_id: string;
}

// Card Types
export interface Card {
  id: string;
  last_four: string;
  cardholder_name: string;
  display_name: string;
  is_physical: boolean;
  spending_restrictions: SpendingRestrictions;
  state: CardState;
  fulfillment: CardFulfillment;
  user_id: string;
  user: User;
}

export type CardState = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface CardFulfillment {
  shipping?: {
    recipient_first_name: string;
    recipient_last_name: string;
    recipient_address1: string;
    recipient_address2?: string;
    recipient_city: string;
    recipient_state: string;
    recipient_postal_code: string;
    recipient_country: string;
  };
}

export interface SpendingRestrictions {
  amount?: number;
  interval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'TOTAL';
  categories?: {
    blocked_mcc_codes?: string[];
    allowed_mcc_codes?: string[];
  };
  blocked_merchants?: string[];
  allowed_merchants?: string[];
}

// Transaction Types
export interface Transaction {
  id: string;
  amount: number;
  merchant_name: string;
  merchant_descriptor?: string;
  merchant_category_code: string;
  merchant_category_code_description?: string;
  state: TransactionState;
  user_transaction_time: string;
  card_id: string;
  card: Card;
  user_id: string;
  user: User;
  receipts: Receipt[];
  memo?: string;
  sk_category_id: string;
  sk_category_name: string;
  policy_violations?: PolicyViolation[];
  accounting_field_selections?: AccountingFieldSelection[];
  line_items?: LineItem[];
  currency_code: string;
  original_transaction_amount?: number;
  original_currency_code?: string;
  exchange_rate?: number;
  card_holder?: {
    first_name: string;
    last_name: string;
  };
}

export type TransactionState = 
  | 'PENDING'
  | 'CLEARED'
  | 'DECLINED'
  | 'CANCELLED';

export interface Receipt {
  id: string;
  created_at: string;
  original_filename?: string;
  download_url?: string;
  url?: string;
}

export interface PolicyViolation {
  policy_id: string;
  policy_name: string;
  violation_type: string;
}

export interface AccountingFieldSelection {
  accounting_field_id: string;
  accounting_field_name: string;
  accounting_field_option_id: string;
  accounting_field_option_name: string;
}

export interface LineItem {
  amount: number;
  description?: string;
  accounting_field_selections?: AccountingFieldSelection[];
}

// Merchant and Category Types
export interface Merchant {
  id: string;
  name: string;
  category_code: string;
  category_name: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  is_billable?: boolean;
}

// Reimbursement Types
export interface Reimbursement {
  id: string;
  amount: number;
  currency_code: string;
  merchant_name: string;
  transaction_date: string;
  receipts: Receipt[];
  user_id: string;
  user: User;
  state: ReimbursementState;
  memo?: string;
}

export type ReimbursementState = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'DECLINED'
  | 'PAID';

// Filter Types
export interface TransactionFilters {
  from_date?: string; // ISO 8601 date
  to_date?: string; // ISO 8601 date
  merchant_name?: string;
  sk_category_name?: string;
  state?: TransactionState | TransactionState[];
  card_id?: string | string[];
  user_id?: string | string[];
  department_id?: string | string[];
  location_id?: string | string[];
  amount_greater_than?: number;
  amount_less_than?: number;
  has_receipts?: boolean;
  start?: string; // Pagination cursor
  limit?: number; // Page size (default: 25, max: 50)
}

export interface UserFilters {
  department_id?: string | string[];
  location_id?: string | string[];
  role?: string;
  state?: 'ACTIVE' | 'SUSPENDED';
  start?: string;
  limit?: number;
}

export interface CardFilters {
  user_id?: string | string[];
  state?: CardState | CardState[];
  start?: string;
  limit?: number;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  thisMonthSpending: number;
  averageTransactionAmount: number;
  topCategories: CategorySpending[];
  topMerchants: MerchantSpending[];
  spendingTrend: SpendingTrendData[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MerchantSpending {
  merchant: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingTrendData {
  date: string;
  amount: number;
  transactionCount: number;
}

// Table and UI Types
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}[]

// API Configuration
export interface ApiConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  timeout?: number;
  retries?: number;
}

// Request/Response wrappers
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
}

export interface ApiResponseMeta {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: string;
}

// Webhooks (for future implementation)
export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created_at: string;
  business_id: string;
}

// Error handling
export class RampApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'RampApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
