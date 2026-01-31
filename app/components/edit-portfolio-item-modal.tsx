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
import { UserStock, AiStockInsight } from "@/lib/types" // Import AiStockInsight
import { formatCurrency } from "@/lib/utils"
// import { AiStockInsightCard } from "./ai-stock-insight-card" // Removed AI insight card

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

interface EditPortfolioItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: UserStock | null;
  aiInsight?: AiStockInsight | null; // Added aiInsight prop
  onSave: (ticker: string, newShares: number, newAveragePrice: number) => Promise<void>;
}

export function EditPortfolioItemModal({ isOpen, onClose, stock, aiInsight, onSave }: EditPortfolioItemModalProps) {
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
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
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

          {/* AI Insight Section */}
          {aiInsight && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ai-insight">
                <AccordionTrigger className="text-lg font-semibold py-2">
                  AI Pohľad
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div>
                    <h4 className="text-md font-semibold mb-1">Všeobecný pohľad AI:</h4>
                    <p className="text-gray-700">{aiInsight.general_summary}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold mb-1">Pohľad AI na Vašu pozíciu:</h4>
                    <p className="text-gray-700">{aiInsight.personalized_summary}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Úroveň dôvery: <span className="capitalize">{aiInsight.confidence_level}</span>
                    {aiInsight.generated_date && ` (Generované: ${aiInsight.generated_date})`}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

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
