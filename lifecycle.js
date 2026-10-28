/* Memories Unlocked — reversible archive / restore controls. */
let muArchiveSchemaReady=false;
let muArchiveUserId='';
let muArchiveRefreshTimer=null;

function muArchiveRecord(kind,id){return kind==='journey'?findJourney(id):findMemory(id);}
function muArchiveTable(kind){return kind==='journey'?'journeys':'memories';}
function muArchiveLabel(kind){return kind==='journey'?'journey':'memory';}
function muArchiveVisibleJourneyIds(){return new Set(journeys.filter(j=>!j.archived).map(j=>String(j.id)));}
function muArchiveActiveMemories(activeJourneyIds){return memories.filter(m=>!m.archived&&activeJourneyIds.has(String(m.journeyId)));}

function muInjectArchiveLauncher(){
  const view=$('journeys');if(!view)return;
  let button=view.querySelector('[data-archive-launcher]');
  if(!button){
    button=document.createElement('button');button.type='button';button.className='archive-launcher secondary';button.dataset.archiveLauncher='true';
    const heading=view.querySelector('h1');heading?.insertAdjacentElement('afterend',button);
  }
  const count=journeys.filter(j=>j.archived).length+memories.filter(m=>m.archived&&!findJourney(m.journeyId)?.archived).length;
  button.textContent=count?`Archived stories · ${count}`:'Archived stories';
}
function muInjectArchiveControl(kind,id){
  const modal=$(kind==='journey'?'journeyDetailModal':'memoryDetailModal');
  const content=modal?.querySelector('.detail-content');if(!content||content.querySelector('[data-archive-action]'))return;
  const record=muArchiveRecord(kind,id);if(!record||record.archived)return;
  const section=document.createElement('section');section.className='archive-control-panel';
  section.innerHTML=`<span class="eyebrow">STORY OPTIONS</span><h3>Keep your story tidy.</h3><p>Archive this ${muArchiveLabel(kind)} to hide it from your main app without deleting it. You can restore it whenever you want.</p><button type="button" class="text-button archive-action" data-archive-action="archive" data-archive-kind="${kind}" data-archive-id="${esc(id)}">Archive this ${muArchiveLabel(kind)}</button>`;
  content.appendChild(section);
}
function muArchiveRows(){
  const archivedJourneys=journeys.filter(j=>j.archived);
  const archivedJourneyIds=new Set(archivedJourneys.map(j=>String(j.id)));
  const archivedMemories=memories.filter(m=>m.archived&&!archivedJourneyIds.has(String(m.journeyId)));
  return {archivedJourneys,archivedMemories};
}
function muOpenArchiveManager(){
  const {archivedJourneys,archivedMemories}=muArchiveRows();
  const journeyMarkup=archivedJourneys.map(j=>`<article class="archive-row"><div><span class="eyebrow">JOURNEY</span><strong>${esc(j.title||'Untitled journey')}</strong><small>${esc(j.location||'Location not added')}</small></div><button type="button" class="secondary" data-archive-action="restore" data-archive-kind="journey" data-archive-id="${esc(j.id)}">Restore</button></article>`).join('');
  const memoryMarkup=archivedMemories.map(m=>`<article class="archive-row"><div><span class="eyebrow">MEMORY</span><strong>${esc(m.title||'Untitled memory')}</strong><small>${esc(m.location||'Location not added')}</small></div><button type="button" class="secondary" data-archive-action="restore" data-archive-kind="memory" data-archive-id="${esc(m.id)}">Restore</button></article>`).join('');
  mountDialog('archiveManagerModal',`<button class="close" type="button" onclick="closeModal('archiveManagerModal')">×</button><span class="eyebrow">YOUR ARCHIVE</span><h2>Archived stories</h2><p class="small">Archived journeys and memories are hidden from your main story, map and counters. Nothing here is permanently deleted.</p><div class="archive-manager-list">${journeyMarkup}${memoryMarkup||''}${!journeyMarkup&&!memoryMarkup?'<div class="empty">Nothing is archived yet.</div>':''}</div>`,'archive-manager');
}
function muArchiveErrorMessage(error){
  const text=String(error?.message||'').toLowerCase();
  if(text.includes('archived_at')||text.includes('column')||text.includes('schema'))return 'Archive support is not enabled in Supabase yet. Apply the archive migration first.';
  if(text.includes('permission')||text.includes('policy')||text.includes('unauthorized'))return 'This account does not currently have permission to archive that story.';
  return 'That story could not be updated just now. Nothing was deleted.';
}
async function muSetArchived(kind,id,archived){
  const record=muArchiveRecord(kind,id);if(!record)return;
  const timestamp=archived?new Date().toISOString():null;
  try{
    if(record.cloud){
      if(!cloudUser||String(record.ownerId||cloudUser.id)!==String(cloudUser.id))throw new Error('Reconnect to your account before changing this cloud story.');
      const result=await muSupabase.from(muArchiveTable(kind)).update({archived_at:timestamp}).eq('id',id).eq('owner_id',cloudUser.id).select('id,archived_at').single();
      if(result.error)throw result.error;
      muArchiveSchemaReady=true;
    }
    record.archived=archived;record.archivedAt=timestamp||'';save();
    if(archived){closeAllDetails();showView(kind==='journey'?'journeys':'home');toast(`${kind==='journey'?'Journey':'Memory'} moved to your archive.`);}else{toast(`${kind==='journey'?'Journey':'Memory'} restored to your story.`);}
    render();muInjectArchiveLauncher();
    if($('archiveManagerModal'))muOpenArchiveManager();
  }catch(error){console.warn('Archive update:',error.message);toast(muArchiveErrorMessage(error));}
}
async function muRefreshArchiveMetadata(){
  if(!window.muSupabase)return;
  try{
    const {data:{session}}=await muSupabase.auth.getSession(),user=session?.user;if(!user)return;
    if(muArchiveUserId&&muArchiveUserId!==user.id){muArchiveSchemaReady=false;}muArchiveUserId=user.id;
    const [jr,mr]=await Promise.all([
      muSupabase.from('journeys').select('id,archived_at').eq('owner_id',user.id),
      muSupabase.from('memories').select('id,archived_at').eq('owner_id',user.id)
    ]);
    if(jr.error||mr.error){muArchiveSchemaReady=false;muInjectArchiveLauncher();return;}
    muArchiveSchemaReady=true;let changed=false;
    (jr.data||[]).forEach(row=>{const record=findJourney(row.id),next=Boolean(row.archived_at);if(record&&(record.archived!==next||String(record.archivedAt||'')!==String(row.archived_at||''))){record.archived=next;record.archivedAt=row.archived_at||'';changed=true;}});
    (mr.data||[]).forEach(row=>{const record=findMemory(row.id),next=Boolean(row.archived_at);if(record&&(record.archived!==next||String(record.archivedAt||'')!==String(row.archived_at||''))){record.archived=next;record.archivedAt=row.archived_at||'';changed=true;}});
    if(changed){save();render();}muInjectArchiveLauncher();
  }catch(error){console.warn('Archive metadata:',error.message);}
}
function muScheduleArchiveRefresh(){clearTimeout(muArchiveRefreshTimer);muArchiveRefreshTimer=setTimeout(muRefreshArchiveMetadata,140);}
function muInstallLifecycle(){
  if(typeof render==='function'){
    const baseRender=render;
    render=function(){
      const allJourneys=journeys,allMemories=memories;
      const activeJourneyIds=new Set(allJourneys.filter(j=>!j.archived).map(j=>String(j.id)));
      journeys=allJourneys.filter(j=>!j.archived);
      memories=allMemories.filter(m=>!m.archived&&activeJourneyIds.has(String(m.journeyId)));
      try{baseRender();}finally{journeys=allJourneys;memories=allMemories;}
      queueMicrotask(muInjectArchiveLauncher);
    };
  }
  if(typeof openJourney==='function'){
    const baseOpenJourney=openJourney;
    openJourney=function(id){const record=findJourney(id);if(record?.archived){toast('This journey is archived. Restore it from Archived stories first.');return;}baseOpenJourney(id);queueMicrotask(()=>muInjectArchiveControl('journey',id));};
  }
  if(typeof openMemory==='function'){
    const baseOpenMemory=openMemory;
    openMemory=function(id){const record=findMemory(id),parent=findJourney(record?.journeyId);if(record?.archived||parent?.archived){toast('This memory is archived. Restore it from Archived stories first.');return;}baseOpenMemory(id);queueMicrotask(()=>muInjectArchiveControl('memory',id));};
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-archive-launcher]')){event.preventDefault();muOpenArchiveManager();return;}
    const button=event.target.closest('[data-archive-action]');if(!button)return;
    event.preventDefault();const {archiveAction,archiveKind,archiveId}=button.dataset;
    if(archiveAction==='archive'){
      mountDialog('archiveConfirmModal',`<button class="close" type="button" onclick="closeModal('archiveConfirmModal')">×</button><span class="eyebrow">ARCHIVE STORY</span><h2>Archive this ${muArchiveLabel(archiveKind)}?</h2><p>It will disappear from your main story and map, but it will not be deleted.</p><div class="action-row"><button class="secondary" type="button" onclick="closeModal('archiveConfirmModal')">Keep it here</button><button class="save archive-confirm" type="button" data-archive-action="confirm" data-archive-kind="${archiveKind}" data-archive-id="${esc(archiveId)}">Move to archive</button></div>`,'archive-confirm');
    }
    if(archiveAction==='confirm'){closeModal('archiveConfirmModal');muSetArchived(archiveKind,archiveId,true);}
    if(archiveAction==='restore')muSetArchived(archiveKind,archiveId,false);
  });
  if(window.muSupabase){muSupabase.auth.onAuthStateChange(()=>muScheduleArchiveRefresh());muScheduleArchiveRefresh();}
  render();muInjectArchiveLauncher();
}
muInstallLifecycle();
