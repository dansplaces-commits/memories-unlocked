/* Memories Unlocked — DOM-backed fallback artwork v9. */
(function(){
if(window.__muMobileExactV9)return;window.__muMobileExactV9=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
const J='/assets/mobile-ref-journeys.jpg?v=20260917v9b';
const M='/assets/mobile-ref-memories.jpg?v=20260917v9b';
function img(src,cls,style){const i=document.createElement('img');i.src=src;i.alt='';i.setAttribute('aria-hidden','true');i.className='mu-mm-fallback-art '+cls;i.style.cssText=style;return i;}
function ensure(){
 if(!mobile())return;
 const home=document.querySelector('.mu-mobile-master-home');if(!home)return;
 home.querySelectorAll('.mu-mm-journey-card .mu-mm-cover').forEach(cover=>{
   if(cover.classList.contains('has-photo'))return;
   if(!cover.querySelector('.mu-mm-fallback-art')){
     const dream=!!cover.closest('.mu-mm-dream-card');
     cover.style.setProperty('position','relative','important');cover.style.setProperty('overflow','hidden','important');
     cover.prepend(img(J,dream?'is-right':'is-left',`position:absolute;top:0;${dream?'left:-100%;':'left:0;'}width:200%;height:100%;max-width:none;display:block;z-index:0;pointer-events:none;user-select:none;object-fit:fill;`));
   }
 });
 [...home.querySelectorAll('.mu-mm-memory-prompt .mu-mm-memory-photo')].forEach((photo,index)=>{
   if(!photo.querySelector('.mu-mm-fallback-art')){
     const offsets=['0','-100%','-200%'];photo.style.setProperty('position','relative','important');photo.style.setProperty('overflow','hidden','important');
     photo.prepend(img(M,['is-one','is-two','is-three'][index%3],`position:absolute;top:0;left:${offsets[index%3]};width:300%;height:100%;max-width:none;display:block;z-index:0;pointer-events:none;user-select:none;object-fit:fill;`));
   }
 });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensure();});}
function start(){ensure();const home=document.getElementById('home');if(home)new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length))schedule();}).observe(home,{childList:true,subtree:true});let tries=0;const t=setInterval(()=>{ensure();if(++tries>28)clearInterval(t);},200);window.addEventListener('pageshow',schedule,{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
