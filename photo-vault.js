/* Memories Unlocked — Photo Vault beta (selected photographs only). */
(function(){
'use strict';
if(window.__muPhotoVaultInstalled)return;
window.__muPhotoVaultInstalled=true;
const BUCKET='memory-media', TABLE='photo_vault_items';
const MAX_FILES=20, MAX_BYTES=8*1024*1024;
const MIME={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
let viewer=null,items=[],user=null,chosenGroup='',busy=false;
const reverseCache=new Map(),previewCache=new Map();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const getClient=()=>window.muSupabase;
const timeLabel=row=>{
  if(row.taken_local){const p=String(row.taken_local).replace('T',' ').slice(0,16);const m=p.match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/);if(m)return `${m[3]}/${m[2]}/${m[1]} · ${m[4]}:${m[5]}`;}
  return row.taken_at?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(row.taken_at)):'Date unavailable';
};
const getPrefs=()=>{try{return JSON.parse(localStorage.getItem('mu-vault-prefs:'+user?.id)||'{}');}catch{return {};}};
const savePrefs=()=>{if(!user)return;try{localStorage.setItem('mu-vault-prefs:'+user.id,JSON.stringify({location:$('vaultLocation')?.checked||false,lookup:$('vaultLookup')?.checked||false,trip:$('vaultTrip')?.value||''}));}catch{}};
function status(message,error=false){const x=$('vaultStatus');if(x){x.textContent=message;x.classList.toggle('error',error);}}
function makeUi(){
 if($('photoVault'))return;
 const root=document.querySelector('.app');if(!root)return;
 const page=document.createElement('section');page.id='photoVault';page.className='view mu-vault-page';
 page.innerHTML=`
 <button class="back" type="button" onclick="showView('home')">← Home</button>
 <div class="mu-vault-head"><div><div class="mu-vault-kicker">MEMORIES UNLOCKED · PRIVATE COLLECTION</div><h1>Travel Photo Vault</h1><p>Capture the moment. We'll help you organise the story.</p></div><span class="mu-vault-head-icon" aria-hidden="true">▧</span></div>
 <div class="mu-vault-privacy"><strong>🔒 Your photos stay private.</strong> Your selected photos are uploaded only after you agree. This website cannot read your camera roll automatically or keep tracking your location in the background.</div>
 <div id="vaultAuth" class="mu-vault-auth" hidden></div>
 <div id="vaultWorking">
  <section class="mu-vault-import">
   <div class="mu-vault-import-head"><h2>Add your moments</h2><span id="vaultCount" class="mu-vault-count">0 / 20 photos</span></div>
   <label class="mu-vault-check"><input id="vaultConsent" type="checkbox"><span>I agree to upload only the photographs I choose to my private Memories Unlocked photo storage. Original files can contain embedded location data.</span></label>
   <label class="mu-vault-check"><input id="vaultLocation" type="checkbox"><span>Use location stored in my selected photos, or ask for my current location when taking a new photo, to organise folders.</span></label>
   <label class="mu-vault-check mu-vault-check-sub"><input id="vaultLookup" type="checkbox"><span>Optional: find friendly place names online. This sends the coordinates of selected photos to OpenStreetMap-based Photon for lookup.</span></label>
   <label class="mu-vault-input-label" for="vaultTrip">Trip name (optional)</label>
   <input id="vaultTrip" maxlength="75" placeholder="e.g. Our holiday in Italy">
   <div class="mu-vault-import-actions">
    <button id="vaultImport" class="mu-vault-primary" type="button">＋ Choose photos</button>
    <button id="vaultCapture" class="mu-vault-outline" type="button">◎ Take a photo</button>
   </div>
   <input id="vaultFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
   <input id="vaultCamera" type="file" accept="image/*" capture="environment" hidden>
   <p class="mu-vault-note">Photo Vault early access: up to 20 photos per account, maximum 8 MB each (JPG, PNG or WebP). You choose the photos to import; future native apps may offer optional automatic camera-roll syncing.</p>
   <p id="vaultStatus" class="mu-vault-status" role="status" aria-live="polite"></p>
  </section>
  <section class="mu-vault-collection">
   <div class="mu-vault-section-head"><div><div class="mu-vault-kicker">YOUR COLLECTION</div><h2>Folders &amp; places</h2></div><button type="button" id="vaultRefresh" class="mu-vault-refresh">↻ Refresh</button></div>
   <div id="vaultFolders" class="mu-vault-folders"></div>
   <div id="vaultGallery" class="mu-vault-gallery"></div>
  </section>
 </div>
 <div id="vaultDialog" class="mu-vault-dialog" hidden></div>`;
 root.appendChild(page);
 const grid=document.querySelector('#home .grid');
 if(grid&&!grid.querySelector('[data-vault-open]')){
  const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='card mu-vault-shortcut';
  shortcut.dataset.vaultOpen='1';shortcut.innerHTML='<span>▧ Travel Photo Vault</span>';grid.appendChild(shortcut);
 }
 document.addEventListener('click',onClick);
 $('vaultFiles').addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';importSelected(files,false);});
 $('vaultCamera').addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';importSelected(files,true);});
 ['vaultLocation','vaultLookup','vaultTrip'].forEach(id=>$(id).addEventListener('change',savePrefs));
 const addToolbar=()=>{
  const nav=document.querySelector('.mu-toolbar-nav');
  if(nav&&!nav.querySelector('[data-mu-toolbar-view="photoVault"]')){
   const b=document.createElement('button');b.type='button';b.dataset.vaultOpen='1';b.textContent='Photo Vault';nav.appendChild(b);
  }
 };
 addToolbar();
 [400,1000,2000].forEach(ms=>setTimeout(addToolbar,ms));
}
function onClick(event){
 if(event.target.closest('[data-vault-close]')){closeDialog();return;}
 const button=event.target.closest('button');if(!button)return;
 if(button.matches('[data-vault-open]')){event.preventDefault();open();return;}
 if(button.id==='vaultImport'){if(checkConsent())$('vaultFiles').click();return;}
 if(button.id==='vaultCapture'){if(checkConsent())$('vaultCamera').click();return;}
 if(button.id==='vaultRefresh'){refresh();return;}
 if(button.dataset.vaultFolder!==undefined){chosenGroup=button.dataset.vaultFolder;renderCollection();return;}
 if(button.dataset.vaultRename!==undefined){renameFolder(button.dataset.vaultRename);return;}
 if(button.dataset.vaultItem){openPhoto(button.dataset.vaultItem);return;}
 if(button.dataset.vaultLink){linkDialog(button.dataset.vaultLink);return;}
 if(button.dataset.vaultRemove){removePhoto(button.dataset.vaultRemove);return;}
 if(button.dataset.vaultClose!==undefined){closeDialog();return;}
 if(button.dataset.vaultSaveLink){finishLink(button.dataset.vaultSaveLink);return;}
}
function checkConsent(){
 if(busy){status('An import is already in progress.',true);return false;}
 if(!$('vaultConsent')?.checked){status('Please tick the private photo upload agreement before choosing photographs.',true);return false;}
 if(!user){status('Please sign in to your account first.',true);return false;}
 if(items.length>=MAX_FILES){status('Your 20-photo early-access allowance is full.',true);return false;}
 return true;
}
async function authenticate(){
 if(!getClient())return null;
 const {data,error}=await getClient().auth.getUser();
 if(error)throw error;
 const current=data?.user;
 if(!current||current.is_anonymous)return null;
 return current;
}
async function open(){
 makeUi();
 if(typeof showView==='function')showView('photoVault');
 await refresh();
}
window.muOpenPhotoVault=open;
async function refresh(){
 if(!$('vaultWorking'))return;
 try{
  const who=await authenticate();
  if(!who){
   user=null;items=[];chosenGroup='';$('vaultWorking').hidden=true;$('vaultAuth').hidden=false;
   $('vaultAuth').innerHTML='<h2>Keep your photos safely with you</h2><p>Sign in or create a free Memories Unlocked account to store private photos and access them on your devices.</p><button class="mu-vault-primary" type="button" id="vaultAccount">Open Account</button>';
   $('vaultAccount').onclick=()=>typeof openAccount==='function'?openAccount():status('Account screen is unavailable.',true);
   return;
  }
  if(user?.id!==who.id){items=[];chosenGroup='';user=who;const prefs=getPrefs();$('vaultConsent').checked=false;$('vaultLocation').checked=Boolean(prefs.location);$('vaultLookup').checked=Boolean(prefs.lookup);$('vaultTrip').value=prefs.trip||'';}
  $('vaultAuth').hidden=true;$('vaultWorking').hidden=false;
  const {data,error}=await getClient().from(TABLE).select('id,owner_id,file_path,file_name,mime_type,size_bytes,taken_at,taken_local,date_source,latitude,longitude,folder_label,trip_label,fingerprint,source,linked_memory_id').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(100);
  if(error)throw error;
  items=data||[];
  if(chosenGroup&&!items.some(item=>groupKey(item)===chosenGroup))chosenGroup='';
  renderCollection();
 }catch(error){console.warn('Photo Vault:',error);status('Unable to load your private Photo Vault. Please try refreshing.',true);}
}
function groupKey(item){return (item.trip_label||'My travels')+'|'+(item.folder_label||'Unsorted');}
function renderCollection(){
 $('vaultCount').textContent=`${items.length} / ${MAX_FILES} photos`;
 const groups=new Map();
 for(const item of items){const key=groupKey(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 const sorted=[...groups.entries()].sort((a,b)=>b[1].length-a[1].length);
 if(!items.length){
  $('vaultFolders').innerHTML='<div class="mu-vault-empty"><span>✧</span><h3>Your first chapter starts here</h3><p>Choose photographs from your phone or computer. We will sort them into place and date collections using the information available.</p></div>';
  $('vaultGallery').innerHTML='';return;
 }
 $('vaultFolders').innerHTML=sorted.map(([key,pics])=>{
  const sample=pics[0],name=sample.folder_label||'Unsorted',trip=sample.trip_label||'My travels',on=chosenGroup===key;
  return `<button class="mu-vault-folder ${on?'active':''}" type="button" data-vault-folder="${esc(key)}" aria-pressed="${on}">
    <span class="mu-vault-folder-art">▤ <small>${pics.length} photo${pics.length===1?'':'s'}</small></span>
    <strong>${esc(name)}</strong><span>${esc(trip)}</span>
    <small>${esc(timeLabel(sample))}</small>
  </button>`;
 }).join('');
 if(!chosenGroup)chosenGroup=sorted[0]?.[0]||'';
 const selected=groups.get(chosenGroup)||[];
 const title=selected[0]?.folder_label||'Photo collection';
 $('vaultGallery').innerHTML=`<div class="mu-vault-gallery-heading"><div><h3>${esc(title)}</h3><p>${selected.length} photographs · organised automatically where location data is available</p></div><button type="button" class="mu-vault-refresh" data-vault-rename="${esc(chosenGroup)}">✎ Rename folder</button></div>
 <div class="mu-vault-photo-grid">${selected.map(item=>`<article class="mu-vault-photo">
 <button type="button" class="mu-vault-photo-open" data-vault-item="${esc(item.id)}"><span class="mu-vault-image" data-vault-image="${esc(item.id)}">Loading photograph…</span></button>
 <div class="mu-vault-photo-info"><strong title="${esc(item.file_name)}">${esc(item.file_name)}</strong><span>${esc(timeLabel(item))}</span><span>${item.latitude!==null&&item.longitude!==null?'📍 '+Number(item.latitude).toFixed(3)+', '+Number(item.longitude).toFixed(3):'No GPS location recorded'}</span></div>
 <div class="mu-vault-photo-actions"><button type="button" data-vault-link="${esc(item.id)}" ${item.linked_memory_id?'disabled':''}>${item.linked_memory_id?'✓ Added to memory':'＋ Use in memory'}</button><button type="button" data-vault-remove="${esc(item.id)}" ${item.linked_memory_id?'disabled':''}>Remove</button></div>
 </article>`).join('')}</div>`;
 for(const item of selected){
  const spot=document.querySelector('[data-vault-image="'+CSS.escape(item.id)+'"]');
  if(!spot)continue;
  resolvePhoto(item.file_path).then(url=>{
   if(spot.isConnected)spot.innerHTML='<img loading="lazy" alt="'+esc(item.file_name)+'" src="'+esc(url)+'">';
  }).catch(()=>{if(spot.isConnected)spot.textContent='Photo unavailable';});
 }
}
async function resolvePhoto(path){
 const old=previewCache.get(path);
 if(old&&old.exp>Date.now()+30000)return old.url;
 const {data,error}=await getClient().storage.from(BUCKET).createSignedUrl(path,3600);
 if(error||!data?.signedUrl)throw error||new Error('No signed URL');
 previewCache.set(path,{url:data.signedUrl,exp:Date.now()+3500*1000});
 return data.signedUrl;
}
async function openPhoto(id){
 const photo=items.find(p=>p.id===id);if(!photo)return;
 try{const src=await resolvePhoto(photo.file_path);
  const modal=$('vaultDialog');modal.hidden=false;
  modal.innerHTML=`<div class="mu-vault-dialog-scrim" data-vault-close></div><div class="mu-vault-dialog-card" role="dialog" aria-modal="true" aria-label="Photograph detail"><button class="mu-vault-dialog-x" type="button" data-vault-close>×</button><img src="${esc(src)}" alt="${esc(photo.file_name)}"><h3>${esc(photo.file_name)}</h3><p>${esc(timeLabel(photo))}</p><p>${esc(photo.folder_label)} · ${photo.latitude!==null?'📍 '+photo.latitude.toFixed(5)+', '+photo.longitude.toFixed(5):'Location not recorded'}</p><p>Privately stored in your Photo Vault</p></div>`;
 }catch{status('This photograph could not be loaded.',true);}
}
function closeDialog(){const dialog=$('vaultDialog');if(dialog){dialog.innerHTML='';dialog.hidden=true;}}
async function renameFolder(key){
 if(!items.length)return;const associated=items.filter(i=>groupKey(i)===key);
 if(!associated.length)return;
 const previous=associated[0].folder_label||'Unsorted';
 const next=prompt('Name this photo location or folder:',previous);
 if(next===null)return;
 const value=next.trim().slice(0,100);
 if(!value){status('A folder name cannot be blank.',true);return;}
 try{
  const {error}=await getClient().from(TABLE).update({folder_label:value}).eq('owner_id',user.id).in('id',associated.map(p=>p.id));
  if(error)throw error;
  chosenGroup=(associated[0].trip_label||'My travels')+'|'+value;
  status('Folder renamed. The original photographs have not been changed.');
  await refresh();
 }catch(e){status('Folder name could not be updated.',true);}
}
async function removePhoto(id){
 const item=items.find(p=>p.id===id);if(!item||!user)return;
 if(item.linked_memory_id){status('This photograph belongs to a memory. Unlink it before removing it.',true);return;}
 if(!confirm('Remove this photograph from your private cloud vault? The copy on your phone or computer will not be deleted.'))return;
 try{
  const {error}=await getClient().from(TABLE).delete().eq('owner_id',user.id).eq('id',item.id).is('linked_memory_id',null);
  if(error)throw error;
  const removed=await getClient().storage.from(BUCKET).remove([item.file_path]);
  status(removed.error?'The photo was removed from the gallery, but its cloud file could not be cleaned up.':'Photo removed from your vault. Your device photo is unchanged.',Boolean(removed.error));
  previewCache.delete(item.file_path);
  await refresh();
 }catch(e){status('The photograph could not be removed. Please try again.',true);}
}
async function linkDialog(id){
 const item=items.find(p=>p.id===id);if(!item||item.linked_memory_id)return;
 try{
  const {data,error}=await getClient().from('memories').select('id,title,location,photo_path').eq('owner_id',user.id).order('created_at',{ascending:false});
  if(error)throw error;
  const choices=(data||[]).filter(m=>!m.photo_path);
  const modal=$('vaultDialog');modal.hidden=false;
  modal.innerHTML=`<div class="mu-vault-dialog-scrim" data-vault-close></div><div class="mu-vault-link-card" role="dialog" aria-modal="true" aria-label="Use photo in a memory"><button class="mu-vault-dialog-x" type="button" data-vault-close>×</button><div class="mu-vault-kicker">TURN A PHOTO INTO A STORY</div><h2>Use in a memory</h2><p>Your original photo stays in the private Photo Vault.</p>${choices.length?`<label for="vaultMemoryChoice">Choose a memory without a photograph</label><select id="vaultMemoryChoice">${choices.map(m=>`<option value="${esc(m.id)}">${esc(m.title)} — ${esc(m.location)}</option>`).join('')}</select><button type="button" class="mu-vault-primary" data-vault-save-link="${esc(id)}">Attach photograph</button>`:'<p>There are no memories without a photograph yet. Create a memory first, then return to your Photo Vault.</p>'}</div>`;
 }catch(e){status('Could not load your memories to attach this photo.',true);}
}
async function finishLink(id){
 const item=items.find(p=>p.id===id),memoryId=$('vaultMemoryChoice')?.value;if(!item||!memoryId)return;
 const btn=document.querySelector('[data-vault-save-link]');if(btn)btn.disabled=true;
 try{
  const {data,error}=await getClient().from('memories').update({photo_path:item.file_path}).eq('id',memoryId).eq('owner_id',user.id).is('photo_path',null).select('id');
  if(error||!data?.length)throw error||new Error('Memory already has a photo');
  const link=await getClient().from(TABLE).update({linked_memory_id:memoryId}).eq('id',item.id).eq('owner_id',user.id);
  if(link.error)throw link.error;
  closeDialog();status('Photo safely added to your memory. You can return here to organise other moments.');
  if(typeof window.muScheduleMediaRefresh==='function')window.muScheduleMediaRefresh();
  await refresh();
 }catch(e){console.warn('Vault memory link',e);status('Could not finish linking this photograph. Review the memory before retrying.',true);if(btn)btn.disabled=false;}
}
async function currentPosition(){
 if(!navigator.geolocation)return null;
 return new Promise(resolve=>navigator.geolocation.getCurrentPosition(
  p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude}),
  ()=>resolve(null),{enableHighAccuracy:true,timeout:12000,maximumAge:120000}
 ));
}
async function digest(file){
 const buf=await file.arrayBuffer();
 const hash=await crypto.subtle.digest('SHA-256',buf);
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function exifInfo(buffer){
 const out={};
 try{
  const v=new DataView(buffer),n=v.byteLength;
  if(n<12||v.getUint16(0)!==0xffd8)return out;
  for(let i=2;i+10<n;){
   if(v.getUint8(i)!==0xff)break;
   const mark=v.getUint8(i+1);if(mark===0xda||mark===0xd9)break;
   const size=v.getUint16(i+2);if(size<2||i+size+2>n)break;
   if(mark===0xe1&&[69,120,105,102,0,0].every((b,j)=>v.getUint8(i+4+j)===b)){
    const base=i+10,little=v.getUint16(base)===0x4949;
    if(!little&&v.getUint16(base)!==0x4d4d)break;
    const u16=p=>{if(p<0||p+2>n)throw Error('Invalid EXIF');return v.getUint16(p,little);};
    const u32=p=>{if(p<0||p+4>n)throw Error('Invalid EXIF');return v.getUint32(p,little);};
    const ifd=offset=>{
     const start=base+offset,count=u16(start),map=new Map();if(count>400)throw Error('EXIF too big');
     for(let j=0;j<count;j++){const pos=start+2+12*j;if(pos+12>n)break;map.set(u16(pos),pos);}
     return map;
    };
    const ascii=(entry)=>{
     if(entry===undefined)return '';
     const len=u32(entry+4),pos=len<=4?entry+8:base+u32(entry+8);
     if(len>150||pos<0||pos+len>n)return '';
     let str='';for(let k=0;k<len;k++)str+=String.fromCharCode(v.getUint8(pos+k));
     return str.replace(/\0/g,'').trim();
    };
    const fractions=(entry)=>{
     if(entry===undefined||u16(entry+2)!==5)return [];
     const count=u32(entry+4);if(count>8)return [];
     const at=base+u32(entry+8),values=[];
     for(let k=0;k<count;k++){const num=u32(at+8*k),den=u32(at+8*k+4);values.push(den?num/den:0);}
     return values;
    };
    const root=ifd(u32(base+4));
    if(root.has(0x8769)){
     const ex=ifd(u32(root.get(0x8769)+8));
     const raw=ascii(ex.get(0x9003))||ascii(ex.get(0x9004));
     const m=raw.match(/^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/);
     if(m)out.localDate=`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
    }
    if(root.has(0x8825)){
     const gps=ifd(u32(root.get(0x8825)+8));
     const lat=fractions(gps.get(2)),lon=fractions(gps.get(4));
     const north=ascii(gps.get(1)),east=ascii(gps.get(3));
     if(lat.length===3&&lon.length===3){
      const a=(lat[0]+lat[1]/60+lat[2]/3600)*(north==='S'?-1:1);
      const b=(lon[0]+lon[1]/60+lon[2]/3600)*(east==='W'?-1:1);
      if(Math.abs(a)<=90&&Math.abs(b)<=180)out.coords={latitude:a,longitude:b};
     }
    }
    break;
   }
   i+=size+2;
  }
 }catch(e){console.debug('Vault: photograph metadata unavailable');}
 return out;
}
async function readMeta(file){
 if(file.type!=='image/jpeg')return {};
 return exifInfo(await file.slice(0,Math.min(file.size,512*1024)).arrayBuffer());
}
async function folderName(lat,lon,lookUp){
 const coords='GPS '+lat.toFixed(2)+', '+lon.toFixed(2);
 if(!lookUp)return coords;
 const key=lat.toFixed(2)+','+lon.toFixed(2);
 if(reverseCache.has(key))return reverseCache.get(key);
 let label=coords;
 try{
  const url=new URL('https://photon.komoot.io/reverse');
  url.search=new URLSearchParams({lat:String(lat),lon:String(lon),limit:'1',lang:'en'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5500);
  try{
   const response=await fetch(url.toString(),{signal:controller.signal});
   if(response.ok){
    const payload=await response.json(),p=payload.features?.[0]?.properties||{};
    const place=p.city||p.town||p.village||p.county||p.name||'';
    if(place)label=[place,p.country].filter(Boolean).join(', ').slice(0,100);
   }
  }finally{clearTimeout(timer);}
 }catch(e){/* Offline or rate-limited: coordinates remain available. */}
 reverseCache.set(key,label);return label;
}
async function importSelected(files,captured){
 if(!files.length||!checkConsent())return;
 busy=true;
 $('vaultImport').disabled=true;$('vaultCapture').disabled=true;
 const withLocation=$('vaultLocation').checked,withLookup=withLocation&&$('vaultLookup').checked;
 const trip=$('vaultTrip').value.trim().slice(0,75);
 const current=captured&&withLocation?await currentPosition():null;
 let saved=0,duplicates=0,fail=0;
 const allowed=Math.max(0,MAX_FILES-items.length);
 if(files.length>allowed)status('Importing your first '+allowed+' photos. This preview has a '+MAX_FILES+'-photo limit.');
 for(const [index,file] of files.slice(0,allowed).entries()){
  if(!MIME[file.type]||file.size>MAX_BYTES||file.size<1){fail++;status('Skipped unsupported or oversized photo: '+file.name,true);continue;}
  status('Saving '+(index+1)+' of '+Math.min(files.length,allowed)+' photographs…');
  let path='';
  try{
   const fingerprint=await digest(file);
   if(items.some(row=>row.fingerprint===fingerprint)){duplicates++;continue;}
   const metadata=await readMeta(file);
   const coords=withLocation?(metadata.coords||current):null;
   const dateFromFile=new Date(file.lastModified||Date.now());
   const takenLocal=metadata.localDate||null;
   const takenAt=takenLocal?new Date(takenLocal+'Z').toISOString():dateFromFile.toISOString();
   const day=(takenLocal||dateFromFile.toISOString()).slice(0,10);
   const group=coords?await folderName(coords.latitude,coords.longitude,withLookup):'No location · '+day;
   path=user.id+'/vault/'+crypto.randomUUID()+'.'+MIME[file.type];
   const upload=await getClient().storage.from(BUCKET).upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
   if(upload.error)throw upload.error;
   const {data,error}=await getClient().from(TABLE).insert({
    owner_id:user.id,file_path:path,file_name:file.name.slice(0,240),mime_type:file.type,size_bytes:file.size,
    taken_at:takenAt,taken_local:takenLocal,date_source:takenLocal?'exif':(captured?'camera':'file'),
    latitude:coords?.latitude??null,longitude:coords?.longitude??null,folder_label:group,trip_label:trip,
    fingerprint,source:captured?'camera':'import'
   }).select('id').single();
   if(error||!data){await getClient().storage.from(BUCKET).remove([path]);path='';throw error||new Error('Photo record unavailable');}
   items.push({id:data.id,owner_id:user.id,file_path:path,file_name:file.name,mime_type:file.type,size_bytes:file.size,taken_at:takenAt,taken_local:takenLocal,latitude:coords?.latitude??null,longitude:coords?.longitude??null,folder_label:group,trip_label:trip,fingerprint,linked_memory_id:null});
   saved++;
  }catch(e){
   fail++;console.warn('Vault import:',e);
   if(path){try{await getClient().storage.from(BUCKET).remove([path]);}catch{}}
  }
 }
 busy=false;$('vaultImport').disabled=false;$('vaultCapture').disabled=false;
 await refresh();
 status(`${saved}`+' photo'+(saved===1?'':'s')+' safely saved'+(duplicates?', '+duplicates+' duplicate'+(duplicates===1?'':'s')+' skipped':'')+(fail?', '+fail+' could not be imported (JPG/PNG/WebP, max 8 MB)':''),Boolean(fail));
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog();});
function ready(){makeUi();if(getClient()?.auth?.onAuthStateChange){getClient().auth.onAuthStateChange((event)=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))setTimeout(()=>{if($('photoVault')?.classList.contains('active'))refresh();},150);});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();