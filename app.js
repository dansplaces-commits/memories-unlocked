(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = (id,message,error=false) => {const el=$(id);el.textContent=message;el.hidden=!message;el.classList.toggle('error',error);};
  const errorMessage = error => {
    if(error?.code === 'over_email_send_rate_limit' || /email.*rate limit/i.test(error?.message || '')) return 'Email sending is temporarily limited. Check your inbox and spam for an earlier email. Please wait before requesting another; signing in still works for confirmed accounts.';
    if(error?.code === 'email_not_confirmed') return 'Confirm your email before signing in. Check your inbox and spam, or use Resend confirmation email once the email limit has reset.';
    if(error?.code === 'reauthentication_needed') return 'For security, sign out and sign back in, then try changing your password again.';
    if(['PGRST205','42P01','42703'].includes(error?.code)) return 'Journey storage is not ready yet. Please try again after setup is complete. Your form has not been cleared.';
    if(error?.code === '42501') return 'Your account cannot access this record. Please sign in again or contact support.';
    if(error?.message === 'Failed to fetch' || error?.name === 'TypeError') return 'We could not reach your collection. Check your connection and try again.';
    return error?.message || 'Something went wrong. Please try again.';
  };
  const element = (tag,text,className) => {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
  const displayDate = value => value ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T12:00:00')) : '';
  let client,repo,user=null,journeys=[],memories=[],timelineMemories=[],selected=null,epoch=0,memoryRequest=0,journeyRequest=0,timelineRequest=0;
  let journeyDraft=null,memoryDraft=null,saveBusy=false,authBusy=false;
  let editing=null,recovery=false,emailNextAt=0;
  let exportRequest=0,exportUrl=null,preparedBook=null;
  let photoRequest=0,photoMemory=null,photoBlob=null,photoUrl=null,photoHasSaved=false;
  let mapView=null,pickerMap=null,pickerTarget=null,pickerCoords=null;
  let pinPacks=[],selectedPinPack=null,pinPackUrl=null;
  const welcomeSteps=[
    {image:'assets/memories-unlocked-launch-screen.png',alt:'Memories Unlocked globe and open lock emblem over a mountain journey route',kicker:'PRIVATE MEMORY COLLECTION',title:'Every place has a story.',copy:'Keep the moments that matter and leave a trail worth following.'},
    {image:'assets/memories-unlocked-onboarding-capture.png',alt:'Travel photographs and a camera connected to the Memories Unlocked globe and route',kicker:'CAPTURE WHAT MATTERS',title:'Keep the moments that shaped you.',copy:'Save the places, people and details you never want to lose.'},
    {image:'assets/memories-unlocked-onboarding-map.png',alt:'A glowing world map with visited, planned and dream destination pins',kicker:'MAP YOUR JOURNEY',title:'See your story take shape.',copy:'Connect journeys, memories and future dreams on one private map.'},
    {image:'assets/memories-unlocked-onboarding-share.png',alt:'Private memories connected around the Memories Unlocked globe and open lock',kicker:'A LEGACY TO KEEP',title:'Your memories, kept close.',copy:'Your collection is private. Family sharing is a future chapter.'}
  ];
  let welcomeIndex=0;
  const welcomeStorageKey='memories-unlocked-welcome-v1';
  function welcomeStorage(){try{return window.localStorage || null;}catch(error){return null;}}
  function welcomeSeen(){const storage=welcomeStorage();try{return storage?.getItem(welcomeStorageKey)==='seen';}catch(error){return false;}}
  function markWelcomeSeen(){const storage=welcomeStorage();try{storage?.setItem(welcomeStorageKey,'seen');}catch(error){/* Private browsing can deny storage; closing still works. */}}
  function renderWelcome(){
    const step=welcomeSteps[welcomeIndex],artwork=$('welcomeArtwork');
    artwork.src=step.image;artwork.alt=step.alt;$('welcomeKicker').textContent=step.kicker;$('welcomeHeading').textContent=step.title;$('welcomeCopy').textContent=step.copy;
    $('welcomeStepLabel').textContent=welcomeIndex===0?'Welcome':`Step ${welcomeIndex} of ${welcomeSteps.length-1}`;
    $('welcomeIndicators').replaceChildren(...welcomeSteps.map((item,index)=>{const dot=element('span',undefined,'welcomeDot'+(index===welcomeIndex?' active':''));dot.setAttribute?.('aria-hidden','true');return dot;}));
    $('welcomeBack').hidden=welcomeIndex===0;$('welcomeNext').textContent=welcomeIndex===welcomeSteps.length-1?'Start my collection':welcomeIndex===0?'Start exploring':'Continue';
  }
  function finishWelcome(startCollection=false){
    markWelcomeSeen();$('welcomeModal').close();
    if(startCollection&&!user&&client)open('authModal');
  }
  function showWelcome(){welcomeIndex=0;renderWelcome();if(!$('welcomeModal').open)$('welcomeModal').showModal();}
  function showWelcomeIfNeeded(){
    const params=[new URLSearchParams(location.search),new URLSearchParams(location.hash.slice(1))];
    const accountLink=params.some(part=>['code','access_token','token_hash','type','error','error_description'].some(key=>part.has(key)));
    if(!welcomeSeen()&&!accountLink)showWelcome();
  }
  function clearPhoto(){
    photoRequest++;photoMemory=null;photoBlob=null;photoHasSaved=false;
    if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}
    $('photoPreview').hidden=true;$('photoPreview').removeAttribute('src');
    $('photoFile').value='';$('photoFile').disabled=false;$('uploadPhoto').disabled=true;$('deletePhoto').disabled=true;
    $('photoMemoryTitle').textContent='';status('photoStatus','');
  }
  function showPhoto(blob){
    if(photoUrl)URL.revokeObjectURL(photoUrl);
    photoUrl=URL.createObjectURL(blob);$('photoPreview').src=photoUrl;$('photoPreview').hidden=false;
  }
  function photoError(error){
    const code=String(error?.statusCode||error?.status||'');
    if(code==='409'||/already exists|duplicate/i.test(error?.message||''))return 'A photo is already saved. Close and reopen this memory’s photo to check. This version does not replace photos.';
    if(['400','403','404'].includes(code)||/bucket|row.level|not found/i.test(error?.message||''))return 'The photo could not be accessed. Photo storage may need setup, or this account may not have access. Your written memory is unchanged.';
    return errorMessage(error);
  }
  async function openPhoto(memory){
    if(!requireUser())return;
    clearPhoto();photoMemory=memory.id;$('photoMemoryTitle').textContent=memory.title;$('deletePhoto').disabled=true;open('photoModal');
    if(!window.MemoriesPhotos){status('photoStatus','Photo tools could not load. Refresh the page and try again.',true);return;}
    const request=photoRequest,stamp=epoch,current=()=>request===photoRequest&&stamp===epoch&&!!user;
    $('photoFile').disabled=true;status('photoStatus','Checking for a saved photo…');
    try{
      const blob=await window.MemoriesPhotos.createService(client).download(memory.id,current);
      if(!current())return;photoHasSaved=true;showPhoto(blob);$('deletePhoto').disabled=false;status('photoStatus','Saved photo. This version keeps one photo per memory. Replacement is not available yet.');
    }catch(error){if(current()){$('photoFile').disabled=false;$('deletePhoto').disabled=true;status('photoStatus','No photo could be loaded. You can choose a photo if none has been saved. '+photoError(error),true);}}
  }
  $('photoModal').addEventListener('close',clearPhoto);
  $('photoFile').addEventListener('change',async()=>{
    if(!user||!photoMemory||!window.MemoriesPhotos)return;
    const file=$('photoFile').files?.[0],request=++photoRequest,stamp=epoch;
    const current=()=>request===photoRequest&&stamp===epoch&&!!user;
    photoBlob=null;$('uploadPhoto').disabled=true;
    if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}$('photoPreview').hidden=true;$('photoPreview').removeAttribute('src');
    if(!file)return;
    $('photoFile').disabled=true;status('photoStatus','Preparing your photo on this device…');
    try{const blob=await window.MemoriesPhotos.prepare(file);if(!current())return;photoBlob=blob;showPhoto(blob);$('uploadPhoto').disabled=false;status('photoStatus','Preview only. Tap Save photo to upload this copy.');}
    catch(error){if(current())status('photoStatus',photoError(error),true);}
    finally{if(current())$('photoFile').disabled=false;}
  });
  $('uploadPhoto').addEventListener('click',async()=>{
    if(!user||!photoBlob||!photoMemory||$('uploadPhoto').disabled)return;
    const request=photoRequest,stamp=epoch,current=()=>request===photoRequest&&stamp===epoch&&!!user;
    const blob=photoBlob,memoryId=photoMemory;$('uploadPhoto').disabled=true;$('photoFile').disabled=true;status('photoStatus','Saving your photo…');
    try{await window.MemoriesPhotos.createService(client).upload(memoryId,blob,current);if(!current())return;photoBlob=null;$('photoFile').value='';status('photoStatus','Photo saved. Reopen this memory’s photo to view it again.');}
    catch(error){if(current()){$('photoFile').disabled=false;$('uploadPhoto').disabled=false;status('photoStatus',photoError(error),true);}}
  });
  $('deletePhoto').addEventListener('click',async()=>{
    if(!user||!photoMemory||!photoHasSaved||$('deletePhoto').disabled)return;
    if(typeof window.confirm==='function'&&!window.confirm('Delete this saved photo? This cannot be undone.'))return;
    const request=++photoRequest,stamp=epoch,current=()=>request===photoRequest&&stamp===epoch&&!!user;
    const memoryId=photoMemory;$('deletePhoto').disabled=true;$('uploadPhoto').disabled=true;$('photoFile').disabled=true;status('photoStatus','Deleting your photo…');
    try{
      await window.MemoriesPhotos.createService(client).remove(memoryId,current);
      if(!current())return;
      photoHasSaved=false;photoBlob=null;
      if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}
      $('photoPreview').hidden=true;$('photoPreview').removeAttribute('src');$('photoFile').value='';$('photoFile').disabled=false;$('uploadPhoto').disabled=true;
      status('photoStatus','Photo deleted. You can choose a new photo if you want to add one later.');
    }catch(error){if(current()){$('photoFile').disabled=false;$('deletePhoto').disabled=false;$('uploadPhoto').disabled=!photoBlob;status('photoStatus','The photo was not deleted. '+photoError(error),true);}}
  });
  function clearExport() {
    exportRequest++;
    if(exportUrl){URL.revokeObjectURL(exportUrl);exportUrl=null;}
    $('downloadExport').hidden=true;$('downloadExport').removeAttribute('href');
    preparedBook=null;$('openBook').hidden=true;
    $('prepareExport').disabled=false;status('exportStatus','');
  }
  const journeyLabels={visited:'Visited',planned:'Planned',dream:'Dream'};
  function pinTheme(){return selectedPinPack || pinPacks[0] || {styles:{visited:{color:'#10244a',symbol:'✓',label:'Visited'},planned:{color:'#328997',symbol:'→',label:'Planned'},dream:{color:'#7251a3',symbol:'★',label:'Dream'},memory:{color:'#d6a52f',symbol:'♥',label:'Memory'}}};}
  function pinCoordinates(row){
    if([row?.latitude,row?.longitude].some(value=>value==null||String(value).trim()===''))return null;
    const latitude=Number(row?.latitude),longitude=Number(row?.longitude);
    return Number.isFinite(latitude)&&Math.abs(latitude)<=90&&Number.isFinite(longitude)&&Math.abs(longitude)<=180?{latitude,longitude}:null;
  }
  function formatPin(coords){return coords?`Pinned at ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`:'No map pin chosen yet.';}
  function updatePinLegend(){
    const legend=$('mapLegend');if(!legend)return;legend.replaceChildren();
    const theme=pinTheme();
    for(const kind of ['visited','planned','dream','memory']){
      const style=theme.styles[kind],item=element('span',undefined,'legendItem '+kind),swatch=element('span',undefined,'legendSwatch');
      if(swatch.style)swatch.style.background=style.color;swatch.setAttribute?.('aria-hidden','true');item.append(swatch,element('span',style.label));legend.append(item);
    }
  }
  function updatePinPackDownload(){
    const link=$('downloadPinPack');if(!link||!selectedPinPack||!window.MemoriesPinPacks)return;
    if(pinPackUrl){URL.revokeObjectURL(pinPackUrl);pinPackUrl=null;}
    pinPackUrl=URL.createObjectURL(new Blob([window.MemoriesPinPacks.json(selectedPinPack)],{type:'application/json;charset=utf-8'}));
    link.href=pinPackUrl;link.download=window.MemoriesPinPacks.filename(selectedPinPack);link.hidden=false;
  }
  function renderPinPackControls(){
    const select=$('pinPackSelect');if(!select||!window.MemoriesPinPacks)return;
    select.replaceChildren(...pinPacks.map(pack=>{const option=element('option',pack.name);option.value=pack.id;return option;}));
    if(selectedPinPack)select.value=selectedPinPack.id;updatePinLegend();updatePinPackDownload();
  }
  function choosePinPack(id,announce=true){
    const pack=pinPacks.find(item=>item.id===id);if(!pack)return;
    selectedPinPack=pack;window.MemoriesPinPacks?.select(pack.id);renderPinPackControls();
    if(mapView?.setTheme)mapView.setTheme(pack);
    if(announce)status('pinPackStatus',`${pack.name} pins selected. You can download this pack or import it on another device.`);
  }
  function initialisePinPacks(){
    if(!window.MemoriesPinPacks)return;
    pinPacks=window.MemoriesPinPacks.list();
    selectedPinPack=pinPacks.find(pack=>pack.id===window.MemoriesPinPacks.selectedId()) || pinPacks[0];
    renderPinPackControls();
  }
  function handlePinPackImport(file){
    if(!file||!window.MemoriesPinPacks)return;
    if(file.size>256*1024){status('pinPackStatus','That pin pack is too large. Choose a JSON pack under 256 KB.',true);return;}
    file.text().then(raw=>{
      const pack=window.MemoriesPinPacks.save(JSON.parse(raw));
      pinPacks=window.MemoriesPinPacks.list();choosePinPack(pack.id);
      status('pinPackStatus',`${pack.name} imported. Its colours and symbols are now available on your map.`);
    }).catch(error=>status('pinPackStatus',errorMessage(error),true));
  }
  function coordinatesFor(target){
    const fields=target==='journey'?['latitude','longitude']:target==='memory'?['memoryLatitude','memoryLongitude']:['editLatitude','editLongitude'];
    return pinCoordinates({latitude:$(fields[0]).value,longitude:$(fields[1]).value});
  }
  function pickerFields(target){return target==='journey'?['latitude','longitude','journeyPinSummary']:target==='memory'?['memoryLatitude','memoryLongitude','memoryPinSummary']:['editLatitude','editLongitude','editPinSummary'];}
  function updatePickerSummary(target,coords){const fields=pickerFields(target);$(fields[2]).textContent=formatPin(coords);}
  function closeMapPicker(){
    if(pickerMap){pickerMap.destroy();pickerMap=null;}
    pickerTarget=null;pickerCoords=null;$('saveMapPin').disabled=true;$('pickerCoordinates').textContent='No place selected yet.';
  }
  function openMapPicker(target){
    if(saveBusy||authBusy||!requireUser())return;
    if(!window.MemoriesMap){status('connectionStatus','The map tools could not load. Refresh the page and try again.',true);return;}
    pickerTarget=target;pickerCoords=coordinatesFor(target);$('mapPickerHeading').textContent=target==='journey'?'Pin this journey':target==='memory'?'Pin this memory':'Change this map pin';$('pickerCoordinates').textContent=formatPin(pickerCoords);$('saveMapPin').disabled=!pickerCoords;
    if(pickerMap){pickerMap.destroy();pickerMap=null;}open('mapPickerModal');
    pickerMap=window.MemoriesMap.createPicker(document,'pickerMap',pickerCoords,coords=>{pickerCoords=coords;$('pickerCoordinates').textContent=formatPin(coords);$('saveMapPin').disabled=false;},pinTheme());
  }
  function saveMapPin(){
    if(!pickerTarget||!pickerCoords)return;
    const fields=pickerFields(pickerTarget),latitude=pickerCoords.latitude.toFixed(6),longitude=pickerCoords.longitude.toFixed(6);
    $(fields[0]).value=latitude;$(fields[1]).value=longitude;updatePickerSummary(pickerTarget,{latitude:Number(latitude),longitude:Number(longitude)});$('mapPickerModal').close();
  }
  function renderMap(){
    if(!user||!window.MemoriesMap)return;
    if(!mapView)mapView=window.MemoriesMap.createView(document,'memoryMap',focusTimelinePoint,pinTheme());
    if(!mapView){status('mapStatus','The map could not load. Your pinned records are still saved.',true);return;}
    if(mapView.setTheme)mapView.setTheme(pinTheme());
    const points=[...journeys.map(row=>{const coords=pinCoordinates(row);return coords?{id:row.id,kind:'journey',title:row.title,location:row.location,journey_status:row.journey_status||'visited',...coords}:null}),...timelineMemories.map(row=>{const coords=pinCoordinates(row);return coords?{id:row.id,kind:'memory',title:row.title,location:row.location,...coords}:null})].filter(Boolean);
    mapView.setPoints(points);$('mapPinCount').textContent=points.length?`${points.length} pinned place${points.length===1?'':'s'}`:'No pinned places yet';status('mapStatus',points.length?`${points.length} private pinned place${points.length===1?'':'s'} across your collection.`:'Add a map pin to a journey or memory and it will appear here.');
    const list=$('mapList');list.replaceChildren();
    for(const point of points){const button=element('button',undefined,'mapListItem');button.type='button';button.append(element('strong',point.title),element('small',[point.kind==='memory'?'Memory':journeyLabels[point.journey_status]||'Journey',point.location].filter(Boolean).join(' · ')));button.addEventListener('click',()=>focusTimelinePoint(point));list.append(button);}
  }
  function focusTimelinePoint(point){
    mapView?.focus(point);const item=$('timeline-'+point.kind+'-'+point.id);if(!item)return;item.scrollIntoView?.({behavior:'smooth',block:'center'});item.classList.add('timelineFocus');setTimeout(()=>item.classList.remove('timelineFocus'),1600);
  }
  const open = id => {if(!$(id).open)$(id).showModal();};
  const requireUser = () => {if(user)return true;open('authModal');return false;};
  function controls() {
    $('accountButton').disabled=!client;
    $('accountButton').textContent=user?'My account':'Sign in';
    $('newJourney').disabled=!client;
    $('newMemory').disabled=!client;
    $('exploreMap').disabled=!user;
    $('refreshJourneys').disabled=!user;
    $('refreshMap').disabled=!user;
    $('authForm').hidden=!!user;
    $('signedInPanel').hidden=!user;
    $('accountEmail').textContent=user?.email || '';
    $('authHeading').textContent=user?'My account':'Sign in';
    if(!user)$('mapPinCount').textContent='Sign in to see your pins';
  }
  function clearCollection() {
    if(mapView){mapView.destroy();mapView=null;}
    closeMapPicker();
    journeys=[];memories=[];selected=null;journeyDraft=null;memoryDraft=null;
    timelineMemories=[];timelineRequest++;
    editing=null;recovery=false;$('editForm').reset();$('passwordForm').reset();
    $('journeyForm').reset();$('memoryForm').reset();$('password').value='';
    clearExport();
    clearPhoto();$('photoModal').close();
    $('bookContent').replaceChildren();
    for(const id of ['journeyModal','memoryModal','editModal','passwordModal','exportModal','bookModal','mapPickerModal']) $(id).close();
    $('journeyList').replaceChildren(element('p','Sign in to see your journeys.','empty'));
    $('memoryList').replaceChildren();$('memoryIntro').textContent='Choose a journey to open its story.';
    $('memoryJourney').replaceChildren();$('moreJourneys').hidden=true;$('moreMemories').hidden=true;
    $('timelineList').replaceChildren(element('p','Sign in to see your timeline.','empty'));$('timelineIntro').textContent='Your journeys and memories will appear here in date order.';$('refreshTimeline').disabled=true;
    $('mapList').replaceChildren();$('mapPinCount').textContent='Sign in to see your pins';$('mapStatus').textContent='Sign in to see your private map.';$('refreshMap').disabled=true;
    for(const target of ['journey','memory','edit'])updatePickerSummary(target,null);
  }
  function renderJourneys() {
    const list=$('journeyList');list.replaceChildren();
    if(!journeys.length) list.append(element('p','Your collection starts here. Create a journey for a place or chapter that matters.','empty'));
    for(const journey of journeys) {
      const card=element('article',undefined,'journey '+(journey.journey_status||'visited')),hero=element('div',undefined,'hero'),body=element('div',undefined,'body');
      hero.append(element('h3',journey.title));
      hero.append(element('div',[journeyLabels[journey.journey_status||'visited'],journey.location,displayDate(journey.start_date),journey.end_date?'to '+displayDate(journey.end_date):''].filter(Boolean).join(' · '),'meta'));
      body.append(element('p',journey.story || 'A new chapter, ready for your memories.'));
      const button=element('button','Open journey','outline');button.type='button';
      button.addEventListener('click',()=>{selected=journey;loadMemories(false);$('memories').scrollIntoView();});
      const edit=element('button','Edit journey','outline');edit.type='button';
      edit.addEventListener('click',()=>openEditor('journey',journey));
      const actions=element('div',undefined,'actions');actions.append(button,edit);
      body.append(actions);card.append(hero,body);list.append(card);
    }
    const previous=$('memoryJourney').value;
    $('memoryJourney').replaceChildren(...journeys.map(j=>{const option=element('option',j.title);option.value=j.id;return option;}));
    if(journeys.some(j=>j.id===previous))$('memoryJourney').value=previous;
    else if(selected)$('memoryJourney').value=selected.id;
    renderMap();
  }
  async function loadJourneys(append=false) {
    if(!user)return;
    const request=++journeyRequest,stamp=epoch;
    $('refreshJourneys').disabled=true;$('moreJourneys').disabled=true;
    status('connectionStatus','Loading your journeys…');
    try {
      const rows=await repo.listJourneys(append?journeys.length:0);
      if(stamp!==epoch || request!==journeyRequest)return;
      journeys=append?[...journeys,...rows.filter(r=>!journeys.some(j=>j.id===r.id))]:rows;
      renderJourneys();$('moreJourneys').hidden=rows.length<MemoriesData.PAGE_SIZE;
      if(!append)loadTimeline();
      status('connectionStatus','Signed in. Your journeys and memories are private.');
    } catch(error) {if(stamp===epoch && request===journeyRequest)status('connectionStatus',errorMessage(error),true);}
    finally {if(stamp===epoch && request===journeyRequest){$('refreshJourneys').disabled=false;$('moreJourneys').disabled=false;}}
  }
  function renderTimeline(){
    if(window.MemoriesTimeline){
      $('timelineList').replaceChildren(window.MemoriesTimeline.render(document,journeys,timelineMemories));
      $('timelineIntro').textContent=timelineMemories.length?`${journeys.length} journeys and ${timelineMemories.length} memories, arranged by date.`:'Add memories to see the story unfold here.';
    }
    renderMap();
  }
  async function loadTimeline(){
    if(!user||!repo?.listAllMemories)return;
    const request=++timelineRequest,stamp=epoch; $('refreshTimeline').disabled=true;status('connectionStatus','Loading your timeline…');
    try{
      const rows=[];let offset=0,page=[];
      do{page=await repo.listAllMemories(offset);rows.push(...page);offset+=page.length;}while(page.length===MemoriesData.PAGE_SIZE);
      if(stamp!==epoch||request!==timelineRequest)return;timelineMemories=rows;renderTimeline();status('connectionStatus','Signed in. Your journeys, memories and timeline are private.');
    }catch(error){if(stamp===epoch&&request===timelineRequest){timelineMemories=[];$('timelineList').replaceChildren(element('p','Your timeline could not be loaded. Refresh and try again.','notice error'));renderMap();}}
    finally{if(stamp===epoch&&request===timelineRequest)$('refreshTimeline').disabled=false;}
  }
  function renderMemories() {
    $('memoryList').replaceChildren();
    if(!memories.length)$('memoryList').append(element('p','No memories in this journey yet. Add the first moment you want to keep.','empty'));
    for(const memory of memories) {
      const card=element('article',undefined,'memory');
      card.append(element('h3',memory.title),element('p',[displayDate(memory.memory_date),memory.location].filter(Boolean).join(' · '),'meta'),element('p',memory.story));
      if(memory.clue)card.append(element('p','Clue for later: '+memory.clue,'memoryClue'));
      const edit=element('button','Edit memory','outline');edit.type='button';
      edit.addEventListener('click',()=>openEditor('memory',memory));card.append(edit);
      const photo=element('button','View / add photo','outline');photo.type='button';
      photo.addEventListener('click',()=>openPhoto(memory));card.append(photo);
      $('memoryList').append(card);
    }
  }
  function openEditor(kind,row) {
    if(saveBusy || authBusy || !requireUser())return;
    editing={kind,row:{...row}};$('editForm').reset();status('editStatus','');
    $('editHeading').textContent=kind==='journey'?'Edit journey':'Edit memory';
    for(const [id,key] of [['editTitle','title'],['editStory','story'],['editClue','clue'],['editLocation','location'],['editStartDate','start_date'],['editEndDate','end_date'],['editMemoryDate','memory_date'],['editLatitude','latitude'],['editLongitude','longitude']])$(id).value=row[key] ?? '';
    $('editJourneyStatus').value=row.journey_status||'visited';updatePickerSummary('edit',pinCoordinates(row));
    $('editStory').required=kind==='memory';
    $('editJourneyDates').hidden=kind!=='journey';$('editJourneyStatusGroup').hidden=kind!=='journey';$('editMemoryDateGroup').hidden=kind!=='memory';$('editClueGroup').hidden=kind!=='memory';
    $('editJourneyStatus').disabled=kind!=='journey';$('editStartDate').disabled=kind!=='journey';$('editEndDate').disabled=kind!=='journey';$('editMemoryDate').disabled=kind!=='memory';
    open('editModal');
  }
  $('editModal').addEventListener('close',()=>{editing=null;$('editForm').reset();updatePickerSummary('edit',null);status('editStatus','');});
  $('editForm').addEventListener('submit',async event=>{
    event.preventDefault();if(saveBusy || authBusy || !editing || !requireUser())return;
    const target=editing,stamp=epoch;
    const input={title:$('editTitle').value,story:$('editStory').value,clue:$('editClue').value,location:$('editLocation').value,start_date:$('editStartDate').value,end_date:$('editEndDate').value,memory_date:$('editMemoryDate').value,journey_status:$('editJourneyStatus').value,latitude:$('editLatitude').value,longitude:$('editLongitude').value};
    saveBusy=true;$('saveEdit').disabled=true;status('editStatus','Saving changes…');
    try {
      const row=target.kind==='journey'?await repo.updateJourney(input,target.row):await repo.updateMemory(input,target.row);
      if(stamp!==epoch)return;
      if(target.kind==='journey'){
        journeyRequest++;journeys=journeys.map(j=>j.id===row.id?row:j);renderJourneys();
        if(selected?.id===row.id){selected=row;$('memoryIntro').textContent=row.title+' · Most recently added first';}
        $('refreshJourneys').disabled=false;$('moreJourneys').disabled=false;
      }else{
        memoryRequest++;memories=memories.map(m=>m.id===row.id?row:m);timelineMemories=timelineMemories.map(m=>m.id===row.id?row:m);renderMemories();$('moreMemories').disabled=false;
      }
      renderTimeline();$('editModal').close();status('connectionStatus','Changes saved to your private collection.');
    }catch(error){if(stamp===epoch)status('editStatus',error?.code==='42501'?'Editing is not enabled for this record yet. Your original is unchanged. Complete the owner-editing database setup, then retry.':errorMessage(error),true);}
    finally{saveBusy=false;$('saveEdit').disabled=false;}
  });
  function openPassword(isRecovery=false) {
    if(!user)return;
    if($('welcomeModal').open)$('welcomeModal').close();
    recovery=isRecovery;$('passwordForm').reset();status('passwordStatus','');
    $('passwordHeading').textContent=isRecovery?'Set a new password':'Change password';
    $('currentPasswordGroup').hidden=isRecovery;$('currentPassword').required=!isRecovery;
    $('currentPassword').disabled=isRecovery;
    $('authModal').close();open('passwordModal');
  }
  $('passwordModal').addEventListener('close',()=>{$('passwordForm').reset();recovery=false;status('passwordStatus','');});
  $('changePassword').addEventListener('click',()=>{if(!saveBusy && !authBusy)openPassword();});
  $('passwordForm').addEventListener('submit',async event=>{
    event.preventDefault();if(authBusy || saveBusy || !requireUser())return;
    const stamp=epoch,ownerId=user.id,isRecovery=recovery;
    const password=$('newPassword').value;
    if(password.length<12 || password.length>128){status('passwordStatus','Use between 12 and 128 characters.',true);return;}
    if(password!==$('confirmPassword').value){status('passwordStatus','The new passwords do not match.',true);return;}
    authBusy=true;$('savePassword').disabled=true;status('passwordStatus','Updating your password…');
    try {
      if(!isRecovery){
        const {data,error}=await client.auth.signInWithPassword({email:user.email,password:$('currentPassword').value});
        if(error)throw error;
        if(data.user?.id!==ownerId)throw new Error('Your account changed. Please sign in again.');
      }
      if(stamp!==epoch || user?.id!==ownerId)return;
      const {data:verified,error:verificationError}=await client.auth.getUser();
      if(verificationError || verified?.user?.id!==ownerId)throw new Error('Your session expired or changed. Please sign in again or request a new reset link.');
      const {error}=await client.auth.updateUser({password});if(error)throw error;
      if(stamp!==epoch)return;
      $('passwordModal').close();status('connectionStatus','Password updated. Update your password manager with the new password.');
    }catch(error){if(stamp===epoch)status('passwordStatus',errorMessage(error),true);}
    finally{authBusy=false;$('savePassword').disabled=false;$('currentPassword').value='';$('newPassword').value='';$('confirmPassword').value='';}
  });
  async function sendAccountEmail(kind) {
    if(authBusy || saveBusy)return;
    if(!$('email').reportValidity())return;
    if(Date.now()<emailNextAt){status('authStatus','Please wait before requesting another email. Check your inbox and spam for the earlier message.',true);return;}
    authBusy=true;emailNextAt=Date.now()+60000;
    $('forgotPassword').disabled=true;$('resendConfirmation').disabled=true;
    status('authStatus','Requesting your email…');
    try {
      const email=$('email').value.trim();
      // Use the configured Supabase Site URL; never guess or accept an arbitrary redirect.
      const {error}=kind==='reset'?await client.auth.resetPasswordForEmail(email):await client.auth.resend({type:'signup',email});
      if(error)throw error;
      status('authStatus',kind==='reset'?'If this address has an account, you will receive a password reset email. Check your inbox and spam.':'If confirmation is still needed, check your inbox and spam for the confirmation email.');
    }catch(error){status('authStatus',errorMessage(error),true);}
    finally{authBusy=false;$('forgotPassword').disabled=false;$('resendConfirmation').disabled=false;}
  }
  $('forgotPassword').addEventListener('click',()=>sendAccountEmail('reset'));
  $('resendConfirmation').addEventListener('click',()=>sendAccountEmail('confirmation'));
  $('openExport').addEventListener('click',()=>{
    if(saveBusy || authBusy || !requireUser())return;
    clearExport();$('authModal').close();open('exportModal');
  });
  $('exportModal').addEventListener('close',clearExport);
  $('prepareExport').addEventListener('click',async()=>{
    if(saveBusy || authBusy || $('prepareExport').disabled || !requireUser())return;
    clearExport();const request=exportRequest,stamp=epoch;
    const current=()=>request===exportRequest && stamp===epoch && !!user;
    $('prepareExport').disabled=true;status('exportStatus','Preparing and checking your saved collection…');
    try {
      const collection=await repo.exportCollection(current);
      if(!current())return;
      const blob=new Blob([JSON.stringify(collection,null,2)],{type:'application/json;charset=utf-8'});
      if(blob.size>20*1024*1024)throw new Error('This collection is too large for the current download tool. No partial file was created.');
      exportUrl=URL.createObjectURL(blob);
      $('downloadExport').href=exportUrl;$('downloadExport').download='memories-unlocked-'+collection.exported_at.slice(0,10)+'.json';
      $('downloadExport').hidden=false;
      if(window.MemoriesBook){preparedBook=collection;$('openBook').hidden=false;}
      status('exportStatus',`${collection.journeys.length} journeys and ${collection.memories.length} memories ready. Choose your memory book or JSON copy. A file has not been saved yet.`);
    }catch(error){if(current())status('exportStatus','No file was prepared. '+errorMessage(error),true);}
    finally{if(current())$('prepareExport').disabled=false;}
  });
  $('openBook').addEventListener('click',()=>{
    if(!preparedBook || !user || !window.MemoriesBook)return;
    try{
      const content=window.MemoriesBook.render(document,preparedBook);
      $('bookContent').replaceChildren(content);$('exportModal').close();open('bookModal');
    }catch(error){$('bookContent').replaceChildren();status('exportStatus','The memory book could not be prepared. Your JSON copy is still available.',true);}
  });
  $('bookModal').addEventListener('close',()=>{$('bookContent').replaceChildren();});
  $('printBook').addEventListener('click',()=>{
    if(!user || !$('bookModal').open)return;
    if(typeof window.print!=='function'){status('bookPrintStatus','Printing is unavailable here. Open the app in your device’s main browser and try again.',true);return;}
    try{window.print();}catch(error){status('bookPrintStatus','Printing could not open. Try your browser’s Print option or open the app in your main browser.',true);}
  });
  async function loadMemories(append=false) {
    if(!user || !selected)return;
    const request=++memoryRequest,stamp=epoch,journey=selected;
    $('moreMemories').disabled=true;
    if(!append){memories=[];$('memoryList').replaceChildren(element('p','Loading memories…','empty'));$('moreMemories').hidden=true;}
    $('memoryIntro').textContent=journey.title+' · Most recently added first';
    try {
      const rows=await repo.listMemories(journey.id,append?memories.length:0);
      if(stamp!==epoch || request!==memoryRequest)return;
      memories=append?[...memories,...rows.filter(r=>!memories.some(m=>m.id===r.id))]:rows;
      renderMemories();$('moreMemories').hidden=rows.length<MemoriesData.PAGE_SIZE;
    } catch(error) {
      if(stamp===epoch && request===memoryRequest){const message=element('p',errorMessage(error),'notice error'),retry=element('button','Try loading again','outline');retry.addEventListener('click',()=>loadMemories(append));$('memoryList').append(message,retry);}
    } finally {if(stamp===epoch && request===memoryRequest)$('moreMemories').disabled=false;}
  }
  function applySession(session) {
    const next=session?.user || null;
    if(user?.id===next?.id){controls();return;}
    epoch++;journeyRequest++;memoryRequest++;clearCollection();user=next;controls();
    if(user){$('authModal').close();status('authStatus','');loadJourneys();}
    else status('connectionStatus','Sign in to keep your journeys and memories together across devices.');
  }
  for(const button of document.querySelectorAll('[data-close]')) button.addEventListener('click',()=>{if(!saveBusy && !authBusy)$(button.dataset.close).close();});
  for(const modal of document.querySelectorAll('dialog'))modal.addEventListener('cancel',event=>{if(saveBusy || authBusy)event.preventDefault();});
  $('accountButton').addEventListener('click',()=>open('authModal'));
  $('newJourney').addEventListener('click',()=>{if(requireUser()){journeyDraft ||= crypto.randomUUID();open('journeyModal');}});
  $('newMemory').addEventListener('click',()=>{
    if(!requireUser())return;
    if(!journeys.length){status('connectionStatus','Create or load a journey before adding its memories.');return;}
    if(!memoryDraft){memoryDraft=crypto.randomUUID();if(selected)$('memoryJourney').value=selected.id;}open('memoryModal');
  });
  $('refreshJourneys').addEventListener('click',()=>loadJourneys());
  $('refreshTimeline').addEventListener('click',()=>loadTimeline());
  $('refreshMap').addEventListener('click',()=>loadTimeline());
  $('exploreMap').addEventListener('click',()=>{if(!requireUser())return;$('map').scrollIntoView?.({behavior:'smooth',block:'start'});renderMap();});
  $('pickJourneyLocation').addEventListener('click',()=>openMapPicker('journey'));
  $('pickMemoryLocation').addEventListener('click',()=>openMapPicker('memory'));
  $('pickEditLocation').addEventListener('click',()=>openMapPicker('edit'));
  $('saveMapPin').addEventListener('click',saveMapPin);
  $('mapPickerModal').addEventListener('close',closeMapPicker);
  $('pinPackSelect').addEventListener('change',()=>choosePinPack($('pinPackSelect').value));
  $('importPinPack').addEventListener('click',()=>$('pinPackFile').click());
  $('pinPackFile').addEventListener('change',event=>{handlePinPackImport(event.target.files?.[0]);event.target.value='';});
  $('moreJourneys').addEventListener('click',()=>loadJourneys(true));
  $('moreMemories').addEventListener('click',()=>loadMemories(true));
  $('authForm').addEventListener('submit',async event=>{
    event.preventDefault();if(authBusy)return;authBusy=true;
    $('signIn').disabled=true;$('signUp').disabled=true;
    const signup=event.submitter?.id==='signUp';status('authStatus',signup?'Creating your account…':'Signing in…');
    try {
      const credentials={email:$('email').value.trim(),password:$('password').value};
      if(signup && credentials.password.length<8)throw new Error('Use at least 8 characters for your new password.');
      const {data,error}=signup?await client.auth.signUp(credentials):await client.auth.signInWithPassword(credentials);
      if(error)throw error;
      $('password').value='';
      if(data.session)applySession(data.session);
      else status('authStatus','Check your email for a confirmation link, then return here to sign in. If you already have an account, use Sign in.');
    }catch(error){status('authStatus',errorMessage(error),true);}
    finally{authBusy=false;$('signIn').disabled=false;$('signUp').disabled=false;}
  });
  $('signOut').addEventListener('click',async()=>{
    if(saveBusy || authBusy)return;authBusy=true;$('signOut').disabled=true;
    try{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;applySession(null);$('authModal').close();}
    catch(error){status('authStatus',errorMessage(error),true);}
    finally{authBusy=false;$('signOut').disabled=false;}
  });
  async function saveForm(kind,input) {
    if(saveBusy || !requireUser())return;
    const stamp=epoch,button=$(kind==='journey'?'saveJourney':'saveMemory');
    saveBusy=true;button.disabled=true;const label=button.textContent;button.textContent='Saving…';status(kind+'Status','Saving to your collection…');
    try {
      const row=kind==='journey'?await repo.saveJourney(input,journeyDraft):await repo.saveMemory(input,memoryDraft);
      if(stamp!==epoch)return;
      $(kind+'Form').reset();$(kind+'Modal').close();status(kind+'Status','');
      if(kind==='journey'){
        journeyDraft=null;selected=row;journeys=[row,...journeys.filter(j=>j.id!==row.id)];renderJourneys();
      } else {memoryDraft=null;selected=journeys.find(j=>j.id===row.journey_id) || selected;}
      status('connectionStatus',kind==='journey'?'Journey saved to your private collection.':'Memory saved to your private collection.');
      await loadMemories();
      await loadTimeline();
    }catch(error){if(stamp===epoch)status(kind+'Status',errorMessage(error),true);}
    finally{saveBusy=false;button.disabled=false;button.textContent=label;}
  }
  $('journeyForm').addEventListener('submit',event=>{event.preventDefault();saveForm('journey',{title:$('title').value,story:$('story').value,journey_status:$('journeyType').value,start_date:$('startDate').value,end_date:$('endDate').value,location:$('location').value,latitude:$('latitude').value,longitude:$('longitude').value});});
  $('memoryForm').addEventListener('submit',event=>{event.preventDefault();saveForm('memory',{journey_id:$('memoryJourney').value,title:$('memoryTitle').value,story:$('memoryStory').value,clue:$('memoryClue').value,memory_date:$('memoryDate').value,location:$('memoryLocation').value,latitude:$('memoryLatitude').value,longitude:$('memoryLongitude').value});});
  $('welcomeNext').addEventListener('click',()=>{if(welcomeIndex<welcomeSteps.length-1){welcomeIndex++;renderWelcome();}else finishWelcome(true);});
  $('welcomeBack').addEventListener('click',()=>{if(welcomeIndex>0){welcomeIndex--;renderWelcome();}});
  $('welcomeSkip').addEventListener('click',()=>finishWelcome());
  $('welcomeModal').addEventListener('cancel',event=>{if(saveBusy||authBusy)return;event.preventDefault();finishWelcome();});
  $('replayWelcome').addEventListener('click',()=>{if(saveBusy||authBusy)return;$('authModal').close();showWelcome();});
  async function initialise() {
    try {
      if(!window.supabase || !window.MEMORIES_CONFIG || !window.MemoriesData)throw new Error('The app could not finish loading. Refresh the page or check your connection.');
      client=window.supabase.createClient(MEMORIES_CONFIG.url,MEMORIES_CONFIG.publishableKey);
      repo=MemoriesData.createRepository(client);initialisePinPacks();controls();
      // Defer SDK calls until after the auth callback releases its lock.
      client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{applySession(session);if(event==='PASSWORD_RECOVERY' && session?.user)openPassword(true);},0);});
      const {data,error}=await client.auth.getSession();if(error)throw error;
      if(data.session)applySession(data.session);else status('connectionStatus','Sign in to keep your journeys and memories together across devices.');
      const callbackError=new URLSearchParams(location.hash.slice(1)).get('error_description') || new URLSearchParams(location.search).get('error_description');
      if(callbackError){status('connectionStatus','That email link is invalid or has expired. Sign in normally, or request a new email from the account screen.',true);history.replaceState(null,'',location.pathname);}
    }catch(error){status('connectionStatus',errorMessage(error),true);}
  }
  showWelcomeIfNeeded();
  initialise();
})();
