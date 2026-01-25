"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { formatCZK } from "@/lib/utils"
import { WeeklyValue } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { cs } from "date-fns/locale"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { PlusCircle } from "lucide-react";

export function WeeklyValueTab() {
  const [newValue, setNewValue] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [weeklyValues, setWeeklyValues] = useState<WeeklyValue[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddWeeklyValueForm, setShowAddWeeklyValueForm] = useState(false); // State to control form visibility

  // State for modal
  const [selectedWeeklyValue, setSelectedWeeklyValue] = useState<WeeklyValue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editedValue, setEditedValue] = useState('');
  const [editedDate, setEditedDate] = useState('');

  const fetchWeeklyValues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/weekly-values');
      if (!response.ok) {
        throw new Error("Nepodarilo sa načítať týždenné hodnoty");
      }
      const data = await response.json();
      setWeeklyValues(data as WeeklyValue[]);
    } catch (err: any) {
      console.error("Chyba pri načítaní týždenných hodnôt:", err.message);
      setWeeklyValues([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchWeeklyValues()
  }, [fetchWeeklyValues])
  
  // Reset states when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedWeeklyValue(null);
      setIsEditing(false);
      setSubmissionStatus('idle');
    }
  }, [isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
        const response = await fetch('/api/weekly-values', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                value: parseFloat(newValue),
                date: newDate,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Nepodarilo sa pridať týždennú hodnotu");
        }
        
        setNewValue("");
        setNewDate(new Date().toISOString().slice(0, 10));
        await fetchWeeklyValues();
        setShowAddWeeklyValueForm(false); // Collapse the form after submission
        
    } catch (err: any) {
        setError(err.message);
        console.error("Chyba pri pridávaní týždennej hodnoty:", err.message);
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleWeeklyValueClick = (wv: WeeklyValue) => {
    setSelectedWeeklyValue(wv);
    setEditedValue(wv.value.toString());
    setEditedDate(format(parseISO(wv.date), 'yyyy-MM-dd'));
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedWeeklyValue || !window.confirm("Naozaj chcete zmazať túto hodnotu?")) {
      return;
    }

    setSubmissionStatus('loading');
    try {
      const response = await fetch(`/api/weekly-values?id=${selectedWeeklyValue.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nepodarilo sa zmazať hodnotu');
      }

      await fetchWeeklyValues();
      setSubmissionStatus('success');
      setTimeout(() => setIsDialogOpen(false), 500);
    } catch (error: any) {
      console.error("Error deleting weekly value:", error);
      setSubmissionStatus('error');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedWeeklyValue) return;

    setSubmissionStatus('loading');
    try {
      const value = parseFloat(editedValue);
      if (isNaN(value) || value < 0) {
          throw new Error("Neplatná hodnota.");
      }

      const response = await fetch(`/api/weekly-values`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWeeklyValue.id, value, date: editedDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nepodarilo sa aktualizovať hodnotu');
      }

      await fetchWeeklyValues();
      setSubmissionStatus('success');
      setTimeout(() => setIsDialogOpen(false), 500);
    } catch (error: any) {
      console.error("Error updating weekly value:", error);
      setSubmissionStatus('error');
    }
  };


  const summaryData = useMemo(() => {
    if (weeklyValues.length === 0) return { latestValue: null, differenceCZK: null, differencePercentage: null, trend: null };
    const latest = weeklyValues[0].value;
    const previous = weeklyValues[1]?.value;
    if (previous === undefined || previous === null || previous === 0) return { latestValue: latest, differenceCZK: null, differencePercentage: null, trend: null };
    const diffCZK = latest - previous;
    const diffPercentage = (diffCZK / previous) * 100;
    const trend = diffCZK > 0 ? '↑' : (diffCZK < 0 ? '↓' : '');
    return { latestValue: latest, differenceCZK: diffCZK, differencePercentage: diffPercentage, trend: trend };
  }, [weeklyValues]);

  const chartData = useMemo(() => {
    return [...weeklyValues].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weeklyValues]);


  if (loading) {
    return <div className="text-center py-8">Načítavam týždenné hodnoty...</div>
  }

  const { latestValue, differenceCZK, differencePercentage, trend } = summaryData;
  const diffColorClass = differenceCZK !== null && differenceCZK > 0 ? "text-green-500" : (differenceCZK !== null && differenceCZK < 0 ? "text-red-500" : "text-gray-500");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {latestValue !== null && (
        <Card className="rounded-xl shadow-md p-6 text-center">
          <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Posledná týždenná hodnota</CardDescription>
          <CardTitle className="text-4xl font-extrabold mb-4 leading-none">{formatCZK(latestValue)}</CardTitle>
          {differenceCZK !== null && (
            <div className="flex justify-center items-center space-x-4 text-lg">
              <p className={`font-semibold ${diffColorClass}`}>{trend} {formatCZK(differenceCZK)}</p>
              <p className={`font-semibold ${diffColorClass}`}>({differencePercentage?.toFixed(2)}%)</p>
            </div>
          )}
        </Card>
      )}

      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Pridať týždennú hodnotu</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowAddWeeklyValueForm(!showAddWeeklyValueForm)}>
            <PlusCircle className={`h-6 w-6 transition-transform ${showAddWeeklyValueForm ? 'rotate-45' : ''}`} />
            <span className="sr-only">{showAddWeeklyValueForm ? 'Zavrieť formulár' : 'Otvoriť formulár'}</span>
          </Button>
        </CardHeader>
        {showAddWeeklyValueForm && (
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="value">Hodnota portfólia (CZK)</Label>
                <Input id="value" type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Hodnota portfólia na konci týždňa" required disabled={isSubmitting} className="w-full" />
              </div>
              <div>
                <Label htmlFor="date">Dátum</Label>
                <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required disabled={isSubmitting} className="w-full" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Pridávam...' : 'Pridať hodnotu'}</Button>
            </form>
          </CardContent>
        )}
      </Card>

      {chartData.length > 1 && (
        <Card className="rounded-xl shadow-md p-4">
          <CardHeader className="p-0 mb-4"><CardTitle className="text-xl">Vývoj týždennej hodnoty</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), 'MMM yy', { locale: cs })} minTickGap={10} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(tick) => formatCZK(tick)} domain={['auto', 'auto']} allowDataOverflow={false} tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip formatter={(value: number) => formatCZK(value)} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" name="Hodnota" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-xl shadow-md p-4">
        <CardHeader className="p-0 mb-4"><CardTitle className="text-xl">História týždenných hodnôt</CardTitle></CardHeader>
        <CardContent className="p-0 space-y-3">
          {weeklyValues.length === 0 ? (
            <p className="text-gray-500">Zatiaľ neboli zaznamenané žiadne týždenné hodnoty.</p>
          ) : (
            weeklyValues.map((wv, index) => {
              const previousWv = weeklyValues[index + 1];
              const currentDiffCZK = previousWv ? wv.value - previousWv.value : null;
              const currentDiffPercentage = (currentDiffCZK !== null && previousWv && previousWv.value !== 0) ? (currentDiffCZK / previousWv.value) * 100 : null;
              const diffTrend = currentDiffCZK !== null && currentDiffCZK > 0 ? '↑' : (currentDiffCZK !== null && currentDiffCZK < 0 ? '↓' : '');
              const diffHistoryColorClass = currentDiffCZK !== null && currentDiffCZK > 0 ? "text-green-500" : (currentDiffCZK !== null && currentDiffCZK < 0 ? "text-red-500" : "text-gray-500");

              return (
                <div key={wv.id} onClick={() => handleWeeklyValueClick(wv)} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div>
                    <p className="text-xl font-bold">{formatCZK(wv.value)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(wv.date), 'dd.MM.yyyy', { locale: cs })}</p>
                  </div>
                  {currentDiffCZK !== null && (
                    <div className="text-right">
                      <p className={`font-semibold ${diffHistoryColorClass}`}>{diffTrend} {formatCZK(currentDiffCZK)}</p>
                      <p className={`text-sm ${diffHistoryColorClass}`}>({currentDiffPercentage?.toFixed(2)}%)</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      
      {/* Edit/Delete Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Upraviť hodnotu' : 'Detail hodnoty'}</DialogTitle>
            {!isEditing && (
              <DialogDescription>
                Hodnota z dňa {selectedWeeklyValue ? format(new Date(selectedWeeklyValue.date), 'dd.MM.yyyy') : ''}: {selectedWeeklyValue ? formatCZK(selectedWeeklyValue.value) : ''}
              </DialogDescription>
            )}
          </DialogHeader>

          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-value" className="text-right">Hodnota</Label>
                <Input id="edit-value" type="number" value={editedValue} onChange={(e) => setEditedValue(e.target.value)} className="col-span-3" disabled={submissionStatus === 'loading'} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">Dátum</Label>
                <Input id="edit-date" type="date" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} className="col-span-3" disabled={submissionStatus === 'loading'} />
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
                <Button variant="secondary" onClick={() => setIsEditing(true)}>Upraviť</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={submissionStatus === 'loading'}>
                  {submissionStatus === 'loading' ? 'Mažem...' : 'Zmazať'}
                </Button>
                <DialogClose asChild><Button variant="outline">Zavrieť</Button></DialogClose>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
