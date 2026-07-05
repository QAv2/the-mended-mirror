/* ============================================================================
   THE HALL OF AGES — the quiet voice: reliquary, legend, nav, hints.
   All DOM. The reliquary is the same reliquary the flat map earned — the
   place where a figure's convergences (the seams) and its facet (where it
   stands alone) are read side by side. Both halves are load-bearing.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  HALL.buildUI = function (H) {
    const M = H.model, D = M.DATA;
    const $ = id => document.getElementById(id);
    const panel = $("reliquary");
    const yearEl = $("year-readout");
    const hintEl = $("hint");
    const hoverEl = $("hover-label");
    const ceremonyEl = $("ceremony-line");

    function esc(s) { return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
    function chip(tier) {
      const t = D.tiers[tier] || D.tiers["3"];
      return `<span class="tier-chip" style="--c:${t.gold}">${t.name}</span>`;
    }
    function yearsOf(p) {
      if (!p) return "";
      const f = y => y === undefined ? "?" : (y < 0 ? Math.abs(y).toLocaleString() + " BCE" : y + " CE");
      let s = f(p.from) + " — " + (p.living ? "living" : f(p.to));
      if (p.peak !== undefined) s += " · peak " + f(p.peak);
      return s;
    }

    /* ---------- legend ---------- */
    (function () {
      const wrap = $("legend-tiers");
      ["1", "2", "3", "4", "forgery"].forEach(k => {
        const t = D.tiers[k];
        if (!t) return;
        const el = document.createElement("div");
        el.className = "tier-row";
        el.innerHTML = `<span class="tier-chip" style="--c:${t.gold}">${t.name}</span><span class="tier-desc">${esc(t.desc)}</span>`;
        wrap.appendChild(el);
      });
    })();

    /* ---------- reliquary views ---------- */
    let openToken = 0;
    function show(html) {
      panel.innerHTML = `<button id="rel-close" aria-label="close">×</button>` + html;
      panel.classList.add("open");
      panel.scrollTop = 0;
      $("rel-close").onclick = () => { close(); if (H.onPanelClose) H.onPanelClose(); };
      panel.querySelectorAll("[data-jf]").forEach(el => el.onclick = () => H.jump.figure(+el.getAttribute("data-jf")));
      panel.querySelectorAll("[data-jt]").forEach(el => el.onclick = () => H.jump.tradition(el.getAttribute("data-jt")));
      panel.querySelectorAll("[data-jj]").forEach(el => el.onclick = () => H.jump.joint(+el.getAttribute("data-jj")));
    }
    function close() { panel.classList.remove("open"); }

    function edgeListHTML(fi) {
      const f = D.figures[fi];
      const items = M.edgesOfFig[fi].map(ei => {
        const e = D.edges[ei];
        const otherId = e.a === f.id ? e.b : e.a;
        const oi = M.figById[otherId];
        if (oi === undefined) return "";
        const o = D.figures[oi];
        const label = (D.edgeTypes[e.type] && D.edgeTypes[e.type].label) || e.type;
        const oTrad = D.traditions[o.tradition] ? D.traditions[o.tradition].name : "";
        return `<li><span class="rel-rel">${esc(label)}</span> <b data-jf="${oi}">${esc(o.name)}</b>
          <span class="rel-mini">${esc(oTrad)}</span> ${chip(e.tier)}
          <div class="rel-note">${esc(e.note)}</div></li>`;
      }).join("");
      return items ? `<h3>Where it converges</h3><ul class="rel-edges">${items}</ul>` : "";
    }

    /* prose (glosses, edge notes, dossiers, links) lives in per-tradition
       chunks — gate each open on its chunk, with a beat of patience if the
       fetch is still in the air. Token guards stale renders. */
    function gated(ids, render) {
      if (!HALL.chunks || HALL.chunks.ready(ids)) { render(); return; }
      const tok = ++openToken;
      show(`<div class="rel-kicker">unsealing the record…</div>`);
      HALL.chunks.ensure(ids).then(() => { if (tok === openToken) render(); });
    }
    function openFigure(fi) { gated([D.figures[fi].tradition], () => renderFigure(fi)); }
    function openTradition(k) { gated([k], () => renderTradition(k)); }
    function openSeam(e) {
      const oi = M.figById[e.a];
      gated(oi !== undefined ? [D.figures[oi].tradition] : [], () => renderSeam(e));
    }

    function renderFigure(fi) {
      const f = D.figures[fi];
      const t = D.traditions[f.tradition] || {};
      let h = "";
      if (f.kind === "forgery") h += `<div class="forgery-banner">forgery · fool&rsquo;s gold</div>`;
      h += `<div class="rel-kicker"><span data-jt="${esc(f.tradition)}" class="rel-jump">${esc(t.name || "")}</span> · ${esc(f.kind || "")}</div>`;
      h += `<h2>${esc(f.name)}</h2>`;
      h += `<p class="rel-gloss">${esc(f.gloss)}</p>`;
      if (f.archetypes && f.archetypes.length) {
        h += `<p class="rel-arch">fulfils ` + f.archetypes.map(a => {
          const ji = M.jointById[a];
          const arch = D.archetypes.find(x => x.id === a);
          return ji !== undefined ? `<b data-jj="${ji}">${esc(arch ? arch.name : a)}</b>` : esc(a);
        }).join(" · ") + `</p>`;
      }
      h += edgeListHTML(fi);
      if (f.facet) h += `<h3>Where it stands alone</h3><p class="rel-facet">${esc(f.facet)}</p>`;
      if (f.provenance) h += `<h3>Provenance</h3><p class="rel-prov">${esc(f.provenance)}</p>`;
      show(h);
    }

    function renderTradition(k) {
      const t = D.traditions[k];
      if (!t) return;
      const si = M.shardOfTrad[k];
      const s = M.shards[si];
      let h = `<div class="rel-kicker">shard · ${esc(t.region || "")}</div>`;
      h += `<h2 style="color:${t.color}">${esc(t.name)}</h2>`;
      h += `<p class="rel-years">${esc(yearsOf(t.period))}</p>`;
      if (t.period && t.period.note) h += `<p class="rel-gloss">${esc(t.period.note)}</p>`;
      const ring = s ? M.rings[s.ring] : null;
      if (ring) {
        const eraNames = ring.eras.map(i => M.ERAS[i].name).join(" · ");
        h += `<p class="rel-mini-line">ring of ${esc(eraNames)} — the age it entered the mirror</p>`;
      }
      // the dossier — what this belief system IS (sidecar: data/mirror-dossiers.js)
      const dos = (root.MIRROR_DOSSIERS && root.MIRROR_DOSSIERS[k]) || t.dossier;
      if (dos) {
        if (dos.essence) h += `<p class="rel-gloss rel-essence">${esc(dos.essence)}</p>`;
        if (dos.cosmos) h += `<h3>The cosmos it holds</h3><p class="rel-gloss">${esc(dos.cosmos)}</p>`;
        if (dos.practice) h += `<h3>The practice</h3><p class="rel-gloss">${esc(dos.practice)}</p>`;
        if (dos.canon) h += `<h3>The canon</h3><p class="rel-gloss">${esc(dos.canon)}</p>`;
        if (dos.reflects) h += `<h3>Where it stands alone</h3><p class="rel-facet">${esc(dos.reflects)}</p>`;
        if (dos.sources && dos.sources.length) h += `<h3>Sources</h3><p class="rel-prov">${dos.sources.map(esc).join(" · ")}</p>`;
      }
      // partners: top convergent traditions
      const partners = [];
      for (const key in M.pairAgg) {
        const cut = key.indexOf("|");
        const a = key.slice(0, cut), b = key.slice(cut + 1);
        if (a === k || b === k) partners.push({ o: a === k ? b : a, g: M.pairAgg[key] });
      }
      partners.sort((x, y) => (y.g.bestW * y.g.count) - (x.g.bestW * x.g.count));
      if (partners.length) {
        h += `<h3>Where it converges</h3><ul class="rel-edges">` + partners.slice(0, 12).map(p => {
          const ot = D.traditions[p.o];
          return `<li><b data-jt="${esc(p.o)}">${esc(ot ? ot.name : p.o)}</b>
            <span class="rel-mini">${p.g.count} seam${p.g.count > 1 ? "s" : ""}</span> ${chip(p.g.bestTier)}</li>`;
        }).join("") + `</ul>`;
      }
      const figs = M.figsOfTrad[k] || [];
      if (figs.length) {
        h += `<h3>Its figures — ${figs.length}</h3><ul class="rel-figs">` + figs.map(fi => {
          const f = D.figures[fi];
          return `<li><b data-jf="${fi}">${esc(f.name)}</b> <span class="rel-mini">${esc(f.kind)}</span></li>`;
        }).join("") + `</ul>`;
      }
      show(h);
    }

    function openJoint(ji) {
      const j = M.joints[ji], a = j.a;
      let h = `<div class="rel-kicker">archetype · ${esc(a.subtype || "")}</div>`;
      h += `<h2>${esc(a.name)}</h2>`;
      h += `<p class="rel-gloss">${esc(a.gloss)}</p>`;
      const figs = (M.archFigs[a.id] || []).slice();
      h += `<h3>Fulfilled by ${figs.length} figures</h3>`;
      const byTrad = {};
      figs.forEach(fi => {
        const f = D.figures[fi];
        (byTrad[f.tradition] = byTrad[f.tradition] || []).push(fi);
      });
      h += `<ul class="rel-figs">` + Object.keys(byTrad).sort().map(tk => {
        const t = D.traditions[tk];
        return `<li><span class="rel-mini" style="color:${t ? t.color : "#888"}">${esc(t ? t.name : tk)}</span> ` +
          byTrad[tk].map(fi => `<b data-jf="${fi}">${esc(D.figures[fi].name)}</b>`).join(", ") + `</li>`;
      }).join("") + `</ul>`;
      show(h);
    }

    function renderSeam(e) {
      const ai = M.figById[e.a], bi = M.figById[e.b];
      const fa = D.figures[ai], fb = D.figures[bi];
      const label = (D.edgeTypes[e.type] && D.edgeTypes[e.type].label) || e.type;
      let h = `<div class="rel-kicker">a seam · ${esc(label)}</div>`;
      h += `<h2><span data-jf="${ai}" class="rel-jump">${esc(fa.name)}</span> · <span data-jf="${bi}" class="rel-jump">${esc(fb.name)}</span></h2>`;
      h += `<p class="rel-gloss">${chip(e.tier)}</p>`;
      h += `<p class="rel-gloss">${esc(e.note)}</p>`;
      if (e.when && e.when.when !== undefined) {
        const y = e.when.when;
        h += `<p class="rel-years">sealed ~${y < 0 ? Math.abs(y) + " BCE" : y + " CE"}${e.when.note ? " — " + esc(e.when.note) : ""}</p>`;
      }
      show(h);
    }

    /* ---------- year readout ---------- */
    function setYear(y) {
      const era = M.time.eraOfYear(y);
      const yr = y < 0 ? Math.abs(Math.round(y)).toLocaleString() + " BCE" : Math.round(y) + " CE";
      yearEl.innerHTML = `<b>${yr}</b><span>${esc(era.name)}</span>`;
    }
    setYear(M.NOW);

    /* ---------- hover label (DOM chip anchored to 3D) ---------- */
    const v3 = new THREE.Vector3();
    let hoverTarget = null;
    function setHover(worldPos, title, cap, color) {
      hoverTarget = worldPos ? { p: worldPos.clone(), title, cap, color } : null;
      if (!hoverTarget) hoverEl.style.opacity = 0;
    }
    function tickHover() {
      if (!hoverTarget) return;
      v3.copy(hoverTarget.p).project(H.camera);
      if (v3.z > 1) { hoverEl.style.opacity = 0; return; }
      hoverEl.style.opacity = 1;
      hoverEl.style.left = ((v3.x * 0.5 + 0.5) * innerWidth) + "px";
      hoverEl.style.top = ((-v3.y * 0.5 + 0.5) * innerHeight) + "px";
      hoverEl.innerHTML = `<b style="color:${hoverTarget.color || "#ffe49a"}">${esc(hoverTarget.title)}</b>` +
        (hoverTarget.cap ? `<i>${esc(hoverTarget.cap)}</i>` : "");
    }

    /* ---------- hints & ceremony ---------- */
    let hintTimer = null;
    function hint(text, sticky) {
      hintEl.innerHTML = text;
      hintEl.style.opacity = 1;
      clearTimeout(hintTimer);
      if (!sticky) hintTimer = setTimeout(() => hintEl.style.opacity = 0, 7000);
    }
    let ceremonyTimer = null;
    function ceremonyLine(text, hold) {
      ceremonyEl.textContent = text;
      ceremonyEl.classList.add("on");
      clearTimeout(ceremonyTimer);
      ceremonyTimer = setTimeout(() => ceremonyEl.classList.remove("on"), hold || 3800);
    }

    /* ---------- nav ---------- */
    document.querySelectorAll("#nav [data-station]").forEach(btn => {
      btn.onclick = () => H.goStation(btn.getAttribute("data-station"));
    });
    $("btn-mend").onclick = () => H.startCeremony();
    function setStation(name) {
      document.querySelectorAll("#nav [data-station]").forEach(b =>
        b.classList.toggle("on", b.getAttribute("data-station") === name));
    }

    H.ui = {
      openFigure, openTradition, openJoint, openSeam, close,
      setYear, setHover, tickHover, hint, ceremonyLine, setStation,
      isOpen: () => panel.classList.contains("open"),
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
