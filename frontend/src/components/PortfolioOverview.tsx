'use client';

import { useEffect } from 'react';
import { RefreshCw, TrendingUp, DollarSign, PieChart, AlertCircle, Loader2, Coins, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface PortfolioOverviewProps {
  publicKey?: string;
  network?: 'testnet' | 'mainnet';
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-48 h-7 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Asset Cards Skeleton */}
        <div className="space-y-3">
          <div className="w-32 h-5 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="w-32 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioOverview({ publicKey, network = 'testnet' }: PortfolioOverviewProps) {
  const { 
    portfolio, 
    balances, 
    isLoading, 
    error, 
    refreshPortfolio, 
    lastUpdated,
    priceError,
    pricesLastUpdated
  } = usePortfolio({
    publicKey,
    network
  });

  // Don't render if no public key provided
  if (!publicKey) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            Connect your wallet to view portfolio
          </p>
        </div>
      </div>
    );
  }

  // Show loading skeleton for initial load
  if (isLoading && !portfolio) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <PieChart className="w-6 h-6 mr-3 text-blue-600" />
            Portfolio Overview
          </h2>
          <button
            onClick={refreshPortfolio}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Network & Last Updated */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              network === 'mainnet'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {network.toUpperCase()}
            </span>
            
            {/* Price Source Indicator */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              priceError 
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`} title={priceError || 'Prices from Reflector Oracle'}>
              {priceError ? 'Fallback Prices' : 'Live Prices'}
            </span>
          </div>
          
          <div className="flex flex-col items-end text-xs">
            {lastUpdated && (
              <span>
                Portfolio: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {pricesLastUpdated && (
              <span>
                Prices: {pricesLastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">Error Loading Portfolio</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={refreshPortfolio}
                  className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price Warning */}
        {!error && priceError && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-700 dark:text-orange-300 font-medium text-sm">Using Fallback Prices</p>
                <p className="text-orange-600 dark:text-orange-400 text-xs">
                  Unable to fetch real-time prices from Reflector Oracle. Portfolio values may not reflect current market rates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Data */}
        {!isLoading && !error && portfolio && (
          <>
            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(portfolio.totalValue)}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Total Value</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{balances.length}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Assets</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {balances.length > 0 ? 'Active' : 'Empty'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Status</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {portfolio.totalValue > 0 ? 'Balanced' : 'N/A'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Allocation</div>
              </div>
            </div>

            {/* Asset Cards */}
            {balances.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Asset Holdings ({balances.length})
                  </h3>
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  )}
                </div>
                
                {/* Asset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balances.map((asset, index) => {
                    const allocation = portfolio.allocations.find(a => a.assetCode === asset.code);
                    const assetValue = asset.balance * asset.price;
                    
                    return (
                      <div
                        key={`${asset.code}-${asset.issuer || 'native'}`}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200"
                      >
                        {/* Asset Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              asset.code === 'XLM' ? 'bg-blue-600' :
                              asset.code === 'USDC' ? 'bg-green-600' :
                              asset.code === 'AQUA' ? 'bg-cyan-600' :
                              'bg-purple-600'
                            }`}>
                              {asset.code.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {asset.code}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {asset.name}
                              </p>
                            </div>
                          </div>
                          
                          {asset.issuer && (
                            <button
                              onClick={() => {
                                const explorerUrl = network === 'mainnet' 
                                  ? `https://stellar.expert/explorer/public/asset/${asset.code}-${asset.issuer}`
                                  : `https://stellar.expert/explorer/testnet/asset/${asset.code}-${asset.issuer}`;
                                window.open(explorerUrl, '_blank');
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View on Stellar Expert"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Balance */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {asset.balance.toLocaleString(undefined, {
                                minimumFractionDigits: asset.code === 'USDC' ? 2 : 1,
                                maximumFractionDigits: asset.code === 'USDC' ? 2 : 6
                              })}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {asset.code}
                            </span>
                          </div>
                          
                          {/* USD Value */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(assetValue)}
                            </span>
                            {allocation && portfolio.totalValue > 0 && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                                {formatPercentage(allocation.currentPercentage)}
                              </span>
                            )}
                          </div>

                          {/* Issuer Info */}
                          {asset.issuer && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Issuer: {asset.issuer.slice(0, 4)}...{asset.issuer.slice(-4)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No Assets Found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  This account doesn't have any assets or the balances are too small to display.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Minimum balance: 0.0000001 per asset
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
