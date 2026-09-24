/* Memories Unlocked — exact approved Discover screen */
(function(){
if(window.__muExactDiscover)return;window.__muExactDiscover=true;
const MASTER='https://cdn.shopify.com/s/files/1/1072/1938/6698/files/memories-unlocked-discover-las-vegas-master.png?v=1790271619';
function hotspot(name,label,left,top,width,height){
  return `<button type="button" class="mu-exact-hotspot mu-exact-${name}" data-exact-action="${name}" aria-label="${label}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"></button>`;
}
function markup(){
  return `<div class="mu-exact-discover-frame">
    <img class="mu-exact-discover-art" src="${MASTER}" alt="Discover Las Vegas — Memories Unlocked">
    ${hotspot('back','Back',3.9,1.0,10.8,4.9)}
    ${hotspot('save','Save Las Vegas',71.3,33.5,11.4,6.2)}
    ${hotspot('share','Share Las Vegas',83.2,33.5,11.4,6.2)}
    ${hotspot('why','Why visit Las Vegas',2.4,50.7,46.0,12.8)}
    ${hotspot('spots','Top spots in Las Vegas',50.3,50.7,47.0,12.8)}
    ${hotspot('memories','Best memories to make',2.4,64.4,46.0,13.2)}
    ${hotspot('local','Local highlights',50.3,64.4,47.0,13.2)}
    ${hotspot('rome','Discover Rome',3.0,82.0,18.0,11.2)}
    ${hotspot('bahamas','Discover Bahamas',22.1,82.0,19.0,11.2)}
    ${hotspot('miami','Discover Miami',42.3,82.0,19.0,11.2)}
    ${hotspot('london','Discover London',62.1,82.0,18.4,11.2)}
    ${hotspot('paris','Discover Paris',81.0,82.0,17.0,11.2)}
    ${hotspot('home','Home',2.0,94.2,19.6,5.6)}
    ${hotspot('journeys','My Journeys',22.8,94.2,18.7,5.6)}
    ${hotspot('add','Add memory',43.7,94.0,12.8,5.9)}
    ${hotspot('navmemories','Memories',58.3,94.2,18.3,5.6)}
    ${hotspot('friends','Friends',78.2,94.2,19.0,5.6)}
  </div>`;
}
function closeExact(){
  document.documentElement.classList.remove('mu-exact-discover-open');
  closeModal?.('exactDiscoverModal');
}
function open(){
  if(typeof mountDialog!=='function')return;
  document.documentElement.classList.add('mu-exact-discover-open');
  const modal=mountDialog('exactDiscoverModal',markup(),'mu-exact-discover-modal');
  const img=modal.querySelector('.mu-exact-discover-art');
  img?.addEventListener('load',()=>modal.classList.add('is-ready'),{once:true});
  return modal;
}
window.muOpenPremiumDiscover=open;
window.muOpenVegasDiscover=open;
window.muOpenExactDiscover=open;
document.addEventListener('click',e=>{
  const hit=e.target.closest('[data-exact-action]');if(!hit)return;
  const a=hit.dataset.exactAction;
  if(a==='back'||a==='home'){closeExact();showView?.('home');return;}
  if(a==='save'){try{localStorage.setItem('mu_saved_discover_las_vegas','1')}catch{}window.toast?.('Las Vegas added to your bucket list.');return;}
  if(a==='share'){const p={title:'Memories Unlocked — Las Vegas',text:'Discover Las Vegas with Memories Unlocked.',url:location.href};if(navigator.share)navigator.share(p).catch(()=>{});else navigator.clipboard?.writeText(location.href).then(()=>window.toast?.('Link copied.'));return;}
  if(a==='journeys'){closeExact();showView?.('journeys');return;}
  if(a==='add'){closeExact();addMemory?.();return;}
  if(a==='navmemories'){closeExact();showView?.('home');setTimeout(()=>document.querySelector('.mu-mm-memories')?.scrollIntoView({behavior:'smooth',block:'start'}),100);return;}
  if(a==='friends'){closeExact();showView?.('follow');return;}
  if(['rome','bahamas','miami','london','paris'].includes(a)){closeExact();window.muOpenDiscoverDestination?.(a);return;}
  const names={why:'Why Visit?',spots:'Top Spots',memories:'Best Memories to Make',local:'Local Highlights'};
  if(names[a])window.toast?.(names[a]+' — destination guide opens here.');
});
})();