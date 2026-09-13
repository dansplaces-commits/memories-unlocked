// Memories Unlocked — browser-safe Supabase configuration
// The publishable key is intentionally safe for client-side use; RLS remains the security boundary.
window.MU_SUPABASE_URL = 'https://fdjzelcqilupxibqsqep.supabase.co';
window.MU_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OD_FPZWL_AfNHZstS7E3wg_yEdPaxd-';
window.muSupabase = window.supabase?.createClient(
  window.MU_SUPABASE_URL,
  window.MU_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
