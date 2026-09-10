(function(root){
  'use strict';
  function render(document,collection){
    const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const date=value=>{
      if(!value)return '';
      const parsed=new Date(value+'T12:00:00Z');
      return Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parsed):String(value);
    };
    const ordered=(rows,key)=>[...rows].sort((a,b)=>String(a[key]||'9999').localeCompare(String(b[key]||'9999')) || String(a.created_at||'').localeCompare(String(b.created_at||'')) || String(a.id).localeCompare(String(b.id)));
    const book=node('article',undefined,'memoryBook'),cover=node('section',undefined,'bookCover');
    cover.append(node('p','MEMORIES UNLOCKED','bookKicker'),node('h1','Every place has a story.'),node('p','My memory book','bookSubtitle'),node('p',`${collection.journeys.length} journeys · ${collection.memories.length} written memories`),node('p','Prepared '+date(collection.exported_at.slice(0,10)),'bookMeta'),node('p','A private copy of your saved stories. Keep and share with care.','bookMeta'));
    book.append(cover);
    const grouped=new Map();
    for(const memory of collection.memories){if(!grouped.has(memory.journey_id))grouped.set(memory.journey_id,[]);grouped.get(memory.journey_id).push(memory);}
    const journeys=ordered(collection.journeys,'start_date');
    if(!journeys.length)book.append(node('p','Your collection has no saved journeys yet.'));
    for(const [index,journey] of journeys.entries()){
      const chapter=node('section',undefined,'bookChapter');
      chapter.append(node('p','CHAPTER '+String(index+1).padStart(2,'0'),'bookKicker'),node('h2',journey.title));
      const dates=[date(journey.start_date),date(journey.end_date)].filter(Boolean).join(' – ');
      chapter.append(node('p',[journey.location,dates].filter(Boolean).join(' · '),'bookMeta'));
      if(journey.story)chapter.append(node('p',journey.story,'bookStory'));
      const memories=ordered(grouped.get(journey.id)||[],'memory_date');
      if(!memories.length)chapter.append(node('p','No written memories saved in this journey yet.','bookMeta'));
      for(const memory of memories){
        const moment=node('section',undefined,'bookMoment');
        moment.append(node('h3',memory.title),node('p',[date(memory.memory_date),memory.location].filter(Boolean).join(' · '),'bookMeta'),node('p',memory.story,'bookStory'));
        chapter.append(moment);
      }
      book.append(chapter);
    }
    return book;
  }
  if(typeof module!=='undefined' && module.exports)module.exports={render};else root.MemoriesBook={render};
})(typeof window!=='undefined'?window:globalThis);
