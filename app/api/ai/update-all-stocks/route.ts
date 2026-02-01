
import { NextResponse } from 'next/server';
import { fetchStockDataFromSheets } from '@/lib/stock-data-utils';
import { supabaseServer } from '@/lib/supabase-server';
import { AiStockInsight, UserStock } from '@/lib/types';
import { generateInsightForStock } from '../stock-insight/route';

// This is the new endpoint for the cron job.
export async function GET(request: Request) {


  try {
    // 1. Fetch all stocks from Google Sheets
    const stocks = await fetchStockDataFromSheets();
    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ message: 'No stocks found, nothing to update.' });
    }

    const updatePromises = stocks.map(async (stock) => {
      try {
        // 2. For each stock, call the AI insight generation function directly
        const insight: AiStockInsight = await generateInsightForStock(stock);

        // 3. Delete existing insight for the ticker and then insert the new one
        const { error: deleteError } = await supabaseServer
          .from('ai_stock_insights')
          .delete()
          .eq('ticker', stock.ticker);

        if (deleteError) {
          console.error(`Error deleting existing insight for ${stock.ticker}:`, deleteError);
          // Continue to insert even if delete fails, might be no existing record
        }

        const { error: insertError } = await supabaseServer
          .from('ai_stock_insights')
          .insert({
            ticker: stock.ticker,
            signal: insight.signal,
            signal_color: insight.signal_color,
            general_summary: insight.general_summary,
            personalized_summary: insight.personalized_summary,
            confidence_level: insight.confidence_level,
            generated_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          });

        if (insertError) {
          console.error(`Error saving insight to Supabase for ${stock.ticker}:`, insertError);
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
