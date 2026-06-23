/* ============================================================================
   THE MENDED MIRROR — The Scroll of Ages (render skin over TemporalEngine).
   Scrub the era-banded ribbon; the moment's living shards constellate, the gold
   rivers run between them, and a seam flares at the year its blending happened.
   Reads window.MIRROR_DATA + window.TemporalEngine. Vanilla canvas, file://-safe.
   ============================================================================ */
(function () {
  "use strict";
  const D = window.MIRROR_DATA, TE = window.TemporalEngine;
  const canvas = document.getElementById("scroll-canvas"), ctx = canvas.getContext("2d");
  const TIERS = D.tiers, TRAD = D.traditions;

  /* ---- stable geography: each shard sits where its people are, and only fades
     in and out as you scrub — it never jumps. ---- */
  const REGIONS = {
    ancestral: { anchor: [0.30, 0.14], ids: ["pie", "castaneda"] },
    europe:    { anchor: [0.44, 0.30], ids: ["greek","roman","norse","celtic","slavic","baltic","finnish","etruscan","basque","sami"] },
    nearEast:  { anchor: [0.55, 0.45], ids: ["mesopotamian","canaanite","hittite","zoroastrian","arabian","abrahamic","gnostic"] },
    africa:    { anchor: [0.49, 0.70], ids: ["egyptian","yoruba","akan","dogon","igbo","kongo","fon","zulu","san","khoekhoe"] },
    asia:      { anchor: [0.76, 0.38], ids: ["vedic","dravidian","jain","buddhist","bon","chinese","korean","shinto","ainu","tengrist","dayak"] },
    pacific:   { anchor: [0.87, 0.70], ids: ["aboriginal","polynesian","hawaiian"] },
    americas:  { anchor: [0.14, 0.50], ids: ["mesoamerican","andean","lakota","navajo","haudenosaunee","inuit","pacificnw","pueblo","mapuche","tupi","taino"] }
  };
  const POS = {};
  Object.values(REGIONS).forEach(r => {
    const N = r.ids.length;
    r.ids.forEach((id, i) => {
      const ang = i * 2.39996323, rad = N > 1 ? 0.018 + 0.072 * Math.sqrt(i / (N - 1)) : 0;
      POS[id] = [r.anchor[0] + Math.cos(ang) * rad, r.anchor[1] + Math.sin(ang) * rad * 1.12];
    });
  });
  const figCount = {}; D.figures.forEach(f => { figCount[f.tradition] = (figCount[f.tradition] || 0) + 1; });

  /* ---- layout ---- */
  const DPR = Math.min(window.devicePixelRatio || 1, 2), RIBBON_H = 104, TOP_PAD = 92;
  let W = 0, H = 0, fieldH = 0;
  function resize() {
    W = window.innerWidth; H = window.innerHeight; fieldH = H - RIBBON_H - TOP_PAD;
    canvas.width = W * DPR; canvas.height = H * DPR;
  }
  window.addEventListener("resize", resize);
  function scr(id) { const p = POS[id]; return { x: p[0] * W, y: TOP_PAD + p[1] * fieldH }; }

  /* ---- state (t drives everything so the visual pace is even across the non-linear axis) ---- */
  let t = TE.yearToT(2026), playing = false, selected = null;
  const yearNow = () => TE.tToYear(t);

  function fmtYear(y) {
    if (y >= 2026) return "the present";
    const a = Math.abs(y).toLocaleString("en-US");
    return y < 0 ? a + " BCE" : a + " CE";
  }
  const TIER_W = { "1": 2.6, "2": 2.0, "3": 1.35, "4": 0.85, "forgery": 1.2 };

  /* ---- draw ---- */
  function draw() {
    const tNow = performance.now() / 1000;
    ctx.save(); ctx.scale(DPR, DPR);
    // vellum-in-shadow ground
    const g = ctx.createRadialGradient(W * 0.5, TOP_PAD + fieldH * 0.42, 40, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, "#1d160d"); g.addColorStop(0.55, "#120c07"); g.addColorStop(1, "#070503");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const S = TE.stateAt(yearNow());
    const firingSet = new Set(S.firing);

    /* gold rivers between living shards */
    TE.LINKS.forEach(L => {
      const A = S.traditions[L.a], B = S.traditions[L.b];
      if (!A || !B || A.status !== "alive" || B.status !== "alive") return;
      const a = scr(L.a), b = scr(L.b), tier = TIERS[L.bestTier] || TIERS["3"];
      const fire = firingSet.has(L);
      const lifeAlpha = Math.min(A.intensity, B.intensity);
      const pulse = fire ? 0.55 + 0.45 * Math.sin(tNow * 3) : 0;
      ctx.globalAlpha = Math.min(1, (0.05 + 0.16 * lifeAlpha) * (0.6 + (TIER_W[L.bestTier] || 1) * 0.3) + pulse * 0.8);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.07;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.lineWidth = (TIER_W[L.bestTier] || 1) * (fire ? 2.2 : 0.9);
      ctx.strokeStyle = tier.gold; ctx.shadowColor = tier.gold; ctx.shadowBlur = fire ? 16 : 4;
      ctx.stroke(); ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    /* firing captions — the blending event, named */
    S.firing.forEach(L => {
      const A = S.traditions[L.a], B = S.traditions[L.b];
      if (!A || !B || A.status !== "alive" || B.status !== "alive") return;
      const ev = L.events.reduce((best, e) => Math.abs(e.when - yearNow()) < Math.abs(best.when - yearNow()) ? e : best, L.events[0]);
      if (!ev || !ev.note) return;
      const a = scr(L.a), b = scr(L.b), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(tNow * 3));
      ctx.font = "italic 11px Spectral, Georgia, serif"; ctx.fillStyle = "#ffd86b"; ctx.textAlign = "center";
      ctx.fillText(trim(ev.note, 54), mx, my - 6);
      ctx.globalAlpha = 1;
    });

    /* shards */
    Object.values(S.traditions).forEach(tr => {
      const p = scr(tr.id), col = (TRAD[tr.id] && TRAD[tr.id].color) || "#caa", n = figCount[tr.id] || 4;
      const r = 3.4 + Math.sqrt(n) * 1.5;
      if (tr.status === "unborn") {                       // a faint pencil-ghost of what is to come
        ctx.globalAlpha = 0.06; ctx.fillStyle = "#cdbb95";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return;
      }
      if (tr.status === "ghost") {                        // sepia memory, sinking back into the page
        ctx.globalAlpha = tr.intensity; ctx.strokeStyle = "#7d6a48"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.8, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; return;
      }
      // alive — burning gold
      ctx.globalAlpha = 1;
      const gg = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, r * 2.6);
      gg.addColorStop(0, "rgba(255,236,180," + (0.5 * tr.intensity) + ")");
      gg.addColorStop(1, "rgba(230,173,68,0)");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.6, 0, 7); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(255,216,107," + (0.35 + 0.55 * tr.intensity) + ")"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.stroke();
      if (selected === tr.id) { ctx.strokeStyle = "#fff7e0"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, 0, 7); ctx.stroke(); }
      ctx.font = "12px Marcellus, Georgia, serif"; ctx.fillStyle = "rgba(233,220,192," + (0.45 + 0.55 * tr.intensity) + ")";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,.85)"; ctx.shadowBlur = 5;
      ctx.fillText(TRAD[tr.id].name, p.x, p.y + r + 4); ctx.shadowBlur = 0;
    });

    drawRibbon(S, tNow);
    drawReadout(S);
    ctx.restore();
    requestAnimationFrame(draw);
    if (playing) { t += 0.00085; if (t >= 1) { t = 1; playing = false; syncPlay(); } }
  }

  function drawRibbon(S, tNow) {
    const y0 = H - RIBBON_H, n = TE.ERAS.length;
    ctx.fillStyle = "#0b0805"; ctx.fillRect(0, y0, W, RIBBON_H);
    ctx.strokeStyle = "rgba(230,173,68,.22)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y0 + .5); ctx.lineTo(W, y0 + .5); ctx.stroke();
    // the Axial Age glow
    TE.HIGHLIGHTS.forEach(h => {
      const x1 = TE.yearToT(h.from) * W, x2 = TE.yearToT(h.to) * W;
      const hg = ctx.createLinearGradient(x1, 0, x2, 0);
      hg.addColorStop(0, "rgba(255,216,107,0)"); hg.addColorStop(.5, "rgba(255,216,107,.16)"); hg.addColorStop(1, "rgba(255,216,107,0)");
      ctx.fillStyle = hg; ctx.fillRect(x1, y0, x2 - x1, RIBBON_H);
    });
    // era bands
    TE.ERAS.forEach((e, i) => {
      const x = (i / n) * W, w = W / n;
      if (i % 2) { ctx.fillStyle = "rgba(255,240,210,.022)"; ctx.fillRect(x, y0, w, RIBBON_H); }
      ctx.strokeStyle = "rgba(230,173,68,.14)"; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, H); ctx.stroke();
      ctx.font = "12px Marcellus, Georgia, serif"; ctx.fillStyle = "#b6a883"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(e.name, x + w / 2, y0 + RIBBON_H - 30);
      ctx.font = "italic 10px Spectral, Georgia, serif"; ctx.fillStyle = "#6f5f42";
      ctx.fillText(eraSpan(e), x + w / 2, y0 + RIBBON_H - 14);
    });
    // now-line
    const nx = t * W;
    ctx.strokeStyle = "rgba(255,216,107,.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(nx, TOP_PAD * 0.5); ctx.lineTo(nx, y0); ctx.stroke();
    ctx.strokeStyle = "#ffd86b"; ctx.lineWidth = 2; ctx.shadowColor = "#ffd86b"; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(nx, y0); ctx.lineTo(nx, H); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffd86b"; ctx.beginPath(); ctx.moveTo(nx, y0); ctx.lineTo(nx - 6, y0 - 8); ctx.lineTo(nx + 6, y0 - 8); ctx.closePath(); ctx.fill();
  }

  function drawReadout(S) {
    ctx.textAlign = "center";
    ctx.font = "34px Marcellus, Georgia, serif"; ctx.fillStyle = "#e9dcc0";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(fmtYear(yearNow()), W / 2, 44);
    let sub = (S.era ? S.era.name : "") + "  ·  " + S.aliveCount + " shard" + (S.aliveCount === 1 ? "" : "s") + " alive";
    if (S.highlight) sub = "✦ " + S.highlight.name + "  ·  " + sub;
    ctx.font = "italic 13px Spectral, Georgia, serif"; ctx.fillStyle = S.highlight ? "#ffd86b" : "#9c8f6f";
    ctx.fillText(sub, W / 2, 66);
  }

  function eraSpan(e) {
    const f = e.from <= -1000 ? Math.round(-e.from / 1000) + "k BCE" : e.from < 0 ? -e.from + " BCE" : e.from === 2026 ? "now" : e.from + " CE";
    return f;
  }
  function trim(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* ---- scrubbing ---- */
  function setFromX(x) { t = Math.max(0, Math.min(1, x / W)); }
  let dragging = false;
  canvas.addEventListener("mousedown", ev => {
    if (ev.clientY > H - RIBBON_H - 12) { dragging = true; setFromX(ev.clientX); playing = false; syncPlay(); }
    else { const id = hit(ev.clientX, ev.clientY); if (id) { selected = id; openPanel(id); } else closePanel(); }
  });
  window.addEventListener("mousemove", ev => { if (dragging) setFromX(ev.clientX); });
  window.addEventListener("mouseup", () => { dragging = false; });
  window.addEventListener("keydown", ev => {
    if (ev.key === "ArrowRight") { t = Math.min(1, t + 0.004); playing = false; syncPlay(); }
    else if (ev.key === "ArrowLeft") { t = Math.max(0, t - 0.004); playing = false; syncPlay(); }
    else if (ev.key === " ") { ev.preventDefault(); playing = !playing; syncPlay(); }
  });
  function hit(sx, sy) {
    const S = TE.stateAt(yearNow()); let best = null, bd = 1e9;
    Object.values(S.traditions).forEach(tr => {
      if (tr.status === "unborn") return;
      const p = scr(tr.id), d = (p.x - sx) ** 2 + (p.y - sy) ** 2, r = (3.4 + Math.sqrt(figCount[tr.id] || 4) * 1.5) + 8;
      if (d < r * r && d < bd) { best = tr.id; bd = d; }
    });
    return best;
  }

  /* ---- reliquary panel ---- */
  const panel = document.getElementById("reliquary");
  function esc(s) { return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
  const CERT_COL = { attested: "#7fae6a", inferred: "#c19a52", reconstructed: "#8fb3c9", contested: "#cf6b52", deep: "#a87fb0", prophesied: "#e0857f" };
  function openPanel(id) {
    const tr = TRAD[id], p = tr.period, y = yearNow();
    const status = y < p.from ? "not yet — first appears " + fmtYear(p.from)
      : y > p.to ? "ended " + fmtYear(p.to) + (p.living ? "" : " — a ghost now")
        : "alive at this moment";
    const span = fmtYear(p.from) + "  →  " + (p.to >= 2026 ? "present" : fmtYear(p.to)) + (p.living ? "  · living" : "");
    panel.innerHTML =
      '<button id="rel-close">×</button>' +
      '<div class="kick">' + esc(tr.region || "") + "  ·  shard</div>" +
      "<h2>" + esc(tr.name) + "</h2>" +
      '<div class="span">' + esc(span) + "</div>" +
      '<span class="chip" style="--c:' + (CERT_COL[p.certainty] || "#999") + '">' + esc(p.certainty) + "</span>" +
      '<span class="chip" style="--c:#e6ad44">' + esc(status) + "</span>" +
      '<p class="note">' + esc(p.note || "") + "</p>";
    panel.classList.add("open");
    document.getElementById("rel-close").onclick = closePanel;
  }
  function closePanel() { panel.classList.remove("open"); selected = null; }

  /* ---- controls ---- */
  const playBtn = document.getElementById("play");
  function syncPlay() { playBtn.innerHTML = playing ? "&#10073;&#10073;" : "&#9655;"; }
  playBtn.onclick = () => { if (t >= 1) t = 0; playing = !playing; syncPlay(); };
  document.querySelectorAll("#controls [data-go]").forEach(b =>
    b.onclick = () => { t = TE.yearToT(parseInt(b.getAttribute("data-go"), 10)); playing = false; syncPlay(); });

  window.__goto = y => { t = TE.yearToT(y); playing = false; syncPlay(); }; // test/debug hook

  resize();
  requestAnimationFrame(draw);
})();
