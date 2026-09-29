/* Memories Unlocked — lower-card artwork v11. Paint real bundled JPEG assets directly. */
(function(){
  if(window.__muMobileExactV11)return;window.__muMobileExactV11=true;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  if(!mobile())return;

  const J='/assets/mobile-ref-journeys.jpg?v=20260917g';
  const M='/assets/mobile-ref-memories.jpg?v=20260917g';
  let assetsReady=false;

  function installStyle(){
    if(document.getElementById('muLowerArtV11Style'))return;
    const s=document.createElement('style');
    s.id='muLowerArtV11Style';
    s.textContent=`@media(max-width:700px){
      .mu-mobile-master-home .mu-mm-cover.mu-mm-builtin-art>.mu-mm-cover-art{display:none!important}
      .mu-mobile-master-home .mu-mm-memory-photo.mu-mm-builtin-art:before{display:none!important;content:none!important}
      .mu-mobile-master-home .mu-mm-cover.mu-mm-builtin-art,
      .mu-mobile-master-home .mu-mm-memory-photo.mu-mm-builtin-art{background-color:#eadfc9!important;background-repeat:no-repeat!important}
    }`;
    document.head.appendChild(s);
  }

  function preload(src){
    return new Promise(resolve=>{
      const i=new Image();
      i.onload=()=>resolve(true);
      i.onerror=()=>resolve(false);
      i.src=src;
    });
  }

  async function loadAssets(){
    if(assetsReady)return true;
    const results=await Promise.all([preload(J),preload(M)]);
    assetsReady=results.every(Boolean);
    if(!assetsReady)console.warn('Memories Unlocked lower artwork assets failed to preload',results);
    return assetsReady;
  }

  function paint(el,src,size,pos){
    if(!el||el.classList.contains('has-photo'))return;
    el.querySelectorAll('.mu-mm-fallback-art').forEach(n=>n.remove());
    el.classList.add('mu-mm-builtin-art');
    el.style.setProperty('background-image',`url("${src}")`,'important');
    el.style.setProperty('background-size',size,'important');
    el.style.setProperty('background-position',pos,'important');
    el.style.setProperty('background-repeat','no-repeat','important');
  }

  function apply(){
    if(!assetsReady)return false;
    installStyle();
    const host=document.querySelector('.mu-mobile-master-home');
    if(!host)return false;

    const covers=[...host.querySelectorAll('.mu-mm-journeys .mu-mm-journey-card .mu-mm-cover')];
    covers.forEach((el,i)=>paint(el,J,'200% 100%',i===0?'0% 50%':'100% 50%'));

    const photos=[...host.querySelectorAll('.mu-mm-memory-grid .mu-mm-memory-photo')];
    const positions=['0% 50%','50% 50%','100% 50%'];
    photos.forEach((el,i)=>paint(el,M,'300% 100%',positions[Math.min(i,2)]));

    const ready=covers.length>=2&&photos.length>=3&&
      covers.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art'))&&
      photos.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art'));

    if(ready){
      window.__muLowerArtReady=true;
      window.dispatchEvent(new CustomEvent('mu:lower-art-ready'));
    }
    return ready;
  }

  let queued=false;
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  async function start(){
    await loadAssets();
    apply();
    const root=document.querySelector('.mu-mobile-master-home')||document.getElementById('home');
    if(root)new MutationObserver(m=>{
      if(m.some(x=>x.addedNodes?.length||x.removedNodes?.length))schedule();
    }).observe(root,{childList:true,subtree:true});
    let n=0;const t=setInterval(()=>{if(apply()||++n>60)clearInterval(t);},100);
    window.addEventListener('pageshow',schedule,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();