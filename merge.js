#!/usr/bin/env node
/* ============================================================================
   THE MENDED MIRROR — deterministic merge.
   Folds the fan-out's agent-written JSON (data/_fanout, _reconcile.json,
   data/_weave, data/_verify) into a fresh data/mirror-data.js, on top of the
   existing seed. Idempotent-ish: always rebuilds from SEED + scratch files, so
   re-running after more fan-out waves just re-merges everything present.

   Usage:
     node merge.js            # merge scratch -> mirror-data.js (writes backup)
     node merge.js --dry      # report only, write nothing
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const DRY = process.argv.includes('--dry');

/* ---- the seed: the hand-authored mirror-data.js is the source of truth for
   what already exists. We snapshot it ONCE to mirror-data.seed.js the first
   time we run, then always merge on top of that snapshot so re-runs are clean. */
const SEED = path.join(DATA, 'mirror-data.seed.js');
const LIVE = path.join(DATA, 'mirror-data.js');
if (!fs.existsSync(SEED)) {
  fs.copyFileSync(LIVE, SEED);
  console.log('• snapshotted current mirror-data.js -> mirror-data.seed.js (seed baseline)');
}
function load(file){ global.window = {}; delete require.cache[require.resolve(file)]; require(file); return global.window.MIRROR_DATA; }
const base = load(SEED);

const EXISTING_13 = ['sky-father','storm-wielder','great-mother','trickster','dying-rising','psychopomp','dragon-slayer','smith','solar','underworld-sovereign','complementarity','axis-mundi','one-through-many'];

/* ---- read scratch ---- */
function readJSON(f){ try { return JSON.parse(fs.readFileSync(f,'utf8')); } catch(e){ console.warn('  ! could not parse', path.basename(f), '-', e.message); return null; } }
function readDir(d){ if(!fs.existsSync(d)) return []; return fs.readdirSync(d).filter(f=>f.endsWith('.json')).map(f=>({ name:f, data:readJSON(path.join(d,f)) })).filter(x=>x.data); }

const fanout = readDir(path.join(DATA,'_fanout'));
const weaves = readDir(path.join(DATA,'_weave'));
const verifs = readDir(path.join(DATA,'_verify'));
const reconcile = fs.existsSync(path.join(DATA,'_reconcile.json')) ? readJSON(path.join(DATA,'_reconcile.json')) : { archetypes:[], remap:[] };
const temporal = fs.existsSync(path.join(DATA,'_temporal.json')) ? readJSON(path.join(DATA,'_temporal.json')) : { eras:[], highlights:[], traditions:{}, figures:{}, seams:{} };

const log = [];
const warn = m => { log.push('  ! '+m); };

/* ---- remap (proposed joint id -> canonical) ---- */
const remap = {}; (reconcile.remap||[]).forEach(m => { remap[m.from]=m.to; });
const canon = id => remap[id] || id;

/* ---- final archetype set ---- */
const archById = {}; base.archetypes.forEach(a => archById[a.id]=a);
const newArchetypes = [];
(reconcile.archetypes||[]).forEach(a => {
  if (archById[a.id] || EXISTING_13.includes(a.id)) return; // don't duplicate existing
  const node = { id:a.id, kind:'archetype', subtype:a.subtype||'principle', name:a.name, gloss:a.gloss };
  archById[a.id]=node; newArchetypes.push(node);
});
const jointSet = new Set(Object.keys(archById));

/* ---- traditions + figures ---- */
const tradById = Object.assign({}, base.traditions);
const figById = {}; base.figures.forEach(f => figById[f.id]=f);
const existingFigIds = new Set(base.figures.map(f=>f.id));
const newFigures = [];
const newTraditions = {};

fanout.forEach(({name,data}) => {
  if(!data.tradition || !data.tradition.id){ warn(`${name}: no tradition`); return; }
  const tid = data.tradition.id;
  if(!tradById[tid]){ const t=data.tradition; newTraditions[tid]={ name:t.name, region:t.region, color:t.color }; tradById[tid]=newTraditions[tid]; }
  (data.figures||[]).forEach(f => {
    if(figById[f.id]){ warn(`${name}: figure id "${f.id}" collides — skipped`); return; }
    const arts = [...new Set((f.archetypes||[]).map(canon))].filter(a => { if(jointSet.has(a)) return true; warn(`${name}: figure "${f.id}" -> unknown joint "${a}" dropped`); return false; });
    if(!arts.length){ warn(`${name}: figure "${f.id}" has no valid joint — skipped`); return; }
    const node = { id:f.id, tradition:tid, kind:f.kind||'deity', name:f.name, archetypes:arts, gloss:f.gloss };
    if(f.facet) node.facet=f.facet;
    if(f.provenance) node.provenance=f.provenance;
    figById[f.id]=node; newFigures.push(node);
  });
});

/* ---- verify corrections (undirected pair -> {keep,tier}) ---- */
const corr = {};
verifs.forEach(({data}) => (data.verdicts||[]).forEach(v => {
  corr[v.a+'|'+v.b]=v; corr[v.b+'|'+v.a]=v;
}));
function applyCorr(e){ const v = corr[e.a+'|'+e.b]; if(!v) return e; if(v.keep===false) return null; if(v.correctedTier) e.tier=v.correctedTier; return e; }

