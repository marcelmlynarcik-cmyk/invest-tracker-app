"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { mockStocks, calculateStockProfit, formatCZK, type Stock } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function CircularProgress({ percentage, isPositive }: { percentage: number; isPositive: boolean }) {
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (Math.abs(percentage) / 100) * circumference

  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg className="h-12 w-12 -rotate-90 transform">
        <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[10px] font-semibold", isPositive ? "text-primary" : "text-destructive")}>
          {isPositive ? "+" : ""}
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

function StockCard({ stock, onEdit, onDelete }: { stock: Stock; onEdit: () => void; onDelete: () => void }) {
  const stats = calculateStockProfit(stock)
  const isProfit = stats.profit >= 0

  return (
    <Card className="shadow-sm touch-active">
      <CardContent className="flex items-center gap-3 p-3">
        <CircularProgress percentage={stats.profitPercentage} isPositive={isProfit} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm">{stock.ticker}</span>
            <span className="text-xs text-muted-foreground truncate">{stock.name}</span>
          </div>
          <div className="mt-0.5 text-base font-semibold">{formatCZK(stats.currentValue)}</div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={cn(isProfit ? "text-primary" : "text-destructive")}>
              {isProfit ? "+" : ""}
              {formatCZK(stats.profit)}
            </span>
            <span className="text-muted-foreground">• {stock.shares} ks</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <Button variant="ghost" size="icon" className="h-10 w-10 touch-active" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive touch-active" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PortfolioTab() {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    shares: "",
    avgPrice: "",
    currentPrice: "",
  })

  const resetForm = () => {
    setFormData({ ticker: "", name: "", shares: "", avgPrice: "", currentPrice: "" })
  }

  const handleAdd = () => {
    const newStock: Stock = {
      id: Date.now().toString(),
      ticker: formData.ticker.toUpperCase(),
      name: formData.name,
      shares: Number.parseFloat(formData.shares),
      avgPrice: Number.parseFloat(formData.avgPrice),
      currentPrice: Number.parseFloat(formData.currentPrice),
      purchaseDate: new Date().toISOString().split("T")[0],
    }
    setStocks([...stocks, newStock])
    resetForm()
    setIsAddOpen(false)
  }

  const handleEdit = () => {
    if (!editingStock) return
    const updated = stocks.map((s) =>
      s.id === editingStock.id
        ? {
            ...s,
            ticker: formData.ticker.toUpperCase(),
            name: formData.name,
            shares: Number.parseFloat(formData.shares),
            avgPrice: Number.parseFloat(formData.avgPrice),
            currentPrice: Number.parseFloat(formData.currentPrice),
          }
        : s,
    )
    setStocks(updated)
    resetForm()
    setEditingStock(null)
  }

  const handleDelete = (id: string) => {
    setStocks(stocks.filter((s) => s.id !== id))
  }

  const openEdit = (stock: Stock) => {
    setFormData({
      ticker: stock.ticker,
      name: stock.name,
      shares: stock.shares.toString(),
      avgPrice: stock.avgPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
    })
    setEditingStock(stock)
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Your Stocks</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-10 px-4 touch-active">
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Add New Stock</DialogTitle>
              <DialogDescription>Enter the details of your stock purchase.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                  placeholder="AAPL"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple Inc."
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    inputMode="decimal"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgPrice">Avg Price</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    inputMode="decimal"
                    value={formData.avgPrice}
                    onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Current</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    inputMode="decimal"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="w-full h-11">
                Add Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => (
          <StockCard
            key={stock.id}
            stock={stock}
            onEdit={() => openEdit(stock)}
            onDelete={() => handleDelete(stock.id)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStock} onOpenChange={(open) => !open && setEditingStock(null)}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
            <DialogDescription>Update the details of your stock.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">Ticker</Label>
              <Input
                id="edit-ticker"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-shares">Shares</Label>
                <Input
                  id="edit-shares"
                  type="number"
                  inputMode="decimal"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-avgPrice">Avg Price</Label>
                <Input
                  id="edit-avgPrice"
                  type="number"
                  inputMode="decimal"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currentPrice">Current</Label>
                <Input
                  id="edit-currentPrice"
                  type="number"
                  inputMode="decimal"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} className="w-full h-11">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
