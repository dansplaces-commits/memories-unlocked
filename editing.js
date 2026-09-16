/* Memories Unlocked — safe journey and memory editing. */
let muEditing=false;

function muVisibilityLabel(value){
  const key=String(value||'Private').toLowerCase();
  if(key==='public')return'Public';
  if(key.includes('family'))return'Family & Friends';
  return'Private';
}
function muInjectEditControl(kind,id){
  const modal=$(kind==='journey'?'journeyDetailModal':'memoryDetailModal');
  const top=modal?.querySelector('.detail-topline');
  if(!top||top.querySelector('[data-edit-action]'))return;
  const close=top.querySelector('.close');
  const button=document.createElement('button');
  button.type='button';button.className='detail-edit-button';
  button.dataset.editAction=kind;button.dataset.editId=String(id);
  button.textContent='Edit';button.setAttribute('aria-label',`Edit this ${kind}`);
  if(close)top.insertBefore(button,close);else top.appendChild(button);
}
function muOpenJourneyEditor(id){
  const j=findJourney(id);if(!j)return;
  const privacy=muVisibilityLabel(j.privacy);
  mountDialog('journeyEditModal',`<button class="close" type="button" onclick="closeModal('journeyEditModal')">×</button><span class="eyebrow">EDIT YOUR CHAPTER</span><h2>Edit journey</h2><p class="small">Update the details without changing the journey code, memories or map trail.</p><label for="editJourneyTitle">Journey name</label><input id="editJourneyTitle" value="${esc(j.title||'')}"><label for="editJourneyLocation">Main location</label><input id="editJourneyLocation" value="${esc(j.location||'')}"><label for="editJourneyStory">Story</label><textarea id="editJourneyStory">${esc(j.story||'')}</textarea><div class="edit-date-grid"><div><label for="editJourneyStart">Start date</label><input id="editJourneyStart" type="date" value="${esc(j.start||'')}"></div><div><label for="editJourneyEnd">End date</label><input id="editJourneyEnd" type="date" value="${esc(j.end||'')}"></div></div><label for="editJourneyPrivacy">Who can see this?</label><select id="editJourneyPrivacy"><option${privacy==='Private'?' selected':''}>Private</option><option${privacy==='Family & Friends'?' selected':''}>Family & Friends</option><option${privacy==='Public'?' selected':''}>Public</option></select><p id="editJourneyMessage" class="form-message"></p><button id="saveJourneyEdit" class="save" type="button" data-edit-save="journey" data-edit-id="${esc(id)}">Save changes</button>`,'record-editor journey-editor');
}
function muOpenMemoryEditor(id){
  const m=findMemory(id),j=findJourney(m?.journeyId);if(!m)return;
  mountDialog('memoryEditModal',`<button class="close" type="button" onclick="closeModal('memoryEditModal')">×</button><span class="eyebrow">EDIT THIS MEMORY</span><h2>Edit memory</h2><p class="small">Part of <strong>${esc(j?.title||'your journey')}</strong>. Changing the written location will not move its map pin; you can adjust the pin separately.</p><label for="editMemoryTitle">Memory title</label><input id="editMemoryTitle" value="${esc(m.title||'')}"><label for="editMemoryLocation">Location</label><input id="editMemoryLocation" value="${esc(m.location||'')}"><label for="editMemoryDate">Date</label><input id="editMemoryDate" type="date" value="${esc(m.date||'')}"><label for="editMemoryStory">Your story</label><textarea id="editMemoryStory">${esc(m.story||'')}</textarea><label for="editMemoryClue">Clue or message for followers</label><textarea id="editMemoryClue">${esc(m.clue||'')}</textarea><p id="editMemoryMessage" class="form-message"></p><button id="saveMemoryEdit" class="save" type="button" data-edit-save="memory" data-edit-id="${esc(id)}">Save changes</button>`,'record-editor memory-editor');
}
function muSetEditBusy(kind,busy){
  const button=$(kind==='journey'?'saveJourneyEdit':'saveMemoryEdit');
  if(!button)return;button.disabled=busy;button.textContent=busy?'Saving safely…':'Save changes';
}
async function muSaveJourneyEdit(id){
  if(muEditing)return;
  const j=findJourney(id),message=$('editJourneyMessage');if(!j||!message)return;
  const title=$('editJourneyTitle').value.trim(),location=$('editJourneyLocation').value.trim(),story=$('editJourneyStory').value.trim(),start=$('editJourneyStart').value,end=$('editJourneyEnd').value,privacy=$('editJourneyPrivacy').value;
  if(!title||!location){message.textContent='Add a journey name and main location.';return;}
  if(start&&end&&end<start){message.textContent='The end date must be on or after the start date.';return;}
  muEditing=true;muSetEditBusy('journey',true);message.textContent='';
  try{
    if(j.cloud){
      if(!cloudUser||String(j.ownerId||cloudUser.id)!==String(cloudUser.id))throw new Error('Reconnect to your account before editing this cloud journey.');
      await writeCloud('journeys',{title,story,location,start_date:start||null,end_date:end||null,visibility:privacy.toLowerCase()},[],j.id);
    }
    Object.assign(j,{title,location,story,start,end,privacy});save();render();closeModal('journeyEditModal');openJourney(j.id);toast(j.cloud?'Journey changes saved to your cloud.':'Journey changes saved on this device.');
  }catch(error){console.warn('Journey edit:',error.message);message.textContent=error.message||'The journey could not be updated. Nothing was changed.';}
  finally{muEditing=false;muSetEditBusy('journey',false);}
}
async function muSaveMemoryEdit(id){
  if(muEditing)return;
  const m=findMemory(id),message=$('editMemoryMessage');if(!m||!message)return;
  const title=$('editMemoryTitle').value.trim(),location=$('editMemoryLocation').value.trim(),date=$('editMemoryDate').value,story=$('editMemoryStory').value.trim(),clue=$('editMemoryClue').value.trim();
  if(!title||!location){message.textContent='Add a memory title and location.';return;}
  muEditing=true;muSetEditBusy('memory',true);message.textContent='';
  try{
    let missing=[];
    if(m.cloud){
      if(!cloudUser||String(m.ownerId||cloudUser.id)!==String(cloudUser.id))throw new Error('Reconnect to your account before editing this cloud memory.');
      const result=await writeCloud('memories',{title,story,location,memory_date:date||null,clue},['clue'],m.id);missing=result.missing||[];
    }
    Object.assign(m,{title,location,date,story,clue});
    if(missing.includes('clue')&&clue)m.extrasPending=true;
    save();render();closeModal('memoryEditModal');openMemory(m.id);
    toast(m.cloud?(missing.includes('clue')?'Memory updated; the clue remains safely on this device until cloud support is available.':'Memory changes saved to your cloud.'):'Memory changes saved on this device.');
  }catch(error){console.warn('Memory edit:',error.message);message.textContent=error.message||'The memory could not be updated. Nothing was changed.';}
  finally{muEditing=false;muSetEditBusy('memory',false);}
}
function muInstallEditingLayer(){
  if(typeof openJourney==='function'){
    const baseOpenJourney=openJourney;
    openJourney=function(id){baseOpenJourney(id);queueMicrotask(()=>muInjectEditControl('journey',id));};
  }
  if(typeof openMemory==='function'){
    const baseOpenMemory=openMemory;
    openMemory=function(id){baseOpenMemory(id);queueMicrotask(()=>muInjectEditControl('memory',id));};
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-edit-action]');
    if(action){event.preventDefault();action.dataset.editAction==='journey'?muOpenJourneyEditor(action.dataset.editId):muOpenMemoryEditor(action.dataset.editId);return;}
    const saveButton=event.target.closest('[data-edit-save]');
    if(saveButton){event.preventDefault();saveButton.dataset.editSave==='journey'?muSaveJourneyEdit(saveButton.dataset.editId):muSaveMemoryEdit(saveButton.dataset.editId);}
  });
}
muInstallEditingLayer();
