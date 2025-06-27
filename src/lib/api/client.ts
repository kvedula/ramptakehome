import {
  AuthToken,
  RampApiResponse,
  RampApiSingleResponse,
  RampApiErrorResponse,
  RampApiError,
  Transaction,
  TransactionFilters,
  User,
  UserFilters,
  Card,
  CardFilters,
  Department,
  Location,
  Business,
  Category,
  Reimbursement,
  ApiConfig,
  ApiRequestConfig,
} from '@/types';

/**
 * Comprehensive Ramp API Client with proper error handling,
 * retry logic, and type safety based on Ramp API documentation
 */
class RampApiClient {
  private config: ApiConfig;
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;
  private readonly API_VERSION = 'v1';
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly DEFAULT_RETRIES = 3;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseURL: config?.baseURL || process.env.RAMP_API_BASE_URL || 'https://demo-api.ramp.com',
      clientId: config?.clientId || process.env.RAMP_CLIENT_ID || '',
      clientSecret: config?.clientSecret || process.env.RAMP_CLIENT_SECRET || '',
      timeout: config?.timeout || this.DEFAULT_TIMEOUT,
      retries: config?.retries || this.DEFAULT_RETRIES,
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Ramp API client ID and secret are required');
    }
  }

  /**
   * Authenticate with Ramp API using client credentials flow
   */
  private async authenticate(): Promise<void> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime - 300000) {
      return;
    }

    try {
      const response = await this.makeHttpRequest('/developer/v1/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'transactions:read users:read cards:read business:read',
        }).toString(),
      }, false); // Don't include auth header for token request

      const tokenData: AuthToken = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiryTime = Date.now() + (tokenData.expires_in * 1000);
    } catch (error) {
      throw new RampApiError(
        'Authentication failed',
        401,
        'AUTH_FAILED',
        error
      );
    }
  }

  /**
   * Make HTTP request with proper error handling and retries
   */
  private async makeHttpRequest(
    endpoint: string,
    options: ApiRequestConfig = {},
    includeAuth: boolean = true
  ): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Ramp-Dashboard/1.0.0',
      ...options.headers,
    };

    if (includeAuth) {
      await this.authenticate();
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const requestConfig: RequestInit = {
      method: options.method || 'GET',
      headers,
      signal: controller.signal,
      ...options.body && { body: options.body },
    };

    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Make API request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestConfig = {},
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response = await this.makeHttpRequest(endpoint, options);

      if (!response.ok) {
        const errorData: RampApiErrorResponse = await response.json().catch(() => ({
          error: { message: response.statusText }
        }));

        throw new RampApiError(
          errorData.error?.message || `HTTP ${response.status}`,
          response.status,
          errorData.error_v2?.error_code,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      // Retry logic for transient errors
      if (
        retryCount < this.config.retries! &&
        error instanceof RampApiError &&
        [429, 500, 502, 503, 504].includes(error.status)
      ) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Build query string from filters object
   */
  private buildQueryString(filters: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return params.toString();
  }

  // ====================
  // TRANSACTION METHODS
  // ====================

  /**
   * Get paginated list of transactions with filtering
   */
  async getTransactions(
    filters: TransactionFilters = {}
  ): Promise<RampApiResponse<Transaction>> {
    const queryString = this.buildQueryString(filters);
    const endpoint = `/developer/${this.API_VERSION}/transactions${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<RampApiResponse<Transaction>>(endpoint);
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: string): Promise<RampApiSingleResponse<Transaction>> {
    return this.makeRequest<RampApiSingleResponse<Transaction>>(
      `/developer/${this.API_VERSION}/transactions/${id}`
    );
  }

  /**
   * Get all transactions (handles pagination automatically)
   */
  async getAllTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let nextCursor = filters.start;

    do {
      const currentFilters = { ...filters, start: nextCursor };
      const response = await this.getTransactions(currentFilters);
      
      allTransactions.push(...response.data);
      nextCursor = response.page?.next;
    } while (nextCursor);

    return allTransactions;
  }

  // ====================
  // USER METHODS
  // ====================

  /**
   * Get paginated list of users
   */
  async getUsers(filters: UserFilters = {}): Promise<RampApiResponse<User>> {
    const queryString = this.buildQueryString(filters);
    const endpoint = `/developer/${this.API_VERSION}/users${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<RampApiResponse<User>>(endpoint);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<RampApiSingleResponse<User>> {
    return this.makeRequest<RampApiSingleResponse<User>>(
      `/developer/${this.API_VERSION}/users/${id}`
    );
  }

  // ====================
  // CARD METHODS
  // ====================

  /**
   * Get paginated list of cards
   */
  async getCards(filters: CardFilters = {}): Promise<RampApiResponse<Card>> {
    const queryString = this.buildQueryString(filters);
    const endpoint = `/developer/${this.API_VERSION}/cards${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<RampApiResponse<Card>>(endpoint);
  }

  /**
   * Get a single card by ID
   */
  async getCard(id: string): Promise<RampApiSingleResponse<Card>> {
    return this.makeRequest<RampApiSingleResponse<Card>>(
      `/developer/${this.API_VERSION}/cards/${id}`
    );
  }

  // ====================
  // BUSINESS METHODS
  // ====================

  /**
   * Get business information
   */
  async getBusiness(): Promise<RampApiSingleResponse<Business>> {
    return this.makeRequest<RampApiSingleResponse<Business>>(
      `/developer/${this.API_VERSION}/business`
    );
  }

  /**
   * Get departments
   */
  async getDepartments(): Promise<RampApiResponse<Department>> {
    return this.makeRequest<RampApiResponse<Department>>(
      `/developer/${this.API_VERSION}/departments`
    );
  }

  /**
   * Get locations
   */
  async getLocations(): Promise<RampApiResponse<Location>> {
    return this.makeRequest<RampApiResponse<Location>>(
      `/developer/${this.API_VERSION}/locations`
    );
  }

  /**
   * Get spending categories
   */
  async getCategories(): Promise<RampApiResponse<Category>> {
    return this.makeRequest<RampApiResponse<Category>>(
      `/developer/${this.API_VERSION}/sk-categories`
    );
  }

  // ====================
  // REIMBURSEMENT METHODS
  // ====================

  /**
   * Get reimbursements
   */
  async getReimbursements(filters: { start?: string; limit?: number } = {}): Promise<RampApiResponse<Reimbursement>> {
    const queryString = this.buildQueryString(filters);
    const endpoint = `/developer/${this.API_VERSION}/reimbursements${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<RampApiResponse<Reimbursement>>(endpoint);
  }

  // ====================
  // UTILITY METHODS
  // ====================

  /**
   * Reset authentication (force re-authentication on next request)
   */
  resetAuth(): void {
    this.accessToken = null;
    this.tokenExpiryTime = null;
  }

  /**
   * Test API connectivity
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      await this.getBusiness();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<ApiConfig, 'clientSecret'> {
    return {
      baseURL: this.config.baseURL,
      clientId: this.config.clientId,
      timeout: this.config.timeout,
      retries: this.config.retries,
    };
  }
}

// Export singleton instance
export const rampApi = new RampApiClient();

// Export class for custom instances
export { RampApiClient };
