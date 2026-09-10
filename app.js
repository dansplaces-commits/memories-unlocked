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
  let client,repo,user=null,journeys=[],memories=[],selected=null,epoch=0,memoryRequest=0,journeyRequest=0;
  let journeyDraft=null,memoryDraft=null,saveBusy=false,authBusy=false;
  let editing=null,recovery=false,emailNextAt=0;
  let exportRequest=0,exportUrl=null,preparedBook=null;
  function clearExport() {
    exportRequest++;
    if(exportUrl){URL.revokeObjectURL(exportUrl);exportUrl=null;}
    $('downloadExport').hidden=true;$('downloadExport').removeAttribute('href');
    preparedBook=null;$('openBook').hidden=true;
    $('prepareExport').disabled=false;status('exportStatus','');
  }
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
    $('authHeading').textContent=user?'My account':'Sign in';
  }
  function clearCollection() {
    journeys=[];memories=[];selected=null;journeyDraft=null;memoryDraft=null;
    editing=null;recovery=false;$('editForm').reset();$('passwordForm').reset();
    $('journeyForm').reset();$('memoryForm').reset();$('password').value='';
    clearExport();
    $('bookContent').replaceChildren();
    for(const id of ['journeyModal','memoryModal','editModal','passwordModal','exportModal','bookModal']) $(id).close();
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
      const edit=element('button','Edit journey','outline');edit.type='button';
      edit.addEventListener('click',()=>openEditor('journey',journey));
      const actions=element('div',undefined,'actions');actions.append(button,edit);
      body.append(actions);card.append(hero,body);list.append(card);
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
      const edit=element('button','Edit memory','outline');edit.type='button';
      edit.addEventListener('click',()=>openEditor('memory',memory));card.append(edit);
      $('memoryList').append(card);
    }
  }
  function openEditor(kind,row) {
    if(saveBusy || authBusy || !requireUser())return;
    editing={kind,row:{...row}};$('editForm').reset();status('editStatus','');
    $('editHeading').textContent=kind==='journey'?'Edit journey':'Edit memory';
    for(const [id,key] of [['editTitle','title'],['editStory','story'],['editLocation','location'],['editStartDate','start_date'],['editEndDate','end_date'],['editMemoryDate','memory_date']])$(id).value=row[key] || '';
    $('editStory').required=kind==='memory';
    $('editJourneyDates').hidden=kind!=='journey';$('editMemoryDateGroup').hidden=kind!=='memory';
    $('editStartDate').disabled=kind!=='journey';$('editEndDate').disabled=kind!=='journey';$('editMemoryDate').disabled=kind!=='memory';
    open('editModal');
  }
  $('editModal').addEventListener('close',()=>{editing=null;$('editForm').reset();status('editStatus','');});
  $('editForm').addEventListener('submit',async event=>{
    event.preventDefault();if(saveBusy || authBusy || !editing || !requireUser())return;
    const target=editing,stamp=epoch;
    const input={title:$('editTitle').value,story:$('editStory').value,location:$('editLocation').value,start_date:$('editStartDate').value,end_date:$('editEndDate').value,memory_date:$('editMemoryDate').value};
    saveBusy=true;$('saveEdit').disabled=true;status('editStatus','Saving changes…');
    try {
      const row=target.kind==='journey'?await repo.updateJourney(input,target.row):await repo.updateMemory(input,target.row);
      if(stamp!==epoch)return;
      if(target.kind==='journey'){
        journeyRequest++;journeys=journeys.map(j=>j.id===row.id?row:j);renderJourneys();
        if(selected?.id===row.id){selected=row;$('memoryIntro').textContent=row.title+' · Most recently added first';}
        $('refreshJourneys').disabled=false;$('moreJourneys').disabled=false;
      }else{
        memoryRequest++;memories=memories.map(m=>m.id===row.id?row:m);renderMemories();$('moreMemories').disabled=false;
      }
      $('editModal').close();status('connectionStatus','Changes saved to your private collection.');
    }catch(error){if(stamp===epoch)status('editStatus',error?.code==='42501'?'Editing is not enabled for this record yet. Your original is unchanged. Complete the owner-editing database setup, then retry.':errorMessage(error),true);}
    finally{saveBusy=false;$('saveEdit').disabled=false;}
  });
  function openPassword(isRecovery=false) {
    if(!user)return;
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
      client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{applySession(session);if(event==='PASSWORD_RECOVERY' && session?.user)openPassword(true);},0);});
      const {data,error}=await client.auth.getSession();if(error)throw error;
      if(data.session)applySession(data.session);else status('connectionStatus','Sign in to keep your journeys and memories together across devices.');
      const callbackError=new URLSearchParams(location.hash.slice(1)).get('error_description') || new URLSearchParams(location.search).get('error_description');
      if(callbackError){status('connectionStatus','That email link is invalid or has expired. Sign in normally, or request a new email from the account screen.',true);history.replaceState(null,'',location.pathname);}
    }catch(error){status('connectionStatus',errorMessage(error),true);}
  }
  initialise();
})();
