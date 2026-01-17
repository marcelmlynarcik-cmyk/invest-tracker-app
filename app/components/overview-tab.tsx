import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { formatCZK, calculateTotalInvested, getMonthlyPortfolioEvolution } from "@/lib/utils"
import { Transaction, WeeklyValue } from "@/lib/types"

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
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [latestWeeklyValue, setLatestWeeklyValue] = useState<number | null>(null)

  const [allWeeklyValues, setAllWeeklyValues] = useState<WeeklyValue[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data: transactionsData, error: transactionsError } = await supabase.from("transactions").select()
      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError)
      } else if (transactionsData) {
        setTransactions(transactionsData as Transaction[])
      }

      const { data: allWeeklyValuesData, error: allWeeklyValuesError } = await supabase
        .from("weekly_portfolio_values")
        .select()
        .order("date", { ascending: true })
      if (allWeeklyValuesError) {
        console.error("Error fetching all weekly values:", allWeeklyValuesError)
      } else if (allWeeklyValuesData) {
        setAllWeeklyValues(allWeeklyValuesData as WeeklyValue[])
      }

      const { data: latestWeeklyValueData, error: latestWeeklyValueError } = await supabase
        .from("weekly_portfolio_values")
        .select("value")
        .order("date", { ascending: false })
        .limit(1)
      if (latestWeeklyValueError) {
        console.error("Error fetching latest weekly value:", latestWeeklyValueError)
      } else if (latestWeeklyValueData && latestWeeklyValueData.length > 0) {
        setLatestWeeklyValue(latestWeeklyValueData[0].value)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  const totalInvested = calculateTotalInvested(transactions)
  const totalValue = latestWeeklyValue ?? totalInvested
  const totalProfit = totalValue - totalInvested
  const profitPercentage = totalInvested === 0 ? 0 : ((totalProfit / totalInvested) * 100).toFixed(2)

  const monthlyEvolutionData = getMonthlyPortfolioEvolution(transactions, allWeeklyValues)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(totalValue)}</CardTitle>
            <CardDescription>Total Portfolio Value</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(totalInvested)}</CardTitle>
            <CardDescription>Total Invested</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{formatCZK(totalProfit)}</CardTitle>
            <CardDescription>Total Profit</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{profitPercentage}%</CardTitle>
            <CardDescription>Profit %</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCZK(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="portfolio_value"
                stroke="#8884d8"
                fill="#8884d8"
                name="Portfolio Value"
              />
              <Area
                type="monotone"
                dataKey="total_invested"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Total Invested"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
