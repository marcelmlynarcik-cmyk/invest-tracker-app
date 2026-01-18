import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { ticker, newShares, newAveragePrice } = await request.json();

    console.log("Received update request:", { ticker, newShares, newAveragePrice });

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    console.log("Update API: spreadsheetId:", spreadsheetId ? "Configured" : "NOT Configured");
    console.log("Update API: clientEmail:", clientEmail ? "Configured" : "NOT Configured");
    if (privateKey) {
      console.log("Update API: privateKey (first 50 chars):", privateKey.substring(0, 50));
      console.log("Update API: privateKey (after newline replace, first 50 chars):", privateKey.replace(/\\n/g, '\n').substring(0, 50));
    } else {
      console.log("Update API: privateKey: NOT Configured");
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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    await auth.authorize(); // Authenticate the service account

    const sheets = google.sheets({
      version: 'v4',
      auth: auth, // Use the authenticated JWT client
    });

    // 1. Get all tickers to find the row index
    const range = 'Portfólio!A:A'; // Only get ticker column
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows) {
      return NextResponse.json({ error: 'No data found in sheet.' }, { status: 404 });
    }

    // Find the row index for the given ticker (Google Sheets are 1-indexed, and data starts from A2)
    // The range 'Portfólio!A:A' will return all rows including header.
    let rowIndex = -1;
    // We assume the first row (index 0) of `rows` array corresponds to sheet row 1 (header)
    // and subsequent rows correspond to data.
    // The previous GET was `Portfólio!A2:M`, meaning index 0 of `rows` was the first data row (sheet row 2).
    // Let's use `Portfólio!A:A` to fetch all and then calculate correctly.
    // If header is in row 1, first data row is row 2.
    // So, if rows[j] matches ticker, then its sheet row number is `j + 1`.

    // Use a more precise range for ticker lookup to align with previous logic (starting from A2)
    const tickerRange = 'Portfólio!A2:A'; // Start from row 2
    const tickerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: tickerRange,
    });
    const tickerRows = tickerResponse.data.values;

    if (!tickerRows) {
        return NextResponse.json({ error: 'No tickers found in sheet.' }, { status: 404 });
    }

    for (let i = 0; i < tickerRows.length; i++) {
        if (tickerRows[i] && tickerRows[i][0] === ticker) {
            rowIndex = i + 2; // +2 because sheet is 1-indexed and data starts from row 2 in tickerRows
            break;
        }
    }
    
    console.log(`Ticker ${ticker} found at sheet row: ${rowIndex}`);

    if (rowIndex === -1) {
      return NextResponse.json({ error: `Ticker ${ticker} not found.` }, { status: 404 });
    }

    // 2. Update the specific cells
    const updateRange = `Portfólio!C${rowIndex}:D${rowIndex}`; // Columns C (Shares), D (Average Price)
    const values = [[newShares, newAveragePrice]];

    const updateResult = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED', // 'RAW' or 'USER_ENTERED'
      requestBody: {
        values: values,
      },
    });

    console.log("Google Sheets update result:", updateResult.data);

    return NextResponse.json({ message: 'Portfolio item updated successfully.' });
  } catch (error: any) {
    console.error('Error updating Google Sheets:', error.message, error.stack, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update portfolio item.' },
      { status: 500 }
    );
  }
}
