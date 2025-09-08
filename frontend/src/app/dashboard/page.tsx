'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import PortfolioManager from '../../components/PortfolioManager';
import PortfolioCreator from '../../components/PortfolioCreator';
import PriceDisplay from '../../components/PriceDisplay';
import { useWallet } from '../../hooks/useWallet';
import { Wallet, AlertCircle, Plus, PieChart } from 'lucide-react';

export default function Dashboard() {
  const { walletState } = useWallet();
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePortfolioCreated = () => {
    setShowCreator(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of portfolio manager
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your Stellar portfolio performance and rebalancing opportunities
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!walletState.isConnected ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Please connect your Freighter wallet to view your portfolio data.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
              <Wallet className="w-4 h-4" />
              <span>Use the wallet connect button in the header</span>
            </div>
          </div>
        ) : (
          /* Portfolio Content */
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowCreator(!showCreator)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showCreator ? (
                  <>
                    <PieChart className="w-4 h-4" />
                    <span>View Portfolio</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Portfolio</span>
                  </>
                )}
              </button>
            </div>

            {/* Portfolio Creator or Manager */}
            {showCreator ? (
              <PortfolioCreator 
                onPortfolioCreated={handlePortfolioCreated}
                className="max-w-2xl mx-auto"
              />
            ) : (
              <PortfolioManager key={refreshKey} />
            )}

            {/* Price Display */}
            <PriceDisplay />

            {/* Additional Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contract Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contract Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contract ID:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      CC24ARML7LFECY4UZONMEJMGNAANIANCJ5J7KWLDTBHWRGXRHDOVG3LG
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="text-sm font-medium text-blue-600">Stellar Testnet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Automated Rebalancing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Real-time Price Feeds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custom Drift Thresholds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Multi-Asset Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
