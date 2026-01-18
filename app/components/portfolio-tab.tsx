"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "../../components/ui/label";
import { formatCZK, formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { UserStock } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Assuming Select component exists

type SortOption =
  | 'az'
  | 'za'
  | 'weight_desc'
  | 'weight_asc'
  | 'performance_desc'
  | 'performance_asc'
  | 'manual'
  | 'avg_down_opportunity';

const LOCAL_STORAGE_KEY = 'portfolioManualOrder';

export function PortfolioTab() {
  const [loading, setLoading] = useState(true)
  const [userStocks, setUserStocks] = useState<UserStock[]>([])
  const [sortOption, setSortOption] = useState<SortOption>('weight_desc');
  const [manualOrder, setManualOrder] = useState<string[]>([]);

  // Refs for drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stocks');
      const stocksData: UserStock[] = await res.json();
      setUserStocks(stocksData || []);
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
      setUserStocks([]);
    } finally {
      setLoading(false)
    }
  }, [])

  // Load manual order from localStorage on mount
  useEffect(() => {
    const storedOrder = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedOrder) {
      setManualOrder(JSON.parse(storedOrder));
    }
  }, []);

  // Save manual order to localStorage when it changes
  useEffect(() => {
    if (sortOption === 'manual' && manualOrder.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(manualOrder));
    }
  }, [manualOrder, sortOption]);

  // Apply sorting logic
  const sortedUserStocks = useMemo(() => {
    let sortedStocks = [...userStocks];

    if (sortOption === 'manual') {
      // Sort based on manualOrder, placing unsorted items at the end
      const orderedMap = new Map(manualOrder.map((ticker, index) => [ticker, index]));
      sortedStocks.sort((a, b) => {
        const orderA = orderedMap.has(a.ticker) ? orderedMap.get(a.ticker)! : Infinity;
        const orderB = orderedMap.has(b.ticker) ? orderedMap.get(b.ticker)! : Infinity;
        return orderA - orderB;
      });
    } else {
      sortedStocks.sort((a, b) => {
        let compare = 0;
        switch (sortOption) {
          case 'weight_desc':
            compare = b.portfolioWeightPercent - a.portfolioWeightPercent;
            break;
          case 'weight_asc':
            compare = a.portfolioWeightPercent - b.portfolioWeightPercent;
            break;
          case 'value_desc':
            compare = b.currentValueCZK - a.currentValueCZK;
            break;
          case 'value_asc':
            compare = a.currentValueCZK - b.currentValueCZK;
            break;
          case 'profit_desc':
            compare = b.profitCZK - a.profitCZK;
            break;
          case 'profit_asc':
            compare = a.profitCZK - b.profitCZK;
            break;
          case 'profit_percent_desc':
            compare = b.percentDiff - a.percentDiff;
            break;
          case 'profit_percent_asc':
            compare = a.percentDiff - b.percentDiff;
            break;
          case 'alpha_asc':
            compare = a.name.localeCompare(b.name);
            break;
          case 'alpha_desc':
            compare = b.name.localeCompare(a.name);
            break;
          case 'avg_down_opportunity':
            const diffA = ((a.currentPrice - a.averagePrice) / a.averagePrice) * 100;
            const diffB = ((b.currentPrice - b.averagePrice) / b.averagePrice) * 100;

            const isAEligible = a.currentPrice < a.averagePrice;
            const isBEligible = b.currentPrice < b.averagePrice;

            if (isAEligible && !isBEligible) {
              compare = -1; // A comes before B
            } else if (!isAEligible && isBEligible) {
              compare = 1; // B comes before A
            } else if (isAEligible && isBEligible) {
              compare = diffA - diffB; // Sort by percentage difference ascending
            } else {
              compare = 0; // Keep original order for both ineligible, or push to bottom
            }
            break;
          default:
            compare = 0; // Should not happen with defined sort options
        }
        return compare;
      });
    }
    return sortedStocks;
  }, [userStocks, sortOption, manualOrder]);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newManualOrder = [...manualOrder];
      const draggedItemTicker = sortedUserStocks[dragItem.current].ticker;
      const draggedItemIndexInManual = newManualOrder.indexOf(draggedItemTicker);

      if (draggedItemIndexInManual !== -1) {
        newManualOrder.splice(draggedItemIndexInManual, 1); // Remove from old position
      } else {
        // If item not yet in manualOrder, add it.
        // This case handles new stocks appearing that weren't manually ordered before.
        newManualOrder.push(draggedItemTicker);
      }

      // Find where to insert in newManualOrder relative to sortedUserStocks order
      const targetItemTicker = sortedUserStocks[dragOverItem.current].ticker;
      const targetIndexInSorted = sortedUserStocks.findIndex(stock => stock.ticker === targetItemTicker);
      let insertIndex = newManualOrder.length; // Default to end

      if (targetIndexInSorted !== -1) {
        const nextItemTicker = sortedUserStocks[targetIndexInSorted].ticker;
        insertIndex = newManualOrder.indexOf(nextItemTicker);
        if (insertIndex === -1) { // Target not in manual order yet
            // Find position based on original sortedUserStocks position
            const dragged = sortedUserStocks[dragItem.current];
            const target = sortedUserStocks[dragOverItem.current];
            const currentIndex = newManualOrder.indexOf(dragged.ticker);
            const newIndex = newManualOrder.indexOf(target.ticker);
            
            if (currentIndex === -1) { // dragged was not in manualOrder
                newManualOrder.splice(newIndex !== -1 ? newIndex : sortedUserStocks.indexOf(target), 0, dragged.ticker);
            } else {
                newManualOrder.splice(currentIndex, 1);
                newManualOrder.splice(newIndex !== -1 ? newIndex : sortedUserStocks.indexOf(target), 0, dragged.ticker);
            }
        } else {
            newManualOrder.splice(draggedItemIndexInManual, 1); // Remove
            newManualOrder.splice(insertIndex, 0, draggedItemTicker); // Insert
        }
      } else {
        // If target item is not in manualOrder, add dragged item to end for now
        newManualOrder.push(draggedItemTicker);
      }
      
      // Re-create the manual order based on the new positions in sortedUserStocks
      const newOrder = Array(sortedUserStocks.length).fill(null).map((_, i) => {
          const item = sortedUserStocks[i];
          const foundIndex = newManualOrder.indexOf(item.ticker);
          return foundIndex !== -1 ? { ticker: item.ticker, manualIdx: foundIndex } : { ticker: item.ticker, manualIdx: Infinity };
      }).sort((a,b) => a.manualIdx - b.manualIdx).map(item => item.ticker);
      
      setManualOrder(newOrder);

      dragItem.current = null;
      dragOverItem.current = null;
    }
  }, [manualOrder, sortedUserStocks]);

  // Simplified D&D handlers (will be replaced by full logic in next step)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newOrder = [...sortedUserStocks];
      const draggedItem = newOrder.splice(dragItem.current, 1)[0];
      newOrder.splice(dragOverItem.current, 0, draggedItem);
      
      // Update manualOrder based on the new visual order
      const updatedManualOrder = newOrder.map(stock => stock.ticker);
      setManualOrder(updatedManualOrder);
      setSortOption('manual'); // Automatically switch to manual sort
    }
  }, [sortedUserStocks]);


  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  if (loading) {
    return <div>Načítava sa portfólio...</div>
  }
  
  if (userStocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Moje portfólio</CardTitle>
          <CardDescription>
            Žiadne dáta na zobrazenie. Skontrolujte svoj Google Sheet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort by control */}
      <div className="flex items-center justify-end px-4 md:px-0">
        <Label htmlFor="sort-by" className="mr-2 text-sm font-medium">Zoradiť podľa:</Label>
        <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
          <SelectTrigger id="sort-by" className="w-[180px]">
            <SelectValue placeholder="Zoradiť podľa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight_desc">Váha portfólia (zost.)</SelectItem>
            <SelectItem value="weight_asc">Váha portfólia (vzost.)</SelectItem>
            <SelectItem value="value_desc">Aktuálna hodnota (zost.)</SelectItem>
            <SelectItem value="value_asc">Aktuálna hodnota (vzost.)</SelectItem>
            <SelectItem value="profit_desc">Zisk (CZK, zost.)</SelectItem>
            <SelectItem value="profit_asc">Zisk (CZK, vzost.)</SelectItem>
            <SelectItem value="profit_percent_desc">Zisk (%) (zost.)</SelectItem>
            <SelectItem value="profit_percent_asc">Zisk (%) (vzost.)</SelectItem>
            <SelectItem value="avg_down_opportunity">Najväčší pokles pod priemerku</SelectItem>
            <SelectItem value="alpha_asc">Názov (A-Z)</SelectItem>
            <SelectItem value="alpha_desc">Názov (Z-A)</SelectItem>
            <SelectItem value="manual">Manuálne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Moje portfólio</CardTitle>
            <CardDescription>
              Tieto dáta sú načítané z vášho Google Sheetu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Názov</TableHead>
                  <TableHead>Kusy</TableHead>
                  <TableHead>Priemerná cena</TableHead>
                  <TableHead>Aktuálna hodnota (CZK)</TableHead>
                  <TableHead>Zisk (CZK)</TableHead>
                  <TableHead>Zisk (%)</TableHead>
                  <TableHead>Váha (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUserStocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>
                      {stock.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(stock.averagePrice, stock.currency)}
                    </TableCell>
                    <TableCell>{formatCZK(stock.currentValueCZK)}</TableCell>
                    <TableCell
                      className={
                        stock.profitCZK > 0
                          ? "text-green-500"
                          : stock.profitCZK < 0
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {formatCZK(stock.profitCZK)}
                    </TableCell>
                    <TableCell
                      className={
                        stock.percentDiff > 0
                          ? "text-green-500"
                          : stock.percentDiff < 0
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {stock.percentDiff.toFixed(2)}%
                    </TableCell>
                    <TableCell>{stock.portfolioWeightPercent.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {sortedUserStocks.map((stock, index) => {
          const profitCZKClass =
            stock.profitCZK > 0
              ? "text-green-500"
              : stock.profitCZK < 0
                ? "text-red-500"
                : "";
          const profitPercentClass =
            stock.percentDiff > 0
              ? "text-green-500"
              : stock.percentDiff < 0
                ? "text-red-500"
                : "";

          return (
            <Card
              key={stock.ticker}
              className="p-4 relative"
              draggable={sortOption === 'manual'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop} // Handle drop on target item
              onDragEnd={handleDragEnd}
            >
              {sortOption === 'manual' && (
                <div className="absolute top-0 left-0 p-2 cursor-grab text-gray-400">
                  ☰ {/* Drag handle */}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{stock.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stock.ticker}
                  </p>
                </div>
                <Badge variant="secondary">{stock.currency}</Badge>
              </div>

              <div className="mt-2 text-3xl font-bold">
                {formatCZK(stock.currentValueCZK)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Kusy: </span>
                  {stock.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Priemerná cena: </span>
                  {formatCurrency(stock.averagePrice, stock.currency)}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Zisk (CZK): </span>
                  <span className={profitCZKClass}>
                    {formatCZK(stock.profitCZK)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Zisk (%): </span>
                  <span className={profitPercentClass}>
                    {stock.percentDiff.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Váha v portfóliu:</p>
                {/* Progress value should be between 0 and 100 */}
                <Progress value={Math.min(Math.max(stock.portfolioWeightPercent, 0), 100)} className="h-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stock.portfolioWeightPercent.toFixed(2)}%
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  )
}
