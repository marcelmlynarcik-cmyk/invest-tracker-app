import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { UserStock } from '@/lib/types';

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!spreadsheetId || !apiKey) {
    return NextResponse.json(
      { error: 'Google Sheets ID or API Key not configured.' },
      { status: 500 }
    );
  }

  const sheets = google.sheets({
    version: 'v4',
    auth: apiKey,
  });

  try {
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
        let s = value.trim();

        // Remove all characters that are not digits, dot, or comma
        s = s.replace(/[^0-9.,]/g, '');

        // Determine decimal and thousands separators based on presence and order
        const commaIndex = s.indexOf(',');
        const dotIndex = s.indexOf('.');

        let finalValueString: string;

        // Case 1: European format (e.g., 1.234.567,89) - comma is decimal, dots are thousands
        if (commaIndex > -1 && dotIndex > -1 && commaIndex > dotIndex) {
          finalValueString = s.replace(/\./g, '').replace(',', '.');
        } 
        // Case 2: American format (e.g., 1,234,567.89) - dot is decimal, commas are thousands
        else if (commaIndex > -1 && dotIndex > -1 && dotIndex > commaIndex) {
          finalValueString = s.replace(/,/g, ''); // Dot is already decimal
        }
        // Case 3: Only commas, no dots (e.g., 1,234 or 0,13)
        else if (commaIndex > -1) { 
          // If it looks like "123,45" (decimal comma) -> replace comma with dot
          // If it looks like "1,234" (thousands comma) -> remove comma
          // Heuristic: If comma is followed by 1 or 2 digits, it's likely a decimal.
          if (s.match(/,\d{1,2}$/)) { // e.g., "123,45"
            finalValueString = s.replace(',', '.');
          } else { // e.g., "1,234"
            finalValueString = s.replace(/,/g, '');
          }
        }
        // Case 4: Only dots, no commas (e.g., 1.234 or 0.13)
        else if (dotIndex > -1) {
          // If it looks like "1.234" (thousands dot for 1234) -> remove dot
          // If it looks like "0.13" (decimal dot) -> leave as is
          // Heuristic: If dot is followed by 3 digits AND NOT at the end (thousands), remove dot.
          // Or if dot is followed by 1 or 2 digits (decimal), leave it.
          // Simplified: assume single dot followed by 1 or 2 digits is decimal, otherwise remove dots.
          if (s.match(/\.\d{1,2}$/)) { // e.g., "123.45"
            finalValueString = s; // Leave as is
          } else { // e.g., "1.234" or "1.234.567"
            finalValueString = s.replace(/\./g, '');
          }
        }
        // Case 5: No commas or dots (pure integer string)
        else {
          finalValueString = s;
        }

        const parsed = parseFloat(finalValueString);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0; // Default for empty/undefined string
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
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data.' },
      { status: 500 }
    );
  }
}
