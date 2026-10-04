/* Memories Unlocked 2.0 — approved Discover composition with real-photo hero lock. */
(function(){
if(window.__muExactDiscover)return;window.__muExactDiscover=true;

const MASTER='https://cdn.shopify.com/s/files/1/1072/1938/6698/files/memories-unlocked-discover-las-vegas-content-master-v2.png?v=1790275439';
const HEADER_MASTER='https://cdn.shopify.com/s/files/1/1072/1938/6698/files/memories-unlocked-discover-header-master.png?v=1790276193';
const NAV_MASTER='https://cdn.shopify.com/s/files/1/1072/1938/6698/files/memories-unlocked-discover-nav-clean.png?v=1790276097';
const C=(file,width=1600)=>`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const BADGES={
 vegas:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-las-vegas-vegassize.png?v=1790704626',
 rome:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-rome-vegassize.png?v=1790704634',
 bahamas:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-bahamas-vegassize.png?v=1790704641',
 miami:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-miami-vegassize.png?v=1790704649',
 london:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-london-vegassize.png?v=1790704656',
 paris:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-badge-paris-vegassize.png?v=1790704664'
};

const VEGAS_GALLERY=[
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Front_of_the_Bellagio_at_night.jpg?width=1400',title:'Bellagio after dark',copy:'Las Vegas comes alive after sunset — lights, water and the Strip in full glow.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_Strip_by_night.jpg?width=1400',title:'The Strip at night',copy:'A skyline built for unforgettable evenings and wide-angle memories.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_Strip_-_Fremont_at_Night_-_NARA_-_7720030.jpg?width=1400',title:'Fremont after dark',copy:'Neon, music and old-school Vegas energy in Downtown.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bellagio_Las_Vegas_Nacht.JPG?width=1400',title:'Classic Vegas nights',copy:'A different view of the city lights — perfect for an evening memory.'},
 {src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_at_Night.JPG?width=1400',title:'Las Vegas from above',copy:'The city glowing against the surrounding desert.'}
];

const CONFIG={
 vegas:{
  id:'vegas',name:'Las Vegas',location:'Nevada, USA',
  hero:VEGAS_GALLERY[0].src,heroPos:'center 48%',tileHero:VEGAS_GALLERY[0].src,
  count:'1 / 5',exact:false,badge:'LAS VEGAS',tagline:['Bright lights.','Big stories.','Your next chapter.'],
  images:{
   why:'https://commons.wikimedia.org/wiki/Special:FilePath/Bellagio%20Fountains%20at%20night.jpg',
   spots:'https://commons.wikimedia.org/wiki/Special:FilePath/LasVegasRedRockCanyon.jpg',
   memories:'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Fremont%20Street%20Experience.jpg',
   local:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bellagio_Las_Vegas_Nacht.JPG?width=1400'
  },
  gallery:[
   [VEGAS_GALLERY[0].src,'Las Vegas at sunset'],
   ['https://commons.wikimedia.org/wiki/Special:FilePath/Bellagio%20Fountains%20at%20night.jpg','Bellagio after dark'],
   ['https://commons.wikimedia.org/wiki/Special:FilePath/LasVegasRedRockCanyon.jpg','Red Rock Canyon'],
   ['https://commons.wikimedia.org/wiki/Special:FilePath/The%20Fremont%20Street%20Experience.jpg','Fremont Street'],
   ['https://commons.wikimedia.org/wiki/Special:Redirect/file/Las_Vegas_at_Night.JPG?width=1400','Las Vegas lights']
  ],
  facts:[['✈','Best time to visit','Mar – May · Sep – Nov'],['☀','Climate','Hot summers · Mild winters'],['◉','Iconic status','World Famous'],['●','Location','Nevada, USA']],
  snapshot:{best:'Shows · Food · Nightlife',stay:'3–5 days',vibe:'Iconic · Vibrant · Indulgent',tip:'The Strip is longer than it looks — plan by area, not just by hotel.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why Las Vegas?',intro:'Las Vegas is built around memorable moments — bold architecture, spectacle, food, entertainment and desert scenery all in one place.',items:['See the Strip transformed after dark.','Choose from world-famous shows, attractions and immersive experiences.','Mix city nights with desert landscapes and unforgettable day trips.']},
   spots:{kicker:'TOP SPOTS',title:'Places worth making time for',intro:'A first trip can be huge, so these are strong anchors for a memorable Las Vegas story.',items:['Bellagio Fountains and the central Strip.','Fremont Street and Downtown Las Vegas.','Red Rock Canyon for a complete change of pace.','The High Roller and elevated views across the city.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'Moments worth keeping',intro:'The best Las Vegas memories are often a mixture of spectacle and small personal moments.',items:['Watch the city light up at sunset.','Choose one show or experience that becomes the story of the trip.','Book a meal you will remember rather than simply somewhere to eat.','Take one journey beyond the Strip and photograph the desert.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'Look beyond the obvious',intro:'There is more to Las Vegas than the casino floors.',items:['Explore the Arts District and Downtown.','Mix iconic hotels with smaller local stops.','Leave room for food, live music and spontaneous discoveries.','Build in a quieter morning after a big Vegas night.']}
  }
 },
 rome:{
  id:'rome',name:'Rome',location:'Italy',hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Colosseum%20at%20sunset-Rome.JPG?width=2200',heroPos:'center 50%',tileHero:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-memories-v3.jpg?v=1790700539',count:'1 / 5',badge:'ROME',tagline:['Ancient places.','Timeless stories.','Your next chapter.'],
  images:{why:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-why-v3.jpg?v=1790700526',spots:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-spots-v3.jpg?v=1790700532',memories:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-memories-v3.jpg?v=1790700539',local:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-local-v3.jpg?v=1790700546'},
  gallery:[['https://commons.wikimedia.org/wiki/Special:FilePath/Colosseum%20at%20sunset-Rome.JPG?width=2200','Colosseum at sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-why-v3.jpg?v=1790700526','Piazza life at golden hour'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-spots-v3.jpg?v=1790700532','Trevi Fountain'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-memories-v3.jpg?v=1790700539','Rome streets at sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-rome-local-v3.jpg?v=1790700546','Dining in Rome']],
  facts:[['✈','Best time to visit','Apr – Jun · Sep – Oct'],['☀','Climate','Warm summers · Mild winters'],['◉','Iconic status','Historic & Cultural'],['●','Location','Rome, Italy']],
  snapshot:{best:'History · Food · Culture',stay:'3–5 days',vibe:'Timeless · Romantic · Walkable',tip:'Start early for the headline sights, then leave space for slow piazza evenings.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why Rome?',intro:'Rome layers ancient history, art, food and everyday city life into almost every walk.',items:['Walk through two thousand years of history.','Build days around neighbourhoods rather than rushing between sights.','Make time for food, piazzas and evening walks as well as landmarks.']},
   spots:{kicker:'TOP SPOTS',title:'Rome essentials',intro:'A first visit deserves a mix of famous icons and quieter streets.',items:['Colosseum and Roman Forum.','Pantheon and Piazza Navona.','Trevi Fountain and the Spanish Steps.','Vatican City and St Peter’s.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'Rome moments worth keeping',intro:'Rome is at its best when the big sights mix with small everyday moments.',items:['Watch the city change colour near sunset.','Have one long meal with nowhere else to be.','Photograph the same street in morning and evening light.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'Look beyond the checklist',intro:'Rome rewards wandering.',items:['Trastevere after dark.','Local markets and neighbourhood cafés.','Small churches, fountains and courtyards between the famous stops.']}
  }
 },
 bahamas:{
  id:'bahamas',name:'Bahamas',location:'Caribbean',hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Exuma%20Island%20%26%20Hog%20Cay%20%26%20Green%20Turtle%20Cay%20(Bahamas).jpg?width=2200',heroPos:'center 56%',tileHero:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-why-v4.jpg?v=1790700643',count:'1 / 5',badge:'BAHAMAS',tagline:['Turquoise waters.','Island stories.','Your next chapter.'],
  images:{why:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-why-v4.jpg?v=1790700643',spots:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-spots-v4.jpg?v=1790700650',memories:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-memories-v4.jpg?v=1790700656',local:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-local-v4.jpg?v=1790700663'},
  gallery:[['https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Exuma%20Island%20%26%20Hog%20Cay%20%26%20Green%20Turtle%20Cay%20(Bahamas).jpg?width=2200','Turquoise Bahamas'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-why-v4.jpg?v=1790700643','Island paradise'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-spots-v4.jpg?v=1790700650','Nassau waterfront'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-memories-v4.jpg?v=1790700656','Beach-day memories'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-bahamas-local-v4.jpg?v=1790700663','Food and cocktails by the sea']],
  facts:[['✈','Best time to visit','Dec – Apr'],['☀','Climate','Warm & sunny · All year'],['◉','Iconic status','Island Paradise'],['●','Location','Bahamas, Caribbean']],
  snapshot:{best:'Sea · Relaxation · Adventure',stay:'5–7 days',vibe:'Tropical · Calm · Unforgettable',tip:'Leave room for a boat day — many of the best memories happen away from the main island.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why the Bahamas?',intro:'Clear water, island landscapes and an easy pace make the Bahamas ideal for memory-led travel.',items:['World-class beaches and warm water.','Boat trips, wildlife and island hopping.','A trip that can be as relaxed or adventurous as you want.']},
   spots:{kicker:'TOP SPOTS',title:'Island highlights',intro:'The Bahamas is more than one beach.',items:['Exuma and its extraordinary water.','Nassau and Paradise Island.','Snorkelling reefs and quiet cays.','Boat trips to smaller islands.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'Moments made on the water',intro:'The strongest Bahamas memories tend to be simple.',items:['Swim somewhere impossibly blue.','Watch sunrise or sunset from the beach.','Take a boat out for a full island day.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'Island flavour',intro:'Slow down enough to notice the local character.',items:['Fresh seafood and conch.','Island music and markets.','Small beaches beyond the resort areas.']}
  }
 },
 miami:{
  id:'miami',name:'Miami',location:'Florida, USA',hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Ocean%20Drive%20-%20Miami%20Beach.jpg?width=2200',heroPos:'center 51%',tileHero:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-why-v4.jpg?v=1790700677',count:'1 / 5',badge:'MIAMI',tagline:['Sunshine days.','Vibrant nights.','Your next chapter.'],
  images:{why:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-why-v4.jpg?v=1790700677',spots:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-spots-v4.jpg?v=1790700684',memories:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-memories-v4.jpg?v=1790700691',local:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-local-v4.jpg?v=1790700698'},
  gallery:[['https://commons.wikimedia.org/wiki/Special:FilePath/Ocean%20Drive%20-%20Miami%20Beach.jpg?width=2200','Miami Art Deco sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-why-v4.jpg?v=1790700677','Ocean Drive colour'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-spots-v4.jpg?v=1790700684','Art Deco after dark'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-memories-v4.jpg?v=1790700691','Miami dusk'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-miami-local-v4.jpg?v=1790700698','Cuban food and local nightlife']],
  facts:[['✈','Best time to visit','Nov – Apr'],['☀','Climate','Hot & sunny · Year-round'],['◉','Iconic status','Vibrant City'],['●','Location','Florida, USA']],
  snapshot:{best:'Beach · Food · Culture',stay:'3–5 days',vibe:'Colourful · Energetic · Coastal',tip:'Treat Miami as several neighbourhoods, not one beach — South Beach is only the start.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why Miami?',intro:'Miami mixes beach life, Art Deco, Latin culture and warm evenings in a way few cities can.',items:['Start with the ocean, then explore inland neighbourhoods.','Enjoy a strong food and nightlife scene.','Use the city as a base for water and nature trips.']},
   spots:{kicker:'TOP SPOTS',title:'Miami essentials',intro:'Different areas give completely different versions of the city.',items:['South Beach and Ocean Drive.','Little Havana.','Biscayne Bay and waterfront views.','Wynwood and the Design District.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'Miami moments',intro:'The best memories often come from contrast.',items:['Early beach time before the crowds.','An evening on Ocean Drive.','Food and music in Little Havana.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'Beyond the postcard',intro:'Miami’s personality lives in its neighbourhoods.',items:['Cuban food and coffee.','Art, design and street culture.','Waterfront walks and sunset views.']}
  }
 },
 london:{
  id:'london',name:'London',location:'UK',hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Palace%20of%20Westminster%20at%20sunset%202026-09-05.jpg?width=2200',heroPos:'center 48%',tileHero:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-memories-v4.jpg?v=1790700724',count:'1 / 5',badge:'LONDON',tagline:['Iconic landmarks.','Incredible stories.','Your next chapter.'],
  images:{why:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-why-v4.jpg?v=1790700711',spots:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-spots-v4.jpg?v=1790700718',memories:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-memories-v4.jpg?v=1790700724',local:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-local-v4.jpg?v=1790700732'},
  gallery:[['https://commons.wikimedia.org/wiki/Special:FilePath/Palace%20of%20Westminster%20at%20sunset%202026-09-05.jpg?width=2200','Westminster at sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-why-v4.jpg?v=1790700711','London skyline'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-spots-v4.jpg?v=1790700718','Tower Bridge'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-memories-v4.jpg?v=1790700724','London Eye at sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-london-local-v4.jpg?v=1790700732','Borough Market food']],
  facts:[['✈','Best time to visit','Apr – Jun · Sep – Oct'],['☀','Climate','Mild summers · Cool winters'],['◉','Iconic status','World Famous'],['●','Location','London, UK']],
  snapshot:{best:'History · Culture · Food',stay:'3–5 days',vibe:'Iconic · Layered · Always changing',tip:'Plan by neighbourhood and Tube line — crossing London repeatedly can eat into a day.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why London?',intro:'London combines world-famous landmarks with neighbourhoods that each feel like a different city.',items:['History and modern culture sit side by side.','Museums, markets, parks and theatres give endless variety.','Every neighbourhood offers a different kind of day.']},
   spots:{kicker:'TOP SPOTS',title:'London essentials',intro:'Start with the icons, then branch out.',items:['Westminster and the Thames.','Tower Bridge and the Tower of London.','South Bank and Borough Market.','Museums and neighbourhood walks.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'London moments',intro:'Some of the best memories happen between the landmarks.',items:['Walk the Thames at dusk.','See the city from above.','Pick one market or neighbourhood and wander without a timetable.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'A city of neighbourhoods',intro:'London changes character every few Tube stops.',items:['Markets and independent food.','West End theatre and live music.','Parks, canals and quieter residential streets.']}
  }
 },
 paris:{
  id:'paris',name:'Paris',location:'France',hero:'https://commons.wikimedia.org/wiki/Special:FilePath/Eiffel%20Tower%20sunset%2C%20Paris%20(9249818803).jpg?width=2200',heroPos:'center 50%',tileHero:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-why-v4.jpg?v=1790700746',count:'1 / 5',badge:'PARIS',tagline:['Romance. Culture.','Iconic sights.','Your next chapter.'],
  images:{why:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-why-v4.jpg?v=1790700746',spots:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-spots-v4.jpg?v=1790700797',memories:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-memories-v4.jpg?v=1790700803',local:'https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-local-v4.jpg?v=1790700811'},
  gallery:[['https://commons.wikimedia.org/wiki/Special:FilePath/Eiffel%20Tower%20sunset%2C%20Paris%20(9249818803).jpg?width=2200','Paris at sunset'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-why-v4.jpg?v=1790700746','Eiffel Tower glow'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-spots-v4.jpg?v=1790700797','The Seine at dusk'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-memories-v4.jpg?v=1790700803','Paris memory at golden hour'],['https://cdn.shopify.com/s/files/1/1072/1938/6698/files/mu-paris-local-v4.jpg?v=1790700811','Parisian café life']],
  facts:[['✈','Best time to visit','Apr – Jun · Sep – Oct'],['☀','Climate','Warm summers · Cool winters'],['◉','Iconic status','Cultural Icon'],['●','Location','Paris, France']],
  snapshot:{best:'Art · Food · Romance',stay:'3–5 days',vibe:'Elegant · Historic · Atmospheric',tip:'Leave one afternoon completely unplanned — Paris is especially good when you wander.'},
  sections:{
   why:{kicker:'WHY VISIT?',title:'Why Paris?',intro:'Paris combines landmark architecture, art, food and neighbourhood life with an unmistakable sense of place.',items:['Iconic sights are woven into everyday streets.','World-class art and food reward slower travel.','River walks and neighbourhood cafés make the in-between moments matter.']},
   spots:{kicker:'TOP SPOTS',title:'Paris essentials',intro:'A strong first trip balances icons and neighbourhoods.',items:['Eiffel Tower and the Seine.','The Louvre and central Paris.','Montmartre.','Île de la Cité and the Latin Quarter.']},
   memories:{kicker:'BEST MEMORIES TO MAKE',title:'Paris moments',intro:'Paris is made for small rituals as much as big landmarks.',items:['Watch the Eiffel Tower after dark.','Sit at a café with nowhere to rush to.','Walk the Seine at golden hour.']},
   local:{kicker:'LOCAL HIGHLIGHTS',title:'Beyond the icons',intro:'The city feels most personal away from the biggest sights.',items:['Neighbourhood bakeries and markets.','Small museums and galleries.','Parks, bookshops and side streets.']}
  }
 }
};

const ORDER=['vegas','rome','bahamas','miami','london','paris'];

function hotspot(name,label,left,top,width,height){
 return `<button type="button" class="mu-exact-hotspot mu-exact-${name}" data-exact-action="${name}" aria-label="${label}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"></button>`;
}
function snapshotMarkup(c){
 return `<section class="mu-exact-travel-snapshot" aria-label="${c.name} travel snapshot">
  <div class="mu-exact-snapshot-head"><span>TRAVEL SNAPSHOT</span><em>Little details. Better journeys.</em></div>
  <div class="mu-exact-snapshot-grid">
    <div><small>BEST FOR</small><strong>${c.snapshot.best}</strong></div>
    <div><small>IDEAL STAY</small><strong>${c.snapshot.stay}</strong></div>
    <div><small>VIBE</small><strong>${c.snapshot.vibe}</strong></div>
  </div>
  <p><b>Good to know:</b> ${c.snapshot.tip}</p>
 </section>`;
}
function navMarkup(){
 return `<div class="mu-exact-nav-wrap">
  <img class="mu-exact-nav-art" src="${NAV_MASTER}" alt="">
  ${hotspot('home','Home',2.0,4.5,19.6,91)}
  ${hotspot('journeys','My Journeys',22.8,4.5,18.7,91)}
  ${hotspot('add','Add memory',43.7,3.5,12.8,93)}
  ${hotspot('navmemories','Memories',58.3,4.5,18.3,91)}
  ${hotspot('friends','Friends',78.2,4.5,19.0,91)}
 </div>`;
}
function vegasMarkup(){
 const c=CONFIG.vegas;
 return `<div class="mu-exact-discover-frame" data-current-destination="vegas">
  <div class="mu-exact-content-wrap">
   <img class="mu-exact-discover-art" src="${MASTER}" alt="Discover Las Vegas — Memories Unlocked">
   ${hotspot('gallery','Open Las Vegas photo gallery',0,5.96,100,37.70)}
   ${hotspot('back','Back',3.9,1.06,10.8,5.22)}
   ${hotspot('save','Save Las Vegas',71.3,35.68,11.4,6.60)}
   ${hotspot('share','Share Las Vegas',83.2,35.68,11.4,6.60)}
   ${hotspot('why','Why visit Las Vegas',2.4,53.99,46.0,13.63)}
   ${hotspot('spots','Top spots in Las Vegas',50.3,53.99,47.0,13.63)}
   ${hotspot('memories','Best memories to make',2.4,68.58,46.0,13.84)}
   ${hotspot('local','Local highlights',50.3,68.58,47.0,13.84)}
   ${hotspot('rome','Discover Rome',3.0,87.33,18.0,11.93)}
   ${hotspot('bahamas','Discover Bahamas',22.1,87.33,19.0,11.93)}
   ${hotspot('miami','Discover Miami',42.3,87.33,19.0,11.93)}
   ${hotspot('london','Discover London',62.1,87.33,18.4,11.93)}
   ${hotspot('paris','Discover Paris',81.0,87.33,17.0,11.93)}
  </div>
  ${snapshotMarkup(c)}
  ${navMarkup()}
 </div>`;
}
function dynIcon(kind){
 const common='viewBox="0 0 32 32" aria-hidden="true"';
 if(kind==='why')return `<svg ${common}><circle cx="9" cy="16" r="5"/><circle cx="23" cy="16" r="5"/><path d="M14 16h4M6 12l3-6 3 6M20 12l3-6 3 6"/></svg>`;
 if(kind==='spots')return `<svg ${common}><path d="M5 7l7-3 8 3 7-3v21l-7 3-8-3-7 3Z"/><path d="M12 4v21M20 7v21"/></svg>`;
 if(kind==='memories')return `<svg ${common}><rect x="4.5" y="9" width="23" height="17" rx="3"/><path d="M10 9l2-4h8l2 4"/><circle cx="16" cy="17.5" r="5"/></svg>`;
 return `<svg ${common}><path d="M8 4v10m-3-10v6a3 3 0 0 0 6 0V4M8 14v14M22 4c-3 3-4 7-4 11 0 3 2 5 4 5m0-16v24"/></svg>`;
}
function stampIcon(id){
 const common='viewBox="0 0 48 38" aria-hidden="true"';
 if(id==='vegas')return `<svg ${common}><path d="M7 21h34M11 21V13h26v8M15 13l9-8 9 8M24 5v16M10 27h28M14 31h20"/><path d="M10 9h5m18 0h5M5 16h6m26 0h6"/></svg>`;
 if(id==='rome')return `<svg ${common}><path d="M7 31V18c0-7 6-12 17-12s17 5 17 12v13M10 18h28M13 13h22M16 9h16M12 31V23h7v8m4 0v-9h5v9m4 0v-8h5v8"/></svg>`;
 if(id==='bahamas')return `<svg ${common}><path d="M24 32c-2-10-1-19 4-27M28 8c-5-4-10-4-14-1 5 1 9 3 12 6m2-5c5-4 10-3 14 0-5 1-9 3-12 6M9 33c9-5 22-5 31 0"/></svg>`;
 if(id==='miami')return `<svg ${common}><path d="M9 31V17h8v14m4 0V11h10v20m4 0V20h6v11"/><path d="M10 14c8-7 16-7 23-2"/></svg>`;
 if(id==='london')return `<svg ${common}><path d="M17 32V11h14v21M20 11V7h8v4M23 7V4h3v3"/><circle cx="24" cy="17" r="4"/><path d="M24 17v-2m0 2 2 2"/></svg>`;
 if(id==='paris')return `<svg ${common}><path d="M24 4 17 30m7-26 7 26M19 17h10M15 30h18M20 11h8M13 34h22"/></svg>`;
 return '';
}
function dynamicCard(key,c){
 const s=c.sections[key];
 const labels={why:'Why Visit?',spots:'Top Spots',memories:'Best Memories to Make',local:'Local Highlights'};
 const img=c.images?.[key]||c.hero;
 return `<button type="button" class="mu-dyn-card" data-exact-action="${key}" style="--dyn-card-image:url('${img}')">
   <span class="mu-dyn-card-shade"></span><span class="mu-dyn-card-icon">${dynIcon(key)}</span>
   <span class="mu-dyn-card-copy"><strong>${labels[key]}</strong><small>${s.intro}</small></span><span class="mu-dyn-card-arrow">›</span>
  </button>`;
}
function nextCards(current){
 return ORDER.filter(id=>id!==current).slice(0,5).map(id=>{
  const d=CONFIG[id];
  return `<button type="button" class="mu-dyn-next-card" data-exact-dest="${id}" style="--dyn-next-image:url('${d.tileHero||d.hero||MASTER}')">
    <span class="mu-dyn-next-badge">${d.badge||'LAS VEGAS'}</span><span class="mu-dyn-next-shade"></span>
    <span class="mu-dyn-next-copy"><strong>${d.name}</strong><small>${d.location}</small></span>
   </button>`;
 }).join('');
}
function dynamicMarkup(c){
 return `<div class="mu-exact-discover-frame" data-current-destination="${c.id}">
  <section class="mu-dyn-screen">
   <div class="mu-dyn-header"><img src="${HEADER_MASTER}" alt=""><button type="button" data-exact-action="back" aria-label="Back"></button></div>
   <section class="mu-dyn-hero" style="--dyn-hero:url('${c.hero}');--dyn-hero-pos:${c.heroPos||'center'}">
    <span class="mu-dyn-hero-shade"></span>
    <div class="mu-dyn-title"><small>DISCOVER</small><h1>${c.name}</h1><p>●&nbsp; ${c.location}</p><em>${c.tagline.join('<br>')}</em></div>
    <span class="mu-dyn-count">${c.count}</span>
    <span class="mu-dyn-stamp mu-landmark-badge"><img src="${BADGES[c.id]}" alt="${c.name} landmark badge"></span>
    <button type="button" class="mu-dyn-gallery-hit" data-exact-action="gallery" aria-label="Open ${c.name} photo gallery"></button>
    <div class="mu-dyn-actions"><button type="button" data-exact-action="save"><span>♡</span><small>Save</small></button><button type="button" data-exact-action="share"><span>↗</span><small>Share</small></button></div>
   </section>
   <section class="mu-dyn-facts">${c.facts.map(f=>`<div><span>${f[0]}</span><small>${f[1]}</small><strong>${f[2]}</strong></div>`).join('')}</section>
   <section class="mu-dyn-grid">${dynamicCard('why',c)}${dynamicCard('spots',c)}${dynamicCard('memories',c)}${dynamicCard('local',c)}</section>
   <section class="mu-dyn-next"><div class="mu-dyn-next-head"><h2>Where next?</h2><span>MORE INCREDIBLE PLACES ›</span></div><div class="mu-dyn-next-track">${nextCards(c.id)}</div></section>
  </section>
  ${snapshotMarkup(c)}
  ${navMarkup()}
 </div>`;
}

let currentId='vegas';
function getSavedMain(){try{const id=localStorage.getItem('mu_discover_main_destination');return CONFIG[id]?id:'vegas';}catch{return'vegas'}}
function renderCurrent(){
 const root=exactModal()?.querySelector('#muExactDiscoverRoot');if(!root)return;
 const c=CONFIG[currentId]||CONFIG.vegas;
 root.innerHTML=c.exact?vegasMarkup():dynamicMarkup(c);
 root.closest('.sheet')?.scrollTo?.({top:0,behavior:'auto'});
}
function switchDestination(id,remember=true){
 if(!CONFIG[id])return;
 currentId=id;
 if(remember){try{localStorage.setItem('mu_discover_main_destination',id)}catch{}}
 renderCurrent();
 if(remember&&id!=='vegas')window.toast?.(`${CONFIG[id].name} is now your Discover home.`);
}
function exactModal(){return document.getElementById('exactDiscoverModal');}
function clearOverlay(){exactModal()?.querySelectorAll('.mu-exact-layer').forEach(n=>n.remove())}
function closeExact(){clearOverlay();document.documentElement.classList.remove('mu-exact-discover-open');closeModal?.('exactDiscoverModal')}
function open(){
 if(typeof mountDialog!=='function')return;
 currentId=getSavedMain();
 document.documentElement.classList.add('mu-exact-discover-open');
 const modal=mountDialog('exactDiscoverModal','<div id="muExactDiscoverRoot"></div>','mu-exact-discover-modal');
 renderCurrent();
 return modal;
}

function infoHero(c,key){
 return c?.hero || (c?.id==='vegas'?VEGAS_GALLERY[0]?.src:'');
}
function infoPrompt(c,key){
 const prompts={
  why:`What would make ${c.name} feel worth travelling for — the atmosphere, the food, the history, the spectacle, or something personal?`,
  spots:`Which one place in ${c.name} would you want to see first — and what would make that moment yours?`,
  memories:`Imagine looking back in ten years. Which ${c.name} moment would you most want to have kept?`,
  local:`What would help you experience ${c.name} beyond the postcard and find the part that feels personal?`
 };
 return prompts[key]||`What would make ${c.name} unforgettable for you?`;
}
function infoKeyLabel(key){
 return {why:'THE EXPERIENCE',spots:'THE ICONS',memories:'THE MOMENTS',local:'BEYOND THE POSTCARD'}[key]||'DISCOVER';
}
function infoLayer(data,key='why'){
 const modal=exactModal(),c=CONFIG[currentId];if(!modal||!data||!c)return;
 clearOverlay();
 const hero=infoHero(c,key),gallery=currentGallery();
 const layer=document.createElement('div');layer.className='mu-exact-layer mu-exact-info-layer mu-premium-info-layer open';
 layer.innerHTML=`<section class="mu-premium-info-page">
  <header class="mu-premium-info-hero" style="--info-hero:url('${hero}');--info-hero-pos:${c.heroPos||'center'}">
   <span class="mu-premium-info-hero-shade"></span>
   <div class="mu-premium-info-topbar">
    <button type="button" class="mu-premium-info-back" data-exact-close-layer aria-label="Back to ${c.name}">‹</button>
    <span class="mu-premium-info-brand">MEMORIES <b>UNLOCKED</b></span>
    <button type="button" class="mu-premium-info-save" data-exact-save-trip aria-label="Save ${c.name}">♡</button>
   </div>
   <div class="mu-premium-info-title">
    <small>DISCOVER · ${c.name.toUpperCase()}</small>
    <h1>${data.title}</h1>
    <p>●&nbsp; ${c.location}</p>
   </div>
   <div class="mu-premium-info-stamp mu-landmark-badge"><img src="${BADGES[c.id]}" alt="${c.name} landmark badge"></div>
  </header>

  <main class="mu-premium-info-body">
   <section class="mu-premium-info-intro">
    <div class="mu-premium-info-rule"><span></span><b>${data.kicker}</b><span></span></div>
    <p>${data.intro}</p>
   </section>

   <section class="mu-premium-info-mini-grid">
    <div><small>BEST FOR</small><strong>${c.snapshot.best}</strong></div>
    <div><small>IDEAL STAY</small><strong>${c.snapshot.stay}</strong></div>
    <div><small>VIBE</small><strong>${c.snapshot.vibe}</strong></div>
   </section>

   <section class="mu-premium-info-points">
    ${data.items.map((x,i)=>`<article><b>0${i+1}</b><div><small>${['START HERE','MAKE TIME FOR','MEMORY WORTH MAKING','EXTRA TOUCH'][i]||'GOOD TO KNOW'}</small><p>${x}</p></div></article>`).join('')}
   </section>

   <aside class="mu-premium-info-memory">
    <span class="mu-premium-info-memory-icon">✦</span>
    <div><small>MEMORY PROMPT</small><p>${infoPrompt(c,key)}</p></div>
   </aside>

   <button type="button" class="mu-premium-info-gallery" data-info-gallery>
    <span class="mu-premium-info-gallery-thumb" style="--info-thumb:url('${gallery[1]?.src||hero}')"></span>
    <span><small>PHOTO STORY</small><strong>See ${c.name} through ${gallery.length||5} moments</strong></span>
    <b>›</b>
   </button>

   <section class="mu-premium-info-note">
    <small>GOOD TO KNOW</small>
    <p>${c.snapshot.tip}</p>
   </section>

   <div class="mu-premium-info-actions">
    <button type="button" data-exact-close-layer>Back to ${c.name}</button>
    <button type="button" class="primary" data-exact-save-trip>Save to bucket list</button>
   </div>
  </main>
 </section>`;
 modal.append(layer);
}

let galleryIndex=0;
function currentGallery(){
 const c=CONFIG[currentId];
 const source=(c?.gallery||[]);
 if(source.length)return source.map(([file,title])=>({src:/^https?:/i.test(file)?file:C(file),title,copy:`${title} — one of the places that gives ${c.name} its character.`}));
 return currentId==='vegas'?VEGAS_GALLERY:[];
}
function galleryLayer(index=0){
 const gallery=currentGallery();if(!gallery.length)return;
 const modal=exactModal();if(!modal)return;
 clearOverlay();galleryIndex=(index+gallery.length)%gallery.length;
 const c=CONFIG[currentId];
 const layer=document.createElement('div');layer.className='mu-exact-layer mu-exact-gallery-layer open';
 layer.innerHTML=`<section class="mu-exact-gallery-shell">
  <div class="mu-exact-gallery-top"><button type="button" data-exact-close-layer aria-label="Back">‹</button><span>${c.name.toUpperCase()} · PHOTO STORY</span><b data-gallery-counter></b></div>
  <div class="mu-exact-gallery-media" data-gallery-swipe><img data-gallery-image alt=""><button type="button" class="mu-exact-gallery-prev" data-gallery-prev aria-label="Previous photo">‹</button><button type="button" class="mu-exact-gallery-next" data-gallery-next aria-label="Next photo">›</button></div>
  <div class="mu-exact-gallery-copy"><small>DISCOVER</small><h2 data-gallery-title></h2><p data-gallery-copy></p><div class="mu-exact-gallery-dots">${gallery.map((_,i)=>`<button type="button" data-gallery-dot="${i}" aria-label="Photo ${i+1}"></button>`).join('')}</div></div>
 </section>`;
 modal.append(layer);renderGallery();
}
function renderGallery(){
 const layer=exactModal()?.querySelector('.mu-exact-gallery-layer');if(!layer)return;
 const gallery=currentGallery(),item=gallery[galleryIndex],img=layer.querySelector('[data-gallery-image]');if(!item)return;
 img.src=item.src;img.alt=item.title;
 layer.querySelector('[data-gallery-counter]').textContent=`${galleryIndex+1} / ${gallery.length}`;
 layer.querySelector('[data-gallery-title]').textContent=item.title;layer.querySelector('[data-gallery-copy]').textContent=item.copy;
 layer.querySelectorAll('[data-gallery-dot]').forEach((d,i)=>d.classList.toggle('active',i===galleryIndex));
}
function moveGallery(delta){const gallery=currentGallery();if(!gallery.length)return;galleryIndex=(galleryIndex+delta+gallery.length)%gallery.length;renderGallery()}
function saveCurrent(){
 const c=CONFIG[currentId];
 try{localStorage.setItem(`mu_saved_discover_${currentId}`,'1')}catch{}
 window.toast?.(`${c.name} added to your bucket list.`);
}

window.muOpenPremiumDiscover=open;window.muOpenVegasDiscover=open;window.muOpenExactDiscover=open;window.muOpenDiscoverDestination=id=>{open();setTimeout(()=>switchDestination(id,true),0)};

let heroPointerX=null,galleryPointerX=null,suppressHeroClick=0;
document.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-exact-action="gallery"]');if(h)heroPointerX=e.clientX;const g=e.target.closest('[data-gallery-swipe]');if(g)galleryPointerX=e.clientX});
document.addEventListener('pointerup',e=>{
 const h=e.target.closest('[data-exact-action="gallery"]');if(h&&heroPointerX!==null){const dx=e.clientX-heroPointerX;heroPointerX=null;if(Math.abs(dx)>38){suppressHeroClick=Date.now()+500;galleryLayer(dx<0?1:currentGallery().length-1);e.preventDefault();return}}
 const g=e.target.closest('[data-gallery-swipe]');if(g&&galleryPointerX!==null){const dx=e.clientX-galleryPointerX;galleryPointerX=null;if(Math.abs(dx)>38){moveGallery(dx<0?1:-1);e.preventDefault()}}
});

document.addEventListener('click',e=>{
 const closeLayer=e.target.closest('[data-exact-close-layer]');if(closeLayer){clearOverlay();return}
 const prev=e.target.closest('[data-gallery-prev]');if(prev){moveGallery(-1);return}
 const next=e.target.closest('[data-gallery-next]');if(next){moveGallery(1);return}
 const dot=e.target.closest('[data-gallery-dot]');if(dot){galleryIndex=Number(dot.dataset.galleryDot)||0;renderGallery();return}
 if(e.target.closest('[data-exact-save-trip]')){saveCurrent();return}
 if(e.target.closest('[data-info-gallery]')){clearOverlay();galleryLayer(0);return}

 const dest=e.target.closest('[data-exact-dest]');if(dest){switchDestination(dest.dataset.exactDest,true);return}
 const hit=e.target.closest('[data-exact-action]');if(!hit)return;
 const a=hit.dataset.exactAction;
 if(CONFIG[a]){switchDestination(a,true);return}
 if(a==='gallery'){if(Date.now()<suppressHeroClick)return;galleryLayer(0);return}
 if(a==='back'||a==='home'){closeExact();showView?.('home');return}
 if(a==='save'){saveCurrent();return}
 if(a==='share'){const c=CONFIG[currentId],p={title:`Memories Unlocked — ${c.name}`,text:`Discover ${c.name} with Memories Unlocked.`,url:location.href};if(navigator.share)navigator.share(p).catch(()=>{});else navigator.clipboard?.writeText(location.href).then(()=>window.toast?.('Link copied.'));return}
 if(a==='journeys'){closeExact();showView?.('journeys');return}
 if(a==='add'){closeExact();addMemory?.();return}
 if(a==='navmemories'){closeExact();showView?.('home');setTimeout(()=>document.querySelector('.mu-mm-memories')?.scrollIntoView({behavior:'smooth',block:'start'}),100);return}
 if(a==='friends'){closeExact();showView?.('follow');return}
 const section=CONFIG[currentId]?.sections?.[a];if(section){infoLayer(section,a);return}
});
})();