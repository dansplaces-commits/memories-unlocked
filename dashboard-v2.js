/* Desktop dashboard: visual lock to the approved Memories Unlocked master composition. */
function dashboardCloudText(){
  const current=$('cloudStatus')?.textContent||'☁️ Connecting your memories…';
  const anonymous=typeof cloudUser!=='undefined'&&cloudUser?.is_anonymous;
  if(anonymous&&!journeys.length&&!memories.length)return '☁️ Sign in to Account to load your journeys and memories';
  return current;
}

function renderDesktopDashboard(){
  const host=document.querySelector('.desktop-dashboard');
  if(!host)return;

  const placeCount=new Set(memories.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;
  const recent=memories.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const recentHtml=recent.length?recent.map(m=>memoryBlock(m)).join(''):'<div class="empty">Your pinned memories will appear here.</div>';

  host.innerHTML=`
    <section class="dash-master-hero" aria-label="Memories Unlocked">
      <div class="dash-master-copy">
        <div class="dash-master-kicker">MORE THAN A MAP</div>
        <h1>Every place<br>has a story.</h1>
        <p class="dash-master-lead">Follow the footsteps. Unlock the memories.<br>Leave a trail worth following.</p>

        <div class="dash-master-buttons">
          <button class="dash-master-primary" onclick="openModal('journeyModal')">
            <span class="dash-button-lock">▣</span>
            <span>Start Your Journey</span>
            <span class="dash-button-arrow">→</span>
          </button>
          <button class="dash-master-secondary" onclick="toast('Memories Unlocked video walkthrough coming soon.')">
            <span class="dash-play">▶</span>
            <span>Watch the Video</span>
          </button>
        </div>

        <div class="dash-master-benefits">
          <div><span class="dash-benefit-icon">◈</span><span><b>Explore</b><small>the world</small></span></div>
          <div><span class="dash-benefit-icon">▣</span><span><b>Capture</b><small>meaningful moments</small></span></div>
          <div><span class="dash-benefit-icon">♧</span><span><b>Share</b><small>with loved ones</small></span></div>
          <div><span class="dash-benefit-icon">♡</span><span><b>Leave a legacy</b><small>for the future</small></span></div>
        </div>
      </div>

      <div class="dash-master-art" aria-label="Scenic Memories Unlocked journey artwork">
        <div class="dash-art-sky-mask"></div>
        <div class="dash-art-script">The greatest journeys in life<br>should be shared through generations —<br>and now they can be.</div>
        <div class="dash-art-heart-cover" aria-hidden="true"></div>
      </div>
    </section>

    <section class="dash-how">
      <div class="dash-how-kicker">HOW IT WORKS</div>
      <h2>Turn your journeys into a legacy.</h2>
      <p>A simple way to capture today, and inspire tomorrow.</p>
      <div class="dash-how-grid">
        <button class="dash-how-card c1" onclick="openModal('journeyModal')">
          <i>1</i><span class="dash-how-icon">⌑</span><strong>Create a Journey</strong><small>Add your trips or<br>dream destinations.</small>
        </button>
        <button class="dash-how-card c2" onclick="showView('map')">
          <i>2</i><span class="dash-how-icon">⌖</span><strong>Pin a Place</strong><small>Mark meaningful<br>locations on the map.</small>
        </button>
        <button class="dash-how-card c3" onclick="addMemory()">
          <i>3</i><span class="dash-how-icon">▣</span><strong>Capture the Memory</strong><small>Add photos, stories<br>and special moments.</small>
        </button>
        <button class="dash-how-card c4" onclick="showView('follow')">
          <i>4</i><span class="dash-how-icon">⚿</span><strong>Leave a Clue</strong><small>Add hints, messages<br>or challenges.</small>
        </button>
        <button class="dash-how-card c5" onclick="showView('follow')">
          <i>5</i><span class="dash-how-icon footsteps">♧</span><strong>Follow the Footsteps</strong><small>Retrace the journey<br>and continue the story.</small>
        </button>
      </div>
    </section>

    <section class="dash-live">
      <div class="dash-live-heading">
        <div>
          <div class="dash-live-kicker">YOUR JOURNEYS, YOUR WAY</div>
          <h2>A beautiful way to<br>remember and share.</h2>
        </div>
        <p>${esc(dashboardCloudText())}</p>
      </div>

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
      </section>
    </section>`;
}

function experienceCard(icon,title,copy,badge){
  return `<button class="widget-card" onclick="toast('${esc(title)} is now on the Memories Unlocked roadmap.')"><span class="wi">${icon}</span><span><strong>${esc(title)}</strong><small>${esc(copy)}</small><b>${esc(badge)}</b></span><span class="widget-arrow">›</span></button>`;
}

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
