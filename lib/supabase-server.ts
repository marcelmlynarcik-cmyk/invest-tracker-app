import { createClient } from "@supabase/supabase-js";

// Note: This client is meant for server-side use ONLY.
// It uses the Supabase anon key, assuming no user authentication and
// that RLS policies are either disabled or permissive for the anon role.
export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
