/* Memories Unlocked — real photography comparison controller, 2026-10-04.
   Private-review experiment. Uses Wikipedia page-image thumbnails as real-photo placeholders.
   Production release must replace/review every asset against its source licence and attribution terms. */
(function(){
  'use strict';
  document.documentElement.classList.add('mu-real-photo-review');
  document.documentElement.dataset.imagery='real-photo-review';

  const API='https://en.wikipedia.org/w/api.php';
  const cache=new Map();
  const resolved=new Map();

  const destinationTitles={
    vegas:['Las Vegas Strip','Bellagio (resort)','Fremont Street Experience','Red Rock Canyon National Conservation Area','Welcome to Fabulous Las Vegas sign'],
    rome:['Colosseum','Trevi Fountain','Piazza Navona','Trastevere','Pantheon, Rome'],
    bahamas:['The Bahamas','Exuma','Nassau, Bahamas','Paradise Island','Eleuthera'],
    miami:['Miami Beach, Florida','South Beach','Ocean Drive (South Beach)','Downtown Miami','Little Havana'],
    london:['Palace of Westminster','Tower Bridge','London Eye','Borough Market','Camden Market'],
    paris:['Eiffel Tower','Louvre','Seine','Montmartre','Arc de Triomphe'],
    'new-york':['Statue of Liberty','Times Square','Central Park','Brooklyn Bridge','Manhattan'],
    venice:['Grand Canal (Venice)','Rialto Bridge','Piazza San Marco','Burano','Gondola']
  };
  const hubToExact={'las-vegas':'vegas','new-york':'new-york'};
  const homeTitles=['Lake District','Grand Canal (Venice)','Tower Bridge','The Bahamas','Colosseum','Eiffel Tower'];

  function escUrl(src){return 'url("'+String(src||'').replace(/"/g,'%22')+'")'}
  async function wikiThumb(title,size=1800){
    const key=title+'|'+size;
    if(cache.has(key))return cache.get(key);
    const p=(async()=>{
      try{
        const url=API+'?'+new URLSearchParams({
          action:'query',titles:title,prop:'pageimages',piprop:'thumbnail',
          pithumbsize:String(size),format:'json',origin:'*'
        });
        const res=await fetch(url,{mode:'cors'});
        if(!res.ok)return '';
        const json=await res.json();
        const page=Object.values(json.query?.pages||{})[0];
        return page?.thumbnail?.source||'';
      }catch{return ''}
    })();
    cache.set(key,p);
    return p;
  }
  async function photoSet(id){
    if(resolved.has(id))return resolved.get(id);
    const titles=destinationTitles[id]||[];
    const p=Promise.all(titles.map(t=>wikiThumb(t))).then(list=>list.filter(Boolean));
    resolved.set(id,p);
    return p;
  }

  async function applyHome(){
    const imgs=(await Promise.all(homeTitles.map(t=>wikiThumb(t,2000)))).filter(Boolean);
    if(!imgs.length)return;
    document.documentElement.style.setProperty('--mu-real-home-hero',escUrl(imgs[0]));
    const art=document.querySelector('.dash-master-art');
    if(art)art.style.setProperty('--mu-real-home-hero',escUrl(imgs[0]));
    document.querySelectorAll('.dash-how-card').forEach((card,i)=>{
      const src=imgs[i+1]||imgs[(i%Math.max(1,imgs.length-1))+1]||imgs[0];
      if(src)card.style.setProperty('--mu-real-step-photo',escUrl(src));
    });
  }

  async function applyHub(){
    const hub=document.querySelector('.mu-discover-hub');
    if(!hub)return;
    const heroPhotos=await photoSet('bahamas');
    const hero=hub.querySelector('.mu-discover-hero');
    if(hero&&heroPhotos[0]){
      hero.style.setProperty('--curated-image',escUrl(heroPhotos[0]));
      hero.style.setProperty('--dest-pos','center 48%');
      hero.classList.add('has-curated-image');
    }
    await Promise.all(Array.from(hub.querySelectorAll('[data-dest-card]')).map(async card=>{
      const raw=card.dataset.destCard||'';
      const id=hubToExact[raw]||raw;
      const set=await photoSet(id); if(!set[0])return;
      card.querySelectorAll('.mu-dest-photo,.mu-vegas-next-photo').forEach(photo=>{
        photo.style.setProperty('--curated-image',escUrl(set[0]));
        photo.style.setProperty('--dest-pos','center');
        photo.classList.add('has-curated-image');
      });
    }));
  }

  function exactId(){
    return document.querySelector('.mu-exact-discover-frame[data-current-destination]')?.dataset.currentDestination||'';
  }
  async function applyExact(){
    const id=exactId(); if(!id)return;
    const set=await photoSet(id); if(!set.length)return;
    const frame=document.querySelector('.mu-exact-discover-frame[data-current-destination="'+CSS.escape(id)+'"]');
    if(!frame)return;
    const hero=frame.querySelector('.mu-dyn-hero');
    if(hero&&set[0])hero.style.setProperty('--dyn-hero',escUrl(set[0]));
    const keyIndex={why:1,spots:2,memories:3,local:4};
    frame.querySelectorAll('.mu-dyn-card[data-exact-action]').forEach(card=>{
      const idx=keyIndex[card.dataset.exactAction]??0;
      const src=set[idx]||set[0]; if(src)card.style.setProperty('--dyn-card-image',escUrl(src));
    });
    await Promise.all(Array.from(frame.querySelectorAll('.mu-dyn-next-card[data-exact-dest]')).map(async card=>{
      const next=await photoSet(card.dataset.exactDest); const src=next[0];
      if(src)card.style.setProperty('--dyn-next-image',escUrl(src));
    }));
    document.querySelectorAll('.mu-premium-info-hero').forEach(el=>{
      const src=set[1]||set[0]; if(src)el.style.setProperty('--info-hero',escUrl(src));
    });
    document.querySelectorAll('.mu-premium-info-gallery-thumb').forEach(el=>{
      const src=set[2]||set[0]; if(src)el.style.setProperty('--info-thumb',escUrl(src));
    });
    document.querySelectorAll('.mu-exact-gallery-media img[data-gallery-image]').forEach(img=>{
      if(!/cdn\.shopify\.com|raw\.githubusercontent\.com/i.test(img.src))return;
      const src0=img.getAttribute('src')||'';
      let idx=0;
      if(/why/i.test(src0))idx=1;
      else if(/spots/i.test(src0))idx=2;
      else if(/memories/i.test(src0))idx=3;
      else if(/local/i.test(src0))idx=4;
      const src=set[idx]||set[0];
      if(src&&img.src!==src)img.src=src;
    });
  }

  let queued=false;
  function applyAll(){
    if(queued)return; queued=true;
    requestAnimationFrame(async()=>{
      queued=false;
      await Promise.all([applyHome(),applyHub(),applyExact()]);
    });
  }

  const observer=new MutationObserver(applyAll);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','style','class']});
  document.addEventListener('click',()=>setTimeout(applyAll,0),true);
  document.addEventListener('DOMContentLoaded',applyAll,{once:true});
  applyAll();

  window.muApplyRealPhotoReview=applyAll;
})();
