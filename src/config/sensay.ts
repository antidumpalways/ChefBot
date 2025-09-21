/**
 * Sensay Configuration for ChefBot Pro
 * Centralized configuration for all Sensay API settings
 */

export const SENSAY_CONFIG = {
  // API Configuration
  BASE_URL: 'https://api.sensay.io',
  API_VERSION: '2025-03-25',

  // ChefBot Pro Credentials
  ORGANIZATION_SECRET: 'f4369f9a7c4c4a2e84847fcf54f617ff78aace25df7f14388708ca392d788cff',
  ORGANIZATION_ID: '9702a81b-b728-47c6-9b18-771b1a3ceeb5',
  REPLICA_UUID: 'a05d0bab-6cce-483f-9bfd-f267435b3d5b',

  // Default User ID for testing
  DEFAULT_USER_ID: 'sensay-user',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_LIMIT: 20,
  
  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Rate limiting
  REQUEST_DELAY: 100, // ms between requests
} as const;

// Environment-specific overrides
export const getSensayConfig = () => {
  return {
    ...SENSAY_CONFIG,
    // Override with environment variables if available
    ORGANIZATION_SECRET: process.env.NEXT_PUBLIC_SENSAY_API_KEY || SENSAY_CONFIG.ORGANIZATION_SECRET,
    REPLICA_UUID: process.env.NEXT_PUBLIC_REPLICA_UUID || SENSAY_CONFIG.REPLICA_UUID,
    ORGANIZATION_ID: process.env.NEXT_PUBLIC_ORGANIZATION_ID || SENSAY_CONFIG.ORGANIZATION_ID,
  };
};
