
import { NextResponse } from 'next/server';
import { fetchStockDataFromSheets } from '@/lib/stock-data-utils';
import { supabaseServer } from '@/lib/supabase-server';
import { AiStockInsight, UserStock } from '@/lib/types';

// This is the new endpoint for the cron job.
export async function GET(request: Request) {


  try {
    // 2. Fetch all stocks from Google Sheets
    const stocks = await fetchStockDataFromSheets();
    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ message: 'No stocks found, nothing to update.' });
    }

    const updatePromises = stocks.map(async (stock) => {
      try {
        // 3. For each stock, call the AI insight generation endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/stock-insight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Failed to get AI insight for ${stock.ticker}: ${response.status} ${response.statusText}`, errorBody);
            return; // Skip this stock
        }

        const insight: AiStockInsight = await response.json();

        // 4. Save the result to Supabase
        const { error } = await supabaseServer
          .from('ai_stock_insights')
          .upsert({
            ticker: stock.ticker,
            signal: insight.signal,
            signal_color: insight.signal_color,
            general_summary: insight.general_summary,
            personalized_summary: insight.personalized_summary,
            confidence_level: insight.confidence_level,
            generated_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          }, { onConflict: 'ticker' });

        if (error) {
          console.error(`Error saving insight to Supabase for ${stock.ticker}:`, error);
        } else {
            console.log(`Successfully updated insight for ${stock.ticker}`);
        }
      } catch (e: any) {
        console.error(`Error processing stock ${stock.ticker}:`, e.message);
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'AI insights update process completed.' });

  } catch (error: any) {
    console.error('Error in cron job:', error.message);
    return NextResponse.json(
      { error: 'Failed to update AI insights due to a server error.' },
      { status: 500 }
    );
  }
}
