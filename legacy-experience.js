/* Memories Unlocked — archive means out of the active feed, not erased from the world. */
(function(){
  function allJourneyMemories(id){
    return (typeof memories!=='undefined'?memories:[])
      .filter(m=>String(m.journeyId)===String(id))
      .slice()
      .sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||String(a.id).localeCompare(String(b.id)));
  }
  function isLegacyMemory(memory){
    if(!memory)return false;
    const parent=typeof findJourney==='function'?findJourney(memory.journeyId):null;
    return Boolean(memory.archived||parent?.archived);
  }
  function activeJourneys(){return (typeof journeys!=='undefined'?journeys:[]).filter(j=>!j.archived);}
  function activeMemories(){
    const ids=new Set(activeJourneys().map(j=>String(j.id)));
    return (typeof memories!=='undefined'?memories:[]).filter(m=>!m.archived&&ids.has(String(m.journeyId)));
  }
  function legacyMemories(){return (typeof memories!=='undefined'?memories:[]).filter(isLegacyMemory);}
  window.muIsLegacyMemory=isLegacyMemory;
  window.muAllJourneyMemories=allJourneyMemories;

  /* Hard-stop archived content from leaking back into desktop recents after async refreshes. */
  function pruneDesktop(){
    const active=activeMemories();
    const activeIds=new Set(active.map(m=>String(m.id)));
    document.querySelectorAll('.dash-recent [data-id]').forEach(node=>{
      if(!activeIds.has(String(node.dataset.id)))node.remove();
    });
    const recent=document.querySelector('.dash-recent');
    if(recent&&!recent.querySelector('[data-id]')&&!recent.querySelector('.empty'))recent.innerHTML='<div class="empty">Your active memories will appear here.</div>';
    const stats=document.querySelectorAll('.dash-stats .dash-stat');
    if(stats[0]){const n=activeJourneys().length;stats[0].querySelector('strong').textContent=n;stats[0].querySelector('span').textContent=n===1?'Journey':'Journeys';}
    if(stats[1]){const n=active.length;stats[1].querySelector('strong').textContent=n;stats[1].querySelector('span').textContent=n===1?'Memory':'Memories';}
    if(stats[2]){const n=new Set(active.map(m=>(m.location||'').trim().toLowerCase()).filter(Boolean)).size;stats[2].querySelector('strong').textContent=n;stats[2].querySelector('span').textContent=n===1?'Place':'Places';}
  }
  let pruneQueued=false;
  function queuePrune(){if(pruneQueued)return;pruneQueued=true;requestAnimationFrame(()=>{pruneQueued=false;pruneDesktop();});}
  const dashboard=document.querySelector('.desktop-dashboard');
  if(dashboard)new MutationObserver(queuePrune).observe(dashboard,{childList:true,subtree:true});
  ['recentMemories','journeyList','allJourneys'].forEach(id=>{const node=document.getElementById(id);if(node)new MutationObserver(queuePrune).observe(node,{childList:true,subtree:true});});
  queuePrune();

  function legacyMarkerIcon(label,count=1){
    return L.divIcon({className:'memory-map-marker memory-map-marker-legacy',html:`<span>${esc(label)}</span>${count>1?`<sup>+${count-1}</sup>`:''}<em>LEGACY</em>`,iconSize:[48,56],iconAnchor:[24,50]});
  }
  function mapLegacyMemories(){
    const list=legacyMemories();
    return mapJourneyId?list.filter(m=>String(m.journeyId)===String(mapJourneyId)):list;
  }
  function ensureLegend(){
    const host=document.querySelector('#map .map-toolbar');if(!host||host.querySelector('.mu-story-map-legend'))return;
    const legend=document.createElement('div');legend.className='mu-story-map-legend';legend.innerHTML='<span><i class="active"></i>Active memory</span><span><i class="legacy"></i>Legacy memory</span>';
    host.appendChild(legend);
  }
  function legacyRow(m){
    const parent=findJourney(m.journeyId);
    return `<button type="button" class="memory clickable-memory legacy-memory-row" data-legacy-memory-id="${esc(m.id)}"><span class="memory-number" aria-hidden="true">◇</span><span class="memory-copy"><strong>${esc(m.title||'Memory')}</strong><span>${esc(m.location||'Location not added')}</span><small>${esc(formatDate(m.date))} · Legacy trail${parent?.archived?' · archived journey':''}</small></span><span class="legacy-map-badge">LEGACY</span><span class="memory-arrow" aria-hidden="true">↗</span></button>`;
  }
  function hydrateLegacyPhoto(modal,m){
    const slot=modal?.querySelector('.legacy-photo');if(!slot)return;
    if(!m.photoPath||typeof muMediaSignedUrl!=='function')return;
    muMediaSignedUrl(m.photoPath).then(url=>{if(!url||!slot.isConnected)return;slot.classList.add('has-photo');slot.innerHTML=`<img src="${esc(url)}" alt="${esc(m.title||'Legacy memory')}"><span>LEGACY MEMORY</span>`;}).catch(()=>{});
  }
  window.muOpenLegacyMemory=function(id){
    const m=findMemory(id);if(!m)return;
    const j=findJourney(m.journeyId);
    const restoreKind=j?.archived?'journey':'memory',restoreId=j?.archived?j.id:m.id;
    const modal=mountDialog('legacyMemoryModal',`<button class="close" type="button" onclick="closeModal('legacyMemoryModal')">×</button><span class="eyebrow">LEGACY TRAIL</span><h2>${esc(m.title||'Memory')}</h2><p class="legacy-place">📍 ${esc(m.location||'Location not added')} · ${esc(formatDate(m.date))}</p><div class="legacy-photo"><span>◇</span><small>${m.photoPath?'Loading photograph…':'A place in your story'}</small></div><section class="legacy-story"><span class="eyebrow">THE MEMORY</span><p>${esc(m.story)||'This memory remains part of the journey trail.'}</p></section>${m.clue?`<section class="legacy-clue"><span class="eyebrow">🔐 CLUE LEFT HERE</span><p>${esc(m.clue)}</p></section>`:''}<div class="legacy-actions"><button class="save" type="button" data-place-intel="memory" data-place-id="${esc(m.id)}">Discover this place</button><button class="secondary" type="button" data-archive-action="restore" data-archive-kind="${restoreKind}" data-archive-id="${esc(restoreId)}">${j?.archived?'Restore journey':'Restore memory'}</button></div><p class="small">Legacy memories leave the active feed but stay on the map so the footsteps can still be followed.</p>`,'legacy-memory-detail');
    hydrateLegacyPhoto(modal,m);
  };

  if(typeof updateMapFilter==='function'){
    updateMapFilter=function(){
      const select=$('mapJourneyFilter');if(!select)return;
      const all=typeof journeys!=='undefined'?journeys:[];
      if(mapJourneyId&&!all.some(j=>String(j.id)===String(mapJourneyId)))mapJourneyId='';
      select.innerHTML='<option value="">All my journeys</option>'+all.map(j=>`<option value="${esc(j.id)}">${esc(j.title)}${j.archived?' · Legacy':''}</option>`).join('');
      select.value=mapJourneyId;
      ensureLegend();
    };
  }

  if(typeof renderMemoryMap==='function'){
    const baseRenderMemoryMap=renderMemoryMap;
    renderMemoryMap=function(){
      baseRenderMemoryMap();
      ensureLegend();
      if(!window.L||!memoryMap||!memoryLayers)return;
      const legacy=mapLegacyMemories();
      const located=legacy.filter(m=>validPoint(m.latitude,m.longitude));
      const positions=mapPositions(located),groups=new Map();

      /* Archived journeys remain full historical trails. */
      const selected=(mapJourneyId?(journeys||[]).filter(j=>String(j.id)===String(mapJourneyId)):(journeys||[])).filter(j=>j.archived);
      selected.forEach(j=>{
        const line=allJourneyMemories(j.id).filter(m=>validPoint(m.latitude,m.longitude)).map(m=>positions.get(String(m.id))||pointOf(m));
        if(line.length>1)L.polyline(line,{color:'#8b7654',weight:3,dashArray:'3 10',opacity:.72,interactive:false,className:'legacy-trail-line'}).addTo(memoryLayers);
      });

      located.forEach(m=>{
        const position=positions.get(String(m.id))||pointOf(m),key=position.join(',');
        if(!groups.has(key))groups.set(key,[]);
        const trail=allJourneyMemories(m.journeyId),number=trail.findIndex(x=>String(x.id)===String(m.id))+1;
        groups.get(key).push({memory:m,number:number||'◇',position});
      });
      groups.forEach(group=>{
        const first=group[0];
        const marker=L.marker(first.position,{icon:legacyMarkerIcon(first.number,group.length),title:group.map(x=>x.memory.title).join(' · '),keyboard:true}).addTo(memoryLayers);
        if(group.length===1)marker.on('click',()=>muOpenLegacyMemory(first.memory.id));
        else{
          const popup=document.createElement('div');popup.className='legacy-map-popup';
          const label=document.createElement('strong');label.textContent='Legacy memories at this place';popup.appendChild(label);
          group.forEach(item=>{const button=document.createElement('button');button.className='map-popup-memory';button.textContent=`${item.number}. ${item.memory.title}`;button.onclick=()=>muOpenLegacyMemory(item.memory.id);popup.appendChild(button);});
          marker.bindPopup(popup);
        }
      });

      const active=mapJourneyId?activeMemories().filter(m=>String(m.journeyId)===String(mapJourneyId)):activeMemories();
      const activeLocated=active.filter(m=>validPoint(m.latitude,m.longitude)).length;
      const summary=$('mapSummary');if(summary)summary.textContent=`${activeLocated} active ${activeLocated===1?'memory':'memories'} · ${located.length} legacy ${located.length===1?'memory':'memories'} on the map`;
      const pins=$('mapPins');
      if(pins&&legacy.length){
        let section=document.getElementById('legacyMapList');
        if(!section){section=document.createElement('section');section.id='legacyMapList';section.className='legacy-map-list';pins.insertAdjacentElement('afterend',section);}
        section.innerHTML=`<div class="legacy-map-list-heading"><span class="eyebrow">LEGACY TRAIL</span><h3>Still part of the story</h3><p>Archived memories remain here for future followers.</p></div>${legacy.map(legacyRow).join('')}`;
      }else document.getElementById('legacyMapList')?.remove();
      requestAnimationFrame(fitMemoryMap);
    };
  }

  document.addEventListener('click',event=>{
    const row=event.target.closest('[data-legacy-memory-id]');if(row){event.preventDefault();muOpenLegacyMemory(row.dataset.legacyMemoryId);}
  });

  /* Repaint both feed and map after archive/restore changes. */
  if(typeof muSetArchived==='function'&&!muSetArchived.__muLegacyMap){
    const baseSetArchived=muSetArchived;
    const enhanced=async function(...args){const result=await baseSetArchived.apply(this,args);queuePrune();if(document.getElementById('map')?.classList.contains('active'))renderMemoryMap();return result;};
    enhanced.__muLegacyMap=true;muSetArchived=enhanced;
  }
})();
