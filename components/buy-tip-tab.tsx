// "use client"

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Lightbulb, TrendingDown, Scale } from "lucide-react"
// import { formatCZK } from "@/lib/utils"
// // import { mockStocks, calculateStockProfit, calculatePortfolioStats } from "@/lib/mock-data" // Removed mock data import

// /*
// export function BuyTipTab() {
//   // Find the stock with the lowest current profit percentage (best buying opportunity)
//   // const stocksWithStats = mockStocks.map((stock) => ({ // Commented out
//   //   ...stock,
//   //   stats: calculateStockProfit(stock),
//   // }))

//   // const sortedByProfit = [...stocksWithStats].sort((a, b) => a.stats.profitPercentage - b.stats.profitPercentage) // Commented out
//   // const recommendation = sortedByProfit[0] // Commented out
//   // const portfolioStats = calculatePortfolioStats(mockStocks) // Commented out

//   // // Calculate portfolio weight
//   // const stockWeight = ((recommendation.stats.currentValue / portfolioStats.totalValue) * 100).toFixed(1) // Commented out
//   // const priceVsAvg = ( // Commented out
//   //   ((recommendation.currentPrice - recommendation.avgPrice) / recommendation.avgPrice) * // Commented out
//   //   100 // Commented out
//   // ).toFixed(1) // Commented out

//   return (
//     <div className="space-y-4 pb-4">
//       <Card className="border-primary/20 bg-primary/5 shadow-sm">
//         <CardHeader className="px-4 pt-4 pb-3">
//           <div className="flex items-center gap-2">
//             <Lightbulb className="h-5 w-5 text-primary" />
//             <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
//               Recommendation
//             </Badge>
//           </div>
//           <CardTitle className="text-2xl mt-2">N/A</CardTitle> // Hardcoded
//           <CardDescription className="text-sm">No recommendation available</CardDescription> // Hardcoded
//         </CardHeader>
//         <CardContent className="px-4 pb-4">
//           <p className="text-sm text-muted-foreground leading-relaxed">
//             No stock recommendation available without mock data.
//           </p>
//         </CardContent>
//       </Card>

//       {/* Price vs Average - compact for mobile */}
//       <Card className="shadow-sm">
//         <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
//           <TrendingDown className="h-5 w-5 text-muted-foreground" />
//           <CardTitle className="text-base">Price vs Average</CardTitle>
//         </CardHeader>
//         <CardContent className="px-4 pb-4">
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-muted-foreground">Your Avg Price</span>
//               <span className="font-medium">0 CZK</span> // Hardcoded
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-muted-foreground">Current Price</span>
//               <span className="font-medium">0 CZK</span> // Hardcoded
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-muted-foreground">Difference</span>
//               <span
//                 className={`font-semibold ${true ? "text-primary" : "text-destructive"}`}
//               >
//                 +0%
//               </span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Portfolio Weight */}
//       <Card className="shadow-sm">
//         <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
//           <Scale className="h-5 w-5 text-muted-foreground" />
//           <CardTitle className="text-base">Portfolio Weight</CardTitle>
//         </CardHeader>
//         <CardContent className="px-4 pb-4">
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-muted-foreground">Weight</span>
//               <span className="font-semibold">0%</span> // Hardcoded
//             </div>
//             <Progress value={0} className="h-2.5" /> // Hardcoded
//             <p className="text-xs text-muted-foreground leading-relaxed">
//               No portfolio weight data available without mock data.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Why This Recommendation */}
//       <Card className="shadow-sm">
//         <CardHeader className="px-4 pt-4 pb-2">
//           <CardTitle className="text-base">Why This Recommendation?</CardTitle>
//         </CardHeader>
//         <CardContent className="px-4 pb-4">
//           <ul className="space-y-2.5">
//             <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
//               <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
//               <span>No specific reasons available without mock data</span>
//             </li>
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
// */
