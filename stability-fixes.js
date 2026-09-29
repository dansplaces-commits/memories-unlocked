/* Memories Unlocked — QA stability fixes for archive visibility and Account & Sync. */
(function(){
  function activeJourneys(){
    return (typeof journeys!=='undefined'?journeys:[]).filter(j=>!j?.archived);
  }
  function activeMemories(){
    const activeJourneyIds=new Set(activeJourneys().map(j=>String(j.id)));
    return (typeof memories!=='undefined'?memories:[]).filter(m=>!m?.archived&&activeJourneyIds.has(String(m.journeyId)));
  }
  window.muActiveJourneys=activeJourneys;
  window.muActiveMemories=activeMemories;

  /* Make every journey trail archive-aware, including detail modals and card previews. */
  if(typeof journeyMemories==='function'&&!journeyMemories.__muArchiveAware){
    const baseJourneyMemories=journeyMemories;
    const archiveAwareJourneyMemories=function(id){
      const parent=typeof findJourney==='function'?findJourney(id):null;
      if(parent?.archived)return[];
      return baseJourneyMemories(id).filter(m=>!m?.archived);
    };
    archiveAwareJourneyMemories.__muArchiveAware=true;
    journeyMemories=archiveAwareJourneyMemories;
  }

  /* Desktop dashboard renders outside the lifecycle render wrapper, so filter it too. */
  if(typeof renderDesktopDashboard==='function'&&!renderDesktopDashboard.__muArchiveAware){
    const baseDashboard=renderDesktopDashboard;
    const archiveAwareDashboard=function(){
      const allJourneys=journeys,allMemories=memories;
      const visibleJourneys=activeJourneys(),visibleMemories=activeMemories();
      journeys=visibleJourneys;memories=visibleMemories;
      try{return baseDashboard();}
      finally{journeys=allJourneys;memories=allMemories;}
    };
    archiveAwareDashboard.__muArchiveAware=true;
    renderDesktopDashboard=archiveAwareDashboard;
  }

  function latestActivePlace(){
    const located=activeMemories().filter(m=>m?.location);
    if(located.length){
      const latest=located.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
      return{label:latest.location,sub:'Latest memory',memoryId:latest.id};
    }
    const js=activeJourneys();
    if(js.length&&js[0]?.location)return{label:js[0].location,sub:'Latest journey',journeyId:js[0].id};
    return{label:'Your world',sub:'Memories Unlocked'};
  }
  function syncPlaceChip(){
    const chip=document.getElementById('appPlaceChip');if(!chip)return;
    const place=latestActivePlace();
    const small=chip.querySelector('small'),strong=chip.querySelector('strong');
    if(small)small.textContent=place.sub;
    if(strong)strong.textContent=place.label;
  }

  /* The original place-chip closure sees the full arrays. Override its visible state and click target. */
  document.addEventListener('click',event=>{
    const chip=event.target.closest?.('#appPlaceChip');if(!chip)return;
    event.preventDefault();event.stopImmediatePropagation();
    const place=latestActivePlace();
    if(place.memoryId&&typeof viewMemoryOnMap==='function')viewMemoryOnMap(place.memoryId);
    else if(place.journeyId&&typeof openJourneyMap==='function')openJourneyMap(place.journeyId);
    else if(typeof showView==='function')showView('map');
  },true);

  /* Account & Sync used its own open/close path. Bring it into the shared dialog lifecycle. */
  function syncAccountDialog(){
    if(typeof refreshDialogState==='function')refreshDialogState();
    const modal=document.getElementById('accountModal');
    if(modal?.classList.contains('open')){
      modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
      modal.querySelector('.close')?.setAttribute('aria-label','Close Account & Sync');
    }
  }
  if(typeof window.openAccount==='function'&&!window.openAccount.__muStable){
    const baseOpenAccount=window.openAccount;
    const stableOpenAccount=async function(...args){
      const result=await baseOpenAccount.apply(this,args);syncAccountDialog();
      document.querySelector('#accountModal .close')?.focus({preventScroll:true});
      return result;
    };
    stableOpenAccount.__muStable=true;window.openAccount=stableOpenAccount;
  }
  if(typeof window.closeAccount==='function'&&!window.closeAccount.__muStable){
    const baseCloseAccount=window.closeAccount;
    const stableCloseAccount=function(...args){
      const result=baseCloseAccount.apply(this,args);syncAccountDialog();return result;
    };
    stableCloseAccount.__muStable=true;window.closeAccount=stableCloseAccount;
  }
  document.addEventListener('pointerdown',event=>{
    const modal=document.getElementById('accountModal');
    if(modal?.classList.contains('open')&&event.target===modal){
      event.preventDefault();event.stopImmediatePropagation();window.closeAccount?.();
    }
  },true);
  document.addEventListener('keydown',event=>{
    const modal=document.getElementById('accountModal');
    if(event.key==='Escape'&&modal?.classList.contains('open')){
      event.preventDefault();event.stopImmediatePropagation();window.closeAccount?.();
    }
  },true);

  /* Make the archive destination obvious on the Journeys screen. */
  if(typeof muInjectArchiveLauncher==='function'&&!muInjectArchiveLauncher.__muProminent){
    const baseArchiveLauncher=muInjectArchiveLauncher;
    const prominentArchiveLauncher=function(){
      baseArchiveLauncher();
      const button=document.querySelector('#journeys [data-archive-launcher]');if(!button)return;
      button.classList.add('archive-launcher-prominent');
      const archivedJourneyCount=(typeof journeys!=='undefined'?journeys:[]).filter(j=>j?.archived).length;
      const archivedMemoryCount=(typeof memories!=='undefined'?memories:[]).filter(m=>m?.archived&&!findJourney(m.journeyId)?.archived).length;
      const total=archivedJourneyCount+archivedMemoryCount;
      button.textContent=total?`View Archive · ${total}`:'View Archive';
      button.title='Open archived journeys and memories';
    };
    prominentArchiveLauncher.__muProminent=true;muInjectArchiveLauncher=prominentArchiveLauncher;
    muInjectArchiveLauncher();
  }

  let queued=false;
  function refreshSecondarySurfaces(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      if(typeof renderDesktopDashboard==='function')renderDesktopDashboard();
      syncPlaceChip();
      if(typeof muInjectArchiveLauncher==='function')muInjectArchiveLauncher();
    });
  }
  const observer=new MutationObserver(refreshSecondarySurfaces);
  ['journeyList','allJourneys','recentMemories','cloudStatus'].forEach(id=>{
    const node=document.getElementById(id);if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});
  });
  refreshSecondarySurfaces();
})();
