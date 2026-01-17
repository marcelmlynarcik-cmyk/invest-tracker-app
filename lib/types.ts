export interface Transaction {
  id: string
  type: "deposit" | "withdraw"
  date: string
  amount: number
}
