import { StockData } from "./types"

// Function to search for stock symbols (e.g., for an autocomplete input)
export async function searchStockSymbols(keywords: string): Promise<any[] | null> {
  const url = `/api/stock-search?q=${keywords}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to search stock symbols.');
    }
  } catch (error) {
    console.error(`Error searching stock symbols for ${keywords}:`, error)
    return null
  }
}
