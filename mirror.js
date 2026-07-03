/* ============================================================================
   THE MENDED MIRROR — the engine.
   A force-laid constellation drawn as kintsugi: pantheons as shards, archetypes
   as the gold joints where seams meet, every seam's brightness set by how true
   the join is (its evidence tier). Vanilla JS + canvas, no libraries, file://-safe.
   ============================================================================ */
(function () {
  "use strict";
  const DATA = window.MIRROR_DATA;
  if (!DATA) { document.body.insertAdjacentHTML('beforeend',
    '<p style="color:#caa;position:fixed;top:46%;width:100%;text-align:center">mirror-data.js failed to load.</p>'); return; }

  const TIERS = DATA.tiers, TRAD = DATA.traditions, ETYPES = DATA.edgeTypes;

  /* ---------- build nodes ---------- */
  const nodes = [], byId = {};
  DATA.archetypes.forEach(a => {
    const n = { id:a.id, name:a.name, kind:a.kind, subtype:a.subtype, gloss:a.gloss,
      provenance:a.provenance, isArch:true, trad:null, x:0,y:0,vx:0,vy:0, mass:11, r:20, pinned:false };
    nodes.push(n); byId[a.id]=n;
  });
  DATA.figures.forEach(f => {
    const forg = f.kind==='forgery';
    const n = { id:f.id, name:f.name, kind:f.kind, gloss:f.gloss, facet:f.facet,
      provenance:f.provenance, sources:f.sources, isArch:false, forgery:forg,
      trad:f.tradition, archetypes:f.archetypes||[], x:0,y:0,vx:0,vy:0,
      mass:1.4, r: forg?8:5.5, pinned:false };
    nodes.push(n); byId[f.id]=n;
  });

  /* ---------- build edges (generated instantiate-seams + explicit seams) ---------- */
  const edges = [];
  DATA.figures.forEach(f => (f.archetypes||[]).forEach(aid => {
    if (byId[aid]) edges.push({ s:f.id, t:aid, type:'instantiates',
      tier: f.kind==='forgery'?'forgery':'3', note:'fulfils this archetype' });
  }));
  (DATA.edges||[]).forEach(e => { if (byId[e.a] && byId[e.b])
    edges.push({ s:e.a, t:e.b, type:e.type, tier:e.tier, note:e.note }); });
  edges.forEach(e => { e.S = byId[e.s]; e.T = byId[e.t]; });

  const adj = {}; nodes.forEach(n => adj[n.id] = new Set());
  edges.forEach(e => { adj[e.s].add(e.t); adj[e.t].add(e.s); });

  /* ---------- initial layout: archetypes on a ring, figures near their first joint ---------- */
  const A = DATA.archetypes.length;
  DATA.archetypes.forEach((a,i) => {
    const ang = (i/A)*Math.PI*2 - Math.PI/2, n = byId[a.id];
    n.x = Math.cos(ang)*255; n.y = Math.sin(ang)*255;
  });
  let seed = 1;
  function rnd(){ seed = (seed*1103515245 + 12345) & 0x7fffffff; return seed/0x7fffffff; }
  nodes.forEach(n => { if (!n.isArch) {
    const home = byId[n.archetypes[0]], ax = home?home.x:0, ay = home?home.y:0;
    const a = rnd()*Math.PI*2, r = 38 + rnd()*64;
    n.x = ax + Math.cos(a)*r; n.y = ay + Math.sin(a)*r;
  }});

  /* ---------- canvas + camera ---------- */
  const canvas = document.getElementById('mirror-canvas'), ctx = canvas.getContext('2d');
  let W=0, H=0; const DPR = Math.min(window.devicePixelRatio||1, 2);
  const cam = { x:0, y:0, z:0.9 };
  function resize(){ W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W*DPR; canvas.height = H*DPR; }
  window.addEventListener('resize', resize);

  function toScreen(p){ return { x:(p.x+cam.x)*cam.z + W/2, y:(p.y+cam.y)*cam.z + H/2 }; }
  function toWorld(sx,sy){ return { x:(sx-W/2)/cam.z - cam.x, y:(sy-H/2)/cam.z - cam.y }; }

  /* ---------- force simulation ---------- */
  let alpha = 0.9;
  function tick(){
    const REP = 4300, SPRING = 0.03, GRAV = 0.002, DAMP = 0.85, VMAX = 55;
    for (let i=0;i<nodes.length;i++){
      const a=nodes[i];
      for (let j=i+1;j<nodes.length;j++){
        const b=nodes[j];
        let dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy; if(d2<1) d2=1;
        const d=Math.sqrt(d2), f=REP/d2, fx=(dx/d)*f, fy=(dy/d)*f;
        a.vx+=fx/a.mass; a.vy+=fy/a.mass; b.vx-=fx/b.mass; b.vy-=fy/b.mass;
      }
    }
    edges.forEach(e=>{
      const a=e.S,b=e.T; let dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy)||1;
      const L = e.type==='instantiates'?76:152, f = SPRING*(d-L);
      const fx=(dx/d)*f, fy=(dy/d)*f;
      a.vx+=fx/a.mass; a.vy+=fy/a.mass; b.vx-=fx/b.mass; b.vy-=fy/b.mass;
    });
    nodes.forEach(n=>{
      n.vx -= n.x*GRAV; n.vy -= n.y*GRAV;
      if(n.pinned){ n.vx=0; n.vy=0; return; }
      n.vx*=DAMP; n.vy*=DAMP;
      if(n.vx>VMAX)n.vx=VMAX; if(n.vx<-VMAX)n.vx=-VMAX;
      if(n.vy>VMAX)n.vy=VMAX; if(n.vy<-VMAX)n.vy=-VMAX;
      n.x += n.vx*alpha; n.y += n.vy*alpha;
    });
    if (alpha>0.04) alpha*=0.996;
  }

  /* ---------- interaction state ---------- */
  let hover=null, selected=null, dragging=null, dragMoved=false, panning=false, lastM={x:0,y:0}, highlightTrad=null;
  function nodeAt(sx,sy){
    let best=null,bestD=1e9;
    for(const n of nodes){ const p=toScreen(n), dx=p.x-sx, dy=p.y-sy, d=dx*dx+dy*dy, rr=n.r*cam.z+6;
      if(d<rr*rr && d<bestD){ best=n; bestD=d; } }
    return best;
  }
  function related(n){ if(!n) return null; const s=new Set([n.id]); adj[n.id].forEach(id=>s.add(id)); return s; }

  /* ---------- render ---------- */
  function draw(){
    ctx.save(); ctx.scale(DPR,DPR);
    const g = ctx.createRadialGradient(W/2,H*0.42,30, W/2,H/2, Math.max(W,H)*0.78);
    g.addColorStop(0,'#1a2030'); g.addColorStop(0.5,'#0d1016'); g.addColorStop(1,'#040509');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    const focus = selected||hover, rel = related(focus);

    /* seams */
    edges.forEach(e=>{
      const a=toScreen(e.S), b=toScreen(e.T), tier=TIERS[e.tier]||TIERS['3'];
      let active=true, strong=false;
      if(rel) active = rel.has(e.s)&&rel.has(e.t);
      else if(highlightTrad) active = (e.S.trad===highlightTrad||e.T.trad===highlightTrad);
      if(focus && (e.s===focus.id||e.t===focus.id)) strong=true;
      const base = e.type==='instantiates'?0.42:0.72;
      ctx.globalAlpha = strong?1:(active?base:0.05);
      const mx=(a.x+b.x)/2, my=(a.y+b.y)/2; let dx=b.x-a.x, dy=b.y-a.y; const len=Math.hypot(dx,dy)||1;
      const nx=-dy/len, ny=dx/len, bow=Math.min(24, len*0.11);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo(mx+nx*bow,my+ny*bow,b.x,b.y);
      ctx.lineWidth = Math.max(0.6, tier.weight*(strong?1.6:1)*cam.z*0.9);
      ctx.strokeStyle = tier.gold;
      ctx.setLineDash(e.type==='forgery'?[4,4]:[]);
      ctx.shadowColor = tier.gold; ctx.shadowBlur = active?(strong?17:8):0;
      ctx.stroke(); ctx.shadowBlur=0; ctx.setLineDash([]);
    });
    ctx.globalAlpha=1;

    /* nodes */
    nodes.forEach(n=>{
      const p=toScreen(n), r=n.r*cam.z;
      let active=true;
      if(rel) active=rel.has(n.id); else if(highlightTrad) active=(n.trad===highlightTrad)||n.isArch;
      let nodeAlpha = active?1:0.16;
      if(!n.isArch && !focus && !highlightTrad) nodeAlpha = 0.5; // figures recede at rest; the gold joints anchor the field
      ctx.globalAlpha = nodeAlpha;
      if(n.isArch){
        const gg=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,r*1.7);
        gg.addColorStop(0,'#fff2cf'); gg.addColorStop(0.45,'#f0c45a'); gg.addColorStop(1,'rgba(184,137,58,0)');
        ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(p.x,p.y,r*1.7,0,7); ctx.fill();
        ctx.fillStyle='#ffe9aa'; ctx.beginPath(); ctx.arc(p.x,p.y,r*0.55,0,7); ctx.fill();
      } else if(n.forgery){
        ctx.fillStyle='#171a12'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.fill();
        ctx.strokeStyle=TIERS.forgery.gold; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.stroke(); ctx.setLineDash([]);
      } else {
        const col=(TRAD[n.trad]&&TRAD[n.trad].color)||'#9aa3b2';
        ctx.fillStyle='rgba(202,212,226,0.13)'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.fill();
        ctx.strokeStyle=col; ctx.lineWidth=(focus&&focus.id===n.id)?2.6:1.5;
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.stroke();
      }
      if(selected&&selected.id===n.id){ ctx.strokeStyle='#fff7e0'; ctx.lineWidth=1.6;
        ctx.beginPath(); ctx.arc(p.x,p.y,r+5,0,7); ctx.stroke(); }
      ctx.globalAlpha=1;

      const showLabel = n.isArch || (focus&&(focus.id===n.id||(rel&&rel.has(n.id)))) || cam.z>1.55;
      if(showLabel){
        ctx.globalAlpha = active?1:0.22;
        ctx.font = n.isArch ? '14px Marcellus, Georgia, serif' : '12px Spectral, Georgia, serif';
        ctx.fillStyle = n.isArch ? '#f4d78a' : '#d9dde6';
        ctx.textAlign='center'; ctx.textBaseline='top';
        if(n.isArch){ ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=6; }
        ctx.fillText(n.name, p.x, p.y+r+5); ctx.shadowBlur=0;
        ctx.globalAlpha=1;
      }
    });
    ctx.restore();
  }

  function frame(){ tick(); draw(); requestAnimationFrame(frame); }

  /* ---------- reliquary panel ---------- */
  const panel = document.getElementById('reliquary');
  function chip(tier){ const t=TIERS[tier]||TIERS['3']; return `<span class="tier-chip" style="--c:${t.gold}">${t.name}</span>`; }
  function esc(s){ return (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function openPanel(n){
    const kicker = n.isArch ? ('archetype · '+(n.subtype||''))
                            : ((TRAD[n.trad]?TRAD[n.trad].name:'') + ' · ' + (n.kind||''));
    let h = '';
    if(n.forgery) h += `<div class="forgery-banner">forgery · fool&rsquo;s gold</div>`;
    h += `<div class="rel-kicker">${esc(kicker)}</div><h2>${esc(n.name)}</h2>`;
    h += `<p class="rel-gloss">${esc(n.gloss)}</p>`;
    const es = edges.filter(e=>e.s===n.id||e.t===n.id);
    if(es.length){
      h += `<h3>Where it converges</h3><ul class="rel-edges">`;
      es.forEach(e=>{ const other=(e.s===n.id)?e.T:e.S;
        const label=(ETYPES[e.type]&&ETYPES[e.type].label)||e.type;
        h += `<li><span class="rel-rel">${esc(label)}</span> <b data-jump="${other.id}">${esc(other.name)}</b> ${chip(e.tier)}<div class="rel-note">${esc(e.note)}</div></li>`; });
      h += `</ul>`;
    }
    if(n.facet){ h += `<h3>Where it stands alone</h3><p class="rel-facet">${esc(n.facet)}</p>`; }
    if(n.provenance){ h += `<h3>Provenance</h3><p class="rel-prov">${esc(n.provenance)}</p>`; }
    if(n.sources&&n.sources.length){ h += `<p class="rel-src">${esc(n.sources.join('  ·  '))}</p>`; }
    panel.innerHTML = `<button id="rel-close">×</button>`+h;
    panel.classList.add('open');
    document.getElementById('rel-close').onclick = ()=>{ panel.classList.remove('open'); selected=null; };
    panel.querySelectorAll('[data-jump]').forEach(el=>el.onclick=()=>{
      const t=byId[el.getAttribute('data-jump')]; if(t){ selected=t; openPanel(t); } });
  }

  /* ---------- pointer events ---------- */
  canvas.addEventListener('mousemove', ev=>{
    const sx=ev.offsetX, sy=ev.offsetY;
    if(dragging){ const w=toWorld(sx,sy); dragging.x=w.x; dragging.y=w.y; dragging.vx=dragging.vy=0; dragMoved=true; return; }
    if(panning){ cam.x+=(sx-lastM.x)/cam.z; cam.y+=(sy-lastM.y)/cam.z; lastM={x:sx,y:sy}; return; }
    hover = nodeAt(sx,sy);
    canvas.style.cursor = hover?'pointer':'grab';
  });
  canvas.addEventListener('mousedown', ev=>{
    const n=nodeAt(ev.offsetX,ev.offsetY); dragMoved=false;
    if(n){ dragging=n; n.pinned=true; alpha=Math.max(alpha,0.45); }
    else { panning=true; lastM={x:ev.offsetX,y:ev.offsetY}; canvas.style.cursor='grabbing'; }
  });
  window.addEventListener('mouseup', ()=>{
    if(dragging){ const d=dragging; if(!dragMoved){ selected=d; openPanel(d); } setTimeout(()=>{ d.pinned=false; },1400); dragging=null; }
    if(panning) panning=false;
    canvas.style.cursor='grab';
  });
  canvas.addEventListener('click', ev=>{
    if(dragMoved) return;
    const n=nodeAt(ev.offsetX,ev.offsetY);
    if(n){ selected=n; openPanel(n); } else { selected=null; panel.classList.remove('open'); }
  });
  canvas.addEventListener('wheel', ev=>{
    ev.preventDefault();
    const before=toWorld(ev.offsetX,ev.offsetY);
    cam.z = Math.max(0.4, Math.min(3.4, cam.z*(ev.deltaY<0?1.1:0.9)));
    const after=toWorld(ev.offsetX,ev.offsetY);
    cam.x += after.x-before.x; cam.y += after.y-before.y;
  }, {passive:false});

  /* ---------- legend ---------- */
  const tierWrap=document.getElementById('legend-tiers');
  ['1','2','3','4','forgery'].forEach(k=>{ const t=TIERS[k]; if(!t) return;
    const el=document.createElement('div'); el.className='tier-row';
    el.innerHTML=`<span class="tier-chip" style="--c:${t.gold}">${t.name}</span><span class="tier-desc">${esc(t.desc)}</span>`;
    tierWrap.appendChild(el); });

  const tradWrap=document.getElementById('legend-trads');
  Object.keys(TRAD).forEach(k=>{ const t=TRAD[k];
    const el=document.createElement('button'); el.className='trad-swatch';
    el.innerHTML=`<i style="background:${t.color}"></i>${esc(t.name)}`;
    el.onclick=()=>{ const was=el.classList.contains('on');
      document.querySelectorAll('.trad-swatch').forEach(o=>o.classList.remove('on'));
      if(was){ highlightTrad=null; } else { highlightTrad=k; el.classList.add('on'); } };
    tradWrap.appendChild(el); });

  document.getElementById('btn-reset').onclick=()=>{
    cam.x=0; cam.y=0; cam.z=0.9; selected=null; panel.classList.remove('open');
    highlightTrad=null; document.querySelectorAll('.trad-swatch').forEach(o=>o.classList.remove('on'));
    alpha=0.5;
  };

  /* ---------- go ---------- */
  resize();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{});
  frame();
})();
