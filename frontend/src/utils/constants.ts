// Stellar Network Configuration
export const STELLAR_NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    horizonUrl: 'https://horizon.stellar.org',
    friendbotUrl: null,
  },
} as const;

// Contract Configuration
export const CONTRACT_CONFIG = {
  // Portfolio Rebalancer Contract Address
  contractId: 'CC24ARML7LFECY4UZONMEJMGNAANIANCJ5J7KWLDTBHWRGXRHDOVG3LG',
  
  // Default settings
  defaultDriftThreshold: 5, // 5% drift threshold
  defaultRebalanceInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Gas limits
  gasLimit: {
    createPortfolio: 1000000,
    rebalance: 2000000,
    updateThreshold: 500000,
    getPortfolio: 100000,
  },
} as const;

// Supported Stellar Assets
export const STELLAR_ASSETS = [
  {
    code: 'XLM',
    issuer: 'native',
    name: 'Stellar Lumens',
    icon: '⭐',
    decimals: 7,
    description: 'Native Stellar currency',
  },
  {
    code: 'USDC',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    name: 'USD Coin',
    icon: '💵',
    decimals: 7,
    description: 'USD-pegged stablecoin',
  },
  {
    code: 'AQUA',
    issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    name: 'Aquarius',
    icon: '🌊',
    decimals: 7,
    description: 'Aquarius governance token',
  },
  {
    code: 'yXLM',
    issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
    name: 'Yield XLM',
    icon: '📈',
    decimals: 7,
    description: 'Yield-bearing XLM token',
  },
  {
    code: 'USDT',
    issuer: 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZCCVT6N',
    name: 'Tether USD',
    icon: '🪙',
    decimals: 7,
    description: 'Tether USD stablecoin',
  },
  {
    code: 'BTC',
    issuer: 'GBMDRY3FNIMI7KIXI4NKWD6UDTSQMFMQCZJS6IGZQ6A764UN7G5QXOPE',
    name: 'Bitcoin',
    icon: '₿',
    decimals: 7,
    description: 'Bitcoin wrapped on Stellar',
  },
] as const;

// Default Portfolio Allocations
export const DEFAULT_ALLOCATIONS = [
  { assetCode: 'XLM', percentage: 40 },
  { assetCode: 'USDC', percentage: 30 },
  { assetCode: 'AQUA', percentage: 20 },
  { assetCode: 'yXLM', percentage: 10 },
] as const;

// Price Feed Configuration
export const PRICE_FEED_CONFIG = {
  // Reflector Oracle endpoints
  reflector: {
    testnet: 'https://reflector-testnet.stellar.org',
    mainnet: 'https://reflector.stellar.org',
  },
  
  // Fallback price sources
  fallback: {
    coingecko: 'https://api.coingecko.com/api/v3/simple/price',
    stellarExpert: 'https://api.stellar.expert/explorer/public',
  },
  
  // Update intervals
  updateInterval: 5 * 60 * 1000, // 5 minutes
  staleThreshold: 10 * 60 * 1000, // 10 minutes
  
  // Supported assets for price feeds
  supportedAssets: ['XLM', 'USDC', 'AQUA', 'yXLM', 'USDT', 'BTC'],
} as const;

// UI Configuration
export const UI_CONFIG = {
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // Toast notifications
  toast: {
    duration: 5000,
    position: 'top-right',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  wallet: {
    notInstalled: 'Freighter wallet not found. Please install the Freighter browser extension.',
    notConnected: 'Wallet not connected. Please connect your Freighter wallet.',
    connectionFailed: 'Failed to connect wallet. Please try again.',
    transactionFailed: 'Transaction failed. Please check your wallet and try again.',
    insufficientFunds: 'Insufficient funds for this transaction.',
  },
  contract: {
    notDeployed: 'Contract not deployed on this network.',
    callFailed: 'Contract call failed. Please try again.',
    invalidParameters: 'Invalid parameters provided to contract.',
  },
  portfolio: {
    notFound: 'Portfolio not found.',
    alreadyExists: 'Portfolio already exists for this wallet.',
    invalidAllocation: 'Invalid allocation percentages. Total must equal 100%.',
    driftThresholdExceeded: 'Drift threshold exceeded. Rebalancing required.',
  },
  network: {
    connectionFailed: 'Failed to connect to Stellar network.',
    transactionTimeout: 'Transaction timed out. Please try again.',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  wallet: {
    connected: 'Wallet connected successfully!',
    disconnected: 'Wallet disconnected.',
  },
  portfolio: {
    created: 'Portfolio created successfully!',
    updated: 'Portfolio updated successfully!',
    rebalanced: 'Portfolio rebalanced successfully!',
  },
  transaction: {
    submitted: 'Transaction submitted successfully!',
    confirmed: 'Transaction confirmed!',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  portfolio: {
    minAllocations: 2,
    maxAllocations: 10,
    minPercentage: 1,
    maxPercentage: 100,
    totalPercentage: 100,
    minDriftThreshold: 1,
    maxDriftThreshold: 50,
  },
  transaction: {
    minAmount: 0.0000001, // 1 stroop
    maxAmount: 1000000000, // 1 billion XLM
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Stellar Horizon API
  horizon: {
    testnet: 'https://horizon-testnet.stellar.org',
    mainnet: 'https://horizon.stellar.org',
  },
  
  // Stellar Expert API
  stellarExpert: {
    testnet: 'https://api.stellar.expert/explorer/testnet',
    mainnet: 'https://api.stellar.expert/explorer/public',
  },
  
  // CoinGecko API for fallback prices
  coingecko: 'https://api.coingecko.com/api/v3',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enableMainnet: false, // Set to true when ready for mainnet
  enableAdvancedFeatures: true,
  enablePriceAlerts: false,
  enablePortfolioAnalytics: true,
  enableSocialFeatures: false,
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;