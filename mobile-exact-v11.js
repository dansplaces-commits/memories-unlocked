/* Memories Unlocked — installed-app lower artwork stabiliser v11. */
(function(){
  if(window.__muMobileExactV11)return;window.__muMobileExactV11=true;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;
  if(!mobile())return;

  function purgeStale(){
    document.querySelectorAll('.mu-mobile-master-home .mu-mm-fallback-art').forEach(img=>{
      const src=img.getAttribute('src')||'';
      if(!src.startsWith('data:image/')) img.remove();
    });
  }

  function forceVisible(){
    document.querySelectorAll('.mu-mobile-master-home .mu-mm-fallback-art').forEach(img=>{
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('z-index','1','important');
    });
    document.querySelectorAll('.mu-mobile-master-home .mu-mm-cover-art').forEach(el=>el.style.setProperty('display','none','important'));
    document.querySelectorAll('.mu-mobile-master-home .mu-mm-cover > i').forEach(el=>el.style.setProperty('z-index','3','important'));
  }

  function pass(){purgeStale();forceVisible();}
  pass();
  let n=0;const timer=setInterval(()=>{pass();if(++n>30)clearInterval(timer);},150);
  const home=document.getElementById('home');
  if(home)new MutationObserver(()=>requestAnimationFrame(pass)).observe(home,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>setTimeout(pass,50),{passive:true});
})();
