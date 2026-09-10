const {test}=require('node:test');
const assert=require('node:assert/strict');
const {render}=require('../book.js');
const document={createElement:tag=>({tag,children:[],append(...children){this.children.push(...children);},set innerHTML(value){throw new Error('Unsafe HTML write');}})};
function flatten(node){return [node,...node.children.flatMap(flatten)];}
test('book keeps full stories as text and orders journeys/memories by their dates',()=>{
 const story='<img src=x onerror=alert(1)>\n'+'A long memory. '.repeat(2000);
 const input={exported_at:'2026-09-10T12:00:00Z',journeys:[{id:'b',title:'Later',start_date:'2025-01-01'},{id:'a',title:'Earlier',start_date:'1998-03-20',story}],memories:[{id:'2',journey_id:'a',title:'Second',memory_date:'1998-03-21',story:'two'},{id:'1',journey_id:'a',title:'First',memory_date:'1998-03-20',story:'one'}]};
 const nodes=flatten(render(document,input));
 assert.deepEqual(nodes.filter(n=>n.tag==='h2').map(n=>n.textContent),['Earlier','Later']);
 assert.deepEqual(nodes.filter(n=>n.tag==='h3').map(n=>n.textContent),['First','Second']);
 assert(nodes.some(n=>n.tag==='p' && n.textContent===story));
 assert(nodes.some(n=>n.textContent==='20 March 1998'));
 assert(!nodes.some(n=>['img','script','iframe'].includes(n.tag)));
 assert.equal(input.journeys[0].id,'b');
});
test('empty book explains that no journeys are saved',()=>{
 const nodes=flatten(render(document,{exported_at:'2026-09-10',journeys:[],memories:[]}));
 assert(nodes.some(n=>n.textContent==='Your collection has no saved journeys yet.'));
});
