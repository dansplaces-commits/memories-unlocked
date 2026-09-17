/* Memories Unlocked — release splash only after final lower-card renderer is ready. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  let released=false,loading=false;

  function release(){
    if(released)return true;
    released=true;
    root.classList.add('mu-mobile-boot-leaving');
    setTimeout(()=>root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving'),360);
    return true;
  }

  function finalReady(){
    const home=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    const covers=[...(home?.querySelectorAll('.mu-mm-journeys .mu-mm-journey-card .mu-mm-cover')||[])];
    const photos=[...(home?.querySelectorAll('.mu-mm-memory-grid .mu-mm-memory-photo')||[])];
    return !!nav&&!!window.__muLowerReleaseReady&&covers.length>=2&&photos.length>=3&&
      covers.slice(0,2).every(el=>(el.style.backgroundImage||'').length>10)&&
      photos.slice(0,3).every(el=>(el.style.backgroundImage||'').length>10);
  }

  function loadFinal(){
    if(finalReady()){requestAnimationFrame(()=>requestAnimationFrame(release));return;}
    if(loading)return;loading=true;
    const old=document.getElementById('muMobileLowerReleaseScript');if(old)old.remove();
    try{delete window.__muMobileLowerRelease;}catch{window.__muMobileLowerRelease=false;}
    window.__muLowerReleaseReady=false;
    const s=document.createElement('script');
    s.id='muMobileLowerReleaseScript';
    s.src='mobile-lower-release.js?v=20260917release1';
    s.async=false;
    s.onload=waitReady;
    s.onerror=()=>release();
    document.body.appendChild(s);
  }

  function waitReady(){
    let tries=0;
    const check=()=>{
      if(finalReady()){
        requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(release)));
        return;
      }
      if(++tries<80)setTimeout(check,75);else release();
    };
    check();
  }

  if(!mobile()){
    root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');
    return;
  }

  const ready=()=>{
    const master=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    if(master&&master.children.length&&nav){loadFinal();return true;}
    return false;
  };

  if(ready())return;
  const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const poll=setInterval(()=>{if(ready()||++tries>=64)clearInterval(poll);},125);
  setTimeout(()=>{if(!released)release();},8000);
})();
