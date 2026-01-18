import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker is required.' },
      { status: 400 }
    );
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: 'Finnhub API key is not set.' },
      { status: 500 }
    );
  }

  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.c && data.c !== 0) {
      return NextResponse.json({
        symbol: ticker,
        price: parseFloat(data.c),
      });
    } else {
      return NextResponse.json(
        { error: `Finnhub did not return expected data for ${ticker}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${ticker}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch stock price data.' },
      { status: 500 }
    );
  }
}
