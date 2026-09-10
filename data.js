(function (root) {
  'use strict';
  const PAGE_SIZE = 50;
  function text(value, name, max, required = false) {
    const clean = String(value ?? '').trim();
    if (required && !clean) throw new Error(`${name} is required.`);
    if (clean.length > max) throw new Error(`${name} must be ${max} characters or fewer.`);
    return clean;
  }
  function date(value) {
    if (!value) return null;
    const d = String(value);
    const parsed = new Date(d + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== d) {
      throw new Error('Please enter a valid date.');
    }
    return d;
  }
  function coordinate(value,name,min,max) {
    if(value === '' || value == null) return null;
    const number=Number(value);
    if(!Number.isFinite(number) || number<min || number>max) throw new Error(`${name} must be a valid map coordinate.`);
    return Math.round(number*1000000)/1000000;
  }
  const journeyStatuses = new Set(['visited','planned','dream']);
  function journeyStatus(value) {
    const clean=String(value || 'visited');
    if(!journeyStatuses.has(clean)) throw new Error('Choose a valid journey type.');
    return clean;
  }
  function coordinates(input) {
    const latitude=coordinate(input.latitude,'Latitude',-90,90),longitude=coordinate(input.longitude,'Longitude',-180,180);
    if((latitude===null)!==(longitude===null)) throw new Error('Choose both map coordinates, or leave the map pin empty.');
    return {latitude,longitude};
  }
  function journeyInput(input) {
    const start = date(input.start_date), end = date(input.end_date);
    if (end && !start) throw new Error('Add a start date before setting an end date.');
    if (start && end && end < start) throw new Error('The end date must be on or after the start date.');
    return {title:text(input.title,'Journey name',120,true),story:text(input.story,'Story',10000),location:text(input.location,'Location',200),start_date:start,end_date:end,...coordinates(input),journey_status:journeyStatus(input.journey_status),visibility:'private'};
  }
  function memoryInput(input) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.journey_id || '')) throw new Error('Choose a journey.');
    return {journey_id:input.journey_id,title:text(input.title,'Memory name',120,true),story:text(input.story,'Memory story',10000,true),clue:text(input.clue,'Clue',5000),location:text(input.location,'Location',200),memory_date:date(input.memory_date),...coordinates(input)};
  }
  function createRepository(client) {
    async function owner() {
      const {data,error} = await client.auth.getUser();
      if(error || !data?.user) throw new Error('Please sign in again to continue.');
      return data.user.id;
    }
    async function save(table, payload, id) {
      const {data,error} = await client.from(table).insert({...payload,id,owner_id:await owner()}).select().single();
      if(error) {
        // A connection can fail after a successful commit. Reuse the draft ID,
        // and confirm an existing owned row instead of creating a duplicate.
        if(error.code === '23505') {
          const existing = await client.from(table).select().eq('id',id).single();
          if(!existing.error) return existing.data;
        }
        throw error;
      }
      return data;
    }
    async function list(table, offset = 0, journeyId = null) {
      let query = client.from(table).select('*').eq('owner_id',await owner());
      if(journeyId) query = query.eq('journey_id',journeyId);
      const {data,error} = await query.order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+PAGE_SIZE-1);
      if(error) throw error;
      return data;
    }
    async function update(table, payload, original) {
      if (!original?.id) throw new Error('Open the record again before editing.');
      const ownerId = await owner();
      let query = client.from(table).update(payload).eq('id',original.id).eq('owner_id',ownerId);
      // Compare the editable snapshot so another device's changes are not silently lost.
      for (const key of Object.keys(payload)) {
        query = original[key] == null ? query.is(key,null) : query.eq(key,original[key]);
      }
      const {data,error} = await query.select().maybeSingle();
      if(error) throw error;
      if(!data) throw new Error('This record changed elsewhere or is no longer available. Close this form, refresh your collection and reopen it. Your changes have not been saved.');
      return data;
    }
    async function exportCollection(isCurrent = () => true) {
      const ownerId = await owner();
      const fields = {
        journeys:'id,owner_id,title,story,location,start_date,end_date,visibility,journey_status,latitude,longitude,created_at',
        memories:'id,owner_id,journey_id,title,story,clue,location,memory_date,latitude,longitude,created_at'
      };
      async function checkOwner() {
        if (!isCurrent() || await owner() !== ownerId || !isCurrent()) throw new Error('Download cancelled because your account or request changed.');
      }
      async function collect(table) {
        const rows=[];let total=null;
        do {
          await checkOwner();
          const {data,error,count}=await client.from(table).select(fields[table],{count:'exact'})
            .eq('owner_id',ownerId).order('id',{ascending:true}).range(rows.length,rows.length+PAGE_SIZE-1);
          if(error)throw error;
          if(!Number.isInteger(count) || count<0 || !Array.isArray(data))throw new Error('Could not verify the full collection. Please retry.');
          if(count>2000)throw new Error('This collection is too large for the current download tool. No partial file was created.');
          if(total!==null && total!==count)throw new Error('Your collection changed during preparation. Pause edits on other devices and retry.');
          total=count;
          if(data.length!==Math.min(PAGE_SIZE,total-rows.length) || data.some(row=>row.owner_id!==ownerId))throw new Error('Could not verify the full collection. Please retry.');
          rows.push(...data);
        }while(rows.length<total);
        if(new Set(rows.map(row=>row.id)).size!==rows.length)throw new Error('Your collection changed during preparation. Please retry.');
        return rows.map(row=>Object.fromEntries(fields[table].split(',').filter(key=>key!=='owner_id').map(key=>[key,row[key]])));
      }
      async function read() {
        const journeys=await collect('journeys'),memories=await collect('memories');
        const ids=new Set(journeys.map(row=>row.id));
        if(memories.some(row=>!ids.has(row.journey_id)))throw new Error('Your collection changed during preparation. Please retry.');
        return {journeys,memories};
      }
      const first=await read(),second=await read();
      await checkOwner();
      if(JSON.stringify(first)!==JSON.stringify(second))throw new Error('Your collection changed during preparation. Pause edits on other devices and retry.');
      return {format:'memories-unlocked-collection',version:1,exported_at:new Date().toISOString(),
        note:'Unencrypted copy of saved journeys and written memories. No photos, passwords or tokens. Import/restore is not yet supported. Avoid editing on other devices while preparing a copy; this is not a transactional database backup.',...second};
    }
    return {
      exportCollection,
      listJourneys:offset=>list('journeys',offset),listMemories:(id,offset)=>list('memories',offset,id),listAllMemories:offset=>list('memories',offset),
      saveJourney:(input,id)=>save('journeys',journeyInput(input),id),saveMemory:(input,id)=>save('memories',memoryInput(input),id),
      updateJourney:(input,original)=>{const {visibility,...payload}=journeyInput(input);return update('journeys',payload,original);},
      updateMemory:(input,original)=>{const {journey_id,...payload}=memoryInput({...input,journey_id:original.journey_id});return update('memories',payload,original);}
    };
  }
  const api = {PAGE_SIZE,journeyInput,memoryInput,createRepository};
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MemoriesData = api;
})(typeof window !== 'undefined' ? window : globalThis);
