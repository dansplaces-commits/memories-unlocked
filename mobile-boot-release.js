/* Memories Unlocked — release branded splash only after polished UI + embedded lower artwork are ready. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  let released=false, artworkLoading=false, artworkReady=false;

  function release(){
    if(released)return true;
    released=true;
    root.classList.add('mu-mobile-boot-leaving');
    setTimeout(()=>root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving'),360);
    return true;
  }

  function artworkIsReady(){
    const home=document.querySelector('.mu-mobile-master-home');
    if(!home)return false;
    const covers=[...home.querySelectorAll('.mu-mm-journey-card .mu-mm-cover:not(.has-photo)')];
    const prompts=[...home.querySelectorAll('.mu-mm-memory-prompt .mu-mm-memory-photo')];
    const coverReady=covers.every(el=>el.querySelector('.mu-mm-fallback-art[src^="data:image/"]'));
    const promptReady=prompts.every(el=>el.querySelector('.mu-mm-fallback-art[src^="data:image/"]'));
    return coverReady&&promptReady;
  }

  function finishWhenPainted(){
    let tries=0;
    const check=()=>{
      if(artworkIsReady()){
        artworkReady=true;
        requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(release)));
        return;
      }
      if(++tries<24)setTimeout(check,50);else release();
    };
    check();
  }

  function loadArtwork(){
    if(artworkReady){requestAnimationFrame(()=>requestAnimationFrame(release));return;}
    if(artworkLoading)return;
    artworkLoading=true;

    document.querySelectorAll('.mu-mm-fallback-art').forEach(n=>n.remove());
    try{delete window.__muMobileExactV10;}catch{window.__muMobileExactV10=false;}

    const old=document.getElementById('muMobileExactV10Script');
    if(old)old.remove();

    const s=document.createElement('script');
    s.id='muMobileExactV10Script';
    s.src='mobile-exact-v10.js?v=20260917e';
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
  setTimeout(()=>{if(!released)release();},7000);
})();
