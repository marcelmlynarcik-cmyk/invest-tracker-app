import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get('q');

  if (!keywords) {
    return NextResponse.json(
      { error: 'Keywords are required.' },
      { status: 400 }
    );
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: 'Finnhub API key is not set.' },
      { status: 500 }
    );
  }

  const url = `https://finnhub.io/api/v1/search?q=${keywords}&token=${FINNHUB_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      const results = data.result.map((match: any) => ({
        symbol: match.symbol,
        name: match.description,
        type: match.type,
        currency: "USD",
      }));
      return NextResponse.json(results);
    } else if (data.count === 0) {
      return NextResponse.json([]);
    } else {
      return NextResponse.json(
        { error: 'Finnhub did not return expected data for symbol search' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error searching stock symbols for ${keywords}:`, error);
    return NextResponse.json(
      { error: 'Failed to search stock symbols.' },
      { status: 500 }
    );
  }
}
