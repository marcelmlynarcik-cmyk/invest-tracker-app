import { Transaction } from "@/lib/types"

export interface Stock {
  id: string
  ticker: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  purchaseDate: string
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


