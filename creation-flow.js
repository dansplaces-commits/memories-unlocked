/* Memories Unlocked — premium create journey / add memory flow. */
let muJourneyCreatePhoto=null;
let muMemoryCreatePhoto=null;
let muCreationInstalled=false;

function muCreatePhotoState(kind){return kind==='journey'?muJourneyCreatePhoto:muMemoryCreatePhoto;}
function muSetCreatePhotoState(kind,file){if(kind==='journey')muJourneyCreatePhoto=file;else muMemoryCreatePhoto=file;}
function muCreateModal(kind){return $(kind==='journey'?'journeyModal':'memoryModal');}
function muCreateFileId(kind){return kind==='journey'?'journeyCreatePhoto':'memoryCreatePhoto';}
function muCreatePreviewId(kind){return kind==='journey'?'journeyCreatePhotoPreview':'memoryCreatePhotoPreview';}
function muCreateMessageId(kind){return kind==='journey'?'journeyCreatePhotoMessage':'memoryCreatePhotoMessage';}

function muCreationPhotoBlock(kind){
  const title=kind==='journey'?'Add a cover photo':'Add a photograph';
  const copy=kind==='journey'?'Optional · bring the whole chapter to life':'Optional · give this memory a face, place or moment';
  return `<section class="create-photo-block"><div class="create-photo-heading"><div><span class="eyebrow">PHOTO · OPTIONAL</span><h3>${title}</h3><p>${copy}</p></div><span class="create-photo-icon" aria-hidden="true">▧</span></div><label class="create-photo-label" for="${muCreateFileId(kind)}"><span>Choose from this device</span><small>JPEG, PNG or WebP · max 8 MB</small></label><input id="${muCreateFileId(kind)}" class="create-photo-input" type="file" accept="image/jpeg,image/png,image/webp"><div id="${muCreatePreviewId(kind)}" class="create-photo-preview"><span>No photo selected yet.</span></div><p id="${muCreateMessageId(kind)}" class="small create-photo-message"></p></section>`;
}
function muCreationIntro(kind){
  return `<div class="create-flow-intro"><span class="eyebrow">${kind==='journey'?'START A NEW CHAPTER':'CAPTURE A MOMENT'}</span><p>${kind==='journey'?'Give this journey a name, a place and the reason it matters. You can keep refining it later.':'Pin the place, remember what happened and leave something worth finding again.'}</p><div class="create-flow-steps"><span class="active">1 · Details</span><span>2 · Photo</span><span>3 · Saved</span></div></div>`;
}
function muSetupCreatePhoto(kind){
  const input=$(muCreateFileId(kind)),preview=$(muCreatePreviewId(kind)),message=$(muCreateMessageId(kind));
  if(!input||input.dataset.muReady)return;
  input.dataset.muReady='true';
  input.addEventListener('change',()=>{
    const file=input.files?.[0]||null;muSetCreatePhotoState(kind,null);message.textContent='';preview.innerHTML='<span>No photo selected yet.</span>';
    if(!file)return;
    if(typeof MU_MEDIA_TYPES==='undefined'||!MU_MEDIA_TYPES.has(file.type)){message.textContent='Choose a JPEG, PNG or WebP image.';input.value='';return;}
    if(file.size>MU_MEDIA_MAX_BYTES){message.textContent='That image is larger than 8 MB. Choose a smaller copy.';input.value='';return;}
    const reader=new FileReader();
    reader.onload=()=>{muSetCreatePhotoState(kind,file);preview.innerHTML=`<img src="${reader.result}" alt="Preview of selected photo"><span>${esc(file.name)}</span>`;};
    reader.onerror=()=>{message.textContent='This photograph could not be previewed. Try another file.';input.value='';};
    reader.readAsDataURL(file);
  });
}
function muAddCounter(fieldId,max,label){
  const field=$(fieldId);if(!field||field.dataset.muCounter)return;
  field.dataset.muCounter='true';field.maxLength=max;
  const counter=document.createElement('small');counter.className='create-character-count';
  const update=()=>{counter.textContent=`${field.value.length}/${max} ${label}`;};
  field.insertAdjacentElement('afterend',counter);field.addEventListener('input',update);update();
}
function muDecorateCreationModal(kind){
  const modal=muCreateModal(kind),sheet=modal?.querySelector('.sheet');if(!sheet)return;
  sheet.classList.add('create-flow-sheet');
  if(!sheet.querySelector('.create-flow-intro')){
    const h2=sheet.querySelector('h2');if(h2)h2.insertAdjacentHTML('afterend',muCreationIntro(kind));
  }
  if(!sheet.querySelector('.create-photo-block')){
    const message=$(kind==='journey'?'journeyFormMessage':'memoryFormMessage');
    if(message)message.insertAdjacentHTML('beforebegin',muCreationPhotoBlock(kind));
  }
  if(kind==='journey'){
    muAddCounter('story',700,'characters');
    $('journeyFormMessage')?.classList.add('form-message');
  }else{
    muAddCounter('memoryStory',900,'characters');muAddCounter('memoryClue',280,'characters');
    $('memoryFormMessage')?.classList.add('form-message');
  }
  muSetupCreatePhoto(kind);
}
function muResetCreationPhoto(kind){
  muSetCreatePhotoState(kind,null);
  const input=$(muCreateFileId(kind));if(input)input.value='';
  const preview=$(muCreatePreviewId(kind));if(preview)preview.innerHTML='<span>No photo selected yet.</span>';
  const message=$(muCreateMessageId(kind));if(message)message.textContent='';
}
async function muAttachCreatePhoto(kind,record,file){
  if(!file||!record)return false;
  if(typeof muUploadPhoto!=='function'||!record.cloud){toast(`${kind==='journey'?'Journey':'Memory'} saved. Photo upload will be available once this story is cloud-connected.`);return false;}
  const fakeButton={disabled:false,textContent:''},fakeMessage={textContent:''};
  const before=record[kind==='journey'?'coverPhotoPath':'photoPath']||'';
  toast(`${kind==='journey'?'Journey':'Memory'} saved · adding your photo securely…`);
  await muUploadPhoto(kind,record.id,file,fakeButton,fakeMessage);
  const after=record[kind==='journey'?'coverPhotoPath':'photoPath']||'';
  if(after&&after!==before)return true;
  if(fakeMessage.textContent)toast(`${kind==='journey'?'Journey':'Memory'} saved. ${fakeMessage.textContent}`);
  return false;
}
function muNewRecord(before,records){return records.find(record=>!before.has(String(record.id)))||null;}

