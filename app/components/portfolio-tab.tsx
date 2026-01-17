"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCZK } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useCallback } from "react"
import { UserStock } from "@/lib/types"
import { fetchStockPrice, fetchExchangeRate, searchStockSymbols } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/lib/hooks"
import { PlusCircle, Loader2 } from "lucide-react"

interface EnhancedUserStock extends UserStock {
  currentPrice: number | null
  currentPriceCZK: number | null
  investedCZK: number
  currentValueCZK: number
  profitCZK: number
  profitPercentage: number
  weightInPortfolio: number // Percentage
  conversionRate?: number // Added to resolve Vercel build error
}

export function PortfolioTab() {
  const [loading, setLoading] = useState(true)
  const [userStocks, setUserStocks] = useState<EnhancedUserStock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string; currency: string } | null>(null)
  const [shares, setShares] = useState("")
  const [avgPrice, setAvgPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true)
    const { data: stocksData, error } = await supabase.from("user_stocks").select("*")

    if (error) {
      console.error("Error fetching user stocks:", error)
      setLoading(false)
      return
    }

    if (stocksData && stocksData.length > 0) {
      const enhancedStocks: EnhancedUserStock[] = []
      let totalPortfolioValueCZK = 0

      // First pass to get all current prices and exchange rates
      const stockPromises = stocksData.map(async (stock: UserStock) => {
        let priceData = null;
        try {
          priceData = await fetchStockPrice(stock.ticker)
        } catch (e) {
          console.error(`Error fetching price for ${stock.ticker}:`, e);
        }
        const currentPrice = priceData?.price || null
        let conversionRate = 1

        if (stock.currency !== "CZK") {
          let rateData = null;
          try {
            rateData = await fetchExchangeRate(stock.currency, "CZK")
          } catch (e) {
            console.error(`Error fetching exchange rate for ${stock.currency}/CZK:`, e);
          }
          conversionRate = rateData?.conversion_rate || 1
        }

        const currentPriceCZK = currentPrice ? currentPrice * conversionRate : null
        const investedCZK = stock.shares * stock.avg_price * conversionRate

        return {
          ...stock,
          currentPrice,
          currentPriceCZK,
          investedCZK,
          conversionRate, // Store for later use
        }
      })

      const resolvedStocks = await Promise.all(stockPromises)

      // Calculate total portfolio value in CZK
      totalPortfolioValueCZK = resolvedStocks.reduce((sum, stock) => {
        return sum + (stock.currentPriceCZK ? stock.currentPriceCZK * stock.shares : 0)
      }, 0)


      // Second pass to calculate profit and weight
      resolvedStocks.forEach(stock => {
        const currentValueCZK = stock.currentPriceCZK ? stock.currentPriceCZK * stock.shares : stock.investedCZK
        const profitCZK = currentValueCZK - stock.investedCZK
        const profitPercentage = stock.investedCZK === 0 ? 0 : (profitCZK / stock.investedCZK) * 100
        const weightInPortfolio = totalPortfolioValueCZK === 0 ? 0 : (currentValueCZK / totalPortfolioValueCZK) * 100

        enhancedStocks.push({
          ...stock,
          currentValueCZK,
          profitCZK,
          profitPercentage,
          weightInPortfolio,
        })
      })

      setUserStocks(enhancedStocks)
    } else {
      setUserStocks([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  useEffect(() => {
    async function performSearch() {
      const searchKeywords = String(debouncedSearchTerm); // Ensure it's a string
      console.log("debouncedSearchTerm (after String()):", searchKeywords);

      if (!process.env.NEXT_PUBLIC_FINNHUB_API_KEY) {
        console.error("Finnhub API key is not set in environment variables. Cannot perform stock search.");
        setSearchResults(null);
        return;
      }

      if (searchKeywords.length > 1) {
        try {
          const results = await searchStockSymbols(searchKeywords)
          console.log("searchStockSymbols results:", results);
          if (results) {
            setSearchResults(results)
          } else {
            console.warn("searchStockSymbols returned no results or an empty array.");
          }
        } catch (e) {
          console.error("Error calling searchStockSymbols:", e);
          setSearchResults(null);
        }
      } else {
        setSearchResults(null)
      }
    }
    performSearch()
  }, [debouncedSearchTerm])

  const handleAddOrUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleAddOrUpdateStock called.");
    console.log("selectedStock:", selectedStock);
    console.log("shares:", shares);
    console.log("avgPrice:", avgPrice);

    if (!selectedStock || !shares || !avgPrice) {
      console.log("Validation failed: selectedStock, shares, or avgPrice is missing.");
      return
    }

    setIsSubmitting(true)
    const newStock = {
      ticker: selectedStock.symbol,
      shares: parseFloat(shares),
      avg_price: parseFloat(avgPrice),
      currency: selectedStock.currency,
    }

    const { error } = await supabase.from("user_stocks").insert([newStock])

    if (error) {
      console.error("Error adding/updating stock to Supabase:", error)
    } else {
      console.log("Stock added/updated successfully.");
      setSearchTerm("")
      setSearchResults(null)
      setSelectedStock(null)
      setShares("")
      setAvgPrice("")
      await fetchPortfolioData() // Refresh data
      router.refresh() // Trigger a Next.js router refresh
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return <div>Loading portfolio...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add/Update Stock</CardTitle>
          <CardDescription>Search for a stock and add your holdings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOrUpdateStock} className="space-y-4">
            <div>
              <Label htmlFor="stock-search">Stock Ticker</Label>
              <Input
                id="stock-search"
                type="text"
                placeholder="Search by symbol or name (e.g., AAPL, Apple Inc.)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setSelectedStock(null) // Reset selection on search term change
                }}
                disabled={isSubmitting}
              />
              {searchResults && searchResults.length > 0 && !selectedStock && (
                <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="p-2 cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setSelectedStock({ symbol: result.symbol, name: result.name, currency: result.currency })
                        setSearchTerm(`${result.name} (${result.symbol})`)
                        setSearchResults(null)
                      }}
                    >
                      {result.name} ({result.symbol}) - {result.currency}
                    </div>
                  ))}
                </div>
              )}
              {selectedStock && (
                <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedStock.name} ({selectedStock.symbol}) - {selectedStock.currency}</p>
              )}
            </div>

            <div>
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="avg-price">Average Purchase Price ({selectedStock?.currency || "USD"})</Label>
              <Input
                id="avg-price"
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={!selectedStock || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add/Update Stock
            </Button>
          </form>
        </CardContent>
      </Card>

      {userStocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Avg Price (CZK)</TableHead>
                  <TableHead>Current Price (CZK)</TableHead>
                  <TableHead>Current Value (CZK)</TableHead>
                  <TableHead>Profit (CZK)</TableHead>
                  <TableHead>Profit (%)</TableHead>
                  <TableHead>Weight (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.shares}</TableCell>
                    <TableCell>{formatCZK(stock.avg_price * (stock.conversionRate || 1))}</TableCell>
                    <TableCell>{formatCZK(stock.currentPriceCZK)}</TableCell>
                    <TableCell>{formatCZK(stock.currentValueCZK)}</TableCell>
                    <TableCell>{formatCZK(stock.profitCZK)}</TableCell>
                    <TableCell>{stock.profitPercentage.toFixed(2)}%</TableCell>
                    <TableCell>{stock.weightInPortfolio.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
