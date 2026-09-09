(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = (id,message,error=false) => {const el=$(id);el.textContent=message;el.hidden=!message;el.classList.toggle('error',error);};
  const errorMessage = error => {
    if(['PGRST205','42P01','42703'].includes(error?.code)) return 'Journey storage is not ready yet. Please try again after setup is complete. Your form has not been cleared.';
    if(error?.code === '42501') return 'Your account cannot access this record. Please sign in again or contact support.';
    if(error?.message === 'Failed to fetch' || error?.name === 'TypeError') return 'We could not reach your collection. Check your connection and try again.';
    return error?.message || 'Something went wrong. Please try again.';
  };
  const element = (tag,text,className) => {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
  const displayDate = value => value ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T12:00:00')) : '';
  let client,repo,user=null,journeys=[],memories=[],selected=null,epoch=0,memoryRequest=0,journeyRequest=0;
  let journeyDraft=null,memoryDraft=null,saveBusy=false,authBusy=false;
  const open = id => {if(!$(id).open)$(id).showModal();};
  const requireUser = () => {if(user)return true;open('authModal');return false;};
  function controls() {
    $('accountButton').disabled=!client;
    $('accountButton').textContent=user?'My account':'Sign in';
    $('newJourney').disabled=!client;
    $('newMemory').disabled=!client;
    $('refreshJourneys').disabled=!user;
    $('authForm').hidden=!!user;
    $('signedInPanel').hidden=!user;
    $('accountEmail').textContent=user?.email || '';
  }
  function clearCollection() {
    journeys=[];memories=[];selected=null;journeyDraft=null;memoryDraft=null;
    $('journeyForm').reset();$('memoryForm').reset();$('password').value='';
    for(const id of ['journeyModal','memoryModal']) $(id).close();
    $('journeyList').replaceChildren(element('p','Sign in to see your journeys.','empty'));
    $('memoryList').replaceChildren();$('memoryIntro').textContent='Choose a journey to open its story.';
    $('memoryJourney').replaceChildren();$('moreJourneys').hidden=true;$('moreMemories').hidden=true;
  }
  function renderJourneys() {
    const list=$('journeyList');list.replaceChildren();
    if(!journeys.length) list.append(element('p','Your collection starts here. Create a journey for a place or chapter that matters.','empty'));
    for(const journey of journeys) {
      const card=element('article',undefined,'journey'),hero=element('div',undefined,'hero'),body=element('div',undefined,'body');
      hero.append(element('h3',journey.title));
      hero.append(element('div',[journey.location,displayDate(journey.start_date),journey.end_date?'to '+displayDate(journey.end_date):''].filter(Boolean).join(' · '),'meta'));
      body.append(element('p',journey.story || 'A new chapter, ready for your memories.'));
      const button=element('button','Open journey','outline');button.type='button';
      button.addEventListener('click',()=>{selected=journey;loadMemories(false);$('memories').scrollIntoView();});
      body.append(button);card.append(hero,body);list.append(card);
    }
    const previous=$('memoryJourney').value;
    $('memoryJourney').replaceChildren(...journeys.map(j=>{const option=element('option',j.title);option.value=j.id;return option;}));
    if(journeys.some(j=>j.id===previous))$('memoryJourney').value=previous;
    else if(selected)$('memoryJourney').value=selected.id;
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
      status('connectionStatus','Signed in. Your journeys and memories are private.');
    } catch(error) {if(stamp===epoch && request===journeyRequest)status('connectionStatus',errorMessage(error),true);}
    finally {if(stamp===epoch && request===journeyRequest){$('refreshJourneys').disabled=false;$('moreJourneys').disabled=false;}}
  }
  function renderMemories() {
    $('memoryList').replaceChildren();
    if(!memories.length)$('memoryList').append(element('p','No memories in this journey yet. Add the first moment you want to keep.','empty'));
    for(const memory of memories) {
      const card=element('article',undefined,'memory');
      card.append(element('h3',memory.title),element('p',[displayDate(memory.memory_date),memory.location].filter(Boolean).join(' · '),'meta'),element('p',memory.story));
      $('memoryList').append(card);
    }
  }
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
    }catch(error){if(stamp===epoch)status(kind+'Status',errorMessage(error),true);}
    finally{saveBusy=false;button.disabled=false;button.textContent=label;}
  }
  $('journeyForm').addEventListener('submit',event=>{event.preventDefault();saveForm('journey',{title:$('title').value,story:$('story').value,start_date:$('startDate').value,end_date:$('endDate').value,location:$('location').value});});
  $('memoryForm').addEventListener('submit',event=>{event.preventDefault();saveForm('memory',{journey_id:$('memoryJourney').value,title:$('memoryTitle').value,story:$('memoryStory').value,memory_date:$('memoryDate').value,location:$('memoryLocation').value});});
  async function initialise() {
    try {
      if(!window.supabase || !window.MEMORIES_CONFIG || !window.MemoriesData)throw new Error('The app could not finish loading. Refresh the page or check your connection.');
      client=window.supabase.createClient(MEMORIES_CONFIG.url,MEMORIES_CONFIG.publishableKey);
      repo=MemoriesData.createRepository(client);controls();
      // Defer SDK calls until after the auth callback releases its lock.
      client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>applySession(session),0);});
      const {data,error}=await client.auth.getSession();if(error)throw error;
      if(data.session)applySession(data.session);else status('connectionStatus','Sign in to keep your journeys and memories together across devices.');
    }catch(error){status('connectionStatus',errorMessage(error),true);}
  }
  initialise();
})();
