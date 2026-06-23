#!/usr/bin/env node
/* ============================================================================
   THE MENDED MIRROR — sanity check.
   Validates the merged dataset the way the engine (mirror.js) actually reads it:
   nodes = archetypes + figures; edges = generated instantiate-seams (figure ->
   each archetype) + explicit seams. Reports duplicates, orphans, dangling refs,
   invalid tiers/types, tradition integrity, and connectivity.
     node sanity-check.js
   ============================================================================ */
'use strict';
const path = require('path');
global.window = {};
require(path.join(__dirname, 'data', 'mirror-data.js'));
const D = global.window.MIRROR_DATA;

const VALID_TIERS = new Set(['1', '2', '3', '4', 'forgery']);
const VALID_TYPES = new Set(Object.keys(D.edgeTypes));
const out = [];
const P = (...a) => out.push(a.join(' '));
let problems = 0, warns = 0;
const FAIL = m => { problems++; P('  ✗ ' + m); };
const WARN = m => { warns++; P('  ⚠ ' + m); };
const OK = m => P('  ✓ ' + m);

P('================ THE MENDED MIRROR — SANITY CHECK ================');
P(`traditions ${Object.keys(D.traditions).length} · archetypes ${D.archetypes.length} · figures ${D.figures.length} · explicit edges ${D.edges.length}`);

/* ---------- 1. DUPLICATE IDS ---------- */
P('\n--- 1. duplicate ids ---');
function dupes(arr) { const seen = {}, d = []; arr.forEach(x => { seen[x] = (seen[x] || 0) + 1; }); for (const k in seen) if (seen[k] > 1) d.push(`${k}(×${seen[k]})`); return d; }
const figIds = D.figures.map(f => f.id), archIds = D.archetypes.map(a => a.id), tradIds = Object.keys(D.traditions);
const dupFig = dupes(figIds), dupArch = dupes(archIds), dupTrad = dupes(tradIds);
// figures vs archetypes id collision (a node id must be unique across BOTH sets — byId is shared)
const allNodeIds = figIds.concat(archIds);
const dupCross = dupes(allNodeIds).filter(s => { const id = s.split('(')[0]; return figIds.includes(id) && archIds.includes(id); });
dupFig.length ? FAIL('duplicate figure ids: ' + dupFig.join(', ')) : OK('figure ids unique (' + figIds.length + ')');
dupArch.length ? FAIL('duplicate archetype ids: ' + dupArch.join(', ')) : OK('archetype ids unique (' + archIds.length + ')');
dupTrad.length ? FAIL('duplicate tradition ids: ' + dupTrad.join(', ')) : OK('tradition ids unique (' + tradIds.length + ')');
dupCross.length ? FAIL('figure/archetype id COLLISION: ' + dupCross.join(', ')) : OK('no figure↔archetype id collisions');

/* ---------- build the node + edge graph exactly as mirror.js does ---------- */
const byId = {};
D.archetypes.forEach(a => byId[a.id] = { id: a.id, isArch: true, deg: 0 });
D.figures.forEach(f => byId[f.id] = { id: f.id, isArch: false, trad: f.tradition, deg: 0 });
const graphEdges = [];
D.figures.forEach(f => (f.archetypes || []).forEach(aid => { if (byId[aid]) graphEdges.push([f.id, aid, 'instantiates']); }));
D.edges.forEach(e => { if (byId[e.a] && byId[e.b]) graphEdges.push([e.a, e.b, e.type]); });
graphEdges.forEach(([a, b]) => { byId[a].deg++; byId[b].deg++; });

/* ---------- 2. DANGLING REFERENCES ---------- */
P('\n--- 2. dangling references ---');
const badArchRefs = [];
D.figures.forEach(f => (f.archetypes || []).forEach(aid => { if (!byId[aid] || !byId[aid].isArch) badArchRefs.push(`${f.id}→${aid}`); }));
const danglEdges = D.edges.filter(e => !byId[e.a] || !byId[e.b]).map(e => `${e.a}→${e.b}`);
const selfLoops = D.edges.filter(e => e.a === e.b).map(e => e.a);
badArchRefs.length ? FAIL('figure→archetype refs to non-archetypes: ' + badArchRefs.join(', ')) : OK('every figure.archetypes ref resolves to a real archetype');
danglEdges.length ? FAIL('explicit edges with unknown endpoint: ' + danglEdges.join(', ')) : OK('every explicit edge endpoint resolves to a real node');
selfLoops.length ? FAIL('self-loop edges: ' + selfLoops.join(', ')) : OK('no self-loop edges');

