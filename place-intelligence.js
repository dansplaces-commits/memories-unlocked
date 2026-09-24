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

function muIsLasVegasContext(ctx){
  const label=[ctx?.label,ctx?.record?.location,ctx?.record?.title].filter(Boolean).join(' ');
  return /\blas\s+vegas\b/i.test(label);
}
function muVegasBadge(size='hero'){
  return `<div class="mu-vegas-badge mu-vegas-badge-${size}" aria-label="Welcome to Fabulous Las Vegas badge">
    <span class="mu-vegas-star">✦</span>
    <span class="mu-vegas-welcome">WELCOME</span>
    <span class="mu-vegas-fabulous">to Fabulous</span>
    <strong>LAS VEGAS</strong>
    <small>NEVADA</small>
    <span class="mu-vegas-palms">♢ ✦ ♢</span>
  </div>`;
}
function muVegasTopNames(items,count=3){
  return (items||[]).slice(0,count).map(item=>item?.name).filter(Boolean);
}
async function fetchVegasEditorialImages(){
  const url=new URL('https://en.wikipedia.org/w/api.php');
  url.search=new URLSearchParams({action:'query',titles:'Las Vegas Strip|Bellagio (resort)|Fremont Street Experience|Red Rock Canyon National Conservation Area|Las Vegas',prop:'pageimages',piprop:'thumbnail',pithumbsize:'1400',format:'json',origin:'*'});
  const data=await placeFetchJson(url.toString(),{},12000);
  const pages=Object.values(data.query?.pages||{});
  const byTitle=title=>pages.find(p=>String(p.title||'').toLowerCase()===title.toLowerCase())?.thumbnail?.source||'';
  return{
    hero:byTitle('Las Vegas Strip')||byTitle('Las Vegas'),
    why:byTitle('Bellagio (resort)')||byTitle('Las Vegas Strip'),
    spots:byTitle('Red Rock Canyon National Conservation Area')||byTitle('Las Vegas Strip'),
    memories:byTitle('Fremont Street Experience')||byTitle('Las Vegas Strip'),
    local:byTitle('Las Vegas')||byTitle('Las Vegas Strip')
  };
}
function muVegasCard(title,copy,cta,kind,photo='strip',image=''){
  return `<button type="button" class="mu-vegas-card mu-vegas-card-${photo}" data-vegas-card="${kind}" ${image?`style="--vegas-card-image:url('${esc(image)}')"`:''}>
    <span class="mu-vegas-card-copy"><strong>${esc(title)}</strong><small>${esc(copy)}</small><b>${esc(cta)} <span>›</span></b></span>
  </button>`;
}
function renderVegasIntel(modal,ctx,data){
  const host=modal.querySelector('#placeIntelBody');if(!host)return;
  modal.classList.add('vegas-discover-modal');
  const wiki=data.wiki||{},primary=wiki.primary,nearby=data.nearby||{explore:[],food:[],stay:[]};
  const editorial=data.vegasImages||{};
  const hero=editorial.hero||primary?.thumbnail?.source||'';
  const topSpots=muVegasTopNames(nearby.explore,3);
  const food=muVegasTopNames(nearby.food,3);
  const source=primary?.fullurl||(primary?.pageid?`https://en.wikipedia.org/?curid=${primary.pageid}`:'');
  const whyCopy=primary?.extract?String(primary.extract).replace(/\s+/g,' ').trim().slice(0,135):'Bright lights, landmark sights and unforgettable experiences make Las Vegas a place built for stories.';
  const spotsCopy=topSpots.length?`From ${topSpots.join(', ')} and more.`:'From the Strip to hidden gems, discover must-see places across Las Vegas.';
  const foodCopy=food.length?`Local favourites include ${food.join(', ')}.`:'Food, neighbourhoods, day trips and local highlights beyond the Strip.';
  host.innerHTML=`
    <section class="mu-vegas-discover" ${hero?`style="--vegas-live-image:url('${esc(hero)}')"`:''}>
      <div class="mu-vegas-topbar"><button type="button" class="mu-vegas-back" onclick="closeModal('placeIntelModal')" aria-label="Back">‹</button><div class="mu-vegas-brand"><span>Memories</span> <b>Unlocked</b></div><button type="button" class="mu-vegas-browse" data-vegas-browse-all>Browse places</button></div>
      <div class="mu-vegas-hero">
        <div class="mu-vegas-hero-shade"></div>
        <span class="mu-vegas-count">1 / 5</span>
        ${muVegasBadge('hero')}
      </div>
      <section class="mu-vegas-title-block">
        ${muVegasBadge('small')}
        <div class="mu-vegas-title-copy">
          <h2>Las Vegas</h2>
          <p><span>●</span> NEVADA, USA</p>
          <div class="mu-vegas-actions">
            <button type="button" data-vegas-save aria-label="Save Las Vegas"><span>♡</span><small>Save</small></button>
            <button type="button" data-vegas-share aria-label="Share Las Vegas"><span>↗</span><small>Share</small></button>
          </div>
          <p class="mu-vegas-intro">Bright lights, iconic sights and unforgettable moments — Las Vegas is a place where every journey becomes a story worth sharing.</p>
        </div>
      </section>
      <section class="mu-vegas-facts">
        <div><span>▣</span><small>Best time to visit</small><strong>Spring & autumn</strong></div>
        <div><span>☀</span><small>Climate</small><strong>Desert sunshine</strong></div>
        <div><span>▧</span><small>Iconic status</small><strong>World famous</strong></div>
        <div><span>●</span><small>Location</small><strong>Nevada, USA</strong></div>
      </section>
      <section class="mu-vegas-grid">
        ${muVegasCard('Why Visit',whyCopy,'Explore Reasons','story','fountains',editorial.why)}
        ${muVegasCard('Top Spots',spotsCopy,'See Top Spots','spots','strip',editorial.spots)}
        ${muVegasCard('Best Memories to Make','Shows, skyline views, luxury stays and once-in-a-lifetime moments.','Start Your Journey','memories','lights',editorial.memories)}
        ${muVegasCard('Local Highlights',foodCopy,'Discover More','local','food',editorial.local)}
      </section>
      <section class="mu-vegas-next-section">
        <div class="mu-vegas-next-head"><div><span>WHERE NEXT?</span><h3>More places to dream about.</h3><p>Save a destination to your bucket list or open it to explore.</p></div><button type="button" data-vegas-browse-all>Browse all</button></div>
        <div class="mu-vegas-next-track">${typeof window.muDiscoverFeaturedStrip==='function'?window.muDiscoverFeaturedStrip():''}</div>
      </section>
      <section class="mu-vegas-more" data-vegas-more hidden>
        <button type="button" class="mu-vegas-more-close" data-vegas-more-close>×</button>
        <span class="eyebrow">DISCOVER LAS VEGAS</span>
        <h3 data-vegas-more-title>Why Visit</h3>
        <div data-vegas-more-body>
          ${primary?.extract?`<p class="place-history">${esc(primary.extract)}</p>`:'<p class="place-muted">More Las Vegas details will appear here as live place information loads.</p>'}
        </div>
        ${source?`<p class="place-source">Place summary: Wikipedia · <a href="${esc(source)}" target="_blank" rel="noopener">read source ↗</a></p>`:''}
      </section>
    </section>`;
  window.muHydrateDiscoverImages?.(host);
  modal.dataset.vegasSource=source;
  modal.dataset.vegasStory=primary?.extract||'';
  modal.dataset.vegasSpots=JSON.stringify((nearby.explore||[]).slice(0,6));
  modal.dataset.vegasFood=JSON.stringify((nearby.food||[]).slice(0,6));
}
function renderPlaceIntel(modal,ctx,data){
  if(muIsLasVegasContext(ctx)){renderVegasIntel(modal,ctx,data);return;}
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
window.muOpenVegasDiscover=async function(){
  const modal=mountDialog('placeIntelModal',`<button class="close" type="button" onclick="closeModal('placeIntelModal')">×</button><div id="placeIntelBody"><div class="place-intel-loading"><span>✦</span><h2>Discovering Las Vegas…</h2><p>Loading the iconic places behind the bright lights.</p></div></div>`,'place-intel-modal vegas-discover-modal');
  const ctx={kind:'discover',id:'las-vegas',label:'Las Vegas, Nevada, USA',record:{title:'Las Vegas',location:'Las Vegas, Nevada, USA'},latitude:36.1699,longitude:-115.1398,journeyId:null};
  try{const [intel,images]=await Promise.all([loadPlaceIntelligence(ctx),fetchVegasEditorialImages().catch(()=>({}))]);intel.vegasImages=images;if(modal.isConnected)renderVegasIntel(modal,ctx,intel);}
  catch(error){const host=modal.querySelector('#placeIntelBody');if(host)host.innerHTML=`<div class="place-intel-error"><span>✦</span><h2>Las Vegas is still here.</h2><p>Live place details could not load just now, but your app data is unchanged.</p><button class="secondary" type="button" onclick="closeModal('placeIntelModal')">Back to Discover</button></div>`;}
};
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
  const vegasBrowse=event.target.closest('[data-vegas-browse-all]');if(vegasBrowse){event.preventDefault();closeModal?.('placeIntelModal');window.muOpenDiscoverHub?.();return;}
  const vegasShare=event.target.closest('[data-vegas-share]');if(vegasShare){event.preventDefault();const modal=vegasShare.closest('#placeIntelModal');const url=modal?.dataset.vegasSource||location.href;const share={title:'Memories Unlocked — Las Vegas',text:'Discover Las Vegas with Memories Unlocked.',url};if(navigator.share){navigator.share(share).catch(()=>{});}else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast?.('Las Vegas link copied.')).catch(()=>{});}return;}
  const vegasSave=event.target.closest('[data-vegas-save]');if(vegasSave){event.preventDefault();try{localStorage.setItem('mu_saved_discover_las_vegas','1');}catch{}vegasSave.classList.add('saved');vegasSave.querySelector('span').textContent='♥';toast?.('Las Vegas saved to Discover.');return;}
  const vegasClose=event.target.closest('[data-vegas-more-close]');if(vegasClose){vegasClose.closest('[data-vegas-more]')?.setAttribute('hidden','');return;}
  const vegasCard=event.target.closest('[data-vegas-card]');if(vegasCard){event.preventDefault();const modal=vegasCard.closest('#placeIntelModal'),panel=modal?.querySelector('[data-vegas-more]'),title=modal?.querySelector('[data-vegas-more-title]'),body=modal?.querySelector('[data-vegas-more-body]');if(!panel||!title||!body)return;const kind=vegasCard.dataset.vegasCard;let heading='Why Visit',html='';if(kind==='story'){heading='Why Visit';html=modal.dataset.vegasStory?`<p class="place-history">${esc(modal.dataset.vegasStory)}</p>`:'<p class="place-muted">Las Vegas is ready to discover.</p>';}else if(kind==='spots'){heading='Top Spots';let items=[];try{items=JSON.parse(modal.dataset.vegasSpots||'[]');}catch{}html=items.length?`<div class="mu-vegas-detail-list">${items.map(x=>`<div><strong>${esc(x.name)}</strong><small>${esc(x.type||'Place')} · ${esc(placeDistanceLabel(x.distance||0))}</small></div>`).join('')}</div>`:'<p class="place-muted">Nearby highlights are still loading.</p>';}else if(kind==='local'){heading='Local Highlights';let items=[];try{items=JSON.parse(modal.dataset.vegasFood||'[]');}catch{}html=items.length?`<div class="mu-vegas-detail-list">${items.map(x=>`<div><strong>${esc(x.name)}</strong><small>${esc(x.type||'Local stop')} · ${esc(placeDistanceLabel(x.distance||0))}</small></div>`).join('')}</div>`:'<p class="place-muted">Local highlights are still loading.</p>';}else{heading='Best Memories to Make';html='<div class="mu-vegas-memory-ideas"><span>🎭 A show you will talk about for years</span><span>🌆 A skyline photograph after dark</span><span>🍽 A meal worth remembering</span><span>🌄 A day trip beyond the Strip</span></div>';}title.textContent=heading;body.innerHTML=html;panel.removeAttribute('hidden');panel.scrollIntoView({behavior:'smooth',block:'start'});return;}
  const discover=event.target.closest('[data-place-intel]');if(discover){event.preventDefault();muOpenPlaceIntelligence(discover.dataset.placeIntel,discover.dataset.placeId);return;}
  const tab=event.target.closest('[data-place-tab]');if(tab){const modal=tab.closest('#placeIntelModal');modal?.querySelectorAll('[data-place-tab]').forEach(b=>b.classList.toggle('active',b===tab));modal?.querySelectorAll('[data-place-panel]').forEach(p=>p.classList.toggle('active',p.dataset.placePanel===tab.dataset.placeTab));return;}
  const add=event.target.closest('[data-place-add]');if(add){const suggestion=placeSuggestions.get(add.dataset.placeAdd);if(!suggestion)return;closeModal('placeIntelModal');addMemory(suggestion.journeyId);$('memoryTitle').value=suggestion.name;$('memoryLocation').value=suggestion.name;draftMemoryPoint={latitude:suggestion.latitude,longitude:suggestion.longitude};$('memoryLocationStatus').textContent=`✓ ${suggestion.name} added as a planned stop. Exact map position is ready to save.`;toast('Suggested place added to your journey form.');}
});
})();
