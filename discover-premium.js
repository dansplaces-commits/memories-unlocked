/* Memories Unlocked — premium Discover screen rebuilt from approved composition. */
(function(){
if(window.__muPremiumDiscover)return;window.__muPremiumDiscover=true;
const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATIC={
  hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Bellagio%20Fountains%20at%20night.jpg',
  why:'https://commons.wikimedia.org/wiki/Special:FilePath/Bellagio%20Fountains%20at%20night.jpg',
  spots:'https://commons.wikimedia.org/wiki/Special:FilePath/LasVegasRedRockCanyon.jpg',
  memories:'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Fremont%20Street%20Experience.jpg',
  local:'https://commons.wikimedia.org/wiki/Special:FilePath/Bellagio%20fountains%20night.jpg',
  rome:'https://commons.wikimedia.org/wiki/Special:FilePath/Colosseum%20%28Rome%29.jpg',
  bahamas:'assets/bahamas-escape.jpg',
  miami:'https://commons.wikimedia.org/wiki/Special:FilePath/Miami%20Beach%20Art%20Deco.jpg',
  london:'https://commons.wikimedia.org/wiki/Special:FilePath/Big%20Ben%20and%20the%20Palace%20of%20Westminster.jpg',
  paris:'https://commons.wikimedia.org/wiki/Special:FilePath/Eiffel%20Tower%20at%20sunset.jpg'
};

const DESTS=[
 ['rome','Rome','Italy','Colosseum','ROME'],
 ['bahamas','Bahamas','Caribbean','Exuma','BAHAMAS'],
 ['miami','Miami','Florida, USA','Miami Beach, Florida','MIAMI'],
 ['london','London','UK','Palace of Westminster','LONDON'],
 ['paris','Paris','France','Eiffel Tower','PARIS']
];
function vegasBadge(){
 return `<span class="mu-pd-vegas-badge" aria-hidden="true">
  <svg viewBox="0 0 190 150" role="img">
    <defs>
      <filter id="pdBadgeShadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#03182d" flood-opacity=".38"/></filter>
    </defs>
    <g filter="url(#pdBadgeShadow)">
      <path class="pd-sign-star" d="M95 4l7 18 20-5-13 16 16 13-21-1-5 20-8-18-20 6 13-17-17-12 21 0z"/>
      <path class="pd-sign-post" d="M95 21v22"/>
      <path class="pd-sign-outer" d="M27 42h136l18 24-18 55H29L9 67z"/>
      <path class="pd-sign-mid" d="M31 47h128l13 20-15 47H35L18 68z"/>
      <path class="pd-sign-inner" d="M37 52h116l10 16-12 38H41L28 69z"/>
      <g class="pd-sign-bulbs">
        <circle cx="48" cy="50" r="7"/><circle cx="67" cy="46" r="7"/><circle cx="86" cy="44" r="7"/><circle cx="105" cy="44" r="7"/><circle cx="124" cy="46" r="7"/><circle cx="143" cy="50" r="7"/>
      </g>
      <g class="pd-sign-letters">
        <text x="48" y="53">W</text><text x="67" y="49">E</text><text x="86" y="47">L</text><text x="105" y="47">C</text><text x="124" y="49">O</text><text x="143" y="53">M</text>
      </g>
      <text x="95" y="61" class="pd-sign-to">TO</text>
      <text x="95" y="77" class="pd-sign-fabulous">Fabulous</text>
      <text x="95" y="99" class="pd-sign-vegas">LAS VEGAS</text>
      <text x="95" y="113" class="pd-sign-nevada">NEVADA</text>
      <g class="pd-sign-palms">
        <path d="M49 107c-2 12-3 20-2 29m2-17-8-7m8 8 9-7m-9 3-9 1m9 1 8 2"/>
        <path d="M141 107c2 12 3 20 2 29m-2-17 8-7m-8 8-9-7m9 3 9 1m-9 1-8 2"/>
      </g>
      <g class="pd-sign-sparks"><path d="M73 124l3 6 6 2-6 2-3 6-3-6-6-2 6-2z"/><path d="M118 124l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>
    </g>
  </svg>
 </span>`;
}
function pdIcon(kind){
 const common='viewBox="0 0 32 32" aria-hidden="true"';
 if(kind==='save')return `<svg ${common}><path d="M16 27S5.5 20.5 5.5 12.3A6.2 6.2 0 0 1 16 8a6.2 6.2 0 0 1 10.5 4.3C26.5 20.5 16 27 16 27Z"/></svg>`;
 if(kind==='share')return `<svg ${common}><path d="M16 21V5m0 0-6 6m6-6 6 6"/><path d="M8 14H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-2"/></svg>`;
 if(kind==='why')return `<svg ${common}><circle cx="9" cy="16" r="5"/><circle cx="23" cy="16" r="5"/><path d="M14 16h4M6 12l3-6 3 6M20 12l3-6 3 6"/></svg>`;
 if(kind==='spots')return `<svg ${common}><path d="M5 7l7-3 8 3 7-3v21l-7 3-8-3-7 3Z"/><path d="M12 4v21M20 7v21"/></svg>`;
 if(kind==='memories')return `<svg ${common}><rect x="4.5" y="9" width="23" height="17" rx="3"/><path d="M10 9l2-4h8l2 4"/><circle cx="16" cy="17.5" r="5"/></svg>`;
 return `<svg ${common}><path d="M8 4v10m-3-10v6a3 3 0 0 0 6 0V4M8 14v14M22 4c-3 3-4 7-4 11 0 3 2 5 4 5m0-16v24"/></svg>`;
}
function destBadge(label){return `<span class="mu-pd-dest-badge"><b>${escHtml(label)}</b></span>`;}
function hydrate(root){
  root.style.setProperty('--pd-hero',`url("${STATIC.hero}")`);
  const cards={why:STATIC.why,spots:STATIC.spots,memories:STATIC.memories,local:STATIC.local};
  Object.entries(cards).forEach(([k,src])=>root.querySelector(`[data-pd-card="${k}"]`)?.style.setProperty('--pd-card-img',`url("${src}")`));
  DESTS.forEach(d=>root.querySelector(`[data-pd-dest="${d[0]}"]`)?.style.setProperty('--pd-dest-img',`url("${STATIC[d[0]]}")`));
}
function fact(icon,k,v){return `<div><span>${icon}</span><small>${k}</small><strong>${v}</strong></div>`;}
function editorialCard(kind,title,copy){
 return `<button type="button" class="mu-pd-editorial-card" data-pd-card="${kind}" data-pd-action="${kind}">
  <span class="mu-pd-card-shade"></span>
  <span class="mu-pd-card-icon">${pdIcon(kind)}</span>
  <span class="mu-pd-card-copy"><strong>${title}</strong><small>${copy}</small></span>
  <span class="mu-pd-card-arrow">›</span>
 </button>`;
}
function destinationCard(d){
 return `<button type="button" class="mu-pd-next-card" data-pd-dest="${d[0]}" data-pd-open-dest="${d[0]}">
  ${destBadge(d[4])}
  <span class="mu-pd-next-shade"></span>
  <span class="mu-pd-next-copy"><strong>${escHtml(d[1])}</strong><small>${escHtml(d[2])}</small></span>
 </button>`;
}
function markup(){
 return `<section class="mu-pd-screen">
  <header class="mu-pd-topbar">
    <button class="mu-pd-back" type="button" data-pd-close aria-label="Back">‹</button>
    <div class="mu-pd-brand"><span class="mu-pd-lock">◈</span><span>Memories <b>Unlocked</b></span></div>
    <span class="mu-pd-topline">DISCOVER<br>AMAZING PLACES</span>
  </header>
  <section class="mu-pd-hero">
    <div class="mu-pd-hero-overlay"></div>
    <div class="mu-pd-hero-copy">
      <span class="mu-pd-kicker">DISCOVER</span>
      <h1>Las Vegas</h1>
      <p>●&nbsp; Nevada, USA</p>
      <em>Bright lights.<br>Big stories.<br>Your next chapter.</em>
    </div>
    <span class="mu-pd-count">1 / 5</span>
    ${vegasBadge()}
    <div class="mu-pd-actions">
      <button type="button" data-pd-save><span>${pdIcon('save')}</span><small>Save</small></button>
      <button type="button" data-pd-share><span>${pdIcon('share')}</span><small>Share</small></button>
    </div>
  </section>
  <section class="mu-pd-facts">
    ${fact('✈','Best time to visit','Mar – May · Sep – Nov')}
    ${fact('☀','Climate','Hot summers · Mild winters')}
    ${fact('◉','Iconic status','World Famous')}
    ${fact('●','Location','Nevada, USA')}
  </section>
  <section class="mu-pd-grid">
    ${editorialCard('why','Why Visit?','World-class entertainment, unforgettable experiences.')}
    ${editorialCard('spots','Top Spots','Must-see sights, hidden gems and incredible day trips.')}
    ${editorialCard('memories','Best Memories to Make','Unique experiences you’ll never forget.')}
    ${editorialCard('local','Local Highlights','Great food, live shows, shopping and more.')}
  </section>
  <section class="mu-pd-next">
    <div class="mu-pd-next-head"><h2>Where next?</h2><button type="button" data-pd-browse>MORE INCREDIBLE PLACES ›</button></div>
    <div class="mu-pd-next-track">${DESTS.map(destinationCard).join('')}</div>
  </section>
  <footer class="mu-pd-bottom-pad"></footer>
 </section>`;
}
function modal(){
 if(typeof mountDialog!=='function')return;
 const m=mountDialog('premiumDiscoverModal',`<div id="muPremiumDiscoverRoot">${markup()}</div>`,'mu-premium-discover-modal');
 const root=m.querySelector('#muPremiumDiscoverRoot');hydrate(root);return m;
}
window.muOpenPremiumDiscover=modal;
window.muOpenVegasDiscover=modal;
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-pd-close]');if(close){closeModal?.('premiumDiscoverModal');return;}
 const save=e.target.closest('[data-pd-save]');if(save){try{localStorage.setItem('mu_saved_discover_las_vegas','1')}catch{}save.classList.add('saved');save.classList.add('saved');window.toast?.('Las Vegas added to your bucket list.');return;}
 const share=e.target.closest('[data-pd-share]');if(share){const payload={title:'Memories Unlocked — Las Vegas',text:'Discover Las Vegas with Memories Unlocked.',url:location.href};if(navigator.share)navigator.share(payload).catch(()=>{});else navigator.clipboard?.writeText(location.href).then(()=>window.toast?.('Link copied.'));return;}
 const browse=e.target.closest('[data-pd-browse]');if(browse){closeModal?.('premiumDiscoverModal');window.muOpenDiscoverHub?.();return;}
 const d=e.target.closest('[data-pd-open-dest]');if(d){closeModal?.('premiumDiscoverModal');window.muOpenDiscoverDestination?.(d.dataset.pdOpenDest);return;}
 const a=e.target.closest('[data-pd-action]');if(a){const labels={why:'Why Visit?',spots:'Top Spots',memories:'Best Memories to Make',local:'Local Highlights'};window.toast?.(`${labels[a.dataset.pdAction]||'Discover'} — full guide coming next.`);}
});
})();