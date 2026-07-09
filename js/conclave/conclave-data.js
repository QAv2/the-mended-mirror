/* ============================================================================
   THE CONCLAVE OF BECOMING — the seating of the ages.
   ----------------------------------------------------------------------------
   Reads MIRROR_DATA (the lite core, read-only) and lays the lotus:

     · all 288 traditions on ONE rising golden-angle spiral, ordered by the
       age of the tradition — deep time seated nearest and lowest, the whorls
       climbing outward through the ages to the modern rim. Time is the
       architecture: to look up the bowl is to look toward now.
     · per-seat: azimuth, radius, height, scale, lean, color.
     · per-figure: degree (seam count), edge index both ways, seat lookup.

   Nothing here touches the corpus. The Mirror remains the Mirror.
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};
  const D = root.MIRROR_DATA;
  if (!D) { console.error("conclave: MIRROR_DATA missing"); return; }
  C.D = D;

  const GA = Math.PI * (3 - Math.sqrt(5));       // the golden angle

  /* ---- palette (the Hall's blood) ------------------------------------- */
  C.COL = {
    void:      0x06070b,                          // the Hall's obsidian, continued
    tierGold:  {                                  // wisps wear tier honesty
      "1": "#ffd86b", "2": "#e6ad44", "3": "#c19a52",
      "4": "#8f8c79", "forgery": "#6f7c4c",
    },
  };
  // prefer the corpus's own tier golds when present
  if (D.tiers) for (const k in C.COL.tierGold)
    if (D.tiers[k] && D.tiers[k].gold) C.COL.tierGold[k] = D.tiers[k].gold;

  /* ---- the seats -------------------------------------------------------- */
  function seatShape(n, N) {                       // n may run past N (ghosts)
    const t = n / Math.max(1, N - 1);
    return {
      az:    n * GA,                               // A0 applied below
      R:     14 + 92 * Math.pow(t, 0.70),
      Y:     1.6 + 46 * Math.pow(t, 1.22),
      scale: 3.1 + 5.2 * Math.pow(Math.min(t, 1.6), 0.85),
      lean:  0.20 + 0.55 * Math.min(t, 1.35),      // stadium rake, radians
    };
  }
  C.seatShape = seatShape;

  const trads = Object.keys(D.traditions).map(id => {
    const t = D.traditions[id];
    return { id, name: t.name || id, color: t.color || "#9aa3b2",
             region: t.region || "", period: t.period || {} };
  });
  trads.sort((a, b) => {
    const fa = Number.isFinite(a.period.from) ? a.period.from : 9e9;
    const fb = Number.isFinite(b.period.from) ? b.period.from : 9e9;
    return (fa - fb) || a.name.localeCompare(b.name);
  });

  const N = trads.length;
  // aim seat 0 dead ahead of the arrival gaze (bearing 0 = -Z, north)
  const A0 = 0;
  const seats = [], seatByTid = {};
  for (let n = 0; n < N; n++) {
    const s = seatShape(n, N), tr = trads[n];
    const h = hash01(tr.id);
    seats.push({
      n, tid: tr.id, name: tr.name, color: tr.color, period: tr.period,
      az: A0 + s.az + (h - 0.5) * 0.035,
      R: s.R * (1 + (hash01(tr.id + "r") - 0.5) * 0.05),
      Y: s.Y, scale: s.scale * (1 + (h - 0.5) * 0.08),
      lean: s.lean + (hash01(tr.id + "l") - 0.5) * 0.05,
      roll: (hash01(tr.id + "o") - 0.5) * 0.09,
    });
    seatByTid[tr.id] = seats[n];
  }

  /* ---- figures ---------------------------------------------------------- */
  const F = D.figures, E = D.edges;
  const figIndexById = {}, figsOfTrad = {};
  for (let i = 0; i < F.length; i++) {
    figIndexById[F[i].id] = i;
    (figsOfTrad[F[i].tradition] = figsOfTrad[F[i].tradition] || []).push(i);
  }
  const degree = new Float32Array(F.length);
  const edgesByFig = {};                            // fid -> [{other, type, tier, ei}]
  for (let ei = 0; ei < E.length; ei++) {
    const e = E[ei], ia = figIndexById[e.a], ib = figIndexById[e.b];
    if (ia === undefined || ib === undefined) continue;
    degree[ia]++; degree[ib]++;
    (edgesByFig[e.a] = edgesByFig[e.a] || []).push({ other: e.b, type: e.type, tier: e.tier || "4", ei });
    (edgesByFig[e.b] = edgesByFig[e.b] || []).push({ other: e.a, type: e.type, tier: e.tier || "4", ei });
  }
  let degMax = 1;
  for (let i = 0; i < F.length; i++) if (degree[i] > degMax) degMax = degree[i];

  // within each petal, hubs sit near the throat: order by degree, then name
  for (const tid in figsOfTrad)
    figsOfTrad[tid].sort((a, b) => (degree[b] - degree[a]) ||
      (F[a].name || "").localeCompare(F[b].name || ""));

  const archById = {};
  (D.archetypes || []).forEach(a => { archById[a.id] = a; });

  /* ---- helpers ----------------------------------------------------------- */
  function hash01(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 8) & 0xffff) / 0xffff;
  }
  function fmtYear(y) {
    if (!Number.isFinite(y)) return "";
    return y < 0 ? (-y).toLocaleString("en-US") + " BCE"
                 : y.toLocaleString("en-US") + " CE";
  }
  function fmtSpan(p) {
    if (!p || !Number.isFinite(p.from)) return "";
    const from = fmtYear(p.from);
    if (p.living || !Number.isFinite(p.to)) return from + " — now";
    return from + " — " + fmtYear(p.to);
  }

  C.M = { trads, seats, seatByTid, N,
          figIndexById, figsOfTrad, degree, degMax, edgesByFig, archById };
  C.hash01 = hash01;
  C.fmtSpan = fmtSpan;
  C.ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;   // easeInOutQuad — one home for the conclave's tweens
})(typeof window !== "undefined" ? window : globalThis);
