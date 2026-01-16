"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Calendar } from "lucide-react"
import { mockStocks, calculatePortfolioStats, portfolioHistory } from "@/lib/mock-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function PerformanceTab() {
  const stats = calculatePortfolioStats(mockStocks)
  const isProfit = stats.totalProfit >= 0

  // Calculate additional stats
  const firstValue = portfolioHistory[0].value
  const lastValue = portfolioHistory[portfolioHistory.length - 1].value
  const totalGrowth = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)

  const monthlyReturns = portfolioHistory.slice(1).map((item, index) => {
    const prevValue = portfolioHistory[index].value
    return ((item.value - prevValue) / prevValue) * 100
  })
  const avgMonthlyReturn = (monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length).toFixed(2)
  const bestMonth = Math.max(...monthlyReturns).toFixed(1)
  const worstMonth = Math.min(...monthlyReturns).toFixed(1)

  return (
    <div className="space-y-4 pb-4">
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className={`text-4xl font-bold tracking-tight ${isProfit ? "text-primary" : "text-destructive"}`}>
            {isProfit ? "+" : ""}
            {stats.profitPercentage}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total return on investment</p>
        </CardContent>
      </Card>

      {/* Growth Chart */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickMargin={8}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency: "CZK",
                      minimumFractionDigits: 0,
                    }).format(value),
                    "Value",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-sm touch-active">
          <CardHeader className="flex flex-row items-center gap-2 pb-1 px-3 pt-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Growth</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div
              className={`text-xl font-bold ${Number.parseFloat(totalGrowth) >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {Number.parseFloat(totalGrowth) >= 0 ? "+" : ""}
              {totalGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm touch-active">
          <CardHeader className="flex flex-row items-center gap-2 pb-1 px-3 pt-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Monthly</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div
              className={`text-xl font-bold ${Number.parseFloat(avgMonthlyReturn) >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {Number.parseFloat(avgMonthlyReturn) >= 0 ? "+" : ""}
              {avgMonthlyReturn}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Performance Stats</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Best Month</span>
              <span className="font-semibold text-primary">+{bestMonth}%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Worst Month</span>
              <span
                className={`font-semibold ${Number.parseFloat(worstMonth) >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {Number.parseFloat(worstMonth) >= 0 ? "+" : ""}
                {worstMonth}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Tracking Period</span>
              <span className="font-semibold">{portfolioHistory.length} months</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
