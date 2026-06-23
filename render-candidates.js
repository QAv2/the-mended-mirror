#!/usr/bin/env node
/* ============================================================================
   Render the Master Taxonomy / Completeness Registry (data/_candidates.json)
   into candidates.html — the obsidian-and-gold "menu of the dish" Joe reads.
   node render-candidates.js
   ============================================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, "data/_candidates.json"), "utf8"));

const esc = s => (s == null ? "" : String(s)).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const fmtYear = y => {
  if (y == null) return "—";
  if (y >= 2026) return "present";
  const a = Math.abs(y).toLocaleString("en-US");
  return y < 0 ? a + " BCE" : a + " CE";
};

// ---- tally ----
const tally = { have: 0, add: 0, fold: 0, waves: { 1: 0, 2: 0, 3: 0 } };
REG.families.forEach(f => f.items.forEach(it => {
  tally[it.status] = (tally[it.status] || 0) + 1;
  if (it.status === "add" && it.wave) tally.waves[it.wave] = (tally.waves[it.wave] || 0) + 1;
}));
const shardsNow = tally.have;                       // ≈ the 54
const shardsFull = tally.have + tally.add - 1;      // -1: composite `abrahamic` dissolves into its split

const STATUS = {
  have: { label: "have", c: "#7fae6a" },
  add: { label: "add", c: "#e6ad44" },
  fold: { label: "fold", c: "#8f7fae" }
};

function rowHtml(it) {
  const st = STATUS[it.status] || STATUS.add;
  const waveChip = it.status === "add" && it.wave ? `<span class="wave w${it.wave}">wave ${it.wave}</span>` : "";
  const foldChip = it.status === "fold" && it.into ? `<span class="into">→ ${esc(it.into)}</span>` : "";
  const live = it.living ? `<span class="live">living</span>` : `<span class="dead">historic</span>`;
  return `<div class="row ${it.status}">
    <div class="r-head">
      <span class="chip" style="--c:${st.c}">${st.label}</span>
      ${waveChip}${foldChip}
      <span class="name">${esc(it.name)}</span>
      <span class="meta">${fmtYear(it.date)} &middot; ${esc(it.region)} &middot; ${live}</span>
    </div>
    <div class="anchor">${esc(it.anchor || "")}</div>
    ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
  </div>`;
}

function familyHtml(f) {
  const adds = f.items.filter(i => i.status === "add").length;
  const haves = f.items.filter(i => i.status === "have").length;
  const folds = f.items.filter(i => i.status === "fold").length;
  const sub = [haves ? `${haves} have` : "", adds ? `${adds} add` : "", folds ? `${folds} fold` : ""].filter(Boolean).join(" &middot; ");
  return `<section class="family" style="--hue:${f.hue}">
    <h2><span class="dot"></span>${esc(f.name)} <em>${sub}</em></h2>
    ${f.items.map(rowHtml).join("\n")}
  </section>`;
}

const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Mended Mirror — Setting the Table</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Spectral:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
:root{--ink:#e9dcc0;--ink-dim:#b6a883;--gold:#e6ad44;--gold-bright:#ffd86b;--bg:#090604;
  --serif-d:"Marcellus",Georgia,serif;--serif-b:"Spectral",Georgia,serif}
*{box-sizing:border-box}
html,body{margin:0;background:radial-gradient(120% 80% at 50% 0%,#160f08 0%,#0c0805 55%,#070503 100%);
  color:var(--ink);font-family:var(--serif-b);-webkit-font-smoothing:antialiased;line-height:1.5}
.wrap{max-width:1080px;margin:0 auto;padding:54px 30px 100px}
header.top{text-align:center;margin-bottom:14px}
header.top .kick{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
header.top h1{font-family:var(--serif-d);font-weight:400;font-size:40px;letter-spacing:.07em;margin:.18em 0 .1em}
header.top .sub{font-style:italic;color:var(--ink-dim);font-size:15px;max-width:680px;margin:.2em auto 0}
.mandate{max-width:760px;margin:22px auto 0;padding:14px 20px;border:1px solid rgba(230,173,68,.22);
  border-radius:3px;background:rgba(40,30,16,.32);font-size:13.5px;color:var(--ink);font-style:italic;text-align:center}
.mandate b{color:var(--gold-bright);font-style:normal}
/* scoreboard */
.score{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin:30px auto 8px}
.stat{border:1px solid rgba(230,173,68,.28);border-radius:4px;padding:12px 20px;min-width:120px;text-align:center;
  background:linear-gradient(180deg,rgba(28,21,12,.6),rgba(12,8,5,.6))}
