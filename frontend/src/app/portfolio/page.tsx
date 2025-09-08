'use client';

import Layout from '../../components/Layout';
import { PieChart, TrendingUp, BarChart3, Clock, Star, Zap } from 'lucide-react';

export default function Portfolio() {
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Portfolio <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Advanced portfolio analytics and performance tracking. Coming soon with detailed insights, 
            historical performance, and comprehensive reporting.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <PieChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Asset Allocation Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed breakdown of your portfolio allocation with visual charts and drift analysis.
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Performance Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your portfolio performance over time with detailed metrics and comparisons.
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Risk Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive risk metrics including volatility, Sharpe ratio, and drawdown analysis.
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Historical Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              View historical performance data and track your portfolio's evolution over time.
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Real-time Updates
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Live portfolio updates with real-time price feeds and instant rebalancing notifications.
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Custom Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate custom reports and export your portfolio data for external analysis.
            </p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Portfolio Analytics Coming Soon!</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We're working hard to bring you comprehensive portfolio analytics. 
            Stay tuned for advanced features including performance tracking, risk analysis, and detailed reporting.
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
