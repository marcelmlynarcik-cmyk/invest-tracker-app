"use client"

import { LayoutDashboard, PieChart, Lightbulb, Receipt, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "buy-tip", label: "Tip", icon: Lightbulb },
  { id: "transactions", label: "History", icon: Receipt },
  { id: "performance", label: "Stats", icon: TrendingUp },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-bottom">
      <div className="flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-all touch-target touch-active no-select",
                isActive ? "text-primary" : "text-muted-foreground active:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("font-medium", isActive && "font-semibold")}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
