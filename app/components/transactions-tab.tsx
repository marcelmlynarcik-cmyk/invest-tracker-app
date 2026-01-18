"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Assuming Button component exists
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog" // Assuming Dialog components exist
import { formatCZK } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Transaction } from "@/lib/types"
import { AddTransactionForm } from "./add-transaction-form"
import { format } from "date-fns"
import { cs } from "date-fns/locale" // Import Czech locale for date formatting

type FilterType = 'all' | 'deposit' | 'withdraw';

export function TransactionsTab() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("transactions").select().order('date', { ascending: false });
    if (error) {
      console.error("Error fetching transactions:", error);
      // Handle error display to user
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
    setIsDialogOpen(true);
  };

  const handleEdit = () => {
    console.log("Edit transaction:", selectedTransaction);
    // Implement edit logic here (e.g., navigate to edit form or open modal)
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (selectedTransaction) {
      console.log("Delete transaction:", selectedTransaction);
      // Implement delete logic here
      const { error } = await supabase.from('transactions').delete().eq('id', selectedTransaction.id);
      if (error) {
        console.error("Error deleting transaction:", error);
        // Handle error display
      } else {
        fetchTransactions(); // Re-fetch transactions to update UI
      }
      setIsDialogOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítavam históriu transakcií...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AddTransactionForm onTransactionAdded={fetchTransactions} /> {/* Pass callback to refresh data */}

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
            <DialogTitle>Upraviť / Zmazať transakciu</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.type === 'deposit' ? 'Vklad' : 'Výber'} z dňa {selectedTransaction ? format(new Date(selectedTransaction.date), 'dd.MM.yyyy') : ''}: {selectedTransaction ? formatCZK(selectedTransaction.amount) : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="secondary" onClick={handleEdit}>Upraviť</Button>
            <Button variant="destructive" onClick={handleDelete}>Zmazať</Button>
            <DialogClose asChild>
              <Button variant="outline">Zrušiť</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
