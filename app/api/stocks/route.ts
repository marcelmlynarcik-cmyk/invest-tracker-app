console.log("=== ENV DEBUG START ===");
console.log("GOOGLE_SHEETS_ID:", process.env.GOOGLE_SHEETS_ID);
console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log(
  "GOOGLE_PRIVATE_KEY_BASE64 exists:",
  !!process.env.GOOGLE_PRIVATE_KEY_BASE64
);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=== ENV DEBUG END ===");


import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { UserStock } from '@/lib/types';

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY_BASE64) {
    console.error('Configuration Error: Google Sheets ID, Service Account Email, or Google Private Key Base64 not configured.');
    return NextResponse.json(
      { error: 'Google Sheets ID, Service Account Email, or Google Private Key Base64 not configured.' },
      { status: 500 }
    );
  }

  const privateKey = Buffer.from(
    process.env.GOOGLE_PRIVATE_KEY_BASE64!,
    "base64"
  ).toString("utf8");

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
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
console.log("ENV CHECK", {
  sheets: process.env.GOOGLE_SHEETS_ID,
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  keyExists: !!process.env.GOOGLE_PRIVATE_KEY_BASE64,
});
