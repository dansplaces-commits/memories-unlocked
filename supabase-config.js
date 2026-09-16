// Memories Unlocked — browser-safe Supabase configuration
// The publishable key is intentionally safe for client-side use; RLS remains the security boundary.
window.MU_SUPABASE_URL = 'https://fdjzelcqilupxibqsqep.supabase.co';
window.MU_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OD_FPZWL_AfNHZstS7E3wg_yEdPaxd-';
window.muSupabase = window.supabase?.createClient(
  window.MU_SUPABASE_URL,
  window.MU_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Load additive product layers after the approved app shell has initialised.
(function loadMemoriesUnlockedProductLayers(){
  const styles=[
    ['muMediaStyles','media.css?v=20260916b'],
    ['muEditingStyles','editing.css?v=20260916a'],
    ['muCreationStyles','creation-flow.css?v=20260916a']
  ];
  styles.forEach(([id,href])=>{
    if(document.getElementById(id))return;
    const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);
  });
  const boot=()=>{
    const scripts=[
      ['muMediaScript','media.js?v=20260916a'],
      ['muEditingScript','editing.js?v=20260916a'],
      ['muCreationScript','creation-flow.js?v=20260916a']
    ];
    scripts.forEach(([id,src])=>{
      if(document.getElementById(id))return;
      const script=document.createElement('script');script.id=id;script.src=src;script.async=false;document.body.appendChild(script);
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
