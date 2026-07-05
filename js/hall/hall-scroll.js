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

    /* ---------- the banded strata: 288 life-lines organized by birth era ----
       At catalog scale a uniform stack of hairlines reads as a barcode. The
       wall becomes GEOLOGY instead: the model's era rings (sparse eras merged,
       same rule as the mirror's fracture) turn into horizontal BANDS separated
       by a cornice course; within a band, every lane's height is weighted by
       the roster it carries, so greek breathes wider than a four-figure line.
       Sorting by birth date keeps bands contiguous by construction. */
    const BAND_GAP = 0.55;
    const bandOf = {};
    M.rings.forEach((r, bi) => r.members.forEach(k => bandOf[k] = bi));
    const laneY = new Array(ranked.length);   // lane center, scroll frame
    const laneH = new Array(ranked.length);   // lane height (roster-weighted)
    const bands = [];                          // {y0, y1, i0, i1, eras}
    let yCur = Y0, bandStart = 0;
    ranked.forEach((r, i) => {
      const b = bandOf[r.k];
      if (i > 0 && b !== bandOf[ranked[i - 1].k]) {
        bands.push({ y0: bands.length ? bands[bands.length - 1].y1 + BAND_GAP : Y0, y1: yCur, i0: bandStart, i1: i - 1, band: bandOf[ranked[i - 1].k] });
        yCur += BAND_GAP;
        bandStart = i;
      }
      const n = (M.figsOfTrad[r.k] || []).length;
      const h = 0.08 + 0.016 * Math.sqrt(n);
      laneY[i] = yCur + h / 2;
      laneH[i] = h;
      yCur += h;
    });
    bands.push({ y0: bands.length ? bands[bands.length - 1].y1 + BAND_GAP : Y0, y1: yCur, i0: bandStart, i1: ranked.length - 1, band: bandOf[ranked[ranked.length - 1].k] });
    bands.forEach(bd => bd.eras = M.rings[bd.band] ? M.rings[bd.band].eras.map(e => M.ERAS[e].name).join(" · ") : "");
    const LANE_H = ranked.length ? (yCur - Y0) / ranked.length : 0.115;   // mean, for consumers that want a scale
    const H_TOP = yCur;

    function xOfYear(y) {
      if (y <= M.NOW) return X0 + M.time.yearToT(y) * (X1 - X0);
      return X1 + Math.min(1, (y - M.NOW) / (M.FUTURE_TO - M.NOW)) * (XF - X1);
    }
    function yearOfX(x) {
      if (x <= X1) return M.time.tToYear((x - X0) / (X1 - X0));
      return M.NOW + ((x - X1) / (XF - X1)) * (M.FUTURE_TO - M.NOW);
    }
    function yOfRank(i) { return laneY[i]; }
    /* reverse lookup: scroll-frame y → rank index (null in a cornice gap) */
    function rankAtY(y) {
      let lo = 0, hi = ranked.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const half = laneH[mid] / 2;
        if (y < laneY[mid] - half) hi = mid - 1;
        else if (y > laneY[mid] + half) lo = mid + 1;
        else return mid;
      }
      return null;
    }

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
      laneY, laneH, bands, rankAtY,
      setCursorYear() {},        // the wall's meridian is the cursor now
    };
  };

  /* ---------- the interior's shared measures ----------
     Computed from pure model numbers BEFORE any heavy geometry exists, so the
     lobby can build (and the gate open) without the instrument or the strata
     wall. Every module that needs the room's size reads THESE — the mater,
     the rotunda, the room shell and the exterior all agree by construction.

     TWO heights, deliberately (Joe's grant, 2026-07-05): the LOBBY keeps the
     height the tholos was designed around — the building outside stays a
     temple, not a silo. The STRATA wall of the executed holodeck rises as
     tall as 288 banded life-lines need: the room is larger on the inside
     than the building is on the outside. The dissolve is the crossing, and
     Route B's porthole has already severed every sightline that could
     contradict the scales. */
  HALL.dims = function (H) {
    const M = H.model, S = H.scroll;
    const RIM_IN = M.R + 0.55, RIM_OUT = M.R + 3.2;   // the calendar's limb
    const RAD = RIM_OUT + 1.8;                        // the wall wraps the instrument
    const Y0R = 2.6;                                  // first lane above the floor
    const H_TOPR = Y0R + (S.H_TOP - S.Y0);            // banded lanes, transplanted
    const WALL_H = H_TOPR + 4.6;                      // strata wall + cornice headroom
                                                      // (4.6: the title band above the
                                                      // lintel must hold 58px ascenders
                                                      // at catalog wall heights)
    H.dims = {
      RIM_IN, RIM_OUT, RAD, Y0R, H_TOPR,
      WALL_H,                                         // the strata wall (holo — TARDIS-tall)
      LOBBY_H: 31.2,                                  // the shell + temple (exterior-true, pre-catalog proportion)
      EYE: new THREE.Vector3(0, 1.7, 0),              // where you stand for the scroll
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
