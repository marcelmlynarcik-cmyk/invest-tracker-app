import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { UserStock } from '@/lib/types';

export async function GET() {
  // SAFE DEBUG LOGS: Moved inside the handler to run at request time.
  console.log("=== ENV VAR CHECK (inside GET handler) ===");
  console.log("GOOGLE_SHEETS_ID exists:", !!process.env.GOOGLE_SHEETS_ID);
  console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL exists:", !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log("GOOGLE_PRIVATE_KEY_BASE64 exists:", !!process.env.GOOGLE_PRIVATE_KEY_BASE64);
  console.log("========================================");

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;

  // VALIDATION: Ensure all required environment variables are present.
  if (!spreadsheetId || !serviceAccountEmail || !privateKeyBase64) {
    console.error('Configuration Error: Google Sheets ID, Service Account Email, or Google Private Key Base64 not configured.');
    return NextResponse.json(
      { error: 'Google Sheets ID, Service Account Email, or Google Private Key Base64 not configured.' },
      { status: 500 }
    );
  }

  try {
    // DECODE KEY & AUTHENTICATE
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

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

    // Helper function to parse numbers in 'X,Y' or 'X.Y' format
    const parseLocaleNumber = (value: string | undefined): number => {
      if (typeof value === 'string' && value.trim() !== '') {
        // Remove common thousands separators and trim whitespace
        let cleaned = value.trim().replace(/[\s\u202F\u00A0]/g, '');
        // Replace comma decimal separator with a dot
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
    console.error('Error fetching from Google Sheets:', error.message);
    // Avoid logging the full stack trace in the response for security
    return NextResponse.json(
      { error: 'Failed to fetch stock data due to a server error.' },
      { status: 500 }
    );
  }
}
