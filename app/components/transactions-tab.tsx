import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCZK, Transaction } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTransactions() {
      const { data, error } = await supabase.from("transactions").select()
      if (error) {
        console.error("Error fetching transactions:", error)
      } else if (data) {
        const mappedData = data.map(tx => ({...tx, pricePerShare: tx.price_per_share, id: tx.id.toString(), type: tx.type as "deposit" | "buy" | "sell"}))
        setTransactions(mappedData)
      }
      setLoading(false)
    }
    getTransactions()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardHeader>
            <CardTitle className="capitalize">{tx.type}</CardTitle>
            <CardDescription>{tx.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Amount: {formatCZK(tx.amount)}</p>
            {tx.ticker && <p>Ticker: {tx.ticker}</p>}
            {tx.shares && <p>Shares: {tx.shares}</p>}
            {tx.pricePerShare && <p>Price: {formatCZK(tx.pricePerShare)}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
