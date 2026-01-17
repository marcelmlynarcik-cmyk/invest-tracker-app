"use client"

import { useState } from "react"
import { BottomNav } from "@/app/components/bottom-nav"
import { OverviewTab } from "@/app/components/overview-tab"
import { PortfolioTab } from "@/app/components/portfolio-tab"
import { BuyTipTab } from "@/app/components/buy-tip-tab"
import { PerformanceTab } from "@/app/components/performance-tab"
import { WeeklyValueTab } from "@/app/components/weekly-value-tab"

const tabTitles: Record<string, string> = {
  overview: "Prehľad",
  portfolio: "Portfólio",
  "buy-tip": "Tip na nákup",
  transactions: "Transakcie",
  "weekly-value": "Týždenná hodnota",
  performance: "Výkonnosť",
}

export function TabsHandler({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <>
      {/* Main Content - scrollable with safe areas */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide px-4 py-4 pb-28">
        <h1 className="mb-4 text-2xl font-bold">{tabTitles[activeTab]}</h1>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "portfolio" && <PortfolioTab />}
        {activeTab === "buy-tip" && <BuyTipTab />}
        {activeTab === "transactions" && children}
        {activeTab === "weekly-value" && <WeeklyValueTab />}
        {activeTab === "performance" && <PerformanceTab />}
      </main>

      {/* Bottom Navigation with safe area */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
