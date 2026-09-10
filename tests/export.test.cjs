const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createRepository}=require('../data.js');
function fixture() {
 const rows={journeys:Array.from({length:51},(_,i)=>({id:String(i).padStart(4,'0'),owner_id:'owner',title:'Journey '+i,story:'<script>private text</script>',secret:'must not export'})),memories:[{id:'m1',owner_id:'owner',journey_id:'0000',title:'Moment',story:'Remember this',clue:'Notice the old arch'}]};
 const calls=[];let user={id:'owner'},onPage=null;
 const client={auth:{getUser:async()=>({data:{user}})},from:table=>{
  let filter;return {select(fields,options){assert.equal(options.count,'exact');return this;},eq(key,value){assert.equal(key,'owner_id');filter=value;return this;},order(key,options){assert.equal(key,'id');assert.equal(options.ascending,true);return this;},async range(start,end){calls.push({table,start,filter});if(onPage)return onPage({table,start,end,rows,calls});return {data:rows[table].slice(start,end+1),count:rows[table].length};}};
 }};
 return {rows,calls,repo:createRepository(client),setUser:value=>user=value,onPage:fn=>onPage=fn};
}
test('export reads every page twice, scopes to owner and strips unlisted fields',async()=>{
 const s=fixture(),result=await s.repo.exportCollection();
 assert.equal(result.journeys.length,51);assert.equal(result.memories.length,1);
 assert.equal(s.calls.length,6);assert(s.calls.every(c=>c.filter==='owner'));
 assert.equal(result.journeys[0].story,'<script>private text</script>');
 assert.equal(result.memories[0].clue,'Notice the old arch');
 assert(!('secret' in result.journeys[0]));assert(!('owner_id' in result.journeys[0]));
 assert.equal(result.version,1);
});
test('signed-out export never reads tables',async()=>{
 const s=fixture();s.setUser(null);await assert.rejects(s.repo.exportCollection(),/sign in/);assert.equal(s.calls.length,0);
});
test('later-page failures and truncated pages do not return a partial export',async()=>{
 const s=fixture();s.onPage(({table,start,end,rows})=>start?{error:new Error('Offline')}:{data:rows[table].slice(start,end+1),count:rows[table].length});
 await assert.rejects(s.repo.exportCollection(),/Offline/);
 s.onPage(({table,rows})=>({data:rows[table].slice(0,1),count:rows[table].length}));
 await assert.rejects(s.repo.exportCollection(),/full collection/);
});
test('changed account or cancelled request prevents a completed export',async()=>{
 const s=fixture();s.onPage(({table,start,end,rows})=>{s.setUser({id:'other'});return {data:rows[table].slice(start,end+1),count:rows[table].length};});
 await assert.rejects(s.repo.exportCollection(),/account or request changed/);
 const cancelled=fixture();await assert.rejects(cancelled.repo.exportCollection(()=>false),/cancelled/);assert.equal(cancelled.calls.length,0);
});
test('foreign rows, orphan memories and changes between reads are rejected',async()=>{
 const a=fixture();a.rows.journeys[0].owner_id='other';await assert.rejects(a.repo.exportCollection(),/full collection/);
 const b=fixture();b.rows.memories[0].journey_id='missing';await assert.rejects(b.repo.exportCollection(),/changed/);
 const c=fixture();c.onPage(({table,start,end,rows,calls})=>({data:rows[table].slice(start,end+1).map(row=>({...row,title:calls.length>3?'Changed':row.title})),count:rows[table].length}));
 await assert.rejects(c.repo.exportCollection(),/changed/);
});
test('empty collections work and oversized collections fail explicitly',async()=>{
 const a=fixture();a.rows.journeys=[];a.rows.memories=[];assert.equal((await a.repo.exportCollection()).memories.length,0);
 const b=fixture();b.onPage(()=>({data:[],count:2001}));await assert.rejects(b.repo.exportCollection(),/too large/);
});
