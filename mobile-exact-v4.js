/* Memories Unlocked — exact-reference v4 helpers. Keeps real data honest while preserving the approved layout. */
(function(){
if(window.__muMobileExactV4)return;window.__muMobileExactV4=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
function makeJourneyPrompt(){
  const b=document.createElement('button');
  b.type='button';b.className='mu-mm-journey-card mu-mm-dream-card';b.dataset.mmAction='journey';
  b.innerHTML=`<span class="mu-mm-cover"><i>DREAM</i></span><span class="mu-mm-journey-meta"><small>YOUR NEXT CHAPTER</small><strong>Plan another journey</strong><span>Dream it · save it · make it real</span></span>`;
  return b;
}
function memoryPrompt(n,title,copy){
  const b=document.createElement('button');b.type='button';b.className='mu-mm-memory-prompt';b.dataset.mmAction='memory';
  b.innerHTML=`<span class="mu-mm-memory-photo"></span><strong>${title}</strong><small>${copy}</small>`;return b;
}
function enhanceHome(){
  if(!mobile())return;
  const host=document.querySelector('.mu-mobile-master-home');if(!host)return;
  const journeys=host.querySelector('.mu-mm-journeys');
  if(journeys){
    journeys.querySelectorAll('.mu-mm-dream-card').forEach(n=>n.remove());
    const empty=journeys.querySelector('.mu-mm-empty');
    const real=[...journeys.querySelectorAll('.mu-mm-journey-card:not(.mu-mm-dream-card)')];
    if(empty&&real.length===0)empty.remove();
    if(real.length===0){journeys.append(makeJourneyPrompt());const second=makeJourneyPrompt();second.querySelector('strong').textContent='Create your first journey';second.querySelector('small').textContent='START SOMEWHERE SPECIAL';journeys.append(second);}
    else if(real.length===1)journeys.append(makeJourneyPrompt());
  }
  const memories=host.querySelector('.mu-mm-memory-grid');
  if(memories){
    memories.querySelectorAll('.mu-mm-memory-prompt').forEach(n=>n.remove());
    const empty=memories.querySelector('.mu-mm-empty');
    const real=[...memories.querySelectorAll('.mu-mm-memory-card')];
    if(empty&&real.length===0)empty.remove();
    const prompts=[['Add a memory','Save a view'],['Capture a moment','Keep the feeling'],['Remember a place','Leave the story']];
    for(let i=real.length;i<3;i++)memories.append(memoryPrompt(i,prompts[i][0],prompts[i][1]));
  }
}
let busy=false;function schedule(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;enhanceHome();});}
function start(){enhanceHome();new MutationObserver(m=>{if(m.some(x=>x.addedNodes&&x.addedNodes.length))schedule();}).observe(document.body,{childList:true,subtree:true});let n=0;const retry=setInterval(()=>{enhanceHome();if(++n>20)clearInterval(retry);},300);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
