/**
 * Utility functions for fetching merchant logos and brand images
 */

// Predefined logo mappings for common merchants
const MERCHANT_LOGOS: Record<string, string> = {
  // Tech Companies
  'amazon': 'https://logo.clearbit.com/amazon.com',
  'amazon web services': 'https://logo.clearbit.com/aws.amazon.com',
  'aws': 'https://logo.clearbit.com/aws.amazon.com',
  'microsoft': 'https://logo.clearbit.com/microsoft.com',
  'google': 'https://logo.clearbit.com/google.com',
  'apple': 'https://logo.clearbit.com/apple.com',
  'adobe': 'https://logo.clearbit.com/adobe.com',
  'salesforce': 'https://logo.clearbit.com/salesforce.com',
  'slack': 'https://logo.clearbit.com/slack.com',
  'zoom': 'https://logo.clearbit.com/zoom.us',
  'dropbox': 'https://logo.clearbit.com/dropbox.com',
  'github': 'https://logo.clearbit.com/github.com',
  
  // Food & Restaurants
  'starbucks': 'https://logo.clearbit.com/starbucks.com',
  'mcdonald': 'https://logo.clearbit.com/mcdonalds.com',
  'mcdonalds': 'https://logo.clearbit.com/mcdonalds.com',
  'chipotle': 'https://logo.clearbit.com/chipotle.com',
  'subway': 'https://logo.clearbit.com/subway.com',
  'dominos': 'https://logo.clearbit.com/dominos.com',
  'pizza hut': 'https://logo.clearbit.com/pizzahut.com',
  'kfc': 'https://logo.clearbit.com/kfc.com',
  'taco bell': 'https://logo.clearbit.com/tacobell.com',
  'dunkin': 'https://logo.clearbit.com/dunkindonuts.com',
  'panera': 'https://logo.clearbit.com/panerabread.com',
  
  // Transportation
  'uber': 'https://logo.clearbit.com/uber.com',
  'lyft': 'https://logo.clearbit.com/lyft.com',
  'delta': 'https://logo.clearbit.com/delta.com',
  'american airlines': 'https://logo.clearbit.com/aa.com',
  'united airlines': 'https://logo.clearbit.com/united.com',
  'southwest': 'https://logo.clearbit.com/southwest.com',
  'jetblue': 'https://logo.clearbit.com/jetblue.com',
  'hertz': 'https://logo.clearbit.com/hertz.com',
  'enterprise': 'https://logo.clearbit.com/enterprise.com',
  'avis': 'https://logo.clearbit.com/avis.com',
  
  // Hotels
  'marriott': 'https://logo.clearbit.com/marriott.com',
  'hilton': 'https://logo.clearbit.com/hilton.com',
  'hyatt': 'https://logo.clearbit.com/hyatt.com',
  'holiday inn': 'https://logo.clearbit.com/ihg.com',
  'sheraton': 'https://logo.clearbit.com/marriott.com',
  'westin': 'https://logo.clearbit.com/marriott.com',
  'doubletree': 'https://logo.clearbit.com/hilton.com',
  'courtyard': 'https://logo.clearbit.com/marriott.com',
  
  // Retail
  'walmart': 'https://logo.clearbit.com/walmart.com',
  'target': 'https://logo.clearbit.com/target.com',
  'home depot': 'https://logo.clearbit.com/homedepot.com',
  'homedepot': 'https://logo.clearbit.com/homedepot.com',
  'lowes': 'https://logo.clearbit.com/lowes.com',
  'costco': 'https://logo.clearbit.com/costco.com',
  'best buy': 'https://logo.clearbit.com/bestbuy.com',
  'bestbuy': 'https://logo.clearbit.com/bestbuy.com',
  'staples': 'https://logo.clearbit.com/staples.com',
  'office depot': 'https://logo.clearbit.com/officedepot.com',
  'officedepot': 'https://logo.clearbit.com/officedepot.com',
  'cvs': 'https://logo.clearbit.com/cvs.com',
  'walgreens': 'https://logo.clearbit.com/walgreens.com',
  
  // Gas Stations
  'shell': 'https://logo.clearbit.com/shell.com',
  'exxon': 'https://logo.clearbit.com/exxonmobil.com',
  'bp': 'https://logo.clearbit.com/bp.com',
  'chevron': 'https://logo.clearbit.com/chevron.com',
  'mobil': 'https://logo.clearbit.com/exxonmobil.com',
  'texaco': 'https://logo.clearbit.com/texaco.com',
  
  // Financial Services
  'paypal': 'https://logo.clearbit.com/paypal.com',
  'stripe': 'https://logo.clearbit.com/stripe.com',
  'square': 'https://logo.clearbit.com/squareup.com',
  'venmo': 'https://logo.clearbit.com/venmo.com',
  'american express': 'https://logo.clearbit.com/americanexpress.com',
  'visa': 'https://logo.clearbit.com/visa.com',
  'mastercard': 'https://logo.clearbit.com/mastercard.com',
  
  // Other Common Merchants
  'fedex': 'https://logo.clearbit.com/fedex.com',
  'ups': 'https://logo.clearbit.com/ups.com',
  'usps': 'https://logo.clearbit.com/usps.com',
  'netflix': 'https://logo.clearbit.com/netflix.com',
  'spotify': 'https://logo.clearbit.com/spotify.com',
  'discord': 'https://logo.clearbit.com/discord.com',
  'linkedin': 'https://logo.clearbit.com/linkedin.com',
  'twitter': 'https://logo.clearbit.com/twitter.com',
  'facebook': 'https://logo.clearbit.com/facebook.com',
  'instagram': 'https://logo.clearbit.com/instagram.com',
};

