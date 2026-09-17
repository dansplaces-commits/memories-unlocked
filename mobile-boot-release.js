/* Memories Unlocked — release the branded mobile splash only when the polished master UI exists. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const root=document.documentElement;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  let released=false;
  function release(){
    if(released)return true;
    released=true;
    root.classList.add('mu-mobile-boot-leaving');
    setTimeout(()=>{
      root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');
    },360);
    return true;
  }
  function ready(){
    if(!mobile()){root.classList.remove('mu-mobile-boot','mu-mobile-boot-leaving');return true;}
    const master=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    if(master&&master.children.length&&nav){
      requestAnimationFrame(()=>requestAnimationFrame(release));
      return true;
    }
    return false;
  }
  if(ready())return;
  const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const retry=setInterval(()=>{if(ready()||++tries>=48)clearInterval(retry);},125);
  // Fail-safe: reveal the app even if another layer fails to report ready.
  setTimeout(release,6500);
})();
