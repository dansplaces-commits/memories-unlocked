// Memories Unlocked — browser-safe Supabase configuration
// The publishable key is intentionally safe for client-side use; RLS remains the security boundary.
(function installMemoriesUnlockedSplash(){
  try{
    if(!window.matchMedia('(max-width:700px)').matches)return;
    const style=document.createElement('style');
    style.id='muPremiumSplashStyle';
    style.textContent=`
      @media(max-width:700px){
        html.mu-mobile-boot body{margin:0!important;background:#fbf7ef!important;overflow:hidden!important;}
        html.mu-mobile-boot .app,
        html.mu-mobile-boot .nav,
        html.mu-mobile-boot .mu-mm-bottom-nav{visibility:hidden!important;opacity:0!important;}
        html.mu-mobile-boot body:before{
          content:""!important;
          position:fixed!important;
          inset:0!important;
          z-index:2147483646!important;
          display:block!important;
          background-color:#fbf7ef!important;
          background-image:url('/icons/icon-512.png')!important;
          background-repeat:no-repeat!important;
          background-position:center calc(50% - 34px)!important;
          background-size:clamp(160px,44vw,220px) auto!important;
          opacity:1!important;
          transition:opacity .34s ease!important;
          pointer-events:none!important;
        }
        html.mu-mobile-boot body:after{
          content:"MEMORIES  UNLOCKED"!important;
          position:fixed!important;
          left:50%!important;
          top:calc(50% + 102px)!important;
          transform:translateX(-50%)!important;
          z-index:2147483647!important;
          width:max-content!important;
          color:#153654!important;
          background:transparent!important;
          font:700 16px/1.1 Georgia,'Times New Roman',serif!important;
          letter-spacing:3.2px!important;
          text-align:center!important;
          opacity:1!important;
          transition:opacity .34s ease!important;
          pointer-events:none!important;
        }
        html.mu-mobile-boot.mu-mobile-boot-leaving body:before,
        html.mu-mobile-boot.mu-mobile-boot-leaving body:after{opacity:0!important;}
        html.mu-mobile-boot.mu-mobile-boot-leaving .app,
        html.mu-mobile-boot.mu-mobile-boot-leaving .mu-mm-bottom-nav{
          visibility:visible!important;
          opacity:1!important;
          transition:opacity .34s ease!important;
        }
        html.mu-mobile-boot.mu-mobile-boot-leaving .nav{display:none!important;visibility:hidden!important;opacity:0!important;}
      }
    `;
    document.head.appendChild(style);
  }catch{}
})();

window.MU_SUPABASE_URL='https://fdjzelcqilupxibqsqep.supabase.co';
window.MU_SUPABASE_PUBLISHABLE_KEY='sb_publishable_OD_FPZWL_AfNHZstS7E3wg_yEdPaxd-';
window.muSupabase=window.supabase?.createClient(
  window.MU_SUPABASE_URL,
  window.MU_SUPABASE_PUBLISHABLE_KEY,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);

if(!window.MU_RECOVERY_PAGE){
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
      ['muAppToolbarStyles','app-toolbar.css?v=20260917a'],
      ['muAppVisualPolishV2Styles','app-visual-polish-v2.css?v=20260917a'],
      ['muMobileMasterV1Styles','mobile-master-v1.css?v=20260917a'],
      ['muMobileMasterV1FixStyles','mobile-master-v1-fixes.css?v=20260917a'],
      ['muMobileExactV2Styles','mobile-exact-v2.css?v=20260917b'],
      ['muMobileExactV3Styles','mobile-exact-v3.css?v=20260917a'],
      ['muMobileExactV4Styles','mobile-exact-v4.css?v=20260917a'],
      ['muMobileExactV5Styles','mobile-exact-v5.css?v=20260917a'],
      ['muMobileExactV6Styles','mobile-exact-v6.css?v=20260917a'],
      ['muMobileExactV8Styles','mobile-exact-v8.css?v=20260917a'],
      ['muMobileExactV9Styles','mobile-exact-v9.css?v=20260917b']
    ];
    styles.forEach(([id,href])=>{
      if(document.getElementById(id))return;
      const link=document.createElement('link');
      link.id=id;link.rel='stylesheet';link.href=href;
      document.head.appendChild(link);
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
        ['muQuickToolIconsV2Script','quick-tool-icons-v2.js?v=20260917a'],
        ['muLandmarkDiscoverScript','landmark-discover.js?v=20260917a'],
        ['muLandmarkRibbonScript','landmark-ribbon.js?v=20260917b'],
        ['muAppToolbarScript','app-toolbar.js?v=20260917a'],
        ['muMobileMasterV1Script','mobile-master-v1.js?v=20260917a'],
        ['muMobileExactIconsV3Script','mobile-exact-icons-v3.js?v=20260917b'],
        ['muMobileExactV4Script','mobile-exact-v4.js?v=20260917c'],
        ['muMobileExactV11Script','mobile-exact-v11.js?v=20260917h'],
        ['muMobileBootReleaseScript','mobile-boot-release.js?v=20260917h']
      ];
      scripts.forEach(([id,src])=>{
        if(document.getElementById(id))return;
        const script=document.createElement('script');
        script.id=id;script.src=src;script.async=false;
        document.body.appendChild(script);
      });
    };

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
    else boot();
  })();
}
