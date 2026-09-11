(function(root){
 'use strict';
 const format='memories-unlocked-pin-pack',version=1,storageKey='memories-unlocked.pin-packs.v1',selectedKey='memories-unlocked.pin-pack.selected';
 const kinds=['visited','planned','dream','memory'];
 const builtin=[
  {id:'classic',name:'Classic',description:'Navy journeys, gold memories and a calm travel palette.',styles:{visited:{color:'#10244a',symbol:'✓',label:'Visited'},planned:{color:'#328997',symbol:'→',label:'Planned'},dream:{color:'#7251a3',symbol:'★',label:'Dream'},memory:{color:'#d6a52f',symbol:'♥',label:'Memory'}}},
  {id:'sunset',name:'Sunset',description:'Warm colours for stories made in the evening light.',styles:{visited:{color:'#8c3c2e',symbol:'✓',label:'Visited'},planned:{color:'#d4772d',symbol:'→',label:'Planned'},dream:{color:'#a24c80',symbol:'★',label:'Dream'},memory:{color:'#d6a52f',symbol:'♥',label:'Memory'}}},
  {id:'night-sky',name:'Night sky',description:'A high-contrast midnight palette for map reading.',styles:{visited:{color:'#183b56',symbol:'✓',label:'Visited'},planned:{color:'#087e8b',symbol:'→',label:'Planned'},dream:{color:'#5b4b8a',symbol:'★',label:'Dream'},memory:{color:'#e0a458',symbol:'♥',label:'Memory'}}}
 ];
 const copy=value=>JSON.parse(JSON.stringify(value));
 function text(value,fallback,max){const clean=String(value??fallback).trim();return clean.slice(0,max);}
 function validate(raw){
  if(!raw || typeof raw!=='object')throw new Error('That pin pack is not a valid object.');
  const id=text(raw.id,'',40);
  if(!/^[a-z0-9][a-z0-9-]{0,39}$/.test(id))throw new Error('Pin pack IDs may use lowercase letters, numbers and hyphens.');
  const name=text(raw.name,'',60);if(!name||/[<>&]/.test(name))throw new Error('A pin pack name is not valid.');
  const styles={};
  for(const kind of kinds){
   const source=raw.styles?.[kind];
   const color=text(source?.color,'',7),symbol=text(source?.symbol,'',4),label=text(source?.label,kind,30)||kind;
   if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error(`The ${kind} pin colour is not valid.`);
   if(!symbol || /[<>&]/.test(symbol))throw new Error(`The ${kind} pin symbol is not valid.`);
   styles[kind]={color:color.toUpperCase(),symbol,label};
  }
  const description=text(raw.description,'',180);if(/[<>&]/.test(description))throw new Error('A pin pack description is not valid.');
  return {format,version,id,name,description,styles};
 }
 function builtins(){return builtin.map(pack=>validate(copy(pack)));}
 function custom(){
  try{
   const stored=JSON.parse(root.localStorage?.getItem(storageKey)||'[]');
   return Array.isArray(stored)?stored.map(item=>{try{return validate(item);}catch(_){return null;}}).filter(Boolean):[];
  }catch(_){return [];}
 }
 function list(){
  const seen=new Set();return [...builtins(),...custom()].filter(pack=>!seen.has(pack.id)&&seen.add(pack.id));
 }
 function save(raw){
  const pack=validate(raw),items=custom().filter(item=>item.id!==pack.id);items.push(pack);
  try{root.localStorage?.setItem(storageKey,JSON.stringify(items));}catch(_){/* Storage is optional; the current session still uses the pack. */}
  return pack;
 }
 function selectedId(){try{return root.localStorage?.getItem(selectedKey)||'classic';}catch(_){return 'classic';}}
 function select(id){try{root.localStorage?.setItem(selectedKey,id);}catch(_){}return id;}
 function json(pack){return JSON.stringify(validate(pack),null,2);}
 function filename(pack){return `${pack.id.replace(/[^a-z0-9-]/gi,'-')}-pin-pack.json`;}
 const api={format,version,kinds,builtins,list,validate,save,selectedId,select,json,filename};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MemoriesPinPacks=api;
})(typeof window!=='undefined'?window:globalThis);