/* ---------- 3. ORPHANS / ISOLATES ---------- */
P('\n--- 3. orphans & isolates ---');
const isolates = Object.values(byId).filter(n => n.deg === 0);
const isoFig = isolates.filter(n => !n.isArch).map(n => n.id);
const isoArch = isolates.filter(n => n.isArch).map(n => n.id);
isoFig.length ? FAIL('ISOLATED figures (no joint, no seam): ' + isoFig.join(', ')) : OK('no isolated figures — every figure connects to ≥1 node');
isoArch.length ? FAIL('ISOLATED archetypes (no figure instantiates them): ' + isoArch.join(', ')) : OK('no isolated archetypes — every joint has ≥1 figure');
// figures with no archetype at all (would be skipped by merge for fanout, but seed figures aren't validated)
const noJoint = D.figures.filter(f => !(f.archetypes || []).length).map(f => f.id);
noJoint.length ? WARN('figures with NO archetype joint (' + noJoint.length + '): ' + noJoint.join(', ')) : OK('every figure carries ≥1 archetype joint');
// archetypes by how many figures instantiate them (thin joints worth noting)
const instCount = {}; D.archetypes.forEach(a => instCount[a.id] = 0);
D.figures.forEach(f => (f.archetypes || []).forEach(a => { if (instCount[a.id] != null) instCount[a.id]++; }));
const thin = Object.entries(instCount).filter(([, n]) => n > 0 && n < 2).map(([k, n]) => `${k}(${n})`);
thin.length ? WARN('thin joints (only 1 figure — not orphan but weakly populated): ' + thin.join(', ')) : OK('every joint has ≥2 figures');

/* ---------- 4. EDGE VALIDITY ---------- */
P('\n--- 4. edge tier / type validity ---');
const badTier = D.edges.filter(e => !VALID_TIERS.has(String(e.tier))).map(e => `${e.a}→${e.b}:${e.tier}`);
const badType = D.edges.filter(e => !VALID_TYPES.has(e.type)).map(e => `${e.a}→${e.b}:${e.type}`);
badTier.length ? FAIL('invalid tiers: ' + badTier.join(', ')) : OK('all explicit-edge tiers valid (1/2/3/4/forgery)');
badType.length ? FAIL('invalid edge types: ' + badType.join(', ')) : OK('all explicit-edge types valid');
// duplicate explicit edges (same unordered pair + type)
const eseen = {}, edupes = [];
D.edges.forEach(e => { const k = [e.a, e.b].sort().join('|') + '::' + e.type; eseen[k] = (eseen[k] || 0) + 1; });
for (const k in eseen) if (eseen[k] > 1) edupes.push(`${k}(×${eseen[k]})`);
edupes.length ? FAIL('duplicate explicit edges: ' + edupes.join(', ')) : OK('no duplicate explicit edges (same pair+type)');
// parallel edges (same pair, different type) — allowed, just report
const pairCount = {};
D.edges.forEach(e => { const k = [e.a, e.b].sort().join('|'); (pairCount[k] = pairCount[k] || []).push(e.type); });
const parallel = Object.entries(pairCount).filter(([, ts]) => ts.length > 1);
P(`  · ${parallel.length} node-pairs carry >1 explicit seam (parallel seams of different type — allowed)`);

/* ---------- 5. TRADITION INTEGRITY ---------- */
P('\n--- 5. tradition integrity ---');
const figTrads = new Set(D.figures.map(f => f.tradition));
const badTrad = D.figures.filter(f => !D.traditions[f.tradition]).map(f => `${f.id}(${f.tradition})`);
const emptyTrad = tradIds.filter(t => !figTrads.has(t));
const noColor = tradIds.filter(t => !D.traditions[t].color);
badTrad.length ? FAIL('figures referencing unknown tradition: ' + badTrad.join(', ')) : OK('every figure’s tradition exists in the traditions map');
emptyTrad.length ? FAIL('traditions with ZERO figures: ' + emptyTrad.join(', ')) : OK('every tradition has ≥1 figure');
noColor.length ? WARN('traditions with no color: ' + noColor.join(', ')) : OK('every tradition has a color');

