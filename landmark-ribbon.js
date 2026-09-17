/* Memories Unlocked — decorative landmark ribbon for the locked master home. */
(function(){
if(window.__muLandmarkRibbonLoaded)return;
window.__muLandmarkRibbonLoaded=true;

const LANDMARKS=[
  ['Rome','Italy',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M18 60V33c0-15 13-24 42-24s42 9 42 24v27" fill="none" stroke="currentColor" stroke-width="3"/><path d="M23 31h74M28 24h64M34 17h52" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/><path d="M28 60V43h14v17m8 0V40h20v20m8 0V43h14v17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M19 64h83" stroke="currentColor" stroke-width="3"/></svg>`],
  ['Paris','France',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 7 43 62m17-55 17 55M48 34h24M40 62h40M50 23h20M34 69h52" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M52 47h16" stroke="currentColor" stroke-width="2" opacity=".55"/></svg>`],
  ['London','England',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M45 67V17h30v50M51 17V9h18v8M57 9V4h6v5M39 67h42" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M60 30v-5m0 5 4 3M51 45h18M51 54h18" stroke="currentColor" stroke-width="2"/></svg>`],
  ['New York','USA',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 12v44M53 23l7-13 7 13M50 30h20M47 55h26M43 67h34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M60 19 47 9m13 10 13-10M47 9l-6 7m32-7 6 7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M52 30 46 48h28l-6-18" fill="none" stroke="currentColor" stroke-width="3"/></svg>`],
  ['Athens','Greece',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M21 65h78M27 59h66M32 31h56M38 25h44M43 19h34" fill="none" stroke="currentColor" stroke-width="3"/><path d="M35 31v28m12-28v28m13-28v28m13-28v28m12-28v28" stroke="currentColor" stroke-width="3"/><path d="M28 31 60 12l32 19" fill="none" stroke="currentColor" stroke-width="3"/></svg>`],
  ['Cinque Terre','Italy',`<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M9 66h102M16 66V43h18v23m1 0V34h21v32m2 0V46h18v20m2 0V27h24v39" fill="none" stroke="currentColor" stroke-width="3"/><path d="M13 43 25 34l12 9m-4-9 12-10 13 10m-2 12 11-8 11 8m-2-19 14-12 15 12" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M18 55h5m16-9h6m18 10h5m19-16h7" stroke="currentColor" stroke-width="2" opacity=".6"/></svg>`]
];

function landmarkMarkup(){
  return `<section class="mu-landmark-ribbon" aria-label="Travel landmarks"><div class="mu-landmark-heading"><div><span>PLACES THAT INSPIRE</span><h2>Stories live everywhere.</h2></div><p>From famous landmarks to the quiet places only your family remembers.</p></div><div class="mu-landmark-track">${LANDMARKS.map(([city,country,svg],i)=>`<article class="mu-landmark-card lm-${i+1}"><div class="mu-landmark-art">${svg}</div><div><strong>${city}</strong><small>${country}</small></div><span class="mu-landmark-stamp">MEMORIES<br>UNLOCKED</span></article>`).join('')}</div></section>`;
}

function ensureLandmarkRibbon(){
  const how=document.querySelector('.dash-how');
  if(!how)return;
  let ribbon=document.querySelector('.mu-landmark-ribbon');
  if(ribbon)return;
  how.insertAdjacentHTML('afterend',landmarkMarkup());
}

const base=window.renderDesktopDashboard;
if(typeof base==='function'&&!base.__muLandmarkWrapped){
  const wrapped=function(){const result=base.apply(this,arguments);requestAnimationFrame(ensureLandmarkRibbon);return result;};
  wrapped.__muLandmarkWrapped=true;
  wrapped.__muLandmarkBase=base;
  window.renderDesktopDashboard=wrapped;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(ensureLandmarkRibbon),{once:true});
else requestAnimationFrame(ensureLandmarkRibbon);
})();
