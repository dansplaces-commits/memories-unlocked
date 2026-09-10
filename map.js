(function(root){
 'use strict';
 const fallbackTheme={styles:{visited:{color:'#10244a',symbol:'✓'},planned:{color:'#328997',symbol:'→'},dream:{color:'#7251a3',symbol:'★'},memory:{color:'#d6a52f',symbol:'♥'}}};
 function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
 function pinFor(point,theme=fallbackTheme){
  const key=point.kind==='memory'?'memory':(['planned','dream'].includes(point.journey_status)?point.journey_status:'visited');
  return theme?.styles?.[key] || fallbackTheme.styles[key];
 }
 function markerIcon(point,theme){
  const style=pinFor(point,theme),symbol=escapeHtml(style.symbol);
  return root.L.divIcon({className:'memoryPinIcon',html:`<div class="mapPin" style="background:${style.color}" title="${escapeHtml(style.label||'Map pin')}"><span aria-hidden="true">${symbol}</span></div>`,iconSize:[32,38],iconAnchor:[16,38],popupAnchor:[0,-34]});
 }
 function popup(document,point,onSelect){
  const box=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('p'),button=document.createElement('button');
  title.textContent=point.title;meta.textContent=[point.kind==='memory'?'Memory':'Journey',point.location].filter(Boolean).join(' · ');button.type='button';button.textContent='Open in timeline';button.className='mapPopupButton';
  button.addEventListener('click',()=>onSelect(point));box.append(title,meta,button);return box;
 }
 function createView(document,id,onSelect,initialTheme=fallbackTheme){
  if(!root.L)return null;
  const map=root.L.map(id,{scrollWheelZoom:false}).setView([54.2,-2.5],5);
  root.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  const layer=root.L.layerGroup().addTo(map);let points=[],theme=initialTheme||fallbackTheme,markers=[];
  function draw(){
   layer.clearLayers();markers=[];const bounds=[];
   for(const point of points){const marker=root.L.marker([point.latitude,point.longitude],{icon:markerIcon(point,theme)});marker.bindPopup(popup(document,point,onSelect));marker.on('click',()=>onSelect(point));marker.addTo(layer);markers.push(marker);bounds.push([point.latitude,point.longitude]);}
   if(bounds.length===1)map.setView(bounds[0],8);else if(bounds.length>1)map.fitBounds(bounds,{padding:[30,30],maxZoom:8});
  }
  function setPoints(next){
   points=next.filter(point=>Number.isFinite(point.latitude)&&Number.isFinite(point.longitude));draw();
  }
  function setTheme(next){theme=next||fallbackTheme;draw();}
  setTimeout(()=>map.invalidateSize(),0);return {setPoints,setTheme,focus(point){if(point)map.setView([point.latitude,point.longitude],Math.max(map.getZoom(),8));},destroy(){map.remove();}};
 }
 function createPicker(document,id,initial,onPick,initialTheme=fallbackTheme){
  if(!root.L)return null;
  const map=root.L.map(id,{scrollWheelZoom:true}).setView(initial?[initial.latitude,initial.longitude]:[54.2,-2.5],initial?10:5);
  root.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  let marker=initial?root.L.marker([initial.latitude,initial.longitude],{icon:markerIcon({kind:'memory'},initialTheme)}).addTo(map):null;
  map.on('click',event=>{if(marker)marker.setLatLng(event.latlng);else marker=root.L.marker(event.latlng,{icon:markerIcon({kind:'memory'},initialTheme)}).addTo(map);onPick({latitude:event.latlng.lat,longitude:event.latlng.lng});});
  setTimeout(()=>map.invalidateSize(),0);return {destroy(){map.remove();}};
 }
 const api={createView,createPicker,pinFor};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MemoriesMap=api;
})(typeof window!=='undefined'?window:globalThis);
