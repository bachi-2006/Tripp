import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url' || !process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:54321' : process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key' || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'fake-anon-key' : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
