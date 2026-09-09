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
  function journeyInput(input) {
    const start = date(input.start_date), end = date(input.end_date);
    if (end && !start) throw new Error('Add a start date before setting an end date.');
    if (start && end && end < start) throw new Error('The end date must be on or after the start date.');
    return {title:text(input.title,'Journey name',120,true),story:text(input.story,'Story',10000),location:text(input.location,'Location',200),start_date:start,end_date:end,visibility:'private'};
  }
  function memoryInput(input) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.journey_id || '')) throw new Error('Choose a journey.');
    return {journey_id:input.journey_id,title:text(input.title,'Memory name',120,true),story:text(input.story,'Memory story',10000,true),location:text(input.location,'Location',200),memory_date:date(input.memory_date)};
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
    return {listJourneys:offset=>list('journeys',offset),listMemories:(id,offset)=>list('memories',offset,id),saveJourney:(input,id)=>save('journeys',journeyInput(input),id),saveMemory:(input,id)=>save('memories',memoryInput(input),id)};
  }
  const api = {PAGE_SIZE,journeyInput,memoryInput,createRepository};
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MemoriesData = api;
})(typeof window !== 'undefined' ? window : globalThis);
