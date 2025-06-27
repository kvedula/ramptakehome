import { RampApiClient } from '../client';
import { RampApiError } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('RampApiClient', () => {
  let client: RampApiClient;
  
  beforeEach(() => {
    // Reset mocks
    mockFetch.mockClear();
    
    // Create client with test config
    client = new RampApiClient({
      baseURL: 'https://test-api.ramp.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      timeout: 5000,
      retries: 1,
    });
  });
  
  describe('constructor', () => {
    it('should throw error if client ID is missing', () => {
      expect(() => {
        new RampApiClient({
          baseURL: 'https://test-api.ramp.com',
          clientId: '',
          clientSecret: 'test_secret',
        });
      }).toThrow('Ramp API client ID and secret are required');
    });
    
    it('should throw error if client secret is missing', () => {
      expect(() => {
        new RampApiClient({
          baseURL: 'https://test-api.ramp.com',
          clientId: 'test_id',
          clientSecret: '',
        });
      }).toThrow('Ramp API client ID and secret are required');
    });
  });
  
  describe('authentication', () => {
    it('should authenticate before making API requests', async () => {
      // Mock token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'transactions:read',
        }),
      } as Response);
      
      // Mock transactions response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          page: {},
        }),
      } as Response);
      
      await client.getTransactions();
      
      // Should make two calls: auth + transactions
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // First call should be for authentication
      expect(mockFetch).toHaveBeenNthCalledWith(1, 
        'https://test-api.ramp.com/developer/v1/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic '),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });
    
    it('should handle authentication failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: { message: 'Invalid credentials' },
        }),
      } as Response);
      
      await expect(client.getTransactions()).rejects.toThrow(
        expect.objectContaining({
          message: 'Authentication failed',
          status: 401,
        })
      );
    });
  });
  
  describe('transactions API', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'transactions:read',
        }),
      } as Response);
    });
    
    it('should fetch transactions with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'txn_123',
              amount: 100.50,
              merchant_name: 'Test Merchant',
              state: 'CLEARED',
            },
          ],
          page: { next: 'cursor_123' },
        }),
      } as Response);
      
      const result = await client.getTransactions({
        from_date: '2023-01-01',
        to_date: '2023-12-31',
        merchant_name: 'Test Merchant',
        limit: 25,
      });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('txn_123');
      expect(result.page?.next).toBe('cursor_123');
    });
    
    it('should fetch single transaction by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'txn_123',
            amount: 100.50,
            merchant_name: 'Test Merchant',
            state: 'CLEARED',
          },
        }),
      } as Response);
      
      const result = await client.getTransaction('txn_123');
      
      expect(result.data.id).toBe('txn_123');
      expect(result.data.amount).toBe(100.50);
    });
  });
  
  describe('utility methods', () => {
    it('should return configuration without sensitive data', () => {
      const config = client.getConfig();
      
      expect(config).toEqual({
        baseURL: 'https://test-api.ramp.com',
        clientId: 'test_client_id',
        timeout: 5000,
        retries: 1,
      });
      expect(config).not.toHaveProperty('clientSecret');
    });
  });
});
