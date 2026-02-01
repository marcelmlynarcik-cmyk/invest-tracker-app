
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // This endpoint now ONLY reads all existing insights from the Supabase table.
    // All generation is handled by the cron job via /api/ai/update-all-stocks.
    const { data: insights, error } = await supabaseServer
      .from('ai_stock_insights')
      .select('*');

    if (error) {
      console.error('Error fetching AI insights from Supabase:', error);
      throw new Error('Failed to fetch AI insights from database.');
    }

    return NextResponse.json(insights || []);
    
  } catch (error: any) {
    console.error('Error in /api/ai/insights GET handler:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch AI insights due to a server error.' },
      { status: 500 }
    );
  }
}
