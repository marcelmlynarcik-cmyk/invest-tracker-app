"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine, // Added for zero line
  Cell, // Added Cell component
} from "recharts"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useMemo } from "react"
import { Transaction, WeeklyValue } from "@/lib/types"
import { formatCZK, getPerformanceMetrics } from "@/lib/utils"
import { format } from 'date-fns';
import { cs } from "date-fns/locale" // For Slovak date formatting

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

  const { weeklyPerformance, monthlyPerformance } = useMemo(() => {
    return getPerformanceMetrics(transactions, allWeeklyValues);
  }, [transactions, allWeeklyValues]);

  // Performance Summary calculations
  const performanceSummary = useMemo(() => {
    const allPerformance = [...weeklyPerformance, ...monthlyPerformance];
    if (allPerformance.length === 0) {
      return null;
    }

    const sortedPerformance = [...allPerformance].sort((a, b) => a.value - b.value);

    const bestPeriod = sortedPerformance[sortedPerformance.length - 1];
    const worstPeriod = sortedPerformance[0];
    const currentPeriod = weeklyPerformance[weeklyPerformance.length - 1] || monthlyPerformance[monthlyPerformance.length - 1]; // Most recent

    return { bestPeriod, worstPeriod, currentPeriod };
  }, [weeklyPerformance, monthlyPerformance]);


  if (loading) {
    return <div className="text-center py-8">Načítavam dáta výkonnosti...</div>
  }

  if (!performanceSummary && weeklyPerformance.length === 0 && monthlyPerformance.length === 0) {
    return (
      <Card className="rounded-xl shadow-md p-4 text-center">
        <CardContent>
          <p className="text-gray-500">Zatiaľ nemáme dostatok dát na vyhodnotenie trendu.</p>
        </CardContent>
      </Card>
    );
  }

  const formatPerformanceValue = (value: number) => {
    const sign = value > 0 ? '+' : '';
    const colorClass = value > 0 ? 'text-green-500' : (value < 0 ? 'text-red-500' : 'text-gray-500');
    return <span className={colorClass}>{sign}{formatCZK(value)}</span>;
  };

  const formatXAxisWeekly = (tick: string) => tick.split(' ')[0]; // "W35 2025" -> "W35"
  const formatXAxisMonthly = (tick: string) => format(new Date(tick), 'MMM yy', { locale: cs }); // "2025-10" -> "Okt 25"

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Performance Summary Card */}
      {performanceSummary && (
        <Card className="rounded-xl shadow-md p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl">Výkonnosť – prehľad</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {performanceSummary.bestPeriod && (
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500">Najlepší výkon ({performanceSummary.bestPeriod.date}):</p>
                {formatPerformanceValue(performanceSummary.bestPeriod.value)}
              </div>
            )}
            {performanceSummary.worstPeriod && (
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500">Najhorší výkon ({performanceSummary.worstPeriod.date}):</p>
                {formatPerformanceValue(performanceSummary.worstPeriod.value)}
              </div>
            )}
            {performanceSummary.currentPeriod && (
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500">Aktuálny trend ({performanceSummary.currentPeriod.date}):</p>
                {formatPerformanceValue(performanceSummary.currentPeriod.value)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. Weekly Performance Chart */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Týždenná výkonnosť</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyPerformance} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisWeekly}
                interval="preserveStartEnd"
                minTickGap={10}
                tick={{ fontSize: 10, fill: '#888' }}
              />
              <YAxis
                tickFormatter={(tick) => formatCZK(tick)}
                domain={['auto', 'auto']} // Allows dynamic domain
                allowDataOverflow={false}
                tick={{ fontSize: 10, fill: '#888' }}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [formatCZK(value), "Zisk/Strata"]}
                labelFormatter={(label) => `Týždeň: ${label}`}
              />
              <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" /> {/* Zero line */}
              <Bar dataKey="value" name="Zisk/Strata">
                {weeklyPerformance.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.value > 0 ? '#82ca9d' : '#ff7300'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Monthly Performance Chart */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Mesačná výkonnosť</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisMonthly}
                interval="preserveStartEnd"
                minTickGap={10}
                tick={{ fontSize: 10, fill: '#888' }}
              />
              <YAxis
                tickFormatter={(tick) => formatCZK(tick)}
                domain={['auto', 'auto']} // Allows dynamic domain
                allowDataOverflow={false}
                tick={{ fontSize: 10, fill: '#888' }}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [formatCZK(value), "Zisk/Strata"]}
                labelFormatter={(label) => `Mesiac: ${label}`}
              />
              <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" /> {/* Zero line */}
              <Bar dataKey="value" name="Zisk/Strata">
                {monthlyPerformance.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.value > 0 ? '#82ca9d' : '#ff7300'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
