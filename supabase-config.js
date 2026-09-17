// Memories Unlocked — browser-safe Supabase configuration
// The publishable key is intentionally safe for client-side use; RLS remains the security boundary.
window.MU_SUPABASE_URL = 'https://fdjzelcqilupxibqsqep.supabase.co';
window.MU_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OD_FPZWL_AfNHZstS7E3wg_yEdPaxd-';
window.muSupabase = window.supabase?.createClient(
  window.MU_SUPABASE_URL,
  window.MU_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Standalone recovery/diagnostic pages reuse the same authenticated client without booting the full app shell.
if (!window.MU_RECOVERY_PAGE) {
  // Load additive product layers after the approved app shell has initialised.
  (function loadMemoriesUnlockedProductLayers(){
    const styles=[
      ['muMediaStyles','media.css?v=20260916b'],
      ['muEditingStyles','editing.css?v=20260916a'],
      ['muCreationStyles','creation-flow.css?v=20260916a'],
      ['muLifecycleStyles','lifecycle.css?v=20260916a'],
      ['muStabilityStyles','stability-fixes.css?v=20260916b'],
      ['muLegacyStyles','legacy-experience.css?v=20260916a'],
      ['muPlaceIntelStyles','place-intelligence.css?v=20260916a'],
      ['muPlaceIntelScrollStyles','place-intelligence-scroll.css?v=20260916a'],
      ['muDiscoverSurfaceStyles','discover-surface.css?v=20260916a'],
      ['muPadlockTrailStyles','padlock-trail.css?v=20260916a'],
      ['muInteractiveToolsStyles','interactive-tools.css?v=20260916c'],
      ['muInteractiveMobileStyles','interactive-mobile.css?v=20260916a'],
      ['muInteractivePolishStyles','interactive-polish.css?v=20260917a'],
      ['muMasterHomeLockStyles','master-home-lock.css?v=20260917a'],
      ['muLandmarkRibbonStyles','landmark-ribbon.css?v=20260917b'],
      ['muLandmarkDiscoverStyles','landmark-discover.css?v=20260917a'],
      ['muAppToolbarStyles','app-toolbar.css?v=20260917a']
    ];
    styles.forEach(([id,href])=>{
      if(document.getElementById(id))return;
      const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);
    });
    const boot=()=>{
      const scripts=[
        ['muMediaScript','media.js?v=20260916a'],
        ['muEditingScript','editing.js?v=20260916a'],
        ['muCreationScript','creation-flow.js?v=20260916a'],
        ['muLifecycleScript','lifecycle.js?v=20260916a'],
        ['muCloudRecoveryScript','cloud-recovery.js?v=20260916a'],
        ['muStabilityScript','stability-fixes.js?v=20260916b'],
        ['muLegacyScript','legacy-experience.js?v=20260916a'],
        ['muPlaceIntelScript','place-intelligence.js?v=20260916a'],
        ['muDiscoverSurfaceScript','discover-surface.js?v=20260916a'],
        ['muPadlockTrailScript','padlock-trail.js?v=20260916a'],
        ['muInteractiveToolsScript','interactive-tools.js?v=20260916a'],
        ['muInteractiveMobileScript','interactive-mobile.js?v=20260916a'],
        ['muInteractivePolishScript','interactive-polish.js?v=20260917b'],
        ['muLandmarkDiscoverScript','landmark-discover.js?v=20260917a'],
        ['muLandmarkRibbonScript','landmark-ribbon.js?v=20260917b'],
        ['muAppToolbarScript','app-toolbar.js?v=20260917a']
      ];
      scripts.forEach(([id,src])=>{
        if(document.getElementById(id))return;
        const script=document.createElement('script');script.id=id;script.src=src;script.async=false;document.body.appendChild(script);
      });
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  })();
}
