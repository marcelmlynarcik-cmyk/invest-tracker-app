"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserStock } from "@/lib/types" // Assuming UserStock type is defined here
import { formatCurrency } from "@/lib/utils"

interface EditPortfolioItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: UserStock | null;
  onSave: (ticker: string, newShares: number, newAveragePrice: number) => Promise<void>;
}

export function EditPortfolioItemModal({ isOpen, onClose, stock, onSave }: EditPortfolioItemModalProps) {
  const [shares, setShares] = useState<string>("");
  const [averagePrice, setAveragePrice] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (stock) {
      setShares(stock.shares.toString());
      setAveragePrice(stock.averagePrice.toString());
    }
  }, [stock]);

  const handleSave = async () => {
    if (!stock) return;

    // Replace comma with dot for decimal separator before parsing
    const formattedShares = shares.replace(',', '.');
    const formattedAveragePrice = averagePrice.replace(',', '.');

    const newShares = parseFloat(formattedShares);
    const newAveragePrice = parseFloat(formattedAveragePrice);

    if (isNaN(newShares) || isNaN(newAveragePrice) || newShares < 0 || newAveragePrice < 0) {
      alert("Prosím zadajte platné kladné čísla pre kusy a priemernú cenu.");
      return;
    }

    console.log("Sending payload to API:", { ticker: stock.ticker, newShares, newAveragePrice });

    setIsSaving(true);
    try {
      await onSave(stock.ticker, newShares, newAveragePrice);
      onClose(); // Close modal on successful save
    } catch (error) {
      console.error("Failed to save portfolio item:", error);
      alert("Chyba pri ukladaní údajov. Skúste to prosím znova.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!stock) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upraviť {stock.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ticker</Label>
            <Input value={stock.ticker} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Mena</Label>
            <Input value={stock.currency} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shares" className="text-right">Kusy</Label>
            <Input
              id="shares"
              type="number"
              step="0.00000001" // Up to 8 decimal places
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="averagePrice" className="text-right">Priemerná cena ({stock.currency})</Label>
            <Input
              id="averagePrice"
              type="number"
              step="any" // Allow full decimal precision
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Zrušiť</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Ukladám..." : "Uložiť zmeny"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
