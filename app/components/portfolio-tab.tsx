"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // Added import
import { Progress } from "@/components/ui/progress" // Added import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCZK, formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"
import { UserStock } from "@/lib/types"

export function PortfolioTab() {
  const [loading, setLoading] = useState(true)
  const [userStocks, setUserStocks] = useState<UserStock[]>([])

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stocks');
      const stocksData: UserStock[] = await res.json();
      setUserStocks(stocksData || []);
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
      setUserStocks([]);
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  if (loading) {
    return <div>Načítava sa portfólio...</div>
  }
  
  if (userStocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Moje portfólio</CardTitle>
          <CardDescription>
            Žiadne dáta na zobrazenie. Skontrolujte svoj Google Sheet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Moje portfólio</CardTitle>
            <CardDescription>
              Tieto dáta sú načítané z vášho Google Sheetu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Názov</TableHead>
                  <TableHead>Kusy</TableHead>
                  <TableHead>Priemerná cena</TableHead>
                  <TableHead>Aktuálna hodnota (CZK)</TableHead>
                  <TableHead>Zisk (CZK)</TableHead>
                  <TableHead>Zisk (%)</TableHead>
                  <TableHead>Váha (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>
                      {stock.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(stock.averagePrice, stock.currency)}
                    </TableCell>
                    <TableCell>{formatCZK(stock.currentValueCZK)}</TableCell>
                    <TableCell
                      className={
                        stock.profitCZK > 0
                          ? "text-green-500"
                          : stock.profitCZK < 0
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {formatCZK(stock.profitCZK)}
                    </TableCell>
                    <TableCell
                      className={
                        stock.percentDiff > 0
                          ? "text-green-500"
                          : stock.percentDiff < 0
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {stock.percentDiff.toFixed(2)}%
                    </TableCell>
                    <TableCell>{stock.portfolioWeightPercent.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {userStocks.map((stock) => {
          const profitCZKClass =
            stock.profitCZK > 0
              ? "text-green-500"
              : stock.profitCZK < 0
                ? "text-red-500"
                : "";
          const profitPercentClass =
            stock.percentDiff > 0
              ? "text-green-500"
              : stock.percentDiff < 0
                ? "text-red-500"
                : "";

          return (
            <Card key={stock.ticker} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{stock.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stock.ticker}
                  </p>
                </div>
                <Badge variant="secondary">{stock.currency}</Badge>
              </div>

              <div className="mt-2 text-3xl font-bold">
                {formatCZK(stock.currentValueCZK)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Kusy: </span>
                  {stock.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Priemerná cena: </span>
                  {formatCurrency(stock.averagePrice, stock.currency)}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Zisk (CZK): </span>
                  <span className={profitCZKClass}>
                    {formatCZK(stock.profitCZK)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Zisk (%): </span>
                  <span className={profitPercentClass}>
                    {stock.percentDiff.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Váha v portfóliu:</p>
                {/* Progress value should be between 0 and 100 */}
                <Progress value={Math.min(Math.max(stock.portfolioWeightPercent, 0), 100)} className="h-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stock.portfolioWeightPercent.toFixed(2)}%
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  )
}
