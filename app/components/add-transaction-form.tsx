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

export function AddTransactionForm() {
  const [transactionType, setTransactionType] = useState<"deposit" | "withdraw">("deposit")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("transactions").insert([
      {
        type: transactionType,
        amount: parseFloat(amount),
        date,
      },
    ])

    if (error) {
      console.error("Chyba pri pridávaní transakcie:", error)
    } else {
      setAmount("")
      setDate(new Date().toISOString().slice(0, 10))
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pridať transakciu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={transactionType === "deposit" ? "default" : "outline"}
              onClick={() => setTransactionType("deposit")}
            >
              Vklad
            </Button>
            <Button
              type="button"
              variant={transactionType === "withdraw" ? "default" : "outline"}
              onClick={() => setTransactionType("withdraw")}
            >
              Výber
            </Button>
          </div>
          <div>
            <Label htmlFor="amount">Čiastka (CZK)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
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
            />
          </div>
          <Button type="submit">Pridať transakciu</Button>
        </form>
      </CardContent>
    </Card>
  )
}
