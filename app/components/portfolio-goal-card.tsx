"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { formatCZK, calculatePortfolioTrend } from "@/lib/utils"
import { WeeklyValue } from "@/lib/types"
import { addMonths, format } from "date-fns"
import { sk } from "date-fns/locale"

interface PortfolioGoalCardProps {
  currentValue: number
  historicalValues: WeeklyValue[]
}

export function PortfolioGoalCard({
  currentValue,
  historicalValues,
}: PortfolioGoalCardProps) {
  const [target, setTarget] = useState<number | null>(null)
  const [editTarget, setEditTarget] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const savedTarget = localStorage.getItem("portfolioGoal")
    if (savedTarget) {
      const parsedTarget = parseFloat(savedTarget)
      setTarget(parsedTarget)
      setEditTarget(parsedTarget.toString())
    }
  }, [])

  const handleSaveTarget = () => {
    const newTarget = parseFloat(editTarget)
    if (!isNaN(newTarget) && newTarget > 0) {
      setTarget(newTarget)
      localStorage.setItem("portfolioGoal", newTarget.toString())
      setIsModalOpen(false)
    }
  }

  if (target === null) {
    return (
      <Card className="rounded-xl shadow-md p-6 text-center">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl">Cieľ portfólia</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nastavte si cieľovú sumu a sledujte svoj pokrok.
          </p>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>Nastaviť cieľ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nastaviť cieľovú sumu</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="number"
                  placeholder="napr. 1000000"
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTarget();
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Zrušiť</Button>
                </DialogClose>
                <Button onClick={handleSaveTarget}>Uložiť</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  const { averageMonthlyIncrease } = calculatePortfolioTrend(historicalValues)
  const progress = Math.min((currentValue / target) * 100, 100)

  const getEstimationDate = (monthlyIncrease: number) => {
    if (currentValue >= target) return null
    if (monthlyIncrease <= 0) return null

    const monthsToGoal = (target - currentValue) / monthlyIncrease
    const estimationDate = addMonths(new Date(), monthsToGoal)
    return format(estimationDate, "MMMM yyyy", { locale: sk })
  }

  const realisticDate = getEstimationDate(averageMonthlyIncrease)
  const optimisticDate = getEstimationDate(averageMonthlyIncrease * 1.3)
  const conservativeDate = getEstimationDate(averageMonthlyIncrease * 0.7)

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Cieľ portfólia</CardTitle>
            <CardDescription>
              Cieľová suma: {formatCZK(target)}
            </CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Zmeniť cieľ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zmeniť cieľovú sumu</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="number"
                  placeholder="napr. 1000000"
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTarget();
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Zrušiť</Button>
                </DialogClose>
                <Button onClick={handleSaveTarget}>Uložiť</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktuálny pokrok
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress.toFixed(2)}%
            </span>
          </div>
          <Progress value={progress} />
        </div>

        {currentValue >= target ? (
          <p className="text-center font-semibold text-green-600">
            🎉 Gratulujeme, cieľ bol dosiahnutý!
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold mb-2 text-center">Odhadovaný čas do dosiahnutia cieľa:</h4>
            {realisticDate ? (
              <>
                <p><strong>Realistický scenár:</strong> {realisticDate}</p>
                <p><strong>Optimistický scenár:</strong> {optimisticDate}</p>
                <p><strong>Konzervatívny scenár:</strong> {conservativeDate}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Odhad vychádza z historického vývoja portfólia, nie z garantovaného výnosu.
                </p>
              </>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Pri súčasnom trende nie je možné odhadnúť dosiahnutie cieľa.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
