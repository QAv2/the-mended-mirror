/* ============================================================================
   THE HALL OF AGES — the room: a planetarium lobby, and the holodeck that
   dissolves it.
   ----------------------------------------------------------------------------
   You are dropped into an almost-empty rotunda: dark stone floor, plain
   obsidian wall, a shallow dome pierced by an oculus open to the stars, one
   shaft of light falling on a plinth with two relics. The room is a veil:
   the shattered mirror already lies beneath the floor, the scroll of ages
   already rings the wall — dark, waiting.

   Choose a relic and the simulation executes: the plinth sinks, the floor
   dissolves to reveal the instrument, the wall becomes the strata of time,
   the dome opens to space. Power down and the room quietly reassembles.

   The room owns the dissolve; the conductor owns the camera.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  HALL.buildRoom = function (H) {
    const R = H.rotunda;
    const WALL_R = R.RAD - 0.22;        // lobby wall just inside the strata wall
    const WALL_H = R.WALL_H;
    const LID_Y = 0.46;                 // the lobby floor, covering the mirror

    const group = new THREE.Group();
    group.name = "room";
    H.scene.add(group);

    /* ---------- the lid: the lobby floor over the sleeping mirror ---------- */
    const lidGroup = new THREE.Group();
    group.add(lidGroup);
    // sealed / polished concrete — a real floor for the few moments it is seen
    const floorSurf = HALL.surface({ base: "#484c52", dark: "#31353b", lite: "#5a5f66", grain: 1, size: 1024 });
    [floorSurf.map, floorSurf.bumpMap, floorSurf.roughnessMap].forEach(t => t.repeat.set(6, 6));
    const lid = new THREE.Mesh(
      new THREE.CircleGeometry(WALL_R + 0.6, 96),
      new THREE.MeshStandardMaterial({
        map: floorSurf.map, bumpMap: floorSurf.bumpMap, bumpScale: 0.022,
        roughnessMap: floorSurf.roughnessMap, roughness: 0.52, metalness: 0.0,
        transparent: true,
      })
    );
    lid.rotation.x = -Math.PI / 2;
    lid.position.y = LID_Y;
    lid.name = "roomlid";
    lidGroup.add(lid);
    // gold ring inlays — the floor faintly remembers the instrument beneath
    [0.30, 0.62, 0.945].forEach(f => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(WALL_R * f, 0.016, 6, 128),
        new THREE.MeshStandardMaterial({ color: HALL.COL.gold, metalness: 1, roughness: 0.35, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.22, transparent: true })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = LID_Y + 0.012;
      lidGroup.add(ring);
    });
    // the hairline gold crack — the seam motif underfoot (the island's, kept)
    (function () {
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        pts.push(new THREE.Vector3(-7.2 + t * 13.1, LID_Y + 0.012, Math.sin(t * 5.2) * 1.1 - 0.8));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xf0c45a, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      lidGroup.add(line);
    })();
    // small inlay circle around the plinth
    const plinthRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.014, 8, 96),
      new THREE.MeshStandardMaterial({ color: HALL.COL.gold, metalness: 1, roughness: 0.3, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.35, transparent: true })
    );
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = LID_Y + 0.013;
    lidGroup.add(plinthRing);

    /* ---------- the lobby wall: plain plaster-dark, faintly articulated ---------- */
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 2048; wallCanvas.height = 512;
    (function () {
      const g = wallCanvas.getContext("2d");
      // plaster slate — dark museum stone, but STONE, not void
      const grd = g.createLinearGradient(0, 0, 0, 512);
      grd.addColorStop(0, "#262b38");
      grd.addColorStop(0.55, "#1e2230");
      grd.addColorStop(1, "#171a26");
      g.fillStyle = grd;
      g.fillRect(0, 0, 2048, 512);
      // pilaster articulation every 15 degrees
      for (let i = 0; i < 24; i++) {
        const x = (i / 24) * 2048;
        g.fillStyle = "rgba(230,236,248,0.075)";
        g.fillRect(x - 2, 26, 4, 452);
        g.fillStyle = "rgba(8,10,16,0.55)";
        g.fillRect(x + 3, 26, 2, 452);
      }
      // stone coursing — faint horizontal joints
      g.fillStyle = "rgba(8,10,16,0.30)";
      [120, 220, 320, 420].forEach(y => g.fillRect(0, y, 2048, 1.5));
      // cornice + base bands
      g.fillStyle = "rgba(240,196,90,0.22)";
      g.fillRect(0, 12, 2048, 5);
      g.fillRect(0, 492, 2048, 5);
      g.fillStyle = "rgba(230,236,248,0.10)";
      g.fillRect(0, 28, 2048, 2);
      g.fillRect(0, 482, 2048, 2);
    })();
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.encoding = THREE.sRGBEncoding;
    wallTex.wrapS = THREE.RepeatWrapping;
    const lobbyWall = new THREE.Mesh(
      new THREE.CylinderGeometry(WALL_R, WALL_R, WALL_H, 96, 1, true),
      new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92, metalness: 0.05, side: THREE.BackSide, transparent: true })
    );
    lobbyWall.position.y = WALL_H / 2;
    lobbyWall.name = "roomwall";
    group.add(lobbyWall);

    /* ---------- the dome + the oculus (the sky through the stone) ---------- */
    const OC_R = 6.5;
    const PHI_EDGE = 0.62;
    const DOME_R = WALL_R / Math.sin(PHI_EDGE);
    const PHI_MIN = Math.asin(OC_R / DOME_R);
    const domeCenterY = WALL_H - DOME_R * Math.cos(PHI_EDGE);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(DOME_R, 96, 24, 0, TAU, PHI_MIN, PHI_EDGE - PHI_MIN),
      new THREE.MeshStandardMaterial({ color: 0x232838, roughness: 0.94, metalness: 0.05, side: THREE.BackSide, transparent: true })
    );
    dome.position.y = domeCenterY;
    dome.name = "roomdome";
    group.add(dome);
    // gold oculus rim
    const ocRim = new THREE.Mesh(
      new THREE.TorusGeometry(OC_R, 0.07, 8, 96),
      new THREE.MeshStandardMaterial({ color: HALL.COL.gold, metalness: 1, roughness: 0.3, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.4, transparent: true })
    );
    ocRim.rotation.x = Math.PI / 2;
    ocRim.position.y = domeCenterY + DOME_R * Math.cos(PHI_MIN);
    group.add(ocRim);

    /* ---------- lights that belong to the room's two states ---------- */
    // the warm breath at the center of the executed room
    const heart = new THREE.PointLight(0xffe0a6, 0.0, R.RAD * 2.2, 1.6);
    heart.position.set(0, 6.5, 0);
    group.add(heart);
    // the lobby's own air — a soft cool fill so the stone reads as stone
    const air = new THREE.PointLight(0xaab4cf, 0.55, WALL_R * 3.2, 1.8);
    air.position.set(0, WALL_H * 0.62, 0);
    group.add(air);
    // a faint warm wash climbing the wall from the floor bands
    const skirt = new THREE.PointLight(0xffd98a, 0.30, WALL_R * 2.4, 2.0);
    skirt.position.set(-WALL_R * 0.45, 2.2, -WALL_R * 0.3);
    group.add(skirt);

    /* ---------- fade machinery ---------- */
    function eachFadable(g2, fn) {
      g2.traverse(o => {
        const m = o.material;
        if (!m) return;
        if (typeof m.opacity !== "number") return;
        if (m.userData._baseOp === undefined) m.userData._baseOp = m.opacity;
        fn(o, m);
      });
    }
    function fadeGroup(g2, k) {
      eachFadable(g2, (o, m) => {
        m.transparent = true;
        m.opacity = m.userData._baseOp * k;
      });
    }

    const exhibits = () => [H.mater.group, H.figures.group, H.rotunda.group];

    /* ---------- the state machine ---------- */
    let state = "lobby";     // lobby | executing | holo | powering
    let instrumentShown = true;   // the floor astrolabe (mirror + rete/figures);
                                  // suppressed when you STAND in the scroll, where
                                  // its disc would wall off the perimeter of ages
    const api = {
      group, LID_Y, WALL_R, WALL_H, heart,
      get state() { return state; },
      get holo() { return state === "holo" || state === "executing"; },
      get instrumentShown() { return instrumentShown; },
      execute, powerDown, setInstant, showInstrument,
    };

    // the wall (rotunda) is always part of the executed room; the instrument
    // (mater floor + figures/rete) is the layer we can hide for the standing view
    function applyInstrumentVis() {
      const on = (state === "holo" || state === "executing");
      H.rotunda.group.visible = on;
      H.mater.group.visible = on && instrumentShown;
      H.figures.group.visible = on && instrumentShown;
    }
    function showInstrument(on) {
      instrumentShown = on;
      applyInstrumentVis();
    }

    function lobbyVisible(k) {           // k: fade factor for the whole lobby shell
      fadeGroup(lidGroup, k);
      lobbyWall.material.opacity = k;
      dome.material.opacity = k;
      ocRim.material.opacity = Math.min(1, k * 1.15);
      air.intensity = 0.55 * k;
      skirt.intensity = 0.30 * k;
      const on = k > 0.004;
      lidGroup.visible = on; lobbyWall.visible = on; dome.visible = on; ocRim.visible = on;
    }
    function exhibitFade(k) {            // k: materialization of instrument+figures+wall
      H.rotunda.wallMat.uniforms.uFade.value = k;
      H.figures.arcMat.uniforms.uOpacity.value = k;
      fadeGroup(H.figures.group, k);
      fadeGroup(H.rotunda.group, k);     // meridian, seals (shader wall skipped — no .opacity)
      heart.intensity = 0.9 * k;
    }
    function thresholdFade(k, sink) {
      if (!H.threshold) return;          // room builds before the plinth does
      fadeGroup(H.threshold.group, k);
      H.threshold.group.position.y = LID_Y - (1 - k) * (sink === undefined ? 0.55 : sink);
      H.threshold.caseLight.intensity = 1.0 * k;
      H.threshold.group.visible = k > 0.004;
    }

    function execute(cb) {
      if (state !== "lobby") { if (cb) cb(); return; }
      state = "executing";
      // reveal the sleeping exhibits under the still-opaque shell
      // (the instrument obeys instrumentShown; the wall always comes up)
      applyInstrumentVis();
      exhibitFade(0);
      // the plinth bows out first
      H.tween(1.1, k => thresholdFade(1 - k), null, () => {});
      // the shell melts — floor, then wall, then sky
      H.tween(3.0, k => {
        const kLid = 1 - smooth(0.13, 0.66, k);
        const kWall = 1 - smooth(0.23, 0.83, k);
        const kDome = 1 - smooth(0.33, 1.0, k);
        fadeGroup(lidGroup, kLid);
        lidGroup.visible = kLid > 0.004;
        lobbyWall.material.opacity = kWall; lobbyWall.visible = kWall > 0.004;
        dome.material.opacity = kDome; dome.visible = kDome > 0.004;
        ocRim.material.opacity = kDome; ocRim.visible = kDome > 0.004;
        air.intensity = 0.55 * kWall;
        skirt.intensity = 0.30 * kLid;
        // the exhibits materialize inside the melt
        exhibitFade(smooth(0.30, 0.96, k));
      }, null, () => {
        state = "holo";
        if (cb) cb();
      });
    }

    function powerDown(cb) {
      if (state !== "holo") { if (cb) cb(); return; }
      state = "powering";
      lidGroup.visible = lobbyWall.visible = dome.visible = ocRim.visible = true;
      H.tween(2.2, k => {
        exhibitFade(1 - smooth(0.0, 0.62, k));
        const kIn = smooth(0.25, 1.0, k);
        lobbyVisible(kIn);
        thresholdFade(smooth(0.45, 1.0, k));
      }, null, () => {
        exhibits().forEach(g2 => g2.visible = false);
        lobbyVisible(1);
        thresholdFade(1);
        state = "lobby";
        if (cb) cb();
      });
    }

    function setInstant(mode) {
      if (mode === "holo") {
        state = "holo";
        applyInstrumentVis();
        exhibitFade(1);
        lobbyVisible(0);
        thresholdFade(0);
      } else {
        state = "lobby";
        exhibits().forEach(g2 => g2.visible = false);
        exhibitFade(0);
        lobbyVisible(1);
        thresholdFade(1);
      }
    }

    function smooth(a, b, x) { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); }

    H.room = api;
  };
})(typeof window !== "undefined" ? window : globalThis);
