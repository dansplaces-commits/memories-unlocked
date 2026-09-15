const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=process.env.MU_TEST_URL||'http://127.0.0.1:4173';
const output=process.env.MU_TEST_OUTPUT||'/tmp/mu-test';
fs.mkdirSync(output,{recursive:true});
const journey={id:'00000000-0000-4000-8000-000000000001',title:"Our family's trail",location:'Rome, Italy',story:'A story worth returning to.',start:'2022-07-26',end:'2022-07-31',privacy:'Family & Friends',code:'TRAIL-1234'};
const first={id:'00000000-0000-4000-8000-000000000011',journeyId:journey.id,title:'The old steps',location:'Piazza del Campidoglio, Rome, Italy',date:'2022-07-29',story:'A story with more than one line.\nA moment remembered.',clue:'Look for the steps. What might you find at the top?',latitude:41.8931,longitude:12.4828};
const second={...first,id:'00000000-0000-4000-8000-000000000012',title:'By the fountain',date:'2022-07-30',latitude:41.9009,longitude:12.4833};
(async()=>{
 let server;
 if(!process.env.MU_TEST_URL){server=require('node:http').createServer((req,res)=>{const path=require('node:path');const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{const body=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);}catch{res.statusCode=404;res.end();}});await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));}
 const browser=await chromium.launch({headless:true,...(process.env.MU_CHROMIUM_PATH?{executablePath:process.env.MU_CHROMIUM_PATH}:{})});const context=await browser.newContext({viewport:{width:1280,height:1000}});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{errors.push('Unexpected browser dialog: '+d.message());d.dismiss();});
 await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({contentType:'application/javascript',body:'window.supabase=undefined;'}));
 await context.route('https://tile.openstreetmap.org/**',route=>route.abort());
 await context.route('https://photon.komoot.io/api/**',route=>route.fulfill({json:{features:[{type:'Feature',geometry:{type:'Point',coordinates:[12.4833,41.9009]},properties:{name:'Trevi Fountain',city:'Rome',country:'Italy'}}]}}));
 await page.goto(url);await page.waitForFunction(()=>typeof openAppearance==='function');
 await page.evaluate(({journey,first,second})=>{localStorage.setItem('mu_journeys',JSON.stringify([journey]));localStorage.setItem('mu_memories',JSON.stringify([second,first]));}, {journey,first,second});
 await page.reload();await page.waitForSelector('#journeyList .journey');
 // A memory inside a clickable journey must open only that memory.
 await page.locator('#journeyList [data-action=memory]').first().click();
 await page.waitForSelector('#memoryDetailModal.open');assert.equal(await page.locator('#journeyDetailModal').count(),0);
 assert.match(await page.locator('#memoryDetailModal').innerText(),/Look for the steps/);
 await page.screenshot({path:output+'/memory-desktop.png'});
 await page.keyboard.press('Escape');assert.equal(await page.locator('.modal.open').count(),0);
 // The whole card and its keyboard activation open the journey.
 await page.locator('#journeyList article').focus();await page.keyboard.press('Enter');
 await page.waitForSelector('#journeyDetailModal.open');
 assert.equal(await page.locator('#journeyQR canvas').count(),1);
 await page.evaluate(()=>{document.querySelector('.qr-padlock').open=true;});
 const qr=await page.evaluate(()=>qrImage());assert.ok(qr.startsWith('data:image/png;base64,'));fs.writeFileSync(output+'/qr.png',Buffer.from(qr.split(',')[1],'base64'));
 // XSS-like text and apostrophes never become executable handlers.
 await page.evaluate(()=>{journeys[0].title="A <img src=x onerror=alert(1)> & friend's trip";openJourney(journeys[0].id);});
 assert.equal(await page.locator('.journey-detail-hero img').count(),0);
 await page.locator('[data-action=journey-map]').click();await page.waitForSelector('#memoryMap .leaflet-marker-icon');
 assert.equal(await page.locator('#memoryMap .leaflet-marker-icon').count(),2);
 assert.equal(await page.evaluate(()=>memoryLayers.getLayers().filter(layer=>layer instanceof L.Polyline).length),1);
 await page.locator('#memoryMap .leaflet-marker-icon').first().click();await page.waitForSelector('#memoryDetailModal.open');await page.keyboard.press('Escape');
 // Duplicate coordinates retain access to all memories, and missing points stay listed.
 await page.evaluate(()=>{memories.push({...memories[0],id:'same-spot',title:'Another moment'});memories.push({...memories[0],id:'unlocated',title:'A place to find',latitude:null,longitude:null});renderMemoryMap();});
 assert.equal(await page.locator('#mapPins [data-action=memory]').count(),4);
 assert.match(await page.locator('#mapSummary').innerText(),/3 of 4/);
 await page.locator('#mapPins [data-id=unlocated]').click();await page.locator('[data-action=locate-memory]').click();
 await page.locator('#placeSearch').fill('Trevi Fountain Rome');await page.locator('#placeSearchButton').click();await page.locator('.place-result').click();await page.locator('#confirmPoint').click();
 assert.ok(await page.evaluate(()=>validPoint(findMemory('unlocated').latitude,findMemory('unlocated').longitude)));
 await page.keyboard.press('Escape');
 // Appearance choices and uploads survive a full reload.
 await page.locator('.appearance-trigger').click();await page.locator('[data-theme-choice=coast]').click();await page.locator('[data-font-choice=modern]').click();
 if(process.env.MU_TEST_FONT){await page.locator('#fontUpload').setInputFiles(process.env.MU_TEST_FONT);await page.waitForFunction(()=>appearance.font==='custom'&&customFontLoaded);await page.reload();await page.waitForFunction(()=>customFontLoaded);assert.equal(await page.evaluate(()=>appearance.font),'custom');await page.locator('.appearance-trigger').click();await page.locator('[data-font-choice=modern]').click();}
 await page.locator('#backgroundUpload').setInputFiles(output+'/qr.png');await page.waitForFunction(()=>appearance.theme==='custom');
 await page.keyboard.press('Escape');await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='custom');assert.equal(await page.evaluate(()=>appearance.font),'modern');
 // Validate mobile layout, focus trapping, and navigation touch targets.
 await page.setViewportSize({width:390,height:844});await page.locator('.appearance-trigger').click();
 await page.screenshot({path:output+'/appearance-mobile.png'});await page.keyboard.press('Escape');
 await page.evaluate(()=>resetAppearance());await page.locator('.nav button').first().click();await page.screenshot({path:output+'/home-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(const button of await page.locator('.nav button').all()){const box=await button.boundingBox();assert.ok(box.width>=44&&box.height>=44);}
 await page.locator('#recentMemories [data-action=memory]').first().click();await page.screenshot({path:output+'/memory-mobile.png'});
 await page.keyboard.press('Escape');
 // Mock the cloud; no test writes reach the production Supabase project.
 const cloudChecks=await page.evaluate(async({journey,first})=>{
   journeys=[{...journey,cloud:true}];memories=[{...first,cloud:true}];cloudUser={id:'test-owner'};
   let writes=[],mode='load';
   window.muSupabase={from(table){let row;let op='read';return {select(){return this;},eq(){return this;},single(){writes.push({table,row,op});if(mode==='missing'){const field=['clue','latitude','longitude'].find(k=>Object.hasOwn(row,k));if(field)return Promise.resolve({error:{code:'PGRST204',message:`Could not find the '${field}' column`}});}return Promise.resolve({data:{...row,id:row.id||first.id}});},insert(value){row=value;op='insert';return this;},update(value){row=value;op='update';return this;},order(){return Promise.resolve({data:table==='journeys'?[{id:journey.id,title:journey.title,location:journey.location,owner_id:'test-owner'}]:[{id:first.id,journey_id:journey.id,title:first.title,location:first.location,story:first.story,memory_date:first.date,owner_id:'test-owner'}]});}}}};
   memories.push({...first,id:'offline-memory',cloud:false});
   await loadCloudData();
   const keptClue=findMemory(first.id).clue===first.clue,keptCode=findJourney(journey.id).code===journey.code,keptOffline=Boolean(findMemory('offline-memory'));
   const localMemory=findMemory(first.id);localMemory.latitude=40;localMemory.longitude=11;localMemory.extrasPending=true;await loadCloudData();const keptPending=findMemory(first.id).latitude===40;
   mode='missing';const result=await writeCloud('memories',{id:'new',title:'New memory',clue:'Keep me',latitude:1,longitude:2},['clue','latitude','longitude']);
   mode='save';$('memoryTitle').value='A new memory';$('memoryLocation').value='Rome';$('memoryClue').value='This clue must reach the cloud';$('memoryJourney').value=journey.id;
   draftMemoryPoint={latitude:41,longitude:12};await createMemory();
   return {keptClue,keptCode,keptOffline,keptPending,missing:result.missing,insert:writes.findLast(w=>w.op==='insert').row};
 },{journey,first});
 assert.ok(cloudChecks.keptClue&&cloudChecks.keptCode&&cloudChecks.keptOffline&&cloudChecks.keptPending);assert.equal(cloudChecks.missing.length,3);assert.equal(cloudChecks.insert.clue,'This clue must reach the cloud');assert.equal(cloudChecks.insert.latitude,41);
 // Account cache boundaries: signing out must remove cloud-owned records but keep device-only records.
 const signedOutScope=await page.evaluate(()=>{
   journeys=[{id:'cloud-journey',cloud:true},{id:'device-journey',cloud:false}];
   memories=[{id:'cloud-memory',journeyId:'cloud-journey',cloud:true},{id:'device-memory',journeyId:'device-journey',cloud:false}];
   setStorageScope('account:user-a'); prepareSignedOutCache();
   return {scope:storageScope(),journeys:journeys.map(j=>j.id),memories:memories.map(m=>m.id)};
 });
 assert.deepEqual(signedOutScope,{scope:'anonymous',journeys:['device-journey'],memories:['device-memory']});
 // Switching directly between authenticated accounts must not expose the previous account's cache.
 const switchedScope=await page.evaluate(()=>{
   journeys=[{id:'account-a-journey',cloud:true}];memories=[{id:'account-a-memory',journeyId:'account-a-journey',cloud:true}];
   setStorageScope('account:user-a'); switchToAccountScope('user-b');
   return {scope:storageScope(),journeys:journeys.length,memories:memories.length};
 });
 assert.deepEqual(switchedScope,{scope:'account:user-b',journeys:0,memories:0});
 // Coordinate validation accepts the equator/meridian and rejects missing/out-of-range data.
 assert.deepEqual(await page.evaluate(()=>[validPoint(0,0),validPoint(null,null),validPoint(91,0),validPoint(0,181)]),[true,false,false,false]);
 const span=await page.evaluate(()=>{const p=[...mapPositions([{id:1,latitude:0,longitude:179},{id:2,latitude:1,longitude:-179}]).values()];return Math.abs(p[1][1]-p[0][1]);});assert.equal(span,2);
 assert.deepEqual(errors,[]);
 console.log('PASS: memory details, nested clicks, keyboard dialogs, QR canvas, real Leaflet markers/trails, duplicate pins, location search/confirmation, appearance persistence/upload, mobile layout, cloud field compatibility and data preservation.');
 await browser.close();server?.close();
})().catch(error=>{console.error(error);process.exit(1);});
