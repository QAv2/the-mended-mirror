/* ============================================================================
   THE HALL OF AGES — the conductor.
   Stations, picking, selection, time, and the mend ceremony.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  HALL.start = async function () {
    const H = {};
    root.H = H;   // debugging handle

    /* ---------- build everything, narrating the splash ---------- */
    const gateStatus = document.getElementById("gate-enter");
    const stage = t => {
      if (gateStatus) gateStatus.textContent = t;
      return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    };
    await stage("laying the mirror\u2026");
    H.model = HALL.buildModel(root.MIRROR_DATA);
    await stage("opening the void\u2026");
    HALL.buildScene(H);
    await stage("cutting the shards\u2026");
    HALL.buildMater(H);
    await stage("raising the seams\u2026");
    HALL.buildFigures(H);
    await stage("unrolling the scroll\u2026");
    HALL.buildScroll(H);
    await stage("setting the plinth\u2026");
    HALL.buildThreshold(H);
    HALL.buildUI(H);

    const M = H.model, D = M.DATA;

    /* ---------- stations ---------- */
    const POSES = {
      threshold: { target: new THREE.Vector3(0, 1.15, 46), radius: 6.4, phi: 1.38, theta: 0 },
      instrument: { target: new THREE.Vector3(0, 1.2, 0), radius: 47, phi: 0.76, theta: Math.PI + 0.45 },
      scroll: { target: new THREE.Vector3(24, 14.5, H.scroll.WALL_Z), radius: 50, phi: 1.45, theta: 0 },
    };
    const HINTS = {
      threshold: "drag to look &middot; <b>click a relic</b> to open its exhibit",
      instrument: "drag to turn &middot; scroll to draw close &middot; <b>click what gleams</b> &middot; drag the <b>rule</b> to travel time",
      scroll: "drag to pan the ages &middot; <b>click a life-line</b> &middot; drag the <b>gold cursor</b> to travel time",
    };
    let station = "threshold";
    let visitedInstrument = false;

    function goStation(name, dur) {
      if (!POSES[name]) return;
      station = name;
      H.ui.setStation(name);
      H.ui.close();
      clearSelection();
      const rig = H.rig;
      if (name === "scroll") {
        rig.panMode = "pan";
        rig.panClamp = { x0: H.scroll.X0 + 2, x1: H.scroll.XF + 2, y0: 5, y1: H.scroll.H_TOP + 2 };
        rig.min = 7; rig.max = 60;
        rig.minPhi = 1.1; rig.maxPhi = 1.62;
      } else {
        rig.panMode = "orbit";
        rig.panClamp = null;
        rig.min = name === "threshold" ? 2.5 : 5;
        rig.max = name === "threshold" ? 60 : 110;
        rig.minPhi = 0.14; rig.maxPhi = 1.52;
      }
      rig.flyTo(POSES[name], dur || 3.0, () => {
        H.ui.hint(HINTS[name]);
        if (name === "instrument" && !visitedInstrument) {
          visitedInstrument = true;
          setTimeout(() => startCeremony(), 450);
        }
      });
    }
    H.goStation = goStation;

    /* ---------- time ---------- */
    H.year = M.NOW;
    let lastAppliedYear = null;
    function applyYear(force, opts) {
      if (!force && lastAppliedYear !== null && Math.abs(H.year - lastAppliedYear) < 0.5) return;
      lastAppliedYear = H.year;
      H.mater.applyYear(H.year, opts);
      H.figures.applyYear(H.year);
      H.mater.setRuleYear(H.year);
      H.scroll.setCursorYear(H.year);
      H.ui.setYear(H.year);
    }
    applyYear(true);

    /* ---------- the mend ceremony ---------- */
    const cer = { active: false, p: 0, dur: 26, speed: 1 };
    function startCeremony() {
      if (cer.active) return;
      clearSelection(); H.ui.close();
      cer.active = true; cer.p = 0; cer.speed = 1; cer.mid = false;
      H.ui.ceremonyLine("It was one mirror.", 4200);
      H.ui.hint("watching the mend &middot; click to hasten", true);
    }
    H.startCeremony = startCeremony;
    function stepCeremony(dt) {
      if (!cer.active) return;
      cer.p += (dt / cer.dur) * cer.speed;
      const p = Math.min(1, cer.p);
      H.year = M.time.tToYear(p);
      applyYear(true, { ceremony: true });
      if (!cer.mid && p >= 0.48) { cer.mid = true; H.ui.ceremonyLine("It broke.", 3400); }
      setReteFade(smooth(0.78, 0.98, p));
      if (cer.p >= 1) {
        cer.active = false;
        H.year = M.NOW;
        applyYear(true);
        H.figures.arcMat.uniforms.uOpacity.value = 1.0;
        setReteFade(1);
        H.mater.pulsePool();
        H.ui.ceremonyLine("Now reassembled into a single object.", 4400);
        setTimeout(() => H.ui.ceremonyLine("May we see ourselves Whole.", 6000), 4900);
        H.ui.hint(HINTS[station]);
      }
    }
    function smooth(a, b, x) { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); }

    /* rete fade helper (store base opacities once) */
    const reteBase = [];
    H.figures.rete.traverse(o => {
      if (o.material && o.material.opacity !== undefined) reteBase.push({ m: o.material, o: o.material.opacity, t: o.material.transparent });
    });
    function setReteFade(k) {
      for (const r of reteBase) {
        r.m.transparent = true;
        r.m.opacity = r.o * k;
      }
      H.figures.rete.visible = k > 0.005;
    }
    setReteFade(1);

    /* ---------- selection ---------- */
    const sel = { type: null, id: null };
    function baseArcOpacity() { return sel.type ? 0.22 : 1.0; }

    function clearSelection() {
      sel.type = null; sel.id = null;
      H.figures.figSel.fill(0); H.figures.figDim.fill(0); H.figures.figHover.fill(0);
      H.mater.selV.fill(0); H.mater.hoverV.fill(0); H.mater.dimV.value = 0;
      lastHoverShard = -1; lastHoverFig = -1;
      H.figures.overlay.clear(); H.figures.threads.clear();
      H.figures.arcMat.uniforms.uOpacity.value = 1.0;
      applyYear(true);
    }
    H.onPanelClose = clearSelection;

    function selectFigure(fi) {
      clearSelection();
      sel.type = "figure"; sel.id = fi;
      H.figures.figDim.fill(1);
      H.figures.figDim[fi] = 0; H.figures.figSel[fi] = 1;
      M.edgesOfFig[fi].forEach(ei => {
        const e = D.edges[ei];
        const oa = M.figById[e.a], ob = M.figById[e.b];
        if (oa !== undefined) H.figures.figDim[oa] = 0;
        if (ob !== undefined) H.figures.figDim[ob] = 0;
      });
      H.mater.dimV.value = 0.5;
      const si = M.figAnchor[fi].shard;
      if (si >= 0) H.mater.selV[si] = 0.35;
      H.figures.overlay.forFigure(fi);
      H.figures.threads.forFigure(fi);
      H.figures.arcMat.uniforms.uOpacity.value = 0.18;
      H.ui.openFigure(fi);
      applyYear(true);
    }

    function selectShard(si) {
      clearSelection();
      sel.type = "shard"; sel.id = si;
      const trad = M.shards[si].trad;
      H.mater.selV[si] = 1;
      H.mater.dimV.value = 0.5;
      H.figures.figDim.fill(1);
      (M.figsOfTrad[trad] || []).forEach(fi => H.figures.figDim[fi] = 0);
      // partners stay half-lit
      for (const key in M.pairAgg) {
        const cut = key.indexOf("|");
        const a = key.slice(0, cut), b = key.slice(cut + 1);
        if (a === trad || b === trad) {
          const o = M.shardOfTrad[a === trad ? b : a];
          if (o !== undefined) {
            H.mater.hoverV[o] = Math.max(H.mater.hoverV[o], 0.30);
            (M.figsOfTrad[a === trad ? b : a] || []).forEach(fi => H.figures.figDim[fi] = 0.45);
          }
        }
      }
      H.figures.overlay.forShard(si);
      H.figures.arcMat.uniforms.uOpacity.value = 0.12;
      H.ui.openTradition(trad);
      applyYear(true);
    }

    function selectJoint(ji) {
      clearSelection();
      sel.type = "joint"; sel.id = ji;
      const id = M.joints[ji].a.id;
      H.figures.figDim.fill(1);
      (M.archFigs[id] || []).forEach(fi => H.figures.figDim[fi] = 0);
      H.mater.dimV.value = 0.45;
      H.figures.threads.forJoint(ji);
      H.figures.arcMat.uniforms.uOpacity.value = 0.10;
      H.ui.openJoint(ji);
      applyYear(true);
    }

    /* ---------- focus flights ---------- */
    function flyToPoint(p, radius, dur) {
      const rig = H.rig;
      const pose = {
        target: new THREE.Vector3(p.x, p.y, p.z),
        radius: radius,
        phi: Math.min(1.25, Math.max(0.55, rig.dSph.phi)),
        theta: rig.dSph.theta + 0.12,
      };
      rig.flyTo(pose, dur || 1.6);
    }
    function ensureInstrumentRig() {
      if (station === "instrument") return;
      station = "instrument";
      H.ui.setStation("instrument");
      const rig = H.rig;
      rig.panMode = "orbit"; rig.panClamp = null;
      rig.min = 5; rig.max = 110;
      rig.minPhi = 0.14; rig.maxPhi = 1.52;
    }
    H.jump = {
      figure(fi) {
        ensureInstrumentRig();
        selectFigure(fi);
        const a = M.figAnchor[fi];
        flyToPoint(a, 8);
      },
      tradition(k) {
        const si = M.shardOfTrad[k];
        if (si === undefined) return;
        ensureInstrumentRig();
        selectShard(si);
        const s = M.shards[si];
        flyToPoint({ x: s.cx, y: 0.6, z: s.cz }, 8 + Math.sqrt(s.rOut - s.rIn) * 4);
      },
      joint(ji) {
        ensureInstrumentRig();
        selectJoint(ji);
        const j = H.figures.joints[ji];
        const p = new THREE.Vector3();
        j.mesh.getWorldPosition(p);
        flyToPoint(p, 10);
      },
    };

    /* ---------- picking ---------- */
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.55 };
    const ndc = new THREE.Vector2();
    const planeY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const v3 = new THREE.Vector3();

    function shardAtPlane(x, z) {
      const r = Math.hypot(x, z);
      if (r < M.POOL_R) return { kind: "pool" };
      const th = Math.atan2(z, x);
      for (let ri = 0; ri < M.rings.length; ri++) {
        const rIn = M.boundR(ri, th), rOut = M.boundR(ri + 1, th);
        if (r >= rIn && r <= rOut) {
          // find the cell whose angular interval holds th
          for (const s of M.shards) {
            if (s.ring !== ri) continue;
            const span = s.a1 - s.a0;
            let d = (th - s.a0) % TAU;
            if (d < 0) d += TAU;
            if (d <= span) return { kind: "shard", idx: s.idx };
          }
          return null;
        }
      }
      if (r >= H.mater.RIM_IN - 0.4 && r <= H.mater.RIM_OUT + 1.6) return { kind: "rim", theta: th };
      return null;
    }

    function pick() {
      raycaster.setFromCamera(ndc, H.camera);
      // 1. object raycast (cheap sets only)
      const objs = [H.mater.grab];
      if (station === "scroll") objs.push(H.scroll.cursor.children[2], H.scroll.group.children.find(o => o.userData.kind === "wall"));
      H.figures.joints.forEach(j => objs.push(j.mesh));
      objs.push(H.figures.points);
      H.threshold.pickables.forEach(o => objs.push(o));
      const hits = raycaster.intersectObjects(objs.filter(Boolean), false);
      let grabHit = null, jointHit = null, figHit = null, wallHit = null, relicHit = null, cursorHit = null;
      for (const h of hits) {
        const kind = h.object.userData.kind;
        if (kind === "rule" && !grabHit) grabHit = h;
        else if (kind === "cursor" && !cursorHit) cursorHit = h;
        else if (kind === "joint" && !jointHit) jointHit = h;
        else if (h.object === H.figures.points && !figHit) figHit = h;
        else if (kind === "wall" && !wallHit) wallHit = h;
        else if (kind === "relic" && !relicHit) relicHit = h;
      }
      if (grabHit) return { kind: "rule" };
      if (cursorHit) return { kind: "cursor" };
      if (relicHit) return { kind: "relic", which: relicHit.object.userData.which, obj: relicHit.object };
      if (jointHit) return { kind: "joint", idx: jointHit.object.userData.joint, obj: jointHit.object };
      if (figHit && figHit.index !== undefined && H.figures.isLit(figHit.index)) {
        return { kind: "figure", idx: figHit.index };
      }
      if (wallHit) {
        const local = H.scroll.group.worldToLocal(wallHit.point.clone());
        const mom = H.scroll.momentAt(local.x, local.y);
        if (mom) return { kind: "moment", moment: mom };
        const lane = H.scroll.tradAt(local.x, local.y);
        if (lane) return { kind: "lane", trad: lane.trad, y: lane.y, x: local.x };
        return { kind: "wallvoid", x: local.x };
      }
      // 2. analytic mater pick
      if (station !== "scroll") {
        const t = raycaster.ray.intersectPlane(planeY0, v3);
        if (t) {
          const res = shardAtPlane(v3.x, v3.z);
          if (res) return res;
        }
      }
      return null;
    }

    /* ---------- hover ---------- */
    let hover = null, hoverDirty = false, lastHoverShard = -1, lastHoverFig = -1;
    H.onPointerMove = () => { hoverDirty = true; };
    function applyHover() {
      if (!hoverDirty || H.rig.locked || H.pointer.down) return;
      hoverDirty = false;
      ndc.set(H.pointer.nx, H.pointer.ny);
      const h = pick();
      hover = h;
      // clear hover states
      if (lastHoverShard >= 0 && (!h || h.kind !== "shard" || h.idx !== lastHoverShard)) {
        if (!(sel.type === "shard" && sel.id === lastHoverShard)) H.mater.hoverV[lastHoverShard] = 0;
        lastHoverShard = -1; applyYear(true);
      }
      if (lastHoverFig >= 0 && (!h || h.kind !== "figure" || h.idx !== lastHoverFig)) {
        H.figures.figHover[lastHoverFig] = 0;
        lastHoverFig = -1; applyYear(true);
      }
      document.body.style.cursor = h ? "pointer" : "default";
      if (!h) { H.ui.setHover(null); return; }
      if (h.kind === "shard") {
        const s = M.shards[h.idx];
        H.mater.hoverV[h.idx] = Math.max(H.mater.hoverV[h.idx], 0.55);
        lastHoverShard = h.idx;
        const t = D.traditions[s.trad];
        const p = t.period || {};
        const years = (p.from < 0 ? Math.abs(p.from).toLocaleString() + " BCE" : p.from + " CE") + " — " + (p.living ? "living" : (p.to < 0 ? Math.abs(p.to) + " BCE" : p.to + " CE"));
        H.ui.setHover(new THREE.Vector3(s.cx, 0.8, s.cz), t.name, years + " · " + (t.region || ""), t.color);
        applyYear(true);
      } else if (h.kind === "figure") {
        const f = D.figures[h.idx];
        H.figures.figHover[h.idx] = 1;
        lastHoverFig = h.idx;
        const a = M.figAnchor[h.idx];
        const t = D.traditions[f.tradition];
        H.ui.setHover(new THREE.Vector3(a.x, a.y + 0.35, a.z), f.name, (t ? t.name : "") + " · " + f.kind, t ? t.color : undefined);
        applyYear(true);
      } else if (h.kind === "joint") {
        const j = H.figures.joints[h.idx];
        const p = new THREE.Vector3(); j.mesh.getWorldPosition(p); p.y += 0.7;
        H.ui.setHover(p, j.data.a.name, j.data.count + " figures fulfil it", "#f4d78a");
      } else if (h.kind === "relic") {
        const p = new THREE.Vector3(); h.obj.getWorldPosition(p); p.y += 0.55;
        H.ui.setHover(p, h.obj.userData.label, h.obj.userData.cap);
      } else if (h.kind === "pool") {
        H.ui.setHover(new THREE.Vector3(0, 0.6, 0), "the one face", "click to mend the mirror again");
      } else if (h.kind === "rule") {
        H.ui.setHover(null);
      } else if (h.kind === "lane") {
        const t = D.traditions[h.trad];
        const wp = H.scroll.group.localToWorld(new THREE.Vector3(h.x, h.y + 0.5, 0.4));
        const p = t.period || {};
        const years = (p.from < 0 ? Math.abs(p.from).toLocaleString() + " BCE" : p.from + " CE") + " — " + (p.living ? "living" : (p.to < 0 ? Math.abs(p.to) + " BCE" : p.to + " CE"));
        H.ui.setHover(wp, t.name, years, t.color);
      } else if (h.kind === "moment") {
        const e = h.moment.edge;
        const wp = H.scroll.group.localToWorld(new THREE.Vector3(h.moment.x, h.moment.y + 0.8, 0.4));
        const y = e.when.when;
        H.ui.setHover(wp, "a sealing", (y < 0 ? Math.abs(y) + " BCE" : y + " CE") + " · click to read");
      } else {
        H.ui.setHover(null);
      }
    }

    /* ---------- drags (rule & cursor) ---------- */
    H.onPointerDown = () => {
      if (cer.active) { cer.speed = 6; return; }
      if (H.rig.locked) return;
      ndc.set(H.pointer.nx, H.pointer.ny);
      const h = pick();
      if (h && h.kind === "rule") H.pointer.dragging = "rule";
      else if (h && h.kind === "cursor") H.pointer.dragging = "cursor";
      if (H.pointer.dragging) H.ui.setHover(null);
    };
    H.onDrag = () => {
      ndc.set(H.pointer.nx, H.pointer.ny);
      raycaster.setFromCamera(ndc, H.camera);
      if (H.pointer.dragging === "rule") {
        if (raycaster.ray.intersectPlane(planeY0, v3)) {
          const th = Math.atan2(v3.z, v3.x);
          let t = (th + Math.PI / 2) / TAU;
          t = ((t % 1) + 1) % 1;
          H.year = M.time.tToYear(t);
          applyYear(false, {});
        }
      } else if (H.pointer.dragging === "cursor") {
        const wall = new THREE.Plane(new THREE.Vector3(0, 0, 1), -H.scroll.WALL_Z);
        if (raycaster.ray.intersectPlane(wall, v3)) {
          const local = H.scroll.group.worldToLocal(v3.clone());
          H.year = Math.min(M.NOW, H.scroll.yearOfX(local.x));
          applyYear(false, {});
        }
      }
    };

    /* ---------- clicks ---------- */
    H.onPointerUp = (e, isClick) => {
      if (!isClick || H.rig.locked) return;
      if (cer.active) return;
      ndc.set(H.pointer.nx, H.pointer.ny);
      const h = pick();
      if (!h) {
        if (sel.type) { clearSelection(); H.ui.close(); }
        return;
      }
      if (h.kind === "relic") {
        goStation(h.which === "astrolabe" ? "instrument" : "scroll");
      } else if (h.kind === "figure") {
        selectFigure(h.idx);
        const a = M.figAnchor[h.idx];
        flyToPoint(a, Math.max(6, H.rig.dSph.radius * 0.45), 1.4);
      } else if (h.kind === "shard") {
        selectShard(h.idx);
      } else if (h.kind === "joint") {
        selectJoint(h.idx);
      } else if (h.kind === "pool") {
        startCeremony();
      } else if (h.kind === "rim") {
        let t = (h.theta + Math.PI / 2) / TAU;
        t = ((t % 1) + 1) % 1;
        H.year = M.time.tToYear(t);
        applyYear(true);
      } else if (h.kind === "lane") {
        H.ui.openTradition(h.trad);
      } else if (h.kind === "moment") {
        H.ui.openSeam(h.moment.edge);
      } else if (h.kind === "wallvoid") {
        if (sel.type) { clearSelection(); H.ui.close(); }
      }
    };
    H.onWheelLocked = () => { if (cer.active) cer.speed = 6; };

    /* ---------- keys ---------- */
    addEventListener("keydown", e => {
      if (e.code === "Digit1") goStation("threshold");
      else if (e.code === "Digit2") goStation("instrument");
      else if (e.code === "Digit3") goStation("scroll");
      else if (e.code === "Space") { e.preventDefault(); if (!cer.active) startCeremony(); else cer.speed = 6; }
      else if (e.code === "Escape") { clearSelection(); H.ui.close(); }
    });

    /* ---------- the gate ---------- */
    const gate = document.getElementById("gate");
    const enterBtn = document.getElementById("gate-enter");
    enterBtn.textContent = "enter the hall";
    enterBtn.classList.add("ready");
    let entered = false;
    gate.addEventListener("click", () => {
      if (entered) return;
      entered = true;
      gate.classList.add("hidden");
      // arrival: a long slow settle onto the threshold
      H.rig.dSph.radius = 26; H.rig.dSph.phi = 1.05; H.rig.dSph.theta = -0.55;
      H.rig.sph.copy(H.rig.dSph);
      H.rig.target.set(0, 1.3, 46); H.rig.dTarget.copy(H.rig.target);
      H.rig.flyTo(POSES.threshold, 4.6, () => H.ui.hint(HINTS.threshold));
      H.ui.setStation("threshold");
    });

    /* ---------- shot mode (headless review): hall.html?shot=<station>&year=&r=&phi=&th= ---------- */
    (function () {
      const q = new URLSearchParams(location.search);
      const shot = q.get("shot");
      if (!shot) return;
      entered = true;
      visitedInstrument = true;
      gate.classList.add("hidden");
      const pose = POSES[shot] || POSES.instrument;
      const rig = H.rig;
      rig.dTarget.copy(pose.target); rig.target.copy(pose.target);
      rig.dSph.radius = +q.get("r") || pose.radius;
      rig.dSph.phi = +q.get("phi") || pose.phi;
      rig.dSph.theta = q.get("th") !== null ? +q.get("th") : pose.theta;
      rig.sph.copy(rig.dSph);
      if (shot === "scroll") { rig.panMode = "pan"; }
      if (q.get("year")) { H.year = +q.get("year"); applyYear(true); }
      (q.get("hide") || "").split(",").filter(Boolean).forEach(n => {
        const o = H.scene.getObjectByName(n); if (o) o.visible = false;
      });
      if (q.get("selShard")) selectShard(+q.get("selShard"));
      if (q.get("selFig")) selectFigure(+q.get("selFig"));
      if (q.get("selJoint")) selectJoint(+q.get("selJoint"));
      H.ui.setStation(POSES[shot] ? shot : "instrument");
    })();

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let elapsed = 0;
    function frame() {
      const dt = Math.min(0.05, clock.getDelta());
      elapsed += dt;
      H.stepTweens(dt);
      H.rig.update(dt);
      stepCeremony(dt);
      H.mater.tick(elapsed);
      H.figures.tick(elapsed, dt);
      H.threshold.tick(dt);
      if (H.dustMat) H.dustMat.uniforms.uTime.value = elapsed;
      if (H.shaftMat) H.shaftMat.uniforms.uTime.value = elapsed;
      applyHover();
      H.ui.tickHover();
      H.renderer.render(H.scene, H.camera);
      requestAnimationFrame(frame);
    }
    frame();
  };

  /* boot: wait for fonts so canvas labels are lapidary, not fallback */
  function boot() {
    const go = () => { HALL.start().catch(e => { console.error(e); const el = document.getElementById("gate-enter"); if (el) el.textContent = "something cracked — see console"; }); };
    if (document.fonts && document.fonts.ready) {
      let done = false;
      const once = () => { if (!done) { done = true; go(); } };
      document.fonts.load('46px Marcellus').then(() =>
        document.fonts.load('italic 300 26px Spectral')).then(once, once);
      document.fonts.ready.then(once, once);
      setTimeout(once, 1600);
    } else go();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