function muInstallCreationFlow(){
  if(muCreationInstalled)return;muCreationInstalled=true;
  if(typeof openModal==='function'){
    const baseOpenModal=openModal;
    openModal=function(id){baseOpenModal(id);if(id==='journeyModal')queueMicrotask(()=>muDecorateCreationModal('journey'));if(id==='memoryModal')queueMicrotask(()=>muDecorateCreationModal('memory'));};
  }
  if(typeof createJourney==='function'){
    const baseCreateJourney=createJourney;
    createJourney=async function(){
      const before=new Set(journeys.map(record=>String(record.id))),file=muJourneyCreatePhoto;
      await baseCreateJourney();
      const created=muNewRecord(before,journeys);if(!created)return;
      muResetCreationPhoto('journey');
      if(file)await muAttachCreatePhoto('journey',created,file);else toast(created.cloud?'Journey created and saved to your cloud.':'Journey created on this device.');
    };
  }
  if(typeof createMemory==='function'){
    const baseCreateMemory=createMemory;
    createMemory=async function(){
      const before=new Set(memories.map(record=>String(record.id))),file=muMemoryCreatePhoto;
      await baseCreateMemory();
      const created=muNewRecord(before,memories);if(!created)return;
      muResetCreationPhoto('memory');
      if(file)await muAttachCreatePhoto('memory',created,file);else if(created.cloud&&!created.extrasPending)toast('Memory pinned and saved to your cloud.');
    };
  }
  document.addEventListener('click',event=>{
    const close=event.target.closest('#journeyModal .close,#memoryModal .close');if(!close)return;
    if(close.closest('#journeyModal'))muResetCreationPhoto('journey');
    if(close.closest('#memoryModal'))muResetCreationPhoto('memory');
  });
  if($('journeyModal')?.classList.contains('open'))muDecorateCreationModal('journey');
  if($('memoryModal')?.classList.contains('open'))muDecorateCreationModal('memory');
}
muInstallCreationFlow();
