/* Memories Unlocked — premium Discover screen rebuilt from approved composition. */
(function(){
if(window.__muPremiumDiscover)return;window.__muPremiumDiscover=true;
const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HERO_FILE='File:Las Vegas Strip (53501962368).jpg';
const DESTS=[
 ['rome','Rome','Italy','Colosseum','ROME'],
 ['bahamas','Bahamas','Caribbean','Exuma','BAHAMAS'],
 ['miami','Miami','Florida, USA','Miami Beach, Florida','MIAMI'],
 ['london','London','UK','Palace of Westminster','LONDON'],
 ['paris','Paris','France','Eiffel Tower','PARIS']
];
function vegasBadge(){
 return `<span class="mu-pd-vegas-badge" aria-hidden="true">
   <svg viewBox="0 0 170 130" role="img">
    <path class="sign-star" d="M86 4l7 19 20-4-14 15 15 14-21-2-6 20-7-19-20 5 14-16-15-13 21 2z"/>
    <path class="sign-pole" d="M86 19v18"/>
    <path class="sign-shield" d="M22 40h125l14 24-17 48H28L9 65z"/>
    <path class="sign-inner" d="M29 46h111l12 20-14 38H34L18 66z"/>
    <g class="sign-dots">
      <circle cx="43" cy="47" r="7"/><circle cx="60" cy="43" r="7"/><circle cx="77" cy="41" r="7"/><circle cx="94" cy="41" r="7"/><circle cx="111" cy="43" r="7"/><circle cx="128" cy="47" r="7"/>
    </g>
    <text x="85" y="50" class="sign-welcome">WELCOME TO</text>
    <text x="85" y="67" class="sign-fabulous">Fabulous</text>
    <text x="85" y="88" class="sign-vegas">LAS VEGAS</text>
    <text x="85" y="101" class="sign-nevada">NEVADA</text>
   </svg>
 </span>`;
}
function destBadge(label){return `<span class="mu-pd-dest-badge"><b>${escHtml(label)}</b></span>`;}
async function wikiThumb(title,size=1200){
 try{
  const u='https://en.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',titles:title,prop:'pageimages',piprop:'thumbnail',pithumbsize:String(size),format:'json',origin:'*'});
  const r=await fetch(u);if(!r.ok)return'';const j=await r.json();return Object.values(j.query?.pages||{})[0]?.thumbnail?.source||'';
 }catch{return''}
}
async function commonsThumb(file,size=1600){
 try{
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',titles:file,prop:'imageinfo',iiprop:'url',iiurlwidth:String(size),format:'json',origin:'*'});
  const r=await fetch(u);if(!r.ok)return'';const j=await r.json();const p=Object.values(j.query?.pages||{})[0];return p?.imageinfo?.[0]?.thumburl||p?.imageinfo?.[0]?.url||'';
 }catch{return''}
}
async function hydrate(root){
 const hero=await commonsThumb(HERO_FILE,1600);
 if(hero&&root.isConnected)root.style.setProperty('--pd-hero',`url("${hero.replace(/"/g,'%22')}")`);
 const jobs=[
  ['[data-pd-card="why"]','Fountains of Bellagio'],
  ['[data-pd-card="spots"]','Red Rock Canyon National Conservation Area'],
  ['[data-pd-card="memories"]','Fremont Street Experience'],
  ['[data-pd-card="local"]','Las Vegas Strip']
 ];
 await Promise.all(jobs.map(async([sel,title])=>{const el=root.querySelector(sel),src=await wikiThumb(title);if(el&&src)el.style.setProperty('--pd-card-img',`url("${src.replace(/"/g,'%22')}")`);}));
 await Promise.all(DESTS.map(async d=>{const el=root.querySelector(`[data-pd-dest="${d[0]}"]`),src=await wikiThumb(d[3],900);if(el&&src)el.style.setProperty('--pd-dest-img',`url("${src.replace(/"/g,'%22')}")`);}));
}
function fact(icon,k,v){return `<div><span>${icon}</span><small>${k}</small><strong>${v}</strong></div>`;}
function editorialCard(kind,title,copy,icon){
 return `<button type="button" class="mu-pd-editorial-card" data-pd-card="${kind}" data-pd-action="${kind}">
  <span class="mu-pd-card-shade"></span>
  <span class="mu-pd-card-icon">${icon}</span>
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
      <button type="button" data-pd-save><span>♡</span><small>Save</small></button>
      <button type="button" data-pd-share><span>↗</span><small>Share</small></button>
    </div>
  </section>
  <section class="mu-pd-facts">
    ${fact('✈','Best time to visit','Mar – May · Sep – Nov')}
    ${fact('☀','Climate','Hot summers · Mild winters')}
    ${fact('◉','Iconic status','World Famous')}
    ${fact('●','Location','Nevada, USA')}
  </section>
  <section class="mu-pd-grid">
    ${editorialCard('why','Why Visit?','World-class entertainment, unforgettable experiences.','◉')}
    ${editorialCard('spots','Top Spots','Must-see sights, hidden gems and incredible day trips.','⌖')}
    ${editorialCard('memories','Best Memories to Make','Unique experiences you’ll never forget.','▣')}
    ${editorialCard('local','Local Highlights','Great food, live shows, shopping and more.','⌁')}
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
 const save=e.target.closest('[data-pd-save]');if(save){try{localStorage.setItem('mu_saved_discover_las_vegas','1')}catch{}save.classList.add('saved');save.querySelector('span').textContent='♥';window.toast?.('Las Vegas added to your bucket list.');return;}
 const share=e.target.closest('[data-pd-share]');if(share){const payload={title:'Memories Unlocked — Las Vegas',text:'Discover Las Vegas with Memories Unlocked.',url:location.href};if(navigator.share)navigator.share(payload).catch(()=>{});else navigator.clipboard?.writeText(location.href).then(()=>window.toast?.('Link copied.'));return;}
 const browse=e.target.closest('[data-pd-browse]');if(browse){closeModal?.('premiumDiscoverModal');window.muOpenDiscoverHub?.();return;}
 const d=e.target.closest('[data-pd-open-dest]');if(d){closeModal?.('premiumDiscoverModal');window.muOpenDiscoverDestination?.(d.dataset.pdOpenDest);return;}
 const a=e.target.closest('[data-pd-action]');if(a){const labels={why:'Why Visit?',spots:'Top Spots',memories:'Best Memories to Make',local:'Local Highlights'};window.toast?.(`${labels[a.dataset.pdAction]||'Discover'} — full guide coming next.`);}
});
})();