'use client';

import Layout from '../../components/Layout';
import { Settings as SettingsIcon, Palette, Bell, Shield, Network, User, Globe, Moon, Sun } from 'lucide-react';

export default function Settings() {
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="gradient-text">Settings</span> & Preferences
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Customize your Portfolio Rebalancer experience. Coming soon with comprehensive settings 
            for personalization, notifications, and account management.
          </p>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customize the look and feel of your dashboard.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Dark/Light theme toggle</li>
              <li>• Custom color schemes</li>
              <li>• Font size preferences</li>
              <li>• Layout customization</li>
            </ul>
          </div>

          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your notification preferences.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Rebalancing alerts</li>
              <li>• Price change notifications</li>
              <li>• Transaction confirmations</li>
              <li>• Email/SMS preferences</li>
            </ul>
          </div>

          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Security
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your security and privacy settings.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Two-factor authentication</li>
              <li>• Session management</li>
              <li>• Privacy controls</li>
              <li>• Data export options</li>
            </ul>
          </div>

          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                <Network className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Network
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure network and blockchain settings.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Testnet/Mainnet toggle</li>
              <li>• RPC endpoint configuration</li>
              <li>• Gas price settings</li>
              <li>• Transaction timeouts</li>
            </ul>
          </div>

          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your account information and preferences.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Profile information</li>
              <li>• Wallet connections</li>
              <li>• Portfolio preferences</li>
              <li>• Backup & restore</li>
            </ul>
          </div>

          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Localization
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customize language and regional settings.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>• Language selection</li>
              <li>• Currency preferences</li>
              <li>• Date/time formats</li>
              <li>• Number formatting</li>
            </ul>
          </div>
        </div>

        {/* Current Theme Toggle Demo */}
        <div className="card p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Theme Preview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Toggle between light and dark themes (browser default)
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Light</span>
              </div>
              <div className="flex items-center space-x-2">
                <Moon className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Dark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Settings Panel Coming Soon!</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We're building a comprehensive settings panel to give you full control over your 
            Portfolio Rebalancer experience. Stay tuned for these powerful customization options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Go to Dashboard
            </a>
            <a
              href="/rebalance"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Try Rebalancing
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
