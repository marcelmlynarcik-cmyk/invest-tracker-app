
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserStock, AiStockInsight } from '@/lib/types';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

async function getAnalystConsensus(ticker: string): Promise<string> {
    // As direct web search is not feasible from this context,
    // we return a placeholder string. Gemini will use its internal knowledge
    // to simulate analyst consensus.
    return "Systém používa interné znalosti AI pre simulovaný konsenzus analytikov. AI bude generovať signál a zhrnutia na základe svojho všeobecného trhového prehľadu a fundamentálnych princípov.";
}


export async function generateInsightForStock(stock: UserStock): Promise<AiStockInsight> {
    const consensusPlaceholder = await getAnalystConsensus(stock.ticker);

    const prompt = `
      Analyzuj nasledujúcu akciu z portfólia a vygeneruj investičný signál a zhrnutie v slovenčine. Buď ako zhrnutie konsenzu analytikov, nie ako osobný poradca.

      **Profil Akcie:**
      - Spoločnosť: ${stock.name} (${stock.ticker})
      - Priemerná nákupná cena: ${stock.averagePrice} ${stock.currency}
      - Aktuálna cena: ${stock.currentPrice} ${stock.currency}
      - Nerealizovaný zisk/strata: ${stock.profitOriginalCurrency.toFixed(2)} ${stock.currency} (${stock.percentDiff.toFixed(2)}%)
      - Váha v portfóliu: ${stock.portfolioWeightPercent.toFixed(2)}%

      **Kľúčové body pre AI analýzu:**
      ${consensusPlaceholder}

      **Požiadavky na analýzu:**
      1.  **Signál (signal):** Založ signál primárne na všeobecne akceptovanom konsenze analytikov, fundamentoch a dlhodobom výhľade. Ignoruj môj osobný zisk alebo stratu. Možnosti: 'SILNÝ NÁKUP', 'NÁKUP', 'DRŽAŤ', 'PREDAJ', 'SILNÝ PREDAJ'.
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
    return aiInsight;
}


export async function POST(request: Request) {
  try {
    const { stock }: { stock: UserStock } = await request.json();
    const aiInsight = await generateInsightForStock(stock);
    return NextResponse.json(aiInsight);

  } catch (error: any) {
    console.error('Error generating AI stock insight:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate AI insight due to a server error.' },
      { status: 500 }
    );
  }
}
