export interface Transaction {
  id: string
  type: "deposit" | "withdraw"
  date: string
  amount: number
}

export interface WeeklyValue {
  id: string
  date: string
  value: number
}

export interface StockData {
  symbol: string
  price: number
  // Add other relevant fields from Alpha Vantage if needed, e.g., 'open', 'high', 'low', 'volume'
}

export interface UserStock {
  ticker: string; // A
  name: string; // B
  shares: number; // C
  averagePrice: number; // D
  currentPrice: number; // E
  percentDiff: number; // F
  currentValueOriginalCurrency: number; // G
  profitOriginalCurrency: number; // H
  portfolioWeightPercent: number; // I
  recommendation: string; // J
  currency: string; // K
  currentValueCZK: number; // L
  profitCZK: number; // M
}

