import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { UserStock } from '@/lib/types';

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  console.log("Stocks API: spreadsheetId:", spreadsheetId ? "Configured" : "NOT Configured");
  console.log("Stocks API: clientEmail:", clientEmail ? "Configured" : "NOT Configured");
  if (privateKey) {
    console.log("Stocks API: privateKey (first 50 chars):", privateKey.substring(0, 50));
    console.log("Stocks API: privateKey (after newline replace, first 50 chars):", privateKey.replace(/\\n/g, '\n').substring(0, 50));
  } else {
    console.log("Stocks API: privateKey: NOT Configured");
  }

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.error('Configuration Error: Google Sheets ID or Service Account credentials not configured.');
    return NextResponse.json(
      { error: 'Google Sheets ID or Service Account credentials not configured.' },
      { status: 500 }
    );
  }

  // Robustly clean and validate the private key
  const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n').trim(); // Handle escaped newlines and trim whitespace
  if (!cleanedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----') || !cleanedPrivateKey.endsWith('-----END PRIVATE KEY-----')) {
    console.error('Configuration Error: GOOGLE_PRIVATE_KEY is malformed. It must be a valid PEM-encoded private key including BEGIN/END markers.');
    return NextResponse.json(
      { error: 'GOOGLE_PRIVATE_KEY is malformed.' },
      { status: 500 }
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: cleanedPrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Readonly scope for GET
  });

  try {
    await auth.authorize(); // Authenticate the service account

    const sheets = google.sheets({
      version: 'v4',
      auth: auth, // Use the authenticated JWT client
    });

    const range = 'Portfólio!A2:M'; // Adjust the range as needed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows) {
      return NextResponse.json([]);
    }

    const parseLocaleNumber = (value: string | undefined): number => {
      if (typeof value === 'string' && value.trim() !== '') {
        // Remove common thousands separators (space, thin space, non-breaking space)
        let cleaned = value.trim().replace(/[\s\u202F\u00A0]/g, '');
        // Replace comma decimal separator with dot
        cleaned = cleaned.replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }

    const stocks: UserStock[] = rows.map((row) => ({
      ticker: row[0] || '',
      name: row[1] || '',
      shares: parseLocaleNumber(row[2]),
      averagePrice: parseLocaleNumber(row[3]),
      currentPrice: parseLocaleNumber(row[4]),
      percentDiff: parseLocaleNumber(row[5]),
      currentValueOriginalCurrency: parseLocaleNumber(row[6]),
      profitOriginalCurrency: parseLocaleNumber(row[7]),
      portfolioWeightPercent: parseLocaleNumber(row[8]),
      recommendation: row[9] || '',
      currency: row[10] || 'USD', // Default to USD if currency code is missing
      currentValueCZK: parseLocaleNumber(row[11]),
      profitCZK: parseLocaleNumber(row[12]),
    }));

    return NextResponse.json(stocks);
  } catch (error: any) {
    console.error('Error fetching from Google Sheets:', error.message, error.stack, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock data.' },
      { status: 500 }
    );
  }
}
