/* ============================================================================
   THE HALL OF AGES — the conductor.
   Stations, the holodeck, picking, selection, time, and the mend ceremony.
   ----------------------------------------------------------------------------
   Three stations, one room:
     room       — the lobby: plinth + two relics under the oculus
     instrument — the holodeck executed, seen from top/center, looking down
                  at the mirror in the floor (the ceremony's vantage)
     scroll     — the holodeck executed, standing at the center, the ages
                  wrapped around you on the wall
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
    await stage("laying the mirror…");
    H.model = HALL.buildModel(root.MIRROR_DATA);
    await stage("opening the void…");
    HALL.buildScene(H);
    await stage("cutting the shards…");
    HALL.buildMater(H);
    await stage("raising the seams…");
    HALL.buildFigures(H);
    await stage("unrolling the scroll…");
    HALL.buildScroll(H);
    await stage("bending the scroll into the wall…");
    HALL.buildRotunda(H);
    await stage("building the room…");
    HALL.buildRoom(H);
    await stage("setting the plinth…");
    HALL.buildThreshold(H);
    HALL.buildUI(H);

    const M = H.model, D = M.DATA, TA = M.timeAngle;

    /* the lobby veils the exhibits until a relic is chosen */
    H.room.setInstant("lobby");

    /* ---------- stations ---------- */
    const POSES = {
      room: { target: new THREE.Vector3(0, 1.1, 0), radius: 8.5, phi: 1.28, theta: 0.35 },
      instrument: { target: new THREE.Vector3(0, 0.4, 0), radius: 27.5, phi: 0.16, theta: Math.PI + 0.45 },
    };
    const HINTS = {
      room: "drag to look &middot; <b>arrows</b> walk &middot; <b>Q/E</b> rise &amp; sink &middot; <b>click a relic</b> to run its simulation",
      instrument: "drag to turn &middot; scroll to draw close &middot; <b>arrows</b> walk &middot; <b>Q/E</b> rise &middot; <b>click what gleams</b> &middot; drag the <b>rule</b> to travel time",
      scroll: "you stand inside the ages &middot; <b>arrows</b> walk &middot; <b>Q/E</b> rise to the newest ages &middot; drag to turn &middot; drag the <b>gold meridian</b> to travel time &middot; <b>the door</b> leads back",
    };
    let station = "room";
    let visitedInstrument = false;

    function clampsFor(name) {
      const rig = H.rig;
      rig.panMode = "orbit"; rig.panClamp = null;
      if (name === "room") {
        rig.min = 2.5; rig.max = 26;
        rig.minPhi = 0.35; rig.maxPhi = 1.50;
      } else if (name === "instrument") {
        rig.min = 5; rig.max = 30;
        rig.minPhi = 0.06; rig.maxPhi = 1.32;
      }
    }

    function leavePano() {
      if (!H.rig.pano) return;
      H.rig.pano = null;
      H.rotunda.setStanding(false);
    }

    function goStation(name, dur) {
      if (name === "threshold") name = "room";        // legacy alias
      if (name === "rotunda") name = "scroll";        // legacy alias
      if (name === station && name !== "room") return;
      const rig = H.rig;
      H.ui.close();
      clearSelection();

      if (name === "room") {
        station = "room";
        H.ui.setStation("room");
        leavePano();
        clampsFor("room");
        H.room.powerDown();
        rig.flyTo(POSES.room, dur || 2.8, () => H.ui.hint(HINTS.room));
        return;
      }

      if (name === "instrument") {
        station = "instrument";
        H.ui.setStation("instrument");
        leavePano();
        clampsFor("instrument");
        H.room.showInstrument(true);
        H.room.execute();
        rig.flyTo(POSES.instrument, dur || 3.6, () => {
          H.ui.hint(HINTS.instrument);
          if (!visitedInstrument) {
            visitedInstrument = true;
            setTimeout(() => startCeremony(), 450);
          }
        });
        return;
      }

      if (name === "scroll") {
        station = "scroll";
        H.ui.setStation("scroll");
        H.room.showInstrument(false);     // stand in the ages; the floor astrolabe would occlude the perimeter
        H.room.execute();
        const eye = H.rotunda.EYE.clone();
        rig.flyTo({ target: eye, radius: 3.4, phi: 1.22, theta: rig.dSph.theta }, dur || 2.8, () => {
          rig.pano = { eye };
          rig.minPhi = 0.30; rig.maxPhi = 1.72;
          // orbit looked inward; pano gazes outward — flip to keep the view
          rig.dSph.theta += Math.PI; rig.sph.theta += Math.PI;
          rig.dSph.phi = 1.18; rig.sph.phi = 1.18;
          H.rotunda.setStanding(true);
          H.ui.hint(HINTS.scroll);
        });
        return;
      }
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
      if (H.rotunda) H.rotunda.setYear(H.year, opts);
      H.ui.setYear(H.year);
    }
    applyYear(true);

    /* ---------- the mend ceremony ---------- */
    const cer = { active: false, p: 0, dur: 26, speed: 1 };
    function startCeremony() {
      if (cer.active) return;
      if (!H.room.holo || !H.room.instrumentShown) { goStation("instrument"); return; }   // the ceremony needs the mirror bare
      clearSelection(); H.ui.close();
      cer.active = true; cer.p = 0; cer.speed = 1; cer.mid = false;
      H.ui.ceremonyLine("It was one mirror.", 4200);
      H.ui.hint("watching the mend &middot; <b>S</b> to skip &middot; click to hasten", true);
    }
    H.startCeremony = startCeremony;
    function skipCeremony() {
      if (!cer.active) return;
      cer.active = false;
      H.year = M.NOW;
      applyYear(true);
      H.figures.arcMat.uniforms.uOpacity.value = 1.0;
      setReteFade(1);
      H.ui.ceremonyLine("", 1);               // clear the current line
      H.ui.hint(HINTS[station]);
      walk.f = walk.b = walk.l = walk.r = walk.u = walk.d = 0;
    }
    H.skipCeremony = skipCeremony;
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

    function clearSelection() {
      sel.type = null; sel.id = null;
      H.figures.figSel.fill(0); H.figures.figDim.fill(0); H.figures.figHover.fill(0);
      H.mater.selV.fill(0); H.mater.hoverV.fill(0); H.mater.dimV.value = 0;
      lastHoverShard = -1; lastHoverFig = -1;
      H.figures.overlay.clear(); H.figures.threads.clear();
      H.figures.arcMat.uniforms.uOpacity.value = H.room.holo ? 1.0 : 0.0;
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
      leavePano();
      clampsFor("instrument");
      H.room.showInstrument(true);
      H.room.execute();
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

      /* the lobby: only the relics live */
      if (!H.room.holo) {
        const hits = raycaster.intersectObjects(H.threshold.pickables, false);
        for (const h of hits) {
          if (h.object.userData.kind === "relic") return { kind: "relic", which: h.object.userData.which, obj: h.object };
        }
        return null;
      }

      /* standing in the scroll: the floor astrolabe is hidden — only the wall is live */
      if (H.rig.pano) {
        const hits = raycaster.intersectObjects(H.rotunda.pickables.filter(Boolean), false);
        let mer = null, seal = null, door = null, wall = null;
        for (const h of hits) {
          const kind = h.object.userData.kind;
          if (kind === "rmeridian" && !mer) mer = h;
          else if (kind === "rmoment" && !seal) seal = h;
          else if (kind === "rdoor" && !door) door = h;
          else if (kind === "rwall" && !wall) wall = h;
        }
        if (mer) return { kind: "rmeridian" };
        if (seal) return { kind: "rmoment", edge: seal.object.userData.edge, obj: seal.object };
        if (door) return { kind: "rdoor" };
        if (wall) {
          const lane = H.rotunda.laneAt(wall.point);
          if (lane) return { kind: "rlane", trad: lane.trad, pos: lane.pos };
          return { kind: "rwallvoid" };
        }
        return null;
      }

      /* the executed room: floor exhibit + wall exhibit together */
      const objs = [H.mater.grab];
      H.figures.joints.forEach(j => objs.push(j.mesh));
      objs.push(H.figures.points);
      H.rotunda.pickables.forEach(o => objs.push(o));
      const hits = raycaster.intersectObjects(objs.filter(Boolean), false);
      let grabHit = null, jointHit = null, figHit = null;
      let mer = null, seal = null, door = null, wall = null;
      for (const h of hits) {
        const kind = h.object.userData.kind;
        if (kind === "rule" && !grabHit) grabHit = h;
        else if (kind === "joint" && !jointHit) jointHit = h;
        else if (h.object === H.figures.points && !figHit) figHit = h;
        else if (kind === "rmeridian" && !mer) mer = h;
        else if (kind === "rmoment" && !seal) seal = h;
        else if (kind === "rdoor" && !door) door = h;
        else if (kind === "rwall" && !wall) wall = h;
      }
      if (grabHit) return { kind: "rule" };
      if (mer) return { kind: "rmeridian" };
      if (jointHit) return { kind: "joint", idx: jointHit.object.userData.joint, obj: jointHit.object };
      if (figHit && figHit.index !== undefined && H.figures.isLit(figHit.index)) {
        return { kind: "figure", idx: figHit.index };
      }
      if (seal) return { kind: "rmoment", edge: seal.object.userData.edge, obj: seal.object };
      // the floor: analytic mater pick (shards, pool, rim calendar)
      const t = raycaster.ray.intersectPlane(planeY0, v3);
      if (t) {
        const res = shardAtPlane(v3.x, v3.z);
        if (res) return res;
      }
      if (door) return { kind: "rdoor" };
      if (wall) {
        const lane = H.rotunda.laneAt(wall.point);
        if (lane) return { kind: "rlane", trad: lane.trad, pos: lane.pos };
        return { kind: "rwallvoid" };
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
      } else if (h.kind === "rule" || h.kind === "rmeridian") {
        H.ui.setHover(null);
      } else if (h.kind === "rlane") {
        const t = D.traditions[h.trad];
        const p = t.period || {};
        const years = (p.from < 0 ? Math.abs(p.from).toLocaleString() + " BCE" : p.from + " CE") + " — " + (p.living ? "living" : (p.to < 0 ? Math.abs(p.to) + " BCE" : p.to + " CE"));
        H.ui.setHover(h.pos, t.name, years, t.color);
      } else if (h.kind === "rmoment") {
        const p = new THREE.Vector3(); h.obj.getWorldPosition(p); p.y += 0.8;
        const y = h.edge.when.when;
        H.ui.setHover(p, "a sealing", (y < 0 ? Math.abs(y) + " BCE" : y + " CE") + " · click to read");
      } else if (h.kind === "rdoor") {
        const p = new THREE.Vector3(Math.cos(TA.DOOR_CENTER), 0, Math.sin(TA.DOOR_CENTER)).multiplyScalar(H.rotunda.RAD - 2.5);
        p.y = 3.2;
        H.ui.setHover(p, "the prophesied", "the way back to the room");
      } else {
        H.ui.setHover(null);
      }
    }

    /* ---------- drags (rule & meridian are the same hand) ---------- */
    H.onPointerDown = () => {
      if (cer.active) { cer.speed = 6; return; }
      if (H.rig.locked) return;
      ndc.set(H.pointer.nx, H.pointer.ny);
      const h = pick();
      if (h && h.kind === "rule") H.pointer.dragging = "rule";
      else if (h && h.kind === "rmeridian") H.pointer.dragging = "rmeridian";
      if (H.pointer.dragging) H.ui.setHover(null);
    };
    H.onDrag = () => {
      ndc.set(H.pointer.nx, H.pointer.ny);
      raycaster.setFromCamera(ndc, H.camera);
      if (H.pointer.dragging === "rule") {
        if (raycaster.ray.intersectPlane(planeY0, v3)) {
          H.year = TA.yearOfAngle(Math.atan2(v3.z, v3.x));
          applyYear(false, {});
        }
      } else if (H.pointer.dragging === "rmeridian") {
        const hits = raycaster.intersectObjects(H.rotunda.pickables.filter(o => o.userData.kind === "rwall"), false);
        if (hits.length) {
          H.year = Math.min(M.NOW, H.rotunda.yearAt(hits[0].point));
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
        if (!H.rig.pano) flyToPoint(a, Math.max(6, H.rig.dSph.radius * 0.45), 1.4);
      } else if (h.kind === "shard") {
        selectShard(h.idx);
      } else if (h.kind === "joint") {
        selectJoint(h.idx);
      } else if (h.kind === "pool") {
        startCeremony();
      } else if (h.kind === "rim") {
        H.year = TA.yearOfAngle(h.theta);
        applyYear(true);
      } else if (h.kind === "rlane") {
        H.ui.openTradition(h.trad);
      } else if (h.kind === "rmoment") {
        H.ui.openSeam(h.edge);
      } else if (h.kind === "rdoor") {
        goStation("room");
      } else if (h.kind === "rwallvoid") {
        if (sel.type) { clearSelection(); H.ui.close(); }
      }
    };
    H.onWheelLocked = () => { if (cer.active) cer.speed = 6; };

    /* ---------- keys ---------- */
    addEventListener("keydown", e => {
      if (e.code === "Digit1") goStation("room");
      else if (e.code === "Digit2") goStation("instrument");
      else if (e.code === "Digit3" || e.code === "Digit4") goStation("scroll");
      else if (e.code === "Space") { e.preventDefault(); if (!cer.active) startCeremony(); else cer.speed = 6; }
      else if (e.code === "KeyS" && cer.active) { skipCeremony(); }   // skip the mend
      else if (e.code === "Escape") { clearSelection(); H.ui.close(); }
    });

    /* ---------- walking (arrow keys / WASD) ----------
       In the scroll you stand and actually walk the floor; in the orbit
       stations the same keys glide the pivot across the room. */
    const walk = { f: 0, b: 0, l: 0, r: 0, u: 0, d: 0 };
    function walkAxis(code) {
      if (code === "ArrowUp" || code === "KeyW") return "f";
      if (code === "ArrowDown" || code === "KeyS") return "b";
      if (code === "ArrowLeft" || code === "KeyA") return "l";
      if (code === "ArrowRight" || code === "KeyD") return "r";
      if (code === "KeyE" || code === "PageUp") return "u";     // rise
      if (code === "KeyQ" || code === "PageDown") return "d";   // descend
      return null;
    }
    addEventListener("keydown", e => { const k = walkAxis(e.code); if (k) { walk[k] = 1; e.preventDefault(); } });
    addEventListener("keyup",   e => { const k = walkAxis(e.code); if (k) { walk[k] = 0; } });
    const _wf = new THREE.Vector3(), _wr = new THREE.Vector3(), _wm = new THREE.Vector3();
    function walkStep(dt) {
      if (!entered || H.rig.locked || cer.active) return;   // no walking during the mend cutscene
      const f = walk.f - walk.b, s = walk.r - walk.l, v = walk.u - walk.d;
      if (!f && !s && !v) return;
      const rig = H.rig;
      const spd = (rig.pano ? 7.5 : 12) * dt;                  // units / second
      // horizontal move along the camera's forward & right, flattened to the floor
      _wf.setFromMatrixColumn(H.camera.matrixWorld, 2).multiplyScalar(-1); _wf.y = 0;
      _wr.setFromMatrixColumn(H.camera.matrixWorld, 0); _wr.y = 0;
      if (_wf.lengthSq() < 1e-6) _wf.set(0, 0, -1);
      _wf.normalize(); _wr.normalize();
      _wm.set(0, 0, 0).addScaledVector(_wf, f).addScaledVector(_wr, s);
      if (_wm.lengthSq() > 1) _wm.normalize();                 // no diagonal speed-up (horizontal only)
      _wm.multiplyScalar(spd);
      const vstep = v * spd;                                   // vertical is its own axis (Q/E · PageUp/Dn)
      if (rig.pano) {
        const e = rig.pano.eye;
        e.x += _wm.x; e.z += _wm.z; e.y += vstep;
        const maxR = H.rotunda.RAD - 1.3, r = Math.hypot(e.x, e.z);
        if (r > maxR) { const q = maxR / r; e.x *= q; e.z *= q; }              // stay inside the wall
        e.y = Math.max(1.0, Math.min(H.rotunda.WALL_H - 1.5, e.y));            // rise to the newest shards up top
      } else {
        rig.dTarget.x += _wm.x; rig.dTarget.z += _wm.z; rig.dTarget.y += vstep;
        const lim = (H.rotunda ? H.rotunda.RAD : 30) - 3, r = Math.hypot(rig.dTarget.x, rig.dTarget.z);
        if (r > lim) { const q = lim / r; rig.dTarget.x *= q; rig.dTarget.z *= q; }
        rig.dTarget.y = Math.max(0.2, Math.min((H.rotunda ? H.rotunda.WALL_H : 30) - 1, rig.dTarget.y));
        rig.clampGoals();
      }
    }

    /* ---------- the gate ---------- */
    const gate = document.getElementById("gate");
    const enterBtn = document.getElementById("gate-enter");
    enterBtn.textContent = "enter the room";
    enterBtn.classList.add("ready");
    let entered = false;
    gate.addEventListener("click", () => {
      if (entered) return;
      entered = true;
      gate.classList.add("hidden");
      // arrival: a long slow settle down toward the plinth
      H.rig.dSph.radius = 24; H.rig.dSph.phi = 0.85; H.rig.dSph.theta = -0.55;
      H.rig.sph.copy(H.rig.dSph);
      H.rig.target.set(0, 1.3, 0); H.rig.dTarget.copy(H.rig.target);
      clampsFor("room");
      H.rig.flyTo(POSES.room, 4.6, () => H.ui.hint(HINTS.room));
      H.ui.setStation("room");
    });

    /* ---------- shot mode (headless review) ----------
       hall.html?shot=room|instrument|scroll[&year=][&r=&phi=&th=][&selShard=…] */
    (function () {
      const q = new URLSearchParams(location.search);
      let shot = q.get("shot");
      if (!shot) return;
      if (shot === "threshold") shot = "room";
      if (shot === "rotunda") shot = "scroll";
      entered = true;
      visitedInstrument = true;
      gate.classList.add("hidden");
      const rig = H.rig;
      if (shot === "scroll") {
        H.room.setInstant("holo");
        H.room.showInstrument(false);
        station = "scroll";
        rig.pano = { eye: H.rotunda.EYE.clone() };
        rig.minPhi = 0.30; rig.maxPhi = 1.72;
        rig.dSph.theta = q.get("th") !== null ? +q.get("th") : Math.PI;
        rig.dSph.phi = +q.get("phi") || 1.18;
        rig.sph.copy(rig.dSph);
        if (q.get("year")) { H.year = +q.get("year"); applyYear(true); }
        H.ui.setStation("scroll");
      } else {
        H.room.setInstant(shot === "room" ? "lobby" : "holo");
        station = shot;
        const pose = POSES[shot] || POSES.instrument;
        clampsFor(station);
        rig.dTarget.copy(pose.target); rig.target.copy(pose.target);
        rig.dSph.radius = +q.get("r") || pose.radius;
        rig.dSph.phi = +q.get("phi") || pose.phi;
        rig.dSph.theta = q.get("th") !== null ? +q.get("th") : pose.theta;
        rig.sph.copy(rig.dSph);
        if (q.get("year")) { H.year = +q.get("year"); applyYear(true); }
        H.ui.setStation(station);
      }
      (q.get("hide") || "").split(",").filter(Boolean).forEach(n => {
        const o = H.scene.getObjectByName(n); if (o) o.visible = false;
      });
      if (q.get("selShard")) selectShard(+q.get("selShard"));
      if (q.get("selFig")) selectFigure(+q.get("selFig"));
      if (q.get("selJoint")) selectJoint(+q.get("selJoint"));
    })();

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let elapsed = 0;
    function frame() {
      const dt = Math.min(0.05, clock.getDelta());
      elapsed += dt;
      H.stepTweens(dt);
      walkStep(dt);
      H.rig.update(dt);
      stepCeremony(dt);
      H.mater.tick(elapsed);
      H.figures.tick(elapsed, dt);
      H.threshold.tick(dt);
      H.rotunda.tick(dt, elapsed);
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
