/* Memories Unlocked — make a cloud reload authoritative across additive product metadata. */
(function(){
  if(typeof loadCloudData!=='function'||loadCloudData.__muAuthoritativeRecovery)return;
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
})();