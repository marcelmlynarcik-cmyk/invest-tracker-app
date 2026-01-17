import { createClient } from "@supabase/supabase-js";

// Debugging: Log environment variables before client creation
console.log("Supabase URL received:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Anon Key received:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
