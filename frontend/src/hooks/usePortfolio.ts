'use client';

import { useState, useEffect, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Asset, Portfolio } from '../types';
import { STELLAR_NETWORKS } from '../utils/constants';
import { usePrices } from './usePrices';

interface UsePortfolioReturn {
  portfolio: Portfolio | null;
  balances: Asset[];
  isLoading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  lastUpdated: Date | null;
  priceError: string | null;
  pricesLastUpdated: Date | null;
}

interface UsePortfolioProps {
  publicKey?: string;
  network?: 'testnet' | 'mainnet';
}

// Fallback prices when Reflector Oracle is unavailable
const FALLBACK_PRICES: Record<string, number> = {
  'XLM': 0.12,
  'USDC': 1.00,
  'AQUA': 0.05,
  'yXLM': 0.13,
  'default': 0.10
};

export function usePortfolio({ publicKey, network = 'testnet' }: UsePortfolioProps): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [balances, setBalances] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Use prices hook for real-time price data with fixed asset codes
  const { 
    prices, 
    isLoading: isPricesLoading, 
    error: priceError, 
    lastUpdated: pricesLastUpdated,
    refreshPrices 
  } = usePrices(['XLM', 'USDC', 'AQUA', 'yXLM', 'USDT', 'BTC']); // Fixed asset codes to prevent re-renders

  // Create Stellar server instance
  const getServer = useCallback(() => {
    const networkConfig = network === 'mainnet' ? STELLAR_NETWORKS.MAINNET : STELLAR_NETWORKS.TESTNET;
    // @ts-ignore - Temporary fix for SDK compatibility
    return new StellarSdk.Server(networkConfig.horizonUrl);
  }, [network]);

  // Format asset code for display
  const formatAssetCode = (asset: any): string => {
    if (asset.asset_type === 'native') {
      return 'XLM';
    }
    return asset.asset_code || 'Unknown';
  };

  // Get asset name for display
  const getAssetName = (assetCode: string, issuer?: string): string => {
    const assetNames: Record<string, string> = {
      'XLM': 'Stellar Lumens',
      'USDC': 'USD Coin',
      'AQUA': 'Aquarius',
      'yXLM': 'Yield XLM',
      'SRT': 'Stellar Reference Token'
    };
    return assetNames[assetCode] || `${assetCode} Token`;
  };

  // Get real-time price for asset with fallback
  const getAssetPrice = useCallback((assetCode: string): number => {
    // First try to get from Reflector Oracle prices
    if (prices[assetCode]) {
      return prices[assetCode].price;
    }
    // Fall back to static prices if Reflector Oracle unavailable
    return FALLBACK_PRICES[assetCode] || FALLBACK_PRICES.default;
  }, [prices]);

  // Parse and format account balances
  const parseAccountBalances = useCallback((accountData: any): { assets: Asset[], assetCodes: string[] } => {
    const assets: Asset[] = [];
    const foundAssetCodes: string[] = [];

    accountData.balances.forEach((balance: any) => {
      try {
        // Skip very small balances to reduce noise
        const balanceAmount = parseFloat(balance.balance);
        if (balanceAmount < 0.0000001) return;

        let assetCode: string;
        let issuer: string | undefined;

        if (balance.asset_type === 'native') {
          assetCode = 'XLM';
          issuer = undefined;
        } else if (balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12') {
          const assetBalance = balance as any;
          assetCode = assetBalance.asset_code;
          issuer = assetBalance.asset_issuer;
        } else {
          return; // Skip unknown asset types
        }

        foundAssetCodes.push(assetCode);
        const price = getAssetPrice(assetCode);
        
        assets.push({
          code: assetCode,
          issuer,
          name: getAssetName(assetCode, issuer),
          balance: balanceAmount,
          price
        });
      } catch (err) {
        console.warn('Error parsing balance:', balance, err);
      }
    });

    // Sort by value (balance * price) descending
    const sortedAssets = assets.sort((a, b) => (b.balance * b.price) - (a.balance * a.price));
    
    return { assets: sortedAssets, assetCodes: foundAssetCodes };
  }, [getAssetPrice, getAssetName]);

  // Calculate portfolio metrics
  const calculatePortfolio = useCallback((assets: Asset[]): Portfolio => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
    
    const allocations = assets.map(asset => {
      const currentValue = asset.balance * asset.price;
      const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      
      return {
        assetCode: asset.code,
        targetPercentage: 0, // Will be set by user preferences
        currentPercentage,
        drift: 0 // Will be calculated when target is set
      };
    });

    return {
      totalValue,
      balances: assets,
      allocations
    };
  }, []);

  // Fetch account data from Horizon
  const fetchAccountData = useCallback(async (accountId: string): Promise<void> => {
    if (!accountId) return;

    setIsLoading(true);
    setError(null);

    try {
      const server = getServer();
      
      // Fetch account data
      const accountData = await server.accounts().accountId(accountId).call();
      
      // Parse balances and extract asset codes
      const { assets: parsedBalances } = parseAccountBalances(accountData);
      
      // Calculate portfolio metrics
      const portfolioData = calculatePortfolio(parsedBalances);
      
      setBalances(parsedBalances);
      setPortfolio(portfolioData);
      setLastUpdated(new Date());
      
    } catch (err: any) {
      console.error('Error fetching account data:', err);
      
      // Handle specific Stellar errors
      if (err.response?.status === 404) {
        setError('Account not found. This account may not be activated on the Stellar network.');
      } else if (err.response?.status >= 500) {
        setError('Stellar network error. Please try again later.');
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to fetch account data. Please try again.');
      }
      
      // Clear data on error
      setBalances([]);
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  }, [getServer, parseAccountBalances, calculatePortfolio]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async (): Promise<void> => {
    if (publicKey) {
      await fetchAccountData(publicKey);
    }
  }, [publicKey, fetchAccountData]);

  // Fetch data when publicKey changes
  useEffect(() => {
    if (publicKey) {
      fetchAccountData(publicKey);
    } else {
      // Clear data when wallet disconnects
      setBalances([]);
      setPortfolio(null);
      setError(null);
      setLastUpdated(null);
    }
  }, [publicKey, fetchAccountData]);

  // Recalculate portfolio when prices update
  useEffect(() => {
    if (balances.length > 0 && Object.keys(prices).length > 0) {
      // Update asset prices with latest data
      const updatedBalances = balances.map(asset => ({
        ...asset,
        price: getAssetPrice(asset.code)
      }));
      
      // Recalculate portfolio with new prices
      const updatedPortfolio = calculatePortfolio(updatedBalances);
      
      setBalances(updatedBalances);
      setPortfolio(updatedPortfolio);
    }
  }, [prices, balances, getAssetPrice, calculatePortfolio]);

  // Force refresh function for post-transaction updates
  const forceRefresh = useCallback(async () => {
    console.log('Force refreshing portfolio data after transaction...');
    
    // Clear current data
    setPortfolio(null);
    setBalances([]);
    setError(null);
    
    // Refresh both portfolio and prices
    await Promise.all([
      refreshPortfolio(),
      refreshPrices()
    ]);
    
    console.log('Portfolio force refresh completed');
  }, [refreshPortfolio, refreshPrices]);

  return {
    portfolio,
    balances,
    isLoading: isLoading || isPricesLoading,
    error,
    refreshPortfolio,
    forceRefresh,
    lastUpdated,
    priceError,
    pricesLastUpdated
  };
}
