import { google } from 'googleapis';
import { UserStock } from '@/lib/types'; // Assuming UserStock is defined here

// Helper function to parse numbers in 'X,Y' or 'X.Y' format
const parseLocaleNumber = (value: string | undefined): number => {
  if (typeof value === 'string' && value.trim() !== '') {
    let cleaned = value.trim().replace(/[\s\u202F\u00A0]/g, '');
    cleaned = cleaned.replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function fetchStockDataFromSheets(): Promise<UserStock[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;

  if (!spreadsheetId || !serviceAccountEmail || !privateKeyBase64) {
    console.error('Configuration Error: Google Sheets ID, Service Account Email, or Google Private Key Base64 not configured.');
    throw new Error('Google Sheets API configuration missing.');
  }

  try {
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    await auth.authorize();

    const sheets = google.sheets({
      version: 'v4',
      auth: auth,
    });

    const range = 'Portfólio!A2:M';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows) {
      return [];
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
      currency: row[10] || 'USD',
      currentValueCZK: parseLocaleNumber(row[11]),
      profitCZK: parseLocaleNumber(row[12]),
    }));

    return stocks;
  } catch (error: any) {
    console.error('Error fetching from Google Sheets (utility):', error.message);
    throw new Error('Failed to fetch stock data from Google Sheets.');
  }
}
