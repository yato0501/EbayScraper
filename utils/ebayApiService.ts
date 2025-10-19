import axios, { AxiosResponse } from 'axios';
import type { EbayConfig } from '../config/ebay.types';

/**
 * Load eBay configuration from config file, fallback to dummy credentials if not found
 */
const loadEbayConfig = (): EbayConfig => {
  try {
    // Try to load actual config file (not committed to git)
    const actualConfig = require('../config/ebay.config').default;
    return actualConfig;
  } catch (error) {
    // Fallback to dummy credentials if config file doesn't exist
    console.warn('eBay config file not found, using dummy credentials. Create config/ebay.config.ts to configure.');
    return {
      CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
      CLIENT_SECRET: 'YOUR_CLIENT_SECRET_HERE',
      ENVIRONMENT: 'PRODUCTION',
    };
  }
};

const EBAY_CONFIG: EbayConfig = loadEbayConfig();

const EBAY_OAUTH_URL = EBAY_CONFIG.ENVIRONMENT === 'SANDBOX'
  ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
  : 'https://api.ebay.com/identity/v1/oauth2/token';

const EBAY_BROWSE_URL = EBAY_CONFIG.ENVIRONMENT === 'SANDBOX'
  ? 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search'
  : 'https://api.ebay.com/buy/browse/v1/item_summary/search';

/**
 * eBay item interface matching API response
 */
export interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  image?: {
    imageUrl: string;
  };
  itemWebUrl: string;
  condition?: string;
  seller?: {
    username: string;
    feedbackPercentage: string;
  };
  shippingOptions?: Array<{
    shippingCost?: {
      value: string;
      currency: string;
    };
  }>;
}

/**
 * eBay search response interface
 */
interface EbaySearchResponse {
  total: number;
  itemSummaries?: EbayItem[];
  warnings?: Array<{
    message: string;
  }>;
}

/**
 * OAuth token cache
 */
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth access token for eBay API
 */
const getAccessToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const credentials: string = Buffer.from(
      `${EBAY_CONFIG.CLIENT_ID}:${EBAY_CONFIG.CLIENT_SECRET}`
    ).toString('base64');

    const response: AxiosResponse<{
      access_token: string;
      expires_in: number;
    }> = await axios.post(
      EBAY_OAUTH_URL,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    cachedToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return cachedToken;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`eBay OAuth failed: ${error.response?.data?.error_description || error.message}`);
    }
    throw new Error('Failed to get eBay access token');
  }
};

/**
 * Search eBay for items matching a query
 * @param query - Search query (e.g., "2015 CHEVROLET IMPALA")
 * @param excludeKeywords - Array of keywords to exclude from results
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of eBay items
 */
export const searchEbay = async (
  query: string,
  excludeKeywords: string[] = [],
  limit: number = 20
): Promise<EbayItem[]> => {
  try {
    // Get access token
    const token: string = await getAccessToken();

    // Build query with exclusions
    let searchQuery: string = query;
    if (excludeKeywords.length > 0) {
      // Add exclusions using eBay's negative keyword syntax
      const exclusions: string = excludeKeywords.map((kw: string) => `-${kw}`).join(' ');
      searchQuery = `${query} ${exclusions}`;
    }

    // Make API request
    const response: AxiosResponse<EbaySearchResponse> = await axios.get(EBAY_BROWSE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', // US marketplace
      },
      params: {
        q: searchQuery,
        limit: limit.toString(),
        sort: 'price', // Sort by price descending (highest first)
        filter: 'buyingOptions:{FIXED_PRICE|AUCTION}', // Include both Buy It Now and auctions
      },
    });

    return response.data.itemSummaries || [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMsg: string = error.response?.data?.errors?.[0]?.message || error.message;
      throw new Error(`eBay search failed: ${errorMsg}`);
    }
    throw new Error('Failed to search eBay');
  }
};

/**
 * Check if eBay credentials are configured
 */
export const isEbayConfigured = (): boolean => {
  return (
    EBAY_CONFIG.CLIENT_ID !== 'YOUR_CLIENT_ID_HERE' &&
    EBAY_CONFIG.CLIENT_SECRET !== 'YOUR_CLIENT_SECRET_HERE'
  );
};
