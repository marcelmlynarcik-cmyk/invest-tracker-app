import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  calculatePortfolioStats,
  formatCZK,
  portfolioHistory,
  Stock,
} from "@/lib/mock-data"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export function OverviewTab() {
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

  const stats = calculatePortfolioStats(stocks)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(stats.totalValue)}</CardTitle>
            <CardDescription>Total Portfolio Value</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(stats.totalInvested)}</CardTitle>
            <CardDescription>Total Invested</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(stats.totalProfit)}</CardTitle>
            <CardDescription>Total Profit</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{stats.profitPercentage}%</CardTitle>
            <CardDescription>Profit %</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
              />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>.
      </Card>
    </div>
  )
}
