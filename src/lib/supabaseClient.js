import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials."
  );
}

// Clerk is the auth provider now; Supabase only verifies the Clerk session
// token (via Supabase's Third-Party Auth integration) to enforce RLS.
// AuthContext calls setClerkTokenGetter once Clerk's getToken() is available.
let clerkTokenGetter = async () => null;

export function setClerkTokenGetter(fn) {
  clerkTokenGetter = fn;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => (await clerkTokenGetter()) ?? null,
});