/* ---- edges: existing + research + woven, corrected, validated, deduped ---- */
const allFigIds = new Set(Object.keys(figById));
const idOk = id => allFigIds.has(id) || jointSet.has(id);
const seen = new Set();
const key = e => [e.a,e.b].sort().join('|')+'::'+e.type;
const outEdges = [];
function pushEdge(e, src){
  if(!e || !e.a || !e.b) return;
  const a = canon(e.a), b = canon(e.b);   // honour the reconcile remap on edge endpoints, not just archetype refs
  if(a===b) return;                         // a remap may collapse both ends onto one joint -> drop the self-loop
  if(!idOk(a)){ warn(`${src}: edge -> unknown id "${e.a}" dropped`); return; }
  if(!idOk(b)){ warn(`${src}: edge -> unknown id "${e.b}" dropped`); return; }
  const k=key({a,b,type:e.type}); if(seen.has(k)) return; seen.add(k);
  const node = { a, b, type:e.type, tier:String(e.tier), note:e.note||'' };
  outEdges.push(node);
}
// existing first (canonicalise any archetype refs just in case)
base.edges.forEach(e => pushEdge({ a:e.a, b:e.b, type:e.type, tier:e.tier, note:e.note }, 'seed'));
// research edges
fanout.forEach(({name,data}) => (data.edges||[]).forEach(e => pushEdge(applyCorr({ a:e.a, b:e.b, type:e.type, tier:e.tier, note:e.note }), name)));
// woven edges
weaves.forEach(({name,data}) => (data.edges||[]).forEach(e => pushEdge(applyCorr({ a:e.a, b:e.b, type:e.type, tier:e.tier, note:e.note }), name)));

/* ---- temporal spine: fold _temporal.json onto traditions / figures / seams (skin-agnostic) ---- */
const outFigures = base.figures.concat(newFigures);
let datedTrads = 0, datedFigs = 0, datedSeams = 0;
Object.keys(tradById).forEach(tid => {
  if (temporal.traditions && temporal.traditions[tid]) { tradById[tid].period = temporal.traditions[tid]; datedTrads++; }
  else if (Object.keys(temporal.traditions||{}).length) warn(`temporal: no period for tradition "${tid}"`);
});
outFigures.forEach(f => { if (temporal.figures && temporal.figures[f.id]) { f.date = temporal.figures[f.id]; datedFigs++; } });
outEdges.forEach(e => { const k=[e.a,e.b].sort().join('|'); if (temporal.seams && temporal.seams[k]) { e.when = temporal.seams[k]; datedSeams++; } });
// span = earliest 'from' to latest 'to' across all dated traditions (skins use this to lay the axis)
const fromsTos = Object.values(temporal.traditions||{});
const span = fromsTos.length ? { from: Math.min(...fromsTos.map(p=>p.from)), to: Math.max(...fromsTos.map(p=>p.to)) } : null;

/* ---- assemble ---- */
const out = {
  meta: Object.assign({}, base.meta, {
    note: `The seed was a vertical slice; the fan-out filled the rest of the human race. ${Object.keys(tradById).length} traditions, ${outFigures.length} figures, ${Object.keys(archById).length} archetype-joints.`,
    span: span
  }),
  tiers: base.tiers,
  edgeTypes: base.edgeTypes,
  eras: temporal.eras || [],
  highlights: temporal.highlights || [],
  traditions: tradById,
  archetypes: base.archetypes.concat(newArchetypes),
  figures: outFigures,
  edges: outEdges,
};

/* ---- report ---- */
console.log('\n=== MERGE REPORT ===');
console.log(`traditions : ${Object.keys(base.traditions).length} -> ${Object.keys(tradById).length}  (+${Object.keys(newTraditions).length})`);
console.log(`archetypes : ${base.archetypes.length} -> ${out.archetypes.length}  (+${newArchetypes.length}: ${newArchetypes.map(a=>a.id).join(', ')||'none'})`);
console.log(`figures    : ${base.figures.length} -> ${out.figures.length}  (+${newFigures.length})`);
console.log(`edges      : ${base.edges.length} -> ${out.edges.length}  (+${out.edges.length-base.edges.length})`);
console.log(`remaps     : ${Object.keys(remap).length}`);
console.log(`temporal   : ${datedTrads}/${Object.keys(tradById).length} traditions dated, ${datedFigs} figure overrides, ${datedSeams} seams dated${span?`  (span ${span.from} → ${span.to})`:''}`);
if(log.length){ console.log(`\nwarnings (${log.length}):`); console.log(log.join('\n')); } else console.log('\nno warnings — clean merge.');

/* ---- emit ---- */
if(DRY){ console.log('\n--dry: nothing written.'); process.exit(0); }
const header = `/* ============================================================================
   THE MENDED MIRROR  —  dataset  (working title; the name will earn itself)
   ----------------------------------------------------------------------------
   A kintsugi of the world's belief systems. Each tradition is a shard of one
   broken mirror; the gold seams are the convergences that rejoin them; the
   archetypes are the joints where seams meet. Evidence is TIERED always:
     1 cognate (proven descent) · 2 attested · 3 analogous · 4 speculative
     forgery (fool's gold — its seam points home to the real).
   GENERATED by merge.js from the seed + fan-out research. Edit the seed
   (mirror-data.seed.js) or re-run the fan-out; do not hand-edit this file.
   ============================================================================ */
window.MIRROR_DATA = `;
fs.copyFileSync(LIVE, LIVE+'.bak');
fs.writeFileSync(LIVE, header + JSON.stringify(out, null, 2) + ';\n');
console.log(`\n✓ wrote ${path.relative(ROOT,LIVE)} (backup: mirror-data.js.bak)`);
