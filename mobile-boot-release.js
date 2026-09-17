/* Memories Unlocked — release branded splash only after polished UI + lower artwork v11 are ready. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  let released=false;

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
    const nav=document.querySelector('.mu-mm-bottom-nav');
    const covers=[...home.querySelectorAll('.mu-mm-journeys .mu-mm-journey-card .mu-mm-cover')];
    const photos=[...home.querySelectorAll('.mu-mm-memory-grid .mu-mm-memory-photo')];
    return !!nav && !!window.__muLowerArtReady && covers.length>=2 && photos.length>=3 &&
      covers.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art')) &&
      photos.every(el=>el.classList.contains('has-photo')||el.classList.contains('mu-mm-builtin-art'));
  }

  if(!mobile()){
    root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');
    return;
  }

  if(lowerReady()){
    requestAnimationFrame(()=>requestAnimationFrame(release));
    return;
  }

  const onReady=()=>{
    if(!lowerReady())return;
    window.removeEventListener('mu:lower-art-ready',onReady);
    requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(release)));
  };
  window.addEventListener('mu:lower-art-ready',onReady);

  let tries=0;
  const poll=setInterval(()=>{
    if(lowerReady()){
      clearInterval(poll);
      onReady();
      return;
    }
    if(++tries>=96){
      clearInterval(poll);
      release();
    }
  },75);

  setTimeout(()=>{if(!released)release();},8000);
})();
