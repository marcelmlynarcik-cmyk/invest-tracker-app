"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
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

export function WeeklyValueTab() {
  const [value, setValue] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weeklyValues, setWeeklyValues] = useState<WeeklyValue[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchWeeklyValues = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("weekly_portfolio_values").select().order('date', { ascending: false })
    if (error) {
      console.error("Error fetching weekly values:", error.message, error.details)
    } else if (data) {
      setWeeklyValues(data as WeeklyValue[])
    }
    setLoading(false)
  }

  useState(() => {
    fetchWeeklyValues()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("weekly_portfolio_values").insert([
      {
        value: parseFloat(value),
        date,
      },
    ])

    if (error) {
      console.error("Error adding weekly value:", error.message, error.details)
    } else {
      setValue("")
      setDate(new Date().toISOString().slice(0, 10))
      fetchWeeklyValues()
      router.refresh()
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Weekly Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="value">Value (CZK)</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Value</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historical Weekly Values</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyValues.length === 0 ? (
            <p>No weekly values recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {weeklyValues.map((wv) => (
                <div key={wv.id} className="flex justify-between">
                  <span>{wv.date}:</span>
                  <span>{formatCZK(wv.value)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
