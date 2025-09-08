'use client';

import { usePrices } from '../hooks/usePrices';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface PriceDisplayProps {
  assetCodes?: string[];
  showLastUpdated?: boolean;
}

export default function PriceDisplay({ 
  assetCodes = ['XLM', 'USDC', 'AQUA', 'yXLM'], 
  showLastUpdated = true 
}: PriceDisplayProps) {
  const { prices, isLoading, error, lastUpdated, refreshPrices } = usePrices(assetCodes);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Asset Prices
        </h3>
        <button
          onClick={refreshPrices}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Price Source */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          error 
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {error ? 'Fallback Data' : 'Reflector Oracle'}
        </span>
        
        {showLastUpdated && lastUpdated && (
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              Using fallback prices - Reflector Oracle unavailable
            </p>
          </div>
        </div>
      )}

      {/* Price Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {assetCodes.map(assetCode => {
          const priceData = prices[assetCode];
          const price = priceData?.price || 0;
          const isStale = priceData?.source === 'fallback';
          
          return (
            <div
              key={assetCode}
              className={`p-4 rounded-lg border-2 transition-all ${
                isStale
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                  : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              }`}
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 ${
                  assetCode === 'XLM' ? 'bg-blue-600' :
                  assetCode === 'USDC' ? 'bg-green-600' :
                  assetCode === 'AQUA' ? 'bg-cyan-600' :
                  'bg-purple-600'
                }`}>
                  {assetCode.charAt(0)}
                </div>
                
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {assetCode}
                </p>
                
                <p className={`text-lg font-bold ${
                  isStale 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {isLoading ? '...' : formatCurrency(price)}
                </p>
                
                {isStale && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    Fallback
                  </p>
                )}
                
                {priceData?.timestamp && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(priceData.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && Object.keys(prices).length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading prices...</p>
        </div>
      )}
    </div>
  );
}
