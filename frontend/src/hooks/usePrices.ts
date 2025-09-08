'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PRICE_FEED_CONFIG } from '../utils/constants';

interface PriceData {
  price: number;
  timestamp: number;
  source: 'reflector' | 'fallback';
}

interface UsePricesReturn {
  prices: Record<string, PriceData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
}

// Fallback prices (in case Reflector Oracle is unavailable)
const FALLBACK_PRICES: Record<string, number> = {
  XLM: 0.12,
  USDC: 1.00,
  AQUA: 0.05,
  yXLM: 0.12,
  USDT: 1.00,
  BTC: 45000,
};

export function usePrices(assetCodes: string[] = ['XLM', 'USDC', 'AQUA', 'yXLM']): UsePricesReturn {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchPricesRef = useRef<() => Promise<void>>();

  // Fetch prices from Reflector Oracle
  const fetchReflectorPrices = useCallback(async (): Promise<Record<string, PriceData>> => {
    const reflectorUrl = PRICE_FEED_CONFIG.reflector.testnet; // Using testnet for now
    const result: Record<string, PriceData> = {};

    try {
      // Try to fetch from Reflector Oracle
      const response = await fetch(`${reflectorUrl}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: assetCodes.map(code => ({ asset: code })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Process Reflector Oracle response
        if (data.prices && Array.isArray(data.prices)) {
          data.prices.forEach((priceInfo: any) => {
            if (priceInfo.asset && priceInfo.price) {
              result[priceInfo.asset] = {
                price: parseFloat(priceInfo.price),
                timestamp: Date.now(),
                source: 'reflector',
              };
            }
          });
        }
      }
    } catch (err) {
      console.warn('Reflector Oracle unavailable:', err);
    }

    return result;
  }, [assetCodes]);

  // Fetch fallback prices from CoinGecko
  const fetchFallbackPrices = useCallback(async (): Promise<Record<string, PriceData>> => {
    const result: Record<string, PriceData> = {};

    try {
      // Map Stellar assets to CoinGecko IDs
      const coinGeckoIds: Record<string, string> = {
        XLM: 'stellar',
        USDC: 'usd-coin',
        AQUA: 'aquarius',
        yXLM: 'stellar', // Use XLM price as fallback
        USDT: 'tether',
        BTC: 'bitcoin',
      };

      const ids = assetCodes
        .map(code => coinGeckoIds[code])
        .filter(Boolean)
        .join(',');

      if (ids) {
        const response = await fetch(
          `${PRICE_FEED_CONFIG.fallback.coingecko}?ids=${ids}&vs_currencies=usd`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          assetCodes.forEach(code => {
            const coinGeckoId = coinGeckoIds[code];
            if (coinGeckoId && data[coinGeckoId]?.usd) {
              result[code] = {
                price: data[coinGeckoId].usd,
                timestamp: Date.now(),
                source: 'fallback',
              };
            }
          });
        }
      }
    } catch (err) {
      console.warn('CoinGecko API unavailable:', err);
    }

    return result;
  }, [assetCodes]);

  // Use hardcoded fallback prices as last resort
  const getHardcodedPrices = useCallback((): Record<string, PriceData> => {
    const result: Record<string, PriceData> = {};
    
    assetCodes.forEach(code => {
      if (FALLBACK_PRICES[code]) {
        result[code] = {
          price: FALLBACK_PRICES[code],
          timestamp: Date.now(),
          source: 'fallback',
        };
      }
    });

    return result;
  }, [assetCodes]);

  // Main price fetching function
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try Reflector Oracle first
      let newPrices = await fetchReflectorPrices();
      
      // If Reflector Oracle failed or returned incomplete data, use fallback
      if (Object.keys(newPrices).length < assetCodes.length) {
        console.log('Using fallback prices due to incomplete Reflector data');
        const fallbackPrices = await fetchFallbackPrices();
        
        // Merge fallback prices for missing assets
        assetCodes.forEach(code => {
          if (!newPrices[code] && fallbackPrices[code]) {
            newPrices[code] = fallbackPrices[code];
          }
        });
      }

      // If still incomplete, use hardcoded fallback
      if (Object.keys(newPrices).length < assetCodes.length) {
        console.log('Using hardcoded fallback prices');
        const hardcodedPrices = getHardcodedPrices();
        
        assetCodes.forEach(code => {
          if (!newPrices[code] && hardcodedPrices[code]) {
            newPrices[code] = hardcodedPrices[code];
          }
        });
      }

      setPrices(newPrices);
      setLastUpdated(new Date());
      
      // Set error if we couldn't get any prices
      if (Object.keys(newPrices).length === 0) {
        setError('Unable to fetch price data from any source');
      }
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message || 'Failed to fetch prices');
      
      // Use hardcoded prices as last resort
      const hardcodedPrices = getHardcodedPrices();
      if (Object.keys(hardcodedPrices).length > 0) {
        setPrices(hardcodedPrices);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  }, [assetCodes, fetchReflectorPrices, fetchFallbackPrices, getHardcodedPrices]);

  // Store the fetchPrices function in ref
  fetchPricesRef.current = fetchPrices;

  // Refresh prices manually
  const refreshPrices = useCallback(async () => {
    await fetchPrices();
  }, [fetchPrices]);

  // Initial fetch and periodic updates
  useEffect(() => {
    if (fetchPricesRef.current) {
      fetchPricesRef.current();
    }

    // Set up periodic updates
    const interval = setInterval(() => {
      if (fetchPricesRef.current) {
        fetchPricesRef.current();
      }
    }, PRICE_FEED_CONFIG.updateInterval);

    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent re-runs

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refreshPrices,
  };
}
