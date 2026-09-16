/* Memories Unlocked — Interactive Dashboard Pack v1. */
(function(){
const WIDGET_KEY='mu_widget_positions_v1';
const FOOT_KEY='mu_footsteps_session_v1';
let muFootWatch=null,muFootTimer=null,muFootState={running:false,startedAt:0,elapsed:0,meters:0,last:null};
let muCapturedFile=null;

function muToolEscape(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function muActiveJourneys(){return (typeof journeys!=='undefined'?journeys:[]).filter(j=>!j.archived);}
function muActiveMemories(){const ids=new Set(muActiveJourneys().map(j=>String(j.id)));return (typeof memories!=='undefined'?memories:[]).filter(m=>!m.archived&&ids.has(String(m.journeyId)));}

/* ---------- hero tools ---------- */
const HERO_TOOLS=[
  ['discover','⌖','Discover','learn about places'],
  ['capture','▣','Capture','camera & photos'],
  ['footsteps','👣','Footsteps','track a walk'],
  ['share','↗','Share','with loved ones'],
  ['legacy','♡','Legacy','collages & tributes']
];
function muEnhanceHeroTools(){
  const row=document.querySelector('.dash-master-benefits');if(!row)return;
  row.classList.add('mu-tools-ready');
  const signature=HERO_TOOLS.map(x=>x[0]).join('|');if(row.dataset.muToolSignature===signature)return;
  row.dataset.muToolSignature=signature;
  row.innerHTML=HERO_TOOLS.map(([key,icon,title,copy])=>`<div role="button" tabindex="0" data-mu-tool="${key}" aria-label="${title}: ${copy}"><span class="dash-benefit-icon">${icon}</span><span><b>${title}</b><small>${copy}</small></span><i class="mu-tool-live-badge" aria-hidden="true"></i></div>`).join('');
}
function muInstallHeroWatcher(){
  muEnhanceHeroTools();
  const dash=document.querySelector('.desktop-dashboard');if(!dash)return;
  new MutationObserver(()=>queueMicrotask(muEnhanceHeroTools)).observe(dash,{childList:true,subtree:true});
}

/* ---------- movable widgets ---------- */
function muReadWidgetPositions(){try{return JSON.parse(localStorage.getItem(WIDGET_KEY)||'{}')||{};}catch{return{};}}
function muWriteWidgetPositions(v){try{localStorage.setItem(WIDGET_KEY,JSON.stringify(v));}catch{}}
function muClampWidget(el,x,y){const r=el.getBoundingClientRect(),pad=8;return{x:Math.max(pad,Math.min(x,innerWidth-r.width-pad)),y:Math.max(pad,Math.min(y,innerHeight-r.height-pad))};}
function muApplySavedWidget(el){const p=muReadWidgetPositions()[el.id];if(!p)return;const c=muClampWidget(el,Number(p.x)||8,Number(p.y)||8);el.style.left=c.x+'px';el.style.top=c.y+'px';el.style.right='auto';el.style.bottom='auto';}
function muMakeWidgetDraggable(el){
  if(!el||el.dataset.muDragReady)return;el.dataset.muDragReady='1';el.classList.add('mu-widget-draggable');muApplySavedWidget(el);
  let start=null,moved=false;
  el.addEventListener('pointerdown',e=>{
    if(e.button!==undefined&&e.button!==0)return;const r=el.getBoundingClientRect();start={px:e.clientX,py:e.clientY,x:r.left,y:r.top};moved=false;el.setPointerCapture?.(e.pointerId);el.classList.add('mu-widget-dragging');
  });
  el.addEventListener('pointermove',e=>{
    if(!start)return;const dx=e.clientX-start.px,dy=e.clientY-start.py;if(Math.hypot(dx,dy)>4)moved=true;if(!moved)return;e.preventDefault();const c=muClampWidget(el,start.x+dx,start.y+dy);el.style.left=c.x+'px';el.style.top=c.y+'px';el.style.right='auto';el.style.bottom='auto';
  });
  const finish=e=>{if(!start)return;el.classList.remove('mu-widget-dragging');if(moved){const r=el.getBoundingClientRect(),all=muReadWidgetPositions();all[el.id]={x:Math.round(r.left),y:Math.round(r.top)};muWriteWidgetPositions(all);el.dataset.muSuppressClick='1';}start=null;try{el.releasePointerCapture?.(e.pointerId);}catch{}};
  el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
  el.addEventListener('click',e=>{if(el.dataset.muSuppressClick==='1'){e.preventDefault();e.stopImmediatePropagation();delete el.dataset.muSuppressClick;}},true);
  el.addEventListener('dblclick',e=>{e.preventDefault();const all=muReadWidgetPositions();delete all[el.id];muWriteWidgetPositions(all);el.removeAttribute('style');window.toast?.('Widget position reset.');});
}
function muEnhanceWidgets(){muMakeWidgetDraggable(document.getElementById('appPlaceChip'));muMakeWidgetDraggable(document.getElementById('appDiscoverChip'));}
function muWatchWidgets(){muEnhanceWidgets();new MutationObserver(muEnhanceWidgets).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',()=>document.querySelectorAll('.mu-widget-draggable').forEach(el=>{const r=el.getBoundingClientRect(),c=muClampWidget(el,r.left,r.top);el.style.left=c.x+'px';el.style.top=c.y+'px';el.style.right='auto';}));}

/* ---------- discover ---------- */
function muDiscoverContext(){
  const ms=muActiveMemories().filter(m=>m.location).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));if(ms.length)return{kind:'memory',id:ms[0].id};
  const js=muActiveJourneys().filter(j=>j.location);if(js.length)return{kind:'journey',id:js[0].id};
  return null;
}
function muOpenDiscoverTool(){const c=muDiscoverContext();if(!c){window.toast?.('Add a journey or memory location first, then Discover can tell its story.');return;}if(typeof muOpenPlaceIntelligence==='function')muOpenPlaceIntelligence(c.kind,c.id);else window.toast?.('Discover is still loading. Try again in a moment.');}

/* ---------- camera / capture ---------- */
function muCaptureTargets(){
  const out=[];muActiveJourneys().forEach(j=>out.push({value:`journey:${j.id}`,label:`Journey cover · ${j.title}`}));muActiveMemories().forEach(m=>out.push({value:`memory:${m.id}`,label:`Memory · ${m.title}`}));return out;
}
function muOpenCapture(){
  const targets=muCaptureTargets();
  if(!targets.length){window.toast?.('Create a journey first, then Capture can add a photo to it.');if(typeof openModal==='function')openModal('journeyModal');return;}
  muCapturedFile=null;
  const modal=mountDialog('muCaptureModal',`<button class="close" type="button" onclick="closeModal('muCaptureModal')">×</button><span class="mu-tool-kicker">CAPTURE</span><h2>Capture this moment</h2><p class="mu-tool-note">On a phone or tablet this can open the camera. On desktop it opens your photo chooser.</p><label class="media-file-label" for="muCameraInput"><span>Open camera / choose photo</span><small>JPEG, PNG or WebP · max 8 MB</small></label><input id="muCameraInput" class="media-file-input" type="file" accept="image/*" capture="environment"><div id="muCameraPreview" class="mu-camera-preview"><span>No photo selected yet.</span></div><label>Save this photo to</label><select id="muCaptureTarget">${targets.map(t=>`<option value="${muToolEscape(t.value)}">${muToolEscape(t.label)}</option>`).join('')}</select><p id="muCaptureMessage" class="small"></p><button id="muCaptureSave" class="save" type="button" disabled>Save to this story</button>`,'mu-tool-modal');
  const input=modal.querySelector('#muCameraInput'),preview=modal.querySelector('#muCameraPreview'),saveBtn=modal.querySelector('#muCaptureSave'),msg=modal.querySelector('#muCaptureMessage');
  input.addEventListener('change',()=>{const f=input.files?.[0]||null;muCapturedFile=null;saveBtn.disabled=true;msg.textContent='';if(!f){preview.innerHTML='<span>No photo selected yet.</span>';return;}if(typeof MU_MEDIA_TYPES!=='undefined'&&!MU_MEDIA_TYPES.has(f.type)){msg.textContent='Choose a JPEG, PNG or WebP image.';return;}if(typeof MU_MEDIA_MAX_BYTES!=='undefined'&&f.size>MU_MEDIA_MAX_BYTES){msg.textContent='That image is larger than 8 MB.';return;}const reader=new FileReader();reader.onload=()=>{muCapturedFile=f;preview.innerHTML=`<img src="${reader.result}" alt="Captured photo preview">`;saveBtn.disabled=false;};reader.readAsDataURL(f);});
  saveBtn.addEventListener('click',async()=>{if(!muCapturedFile||typeof muUploadPhoto!=='function')return;const [kind,id]=modal.querySelector('#muCaptureTarget').value.split(':');const record=kind==='journey'?findJourney(id):findMemory(id);if(!record)return;const field=kind==='journey'?'coverPhotoPath':'photoPath',before=record[field]||'';await muUploadPhoto(kind,id,muCapturedFile,saveBtn,msg);if(record[field]&&record[field]!==before)closeModal('muCaptureModal');});
}

/* ---------- share ---------- */
function muJourneyShareUrl(j){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('journey',j.code||j.id);return u.toString();}
function muOpenShare(){
  const js=muActiveJourneys();if(!js.length){window.toast?.('Create a journey first, then you can share it.');return;}
  const modal=mountDialog('muShareModal',`<button class="close" type="button" onclick="closeModal('muShareModal')">×</button><span class="mu-tool-kicker">SHARE</span><h2>Share a journey</h2><p class="mu-tool-note">Use your device share sheet to send a journey link through Messages, WhatsApp, email or another contact app.</p><label>Journey</label><select id="muShareJourney">${js.map(j=>`<option value="${muToolEscape(j.id)}">${muToolEscape(j.title)}</option>`).join('')}</select><div id="muShareContact" class="mu-share-contact"><strong>Choose who to share with</strong><span>Your device will offer available contacts and apps.</span></div><div class="mu-tool-grid"><button class="mu-tool-card" id="muNativeShare"><strong>↗ Share link</strong><small>Open your device share sheet.</small></button><button class="mu-tool-card" id="muCopyShare"><strong>⧉ Copy link</strong><small>Copy the journey link to your clipboard.</small></button></div><button class="secondary" id="muChooseContact" type="button" ${('contacts' in navigator&&navigator.contacts?.select)?'':'hidden'}>Choose a contact</button><p id="muShareMessage" class="small"></p>`,'mu-share-modal');
  const selected=()=>findJourney(modal.querySelector('#muShareJourney').value);
  modal.querySelector('#muNativeShare').addEventListener('click',async()=>{const j=selected();if(!j)return;const url=muJourneyShareUrl(j);try{if(navigator.share)await navigator.share({title:j.title,text:`Follow my Memories Unlocked journey: ${j.title}`,url});else{await navigator.clipboard.writeText(url);modal.querySelector('#muShareMessage').textContent='Link copied — paste it into the contact or app you want.';}}catch(e){if(e.name!=='AbortError')modal.querySelector('#muShareMessage').textContent='Sharing was not available. Use Copy link instead.';}});
  modal.querySelector('#muCopyShare').addEventListener('click',async()=>{const j=selected();if(!j)return;const url=muJourneyShareUrl(j);try{await navigator.clipboard.writeText(url);modal.querySelector('#muShareMessage').textContent='Journey link copied.';}catch{modal.querySelector('#muShareMessage').textContent=url;}});
  modal.querySelector('#muChooseContact')?.addEventListener('click',async()=>{try{const picked=await navigator.contacts.select(['name','email','tel'],{multiple:false});const c=picked?.[0];if(c){const name=c.name?.[0]||'Selected contact';modal.querySelector('#muShareContact').innerHTML=`<strong>${muToolEscape(name)}</strong><span>Now use Share link and choose the messaging or email app you want.</span>`;}}catch{}});
}

/* ---------- footsteps ---------- */
function muHaversine(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng),x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function muLoadFoot(){try{const s=JSON.parse(localStorage.getItem(FOOT_KEY)||'null');if(s&&typeof s.meters==='number')muFootState={...muFootState,...s,running:false,last:null};}catch{}}
function muSaveFoot(){try{localStorage.setItem(FOOT_KEY,JSON.stringify({...muFootState,running:false,last:null}));}catch{}}
function muFootElapsed(){return muFootState.elapsed+(muFootState.running?Date.now()-muFootState.startedAt:0);}
function muFormatDuration(ms){const mins=Math.floor(ms/60000),secs=Math.floor(ms/1000)%60;return `${mins}:${String(secs).padStart(2,'0')}`;}
function muRenderFoot(){const modal=document.getElementById('muFootstepsModal');if(!modal)return;const meters=muFootState.meters,steps=Math.round(meters/.78);const vals={muFootSteps:steps.toLocaleString(),muFootDistance:meters<1000?`${Math.round(meters)} m`:`${(meters/1000).toFixed(2)} km`,muFootTime:muFormatDuration(muFootElapsed())};Object.entries(vals).forEach(([id,v])=>{const n=modal.querySelector('#'+id);if(n)n.textContent=v;});const start=modal.querySelector('#muFootStart'),stop=modal.querySelector('#muFootStop');if(start)start.disabled=muFootState.running;if(stop)stop.disabled=!muFootState.running;}
function muStartFoot(){
  const status=document.querySelector('#muFootstepsModal #muFootStatus');if(!navigator.geolocation){if(status)status.textContent='Location tracking is not available in this browser.';return;}
  muFootState.running=true;muFootState.startedAt=Date.now();muFootState.last=null;if(status)status.textContent='Walking session started. Keep this page open while you walk.';
  muFootWatch=navigator.geolocation.watchPosition(pos=>{const p={lat:pos.coords.latitude,lng:pos.coords.longitude,t:pos.timestamp||Date.now()};if(muFootState.last){const d=muHaversine(muFootState.last,p);if(d>=2&&d<=250)muFootState.meters+=d;}muFootState.last=p;muSaveFoot();muRenderFoot();},()=>{if(status)status.textContent='Location permission is needed to estimate distance and steps. Your saved session has not been lost.';muStopFoot(false);},{enableHighAccuracy:true,maximumAge:5000,timeout:15000});
  clearInterval(muFootTimer);muFootTimer=setInterval(muRenderFoot,1000);muRenderFoot();
}
function muStopFoot(saveIt=true){if(muFootState.running){muFootState.elapsed+=Date.now()-muFootState.startedAt;}muFootState.running=false;muFootState.startedAt=0;muFootState.last=null;if(muFootWatch!=null&&navigator.geolocation){navigator.geolocation.clearWatch(muFootWatch);muFootWatch=null;}clearInterval(muFootTimer);muFootTimer=null;if(saveIt)muSaveFoot();muRenderFoot();}
function muResetFoot(){muStopFoot(false);muFootState={running:false,startedAt:0,elapsed:0,meters:0,last:null};muSaveFoot();muRenderFoot();const s=document.querySelector('#muFootstepsModal #muFootStatus');if(s)s.textContent='Ready for a new walking session.';}
function muOpenFootsteps(){
  const modal=mountDialog('muFootstepsModal',`<button class="close" type="button" onclick="closeModal('muFootstepsModal')">×</button><span class="mu-tool-kicker">FOLLOW THE FOOTSTEPS</span><h2>Footsteps</h2><p class="mu-tool-note">Web version: distance is measured from your walking route and steps are estimated using an average stride of 0.78 m. Native health step data can be connected later.</p><div class="mu-footsteps-display"><div class="mu-footsteps-stat"><strong id="muFootSteps">0</strong><span>Estimated steps</span></div><div class="mu-footsteps-stat"><strong id="muFootDistance">0 m</strong><span>Distance</span></div><div class="mu-footsteps-stat"><strong id="muFootTime">0:00</strong><span>Session</span></div></div><div id="muFootStatus" class="mu-footsteps-status">${muFootState.meters||muFootState.elapsed?'Saved walking session ready to continue or reset.':'Ready to start a walking session.'}</div><div class="mu-footsteps-actions"><button id="muFootStart" class="save" type="button">Start walking</button><button id="muFootStop" class="secondary" type="button">Stop</button><button id="muFootReset" class="secondary" type="button">Reset</button></div>`,'mu-footsteps-modal');
  modal.querySelector('#muFootStart').addEventListener('click',muStartFoot);modal.querySelector('#muFootStop').addEventListener('click',()=>muStopFoot(true));modal.querySelector('#muFootReset').addEventListener('click',muResetFoot);muRenderFoot();
}

/* ---------- Legacy Studio ---------- */
function muJourneyMemoriesAll(id){return (typeof memories!=='undefined'?memories:[]).filter(m=>String(m.journeyId)===String(id));}
async function muLegacyPhotoUrls(j){
  const paths=[];if(j.coverPhotoPath)paths.push(j.coverPhotoPath);muJourneyMemoriesAll(j.id).forEach(m=>{if(m.photoPath)paths.push(m.photoPath);});
  const unique=[...new Set(paths)].slice(0,6);if(typeof muMediaSignedUrl!=='function')return[];const settled=await Promise.allSettled(unique.map(p=>muMediaSignedUrl(p)));return settled.filter(x=>x.status==='fulfilled'&&x.value).map(x=>x.value);
}
async function muRenderLegacyPreview(modal){
  const j=findJourney(modal.querySelector('#muLegacyJourney').value),stage=modal.querySelector('#muLegacyStage');if(!j||!stage)return;stage.innerHTML='<div class="mu-legacy-empty">Building your tribute…</div>';const urls=await muLegacyPhotoUrls(j),message=modal.querySelector('#muLegacyMessage').value.trim()||j.story||'A journey worth remembering.';
  if(!urls.length){stage.innerHTML=`<div class="mu-legacy-empty"><strong>${muToolEscape(j.title)}</strong><p>${muToolEscape(message)}</p><small>Add journey or memory photos to turn this into an animated collage.</small></div><div class="mu-legacy-overlay"><span>MEMORIES UNLOCKED · LEGACY</span><strong>${muToolEscape(j.title)}</strong><p>${muToolEscape(message)}</p></div>`;return;}
  const shown=urls.slice(0,3);stage.innerHTML=`<div class="mu-legacy-collage">${shown.map(u=>`<img src="${muToolEscape(u)}" alt="">`).join('')}</div><div class="mu-legacy-overlay"><span>MEMORIES UNLOCKED · LEGACY</span><strong>${muToolEscape(j.title)}</strong><p>${muToolEscape(message)}</p></div>`;
}
function muOpenLegacyStudio(){
  const js=typeof journeys!=='undefined'?journeys:[];if(!js.length){window.toast?.('Create a journey first, then Legacy Studio can build a tribute from it.');return;}
  const modal=mountDialog('muLegacyStudioModal',`<button class="close" type="button" onclick="closeModal('muLegacyStudioModal')">×</button><span class="mu-tool-kicker">LEGACY STUDIO · V1</span><h2>Turn a journey into a tribute</h2><p class="mu-tool-note">Legacy Studio uses the photos already attached to the selected journey and its memories. This first version creates an animated in-app collage; exportable video can come next.</p><div class="mu-legacy-controls"><div><label>Journey</label><select id="muLegacyJourney">${js.map(j=>`<option value="${muToolEscape(j.id)}">${muToolEscape(j.title)}${j.archived?' · Legacy':''}</option>`).join('')}</select></div><div><label>Tribute message</label><input id="muLegacyMessage" value="A journey worth remembering."></div></div><div id="muLegacyStage" class="mu-legacy-stage"></div><div class="mu-footsteps-actions"><button id="muLegacyBuild" class="save" type="button">Build tribute</button><button id="muLegacyPlay" class="secondary" type="button">Play animation</button><button id="muLegacyShare" class="secondary" type="button">Share</button></div>`,'mu-legacy-studio');
  const build=()=>muRenderLegacyPreview(modal);modal.querySelector('#muLegacyBuild').addEventListener('click',build);modal.querySelector('#muLegacyJourney').addEventListener('change',build);modal.querySelector('#muLegacyPlay').addEventListener('click',()=>{const stage=modal.querySelector('#muLegacyStage');stage.classList.toggle('playing');modal.querySelector('#muLegacyPlay').textContent=stage.classList.contains('playing')?'Pause animation':'Play animation';});modal.querySelector('#muLegacyShare').addEventListener('click',async()=>{const j=findJourney(modal.querySelector('#muLegacyJourney').value);if(!j)return;const text=`${j.title} — ${modal.querySelector('#muLegacyMessage').value.trim()||'A journey worth remembering.'}`;try{if(navigator.share)await navigator.share({title:'Memories Unlocked Legacy',text,url:muJourneyShareUrl(j)});else{await navigator.clipboard.writeText(`${text}\n${muJourneyShareUrl(j)}`);window.toast?.('Legacy tribute link copied.');}}catch(e){if(e.name!=='AbortError')window.toast?.('Sharing was not available just now.');}});build();
}

function muRunTool(name){if(name==='discover')muOpenDiscoverTool();if(name==='capture')muOpenCapture();if(name==='footsteps')muOpenFootsteps();if(name==='share')muOpenShare();if(name==='legacy')muOpenLegacyStudio();}
function muInstallToolEvents(){document.addEventListener('click',e=>{const t=e.target.closest('[data-mu-tool]');if(t)muRunTool(t.dataset.muTool);});document.addEventListener('keydown',e=>{const t=e.target.closest('[data-mu-tool]');if(t&&['Enter',' '].includes(e.key)){e.preventDefault();muRunTool(t.dataset.muTool);}});}

muLoadFoot();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{muInstallHeroWatcher();muWatchWidgets();muInstallToolEvents();},{once:true});else{muInstallHeroWatcher();muWatchWidgets();muInstallToolEvents();}
window.addEventListener('beforeunload',()=>{if(muFootState.running)muStopFoot(true);});
})();
