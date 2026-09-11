const {test}=require('node:test'),assert=require('node:assert/strict');
const {validate,createService}=require('../photos.js');
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',memory='11111111-1111-4111-8111-111111111111';
const jpeg=new Blob([new Uint8Array([255,216,255,224])],{type:'image/jpeg'});
function fixture(){
 let user={id:owner},failure=null;const calls=[];
 const client={auth:{getUser:async()=>({data:{user}})},storage:{from:bucket=>({
  upload:async(path,blob,options)=>{calls.push({bucket,path,options});return {error:failure};},
  download:async path=>{calls.push({bucket,path});return {data:jpeg,error:failure};},
  remove:async paths=>{calls.push({bucket,paths});return {data:paths,error:failure};}
 })}};
 return {client,calls,service:createService(client),user:value=>user=value,error:value=>failure=value};
}
test('file validation rejects disguised HTML, unsupported types, empty and large files',async()=>{
 await validate(jpeg);
 for(const file of [new Blob(['<svg onload=alert(1)>'],{type:'image/jpeg'}),new Blob(['x'],{type:'image/svg+xml'}),new Blob([]),{size:9*1024*1024}])await assert.rejects(validate(file));
});
test('photo upload derives owner path and never overwrites or creates public URLs',async()=>{
 const s=fixture();await s.service.upload(memory,jpeg);
 assert.equal(s.calls[0].path,owner+'/'+memory+'/photo.jpg');assert.equal(s.calls[0].bucket,'memory-photos');assert.equal(s.calls[0].options.upsert,false);
 assert.equal(await s.service.download(memory),jpeg);
});
test('photo deletion derives the same owner path and verifies the session',async()=>{
 const s=fixture();assert.deepEqual(await s.service.remove(memory),[owner+'/'+memory+'/photo.jpg']);
 assert.deepEqual(s.calls.at(-1),{bucket:'memory-photos',paths:[owner+'/'+memory+'/photo.jpg']});
 let first=true;s.user({id:owner});await assert.rejects(s.service.remove(memory,()=>{if(first){first=false;s.user({id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'});}return true;}),/account or photo request changed/);
});
test('signed out, invalid IDs, cancelled requests and invalid upload payloads fail before storage',async()=>{
 const s=fixture();await assert.rejects(s.service.upload('../other',jpeg));
 await assert.rejects(s.service.upload(memory,jpeg,()=>false));
 await assert.rejects(s.service.upload(memory,new Blob(['x'],{type:'image/svg+xml'})));
 s.user(null);await assert.rejects(s.service.download(memory));assert.equal(s.calls.length,0);
});
test('storage failures are never reported as saved and account switches discard results',async()=>{
 const s=fixture();s.error(new Error('Permission denied'));await assert.rejects(s.service.upload(memory,jpeg),/Permission denied/);
 const t=fixture();t.client.storage.from=()=>({download:async()=>{t.user(null);return {data:jpeg};}});
 await assert.rejects(t.service.download(memory),/account or photo request changed/);
});
test('an empty delete response is treated as unconfirmed',async()=>{
 const s=fixture();
 s.client.storage.from=()=>({remove:async()=>({data:[],error:null})});
 await assert.rejects(s.service.remove(memory),/could not be confirmed/);
});
