import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Transaction, WeeklyValue } from "@/lib/types"
import { formatCZK, getPerformanceMetrics } from "@/lib/utils"
import { format, getWeek } from 'date-fns';

export function PerformanceTab() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allWeeklyValues, setAllWeeklyValues] = useState<WeeklyValue[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data: transactionsData, error: transactionsError } = await supabase.from("transactions").select()
      if (transactionsError) {
        console.error("Chyba pri načítaní transakcií:", transactionsError)
      } else if (transactionsData) {
        setTransactions(transactionsData as Transaction[])
      }

      const { data: allWeeklyValuesData, error: allWeeklyValuesError } = await supabase
        .from("weekly_portfolio_values")
        .select()
        .order("date", { ascending: true })
      if (allWeeklyValuesError) {
        console.error("Chyba pri načítaní všetkých týždenných hodnôt:", allWeeklyValuesError)
      } else if (allWeeklyValuesData) {
        setAllWeeklyValues(allWeeklyValuesData as WeeklyValue[])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Načítava sa...</div>
  }

  const { weeklyPerformance, monthlyPerformance } = getPerformanceMetrics(transactions, allWeeklyValues)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Týždenná výkonnosť</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => {
                  return tick.replace(' ', '-'); // e.g., W03 2026 -> W03-2026
                }}
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
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mesačná výkonnosť</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => {
                  return tick; // Should be YYYY-MM now
                }}
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
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
