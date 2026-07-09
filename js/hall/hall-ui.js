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

    function esc(s) { return (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
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

    /* ---------- a visitor's own progress, kept in their own browser ----------
       localStorage only — the same store the threshold uses to remember a
       returning visitor (mm-approached). Nothing leaves the machine; there is
       no server to leave to. Three keys hold what a walk earns: the trail
       walked (mm-trail), the systems read (mm-read), the records starred
       (mm-stars). Private mode and a full quota degrade to "this session only"
       without ceremony. Refs are STABLE ids (figure.id, tradition key,
       archetype id), not array indices — so a saved star still points at the
       same god after the data is rebuilt and reordered. */
    const store = {
      get(k, fb) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch (e) { return fb; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode / quota */ } },
    };
    let stars = store.get("mm-stars", []);            // [{type, id, label}]
    let readSet = new Set(store.get("mm-read", []));  // tradition keys whose reliquary has been opened
    let shownRecord = null;                           // the starrable record on show now (null for seams / placeholders)

    function starKey(r) { return r.type + ":" + r.id; }
    function isStarred(r) { const k = starKey(r); return stars.some(s => starKey(s) === k); }
    function toggleStar(r) {
      const k = starKey(r);
      const i = stars.findIndex(s => starKey(s) === k);
      if (i >= 0) stars.splice(i, 1);
      else stars.push({ type: r.type, id: r.id, label: r.label });
      store.set("mm-stars", stars);
      renderStars();          // repaint the favorites pane
      refreshOpenStar();      // and the ★/☆ in the open reliquary
    }
    function refreshOpenStar() {
      const sb = $("rel-star");
      if (!sb || !shownRecord) return;
      const on = isStarred(shownRecord);
      sb.textContent = on ? "★" : "☆";
      sb.classList.toggle("on", on);
    }

    /* ---------- legend (lives on the gate now — Joe: keep the hall clear) ---------- */
    (function () {
      const wrap = $("legend-tiers");
      if (!wrap) return;
      ["1", "2", "3", "4", "forgery"].forEach(k => {
        const t = D.tiers[k];
        if (!t) return;
        const el = document.createElement("div");
        el.className = "tier-row";
        el.title = t.desc;                 // the chip carries its meaning on hover
        el.innerHTML = `<span class="tier-chip" style="--c:${t.gold}">${t.name}</span><span class="tier-desc">${esc(t.desc)}</span>`;
        wrap.appendChild(el);
      });
    })();

    /* ---------- reliquary views ---------- */
    let openToken = 0;
    function show(html, record) {
      shownRecord = record || null;                 // seams and the "unsealing…" placeholder pass none — no star
      const star = record ? `<button id="rel-star" aria-label="bookmark this record" title="bookmark this — keep it in your favorites">☆</button>` : "";
      panel.innerHTML = `<button id="rel-close" aria-label="close">×</button>` + star + html;
      panel.classList.add("open");
      panel.scrollTop = 0;
      $("rel-close").onclick = () => { close(); if (H.onPanelClose) H.onPanelClose(); };
      if (record) { $("rel-star").onclick = () => toggleStar(record); refreshOpenStar(); }
      panel.querySelectorAll("[data-jf]").forEach(el => el.onclick = () => H.jump.figure(+el.getAttribute("data-jf")));
      panel.querySelectorAll("[data-jt]").forEach(el => el.onclick = () => H.jump.tradition(el.getAttribute("data-jt")));
      panel.querySelectorAll("[data-jj]").forEach(el => el.onclick = () => H.jump.joint(+el.getAttribute("data-jj")));
    }
    function close() { openToken++; panel.classList.remove("open"); }   // claim the token: an in-flight chunk must not reopen a closed panel

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
       fetch is still in the air. EVERY open claims the token (and close does
       too), so a slow chunk can neither repaint a panel the visitor has moved
       past nor reopen one they closed. If the fetch outlasts the patience,
       the lite fields render honestly and the chunk upgrades them in place. */
    function gated(ids, render) {
      const tok = ++openToken;
      if (!HALL.chunks || HALL.chunks.ready(ids)) { render(); return; }
      show(`<div class="rel-kicker">unsealing the record…</div>`);
      let rendered = false;
      const fire = () => { if (tok === openToken) { rendered = true; render(); } };
      const slow = setTimeout(() => { if (!rendered) fire(); }, 4000);
      HALL.chunks.ensure(ids).then(() => { clearTimeout(slow); fire(); });
    }
    /* a panel's jump links are one click from other traditions — warm those */
    function prefetchPartners(ts) {
      if (HALL.chunks && ts.length) HALL.chunks.prefetch(ts);
    }
    function openFigure(fi) {
      const f = D.figures[fi];
      recordTrail("figure", f.id, f.name);          // stable id, not the array index
      gated([f.tradition], () => renderFigure(fi));
      const seen = {}, ts = [];
      for (const ei of M.edgesOfFig[fi]) {
        const e = D.edges[ei];
        const oi = M.figById[e.a === f.id ? e.b : e.a];
        if (oi === undefined) continue;
        const t = D.figures[oi].tradition;
        if (t !== f.tradition && !seen[t]) { seen[t] = 1; ts.push(t); if (ts.length >= 8) break; }
      }
      prefetchPartners(ts);
    }
    function openTradition(k) {
      recordTrail("tradition", k, (D.traditions[k] || {}).name || k);
      markSystem(k);
      markRead(k);          // opening its reliquary is reading it — dim its name in the rail
      gated([k], () => renderTradition(k));
      const partners = [];
      for (const key in M.pairAgg) {
        const cut = key.indexOf("|");
        const a = key.slice(0, cut), b = key.slice(cut + 1);
        if (a === k || b === k) partners.push({ o: a === k ? b : a, g: M.pairAgg[key] });
      }
      partners.sort((x, y) => (y.g.bestW * y.g.count) - (x.g.bestW * x.g.count));
      prefetchPartners(partners.slice(0, 6).map(p => p.o));
    }
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
      show(h, { type: "figure", id: f.id, label: f.name });
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
        /* sources: a citation becomes a link ONLY when the chunk carries a
           verified URL for it (data/_link sidecars, matched verbatim) — an
           anchor and a small access badge; everything else stays honest
           plain text. No dead links, no placeholders. */
        if (dos.sources && dos.sources.length) {
          const byCite = {};
          ((root.MIRROR_LINKS && root.MIRROR_LINKS[k]) || []).forEach(l => {
            if (l && l.cite && l.url) byCite[l.cite] = l;
          });
          h += `<h3>Sources</h3><p class="rel-prov">` + dos.sources.map(s => {
            const l = byCite[s];
            if (!l) return esc(s);
            return `<a class="rel-src" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(s)}</a>` +
                   `<span class="rel-access">${esc(l.access || "reference")}</span>`;
          }).join(" · ") + `</p>`;
        }
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
      show(h, { type: "tradition", id: k, label: t.name });
    }

    function openJoint(ji) {
      const a = M.joints[ji].a;
      recordTrail("joint", a.id, a.name);           // stable archetype id, not the joint index
      gated([], () => renderJoint(ji));                              // no chunk needed; claims the token
    }
    function renderJoint(ji) {
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
      show(h, { type: "joint", id: a.id, label: a.name });
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
      if (!yearEl) return;   // the readout is retired (Joe) — the wall and rim carry the years
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

    /* ---------- the seeker: every name in the mirror, one field ----------
       Traditions, archetypes, figures — 4,400+ names from the lite core, no
       chunk needed. A hit rides the existing jump flights: the camera goes,
       the panel opens, the selection lights. "/" summons it. */
    (function () {
      const input = $("search-input"), box = $("search-results");
      if (!input) return;
      const idx = [];
      Object.keys(D.traditions).forEach(k =>
        idx.push({ n: D.traditions[k].name, l: D.traditions[k].name.toLowerCase(), kind: "tradition", k }));
      M.joints.forEach((j, ji) =>
        idx.push({ n: j.a.name, l: j.a.name.toLowerCase(), kind: "archetype", ji }));
      D.figures.forEach((f, fi) => {
        const t = D.traditions[f.tradition];
        idx.push({ n: f.name, l: f.name.toLowerCase(), kind: "figure", fi, sub: t ? t.name : "" });
      });
      function score(e, q) {
        const i = e.l.indexOf(q);
        if (i < 0) return -1;
        if (i === 0) return 0;                                    // the name begins with it
        if (e.l[i - 1] === " " || e.l[i - 1] === "-") return 1;   // a word begins with it
        return 2;
      }
      const KIND_W = { tradition: 0, archetype: 1, figure: 2 };
      let items = [], hot = -1;
      function render() {
        box.innerHTML = items.map((e, i) =>
          `<div class="search-hit${i === hot ? " hot" : ""}" data-i="${i}"><b>${esc(e.n)}</b><span>${esc(e.sub || e.kind)}</span></div>`).join("");
        box.classList.toggle("open", items.length > 0);
        box.querySelectorAll(".search-hit").forEach(el => {
          el.onpointerdown = ev => { ev.preventDefault(); go(+el.getAttribute("data-i")); };
        });
      }
      function go(i) {
        const e = items[i];
        if (!e) return;
        input.value = ""; items = []; hot = -1; render(); input.blur();
        if (e.kind === "tradition") H.jump.tradition(e.k);
        else if (e.kind === "archetype") H.jump.joint(e.ji);
        else H.jump.figure(e.fi);
      }
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        hot = -1;
        if (q.length < 2) { items = []; render(); return; }
        items = idx.map(e => ({ e, s: score(e, q) }))
          .filter(x => x.s >= 0)
          .sort((a, b) => (a.s - b.s) || (KIND_W[a.e.kind] - KIND_W[b.e.kind]) || (a.e.n.length - b.e.n.length))
          .slice(0, 12).map(x => x.e);
        hot = items.length ? 0 : -1;
        render();
      });
      input.addEventListener("keydown", ev => {
        if (ev.key === "ArrowDown") { hot = Math.min(items.length - 1, hot + 1); render(); ev.preventDefault(); }
        else if (ev.key === "ArrowUp") { hot = Math.max(0, hot - 1); render(); ev.preventDefault(); }
        else if (ev.key === "Enter") { go(hot >= 0 ? hot : 0); ev.preventDefault(); }
        else if (ev.key === "Escape") { input.value = ""; items = []; render(); input.blur(); }
        ev.stopPropagation();          // typing must never walk the room
      });
      input.addEventListener("blur", () => setTimeout(() => { items = []; render(); }, 150));
      addEventListener("keydown", ev => {
        if (ev.key === "/" && document.activeElement !== input) { ev.preventDefault(); input.focus(); }
      });
    })();

    /* ---------- the trail: the path the seeker has walked ----------
       Every record the visitor lands on flows through open{Figure,Tradition,
       Joint} — whether summoned by the seeker, followed from a reliquary jump,
       or lit by a gleam clicked in the hall. We tap that one choke: each
       landing lays a crumb (an immediate repeat is swallowed). The path is a
       PERSISTENT ledger: a crumb clicked flies the camera back there and lights
       it as "you are here", but the walk ahead of it STAYS — nothing prunes it.
       The only way the trail empties is the seeker asking, with the × glyph at
       its end (clearTrail). The walk survives the visit (mm-trail). Figures,
       traditions, archetypes only; each re-rides its H.jump flight. Seams stay
       off the path (they are a relation between two names, not a place). */
    const trailEl = $("search-trail");
    let trail = store.get("mm-trail", []);                  // the walk survives the visit
    let cur = trail.length - 1;         // the crumb the seeker stands on now (lit "you are here"); -1 when empty
    let resumable = trail.length > 0;   // a restored trail = somewhere to return to, until they move again
    let jumping = false;                // true only while a clicked crumb flies the camera — swallows the echo landing
    const TRAIL_MAX = 12;
    function sameCrumb(a, b) { return a && b && a.type === b.type && a.ref === b.ref; }
    function recordTrail(type, ref, label) {
      if (!trailEl) return;
      if (jumping) return;               // the seeker clicked a crumb; cur is already set and the ledger must not grow
      resumable = false;                 // a live landing means they are no longer "picking up where they left off"
      const node = { type, ref, label };
      if (sameCrumb(trail[trail.length - 1], node)) { cur = trail.length - 1; renderTrail(); return; }  // already standing here
      trail.push(node);
      if (trail.length > TRAIL_MAX) trail.shift();
      cur = trail.length - 1;
      store.set("mm-trail", trail);
      renderTrail();
    }
    function jumpTrail(i) {               // refs are stable ids — resolve to the current index at click time
      const n = trail[i];
      if (!n) return;
      cur = i; resumable = false;
      renderTrail();                      // light the crumb we are flying to, before the flight
      jumping = true;                     // the open{…} this triggers is an echo of a place already on the path, not a new step
      if (n.type === "figure") { const fi = M.figById[n.ref]; if (fi !== undefined) H.jump.figure(fi); }
      else if (n.type === "tradition") H.jump.tradition(n.ref);
      else if (n.type === "joint") { const ji = M.jointById[n.ref]; if (ji !== undefined) H.jump.joint(ji); }
      jumping = false;
    }
    function clearTrail() {               // the one manual way to empty a persistent trail
      trail = []; cur = -1; resumable = false;
      store.set("mm-trail", []);
      renderTrail();                      // empty → the bar folds away
    }
    function renderTrail() {
      if (!trailEl) return;
      if (!trail.length) { trailEl.className = ""; trailEl.innerHTML = ""; return; }
      const last = trail.length - 1;
      if (cur > last || cur < 0) cur = last;   // guard after a shift
      trailEl.className = "on";
      const path = trail.map((n, i) => {
        let crumb;
        if (resumable && i === last) {
          // where you left off: the restored tail is a one-tap way back, until they move
          crumb = `<span class="trail-current resume" data-resume title="return to where you left off">${esc(n.label)}</span>`;
        } else if (i === cur) {
          crumb = `<span class="trail-current" title="you are here">${esc(n.label)}</span>`;   // inert: the place you stand
        } else {
          crumb = `<span class="trail-crumb" data-i="${i}">${esc(n.label)}</span>`;            // click to fly back, path intact
        }
        return (i ? `<span class="trail-sep">&rsaquo;</span>` : "") + crumb;
      }).join("");
      trailEl.innerHTML = path + `<button type="button" class="trail-clear" data-clear title="clear the trail" aria-label="clear the trail">&times;</button>`;
      trailEl.querySelectorAll(".trail-crumb[data-i]").forEach(el => {
        el.onclick = () => jumpTrail(+el.getAttribute("data-i"));
      });
      const rc = trailEl.querySelector("[data-resume]");
      if (rc) rc.onclick = () => jumpTrail(last);
      const cl = trailEl.querySelector("[data-clear]");
      if (cl) cl.onclick = clearTrail;
    }

    /* ---------- the roll of systems: every shard by name, one pane ----------
       The early console's left rail, brought home: the whole roster of
       traditions in a single scrollable column, folded shut until wanted. A
       dot carries each shard's colour; a name clicked flies to its shard (and
       openTradition lights the row). Landing on a tradition by any road — the
       seeker, a gleam, a jump-link — lights it here too. */
    const sysListEl = $("systems-list"), sysCountEl = $("sys-count");
    const sysRowByKey = {};
    let sysActive = null;
    (function buildRoll() {
      if (!sysListEl) return;
      const keys = Object.keys(D.traditions).sort((a, b) =>
        ((D.traditions[a] || {}).name || a).localeCompare((D.traditions[b] || {}).name || b));
      if (sysCountEl) sysCountEl.textContent = String(keys.length);
      const frag = document.createDocumentFragment();
      keys.forEach(k => {
        const t = D.traditions[k] || {};
        const b = document.createElement("button");
        b.className = "sys-item";
        b.type = "button";
        b.setAttribute("role", "listitem");
        b.innerHTML = `<i style="background:${t.color || "#8a8f9c"}"></i><span>${esc(t.name || k)}</span>`;
        b.title = t.region ? (t.name || k) + " · " + t.region : (t.name || k);
        b.onclick = () => H.jump.tradition(k);        // the flight lights the row through openTradition
        if (readSet.has(k)) b.classList.add("read");  // a system read on a past visit stays dimmed
        sysRowByKey[k] = b;
        frag.appendChild(b);
      });
      sysListEl.appendChild(frag);
    })();
    function markSystem(k) {
      if (sysActive && sysRowByKey[sysActive]) sysRowByKey[sysActive].classList.remove("on");
      sysActive = k;
      const row = sysRowByKey[k];
      if (!row) return;
      row.classList.add("on");
      const det = document.getElementById("systems");
      if (det && det.open) row.scrollIntoView({ block: "nearest" });   // walk the rail to the lit name
    }
    function markRead(k) {                 // called when a tradition's reliquary opens; idempotent
      if (readSet.has(k)) return;
      readSet.add(k);
      store.set("mm-read", Array.from(readSet));
      const row = sysRowByKey[k];
      if (row) row.classList.add("read");
    }

    /* ---------- your favorites: the stars you drop, one pane ----------
       The bookmarks a visitor leaves — figures, systems, archetypes — gathered
       in a pane that mirrors the roll of systems (bottom-left, same family).
       Shown only once there is something in it. A row flies you to the record;
       its × lets it go. The ★/☆ in the reliquary and this list stay in step. */
    const favEl = $("favorites"), favListEl = $("favorites-list"), favCountEl = $("fav-count");
    function openStar(s) {
      if (s.type === "figure") { const fi = M.figById[s.id]; if (fi !== undefined) H.jump.figure(fi); }
      else if (s.type === "tradition") H.jump.tradition(s.id);
      else if (s.type === "joint") { const ji = M.jointById[s.id]; if (ji !== undefined) H.jump.joint(ji); }
    }
    function removeStar(i) {
      stars.splice(i, 1);
      store.set("mm-stars", stars);
      renderStars();
      refreshOpenStar();      // if that record is on show, flip its ★ back to ☆
    }
    function renderStars() {
      if (!favEl) return;
      favEl.classList.toggle("has-stars", stars.length > 0);   // the pane appears only when it holds something
      if (favCountEl) favCountEl.textContent = String(stars.length);
      if (!favListEl) return;
      favListEl.innerHTML = "";
      const frag = document.createDocumentFragment();
      stars.forEach((s, i) => {
        const kind = s.type === "joint" ? "archetype" : s.type;
        const row = document.createElement("div");
        row.className = "fav-item";
        row.setAttribute("role", "listitem");
        row.innerHTML = `<span class="fav-star">★</span><span class="fav-name">${esc(s.label)}</span>` +
          `<span class="fav-kind">${esc(kind)}</span><button class="fav-remove" aria-label="remove from favorites" title="remove">×</button>`;
        row.onclick = () => openStar(s);
        row.querySelector(".fav-remove").onclick = ev => { ev.stopPropagation(); removeStar(i); };
        frag.appendChild(row);
      });
      favListEl.appendChild(frag);
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

    /* paint whatever a previous visit left behind (read-marks ride buildRoll above) */
    renderTrail();
    renderStars();

    H.ui = {
      openFigure, openTradition, openJoint, openSeam, close,
      setYear, setHover, tickHover, hint, ceremonyLine, setStation,
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
