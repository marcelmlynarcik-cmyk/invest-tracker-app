import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { UserStock, AiStockInsight } from '@/lib/types';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { fetchStockDataFromSheets } from '@/lib/stock-data-utils'; // Import the utility function

// Helper function to fetch all stock data - now directly calls the utility
async function getAllStockData(): Promise<UserStock[]> {
  try {
    const allStocks = await fetchStockDataFromSheets(); // Direct call to the utility function
    console.log(`[AI Insights API] Successfully fetched ${allStocks.length} stocks using direct function call.`);
    return allStocks;
  } catch (error) {
    console.error(`[AI Insights API] Error in getAllStockData (direct call):`, error);
    throw error;
  }
}

// Function to generate a single AI insight
async function generateAiInsight(stock: UserStock, genAI: GoogleGenerativeAI): Promise<Omit<AiStockInsight, 'id' | 'generated_date' | 'ticker'>> {
  const priceDiffPercent = stock.averagePrice > 0
    ? ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100
    : 0;

  const inputDataString = `Ticker: ${stock.ticker}
Názov spoločnosti: ${stock.name}
Aktuálna cena: ${stock.currentPrice} ${stock.currency}
Priemerná nákupná cena: ${stock.averagePrice} ${stock.currency}
Rozdiel ceny (%): ${priceDiffPercent.toFixed(2)}
Váha v portfóliu (%): ${stock.portfolioWeightPercent.toFixed(2)}
Aktuálna hodnota (CZK): ${stock.currentValueCZK.toFixed(2)}`;

  const systemPrompt = `Si investičný analytický asistent.
Neposkytuješ finančné poradenstvo.
Produkuješ pokojné, dlhodobo orientované, neutrálne poznatky.
Nespomínaš analytikov, inštitúcie, cenové ciele ani zdroje dát.
Všetky výstupy sú v slovenskom jazyku.`;

  const userPrompt = `VSTUPNÉ DÁTA:
${inputDataString}

ÚLOHA 1 — VŠEOBECNÝ SIGNÁL:
Na základe všeobecne známeho dlhodobého trhového správania a základov spoločnosti,
vráť presne JEDEN signál:

- SILNÝ NÁKUP
- NÁKUP
- DRŽAŤ
- PREDAJ
- SILNÝ PREDAJ

ÚLOHA 2 — PERSONALIZOVANÝ KONTEXT:
Vysvetli situáciu na základe MOJEJ pozície:
- Zisk vs. strata
- Vzdialenosť od priemernej nákupnej ceny
- Riziko koncentrácie portfólia

PRAVIDLÁ:
- Žiadne inštrukcie
- Žiadne predpovede s dátumami
- Žiadne zmienky o analytikoch
- 2 – 3 vety pre každé zhrnutie

VÝSTUPNÝ FORMÁT (LEN JSON):

{
  "signal": "SILNÝ NÁKUP | NÁKUP | DRŽAŤ | PREDAJ | SILNÝ PREDAJ",
  "signal_color": "dark_green | green | gray | orange | red",
  "general_summary": "reťazec v slovenčine",
  "personalized_summary": "reťazec v slovenčine",
  "confidence_level": "low | medium | high"
}`;

  const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" }); // Use the correct model name

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  try {
    console.log(`[AI Insights API] Calling Gemini API for ${stock.ticker}...`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'user', parts: [{ text: userPrompt }] }],
      safetySettings,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    });
    console.log(`[AI Insights API] Received response from Gemini API for ${stock.ticker}.`);
    const responseText = result.response.text();
    console.log(`[AI Insights API] Gemini raw response text for ${stock.ticker}:`, responseText.substring(0, 500)); // Log first 500 chars
    let aiInsight;
    try {
      aiInsight = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[AI Insights API] Failed to parse AI response as JSON for ${stock.ticker}:`, responseText, parseError);
      throw new Error('AI service returned invalid JSON.');
    }

    const requiredKeys = ['signal', 'signal_color', 'general_summary', 'personalized_summary', 'confidence_level'];
    const missingKeys = requiredKeys.filter(key => !(key in aiInsight));
    if (missingKeys.length > 0) {
      console.error(`[AI Insights API] AI response for ${stock.ticker} missing required keys:`, missingKeys, aiInsight);
      throw new Error(`AI response missing required keys: ${missingKeys.join(', ')}`);
    }

    return aiInsight;
  } catch (error) {
    console.error(`[AI Insights API] Error generating AI insight for ${stock.ticker}:`, error);
    throw error;
  }
}

export async function GET() { // Changed to GET as it will retrieve all insights
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('[AI Insights API] GEMINI_API_KEY is NOT set in environment variables. This is a critical configuration error.');
    return NextResponse.json({ error: 'AI service not configured. Please set GEMINI_API_KEY.' }, { status: 500 });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  try {
    console.log('[AI Insights API] Starting batch insight generation process.');
    const allStocks = await getAllStockData();
    console.log(`[AI Insights API] Successfully fetched ${allStocks.length} stocks from internal utility.`);
    const allInsights: AiStockInsight[] = [];

    for (const stock of allStocks) {
      // 1. Check for cached result for today
      let insight: AiStockInsight | null = null;
      console.log(`[AI Insights API] Processing stock: ${stock.ticker}, today: ${today}`);
      const { data: cachedInsight, error: cacheError } = await supabaseServer
        .from('ai_stock_insights')
        .select('*')
        .eq('ticker', stock.ticker)
        .eq('generated_date', today) // Use generated_date
        .single();

      if (cacheError && cacheError.code !== 'PGRST116') { // PGRST116 means no rows found (not an error for our logic)
        console.error(`[AI Insights API] Supabase cache lookup error for ${stock.ticker}:`, cacheError);
      }

      if (cachedInsight) {
        insight = cachedInsight as AiStockInsight;
        console.log(`[AI Insights API] Returning cached AI insight for ${stock.ticker} on ${today}.`);
      } else {
        // No cached insight for today, generate a new one
        console.log(`[AI Insights API] No cache for ${stock.ticker} on ${today}. Generating new AI insight.`);
        try {
          const generated = await generateAiInsight(stock, genAI);
          // Save/update in Supabase
          const { data, error: upsertError } = await supabaseServer
            .from('ai_stock_insights')
            .upsert({
              ticker: stock.ticker,
              signal: generated.signal,
              signal_color: generated.signal_color,
              general_summary: generated.general_summary,
              personalized_summary: generated.personalized_summary,
              confidence_level: generated.confidence_level,
              generated_date: today, // Use generated_date
            }, { onConflict: 'ticker,generated_date' }) // Conflict on ticker and generated_date to update existing
            .select('*')
            .single();

          if (upsertError) {
            console.error(`[AI Insights API] Error upserting AI insight for ${stock.ticker} to Supabase:`, upsertError);
            // Even if caching fails, we can still return the generated insight
          } else if (data) {
            insight = data as AiStockInsight;
            console.log(`[AI Insights API] Successfully upserted new insight for ${stock.ticker}.`);
          }
        } catch (genError) {
          console.error(`[AI Insights API] Failed to generate AI insight for ${stock.ticker} during generation process:`, genError);
          // If generation fails, we still want to proceed with other stocks
          // Optionally, add a placeholder or a default 'HOLD' insight
        }
      }
      if (insight) {
        allInsights.push(insight);
      }
    }

    console.log(`[AI Insights API] Finished batch insight generation. Total insights: ${allInsights.length}`);
    return NextResponse.json(allInsights);

  } catch (error: any) {
    console.error(`[AI Insights API] Unhandled critical error in batch insight generation process:`, error);
    return NextResponse.json(
      { error: 'Failed to generate batch AI stock insights due to an internal server error.' },
      { status: 500 }
    );
  }
}