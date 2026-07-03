/* ============================================================================
   THE HALL OF AGES — the figures, the seams, the joints.
   ----------------------------------------------------------------------------
   Every figure is a mote of its tradition's glass floating above its shard —
   the more seams it carries, the higher it rises toward the joints.
   The seams arc through the air, tiered gold, faint at rest: an atmosphere of
   evidence. Selection turns the atmosphere into testimony.
   Above it all, the rete: two slow rings carrying the 42 archetype-joints.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  /* ---------- shared: canvas label sprite ---------- */
  HALL.makeLabel = function (text, opts) {
    opts = opts || {};
    const SS = 2;   // supersample for lapidary glyph edges
    const font = (opts.font || "400 46px Marcellus, Georgia, serif")
      .replace(/(\d+(?:\.\d+)?)px/, (m, n) => (n * SS) + "px");
    const sub = opts.sub || null;
    const c = document.createElement("canvas");
    const g = c.getContext("2d");
    g.font = font;
    const w = Math.ceil(g.measureText(text).width) + 36 * SS;
    const subFont = "italic 300 " + (26 * SS) + "px Spectral, Georgia, serif";
    let subW = 0;
    if (sub) { g.font = subFont; subW = Math.ceil(g.measureText(sub).width) + 36 * SS; }
    c.width = Math.max(64, w, subW);
    c.height = (sub ? 110 : 72) * SS;
    const ctx = c.getContext("2d");
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 12 * SS;
    ctx.font = font;
    ctx.fillStyle = opts.color || "#ffe49a";
    ctx.fillText(text, c.width / 2, 48 * SS);
    if (sub) {
      ctx.font = subFont;
      ctx.fillStyle = "rgba(160,168,184,0.95)";
      ctx.fillText(sub, c.width / 2, 88 * SS);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: !!opts.depthTest, fog: false });
    const sp = new THREE.Sprite(mat);
    const k = opts.size || 1.0;
    sp.scale.set(k * c.width / (72 * SS), k * c.height / (72 * SS), 1);
    sp.renderOrder = 50;
    return sp;
  };

  HALL.buildFigures = function (H) {
    const M = H.model, D = M.DATA;
    const group = new THREE.Group();
    H.scene.add(group);

    /* =========================================================================
       FIGURE POINTS
       ========================================================================= */
    const N = D.figures.length;
    const stateW = 2048;
    const figState = new Uint8Array(stateW * 4);
    const figTex = new THREE.DataTexture(figState, stateW, 1, THREE.RGBAFormat);
    figTex.magFilter = figTex.minFilter = THREE.NearestFilter;
    figTex.needsUpdate = true;

    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const size = new Float32Array(N), fidx = new Float32Array(N);
    const tmpC = new THREE.Color();
    const degMax = Math.max.apply(null, M.degree.concat([1]));
    for (let i = 0; i < N; i++) {
      const a = M.figAnchor[i];
      pos[i * 3] = a.x; pos[i * 3 + 1] = a.y; pos[i * 3 + 2] = a.z;
      const f = D.figures[i];
      if (f.kind === "forgery") tmpC.set(D.tiers.forgery.gold);
      else tmpC.set((D.traditions[f.tradition] || {}).color || "#9aa3b2");
      tmpC.convertSRGBToLinear();
      col[i * 3] = tmpC.r; col[i * 3 + 1] = tmpC.g; col[i * 3 + 2] = tmpC.b;
      size[i] = 1.0 + 1.5 * Math.sqrt(M.degree[i] / degMax);
      fidx[i] = i;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    pGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    pGeo.setAttribute("aFig", new THREE.BufferAttribute(fidx, 1));
    pGeo.computeBoundingSphere();

    const pMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false, vertexColors: true,
      uniforms: {
        uState: { value: figTex }, uStateW: { value: stateW },
        uPx: { value: H.renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float aSize; attribute float aFig;
        varying vec3 vColor; varying float vLit; varying float vBright; varying float vDim;
        uniform sampler2D uState; uniform float uStateW; uniform float uPx;
        void main(){
          vColor = color;
          vec4 st = texture2D(uState, vec2((aFig + 0.5) / uStateW, 0.5));
          vLit = st.r; vBright = st.g; vDim = st.b;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float s = aSize * (1.0 + vBright * 1.3);
          gl_PointSize = uPx * s * (210.0 / max(4.0, -mv.z));
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vLit; varying float vBright; varying float vDim;
        void main(){
          vec2 q = gl_PointCoord - 0.5;
          float d = length(q);
          if (d > 0.5) discard;
          float core = smoothstep(0.24, 0.05, d);
          float halo = smoothstep(0.5, 0.12, d);
          float a = (core * 0.9 + halo * 0.35) * (0.10 + 0.90 * vLit);
          a *= (1.0 - vDim * 0.82);
          vec3 c = vColor * (0.7 + core * 0.9) + vec3(1.0, 0.93, 0.75) * vBright * core * 0.9;
          gl_FragColor = vec4(c, a);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
    });
    const points = new THREE.Points(pGeo, pMat);
    points.userData.kind = "figures";
    group.add(points);

    /* =========================================================================
       SEAM ARCS — the atmosphere of evidence.
       ========================================================================= */
    const ARC_SEGS = 13;
    function arcPoint(ax, ay, az, bx, by, bz, k) {
      // quadratic bezier with an apex lifted by distance
      const dx = bx - ax, dz = bz - az;
      const dist = Math.hypot(dx, dz);
      const lift = Math.min(7.2, 0.9 + dist * 0.15);
      let mx = (ax + bx) / 2, mz = (az + bz) / 2;
      // bow long arcs around the center so the middle doesn't become a pyre
      const rMid = Math.hypot(mx, mz);
      if (rMid < 12 && dist > 8) {
        const push = (12 - rMid) * 0.6;
        if (rMid > 0.4) { mx += (mx / rMid) * push; mz += (mz / rMid) * push; }
        else { const L = dist || 1; mx += (-dz / L) * push; mz += (dx / L) * push; }
      }
      const my = Math.max(ay, by) + lift;
      const u = 1 - k;
      return [
        u * u * ax + 2 * u * k * mx + k * k * bx,
        u * u * ay + 2 * u * k * my + k * k * by,
        u * u * az + 2 * u * k * mz + k * k * bz,
      ];
    }
    const REST_ALPHA = { "1": 0.26, "2": 0.055, "3": 0.0085, "4": 0.006, "forgery": 0.12 };
    const arcPos = [], arcCol = [], arcBorn = [];
    const cTier = {};
    Object.keys(D.tiers).forEach(k => { cTier[k] = new THREE.Color(D.tiers[k].gold).convertSRGBToLinear(); });
    const edgeEnds = [];   // per explicit edge: [ai, bi] figure indices
    D.edges.forEach(e => {
      const ai = M.figById[e.a], bi = M.figById[e.b];
      edgeEnds.push([ai, bi]);
      if (ai === undefined || bi === undefined) return;
      const A = M.figAnchor[ai], B = M.figAnchor[bi];
      const sa = M.shards[A.shard], sb = M.shards[B.shard];
      const bornT = M.time.yearToT(Math.max(sa ? sa.from : -50000, sb ? sb.from : -50000));
      const c = cTier[e.tier] || cTier["3"];
      const al = REST_ALPHA[e.tier] || 0.05;
      let prev = null;
      for (let s = 0; s <= ARC_SEGS; s++) {
        const p = arcPoint(A.x, A.y, A.z, B.x, B.y, B.z, s / ARC_SEGS);
        if (prev) {
          arcPos.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
          // ends fade toward the figures, brightest at apex
          const kMid = (s - 0.5) / ARC_SEGS;
          const bell = 0.45 + 0.55 * Math.sin(Math.PI * kMid);
          for (let q = 0; q < 2; q++) { arcCol.push(c.r * al * bell, c.g * al * bell, c.b * al * bell); arcBorn.push(bornT); }
        }
        prev = p;
      }
    });
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute("position", new THREE.Float32BufferAttribute(arcPos, 3));
    arcGeo.setAttribute("color", new THREE.Float32BufferAttribute(arcCol, 3));
    arcGeo.setAttribute("aBorn", new THREE.Float32BufferAttribute(arcBorn, 1));
    // a seam exists only once BOTH its shards are born — the air fills in as time runs
    const arcMat = new THREE.ShaderMaterial({
      vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      uniforms: { uT: { value: 1.0 }, uOpacity: { value: 1.0 } },
      vertexShader: `
        attribute float aBorn;
        varying vec3 vColor; varying float vOn;
        uniform float uT;
        void main(){
          vColor = color;
          vOn = smoothstep(aBorn, aBorn + 0.014, uT);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vOn;
        uniform float uOpacity;
        void main(){
          gl_FragColor = vec4(vColor * vOn * uOpacity, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
    });
    const arcs = new THREE.LineSegments(arcGeo, arcMat);
    arcs.renderOrder = 10;
    group.add(arcs);

    /* highlight overlay — rebuilt on selection, bright */
    const OV_MAX = 60000;
    const ovPos = new Float32Array(OV_MAX * 3), ovCol = new Float32Array(OV_MAX * 3);
    const ovGeo = new THREE.BufferGeometry();
    ovGeo.setAttribute("position", new THREE.BufferAttribute(ovPos, 3));
    ovGeo.setAttribute("color", new THREE.BufferAttribute(ovCol, 3));
    ovGeo.setDrawRange(0, 0);
    const ovMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
    const overlay = new THREE.LineSegments(ovGeo, ovMat);
    overlay.renderOrder = 11;
    overlay.frustumCulled = false;
    group.add(overlay);

    let ovCount = 0;
    function ovArc(ai, bi, tier, gain) {
      if (ovCount + ARC_SEGS * 2 > OV_MAX) return;
      const A = M.figAnchor[ai], B = M.figAnchor[bi];
      const c = cTier[tier] || cTier["3"];
      const g = gain || 1.0;
      let prev = null;
      for (let s = 0; s <= ARC_SEGS; s++) {
        const p = arcPoint(A.x, A.y + 0.03, A.z, B.x, B.y + 0.03, B.z, s / ARC_SEGS);
        if (prev) {
          ovPos[ovCount * 3] = prev[0]; ovPos[ovCount * 3 + 1] = prev[1]; ovPos[ovCount * 3 + 2] = prev[2];
          ovCol[ovCount * 3] = c.r * g; ovCol[ovCount * 3 + 1] = c.g * g; ovCol[ovCount * 3 + 2] = c.b * g;
          ovCount++;
          ovPos[ovCount * 3] = p[0]; ovPos[ovCount * 3 + 1] = p[1]; ovPos[ovCount * 3 + 2] = p[2];
          ovCol[ovCount * 3] = c.r * g; ovCol[ovCount * 3 + 1] = c.g * g; ovCol[ovCount * 3 + 2] = c.b * g;
          ovCount++;
        }
        prev = p;
      }
    }
    function ovCommit() {
      ovGeo.attributes.position.needsUpdate = true;
      ovGeo.attributes.color.needsUpdate = true;
      ovGeo.setDrawRange(0, ovCount);
    }
    const overlayApi = {
      clear() { ovCount = 0; ovGeo.setDrawRange(0, 0); },
      forFigure(fi) {
        ovCount = 0;
        M.edgesOfFig[fi].forEach(ei => {
          const e = D.edges[ei], ends = edgeEnds[ei];
          if (!ends) return;
          ovArc(ends[0], ends[1], e.tier, 0.95);
        });
        ovCommit();
      },
      forShard(si) {
        ovCount = 0;
        const trad = M.shards[si].trad;
        D.edges.forEach((e, ei) => {
          const ends = edgeEnds[ei];
          if (!ends || ends[0] === undefined || ends[1] === undefined) return;
          const ta = D.figures[ends[0]].tradition, tb = D.figures[ends[1]].tradition;
          if (ta === trad || tb === trad) ovArc(ends[0], ends[1], e.tier, ta !== tb ? 0.8 : 0.4);
        });
        ovCommit();
      },
      forPair(tradA, tradB) {
        ovCount = 0;
        D.edges.forEach((e, ei) => {
          const ends = edgeEnds[ei];
          if (!ends || ends[0] === undefined || ends[1] === undefined) return;
          const ta = D.figures[ends[0]].tradition, tb = D.figures[ends[1]].tradition;
          if ((ta === tradA && tb === tradB) || (ta === tradB && tb === tradA)) ovArc(ends[0], ends[1], e.tier, 1.0);
        });
        ovCommit();
      },
    };

    /* =========================================================================
       THE RETE — two slow rings above; the joints where seams meet.
       ========================================================================= */
    const rete = new THREE.Group();
    group.add(rete);

    // the two structural circles (openwork, faint)
    [ [M.R * 0.56, 8.8], [M.R * 0.33, 11.2] ].forEach(([r, y]) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.035, 8, 160),
        new THREE.MeshStandardMaterial({
          color: 0xc7972f, metalness: 1.0, roughness: 0.42,
          emissive: 0x2c1f06, emissiveIntensity: 0.5,
          transparent: true, opacity: 0.8,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      rete.add(ring);
    });
    // four meridian struts joining the rings (the pierced star-ring feel)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.4;
      const p1 = new THREE.Vector3(Math.cos(a) * M.R * 0.56, 8.8, Math.sin(a) * M.R * 0.56);
      const p2 = new THREE.Vector3(Math.cos(a + 0.5) * M.R * 0.33, 11.2, Math.sin(a + 0.5) * M.R * 0.33);
      const len = p1.distanceTo(p2);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6),
        new THREE.MeshStandardMaterial({ color: 0xc7972f, metalness: 1, roughness: 0.45, transparent: true, opacity: 0.65 }));
      strut.position.copy(p1).add(p2).multiplyScalar(0.5);
      strut.lookAt(p2);
      strut.rotateX(Math.PI / 2);
      rete.add(strut);
    }

    const jointMat = new THREE.MeshStandardMaterial({
      color: HALL.COL.goldDeep, metalness: 1.0, roughness: 0.42,
      emissive: 0xb8893a, emissiveIntensity: 0.85,
    });
    const jointGeo = new THREE.IcosahedronGeometry(0.34, 1);
    const joints = [];
    M.joints.forEach((j, ji) => {
      const holder = new THREE.Group();
      holder.position.set(j.x, j.y, j.z);
      const mesh = new THREE.Mesh(jointGeo, jointMat.clone());
      mesh.userData.kind = "joint";
      mesh.userData.joint = ji;
      const s = 0.8 + 0.5 * Math.sqrt(j.count / 204);
      mesh.scale.setScalar(s);
      holder.add(mesh);
      const label = HALL.makeLabel(j.a.name, { size: 0.052 * (1.6 + s) * 3.1, color: "#f4d78a" });
      label.position.y = 1.15;
      holder.add(label);
      rete.add(holder);
      joints.push({ holder, mesh, label, data: j, baseScale: s });
    });

    // halo points behind joints
    (function () {
      const hp = new Float32Array(M.joints.length * 3);
      M.joints.forEach((j, i) => { hp[i * 3] = j.x; hp[i * 3 + 1] = j.y; hp[i * 3 + 2] = j.z; });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(hp, 3));
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
        uniforms: { uPx: { value: H.renderer.getPixelRatio() } },
        vertexShader: `
          uniform float uPx;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uPx * (460.0 / max(6.0, -mv.z));
          }`,
        fragmentShader: `
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            a = a * a * 0.055;
            gl_FragColor = vec4(1.0, 0.78, 0.34, 1.0) * a;
          }`,
      });
      const pts = new THREE.Points(g, m);
      rete.add(pts);
    })();

    /* =========================================================================
       THREADS — figure → joint, drawn on demand.
       ========================================================================= */
    const TH_MAX = 3000;
    const thPos = new Float32Array(TH_MAX * 3), thCol = new Float32Array(TH_MAX * 3);
    const thGeo = new THREE.BufferGeometry();
    thGeo.setAttribute("position", new THREE.BufferAttribute(thPos, 3));
    thGeo.setAttribute("color", new THREE.BufferAttribute(thCol, 3));
    thGeo.setDrawRange(0, 0);
    const threads = new THREE.LineSegments(thGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    }));
    threads.renderOrder = 9;
    threads.frustumCulled = false;
    group.add(threads);
    let threadPairs = [];   // {fi, ji}
    const thTint = new THREE.Color("#c19a52").convertSRGBToLinear();
    const jw = new THREE.Vector3();
    function updateThreads() {
      let n = 0;
      for (const tp of threadPairs) {
        if (n * 3 + 6 > TH_MAX * 3) break;
        const A = M.figAnchor[tp.fi];
        joints[tp.ji].mesh.getWorldPosition(jw);
        thPos[n * 3] = A.x; thPos[n * 3 + 1] = A.y; thPos[n * 3 + 2] = A.z;
        thCol[n * 3] = thTint.r * 0.35; thCol[n * 3 + 1] = thTint.g * 0.35; thCol[n * 3 + 2] = thTint.b * 0.35;
        n++;
        thPos[n * 3] = jw.x; thPos[n * 3 + 1] = jw.y; thPos[n * 3 + 2] = jw.z;
        thCol[n * 3] = thTint.r; thCol[n * 3 + 1] = thTint.g; thCol[n * 3 + 2] = thTint.b;
        n++;
      }
      thGeo.attributes.position.needsUpdate = true;
      thGeo.attributes.color.needsUpdate = true;
      thGeo.setDrawRange(0, n);
    }
    const threadsApi = {
      clear() { threadPairs = []; thGeo.setDrawRange(0, 0); },
      forFigure(fi) {
        threadPairs = (D.figures[fi].archetypes || [])
          .map(a => M.jointById[a]).filter(j => j !== undefined)
          .map(ji => ({ fi, ji }));
      },
      forJoint(ji) {
        const id = joints[ji].data.a.id;
        threadPairs = (M.archFigs[id] || []).map(fi => ({ fi, ji }));
      },
    };

    /* =========================================================================
       FIGURE STATE
       ========================================================================= */
    const figHover = new Float32Array(N), figSel = new Float32Array(N), figDim = new Float32Array(N);
    function applyYear(year) {
      const t = M.time.yearToT(year);
      arcMat.uniforms.uT.value = t;
      for (let i = 0; i < N; i++) {
        const s = M.shards[M.figAnchor[i].shard];
        let lit = 1;
        if (s) {
          if (year < s.from) lit = 0;
          else {
            const tb = M.time.yearToT(s.from);
            const k = Math.min(1, Math.max(0, (t - tb) / 0.02));
            lit = k * (s.living || year <= s.to ? 1 : 0.5);
          }
        }
        figState[i * 4] = Math.round(255 * lit);
        figState[i * 4 + 1] = Math.round(255 * Math.max(figHover[i], figSel[i]));
        figState[i * 4 + 2] = Math.round(255 * figDim[i]);
      }
      figTex.needsUpdate = true;
    }
    applyYear(M.NOW);

    /* ---------- expose ---------- */
    H.figures = {
      group, points, arcs, arcMat, overlay: overlayApi, threads: threadsApi,
      rete, joints,
      figHover, figSel, figDim,
      isLit(fi) { return figState[fi * 4] > 10; },
      applyYear,
      tick(t, dt) {
        rete.rotation.y += dt * 0.006;
        if (threadPairs.length) updateThreads();
        // joint labels fade by camera distance
        const cp = H.camera.position;
        const d = Math.hypot(cp.x, cp.z);
        const near = Math.max(0, Math.min(1, (95 - d) / 55)) * Math.max(0, Math.min(1, (d - 8) / 8));
        for (const j of joints) j.label.material.opacity = near * 0.9;
      },
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
