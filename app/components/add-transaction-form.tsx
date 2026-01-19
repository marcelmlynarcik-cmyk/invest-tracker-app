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
import { useRouter } from "next/navigation"

interface AddTransactionFormProps {
  onTransactionAdded: () => Promise<void>;
}

export function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const [transactionType, setTransactionType] = useState<"deposit" | "withdraw">("deposit")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(amount),
          date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nepodarilo sa pridať transakciu")
      }
      
      setAmount("")
      setDate(new Date().toISOString().slice(0, 10))
      await onTransactionAdded(); // Call the callback to refresh data in the parent component
      
    } catch (err: any) {
      setError(err.message)
      console.error("Chyba pri pridávaní transakcie:", err.message)
    } finally {
      setIsSubmitting(false)
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
              disabled={isSubmitting}
            >
              Vklad
            </Button>
            <Button
              type="button"
              variant={transactionType === "withdraw" ? "default" : "outline"}
              onClick={() => setTransactionType("withdraw")}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Pridávam...' : 'Pridať transakciu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
