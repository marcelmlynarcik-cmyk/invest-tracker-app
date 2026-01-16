"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { OverviewTab } from "@/components/overview-tab"
import { PortfolioTab } from "@/components/portfolio-tab"
import { BuyTipTab } from "@/components/buy-tip-tab"
import { TransactionsTab } from "@/components/transactions-tab"
import { PerformanceTab } from "@/components/performance-tab"
import { TrendingUp } from "lucide-react"

const tabTitles: Record<string, string> = {
  overview: "Overview",
  portfolio: "Portfolio",
  "buy-tip": "Buy Tip",
  transactions: "Transactions",
  performance: "Performance",
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

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
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - scrollable with safe areas */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide px-4 py-4 pb-28">
        <h1 className="mb-4 text-2xl font-bold">{tabTitles[activeTab]}</h1>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "portfolio" && <PortfolioTab />}
        {activeTab === "buy-tip" && <BuyTipTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "performance" && <PerformanceTab />}
      </main>

      {/* Bottom Navigation with safe area */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
