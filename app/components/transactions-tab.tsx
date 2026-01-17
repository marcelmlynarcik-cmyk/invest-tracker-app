import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCZK } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Transaction } from "@/lib/types"
import { AddTransactionForm } from "./add-transaction-form"

export async function TransactionsTab() {
  const { data: transactions, error } = await supabase.from("transactions").select()

  if (error) {
    console.error("Error fetching transactions:", error)
    return <div>Chyba pri načítaní transakcií</div>
  }

  return (
    <div className="space-y-4">
      <AddTransactionForm />
      {transactions.map((tx: Transaction) => (
        <Card key={tx.id}>
          <CardHeader>
            <CardTitle className={`capitalize ${tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}>
              {tx.type}
            </CardTitle>
            <CardDescription>{tx.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Čiastka: {formatCZK(tx.amount)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
