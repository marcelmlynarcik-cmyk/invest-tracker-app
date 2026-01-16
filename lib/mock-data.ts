export interface Stock {
  id: string
  ticker: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  purchaseDate: string
}

export interface Transaction {
  id: string
  type: "deposit" | "buy" | "sell"
  date: string
  amount: number
  ticker?: string
  shares?: number
  pricePerShare?: number
}

export const mockStocks: Stock[] = [
  {
    id: "1",
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 15,
    avgPrice: 4200,
    currentPrice: 4850,
    purchaseDate: "2024-03-15",
  },
  {
    id: "2",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    shares: 8,
    avgPrice: 9200,
    currentPrice: 10150,
    purchaseDate: "2024-02-20",
  },
  {
    id: "3",
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 5,
    avgPrice: 3800,
    currentPrice: 4100,
    purchaseDate: "2024-04-10",
  },
  {
    id: "4",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    shares: 10,
    avgPrice: 2200,
    currentPrice: 2950,
    purchaseDate: "2024-01-25",
  },
  {
    id: "5",
    ticker: "TSLA",
    name: "Tesla Inc.",
    shares: 6,
    avgPrice: 6500,
    currentPrice: 5800,
    purchaseDate: "2024-05-05",
  },
]

export const mockTransactions: Transaction[] = [
  { id: "1", type: "deposit", date: "2024-01-15", amount: 100000 },
  { id: "2", type: "buy", date: "2024-01-25", amount: 22000, ticker: "NVDA", shares: 10, pricePerShare: 2200 },
  { id: "3", type: "deposit", date: "2024-02-10", amount: 80000 },
  { id: "4", type: "buy", date: "2024-02-20", amount: 73600, ticker: "MSFT", shares: 8, pricePerShare: 9200 },
  { id: "5", type: "deposit", date: "2024-03-01", amount: 75000 },
  { id: "6", type: "buy", date: "2024-03-15", amount: 63000, ticker: "AAPL", shares: 15, pricePerShare: 4200 },
  { id: "7", type: "buy", date: "2024-04-10", amount: 19000, ticker: "GOOGL", shares: 5, pricePerShare: 3800 },
  { id: "8", type: "deposit", date: "2024-04-20", amount: 50000 },
  { id: "9", type: "buy", date: "2024-05-05", amount: 39000, ticker: "TSLA", shares: 6, pricePerShare: 6500 },
]

export const portfolioHistory = [
  { date: "Jan", value: 100000, invested: 100000 },
  { date: "Feb", value: 128000, invested: 180000 },
  { date: "Mar", value: 265000, invested: 255000 },
  { date: "Apr", value: 295000, invested: 274000 },
  { date: "May", value: 320000, invested: 324000 },
  { date: "Jun", value: 345000, invested: 324000 },
  { date: "Jul", value: 358750, invested: 324000 },
]

export const weeklyPerformance = [
  { day: "Mon", value: 2.1 },
  { day: "Tue", value: -0.8 },
  { day: "Wed", value: 1.5 },
  { day: "Thu", value: 0.3 },
  { day: "Fri", value: 1.2 },
]

export const monthlyPerformance = [
  { month: "Jan", value: 5.2 },
  { month: "Feb", value: 8.1 },
  { month: "Mar", value: -2.3 },
  { month: "Apr", value: 6.8 },
  { month: "May", value: 4.5 },
  { month: "Jun", value: 3.2 },
]

export function calculatePortfolioStats(stocks: Stock[]) {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.shares, 0)
  const totalInvested = stocks.reduce((sum, stock) => sum + stock.avgPrice * stock.shares, 0)
  const totalProfit = totalValue - totalInvested
  const profitPercentage = ((totalProfit / totalInvested) * 100).toFixed(2)

  return {
    totalValue,
    totalInvested,
    totalProfit,
    profitPercentage: Number.parseFloat(profitPercentage),
  }
}

export function calculateStockProfit(stock: Stock) {
  const invested = stock.avgPrice * stock.shares
  const currentValue = stock.currentPrice * stock.shares
  const profit = currentValue - invested
  const profitPercentage = ((profit / invested) * 100).toFixed(2)

  return {
    invested,
    currentValue,
    profit,
    profitPercentage: Number.parseFloat(profitPercentage),
  }
}

export function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
