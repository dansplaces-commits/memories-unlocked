/* Memories Unlocked — visible Discover surface + authoritative active Home feed. */
(function(){
let discoverQueued=false;
function activeJourneys(){return (typeof journeys!=='undefined'?journeys:[]).filter(j=>!j?.archived);}
function activeMemories(){
  const ids=new Set(activeJourneys().map(j=>String(j.id)));
  return (typeof memories!=='undefined'?memories:[]).filter(m=>!m?.archived&&ids.has(String(m.journeyId)));
}
function latestActive(){
  const ms=activeMemories().filter(m=>m?.location).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(ms.length)return{kind:'memory',id:ms[0].id,label:ms[0].location,title:ms[0].title||'Latest memory'};
  const js=activeJourneys().filter(j=>j?.location);
  if(js.length)return{kind:'journey',id:js[0].id,label:js[0].location,title:js[0].title||'Latest journey'};
  return null;
}
function renderAuthoritativeHome(){
  const ms=activeMemories(),js=activeJourneys();
  const recent=ms.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const dashRecent=document.querySelector('.dash-recent');
  if(dashRecent&&typeof memoryBlock==='function')dashRecent.innerHTML=recent.length?recent.map(m=>memoryBlock(m)).join(''):'<div class="empty">Your active memories will appear here.</div>';
  const nativeRecent=document.getElementById('recentMemories');
  if(nativeRecent&&typeof memoryBlock==='function')nativeRecent.innerHTML=ms.length?ms.slice(0,5).map(m=>memoryBlock(m)).join(''):'<div class="empty">Your active memories will appear here.</div>';
  const stats=document.querySelectorAll('.dash-stats .dash-stat');
  if(stats[0]){stats[0].querySelector('strong').textContent=js.length;stats[0].querySelector('span').textContent=js.length===1?'Journey':'Journeys';}
  if(stats[1]){stats[1].querySelector('strong').textContent=ms.length;stats[1].querySelector('span').textContent=ms.length===1?'Memory':'Memories';}
  if(stats[2]){const n=new Set(ms.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;stats[2].querySelector('strong').textContent=n;stats[2].querySelector('span').textContent=n===1?'Place':'Places';}
  const storyJourney=document.getElementById('journeyCount'),storyMemory=document.getElementById('memoryCount'),storyPlace=document.getElementById('placeCount');
  if(storyJourney)storyJourney.textContent=`${js.length} ${js.length===1?'Journey':'Journeys'}`;
  if(storyMemory)storyMemory.textContent=`${ms.length} ${ms.length===1?'Memory':'Memories'}`;
  if(storyPlace){const n=new Set(ms.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;storyPlace.textContent=`${n} ${n===1?'Place':'Places'}`;}
}
function renderDiscoverCard(){
  const place=latestActive();
  const desktop=document.querySelector('.dash-live');
  if(desktop){
    let section=desktop.querySelector('.dash-discover-place');
    if(!section){section=document.createElement('section');section.className='dash-discover-place';const actions=desktop.querySelector('.dash-actions');actions?.insertAdjacentElement('afterend',section);}
    if(section){
      if(place)section.innerHTML=`<div class="dash-discover-copy"><span class="eyebrow">DISCOVER THE PLACE</span><h2>Go beyond the memory.</h2><p>History, key facts, nearby places and possible stays around <strong>${esc(place.label)}</strong>.</p></div><button type="button" class="dash-discover-button" data-home-discover-kind="${place.kind}" data-home-discover-id="${esc(place.id)}"><span>⌖</span><b>Discover ${esc(place.label)}</b><small>Explore the place behind the story →</small></button>`;
      else section.innerHTML=`<div class="dash-discover-copy"><span class="eyebrow">DISCOVER THE PLACE</span><h2>Your next place starts here.</h2><p>Create a journey or memory with a location and Memories Unlocked will help you understand and explore it.</p></div>`;
    }
  }
  const home=document.getElementById('home');
  if(home){
    let mobile=home.querySelector('.home-discover-place');
    if(!mobile){mobile=document.createElement('section');mobile.className='home-discover-place';const grid=home.querySelector('.grid');grid?.insertAdjacentElement('afterend',mobile);}
    if(mobile&&place)mobile.innerHTML=`<span class="eyebrow">DISCOVER THE PLACE</span><h2>${esc(place.label)}</h2><p>See the history, key facts and nearby places behind this story.</p><button type="button" class="secondary" data-home-discover-kind="${place.kind}" data-home-discover-id="${esc(place.id)}">Discover this place →</button>`;
  }
}
function renderDiscoverChip(){
  const place=latestActive();
  let chip=document.getElementById('appDiscoverChip');
  if(!place){chip?.remove();return;}
  if(!chip){chip=document.createElement('button');chip.id='appDiscoverChip';chip.type='button';chip.className='app-discover-chip';document.body.appendChild(chip);}
  chip.dataset.homeDiscoverKind=place.kind;chip.dataset.homeDiscoverId=String(place.id);
  chip.innerHTML=`<span class="discover-chip-icon">⌖</span><span><small>DISCOVER</small><strong>${esc(place.label)}</strong></span><span class="discover-chip-arrow">→</span>`;
}
function refresh(){
  if(discoverQueued)return;discoverQueued=true;
  requestAnimationFrame(()=>{discoverQueued=false;renderAuthoritativeHome();renderDiscoverCard();renderDiscoverChip();});
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-home-discover-kind]');
  if(!button)return;
  event.preventDefault();event.stopPropagation();
  if(typeof window.muOpenPlaceIntelligence==='function')window.muOpenPlaceIntelligence(button.dataset.homeDiscoverKind,button.dataset.homeDiscoverId);
  else if(typeof toast==='function')toast('Discover is loading. Refresh this preview once and try again.');
},true);
const observer=new MutationObserver(refresh);
window.addEventListener('DOMContentLoaded',()=>{
  ['home','journeyList','recentMemories','allJourneys','cloudStatus'].forEach(id=>{const node=document.getElementById(id);if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});});
  refresh();
},{once:true});
if(document.readyState!=='loading')refresh();
window.muRefreshDiscoverSurface=refresh;
})();