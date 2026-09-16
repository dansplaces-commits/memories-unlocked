/* Memories Unlocked — Place Intelligence v1: understand, explore and continue a place. */
(function(){
const PLACE_CACHE_HOURS=12;
const placeSuggestions=new Map();
let placeSuggestionSeq=0;

function placeDistanceKm(a,b,c,d){
  const r=6371,toRad=v=>Number(v)*Math.PI/180;
  const dLat=toRad(c-a),dLon=toRad(d-b),lat1=toRad(a),lat2=toRad(c);
  const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(x));
}
function placeDistanceLabel(km){return km<1?`${Math.max(50,Math.round(km*1000/50)*50)} m away`:`${km.toFixed(km<10?1:0)} km away`;}
function placeSentenceFacts(text){
  return String(text||'').replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+/).filter(s=>s.length>35).slice(0,3);
}
function placeTerms(text){return new Set(String(text||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(x=>x.length>3));}
function placeMatchScore(title,label){const a=placeTerms(title),b=placeTerms(label);let n=0;a.forEach(x=>{if(b.has(x))n++;});return n;}
function placeCacheKey(lat,lng,label){return `mu_place_intel_v1:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}:${String(label||'').toLowerCase().slice(0,80)}`;}
function readPlaceCache(key){try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&Date.now()-v.saved<PLACE_CACHE_HOURS*3600000)return v.data;}catch{}return null;}
function writePlaceCache(key,data){try{localStorage.setItem(key,JSON.stringify({saved:Date.now(),data}));}catch{}}
async function placeFetchJson(url,options={},timeout=12000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error(`Request failed ${response.status}`);return await response.json();}
  finally{clearTimeout(timer);}
}
async function geocodePlace(label){
  if(!label)return null;
  const url=new URL('https://photon.komoot.io/api/');url.search=new URLSearchParams({q:label,limit:'1',lang:'en'});
  const data=await placeFetchJson(url.toString(),{},10000);
  const f=data.features?.[0],coords=f?.geometry?.coordinates;if(!coords||!validPoint(coords[1],coords[0]))return null;
  const p=f.properties||{};
  return{latitude:Number(coords[1]),longitude:Number(coords[0]),label:[p.name,p.city||p.town,p.country].filter(Boolean).join(', ')||label};
}
function contextRecord(kind,id){return kind==='journey'?findJourney(id):findMemory(id);}
async function resolvePlaceContext(kind,id){
  const record=contextRecord(kind,id);if(!record)throw new Error('That saved place could not be found.');
  const label=record.location||record.title||'Saved place';
  if(kind==='memory'&&validPoint(record.latitude,record.longitude))return{kind,id,record,label,latitude:Number(record.latitude),longitude:Number(record.longitude),journeyId:record.journeyId};
  if(kind==='journey'){
    try{const located=typeof muAllJourneyMemories==='function'?muAllJourneyMemories(id).filter(m=>validPoint(m.latitude,m.longitude)):[];if(located.length){const geo=await geocodePlace(label).catch(()=>null);if(geo)return{kind,id,record,label,latitude:geo.latitude,longitude:geo.longitude,journeyId:id};const m=located[0];return{kind,id,record,label,latitude:Number(m.latitude),longitude:Number(m.longitude),journeyId:id};}}catch{}
  }
  const geo=await geocodePlace(label);if(!geo)throw new Error('Pin this place on the map first so Discover can use the right location.');
  return{kind,id,record,label,latitude:geo.latitude,longitude:geo.longitude,journeyId:kind==='journey'?id:record.journeyId};
}
async function fetchWikipediaPlace(ctx){
  const url=new URL('https://en.wikipedia.org/w/api.php');
  url.search=new URLSearchParams({action:'query',generator:'geosearch',ggsprimary:'all',ggsnamespace:'0',ggsradius:'10000',ggslimit:'8',ggscoord:`${ctx.latitude}|${ctx.longitude}`,prop:'extracts|pageimages|info|coordinates',exintro:'1',explaintext:'1',exsentences:'6',piprop:'thumbnail',pithumbsize:'900',inprop:'url',format:'json',origin:'*'});
  const data=await placeFetchJson(url.toString(),{},12000);
  const pages=Object.values(data.query?.pages||{}).filter(p=>p.extract);
  pages.sort((a,b)=>placeMatchScore(b.title,ctx.label)-placeMatchScore(a.title,ctx.label)||(a.index||99)-(b.index||99));
  const primary=pages[0]||null;
  return{primary,related:pages.slice(1,5).map(p=>({title:p.title,url:p.fullurl||`https://en.wikipedia.org/?curid=${p.pageid}`}))};
}
function osmPoint(element){
  const lat=element.lat??element.center?.lat,lng=element.lon??element.center?.lon;
  return validPoint(lat,lng)?{latitude:Number(lat),longitude:Number(lng)}:null;
}
function osmCategory(tags={}){
  if(['hotel','hostel','guest_house','motel','apartment','chalet'].includes(tags.tourism))return'stay';
  if(['restaurant','cafe','pub','bar','fast_food'].includes(tags.amenity))return'food';
  return'explore';
}
function osmTypeLabel(tags={}){
  const value=tags.tourism||tags.historic||tags.leisure||tags.amenity||'place';
  return String(value).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
}
async function fetchNearbyPlaces(ctx){
  const lat=ctx.latitude,lng=ctx.longitude;
  const query=`[out:json][timeout:14];(nwr(around:3500,${lat},${lng})[name][tourism~"attraction|museum|viewpoint|gallery|artwork|hotel|hostel|guest_house|motel|apartment|chalet"];nwr(around:3500,${lat},${lng})[name][historic];nwr(around:3500,${lat},${lng})[name][leisure~"park|garden"];nwr(around:2500,${lat},${lng})[name][amenity~"place_of_worship|theatre|arts_centre|restaurant|cafe|pub|bar"];);out center tags 90;`;
  const url='https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query);
  const data=await placeFetchJson(url,{},16000);
  const seen=new Set(),items=[];
  (data.elements||[]).forEach(el=>{
    const p=osmPoint(el),name=String(el.tags?.name||'').trim();if(!p||!name)return;
    const key=name.toLowerCase();if(seen.has(key))return;seen.add(key);
    const distance=placeDistanceKm(lat,lng,p.latitude,p.longitude),tags=el.tags||{};
    items.push({name,latitude:p.latitude,longitude:p.longitude,distance,category:osmCategory(tags),type:osmTypeLabel(tags),website:tags.website||tags['contact:website']||'',description:tags.description||'',opening:tags.opening_hours||''});
  });
  items.sort((a,b)=>a.distance-b.distance);
  return{explore:items.filter(x=>x.category==='explore').slice(0,6),food:items.filter(x=>x.category==='food').slice(0,4),stay:items.filter(x=>x.category==='stay').slice(0,5)};
}
async function loadPlaceIntelligence(ctx){
  const key=placeCacheKey(ctx.latitude,ctx.longitude,ctx.label),cached=readPlaceCache(key);if(cached)return cached;
  const [wiki,nearby]=await Promise.allSettled([fetchWikipediaPlace(ctx),fetchNearbyPlaces(ctx)]);
  const data={wiki:wiki.status==='fulfilled'?wiki.value:{primary:null,related:[]},nearby:nearby.status==='fulfilled'?nearby.value:{explore:[],food:[],stay:[]}};
  writePlaceCache(key,data);return data;
}
function suggestionToken(place,ctx){const token='p'+(++placeSuggestionSeq);placeSuggestions.set(token,{...place,journeyId:ctx.journeyId});return token;}
function placeCard(place,ctx,stay=false){
  const token=suggestionToken(place,ctx);
  return `<article class="place-suggestion ${stay?'stay':''}"><div><span class="place-suggestion-type">${esc(place.type)} · ${esc(placeDistanceLabel(place.distance))}</span><strong>${esc(place.name)}</strong>${place.description?`<small>${esc(place.description.slice(0,130))}</small>`:''}</div><button type="button" data-place-add="${token}">${stay?'Save as stop':'Add stop'}</button></article>`;
}
function placeFactsMarkup(primary){
  const facts=placeSentenceFacts(primary?.extract||'');if(!facts.length)return'<p class="place-muted">A short history was not available for this exact point yet.</p>';
  return `<div class="place-facts">${facts.map((fact,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(fact)}</p></div>`).join('')}</div>`;
}
function renderPlaceIntel(modal,ctx,data){
  const host=modal.querySelector('#placeIntelBody');if(!host)return;
  const wiki=data.wiki||{},primary=wiki.primary,nearby=data.nearby||{explore:[],food:[],stay:[]};
  const wikiUrl=primary?.fullurl||primary?.pageid?`https://en.wikipedia.org/?curid=${primary?.pageid}`:'';
  host.innerHTML=`
    <section class="place-hero ${primary?.thumbnail?.source?'has-image':''}" ${primary?.thumbnail?.source?`style="--place-image:url('${esc(primary.thumbnail.source)}')"`:''}>
      <div><span class="eyebrow">DISCOVER THE PLACE</span><h2>${esc(ctx.label)}</h2><p>Understand the place behind the memory — then decide where the footsteps lead next.</p></div>
    </section>
    <nav class="place-intel-tabs" aria-label="Place information"><button class="active" type="button" data-place-tab="story">Story</button><button type="button" data-place-tab="explore">Explore nearby</button><button type="button" data-place-tab="stay">Stay nearby</button></nav>
    <section class="place-tab-panel active" data-place-panel="story">
      <div class="place-section-heading"><span class="eyebrow">THE PLACE BEHIND THE MEMORY</span><h3>${esc(primary?.title||ctx.label)}</h3></div>
      ${primary?.extract?`<p class="place-history">${esc(primary.extract)}</p>`:'<p class="place-muted">We could not load a reliable history summary just now. Your saved memory is unchanged.</p>'}
      <div class="place-section-heading compact"><span class="eyebrow">KEY FACTS</span><h3>Worth knowing</h3></div>${placeFactsMarkup(primary)}
      ${wiki.related?.length?`<div class="place-related"><span>Nearby stories</span>${wiki.related.map(p=>`<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} ↗</a>`).join('')}</div>`:''}
      ${primary?`<p class="place-source">History summary: Wikipedia · <a href="${esc(wikiUrl)}" target="_blank" rel="noopener">read source ↗</a></p>`:''}
    </section>
    <section class="place-tab-panel" data-place-panel="explore">
      <div class="place-section-heading"><span class="eyebrow">EXPLORE NEARBY</span><h3>What else is around here?</h3><p>Turn a discovered place into the next stop on this journey.</p></div>
      <div class="place-suggestion-list">${nearby.explore?.length?nearby.explore.map(p=>placeCard(p,ctx)).join(''):'<p class="place-muted">No nearby attractions were returned just now.</p>'}</div>
      ${nearby.food?.length?`<div class="place-section-heading compact"><span class="eyebrow">EAT & PAUSE</span><h3>Nearby food stops</h3></div><div class="place-suggestion-list">${nearby.food.map(p=>placeCard(p,ctx)).join('')}</div>`:''}
      <p class="place-source">Nearby places: OpenStreetMap contributors via Overpass.</p>
    </section>
    <section class="place-tab-panel" data-place-panel="stay">
      <div class="place-section-heading"><span class="eyebrow">STAY NEARBY</span><h3>Possible places to stay</h3><p>These are nearby accommodation locations, not live room availability or prices.</p></div>
      <div class="place-suggestion-list">${nearby.stay?.length?nearby.stay.map(p=>placeCard(p,ctx,true)).join(''):'<p class="place-muted">No nearby accommodation was returned just now.</p>'}</div>
      <div class="place-live-note"><span>COMING NEXT</span><strong>Live travel planning</strong><p>Availability, pricing and booking links can sit here once we connect a live travel provider.</p></div>
      <p class="place-source">Accommodation locations: OpenStreetMap contributors via Overpass.</p>
    </section>`;
}
window.muOpenPlaceIntelligence=async function(kind,id){
  const record=contextRecord(kind,id);if(!record)return;
  const modal=mountDialog('placeIntelModal',`<button class="close" type="button" onclick="closeModal('placeIntelModal')">×</button><div id="placeIntelBody"><div class="place-intel-loading"><span>⌖</span><h2>Discovering this place…</h2><p>Finding its story and what surrounds it.</p></div></div>`,'place-intel-modal');
  try{const ctx=await resolvePlaceContext(kind,id);const data=await loadPlaceIntelligence(ctx);if(modal.isConnected)renderPlaceIntel(modal,ctx,data);}
  catch(error){const host=modal.querySelector('#placeIntelBody');if(host)host.innerHTML=`<div class="place-intel-error"><span>⌖</span><h2>We need a clearer location.</h2><p>${esc(error.message||'This place could not be discovered just now.')}</p><button class="secondary" type="button" onclick="closeModal('placeIntelModal')">Back to the memory</button></div>`;}
};
function injectDiscoverButton(kind,id){
  const modal=document.getElementById(kind==='journey'?'journeyDetailModal':'memoryDetailModal'),content=modal?.querySelector('.detail-content');if(!content||content.querySelector('[data-place-intel]'))return;
  const record=contextRecord(kind,id);if(!record)return;
  const panel=document.createElement('section');panel.className='discover-place-callout';panel.innerHTML=`<div><span class="eyebrow">BEYOND THE MEMORY</span><h3>Discover this place</h3><p>Explore the history, nearby places and possible stays around ${esc(record.location||'this location')}.</p></div><button type="button" class="secondary" data-place-intel="${kind}" data-place-id="${esc(id)}">Discover the place ↗</button>`;
  const story=content.querySelector('.journey-story-card,.story-text');if(story?.parentElement)story.parentElement.insertBefore(panel,story.nextSibling);else content.appendChild(panel);
}
function installPlaceHooks(){
  if(typeof openMemory==='function'&&!openMemory.__muPlaceIntel){const base=openMemory;const wrapped=function(id){const r=base(id);queueMicrotask(()=>injectDiscoverButton('memory',id));return r;};wrapped.__muPlaceIntel=true;openMemory=wrapped;}
  if(typeof openJourney==='function'&&!openJourney.__muPlaceIntel){const base=openJourney;const wrapped=function(id){const r=base(id);queueMicrotask(()=>injectDiscoverButton('journey',id));return r;};wrapped.__muPlaceIntel=true;openJourney=wrapped;}
}
installPlaceHooks();
document.addEventListener('click',event=>{
  const discover=event.target.closest('[data-place-intel]');if(discover){event.preventDefault();muOpenPlaceIntelligence(discover.dataset.placeIntel,discover.dataset.placeId);return;}
  const tab=event.target.closest('[data-place-tab]');if(tab){const modal=tab.closest('#placeIntelModal');modal?.querySelectorAll('[data-place-tab]').forEach(b=>b.classList.toggle('active',b===tab));modal?.querySelectorAll('[data-place-panel]').forEach(p=>p.classList.toggle('active',p.dataset.placePanel===tab.dataset.placeTab));return;}
  const add=event.target.closest('[data-place-add]');if(add){const suggestion=placeSuggestions.get(add.dataset.placeAdd);if(!suggestion)return;closeModal('placeIntelModal');addMemory(suggestion.journeyId);$('memoryTitle').value=suggestion.name;$('memoryLocation').value=suggestion.name;draftMemoryPoint={latitude:suggestion.latitude,longitude:suggestion.longitude};$('memoryLocationStatus').textContent=`✓ ${suggestion.name} added as a planned stop. Exact map position is ready to save.`;toast('Suggested place added to your journey form.');}
});
})();
