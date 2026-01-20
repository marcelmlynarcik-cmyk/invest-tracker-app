import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  // SAFE DEBUG LOGS: Run at the start of the request handler.
  console.log("=== ENV VAR CHECK (inside POST handler) ===");
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
    const { ticker, newShares, newAveragePrice } = await request.json();
    console.log("Received update request for ticker:", ticker);

    // DECODE KEY & AUTHENTICATE
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      // Use read/write scope for updating sheets
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
    });

    await auth.authorize();

    const sheets = google.sheets({
      version: 'v4',
      auth: auth,
    });

    // Find the row index for the given ticker
    const tickerRange = 'Portfólio!A2:A';
    const tickerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: tickerRange,
    });
    
    const tickerRows = tickerResponse.data.values;
    if (!tickerRows) {
        return NextResponse.json({ error: 'No tickers found in sheet.' }, { status: 404 });
    }

    let rowIndex = -1;
    for (let i = 0; i < tickerRows.length; i++) {
        if (tickerRows[i] && tickerRows[i][0] === ticker) {
            rowIndex = i + 2; // +2 because sheet is 1-indexed and our range starts at A2
            break;
        }
    }
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: `Ticker ${ticker} not found.` }, { status: 404 });
    }
    console.log(`Found ticker ${ticker} at sheet row: ${rowIndex}`);

    // Update the specific cells in the identified row
    const updateRange = `Portfólio!C${rowIndex}:D${rowIndex}`; // Columns C (Shares), D (Average Price)
    const values = [[newShares, newAveragePrice]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    console.log("Google Sheets update successful for ticker:", ticker);
    return NextResponse.json({ message: 'Portfolio item updated successfully.' });

  } catch (error: any) {
    console.error('Error updating Google Sheets:', error.message);
    return NextResponse.json(
      { error: 'Failed to update portfolio item due to a server error.' },
      { status: 500 }
    );
  }
}
