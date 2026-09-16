/* Memories Unlocked — secure photo layer for journey covers and memory photos. */
const MU_MEDIA_BUCKET='memory-media';
const MU_MEDIA_MAX_BYTES=8*1024*1024;
const MU_MEDIA_TYPES=new Set(['image/jpeg','image/png','image/webp']);
const muMediaUrls=new Map();
let muMediaSchemaReady=false;
let muMediaUserId='';
let muOpenMediaContext=null;
let muMediaRefreshTimer=null;

function muMediaField(kind){return kind==='journey'?'coverPhotoPath':'photoPath';}
function muMediaColumn(kind){return kind==='journey'?'cover_photo_path':'photo_path';}
function muMediaTable(kind){return kind==='journey'?'journeys':'memories';}
function muMediaRecord(kind,id){return kind==='journey'?findJourney(id):findMemory(id);}
function muMediaLabel(kind){return kind==='journey'?'journey cover':'memory photo';}
function muMediaExt(file){return file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';}
function muMediaPath(kind,id,file,userId){
  const group=kind==='journey'?'journeys':'memories';
  const name=kind==='journey'?'cover':'photo';
  const token=(crypto.randomUUID?.()||Math.random().toString(36).slice(2)).replace(/[^a-z0-9-]/gi,'');
  return `${userId}/${group}/${encodeURIComponent(String(id))}/${Date.now()}-${token}-${name}.${muMediaExt(file)}`;
}
function muMediaSignedUrl(path){
  const cached=muMediaUrls.get(path);
  if(cached&&cached.expires>Date.now()+60000)return Promise.resolve(cached.url);
  if(!window.muSupabase||!path)return Promise.resolve('');
  return muSupabase.storage.from(MU_MEDIA_BUCKET).createSignedUrl(path,3600).then(({data,error})=>{
    if(error)throw error;
    const url=data?.signedUrl||'';
    if(url)muMediaUrls.set(path,{url,expires:Date.now()+50*60*1000});
    return url;
  });
}
function muMediaAvailable(record){return Boolean(window.muSupabase&&cloudUser&&record?.cloud&&String(record.ownerId||cloudUser.id)===String(cloudUser.id));}
function muMediaEmptyMarkup(kind,record){
  const location=record?.location?`<small>📍 ${esc(record.location)}</small>`:'';
  const ready=muMediaAvailable(record);
  return `<div class="photo-mark">▧</div><div class="media-empty-copy"><strong>${kind==='journey'?'Your journey cover':'A photograph belongs here'}</strong><span>${ready?'Add one image to make this chapter feel instantly familiar.':'Photo upload becomes available when this story is safely connected to your cloud.'}</span>${location}</div><button type="button" class="media-add-button" data-media-action="choose" data-media-kind="${kind}" data-media-id="${esc(record?.id||'')}" ${ready?'':'disabled'}>${ready?'＋ Add photo':'Cloud required'}</button>`;
}
function muRenderMediaSlot(kind,id){
  const record=muMediaRecord(kind,id);
  if(!record)return;
  const modalId=kind==='journey'?'journeyDetailModal':'memoryDetailModal';
  const modal=$(modalId);
  const slot=modal?.querySelector('.story-photo-placeholder,.story-photo-media');
  if(!slot)return;
  const path=record[muMediaField(kind)]||'';
  slot.className=`story-photo-placeholder story-photo-media ${path?'has-photo':'is-empty'}`;
  if(!path){slot.innerHTML=muMediaEmptyMarkup(kind,record);return;}
  slot.innerHTML='<div class="media-loading" role="status">Loading your photograph…</div>';
  const expected=path;
  muMediaSignedUrl(path).then(url=>{
    if(!slot.isConnected||record[muMediaField(kind)]!==expected)return;
    if(!url)throw new Error('No signed photo URL was returned.');
    slot.innerHTML=`<img class="story-photo-image" src="${esc(url)}" alt="${esc(record.title||muMediaLabel(kind))}"><div class="story-photo-shade"></div><div class="story-photo-caption"><span>${kind==='journey'?'JOURNEY COVER':'MEMORY PHOTO'}</span><strong>${esc(record.title||'Your story')}</strong><small>${record.location?'📍 '+esc(record.location):'Memories Unlocked'}</small></div><div class="story-photo-actions"><button type="button" data-media-action="choose" data-media-kind="${kind}" data-media-id="${esc(id)}">Replace</button><button type="button" data-media-action="remove" data-media-kind="${kind}" data-media-id="${esc(id)}">Remove</button></div>`;
  }).catch(error=>{
    console.warn('Photo display:',error.message);
    if(slot.isConnected)slot.innerHTML=`${muMediaEmptyMarkup(kind,record)}<p class="media-error">The saved photo could not be displayed just now.</p>`;
  });
}
function muHydrateJourneyCards(){
  document.querySelectorAll('article.journey[data-id]').forEach(card=>{
    const record=findJourney(card.dataset.id),path=record?.coverPhotoPath,hero=card.querySelector('.hero');
    if(!hero)return;
    if(!path){hero.querySelector('.journey-card-cover-image')?.remove();hero.classList.remove('has-cover-photo');return;}
    let image=hero.querySelector('.journey-card-cover-image');
    if(!image){image=document.createElement('img');image.className='journey-card-cover-image';image.alt='';image.setAttribute('aria-hidden','true');hero.prepend(image);}
    hero.classList.add('has-cover-photo');
    const expected=path;
    muMediaSignedUrl(path).then(url=>{if(image.isConnected&&record.coverPhotoPath===expected)image.src=url;}).catch(()=>{});
  });
}
function muOpenPhotoPicker(kind,id){
  const record=muMediaRecord(kind,id);
  if(!record)return;
  if(!muMediaAvailable(record)){toast('Connect this story to your cloud before adding photographs.');return;}
  const modal=mountDialog('mediaPickerModal',`<button class="close" type="button" onclick="closeModal('mediaPickerModal')">×</button><span class="eyebrow">ADD TO YOUR STORY</span><h2>${record[muMediaField(kind)]?'Replace':'Add'} ${kind==='journey'?'journey cover':'memory photo'}</h2><p class="small">Choose one clear image. JPEG, PNG or WebP · maximum 8 MB.</p><label class="media-file-label" for="mediaPhotoFile"><span>Choose a photo</span><small>From this device</small></label><input id="mediaPhotoFile" class="media-file-input" type="file" accept="image/jpeg,image/png,image/webp"><div id="mediaPreview" class="media-preview"><div>▧</div><span>Your preview will appear here.</span></div><p id="mediaPickerMessage" class="small"></p><button id="mediaSaveButton" class="save" type="button" disabled>Save photo</button>`,'media-picker');
  const input=modal.querySelector('#mediaPhotoFile'),preview=modal.querySelector('#mediaPreview'),message=modal.querySelector('#mediaPickerMessage'),saveButton=modal.querySelector('#mediaSaveButton');
  let selected=null;
  input.addEventListener('change',()=>{
    selected=input.files?.[0]||null;saveButton.disabled=true;message.textContent='';
    if(!selected){preview.innerHTML='<div>▧</div><span>Your preview will appear here.</span>';return;}
    if(!MU_MEDIA_TYPES.has(selected.type)){selected=null;message.textContent='Please choose a JPEG, PNG or WebP image.';return;}
    if(selected.size>MU_MEDIA_MAX_BYTES){selected=null;message.textContent='That image is larger than 8 MB. Choose a smaller copy.';return;}
    const reader=new FileReader();
    reader.onload=()=>{preview.innerHTML=`<img src="${reader.result}" alt="Preview of selected photo"><span>${esc(input.files[0].name)}</span>`;saveButton.disabled=false;};
    reader.onerror=()=>{selected=null;message.textContent='This image could not be previewed. Try another file.';};
    reader.readAsDataURL(selected);
  });
  saveButton.addEventListener('click',()=>{if(selected)muUploadPhoto(kind,id,selected,saveButton,message);});
}
async function muUploadPhoto(kind,id,file,button,message){
  const record=muMediaRecord(kind,id),userId=cloudUser?.id;
  if(!record||!userId)return;
  button.disabled=true;button.textContent='Saving photo…';message.textContent='Uploading securely…';
  const field=muMediaField(kind),column=muMediaColumn(kind),table=muMediaTable(kind),oldPath=record[field]||'',newPath=muMediaPath(kind,id,file,userId);
  try{
    const upload=await muSupabase.storage.from(MU_MEDIA_BUCKET).upload(newPath,file,{upsert:false,cacheControl:'3600',contentType:file.type});
    if(upload.error)throw upload.error;
    const update=await muSupabase.from(table).update({[column]:newPath}).eq('id',id).eq('owner_id',userId).select('id').single();
    if(update.error){await muSupabase.storage.from(MU_MEDIA_BUCKET).remove([newPath]);throw update.error;}
    record[field]=newPath;save();muMediaUrls.delete(oldPath);muMediaUrls.delete(newPath);muMediaSchemaReady=true;
    if(oldPath&&oldPath!==newPath)muSupabase.storage.from(MU_MEDIA_BUCKET).remove([oldPath]).catch(()=>{});
    closeModal('mediaPickerModal');render();
    if(muOpenMediaContext?.kind===kind&&String(muOpenMediaContext.id)===String(id))muRenderMediaSlot(kind,id);
    muHydrateJourneyCards();toast(kind==='journey'?'Journey cover saved securely.':'Memory photo saved securely.');
  }catch(error){
    console.warn('Photo upload:',error.message);message.textContent=muMediaErrorMessage(error);button.disabled=false;button.textContent='Save photo';
  }
}
function muMediaErrorMessage(error){
  const text=String(error?.message||'').toLowerCase();
  if(text.includes('bucket')||text.includes('not found')||text.includes('column'))return 'Photo storage is not enabled on this build yet. Apply the Memories Unlocked media migration first.';
  if(text.includes('policy')||text.includes('permission')||text.includes('unauthorized'))return 'This account does not currently have permission to store that photograph.';
  return 'The photo could not be saved. Your existing journey and memories are unchanged.';
}
function muConfirmRemove(kind,id){
  const record=muMediaRecord(kind,id);if(!record?.[muMediaField(kind)])return;
  mountDialog('mediaRemoveModal',`<button class="close" type="button" onclick="closeModal('mediaRemoveModal')">×</button><span class="eyebrow">REMOVE PHOTO</span><h2>Remove this ${kind==='journey'?'journey cover':'memory photo'}?</h2><p>The journey or memory itself will stay exactly as it is. Only the photograph will be removed.</p><div class="action-row"><button class="secondary" type="button" onclick="closeModal('mediaRemoveModal')">Keep photo</button><button class="save media-danger" type="button" data-media-action="confirm-remove" data-media-kind="${kind}" data-media-id="${esc(id)}">Remove photo</button></div>`,'media-remove');
}
async function muRemovePhoto(kind,id){
  const record=muMediaRecord(kind,id),userId=cloudUser?.id;if(!record||!userId)return;
  const field=muMediaField(kind),column=muMediaColumn(kind),table=muMediaTable(kind),path=record[field];if(!path)return;
  const button=document.querySelector('[data-media-action="confirm-remove"]');if(button){button.disabled=true;button.textContent='Removing…';}
  try{
    const update=await muSupabase.from(table).update({[column]:null}).eq('id',id).eq('owner_id',userId).select('id').single();
    if(update.error)throw update.error;
    record[field]='';save();muMediaUrls.delete(path);closeModal('mediaRemoveModal');render();
    if(muOpenMediaContext?.kind===kind&&String(muOpenMediaContext.id)===String(id))muRenderMediaSlot(kind,id);
    muHydrateJourneyCards();
    muSupabase.storage.from(MU_MEDIA_BUCKET).remove([path]).catch(()=>{});
    toast('Photo removed. Your story is unchanged.');
  }catch(error){console.warn('Photo remove:',error.message);toast('The photo could not be removed just now. Nothing else was changed.');if(button){button.disabled=false;button.textContent='Remove photo';}}
}
async function muRefreshMediaMetadata(){
  if(!window.muSupabase)return;
  try{
    const {data:{session}}=await muSupabase.auth.getSession(),user=session?.user;if(!user)return;
    if(muMediaUserId&&muMediaUserId!==user.id)muMediaUrls.clear();muMediaUserId=user.id;
    const [jr,mr]=await Promise.all([
      muSupabase.from('journeys').select('id,cover_photo_path').eq('owner_id',user.id),
      muSupabase.from('memories').select('id,photo_path').eq('owner_id',user.id)
    ]);
    if(jr.error||mr.error){muMediaSchemaReady=false;return;}
    muMediaSchemaReady=true;let changed=false;
    (jr.data||[]).forEach(row=>{const record=findJourney(row.id);if(record&&record.coverPhotoPath!==(row.cover_photo_path||'')){record.coverPhotoPath=row.cover_photo_path||'';changed=true;}});
    (mr.data||[]).forEach(row=>{const record=findMemory(row.id);if(record&&record.photoPath!==(row.photo_path||'')){record.photoPath=row.photo_path||'';changed=true;}});
    if(changed){save();render();}
    muHydrateJourneyCards();
    if(muOpenMediaContext)muRenderMediaSlot(muOpenMediaContext.kind,muOpenMediaContext.id);
  }catch(error){console.warn('Photo metadata:',error.message);}
}
function muScheduleMediaRefresh(){clearTimeout(muMediaRefreshTimer);muMediaRefreshTimer=setTimeout(muRefreshMediaMetadata,120);}
function muInstallMediaLayer(){
  if(typeof openJourney==='function'){
    const baseOpenJourney=openJourney;
    openJourney=function(id){muOpenMediaContext={kind:'journey',id:String(id)};baseOpenJourney(id);queueMicrotask(()=>muRenderMediaSlot('journey',id));};
  }
  if(typeof openMemory==='function'){
    const baseOpenMemory=openMemory;
    openMemory=function(id){muOpenMediaContext={kind:'memory',id:String(id)};baseOpenMemory(id);queueMicrotask(()=>muRenderMediaSlot('memory',id));};
  }
  if(typeof render==='function'){
    const baseRender=render;
    render=function(){baseRender();queueMicrotask(muHydrateJourneyCards);};
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-media-action]');if(!button)return;
    const {mediaAction,mediaKind,mediaId}=button.dataset;
    if(mediaAction==='choose')muOpenPhotoPicker(mediaKind,mediaId);
    if(mediaAction==='remove')muConfirmRemove(mediaKind,mediaId);
    if(mediaAction==='confirm-remove')muRemovePhoto(mediaKind,mediaId);
  });
  if(window.muSupabase){muSupabase.auth.onAuthStateChange(()=>muScheduleMediaRefresh());muScheduleMediaRefresh();}
  muHydrateJourneyCards();
}
muInstallMediaLayer();
