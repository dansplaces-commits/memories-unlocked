/* Memories Unlocked — exact-reference v4 helpers. Idempotent fallback-card management. */
(function(){
if(window.__muMobileExactV4)return;window.__muMobileExactV4=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
function makeJourneyPrompt(kind='plan'){
  const b=document.createElement('button');
  b.type='button';b.className='mu-mm-journey-card mu-mm-dream-card';b.dataset.mmAction='journey';b.dataset.muPromptKind=kind;
  const first=kind==='first';
  b.innerHTML=`<span class="mu-mm-cover"><i>DREAM</i></span><span class="mu-mm-journey-meta"><small>${first?'START SOMEWHERE SPECIAL':'YOUR NEXT CHAPTER'}</small><strong>${first?'Create your first journey':'Plan another journey'}</strong><span>${first?'Make the first chapter yours':'Dream it · save it · make it real'}</span></span>`;
  return b;
}
function memoryPrompt(index,title,copy){
  const b=document.createElement('button');b.type='button';b.className='mu-mm-memory-prompt';b.dataset.mmAction='memory';b.dataset.muPromptIndex=String(index);
  b.innerHTML=`<span class="mu-mm-memory-photo"></span><strong>${title}</strong><small>${copy}</small>`;return b;
}
function syncJourneyPrompts(journeys){
  const empty=journeys.querySelector('.mu-mm-empty');
  const real=[...journeys.querySelectorAll('.mu-mm-journey-card:not(.mu-mm-dream-card)')];
  if(empty&&real.length===0)empty.remove();
  const target=Math.max(0,2-real.length);
  let prompts=[...journeys.querySelectorAll('.mu-mm-dream-card')];
  while(prompts.length>target){prompts.pop().remove();}
  while(prompts.length<target){
    const kind=real.length===0&&prompts.length===1?'first':'plan';
    const p=makeJourneyPrompt(kind);journeys.append(p);prompts.push(p);
  }
  prompts.forEach((p,i)=>{
    const kind=real.length===0&&i===1?'first':'plan';
    if(p.dataset.muPromptKind===kind)return;
    const replacement=makeJourneyPrompt(kind);p.replaceWith(replacement);prompts[i]=replacement;
  });
}
function syncMemoryPrompts(memories){
  const empty=memories.querySelector('.mu-mm-empty');
  const real=[...memories.querySelectorAll('.mu-mm-memory-card')];
  if(empty&&real.length===0)empty.remove();
  const promptDefs=[['Add a memory','Save a view'],['Capture a moment','Keep the feeling'],['Remember a place','Leave the story']];
  const target=Math.max(0,3-real.length);
  let prompts=[...memories.querySelectorAll('.mu-mm-memory-prompt')];
  while(prompts.length>target){prompts.pop().remove();}
  while(prompts.length<target){
    const logicalIndex=real.length+prompts.length;
    const def=promptDefs[Math.min(logicalIndex,2)];
    const p=memoryPrompt(logicalIndex,def[0],def[1]);memories.append(p);prompts.push(p);
  }
  prompts.forEach((p,i)=>{
    const logicalIndex=real.length+i,def=promptDefs[Math.min(logicalIndex,2)];
    p.dataset.muPromptIndex=String(logicalIndex);
    const strong=p.querySelector('strong'),small=p.querySelector('small');
    if(strong&&strong.textContent!==def[0])strong.textContent=def[0];
    if(small&&small.textContent!==def[1])small.textContent=def[1];
  });
}
function enhanceHome(){
  if(!mobile())return;
  const host=document.querySelector('.mu-mobile-master-home');if(!host)return;
  const journeys=host.querySelector('.mu-mm-journeys');if(journeys)syncJourneyPrompts(journeys);
  const memories=host.querySelector('.mu-mm-memory-grid');if(memories)syncMemoryPrompts(memories);
}
let busy=false;function schedule(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;enhanceHome();});}
function start(){
  enhanceHome();
  const host=document.querySelector('.mu-mobile-master-home')||document.getElementById('home');
  if(host)new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length||x.removedNodes?.length))schedule();}).observe(host,{childList:true,subtree:true});
  let n=0;const retry=setInterval(()=>{enhanceHome();if(++n>12)clearInterval(retry);},350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
