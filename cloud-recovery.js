/* Memories Unlocked — authoritative cloud recovery + QA preview session guard. */
(function(){
  function isQaPreview(){
    const host=String(location.hostname||'').toLowerCase();
    return host.endsWith('.vercel.app')&&host!=='memories-unlocked.vercel.app';
  }
  function hasVisibleStories(){
    return Boolean((typeof journeys!=='undefined'&&journeys.length)||(typeof memories!=='undefined'&&memories.length));
  }
  function openReconnect(){
    if(typeof cloudStatus==='function')cloudStatus('🔐 Sign in to load your cloud journeys');
    let attempts=0;
    const tryOpen=()=>{
      if(typeof window.openAccount==='function'){
        window.openAccount();
        const msg=document.getElementById('accountMessage');
        if(msg&&!msg.textContent)msg.textContent='This QA preview is not connected to your signed-in cloud session yet. Sign in to load your journeys and memories.';
        return;
      }
      if(++attempts<20)setTimeout(tryOpen,150);
    };
    setTimeout(tryOpen,120);
  }
  async function guardPreviewIdentity(){
    if(!isQaPreview()||hasVisibleStories()||!window.muSupabase)return;
    try{
      const {data:{session}}=await muSupabase.auth.getSession();
      const user=session?.user||null;
      if(!user||user.is_anonymous)openReconnect();
    }catch(error){console.warn('QA session guard:',error.message);openReconnect();}
  }

  if(typeof loadCloudData==='function'&&!loadCloudData.__muAuthoritativeRecovery){
    const baseLoadCloudData=loadCloudData;
    const authoritativeLoad=async function(){
      const result=await baseLoadCloudData.apply(this,arguments);
      try{if(typeof muRefreshArchiveMetadata==='function')await muRefreshArchiveMetadata();}catch(error){console.warn('Archive recovery refresh:',error.message);}
      try{if(typeof muRefreshMediaMetadata==='function')await muRefreshMediaMetadata();}catch(error){console.warn('Media recovery refresh:',error.message);}
      try{if(typeof muRefreshDiscoverSurface==='function')muRefreshDiscoverSurface();}catch{}
      try{if(document.getElementById('map')?.classList.contains('active')&&typeof renderMemoryMap==='function')renderMemoryMap();}catch{}
      return result;
    };
    authoritativeLoad.__muAuthoritativeRecovery=true;
    loadCloudData=authoritativeLoad;
  }

  setTimeout(guardPreviewIdentity,650);
  if(window.muSupabase)muSupabase.auth.onAuthStateChange(()=>setTimeout(guardPreviewIdentity,180));
})();