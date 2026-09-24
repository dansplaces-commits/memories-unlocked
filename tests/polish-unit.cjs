/* Pure-JS regressions; no browser, credentials, network, or production writes. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
function storage(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
function uiContext(){
  const context=vm.createContext({localStorage:storage(),document:{addEventListener(){},getElementById(){return null;},querySelector(){return {};}},window:{},Intl,Date,console});
  vm.runInContext(source('map.js'),context);vm.runInContext(source('ui.js'),context);
  const boot='setupDialogs();initAppearance();render();openLinkedJourney();initCloud();';
  assert.equal(source('app.js').split(boot).length,2,'Only the explicit application boot is removed in the unit harness');
  vm.runInContext(source('app.js').replace(boot,''),context);
  return context;
}
test('stamp dates are explicit and do not invent dates for incomplete records',()=>{
  const c=uiContext();
  assert.match(vm.runInContext("travelStamp('Rome, Italy','2022-07-29')",c),/29 Jul 2022/);
  assert.match(vm.runInContext("travelStamp('Rome, Italy','2024-02-29')",c),/29 Feb 2024/);
  for(const date of ['',null,'nonsense','2022-02-31','2023-02-29']){
    c.date=date;assert.match(vm.runInContext("travelStamp('Rome',date)",c),/>Undated</);
  }
  assert.match(vm.runInContext("travelStamp('','')",c),/A place to remember/);
});
test('stamp text is escaped and the complete saved location remains in the card',()=>{
  const c=uiContext();
  c.place='Rome <img src=x onerror=alert(1)> & friends, Italy';
  const markup=vm.runInContext("travelStamp(place,'2022-07-29','<script>')",c);
  assert.doesNotMatch(markup,/<img|<script>/);assert.match(markup,/&lt;img/);assert.match(markup,/&amp;/);
  c.journey={id:'j1',title:'A long chapter',location:'Saint-Rémy-de-Provence, Provence-Alpes-Côte d’Azur, France',start:'',privacy:'Private',story:''};
  const html=vm.runInContext('card(journey)',c);
  assert.ok(html.includes(c.journey.location));assert.match(html,/aria-hidden="true"/);
});
test('card and detail presentation never changes saved journey or memory records',()=>{
  const c=uiContext();
  vm.runInContext("journeys=[{id:'j',title:'Chapter',location:'Rome',start:'2022-07-29',code:'QA',privacy:'Private',cloud:true}];memories=[{id:'m',journeyId:'j',title:'Steps',location:'Rome',date:'2022-07-29',clue:'Follow the trail',latitude:0,longitude:0,extrasPending:true,cloud:true}];",c);
  const before=vm.runInContext('JSON.stringify({journeys,memories})',c);
  const cacheBefore=[...c.localStorage.values];
  vm.runInContext("card(journeys[0]);memoryBlock(memories[0],1);mountDialog=()=>({});closeModal=()=>{};makeQR=()=>{};openJourney('j');openMemory('m');",c);
  assert.equal(vm.runInContext('JSON.stringify({journeys,memories})',c),before);
  assert.deepEqual([...c.localStorage.values],cacheBefore);
});
test('account-switch and sign-out cache boundaries remain unchanged',()=>{
  const c=uiContext();
  vm.runInContext("journeys=[{id:'cloud',cloud:true},{id:'device',cloud:false}];memories=[{id:'m-cloud',journeyId:'cloud',cloud:true},{id:'m-device',journeyId:'device',cloud:false}];setStorageScope('account:a');prepareSignedOutCache();",c);
  assert.equal(vm.runInContext('JSON.stringify(journeys.map(j=>j.id))',c),'["device"]');
  assert.equal(vm.runInContext('JSON.stringify(memories.map(m=>m.id))',c),'["m-device"]');
  vm.runInContext("setStorageScope('account:a');switchToAccountScope('b');",c);
  assert.equal(vm.runInContext('journeys.length+memories.length',c),0);
  assert.equal(c.localStorage.getItem('mu_storage_scope'),'account:b');
});

class Element {
  constructor(tag='div',classes=''){
    this.tag=tag;this.classes=new Set(classes.split(' ').filter(Boolean));this.children=[];this.attrs={};this.dataset={};this.listeners={};this.textContent='';
    this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c),toggle:c=>{if(this.classes.has(c)){this.classes.delete(c);return false;}this.classes.add(c);return true;}};
  }
  setAttribute(k,v){this.attrs[k]=String(v);}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  emit(k,event={}){for(const fn of this.listeners[k]||[])fn({target:this,...event});}
  contains(el){return this===el||this.children.some(c=>c.contains(el));}
  focus(){this.focused=true;}
  querySelectorAll(selector){
    const matches=el=>selector==='[data-mu-map-style]'?Boolean(el.dataset.muMapStyle):selector.startsWith('.')?el.classes.has(selector.slice(1)):el.tag===selector;
    return this.children.flatMap(c=>[...(matches(c)?[c]:[]),...c.querySelectorAll(selector)]);
  }
  querySelector(selector){if(selector.includes(' ')){const [parent,child]=selector.split(' ');return this.querySelector(parent)?.querySelector(child)||null;}return this.querySelectorAll(selector)[0]||null;}
  set innerHTML(html){
    this.children=[];
    if(html.includes('mu-map-layers-toggle')){
      const toggle=new Element('button','mu-map-layers-toggle');toggle.attrs['aria-expanded']='false';toggle.children.push(new Element('b'));
      const options=new Element('div','mu-map-options');
      for(const key of ['street','satellite','terrain','explorer']){const btn=new Element('button');btn.dataset.muMapStyle=key;options.children.push(btn);}
      this.children.push(toggle,options);
    }else if(html.includes('<b>My location')){this.children.push(new Element('span'),new Element('b'));}
  }
}
function mapContext(saved){
  const localStorage=storage();if(saved)localStorage.setItem('mu_map_style_v1',saved);
  const documentListeners=new Map(),notice=new Element(),layers=[];
  const document={readyState:'loading',getElementById:()=>notice,addEventListener:(k,fn)=>documentListeners.set(fn,k),removeEventListener:(k,fn)=>documentListeners.delete(fn)};
  const frames=[];const context=vm.createContext({document,localStorage,window:{addEventListener(){},matchMedia:()=>({matches:true})},navigator:{},requestAnimationFrame:fn=>frames.push(fn)});
  const L={
    tileLayer:(tiles,options)=>{const layer={tiles,options,listeners:{},on(k,fn){this.listeners[k]=fn;return this;},addTo(map){map.layers.add(this);return this;},bringToBack(){}};layers.push(layer);return layer;},
    control:()=>({addTo(map){this.el=this.onAdd();map.container.children.push(this.el);map.controls.push(this);return this;}}),
    DomUtil:{create:(tag,classes,parent)=>{const el=new Element(tag,classes);parent?.children.push(el);return el;}},
    DomEvent:{disableClickPropagation(){},disableScrollPropagation(){}}
  };
  context.L=L;vm.runInContext(source('map-upgrade.js'),context);
  const map={container:new Element(),controls:[],layers:new Set(),getContainer(){return this.container;},removeLayer(layer){this.layers.delete(layer);}};
  context.makeTileLayer(map,'mapNotice');frames.splice(0).forEach(fn=>fn());
  const box=map.container.querySelector('.mu-map-control'),toggle=box.querySelector('.mu-map-layers-toggle');
  const choose=key=>box.querySelectorAll('[data-mu-map-style]').find(btn=>btn.dataset.muMapStyle===key).emit('click');
  return {context,map,box,toggle,choose,layers,notice,localStorage,documentListeners};
}
test('all four styles keep one tile layer and leave non-tile memory layers untouched',()=>{
  const h=mapContext();const pins={type:'memory-pins'};h.map.layers.add(pins);
  for(const style of ['satellite','terrain','explorer','street']){
    h.choose(style);assert.equal(h.localStorage.getItem('mu_map_style_v1'),style);
    assert.equal(h.map.layers.size,2);assert.ok(h.map.layers.has(pins));
    const pressed=h.box.querySelectorAll('[data-mu-map-style]').filter(b=>b.attrs['aria-pressed']==='true');assert.equal(pressed.length,1);assert.equal(pressed[0].dataset.muMapStyle,style);
  }
  assert.deepEqual([...h.localStorage.values.keys()],['mu_map_style_v1']);
});
test('layer disclosure closes on selection, Escape, and outside click with matching ARIA state',()=>{
  const h=mapContext();h.toggle.emit('click');assert.equal(h.toggle.attrs['aria-expanded'],'true');h.choose('terrain');
  assert.equal(h.toggle.attrs['aria-expanded'],'false');assert.equal(h.box.classList.contains('open'),false);assert.ok(h.toggle.focused);
  h.toggle.emit('click');let stopped=false;h.box.emit('keydown',{key:'Escape',preventDefault(){},stopPropagation(){stopped=true;}});
  assert.ok(stopped);assert.equal(h.toggle.attrs['aria-expanded'],'false');
  h.toggle.emit('click');for(const fn of h.documentListeners.keys())fn({target:new Element()});
  assert.equal(h.toggle.attrs['aria-expanded'],'false');h.map.controls[0].onRemove();assert.equal(h.documentListeners.size,0);
});
test('late errors from an old layer cannot change a new selection; failed current style falls back safely',()=>{
  const h=mapContext();h.choose('satellite');const old=h.layers.at(-1);h.choose('terrain');
  for(let i=0;i<5;i++)old.listeners.tileerror();
  assert.equal(h.localStorage.getItem('mu_map_style_v1'),'terrain');assert.equal(h.notice.textContent,'');
  const terrain=h.layers.at(-1);h.toggle.emit('click');for(let i=0;i<4;i++)terrain.listeners.tileerror();
  assert.equal(h.localStorage.getItem('mu_map_style_v1'),'street');assert.equal(h.toggle.attrs['aria-expanded'],'false');assert.equal(h.map.layers.size,1);
});
test('invalid saved styles use Street, including inherited object-property names',()=>{
  for(const saved of ['unknown','constructor','__proto__'])assert.equal(mapContext(saved).localStorage.getItem('mu_map_style_v1'),'street');
});

test('runtime loader skips scripts already declared by the page',()=>{
  const appendedScripts=[];
  const directScripts=['media.js?v=direct','mobile-master-v1.js?v=direct','mobile-boot-release.js?v=direct']
    .map(src=>({getAttribute:name=>name==='src'?src:null}));
  const document={
    scripts:directScripts,
    readyState:'complete',
    getElementById(){return null;},
    createElement(tag){return tag==='script'?{tag,getAttribute(){return null;}}:{tag};},
    head:{appendChild(){}},
    body:{appendChild(node){if(node.tag==='script')appendedScripts.push(node.src);}},
    addEventListener(){}
  };
  const window={matchMedia:()=>({matches:false}),supabase:undefined};
  vm.runInContext(source('supabase-config.js'),vm.createContext({window,document,console}));
  const paths=appendedScripts.map(src=>String(src).split('?')[0]);
  assert.ok(paths.includes('editing.js'),'dynamic-only scripts still load');
  assert.ok(!paths.includes('media.js'),'media.js must not load twice');
  assert.ok(!paths.includes('mobile-master-v1.js'),'mobile master must not load twice');
  assert.ok(!paths.includes('mobile-boot-release.js'),'mobile boot must not load twice');
});

test('memory story stays optional in both app and cloud schema',()=>{
  const app=source('app.js');
  assert.match(app,/if\(!title\|\|!location\|\|!findJourney\(journeyId\)\)/);
  const migration=source('supabase/20260923_allow_empty_memory_story.sql');
  assert.match(migration,/check \(char_length\(story\) <= 10000\)/i);
  assert.doesNotMatch(migration,/char_length\(btrim\(story\)\) >= 1/i);
});

test('photo preview avoids Base64 memory inflation on phones',()=>{
  const media=source('media.js');
  assert.match(media,/URL\.createObjectURL\(selected\)/);
  assert.match(media,/URL\.revokeObjectURL\(previewUrl\)/);
  assert.doesNotMatch(media,/readAsDataURL\(/);
  const storageMigration=source('supabase/20260916_media_storage.sql');
  assert.match(storageMigration,/26214400/);
});


test('mobile Home keeps scenic fallback and signed cloud photos visible',()=>{
  const mobile=source('mobile-master-v1.js');
  const fixes=source('mobile-master-v1-fixes.css');
  assert.match(mobile,/function paintPhotoSurface\(/);
  assert.match(mobile,/class="mu-mm-photo-surface"/);
  assert.match(mobile,/paintPhotoSurface\(el,u,'linear-gradient/);
  assert.match(fixes,/2026-09-23 scenic photo visibility lock/);
  assert.match(fixes,/\.mu-mm-photo-surface\{[\s\S]*opacity:1!important[\s\S]*visibility:visible!important/);
});


test('mobile detail sheets scroll above fixed nav and respect safe areas',()=>{
  const fixes=source('mobile-master-v1-fixes.css');
  assert.match(fixes,/mobile detail scroll \+ safe-area lock/);
  assert.match(fixes,/\.journey-detail\.modal,[\s\S]*z-index:12000!important/);
  assert.match(fixes,/\.journey-detail \.sheet,[\s\S]*height:100dvh!important[\s\S]*overflow-y:auto!important/);
  assert.match(fixes,/padding-bottom:calc\(120px \+ env\(safe-area-inset-bottom\)\)!important/);
  assert.match(fixes,/padding-top:calc\(28px \+ env\(safe-area-inset-top\)\)!important/);
});


test('mobile journey detail balances compact hero with larger saved photo',()=>{
  const fixes=source('mobile-master-v1-fixes.css');
  assert.match(fixes,/mobile journey photo breathing room/);
  assert.match(fixes,/\.journey-detail \.story-photo-media\.has-photo\{[\s\S]*min-height:315px!important/);
  assert.match(fixes,/mobile journey hero balance/);
  assert.match(fixes,/\.journey-detail \.journey-detail-hero\{[\s\S]*padding-bottom:14px!important/);
  assert.match(fixes,/\.journey-detail \.journey-detail-hero h2\{[\s\S]*font-size:32px!important/);
});


test('Las Vegas Discover uses the approved premium master layout',()=>{
  const js=source('place-intelligence.js');
  const css=source('place-intelligence.css');
  assert.match(js,/function muIsLasVegasContext\(/);
  assert.match(js,/muVegasBadge\('hero'\)/);
  assert.match(js,/Best time to visit/);
  assert.match(js,/Best Memories to Make/);
  assert.match(css,/2026-09-23 Las Vegas Discover master/);
  assert.match(css,/\.mu-vegas-hero\{/);
  assert.match(css,/\.mu-vegas-grid\{/);
  assert.match(css,/\.mu-vegas-card\{/);
});


test('curated Discover is independent of saved travel and uses smaller iconic badges',()=>{
  const hub=source('discover-destinations.js');
  const css=source('discover-destinations.css');
  const mobile=source('mobile-master-v1.js');
  assert.match(hub,/Discover\.<\/h2>/);
  assert.match(hub,/BUCKET-LIST INSPIRATION/);
  assert.match(hub,/id:'las-vegas'/);
  assert.match(hub,/id:'rome'/);
  assert.match(hub,/id:'bahamas'/);
  assert.match(hub,/id:'miami'/);
  assert.match(hub,/mu_bucket_list_v1/);
  assert.match(css,/\.mu-dest-badge-card\{right:9px!important;top:9px!important;width:46px!important;height:46px!important/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.mu-dest-badge-card\{width:40px!important;height:40px!important/);
  assert.match(mobile,/Explore Bucket List Places/);
  assert.match(mobile,/window\.muOpenDiscoverHub/);
});

test('standalone Las Vegas Discover opens without requiring a saved journey',()=>{
  const js=source('place-intelligence.js');
  assert.match(js,/window\\.muOpenLegacyVegasDiscover=async function/);
  assert.match(js,/latitude:36\.1699,longitude:-115\.1398/);
  assert.match(js,/renderVegasIntel\(modal,ctx,data\)/);
});


test('all global Discover entry points ignore latest saved place',()=>{
  const surface=source('discover-surface.js');
  const hub=source('discover-destinations.js');
  const mobile=source('mobile-master-v1.js');
  assert.match(surface,/Bucket List Places/);
  assert.doesNotMatch(surface,/chip\.dataset\.homeDiscoverKind=place\.kind/);
  assert.match(surface,/chip\.dataset\.muTool='discover'/);
  assert.match(hub,/Global Discover route lock/);
  assert.match(hub,/\[data-home-discover-kind\],\[data-mu-tool="discover"\]/);
  assert.match(mobile,/if\(key==='discover'\).*muOpenDiscoverHub/);
});


test('premium Discover cosmetic pass keeps scenic hero and compact badges',()=>{
  const hub=source('discover-destinations.js');
  const css=source('discover-destinations.css');
  assert.match(hub,/data-dest-wiki="Las Vegas Strip"/);
  assert.match(hub,/imageWiki:'Colosseum'/);
  assert.match(hub,/imageWiki:'Exuma'/);
  assert.match(hub,/imageWiki:'Miami Beach, Florida'/);
  assert.match(hub,/Discover\.<\/h2>/);
  assert.match(css,/2026-09-24 premium Discover cosmetic lock/);
  assert.match(css,/\.mu-dest-badge-card\{right:9px!important;top:9px!important;width:46px!important;height:46px!important/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.mu-dest-badge-card\{width:40px!important;height:40px!important/);
  assert.match(css,/\.mu-discover-hub-modal \.mu-discover-hero h2\{[\s\S]*color:#fff!important/);
  assert.match(css,/var\(--dest-image/);
});


test('Discover lands on featured Las Vegas before destination browsing',()=>{
  const vegas=source('place-intelligence.js');
  const destinations=source('discover-destinations.js');
  const mobile=source('mobile-master-v1.js');
  const css=source('place-intelligence.css');
  assert.match(vegas,/fetchVegasEditorialImages/);
  assert.match(vegas,/Bellagio \(resort\)/);
  assert.match(vegas,/Red Rock Canyon National Conservation Area/);
  assert.match(vegas,/Fremont Street Experience/);
  assert.match(vegas,/mu-vegas-next-section/);
  assert.match(vegas,/muDiscoverFeaturedStrip/);
  assert.match(destinations,/if\(typeof window\.muOpenVegasDiscover==='function'\)window\.muOpenVegasDiscover\(\)/);
  assert.match(mobile,/if\(key==='discover'\).*muOpenVegasDiscover/);
  assert.match(css,/2026-09-24 featured Discover landing lock/);
  assert.match(css,/--vegas-card-image/);
  assert.match(css,/\.mu-vegas-next-track/);
});


test('premium Discover uses fixed curated visuals and isolated layout',()=>{
  const js=source('discover-premium.js');
  const css=source('discover-premium.css');
  assert.match(js,/const STATIC=\{/);
  assert.match(js,/Bellagio%20Fountains%20at%20night\.jpg/);
  assert.match(js,/assets\/bahamas-escape\.jpg/);
  assert.doesNotMatch(js,/wikiThumb/);
  assert.doesNotMatch(js,/commonsThumb/);
  assert.match(js,/window\.muOpenVegasDiscover=modal/);
  assert.match(css,/\.mu-premium-discover-modal\{z-index:9000!important/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.mu-pd-hero\{height:310px/);
  assert.match(css,/\.mu-pd-bottom-pad\{height:100px/);
});
