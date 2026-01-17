// "use client"

// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"
// import { formatCZK, cn } from "@/lib/utils" // Adjusted formatCZK import

// // Remove mockTransactions as mock-data.ts is deleted
// // You will need to replace mockTransactions with actual data fetching later
// // For now, the entire component is commented out to allow the build to pass.

// /*
// function TransactionIcon({ type }: { type: "deposit" | "buy" | "sell" }) {
//   if (type === "deposit") {
//     return (
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
//         <Wallet className="h-5 w-5 text-primary" />
//       </div>
//     )
//   }
//   if (type === "buy") {
//     return (
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chart-2/10">
//         <ArrowDownLeft className="h-5 w-5 text-chart-2" />
//       </div>
//     )
//   }
//   return (
//     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
//       <ArrowUpRight className="h-5 w-5 text-destructive" />
//     </div>
//   )
// }

// export function TransactionsTab() {
//   const sortedTransactions = [...mockTransactions].sort(
//     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
//   )

//   return (
//     <div className="space-y-4 pb-4">
//       <h2 className="text-base font-semibold">Transaction History</h2>

//       <div className="space-y-2">
//         {sortedTransactions.map((transaction) => (
//           <Card key={transaction.id} className="shadow-sm touch-active">
//             <CardContent className="flex items-center gap-3 p-3">
//               <TransactionIcon type={transaction.type} />

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium text-sm capitalize">{transaction.type}</span>
//                   {transaction.ticker && (
//                     <Badge variant="outline" className="text-[10px] px-1.5 py-0">
//                       {transaction.ticker}
//                     </Badge>
//                   )}
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   {new Date(transaction.date).toLocaleDateString("cs-CZ", {
//                     day: "numeric",
//                     month: "short",
//                     year: "numeric",
//                   })}
//                 </div>
//                 {transaction.shares && (
//                   <div className="text-[10px] text-muted-foreground">
//                     {transaction.shares} ks @ {formatCZK(transaction.pricePerShare || 0)}
//                   </div>
//                 )}
//               </div>

//               <div
//                 className={cn(
//                   "text-right font-semibold text-sm shrink-0",
//                   transaction.type === "deposit" ? "text-primary" : "text-foreground",
//                 )}
//               >
//                 {transaction.type === "deposit" ? "+" : "-"}
//                 {formatCZK(transaction.amount)}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }
// */
