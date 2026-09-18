/* Memories Unlocked — release lower-card renderer. Direct bundled artwork, single ownership. */
(function(){
if(window.__muMobileLowerRelease)return;window.__muMobileLowerRelease=true;
const mobile=()=>window.matchMedia('(max-width:700px)').matches;if(!mobile())return;
const asset=(name)=>{const base=(document.querySelector('base')?.href||location.href);return new URL('assets/'+name,base).href};
const J=asset('mobile-ref-journeys.jpg?v=20260918phone2');
const M=asset('mobile-ref-memories.jpg?v=20260918phone2');
function imp(el,n,v){el&&el.style.setProperty(n,v,'important');}
function paint(el,src,size,pos){if(!el)return;el.querySelectorAll('.mu-release-img').forEach(n=>n.remove());const img=document.createElement('img');img.className='mu-release-img';img.alt='';img.decoding='sync';img.loading='eager';img.src=src;img.setAttribute('aria-hidden','true');img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;';if(size==='200% 100%'){img.style.width='200%';img.style.maxWidth='none';img.style.left=pos.startsWith('100%')?'-100%':'0';}else if(size==='300% 100%'){img.style.width='300%';img.style.maxWidth='none';img.style.left=pos.startsWith('100%')?'-200%':pos.startsWith('50%')?'-100%':'0';}el.prepend(img);imp(el,'background-image','none');imp(el,'background-color','#eadfc9');el.classList.add('has-photo','mu-release-art');el.querySelectorAll('.mu-mm-inline-fallback,.mu-mm-fallback-art').forEach(n=>n.remove());el.querySelector('.mu-mm-cover-art')?.style.setProperty('display','none','important');}
function dreamCard(){const b=document.createElement('button');b.type='button';b.className='mu-mm-journey-card mu-mm-dream-card';b.dataset.mmAction='journey';b.innerHTML='<span class="mu-mm-cover"><i>DREAM</i></span><span class="mu-mm-journey-meta"><small>YOUR NEXT CHAPTER</small><strong>Plan another journey</strong><span>Dream it · save it · make it real</span></span>';return b;}
const defs=[['Add a memory','Save a view'],['Capture a moment','Keep the feeling'],['Remember a place','Leave the story']];
function memoryPrompt(i){const b=document.createElement('button');b.type='button';b.className='mu-mm-memory-prompt';b.dataset.mmAction='memory';b.dataset.muPromptIndex=String(i);b.innerHTML=`<span class="mu-mm-memory-photo"></span><strong>${defs[i][0]}</strong><small>${defs[i][1]}</small>`;return b;}
function apply(){
 const host=document.querySelector('.mu-mobile-master-home');if(!host)return false;
 const journeys=host.querySelector('.mu-mm-journeys');const memories=host.querySelector('.mu-mm-memory-grid');if(!journeys||!memories)return false;
 let jcards=[...journeys.querySelectorAll('.mu-mm-journey-card')];
 while(jcards.length<2){const d=dreamCard();journeys.appendChild(d);jcards.push(d);}
 jcards.slice(0,2).forEach((card,i)=>{const cover=card.querySelector('.mu-mm-cover');const bg=cover?.style.backgroundImage||'';const realSupabase=cover?.dataset.mmJcover&&cover.classList.contains('has-photo')&&!cover.classList.contains('mu-release-art')&&bg.includes('supabase');if(!realSupabase)paint(cover,J,'200% 100%',i===0?'0% 50%':'100% 50%');});
 const real=[...memories.querySelectorAll('.mu-mm-memory-card')];let prompts=[...memories.querySelectorAll('.mu-mm-memory-prompt')];
 while(real.length+prompts.length<3){const logical=Math.min(real.length+prompts.length,2);const p=memoryPrompt(logical);memories.appendChild(p);prompts.push(p);}
 prompts.slice(0,Math.max(0,3-real.length)).forEach((p,i)=>{const photo=p.querySelector('.mu-mm-memory-photo');const logical=Math.min(real.length+i,2);paint(photo,M,'300% 100%',logical===0?'0% 50%':logical===1?'50% 50%':'100% 50%');});
 const covers=[...journeys.querySelectorAll('.mu-mm-journey-card .mu-mm-cover')].slice(0,2);const photos=[...memories.querySelectorAll('.mu-mm-memory-photo')].slice(0,3);
 const ready=covers.length===2&&photos.length===3&&covers.every(el=>!!el.querySelector('.mu-release-img'))&&photos.every(el=>!!el.querySelector('.mu-release-img'));
 if(ready&&!window.__muLowerReleaseReady){window.__muLowerReleaseReady=true;window.dispatchEvent(new CustomEvent('mu:lower-release-ready'));}
 return ready;
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function start(){apply();const root=document.querySelector('.mu-mobile-master-home')||document.getElementById('home');if(root)new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length||x.removedNodes?.length))schedule();}).observe(root,{childList:true,subtree:true});let n=0;const t=setInterval(()=>{if(apply()||++n>50)clearInterval(t);},100);window.addEventListener('pageshow',schedule,{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();