// Portfolio calculation utilities

/**
 * Format currency value with appropriate precision
 */
export function formatCurrency(value: number, currency: string = 'USD', decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage with appropriate precision
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0.0%';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return (value / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    return (value / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    return (value / 1e3).toFixed(decimals) + 'K';
  } else {
    return value.toFixed(decimals);
  }
}

/**
 * Calculate portfolio drift from target allocations
 */
export function calculatePortfolioDrift(
  currentAllocations: Array<{ assetCode: string; percentage: number }>,
  targetAllocations: Array<{ assetCode: string; percentage: number }>
): number {
  if (currentAllocations.length === 0 || targetAllocations.length === 0) {
    return 0;
  }

  // Create maps for easier lookup
  const currentMap = new Map(
    currentAllocations.map(allocation => [allocation.assetCode, allocation.percentage])
  );
  const targetMap = new Map(
    targetAllocations.map(allocation => [allocation.assetCode, allocation.percentage])
  );

  // Calculate total drift
  let totalDrift = 0;
  const allAssets = new Set([...currentMap.keys(), ...targetMap.keys()]);

  allAssets.forEach(assetCode => {
    const current = currentMap.get(assetCode) || 0;
    const target = targetMap.get(assetCode) || 0;
    totalDrift += Math.abs(current - target);
  });

  return totalDrift / 2; // Divide by 2 because we're counting each deviation twice
}

/**
 * Calculate portfolio value from balances and prices
 */
export function calculatePortfolioValue(
  balances: Array<{ assetCode: string; balance: number }>,
  prices: Record<string, number>
): number {
  return balances.reduce((total, balance) => {
    const price = prices[balance.assetCode] || 0;
    return total + (balance.balance * price);
  }, 0);
}

/**
 * Calculate current portfolio allocations
 */
export function calculateCurrentAllocations(
  balances: Array<{ assetCode: string; balance: number }>,
  prices: Record<string, number>
): Array<{ assetCode: string; percentage: number; value: number }> {
  const totalValue = calculatePortfolioValue(balances, prices);
  
  if (totalValue === 0) {
    return balances.map(balance => ({
      assetCode: balance.assetCode,
      percentage: 0,
      value: 0,
    }));
  }

  return balances.map(balance => {
    const price = prices[balance.assetCode] || 0;
    const value = balance.balance * price;
    const percentage = (value / totalValue) * 100;

    return {
      assetCode: balance.assetCode,
      percentage,
      value,
    };
  });
}

/**
 * Calculate rebalancing trades needed
 */
export function calculateRebalancingTrades(
  currentAllocations: Array<{ assetCode: string; percentage: number; value: number }>,
  targetAllocations: Array<{ assetCode: string; percentage: number }>,
  totalValue: number
): Array<{ assetCode: string; action: 'buy' | 'sell'; amount: number; percentage: number }> {
  const trades: Array<{ assetCode: string; action: 'buy' | 'sell'; amount: number; percentage: number }> = [];
  
  // Create maps for easier lookup
  const currentMap = new Map(
    currentAllocations.map(allocation => [allocation.assetCode, allocation])
  );
  const targetMap = new Map(
    targetAllocations.map(allocation => [allocation.assetCode, allocation])
  );

  // Calculate trades for each asset
  const allAssets = new Set([...currentMap.keys(), ...targetMap.keys()]);

  allAssets.forEach(assetCode => {
    const current = currentMap.get(assetCode);
    const target = targetMap.get(assetCode);

    const currentPercentage = current?.percentage || 0;
    const targetPercentage = target?.percentage || 0;
    const difference = targetPercentage - currentPercentage;

    // Only include trades that are significant (> 0.1%)
    if (Math.abs(difference) > 0.1) {
      const targetValue = (targetPercentage / 100) * totalValue;
      const currentValue = current?.value || 0;
      const tradeAmount = targetValue - currentValue;

      trades.push({
        assetCode,
        action: tradeAmount > 0 ? 'buy' : 'sell',
        amount: Math.abs(tradeAmount),
        percentage: Math.abs(difference),
      });
    }
  });

  return trades.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Calculate portfolio performance metrics
 */
export function calculatePortfolioPerformance(
  currentValue: number,
  initialValue: number,
  timePeriod: number // in days
): {
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  dailyReturn: number;
} {
  if (initialValue === 0) {
    return {
      totalReturn: 0,
      totalReturnPercentage: 0,
      annualizedReturn: 0,
      dailyReturn: 0,
    };
  }

  const totalReturn = currentValue - initialValue;
  const totalReturnPercentage = (totalReturn / initialValue) * 100;
  const dailyReturn = timePeriod > 0 ? totalReturnPercentage / timePeriod : 0;
  const annualizedReturn = timePeriod > 0 ? 
    Math.pow(1 + (totalReturnPercentage / 100), 365 / timePeriod) - 1 : 0;

  return {
    totalReturn,
    totalReturnPercentage,
    annualizedReturn: annualizedReturn * 100,
    dailyReturn,
  };
}

/**
 * Calculate Sharpe ratio (simplified version)
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.02 // 2% annual risk-free rate
): number {
  if (returns.length === 0) {
    return 0;
  }

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation === 0) {
    return 0;
  }

  return (meanReturn - riskFreeRate / 365) / standardDeviation; // Daily Sharpe ratio
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let maxDrawdown = 0;
  let peak = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    } else {
      const drawdown = (peak - values[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }

  return maxDrawdown * 100; // Return as percentage
}

/**
 * Validate allocation percentages
 */
export function validateAllocations(allocations: Array<{ percentage: number }>): {
  isValid: boolean;
  total: number;
  errors: string[];
} {
  const errors: string[] = [];
  const total = allocations.reduce((sum, allocation) => sum + allocation.percentage, 0);

  // Check if total is close to 100%
  if (Math.abs(total - 100) > 0.01) {
    errors.push(`Total allocation must equal 100%. Current total: ${total.toFixed(2)}%`);
  }

  // Check for negative percentages
  const negativeAllocations = allocations.filter(allocation => allocation.percentage < 0);
  if (negativeAllocations.length > 0) {
    errors.push('Allocation percentages cannot be negative');
  }

  // Check for percentages over 100%
  const overAllocations = allocations.filter(allocation => allocation.percentage > 100);
  if (overAllocations.length > 0) {
    errors.push('Individual allocation percentages cannot exceed 100%');
  }

  return {
    isValid: errors.length === 0,
    total,
    errors,
  };
}

/**
 * Calculate transaction fees (Stellar network)
 */
export function calculateTransactionFees(
  numOperations: number,
  baseFee: number = 0.00001 // Base fee per operation in XLM
): number {
  return numOperations * baseFee;
}

/**
 * Calculate slippage for large trades
 */
export function calculateSlippage(
  tradeAmount: number,
  liquidity: number,
  slippageTolerance: number = 0.5 // 0.5% default
): number {
  if (liquidity === 0) {
    return slippageTolerance;
  }

  // Simple slippage calculation based on trade size relative to liquidity
  const impact = (tradeAmount / liquidity) * 100;
  return Math.min(impact, slippageTolerance);
}