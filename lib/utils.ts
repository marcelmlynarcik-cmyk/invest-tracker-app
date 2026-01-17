import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCZK(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return ""
  }
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}