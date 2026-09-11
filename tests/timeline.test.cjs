const {test}=require('node:test'),assert=require('node:assert/strict');
const {events}=require('../timeline.js');
test('timeline combines and chronologically orders journeys and memories',()=>{
 const result=events([{id:'j2',title:'Later journey',start_date:'2025-01-01',story:'later',journey_status:'planned'},{id:'j1',title:'First journey',start_date:'1998-03-20',story:'first',journey_status:'dream'}],[{id:'m2',journey_id:'j1',title:'Later memory',memory_date:'1998-03-21',story:'two'},{id:'m1',journey_id:'j1',title:'First memory',memory_date:'1998-03-20',story:'one',clue:'Look under the arch'}]);
 assert.deepEqual(result.map(row=>row.title),['First journey','First memory','Later memory','Later journey']);assert.equal(result[1].journey,'First journey');assert.equal(result[1].clue,'Look under the arch');assert.equal(result[0].status,'dream');assert.equal(result[3].status,'planned');assert.equal(result[0].id,'j1');assert.equal(result[1].id,'m1');
});
test('timeline preserves full user text and places undated records last',()=>{
 const story='<b>Keep this as words</b>\n'+ 'A'.repeat(10000);const result=events([{id:'j',title:'Undated',story}], [{id:'m',journey_id:'j',title:'Memory',story}]);
 assert.equal(result[0].date,undefined);assert.equal(result[0].text,story);assert.equal(result[1].text,story);
});
