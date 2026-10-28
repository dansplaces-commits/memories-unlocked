/* Memories Unlocked — friendly Quick Tools icon pack v2. */
(function(){
if(window.__muQuickToolIconsV2)return;window.__muQuickToolIconsV2=true;
const ICONS={
  discover:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="21" r="11" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="m29 29 9 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M16 17c2.2-2.1 5.4-2.8 8.3-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></svg>`,
  capture:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 17h7l2.4-3h5.2l2.4 3h5a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V21a4 4 0 0 1 4-4Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="28" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="34" cy="22" r="1.8" fill="currentColor"/></svg>`,
  footsteps:`<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor"><ellipse cx="15" cy="13" rx="4.2" ry="6.4" transform="rotate(-18 15 13)"/><ellipse cx="30" cy="20" rx="4" ry="6.1" transform="rotate(18 30 20)"/><ellipse cx="18" cy="31" rx="4" ry="6.1" transform="rotate(-17 18 31)"/><ellipse cx="34" cy="37" rx="3.8" ry="5.8" transform="rotate(18 34 37)"/><circle cx="10.5" cy="21.5" r="1.8"/><circle cx="25.5" cy="28" r="1.7"/><circle cx="13.5" cy="39" r="1.6"/><circle cx="30" cy="44" r="1.5"/></g></svg>`,
  share:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 30c8-9 13-10 22-10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="m31 12 8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 31v5a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3h9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  legacy:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.3"/><circle cx="11.5" cy="21" r="4.4" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="36.5" cy="21" r="4.4" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M14 39c.7-7 4.5-11 10-11s9.3 4 10 11M4.5 39c.4-5.2 2.9-8.2 7-8.2 2.4 0 4.3 1 5.7 2.8M43.5 39c-.4-5.2-2.9-8.2-7-8.2-2.4 0-4.3 1-5.7 2.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`
};
function apply(){
  document.querySelectorAll('[data-mu-tool]').forEach(tool=>{
    const key=tool.dataset.muTool,svg=ICONS[key];if(!svg)return;
    let host=tool.querySelector('.dash-benefit-icon');
    if(!host&&tool.closest('.mu-mobile-tools'))host=tool.querySelector('span');
    if(!host||host.dataset.muIconPack==='v2')return;
    host.innerHTML=svg;host.dataset.muIconPack='v2';
  });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function start(){apply();const home=document.getElementById('home');if(home)new MutationObserver(schedule).observe(home,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
