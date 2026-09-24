/* Memories Unlocked — exact approved Discover screen + interaction layer */
(function(){
if(window.__muExactDiscover)return;window.__muExactDiscover=true;

const MASTER='https://cdn.shopify.com/s/files/1/1072/1938/6698/files/memories-unlocked-discover-las-vegas-master.png?v=1790271619';

const GALLERY=[
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Front_of_the_Bellagio_at_night.jpg?width=1400',title:'Bellagio after dark',copy:'Las Vegas comes alive after sunset — lights, water and the Strip in full glow.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_Strip_by_night.jpg?width=1400',title:'The Strip at night',copy:'A skyline built for unforgettable evenings and wide-angle memories.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_Strip_-_Fremont_at_Night_-_NARA_-_7720030.jpg?width=1400',title:'Fremont after dark',copy:'Neon, music and old-school Vegas energy in Downtown.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bellagio_Las_Vegas_Nacht.JPG?width=1400',title:'Classic Vegas nights',copy:'A different view of the city lights — perfect for an evening memory.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_at_Night.JPG?width=1400',title:'Las Vegas from above',copy:'The city glowing against the surrounding desert.'}
];

const INFO={
 why:{kicker:'WHY VISIT?',title:'Why Las Vegas?',intro:'Las Vegas is built around memorable moments — bold architecture, spectacle, food, entertainment and desert scenery all in one place.',items:['See the Strip transformed after dark.','Choose from world-famous shows, attractions and immersive experiences.','Mix city nights with desert landscapes and unforgettable day trips.']},
 spots:{kicker:'TOP SPOTS',title:'Places worth making time for',intro:'A first trip can be huge, so these are strong anchors for a memorable Las Vegas story.',items:['Bellagio Fountains and the central Strip.','Fremont Street and Downtown Las Vegas.','Red Rock Canyon for a complete change of pace.','The High Roller and elevated views across the city.']},
 memories:{kicker:'BEST MEMORIES TO MAKE',title:'Moments worth keeping',intro:'The best Las Vegas memories are often a mixture of spectacle and small personal moments.',items:['Watch the city light up at sunset.','Choose one show or experience that becomes the story of the trip.','Book a meal you will remember rather than simply somewhere to eat.','Take one journey beyond the Strip and photograph the desert.']},
 local:{kicker:'LOCAL HIGHLIGHTS',title:'Look beyond the obvious',intro:'There is more to Las Vegas than the casino floors.',items:['Explore the Arts District and Downtown.','Mix iconic hotels with smaller local stops.','Leave room for food, live music and spontaneous discoveries.','Build in a quieter morning after a big Vegas night.']}
};

const DEST={
 rome:{kicker:'DISCOVER ROME',title:'Rome, Italy',intro:'Ancient history and everyday city life sit side by side — ideal for a journey built around stories, food and landmarks.',items:['Colosseum and Roman Forum.','Pantheon, Trevi Fountain and the historic centre.','Vatican City and St Peter’s.','Piazzas, cafés and evening walks.']},
 bahamas:{kicker:'DISCOVER THE BAHAMAS',title:'Bahamas, Caribbean',intro:'Turquoise water, island journeys and slow days make the Bahamas perfect for memory-led travel.',items:['Exuma and its extraordinary water.','Beach days and boat trips.','Snorkelling, wildlife and island hopping.','Nassau for history, food and culture.']},
 miami:{kicker:'DISCOVER MIAMI',title:'Miami, Florida',intro:'Art Deco, beaches, Latin culture and warm evenings give Miami a completely different rhythm.',items:['South Beach and Ocean Drive.','Little Havana.','Biscayne Bay and waterfront views.','Art Deco architecture and colourful neighbourhoods.']},
 london:{kicker:'DISCOVER LONDON',title:'London, UK',intro:'A city of landmarks, neighbourhoods and layers of history — with enough variety for a different story every day.',items:['Westminster and the Thames.','Tower Bridge and the Tower of London.','Museums, markets and neighbourhood walks.','Theatres, food and evening city views.']},
 paris:{kicker:'DISCOVER PARIS',title:'Paris, France',intro:'Paris rewards slow exploration — iconic landmarks mixed with cafés, streets, art and river views.',items:['Eiffel Tower and the Seine.','Montmartre and neighbourhood streets.','The Louvre and central historic sights.','Evening walks, cafés and viewpoints.']}
};

function hotspot(name,label,left,top,width,height){
 return `<button type="button" class="mu-exact-hotspot mu-exact-${name}" data-exact-action="${name}" aria-label="${label}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"></button>`;
}
function markup(){
 return `<div class="mu-exact-discover-frame">
   <img class="mu-exact-discover-art" src="${MASTER}" alt="Discover Las Vegas — Memories Unlocked">
   ${hotspot('gallery','Open Las Vegas photo gallery',0,5.6,100,35.4)}
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

function exactModal(){return document.getElementById('exactDiscoverModal');}
function clearOverlay(){
 exactModal()?.querySelectorAll('.mu-exact-layer').forEach(n=>n.remove());
}
function closeExact(){
 clearOverlay();
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

function infoLayer(data,mode='vegas'){
 const modal=exactModal();if(!modal||!data)return;
 clearOverlay();
 const layer=document.createElement('div');layer.className='mu-exact-layer mu-exact-info-layer';
 layer.innerHTML=`<button type="button" class="mu-exact-layer-dismiss" data-exact-close-layer aria-label="Close information"></button>
 <section class="mu-exact-info-sheet">
   <span class="mu-exact-sheet-handle"></span>
   <button type="button" class="mu-exact-sheet-close" data-exact-close-layer aria-label="Close">×</button>
   <small>${data.kicker}</small>
   <h2>${data.title}</h2>
   <p>${data.intro}</p>
   <div class="mu-exact-info-list">${data.items.map((x,i)=>`<div><b>0${i+1}</b><span>${x}</span></div>`).join('')}</div>
   <div class="mu-exact-info-actions">
    <button type="button" data-exact-close-layer>Back to Discover</button>
    ${mode==='destination'?'<button type="button" class="primary" data-exact-dream-save>Save to bucket list</button>':'<button type="button" class="primary" data-exact-save-trip>Save Las Vegas</button>'}
   </div>
 </section>`;
 modal.append(layer);
 requestAnimationFrame(()=>layer.classList.add('open'));
}

let galleryIndex=0;
function galleryLayer(index=0){
 const modal=exactModal();if(!modal)return;
 clearOverlay();galleryIndex=(index+GALLERY.length)%GALLERY.length;
 const layer=document.createElement('div');layer.className='mu-exact-layer mu-exact-gallery-layer open';
 layer.innerHTML=`<section class="mu-exact-gallery-shell">
   <div class="mu-exact-gallery-top"><button type="button" data-exact-close-layer aria-label="Back">‹</button><span>LAS VEGAS · PHOTO STORY</span><b data-gallery-counter></b></div>
   <div class="mu-exact-gallery-media" data-gallery-swipe>
    <img data-gallery-image alt="">
    <button type="button" class="mu-exact-gallery-prev" data-gallery-prev aria-label="Previous photo">‹</button>
    <button type="button" class="mu-exact-gallery-next" data-gallery-next aria-label="Next photo">›</button>
   </div>
   <div class="mu-exact-gallery-copy"><small>DISCOVER</small><h2 data-gallery-title></h2><p data-gallery-copy></p><div class="mu-exact-gallery-dots">${GALLERY.map((_,i)=>`<button type="button" data-gallery-dot="${i}" aria-label="Photo ${i+1}"></button>`).join('')}</div></div>
 </section>`;
 modal.append(layer);renderGallery();
}
function renderGallery(){
 const layer=exactModal()?.querySelector('.mu-exact-gallery-layer');if(!layer)return;
 const item=GALLERY[galleryIndex];
 const img=layer.querySelector('[data-gallery-image]');
 img.src=item.src;img.alt=item.title;
 layer.querySelector('[data-gallery-counter]').textContent=`${galleryIndex+1} / ${GALLERY.length}`;
 layer.querySelector('[data-gallery-title]').textContent=item.title;
 layer.querySelector('[data-gallery-copy]').textContent=item.copy;
 layer.querySelectorAll('[data-gallery-dot]').forEach((d,i)=>d.classList.toggle('active',i===galleryIndex));
}
function moveGallery(delta){galleryIndex=(galleryIndex+delta+GALLERY.length)%GALLERY.length;renderGallery();}
function saveVegas(){
 try{localStorage.setItem('mu_saved_discover_las_vegas','1')}catch{}
 window.toast?.('Las Vegas added to your bucket list.');
}

window.muOpenPremiumDiscover=open;
window.muOpenVegasDiscover=open;
window.muOpenExactDiscover=open;

let heroPointerX=null, galleryPointerX=null, suppressHeroClick=0;
document.addEventListener('pointerdown',e=>{
 const h=e.target.closest('[data-exact-action="gallery"]');if(h)heroPointerX=e.clientX;
 const g=e.target.closest('[data-gallery-swipe]');if(g)galleryPointerX=e.clientX;
});
document.addEventListener('pointerup',e=>{
 const h=e.target.closest('[data-exact-action="gallery"]');
 if(h&&heroPointerX!==null){
   const dx=e.clientX-heroPointerX;heroPointerX=null;
   if(Math.abs(dx)>38){suppressHeroClick=Date.now()+500;galleryLayer(dx<0?1:GALLERY.length-1);e.preventDefault();return;}
 }
 const g=e.target.closest('[data-gallery-swipe]');
 if(g&&galleryPointerX!==null){
   const dx=e.clientX-galleryPointerX;galleryPointerX=null;
   if(Math.abs(dx)>38){moveGallery(dx<0?1:-1);e.preventDefault();}
 }
});

document.addEventListener('click',e=>{
 const closeLayer=e.target.closest('[data-exact-close-layer]');if(closeLayer){clearOverlay();return;}
 const prev=e.target.closest('[data-gallery-prev]');if(prev){moveGallery(-1);return;}
 const next=e.target.closest('[data-gallery-next]');if(next){moveGallery(1);return;}
 const dot=e.target.closest('[data-gallery-dot]');if(dot){galleryIndex=Number(dot.dataset.galleryDot)||0;renderGallery();return;}
 if(e.target.closest('[data-exact-save-trip]')){saveVegas();clearOverlay();return;}
 if(e.target.closest('[data-exact-dream-save]')){window.toast?.('Destination added to your bucket list.');return;}

 const hit=e.target.closest('[data-exact-action]');if(!hit)return;
 const a=hit.dataset.exactAction;
 if(a==='gallery'){if(Date.now()<suppressHeroClick)return;galleryLayer(0);return;}
 if(a==='back'||a==='home'){closeExact();showView?.('home');return;}
 if(a==='save'){saveVegas();return;}
 if(a==='share'){
   const p={title:'Memories Unlocked — Las Vegas',text:'Discover Las Vegas with Memories Unlocked.',url:location.href};
   if(navigator.share)navigator.share(p).catch(()=>{});else navigator.clipboard?.writeText(location.href).then(()=>window.toast?.('Link copied.'));
   return;
 }
 if(a==='journeys'){closeExact();showView?.('journeys');return;}
 if(a==='add'){closeExact();addMemory?.();return;}
 if(a==='navmemories'){closeExact();showView?.('home');setTimeout(()=>document.querySelector('.mu-mm-memories')?.scrollIntoView({behavior:'smooth',block:'start'}),100);return;}
 if(a==='friends'){closeExact();showView?.('follow');return;}
 if(INFO[a]){infoLayer(INFO[a]);return;}
 if(DEST[a]){infoLayer(DEST[a],'destination');return;}
});
})();