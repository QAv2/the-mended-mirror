/* ============================================================================
   THE MENDED MIRROR · THE HALL OF AGES — the data heart.
   ----------------------------------------------------------------------------
   Turns MIRROR_DATA into the geometry of the shattered mirror:
   a radial fracture of 219 shards whose RINGS ARE RINGS OF TIME — the mirror
   shattered outward from the deep past, and mending it replays history.

     · ring        = the era a tradition was born into (oldest at the center)
     · angle       = the world: traditions sit near their earthly longitude,
                     then slide toward the traditions they actually converge with
     · shard size  = how many figures the tradition carries
     · gold crack  = a real aggregate seam between neighbours (tiered)
     · dark crack  = an honest absence — adjacency without convergence

   Pure math, no THREE — runs in node for testing and in the browser for real.
   Deterministic (seeded RNG): the mirror always shatters the same way.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  /* ---------- deterministic RNG ---------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- the eras (source of record: data/_temporal.json) ---------- */
  const ERAS = [
    { id: "deep-time",      name: "Deep Time",           from: -50000, to: -10000, w: 0.050 },
    { id: "neolithic",      name: "Neolithic",           from: -10000, to: -3300,  w: 0.085 },
    { id: "bronze",         name: "Bronze Age",          from: -3300,  to: -1200,  w: 0.130 },
    { id: "iron-axial",     name: "Iron & Axial Age",    from: -1200,  to: -300,   w: 0.150 },
    { id: "classical",      name: "Classical Antiquity", from: -300,   to: 300,    w: 0.140 },
    { id: "late-antiquity", name: "Late Antiquity",      from: 300,    to: 700,    w: 0.100 },
    { id: "medieval",       name: "Medieval",            from: 700,    to: 1500,   w: 0.140 },
    { id: "modern",         name: "Modern",              from: 1500,   to: 2026,   w: 0.205 },
  ];
  const NOW = 2026;
  const FUTURE_TO = 2369;   // the prophesied reach (wall only; the rule stops at NOW)

  /* time <-> param 0..1, piecewise by era weight (compresses the deep past) */
  function makeTimeMap() {
    const stops = [];               // {t, year}
    let acc = 0;
    stops.push({ t: 0, year: ERAS[0].from });
    for (const e of ERAS) { acc += e.w; stops.push({ t: acc, year: e.to }); }
    const tMax = acc;               // ~1.0
    function yearToT(y) {
      y = Math.max(ERAS[0].from, Math.min(NOW, y));
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i], b = stops[i + 1];
        if (y <= b.year) return (a.t + (b.t - a.t) * ((y - a.year) / (b.year - a.year))) / tMax;
      }
      return 1;
    }
    function tToYear(t) {
      t = Math.max(0, Math.min(1, t)) * tMax;
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i], b = stops[i + 1];
        if (t <= b.t) return a.year + (b.year - a.year) * ((t - a.t) / (b.t - a.t));
      }
      return NOW;
    }
    function eraOfYear(y) {
      for (const e of ERAS) if (y >= e.from && y <= e.to) return e;
      return y < ERAS[0].from ? ERAS[0] : ERAS[ERAS.length - 1];
    }
    return { yearToT, tToYear, eraOfYear };
  }

  /* ---------- the world's longitudes (angle = where on Earth) ---------- */
  /* keyword → approximate homeland longitude, scanned in order; first hit wins */
  const LON_TABLE = [
    ["hawai", -157], ["polynes", -150], ["easter island", -109],
    ["alaska", -150], ["nw coast", -128], ["california", -120], ["great basin", -114],
    ["southwest", -108], ["mesa", -108], ["plains", -100], ["detroit", -83],
    ["appalachia", -83], ["us south", -88], ["gulf coast", -90], ["cahokia", -90],
    ["great lakes", -85], ["northeast", -74], ["salem", -71], ["hydesville", -77],
    ["usa", -95], ["mexico", -99], ["maya", -89], ["yucat", -89], ["oaxaca", -96],
    ["aztec", -99], ["carib", -72], ["cuba", -79], ["havana", -82], ["jamaica", -77],
    ["haiti", -72], ["trinidad", -61], ["hispaniola", -71], ["antilles", -70],
    ["colombia", -74], ["peru", -75], ["bolivia", -66], ["andes", -70],
    ["amazon", -62], ["brazil", -47], ["bahia", -38], ["rio", -43],
    ["paraguay", -57], ["tierra del fuego", -68], ["araucan", -72], ["chile", -71],
    ["suriname", -56], ["canary", -16], ["iceland", -19], ["ireland", -8],
    ["british", -3], ["britain", -2], ["uk", -2], ["london", 0], ["scotland", -4],
    ["france", 2], ["provence", 5], ["iberia", -5], ["spain", -4], ["pyrenees", -1],
    ["basque", -2], ["portugal", -8], ["w iberia", -8], ["morocco", -7],
    ["maghreb", 2], ["atlas", -5], ["senegal", -15], ["gambia", -15], ["mali", -4],
    ["ghana", -1], ["togo", 1], ["benin", 2], ["yoruba", 4], ["nigeria", 7],
    ["germany", 10], ["switzerland", 8], ["italy", 12], ["rome", 12], ["roman", 13],
    ["croton", 17], ["etrusc", 11], ["carthage", 10], ["w balkans", 19],
    ["scandi", 15], ["norse", 10], ["northern europe", 12], ["sweden", 15],
    ["sápmi", 22], ["sapmi", 22], ["fennoscandia", 25], ["finn", 26],
    ["eastern europe", 30], ["slav", 30], ["baltic", 24], ["thrace", 25],
    ["greece", 22], ["greek", 23], ["crete", 25], ["eleusis", 23], ["athens", 23],
    ["aegean", 25], ["macedon", 22], ["anatolia", 32], ["phrygia", 31],
    ["hattus", 34], ["hittite", 34], ["armenian", 44], ["cauc", 44],
    ["egypt", 31], ["nile", 31], ["alexandria", 30], ["sudan", 32], ["meroe", 33],
    ["napata", 31], ["ethiopia", 39], ["kenya", 37], ["uganda", 32], ["tanzania", 35],
    ["malawi", 34], ["zambia", 28], ["zimbabwe", 30], ["congo", 22], ["gabon", 12],
    ["central africa", 20], ["kalahari", 21], ["botswana", 24], ["lesotho", 28],
    ["southern africa", 24], ["cape", 19], ["namaqua", 18],
    ["levant", 35], ["syria", 37], ["ugarit", 36], ["canaan", 35], ["israel", 35],
    ["palestine", 35], ["gerizim", 35], ["phoenicia", 35], ["harran", 39],
    ["mesopotamia", 44], ["sumer", 46], ["babylon", 44], ["akkad", 44],
    ["fertile crescent", 42], ["kurdistan", 44], ["lalish", 43], ["yezid", 43],
    ["arabia", 45], ["arabian", 45], ["susa", 48], ["elam", 48], ["iran", 53],
    ["persia", 53], ["kermanshah", 47], ["sasanian", 48], ["zoroast", 53],
    ["steppe", 45], ["pontic", 40], ["scyth", 40],
    ["indus", 70], ["punjab", 75], ["chitral", 72], ["kalash", 72],
    ["south asia", 78], ["india", 78], ["vedic", 77], ["bengal", 88], ["assam", 92],
    ["tamil", 79], ["karnataka", 76], ["chota nagpur", 85], ["tibet", 88],
    ["zhang-zhung", 82], ["himalaya", 85], ["central asia", 65], ["siberia", 95],
    ["mongol", 104], ["baikal", 108], ["sakha", 128], ["lena", 128],
    ["ob-irtysh", 70], ["w siberia", 70], ["chukotka", 172], ["kamchatka", 159],
    ["arctic", -95], ["greenland", -42], ["myanmar", 96], ["thailand", 101],
    ["laos", 103], ["cambodia", 105], ["vietnam", 106], ["tây ninh", 106],
    ["china", 110], ["taiwan", 121], ["e asia", 115], ["east asia", 114],
    ["korea", 127], ["japan", 138], ["hokkaid", 143], ["ainu", 143], ["sakhalin", 143],
    ["borneo", 114], ["kalimantan", 114], ["java", 110], ["sumatra", 101],
    ["sulawesi", 120], ["sumba", 120], ["bali", 115], ["indonesia", 113],
    ["philippin", 122], ["new guinea", 145], ["png", 147], ["vanuatu", 167],
    ["solomon", 160], ["caledonia", 165], ["fiji", 178], ["melanesia", 160],
    ["caroline", 150], ["mariana", 145], ["micronesia", 150],
    ["australia", 134], ["oceania", 160],
  ];
  function regionLongitude(region, name) {
    const s = ((region || "") + " " + (name || "")).toLowerCase();
    for (const [kw, lon] of LON_TABLE) if (s.indexOf(kw) !== -1) return lon;
    return null;   // diffuse / global / reconstructed → no earthly pull
  }

  /* ---------- circular helpers ---------- */
  const TAU = Math.PI * 2;
  function wrap(a) { a = a % TAU; return a < 0 ? a + TAU : a; }
  function circDist(a, b) { const d = Math.abs(wrap(a) - wrap(b)); return Math.min(d, TAU - d); }
  function circMean(angles, weights) {
    let sx = 0, sy = 0;
    for (let i = 0; i < angles.length; i++) { sx += Math.cos(angles[i]) * weights[i]; sy += Math.sin(angles[i]) * weights[i]; }
    if (sx === 0 && sy === 0) return null;
    return wrap(Math.atan2(sy, sx));
  }

  /* ============================================================================
     buildModel(DATA) — everything the hall needs, precomputed once.
     ============================================================================ */
  HALL.buildModel = function (DATA) {
    const rng = mulberry32(20260702);
    const time = makeTimeMap();
    const tradKeys = Object.keys(DATA.traditions);
    const TIERS = DATA.tiers;

    /* ---------- figures / edges indices ---------- */
    const figById = {}, figsOfTrad = {};
    DATA.figures.forEach((f, i) => { figById[f.id] = i; (figsOfTrad[f.tradition] = figsOfTrad[f.tradition] || []).push(i); });

    const degree = new Array(DATA.figures.length).fill(0);
    const edgesOfFig = DATA.figures.map(() => []);
    const pairAgg = {};   // "a|b" sorted tradition pair -> {count,bestW,bestTier}
    DATA.edges.forEach((e, ei) => {
      const ai = figById[e.a], bi = figById[e.b];
      if (ai === undefined || bi === undefined) return;
      degree[ai]++; degree[bi]++;
      edgesOfFig[ai].push(ei); edgesOfFig[bi].push(ei);
      const ta = DATA.figures[ai].tradition, tb = DATA.figures[bi].tradition;
      if (ta !== tb) {
        const key = ta < tb ? ta + "|" + tb : tb + "|" + ta;
        const w = (TIERS[e.tier] || TIERS["3"]).weight;
        const g = pairAgg[key] || (pairAgg[key] = { count: 0, bestW: 0, bestTier: "4" });
        g.count++;
        if (w > g.bestW) { g.bestW = w; g.bestTier = e.tier; }
      }
    });

    /* tradition-pair convergence weight (for placement pull) */
    const tradPull = {};  // key -> weight
    for (const key in pairAgg) tradPull[key] = pairAgg[key].count * pairAgg[key].bestW;

    /* ---------- assign rings (era of birth) ---------- */
    const eraIdxOfTrad = {};
    tradKeys.forEach(k => {
      const p = DATA.traditions[k].period || {};
      const from = (p.from !== undefined) ? p.from : -1000;
      let idx = ERAS.length - 1;
      for (let i = 0; i < ERAS.length; i++) if (from <= ERAS[i].to) { idx = i; break; }
      eraIdxOfTrad[k] = idx;
    });
    // rings = eras with members, sparse ones merged outward
    let ringDef = ERAS.map((e, i) => ({ eras: [i], members: tradKeys.filter(k => eraIdxOfTrad[k] === i) }))
                      .filter(r => r.members.length > 0);
    for (let i = 0; i < ringDef.length - 1;) {
      if (ringDef[i].members.length < 5) {
        ringDef[i + 1].eras = ringDef[i].eras.concat(ringDef[i + 1].eras);
        ringDef[i + 1].members = ringDef[i].members.concat(ringDef[i + 1].members);
        ringDef.splice(i, 1);
      } else i++;
    }
    if (ringDef.length > 1 && ringDef[ringDef.length - 1].members.length < 5) {
      const last = ringDef.pop();
      ringDef[ringDef.length - 1].eras = ringDef[ringDef.length - 1].eras.concat(last.eras);
      ringDef[ringDef.length - 1].members = ringDef[ringDef.length - 1].members.concat(last.members);
    }

    /* ---------- shard weights (angular size ∝ figures carried) ---------- */
    const weightOf = {};
    tradKeys.forEach(k => { const n = (figsOfTrad[k] || []).length; weightOf[k] = 2.0 + Math.pow(n, 0.72); });

    /* ---------- ring radii ---------- */
    const POOL_R = 2.35;                       // the unbroken center — the one face
    const maxCount = Math.max.apply(null, ringDef.map(r => r.members.length));
    let widths = ringDef.map(r => 1.5 + 2.9 * Math.sqrt(r.members.length / maxCount));
    const R_TARGET = 26.5;
    const total = widths.reduce((a, b) => a + b, 0);
    widths = widths.map(w => w * (R_TARGET - POOL_R) / total);
    const ringR = [POOL_R];
    widths.forEach(w => ringR.push(ringR[ringR.length - 1] + w));

    /* ---------- angular preference & placement ---------- */
    // start: earthly longitude (lon -180..180 → angle; +lon east ⇒ clockwise from top)
    const prefA = {};
    tradKeys.forEach(k => {
      const lon = regionLongitude(DATA.traditions[k].region, DATA.traditions[k].name);
      prefA[k] = (lon === null) ? rng() * TAU : wrap((lon / 180) * Math.PI);
    });
    // refine: pull toward convergent partners (3 passes over all traditions)
    const pullOf = {};
    for (const key in tradPull) {
      const cut = key.indexOf("|");
      const a = key.slice(0, cut), b = key.slice(cut + 1), w = tradPull[key];
      (pullOf[a] = pullOf[a] || []).push({ o: b, w: w });
      (pullOf[b] = pullOf[b] || []).push({ o: a, w: w });
    }
    for (let pass = 0; pass < 3; pass++) {
      tradKeys.forEach(k => {
        const angles = [prefA[k]], ws = [2.2];       // keep some earthly anchor
        (pullOf[k] || []).forEach(p => { angles.push(prefA[p.o]); ws.push(p.w); });
        const m = circMean(angles, ws);
        if (m !== null) prefA[k] = m;
      });
    }

    /* ---------- within-ring ordering: optimize for convergent neighbourhoods ----------
       The ring (time) is truth and can't move; the ANGLE is negotiable. We order each
       ring so traditions sit angularly close to the traditions they actually converge
       with (weighted by seam count × best tier), softly anchored to their earthly
       longitude. Greedy swap hill-climbing with a light annealing schedule —
       deterministic, runs once, decides where the gold gets to live.            */
    const CRACK_W = 0.16;                       // world-units of gap between shards
    const ringOfTrad = {};
    ringDef.forEach((ring, ri) => ring.members.forEach(k => ringOfTrad[k] = ri));

    // per-ring member order (init: preferred angle), spans, rotation offset
    const ringOrder = ringDef.map(r => r.members.slice().sort((a, b) => prefA[a] - prefA[b]));
    const ringGeom = ringDef.map((r, ri) => {
      const rMid = (ringR[ri] + ringR[ri + 1]) / 2;
      const gapA = CRACK_W / rMid;
      return { gapA: gapA, freeA: TAU - gapA * r.members.length, offset: 0 };
    });
    const centerA = {};                          // tradition -> current angular center
    function layRing(ri) {
      const order = ringOrder[ri], g = ringGeom[ri];
      const wSum = order.reduce((s, k) => s + weightOf[k], 0);
      let cursor = g.offset;
      for (const k of order) {
        const span = g.freeA * weightOf[k] / wSum;
        centerA[k] = wrap(cursor + g.gapA / 2 + span / 2);
        cursor += span + g.gapA;
      }
    }
    ringDef.forEach((r, ri) => layRing(ri));

    // pair list with pull weights + earthly anchors
    const pullPairs = [];
    for (const key in tradPull) {
      const [a, b] = key.split("|");
      if (ringOfTrad[a] === undefined || ringOfTrad[b] === undefined) continue;
      pullPairs.push({ a: a, b: b, w: tradPull[key] });
    }
    const anchorW = 3.0;
    const earthly = {};
    tradKeys.forEach(k => {
      const lon = regionLongitude(DATA.traditions[k].region, DATA.traditions[k].name);
      if (lon !== null) earthly[k] = wrap((lon / 180) * Math.PI);
    });
    const pairsOfRing = ringDef.map(() => []);
    const pairsOfTrad = {};
    pullPairs.forEach(p => {
      pairsOfRing[ringOfTrad[p.a]].push(p);
      if (ringOfTrad[p.b] !== ringOfTrad[p.a]) pairsOfRing[ringOfTrad[p.b]].push(p);
      (pairsOfTrad[p.a] = pairsOfTrad[p.a] || []).push(p);
      (pairsOfTrad[p.b] = pairsOfTrad[p.b] || []).push(p);
    });
    function ringCost(ri) {
      let c = 0;
      for (const p of pairsOfRing[ri]) c += p.w * circDist(centerA[p.a], centerA[p.b]);
      for (const k of ringOrder[ri]) if (earthly[k] !== undefined) c += anchorW * circDist(centerA[k], earthly[k]);
      return c;
    }
    // cost of the pairs touching one tradition, given a hypothetical center for it
    function tradCost(k, th) {
      let c = 0;
      const ps = pairsOfTrad[k];
      if (ps) for (const p of ps) {
        const other = p.a === k ? p.b : p.a;
        c += p.w * circDist(th, centerA[other]);
      }
      if (earthly[k] !== undefined) c += anchorW * circDist(th, earthly[k]);
      return c;
    }
    // optimize: rotation offsets first, then swap passes, then offsets again
    function optimizeOffsets() {
      ringDef.forEach((r, ri) => {
        let best = ringGeom[ri].offset, bestC = Infinity;
        for (let o = 0; o < 72; o++) {
          ringGeom[ri].offset = (o / 72) * TAU; layRing(ri);
          const c = ringCost(ri);
          if (c < bestC) { bestC = c; best = ringGeom[ri].offset; }
        }
        ringGeom[ri].offset = best; layRing(ri);
      });
    }
    optimizeOffsets();
    (function swapOptimize() {
      /* incremental: a swap approximately exchanges the two cells' centers
         (spans differ a little; we re-lay the ring after bursts of accepts) */
      const orng = mulberry32(777);
      const ITER = 60000;
      let sinceRelay = 0;
      for (let it = 0; it < ITER; it++) {
        const ri = Math.floor(orng() * ringDef.length);
        const order = ringOrder[ri];
        if (order.length < 3) continue;
        const i = Math.floor(orng() * order.length);
        const j = Math.floor(orng() * order.length);
        if (i === j) continue;
        const A = order[i], B = order[j];
        const thA = centerA[A], thB = centerA[B];
        const before = tradCost(A, thA) + tradCost(B, thB);
        const after = tradCost(A, thB) + tradCost(B, thA);
        const t = 1 - it / ITER;
        if (after < before - 1e-9 || orng() < 0.015 * t) {
          order[i] = B; order[j] = A;
          centerA[A] = thB; centerA[B] = thA;
          if (++sinceRelay >= 400) { ringDef.forEach((r, q) => layRing(q)); sinceRelay = 0; }
        }
      }
      ringDef.forEach((r, q) => layRing(q));
    })();
    optimizeOffsets();

    /* lay the final cells */
    const shards = [];
    const shardOfTrad = {};
    const ringCells = [];
    ringDef.forEach((ring, ri) => {
      const rIn = ringR[ri], rOut = ringR[ri + 1];
      const g = ringGeom[ri], order = ringOrder[ri];
      const wSum = order.reduce((s, k) => s + weightOf[k], 0);
      let cursor = g.offset;
      const cells = [];
      for (const k of order) {
        const span = g.freeA * weightOf[k] / wSum;
        const a0 = cursor + g.gapA / 2, a1 = a0 + span;
        const cell = { trad: k, ring: ri, a0: a0, a1: a1, rIn: rIn, rOut: rOut, idx: shards.length };
        shardOfTrad[k] = shards.length;
        shards.push(cell); cells.push(cell);
        cursor += span + g.gapA;
      }
      ringCells.push(cells);
    });

    /* ---------- noisy ring boundaries (shared ⇒ cracks meet perfectly) ---------- */
    // boundary b (0..ringCount): radius(θ) = ringR[b] + Σ sin(f θ + φ)·amp
    const boundaries = ringR.map((R, b) => {
      if (b === 0) return { R: R, terms: [] };                  // pool rim: perfect circle
      const wAdj = Math.min(b < widths.length ? widths[b] : widths[widths.length - 1],
                            widths[Math.max(0, b - 1)]);
      const terms = [];
      const n = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) terms.push({ f: 2 + Math.floor(rng() * 6), p: rng() * TAU, a: (0.25 + rng() * 0.45) * wAdj * 0.16 });
      return { R: R, terms: terms };
    });
    function boundR(b, theta) {
      const B = boundaries[b]; let r = B.R;
      for (const t of B.terms) r += Math.sin(t.f * theta + t.p) * t.a;
      return r;
    }

    /* ---------- radial cut polylines (shared by angular neighbours) ---------- */
    // For each ring, for each cell j, cut at cell.a0 - gapA/2 line... we store per-cell
    // LEFT cut (at its a0 side, center of the crack) as a polyline inner→outer.
    function makeCut(ri, theta) {
      const rIn = ringR[ri], rOut = ringR[ri + 1];
      const segs = 3, pts = [];
      const j1 = (rng() - 0.5) * 0.030, j2 = (rng() - 0.5) * 0.030;   // radians of lateral kink
      for (let s = 0; s <= segs; s++) {
        const f = s / segs;
        const th = theta + (s === 1 ? j1 : s === 2 ? j2 : 0);
        const r = boundR(ri, theta) * (1 - f) + boundR(ri + 1, theta) * f;
        pts.push({ th: th, r: r, f: f });
      }
      return pts;
    }
    ringCells.forEach((cells, ri) => {
      cells.forEach((c, j) => {
        const gapA = CRACK_W / ((c.rIn + c.rOut) / 2);
        c.cutL = makeCut(ri, c.a0 - gapA / 2);                  // shared crack center-line
      });
    });

    /* ---------- shard polygons ---------- */
    function arcPoints(b, th0, th1, minStep) {
      const n = Math.max(2, Math.ceil(Math.abs(th1 - th0) / (minStep || 0.07)));
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const th = th0 + (th1 - th0) * (i / n);
        pts.push({ th: th, r: boundR(b, th) });
      }
      return pts;
    }
    function toXZ(p) { return { x: Math.cos(p.th) * p.r, z: Math.sin(p.th) * p.r }; }

    shards.forEach(c => {
      const cells = ringCells[c.ring];
      const jNext = (cells.indexOf(c) + 1) % cells.length;
      const next = cells[jNext];
      const gapA = CRACK_W / ((c.rIn + c.rOut) / 2);
      // own edges pulled half a crack in from the crack center-lines
      const thL = c.a0, thR = c.a1;
      // side polylines follow the shared cut shape, shifted half-gap inward
      const sideL = c.cutL.map(p => ({ th: p.th + gapA / 2, r: p.r }));
      const sideR = (next.cutL || c.cutL).map(p => ({ th: p.th - gapA / 2, r: p.r }));
      const poly = [];
      // inner arc L→R
      arcPoints(c.ring, thL, thR).forEach(p => poly.push(toXZ(p)));
      // right side up (inner→outer)
      sideR.slice(1, -1).forEach(p => poly.push(toXZ(p)));
      // outer arc R→L
      arcPoints(c.ring + 1, thR, thL).forEach(p => poly.push(toXZ(p)));
      // left side down (outer→inner)
      sideL.slice().reverse().slice(1, -1).forEach(p => poly.push(toXZ(p)));
      c.poly = poly;
      // centroid
      let cx = 0, cz = 0; poly.forEach(p => { cx += p.x; cz += p.z; });
      c.cx = cx / poly.length; c.cz = cz / poly.length;
      // the shattered rest-state: tiny tilt + drop (kintsugi honesty — almost whole)
      c.tilt = { rx: (rng() - 0.5) * 0.022, rz: (rng() - 0.5) * 0.022, dy: (rng() - 0.5) * 0.10 };
      const p = DATA.traditions[c.trad].period || {};
      c.from = p.from !== undefined ? p.from : -1000;
      c.to = p.to !== undefined ? p.to : NOW;
      c.peak = p.peak !== undefined ? p.peak : (c.from + c.to) / 2;
      c.living = !!p.living;
    });

    /* ---------- borders (adjacencies) for the gold ribbons ---------- */
    const borders = [];   // {a,b, pts:[{x,z}], kind:'cut'|'arc', pair, agg}
    function pairKey(tA, tB) { return tA < tB ? tA + "|" + tB : tB + "|" + tA; }
    // angular neighbours share the cut
    ringCells.forEach(cells => {
      cells.forEach((c, j) => {
        const prev = cells[(j - 1 + cells.length) % cells.length];
        if (prev === c) return;
        const key = pairKey(prev.trad, c.trad);
        borders.push({ a: prev.idx, b: c.idx, pts: c.cutL.map(toXZ), pair: key, agg: pairAgg[key] || null });
      });
    });
    // radial neighbours share a boundary arc segment
    for (let ri = 0; ri < ringCells.length - 1; ri++) {
      const below = ringCells[ri], above = ringCells[ri + 1];
      below.forEach(cb => {
        above.forEach(ca => {
          // overlap of [a0,a1] intervals on the circle (compare in unwrapped space)
          for (let shift = -1; shift <= 1; shift++) {
            const s = Math.max(cb.a0, ca.a0 + shift * TAU);
            const e = Math.min(cb.a1, ca.a1 + shift * TAU);
            if (e - s > 0.03) {
              const key = pairKey(cb.trad, ca.trad);
              borders.push({
                a: cb.idx, b: ca.idx,
                pts: arcPoints(ri + 1, s + 0.012, e - 0.012).map(toXZ),
                pair: key, agg: pairAgg[key] || null,
              });
            }
          }
        });
      });
    }

    /* ---------- figure anchors: seeded scatter inside each shard ---------- */
    function pointInPoly(x, z, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, zi = poly[i].z, xj = poly[j].x, zj = poly[j].z;
        if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) inside = !inside;
      }
      return inside;
    }
    const degMax = Math.max.apply(null, degree.concat([1]));
    const figAnchor = new Array(DATA.figures.length);
    shards.forEach(c => {
      const figs = figsOfTrad[c.trad] || [];
      if (!figs.length) return;
      // bbox
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      c.poly.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
      const srng = mulberry32(1000 + c.idx);
      const candidates = [];
      let guard = 0;
      while (candidates.length < figs.length * 6 && guard++ < 800) {
        const x = x0 + srng() * (x1 - x0), z = z0 + srng() * (z1 - z0);
        if (pointInPoly(x, z, c.poly)) candidates.push({ x, z });
      }
      while (candidates.length < figs.length) candidates.push({ x: c.cx, z: c.cz });   // degenerate fallback
      // farthest-point greedy for spread
      const chosen = [candidates[0]];
      while (chosen.length < figs.length) {
        let best = null, bestD = -1;
        for (const cd of candidates) {
          let dMin = 1e9;
          for (const ch of chosen) { const d = (cd.x - ch.x) ** 2 + (cd.z - ch.z) ** 2; if (d < dMin) dMin = d; }
          if (dMin > bestD) { bestD = dMin; best = cd; }
        }
        chosen.push(best);
      }
      figs.forEach((fi, j) => {
        const p = chosen[j];
        const h = 1.35 + 3.1 * Math.sqrt(degree[fi] / degMax) + (srng() - 0.5) * 0.5;
        figAnchor[fi] = { x: p.x, y: h, z: p.z, shard: c.idx };
      });
    });
    // safety: any figure of an unplaced tradition (shouldn't happen)
    DATA.figures.forEach((f, i) => { if (!figAnchor[i]) figAnchor[i] = { x: 0, y: 2, z: 0, shard: -1 }; });

    /* ---------- archetype joints: two rete rings above the mirror ---------- */
    const archFigs = {};
    DATA.figures.forEach((f, i) => (f.archetypes || []).forEach(a => (archFigs[a] = archFigs[a] || []).push(i)));
    const chars = DATA.archetypes.filter(a => a.subtype === "character");
    const prins = DATA.archetypes.filter(a => a.subtype !== "character");
    function placeRing(list, radius, y) {
      // preferred angle = circular mean of member shards' angles
      const withPref = list.map(a => {
        const figs = archFigs[a.id] || [];
        const angs = [], ws = [];
        figs.forEach(fi => { const an = figAnchor[fi]; angs.push(Math.atan2(an.z, an.x)); ws.push(1); });
        const m = circMean(angs, ws);
        return { a: a, pref: m === null ? rng() * TAU : m };
      }).sort((p, q) => p.pref - q.pref);
      // even spacing, rotation offset minimizing drift from preference
      let bestOff = 0, bestCost = Infinity;
      for (let o = 0; o < 90; o++) {
        const off = (o / 90) * TAU;
        let cost = 0;
        withPref.forEach((p, j) => cost += circDist(off + (j / withPref.length) * TAU, p.pref));
        if (cost < bestCost) { bestCost = cost; bestOff = off; }
      }
      return withPref.map((p, j) => {
        const th = bestOff + (j / withPref.length) * TAU;
        return { a: p.a, x: Math.cos(th) * radius, y: y, z: Math.sin(th) * radius, th: th,
                 count: (archFigs[p.a.id] || []).length };
      });
    }
    const R_OUT = ringR[ringR.length - 1];
    const joints = placeRing(chars, R_OUT * 0.56, 8.8).concat(placeRing(prins, R_OUT * 0.33, 11.2));
    const jointById = {};
    joints.forEach((j, i) => jointById[j.a.id] = i);

    /* ---------- expose ---------- */
    return {
      DATA: DATA, time: time, ERAS: ERAS, NOW: NOW, FUTURE_TO: FUTURE_TO,
      rings: ringDef, ringR: ringR, R: R_OUT, POOL_R: POOL_R, CRACK_W: CRACK_W,
      shards: shards, shardOfTrad: shardOfTrad, borders: borders,
      pairAgg: pairAgg, figAnchor: figAnchor, figById: figById,
      figsOfTrad: figsOfTrad, edgesOfFig: edgesOfFig, degree: degree,
      joints: joints, jointById: jointById, archFigs: archFigs,
      boundR: boundR,
    };
  };

  /* node testability */
  if (typeof module !== "undefined" && module.exports) module.exports = HALL;
})(typeof window !== "undefined" ? window : globalThis);
