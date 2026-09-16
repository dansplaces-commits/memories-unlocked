/* Memories Unlocked — interactive location padlocks. */
(function(){
const UNLOCK_PREFIX='mu_memory_unlocks_v1:';
const DEFAULT_RADIUS=150;
const unlocks=new Map();
let padlockLayer=null,padlockRadiusLayer=null,padlockUserLayer=null;
let currentPadlockId='';
let refreshTimer=null;

function userKey(){
  const id=typeof cloudUser!=='undefined'&&cloudUser?.id?cloudUser.id:(typeof storageScope==='function'?storageScope():'device');
  return UNLOCK_PREFIX+String(id||'device');
}
function loadLocalUnlocks(){
  try{
    const rows=JSON.parse(localStorage.getItem(userKey())||'[]');
    if(Array.isArray(rows))rows.forEach(row=>{if(row?.memory_id)unlocks.set(String(row.memory_id),row);});
  }catch{}
}
function saveLocalUnlocks(){
  try{localStorage.setItem(userKey(),JSON.stringify([...unlocks.values()]));}catch{}
}
function radiusOf(m){const n=Number(m?.unlockRadiusM??m?.unlock_radius_m??DEFAULT_RADIUS);return Number.isFinite(n)?Math.min(5000,Math.max(25,n)):DEFAULT_RADIUS;}
function padlockEnabled(m){return Boolean(m&&m.padlockEnabled!==false&&m.padlock_enabled!==false&&validPoint(m.latitude,m.longitude));}
function isUnlocked(id){return unlocks.has(String(id));}
function isOwner(m){return Boolean(typeof cloudUser!=='undefined'&&cloudUser&&String(m?.ownerId||'')===String(cloudUser.id));}
function isLegacy(m){return Boolean(window.muIsLegacyMemory?.(m)||m?.archived||findJourney(m?.journeyId)?.archived);}
function allPadlocks(){return (typeof memories!=='undefined'?memories:[]).filter(padlockEnabled);}
function selectedPadlocks(){const all=allPadlocks();return mapJourneyId?all.filter(m=>String(m.journeyId)===String(mapJourneyId)):all;}
function memoryNumber(m){const trail=window.muAllJourneyMemories?window.muAllJourneyMemories(m.journeyId):(typeof journeyMemories==='function'?journeyMemories(m.journeyId):[]);const i=trail.findIndex(x=>String(x.id)===String(m.id));return i>=0?i+1:'◇';}
function markerIcon(m){
  const unlocked=isUnlocked(m.id),legacy=isLegacy(m),number=memoryNumber(m);
  const state=unlocked?'unlocked':legacy?'legacy':'locked';
  const glyph=unlocked?'🔓':'🔒';
  return L.divIcon({className:`memory-map-marker mu-padlock-marker mu-padlock-${state}`,html:`<span class="mu-padlock-shell"><b aria-hidden="true">${glyph}</b><small>${esc(number)}</small></span><em>${unlocked?'UNLOCKED':legacy?'LEGACY':'LOCKED'}</em>`,iconSize:[54,64],iconAnchor:[27,55]});
}
function distanceMetres(aLat,aLng,bLat,bLng){
  const R=6371000,toRad=n=>n*Math.PI/180;
  const dLat=toRad(bLat-aLat),dLng=toRad(bLng-aLng);
  const s=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function formatDistance(m){if(m<1000)return`${Math.max(0,Math.round(m))} m away`;return`${(m/1000).toFixed(m<10000?1:0)} km away`;}
function ensurePadlockGuide(){
  const view=document.getElementById('map');if(!view||view.querySelector('.mu-padlock-guide'))return;
  const toolbar=view.querySelector('.map-toolbar');if(!toolbar)return;
  const panel=document.createElement('section');panel.className='mu-padlock-guide';
  panel.innerHTML='<div class="mu-padlock-guide-lock">🔒</div><div><span class="eyebrow">LOCATION PADLOCKS</span><strong>Follow the footsteps. Unlock the memory.</strong><small>Tap a padlock. When you reach the place, use “Unlock here” to reveal the memory. Location is checked only when you ask.</small></div>';
  toolbar.insertAdjacentElement('afterend',panel);
}
function updateLegend(){
  const legend=document.querySelector('.mu-story-map-legend');if(!legend)return;
  legend.innerHTML='<span><i class="padlock locked"></i>Locked</span><span><i class="padlock unlocked"></i>Unlocked</span><span><i class="padlock legacy"></i>Legacy</span>';
}
function renderPadlockOverlay(){
  ensurePadlockGuide();updateLegend();
  if(!window.L||!memoryMap)return;
  if(!padlockLayer)padlockLayer=L.featureGroup().addTo(memoryMap);
  padlockLayer.clearLayers();
  const list=selectedPadlocks();
  list.forEach(m=>{
    const marker=L.marker(pointOf(m),{icon:markerIcon(m),title:`${isUnlocked(m.id)?'Unlocked':'Locked'} memory: ${m.title||'Memory'}`,keyboard:true,zIndexOffset:1000}).addTo(padlockLayer);
    marker.on('click',()=>muOpenPadlock(m.id));
  });
  const locked=list.filter(m=>!isUnlocked(m.id)).length,opened=list.length-locked,legacy=list.filter(isLegacy).length;
  const summary=document.getElementById('mapSummary');
  if(summary)summary.textContent=`${locked} locked · ${opened} unlocked · ${legacy} legacy ${legacy===1?'padlock':'padlocks'} on this map`;
}
function clearProximityLayers(){
  padlockRadiusLayer?.remove();padlockRadiusLayer=null;
  padlockUserLayer?.remove();padlockUserLayer=null;
}
function showRadius(m,userPoint=null){
  if(!window.L||!memoryMap||!padlockEnabled(m))return;
  clearProximityLayers();
  padlockRadiusLayer=L.circle(pointOf(m),{radius:radiusOf(m),className:'mu-unlock-radius',weight:2,fillOpacity:.08}).addTo(memoryMap);
  if(userPoint)padlockUserLayer=L.circleMarker(userPoint,{radius:8,weight:3,fillOpacity:1,className:'mu-unlock-user'}).addTo(memoryMap).bindTooltip('You are here');
}
function ownerControls(m){
  if(!isOwner(m))return'';
  const enabled=m.padlockEnabled!==false;
  return `<div class="mu-padlock-owner"><span class="eyebrow">OWNER CONTROLS</span><div class="mu-padlock-owner-row"><button type="button" class="secondary" data-padlock-action="toggle" data-padlock-id="${esc(m.id)}">${enabled?'Disable padlock':'Enable padlock'}</button><label>Unlock radius <select data-padlock-radius data-padlock-id="${esc(m.id)}">${[50,100,150,250,500].map(n=>`<option value="${n}" ${radiusOf(m)===n?'selected':''}>${n} m</option>`).join('')}</select></label></div><small>Followers only unlock this memory when they reach the location. Your exact checking position is not stored.</small></div>`;
}
function lockedBody(m){
  return `<div class="mu-padlock-state locked"><div class="mu-padlock-big">🔒</div><span class="eyebrow">MEMORY LOCKED</span><h2>${esc(m.title||'A memory waits here')}</h2><p>📍 ${esc(m.location||'A place on the trail')}</p>${m.clue?`<div class="mu-padlock-clue"><span class="eyebrow">A CLUE LEFT FOR YOU</span><p>${esc(m.clue)}</p></div>`:''}<p class="mu-padlock-distance" id="muPadlockDistance">Reach this place to unlock the memory.</p><button class="save mu-unlock-button" type="button" data-padlock-action="unlock" data-padlock-id="${esc(m.id)}">◎ Unlock here</button>${isOwner(m)?`<button class="secondary" type="button" data-padlock-action="preview" data-padlock-id="${esc(m.id)}">Preview unlocked experience</button><button class="text-button" type="button" data-padlock-action="owner-open" data-padlock-id="${esc(m.id)}">Open my memory</button>`:''}${ownerControls(m)}</div>`;
}
function unlockedBody(m,preview=false){
  const unlocked=unlocks.get(String(m.id));
  return `<div class="mu-padlock-state unlocked"><div class="mu-padlock-big">🔓</div><span class="eyebrow">${preview?'OWNER PREVIEW':'MEMORY UNLOCKED'}</span><h2>${esc(m.title||'Memory unlocked')}</h2><p>📍 ${esc(m.location||'A place on the trail')}</p><div class="mu-unlock-reveal"><strong>You found this place.</strong><p>${esc(m.story)||'The memory held here is now yours to discover.'}</p></div>${!preview&&unlocked?.unlocked_at?`<small>Unlocked ${esc(formatDate(String(unlocked.unlocked_at).slice(0,10)))}</small>`:''}<button class="save" type="button" data-padlock-action="reveal" data-padlock-id="${esc(m.id)}">Open the memory →</button>${ownerControls(m)}</div>`;
}
window.muOpenPadlock=function(id,preview=false){
  const m=findMemory(id);if(!m||!padlockEnabled(m))return;
  currentPadlockId=String(id);showRadius(m);
  const opened=isUnlocked(id)||preview;
  mountDialog('padlockModal',`<button class="close" type="button" onclick="closeModal('padlockModal');window.muClosePadlock?.()">×</button>${opened?unlockedBody(m,preview):lockedBody(m)}`,'mu-padlock-modal');
};
window.muClosePadlock=function(){currentPadlockId='';clearProximityLayers();};
function revealMemory(id){
  closeModal('padlockModal');clearProximityLayers();
  const m=findMemory(id);if(!m)return;
  if(isLegacy(m)&&window.muOpenLegacyMemory)muOpenLegacyMemory(id);else openMemory(id);
}
async function persistUnlock(m,distance,accuracy){
  const row={memory_id:m.id,user_id:cloudUser?.id,unlocked_at:new Date().toISOString(),distance_m:Math.round(distance),accuracy_m:Math.round(accuracy||0),method:'location'};
  if(window.muSupabase&&cloudUser?.id){
    const result=await muSupabase.from('memory_unlocks').insert({memory_id:m.id,user_id:cloudUser.id,distance_m:row.distance_m,accuracy_m:row.accuracy_m,method:'location'}).select('memory_id,unlocked_at,distance_m,accuracy_m,method').single();
    if(result.error&&result.error.code!=='23505')throw result.error;
    if(!result.error&&result.data)Object.assign(row,result.data);
  }
  unlocks.set(String(m.id),row);saveLocalUnlocks();return row;
}
function geolocationErrorMessage(error){
  if(error?.code===1)return'Location permission was not granted. You can try again when you are ready.';
  if(error?.code===2)return'Your current position could not be found. Move somewhere with a clearer GPS signal and try again.';
  if(error?.code===3)return'Location checking took too long. Try again in a moment.';
  return'Your location could not be checked just now.';
}
async function attemptUnlock(id){
  const m=findMemory(id),message=document.getElementById('muPadlockDistance'),button=document.querySelector('[data-padlock-action="unlock"]');
  if(!m||!padlockEnabled(m))return;
  if(!navigator.geolocation){if(message)message.textContent='Location checking is not available in this browser.';return;}
  if(button){button.disabled=true;button.textContent='Checking your location…';}
  if(message)message.textContent='Finding your position. Your coordinates are not stored.';
  navigator.geolocation.getCurrentPosition(async pos=>{
    const distance=distanceMetres(pos.coords.latitude,pos.coords.longitude,Number(m.latitude),Number(m.longitude));
    const accuracy=Math.max(0,Number(pos.coords.accuracy)||0),radius=radiusOf(m),allowance=Math.min(75,radius*.5,accuracy);
    showRadius(m,[pos.coords.latitude,pos.coords.longitude]);
    if(distance<=radius+allowance){
      try{await persistUnlock(m,distance,accuracy);renderPadlockOverlay();muOpenPadlock(id);toast('Padlock unlocked — this memory is now part of your trail.');}
      catch(error){console.warn('Memory unlock:',error.message);if(message)message.textContent='You reached the place, but the unlock could not be saved. Try again.';if(button){button.disabled=false;button.textContent='◎ Unlock here';}}
      return;
    }
    if(message)message.textContent=`${formatDistance(distance)} · move within ${radius} m of the padlock to unlock it.`;
    if(button){button.disabled=false;button.textContent='◎ Check again';}
  },error=>{if(message)message.textContent=geolocationErrorMessage(error);if(button){button.disabled=false;button.textContent='◎ Try again';}},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
async function updatePadlockSetting(id,patch){
  const m=findMemory(id);if(!m||!isOwner(m))return;
  const cloudPatch={};
  if(Object.hasOwn(patch,'padlockEnabled'))cloudPatch.padlock_enabled=Boolean(patch.padlockEnabled);
  if(Object.hasOwn(patch,'unlockRadiusM'))cloudPatch.unlock_radius_m=Number(patch.unlockRadiusM);
  try{
    if(m.cloud&&window.muSupabase&&cloudUser){
      const result=await muSupabase.from('memories').update(cloudPatch).eq('id',m.id).eq('owner_id',cloudUser.id).select('id,padlock_enabled,unlock_radius_m').single();
      if(result.error)throw result.error;
      m.padlockEnabled=result.data.padlock_enabled;m.unlockRadiusM=result.data.unlock_radius_m;
    }else Object.assign(m,patch);
    save();renderPadlockOverlay();
    if(document.getElementById('padlockModal'))muOpenPadlock(id);
    toast(m.padlockEnabled===false?'Location padlock disabled.':'Location padlock updated.');
  }catch(error){console.warn('Padlock setting:',error.message);toast('That padlock setting could not be saved just now.');}
}
function injectMemoryPadlockPanel(id){
  const m=findMemory(id),modal=document.getElementById('memoryDetailModal'),content=modal?.querySelector('.detail-content');
  if(!m||!content||content.querySelector('.mu-memory-padlock-panel')||!validPoint(m.latitude,m.longitude))return;
  const panel=document.createElement('section');panel.className='mu-memory-padlock-panel';
  const unlocked=isUnlocked(id);
  panel.innerHTML=`<span class="eyebrow">LOCATION PADLOCK</span><h3>${m.padlockEnabled===false?'Padlock is off':'This place can be unlocked.'}</h3><p>${isOwner(m)?`Followers can unlock this memory when they come within ${radiusOf(m)} m of the saved location.`:unlocked?'You have unlocked this memory.':'Reach this location to unlock the memory.'}</p><button type="button" class="secondary" data-padlock-action="open" data-padlock-id="${esc(m.id)}">${unlocked?'View unlocked padlock':'View location padlock'}</button>`;
  content.appendChild(panel);
}
async function refreshPadlocks(){
  loadLocalUnlocks();
  if(window.muSupabase){
    try{
      const {data:{session}}=await muSupabase.auth.getSession(),user=session?.user;
      if(user){
        const [meta,done]=await Promise.all([
          muSupabase.from('memories').select('id,padlock_enabled,unlock_radius_m'),
          muSupabase.from('memory_unlocks').select('memory_id,unlocked_at,distance_m,accuracy_m,method').eq('user_id',user.id)
        ]);
        if(!meta.error)(meta.data||[]).forEach(row=>{const m=findMemory(row.id);if(m){m.padlockEnabled=row.padlock_enabled!==false;m.unlockRadiusM=row.unlock_radius_m||DEFAULT_RADIUS;}});
        if(!done.error)(done.data||[]).forEach(row=>unlocks.set(String(row.memory_id),row));
        saveLocalUnlocks();
      }
    }catch(error){console.warn('Padlock refresh:',error.message);}
  }
  renderPadlockOverlay();
}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshPadlocks,160);}
function install(){
  if(typeof renderMemoryMap==='function'){
    const base=renderMemoryMap;
    renderMemoryMap=function(){const result=base.apply(this,arguments);queueMicrotask(renderPadlockOverlay);return result;};
  }
  if(typeof openMemory==='function'){
    const base=openMemory;
    openMemory=function(id){const result=base.apply(this,arguments);queueMicrotask(()=>injectMemoryPadlockPanel(id));return result;};
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-padlock-action]');if(!button)return;
    const id=button.dataset.padlockId,action=button.dataset.padlockAction;
    if(action==='open')muOpenPadlock(id);
    if(action==='unlock')attemptUnlock(id);
    if(action==='preview')muOpenPadlock(id,true);
    if(action==='reveal'||action==='owner-open')revealMemory(id);
    if(action==='toggle'){const m=findMemory(id);updatePadlockSetting(id,{padlockEnabled:m?.padlockEnabled===false});}
  });
  document.addEventListener('change',event=>{
    const select=event.target.closest('[data-padlock-radius]');if(select)updatePadlockSetting(select.dataset.padlockId,{unlockRadiusM:Number(select.value)});
  });
  document.addEventListener('click',event=>{if(event.target?.id==='padlockModal')window.muClosePadlock?.();});
  if(window.muSupabase)muSupabase.auth.onAuthStateChange(scheduleRefresh);
  scheduleRefresh();
}
install();
})();
