/**
 * eBay API Configuration Example
 *
 * Copy this file to ebay.config.ts and fill in your actual credentials
 * DO NOT commit ebay.config.ts to git (it's in .gitignore)
 */

import type { EbayConfig } from './ebay.types';

const config: EbayConfig = {
  // Replace with your actual Client ID from https://developer.ebay.com/
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE',

  // Replace with your actual Client Secret from https://developer.ebay.com/
  CLIENT_SECRET: 'YOUR_CLIENT_SECRET_HERE',

  // Use 'SANDBOX' for testing, 'PRODUCTION' for live data
  ENVIRONMENT: 'PRODUCTION',
};

export default config;
