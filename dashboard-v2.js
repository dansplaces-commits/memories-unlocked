/* Desktop dashboard adapter: uses the existing journeys/memories and existing actions. */
function dashboardCloudText(){
  const current=$('cloudStatus')?.textContent||'☁️ Connecting your memories…';
  const anonymous=typeof cloudUser!=='undefined'&&cloudUser?.is_anonymous;
  if(anonymous&&!journeys.length&&!memories.length)return '☁️ Test preview ready · sign in to Account to load your trips';
  return current;
}

function renderDesktopDashboard(){
  const host=document.querySelector('.desktop-dashboard');
  if(!host)return;
  const placeCount=new Set(memories.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;
  const recent=memories.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const recentHtml=recent.length?recent.map(m=>memoryBlock(m)).join(''):'<div class="empty">Your pinned memories will appear here.</div>';
  host.innerHTML=`<main class="dash-main"><section class="dash-hero"><div class="welcome">WELCOME BACK, DAN</div><h1>Every place<br>has a story.</h1><p class="tagline">Dream it. Plan it. Experience it. Remember it. Pass it on.</p><div class="dash-cloud">${esc(dashboardCloudText())}</div><div class="dash-script">Collect<br>Moments<br>Not Things</div></section><section class="dash-stats"><div class="dash-stat"><strong>${journeys.length}</strong><span>${journeys.length===1?'Journey':'Journeys'}</span></div><div class="dash-stat"><strong>${memories.length}</strong><span>${memories.length===1?'Memory':'Memories'}</span></div><div class="dash-stat"><strong>${placeCount}</strong><span>${placeCount===1?'Place':'Places'}</span></div><div class="dash-stat"><strong>0</strong><span>Followers</span></div><div class="dash-quote">“Not all those who wander are lost.”<br>— J.R.R. Tolkien</div></section><section class="dash-actions"><button class="dash-action navy" onclick="openModal('journeyModal')"><span class="dash-icon">⊞</span><span><strong>Create Journey</strong><br><small>Start a new adventure</small></span></button><button class="dash-action gold" onclick="addMemory()"><span class="dash-icon">⌖</span><span><strong>Add Memory</strong><br><small>Capture a special moment</small></span></button><button class="dash-action teal" onclick="showView('map')"><span class="dash-icon">▱</span><span><strong>View My Map</strong><br><small>See your journey unfold</small></span></button><button class="dash-action cream" onclick="showView('follow')"><span class="dash-icon">➤</span><span><strong>Follow</strong><br><small>Discover and follow</small></span></button></section><div class="dash-section-title"><h2>Recent Memories</h2><span>View all ›</span></div><section class="dash-recent">${recentHtml}</section></main><aside class="dash-widgets"><h2>Explore Memories+</h2><p>The whole journey, in one place</p>${experienceCard('📌','Pin Studio','Create custom map pins and collections','PLUS')}${experienceCard('✈️','Holiday Builder','Flights, hotels, itinerary, budget & packing','PLUS')}${experienceCard('🎨','Journey Themes','Skins and styles for every adventure','FREE + PLUS')}${experienceCard('📖','Memory Books','Turn a journey into a keepsake','PLUS')}${experienceCard('🔐','Legacy Vault','Save messages and memories for the future','PLUS')}${experienceCard('👨‍👩‍👧‍👦','Family Circle','Share journeys with the people you love','PLUS')}${experienceCard('🌍','Dream Journeys','Build your bucket list and future trips','FREE')}${experienceCard('🧭','Footsteps','Retrace and continue someone’s journey','FREE')}${experienceCard('🗓️','Travel Timeline','See a lifetime of journeys in one story','FREE')}${experienceCard('✨','Story Builder','Shape notes and photos into a travel story','PLUS')}<button class="widget-card widget-all" onclick="toast('The full Memories+ experience hub is being built.')"><span class="wi">＋</span><span><strong>Explore the whole package</strong><small>Weather, currency, countdowns and world clocks will live inside your trips.</small></span><span class="widget-arrow">›</span></button><p class="widget-note">FREE = included core experience · PLUS = premium package. No purchases are active yet.</p></aside>`;
}

function experienceCard(icon,title,copy,badge){return `<button class="widget-card" onclick="toast('${esc(title)} is now on the Memories Unlocked roadmap.')"><span class="wi">${icon}</span><span><strong>${esc(title)}</strong><small>${esc(copy)}</small><b>${esc(badge)}</b></span><span class="widget-arrow">›</span></button>`;}

window.addEventListener('DOMContentLoaded',()=>{
  const home=$('home');
  if(home&&!home.querySelector('.desktop-dashboard')){
    const dash=document.createElement('div');
    dash.className='desktop-dashboard';
    home.prepend(dash);
  }
  renderDesktopDashboard();

  /* The cloud load happens after the first desktop paint. Observe the hidden source
     lists/status so the visible dashboard refreshes as soon as synced trips arrive. */
  let queued=false;
  const refresh=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;renderDesktopDashboard();});
  };
  const observer=new MutationObserver(refresh);
  ['journeyList','recentMemories','cloudStatus'].forEach(id=>{
    const node=$(id);
    if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});
  });
});
