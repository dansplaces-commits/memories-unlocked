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
          <button class="dash-master-secondary" onclick="openDashboardExplainer()">
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
          <i>5</i><span class="dash-how-icon footsteps">◜◝</span><strong>Follow the Footsteps</strong><small>Retrace the journey<br>and continue the story.</small>
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

/* Website-matched animated How It Works experience, available on desktop and mobile. */
const dashboardExplainerScenes=[
  {k:'HOW IT WORKS',t:'Every place has a story.',c:'Follow the footsteps. Unlock the memories. Leave a trail worth following.',i:'✦',tone:523.25},
  {k:'STEP 1 OF 5',t:'Create a Journey',c:'Add a trip you’ve taken — or somewhere you dream of going.',i:'🗺️',tone:587.33},
  {k:'STEP 2 OF 5',t:'Pin a Place',c:'Drop a pin on the places that mattered most.',i:'📍',tone:659.25},
  {k:'STEP 3 OF 5',t:'Capture the Memory',c:'Add photos, stories and the moments you never want to lose.',i:'📷',tone:698.46},
  {k:'STEP 4 OF 5',t:'Leave a Clue',c:'Add a message, hint or challenge for the people who follow.',i:'🔑',tone:783.99},
  {k:'STEP 5 OF 5',t:'Follow the Footsteps',c:'Retrace the journey, unlock the story and continue the trail.',i:'👣',tone:880},
  {k:'YOUR LEGACY',t:'Your memories become a trail.',c:'A trail your family can rediscover, retrace and continue.',i:'↝',tone:987.77},
  {k:'MEMORIES UNLOCKED',t:'Every place has a story.',c:'Start yours.',i:'🔓',tone:1046.5}
];
let dashboardExplainerIndex=0,dashboardExplainerTimer=null,dashboardExplainerAudio=null;

function ensureDashboardExplainer(){
  if(document.getElementById('dashboardExplainer'))return;
  document.body.insertAdjacentHTML('beforeend',`
    <div class="dashboard-explainer" id="dashboardExplainer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="How Memories Unlocked works">
      <div class="dashboard-explainer-shell">
        <button class="dashboard-explainer-close" type="button" onclick="closeDashboardExplainer()" aria-label="Close video">×</button>
        <div class="dashboard-explainer-stage">
          <div class="dashboard-explainer-brand">MEMORIES <b>UNLOCKED</b></div>
          <div class="dashboard-explainer-kicker" id="dashboardExplainerKicker">HOW IT WORKS</div>
          <h2 id="dashboardExplainerTitle">Every place has a story.</h2>
          <p id="dashboardExplainerCopy">Follow the footsteps. Unlock the memories. Leave a trail worth following.</p>
          <div class="dashboard-explainer-visual" id="dashboardExplainerVisual" aria-hidden="true"><span>✦</span></div>
          <div class="dashboard-explainer-dots" id="dashboardExplainerDots" aria-label="Video progress"></div>
          <div class="dashboard-explainer-progress"><span id="dashboardExplainerProgress"></span></div>
          <div class="dashboard-explainer-controls"><button type="button" onclick="playDashboardExplainer(0)">↻ Replay</button><button type="button" onclick="advanceDashboardExplainer()">Next →</button></div>
        </div>
      </div>
    </div>`);
  const modal=document.getElementById('dashboardExplainer');
  modal.addEventListener('click',e=>{if(e.target===modal)closeDashboardExplainer()});
}

function dashboardExplainerBeep(freq=660,d=.11,vol=.028){
  try{
    dashboardExplainerAudio=dashboardExplainerAudio||new (window.AudioContext||window.webkitAudioContext)();
    if(dashboardExplainerAudio.state==='suspended')dashboardExplainerAudio.resume();
    const o=dashboardExplainerAudio.createOscillator(),g=dashboardExplainerAudio.createGain();
    o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(vol,dashboardExplainerAudio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,dashboardExplainerAudio.currentTime+d);o.connect(g);g.connect(dashboardExplainerAudio.destination);o.start();o.stop(dashboardExplainerAudio.currentTime+d);
  }catch(e){}
}

function renderDashboardExplainer(i){
  ensureDashboardExplainer();
  dashboardExplainerIndex=(i+dashboardExplainerScenes.length)%dashboardExplainerScenes.length;
  const s=dashboardExplainerScenes[dashboardExplainerIndex];
  const kicker=document.getElementById('dashboardExplainerKicker');
  const title=document.getElementById('dashboardExplainerTitle');
  const copy=document.getElementById('dashboardExplainerCopy');
  const visual=document.getElementById('dashboardExplainerVisual');
  const dots=document.getElementById('dashboardExplainerDots');
  const progress=document.getElementById('dashboardExplainerProgress');
  if(!kicker||!title||!copy||!visual||!dots||!progress)return;
  kicker.textContent=s.k;title.textContent=s.t;copy.textContent=s.c;visual.innerHTML=`<span>${s.i}</span>`;
  dots.innerHTML=dashboardExplainerScenes.map((_,n)=>`<i class="${n===dashboardExplainerIndex?'active':''}"></i>`).join('');
  progress.style.transition='none';progress.style.width='0%';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{progress.style.transition='width 4.8s linear';progress.style.width='100%'}));
  visual.classList.remove('pop');void visual.offsetWidth;visual.classList.add('pop');
  dashboardExplainerBeep(s.tone);
}

function advanceDashboardExplainer(){
  renderDashboardExplainer(dashboardExplainerIndex+1);
  if(dashboardExplainerIndex===dashboardExplainerScenes.length-1){clearInterval(dashboardExplainerTimer);dashboardExplainerTimer=null;}
}

function playDashboardExplainer(from=0){
  clearInterval(dashboardExplainerTimer);
  renderDashboardExplainer(from);
  dashboardExplainerTimer=setInterval(advanceDashboardExplainer,5000);
}

function openDashboardExplainer(){
  ensureDashboardExplainer();
  const modal=document.getElementById('dashboardExplainer');
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('dashboard-video-opened');
  playDashboardExplainer(0);
}

function closeDashboardExplainer(){
  clearInterval(dashboardExplainerTimer);dashboardExplainerTimer=null;
  const modal=document.getElementById('dashboardExplainer');
  if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
  document.body.classList.remove('dashboard-video-opened');
}
window.openDashboardExplainer=openDashboardExplainer;
window.closeDashboardExplainer=closeDashboardExplainer;
window.playDashboardExplainer=playDashboardExplainer;
window.advanceDashboardExplainer=advanceDashboardExplainer;

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('dashboardExplainer')?.classList.contains('open'))closeDashboardExplainer()});

window.addEventListener('DOMContentLoaded',()=>{
  const home=$('home');
  if(home&&!home.querySelector('.desktop-dashboard')){
    const dash=document.createElement('div');
    dash.className='desktop-dashboard';
    home.prepend(dash);
  }
  renderDesktopDashboard();
  ensureDashboardExplainer();

  if(home&&!home.querySelector('.mobile-explainer-launch')){
    const mobileLaunch=document.createElement('button');
    mobileLaunch.type='button';
    mobileLaunch.className='mobile-explainer-launch';
    mobileLaunch.innerHTML='<span>▶</span><b>See how Memories Unlocked works</b>';
    mobileLaunch.addEventListener('click',openDashboardExplainer);
    const hero=home.querySelector('.home-hero');
    if(hero)hero.insertAdjacentElement('afterend',mobileLaunch);
  }

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
