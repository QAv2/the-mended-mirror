/* ============================================================================
   THE HALL OF AGES — the chunk loader (the data split's client half).
   ----------------------------------------------------------------------------
   data/mirror-core.js boots the hall with LITE figures/edges (no prose).
   This module fetches data/t/<id>.json on demand and patches the prose back
   into MIRROR_DATA in place (same objects — every index and reference held by
   the scene stays valid). Dossiers and source links ride the same chunks.

     HALL.chunks.ready(ids)    -> true if every id is already merged
     HALL.chunks.ensure(ids)   -> Promise, resolves when merged (never rejects:
                                  offline/file:// degrades to lite quietly)
     HALL.chunks.prefetch(ids) -> fire-and-forget ensure (hover warmth)

   After boot settles, a slow background trickle fills the whole cache so a
   long visit ends fully offline-capable. If the page was loaded with the FULL
   mirror-data.js instead (no __lite flag), everything here is a no-op.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const D = root.MIRROR_DATA;
  const lite = !!(D && D.__lite);
  root.MIRROR_DOSSIERS = root.MIRROR_DOSSIERS || {};
  root.MIRROR_LINKS = root.MIRROR_LINKS || {};

  const loaded = {}, inflight = {};

  function mergeChunk(k, ch) {
    (ch.figures || []).forEach(d => {
      const f = D.figures[d.i];
      if (!f || f.id !== d.id) return;            // stale chunk vs core — skip, stay lite
      delete d.i;
      Object.assign(f, d);
    });
    (ch.edges || []).forEach(d => {
      const e = D.edges[d.i];
      if (e) e.note = d.note;
    });
    if (ch.dossier) root.MIRROR_DOSSIERS[k] = ch.dossier;
    if (ch.links) root.MIRROR_LINKS[k] = ch.links;
    loaded[k] = true;
  }

  function fetchOne(k) {
    if (loaded[k]) return Promise.resolve();
    if (inflight[k]) return inflight[k];
    inflight[k] = fetch("data/t/" + k + ".json?v=" + (D.__v || 0))
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(ch => { mergeChunk(k, ch); delete inflight[k]; })
      .catch(() => { delete inflight[k]; });      // degrade quietly; retried on next ask
    return inflight[k];
  }

  const norm = ids => [].concat(ids || []).filter(k => k && D.traditions[k] && !loaded[k]);

  HALL.chunks = {
    lite: lite,
    ready: ids => !lite || norm(ids).length === 0,
    ensure: ids => (!lite ? Promise.resolve() : Promise.all(norm(ids).map(fetchOne))),
    prefetch: ids => { if (lite) norm(ids).forEach(fetchOne); },
  };

  /* the after-boot trickle: one chunk at a time, gently */
  if (lite) {
    const queue = Object.keys(D.traditions);
    let delay = 8000;                              // let the temple raise first
    (function tick() {
      setTimeout(() => {
        while (queue.length && loaded[queue[0]]) queue.shift();
        if (!queue.length) return;
        fetchOne(queue.shift()).then(() => { delay = 300; tick(); });
      }, delay);
    })();
  }
})(typeof window !== "undefined" ? window : globalThis);
