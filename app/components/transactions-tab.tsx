"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCZK } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Transaction } from "@/lib/types"
import { AddTransactionForm } from "./add-transaction-form"
import { format, parseISO } from "date-fns"
import { cs } from "date-fns/locale"
import { PlusCircle } from "lucide-react"; // Import PlusCircle icon

type FilterType = 'all' | 'deposit' | 'withdraw';

export function TransactionsTab() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false); // State to control form visibility
  
  // Dialog and state for selected transaction
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for submission status and form inputs
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedDate, setEditedDate] = useState('');


  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("transactions").select().order('date', { ascending: false });
    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, []);

  const handleTransactionAddedAndCollapse = useCallback(async () => {
    await fetchTransactions();
    setShowAddTransactionForm(false); // Collapse the form after submission
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset states when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedTransaction(null);
      setIsEditing(false);
      setSubmissionStatus('idle');
    }
  }, [isDialogOpen]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.type === filterType);
  }, [transactions, filterType]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const monthYear = format(new Date(tx.date), 'MMMM yyyy', { locale: cs });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const { totalDeposits, totalWithdrawals, netCashFlow } = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    transactions.forEach(tx => {
      if (tx.type === 'deposit') {
        deposits += tx.amount;
      } else {
        withdrawals += tx.amount;
      }
    });
    return {
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      netCashFlow: deposits - withdrawals,
    };
  }, [transactions]);

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setEditedAmount(tx.amount.toString());
    // Format date to YYYY-MM-DD for the input[type=date]
    setEditedDate(format(parseISO(tx.date), 'yyyy-MM-dd'));
    setIsDialogOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!selectedTransaction || !window.confirm("Naozaj chcete zmazať túto transakciu?")) {
      return;
    }

    setSubmissionStatus('loading');
    try {
      if (!selectedTransaction) throw new Error("No transaction selected for deletion.");

      const response = await fetch(`/api/transactions?id=${selectedTransaction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nepodarilo sa zmazať transakciu');
      }

      await fetchTransactions(); // Re-fetch
      setSubmissionStatus('success');
      setTimeout(() => setIsDialogOpen(false), 500); // Close after a short delay
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      setSubmissionStatus('error');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTransaction) return;

    setSubmissionStatus('loading');
    try {
      const amount = parseFloat(editedAmount);
      if (isNaN(amount) || amount <= 0) {
          throw new Error("Neplatná suma.");
      }

      const response = await fetch(`/api/transactions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTransaction.id, amount, date: editedDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nepodarilo sa aktualizovať transakciu');
      }

      await fetchTransactions(); // Re-fetch
      setSubmissionStatus('success');
      setTimeout(() => setIsDialogOpen(false), 500); // Close after a short delay
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      setSubmissionStatus('error');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítavam históriu transakcií...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="rounded-xl shadow-md">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Pridať transakciu</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowAddTransactionForm(!showAddTransactionForm)}>
            <PlusCircle className={`h-6 w-6 transition-transform ${showAddTransactionForm ? 'rotate-45' : ''}`} />
            <span className="sr-only">{showAddTransactionForm ? 'Zavrieť formulár' : 'Otvoriť formulár'}</span>
          </Button>
        </CardHeader>
        {showAddTransactionForm && (
          <CardContent className="p-4 pt-0">
            <AddTransactionForm onTransactionAdded={handleTransactionAddedAndCollapse} />
          </CardContent>
        )}
      </Card>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-2 mb-4">
        <Button variant={filterType === 'all' ? "default" : "outline"} onClick={() => setFilterType('all')}>
          Všetky
        </Button>
        <Button variant={filterType === 'deposit' ? "default" : "outline"} onClick={() => setFilterType('deposit')}>
          Vklady
        </Button>
        <Button variant={filterType === 'withdraw' ? "default" : "outline"} onClick={() => setFilterType('withdraw')}>
          Výbery
        </Button>
      </div>

      {/* Summary Section */}
      <Card className="rounded-xl shadow-md p-4 bg-blue-50 dark:bg-blue-900">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg">Prehľad hotovosti</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-sm grid grid-cols-3 gap-2">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Vklady:</p>
            <p className="font-semibold text-green-600">{formatCZK(totalDeposits)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Výbery:</p>
            <p className="font-semibold text-red-600">{formatCZK(totalWithdrawals)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Čistý tok:</p>
            <p className={`font-semibold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCZK(netCashFlow)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        {Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-center text-gray-500">Žiadne transakcie pre zobrazenie.</p>
        ) : (
          Object.keys(groupedTransactions).map(monthYear => (
            <div key={monthYear}>
              <h3 className="text-lg font-semibold mb-2">{monthYear}</h3>
              <div className="space-y-3">
                {groupedTransactions[monthYear].map(tx => (
                  <Card key={tx.id} className="rounded-xl shadow-sm cursor-pointer" onClick={() => handleTransactionClick(tx)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{formatCZK(tx.amount)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(tx.date), 'dd.MM.yyyy')}</p>
                      </div>
                      <Badge className={`text-sm px-2 py-1 ${tx.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {tx.type === 'deposit' ? '⬇️ Vklad' : '⬆️ Výber'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Delete Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Upraviť transakciu' : 'Detail transakcie'}</DialogTitle>
            {!isEditing && (
              <DialogDescription>
                {selectedTransaction?.type === 'deposit' ? 'Vklad' : 'Výber'} z dňa {selectedTransaction ? format(new Date(selectedTransaction.date), 'dd.MM.yyyy') : ''}: {selectedTransaction ? formatCZK(selectedTransaction.amount) : ''}
              </DialogDescription>
            )}
          </DialogHeader>

          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Suma</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="col-span-3"
                  disabled={submissionStatus === 'loading'}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Dátum</Label>
                <Input
                  id="date"
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="col-span-3"
                  disabled={submissionStatus === 'loading'}
                />
              </div>
            </div>
          ) : null}

          {submissionStatus === 'error' && <p className="text-red-500 text-sm text-center">Operácia zlyhala. Skúste to prosím znova.</p>}

          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={submissionStatus === 'loading'}>Zrušiť</Button>
                <Button onClick={handleSaveChanges} disabled={submissionStatus === 'loading'}>
                  {submissionStatus === 'loading' ? 'Ukladám...' : 'Uložiť zmeny'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleEdit}>Upraviť</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={submissionStatus === 'loading'}>
                  {submissionStatus === 'loading' ? 'Mažem...' : 'Zmazať'}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Zavrieť</Button>
                </DialogClose>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
