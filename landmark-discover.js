/* Memories Unlocked — Discover guides for inspirational landmark cards. */
(function(){
if(window.__muLandmarkDiscoverLoaded)return;
window.__muLandmarkDiscoverLoaded=true;

const CACHE_HOURS=12;
const PLACES={
  Rome:{label:'Rome, Italy',wiki:'Rome',lat:41.9028,lng:12.4964},
  Paris:{label:'Paris, France',wiki:'Paris',lat:48.8566,lng:2.3522},
  London:{label:'London, England',wiki:'London',lat:51.5074,lng:-0.1278},
  'New York':{label:'New York City, USA',wiki:'New York City',lat:40.7128,lng:-74.0060},
  Athens:{label:'Athens, Greece',wiki:'Athens',lat:37.9838,lng:23.7275},
  'Cinque Terre':{label:'Cinque Terre, Italy',wiki:'Cinque Terre',lat:44.1461,lng:9.6540}
};

const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
function cacheKey(place){return `mu_landmark_discover_v1:${place.wiki}`;}
function readCache(place){try{const value=JSON.parse(localStorage.getItem(cacheKey(place))||'null');if(value&&Date.now()-value.saved<CACHE_HOURS*3600000)return value.data;}catch{}return null;}
function writeCache(place,data){try{localStorage.setItem(cacheKey(place),JSON.stringify({saved:Date.now(),data}));}catch{}}
async function fetchJson(url,options={},timeout=14000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error(`Request failed ${response.status}`);return await response.json();}
  finally{clearTimeout(timer);}
}
function distanceKm(a,b,c,d){
  const r=6371,toRad=v=>Number(v)*Math.PI/180;
  const dLat=toRad(c-a),dLon=toRad(d-b),lat1=toRad(a),lat2=toRad(c);
  const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(x));
}
function distanceLabel(km){return km<1?`${Math.max(50,Math.round(km*1000/50)*50)} m away`:`${km.toFixed(km<10?1:0)} km away`;}
function facts(text){return String(text||'').replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+/).filter(sentence=>sentence.length>35).slice(0,3);}

