/* Memories Unlocked — exact mobile artwork stabiliser v7. */
(function(){
if(window.__muMobileExactV7)return;window.__muMobileExactV7=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
const A={journeys:'/assets/mobile-ref-journeys.jpg?v=20260917v7',memories:'/assets/mobile-ref-memories.jpg?v=20260917v7'};
function setImportant(el,name,value){if(el)el.style.setProperty(name,value,'important');}
function journeyFallback(el,side='left'){
 if(!el)return;
 setImportant(el,'background-image',`url("${A.journeys}")`);
 setImportant(el,'background-size','200% 100%');
 setImportant(el,'background-position',side==='right'?'100% center':'0% center');
 setImportant(el,'background-repeat','no-repeat');
 setImportant(el,'background-color','#eadfc9');
 el.querySelector('.mu-mm-cover-art')?.style.setProperty('display','none','important');
}
function verifyRealJourneyCover(el){
 if(!el)return;
 const inline=el.style.backgroundImage||'';
 const match=inline.match(/url\(["']?([^"')]+)["']?\)/g);
 if(!el.classList.contains('has-photo')||!match?.length){journeyFallback(el,'left');return;}
 const first=(match[match.length-1]||'').replace(/^url\(["']?/,'').replace(/["']?\)$/,'');
 if(!first){journeyFallback(el,'left');return;}
 const img=new Image();let done=false;
 const fail=()=>{if(done)return;done=true;el.classList.remove('has-photo');journeyFallback(el,'left');};
 img.onerror=fail;
 img.onload=()=>{done=true;};
 img.src=first;
 setTimeout(()=>{if(!done&&img.complete&&img.naturalWidth===0)fail();},2500);
}
function paintMemoryPrompt(el,index){
 if(!el)return;
 setImportant(el,'background-image',`url("${A.memories}")`);
 setImportant(el,'background-size','300% 100%');
 setImportant(el,'background-position',index===0?'0% center':index===1?'50% center':'100% center');
 setImportant(el,'background-repeat','no-repeat');
 setImportant(el,'background-color','#ece2d1');
 el.style.removeProperty('padding');
}
function apply(){
 if(!mobile())return;
 const home=document.querySelector('.mu-mobile-master-home');if(!home)return;
 const covers=[...home.querySelectorAll('.mu-mm-journey-card:not(.mu-mm-dream-card) .mu-mm-cover')];
 covers.forEach(verifyRealJourneyCover);
 home.querySelectorAll('.mu-mm-dream-card .mu-mm-cover').forEach(el=>journeyFallback(el,'right'));
 [...home.querySelectorAll('.mu-mm-memory-prompt .mu-mm-memory-photo')].forEach((el,i)=>paintMemoryPrompt(el,i%3));
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function start(){apply();const home=document.getElementById('home');if(home)new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length))schedule();}).observe(home,{childList:true,subtree:true});let tries=0;const retry=setInterval(()=>{apply();if(++tries>24)clearInterval(retry);},300);window.addEventListener('pageshow',schedule,{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
