import { NextResponse } from 'next/server';
import { fetchStockDataFromSheets } from '@/lib/stock-data-utils'; // Adjusted import path

export async function GET() {
  console.log("=== ENV VAR CHECK (inside GET handler for /api/stocks) ===");
  console.log("GOOGLE_SHEETS_ID exists:", !!process.env.GOOGLE_SHEETS_ID);
  console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL exists:", !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log("GOOGLE_PRIVATE_KEY_BASE64 exists:", !!process.env.GOOGLE_PRIVATE_KEY_BASE64);
  console.log("========================================");

  try {
    const stocks = await fetchStockDataFromSheets();
    return NextResponse.json(stocks);
  } catch (error: any) {
    console.error('Error in /api/stocks GET handler:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch stock data due to a server error.' },
      { status: 500 }
    );
  }
}

