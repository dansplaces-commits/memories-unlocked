const {test}=require('node:test');
const assert=require('node:assert/strict');
const {journeyInput,memoryInput,createRepository}=require('../data.js');
const journeyId='11111111-1111-4111-8111-111111111111';
test('backdated journeys preserve calendar dates and force private visibility',()=>{
 const result=journeyInput({title:'  Our Rome Wedding ',start_date:'1998-03-20',end_date:'1998-03-21',visibility:'public',owner_id:'attacker'});
 assert.equal(result.start_date,'1998-03-20');assert.equal(result.visibility,'private');assert.equal(result.title,'Our Rome Wedding');assert.ok(!('owner_id' in result));
});
test('invalid calendar dates and reversed ranges are rejected',()=>{
 for(const input of [{start_date:'2025-02-29'},{end_date:'2026-01-02'},{start_date:'2026-01-02',end_date:'2026-01-01'}])assert.throws(()=>journeyInput({title:'Rome',...input}));
 assert.equal(journeyInput({title:'Leap day',start_date:'2024-02-29'}).start_date,'2024-02-29');
});
test('journey types and paired map coordinates are validated and normalised',()=>{
 const result=journeyInput({title:'Future Tokyo',journey_status:'dream',latitude:'35.6894872',longitude:'139.6917064'});
 assert.equal(result.journey_status,'dream');assert.equal(result.latitude,35.689487);assert.equal(result.longitude,139.691706);
 assert.equal(journeyInput({title:'Past',journey_status:'visited'}).journey_status,'visited');
 assert.throws(()=>journeyInput({title:'Unknown',journey_status:'maybe'}),/valid journey type/);
 assert.throws(()=>journeyInput({title:'Half pin',latitude:51.5}),/both map coordinates/);
 assert.throws(()=>journeyInput({title:'Outside',latitude:91,longitude:0}),/valid map coordinate/);
});
test('memories accept a complete map pin but reject a half pin',()=>{
 const result=memoryInput({journey_id:journeyId,title:'Lookout',story:'A view',clue:'Look under the arch',latitude:51.5,longitude:-0.12});
 assert.equal(result.latitude,51.5);assert.equal(result.longitude,-0.12);
 assert.equal(result.clue,'Look under the arch');
 assert.throws(()=>memoryInput({journey_id:journeyId,title:'Half pin',story:'A view',longitude:-0.12}),/both map coordinates/);
});
test('blank and overlong fields are rejected; memory needs real journey ID',()=>{
 assert.throws(()=>journeyInput({title:'   '}));assert.throws(()=>journeyInput({title:'x'.repeat(121)}));
 assert.throws(()=>memoryInput({journey_id:'other',title:'Day one',story:'Story'}));
 assert.throws(()=>memoryInput({journey_id:journeyId,title:'Day one',story:'   '}));
 assert.throws(()=>memoryInput({journey_id:journeyId,title:'Clue',story:'Story',clue:'x'.repeat(5001)}),/Clue must be 5000 characters or fewer/);
});
test('repository refuses writes without a verified user',async()=>{
 const repo=createRepository({auth:{getUser:async()=>({data:{user:null}})},from:()=>{return {insert:()=>{throw Error('Unexpected write');}};}});
 await assert.rejects(repo.saveJourney({title:'Rome'},journeyId),/sign in/);
 // Constructing a query is harmless; no insert should be called.
});
test('writes derive owner from verified session and only return confirmed database results',async()=>{
 let payload;
 const client={auth:{getUser:async()=>({data:{user:{id:'verified-owner'}}})},from:()=>({insert:p=>{payload=p;return {select:()=>({single:async()=>({data:{...p,created_at:'2026-09-09'}})})};}})};
 const result=await createRepository(client).saveJourney({title:'Rome',owner_id:'spoofed'},journeyId);
 assert.equal(payload.owner_id,'verified-owner');assert.equal(result.id,journeyId);assert.equal(result.created_at,'2026-09-09');
});
test('failed persistence rejects instead of returning an unsaved record',async()=>{
 const error={code:'PGRST205',message:'table missing'};
 const client={auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from:()=>({insert:()=>({select:()=>({single:async()=>({error})})})})};
 await assert.rejects(createRepository(client).saveJourney({title:'Rome'},journeyId),e=>e===error);
});
test('retry after an already committed insert returns that same owned record',async()=>{
 const row={id:journeyId,title:'Rome',owner_id:'owner'};
 const client={auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from:()=>({insert:()=>({select:()=>({single:async()=>({error:{code:'23505'}})})}),select:()=>({eq:()=>({single:async()=>({data:row})})})})};
 assert.equal(await createRepository(client).saveJourney({title:'Rome'},journeyId),row);
});
function updateClient(result) {
 const calls=[];
 const query={eq:(...args)=>{calls.push(['eq',...args]);return query;},is:(...args)=>{calls.push(['is',...args]);return query;},select:()=>query,maybeSingle:async()=>result};
 return {calls,auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from:table=>({update:payload=>{calls.push(['update',table,payload]);return query;}})};
}
test('editing scopes to verified owner and record and compares original values',async()=>{
 const original={id:journeyId,title:'Rome',story:'Old',location:'Italy',start_date:null,end_date:null};
 const client=updateClient({data:{...original,title:'Updated'}});
 const result=await createRepository(client).updateJourney({title:'Updated',owner_id:'spoofed',visibility:'public'},original);
 assert.equal(result.title,'Updated');
 assert.ok(client.calls.some(c=>c[0]==='eq' && c[1]==='owner_id' && c[2]==='owner'));
 assert.ok(client.calls.some(c=>c[0]==='eq' && c[1]==='id' && c[2]===journeyId));
 assert.ok(client.calls.some(c=>c[0]==='eq' && c[1]==='title' && c[2]==='Rome'));
 assert.ok(client.calls.some(c=>c[0]==='is' && c[1]==='start_date' && c[2]===null));
 assert.ok(!('owner_id' in client.calls[0][2]));assert.ok(!('visibility' in client.calls[0][2]));
});
test('memory edits cannot move the record to another journey',async()=>{
 const original={id:journeyId,journey_id:journeyId,title:'Moment',story:'Story',location:'',memory_date:null};
 const client=updateClient({data:original});
 await createRepository(client).updateMemory({title:'Moment',story:'Changed',journey_id:'attacker'},original);
 assert.ok(!('journey_id' in client.calls[0][2]));
});
test('conflicts and update permission failures never report success',async()=>{
 const original={id:journeyId,title:'Rome'};
 await assert.rejects(createRepository(updateClient({data:null})).updateJourney({title:'New'},original),/changed elsewhere/);
 const error={code:'42501'};
 await assert.rejects(createRepository(updateClient({error})).updateJourney({title:'New'},original),e=>e===error);
});
test('editing requires a verified user before issuing an update',async()=>{
 const client=updateClient({data:{}});client.auth.getUser=async()=>({data:{user:null}});
 await assert.rejects(createRepository(client).updateJourney({title:'New'},{id:journeyId}),/sign in/);
 assert.equal(client.calls.length,0);
});
