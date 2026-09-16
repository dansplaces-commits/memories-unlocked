/* Memories Unlocked — premium map styles and place presence. Presentation/navigation only. */
(function(){
const STYLE_KEY='mu_map_style_v1';
const MAP_STYLES={
  street:{label:'Street',tiles:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',options:{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}},
  satellite:{label:'Satellite',tiles:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',options:{maxZoom:19,attribution:'Tiles © Esri'}},
  terrain:{label:'Terrain',tiles:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',options:{maxZoom:17,attribution:'Map data © OpenStreetMap contributors · Map style © OpenTopoMap'}},
  explorer:{label:'Explorer',tiles:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',options:{maxZoom:19,attribution:'Tiles © Esri · map data providers'}}
};
const mapState=new WeakMap();
function savedStyle(){try{const v=localStorage.getItem(STYLE_KEY);return Object.hasOwn(MAP_STYLES,v)?v:'street';}catch{return'street';}}
function rememberStyle(style){try{localStorage.setItem(STYLE_KEY,style);}catch{}}
function closeStyleControl(container){
  const box=container?.querySelector('.mu-map-control');
  box?.classList.remove('open');
  box?.querySelector('.mu-map-layers-toggle')?.setAttribute('aria-expanded','false');
}
function setPressed(container,style){container?.querySelectorAll('[data-mu-map-style]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.muMapStyle===style)));const label=container?.querySelector('.mu-map-layers-toggle b');if(label)label.textContent=MAP_STYLES[style]?.label||'Layers';}
function setStyle(map,style,noticeId){
  if(!Object.hasOwn(MAP_STYLES,style))style='street';
  const state=mapState.get(map)||{};
  if(state.layer)map.removeLayer(state.layer);
  const cfg=MAP_STYLES[style];
  let errorCount=0;
  const layer=L.tileLayer(cfg.tiles,{...cfg.options,updateWhenIdle:true});
  layer.on('tileerror',()=>{
    if(mapState.get(map)?.layer!==layer)return;
    errorCount++;
    const n=document.getElementById(noticeId);
    if(n)n.textContent='This map style is temporarily unavailable. Your pins and trails are still safe.';
    if(style!=='street'&&errorCount>=4){
      const latest=mapState.get(map)||{};
      if(latest.style===style){
        if(n)n.textContent='That map style could not load, so Street view has been restored.';
        setStyle(map,'street',noticeId);
      }
    }
  });
  layer.on('tileload',()=>{if(mapState.get(map)?.layer!==layer)return;const n=document.getElementById(noticeId);if(n&&(n.textContent.startsWith('This map style')||n.textContent.startsWith('That map style')))n.textContent='';});
  mapState.set(map,{...state,layer,style,noticeId});
  layer.addTo(map);layer.bringToBack?.();
  rememberStyle(style);
  const container=map.getContainer();
  setPressed(container,style);
  closeStyleControl(container);
  requestAnimationFrame(()=>layer.bringToBack?.());
  return layer;
}
function addStyleControl(map,noticeId){
  const control=L.control({position:'topright'});
  let removeOutsideListener=()=>{};
  control.onAdd=()=>{
    const box=L.DomUtil.create('div','mu-map-control');
    box.setAttribute('aria-label','Map style');
    box.setAttribute('role','group');
    const optionsId=noticeId+'-style-options';
    box.innerHTML=`<button type="button" class="mu-map-layers-toggle" aria-expanded="false" aria-controls="${optionsId}" aria-label="Choose map style"><span aria-hidden="true">▱</span><b>Layers</b></button><div class="mu-map-options" id="${optionsId}"><span class="mu-map-control-title">MAP STYLE</span>${Object.entries(MAP_STYLES).map(([key,v])=>`<button type="button" data-mu-map-style="${key}" aria-pressed="false">${v.label}</button>`).join('')}</div>`;
    L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);
    const toggle=box.querySelector('.mu-map-layers-toggle');
    toggle.addEventListener('click',()=>{const open=box.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
    box.querySelectorAll('[data-mu-map-style]').forEach(btn=>btn.addEventListener('click',()=>{setStyle(map,btn.dataset.muMapStyle,noticeId);if(window.matchMedia('(max-width:700px)').matches)toggle.focus();}));
    box.addEventListener('keydown',event=>{if(event.key==='Escape'&&box.classList.contains('open')){event.preventDefault();event.stopPropagation();closeStyleControl(map.getContainer());toggle.focus();}});
    const closeOutside=event=>{if(!box.contains(event.target))closeStyleControl(map.getContainer());};
    document.addEventListener('pointerdown',closeOutside);
    removeOutsideListener=()=>document.removeEventListener('pointerdown',closeOutside);
    return box;
  };
  control.onRemove=()=>removeOutsideListener();
  control.addTo(map);
  return control;
}
function addLocateControl(map){
  const control=L.control({position:'topright'});
  control.onAdd=()=>{
    const wrap=L.DomUtil.create('div','mu-locate-control');
    const btn=L.DomUtil.create('button','',wrap);btn.type='button';btn.innerHTML='<span aria-hidden="true">◎</span><b>My location</b>';btn.title='Show my current location';btn.setAttribute('aria-label','Show my current location');
    L.DomEvent.disableClickPropagation(wrap);
    btn.addEventListener('click',()=>{
      if(!navigator.geolocation){window.toast?.('Location is not available in this browser.');return;}
      if(btn.disabled)return;
      btn.disabled=true;btn.setAttribute('aria-busy','true');
      btn.classList.add('locating');btn.querySelector('b').textContent='Locating…';
      navigator.geolocation.getCurrentPosition(pos=>{
        const p=[pos.coords.latitude,pos.coords.longitude];
        map.setView(p,15,{animate:true});
        const state=mapState.get(map)||{};
        if(state.userMarker)state.userMarker.remove();
        const userMarker=L.circleMarker(p,{radius:9,color:'#fff',weight:3,fillColor:'#1677ff',fillOpacity:1}).addTo(map).bindTooltip('You are here',{direction:'top',offset:[0,-10]});
        mapState.set(map,{...state,userMarker});
        btn.disabled=false;btn.setAttribute('aria-busy','false');btn.classList.remove('locating');btn.querySelector('b').textContent='My location';
      },()=>{btn.disabled=false;btn.setAttribute('aria-busy','false');btn.classList.remove('locating');btn.querySelector('b').textContent='My location';window.toast?.('Location permission was not available. You can still explore every saved place on the map.');},{enableHighAccuracy:false,timeout:9000,maximumAge:300000});
    });
    return wrap;
  };
  control.addTo(map);return control;
}

/* Override the original single-layer helper before maps are first created. */
makeTileLayer=function(map,noticeId){
  const style=savedStyle();
  const layer=setStyle(map,style,noticeId);
  addStyleControl(map,noticeId);
  if(noticeId==='mapNotice')addLocateControl(map);
  requestAnimationFrame(()=>setPressed(map.getContainer(),style));
  return layer;
};

function latestPlace(){
  try{
    const allJourneys=typeof journeys!=='undefined'?journeys:[];
    const activeJourneyIds=new Set(allJourneys.filter(j=>!j?.archived).map(j=>String(j.id)));
    const located=(typeof memories!=='undefined'?memories:[]).filter(m=>m?.location&&!m?.archived&&activeJourneyIds.has(String(m.journeyId)));
    if(located.length){
      const latest=located.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
      return{label:latest.location,sub:'Latest memory',memoryId:latest.id};
    }
    const js=allJourneys.filter(j=>!j?.archived);
    if(js.length&&js[0]?.location)return{label:js[0].location,sub:'Latest journey',journeyId:js[0].id};
  }catch{}
  return{label:'Your world',sub:'Memories Unlocked'};
}
function ensurePlaceChip(){
  let chip=document.getElementById('appPlaceChip');
  if(!chip){chip=document.createElement('button');chip.id='appPlaceChip';chip.type='button';chip.className='app-place-chip';chip.setAttribute('aria-label','Open your latest place on the map');chip.innerHTML='<span class="place-pin">⌖</span><span class="place-copy"><small>Memories Unlocked</small><strong>Your world</strong></span><span class="place-arrow">↗</span>';document.body.appendChild(chip);chip.addEventListener('click',()=>{const p=latestPlace();if(p.memoryId&&typeof viewMemoryOnMap==='function')viewMemoryOnMap(p.memoryId);else if(p.journeyId&&typeof openJourneyMap==='function')openJourneyMap(p.journeyId);else if(typeof showView==='function')showView('map');});}
  const p=latestPlace();chip.querySelector('small').textContent=p.sub;chip.querySelector('strong').textContent=p.label;
}

function ensureDirectDiscoverStyles(){
  if(document.getElementById('muDirectDiscoverStyles'))return;
  const style=document.createElement('style');style.id='muDirectDiscoverStyles';style.textContent=`
  .app-discover-chip-direct{position:fixed;top:82px;right:82px;z-index:236;min-width:220px;max-width:min(330px,calc(100vw - 180px));min-height:50px;padding:7px 12px 7px 9px;border:1px solid #1d416b;border-radius:17px;background:rgba(16,45,85,.97);box-shadow:0 12px 30px rgba(16,36,74,.20);display:grid;grid-template-columns:36px 1fr 20px;align-items:center;gap:9px;color:#fff;text-align:left;cursor:pointer;font-family:'DM Sans',Arial,sans-serif}.app-discover-chip-direct:hover{transform:translateY(-2px)}.app-discover-chip-direct .discover-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#efc65a;color:#102d55;font-size:18px}.app-discover-chip-direct small,.app-discover-chip-direct strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.app-discover-chip-direct small{font-size:8px;letter-spacing:1.25px;color:#efc65a;font-weight:800}.app-discover-chip-direct strong{font:700 12px 'Playfair Display',Georgia,serif;margin-top:1px}.app-discover-chip-direct .discover-arrow{color:#efc65a;font-size:18px;text-align:right}
  @media(min-width:1180px){html[data-dock="right"] .app-discover-chip-direct{right:calc(104px + 82px)}html[data-dock="left"] .app-discover-chip-direct{right:82px}}
  @media(max-width:1179px){.app-discover-chip-direct{top:60px;right:70px;min-width:0;width:auto;max-width:44%;min-height:42px;padding:5px 9px;border-radius:15px;grid-template-columns:30px minmax(0,1fr) 16px}.app-discover-chip-direct .discover-icon{width:29px;height:29px;font-size:15px}.app-discover-chip-direct small{font-size:7px}.app-discover-chip-direct strong{font-size:11px}}
  @media(max-width:700px){.app-discover-chip-direct{top:52px;right:62px;max-width:48%;min-height:40px}.app-discover-chip-direct small{display:none}.app-discover-chip-direct strong{font-size:10px;max-width:120px}.app-discover-chip-direct .discover-arrow{display:none}.app-discover-chip-direct{grid-template-columns:28px minmax(0,1fr)}.app-discover-chip-direct .discover-icon{width:28px;height:28px;font-size:14px}}
  `;document.head.appendChild(style);
}
function discoverContext(){
  const p=latestPlace();
  if(p.memoryId)return{kind:'memory',id:p.memoryId,label:p.label};
  if(p.journeyId)return{kind:'journey',id:p.journeyId,label:p.label};
  return null;
}
function waitForScript(script){return new Promise((resolve,reject)=>{if(window.muOpenPlaceIntelligence)return resolve();script.addEventListener('load',resolve,{once:true});script.addEventListener('error',reject,{once:true});setTimeout(()=>window.muOpenPlaceIntelligence?resolve():reject(new Error('Discover module did not load.')),12000);});}
async function ensurePlaceIntelligence(){
  if(window.muOpenPlaceIntelligence)return;
  if(!document.getElementById('muPlaceIntelStyles')&&!document.querySelector('link[href*="place-intelligence.css"]')){const link=document.createElement('link');link.id='muPlaceIntelDirectStyles';link.rel='stylesheet';link.href='place-intelligence.css?v=20260916direct3';document.head.appendChild(link);}
  const existing=document.getElementById('muPlaceIntelScript')||document.getElementById('muPlaceIntelDirectScript')||document.querySelector('script[src*="place-intelligence.js"]');
  if(existing){await waitForScript(existing);return;}
  const script=document.createElement('script');script.id='muPlaceIntelDirectScript';script.src='place-intelligence.js?v=20260916direct3';script.async=false;document.body.appendChild(script);await waitForScript(script);
}
async function openDirectDiscover(){
  const ctx=discoverContext();
  if(!ctx){window.toast?.('Add a location to a journey or memory first, then Discover can open the place.');return;}
  const chip=document.getElementById('appDiscoverChip');const old=chip?.querySelector('small')?.textContent;
  if(chip?.querySelector('small'))chip.querySelector('small').textContent='OPENING…';
  try{await ensurePlaceIntelligence();if(typeof window.muOpenPlaceIntelligence!=='function')throw new Error('Discover is not ready.');window.muOpenPlaceIntelligence(ctx.kind,ctx.id);}
  catch(error){console.warn('Discover:',error.message);window.toast?.('Discover could not open yet. Refresh this preview and try once more.');}
  finally{if(chip?.querySelector('small'))chip.querySelector('small').textContent=old||'DISCOVER';}
}
function ensureDiscoverChip(){
  ensureDirectDiscoverStyles();
  const ctx=discoverContext();
  let chip=document.getElementById('appDiscoverChip');
  if(!chip){chip=document.createElement('button');chip.id='appDiscoverChip';chip.type='button';document.body.appendChild(chip);}
  chip.classList.add('app-discover-chip-direct');
  chip.setAttribute('aria-label',ctx?`Discover ${ctx.label}`:'Discover a place');
  chip.innerHTML=`<span class="discover-icon">⌖</span><span><small>DISCOVER</small><strong>${ctx?`Discover ${esc(ctx.label)}`:'Discover a place'}</strong></span><span class="discover-arrow">→</span>`;
  if(!chip.dataset.directDiscoverBound){chip.dataset.directDiscoverBound='1';chip.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openDirectDiscover();});}
}

function refreshPlaceChip(){requestAnimationFrame(()=>{ensurePlaceChip();ensureDiscoverChip();});}
function initPlaceChip(){
  ensurePlaceChip();ensureDiscoverChip();
  ['journeyList','recentMemories','cloudStatus'].forEach(id=>{const n=document.getElementById(id);if(n&&!n.dataset.placeObserved){n.dataset.placeObserved='1';new MutationObserver(refreshPlaceChip).observe(n,{childList:true,subtree:true,characterData:true});}});
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initPlaceChip,{once:true});else initPlaceChip();
})();
