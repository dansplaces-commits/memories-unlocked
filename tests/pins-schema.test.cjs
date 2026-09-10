// Isolated PostgreSQL model of the location/status migrations; not live Supabase QA.
const {PGlite}=require(process.env.MEMORIES_PGLITE_MODULE||'@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const db=new PGlite(),owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',journey='11111111-1111-4111-8111-111111111111',memory='22222222-2222-4222-8222-222222222222';
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table auth.users(id uuid primary key);insert into auth.users values ('${owner}');`);
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/001_private_collection.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/002_owner_editing.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/004_location_pins.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/005_journey_status.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/006_private_clues.sql'),'utf8'));
 await db.exec('set role authenticated;set request.jwt.claim.sub=\''+owner+'\';');
 await db.query('insert into public.journeys(id,owner_id,title,journey_status,latitude,longitude) values ($1,$2,$3,$4,$5,$6)',[journey,owner,'Future','dream',35.689487,139.691706]);
 await db.query('insert into public.memories(id,owner_id,journey_id,title,story,latitude,longitude) values ($1,$2,$3,$4,$5,$6,$7)',[memory,owner,journey,'View','Story',35.7,139.7]);
 await db.query('update public.memories set clue=$1 where id=$2 and owner_id=$3',['Look under the arch',memory,owner]);
 assert.equal((await db.query('select clue from public.memories where id=$1',[memory])).rows[0].clue,'Look under the arch');
 await assert.rejects(db.query('update public.memories set clue=$1 where id=$2 and owner_id=$3',['x'.repeat(5001),memory,owner]),/check constraint|violates/);
 await assert.rejects(db.query('insert into public.journeys(owner_id,title,journey_status) values ($1,$2,$3)',[owner,'Bad','unknown']),/check constraint|violates/);
 await assert.rejects(db.query('insert into public.journeys(owner_id,title,latitude,longitude) values ($1,$2,$3,$4)',[owner,'Half pin',35.7,null]),/check constraint|violates/);
 await db.exec('reset role;');
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/004_location_pins.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/005_journey_status.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/006_private_clues.sql'),'utf8'));
 const row=(await db.query('select journey_status,latitude,longitude from public.journeys where id=$1',[journey])).rows[0];
 assert.deepEqual(row,{journey_status:'dream',latitude:35.689487,longitude:139.691706});
 assert.equal((await db.query('select clue from public.memories where id=$1',[memory])).rows[0].clue,'Look under the arch');
 await db.close();console.log('PASS: location/status columns, range/pair checks and rerunnable migrations');
})().catch(error=>{console.error(error);process.exitCode=1;});
