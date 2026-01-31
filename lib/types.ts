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

export interface AiStockInsight {
  id?: string; // Optional for when reading from cache
  ticker: string;
  signal: 'SILNÝ NÁKUP' | 'NÁKUP' | 'DRŽAŤ' | 'PREDAJ' | 'SILNÝ PREDAJ'; // Updated to Slovak
  signal_color: 'dark_green' | 'green' | 'gray' | 'orange' | 'red';
  general_summary: string;
  personalized_summary: string;
  confidence_level: 'low' | 'medium' | 'high';
  generated_date: string; // YYYY-MM-DD - Renamed from created_at
}


