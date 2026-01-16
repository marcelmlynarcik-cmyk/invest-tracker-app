import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  calculateStockProfit,
  formatCZK,
  Stock,
} from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export function PortfolioTab() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getStocks() {
      const { data, error } = await supabase.from("stocks").select()
      if (error) {
        console.error("Error fetching stocks:", error)
      } else if (data) {
        const mappedData = data.map(stock => ({...stock, avgPrice: stock.avg_price, currentPrice: stock.current_price, purchaseDate: stock.purchase_date, id: stock.id.toString()}))
        setStocks(mappedData)
      }
      setLoading(false)
    }
    getStocks()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {stocks.map((stock) => {
        const stats = calculateStockProfit(stock)
        return (
          <Card key={stock.id}>
            <CardHeader>
              <CardTitle>{stock.ticker}</CardTitle>
              <CardDescription>{stock.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div>
                Shares: {stock.shares} @ {formatCZK(stock.avgPrice)}
              </div>
              <div>Current Price: {formatCZK(stock.currentPrice)}</div>
              <div>Invested: {formatCZK(stats.invested)}</div>
              <div>Current Value: {formatCZK(stats.currentValue)}</div>
              <div>Profit: {formatCZK(stats.profit)} ({stats.profitPercentage}%)</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
