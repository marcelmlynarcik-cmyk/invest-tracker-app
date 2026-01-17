import { StockData, ExchangeRateData } from "./types"

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
const EXCHANGERATE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY

export async function fetchStockPrice(ticker: string): Promise<StockData | null> {
  if (!FINNHUB_API_KEY) {
    throw new Error("Finnhub API key is not set.")
  }
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.c && data.c !== 0) { // c is current price, 0 means no data or market closed
      return {
        symbol: ticker,
        price: parseFloat(data.c),
      }
    } else {
      throw new Error(`Finnhub did not return expected data for ${ticker}: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${ticker}:`, error)
    return null
  }
}

export async function fetchExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<ExchangeRateData | null> {
  if (!EXCHANGERATE_API_KEY) {
    throw new Error("ExchangeRate-API key is not set.")
  }
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/pair/${baseCurrency}/${targetCurrency}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.result === "success") {
      return {
        base_code: data.base_code,
        target_code: data.target_code,
        conversion_rate: data.conversion_rate,
      }
    } else if (data["error-type"]) {
      throw new Error(`ExchangeRate-API Error for ${baseCurrency}/${targetCurrency}: ${data["error-type"]}`)
    } else {
      throw new Error(`ExchangeRate-API did not return expected data for ${baseCurrency}/${targetCurrency}: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error(`Error fetching exchange rate for ${baseCurrency}/${targetCurrency}:`, error)
    return null
  }
}

// Function to search for stock symbols (e.g., for an autocomplete input)
export async function searchStockSymbols(keywords: string): Promise<any[] | null> {
  if (!FINNHUB_API_KEY) {
    throw new Error("Finnhub API key is not set.")
  }
  const url = `https://finnhub.io/api/v1/search?q=${keywords}&token=${FINNHUB_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.result && data.result.length > 0) {
      return data.result.map((match: any) => ({
        symbol: match.symbol,
        name: match.description,
        type: match.type,
        currency: "USD", // Finnhub search doesn't return currency directly, defaulting to USD
      }))
    } else if (data.count === 0) {
      return [] // No results found
    }
    throw new Error(`Finnhub did not return expected data for symbol search: ${JSON.stringify(data)}`)
  } catch (error) {
    console.error(`Error searching stock symbols for ${keywords}:`, error)
    return null
  }
}
