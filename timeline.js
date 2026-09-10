(function(root){
 'use strict';
 const iso=/^\d{4}-\d{2}-\d{2}$/;
 function dateValue(value){
  const clean=String(value||'').slice(0,10);
  return iso.test(clean)?clean:'9999-12-31';
 }
 function journeyLabel(value){return value==='planned'?'Planned':value==='dream'?'Dream':'Visited';}
 function events(journeys=[],memories=[]){
  const names=new Map(journeys.map(j=>[j.id,j.title]));
  return [
   ...journeys.map(j=>({id:j.id,type:'journey',status:j.journey_status||'visited',date:j.start_date||j.end_date||j.created_at,title:j.title,text:j.story||'A new chapter, ready for your memories.',location:j.location||''})),
   ...memories.map(m=>({id:m.id,type:'memory',date:m.memory_date||m.created_at,title:m.title,text:m.story,clue:m.clue||'',location:m.location||'',journey:names.get(m.journey_id)||'Journey'}))
  ].sort((a,b)=>dateValue(a.date).localeCompare(dateValue(b.date))||String(a.title).localeCompare(String(b.title)));
 }
 function render(document,journeys,memories){
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const format=value=>{const clean=String(value||'').slice(0,10);if(!iso.test(clean))return 'Date not added';const parsed=new Date(clean+'T12:00:00Z');return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parsed);};
  const list=node('div',undefined,'timelineList'),rows=events(journeys,memories);
  if(!rows.length){list.append(node('p','Your timeline will appear here as you add journeys and memories.','empty'));return list;}
  for(const event of rows){
   const item=node('article',undefined,'timelineEvent '+event.type+(event.status?' '+event.status:'')),marker=node('div',undefined,'timelineMarker');
   item.id='timeline-'+event.type+'-'+event.id;
   marker.append(node('span',event.type==='journey'?journeyLabel(event.status):'Memory','timelineType'));
   item.append(marker);
   const content=node('div',undefined,'timelineContent');content.append(node('p',format(event.date),'meta'),node('h3',event.title));
   if(event.journey)content.append(node('p','From '+event.journey,'timelineJourney'));
   if(event.location)content.append(node('p',event.location,'meta'));
   if(event.text)content.append(node('p',event.text,'timelineStory'));
   if(event.clue)content.append(node('p','Clue for later: '+event.clue,'timelineClue'));
   item.append(content);list.append(item);
  }
  return list;
 }
 const api={events,render};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MemoriesTimeline=api;
})(typeof window!=='undefined'?window:globalThis);