/* ---------- 6. DISTRIBUTIONS / SENSE ---------- */
P('\n--- 6. distributions (sense check) ---');
const tierHist = {}; D.edges.forEach(e => tierHist[e.tier] = (tierHist[e.tier] || 0) + 1);
P('  explicit-seam tiers: ' + Object.entries(tierHist).sort().map(([k, v]) => `t${k}=${v}`).join('  '));
const t1 = tierHist['1'] || 0, total = D.edges.length;
if (t1 / total > 0.25) WARN(`tier-1 is ${(100 * t1 / total).toFixed(0)}% of seams — suspiciously high for cross-cultural claims`);
else OK(`tier-1 is a disciplined ${(100 * t1 / total).toFixed(0)}% of explicit seams (rest earn their gold)`);
const typeHist = {}; D.edges.forEach(e => typeHist[e.type] = (typeHist[e.type] || 0) + 1);
P('  seam types: ' + Object.entries(typeHist).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  '));
const figPerTrad = {}; D.figures.forEach(f => figPerTrad[f.tradition] = (figPerTrad[f.tradition] || 0) + 1);
const fptVals = Object.values(figPerTrad);
P(`  figures/tradition: min ${Math.min(...fptVals)} · max ${Math.max(...fptVals)} · avg ${(D.figures.length / tradIds.length).toFixed(1)}`);
const lean = Object.entries(figPerTrad).filter(([, n]) => n < 3).map(([t, n]) => `${t}(${n})`);
if (lean.length) P('  · lean shards (<3 figures): ' + lean.join(', '));
// degree leaders / loners
const degs = Object.values(byId).map(n => ({ id: n.id, deg: n.deg, a: n.isArch }));
degs.sort((x, y) => y.deg - x.deg);
P('  most-connected: ' + degs.slice(0, 8).map(n => `${n.id}(${n.deg}${n.a ? '◆' : ''})`).join(', '));
const leaves = degs.filter(n => !n.a && n.deg === 1).map(n => n.id);
P(`  · ${leaves.length} figures connect to exactly ONE node (a joint only, no cross-seam) — leaves, not orphans`);

/* ---------- 7. SPOT-CHECK FLAGSHIP SEAMS ---------- */
P('\n--- 7. flagship seams present? ---');
const has = (a, b) => D.edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)) || (byId[a] && D.figures.find(f => f.id === a && (f.archetypes || []).includes(b)));
const checks = [
  ['dyeus', 'zeus', 'PIE sky-father cognate'],
  ['asa', 'cosmic-order', 'Zoroastrian Aṣ̌a → cosmic-order'],
  ['ahura-mazda', 'varuna', 'Indo-Iranian ahura/asura'],
  ['hawaiian-kane', 'tane', 'Polynesian Kāne↔Tāne cognate'],
  ['khoekhoe-moon-death', 'san-moon-hare', 'origin-of-death (Khoekhoe↔San)'],
  ['artemis', 'shiva', 'Master/Mistress of Animals'],
  ['ainu-kim-un-kamuy', 'master-of-animals', 'Ainu bear → master-of-animals'],
];
checks.forEach(([a, b, label]) => { (has(a, b)) ? OK(label) : FAIL('MISSING flagship seam: ' + label + ` (${a}↔${b})`); });

