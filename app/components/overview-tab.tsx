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
import { useEffect, useState, useCallback } from "react"
import { PortfolioGoalCard } from "./portfolio-goal-card";
import { Button } from "@/components/ui/button"

export function OverviewTab() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [latestWeeklyValue, setLatestWeeklyValue] = useState<number | null>(null)
  const [allWeeklyValues, setAllWeeklyValues] = useState<WeeklyValue[]>([])
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | 'ALL'>('ALL'); // State for time range selector

  // Filter monthlyEvolutionData based on timeRange - MOVED TO TOP LEVEL
  const filterChartData = useCallback((data: any[]) => {
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case '1M': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case '3M': startDate = new Date(now.setMonth(now.getMonth() - 3)); break;
      case '6M': startDate = new Date(now.setMonth(now.getMonth() - 6)); break; // Corrected typo
      default: return data; // 'ALL' or default
    }
    return data.filter(item => new Date(item.date) >= startDate);
  }, [timeRange]);

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
    return <div className="text-center py-8">Načítavam prehľad portfólia...</div>
  }

  const totalInvested = calculateTotalInvested(transactions)
  const totalValue = latestWeeklyValue ?? totalInvested
  const totalProfit = totalValue - totalInvested
  // Reinstated previous *100 based on user's confirmation
  const profitPercentage = totalInvested === 0 ? "0.00" : ((totalProfit / totalInvested) * 100).toFixed(2)

  const monthlyEvolutionData = getMonthlyPortfolioEvolution(transactions, allWeeklyValues)
  const filteredMonthlyEvolutionData = filterChartData(monthlyEvolutionData);


  const profitColorClass = parseFloat(profitPercentage) > 0 ? "text-green-500" : parseFloat(profitPercentage) < 0 ? "text-red-500" : "text-gray-500";
  const profitTrendIndicator = parseFloat(profitPercentage) > 0 ? "↑" : parseFloat(profitPercentage) < 0 ? "↓" : "";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. HERO CARD */}
      <Card className="rounded-xl shadow-md p-6 text-center">
        <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Celková hodnota portfólia</CardDescription>
        <CardTitle className="text-4xl md:text-6xl font-extrabold mb-4 leading-none">
          {formatCZK(totalValue)}
        </CardTitle>
        <div className="flex justify-center items-center space-x-4 text-lg">
          <p className={`font-semibold ${profitColorClass}`}>
            {profitTrendIndicator} {formatCZK(totalProfit)}
          </p>
          <p className={`font-semibold ${profitColorClass}`}>
            ({profitPercentage}%)
          </p>
        </div>
      </Card>

      {/* 2. QUICK STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-2">📈</div> {/* Placeholder Icon */}
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">Celkovo investované</CardDescription>
          <p className="text-lg font-bold">{formatCZK(totalInvested)}</p>
        </Card>
        <Card className="rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl mb-2">💸</div> {/* Placeholder Icon */}
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">Celkový zisk</CardDescription>
          <p className="text-lg font-bold">{formatCZK(totalProfit)}</p>
        </Card>
        <Card className="rounded-xl shadow-sm p-4 text-center col-span-2 lg:col-span-1">
          <div className="text-2xl mb-2">📊</div> {/* Placeholder Icon */}
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">Zisk %</CardDescription>
          <p className={`text-lg font-bold ${profitColorClass}`}>{profitPercentage}%</p>
        </Card>
      </div>

      <PortfolioGoalCard
        currentValue={totalValue}
        historicalValues={allWeeklyValues}
      />

      {/* 3. PORTFOLIO PERFORMANCE CHART */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Vývoj portfólia</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center space-x-2 mb-4">
            {['1M', '3M', '6M', 'ALL'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range as '1M' | '3M' | '6M' | 'ALL')}
              >
                {range}
              </Button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredMonthlyEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString("sk-SK", { month: "short", year: "2-digit" })}
                interval="preserveStartEnd"
                minTickGap={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickFormatter={(tick) => formatCZK(tick)}
                domain={['auto', 'auto']}
                allowDataOverflow={false}
                tick={{ fontSize: 10 }}
              />
              <Tooltip formatter={(value: number) => formatCZK(value)} />
              <Legend layout="horizontal" align="center" verticalAlign="top" wrapperStyle={{ fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="portfolio_value"
                stroke="#8884d8"
                fill="#8884d8"
                name="Hodnota portfólia"
              />
              <Area
                type="monotone"
                dataKey="total_invested"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Celkovo investované"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. INSIGHT CARD */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Prehľad</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {parseFloat(profitPercentage) > 0 ? (
            <p className="text-base text-gray-700 dark:text-gray-300">
              Vaše portfólio je momentálne v zisku, s celkovým nárastom o <span className={profitColorClass}>{profitPercentage}%</span>.
            </p>
          ) : parseFloat(profitPercentage) < 0 ? (
            <p className="text-base text-gray-700 dark:text-gray-300">
              Vaše portfólio je momentálne v strate, s poklesom o <span className={profitColorClass}>{profitPercentage}%</span>.
              Zvážte prehodnotenie svojich investícií alebo dokúpenie vybraných akcií.
            </p>
          ) : (
            <p className="text-base text-gray-700 dark:text-gray-300">
              Vaše portfólio je momentálne na nule.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}