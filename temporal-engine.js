/* ============================================================================
   THE MENDED MIRROR — temporal engine (SKIN-AGNOSTIC CORE).
   The pure logic the Scroll and the Astrolabe both read: given a year, what is
   alive, what is a ghost, what is not-yet-born, and what seam is firing. No
   pixels here — only time. Reads window.MIRROR_DATA (periods/eras folded in by
   merge.js). Exposes window.TemporalEngine.
   ============================================================================ */
window.TemporalEngine = (function () {
  "use strict";
  const D = window.MIRROR_DATA;
  if (!D) throw new Error("TemporalEngine: MIRROR_DATA not loaded");
  const ERAS = D.eras || [];
  const HIGHLIGHTS = D.highlights || [];
  const SPAN = (D.meta && D.meta.span) || { from: -50000, to: 2026 };
  const TR = D.traditions;

  /* ---- era-banded axis: every era gets EQUAL width so the 50,000-year deep
     past doesn't crush the last 5,000 where everything happens. year ↔ t∈[0,1]. */
  function yearToT(year) {
    const n = ERAS.length;
    if (!n) return clamp01((year - SPAN.from) / (SPAN.to - SPAN.from));
    for (let i = 0; i < n; i++) {
      const e = ERAS[i];
      if (year < e.from) return i / n;
      if (year <= e.to) return (i + (year - e.from) / Math.max(1, e.to - e.from)) / n;
    }
    return 1;
  }
  function tToYear(t) {
    const n = ERAS.length;
    if (!n) return Math.round(SPAN.from + t * (SPAN.to - SPAN.from));
    const scaled = clamp01(t) * n;
    const i = Math.min(n - 1, Math.floor(scaled)), frac = scaled - i, e = ERAS[i];
    return Math.round(e.from + frac * (e.to - e.from));
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ---- a tradition's state at a year ---- */
  function statusOf(p, year) {
    if (year < p.from) return "unborn";
    if (year > p.to) return "ghost";
    return "alive";
  }
  // 0..1 — rises from birth to peak, full while alive, a dim sepia memory once dead
  function intensityOf(p, year, status) {
    if (status === "unborn") return 0;
    if (status === "ghost") {
      const since = year - p.to, fade = Math.max(0, 1 - since / 2500); // memory dims over millennia
      return 0.18 + 0.16 * fade;
    }
    const peak = p.peak != null ? p.peak : (p.from + p.to) / 2;
    if (year < peak) return 0.55 + 0.45 * clamp01((year - p.from) / Math.max(1, peak - p.from));
    return 1;
  }

  /* ---- aggregate the 1,046 figure-seams up to TRADITION↔TRADITION links
     (so the timeline shows ~tens of gold rivers between shards, not a hairball) ---- */
  const figTrad = {}; D.figures.forEach(f => { figTrad[f.id] = f.tradition; });
  const TIER_RANK = { "1": 5, "2": 4, "3": 3, "4": 2, "forgery": 1 };
  const linkMap = {};
  D.edges.forEach(e => {
    const ta = figTrad[e.a], tb = figTrad[e.b];
    if (!ta || !tb || ta === tb) return;          // skip joints & intra-tradition
    const k = ta < tb ? ta + "|" + tb : tb + "|" + ta;
    const L = linkMap[k] || (linkMap[k] = { a: k.split("|")[0], b: k.split("|")[1], count: 0, bestTier: "4", events: [] });
    L.count++;
    if ((TIER_RANK[e.tier] || 0) > (TIER_RANK[L.bestTier] || 0)) L.bestTier = e.tier;
    if (e.when && typeof e.when.when === "number") L.events.push({ when: e.when.when, note: e.when.note || "" });
  });
  const LINKS = Object.values(linkMap);

  const FIRE_WINDOW = 90; // ±years a dated seam "flares" as you scrub past its event

  function stateAt(year) {
    const traditions = {};
    let aliveCount = 0;
    Object.keys(TR).forEach(id => {
      const p = TR[id].period; if (!p) return;
      const status = statusOf(p, year);
      if (status === "alive") aliveCount++;
      traditions[id] = { id, status, intensity: intensityOf(p, year, status), period: p };
    });
    const firing = LINKS.filter(L => L.events.some(ev => Math.abs(ev.when - year) <= FIRE_WINDOW));
    const era = ERAS.find(e => year >= e.from && year <= e.to) || null;
    const highlight = HIGHLIGHTS.find(h => year >= h.from && year <= h.to) || null;
    return { year, traditions, aliveCount, era, highlight, firing };
  }

  return { ERAS, HIGHLIGHTS, SPAN, LINKS, yearToT, tToYear, stateAt };
})();
