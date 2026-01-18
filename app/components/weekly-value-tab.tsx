"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { formatCZK } from "@/lib/utils"
import { WeeklyValue } from "@/lib/types"
import { format } from "date-fns"
import { cs } from "date-fns/locale" // Import Czech locale for date formatting
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function WeeklyValueTab() {
  const [value, setValue] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)) // Default to today's date
  const [weeklyValues, setWeeklyValues] = useState<WeeklyValue[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchWeeklyValues = useCallback(async () => {
    setLoading(true)
    // Fetch sorted by date ascending for chart, descending for summary/list
    const { data, error } = await supabase.from("weekly_portfolio_values").select().order('date', { ascending: false })
    if (error) {
      console.error("Chyba pri načítaní týždenných hodnôt:", error)
    } else if (data) {
      setWeeklyValues(data as WeeklyValue[])
    }
    setLoading(false)
  }, [])

  // Fix: Move data fetching to useEffect
  useEffect(() => {
    fetchWeeklyValues()
  }, [fetchWeeklyValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("weekly_portfolio_values").insert([
      {
        value: parseFloat(value),
        date,
      },
    ])

    if (error) {
      console.error("Chyba pri pridávaní týždennej hodnoty:", error)
    } else {
      setValue("")
      setDate(new Date().toISOString().slice(0, 10)) // Reset to today's date
      fetchWeeklyValues() // Re-fetch to update the list
      router.refresh() // Refresh page for Next.js to revalidate data
    }
  }

  // Calculate summary and differences for cards
  const summaryData = useMemo(() => {
    if (weeklyValues.length === 0) {
      return {
        latestValue: null,
        differenceCZK: null,
        differencePercentage: null,
        trend: null,
      };
    }

    const latest = weeklyValues[0].value;
    const previous = weeklyValues[1]?.value; // previous week is at index 1 due to descending sort

    if (previous === undefined || previous === null || previous === 0) {
        return {
            latestValue: latest,
            differenceCZK: null,
            differencePercentage: null,
            trend: null,
        };
    }

    const diffCZK = latest - previous;
    const diffPercentage = (diffCZK / previous) * 100;
    const trend = diffCZK > 0 ? '↑' : (diffCZK < 0 ? '↓' : '');

    return {
      latestValue: latest,
      differenceCZK: diffCZK,
      differencePercentage: diffPercentage,
      trend: trend,
    };
  }, [weeklyValues]);

  // Prepare chart data (needs to be ascending order)
  const chartData = useMemo(() => {
    return [...weeklyValues].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weeklyValues]);


  if (loading) {
    return <div className="text-center py-8">Načítavam týždenné hodnoty...</div>
  }

  const { latestValue, differenceCZK, differencePercentage, trend } = summaryData;
  const diffColorClass = differenceCZK !== null && differenceCZK > 0 ? "text-green-500" : (differenceCZK !== null && differenceCZK < 0 ? "text-red-500" : "text-gray-500");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. WEEKLY SUMMARY CARD */}
      {latestValue !== null && (
        <Card className="rounded-xl shadow-md p-6 text-center">
          <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Posledná týždenná hodnota</CardDescription>
          <CardTitle className="text-4xl font-extrabold mb-4 leading-none">
            {formatCZK(latestValue)}
          </CardTitle>
          {differenceCZK !== null && (
            <div className="flex justify-center items-center space-x-4 text-lg">
              <p className={`font-semibold ${diffColorClass}`}>
                {trend} {formatCZK(differenceCZK)}
              </p>
              <p className={`font-semibold ${diffColorClass}`}>
                ({differencePercentage?.toFixed(2)}%)
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 2. INPUT FORM REFINEMENT */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Pridať týždennú hodnotu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="value">Hodnota portfólia (CZK)</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Hodnota portfólia na konci týždňa"
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="date">Dátum</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">Pridať hodnotu</Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. OPTIONAL CHART */}
      {chartData.length > 1 && ( // Only show chart if there's enough data for a line
        <Card className="rounded-xl shadow-md p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl">Vývoj týždennej hodnoty</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}> {/* Adjusted left margin */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy', { locale: cs })}
                  minTickGap={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickFormatter={(tick) => formatCZK(tick)}
                  domain={['auto', 'auto']}
                  allowDataOverflow={false}
                  tick={{ fontSize: 10, fill: '#888' }}
                />
                <Tooltip formatter={(value: number) => formatCZK(value)} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" name="Hodnota" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}


      {/* 4. WEEKLY HISTORY AS CARDS / TIMELINE */}
      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">História týždenných hodnôt</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {weeklyValues.length === 0 ? (
            <p className="text-gray-500">Zatiaľ neboli zaznamenané žiadne týždenné hodnoty.</p>
          ) : (
            weeklyValues.map((wv, index) => {
              const previousWv = weeklyValues[index + 1]; // Get the next (older) value for comparison
              const currentDiffCZK = previousWv ? wv.value - previousWv.value : null;
              const currentDiffPercentage = (currentDiffCZK !== null && previousWv && previousWv.value !== 0) ? (currentDiffCZK / previousWv.value) * 100 : null;
              const diffTrend = currentDiffCZK !== null && currentDiffCZK > 0 ? '↑' : (currentDiffCZK !== null && currentDiffCZK < 0 ? '↓' : '');
              const diffHistoryColorClass = currentDiffCZK !== null && currentDiffCZK > 0 ? "text-green-500" : (currentDiffCZK !== null && currentDiffCZK < 0 ? "text-red-500" : "text-gray-500");

              return (
                <div key={wv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                  <div>
                    <p className="text-xl font-bold">{formatCZK(wv.value)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(wv.date), 'dd.MM.yyyy', { locale: cs })}</p>
                  </div>
                  {currentDiffCZK !== null && (
                    <div className="text-right">
                      <p className={`font-semibold ${diffHistoryColorClass}`}>
                        {diffTrend} {formatCZK(currentDiffCZK)}
                      </p>
                      <p className={`text-sm ${diffHistoryColorClass}`}>
                        ({currentDiffPercentage?.toFixed(2)}%)
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
