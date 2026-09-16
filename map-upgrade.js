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
    const located=(typeof memories!=='undefined'?memories:[]).filter(m=>m?.location);
    if(located.length){
      const latest=located.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
      return{label:latest.location,sub:'Latest memory',memoryId:latest.id};
    }
    const js=typeof journeys!=='undefined'?journeys:[];
    if(js.length&&js[0]?.location)return{label:js[0].location,sub:'Latest journey',journeyId:js[0].id};
  }catch{}
  return{label:'Your world',sub:'Memories Unlocked'};
}
function ensurePlaceChip(){
  let chip=document.getElementById('appPlaceChip');
  if(!chip){chip=document.createElement('button');chip.id='appPlaceChip';chip.type='button';chip.className='app-place-chip';chip.setAttribute('aria-label','Open your latest place on the map');chip.innerHTML='<span class="place-pin">⌖</span><span class="place-copy"><small>Memories Unlocked</small><strong>Your world</strong></span><span class="place-arrow">↗</span>';document.body.appendChild(chip);chip.addEventListener('click',()=>{const p=latestPlace();if(p.memoryId&&typeof viewMemoryOnMap==='function')viewMemoryOnMap(p.memoryId);else if(p.journeyId&&typeof openJourneyMap==='function')openJourneyMap(p.journeyId);else if(typeof showView==='function')showView('map');});}
  const p=latestPlace();chip.querySelector('small').textContent=p.sub;chip.querySelector('strong').textContent=p.label;
}
function refreshPlaceChip(){requestAnimationFrame(ensurePlaceChip);}
function initPlaceChip(){
  ensurePlaceChip();
  ['journeyList','recentMemories','cloudStatus'].forEach(id=>{const n=document.getElementById(id);if(n&&!n.dataset.placeObserved){n.dataset.placeObserved='1';new MutationObserver(refreshPlaceChip).observe(n,{childList:true,subtree:true,characterData:true});}});
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initPlaceChip,{once:true});else initPlaceChip();
})();
