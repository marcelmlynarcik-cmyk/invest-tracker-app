"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, TrendingDown, Scale } from "lucide-react"
import { formatCZK } from "@/lib/utils"
import { mockStocks, calculateStockProfit, calculatePortfolioStats } from "@/lib/mock-data"

export function BuyTipTab() {
  // Find the stock with the lowest current profit percentage (best buying opportunity)
  const stocksWithStats = mockStocks.map((stock) => ({
    ...stock,
    stats: calculateStockProfit(stock),
  }))

  const sortedByProfit = [...stocksWithStats].sort((a, b) => a.stats.profitPercentage - b.stats.profitPercentage)
  const recommendation = sortedByProfit[0]
  const portfolioStats = calculatePortfolioStats(mockStocks)

  // Calculate portfolio weight
  const stockWeight = ((recommendation.stats.currentValue / portfolioStats.totalValue) * 100).toFixed(1)
  const priceVsAvg = (
    ((recommendation.currentPrice - recommendation.avgPrice) / recommendation.avgPrice) *
    100
  ).toFixed(1)

  return (
    <div className="space-y-4 pb-4">
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              Recommendation
            </Badge>
          </div>
          <CardTitle className="text-2xl mt-2">{recommendation.ticker}</CardTitle>
          <CardDescription className="text-sm">{recommendation.name}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on your portfolio analysis, <strong>{recommendation.ticker}</strong> is currently showing the lowest
            relative performance at{" "}
            <span
              className={
                recommendation.stats.profitPercentage >= 0 ? "text-primary font-medium" : "text-destructive font-medium"
              }
            >
              {recommendation.stats.profitPercentage >= 0 ? "+" : ""}
              {recommendation.stats.profitPercentage}%
            </span>
            .{" "}
            {recommendation.stats.profitPercentage < 0
              ? "This could be a good opportunity to average down your position."
              : "Consider adding to this position to increase your exposure."}
          </p>
        </CardContent>
      </Card>

      {/* Price vs Average - compact for mobile */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Price vs Average</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Avg Price</span>
              <span className="font-medium">{formatCZK(recommendation.avgPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="font-medium">{formatCZK(recommendation.currentPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Difference</span>
              <span
                className={
                  Number.parseFloat(priceVsAvg) >= 0 ? "text-primary font-semibold" : "text-destructive font-semibold"
                }
              >
                {Number.parseFloat(priceVsAvg) >= 0 ? "+" : ""}
                {priceVsAvg}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Weight */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
          <Scale className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Portfolio Weight</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{recommendation.ticker} Weight</span>
              <span className="font-semibold">{stockWeight}%</span>
            </div>
            <Progress value={Number.parseFloat(stockWeight)} className="h-2.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {Number.parseFloat(stockWeight) < 15
                ? "This stock has a relatively low weight in your portfolio. Consider adding more for better diversification."
                : Number.parseFloat(stockWeight) > 30
                  ? "This stock has a high weight in your portfolio. Be cautious about overexposure."
                  : "This stock has a balanced weight in your portfolio."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Why This Recommendation */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Why This Recommendation?</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Lowest relative performance in your portfolio</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Opportunity to average down your cost basis</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Helps maintain portfolio balance</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
