/* Memories Unlocked — Interactive Dashboard polish: friendly tools + deliberate floating-widget interaction. */
(function(){
const DOUBLE_TAP_MS=430;
const MOVE_LIMIT=9;
const ICONS={
  discover:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M29.5 18.5 26 26l-7.5 3.5L22 22z" fill="currentColor"/><circle cx="24" cy="24" r="2.4" fill="#fff"/></svg>`,
  capture:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 17h6l2-3h6l2 3h4a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V21a4 4 0 0 1 4-4Z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="28" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="34" cy="22" r="1.8" fill="currentColor"/></svg>`,
  footsteps:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 11c4 0 6 4.2 5.3 8.1-.8 4-3.7 7.3-6.7 6.8-3.1-.5-4.6-4.4-3.8-8.3C12.5 13.8 14.3 11 17 11Zm14.2 11.5c3.6.8 4.6 5.2 3.4 8.8-1.2 3.7-4.3 6.3-7 5.3-2.8-1-3.6-5-2.4-8.5 1.2-3.5 3.5-6.2 6-5.6Z" fill="currentColor"/><circle cx="12.5" cy="30.5" r="2.4" fill="currentColor"/><circle cx="19" cy="32.5" r="2" fill="currentColor"/><circle cx="30.5" cy="14.5" r="2.3" fill="currentColor"/><circle cx="36" cy="18.5" r="1.9" fill="currentColor"/></svg>`,
  share:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 29 35 13m0 0H24m11 0v11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 28v7a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V19a4 4 0 0 1 4-4h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  legacy:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 39S10 31.2 10 20.6C10 14.6 17.2 11 24 17c6.8-6 14-2.4 14 3.6C38 31.2 24 39 24 39Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 17v15m-5-7h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".65"/></svg>`
};
const COPY={
  discover:['Discover','Learn a place'],
  capture:['Capture','Save a moment'],
  footsteps:['Footsteps','Track a walk'],
  share:['Share','Send a memory'],
  legacy:['Legacy','Build a tribute']
};
function activeJourneys(){return (typeof journeys!=='undefined'?journeys:[]).filter(j=>!j?.archived);}
function activeMemories(){const ids=new Set(activeJourneys().map(j=>String(j.id)));return (typeof memories!=='undefined'?memories:[]).filter(m=>!m?.archived&&ids.has(String(m.journeyId)));}
function latestContext(){
  const ms=activeMemories().filter(m=>m?.location).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(ms.length)return{kind:'memory',id:ms[0].id,label:ms[0].location};
  const js=activeJourneys().filter(j=>j?.location);
  if(js.length)return{kind:'journey',id:js[0].id,label:js[0].location};
  return null;
}
function openLatest(){
  const ctx=latestContext();
  if(ctx?.kind==='memory'&&typeof viewMemoryOnMap==='function'){viewMemoryOnMap(ctx.id);return;}
  if(ctx?.kind==='journey'&&typeof openJourneyMap==='function'){openJourneyMap(ctx.id);return;}
  if(typeof showView==='function')showView('map');
}
function openDiscover(){
  const ctx=latestContext();
  if(!ctx){window.toast?.('Add a journey or memory location first, then Discover can tell its story.');return;}
  if(typeof window.muOpenPlaceIntelligence==='function'){window.muOpenPlaceIntelligence(ctx.kind,ctx.id);return;}
  const tool=document.querySelector('[data-mu-tool="discover"]');
  if(tool){tool.click();return;}
  window.toast?.('Discover is still loading. Try again in a moment.');
}
function polishTools(){
  document.querySelectorAll('.dash-master-benefits.mu-tools-ready [data-mu-tool]').forEach(tool=>{
    const key=tool.dataset.muTool,icon=tool.querySelector('.dash-benefit-icon'),copy=tool.querySelector('span:not(.dash-benefit-icon)');
    tool.classList.add('mu-friendly-tool');
    if(icon&&ICONS[key]&&icon.dataset.muFriendly!=='1'){icon.dataset.muFriendly='1';icon.innerHTML=ICONS[key];}
    const values=COPY[key];if(copy&&values){const b=copy.querySelector('b'),small=copy.querySelector('small');if(b)b.textContent=values[0];if(small)small.textContent=values[1];}
  });
}
function bindWidget(el){
  if(!el||el.dataset.muDeliberateTap==='1')return;
  el.dataset.muDeliberateTap='1';
  el.setAttribute('title','Drag to move · double tap to open');
  const current=el.getAttribute('aria-label')||'';
  el.setAttribute('aria-label',(current?current+'. ':'')+'Drag to move; double tap to open.');
  let down=null,lastTap=0,selectedTimer=null;
  el.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;down={x:e.clientX,y:e.clientY};},true);
  el.addEventListener('pointerup',e=>{
    if(!down)return;const distance=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(distance>MOVE_LIMIT){lastTap=0;el.classList.remove('mu-widget-selected');return;}
    const now=Date.now();
    if(now-lastTap<=DOUBLE_TAP_MS){lastTap=0;clearTimeout(selectedTimer);el.classList.remove('mu-widget-selected');if(el.id==='appDiscoverChip')openDiscover();else openLatest();}
    else{lastTap=now;el.classList.add('mu-widget-selected');clearTimeout(selectedTimer);selectedTimer=setTimeout(()=>{el.classList.remove('mu-widget-selected');lastTap=0;},DOUBLE_TAP_MS+80);}
  },true);
  /* Single clicks are deliberately inert. This also blocks the older one-click handlers. */
  el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
  /* Double-click is handled by pointer timing above; block the former double-click reset action. */
  el.addEventListener('dblclick',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
  el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(el.id==='appDiscoverChip')openDiscover();else openLatest();}},true);
}
function refresh(){polishTools();bindWidget(document.getElementById('appPlaceChip'));bindWidget(document.getElementById('appDiscoverChip'));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
new MutationObserver(()=>queueMicrotask(refresh)).observe(document.documentElement,{childList:true,subtree:true});
})();