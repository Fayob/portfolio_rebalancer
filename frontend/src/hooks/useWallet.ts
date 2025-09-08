'use client';

import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types';
import { setAllowed, isConnected, getAddress } from "@stellar/freighter-api";

interface FreighterApi {
  isConnected(): Promise<boolean>;
  isAllowed(): Promise<boolean>;
  setAllowed(): Promise<void>;
  getPublicKey(): Promise<string>;
  getNetwork(): Promise<string>;
  getNetworkDetails(): Promise<any>;
}

interface UseWalletReturn {
  walletState: WalletState;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isWalletInstalled: boolean;
  refreshWalletState: () => Promise<void>;
}

declare global {
  interface Window {
    freighter?: FreighterApi;
  }
}

export function useWallet(): UseWalletReturn {
  // Initialize wallet state with localStorage check
  const [walletState, setWalletState] = useState<WalletState>(() => {
    if (typeof window !== 'undefined') {
      const cachedConnection = localStorage.getItem('walletConnected');
      const cachedAddress = localStorage.getItem('walletAddress');
      
      if (cachedConnection === 'true' && cachedAddress) {
        return {
          isConnected: true,
          publicKey: cachedAddress,
          network: 'testnet',
          balances: []
        };
      }
    }
    
    return {
      isConnected: false,
      network: 'testnet',
      balances: []
    };
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletInstalled, setIsWalletInstalled] = useState<boolean | null>(true); // Default to true, assume wallet is installed
  const [isClient, setIsClient] = useState(false);
  const [showInstallMessage, setShowInstallMessage] = useState(false); // Only show install message when user clicks connect but wallet not found

  // Debug function to check what's available
  const debugFreighter = useCallback(() => {
    console.log('Debugging Freighter availability:');
    console.log('window.freighterApi:', (window as any).freighterApi);
    console.log('window.freighter:', (window as any).freighter);
    console.log('window.stellar:', (window as any).stellar);
    console.log('window.__FREIGHTER__:', (window as any).__FREIGHTER__);
    console.log('All window properties:', Object.keys(window).filter(key => 
      key.toLowerCase().includes('freighter') || 
      key.toLowerCase().includes('stellar')
    ));
  }, []);

  // Check if Freighter wallet is installed
  const checkWalletInstallation = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsWalletInstalled(false);
      return false;
    }

    // Check for Freighter wallet in multiple ways
    const hasFreighter = !!(
      window.freighter ||
      (window as any).freighterApi ||
      (window as any).stellar ||
      (window as any).freighter ||
      document.querySelector('script[src*="freighter"]') ||
      // Check if Freighter extension is available
      (() => {
        try {
          return typeof (window as any).freighter !== 'undefined';
        } catch {
          return false;
        }
      })()
    );

    // Additional check: try to access Freighter methods
    if (!hasFreighter) {
      try {
        const freighter = (window as any).freighter;
        if (freighter && typeof freighter.isConnected === 'function') {
          setIsWalletInstalled(true);
          return true;
        }
      } catch (e) {
        // Ignore errors
      }
    }

    setIsWalletInstalled(hasFreighter);
    return hasFreighter;
  }, []);

  // Check existing wallet connection on mount
  const checkWalletConnection = useCallback(async () => {
    try {
      // First check localStorage for cached connection
      const cachedConnection = localStorage.getItem('walletConnected');
      const cachedAddress = localStorage.getItem('walletAddress');
      
      if (cachedConnection === 'true' && cachedAddress) {
        try {
          // Use the official Freighter API to verify connection
          const connected = await isConnected();
          
          if (connected) {
            const publicKey = await getAddress();
            
            if (publicKey) {
              // Extract the address from the publicKey object
              const address = typeof publicKey === 'string' ? publicKey : publicKey.address;
              
              // Verify the address matches the cached one
              if (address === cachedAddress) {
                setWalletState({
                  isConnected: true,
                  publicKey: address,
                  network: 'testnet', // Default to testnet for now
                  balances: []
                });
                
                setError(null);
                console.log('Wallet connection restored from cache:', address);
                return;
              }
            }
          }
        } catch (apiError) {
          console.warn('Freighter API not available yet, using cached connection:', apiError);
          // If API is not available but we have cached connection, use it
          setWalletState({
            isConnected: true,
            publicKey: cachedAddress,
            network: 'testnet',
            balances: []
          });
          
          setError(null);
          console.log('Wallet connection restored from cache (API unavailable):', cachedAddress);
          return;
        }
        
        // If verification failed, clear the cache
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      // Don't set error here as it might be normal (user hasn't connected yet)
      setWalletState({
        isConnected: false,
        network: 'testnet',
        balances: []
      });
    }
  }, []);

  // Connect to Freighter wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setShowInstallMessage(false); // Reset install message

    try {
      // Check if Freighter is available when user actually tries to connect
      if (typeof window === 'undefined') {
        throw new Error('Browser environment not available');
      }

      // Use the official Freighter API as per Stellar documentation
      try {
        // First, set allowed to true to enable connection
        await setAllowed();
        
        // Check if we're connected
        const connected = await isConnected();
        
        if (connected) {
          // Get the public key
          const publicKey = await getAddress();
          
          if (publicKey) {
            // Freighter found - update state
            setIsWalletInstalled(true);
            setShowInstallMessage(false);

            // Extract the address from the publicKey object
            const address = typeof publicKey === 'string' ? publicKey : publicKey.address;

            const newWalletState: WalletState = {
              isConnected: true,
              publicKey: address,
              network: 'testnet', // Default to testnet for now
              balances: []
            };

          setWalletState(newWalletState);
          setError(null);
          
          // Store in localStorage for persistence across pages
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', address);
          
          console.log('Wallet connected successfully:', newWalletState);
          
          // Trigger a page refresh to update all components that depend on wallet state
          // This ensures that pages like dashboard and rebalance show the connected state
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Small delay to ensure state is saved
          } else {
            throw new Error('No public key received from wallet');
          }
        } else {
          throw new Error('Please unlock Freighter and try again');
        }
      } catch (error: any) {
        console.error('Freighter API error:', error);
        
        // If setAllowed fails, Freighter might not be installed
        if (error.message && error.message.includes('freighter')) {
          setShowInstallMessage(true);
          setIsWalletInstalled(false);
          throw new Error('Freighter wallet not found. Please install the Freighter browser extension.');
        } else {
          throw new Error(error.message || 'Failed to connect wallet. Please make sure Freighter is unlocked.');
        }
      }

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('not found') || err.message?.includes('not installed')) {
        setError('Freighter wallet not found. Please install the Freighter browser extension.');
      } else if (err.message?.includes('User declined access')) {
        setError('Connection cancelled. Please try again and approve the connection.');
      } else if (err.message?.includes('not allowed')) {
        setError('Wallet access denied. Please allow access in Freighter settings.');
      } else if (err.message?.includes('locked')) {
        setError('Wallet is locked. Please unlock your Freighter wallet and try again.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }

      // Reset wallet state on error
      setWalletState({
        isConnected: false,
        network: 'testnet',
        balances: []
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    
    setWalletState({
      isConnected: false,
      network: 'testnet',
      balances: []
    });
    setError(null);
  }, []);

  // Refresh wallet state (useful for checking network changes, etc.)
  const refreshWalletState = useCallback(async () => {
    if (!walletState.isConnected || !checkWalletInstallation()) {
      return;
    }

    try {
      // Try to access Freighter API
      const freighter = window.freighter || (window as any).freighterApi;
      
      if (!freighter) {
        throw new Error('Freighter API not available');
      }

      const publicKey = await freighter.getPublicKey();
      const networkResponse = await freighter.getNetwork();
      const network = networkResponse.toLowerCase() === 'public' ? 'mainnet' : 'testnet';

      setWalletState(prev => ({
        ...prev,
        publicKey,
        network
      }));
      
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing wallet state:', err);
      setError('Failed to refresh wallet information.');
    }
  }, [walletState.isConnected, checkWalletInstallation]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check wallet connection on mount (but assume wallet is installed)
  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof window === 'undefined') return;
    
    // Immediate check
    checkWalletConnection();
    
    // Multiple attempts to check connection with increasing delays
    const connectionTimer1 = setTimeout(() => {
      checkWalletConnection();
    }, 100);
    
    const connectionTimer2 = setTimeout(() => {
      checkWalletConnection();
    }, 500);
    
    const connectionTimer3 = setTimeout(() => {
      checkWalletConnection();
    }, 1000);
    
    const connectionTimer4 = setTimeout(() => {
      checkWalletConnection();
    }, 2000);

    return () => {
      clearTimeout(connectionTimer1);
      clearTimeout(connectionTimer2);
      clearTimeout(connectionTimer3);
      clearTimeout(connectionTimer4);
    };
  }, [isClient, checkWalletConnection]);

  // Listen for wallet events (if available)
  useEffect(() => {
    if (!isWalletInstalled) return;

    const handleAccountChange = () => {
      checkWalletConnection();
    };

    const handleNetworkChange = () => {
      refreshWalletState();
    };

    // Note: Freighter might not support these events yet, but we prepare for future support
    window.addEventListener('freighter:accountChanged', handleAccountChange);
    window.addEventListener('freighter:networkChanged', handleNetworkChange);

    return () => {
      window.removeEventListener('freighter:accountChanged', handleAccountChange);
      window.removeEventListener('freighter:networkChanged', handleNetworkChange);
    };
  }, [isWalletInstalled, checkWalletConnection, refreshWalletState]);

  return {
    walletState,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isWalletInstalled,
    showInstallMessage,
    refreshWalletState,
    debugFreighter
  };
}
