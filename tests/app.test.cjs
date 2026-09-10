// Isolated UI-controller tests with minimal fake elements. No browser or live service.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
async function setup(initialUser=null) {
 const nodes=new Map(),calls=[],timers=[];let authCallback;
 const node=()=>({value:'',textContent:'',hidden:false,disabled:false,open:false,handlers:{},children:[],classList:{toggle(){}},
 addEventListener(type,fn){this.handlers[type]=fn;},
 async fire(type,event={}){return this.handlers[type]?.({preventDefault(){},...event});},
 reset(){for(const n of nodes.values())if(n.form===this)n.value='';},
 close(){this.open=false;this.handlers.close?.();},showModal(){this.open=true;},
 removeAttribute(name){delete this[name];},reportValidity(){return this.value.includes('@');},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},scrollIntoView(){}
 });
 for(const id of html.matchAll(/\bid="([^"]+)"/g))nodes.set(id[1],node());
 for(const form of html.matchAll(/<form id="([^"]+)"[^>]*>([\s\S]*?)<\/form>/g))for(const id of form[2].matchAll(/\bid="([^"]+)"/g))nodes.get(id[1]).form=nodes.get(form[1]);
 let current=initialUser;
 const auth={
 onAuthStateChange(fn){authCallback=fn;},getSession:async()=>({data:{session:current?{user:current}:null}}),
 getUser:async()=>({data:{user:current}}),
 signInWithPassword:async input=>{calls.push(['signIn',input]);return {data:{user:current,session:{user:current}}};},
 updateUser:async input=>{calls.push(['updateUser',input]);return {data:{user:current}};},
 resetPasswordForEmail:async email=>{calls.push(['reset',email]);return {};},
 resend:async input=>{calls.push(['resend',input]);return {};}
 };
 const repo={listJourneys:async()=>[],listMemories:async()=>[]};
 const context={document:{getElementById:id=>{assert.ok(nodes.has(id),'Unknown id '+id);return nodes.get(id);},createElement:node,querySelectorAll:()=>[]},
 window:{supabase:{createClient:()=>({auth})},MEMORIES_CONFIG:{},MemoriesData:{createRepository:()=>repo},MemoriesBook:require('../book.js'),print:()=>calls.push(['print'])},
 MemoriesData:{PAGE_SIZE:50,createRepository:()=>repo},MEMORIES_CONFIG:{},
 Intl,Date,URLSearchParams,Blob,URL:{createObjectURL:()=>{calls.push(['createBlob']);return 'blob:test';},revokeObjectURL:url=>calls.push(['revokeBlob',url])},location:{hash:'',search:'',pathname:'/'},history:{replaceState(){}},crypto:{randomUUID:()=> 'test-id'},
 setTimeout:fn=>timers.push(fn)
 };
 vm.runInNewContext(source,context);
 const flush=async()=>{for(let i=0;i<12;i++){await Promise.resolve();while(timers.length)timers.shift()();}};
 await flush();
 return {nodes,calls,auth,repo,flush,emit:async(event,user)=>{current=user;authCallback(event,user?{user}:null);await flush();}};
}
test('reset uses email only and repeated requests are held locally',async()=>{
 const s=await setup();s.nodes.get('email').value='test@example.com';
 await s.nodes.get('forgotPassword').fire('click');
 await s.nodes.get('resendConfirmation').fire('click');
 assert.equal(s.calls.length,1);assert.equal(s.calls[0][0],'reset');
 assert.match(s.nodes.get('authStatus').textContent,/wait/);
});
test('email limit errors display actionable guidance',async()=>{
 const s=await setup();s.nodes.get('email').value='test@example.com';
 s.auth.resetPasswordForEmail=async()=>({error:{code:'over_email_send_rate_limit'}});
 await s.nodes.get('forgotPassword').fire('click');
 assert.match(s.nodes.get('authStatus').textContent,/temporarily limited/);
 assert.equal(s.nodes.get('forgotPassword').disabled,false);
});
test('change password verifies current credentials and rejects mismatching new values',async()=>{
 const s=await setup({id:'owner',email:'test@example.com'});
 await s.nodes.get('changePassword').fire('click');
 s.nodes.get('newPassword').value='a-long-new-password';s.nodes.get('confirmPassword').value='different-password';
 await s.nodes.get('passwordForm').fire('submit');assert.equal(s.calls.length,0);
 s.nodes.get('confirmPassword').value='a-long-new-password';s.nodes.get('currentPassword').value='old-password';
 await s.nodes.get('passwordForm').fire('submit');
 assert.deepEqual(s.calls.map(c=>c[0]),['signIn','updateUser']);
 assert.equal(s.nodes.get('newPassword').value,'');assert.equal(s.nodes.get('passwordModal').open,false);
});
test('wrong current password cannot update the account',async()=>{
 const s=await setup({id:'owner',email:'test@example.com'});
 await s.nodes.get('changePassword').fire('click');
 s.auth.signInWithPassword=async()=>({error:{message:'Invalid login credentials'}});
 s.nodes.get('newPassword').value=s.nodes.get('confirmPassword').value='a-long-new-password';
 await s.nodes.get('passwordForm').fire('submit');
 assert.equal(s.calls.length,0);assert.match(s.nodes.get('passwordStatus').textContent,/Invalid/);
});
test('recovery event opens password form; session loss clears it and prevents update',async()=>{
 const s=await setup();await s.emit('PASSWORD_RECOVERY',{id:'owner',email:'test@example.com'});
 assert.equal(s.nodes.get('passwordModal').open,true);assert.equal(s.nodes.get('currentPassword').required,false);
 s.nodes.get('newPassword').value=s.nodes.get('confirmPassword').value='a-long-new-password';
 await s.nodes.get('passwordForm').fire('submit');
 assert.deepEqual(s.calls.map(c=>c[0]),['updateUser']);
 await s.emit('SIGNED_OUT',null);
 assert.equal(s.nodes.get('passwordModal').open,false);
 await s.nodes.get('passwordForm').fire('submit');assert.equal(s.calls.length,1);
});
test('prepared export is downloadable but never claims a completed save; sign-out revokes it',async()=>{
 const s=await setup({id:'owner',email:'test@example.com'});
 s.repo.exportCollection=async()=>({exported_at:'2026-09-10T12:00:00Z',journeys:[],memories:[]});
 await s.nodes.get('openExport').fire('click');await s.nodes.get('prepareExport').fire('click');
 assert.equal(s.nodes.get('downloadExport').href,'blob:test');
 assert.equal(s.nodes.get('downloadExport').hidden,false);
 assert.match(s.nodes.get('exportStatus').textContent,/not been saved yet/);
 await s.emit('SIGNED_OUT',null);
 assert.equal(s.nodes.get('downloadExport').href,undefined);assert.equal(s.nodes.get('downloadExport').hidden,true);
 assert(s.calls.some(c=>c[0]==='revokeBlob'));
});
test('closing an in-flight export or a fetch failure never creates a download',async()=>{
 const s=await setup({id:'owner',email:'test@example.com'});let resolve;
 s.repo.exportCollection=()=>new Promise(r=>resolve=r);
 await s.nodes.get('openExport').fire('click');const pending=s.nodes.get('prepareExport').fire('click');
 s.nodes.get('exportModal').close();resolve({exported_at:'2026-09-10',journeys:[],memories:[]});await pending;
 assert(!s.calls.some(c=>c[0]==='createBlob'));
 s.repo.exportCollection=async()=>{throw new Error('Offline');};
 await s.nodes.get('openExport').fire('click');await s.nodes.get('prepareExport').fire('click');
 assert.match(s.nodes.get('exportStatus').textContent,/No file was prepared/);assert.equal(s.nodes.get('downloadExport').hidden,true);
});
test('memory book uses prepared collection and clears private content on sign-out',async()=>{
 const s=await setup({id:'owner',email:'test@example.com'});
 s.repo.exportCollection=async()=>({exported_at:'2026-09-10T12:00:00Z',journeys:[{id:'j1',title:'Private chapter'}],memories:[]});
 await s.nodes.get('openExport').fire('click');await s.nodes.get('prepareExport').fire('click');
 assert.equal(s.nodes.get('openBook').hidden,false);
 await s.nodes.get('openBook').fire('click');assert.equal(s.nodes.get('bookModal').open,true);
 assert.equal(s.nodes.get('bookContent').children.length,1);
 await s.nodes.get('printBook').fire('click');assert.equal(s.calls.filter(c=>c[0]==='print').length,1);
 await s.emit('SIGNED_OUT',null);
 assert.equal(s.nodes.get('bookModal').open,false);assert.equal(s.nodes.get('bookContent').children.length,0);
 await s.nodes.get('printBook').fire('click');assert.equal(s.calls.filter(c=>c[0]==='print').length,1);
});