.stat .n{font-family:var(--serif-d);font-size:34px;color:var(--gold-bright);line-height:1}
.stat .l{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim);margin-top:6px}
.score .arrow{align-self:center;font-size:24px;color:var(--gold);opacity:.7}
.waves{display:flex;gap:10px;justify-content:center;margin:14px auto 0;font-size:12.5px;color:var(--ink-dim);flex-wrap:wrap}
.waves span{border:1px solid rgba(230,173,68,.2);border-radius:20px;padding:4px 14px}
.waves b{color:var(--gold-bright)}
.legend{text-align:center;font-size:12px;color:var(--ink-dim);margin:18px auto 4px;max-width:760px}
.legend .chip{margin:0 4px}
/* families */
.family{margin:34px 0 0;border-top:1px solid rgba(230,173,68,.12);padding-top:20px}
.family h2{font-family:var(--serif-d);font-weight:400;font-size:22px;letter-spacing:.04em;margin:0 0 4px;
  color:var(--ink);display:flex;align-items:center;gap:11px}
.family h2 .dot{width:11px;height:11px;border-radius:50%;background:var(--hue);box-shadow:0 0 12px var(--hue)}
.family h2 em{font-family:var(--serif-b);font-style:normal;font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--ink-dim);margin-left:auto;opacity:.85}
.row{padding:10px 12px 11px 16px;margin:8px 0;border-left:2px solid var(--hue);border-radius:0 3px 3px 0;
  background:rgba(255,255,255,.012)}
.row.add{background:linear-gradient(90deg,rgba(230,173,68,.08),rgba(230,173,68,.012));border-left-color:var(--gold)}
.row.have{opacity:.62}
.row.fold{opacity:.78;border-left-style:dashed}
.r-head{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.name{font-family:var(--serif-d);font-size:16.5px;color:var(--ink)}
.row.add .name{color:var(--gold-bright)}
.meta{font-size:11.5px;color:var(--ink-dim);margin-left:auto;letter-spacing:.02em;white-space:nowrap}
.chip{font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;border:1px solid var(--c);color:var(--c);
  border-radius:10px;padding:1px 8px}
.wave{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;border-radius:10px;padding:1px 8px;
  border:1px solid rgba(255,216,107,.4);color:var(--gold-bright)}
.wave.w2{opacity:.78}.wave.w3{opacity:.58}
.into{font-size:11px;color:#8f7fae;font-style:italic}
.live{color:#7fae6a}.dead{color:#9c8f6f}
.anchor{font-size:13.5px;color:var(--ink);opacity:.9;margin-top:3px}
.note{font-size:12px;color:var(--ink-dim);font-style:italic;margin-top:3px}
.note:before{content:"⟡ ";color:var(--gold);font-style:normal}
footer{text-align:center;margin-top:50px;font-size:11.5px;color:var(--ink-dim);opacity:.7;font-style:italic}
</style></head><body><div class="wrap">

<header class="top">
  <div class="kick">The Mended Mirror &middot; the completeness audit</div>
  <h1>Setting the Table</h1>
  <p class="sub">Every ingredient for the dish &mdash; the full menu of human belief, from the deep-time embers to the religions invented last decade. Nothing excluded; each set at its right altitude.</p>
</header>

<div class="mandate">${esc(REG.meta.mandate)}</div>

<div class="score">
  <div class="stat"><div class="n">${shardsNow}</div><div class="l">shards now</div></div>
  <div class="arrow">→</div>
  <div class="stat"><div class="n">${shardsFull}</div><div class="l">shards at full coverage</div></div>
  <div class="stat"><div class="n">+${tally.add}</div><div class="l">new shards mapped</div></div>
  <div class="stat"><div class="n">${tally.fold}</div><div class="l">fold-clusters<br>(100s of sub-currents)</div></div>
</div>
<div class="waves">
  <span>Wave 1 &mdash; <b>${tally.waves[1]}</b> &middot; Joe's named families + the Abrahamic split</span>
  <span>Wave 2 &mdash; <b>${tally.waves[2]}</b> &middot; major indigenous + ancient/dead + branches</span>
  <span>Wave 3 &mdash; <b>${tally.waves[3]}</b> &middot; the long tail</span>
</div>
<div class="legend">
  <span class="chip" style="--c:#7fae6a">have</span> one of the existing 54 &nbsp;
  <span class="chip" style="--c:#e6ad44">add</span> recommended new shard &nbsp;
  <span class="chip" style="--c:#8f7fae">fold</span> represented as figures inside another shard (target shown) &nbsp;&mdash;&nbsp;
  <em>the altitude rule: ${esc(REG.meta.altitude_rule)}</em>
</div>

${REG.families.map(familyHtml).join("\n")}

<footer>${esc(REG.meta.method)}<br>data/_candidates.json &middot; regenerate: <code>node render-candidates.js</code></footer>

</div></body></html>`;

fs.writeFileSync(path.join(ROOT, "candidates.html"), html);
console.log("wrote candidates.html");
console.log(`  shards now: ${shardsNow}  →  full: ${shardsFull}   (+${tally.add} add, ${tally.fold} fold-clusters)`);
console.log(`  waves: 1=${tally.waves[1]}  2=${tally.waves[2]}  3=${tally.waves[3]}`);