/* ---------- 8. TEMPORAL SPINE ---------- */
P('\n--- 8. temporal spine ---');
if (!D.traditions[tradIds[0]].period) {
  WARN('no temporal data merged yet (run merge after authoring _temporal.json) — skipping temporal checks');
} else {
  const CERT = new Set(['attested', 'inferred', 'reconstructed', 'contested', 'deep', 'prophesied']);
  const noPeriod = tradIds.filter(t => !D.traditions[t].period);
  noPeriod.length ? FAIL('traditions with NO period: ' + noPeriod.join(', ')) : OK('every tradition has a period');
  const badRange = [], badCert = [], badLiving = [];
  tradIds.forEach(t => {
    const p = D.traditions[t].period; if (!p) return;
    if (typeof p.from !== 'number' || typeof p.to !== 'number' || p.from > p.to) badRange.push(`${t}(${p.from}→${p.to})`);
    if (p.peak != null && (p.peak < p.from || p.peak > p.to)) badRange.push(`${t}(peak ${p.peak}∉[${p.from},${p.to}])`);
    if (!CERT.has(p.certainty)) badCert.push(`${t}:${p.certainty}`);
    if (p.living && p.to < 1900) badLiving.push(`${t}(living but ends ${p.to})`);
  });
  badRange.length ? FAIL('bad period ranges: ' + badRange.join(', ')) : OK('all periods well-ordered (from ≤ peak ≤ to)');
  badCert.length ? FAIL('invalid certainty values: ' + badCert.join(', ')) : OK('all certainty flags valid (' + [...CERT].join('/') + ')');
  badLiving.length ? FAIL('living traditions ending in the past: ' + badLiving.join(', ')) : OK('every living tradition runs to the present');
  // eras present & cover the span
  const eras = D.eras || [], span = D.meta && D.meta.span;
  if (!eras.length) WARN('no eras defined'); else if (span && (eras[0].from > span.from || eras[eras.length - 1].to < span.to))
    WARN(`eras [${eras[0].from},${eras[eras.length-1].to}] do not cover span [${span.from},${span.to}]`);
  else OK(`${eras.length} eras cover the span ${span ? span.from + '→' + span.to : ''}`);
  // figure date overrides sane; non-future overrides should sit within their tradition window
  const figBad = [], figOut = [];
  D.figures.forEach(f => { if (!f.date) return; const d = f.date;
    if (typeof d.from === 'number' && typeof d.to === 'number' && d.from > d.to) figBad.push(f.id);
    const tp = D.traditions[f.tradition] && D.traditions[f.tradition].period;
    if (tp && !d.future && typeof d.from === 'number' && (d.from < tp.from - 1 || (typeof d.to==='number' && d.to > tp.to + 1)))
      figOut.push(`${f.id}(${d.from}→${d.to} ∉ ${f.tradition} ${tp.from}→${tp.to})`);
  });
  figBad.length ? FAIL('bad figure date ranges: ' + figBad.join(', ')) : OK('figure date-overrides well-ordered');
  figOut.length ? WARN('figure dates outside their tradition window (ok if intentional): ' + figOut.join(', ')) : OK('non-future figure dates sit within their tradition window');
  // orphan seam-dates: temporal seam keys that matched no edge
  try {
    const temporal = require(path.join(__dirname, 'data', '_temporal.json'));
    const edgeKeys = new Set(D.edges.map(e => [e.a, e.b].sort().join('|')));
    const orphanSeams = Object.keys(temporal.seams || {}).filter(k => !edgeKeys.has(k));
    orphanSeams.length ? WARN('seam-dates with no matching edge (will not render): ' + orphanSeams.join(', ')) : OK('every dated seam matches a real edge');
    const dated = D.edges.filter(e => e.when).length;
    P(`  · ${dated} seams carry a 'when' (the blending events the timeline fires)`);
    // alive-at-T preview — the heart of the timeline (present = most, deep past = fewest)
    const aliveAt = y => tradIds.filter(t => { const p = D.traditions[t].period; return p && p.from <= y && p.to >= y; });
    P('  alive-at-year (present=most, deep past=fewest):');
    [-50000, -3500, -800, -200, 1, 400, 1000, 2026].forEach(y => {
      const a = aliveAt(y); P(`     ${String(y).padStart(6)} : ${String(a.length).padStart(2)} traditions${a.length<=6?'  ['+a.join(', ')+']':''}`); });
  } catch (e) { WARN('could not load _temporal.json for orphan-seam check: ' + e.message); }
}

/* ---------- VERDICT ---------- */
P('\n================ VERDICT ================');
P(`problems: ${problems}   warnings: ${warns}`);
P(problems === 0 ? '✅ CLEAN — no duplicates, no orphans, no dangling refs, all tiers/types valid.' : '❌ problems found (see ✗ above).');

console.log(out.join('\n'));
process.exit(problems === 0 ? 0 : 1);
