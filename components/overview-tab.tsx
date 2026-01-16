"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet, PiggyBank } from "lucide-react"
import {
  mockStocks,
  calculatePortfolioStats,
  formatCZK,
  portfolioHistory,
  weeklyPerformance,
  monthlyPerformance,
} from "@/lib/mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts"

export function OverviewTab() {
  const stats = calculatePortfolioStats(mockStocks)
  const isProfit = stats.totalProfit >= 0

  return (
    <div className="space-y-4 pb-4">
      {/* Summary Cards */}
      <div className="grid gap-3">
        <Card className="shadow-sm touch-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold tracking-tight">{formatCZK(stats.totalValue)}</div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm touch-active">
            <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Invested</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold">{formatCZK(stats.totalInvested)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm touch-active">
            <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${isProfit ? "text-primary" : "text-destructive"}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-lg font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
                {isProfit ? "+" : ""}
                {formatCZK(stats.totalProfit)}
              </div>
              <p className={`text-xs ${isProfit ? "text-primary" : "text-destructive"}`}>
                {isProfit ? "+" : ""}
                {stats.profitPercentage}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Value Chart - taller for better touch interaction */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Portfolio Growth</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                  formatter={(value: number) => [formatCZK(value), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="invested"
                  name="Invested"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickMargin={8}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Change"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {weeklyPerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickMargin={8}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Return"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {monthlyPerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
