#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, String, Address, testutils::Address as _};
use soroban_sdk::testutils::MockAuth;

#[test]
fn test_initialize_contract() {
    let env = Env::default();
    let contract_id = env.register(PortfolioRebalancer, ());
    let client = PortfolioRebalancerClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle_address = Address::generate(&env);

    env.mock_all_auths();

    let result = client.initialize(&admin, &oracle_address);
    assert!(result.is_ok());

    // Test that we can get the oracle address back
    let stored_oracle = client.get_oracle_address();
    assert!(stored_oracle.is_ok());
    assert_eq!(stored_oracle.unwrap(), oracle_address);
}

#[test]
fn test_create_portfolio() {
    let env = Env::default();
    let contract_id = env.register(PortfolioRebalancer, ());
    let client = PortfolioRebalancerClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle_address = Address::generate(&env);
    let user = Address::generate(&env);

    env.mock_all_auths();

    // Initialize contract
    client.initialize(&admin, &oracle_address).unwrap();

    // Add supported asset
    let asset_address = Address::generate(&env);
    client.add_supported_asset(&asset_address, &String::from_str(&env, "XLM"), &7).unwrap();

    // Create allocation
    let asset_info = AssetInfo {
        address: asset_address,
        symbol: String::from_str(&env, "XLM"),
        decimals: 7,
    };
    let allocation = Allocation {
        asset: asset_info,
        target_percent: 10000, // 100%
    };
    let allocations = vec![&env, allocation];

    // Create portfolio
    let result = client.create_portfolio(&user, &allocations, &500); // 5% drift threshold
    assert!(result.is_ok());

    // Verify portfolio was created
    let portfolio = client.get_portfolio(&user);
    assert!(portfolio.is_ok());
    assert_eq!(portfolio.unwrap().drift_threshold, 500);
}

#[test]
fn test_fallback_prices() {
    let env = Env::default();
    
    // Test fallback price function
    let xlm_price = PortfolioRebalancer::get_fallback_price(&String::from_str(&env, "XLM"));
    assert_eq!(xlm_price, 1200000);
    
    let usdc_price = PortfolioRebalancer::get_fallback_price(&String::from_str(&env, "USDC"));
    assert_eq!(usdc_price, 10000000);
    
    let unknown_price = PortfolioRebalancer::get_fallback_price(&String::from_str(&env, "UNKNOWN"));
    assert_eq!(unknown_price, 10000000);
}
