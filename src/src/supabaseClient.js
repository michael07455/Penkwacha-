import { createClient } from "@supabase/supabase-js";

// These come from environment variables you set in Vercel —
// never hardcode real keys directly in source files.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