// Domain mappings for merchants
const MERCHANT_DOMAINS: Record<string, string> = {
  'amazon': 'amazon.com',
  'microsoft': 'microsoft.com',
  'google': 'google.com',
  'apple': 'apple.com',
  'starbucks': 'starbucks.com',
  'uber': 'uber.com',
  'home depot': 'homedepot.com',
  'walmart': 'walmart.com',
  'target': 'target.com',
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
};

/**
 * Get merchant logo URL by merchant name
 */
export function getMerchantLogo(merchantName: string): string | null {
  if (!merchantName) return null;
  
  const normalizedName = merchantName.toLowerCase().trim();
  
  // Check direct mapping first
  if (MERCHANT_LOGOS[normalizedName]) {
    return MERCHANT_LOGOS[normalizedName];
  }
  
  // Check for partial matches
  for (const [key, logoUrl] of Object.entries(MERCHANT_LOGOS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return logoUrl;
    }
  }
  
  // Try to construct Clearbit URL from domain mapping
  if (MERCHANT_DOMAINS[normalizedName]) {
    return `https://logo.clearbit.com/${MERCHANT_DOMAINS[normalizedName]}`;
  }
  
  // Try to guess domain for common patterns
  const guessedDomain = guessMerchantDomain(normalizedName);
  if (guessedDomain) {
    return `https://logo.clearbit.com/${guessedDomain}`;
  }
  
  return null;
}

/**
 * Guess merchant domain from name
 */
function guessMerchantDomain(merchantName: string): string | null {
  const name = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Common domain patterns
  const commonDomains = [
    `${name}.com`,
    `${name}.co`,
    `${name}.org`,
  ];
  
  // For well-known companies, return the most likely domain
  const knownPatterns: Record<string, string> = {
    'mcdonalds': 'mcdonalds.com',
    'homedepot': 'homedepot.com',
    'bestbuy': 'bestbuy.com',
    'officedepot': 'officedepot.com',
    'americanexpress': 'americanexpress.com',
    'deltaairlines': 'delta.com',
    'unitedairlines': 'united.com',
    'americanairlines': 'aa.com',
  };
  
  if (knownPatterns[name]) {
    return knownPatterns[name];
  }
  
  // Return the most likely .com domain
  return `${name}.com`;
}

/**
 * Get fallback initials for merchant
 */
export function getMerchantInitials(merchantName: string): string {
  if (!merchantName) return '?';
  
  const words = merchantName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Get merchant color based on name (for consistent theming)
 */
export function getMerchantColor(merchantName: string): string {
  if (!merchantName) return '#6B7280'; // gray-500
  
  const colors = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#EAB308', // yellow-500
    '#84CC16', // lime-500
    '#22C55E', // green-500
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#0EA5E9', // sky-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#D946EF', // fuchsia-500
    '#EC4899', // pink-500
    '#F43F5E', // rose-500
  ];
  
  // Generate consistent color based on merchant name
  let hash = 0;
  for (let i = 0; i < merchantName.length; i++) {
    hash = merchantName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