async function fetchWiki(place){
  const url=new URL('https://en.wikipedia.org/w/api.php');
  url.search=new URLSearchParams({action:'query',titles:place.wiki,prop:'extracts|pageimages|info',exintro:'1',explaintext:'1',exsentences:'7',piprop:'thumbnail',pithumbsize:'1000',inprop:'url',format:'json',origin:'*'});
  const data=await fetchJson(url.toString(),{},12000);
  return Object.values(data.query?.pages||{})[0]||null;
}
function osmPoint(el){const lat=el.lat??el.center?.lat,lng=el.lon??el.center?.lon;return Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))?{lat:Number(lat),lng:Number(lng)}:null;}
function typeLabel(tags={}){const value=tags.tourism||tags.historic||tags.leisure||tags.amenity||'place';return String(value).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
async function fetchNearby(place){
  const {lat,lng}=place;
  const query=`[out:json][timeout:14];(nwr(around:3500,${lat},${lng})[name][tourism~"attraction|museum|viewpoint|gallery|artwork|hotel|hostel|guest_house|motel|apartment|chalet"];nwr(around:3500,${lat},${lng})[name][historic];nwr(around:3500,${lat},${lng})[name][leisure~"park|garden"];nwr(around:2500,${lat},${lng})[name][amenity~"place_of_worship|theatre|arts_centre|restaurant|cafe|pub|bar"];);out center tags 90;`;
  const data=await fetchJson('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query),{},16000);
  const seen=new Set(),items=[];
  (data.elements||[]).forEach(el=>{
    const point=osmPoint(el),name=String(el.tags?.name||'').trim();if(!point||!name)return;
    const key=name.toLowerCase();if(seen.has(key))return;seen.add(key);
    const tags=el.tags||{},tourism=tags.tourism||'',amenity=tags.amenity||'';
    const category=['hotel','hostel','guest_house','motel','apartment','chalet'].includes(tourism)?'stay':['restaurant','cafe','pub','bar','fast_food'].includes(amenity)?'food':'explore';
    items.push({name,type:typeLabel(tags),distance:distanceKm(lat,lng,point.lat,point.lng),category});
  });
  items.sort((a,b)=>a.distance-b.distance);
  return{explore:items.filter(x=>x.category==='explore').slice(0,7),food:items.filter(x=>x.category==='food').slice(0,5),stay:items.filter(x=>x.category==='stay').slice(0,6)};
}
async function loadGuide(place){
  const cached=readCache(place);if(cached)return cached;
  const [wikiResult,nearbyResult]=await Promise.allSettled([fetchWiki(place),fetchNearby(place)]);
  const data={wiki:wikiResult.status==='fulfilled'?wikiResult.value:null,nearby:nearbyResult.status==='fulfilled'?nearbyResult.value:{explore:[],food:[],stay:[]}};
  writeCache(place,data);return data;
}
function factMarkup(wiki){
  const rows=facts(wiki?.extract||'');
  if(!rows.length)return'<p class="place-muted">A short fact summary was not available just now.</p>';
  return `<div class="place-facts">${rows.map((fact,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${escapeHtml(fact)}</p></div>`).join('')}</div>`;
}
function listMarkup(items,empty){
  if(!items?.length)return `<p class="place-muted">${escapeHtml(empty)}</p>`;
  return `<div class="place-suggestion-list">${items.map(item=>`<article class="place-suggestion"><div><span class="place-suggestion-type">${escapeHtml(item.type)} · ${escapeHtml(distanceLabel(item.distance))}</span><strong>${escapeHtml(item.name)}</strong></div></article>`).join('')}</div>`;
}
function render(modal,place,data){
  const host=modal.querySelector('#placeIntelBody');if(!host)return;
  const wiki=data.wiki||{},nearby=data.nearby||{explore:[],food:[],stay:[]};
  const source=wiki.fullurl||(wiki.pageid?`https://en.wikipedia.org/?curid=${wiki.pageid}`:'');
  host.innerHTML=`
    <section class="place-hero ${wiki.thumbnail?.source?'has-image':''}" ${wiki.thumbnail?.source?`style="--place-image:url('${escapeHtml(wiki.thumbnail.source)}')"`:''}>
      <div><span class="eyebrow">PLACES THAT INSPIRE</span><h2>${escapeHtml(place.label)}</h2><p>Discover the story, nearby highlights and places to stay — then turn inspiration into your next journey.</p><button class="landmark-start-journey" type="button" data-landmark-start="${escapeHtml(place.wiki)}">Start a Journey Here →</button></div>
    </section>
    <nav class="place-intel-tabs" aria-label="Place information"><button class="active" type="button" data-place-tab="story">Story</button><button type="button" data-place-tab="explore">Explore nearby</button><button type="button" data-place-tab="stay">Stay nearby</button></nav>
    <section class="place-tab-panel active" data-place-panel="story">
      <div class="place-section-heading"><span class="eyebrow">DISCOVER THE PLACE</span><h3>${escapeHtml(wiki.title||place.wiki)}</h3></div>
      ${wiki.extract?`<p class="place-history">${escapeHtml(wiki.extract)}</p>`:'<p class="place-muted">A reliable history summary could not be loaded just now.</p>'}
      <div class="place-section-heading compact"><span class="eyebrow">KEY FACTS</span><h3>Worth knowing</h3></div>${factMarkup(wiki)}
      ${source?`<p class="place-source">History summary: Wikipedia · <a href="${escapeHtml(source)}" target="_blank" rel="noopener">read source ↗</a></p>`:''}
    </section>
    <section class="place-tab-panel" data-place-panel="explore">
      <div class="place-section-heading"><span class="eyebrow">EXPLORE NEARBY</span><h3>What else is around here?</h3><p>Landmarks, culture, green spaces and places worth adding to a future journey.</p></div>
      ${listMarkup(nearby.explore,'No nearby attractions were returned just now.')}
      ${nearby.food?.length?`<div class="place-section-heading compact"><span class="eyebrow">EAT & PAUSE</span><h3>Nearby food stops</h3></div>${listMarkup(nearby.food,'')}`:''}
      <p class="place-source">Nearby places: OpenStreetMap contributors via Overpass.</p>
    </section>
    <section class="place-tab-panel" data-place-panel="stay">
      <div class="place-section-heading"><span class="eyebrow">STAY NEARBY</span><h3>Possible places to stay</h3><p>Nearby accommodation locations only — live prices and availability will come from a travel provider later.</p></div>
      ${listMarkup(nearby.stay,'No nearby accommodation was returned just now.')}
      <div class="place-live-note"><span>COMING NEXT</span><strong>Live travel planning</strong><p>Availability, pricing and booking links can sit here once a live travel provider is connected.</p></div>
      <p class="place-source">Accommodation locations: OpenStreetMap contributors via Overpass.</p>
    </section>`;
}
window.muOpenLandmarkDiscover=async function(name){
  const place=PLACES[name];if(!place)return;
  if(typeof mountDialog!=='function'){window.toast?.('Discover is still loading. Try again in a moment.');return;}
  const modal=mountDialog('placeIntelModal',`<button class="close" type="button" onclick="closeModal('placeIntelModal')">×</button><div id="placeIntelBody"><div class="place-intel-loading"><span>⌖</span><h2>Discovering ${escapeHtml(place.label)}…</h2><p>Finding its story and what surrounds it.</p></div></div>`,'place-intel-modal landmark-discover-modal');
  try{const data=await loadGuide(place);if(modal.isConnected)render(modal,place,data);}
  catch(error){const host=modal.querySelector('#placeIntelBody');if(host)host.innerHTML=`<div class="place-intel-error"><span>⌖</span><h2>This guide could not load just now.</h2><p>${escapeHtml(error.message||'Please try again in a moment.')}</p><button class="secondary" type="button" onclick="closeModal('placeIntelModal')">Back</button></div>`;}
};

document.addEventListener('click',event=>{
  const landmark=event.target.closest('[data-landmark-discover]');
  if(landmark){event.preventDefault();window.muOpenLandmarkDiscover(landmark.dataset.landmarkDiscover);return;}
  const start=event.target.closest('[data-landmark-start]');
  if(start){
    const place=PLACES[start.dataset.landmarkStart];if(!place)return;
    closeModal('placeIntelModal');openModal('journeyModal');
    const title=document.getElementById('title'),location=document.getElementById('location'),story=document.getElementById('story');
    if(title&&!title.value)title.value=`${place.wiki} Journey`;
    if(location)location.value=place.label;
    if(story&&!story.value)story.value=`A journey inspired by ${place.label}.`;
    window.toast?.(`${place.label} is ready in your journey form.`);
  }
});
})();