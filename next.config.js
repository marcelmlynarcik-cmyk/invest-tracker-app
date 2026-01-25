const withPWA = require("next-pwa");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  env: {
    SUPABASE_URL: "https://ttjoptibbumzpvogrbax.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0am9wdGliYnVtenB2b2dyYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODQzNzUsImV4cCI6MjA4NDE2MDM3NX0.boPMgLagsqOr5Bs7qpoTh3VqRlCg9f7BIbK96uZpjiU",
    GOOGLE_SHEETS_ID: "1WWVrMtN_ps-tx75PEycWPc6FceReloQ2fFDxnjJ_ClE",
    GOOGLE_API_KEY: "AIzaSyD0pHIYsuolB67kXLlN-DX9f2sCX9dVpzU",
    EXCHANGERATE_API_KEY: "9c935b711aaaa451f3f4966a",
    FINNHUB_API_KEY: "YOUR_FINNHUB_API_KEY",
  },
};

const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
};

module.exports = withPWA(pwaConfig)(nextConfig);
