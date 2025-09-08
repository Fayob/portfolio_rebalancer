#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, token, 
    Address, Env, Map, Vec, String, Symbol, symbol_short
};

mod reflector;
use crate::reflector::ReflectorClient;

// Error codes for the contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
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

// Data structures for the portfolio rebalancer
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AssetInfo {
    pub address: Address,
    pub symbol: String,
    pub decimals: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Allocation {
    pub asset: AssetInfo,
    pub target_percent: u32, // Basis points (10000 = 100%)
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Portfolio {
    pub owner: Address,
    pub allocations: Vec<Allocation>,
    pub drift_threshold: u32, // Basis points
    pub last_rebalance: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RebalanceResult {
    pub trades_executed: u32,
    pub total_gas_used: u64,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceInfo {
    pub asset: AssetInfo,
    pub price: u64, // Price in stroops (7 decimal places)
    pub timestamp: u64,
}

// Storage keys
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const PORTFOLIOS: Symbol = symbol_short!("PORTF");
const ORACLE_ADDRESS: Symbol = symbol_short!("ORACLE");
const SUPPORTED_ASSETS: Symbol = symbol_short!("ASSETS");

#[contract]
pub struct PortfolioRebalancer;

#[contractimpl]
impl PortfolioRebalancer {
    /// Initialize the contract with admin and oracle address
    pub fn initialize(env: Env, admin: Address, oracle_address: Address) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(Error::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&ORACLE_ADDRESS, &oracle_address);
        
        Ok(())
    }

    /// Add supported asset to the contract
    pub fn add_supported_asset(
        env: Env,
        asset_address: Address,
        symbol: String,
        decimals: u32,
    ) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let asset_info = AssetInfo {
            address: asset_address.clone(),
            symbol,
            decimals,
        };

        
        let mut assets: Vec<AssetInfo> = env.storage().instance()
            .get(&SUPPORTED_ASSETS)
            .unwrap_or(Vec::new(&env));
        
        assets.push_back(asset_info);
        env.storage().instance().set(&SUPPORTED_ASSETS, &assets);
        
        Ok(())
    }

    /// Create a new portfolio for a user
    pub fn create_portfolio(
        env: Env,
        owner: Address,
        allocations: Vec<Allocation>,
        drift_threshold: u32,
    ) -> Result<(), Error> {
        owner.require_auth();

        if drift_threshold == 0 || drift_threshold > 5000 { // Max 50% drift
            return Err(Error::InvalidDriftThreshold);
        }

        // Validate allocations sum to 100%
        let total_percent: u32 = allocations.iter().map(|a| a.target_percent).sum();
        if total_percent != 10000 { // 10000 basis points = 100%
            return Err(Error::InvalidAllocation);
        }

        let portfolio = Portfolio {
            owner: owner.clone(),
            allocations,
            drift_threshold,
            last_rebalance: env.ledger().timestamp(),
            is_active: true,
        };

        let mut portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .unwrap_or(Map::new(&env));
        
        portfolios.set(owner, portfolio);
        env.storage().instance().set(&PORTFOLIOS, &portfolios);
        
        Ok(())
    }

    /// Update portfolio allocations
    pub fn update_allocations(
        env: Env,
        owner: Address,
        new_allocations: Vec<Allocation>,
    ) -> Result<(), Error> {
        owner.require_auth();

        let mut portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        let mut portfolio = portfolios.get(owner.clone())
            .ok_or(Error::Unauthorized)?;

        // Validate allocations sum to 100%
        let total_percent: u32 = new_allocations.iter().map(|a| a.target_percent).sum();
        if total_percent != 10000 {
            return Err(Error::InvalidAllocation);
        }

        portfolio.allocations = new_allocations;
        portfolios.set(owner, portfolio);
        env.storage().instance().set(&PORTFOLIOS, &portfolios);
        
        Ok(())
    }

    /// Check if portfolio needs rebalancing
    pub fn needs_rebalancing(env: Env, owner: Address) -> Result<bool, Error> {
        let portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        let portfolio = portfolios.get(owner.clone())
            .ok_or(Error::Unauthorized)?;

        if !portfolio.is_active {
            return Ok(false);
        }

        let current_balances = Self::get_portfolio_balances(&env, &owner)?;
        let prices = Self::get_asset_prices(&env, &portfolio.allocations)?;
        
        let total_value = Self::calculate_total_value(&current_balances, &prices);
        
        for allocation in portfolio.allocations.iter() {
            let current_balance = current_balances.get(allocation.asset.address.clone()).unwrap_or(0);
            let asset_price = prices.get(allocation.asset.address.clone()).unwrap_or(0);
            let current_value = current_balance * asset_price / 10_000_000; // Adjust for decimals
            let current_percent = (current_value * 10000) / total_value;
            let target_percent_u64 = allocation.target_percent as u64;
            let drift = if current_percent > target_percent_u64 {
                current_percent - target_percent_u64
            } else {
                target_percent_u64 - current_percent
            };

            if drift > portfolio.drift_threshold as u64 {
                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Execute portfolio rebalancing
    pub fn rebalance_portfolio(env: Env, owner: Address) -> Result<RebalanceResult, Error> {
        owner.require_auth();

        let mut portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        let mut portfolio = portfolios.get(owner.clone())
            .ok_or(Error::Unauthorized)?;

        if !portfolio.is_active {
            return Err(Error::Unauthorized);
        }

        // Check if rebalancing is actually needed
        if !Self::needs_rebalancing(env.clone(), owner.clone())? {
            return Err(Error::NoRebalanceNeeded);
        }

        let current_balances = Self::get_portfolio_balances(&env, &owner)?;
        let prices = Self::get_asset_prices(&env, &portfolio.allocations)?;
        let total_value = Self::calculate_total_value(&current_balances, &prices);

        let mut trades_executed = 0u32;
        // Note: budget() method not available in this SDK version
        let start_gas = 0u64;

        // Calculate required trades and execute them
        for allocation in portfolio.allocations.iter() {
            let current_balance = current_balances.get(allocation.asset.address.clone()).unwrap_or(0);
            let asset_price = prices.get(allocation.asset.address.clone()).unwrap_or(0);
            let current_value = current_balance * asset_price / 10_000_000;
            let target_value = (total_value * allocation.target_percent as u64) / 10000;

            if current_value != target_value {
                let trade_amount = if current_value > target_value {
                    current_value - target_value
                } else {
                    target_value - current_value
                };

                // Execute trade (simplified for hackathon - in production would call DEX)
                if Self::execute_trade(&env, &owner, &allocation.asset, trade_amount, current_value > target_value)? {
                    trades_executed += 1;
                }
            }
        }

        portfolio.last_rebalance = env.ledger().timestamp();
        portfolios.set(owner, portfolio);
        env.storage().instance().set(&PORTFOLIOS, &portfolios);

        // Note: budget() method not available in this SDK version
        let end_gas = 0u64;
        
        Ok(RebalanceResult {
            trades_executed,
            total_gas_used: end_gas.saturating_sub(start_gas),
            timestamp: env.ledger().timestamp(),
        })
    }

    /// Get portfolio information for a user
    pub fn get_portfolio(env: Env, owner: Address) -> Result<Portfolio, Error> {
        let portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        portfolios.get(owner)
            .ok_or(Error::Unauthorized)
    }

    /// Get current portfolio balances and values
    pub fn get_portfolio_status(env: Env, owner: Address) -> Result<Map<Address, u64>, Error> {
        let portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        let portfolio = portfolios.get(owner.clone())
            .ok_or(Error::Unauthorized)?;

        let current_balances = Self::get_portfolio_balances(&env, &owner)?;
        let prices = Self::get_asset_prices(&env, &portfolio.allocations)?;
        
        let mut status = Map::new(&env);
        let total_value = Self::calculate_total_value(&current_balances, &prices);

        for allocation in portfolio.allocations.iter() {
            let current_balance = current_balances.get(allocation.asset.address.clone()).unwrap_or(0);
            let asset_price = prices.get(allocation.asset.address.clone()).unwrap_or(0);
            let current_value = current_balance * asset_price / 10_000_000;
            let current_percent = (current_value * 10000) / total_value;
            
            status.set(allocation.asset.address.clone(), current_percent);
        }

        Ok(status)
    }

    /// Toggle portfolio active status
    pub fn toggle_portfolio_status(env: Env, owner: Address, is_active: bool) -> Result<(), Error> {
        owner.require_auth();

        let mut portfolios: Map<Address, Portfolio> = env.storage().instance()
            .get(&PORTFOLIOS)
            .ok_or(Error::NotInitialized)?;

        let mut portfolio = portfolios.get(owner.clone())
            .ok_or(Error::Unauthorized)?;

        portfolio.is_active = is_active;
        portfolios.set(owner, portfolio);
        env.storage().instance().set(&PORTFOLIOS, &portfolios);
        
        Ok(())
    }

    /// Update the Oracle address (Admin only)
    pub fn update_oracle_address(env: Env, new_oracle_address: Address) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        env.storage().instance().set(&ORACLE_ADDRESS, &new_oracle_address);
        
        Ok(())
    }

    /// Get current Oracle address
    pub fn get_oracle_address(env: Env) -> Result<Address, Error> {
        env.storage().instance()
            .get(&ORACLE_ADDRESS)
            .ok_or(Error::NotInitialized)
    }

    /// Get real-time price for a specific asset from Oracle
    pub fn get_asset_price(_env: Env, asset_symbol: String) -> Result<u64, Error> {
        // For hackathon demo, use fallback prices instead of Oracle
        Ok(Self::get_fallback_price(&asset_symbol))
    }

    // Private helper functions
    
    fn get_portfolio_balances(env: &Env, owner: &Address) -> Result<Map<Address, u64>, Error> {
        let mut balances = Map::new(env);
        
        // Get supported assets
        let assets: Vec<AssetInfo> = env.storage().instance()
            .get(&SUPPORTED_ASSETS)
            .unwrap_or(Vec::new(env));

        // For each asset, get the user's balance
        for asset in assets.iter() {
            let token_client = token::Client::new(env, &asset.address);
            let balance = token_client.balance(owner);
            balances.set(asset.address.clone(), balance as u64);
        }

        Ok(balances)
    }

    fn get_asset_prices(env: &Env, allocations: &Vec<Allocation>) -> Result<Map<Address, u64>, Error> {
        let mut prices = Map::new(env);
        
        // Get Oracle address from storage
        let oracle_address: Address = env.storage().instance()
            .get(&ORACLE_ADDRESS)
            .ok_or(Error::OracleError)?;
        
        // Create Reflector Oracle client
        let reflector_client = ReflectorClient::new(env, &oracle_address);
        
        for allocation in allocations.iter() {
            let price = Self::fetch_asset_price(env, &reflector_client, &allocation)?;
            prices.set(allocation.asset.address.clone(), price);
        }

        Ok(prices)
    }

    fn fetch_asset_price(
        _env: &Env, 
        _reflector_client: &ReflectorClient, 
        allocation: &Allocation
    ) -> Result<u64, Error> {
        // Determine asset type for Reflector Oracle
        // For hackathon demo, we'll use mock prices instead of complex symbol conversion
        let price = Self::get_fallback_price(&allocation.asset.symbol);
        Ok(price)
    }

    fn get_fallback_price(_symbol: &String) -> u64 {
        // Fallback prices for hackathon demo - simplified
        // In production, would properly match symbol strings
        10000000 // Default $1.00 in stroops for all assets
    }

    fn calculate_total_value(balances: &Map<Address, u64>, prices: &Map<Address, u64>) -> u64 {
        let mut total = 0u64;
        
        for (asset_addr, balance) in balances.iter() {
            let price = prices.get(asset_addr).unwrap_or(0);
            total += (balance * price) / 10_000_000; // Convert from stroops
        }
        
        total
    }

    fn execute_trade(
        _env: &Env,
        _owner: &Address,
        _asset: &AssetInfo,
        _amount: u64,
        _is_sell: bool,
    ) -> Result<bool, Error> {
        // Simplified trade execution for hackathon
        // In production, this would integrate with Stellar DEX or other AMM
        
        // For demo purposes, we'll just emit an event and return success
        // Real implementation would:
        // 1. Calculate optimal trade path
        // 2. Execute swap through DEX
        // 3. Handle slippage and failures
        // 4. Update balances
        
        Ok(true)
    }
}

mod test;