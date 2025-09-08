'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSorobanContract, Portfolio, Allocation, AssetInfo } from '../hooks/useSorobanContract';
import { useWallet } from '../hooks/useWallet';
import { 
  PieChart, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Play, 
  Pause,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PortfolioManagerProps {
  className?: string;
}

export default function PortfolioManager({ className = '' }: PortfolioManagerProps) {
  const { walletState } = useWallet();
  const {
    getPortfolio,
    getPortfolioStatus,
    needsRebalancing,
    rebalancePortfolio,
    togglePortfolioStatus,
    getAssetPrice,
    trackTransaction,
    testContractConnection,
    testBasicContractCall,
    isLoading,
    error,
    contractId
  } = useSorobanContract();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioStatus, setPortfolioStatus] = useState<Record<string, number> | null>(null);
  const [needsRebalance, setNeedsRebalance] = useState<boolean>(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  // Load portfolio data
  const loadPortfolioData = useCallback(async () => {
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
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  }, [walletState.isConnected, getPortfolio, getPortfolioStatus]);

  // Handle rebalancing
  const handleRebalance = async () => {
    if (!walletState.isConnected) return;

    setIsRebalancing(true);
    setTransactionStatus('pending');
    setLastTransactionHash(null);

    try {
      console.log('Starting portfolio rebalancing...');
      const result = await rebalancePortfolio();
      
      if (result && result.txHash) {
        setLastTransactionHash(result.txHash);
        console.log('Rebalancing transaction submitted:', result.txHash);
        
        // Log rebalancing result details if available
        if (result.result) {
          console.log('Rebalancing result:', {
            tradesExecuted: result.result.trades_executed,
            totalGasUsed: result.result.total_gas_used,
            timestamp: result.result.timestamp
          });
        }
        
        // Track transaction status
        const trackTransactionStatus = async () => {
          try {
            const txDetails = await trackTransaction(result.txHash);
            if (txDetails && txDetails.successful) {
              setTransactionStatus('success');
              console.log('Rebalancing transaction confirmed:', result.txHash);
              // Reload data after successful rebalancing
              await loadPortfolioData();
            } else if (txDetails && !txDetails.successful) {
              setTransactionStatus('failed');
              console.error('Rebalancing transaction failed:', result.txHash);
            }
          } catch (trackErr) {
            console.error('Error tracking transaction:', trackErr);
            // Still try to reload data in case transaction was successful
            setTimeout(async () => {
              try {
                await loadPortfolioData();
                setTransactionStatus('success');
              } catch (reloadErr) {
                setTransactionStatus('failed');
              }
            }, 5000);
          }
        };

        // Start tracking the transaction
        trackTransactionStatus();
      } else {
        console.log('Rebalancing completed without transaction hash:', result);
        setTransactionStatus('success');
        await loadPortfolioData();
      }
    } catch (err) {
      console.error('Rebalancing failed:', err);
      setTransactionStatus('failed');
    } finally {
      setIsRebalancing(false);
    }
  };

  // Toggle portfolio status
  const handleToggleStatus = async () => {
    if (!portfolio) return;

    try {
      await togglePortfolioStatus(!portfolio.is_active);
      await loadPortfolioData();
    } catch (err) {
      console.error('Failed to toggle portfolio status:', err);
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

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!walletState.isConnected) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your Freighter wallet to manage your portfolio.
        </p>
      </div>
    );
  }

  if (isLoading && !portfolio) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 ${className}`}>
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
    );
  }

  if (!portfolio) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center ${className}`}>
        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Portfolio Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have a portfolio set up yet. Create one to start automated rebalancing.
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <PieChart className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Portfolio Manager
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              console.log('🧪 Testing contract connection...');
              const result = await testContractConnection();
              console.log('Contract connection test result:', result);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Test contract connection"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={loadPortfolioData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh portfolio data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleToggleStatus}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              portfolio.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {portfolio.is_active ? (
              <>
                <Play className="w-3 h-3" />
                <span>Active</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Portfolio Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <Settings className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Last Rebalance
            </span>
          </div>
          <div className="text-sm font-bold text-purple-600">
            {formatTimestamp(portfolio.last_rebalance)}
          </div>
        </div>
      </div>

      {/* Rebalancing Alert */}
      {needsRebalance && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-200">
                  Rebalancing Needed
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Your portfolio has drifted beyond the threshold and needs rebalancing.
                </p>
              </div>
            </div>
            <button
              onClick={handleRebalance}
              disabled={isRebalancing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isRebalancing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {transactionStatus && (
        <div className={`rounded-lg p-4 mb-6 border ${
          transactionStatus === 'pending' 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : transactionStatus === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {transactionStatus === 'pending' && (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Transaction Pending
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your rebalancing transaction is being processed on the blockchain.
                  </p>
                </div>
              </>
            )}
            {transactionStatus === 'success' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Transaction Successful
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your portfolio has been successfully rebalanced.
                  </p>
                </div>
              </>
            )}
            {transactionStatus === 'failed' && (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    Transaction Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The rebalancing transaction failed. Please try again.
                  </p>
                </div>
              </>
            )}
          </div>
          
          {lastTransactionHash && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transaction Hash:</p>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {lastTransactionHash}
                </code>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${lastTransactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View on Stellar Expert
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Allocations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Allocations
        </h3>
        <div className="space-y-3">
          {portfolio.allocations.map((allocation, index) => {
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
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
                      <span className="text-sm font-medium">Drift Alert</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Drift</span>
                    <span>{formatPercentage(drift)}%</span>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Debug Tools
        </h4>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              console.log('Testing basic contract call...');
              const result = await testBasicContractCall();
              console.log('Test result:', result);
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Contract Call
          </button>
          <button
            onClick={async () => {
              console.log('Testing contract connection...');
              const result = await testContractConnection();
              console.log('Connection test result:', result);
            }}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Contract Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Contract Information
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>Contract ID: {contractId}</p>
          <p>Network: Stellar Testnet</p>
          {lastUpdate && (
            <p>Last Updated: {lastUpdate.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
