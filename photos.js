(function(root){
 'use strict';
 const BUCKET='memory-photos',MAX_INPUT=8*1024*1024,MAX_UPLOAD=5*1024*1024;
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 async function validate(file){
  if(!file || !file.size || file.size>MAX_INPUT)throw new Error('Choose a photo smaller than 8 MB.');
  const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const jpeg=b[0]===255&&b[1]===216&&b[2]===255;
  const png=[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
  const webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
  if(!((file.type==='image/jpeg'&&jpeg)||(file.type==='image/png'&&png)||(file.type==='image/webp'&&webp)))throw new Error('Choose a JPEG, PNG or WebP photo. Convert HEIC photos to JPEG first.');
 }
 async function prepare(file){
  await validate(file);
  let bitmap;
  try{bitmap=await root.createImageBitmap(file);}catch(error){throw new Error('This photo could not be opened. Try a JPEG or a smaller image in your main browser.');}
  try{
   if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>40000000)throw new Error('Choose a photo with fewer than 40 million pixels.');
   const scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
   const canvas=root.document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const context=canvas.getContext('2d');if(!context)throw new Error('Photo preparation is unavailable in this browser.');
   context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.85));
   if(!blob||blob.type!=='image/jpeg'||blob.size>MAX_UPLOAD)throw new Error('This photo is too large to save. Choose a smaller image.');
   return blob;
  }finally{bitmap.close();}
 }
 function createService(client){
  async function path(memoryId,isCurrent){
   if(!uuid.test(memoryId))throw new Error('Open a saved memory first.');
   const {data,error}=await client.auth.getUser();
   if(error||!uuid.test(data?.user?.id||'')||!isCurrent())throw new Error('Your account changed. Please sign in again.');
   return {owner:data.user.id,name:data.user.id+'/'+memoryId+'/photo.jpg'};
  }
  async function verify(owner,isCurrent){
   const {data,error}=await client.auth.getUser();
   if(error||data?.user?.id!==owner||!isCurrent())throw new Error('Your account or photo request changed. Reopen the memory to check its photo.');
  }
  return {
   async upload(memoryId,blob,isCurrent=()=>true){
    if(!blob||blob.type!=='image/jpeg'||!blob.size||blob.size>MAX_UPLOAD)throw new Error('Prepare a JPEG photo smaller than 5 MB first.');
    const target=await path(memoryId,isCurrent);
    const {error}=await client.storage.from(BUCKET).upload(target.name,blob,{contentType:'image/jpeg',cacheControl:'0',upsert:false});
    if(error)throw error;
    await verify(target.owner,isCurrent);
   },
   async download(memoryId,isCurrent=()=>true){
    const target=await path(memoryId,isCurrent);
    const {data,error}=await client.storage.from(BUCKET).download(target.name);
    if(error)throw error;
    await verify(target.owner,isCurrent);
    if(!data||data.type!=='image/jpeg'||data.size>MAX_UPLOAD)throw new Error('The saved file could not be displayed as a photo.');
    return data;
   },
   async remove(memoryId,isCurrent=()=>true){
    const target=await path(memoryId,isCurrent);
    await verify(target.owner,isCurrent);
    const {data,error}=await client.storage.from(BUCKET).remove([target.name]);
    if(error)throw error;
    await verify(target.owner,isCurrent);
    return data;
   }
  };
 }
 const api={validate,prepare,createService};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MemoriesPhotos=api;
})(typeof window!=='undefined'?window:globalThis);
