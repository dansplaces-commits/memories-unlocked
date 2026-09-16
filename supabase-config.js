// Memories Unlocked — browser-safe Supabase configuration
// The publishable key is intentionally safe for client-side use; RLS remains the security boundary.
window.MU_SUPABASE_URL = 'https://fdjzelcqilupxibqsqep.supabase.co';
window.MU_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OD_FPZWL_AfNHZstS7E3wg_yEdPaxd-';
window.muSupabase = window.supabase?.createClient(
  window.MU_SUPABASE_URL,
  window.MU_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Load the optional secure photo layer without changing the approved app shell.
(function loadMemoriesUnlockedMedia(){
  if(!document.getElementById('muMediaStyles')){
    const link=document.createElement('link');
    link.id='muMediaStyles';link.rel='stylesheet';link.href='media.css?v=20260916a';
    document.head.appendChild(link);
  }
  const boot=()=>{
    if(document.getElementById('muMediaScript'))return;
    const script=document.createElement('script');
    script.id='muMediaScript';script.src='media.js?v=20260916a';
    document.body.appendChild(script);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
