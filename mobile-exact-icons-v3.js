/* Memories Unlocked — mobile exact-match vector icon refinement. */
(function(){
if(window.__muMobileExactIconsV3)return;window.__muMobileExactIconsV3=true;
const icons={
  discover:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m14.5 14.5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  capture:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 7.4h3l1.2-1.8h3.3l1.2 1.8h2.9a2.2 2.2 0 0 1 2.2 2.2v7.2a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 16.8V9.6a2.2 2.2 0 0 1 2.2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
  footsteps:`<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="8.2" cy="7.2" rx="2.5" ry="3.8" transform="rotate(-24 8.2 7.2)"/><ellipse cx="15.5" cy="12.6" rx="2.4" ry="3.7" transform="rotate(24 15.5 12.6)"/><ellipse cx="7" cy="16.8" rx="2" ry="3" transform="rotate(-23 7 16.8)"/><circle cx="5.1" cy="3.5" r=".9"/><circle cx="11" cy="3.9" r=".75"/><circle cx="18.4" cy="8.8" r=".85"/></g></svg>`,
  share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7m0 0h-6m6 0v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  legacy:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.4" r="2.7" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.3" cy="9" r="2.1" fill="none" stroke="currentColor" stroke-width="1.45"/><circle cx="17.7" cy="9" r="2.1" fill="none" stroke="currentColor" stroke-width="1.45"/><path d="M7.3 19v-1.5c0-3 1.8-4.8 4.7-4.8s4.7 1.8 4.7 4.8V19M2.8 18.5v-1.1c0-2.4 1.3-3.8 3.6-3.8m14.8 4.9v-1.1c0-2.4-1.3-3.8-3.6-3.8" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>`
};
const nav={
 home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 4l8 7.2V20H5v-8.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.3 20v-5.8h5.4V20" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
 journeys:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.1-.9 5.7-.4 8 1.4v12c-2.3-1.8-4.9-2.3-8-1.4zM20 5.5c-3.1-.9-5.7-.4-8 1.4v12c2.3-1.8 4.9-2.3 8-1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
 memories:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="10" r="1.4" fill="currentColor"/><path d="m6.5 16 4-4 2.8 2.8 2-2 2.7 3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 follow:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.7" cy="8.2" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="15.8" cy="9.2" r="2.2" fill="none" stroke="currentColor" stroke-width="1.45"/><path d="M4.2 19c.2-3.8 1.8-5.8 4.6-5.8s4.5 2 4.7 5.8m0-.8c.2-2.8 1.4-4.4 3.6-4.4 2.1 0 3.3 1.5 3.5 4.4" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>`
};
function apply(){
  document.querySelectorAll('.mu-mm-tools-row i').forEach(el=>{
    const key=[...el.classList].find(k=>icons[k]);if(!key)return;
    if(el.dataset.mxV3===key&&el.querySelector('svg'))return;
    el.dataset.mxV3=key;el.innerHTML=icons[key];
  });
  document.querySelectorAll('.mu-mm-bottom-nav [data-mm-nav]').forEach(btn=>{
    const key=btn.dataset.mmNav,span=btn.querySelector('span');if(!span||!nav[key])return;
    if(span.dataset.mxV3===key&&span.querySelector('svg'))return;
    span.dataset.mxV3=key;span.innerHTML=nav[key];
  });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function start(){
  apply();
  const observer=new MutationObserver(mutations=>{
    if(!mutations.some(m=>m.addedNodes&&m.addedNodes.length))return;
    schedule();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  let tries=0;const retry=setInterval(()=>{apply();if(++tries>=20)clearInterval(retry);},300);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
