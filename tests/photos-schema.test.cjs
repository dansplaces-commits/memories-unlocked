// Isolated PostgreSQL model of Storage object policies; not live Storage API QA.
const {PGlite}=require(process.env.MEMORIES_PGLITE_MODULE||'@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const db=new PGlite();
 const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const j='11111111-1111-4111-8111-111111111111',m='22222222-2222-4222-8222-222222222222';
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,storage to anon,authenticated;
 insert into auth.users values ('${a}'),('${b}');
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(bucket_id text,name text,unique(bucket_id,name));
 alter table storage.objects enable row level security;
 grant select,insert,update,delete on storage.objects to anon,authenticated;
 create policy unrelated_broad_policy on storage.objects for all to public using(true) with check(true);`);
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/001_private_collection.sql'),'utf8'));
 await db.query('insert into journeys(id,owner_id,title) values ($1,$2,$3)',[j,a,'Journey']);
 await db.query('insert into memories(id,owner_id,journey_id,title,story) values ($1,$2,$3,$4,$5)',[m,a,j,'Memory','Story']);
 const sql=fs.readFileSync(path.join(__dirname,'../supabase/003_private_photos.sql'),'utf8');await db.exec(sql);
 assert.equal((await db.query("select public from storage.buckets where id='memory-photos'")).rows[0].public,false);
 await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}';`);
 const photo=a+'/'+m+'/photo.jpg';
 await db.query("insert into storage.objects values ('memory-photos',$1)",[photo]);
 assert.equal((await db.query("select * from storage.objects where bucket_id='memory-photos'")).rows.length,1);
 await assert.rejects(db.query("insert into storage.objects values ('memory-photos',$1)",[a+'/'+j+'/photo.jpg']),/row-level security/);
 assert.equal((await db.query("update storage.objects set name='changed' where bucket_id='memory-photos' returning name")).rows.length,0);
 await db.exec(`set request.jwt.claim.sub='${b}';`);
 assert.equal((await db.query("select * from storage.objects where bucket_id='memory-photos'")).rows.length,0);
 await assert.rejects(db.query("insert into storage.objects values ('memory-photos',$1)",[b+'/'+m+'/photo.jpg']),/row-level security/);
 assert.equal((await db.query("delete from storage.objects where bucket_id='memory-photos' returning name")).rows.length,0);
 await db.exec('reset role;');
 const deleteSql=fs.readFileSync(path.join(__dirname,'../supabase/007_private_photo_deletion.sql'),'utf8');await db.exec(deleteSql);
 await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}';`);
 assert.equal((await db.query("delete from storage.objects where bucket_id='memory-photos' returning name")).rows.length,1);
 await db.query("insert into storage.objects values ('memory-photos',$1)",[photo]);
 await db.exec(`set request.jwt.claim.sub='${b}';`);
 assert.equal((await db.query("delete from storage.objects where bucket_id='memory-photos' returning name")).rows.length,0);
 await db.exec('reset role;set role anon;');
 // Anonymous access is denied either by memory-table grants or restrictive RLS.
 try{assert.equal((await db.query("select * from storage.objects where bucket_id='memory-photos'")).rows.length,0);}catch(error){assert.match(error.message,/permission denied/);}
 await db.exec('reset role;');await db.exec(deleteSql);
 await assert.rejects(db.exec(sql),/already exists/);await db.exec('rollback;');
 assert.equal((await db.query('select * from storage.objects')).rows.length,1);
 assert.equal((await db.query('select story from memories')).rows[0].story,'Story');
 await db.close();console.log('PASS: private bucket, owner read/insert/delete, cross-owner and anonymous denial, missing-memory rejection, overwrite denial, safe rerun rollback; tested with a broad pre-existing policy.');
})().catch(error=>{console.error(error);process.exitCode=1;});
