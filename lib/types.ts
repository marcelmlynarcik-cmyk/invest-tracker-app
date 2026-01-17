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

export interface ExchangeRateData {
  base_code: string
  target_code: string
  conversion_rate: number
}

export interface UserStock {
  id: string
  ticker: string
  shares: number
  avg_price: number // Average price in the stock's native currency
  currency: string // E.g., 'USD', 'EUR', 'CZK'
  created_at: string
}

