'use client';

import { useEffect, useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, RefreshCw, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WalletState } from '../types';

interface WalletConnectProps {
  onWalletConnected?: (walletState: WalletState) => void;
  showFullAddress?: boolean;
  showCopyButton?: boolean;
  showExplorerLink?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function WalletConnect({ 
  onWalletConnected,
  showFullAddress = false,
  showCopyButton = true,
  showExplorerLink = false,
  variant = 'default'
}: WalletConnectProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    walletState,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isWalletInstalled,
    showInstallMessage,
    refreshWalletState,
    debugFreighter
  } = useWallet();

  // Notify parent component when wallet state changes
  useEffect(() => {
    onWalletConnected?.(walletState);
  }, [walletState, onWalletConnected]);

  // Copy address to clipboard
  const copyAddress = async () => {
    if (walletState.publicKey) {
      try {
        await navigator.clipboard.writeText(walletState.publicKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWalletState();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format address display
  const formatAddress = (address: string) => {
    if (showFullAddress) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Get explorer link
  const getExplorerLink = (address: string, network: string) => {
    const baseUrl = network === 'mainnet' 
      ? 'https://stellar.expert/explorer/public/account/'
      : 'https://stellar.expert/explorer/testnet/account/';
    return `${baseUrl}${address}`;
  };

  // Show install message only when user clicked connect but wallet not found
  if (showInstallMessage) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            Freighter Wallet Required
          </h3>
          <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
            To use this application, you need to install the Freighter browser extension.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-4 h-4" />
              <span>Install Freighter</span>
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show connected state
  if (walletState.isConnected) {
    const address = walletState.publicKey!;
    
    if (variant === 'compact') {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-md">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-800 dark:text-green-200">
              {formatAddress(address)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      );
    }

    if (variant === 'detailed') {
      return (
        <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                Wallet Connected
              </span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              walletState.network === 'mainnet'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {walletState.network.toUpperCase()}
            </span>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Address:</p>
            <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
              <code className="text-xs text-gray-900 dark:text-gray-100 font-mono flex-1">
                {formatAddress(address)}
              </code>
              
              {showCopyButton && (
                <button
                  onClick={copyAddress}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={copied ? 'Copied!' : 'Copy address'}
                >
                  <Copy className={`w-3 h-3 ${copied ? 'text-green-600' : ''}`} />
                </button>
              )}

              {showExplorerLink && (
                <a
                  href={getExplorerLink(address, walletState.network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="View in Stellar Expert"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t border-green-200 dark:border-green-700">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
              title="Refresh wallet state"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={disconnectWallet}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
            >
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {formatAddress(address)}
          </span>
          <span className="text-xs text-green-600 uppercase font-medium">
            {walletState.network}
          </span>
        </div>
        
        {showCopyButton && (
          <button
            onClick={copyAddress}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : ''}`} />
          </button>
        )}

        {showExplorerLink && (
          <a
            href={getExplorerLink(address, walletState.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="View in Stellar Expert"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh wallet state"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        <button
          onClick={disconnectWallet}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Show connection interface
  return (
    <div className={variant === 'navbar' ? 'space-y-1' : 'space-y-3'}>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`flex items-center space-x-2 ${
          variant === 'navbar' 
            ? 'px-4 py-2 text-sm' 
            : 'px-6 py-2'
        } bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors`}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span>{isConnecting ? 'Connecting...' : 'Connect Freighter'}</span>
      </button>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">Connection Failed</p>
            <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Debug button - remove this in production */}
      {variant !== 'navbar' && (
        <button
          onClick={debugFreighter}
          className="text-xs text-gray-400 hover:text-gray-600 mt-2"
        >
          Debug Freighter
        </button>
      )}

    </div>
  );
}
