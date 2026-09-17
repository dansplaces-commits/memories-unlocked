/* Memories Unlocked — DOM-backed fallback artwork v9. */
(function(){
if(window.__muMobileExactV9)return;window.__muMobileExactV9=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
const J='/assets/mobile-ref-journeys.jpg?v=20260917v9';
const M='/assets/mobile-ref-memories.jpg?v=20260917v9';
function img(src,cls){const i=document.createElement('img');i.src=src;i.alt='';i.setAttribute('aria-hidden','true');i.className='mu-mm-fallback-art '+cls;return i;}
function ensure(){
 if(!mobile())return;
 const home=document.querySelector('.mu-mobile-master-home');if(!home)return;
 home.querySelectorAll('.mu-mm-journey-card .mu-mm-cover').forEach((cover,index)=>{
   if(cover.classList.contains('has-photo'))return;
   if(!cover.querySelector('.mu-mm-fallback-art'))cover.prepend(img(J,cover.closest('.mu-mm-dream-card')?'is-right':'is-left'));
 });
 [...home.querySelectorAll('.mu-mm-memory-prompt .mu-mm-memory-photo')].forEach((photo,index)=>{
   if(!photo.querySelector('.mu-mm-fallback-art'))photo.prepend(img(M,['is-one','is-two','is-three'][index%3]));
 });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensure();});}
function start(){ensure();const home=document.getElementById('home');if(home)new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length))schedule();}).observe(home,{childList:true,subtree:true});let tries=0;const t=setInterval(()=>{ensure();if(++tries>20)clearInterval(t);},250);window.addEventListener('pageshow',schedule,{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
