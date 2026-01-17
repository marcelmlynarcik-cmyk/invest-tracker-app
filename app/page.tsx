import { BottomNav } from "@/app/components/bottom-nav"
import { TabsHandler } from "@/app/components/tabs-handler"
import { TransactionsTab } from "@/app/components/transactions-tab"
import { TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header - sticky with safe area */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">InvestTracker</span>
          </div>
          
        </div>
      </header>

      <TabsHandler>
        <TransactionsTab />
      </TabsHandler>
    </div>
  )
}
