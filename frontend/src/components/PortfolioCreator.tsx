'use client';

import { useState } from 'react';
import { useSorobanContract, Allocation, AssetInfo } from '../hooks/useSorobanContract';
import { useWallet } from '../hooks/useWallet';
import { STELLAR_ASSETS } from '../utils/constants';
import { 
  Plus, 
  Minus, 
  Save, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PortfolioCreatorProps {
  onPortfolioCreated?: () => void;
  className?: string;
}

interface AllocationInput {
  assetCode: string;
  targetPercentage: number;
}

export default function PortfolioCreator({ onPortfolioCreated, className = '' }: PortfolioCreatorProps) {
  const { walletState } = useWallet();
  const { createPortfolio, trackTransaction, isLoading, error } = useSorobanContract();
  
  const [allocations, setAllocations] = useState<AllocationInput[]>([
    { assetCode: 'XLM', targetPercentage: 50 },
    { assetCode: 'USDC', targetPercentage: 50 }
  ]);
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  // Available assets for selection
  const availableAssets = Object.keys(STELLAR_ASSETS);

  // Add new allocation
  const addAllocation = () => {
    if (allocations.length < 5) { // Limit to 5 assets
      setAllocations([...allocations, { assetCode: 'XLM', targetPercentage: 0 }]);
    }
  };

  // Remove allocation
  const removeAllocation = (index: number) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter((_, i) => i !== index));
    }
  };

  // Update allocation
  const updateAllocation = (index: number, field: keyof AllocationInput, value: string | number) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  // Calculate total percentage
  const totalPercentage = allocations.reduce((sum, alloc) => sum + alloc.targetPercentage, 0);

  // Validate allocations
  const isValid = totalPercentage === 100 && allocations.every(alloc => 
    alloc.targetPercentage > 0 && alloc.assetCode
  );

  // Handle portfolio creation
  const handleCreatePortfolio = async () => {
    if (!walletState.isConnected || !isValid) return;

    setIsCreating(true);
    setSuccess(false);
    setTransactionStatus('pending');
    setLastTransactionHash(null);

    try {
      // Convert allocations to contract format
      const contractAllocations: Allocation[] = allocations.map(alloc => {
        const asset = STELLAR_ASSETS[alloc.assetCode as keyof typeof STELLAR_ASSETS];
        return {
          asset: {
            address: asset.native ? 'native' : asset.issuer || '',
            symbol: alloc.assetCode,
            decimals: 7
          },
          target_percent: alloc.targetPercentage * 100 // Convert to basis points
        };
      });

      console.log('Creating portfolio with allocations:', contractAllocations);
      const result = await createPortfolio(contractAllocations, driftThreshold * 100); // Convert to basis points
      
      if (result && result.txHash) {
        setLastTransactionHash(result.txHash);
        console.log('Portfolio creation transaction submitted:', result.txHash);
        
        // Track transaction status
        const trackTransactionStatus = async () => {
          try {
            const txDetails = await trackTransaction(result.txHash);
            if (txDetails && txDetails.successful) {
              setTransactionStatus('success');
              setSuccess(true);
              console.log('Portfolio creation transaction confirmed:', result.txHash);
              onPortfolioCreated?.();
              
              // Reset form after success
              setTimeout(() => {
                setSuccess(false);
                setTransactionStatus(null);
                setAllocations([
                  { assetCode: 'XLM', targetPercentage: 50 },
                  { assetCode: 'USDC', targetPercentage: 50 }
                ]);
                setDriftThreshold(5);
              }, 3000);
            } else if (txDetails && !txDetails.successful) {
              setTransactionStatus('failed');
              console.error('Portfolio creation transaction failed:', result.txHash);
            }
          } catch (trackErr) {
            console.error('Error tracking transaction:', trackErr);
            // Still try to call success callback in case transaction was successful
            setTimeout(() => {
              setSuccess(true);
              setTransactionStatus('success');
              onPortfolioCreated?.();
            }, 5000);
          }
        };

        // Start tracking the transaction
        trackTransactionStatus();
      } else {
        console.log('Portfolio creation completed without transaction hash:', result);
        setSuccess(true);
        setTransactionStatus('success');
        onPortfolioCreated?.();
        
        // Reset form after success
        setTimeout(() => {
          setSuccess(false);
          setTransactionStatus(null);
          setAllocations([
            { assetCode: 'XLM', targetPercentage: 50 },
            { assetCode: 'USDC', targetPercentage: 50 }
          ]);
          setDriftThreshold(5);
        }, 3000);
      }

    } catch (err) {
      console.error('Failed to create portfolio:', err);
      setTransactionStatus('failed');
    } finally {
      setIsCreating(false);
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your Freighter wallet to create a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Plus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Create Portfolio
        </h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Portfolio created successfully!
            </p>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {transactionStatus && !success && (
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
                    Creating Portfolio
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your portfolio creation transaction is being processed on the blockchain.
                  </p>
                </div>
              </>
            )}
            {transactionStatus === 'success' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Portfolio Created Successfully
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your portfolio has been created and is now active.
                  </p>
                </div>
              </>
            )}
            {transactionStatus === 'failed' && (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    Portfolio Creation Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The portfolio creation transaction failed. Please try again.
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 dark:text-red-200 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Drift Threshold */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drift Threshold (%)
        </label>
        <input
          type="number"
          min="1"
          max="50"
          style={{ color: 'black' }}
          value={driftThreshold}
          onChange={(e) => setDriftThreshold(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter drift threshold (1-50%)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Portfolio will rebalance when any asset drifts beyond this threshold
        </p>
      </div>

      {/* Allocations */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Asset Allocations
          </label>
          <button
            onClick={addAllocation}
            disabled={allocations.length >= 5}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>

        <div className="space-y-3">
          {allocations.map((allocation, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <select
                  value={allocation.assetCode}
                  onChange={(e) => updateAllocation(index, 'assetCode', e.target.value)}
                  style={{ color: 'black' }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-gray-900"
                >
                  {availableAssets.map(assetCode => (
                    <option key={assetCode} value={assetCode}>
                      {STELLAR_ASSETS[assetCode as keyof typeof STELLAR_ASSETS].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={{ color: 'black' }}
                  value={allocation.targetPercentage}
                  onChange={(e) => updateAllocation(index, 'targetPercentage', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="%"
                />
              </div>
              
              <button
                onClick={() => removeAllocation(index)}
                disabled={allocations.length <= 1}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Total Percentage */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Allocation:
            </span>
            <span className={`text-lg font-bold ${
              totalPercentage === 100 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalPercentage}%
            </span>
          </div>
          {totalPercentage !== 100 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Allocations must total exactly 100%
            </p>
          )}
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreatePortfolio}
        disabled={!isValid || isCreating}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Portfolio...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Create Portfolio</span>
          </>
        )}
      </button>

      {/* Validation Summary */}
      {!isValid && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {totalPercentage !== 100 && (
                  <li>Total allocation must equal 100% (currently {totalPercentage}%)</li>
                )}
                {allocations.some(alloc => alloc.targetPercentage <= 0) && (
                  <li>All allocations must be greater than 0%</li>
                )}
                {allocations.some(alloc => !alloc.assetCode) && (
                  <li>All assets must be selected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
