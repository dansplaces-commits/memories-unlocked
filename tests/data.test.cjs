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
test('blank and overlong fields are rejected; memory needs real journey ID',()=>{
 assert.throws(()=>journeyInput({title:'   '}));assert.throws(()=>journeyInput({title:'x'.repeat(121)}));
 assert.throws(()=>memoryInput({journey_id:'other',title:'Day one',story:'Story'}));
 assert.throws(()=>memoryInput({journey_id:journeyId,title:'Day one',story:'   '}));
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
