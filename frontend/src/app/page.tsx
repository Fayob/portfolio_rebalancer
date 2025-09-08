import Layout from '../components/Layout';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Zap, Star, Users, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="p-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Built on Stellar Network
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Portfolio
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Rebalancer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
            Automate your Stellar portfolio with intelligent rebalancing strategies. 
            Low-cost, fast transactions with real-time Oracle price feeds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/rebalance"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              View Demo
            </Link>
          </div>

          {/* Contract Info Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <span className="text-gray-600 dark:text-gray-400 mr-2">Contract:</span>
            <code className="text-blue-600 dark:text-blue-400 font-mono">
              CC24ARML7LFECY4UZONMEJMGNAANIANCJ5J7KWLDTBHWRGXRHDOVG3LG
            </code>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Automated Rebalancing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Set your target allocations and let the system maintain them automatically when drift exceeds your threshold. No manual intervention required.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Secure & Transparent
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Built on Stellar blockchain with smart contracts. Your funds remain in your control with full transparency and auditability.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Real-time Oracle Feeds
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Powered by Reflector Oracle for accurate, real-time price feeds ensuring precise rebalancing decisions based on current market conditions.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Connect your Freighter wallet to Stellar testnet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Set your target asset allocations and drift threshold</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Monitor Drift</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">System continuously monitors portfolio drift</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Auto Rebalance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Execute trades when drift exceeds threshold</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">$0.00001</div>
              <div className="text-blue-100">Transaction Cost</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">3-5s</div>
              <div className="text-blue-100">Rebalancing Speed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Perfect For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">DeFi Enthusiasts</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Maintain optimal asset allocations across multiple DeFi protocols automatically.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Institutional Funds</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Algorithmic portfolio management for funds and DAOs with custom strategies.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Long-term Investors</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Set-and-forget portfolio management with systematic rebalancing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Automate Your Portfolio?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the future of DeFi portfolio management. Start with a small testnet portfolio and scale up as you gain confidence.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Building Your Portfolio
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}