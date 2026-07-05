/* ============================================================================
   THE HALL OF AGES — the Rotunda of Ages: the scroll bent until its ends meet.
   ----------------------------------------------------------------------------
   THE WALL OF THE ROOM. The 219 strata lanes wrap the full interior
   circumference at the instrument's exterior diameter — oldest at the floor,
   time sweeping the circle. The seam where the scroll's ends meet is the
   segment the flat scroll reserved for THE PROPHESIED: the door. It sits at
   the rim calendar's wrap point, so the door on the wall and the sealed arc
   on the floor are the same interval — the one history hasn't written.

   Angle IS time, shared: M.timeAngle drives the rule on the floor, the rim
   calendar, and the meridian here — the rule always points at the meridian.

   Craft: the entire strata field (lanes, eras, labels, door) is painted into
   ONE canvas texture on ONE open cylinder — a single draw call. The fragment
   shader samples the canvas BY WORLD BEARING (fract(atan(z,x)/TAU)), so the
   paint frame and the world agree by construction — no mirror bookkeeping.

   On touch devices the room runs on the gyroscope: you physically turn, and
   the phone becomes a window into the chamber.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  HALL.buildRotunda = function (H) {
    const M = H.model, D = M.DATA;
    const S = H.scroll;                       // the scroll's brain — ranks / lanes / moments
    const TA = M.timeAngle;                   // the one hand

    /* ---------- geometry of the wall (shared measures: HALL.dims) ---------- */
    const RAD = H.dims.RAD;                         // the instrument's exterior diameter
    const Y0R = H.dims.Y0R;                         // first lane above the floor
    const H_TOPR = H.dims.H_TOPR;
    const WALL_H = H.dims.WALL_H;                   // cornice headroom included
    const EYE = H.dims.EYE;                         // where you stand for the scroll
    const yW = y => Y0R + (y - S.Y0);               // scroll frame → wall frame

    /* bearings (atan2(z,x) — same frame as the rim calendar and the rule) */
    const angleOfYear = y => TA.angleOfYear(y);
    const yearOfAngle = b => TA.yearOfAngle(b);
    const SFRAC = y => M.time.yearToT(Math.min(M.NOW, y));
    function posAt(b, y, rOff) {
      const r = RAD - (rOff || 0);
      return new THREE.Vector3(Math.cos(b) * r, y, Math.sin(b) * r);
    }
    const faceWall = b => Math.PI / 2 - b;          // rotation.y: local +z → outward

    const group = new THREE.Group();
    H.scene.add(group);

    /* ---------- the strata field: one canvas, one cylinder ---------- */
    const W = Math.min(HALL.texSize(8192, 2048), HALL.Q.maxTex), Hc = HALL.texSize(2048, 512);
    const px = b => (((b % TAU) + TAU) % TAU) / TAU * W;   // canvas x of a bearing
    const py = y => Hc - (y / WALL_H) * Hc;                // canvas y of a height
    const pxYear = y => px(angleOfYear(y));
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = Hc;
    (function paint() {
      const g = canvas.getContext("2d");
      g.fillStyle = "#0a0c11";
      g.fillRect(0, 0, W, Hc);

      /* spans go time-forward; px may wrap once across the 0 seam */
      function spanRect(thA, thB, y0, y1, fill) {
        let xa = px(thA), xb = px(thB);
        g.fillStyle = fill;
        if (xb >= xa) g.fillRect(xa, y1, xb - xa, y0 - y1);
        else { g.fillRect(xa, y1, W - xa, y0 - y1); g.fillRect(0, y1, xb, y0 - y1); }
      }
      function midX(thA, thB) {                      // circular midpoint, time-forward
        let a = px(thA), b = px(thB);
        if (b < a) b += W;
        return ((a + b) / 2) % W;
      }

      /* eras: alternating breath + gold boundary hairlines + names */
      M.ERAS.forEach((e, i) => {
        const tha = angleOfYear(e.from), thb = angleOfYear(Math.min(e.to, M.NOW));
        if (i % 2 === 1) spanRect(tha, thb, py(0), py(H_TOPR + 1.2), "rgba(205,210,220,0.022)");
        const xa = px(tha);
        g.strokeStyle = "rgba(240,196,90,0.20)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(xa, py(H_TOPR + 1.6)); g.lineTo(xa, py(0.4)); g.stroke();
        // era name high on the wall
        g.fillStyle = "rgba(240,196,90,0.58)";
        g.font = "44px Marcellus, Georgia, serif";
        g.textAlign = "center";
        g.fillText(e.name, midX(tha, thb), py(H_TOPR + 0.55));
        // year at the boundary, near the floor
        const yr = e.from < 0 ? Math.abs(e.from).toLocaleString() + " BCE" : e.from + " CE";
        g.fillStyle = "rgba(130,139,156,0.8)";
        g.font = "300 26px Spectral, Georgia, serif";
        g.fillText(yr, xa, py(1.15));
      });

      /* NOW jamb */
      const xn = pxYear(M.NOW);
      g.strokeStyle = "rgba(255,228,154,0.55)"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(xn, py(H_TOPR + 1.6)); g.lineTo(xn, py(0.4)); g.stroke();
      g.fillStyle = "rgba(255,228,154,0.9)";
      g.font = "300 28px Spectral, Georgia, serif";
      g.textAlign = "center";
      g.fillText("now", xn, py(1.15));

      /* the band cornices — the geology the lanes sit in. Each birth-era
         band is parted from the next by a string course; its name runs in
         the gap, repeated around the circle so any bearing can read it. */
      const gapPx = Math.max(10, (0.55 / WALL_H) * Hc);
      S.bands.forEach((bd, bi) => {
        // a whisper of alternating tint so each stratum reads as one body
        if (bi % 2 === 1) {
          g.fillStyle = "rgba(205,210,220,0.018)";
          g.fillRect(0, py(yW(bd.y1)), W, py(yW(bd.y0)) - py(yW(bd.y1)));
        }
        // string course under the band's foot
        const yLine = py(yW(bd.y0) - 0.10);
        g.strokeStyle = "rgba(240,196,90,0.16)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, yLine); g.lineTo(W, yLine); g.stroke();
        // the era's name, small and patient, every sixth of the circle
        g.fillStyle = "rgba(240,196,90,0.34)";
        g.font = "300 " + Math.round(gapPx * 0.82) + "px Spectral, Georgia, serif";
        g.textAlign = "left";
        for (let rep = 0; rep < 6; rep++)
          g.fillText(bd.eras.toUpperCase(), (rep / 6) * W + 30, yLine - gapPx * 0.25);
      });

      /* the lanes — every tradition a ring-segment of its life, its height
         weighted by the roster it carries */
      const CERT_A = { attested: 1.0, inferred: 0.62, reconstructed: 0.5, contested: 0.42, deep: 0.62, prophesied: 0.3 };
      function spanY(thA, thB, yC, h, fill) {
        let xa = px(thA), xb = px(thB);
        g.fillStyle = fill;
        if (xb >= xa) g.fillRect(xa, yC - h / 2, Math.max(1.5, xb - xa), h);
        else { g.fillRect(xa, yC - h / 2, W - xa, h); g.fillRect(0, yC - h / 2, xb, h); }
      }
      S.ranked.forEach((rk, i) => {
        const t = D.traditions[rk.k], p = rk.p;
        const a = (CERT_A[p.certainty] || 0.8) * 0.62;
        const yC = py(yW(S.laneY[i]));
        const from = p.from !== undefined ? p.from : -1000;
        const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
        const c = new THREE.Color(t.color);
        const rgba = k => `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${k})`;
        const h = Math.max(2.5, (S.laneH[i] * 0.74 / WALL_H) * Hc);
        spanY(angleOfYear(from), angleOfYear(Math.min(to, M.NOW)), yC, h, rgba(a));
        // birth tick
        const xb = pxYear(from);
        g.fillStyle = rgba(Math.min(1, a * 1.9));
        g.fillRect(xb - 4, yC - h * 0.75, 5, h * 1.5);
        // peak bead
        if (p.peak !== undefined && p.peak <= M.NOW) {
          const xp = pxYear(p.peak);
          g.fillStyle = rgba(Math.min(1, a * 2.4));
          g.fillRect(xp - 5, yC - h * 0.85, 10, h * 1.7);
        }
        // living: bright cap at the now jamb
        if (p.living) { g.fillStyle = rgba(1); g.fillRect(xn - 10, yC - h * 0.65, 10, h * 1.3); }
      });

      /* the door — the prophesied. A sealed arch of gold seams on dark.
         It spans NOW jamb → deep-past jamb: the calendar's wrap, widened. */
      const doorL = pxYear(M.NOW), doorR = px(TA.START);
      function doorSpan(cb) {   // iterate the door zone (may wrap)
        if (doorR >= doorL) cb(doorL, doorR);
        else { cb(doorL, W); cb(0, doorR); }
      }
      doorSpan((x0, x1) => { g.fillStyle = "rgba(4,5,8,0.92)"; g.fillRect(x0, py(H_TOPR + 2.2), x1 - x0, py(0) - py(H_TOPR + 2.2)); });
      // gold seam outline
      g.strokeStyle = "rgba(240,196,90,0.5)"; g.lineWidth = 4;
      [doorL, doorR].forEach(x => { g.beginPath(); g.moveTo(x, py(0)); g.lineTo(x, py(H_TOPR + 2.0)); g.stroke(); });
      // lintel arc
      g.beginPath();
      doorSpan((x0, x1) => { g.moveTo(x0, py(H_TOPR + 2.0)); g.lineTo(x1, py(H_TOPR + 2.0)); });
      g.stroke();
      // the legend of the door
      const xdMid = (function () { let a = doorL, b = doorR; if (b < a) b += W; return ((a + b) / 2) % W; })();
      g.fillStyle = "rgba(200,180,130,0.7)";
      g.font = "italic 300 40px Spectral, Georgia, serif";
      g.textAlign = "center";
      g.fillText("the prophesied", xdMid, py(H_TOPR * 0.52));
      g.font = "300 26px Spectral, Georgia, serif";
      g.fillStyle = "rgba(130,139,156,0.7)";
      g.fillText("the one interval history has not written — the way back out", xdMid, py(H_TOPR * 0.52 - 1.4));
      // title above the lintel — the baseline keeps its ascenders inside the
      // canvas at any wall height (they clipped at catalog scale)
      g.fillStyle = "rgba(255,228,154,0.85)";
      const titleFs = Math.min(58, Math.floor((py(H_TOPR + 2.1)) * 0.55));
      g.font = titleFs + "px Marcellus, Georgia, serif";
      g.fillText("The Scroll of Ages", xdMid, py(H_TOPR + 2.1) * 0.8);
    })();

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = HALL.Q.aniso;
    tex.wrapS = THREE.RepeatWrapping;

    const wallMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, fog: false,
      uniforms: {
        uMap: { value: tex },
        uCursorP: { value: 1.0 },          // time progress 0..1 of the meridian
        uCeremony: { value: 0.0 },
        uFade: { value: 1.0 },             // the holodeck materializing
      },
      vertexShader: `
        varying vec2 vUv; varying vec3 vW;
        void main(){
          vUv = uv;
          vW = (modelMatrix * vec4(position,1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        varying vec2 vUv; varying vec3 vW;
        uniform sampler2D uMap; uniform float uCursorP; uniform float uCeremony; uniform float uFade;
        const float TAU = 6.28318530718;
        const float TA_START = ${TA.START.toFixed(6)};
        const float TA_SPAN = ${TA.SPAN.toFixed(6)};
        void main(){
          float b = atan(vW.z, vW.x);
          /* sample the paint by world bearing — frame and world agree by construction */
          vec2 suv = vec2(fract(b / TAU), vUv.y);
          vec4 c = texture2D(uMap, suv);
          /* the wall ahead of the meridian in time waits in the dark */
          float d = mod(b - TA_START, TAU);
          float lit = 1.0;
          if (d <= TA_SPAN) {
            float p = d / TA_SPAN;
            lit = mix(1.0, 0.22, smoothstep(uCursorP - 0.002, uCursorP + 0.015, p));
          }
          c.rgb *= lit;
          c.rgb += vec3(1.0, 0.86, 0.55) * uCeremony * 0.05;
          c.rgb *= uFade;
          gl_FragColor = c;
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
    });
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(RAD, RAD, WALL_H, HALL.segN(160, 64), 1, true),
      wallMat
    );
    wall.position.y = WALL_H / 2;
    wall.name = "stratawall";
    group.add(wall);

    /* invisible pick cylinder (slightly inside the wall so rays land cleanly) */
    const pickWall = new THREE.Mesh(
      new THREE.CylinderGeometry(RAD - 0.05, RAD - 0.05, WALL_H, 48, 1, true),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.BackSide })
    );
    pickWall.position.y = WALL_H / 2;
    pickWall.userData.kind = "rwall";
    group.add(pickWall);

    /* ---------- the meridian: the rule turned vertical ---------- */
    const meridian = new THREE.Group();
    group.add(meridian);
    const merLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, H_TOPR + 1.6, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xffe49a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    merLine.position.y = (H_TOPR + 1.6) / 2 + 0.4;
    meridian.add(merLine);
    const merKnob = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12),
      new THREE.MeshStandardMaterial({ color: HALL.COL.goldBright, metalness: 1, roughness: 0.25, emissive: HALL.COL.gold, emissiveIntensity: 0.6 }));
    merKnob.position.y = 1.5;
    meridian.add(merKnob);
    const merGrab = new THREE.Mesh(new THREE.BoxGeometry(1.8, H_TOPR + 2.5, 1.4), new THREE.MeshBasicMaterial({ visible: false }));
    merGrab.position.y = (H_TOPR + 2.5) / 2;
    merGrab.userData.kind = "rmeridian";
    meridian.add(merGrab);
    function placeMeridian(y) {
      const b = angleOfYear(Math.min(y, M.NOW));
      meridian.position.set(Math.cos(b) * (RAD - 0.35), 0, Math.sin(b) * (RAD - 0.35));
      meridian.rotation.y = faceWall(b);
    }

    /* ---------- the twelve seals, hanging in the air of the room ---------- */
    const sealC = {};
    Object.keys(D.tiers).forEach(k => sealC[k] = new THREE.Color(D.tiers[k].gold));
    const rMoments = [];
    const OFF = 1.7;                                   // float off the wall — a constellation, not a decal
    S.moments.forEach(m => {
      const e = m.edge;
      const b = angleOfYear(e.when.when);
      const hMid = Y0R + ((m.ya + m.yb) / 2 - S.Y0);   // same lane heights, our floor offset
      const c = sealC[e.tier] || sealC["2"];
      const g2 = new THREE.Group();
      g2.position.copy(posAt(b, hMid, OFF));
      g2.rotation.y = faceWall(b);                     // local +z → toward the wall
      const dia = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.30, 0),
        new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: 0.3, emissive: c, emissiveIntensity: 0.55 })
      );
      g2.add(dia);
      // hairline back to the wall between its two lanes
      const hy0 = Y0R + (Math.min(m.ya, m.yb) - S.Y0), hy1 = Y0R + (Math.max(m.ya, m.yb) - S.Y0);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, hy0 - hMid, OFF - 0.1),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, hy1 - hMid, OFF - 0.1),
      ]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
        color: c, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      g2.add(line);
      const grab = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      grab.userData = { kind: "rmoment", edge: e };
      g2.add(grab);
      group.add(g2);
      rMoments.push({ group: g2, dia, edge: e, b });
    });

    /* ---------- the beads: every figure a mote on its lane ----------
       Positions are LAYOUT, not data (9 of 4,106 figures carry dates — too
       few to place honestly): each roster spreads evenly across its lane's
       written life, staggered into 2–3 rows where the arc runs tight (13
       traditions need it; the worst is 11 figures on one world-unit). Beads
       are the wall's pick targets for figures — the conductor finds them by
       projected screen distance, so every bead stays individually reachable
       at eye distance no matter the crowd. */
    const beadWorld = [];                              // flat xyz, world
    const beadFig = [];                                // bead → figure index
    const BEAD_OFF = 0.16;                             // proud of the paint, shy of the seals
    (function layBeads() {
      const pos = [], col = [], size = [], tArr = [];
      const cc = new THREE.Color();
      S.ranked.forEach((rk, i) => {
        const figs = M.figsOfTrad[rk.k] || [];
        if (!figs.length) return;
        const p = rk.p;
        const from = p.from !== undefined ? p.from : -1000;
        const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
        const t0 = M.time.yearToT(from), t1 = Math.max(t0 + 0.004, M.time.yearToT(Math.min(to, M.NOW)));
        const arc = (t1 - t0) * TA.SPAN * RAD;
        const rows = Math.min(3, Math.max(1, Math.ceil((figs.length * 0.30) / Math.max(arc, 0.3))));
        const nCol = Math.ceil(figs.length / rows);
        const yLane = yW(S.laneY[i]);
        const hLane = S.laneH[i];
        cc.set(D.traditions[rk.k].color).convertSRGBToLinear();
        const s = Math.max(0.55, Math.min(1.05, 5.5 * hLane)) * (rows > 1 ? 0.82 : 1);
        figs.forEach((fi, j) => {
          const row = Math.floor(j / nCol), colI = j % nCol;
          const tt = t0 + (t1 - t0) * ((colI + 0.5 + row * 0.33) / nCol);
          const b = TA.angleOfT(Math.min(tt, 1));
          const y = yLane + (rows > 1 ? (row - (rows - 1) / 2) * (hLane * 0.56 / (rows - 1)) : 0);
          const r = RAD - BEAD_OFF;
          const x = Math.cos(b) * r, z = Math.sin(b) * r;
          pos.push(x, y, z);
          col.push(cc.r, cc.g, cc.b);
          size.push(s);
          tArr.push(Math.min(tt, 1));
          beadWorld.push(x, y, z);
          beadFig.push(fi);
        });
      });
      const idx = new Float32Array(beadFig.length);
      for (let i = 0; i < idx.length; i++) idx[i] = i;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      geo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
      geo.setAttribute("aT", new THREE.Float32BufferAttribute(tArr, 1));
      geo.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
      geo.computeBoundingSphere();
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, vertexColors: true,
        uniforms: {
          uCursorP: { value: 1.0 },                 // shares the wall's dark-ahead rule
          uHot: { value: -1 },                      // hovered bead index
          uOpacity: { value: 1.0 },
          uPx: { value: H.renderer.getPixelRatio() },
        },
        vertexShader: `
          attribute float aSize; attribute float aT; attribute float aIdx;
          varying vec3 vColor; varying float vLit; varying float vHot;
          uniform float uCursorP; uniform float uPx; uniform float uHot;
          void main(){
            vColor = color;
            vLit = mix(1.0, 0.22, smoothstep(uCursorP - 0.002, uCursorP + 0.015, aT));
            vHot = (abs(aIdx - uHot) < 0.5) ? 1.0 : 0.0;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uPx * aSize * (1.0 + vHot * 0.6) * (46.0 / max(2.0, -mv.z));
          }`,
        fragmentShader: `
          varying vec3 vColor; varying float vLit; varying float vHot;
          uniform float uOpacity;
          void main(){
            vec2 q = gl_PointCoord - 0.5;
            float d = length(q);
            if (d > 0.5) discard;
            float core = smoothstep(0.42, 0.12, d);
            vec3 c = vColor * (0.55 + 0.75 * core) + vec3(1.0, 0.93, 0.75) * vHot * core * 0.8;
            gl_FragColor = vec4(c * vLit, core * (0.55 + 0.45 * vLit) * uOpacity);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }`,
      });
      const beads = new THREE.Points(geo, mat);
      beads.name = "wallbeads";
      beads.frustumCulled = false;
      group.add(beads);
      H._beadMat = mat;
    })();

    /* the drawn door is also pickable — the way back to the room */
    const doorGrab = new THREE.Mesh(
      new THREE.PlaneGeometry(RAD * TA.DOOR_A * 0.9, H_TOPR),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    doorGrab.position.copy(posAt(TA.DOOR_CENTER, H_TOPR / 2, 0.2));
    doorGrab.rotation.y = faceWall(TA.DOOR_CENTER);
    doorGrab.userData.kind = "rdoor";
    group.add(doorGrab);

    /* ============================================================
       the camera: gyroscope for standing inside (touch devices)
       ============================================================ */
    const gyro = {
      supported: typeof DeviceOrientationEvent !== "undefined",
      active: false, hasData: false,
      quat: new THREE.Quaternion(),
      yawOffset: 0,
      _zee: new THREE.Vector3(0, 0, 1),
      _euler: new THREE.Euler(),
      _q0: new THREE.Quaternion(),
      _q1: new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)),
      _qYaw: new THREE.Quaternion(),
    };
    function onOrient(e) {
      if (e.alpha === null || e.alpha === undefined) return;
      const alpha = THREE.MathUtils.degToRad(e.alpha);
      const beta = THREE.MathUtils.degToRad(e.beta || 0);
      const gamma = THREE.MathUtils.degToRad(e.gamma || 0);
      const orient = THREE.MathUtils.degToRad((screen.orientation && screen.orientation.angle) || 0);
      gyro._euler.set(beta, alpha, -gamma, "YXZ");
      gyro.quat.setFromEuler(gyro._euler);
      gyro.quat.multiply(gyro._q1);
      gyro.quat.multiply(gyro._q0.setFromAxisAngle(gyro._zee, -orient));
      gyro.hasData = true;
    }
    function enableGyro() {
      const arm = () => {
        addEventListener("deviceorientation", onOrient, true);
        gyro.active = true;
        if (motionBtn) motionBtn.classList.add("on");
      };
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(r => { if (r === "granted") arm(); }).catch(() => {});
      } else arm();
    }
    function disableGyro() {
      removeEventListener("deviceorientation", onOrient, true);
      gyro.active = false; gyro.hasData = false;
      if (motionBtn) motionBtn.classList.remove("on");
    }

    /* the motion button lives only while you stand in the scroll, on touch
       (reused across GPU rent/return rebuilds — the DOM survives the scene) */
    let motionBtn = null;
    if (gyro.supported && matchMedia("(pointer:coarse)").matches) {
      motionBtn = document.getElementById("motion-btn");
      if (!motionBtn) {
        motionBtn = document.createElement("button");
        motionBtn.id = "motion-btn";
        motionBtn.textContent = "◉ turn with me";
        motionBtn.title = "let the phone become a window — turn your body to turn the room";
        document.body.appendChild(motionBtn);
      }
      motionBtn.onclick = () => gyro.active ? disableGyro() : enableGyro();
    }
    function setStanding(on) {
      if (motionBtn) motionBtn.classList.toggle("here", !!on);
      if (!on) disableGyro();
    }

    /* ---------- per-frame ---------- */
    const _qY = new THREE.Quaternion(), _yAxis = new THREE.Vector3(0, 1, 0);
    function tick(dt, elapsed) {
      if (!group.visible) return;
      // the room's fade machinery writes .opacity on materials — the bead
      // shader reads it through its own uniform
      if (H._beadMat) H._beadMat.uniforms.uOpacity.value = H._beadMat.opacity;
      // seals breathe
      for (let i = 0; i < rMoments.length; i++) {
        rMoments[i].dia.rotation.y += dt * 0.4;
        rMoments[i].dia.position.y = Math.sin(elapsed * 0.6 + i * 1.7) * 0.08;
      }
      // gyro drives the camera directly (drag-yaw folded in as an offset)
      if (gyro.active && gyro.hasData && H.rig.pano) {
        H.camera.position.copy(EYE);
        _qY.setFromAxisAngle(_yAxis, gyro.yawOffset);
        H.camera.quaternion.copy(_qY).multiply(gyro.quat);
      }
    }

    /* ---------- year hand ---------- */
    function setYear(y, opts) {
      placeMeridian(y);
      wallMat.uniforms.uCursorP.value = SFRAC(y);
      wallMat.uniforms.uCeremony.value = (opts && opts.ceremony) ? 1.0 : 0.0;
      if (H._beadMat) H._beadMat.uniforms.uCursorP.value = SFRAC(y);   // beads share the dark-ahead rule
    }
    setYear(M.NOW);

    /* ---------- picking helpers for the conductor ---------- */
    function laneAt(worldPoint) {
      const b = Math.atan2(worldPoint.z, worldPoint.x);
      const yr = yearOfAngle(b);
      const i = S.rankAtY(worldPoint.y - Y0R + S.Y0);   // wall frame → scroll frame
      if (i === null) return null;
      const rk = S.ranked[i], p = rk.p;
      const from = p.from !== undefined ? p.from : -1000;
      const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
      if (yr < from - 80 || yr > to + 80) return null;
      return { trad: rk.k, pos: posAt(b, yW(S.laneY[i]), 0.3) };
    }
    function yearAt(worldPoint) {
      return yearOfAngle(Math.atan2(worldPoint.z, worldPoint.x));
    }

    H.rotunda = {
      group, EYE, RAD, WALL_H, wallMat,
      pickables: [merGrab, doorGrab, pickWall].concat(rMoments.map(m => m.group.children.find(o => o.userData.kind === "rmoment"))),
      beads: { world: beadWorld, fig: beadFig, mat: H._beadMat },   // the conductor picks these by screen distance
      tick, setYear, laneAt, yearAt, setStanding,
      angleOfYear, yearOfAngle,
      gyro,
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
