// Type definitions for the Portfolio Rebalancer application

// Wallet State
export interface WalletState {
  isConnected: boolean;
  publicKey?: string;
  network: 'testnet' | 'mainnet';
  balances: Asset[];
}

// Asset Information
export interface Asset {
  code: string;
  issuer?: string;
  balance: number;
  value?: number;
  percentage?: number;
}

// Portfolio Information
export interface Portfolio {
  id: string;
  name: string;
  owner: string;
  allocations: Allocation[];
  driftThreshold: number;
  lastRebalanced?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Allocation
export interface Allocation {
  assetCode: string;
  percentage: number;
  targetValue?: number;
  currentValue?: number;
}

// Price Data
export interface PriceData {
  assetCode: string;
  price: number;
  timestamp: number;
  source: 'reflector' | 'fallback';
  change24h?: number;
}

// Transaction Information
export interface Transaction {
  id: string;
  type: 'create_portfolio' | 'rebalance' | 'update_threshold' | 'transfer';
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  amount?: number;
  assetCode?: string;
  timestamp: Date;
  gasUsed?: number;
  error?: string;
}

// Rebalancing Trade
export interface RebalancingTrade {
  assetCode: string;
  action: 'buy' | 'sell';
  amount: number;
  percentage: number;
  price: number;
  estimatedSlippage?: number;
}

// Portfolio Performance Metrics
export interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  dailyReturn: number;
  annualizedReturn: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  volatility?: number;
}

// Network Configuration
export interface NetworkConfig {
  networkPassphrase: string;
  horizonUrl: string;
  friendbotUrl?: string;
}

// Contract Configuration
export interface ContractConfig {
  contractId: string;
  gasLimit: {
    createPortfolio: number;
    rebalance: number;
    updateThreshold: number;
    getPortfolio: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: Date;
}

// Price Feed Response
export interface PriceFeedResponse {
  prices: Array<{
    asset: string;
    price: string;
    timestamp: number;
  }>;
}

// Stellar Account Information
export interface StellarAccount {
  accountId: string;
  balances: Array<{
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    balance: string;
    limit?: string;
  }>;
  sequence: string;
  subentry_count: number;
}

// Soroban Contract Types
export interface SorobanAssetInfo {
  code: string;
  issuer?: string;
  decimals: number;
}

export interface SorobanPortfolio {
  id: string;
  owner: string;
  allocations: Array<{
    asset: SorobanAssetInfo;
    percentage: number;
  }>;
  drift_threshold: number;
  last_rebalanced?: number;
  created_at: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  id: string;
}

// Form Types
export interface PortfolioFormData {
  name: string;
  allocations: Array<{
    assetCode: string;
    percentage: number;
  }>;
  driftThreshold: number;
}

export interface RebalanceFormData {
  portfolioId: string;
  forceRebalance: boolean;
  slippageTolerance: number;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PortfolioChartData {
  totalValue: ChartDataPoint[];
  allocations: Record<string, ChartDataPoint[]>;
  performance: ChartDataPoint[];
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  network: 'testnet' | 'mainnet';
  notifications: {
    rebalanceAlerts: boolean;
    priceAlerts: boolean;
    transactionUpdates: boolean;
  };
  display: {
    currency: string;
    dateFormat: string;
    numberFormat: string;
  };
}

// Export all types as a namespace for easier imports
export * from './index';