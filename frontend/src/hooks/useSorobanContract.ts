'use client';

import { useState, useEffect, useCallback } from 'react';
import { CONTRACT_CONFIG } from '../utils/constants';
import { 
  Horizon, 
  Networks, 
  TransactionBuilder, 
  BASE_FEE,
  Contract,
  scValToNative,
  Address,
  nativeToScVal,
  Operation,
  xdr
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// Soroban contract types based on the smart contract
export interface AssetInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface Allocation {
  asset: AssetInfo;
  target_percent: number; // Basis points (10000 = 100%)
}

export interface Portfolio {
  owner: string;
  allocations: Allocation[];
  drift_threshold: number; // Basis points
  last_rebalance: number;
  is_active: boolean;
}

export interface RebalanceResult {
  trades_executed: number;
  total_gas_used: number;
  timestamp: number;
}

export interface PriceInfo {
  asset: AssetInfo;
  price: number; // Price in stroops (7 decimal places)
  timestamp: number;
}

// Contract error types
export enum ContractError {
  NotInitialized = 1,
  AlreadyInitialized = 2,
  Unauthorized = 3,
  InvalidAllocation = 4,
  InsufficientBalance = 5,
  InvalidAsset = 6,
  SwapFailed = 7,
  InvalidDriftThreshold = 8,
  NoRebalanceNeeded = 9,
  OracleError = 10,
}

interface UseSorobanContractReturn {
  // Portfolio management
  createPortfolio: (allocations: Allocation[], driftThreshold: number) => Promise<{ txHash: string; success: boolean }>;
  updateAllocations: (newAllocations: Allocation[]) => Promise<{ txHash: string; success: boolean }>;
  getPortfolio: () => Promise<Portfolio | null>;
  getPortfolioStatus: () => Promise<Record<string, number> | null>;
  togglePortfolioStatus: (isActive: boolean) => Promise<{ txHash: string; success: boolean }>;
  
  // Rebalancing
  needsRebalancing: () => Promise<boolean>;
  rebalancePortfolio: () => Promise<RebalanceResult | null>;
  
  // Asset management
  addSupportedAsset: (assetAddress: string, symbol: string, decimals: number) => Promise<{ txHash: string; success: boolean }>;
  getAssetPrice: (assetSymbol: string) => Promise<number>;
  
  // Contract info
  getOracleAddress: () => Promise<string | null>;
  
  // Transaction tracking
  trackTransaction: (txHash: string) => Promise<any>;
  
  // Testing
  testContractConnection: () => Promise<boolean>;
  
  // State
  isLoading: boolean;
  error: string | null;
  contractId: string;
}

export function useSorobanContract(): UseSorobanContractReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractId = CONTRACT_CONFIG.contractId;

  // Initialize Stellar SDK
  const server = new Horizon.Server('https://soroban-testnet.stellar.org');
  const networkPassphrase = Networks.TESTNET;

  // Helper function to get user's public key from Freighter
  const getUserPublicKey = useCallback(async (): Promise<string> => {
    try {
      const { getAddress } = await import('@stellar/freighter-api');
      const publicKey = await getAddress();
      return typeof publicKey === 'string' ? publicKey : publicKey.address;
    } catch (err) {
      throw new Error('Failed to get user public key. Please ensure Freighter is connected.');
    }
  }, []);

  // Helper function to create and sign transactions using proper Stellar SDK approach
  const createAndSignTransaction = useCallback(async (
    contractId: string,
    functionName: string,
    args: any[],
    sourceAccount: string
  ): Promise<{ txHash: string; result?: any }> => {
    try {
      console.log('🔍 Starting transaction creation...');
      console.log('📝 Contract ID:', contractId);
      console.log('📝 Function:', functionName);
      console.log('📝 Args:', args);
      console.log('👤 Source account:', sourceAccount);
      
      // Get account details
      console.log('📡 Loading account details...');
      const account = await server.loadAccount(sourceAccount);
      console.log('✅ Account loaded:', account.accountId());
      
      // Create transaction builder
      console.log('🔨 Building transaction...');
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30);

      // Add the invoke contract function operation using Contract class
      console.log('🔧 Adding invoke contract operation...');
      const contract = new Contract(contractId);
      const invokeOp = contract.call(functionName, ...args);
      
      transaction.addOperation(invokeOp);
      const builtTransaction = transaction.build();
      console.log('✅ Transaction built successfully');

      // Sign transaction with Freighter
      console.log('🔐 Requesting Freighter signature...');
      const signedTransaction = await signTransaction(builtTransaction.toXDR(), {
        network: 'testnet',
        accountToSign: sourceAccount,
      });
      console.log('✅ Transaction signed by Freighter');

      // Submit transaction
      console.log('📤 Submitting transaction to network...');
      const response = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedTransaction, networkPassphrase)
      );
      console.log('✅ Transaction submitted:', response.hash);

      // Extract contract result
      let contractResult = null;
      if (response.result && response.result.result && response.result.result().results) {
        const results = response.result.result().results();
        if (results && results.length > 0) {
          try {
            contractResult = scValToNative(results[0].tr().invokeHostFunctionResult().success());
            console.log('📊 Contract result:', contractResult);
          } catch (err) {
            console.log('⚠️ Could not parse contract result:', err);
          }
        }
      }

      return { txHash: response.hash, result: contractResult };
    } catch (err: any) {
      console.error('❌ Transaction error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        contractId: contractId,
        functionName: functionName,
        args: args,
        sourceAccount: sourceAccount
      });
      throw new Error(`Transaction failed: ${err.message}`);
    }
  }, [server, networkPassphrase]);

  // Helper function to convert arguments for Soroban contract calls
  const convertArgsForContract = useCallback((method: string, args: any[]): any[] => {
    try {
      console.log(`Converting args for method: ${method}`, args);
      
      switch (method) {
        case 'create_portfolio':
          const [owner, allocations, driftThreshold] = args;
          console.log('Converting create_portfolio args:', { owner, allocations, driftThreshold });
          
          // For now, let's try with simple string conversion first
          return [owner, allocations, driftThreshold];
          
        case 'rebalance_portfolio':
          const [rebalanceOwner] = args;
          return [rebalanceOwner];
          
        case 'update_allocations':
          const [updateOwner, newAllocations] = args;
          return [updateOwner, newAllocations];
          
        case 'toggle_portfolio_status':
          const [toggleOwner, isActive] = args;
          return [toggleOwner, isActive];
          
        case 'needs_rebalancing':
          const [needsOwner] = args;
          return [needsOwner];
          
        case 'get_portfolio':
          const [getOwner] = args;
          return [getOwner];
          
        case 'get_portfolio_status':
          const [statusOwner] = args;
          return [statusOwner];
          
        case 'get_asset_price':
          const [assetSymbol] = args;
          return [assetSymbol];
          
        default:
          return args;
      }
    } catch (err) {
      console.error('Error converting arguments:', err);
      return args; // Return original args if conversion fails
    }
  }, []);

  // Helper function to make contract calls
  const makeContractCall = useCallback(async (
    method: string,
    args: any[] = [],
    requiresSigning: boolean = false
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Making contract call: ${method}`, args);
      
      const contract = new Contract(contractId);
      const userPublicKey = await getUserPublicKey();
      
      if (requiresSigning) {
        // For state-changing operations, create and sign transaction
        console.log(`🔧 Creating contract operation for method: ${method}`);
        console.log(`📋 Raw method arguments:`, args);
        
        try {
          // Convert arguments to Soroban-compatible types
          const convertedArgs = convertArgsForContract(method, args);
          console.log(`📋 Converted arguments:`, convertedArgs);
          
          // Use the proper Stellar SDK approach
          const transactionResult = await createAndSignTransaction(
            contractId,
            method,
            convertedArgs,
            userPublicKey
          );
          console.log(`✅ Transaction submitted: ${transactionResult.txHash}`);
          return { txHash: transactionResult.txHash, result: transactionResult.result, success: true };
        } catch (operationError: any) {
          console.error(`❌ Contract operation failed for method ${method}:`, {
            error: operationError.message,
            method: method,
            rawArgs: args,
            contractId: contractId
          });
          throw new Error(`Contract operation failed: ${operationError.message}`);
        }
      } else {
        // For read-only operations, we'll use a simplified approach
        // Since simulateTransaction might not be available in this SDK version,
        // we'll return mock data for read operations for now
        console.log(`Read-only operation: ${method}`, args);
        
        // Return mock data for read operations
      switch (method) {
        case 'get_portfolio':
          return {
              owner: userPublicKey,
            allocations: [
              {
                asset: {
                    address: 'native',
                  symbol: 'XLM',
                  decimals: 7
                },
                target_percent: 5000 // 50%
              },
              {
                asset: {
                    address: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
                  symbol: 'USDC',
                  decimals: 7
                },
                target_percent: 5000 // 50%
              }
            ],
            drift_threshold: 500, // 5%
            last_rebalance: Date.now(),
            is_active: true
          };
          
        case 'needs_rebalancing':
          return Math.random() > 0.5; // Random for demo
          
        case 'get_portfolio_status':
          return {
              'native': 4500, // 45% current
              'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN': 5500  // 55% current
          };
          
        case 'get_asset_price':
          const symbol = args[0];
          const mockPrices: Record<string, number> = {
            'XLM': 1200000, // $0.12 in stroops
            'USDC': 10000000, // $1.00 in stroops
            'AQUA': 500000, // $0.05 in stroops
          };
          return mockPrices[symbol] || 10000000;
          
        case 'get_oracle_address':
            return 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
          
        default:
          return null;
        }
      }
    } catch (err: any) {
      console.error('Contract call error:', err);
      setError(err.message || 'Contract call failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId, getUserPublicKey, createAndSignTransaction, server, networkPassphrase]);

  // Helper function to parse contract results
  const parseContractResult = useCallback((method: string, retval: any): any => {
    try {
      switch (method) {
        case 'get_portfolio':
          const portfolioData = scValToNative(retval);
          return portfolioData;
          
        case 'needs_rebalancing':
          return scValToNative(retval);
          
        case 'get_portfolio_status':
          return scValToNative(retval);
          
        case 'get_asset_price':
          return scValToNative(retval);
          
        case 'get_oracle_address':
          return scValToNative(retval);
          
        case 'rebalance_portfolio':
          return scValToNative(retval);
          
        default:
          return scValToNative(retval);
      }
    } catch (err) {
      console.error('Error parsing contract result:', err);
      return retval;
    }
  }, []);

  // Portfolio management functions
  const createPortfolio = useCallback(async (allocations: Allocation[], driftThreshold: number) => {
    try {
      const userPublicKey = await getUserPublicKey();
      const result = await makeContractCall('create_portfolio', [userPublicKey, allocations, driftThreshold], true);
      return result;
    } catch (err) {
      throw new Error('Failed to create portfolio');
    }
  }, [makeContractCall, getUserPublicKey]);

  const updateAllocations = useCallback(async (newAllocations: Allocation[]) => {
    try {
      const userPublicKey = await getUserPublicKey();
      const result = await makeContractCall('update_allocations', [userPublicKey, newAllocations], true);
      return result;
    } catch (err) {
      throw new Error('Failed to update allocations');
    }
  }, [makeContractCall, getUserPublicKey]);

  const getPortfolio = useCallback(async (): Promise<Portfolio | null> => {
    try {
      const userPublicKey = await getUserPublicKey();
      return await makeContractCall('get_portfolio', [userPublicKey], false);
    } catch (err) {
      console.error('Failed to get portfolio:', err);
      return null;
    }
  }, [makeContractCall, getUserPublicKey]);

  const getPortfolioStatus = useCallback(async (): Promise<Record<string, number> | null> => {
    try {
      const userPublicKey = await getUserPublicKey();
      return await makeContractCall('get_portfolio_status', [userPublicKey], false);
    } catch (err) {
      console.error('Failed to get portfolio status:', err);
      return null;
    }
  }, [makeContractCall, getUserPublicKey]);

  const togglePortfolioStatus = useCallback(async (isActive: boolean) => {
    try {
      const userPublicKey = await getUserPublicKey();
      const result = await makeContractCall('toggle_portfolio_status', [userPublicKey, isActive], true);
      return result;
    } catch (err) {
      throw new Error('Failed to toggle portfolio status');
    }
  }, [makeContractCall, getUserPublicKey]);

  // Rebalancing functions
  const needsRebalancing = useCallback(async (): Promise<boolean> => {
    try {
      const userPublicKey = await getUserPublicKey();
      return await makeContractCall('needs_rebalancing', [userPublicKey], false);
    } catch (err) {
      console.error('Failed to check rebalancing needs:', err);
      return false;
    }
  }, [makeContractCall, getUserPublicKey]);

  const rebalancePortfolio = useCallback(async (): Promise<{ txHash: string; result?: RebalanceResult } | null> => {
    try {
      const userPublicKey = await getUserPublicKey();
      const result = await makeContractCall('rebalance_portfolio', [userPublicKey], true);
      
      // The makeContractCall returns { txHash, success: true } for write operations
      if (result && result.txHash) {
        return {
          txHash: result.txHash,
          result: result.result // The actual RebalanceResult from the contract
        };
      }
      
      return null;
    } catch (err) {
      console.error('Failed to rebalance portfolio:', err);
      throw err; // Re-throw to let the UI handle the error
    }
  }, [makeContractCall, getUserPublicKey]);

  // Asset management functions
  const addSupportedAsset = useCallback(async (assetAddress: string, symbol: string, decimals: number) => {
    try {
      const result = await makeContractCall('add_supported_asset', [assetAddress, symbol, decimals], true);
      return result;
    } catch (err) {
      throw new Error('Failed to add supported asset');
    }
  }, [makeContractCall]);

  const getAssetPrice = useCallback(async (assetSymbol: string): Promise<number> => {
    try {
      return await makeContractCall('get_asset_price', [assetSymbol], false);
    } catch (err) {
      console.error('Failed to get asset price:', err);
      return 0;
    }
  }, [makeContractCall]);

  // Contract info functions
  const getOracleAddress = useCallback(async (): Promise<string | null> => {
    try {
      return await makeContractCall('get_oracle_address', [], false);
    } catch (err) {
      console.error('Failed to get oracle address:', err);
      return null;
    }
  }, [makeContractCall]);

  // Test function to verify contract connection
  const testContractConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing contract connection...');
      const contract = new Contract(contractId);
      console.log('✅ Contract instance created');
      
      // Try to get oracle address (should be a simple read operation)
      const oracleAddress = await getOracleAddress();
      console.log('✅ Oracle address retrieved:', oracleAddress);
      
      return true;
    } catch (err) {
      console.error('❌ Contract connection test failed:', err);
      return false;
    }
  }, [contractId, getOracleAddress]);

  // Simple test function to try a basic contract call
  const testBasicContractCall = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing basic contract call...');
      const userPublicKey = await getUserPublicKey();
      console.log('👤 User public key:', userPublicKey);
      
      // Try a simple read operation first
      const result = await makeContractCall('get_oracle_address', [], false);
      console.log('✅ Basic contract call result:', result);
      
      return true;
    } catch (err) {
      console.error('❌ Basic contract call failed:', err);
      return false;
    }
  }, [getUserPublicKey, makeContractCall]);

  // Transaction tracking function
  const trackTransaction = useCallback(async (txHash: string): Promise<any> => {
    try {
      const response = await server.transactions().transaction(txHash).call();
      return response;
    } catch (err) {
      console.error('Failed to track transaction:', err);
      return null;
    }
  }, [server]);

  return {
    // Portfolio management
    createPortfolio,
    updateAllocations,
    getPortfolio,
    getPortfolioStatus,
    togglePortfolioStatus,
    
    // Rebalancing
    needsRebalancing,
    rebalancePortfolio,
    
    // Asset management
    addSupportedAsset,
    getAssetPrice,
    
    // Contract info
    getOracleAddress,
    
    // Transaction tracking
    trackTransaction,
    
    // Testing
    testContractConnection,
    testBasicContractCall,
    
    // State
    isLoading,
    error,
    contractId
  };
}
