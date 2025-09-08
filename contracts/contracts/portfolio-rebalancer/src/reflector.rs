use soroban_sdk::{contractclient, contracttype, Address, Env, Symbol};

/// Reflector Oracle Asset types
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Asset {
    Stellar(Address),
    Other(Symbol),
}

/// Price data structure returned by Reflector Oracle
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    pub price: u64,
    pub timestamp: u64,
}

/// Reflector Oracle Client Interface
#[contractclient(name = "ReflectorClient")]
pub trait ReflectorOracle {
    /// Get the most recent price for an asset
    fn lastprice(env: Env, asset: Asset) -> Option<PriceData>;
    
    /// Get price at a specific timestamp  
    fn price(env: Env, asset: Asset, timestamp: u64) -> Option<PriceData>;
    
    /// Get Time-Weighted Average Price over specified periods
    fn twap(env: Env, asset: Asset, periods: u32) -> Option<PriceData>;
}