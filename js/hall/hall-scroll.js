/* ============================================================================
   THE HALL OF AGES — the Scroll of Ages: the LAYOUT of the strata of time.
   ----------------------------------------------------------------------------
   Once a flat wall across the void; now the scroll is bent until its ends
   meet and wraps the room (hall-rotunda paints it). This module keeps the
   scroll's BRAIN — the ranking of the 219 life-lines (oldest at the bottom,
   like geological strata), the lane heights, and the twelve dated syncretism
   moments — with no scene objects of its own. The rotunda consumes it.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  HALL.buildScroll = function (H) {
    const M = H.model, D = M.DATA;

    /* ---------- the strata frame (kept in the flat scroll's units) ---------- */
    const X0 = -56, X1 = 56, XF = 61.5;       // past → now → the prophesied
    const Y0 = 2.4;
    const ranked = Object.keys(D.traditions)
      .map(k => ({ k, p: D.traditions[k].period || {} }))
      .sort((a, b) => ((a.p.from || 0) - (b.p.from || 0)) || (a.k < b.k ? -1 : 1));
    const rankOf = {};
    ranked.forEach((r, i) => rankOf[r.k] = i);
    const LANE_H = 0.115;
    const H_TOP = Y0 + ranked.length * LANE_H;

    function xOfYear(y) {
      if (y <= M.NOW) return X0 + M.time.yearToT(y) * (X1 - X0);
      return X1 + Math.min(1, (y - M.NOW) / (M.FUTURE_TO - M.NOW)) * (XF - X1);
    }
    function yearOfX(x) {
      if (x <= X1) return M.time.tToYear((x - X0) / (X1 - X0));
      return M.NOW + ((x - X1) / (XF - X1)) * (M.FUTURE_TO - M.NOW);
    }
    function yOfRank(i) { return Y0 + i * LANE_H; }

    /* ---------- the dated syncretism moments (the seals) ---------- */
    const moments = [];
    D.edges.forEach(e => {
      if (!e.when || e.when.when === undefined) return;
      const fa = D.figures[M.figById[e.a]], fb = D.figures[M.figById[e.b]];
      if (!fa || !fb) return;
      const ra = rankOf[fa.tradition], rb = rankOf[fb.tradition];
      if (ra === undefined || rb === undefined) return;
      const x = xOfYear(e.when.when);
      const ya = yOfRank(ra), yb = yOfRank(rb);
      moments.push({ x, y: (ya + yb) / 2, edge: e, ya, yb });
    });

    H.scroll = {
      X0, X1, XF, H_TOP, Y0, LANE_H,
      xOfYear, yearOfX, yOfRank, rankOf, ranked, moments,
      setCursorYear() {},        // the wall's meridian is the cursor now
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
