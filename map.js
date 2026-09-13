/* Exact, user-confirmed locations. No bulk or background geocoding. */
const MU_MAP_CONFIG = window.MU_MAP_CONFIG || {
  tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  search: 'https://photon.komoot.io/api/'
};
let memoryMap, memoryLayers, mapJourneyId = '', draftMemoryPoint = null;
let pickerMap, pickerMarker, pickerPoint, pickerMemoryId, pickerRequest, pickerVersion = 0, savingPoint = false;
const placeCache = new Map();
function validPoint(lat, lng) {
  return lat !== null && lat !== undefined && lat !== '' && lng !== null && lng !== undefined && lng !== '' &&
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
}
function pointOf(m) { return [Number(m.latitude), Number(m.longitude)]; }
function updateMapFilter() {
  const select = $('mapJourneyFilter'); if (!select) return;
  if (mapJourneyId && !findJourney(mapJourneyId)) mapJourneyId = '';
  select.innerHTML = '<option value="">All my journeys</option>' + journeys.map(j => `<option value="${esc(j.id)}">${esc(j.title)}</option>`).join('');
  select.value = mapJourneyId;
}
function changeMapJourney(id) { mapJourneyId = id; renderMemoryMap(); }
function openJourneyMap(id) { mapJourneyId = String(id); showView('map'); }
function mapMemories() { return mapJourneyId ? journeyMemories(mapJourneyId) : journeys.flatMap(j => journeyMemories(j.id)); }
function makeTileLayer(map, noticeId) {
  const tiles = L.tileLayer(MU_MAP_CONFIG.tiles, {attribution: MU_MAP_CONFIG.attribution, maxZoom:19, updateWhenIdle:true});
  tiles.on('tileerror', () => { if ($(noticeId)) $(noticeId).textContent = 'Map tiles are unavailable. Your saved pins and memory trail are still here.'; });
  tiles.on('tileload', () => { if ($(noticeId)?.textContent.startsWith('Map tiles')) $(noticeId).textContent = ''; });
  tiles.addTo(map); return tiles;
}
function markerIcon(label, count = 1) {
  return L.divIcon({className:'memory-map-marker', html:`<span>${esc(label)}</span>${count > 1 ? `<sup>+${count-1}</sup>` : ''}`,iconSize:[42,48],iconAnchor:[21,44]});
}
// Use the smallest longitude span, including journeys across the date line.
function mapPositions(items) {
  const sorted = items.map(m => ((Number(m.longitude)%360)+360)%360).sort((a,b)=>a-b);
  if (!sorted.length) return new Map();
  let gap = -1, start = sorted[0];
  for (let i=0; i<sorted.length; i++) { const next = sorted[(i+1)%sorted.length] + (i === sorted.length-1 ? 360 : 0); if (next-sorted[i]>gap) {gap=next-sorted[i]; start=next%360;} }
  const positions = new Map();
  items.forEach(m => { let lon=((Number(m.longitude)%360)+360)%360; if (lon<start) lon+=360; if (start>180) lon-=360; positions.set(String(m.id),[Number(m.latitude),lon]); });
  return positions;
}
function renderMemoryMap() {
  const list = mapMemories(), located = list.filter(m=>validPoint(m.latitude,m.longitude));
  $('mapSummary').textContent = `${located.length} of ${list.length} memories on the map${list.length-located.length ? ' · '+(list.length-located.length)+' waiting for a position' : ''}`;
  $('mapPins').innerHTML = list.length ? list.map(m => memoryBlock(m,journeyMemories(m.journeyId).findIndex(x=>x.id===m.id)+1)).join('')
    : '<div class="empty">Your world is waiting. Add a memory to begin your trail.</div>';
  if (!window.L) { $('mapNotice').textContent = 'The map could not load. You can still open every memory below.'; return; }
  if (!memoryMap) {
    memoryMap = L.map('memoryMap', {scrollWheelZoom:false}).setView([28,12],2);
    makeTileLayer(memoryMap, 'mapNotice'); memoryLayers=L.featureGroup().addTo(memoryMap);
    L.control.scale({imperial:false}).addTo(memoryMap);
  }
  memoryMap.invalidateSize(); memoryLayers.clearLayers();
  const positions=mapPositions(located), groups=new Map();
  const selectedJourneys=mapJourneyId ? journeys.filter(j=>String(j.id)===String(mapJourneyId)) : journeys;
  selectedJourneys.forEach(j => {
    let segment=[];
    const draw=()=>{ if(segment.length>1)L.polyline(segment,{color:'#ac7c19',weight:3,dashArray:'6 9',opacity:.85,interactive:false}).addTo(memoryLayers); segment=[]; };
    journeyMemories(j.id).forEach((m,i)=>{
      const position=positions.get(String(m.id));
      if(!position){draw();return;}
      segment.push(position);
      const key=position.join(',');
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push({memory:m,number:i+1,position});
    }); draw();
  });
  groups.forEach(group=>{
    const first=group[0];
    const marker=L.marker(first.position,{icon:markerIcon(first.number,group.length),title:group.map(x=>x.memory.title).join(' · '),keyboard:true}).addTo(memoryLayers);
    if(group.length===1)marker.on('click',()=>openMemory(first.memory.id));
    else {
      const popup=document.createElement('div');
      const label=document.createElement('strong'); label.textContent='Memories at this place'; popup.appendChild(label);
      group.forEach(item=>{const button=document.createElement('button');button.className='map-popup-memory';button.textContent=`${item.number}. ${item.memory.title}`;button.onclick=()=>openMemory(item.memory.id);popup.appendChild(button);});
      marker.bindPopup(popup);
    }
  });
  requestAnimationFrame(fitMemoryMap);
}
function fitMemoryMap() {
  if(!memoryMap)return;
  memoryMap.invalidateSize();
  if(memoryLayers.getLayers().length)memoryMap.fitBounds(memoryLayers.getBounds(),{padding:[48,48],maxZoom:16,animate:false});
  else memoryMap.setView([28,12],2);
}
function viewMemoryOnMap(id) {
  const m=findMemory(id);if(!m)return;
  mapJourneyId=String(m.journeyId);showView('map');
  requestAnimationFrame(()=>{if(memoryMap)memoryMap.setView(pointOf(m),17,{animate:false});});
}
function clearMemoryLocation() {
  draftMemoryPoint=null;
  if($('memoryLocationStatus'))$('memoryLocationStatus').textContent='Choose an exact spot now, or add it to your saved memory later.';
}
function openLocationPicker(id=null) {
  const m=id?findMemory(id):null;
  if(id&&!m)return;
  const initial=m||draftMemoryPoint;
  pickerMemoryId=id;
  pickerPoint=initial&&validPoint(initial.latitude,initial.longitude)?{latitude:Number(initial.latitude),longitude:Number(initial.longitude)}:null;
  const locationName=m?.location||$('memoryLocation').value.trim();
  mountDialog('locationPickerModal', `<button class="close" onclick="closeModal('locationPickerModal')">×</button><div class="welcome">A PLACE TO RETURN TO</div><h2>Find the exact spot</h2><p>Search for a landmark or address, then choose a result. Tap the map or drag the pin to fine-tune it.</p><label for="placeSearch">Place or address</label><div class="search-row"><input id="placeSearch" maxlength="200" value="${esc(locationName)}" placeholder="e.g. Piazza del Campidoglio, Rome"><button id="placeSearchButton" class="secondary" onclick="searchPlaces()">Search</button></div><div id="placeResults" class="place-results" aria-live="polite"></div><div id="locationPickerMap" class="location-picker-map" aria-label="Choose a memory location"></div><p id="pickerMapNotice" class="small" role="status"></p><p id="chosenPoint" class="small" role="status"></p><details class="coordinate-entry"><summary>Enter latitude and longitude</summary><div class="action-row"><div><label for="pinLatitude">Latitude</label><input id="pinLatitude" type="number" step="any" min="-90" max="90" placeholder="e.g. 41.893"></div><div><label for="pinLongitude">Longitude</label><input id="pinLongitude" type="number" step="any" min="-180" max="180" placeholder="e.g. 12.483"></div></div><button class="secondary" onclick="useTypedPoint()">Use these coordinates</button></details><p class="small">Place search uses Photon / OpenStreetMap. Your story and clue are never sent with a search.</p><button id="confirmPoint" class="save" onclick="confirmMemoryPoint()" ${pickerPoint?'':'disabled'}>Use this location</button>`, 'location-picker');
  $('placeSearch').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();searchPlaces();}});
  $('placeSearch').addEventListener('input',()=>{pickerVersion++;pickerRequest?.abort();$('placeResults').textContent='';$('placeSearchButton').disabled=false;});
  if(window.L){pickerMap=L.map('locationPickerMap',{scrollWheelZoom:false}).setView(pickerPoint?[pickerPoint.latitude,pickerPoint.longitude]:[30,12],pickerPoint?16:2);makeTileLayer(pickerMap,'pickerMapNotice');pickerMap.on('click',e=>choosePoint(e.latlng.lat,e.latlng.lng));if(pickerPoint)choosePoint(pickerPoint.latitude,pickerPoint.longitude);requestAnimationFrame(()=>pickerMap?.invalidateSize());}
  else $('pickerMapNotice').textContent='The map is unavailable. Search for a place or enter its coordinates below.';
  updateChosenPoint();
}
function updateChosenPoint(){
  if(!$('chosenPoint'))return;
  $('chosenPoint').textContent=pickerPoint?`Selected position: ${pickerPoint.latitude.toFixed(6)}, ${pickerPoint.longitude.toFixed(6)}`:'No spot chosen yet. Search above, or tap a place on the map.';
  $('confirmPoint').disabled=!pickerPoint||savingPoint;
}
function choosePoint(latitude,longitude){
  longitude=((Number(longitude)+180)%360+360)%360-180;
  if(!validPoint(latitude,longitude))return;
  pickerPoint={latitude:Number(latitude),longitude:Number(longitude)};
  if(pickerMap){
    if(pickerMarker)pickerMarker.setLatLng([latitude,longitude]);
    else{pickerMarker=L.marker([latitude,longitude],{icon:markerIcon('◇'),draggable:true,title:'Drag to the exact spot'}).addTo(pickerMap);pickerMarker.on('dragend',()=>{const p=pickerMarker.getLatLng();choosePoint(p.lat,p.lng);});}
  }
  $('pinLatitude').value=pickerPoint.latitude;$('pinLongitude').value=pickerPoint.longitude;updateChosenPoint();
}
function useTypedPoint(){const lat=$('pinLatitude').value,lng=$('pinLongitude').value;if(!validPoint(lat,lng)){toast('Enter a latitude from −90 to 90 and a longitude from −180 to 180.');return;}choosePoint(lat,lng);pickerMap?.setView([Number(lat),Number(lng)],16);}
async function searchPlaces(){
  const query=$('placeSearch').value.trim();
  if(query.length<3){$('placeResults').textContent='Enter at least three characters, ideally a landmark and town.';return;}
  pickerRequest?.abort();pickerRequest=new AbortController();const request=pickerRequest,version=++pickerVersion;
  $('placeSearchButton').disabled=true;$('placeResults').textContent='Finding places…';
  const timeout=setTimeout(()=>request.abort(),12000);
  try{
    let results=placeCache.get(query.toLowerCase());
    if(!results){
      const url=new URL(MU_MAP_CONFIG.search);url.search=new URLSearchParams({q:query,limit:'5',lang:'en'});
      const response=await fetch(url,{signal:request.signal});if(!response.ok)throw new Error('Search unavailable');
      const data=await response.json();results=(data.features||[]).filter(f=>f.geometry?.type==='Point'&&validPoint(f.geometry.coordinates[1],f.geometry.coordinates[0])).map(f=>{
        const p=f.properties||{},parts=[p.name,[p.housenumber,p.street].filter(Boolean).join(' '),p.city||p.town||p.district,p.state,p.country].filter(Boolean);
        return{label:[...new Set(parts)].join(', ')||'Map location',latitude:f.geometry.coordinates[1],longitude:f.geometry.coordinates[0]};
      });
      if(placeCache.size>=100)placeCache.delete(placeCache.keys().next().value);placeCache.set(query.toLowerCase(),results);
    }
    if(version!==pickerVersion||!$('placeResults'))return;
    $('placeResults').replaceChildren();
    if(!results.length)$('placeResults').textContent='No matching places found. Try a shorter landmark name and town, or choose a spot on the map.';
    results.forEach(result=>{const button=document.createElement('button');button.className='place-result';button.textContent=result.label;button.onclick=()=>{choosePoint(result.latitude,result.longitude);pickerMap?.setView([result.latitude,result.longitude],16);$('placeResults').textContent='Selected: '+result.label;};$('placeResults').appendChild(button);});
  }catch{if(version===pickerVersion&&$('placeResults'))$('placeResults').textContent='Place search is unavailable right now. You can still tap the map or enter coordinates.';}
  finally{clearTimeout(timeout);if(version===pickerVersion&&$('placeSearchButton'))$('placeSearchButton').disabled=false;}
}
async function persistMemoryExtras(m){
  if(!cloudUser||!m.cloud){m.extrasPending=Boolean(m.cloud);return false;}
  if(m.ownerId&&m.ownerId!==cloudUser.id){m.extrasPending=true;return false;}
  try{
    const result=await writeCloud('memories',{clue:m.clue||'',latitude:m.latitude??null,longitude:m.longitude??null},['clue','latitude','longitude'],m.id);
    m.extrasPending=(result.missing.includes('clue')&&Boolean(m.clue))||(result.missing.some(k=>['latitude','longitude'].includes(k))&&validPoint(m.latitude,m.longitude));
    return !m.extrasPending&&Boolean(result.data);
  }catch(error){console.warn('Cloud memory details:',error.message);m.extrasPending=true;return false;}
}
async function confirmMemoryPoint(){
  if(!pickerPoint||savingPoint)return;
  savingPoint=true;$('confirmPoint').disabled=true;
  const id=pickerMemoryId,point={...pickerPoint},dialog=$('locationPickerModal');
  try{
    if(id){
      const m=findMemory(id);if(!m)return;
      Object.assign(m,point);m.extrasPending=Boolean(m.cloud);const localSaved=save();
      const synced=await persistMemoryExtras(m);save();if($('locationPickerModal')===dialog)closeModal('locationPickerModal');render();
      if($('memoryDetailModal'))openMemory(m.id);
      toast(synced?'Your map position is saved to the cloud.':localSaved?'Map position saved on this device. Cloud saving for this detail is not available yet.':'Map position is only in this open page. Storage is unavailable.');
    }else{draftMemoryPoint=point;closeModal('locationPickerModal');$('memoryLocationStatus').textContent='✓ Exact map position chosen. This will be saved with your memory.';}
  }finally{savingPoint=false;if($('confirmPoint'))updateChosenPoint();}
}
async function retryMemoryExtras(id){const m=findMemory(id);if(!m)return;const synced=await persistMemoryExtras(m);save();openMemory(id);toast(synced?'Clue and position saved to the cloud.':'Your details are kept on this device. The cloud fields or permissions still need completing.');}
function disposeLocationPicker(){pickerVersion++;pickerRequest?.abort();pickerMap?.remove();pickerMap=null;pickerMarker=null;}
