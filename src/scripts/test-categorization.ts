#!/usr/bin/env tsx

/**
 * Test script to demonstrate AI categorization functionality
 * Run with: npx tsx src/scripts/test-categorization.ts
 */

import { aiCategorization } from '../lib/ai/categorization';
import { mockTransactions } from '../lib/mock-data';

async function testCategorization() {
  console.log('🤖 Testing AI Categorization System\n');

  // Check service status
  const status = aiCategorization.getStatus();
  console.log('📊 Service Status:');
  console.log(`  - Initialized: ${status.initialized ? '✅' : '❌'}`);
  console.log(`  - Has API Key: ${status.hasApiKey ? '✅' : '❌'}`);
  console.log(`  - Rate Limited: ${status.rateLimited ? '🚫' : '✅'}`);
  console.log('');

  if (!status.initialized || !status.hasApiKey) {
    console.log('⚠️  AI Categorization is disabled. Testing fallback methods only.\n');
  }

  // Test single transaction categorization
  console.log('🔍 Testing Single Transaction Categorization:\n');
  
  for (let i = 0; i < Math.min(3, mockTransactions.length); i++) {
    const transaction = mockTransactions[i];
    console.log(`Transaction ${i + 1}: ${transaction.merchant_name} - $${transaction.amount}`);
    
    try {
      const result = await aiCategorization.categorizeTransaction(transaction);
      
      console.log(`  ✅ Category: ${result.category}`);
      console.log(`  📊 Confidence: ${Math.round(result.confidence * 100)}%`);
      console.log(`  🔧 Method: ${result.method}`);
      console.log(`  💭 Reasoning: ${result.reasoning}`);
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
      console.log('');
    }
  }

  // Test batch categorization
  console.log('📦 Testing Batch Categorization:\n');
  
  try {
    console.log(`Processing ${mockTransactions.length} transactions...`);
    
    const results = await aiCategorization.categorizeTransactionsBatch(
      mockTransactions,
      (completed, total) => {
        const percentage = Math.round((completed / total) * 100);
        process.stdout.write(`\r  Progress: ${completed}/${total} (${percentage}%)`);
      }
    );
    
    console.log('\n\n📈 Batch Results Summary:');
    console.log(`  Total Processed: ${results.size}`);
    
    // Calculate summary statistics
    const summary = {
      methods: {} as Record<string, number>,
      categories: {} as Record<string, number>,
      confidenceRanges: {
        high: 0,    // >= 0.8
        medium: 0,  // 0.6 - 0.8
        low: 0,     // < 0.6
      },
    };

    results.forEach((result) => {
      // Count methods
      summary.methods[result.method] = (summary.methods[result.method] || 0) + 1;
      
      // Count categories
      summary.categories[result.category] = (summary.categories[result.category] || 0) + 1;
      
      // Count confidence ranges
      if (result.confidence >= 0.8) {
        summary.confidenceRanges.high++;
      } else if (result.confidence >= 0.6) {
        summary.confidenceRanges.medium++;
      } else {
        summary.confidenceRanges.low++;
      }
    });

    console.log('\n  Methods Used:');
    Object.entries(summary.methods).forEach(([method, count]) => {
      console.log(`    ${method}: ${count} transactions`);
    });

    console.log('\n  Categories Assigned:');
    Object.entries(summary.categories).forEach(([category, count]) => {
      console.log(`    ${category}: ${count} transactions`);
    });

    console.log('\n  Confidence Distribution:');
    console.log(`    High (≥80%): ${summary.confidenceRanges.high} transactions`);
    console.log(`    Medium (60-80%): ${summary.confidenceRanges.medium} transactions`);
    console.log(`    Low (<60%): ${summary.confidenceRanges.low} transactions`);

    console.log('\n📋 Detailed Results:');
    results.forEach((result, transactionId) => {
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (transaction) {
        const confidence = Math.round(result.confidence * 100);
        console.log(`  ${transaction.merchant_name}: ${result.category} (${confidence}% via ${result.method})`);
      }
    });

  } catch (error) {
    console.log(`❌ Batch categorization failed: ${error}`);
  }

  console.log('\n✅ Categorization testing complete!');
}

// Error handling for the script
async function main() {
  try {
    await testCategorization();
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Only run if this script is called directly
if (require.main === module) {
  main();
}
