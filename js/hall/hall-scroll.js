/* ============================================================================
   THE HALL OF AGES — the Scroll of Ages: a strata wall of time.
   ----------------------------------------------------------------------------
   219 life-lines, oldest at the bottom like geological strata, each in its
   tradition's glass color, born at its left edge and — if it died — guttering
   out at its right. The twelve dated syncretism moments hang between their
   lanes as small gold seals: the moments history itself did the mending.
   A gold cursor stands at the current year; it and the instrument's rule are
   the same hand on the same clock.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  HALL.buildScroll = function (H) {
    const M = H.model, D = M.DATA;
    const group = new THREE.Group();
    H.scene.add(group);

    /* ---------- geometry of the wall ---------- */
    const X0 = -56, X1 = 56, XF = 61.5;       // past → now → the prophesied
    const WALL_Z = -60;
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

    group.position.z = WALL_Z;

    /* ---------- backplane: the parchment of eras ---------- */
    (function () {
      const W = 4096, Hc = 1400;
      const c = document.createElement("canvas");
      c.width = W; c.height = Hc;
      const g = c.getContext("2d");
      const planeW = (XF - X0) + 10, planeH = (H_TOP - 0) + 9;
      const px = x => ((x - (X0 - 5)) / planeW) * W;
      const py = y => Hc - ((y + 3.4) / planeH) * Hc;
      g.fillStyle = "rgba(10,12,18,0.55)";
      g.fillRect(0, 0, W, Hc);
      M.ERAS.forEach((e, i) => {
        const xa = px(xOfYear(e.from)), xb = px(xOfYear(e.to));
        if (i % 2 === 1) { g.fillStyle = "rgba(205,210,220,0.022)"; g.fillRect(xa, 0, xb - xa, Hc); }
        g.strokeStyle = "rgba(240,196,90,0.20)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(xa, py(H_TOP + 1.6)); g.lineTo(xa, py(-1.6)); g.stroke();
        // era name, top
        g.fillStyle = "rgba(240,196,90,0.60)";
        g.font = "42px Marcellus, Georgia, serif";
        g.textAlign = "center";
        const label = e.name;
        const mid = (xa + xb) / 2;
        g.save();
        if ((xb - xa) < g.measureText(label).width + 26) {
          g.translate(mid, py(H_TOP + 0.6) - 14); g.rotate(-0.5);
          g.font = "30px Marcellus, Georgia, serif";
          g.fillText(label, 0, 0);
        } else {
          g.fillText(label, mid, py(H_TOP + 0.6));
        }
        g.restore();
        // year at boundary, bottom
        const yr = e.from < 0 ? Math.abs(e.from).toLocaleString() + " BCE" : e.from + " CE";
        g.fillStyle = "rgba(130,139,156,0.8)";
        g.font = "300 27px Spectral, Georgia, serif";
        g.fillText(yr, xa, py(-0.9));
      });
      // NOW line + label
      const xn = px(xOfYear(M.NOW));
      g.strokeStyle = "rgba(255,228,154,0.55)"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(xn, py(H_TOP + 1.6)); g.lineTo(xn, py(-1.6)); g.stroke();
      g.fillStyle = "rgba(255,228,154,0.9)";
      g.font = "300 28px Spectral, Georgia, serif";
      g.fillText("now", xn, py(-0.9));
      // the prophesied zone
      const xf = px(XF);
      g.fillStyle = "rgba(240,196,90,0.03)";
      g.fillRect(xn, 0, xf - xn, Hc);
      g.fillStyle = "rgba(130,139,156,0.55)";
      g.font = "italic 300 26px Spectral, Georgia, serif";
      g.save();
      g.translate(xn + (xf - xn) / 2, py(H_TOP * 0.5)); g.rotate(-Math.PI / 2);
      g.fillText("the prophesied", 0, 0);
      g.restore();
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 8;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(planeW, planeH),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 })
      );
      mesh.position.set((X0 - 5) + planeW / 2, -3.4 + planeH / 2, -0.25);
      group.add(mesh);
    })();

    /* ---------- exhibit title ---------- */
    const title = HALL.makeLabel("The Scroll of Ages", { size: 1.5, color: "#ffe49a" });
    title.position.set(14, H_TOP + 3.1, 0);
    group.add(title);
    const subtitle = HALL.makeLabel("every tradition, born into time — oldest at the bottom", { size: 0.85, color: "#a7aebc", font: "italic 300 34px Spectral, Georgia, serif" });
    subtitle.position.set(14, H_TOP + 1.9, 0);
    group.add(subtitle);

    /* ---------- life-lines ---------- */
    const CERT_A = { attested: 1.0, inferred: 0.62, reconstructed: 0.5, contested: 0.42, deep: 0.62, prophesied: 0.3 };
    const lifePos = [], lifeCol = [], lifeIdx = [];
    const tmpC = new THREE.Color();
    function quad(x0, x1, yC, h, r, g, b) {
      const base = lifePos.length / 3;
      lifePos.push(x0, yC - h / 2, 0, x1, yC - h / 2, 0, x1, yC + h / 2, 0, x0, yC + h / 2, 0);
      for (let i = 0; i < 4; i++) lifeCol.push(r, g, b);
      lifeIdx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    ranked.forEach((rk, i) => {
      const t = D.traditions[rk.k], p = rk.p;
      tmpC.set(t.color).convertSRGBToLinear();
      const a = (CERT_A[p.certainty] || 0.8) * 0.60;
      const y = yOfRank(i);
      const from = p.from !== undefined ? p.from : -1000;
      const to = p.living ? M.NOW : (p.to !== undefined ? p.to : M.NOW);
      quad(xOfYear(from), xOfYear(Math.min(to, M.NOW)), y, 0.085, tmpC.r * a, tmpC.g * a, tmpC.b * a);
      // birth tick
      quad(xOfYear(from), xOfYear(from) + 0.10, y, 0.11, tmpC.r * a * 1.8, tmpC.g * a * 1.8, tmpC.b * a * 1.8);
      // peak bead
      if (p.peak !== undefined && p.peak <= M.NOW) {
        const xp = xOfYear(p.peak);
        quad(xp - 0.09, xp + 0.09, y, 0.13, tmpC.r * a * 2.4, tmpC.g * a * 2.4, tmpC.b * a * 2.4);
      }
      // living: bright cap at now
      if (p.living) quad(xOfYear(M.NOW) - 0.16, xOfYear(M.NOW) + 0.05, y, 0.1, tmpC.r * 1.5, tmpC.g * 1.5, tmpC.b * 1.5);
      // prophesied reach
      if (p.to > M.NOW) quad(xOfYear(M.NOW) + 0.3, xOfYear(Math.min(p.to, M.FUTURE_TO)), y, 0.035, tmpC.r * 0.28, tmpC.g * 0.28, tmpC.b * 0.28);
    });
    const lifeGeo = new THREE.BufferGeometry();
    lifeGeo.setAttribute("position", new THREE.Float32BufferAttribute(lifePos, 3));
    lifeGeo.setAttribute("color", new THREE.Float32BufferAttribute(lifeCol, 3));
    lifeGeo.setIndex(lifeIdx);
    const lifeMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, vertexColors: true,
      uniforms: { uCursorX: { value: xOfYear(M.NOW) } },
      vertexShader: `
        varying vec3 vColor; varying float vX;
        void main(){
          vColor = color;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vX = position.x;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vX;
        uniform float uCursorX;
        void main(){
          float ahead = smoothstep(uCursorX + 0.9, uCursorX - 0.2, vX);
          vec3 col = vColor * mix(0.13, 1.0, ahead);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
    });
    const lifeMesh = new THREE.Mesh(lifeGeo, lifeMat);
    group.add(lifeMesh);

    /* ---------- the twelve seals: dated syncretism moments ---------- */
    const moments = [];
    const momPos = [], momCol = [], momIdx = [];
    const sealC = {};
    Object.keys(D.tiers).forEach(k => sealC[k] = new THREE.Color(D.tiers[k].gold).convertSRGBToLinear());
    function diamond(x, y, s, c, gain) {
      const base = momPos.length / 3;
      momPos.push(x, y - s, 0.05, x + s, y, 0.05, x, y + s, 0.05, x - s, y, 0.05);
      for (let i = 0; i < 4; i++) momCol.push(c.r * gain, c.g * gain, c.b * gain);
      momIdx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    function hairline(x, y0, y1, c, gain) {
      const base = momPos.length / 3, w = 0.022;
      momPos.push(x - w, y0, 0.02, x + w, y0, 0.02, x + w, y1, 0.02, x - w, y1, 0.02);
      for (let i = 0; i < 4; i++) momCol.push(c.r * gain, c.g * gain, c.b * gain);
      momIdx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    D.edges.forEach(e => {
      if (!e.when || e.when.when === undefined) return;
      const fa = D.figures[M.figById[e.a]], fb = D.figures[M.figById[e.b]];
      if (!fa || !fb) return;
      const ra = rankOf[fa.tradition], rb = rankOf[fb.tradition];
      if (ra === undefined || rb === undefined) return;
      const x = xOfYear(e.when.when);
      const ya = yOfRank(ra), yb = yOfRank(rb);
      const ym = (ya + yb) / 2;
      const c = sealC[e.tier] || sealC["2"];
      hairline(x, Math.min(ya, yb), Math.max(ya, yb), c, 0.30);
      diamond(x, ym, 0.34, c, 1.25);
      moments.push({ x, y: ym, edge: e, ya, yb });
    });
    const momGeo = new THREE.BufferGeometry();
    momGeo.setAttribute("position", new THREE.Float32BufferAttribute(momPos, 3));
    momGeo.setAttribute("color", new THREE.Float32BufferAttribute(momCol, 3));
    momGeo.setIndex(momIdx);
    const momMesh = new THREE.Mesh(momGeo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    }));
    group.add(momMesh);

    /* ---------- the cursor (this hand and the rule are one hand) ---------- */
    const cursor = new THREE.Group();
    const curLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, H_TOP + 2.4, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xffe49a, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    curLine.position.y = (H_TOP + 2.4) / 2 - 1.0;
    cursor.add(curLine);
    const curKnob = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12),
      new THREE.MeshStandardMaterial({ color: HALL.COL.goldBright, metalness: 1, roughness: 0.25, emissive: HALL.COL.gold, emissiveIntensity: 0.6 }));
    curKnob.position.y = -1.0;
    cursor.add(curKnob);
    const curGrab = new THREE.Mesh(new THREE.BoxGeometry(2.4, H_TOP + 3.5, 2.0), new THREE.MeshBasicMaterial({ visible: false }));
    curGrab.position.y = (H_TOP) / 2;
    curGrab.userData.kind = "cursor";
    cursor.add(curGrab);
    cursor.position.set(xOfYear(M.NOW), 0, 0.3);
    group.add(cursor);

    /* ---------- invisible pick plane ---------- */
    const pickPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(XF - X0 + 10, H_TOP + 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    pickPlane.position.set((X0 + XF) / 2, H_TOP / 2, 0);
    pickPlane.userData.kind = "wall";
    group.add(pickPlane);

    /* ---------- api ---------- */
    function setCursorYear(y) {
      cursor.position.x = xOfYear(Math.min(y, M.NOW));
      lifeMat.uniforms.uCursorX.value = cursor.position.x;
    }
    function tradAt(localX, localY) {
      const i = Math.round((localY - Y0) / LANE_H);
      if (i < 0 || i >= ranked.length) return null;
      if (Math.abs(localY - yOfRank(i)) > LANE_H * 0.42) return null;
      const rk = ranked[i], p = rk.p;
      const from = p.from !== undefined ? p.from : -1000;
      const to = p.to !== undefined ? p.to : M.NOW;
      const x0 = xOfYear(from) - 0.25, x1 = xOfYear(Math.min(Math.max(to, p.living ? M.NOW : to), M.FUTURE_TO)) + 0.25;
      if (localX < x0 || localX > x1) return null;
      return { trad: rk.k, y: yOfRank(i) };
    }
    function momentAt(localX, localY) {
      let best = null, bd = 1.0;
      for (const m of moments) {
        const d = Math.hypot(localX - m.x, localY - m.y);
        if (d < bd) { bd = d; best = m; }
      }
      return best;
    }

    H.scroll = {
      group, WALL_Z, X0, X1, XF, H_TOP, Y0,
      xOfYear, yearOfX, yOfRank, rankOf, ranked,
      setCursorYear, tradAt, momentAt, cursor, moments,
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
