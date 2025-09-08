'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useSorobanContract } from '../../hooks/useSorobanContract';
import { useWallet } from '../../hooks/useWallet';
import { 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';

export default function RebalancePage() {
  const { walletState } = useWallet();
  const {
    getPortfolio,
    getPortfolioStatus,
    needsRebalancing,
    rebalancePortfolio,
    isLoading,
    error
  } = useSorobanContract();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioStatus, setPortfolioStatus] = useState<Record<string, number> | null>(null);
  const [needsRebalance, setNeedsRebalance] = useState<boolean>(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Load portfolio data
  const loadPortfolioData = async () => {
    if (!walletState.isConnected) return;

    try {
      const [portfolioData, statusData, rebalanceNeeded] = await Promise.all([
        getPortfolio(),
        getPortfolioStatus(),
        needsRebalancing()
      ]);

      setPortfolio(portfolioData);
      setPortfolioStatus(statusData);
      setNeedsRebalance(rebalanceNeeded);
      setLastCheck(new Date());
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  };

  // Handle rebalancing
  const handleRebalance = async () => {
    if (!walletState.isConnected) return;

    setIsRebalancing(true);
    try {
      const result = await rebalancePortfolio();
      if (result) {
        console.log('Rebalancing completed:', result);
        // Reload data after rebalancing
        await loadPortfolioData();
      }
    } catch (err) {
      console.error('Rebalancing failed:', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Load data on mount and when wallet connects
  useEffect(() => {
    if (walletState.isConnected) {
      loadPortfolioData();
    }
  }, [walletState.isConnected]);

  // Format percentage for display
  const formatPercentage = (basisPoints: number) => {
    return (basisPoints / 100).toFixed(1);
  };

  if (!walletState.isConnected) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Please connect your Freighter wallet to access rebalancing features.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading && !portfolio) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading portfolio...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadPortfolioData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!portfolio) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Portfolio Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to create a portfolio first before you can rebalance it.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Rebalancing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and execute portfolio rebalancing when drift exceeds your threshold
          </p>
        </div>

        {/* Rebalancing Status */}
        <div className="mb-8">
          {needsRebalance ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                      Rebalancing Required
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300">
                      Your portfolio has drifted beyond the {formatPercentage(portfolio.drift_threshold)}% threshold
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRebalance}
                  disabled={isRebalancing}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isRebalancing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Rebalancing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Execute Rebalancing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Portfolio Balanced
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your portfolio is within the {formatPercentage(portfolio.drift_threshold)}% drift threshold
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Current Allocations
            </h2>
            <button
              onClick={loadPortfolioData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            {portfolio.allocations.map((allocation: any, index: number) => {
              const currentPercentage = portfolioStatus?.[allocation.asset.address] || 0;
              const targetPercentage = allocation.target_percent;
              const drift = Math.abs(currentPercentage - targetPercentage);
              const isOverThreshold = drift > portfolio.drift_threshold;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isOverThreshold
                      ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        allocation.asset.symbol === 'XLM' ? 'bg-blue-600' :
                        allocation.asset.symbol === 'USDC' ? 'bg-green-600' :
                        'bg-purple-600'
                      }`}>
                        {allocation.asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {allocation.asset.symbol}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {allocation.asset.address.slice(0, 8)}...{allocation.asset.address.slice(-8)}
                        </p>
                      </div>
                    </div>
                    
                    {isOverThreshold && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Needs Rebalancing</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPercentage(targetPercentage)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPercentage(currentPercentage)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Drift</p>
                      <p className={`font-semibold ${
                        isOverThreshold 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatPercentage(drift)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverThreshold ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((drift / portfolio.drift_threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Drift Threshold
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(portfolio.drift_threshold)}%
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Status
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {portfolio.is_active ? 'Active' : 'Paused'}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Last Check
                </span>
              </div>
              <div className="text-sm font-bold text-purple-600">
                {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
