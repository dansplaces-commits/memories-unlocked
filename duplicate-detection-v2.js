/* Memories Unlocked — duplicate detection v2. Read-only detector: no cloud rows are edited or deleted. */
(function(){
const norm=v=>String(v??'').trim().toLowerCase().replace(/\b(19|20)\d{2}\b/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const date=v=>String(v||'').slice(0,10);
const words=v=>new Set(norm(v).split(' ').filter(x=>x.length>2));
function overlap(a,b){const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let n=0;A.forEach(x=>{if(B.has(x))n++;});return n/Math.min(A.size,B.size);}
function read(){try{return{journeys:JSON.parse(localStorage.getItem('mu_journeys')||'[]'),memories:JSON.parse(localStorage.getItem('mu_memories')||'[]')}}catch{return{journeys:[],memories:[]}}}
function ms(d,j){return d.memories.filter(m=>String(m.journeyId)===String(j.id));}
function score(a,b,d){let s=0;const at=norm(a.title),bt=norm(b.title),al=norm(a.location),bl=norm(b.location);if(at&&bt&&(at===bt||at.includes(bt)||bt.includes(at)))s+=6;else if(overlap(at,bt)>=.6)s+=4;if(al&&bl&&(al===bl||al.includes(bl)||bl.includes(al)))s+=4;else if(overlap(al,bl)>=.5)s+=2;if(date(a.start)&&date(a.start)===date(b.start))s+=2;if(date(a.end)&&date(a.end)===date(b.end))s+=2;for(const x of ms(d,a))for(const y of ms(d,b)){if(date(x.date)&&date(x.date)===date(y.date))s+=2;if(overlap(x.location,y.location)>=.5)s+=2;}return s;}
function candidate(){const d=read(),out=[];for(let i=0;i<d.journeys.length;i++)for(let k=i+1;k<d.journeys.length;k++){const a=d.journeys[i],b=d.journeys[k],s=score(a,b,d);if(s>=8)out.push({a,b,s,d});}out.sort((x,y)=>y.s-x.s);return out[0]||null;}
function remove(){document.getElementById('muDuplicateV2')?.remove();}
function show(){remove();const c=candidate();if(!c)return;const host=document.getElementById('cloudStatus')?.parentElement;if(!host)return;const box=document.createElement('div');box.id='muDuplicateV2';box.style.cssText='margin:12px 0 16px;padding:13px 15px;border:1px solid #dfbf63;border-radius:14px;background:#fff8df;color:#0b3159;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font:inherit';box.innerHTML='<span><strong>Duplicate journey detected safely.</strong> Two journey records appear to describe the same trip. No cloud data has been changed or deleted.</span><button type="button" style="border:0;border-radius:999px;padding:9px 14px;background:#e6ac17;color:#082b53;font-weight:800;cursor:pointer">Review duplicate</button>';box.querySelector('button').onclick=()=>{const A=c.a,B=c.b;alert('Safe duplicate review\n\n'+A.title+' — '+ms(c.d,A).length+' memories\n'+B.title+' — '+ms(c.d,B).length+' memories\n\nMatch score: '+c.s+'\n\nDetection is now working without relying on device/cloud flags. No records have been changed or deleted.');};host.appendChild(box);}
window.muDuplicateDetectionV2={scan:candidate,show};
window.addEventListener('load',()=>setTimeout(show,1800));
setTimeout(show,3200);
})();