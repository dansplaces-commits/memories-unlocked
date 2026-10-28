/* Local-only visual QA. No Supabase SDK, credentials, or production writes. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.MU_PREVIEW_PORT || 4173);
const fixtures = {
  journeys: [
    { id: 'qa-rome', title: 'A weekend in Rome', location: 'Rome, Italy', story: 'A slow walk through the city. The places between the landmarks became the best part of the story.', start: '2022-07-26', end: '2022-07-31', privacy: 'Private', code: 'QA-ROME' },
    { id: 'qa-long', title: 'A long journey title with room for every part of the story', location: 'Saint-Rémy-de-Provence, Provence-Alpes-Côte d’Azur, France', story: 'A chapter with a longer name, for checking that the layout stays calm and readable.', start: '2025-06-01', end: '', privacy: 'Private', code: 'QA-LONG' },
    { id: 'qa-undated', title: 'A place worth returning to', location: '', story: '', start: '', end: '', privacy: 'Private', code: 'QA-UNDATED' }
  ],
  memories: [
    { id: 'qa-steps', journeyId: 'qa-rome', title: 'The old steps', location: 'Piazza del Campidoglio, Rome, Italy', date: '2022-07-29', story: 'The city was quiet that morning.\nWe stopped here and took it all in.', clue: 'Find the steps and look back towards the city.', latitude: 41.8931, longitude: 12.4828 },
    { id: 'qa-fountain', journeyId: 'qa-rome', title: 'By the fountain', location: 'Trevi Fountain, Rome, Italy', date: '2022-07-30', story: 'A moment to remember.', clue: '', latitude: 41.9009, longitude: 12.4833 },
    { id: 'qa-long-memory', journeyId: 'qa-long', title: 'A memory title that needs more than one line to tell its story', location: 'Saint-Rémy-de-Provence, Provence-Alpes-Côte d’Azur, France', date: '', story: 'The story stays readable even when its place name is long.', clue: '', latitude: null, longitude: null }
  ]
};
const wrapper = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Memories Unlocked — isolated visual QA</title><style>
body{margin:0;background:#e9e5dd;font:14px Arial;color:#10244a}header{padding:12px 18px;display:flex;align-items:center;gap:20px;background:#fffdf8;position:sticky;top:0;z-index:2}select,button{font:inherit;padding:8px}iframe{display:block;border:1px solid #ccc;margin:16px auto;background:#fff;width:1280px;height:900px}#status{margin-left:auto;color:#567}
</style></head><body><header><strong>LOCAL QA · fictional records · cloud disabled</strong><label>Screen width <select id="width"><option>1280</option><option>1440</option><option>1180</option><option>1024</option><option>768</option><option>390</option><option>320</option></select></label><button id="reload">Reload app</button><span id="status">1280px</span></header><iframe id="preview" title="Isolated Memories Unlocked preview" src="/index.html"></iframe><script>
const frame=document.getElementById('preview');document.getElementById('width').onchange=e=>{frame.style.width=e.target.value+'px';frame.style.height=Number(e.target.value)<701?'844px':'900px';document.getElementById('status').textContent=e.target.value+'px'};document.getElementById('reload').onclick=()=>frame.contentWindow.location.reload();
</script></body></html>`;
const seed = `<script>window.muSupabase=undefined;window.supabase=undefined;
localStorage.setItem('mu_journeys',${JSON.stringify(JSON.stringify(fixtures.journeys))});
localStorage.setItem('mu_memories',${JSON.stringify(JSON.stringify(fixtures.memories))});
localStorage.setItem('mu_storage_scope','qa-device');
if(!localStorage.getItem('mu_appearance_v1'))localStorage.setItem('mu_appearance_v1',JSON.stringify({theme:'paper',font:'timeless',softness:88,dock:'left'}));</script>`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "connect-src 'self'; worker-src 'none'");
  if (url.pathname === '/__qa') { res.setHeader('Content-Type', 'text/html'); return res.end(wrapper); }
  if (['/supabase-config.js', '/sw.js'].includes(url.pathname)) { res.statusCode = 404; return res.end(); }
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
  if (!file.startsWith(root + path.sep) || path.relative(root, file).split(path.sep).some(p => p.startsWith('.'))) { res.statusCode=403; return res.end(); }
  try {
    let content = fs.readFileSync(file);
    if (file === path.join(root, 'index.html')) {
      content = content.toString().replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/, '').replace('<script src="supabase-config.js"></script>', seed);
    }
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');res.end(content);
  } catch { res.statusCode=404;res.end(); }
});
if(require.main===module)server.listen(port,'127.0.0.1',()=>console.log(`Local QA: http://127.0.0.1:${port}/__qa (fictional records; Supabase disabled)`));
module.exports={server,fixtures};
