"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserStock } from "@/lib/types"
import { formatCZK, formatCurrency } from "@/lib/utils"

export function BuyTipTab() {
  const [loading, setLoading] = useState(true)
  const [buyTipStock, setBuyTipStock] = useState<(UserStock & { calculatedPercentDiff: number }) | null>(null) // Updated type
  const [noTipMessage, setNoTipMessage] = useState<string | null>(null);

  const fetchBuyTip = useCallback(async () => {
    setLoading(true)
    setNoTipMessage(null); // Reset message

    try {
      const res = await fetch('/api/stocks');
      const stocksData: UserStock[] = await res.json();

      if (stocksData && stocksData.length > 0) {
        // 1. Prepare candidates with calculated percentage difference
        const stocksWithCalculatedDiff = stocksData.map(stock => {
          let calculatedPercentDiff: number;
          if (stock.averagePrice === 0) {
            // If averagePrice is 0, percentage difference is not meaningful for averaging down.
            // Assign 0 so it won't pass the 'calculatedPercentDiff < 0' filter.
            calculatedPercentDiff = 0; 
          } else {
            calculatedPercentDiff = ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
          }
          return { ...stock, calculatedPercentDiff };
        });

        // 2. Filter eligible candidates based on STRICT rules
        const eligibleCandidates = stocksWithCalculatedDiff.filter(
          (stock) => 
            stock.calculatedPercentDiff < 0 && // Condition 1: Percentage Difference < 0
            stock.portfolioWeightPercent < 10 // Condition 2: Portfolio Weight < 10%
            // Removed stock.shares > 0 filter as it was not in new strict rules.
        );

        // 3. Selection: From eligible assets, select the one with the MOST NEGATIVE percentage difference
        let bestCandidate: (UserStock & { calculatedPercentDiff: number }) | null = null;
        if (eligibleCandidates.length > 0) {
          bestCandidate = eligibleCandidates.reduce((prev, current) =>
            prev.calculatedPercentDiff < current.calculatedPercentDiff ? prev : current // Find the most negative
          );
        }
        
        if (bestCandidate) {
          setBuyTipStock(bestCandidate); // Store the best candidate
        } else {
          setBuyTipStock(null);
          setNoTipMessage("Momentálne neexistuje vhodná akcia na znižovanie priemernej ceny."); // No fallbacks
        }

      } else {
        setBuyTipStock(null)
        setNoTipMessage("Žiadne dáta o akciách na analýzu.");
      }
    } catch (error) {
      console.error("Error fetching buy tip data:", error)
      setBuyTipStock(null)
      setNoTipMessage("Nastala chyba pri načítaní investičného tipu.");
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBuyTip()
  }, [fetchBuyTip])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investičný tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Načítavam investičný tip...</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="p-4 rounded-lg shadow-md">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold">Investičný tip</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {buyTipStock ? (
          <>
            {/* Main Asset Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold leading-tight">{buyTipStock.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{buyTipStock.ticker}</p>
              </div>
              <Badge variant="secondary" className="text-sm px-2 py-1">{buyTipStock.currency}</Badge>
            </div>

            {/* Key Metrics Section */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Aktuálna cena:</p>
                    <p className="font-semibold">{formatCurrency(buyTipStock.currentPrice, buyTipStock.currency)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Priemerná nákupná cena:</p>
                    <p className="font-semibold">{formatCurrency(buyTipStock.averagePrice, buyTipStock.currency)}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Rozdiel od priemernej ceny (%):</p>
                    <p className={`font-bold text-lg ${
                      buyTipStock.calculatedPercentDiff < 0 ? "text-green-500" : "text-red-500"
                    }`}>
                        {buyTipStock.calculatedPercentDiff > 0 ? "+" : ""}
                        {buyTipStock.calculatedPercentDiff.toFixed(2)} %
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Váha v portfóliu:</p>
                    <p className="font-semibold">{buyTipStock.portfolioWeightPercent.toFixed(2)}%</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Aktuálna hodnota (CZK):</p>
                    <p className="font-semibold">{formatCZK(buyTipStock.currentValueCZK)}</p>
                </div>
            </div>

            {/* Explanation Section */}
            <div className="space-y-2">
              <p className="font-semibold text-lg">Prečo tento tip?</p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Akcia sa obchoduje pod vašou priemernou cenou ({buyTipStock.calculatedPercentDiff.toFixed(2)}%).</li>
                <li>Váha v portfóliu je pod 10 % ({buyTipStock.portfolioWeightPercent.toFixed(2)}%).</li>
                <li>Dokúpením znížite priemernú nákupnú cenu.</li>
              </ul>
            </div>

          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-base">
            {noTipMessage || "Momentálne neexistuje vhodná akcia na znižovanie priemernej ceny."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
