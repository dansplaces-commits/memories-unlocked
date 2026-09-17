/* Memories Unlocked — release branded splash only after polished UI + lower artwork v11 are ready. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  let released=false,artworkLoading=false;

  function release(){
    if(released)return true;
    released=true;
    root.classList.add('mu-mobile-boot-leaving');
    setTimeout(()=>root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving'),360);
    return true;
  }

  function lowerReady(){
    const home=document.querySelector('.mu-mobile-master-home');
    if(!home)return false;
    const covers=[...home.querySelectorAll('.mu-mm-journeys .mu-mm-journey-card .mu-mm-cover')];
    const photos=[...home.querySelectorAll('.mu-mm-memory-grid .mu-mm-memory-photo')];
    return !!window.__muLowerArtReady&&covers.length>=2&&photos.length>=3&&
      covers.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art'))&&
      photos.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art'));
  }

  function finishWhenPainted(){
    let tries=0;
    const check=()=>{
      if(lowerReady()){
        requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(release)));
        return;
      }
      if(++tries<80)setTimeout(check,75);else release();
    };
    check();
  }

  function loadArtwork(){
    if(lowerReady()){finishWhenPainted();return;}
    if(artworkLoading)return;
    artworkLoading=true;

    document.querySelectorAll('.mu-mm-fallback-art').forEach(n=>n.remove());
    try{delete window.__muMobileExactV11;}catch{window.__muMobileExactV11=false;}
    window.__muLowerArtReady=false;

    const old=document.getElementById('muMobileExactV11Script');
    if(old)old.remove();

    const s=document.createElement('script');
    s.id='muMobileExactV11Script';
    s.src='mobile-exact-v11.js?v=20260917f';
    s.async=false;
    s.onload=finishWhenPainted;
    s.onerror=()=>release();
    document.body.appendChild(s);
  }

  function ready(){
    if(!mobile()){root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');return true;}
    const master=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    if(master&&master.children.length&&nav){loadArtwork();return true;}
    return false;
  }

  if(ready())return;
  const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const retry=setInterval(()=>{if(ready()||++tries>=48)clearInterval(retry);},125);
  setTimeout(()=>{if(!released)release();},8000);
})();