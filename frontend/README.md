# Portfolio Rebalancer Frontend

A modern React/Next.js frontend for the Portfolio Rebalancer smart contract on Stellar network.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Freighter wallet browser extension
- Stellar testnet account with XLM

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Portfolio dashboard
│   ├── rebalance/         # Rebalancing interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Layout.tsx         # Main layout component
│   ├── PortfolioManager.tsx
│   ├── PortfolioCreator.tsx
│   ├── PortfolioOverview.tsx
│   ├── WalletConnect.tsx
│   └── PriceDisplay.tsx
├── hooks/                 # Custom React hooks
│   ├── useWallet.ts       # Freighter wallet integration
│   ├── usePortfolio.ts    # Portfolio data management
│   ├── usePrices.ts       # Price feed integration
│   └── useSorobanContract.ts # Smart contract integration
├── utils/                 # Utilities and constants
│   ├── constants.ts       # Configuration constants
│   └── calculations.ts    # Portfolio calculations
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🔧 Configuration

The application is configured to work with the deployed smart contract:

- **Contract ID**: `CC24ARML7LFECY4UZONMEJMGNAANIANCJ5J7KWLDTBHWRGXRHDOVG3LG`
- **Network**: Stellar Testnet
- **Oracle**: Reflector Oracle integration

Environment variables are configured in `next.config.mjs`:

```javascript
env: {
  NEXT_PUBLIC_CONTRACT_ID: 'CC24ARML7LFECY4UZONMEJMGNAANIANCJ5J7KWLDTBHWRGXRHDOVG3LG',
  NEXT_PUBLIC_STELLAR_NETWORK: 'testnet',
  NEXT_PUBLIC_HORIZON_URL: 'https://horizon-testnet.stellar.org',
  NEXT_PUBLIC_SOROBAN_RPC_URL: 'https://soroban-testnet.stellar.org',
  NEXT_PUBLIC_ORACLE_CONTRACT_ID: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
}
```

## 🎯 Features

### ✅ Implemented

- **Portfolio Creation** - Set target allocations and drift thresholds
- **Real-time Monitoring** - Track portfolio drift and rebalancing needs
- **Automated Rebalancing** - Execute rebalancing when drift exceeds threshold
- **Wallet Integration** - Connect with Freighter wallet
- **Price Feeds** - Integration with Reflector Oracle (with fallback)
- **Responsive Design** - Mobile-friendly interface
- **Error Handling** - Comprehensive error states and user feedback

### 🔄 Demo Mode

Currently running in demo mode with mock contract interactions. The frontend is ready for integration with the actual Soroban SDK.

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Stellar SDK** - Blockchain interactions

## 🔗 Smart Contract Integration

The frontend integrates with the Portfolio Rebalancer smart contract through:

1. **Contract Functions**:

   - `create_portfolio()` - Create new portfolio
   - `update_allocations()` - Update target allocations
   - `needs_rebalancing()` - Check if rebalancing needed
   - `rebalance_portfolio()` - Execute rebalancing
   - `get_portfolio_status()` - Get current portfolio status

2. **Data Structures**:
   - `Portfolio` - Portfolio configuration and status
   - `Allocation` - Asset allocation targets
   - `AssetInfo` - Asset information and metadata

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

For production deployment, set these environment variables:

```env
NEXT_PUBLIC_CONTRACT_ID=your_contract_id
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_ORACLE_CONTRACT_ID=your_oracle_contract_id
```

## 📱 Usage

1. **Connect Wallet** - Install Freighter and connect to Stellar testnet
2. **Create Portfolio** - Set your target asset allocations
3. **Monitor** - Watch real-time portfolio drift
4. **Rebalance** - Execute rebalancing when needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built for the Stellar hackathon with ❤️**
