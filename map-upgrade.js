/* Memories Unlocked — premium map styles and place presence. Presentation/navigation only. */
(function(){
const STYLE_KEY='mu_map_style_v1';
const MAP_STYLES={
  street:{label:'Street',tiles:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',options:{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}},
  satellite:{label:'Satellite',tiles:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',options:{maxZoom:19,attribution:'Tiles © Esri'}},
  terrain:{label:'Terrain',tiles:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',options:{maxZoom:17,attribution:'Map data © OpenStreetMap contributors · Map style © OpenTopoMap'}},
  explorer:{label:'Explorer',tiles:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',options:{maxZoom:20,attribution:'© OpenStreetMap contributors · © CARTO'}}
};
const mapState=new WeakMap();
function savedStyle(){try{const v=localStorage.getItem(STYLE_KEY);return MAP_STYLES[v]?v:'street';}catch{return'street';}}
function rememberStyle(style){try{localStorage.setItem(STYLE_KEY,style);}catch{}}
function setStyle(map,style,noticeId){
  if(!MAP_STYLES[style])style='street';
  const state=mapState.get(map)||{};
  if(state.layer)map.removeLayer(state.layer);
  const cfg=MAP_STYLES[style];
  const layer=L.tileLayer(cfg.tiles,{...cfg.options,updateWhenIdle:true});
  layer.on('tileerror',()=>{const n=document.getElementById(noticeId);if(n)n.textContent='This map style is temporarily unavailable. Your pins and trails are still safe.';});
  layer.on('tileload',()=>{const n=document.getElementById(noticeId);if(n&&n.textContent.startsWith('This map style'))n.textContent='';});
  layer.addTo(map);layer.bringToBack?.();
  mapState.set(map,{...state,layer,style,noticeId});
  rememberStyle(style);
  const container=map.getContainer();
  container.querySelectorAll('[data-mu-map-style]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.muMapStyle===style)));
  requestAnimationFrame(()=>layer.bringToBack?.());
  return layer;
}
function addStyleControl(map,noticeId){
  const control=L.control({position:'topright'});
  control.onAdd=()=>{
    const box=L.DomUtil.create('div','mu-map-control');
    box.setAttribute('aria-label','Map style');
    box.innerHTML='<span class="mu-map-control-title">MAP</span>'+Object.entries(MAP_STYLES).map(([key,v])=>`<button type="button" data-mu-map-style="${key}" aria-pressed="false">${v.label}</button>`).join('');
    L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);
    box.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>setStyle(map,btn.dataset.muMapStyle,noticeId)));
    return box;
  };
  control.addTo(map);
  return control;
}
function addLocateControl(map){
  const control=L.control({position:'topright'});
  control.onAdd=()=>{
    const wrap=L.DomUtil.create('div','mu-locate-control');
    const btn=L.DomUtil.create('button','',wrap);btn.type='button';btn.innerHTML='<span>◎</span><b>My location</b>';btn.title='Show my current location';
    L.DomEvent.disableClickPropagation(wrap);
    btn.addEventListener('click',()=>{
      if(!navigator.geolocation){window.toast?.('Location is not available in this browser.');return;}
      btn.classList.add('locating');btn.querySelector('b').textContent='Locating…';
      navigator.geolocation.getCurrentPosition(pos=>{
        const p=[pos.coords.latitude,pos.coords.longitude];
        map.setView(p,15,{animate:true});
        const state=mapState.get(map)||{};
        if(state.userMarker)state.userMarker.remove();
        const userMarker=L.circleMarker(p,{radius:9,color:'#fff',weight:3,fillColor:'#1677ff',fillOpacity:1}).addTo(map).bindTooltip('You are here',{direction:'top',offset:[0,-10]});
        mapState.set(map,{...state,userMarker});
        btn.classList.remove('locating');btn.querySelector('b').textContent='My location';
      },()=>{btn.classList.remove('locating');btn.querySelector('b').textContent='My location';window.toast?.('Location permission was not available. You can still explore every saved place on the map.');},{enableHighAccuracy:false,timeout:9000,maximumAge:300000});
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
  requestAnimationFrame(()=>map.getContainer().querySelectorAll('[data-mu-map-style]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.muMapStyle===style))));
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
window.addEventListener('DOMContentLoaded',()=>{
  ensurePlaceChip();
  ['journeyList','recentMemories','cloudStatus'].forEach(id=>{const n=document.getElementById(id);if(n)new MutationObserver(refreshPlaceChip).observe(n,{childList:true,subtree:true,characterData:true});});
});
})();