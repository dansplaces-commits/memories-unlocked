/* Memories Unlocked — curated Discover / bucket-list hub. */
(function(){
if(window.__muDiscoverDestinations)return;window.__muDiscoverDestinations=true;
const safe=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DESTS=[
 {id:'las-vegas',name:'Las Vegas',region:'Nevada, USA',wiki:'Las Vegas',imageWiki:'Las Vegas Strip',tag:'ICONIC CITY',theme:'city'},
 {id:'rome',name:'Rome',region:'Italy',wiki:'Rome',imageWiki:'Colosseum',tag:'HISTORY & CULTURE',theme:'heritage'},
 {id:'bahamas',name:'Bahamas',region:'Caribbean',wiki:'The Bahamas',imageWiki:'Exuma',tag:'ISLAND ESCAPE',theme:'sea'},
 {id:'miami',name:'Miami',region:'Florida, USA',wiki:'Miami',imageWiki:'Miami Beach, Florida',tag:'SUN & ART DECO',theme:'sea'},
 {id:'london',name:'London',region:'England',wiki:'London',imageWiki:'Palace of Westminster',tag:'CITY STORIES',theme:'city'},
 {id:'paris',name:'Paris',region:'France',wiki:'Paris',imageWiki:'Eiffel Tower',tag:'ROMANCE & CULTURE',theme:'heritage'},
 {id:'new-york',name:'New York',region:'USA',wiki:'New York City',imageWiki:'Statue of Liberty',tag:'BIG CITY ENERGY',theme:'city'},
 {id:'venice',name:'Venice',region:'Italy',wiki:'Venice',imageWiki:'Grand Canal (Venice)',tag:'TIMELESS BEAUTY',theme:'heritage'}
];
const icon={
 'las-vegas':`<svg viewBox="0 0 96 78"><path d="M12 26h72l7 15-10 18H15L5 41z"/><path d="M48 3l5 15 16 1-13 9 4 15-12-9-12 9 4-15-13-9 16-1z"/><text x="48" y="40">LAS VEGAS</text><text x="48" y="52">NEVADA</text></svg>`,
 'rome':`<svg viewBox="0 0 96 78"><path d="M13 59V33c0-13 11-22 35-22s35 9 35 22v26"/><path d="M18 31h60M24 24h48M28 18h40M21 59h54"/><path d="M23 59V43h12v16m8 0V40h11v19m8 0V43h11v16"/></svg>`,
 'bahamas':`<svg viewBox="0 0 96 78"><path d="M48 63c-5-20-2-37 7-49M54 19c-10-8-20-8-28-3 10 1 17 5 23 11M55 18c10-7 19-6 26-1-9 1-16 5-22 12M47 40c-9-4-18-2-25 4 10-1 17 1 24 6"/><path d="M15 65c16-8 49-8 67 0"/></svg>`,
 'miami':`<svg viewBox="0 0 96 78"><path d="M15 61V31h19v30M37 61V21h25v40M66 61V35h15v26"/><path d="M18 38h13M18 46h13M42 30h15M42 39h15M42 48h15M70 42h8M70 50h8"/><path d="M18 26c14-12 27-12 39-4"/></svg>`,
 'london':`<svg viewBox="0 0 96 78"><path d="M36 67V20h26v47M41 20V12h16v8M46 12V6h6v6"/><circle cx="49" cy="32" r="7"/><path d="M49 32v-4m0 4 4 3M31 67h37M42 46h14M42 55h14"/></svg>`,
 'paris':`<svg viewBox="0 0 96 78"><path d="M48 7 34 61m14-54 14 54M39 35h18M31 61h34M40 24h16M27 68h42M42 48h12"/></svg>`,
 'new-york':`<svg viewBox="0 0 96 78"><path d="M48 13v39M42 24l6-13 6 13M38 30h20M36 53h24M32 65h32"/><path d="M48 20 37 10m11 10 11-10M38 10l-5 6m26-6 5 6M41 31l-5 18h24l-5-18"/></svg>`,
 'venice':`<svg viewBox="0 0 96 78"><path d="M14 57c17 7 39 7 68 0-8 12-17 16-32 16-16 0-27-5-36-16z"/><path d="M25 57c4-13 13-21 25-21s20 8 22 21M31 38c4-10 10-16 19-16s15 6 19 16M58 19l14 38"/></svg>`
};
function badge(d,size='card'){return `<span class="mu-dest-badge mu-dest-badge-${size} mu-dest-badge-${d.id}" aria-hidden="true"><span class="mu-dest-badge-art">${icon[d.id]||''}</span><b>${safe(d.name)}</b></span>`;}
function saved(){try{return new Set(JSON.parse(localStorage.getItem('mu_bucket_list_v1')||'[]'));}catch{return new Set();}}
function writeSaved(set){try{localStorage.setItem('mu_bucket_list_v1',JSON.stringify([...set]));}catch{}}
function card(d,i){const isSaved=saved().has(d.id);return `<article class="mu-dest-card mu-dest-${d.theme}" data-dest-card="${d.id}">
  <button class="mu-dest-photo" type="button" data-dest-open="${d.id}" data-dest-wiki="${safe(d.imageWiki||d.wiki)}" aria-label="Discover ${safe(d.name)}">
    <span class="mu-dest-photo-shade"></span>${badge(d)}<span class="mu-dest-arrow">→</span>
  </button>
  <div class="mu-dest-copy"><div><small>${safe(d.tag)}</small><strong>${safe(d.name)}</strong><span>${safe(d.region)}</span></div><button type="button" class="mu-dest-heart ${isSaved?'saved':''}" data-dest-save="${d.id}" aria-label="${isSaved?'Remove from':'Add to'} bucket list">${isSaved?'♥':'♡'}</button></div>
 </article>`;}
function miniCard(d){const isSaved=saved().has(d.id);return `<article class="mu-vegas-next-card" data-dest-card="${d.id}">
  <button type="button" class="mu-vegas-next-photo" data-dest-open="${d.id}" data-dest-wiki="${safe(d.imageWiki||d.wiki)}" aria-label="Discover ${safe(d.name)}">
    ${badge(d)}<span class="mu-vegas-next-arrow">→</span>
  </button>
  <div class="mu-vegas-next-copy"><strong>${safe(d.name)}</strong><small>${safe(d.region)}</small><button type="button" class="mu-dest-heart ${isSaved?'saved':''}" data-dest-save="${d.id}" aria-label="${isSaved?'Remove from':'Add to'} bucket list">${isSaved?'♥':'♡'}</button></div>
 </article>`;}
window.muDiscoverFeaturedStrip=function(){return DESTS.filter(d=>d.id!=='las-vegas').slice(0,7).map(miniCard).join('');};
async function hydrateImages(host){
 const cards=[...host.querySelectorAll('[data-dest-wiki]')];
 await Promise.all(cards.map(async el=>{try{const title=el.dataset.destWiki;const url='https://en.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',titles:title,prop:'pageimages',piprop:'thumbnail',pithumbsize:'1000',format:'json',origin:'*'});const data=await fetch(url);if(!data.ok)return;const json=await data.json();const page=Object.values(json.query?.pages||{})[0];const src=page?.thumbnail?.source;if(src&&el.isConnected){el.style.setProperty('--dest-image',`url("${src.replace(/"/g,'%22')}")`);el.classList.add('has-image');}}catch{}}));
}
window.muHydrateDiscoverImages=hydrateImages;
function render(){
 const host=document.getElementById('muDiscoverHubBody');if(!host)return;
 host.innerHTML=`<section class="mu-discover-hub">
  <div class="mu-discover-topbar"><button type="button" class="mu-discover-back" onclick="closeModal('discoverHubModal')" aria-label="Back">‹</button><div class="mu-discover-brand"><span class="mu-discover-lock">▣</span><span>Memories <b>Unlocked</b></span></div><span class="mu-discover-topnote">YOUR NEXT STORY</span></div>
  <header class="mu-discover-hero" data-dest-wiki="Las Vegas Strip"><span class="mu-discover-hero-shade"></span><span class="mu-discover-orbit">⌕</span><div><small>DISCOVER</small><h2>Discover.</h2><p>Iconic places. Dream destinations. Bucket-list ideas. Yours next.</p></div><span class="mu-discover-hero-note">Explore · Dream · Go ♡</span></header>
  <div class="mu-discover-title-row"><div><span>BUCKET-LIST INSPIRATION</span><h3>Featured destinations</h3></div><em>Dream it. Save it. Go.</em></div>
  <div class="mu-dest-grid">${DESTS.map(card).join('')}</div>
  <section class="mu-bucket-strip"><div><small>YOUR BUCKET LIST</small><h3>Save the places that call to you.</h3><p>Tap the heart on any destination. Your dream places stay separate from the journeys and memories you've already made.</p></div><button type="button" data-bucket-filter>Show saved places</button></section>
 </section>`;
 hydrateImages(host);
}
window.muOpenDiscoverHub=function(){
 if(typeof mountDialog!=='function')return;
 const modal=mountDialog('discoverHubModal',`<button class="close" type="button" onclick="closeModal('discoverHubModal')">×</button><div id="muDiscoverHubBody"></div>`,'mu-discover-hub-modal');
 render();return modal;
};
function openDestination(id){
 const d=DESTS.find(x=>x.id===id);if(!d)return;
 closeModal?.('discoverHubModal');closeModal?.('placeIntelModal');
 if(id==='las-vegas'&&typeof window.muOpenVegasDiscover==='function'){window.muOpenVegasDiscover();return;}
 if(typeof window.muOpenLandmarkDiscover==='function'){window.muOpenLandmarkDiscover(d.name);return;}
 window.toast?.('This destination guide is loading. Try once more in a moment.');
}
window.muOpenDiscoverDestination=openDestination;
/* Global Discover route lock */
document.addEventListener('click',e=>{
  const legacy=e.target.closest('[data-home-discover-kind],[data-mu-tool="discover"]');
  if(!legacy||legacy.closest('#discoverHubModal'))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(typeof window.muOpenVegasDiscover==='function')window.muOpenVegasDiscover();else window.muOpenDiscoverHub?.();
},true);
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-dest-open]');if(open){e.preventDefault();openDestination(open.dataset.destOpen);return;}
 const save=e.target.closest('[data-dest-save]');if(save){e.preventDefault();e.stopPropagation();const set=saved(),id=save.dataset.destSave;if(set.has(id)){set.delete(id);save.classList.remove('saved');save.textContent='♡';}else{set.add(id);save.classList.add('saved');save.textContent='♥';}writeSaved(set);window.toast?.(set.has(id)?'Added to your bucket list.':'Removed from your bucket list.');return;}
 const filter=e.target.closest('[data-bucket-filter]');if(filter){const host=filter.closest('.mu-discover-hub'),set=saved(),cards=host?.querySelectorAll('[data-dest-card]')||[];const active=filter.dataset.active==='1';cards.forEach(c=>c.hidden=!active&&!set.has(c.dataset.destCard));filter.dataset.active=active?'0':'1';filter.textContent=active?'Show saved places':'Show all destinations';}
});
})();