import OpenAI from 'openai';
import { Transaction } from '@/types';

// Standard expense categories for business expenses
export const EXPENSE_CATEGORIES = {
  'Office Supplies': {
    keywords: ['office', 'supplies', 'staples', 'paper', 'pen', 'folder', 'desk'],
    description: 'Office supplies and stationery'
  },
  'Software & SaaS': {
    keywords: ['software', 'saas', 'subscription', 'license', 'cloud', 'aws', 'google', 'microsoft', 'adobe'],
    description: 'Software licenses and SaaS subscriptions'
  },
  'Meals & Entertainment': {
    keywords: ['restaurant', 'food', 'coffee', 'lunch', 'dinner', 'starbucks', 'uber eats', 'doordash'],
    description: 'Business meals and entertainment'
  },
  'Travel & Transportation': {
    keywords: ['hotel', 'flight', 'uber', 'lyft', 'taxi', 'airbnb', 'airline', 'rental car'],
    description: 'Business travel and transportation'
  },
  'Marketing & Advertising': {
    keywords: ['marketing', 'advertising', 'facebook ads', 'google ads', 'promotion', 'campaign'],
    description: 'Marketing and advertising expenses'
  },
  'Professional Services': {
    keywords: ['legal', 'accounting', 'consulting', 'lawyer', 'accountant', 'advisor'],
    description: 'Professional and consulting services'
  },
  'Equipment & Hardware': {
    keywords: ['computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'hardware', 'electronics'],
    description: 'Computer equipment and hardware'
  },
  'Utilities & Internet': {
    keywords: ['internet', 'phone', 'electricity', 'utilities', 'telecom', 'wireless'],
    description: 'Utilities and communication services'
  },
  'Insurance': {
    keywords: ['insurance', 'premium', 'coverage', 'policy'],
    description: 'Business insurance premiums'
  },
  'Training & Education': {
    keywords: ['training', 'course', 'education', 'conference', 'seminar', 'workshop'],
    description: 'Employee training and education'
  },
  'Other': {
    keywords: [],
    description: 'Other business expenses'
  }
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

interface CategorizationResult {
  category: ExpenseCategory;
  confidence: number;
  reasoning: string;
  method: 'ai' | 'keyword' | 'mcc' | 'fallback';
}

interface CategorizationError {
  error: string;
  code: 'OPENAI_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'PARSING_ERROR' | 'UNKNOWN_ERROR';
  details?: unknown;
}

class AICategorizationService {
  private openai: OpenAI | null = null;
  private initialized = false;
  private rateLimitedUntil: Date | null = null;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OpenAI API key not found. AI categorization will be disabled.');
        return;
      }

      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      this.initialized = false;
    }
  }

  /**
   * Main categorization method with fallback strategies
   */
  async categorizeTransaction(transaction: Transaction): Promise<CategorizationResult> {
    // Strategy 1: Try AI categorization if available
    if (this.initialized && this.openai && !this.isRateLimited()) {
      try {
        const aiResult = await this.categorizeWithAI(transaction);
        if (aiResult) {
          return aiResult;
        }
      } catch (error) {
        console.warn('AI categorization failed, falling back to rule-based:', error);
        this.handleAIError(error);
      }
    }

    // Strategy 2: Keyword-based categorization
    const keywordResult = this.categorizeByKeywords(transaction);
    if (keywordResult.confidence > 0.7) {
      return keywordResult;
    }

    // Strategy 3: MCC code categorization
    const mccResult = this.categorizeByMCC(transaction);
    if (mccResult.confidence > 0.6) {
      return mccResult;
    }

    // Strategy 4: Return the best available result or fallback
    return keywordResult.confidence > mccResult.confidence ? keywordResult : mccResult;
  }

  /**
   * AI-powered categorization using OpenAI GPT
   */
  private async categorizeWithAI(transaction: Transaction): Promise<CategorizationResult | null> {
    if (!this.openai) return null;

    const prompt = this.buildCategorizationPrompt(transaction);
    
    try {
      const response = await this.makeOpenAIRequest(prompt);
      return this.parseAIResponse(response, 'ai');
    } catch (error) {
      throw this.createCategorizationError(error);
    }
  }

  /**
   * Make OpenAI API request with retry logic
   */
  private async makeOpenAIRequest(prompt: string, retryCount = 0): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at categorizing business expenses. You must respond with a valid JSON object containing:
            {
              "category": "one of the provided categories",
              "confidence": "number between 0 and 1",
              "reasoning": "brief explanation"
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      return content;
    } catch (error: any) {
      // Handle rate limiting
      if (error?.status === 429) {
        const retryAfter = error?.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.baseDelay * Math.pow(2, retryCount);
        
        this.rateLimitedUntil = new Date(Date.now() + delay);
        
        if (retryCount < this.maxRetries) {
          await this.sleep(delay);
          return this.makeOpenAIRequest(prompt, retryCount + 1);
        }
        throw new Error('Rate limited and max retries exceeded');
      }

      // Handle other retryable errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.makeOpenAIRequest(prompt, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Build categorization prompt for OpenAI
   */
  private buildCategorizationPrompt(transaction: Transaction): string {
    const categories = Object.keys(EXPENSE_CATEGORIES);
    
    return `Categorize this business transaction:

Merchant: ${transaction.merchant_name}
Amount: $${transaction.amount}
Description: ${transaction.merchant_descriptor || 'N/A'}
MCC: ${transaction.merchant_category_code} (${transaction.merchant_category_code_description})
${transaction.memo ? `Memo: ${transaction.memo}` : ''}

Available categories: ${categories.join(', ')}

Respond with a JSON object containing the category, confidence (0-1), and reasoning.`;
  }

  /**
   * Parse AI response and validate
   */
  private parseAIResponse(response: string, method: CategorizationResult['method']): CategorizationResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.category || !parsed.confidence || !parsed.reasoning) {
        throw new Error('Invalid response structure');
      }

      // Validate category exists
      if (!(parsed.category in EXPENSE_CATEGORIES)) {
        throw new Error(`Invalid category: ${parsed.category}`);
      }

      // Validate confidence is a number between 0 and 1
      const confidence = parseFloat(parsed.confidence);
      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        throw new Error(`Invalid confidence value: ${parsed.confidence}`);
      }

      return {
        category: parsed.category as ExpenseCategory,
        confidence,
        reasoning: parsed.reasoning,
        method,
      };
    } catch (error) {
      // Fallback parsing if JSON parsing fails
      return this.parseAIResponseFallback(response, method);
    }
  }

  /**
   * Fallback AI response parsing
   */
  private parseAIResponseFallback(response: string, method: CategorizationResult['method']): CategorizationResult {
    const categories = Object.keys(EXPENSE_CATEGORIES);
    const lowerResponse = response.toLowerCase();
    
    // Try to find a mentioned category
    for (const category of categories) {
      if (lowerResponse.includes(category.toLowerCase())) {
        return {
          category: category as ExpenseCategory,
          confidence: 0.6,
          reasoning: `AI response parsing fallback - detected "${category}"`,
          method,
        };
      }
    }

    return {
      category: 'Other',
      confidence: 0.3,
      reasoning: 'AI response parsing failed, using fallback',
      method: 'fallback',
    };
  }

  /**
   * Keyword-based categorization fallback
   */
  private categorizeByKeywords(transaction: Transaction): CategorizationResult {
    const text = [
      transaction.merchant_name,
      transaction.merchant_descriptor,
      transaction.memo,
      transaction.merchant_category_code_description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    let bestMatch: ExpenseCategory = 'Other';
    let bestScore = 0;
    let matchedKeywords: string[] = [];

    for (const [category, config] of Object.entries(EXPENSE_CATEGORIES)) {
      const keywords = config.keywords;
      let score = 0;
      const matched: string[] = [];

      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
          matched.push(keyword);
        }
      }

      // Normalize score by number of keywords
      const normalizedScore = keywords.length > 0 ? score / keywords.length : 0;

      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestMatch = category as ExpenseCategory;
        matchedKeywords = matched;
      }
    }

    return {
      category: bestMatch,
      confidence: Math.min(bestScore, 0.9), // Cap at 0.9 for keyword matching
      reasoning: matchedKeywords.length > 0 
        ? `Keyword match: ${matchedKeywords.join(', ')}`
        : 'No keyword matches found',
      method: 'keyword',
    };
  }

  /**
   * MCC code based categorization
   */
  private categorizeByMCC(transaction: Transaction): CategorizationResult {
    const mcc = transaction.merchant_category_code;
    const mccDescription = transaction.merchant_category_code_description?.toLowerCase() || '';

    // MCC to category mappings
    const mccMappings: Record<string, ExpenseCategory> = {
      '5734': 'Software & SaaS', // Computer Software Stores
      '5943': 'Office Supplies', // Stationery, Office Supplies
      '5814': 'Meals & Entertainment', // Fast Food Restaurants
      '5812': 'Meals & Entertainment', // Eating Places, Restaurants
      '4121': 'Travel & Transportation', // Taxicabs and Limousines
      '4411': 'Travel & Transportation', // Steamship and Cruise Lines
      '3351': 'Travel & Transportation', // Car Rental Agencies
      '7011': 'Travel & Transportation', // Hotels, Motels, Resorts
      '5541': 'Travel & Transportation', // Service Stations
      '7372': 'Software & SaaS', // Computer Programming Services
      '5045': 'Equipment & Hardware', // Computers, Computer Peripheral Equipment
      '4816': 'Utilities & Internet', // Computer Network/Information Services
      '4814': 'Utilities & Internet', // Telecommunication Services
    };

    // Check direct MCC mapping
    if (mcc && mccMappings[mcc]) {
      return {
        category: mccMappings[mcc],
        confidence: 0.8,
        reasoning: `MCC code mapping: ${mcc} (${transaction.merchant_category_code_description})`,
        method: 'mcc',
      };
    }

    // Check MCC description keywords
    const descriptionMappings: Array<[string, ExpenseCategory]> = [
      ['software', 'Software & SaaS'],
      ['computer', 'Equipment & Hardware'],
      ['restaurant', 'Meals & Entertainment'],
      ['hotel', 'Travel & Transportation'],
      ['office', 'Office Supplies'],
      ['telecom', 'Utilities & Internet'],
      ['insurance', 'Insurance'],
    ];

    for (const [keyword, category] of descriptionMappings) {
      if (mccDescription.includes(keyword)) {
        return {
          category,
          confidence: 0.7,
          reasoning: `MCC description match: "${keyword}" in "${transaction.merchant_category_code_description}"`,
          method: 'mcc',
        };
      }
    }

    return {
      category: 'Other',
      confidence: 0.3,
      reasoning: `No MCC mapping found for code: ${mcc}`,
      method: 'mcc',
    };
  }

  /**
   * Utility methods
   */
  private isRateLimited(): boolean {
    return this.rateLimitedUntil ? Date.now() < this.rateLimitedUntil.getTime() : false;
  }

  private isRetryableError(error: any): boolean {
    return (
      error?.status >= 500 || // Server errors
      error?.code === 'ECONNRESET' || // Network errors
      error?.code === 'ETIMEDOUT'
    );
  }

  private handleAIError(error: any) {
    if (error?.status === 429) {
      console.warn('OpenAI rate limit reached');
    } else if (error?.status >= 500) {
      console.warn('OpenAI server error:', error.status);
    } else {
      console.warn('OpenAI error:', error?.message || error);
    }
  }

  private createCategorizationError(error: any): CategorizationError {
    if (error?.status === 429) {
      return {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        details: error,
      };
    } else if (error?.status >= 500) {
      return {
        error: 'OpenAI server error',
        code: 'OPENAI_ERROR',
        details: error,
      };
    } else if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return {
        error: 'Network error',
        code: 'NETWORK_ERROR',
        details: error,
      };
    } else {
      return {
        error: error?.message || 'Unknown error',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch categorization for multiple transactions
   */
  async categorizeTransactionsBatch(
    transactions: Transaction[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, CategorizationResult>> {
    const results = new Map<string, CategorizationResult>();
    const total = transactions.length;

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      try {
        const result = await this.categorizeTransaction(transaction);
        results.set(transaction.id, result);
        
        if (onProgress) {
          onProgress(i + 1, total);
        }

        // Add small delay to avoid overwhelming the API
        if (this.initialized && i < transactions.length - 1) {
          await this.sleep(100);
        }
      } catch (error) {
        console.error(`Failed to categorize transaction ${transaction.id}:`, error);
        
        // Set fallback result
        results.set(transaction.id, {
          category: 'Other',
          confidence: 0.1,
          reasoning: 'Categorization failed',
          method: 'fallback',
        });
      }
    }

    return results;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      rateLimited: this.isRateLimited(),
      rateLimitedUntil: this.rateLimitedUntil,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    };
  }
}

// Export singleton instance
export const aiCategorization = new AICategorizationService();

// Export types
export type { CategorizationResult, CategorizationError };
