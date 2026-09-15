/* Desktop dashboard adapter: website-inspired presentation using existing app data/actions. */
function dashboardCloudText(){
  const current=$('cloudStatus')?.textContent||'☁️ Connecting your memories…';
  const anonymous=typeof cloudUser!=='undefined'&&cloudUser?.is_anonymous;
  if(anonymous&&!journeys.length&&!memories.length)return '☁️ Test preview ready · sign in to Account to load your trips';
  return current;
}

function dashboardFeaturedJourney(){
  if(!journeys.length)return null;
  return journeys.slice().sort((a,b)=>String(b.start||'').localeCompare(String(a.start||'')))[0]||journeys[0];
}

function storyPreview(){
  const featured=dashboardFeaturedJourney();
  const recent=memories.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const title=featured?.title||'Your next chapter';
  const location=featured?.location||'Somewhere meaningful';
  const year=featured?.start?.slice(0,4)||'Dream · Plan · Remember';
  const memoryRows=recent.length?recent.map((m,i)=>`<div class="story-mini"><span>${i+1}</span><div><strong>${esc(m.title||'Memory')}</strong><small>${esc(m.location||'A place worth remembering')}</small></div></div>`).join(''):`<div class="story-mini"><span>1</span><div><strong>Pin a meaningful place</strong><small>Your memories will build the story here.</small></div></div><div class="story-mini"><span>2</span><div><strong>Add the moment</strong><small>Save the words, place and date.</small></div></div><div class="story-mini"><span>3</span><div><strong>Pass it on</strong><small>Leave a trail your family can follow.</small></div></div>`;
  return `<section class="story-board" aria-label="Journey story preview"><div class="story-board-top"><span>YOUR STORY</span><b>${esc(year)}</b></div><div class="story-board-copy"><small>${esc(location)}</small><h3>${esc(title)}</h3><p>Every journey becomes part of a bigger story.</p></div><div class="story-route" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="story-lock" aria-hidden="true">⌾</div><div class="story-mini-list">${memoryRows}</div><div class="story-board-caption">Turn your journeys into a legacy.</div></section>`;
}

function renderDesktopDashboard(){
  const host=document.querySelector('.desktop-dashboard');
  if(!host)return;
  const placeCount=new Set(memories.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;
  const recent=memories.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const recentHtml=recent.length?recent.map(m=>memoryBlock(m)).join(''):'<div class="empty">Your pinned memories will appear here.</div>';
  host.innerHTML=`
    <section class="dash-showcase">
      <div class="dash-showcase-copy">
        <div class="welcome">MORE THAN A MAP</div>
        <h1>Every place<br>has a story.</h1>
        <p class="dash-lead">Follow the footsteps. Unlock the memories.<br>Leave a trail worth following.</p>
        <div class="dash-showcase-actions">
          <button class="dash-primary" onclick="openModal('journeyModal')">Start Your Journey ›</button>
          <button class="dash-secondary" onclick="showView('follow')">Discover Memories Unlocked</button>
        </div>
        <div class="dash-feature-strip">
          <div><strong>Explore</strong><span>the world</span></div>
          <div><strong>Capture</strong><span>meaningful moments</span></div>
          <div><strong>Share</strong><span>with loved ones</span></div>
          <div><strong>Leave a legacy</strong><span>for the future</span></div>
        </div>
        <div class="dash-cloud">${esc(dashboardCloudText())}</div>
      </div>
      <div class="dash-showcase-art">${storyPreview()}</div>
    </section>

    <section class="dash-stats">
      <div class="dash-stat"><strong>${journeys.length}</strong><span>${journeys.length===1?'Journey':'Journeys'}</span></div>
      <div class="dash-stat"><strong>${memories.length}</strong><span>${memories.length===1?'Memory':'Memories'}</span></div>
      <div class="dash-stat"><strong>${placeCount}</strong><span>${placeCount===1?'Place':'Places'}</span></div>
      <div class="dash-stat"><strong>0</strong><span>Followers</span></div>
      <div class="dash-quote">“Every place has a story worth keeping.”</div>
    </section>

    <section class="dash-actions">
      <button class="dash-action navy" onclick="openModal('journeyModal')"><span class="dash-icon">⊞</span><span><strong>Create Journey</strong><br><small>Start a new adventure</small></span></button>
      <button class="dash-action gold" onclick="addMemory()"><span class="dash-icon">⌖</span><span><strong>Add Memory</strong><br><small>Capture a special moment</small></span></button>
      <button class="dash-action teal" onclick="showView('map')"><span class="dash-icon">▱</span><span><strong>View My Map</strong><br><small>See your journey unfold</small></span></button>
      <button class="dash-action cream" onclick="showView('follow')"><span class="dash-icon">➤</span><span><strong>Follow</strong><br><small>Discover and follow</small></span></button>
    </section>

    <div class="dash-section-title"><h2>Recent Memories</h2><span>View all ›</span></div>
    <section class="dash-recent">${recentHtml}</section>

    <section class="dash-plus">
      <div class="dash-plus-heading"><div><div class="welcome">EXPLORE MORE</div><h2>Memories+</h2></div><p>The whole journey, in one place.</p></div>
      <div class="dash-plus-grid">
        ${experienceCard('📌','Pin Studio','Create custom map pins and collections','PLUS')}
        ${experienceCard('✈️','Holiday Builder','Flights, hotels, itinerary, budget & packing','PLUS')}
        ${experienceCard('🎨','Journey Themes','Skins and styles for every adventure','FREE + PLUS')}
        ${experienceCard('📖','Memory Books','Turn a journey into a keepsake','PLUS')}
        ${experienceCard('🔐','Legacy Vault','Save messages and memories for the future','PLUS')}
        ${experienceCard('👨‍👩‍👧‍👦','Family Circle','Share journeys with the people you love','PLUS')}
      </div>
    </section>`;
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
