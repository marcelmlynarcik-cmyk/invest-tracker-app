
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserStock, AiStockInsight } from '@/lib/types';
import { google } from 'googleapis';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

async function getAnalystConsensus(ticker: string): Promise<string> {
    try {
        // This is a placeholder for a real financial data API.
        // For now, we will use a web search to get a general idea.
        const searchQuery = `${ticker} analyst rating consensus`;
        const searchResults = await google.search({ q: searchQuery });
        
        if (searchResults.knowledge_graph?.description) {
            return searchResults.knowledge_graph.description;
        }

        let context = "";
        for (const result of searchResults.organic_results.slice(0, 3)) {
            context += result.snippet || result.title + "\n";
        }
        return context || "No analyst consensus found.";

    } catch (error) {
        console.error(`Error fetching analyst consensus for ${ticker}:`, error);
        return "Error fetching analyst consensus.";
    }
}


export async function POST(request: Request) {
  try {
    const { stock }: { stock: UserStock } = await request.json();

    const consensus = await getAnalystConsensus(stock.ticker);

    const prompt = `
      Analyzuj nasledujúcu akciu z portfólia a vygeneruj investičný signál a zhrnutie v slovenčine. Buď ako zhrnutie konsenzu analytikov, nie ako osobný poradca.

      **Profil Akcie:**
      - Spoločnosť: ${stock.name} (${stock.ticker})
      - Priemerná nákupná cena: ${stock.averagePrice} ${stock.currency}
      - Aktuálna cena: ${stock.currentPrice} ${stock.currency}
      - Nerealizovaný zisk/strata: ${stock.profitOriginalCurrency.toFixed(2)} ${stock.currency} (${stock.percentDiff.toFixed(2)}%)
      - Váha v portfóliu: ${stock.portfolioWeightPercent.toFixed(2)}%

      **Konsenzus Analytikov (z webu):**
      "${consensus}"

      **Požiadavky na analýzu:**
      1.  **Signál (signal):** Založ signál primárne na konsenze analytikov, fundamentoch a dlhodobom výhľade. Ignoruj môj osobný zisk alebo stratu. Možnosti: 'SILNÝ NÁKUP', 'NÁKUP', 'DRŽAŤ', 'PREDAJ', 'SILNÝ PREDAJ'.
      2.  **Farba Signálu (signal_color):** Priraď farbu k signálu: SILNÝ NÁKUP (dark_green), NÁKUP (green), DRŽAŤ (gray), PREDAJ (orange), SILNÝ PREDAJ (red).
      3.  **Všeobecné Zhrnutie (general_summary):** Stručné (2-3 vety) zhrnutie, prečo je daný signál vhodný. Zameraj sa na biznis model, sektor, a analytické trendy. Nepoužívaj mená analytikov ani inštitúcií a neuvádzaj cenové ciele.
      4.  **Personalizované Zhrnutie (personalized_summary):** Stručný (1-2 vety) komentár k mojej pozícii. Spomeň môj zisk/stratu, ale drž sa celkového konsenzu. Ak je váha v portfóliu vysoká (>15%), môžeš spomenúť riziko koncentrácie.
      5.  **Úroveň Istoty (confidence_level):** Ohodnoť istotu v tento signál na základe sily konsenzu. Možnosti: 'low', 'medium', 'high'.

      **Prísne pravidlá:**
      -   Žiadne finančné poradenstvo.
      -   Neutrálny, dlhodobý tón.
      -   IBA slovenčina.
      -   IBA formát JSON.

      Vráť IBA JSON objekt v nasledujúcom formáte:
      {
        "signal": "...",
        "signal_color": "...",
        "general_summary": "...",
        "personalized_summary": "...",
        "confidence_level": "..."
      }
      `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Basic validation to ensure we got a parsable JSON
    if (!text.startsWith('{') || !text.endsWith('}')) {
        throw new Error('AI did not return a valid JSON object.');
    }

    const aiInsight: AiStockInsight = JSON.parse(text);

    return NextResponse.json(aiInsight);

  } catch (error: any) {
    console.error('Error generating AI stock insight:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate AI insight due to a server error.' },
      { status: 500 }
    );
  }
}
