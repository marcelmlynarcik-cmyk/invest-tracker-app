import { StockData, ExchangeRateData } from "./types"

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const EXCHANGERATE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY

export async function fetchStockPrice(ticker: string): Promise<StockData | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key is not set.")
  }
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data["Global Quote"]) {
      return {
        symbol: data["Global Quote"]["01. symbol"],
        price: parseFloat(data["Global Quote"]["05. price"]),
      }
    } else if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Error for ${ticker}: ${data["Error Message"]}`)
    } else {
      throw new Error(`Alpha Vantage did not return expected data for ${ticker}: ${JSON.stringify(data)}`)
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
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key is not set.")
  }
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.bestMatches) {
      return data.bestMatches.map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        currency: match["8. currency"],
      }))
    } else if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Error for symbol search: ${data["Error Message"]}`)
    }
    throw new Error(`Alpha Vantage did not return expected data for symbol search: ${JSON.stringify(data)}`)
  } catch (error) {
    console.error(`Error searching stock symbols for ${keywords}:`, error)
    return null
  }
}
