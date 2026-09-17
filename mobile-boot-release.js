/* Memories Unlocked — release the first-paint mobile boot shield only when the master UI exists. */
(function(){
  if(window.__muMobileBootRelease)return;window.__muMobileBootRelease=true;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  function ready(){
    if(!mobile()){document.documentElement.classList.remove('mu-mobile-boot');return true;}
    const master=document.querySelector('.mu-mobile-master-home');
    const nav=document.querySelector('.mu-mm-bottom-nav');
    if(master&&master.children.length&&nav){
      requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('mu-mobile-boot')));
      return true;
    }
    return false;
  }
  if(ready())return;
  const observer=new MutationObserver(()=>{if(ready())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let tries=0;const retry=setInterval(()=>{if(ready()||++tries>=40)clearInterval(retry);},125);
  // Fail-safe: never leave the user trapped behind the boot shield if another script fails.
  setTimeout(()=>document.documentElement.classList.remove('mu-mobile-boot'),6500);
})();
