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
  const desktop=document.querySelector('.dash-live');
  if(desktop){
    let section=desktop.querySelector('.dash-discover-place');
    if(!section){section=document.createElement('section');section.className='dash-discover-place';const actions=desktop.querySelector('.dash-actions');actions?.insertAdjacentElement('afterend',section);}
    if(section)section.innerHTML=`<div class="dash-discover-copy"><span class="eyebrow">DISCOVER</span><h2>Where will your story go next?</h2><p>Explore iconic places, dream destinations and bucket-list ideas — separate from the journeys you've already made.</p></div><button type="button" class="dash-discover-button" data-mu-tool="discover"><span>⌖</span><b>Explore Bucket List Places</b><small>Find inspiration for your next journey →</small></button>`;
  }
  const home=document.getElementById('home');
  if(home){
    let mobile=home.querySelector('.home-discover-place');
    if(!mobile){mobile=document.createElement('section');mobile.className='home-discover-place';const grid=home.querySelector('.grid');grid?.insertAdjacentElement('afterend',mobile);}
    if(mobile)mobile.innerHTML=`<span class="eyebrow">DISCOVER</span><h2>Bucket List Places</h2><p>Iconic destinations, future ideas and places you'd love to experience.</p><button type="button" class="secondary" data-mu-tool="discover">Explore destinations →</button>`;
  }
}
function renderDiscoverChip(){
  let chip=document.getElementById('appDiscoverChip');
  if(!chip){chip=document.createElement('button');chip.id='appDiscoverChip';chip.type='button';chip.className='app-discover-chip';document.body.appendChild(chip);}
  delete chip.dataset.homeDiscoverKind;delete chip.dataset.homeDiscoverId;
  chip.dataset.muTool='discover';
  chip.innerHTML=`<span class="discover-chip-icon">⌖</span><span><small>DISCOVER</small><strong>Bucket List Places</strong></span><span class="discover-chip-arrow">→</span>`;
}
function refresh(){
  if(discoverQueued)return;discoverQueued=true;
  requestAnimationFrame(()=>{discoverQueued=false;renderAuthoritativeHome();renderDiscoverCard();renderDiscoverChip();});
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-home-discover-kind]');
  if(!button)return;
  event.preventDefault();event.stopPropagation();
  if(typeof window.muOpenVegasDiscover==='function')window.muOpenVegasDiscover();
  else if(typeof window.muOpenDiscoverHub==='function')window.muOpenDiscoverHub();
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