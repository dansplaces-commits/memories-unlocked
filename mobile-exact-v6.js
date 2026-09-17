/* Memories Unlocked — installed-app exact-match stabiliser v6. */
(function(){
if(window.__muMobileExactV6)return;window.__muMobileExactV6=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
const icons={
 discover:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m14.5 14.5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 capture:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 7.4h3l1.2-1.8h3.3l1.2 1.8h2.9a2.2 2.2 0 0 1 2.2 2.2v7.2a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 16.8V9.6a2.2 2.2 0 0 1 2.2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
 footsteps:`<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="8" cy="6.5" rx="2.1" ry="3.3" transform="rotate(-22 8 6.5)"/><ellipse cx="15.5" cy="10.5" rx="2" ry="3.2" transform="rotate(22 15.5 10.5)"/><ellipse cx="7" cy="16.5" rx="1.8" ry="2.9" transform="rotate(-22 7 16.5)"/><ellipse cx="15.8" cy="18" rx="1.7" ry="2.7" transform="rotate(22 15.8 18)"/></g></svg>`,
 share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7m0 0h-6m6 0v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 legacy:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.2" r="2.5" fill="none" stroke="currentColor" stroke-width="1.55"/><circle cx="6.2" cy="8.9" r="1.9" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="17.8" cy="8.9" r="1.9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7.2 18.7c.2-3.7 1.9-5.7 4.8-5.7s4.6 2 4.8 5.7M2.8 18.3c.2-2.7 1.4-4.1 3.6-4.1M21.2 18.3c-.2-2.7-1.4-4.1-3.6-4.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
};
function clean(){
 if(!mobile())return;
 document.querySelectorAll('#home > .home-discover-place,#appDiscoverChip,.app-discover-chip,.app-place-chip').forEach(n=>n.remove());
 document.querySelectorAll('.mu-mm-tools-row i').forEach(i=>{
   const key=[...i.classList].find(k=>icons[k]);if(!key)return;
   if(i.dataset.muV6===key&&i.querySelector('svg'))return;
   i.dataset.muV6=key;i.innerHTML=icons[key];
 });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;clean();});}
function start(){clean();const home=document.getElementById('home');if(home)new MutationObserver(m=>{if(m.some(x=>x.addedNodes&&x.addedNodes.length))schedule();}).observe(home,{childList:true,subtree:true});let tries=0;const retry=setInterval(()=>{clean();if(++tries>18)clearInterval(retry);},350);window.addEventListener('pageshow',schedule,{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
