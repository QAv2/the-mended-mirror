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

    /* ---------- geometry of the wall ---------- */
    const RAD = H.mater.RIM_OUT + 1.8;              // the instrument's exterior diameter
    const LANE = S.ranked.length ? (S.H_TOP - S.Y0) / S.ranked.length : 0.115;
    const Y0R = 2.6;                                // first lane above the floor
    const H_TOPR = Y0R + S.ranked.length * LANE;    // ~27.8
    const WALL_H = H_TOPR + 3.4;                    // cornice headroom
    const EYE = new THREE.Vector3(0, 1.7, 0);       // where you stand for the scroll

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
    const W = 8192, Hc = 2048;
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

      /* the lanes — every tradition a ring-segment of its life */
      const CERT_A = { attested: 1.0, inferred: 0.62, reconstructed: 0.5, contested: 0.42, deep: 0.62, prophesied: 0.3 };
      const laneH = (LANE / WALL_H) * Hc;
      function spanY(thA, thB, yC, h, fill) {
        let xa = px(thA), xb = px(thB);
        g.fillStyle = fill;
        if (xb >= xa) g.fillRect(xa, yC - h / 2, Math.max(1.5, xb - xa), h);
        else { g.fillRect(xa, yC - h / 2, W - xa, h); g.fillRect(0, yC - h / 2, xb, h); }
      }
      S.ranked.forEach((rk, i) => {
        const t = D.traditions[rk.k], p = rk.p;
        const a = (CERT_A[p.certainty] || 0.8) * 0.62;
        const yC = py(Y0R + i * LANE);
        const from = p.from !== undefined ? p.from : -1000;
        const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
        const c = new THREE.Color(t.color);
        const rgba = k => `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${k})`;
        const h = Math.max(2.5, laneH * 0.72);
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
      // title above the lintel
      g.fillStyle = "rgba(255,228,154,0.85)";
      g.font = "58px Marcellus, Georgia, serif";
      g.fillText("The Scroll of Ages", xdMid, py(H_TOPR + 2.55));
    })();

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
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
      new THREE.CylinderGeometry(RAD, RAD, WALL_H, 160, 1, true),
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

    /* the motion button lives only while you stand in the scroll, on touch */
    let motionBtn = null;
    if (gyro.supported && matchMedia("(pointer:coarse)").matches) {
      motionBtn = document.createElement("button");
      motionBtn.id = "motion-btn";
      motionBtn.textContent = "◉ turn with me";
      motionBtn.title = "let the phone become a window — turn your body to turn the room";
      motionBtn.addEventListener("click", () => gyro.active ? disableGyro() : enableGyro());
      document.body.appendChild(motionBtn);
    }
    function setStanding(on) {
      if (motionBtn) motionBtn.classList.toggle("here", !!on);
      if (!on) disableGyro();
    }

    /* ---------- per-frame ---------- */
    const _qY = new THREE.Quaternion(), _yAxis = new THREE.Vector3(0, 1, 0);
    function tick(dt, elapsed) {
      if (!group.visible) return;
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
    }
    setYear(M.NOW);

    /* ---------- picking helpers for the conductor ---------- */
    function laneAt(worldPoint) {
      const b = Math.atan2(worldPoint.z, worldPoint.x);
      const yr = yearOfAngle(b);
      const i = Math.round((worldPoint.y - Y0R) / LANE);
      if (i < 0 || i >= S.ranked.length) return null;
      if (Math.abs(worldPoint.y - (Y0R + i * LANE)) > LANE * 0.45) return null;
      const rk = S.ranked[i], p = rk.p;
      const from = p.from !== undefined ? p.from : -1000;
      const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
      if (yr < from - 80 || yr > to + 80) return null;
      return { trad: rk.k, pos: posAt(b, Y0R + i * LANE, 0.3) };
    }
    function yearAt(worldPoint) {
      return yearOfAngle(Math.atan2(worldPoint.z, worldPoint.x));
    }

    H.rotunda = {
      group, EYE, RAD, WALL_H, wallMat,
      pickables: [merGrab, doorGrab, pickWall].concat(rMoments.map(m => m.group.children.find(o => o.userData.kind === "rmoment"))),
      tick, setYear, laneAt, yearAt, setStanding,
      angleOfYear, yearOfAngle,
      gyro,
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
