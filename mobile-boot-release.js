/* Memories Unlocked — final mobile splash handoff. Artwork is CSS-owned. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  if(!window.matchMedia('(max-width:700px)').matches){
    root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');
    return;
  }
  let released=false;
  function release(){
    if(released)return;
    released=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      root.classList.add('mu-mobile-boot-leaving');
      setTimeout(()=>root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving'),360);
    }));
  }
  function ready(){
    const master=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    if(master&&master.children.length&&nav){release();return true;}
    return false;
  }
  if(ready())return;
  const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const poll=setInterval(()=>{if(ready()||++tries>=64)clearInterval(poll);},125);
  setTimeout(release,8000);
})();