const {test}=require('node:test');
const assert=require('node:assert/strict');
const packs=require('../pin-packs.js');
const {pinFor}=require('../map.js');
test('starter pin packs are complete and safe to download',()=>{
 const classic=packs.builtins()[0];assert.equal(classic.format,'memories-unlocked-pin-pack');
 for(const kind of packs.kinds){assert.match(classic.styles[kind].color,/^#[0-9A-F]{6}$/);assert.ok(classic.styles[kind].symbol);}
 const parsed=JSON.parse(packs.json(classic));assert.deepEqual(packs.validate(parsed),classic);assert.match(packs.filename(classic),/\.json$/);
});
test('pin pack validation rejects executable-looking or incomplete styles',()=>{
 const base=packs.builtins()[0];
 assert.throws(()=>packs.validate({...base,name:'<script>'}),/valid/); // name is displayed as text, but malformed packs still need normal metadata.
 assert.throws(()=>packs.validate({...base,styles:{...base.styles,memory:{color:'red',symbol:'♥'}}}),/colour/);
 assert.throws(()=>packs.validate({...base,styles:{...base.styles,dream:{color:'#7251a3',symbol:'<img>'}}}),/symbol/);
 assert.throws(()=>packs.validate({...base,styles:{...base.styles,visited:undefined}}),/colour/);
});
test('map pin classification follows journey state and keeps memory pins distinct',()=>{
 const theme=packs.builtins()[0];
 assert.equal(pinFor({kind:'journey',journey_status:'dream'},theme).symbol,'★');
 assert.equal(pinFor({kind:'journey',journey_status:'planned'},theme).symbol,'→');
 assert.equal(pinFor({kind:'journey',journey_status:'visited'},theme).symbol,'✓');
 assert.equal(pinFor({kind:'memory',journey_status:'dream'},theme).symbol,'♥');
});
