/* ============================================================================
   THE CONCLAVE OF BECOMING — the bloom itself.
   ----------------------------------------------------------------------------
   288 petals on one rising golden-angle spiral ordered by the age of the
   tradition — the ancients seated low and near, the whorls climbing outward
   through the ages. Past the last recorded seat the spiral keeps going as
   unlit ghost petals: traditions unrecorded and unborn. "A lotus of infinite
   petals, each one a throbbing, living cosmology."

   Every figure of the Mirror burns on its own petal as a node light — the
   Hall's exact mark (core + halo, tradition color, size by seam-degree).
   The coliseum of eyes, looking back.

   THE ENTRANCE (Joe's note, honored to the letter): click a node and the
   petal it lives on "comes swirling towards you, from the right, two
   swirls/spirals, then away as if your opponent in the ring, then softens
   forward to meet you in the center."

   The presented petal wears the Meshy hero geometry when it loads
   (assets/conclave/petal-hero.glb); the parametric petal is the law when it
   doesn't. Both are dressed by the same shader — flesh, fal-drawn veins,
   tradition tint.
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};
  const T3 = root.THREE;
  const TAU = Math.PI * 2;

  const PS = 4.3;                 // presented petal scale
  const HOLD_D = 9.2;             // presented petal distance from the eye
  const SWIRL = 2.7;              // the entrance, seconds
  const RETURN = 1.05;

  /* ---------------------------------------------------------------------- *
     the petal surface: u 0→1 base→tip, v -1→1 edge to edge.
     concave face is +Z (the face that meets you).
   * ---------------------------------------------------------------------- */
  const W_MAX = 0.38;
  function halfW(u) {
    const uu = Math.max(0, Math.min(1, u));
    return W_MAX * Math.pow(Math.sin(Math.PI * Math.pow(uu, 0.62)), 0.72);
  }
  function surf(u, v, out) {
    const w = halfW(u);
    const bow = 0.30 * Math.sin(Math.PI * u * 0.62) - 0.10 * smooth(0.75, 1.0, u);
    const cup = 0.55 * w;
    out.x = v * w * (1 + 0.03 * Math.sin(7 * v + 5 * u));
    out.y = u;
    out.z = -bow + cup * v * v;   // belly -Z, cup +Z
    return out;
  }
  function smooth(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  C.petalSurf = surf;

  function petalGeometry(nu, nv) {
    const pos = [], uv = [], idx = [];
    const p = new T3.Vector3();
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      for (let j = 0; j <= nv; j++) {
        const v = (j / nv) * 2 - 1;
        surf(u, v, p);
        pos.push(p.x, p.y, p.z);
        uv.push(u, j / nv);
      }
    }
    const row = nv + 1;
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    const g = new T3.BufferGeometry();
    g.setAttribute("position", new T3.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new T3.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /* ---------------------------------------------------------------------- *
     the petal shader — object-space veins so the GLB hero wears it too.
   * ---------------------------------------------------------------------- */
  function petalMaterial(opts) {
    const uni = {
      tVeins:  { value: null },
      uHasTex: { value: 0 },
      uTime:   { value: 0 },
      uHush:   { value: 1 },                      // global attention falloff
      uFocus:  { value: opts.focus || 0 },        // presented glow
      uOp:     { value: 1 },
      uColor:  { value: new T3.Color(0x9aa3b2) }, // non-instanced tint
      uBounds: { value: new T3.Vector4(0, 1, W_MAX, 0.30) }, // yMin,yMax,halfW,depth
      uVoid:   { value: new T3.Color(C.COL.void) },
      uFogD:   { value: 0.0034 },
      uGhost:  { value: opts.ghost ? 1 : 0 },
    };
    const mat = new T3.ShaderMaterial({
      uniforms: uni,
      transparent: !!opts.ghost || !!opts.focus,
      depthWrite: !opts.ghost,
      blending: opts.ghost ? T3.AdditiveBlending : T3.NormalBlending,
      side: T3.DoubleSide,
      fog: false,
      vertexShader: `
        varying vec3 vObj; varying vec3 vN; varying vec3 vW;
        #ifdef USE_INSTANCING_COLOR
          varying vec3 vInstC;
        #endif
        attribute float aGlow;
        varying float vGlow;
        void main(){
          vObj = position;
          vec3 n = normal;
          #ifdef USE_INSTANCING
            vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * n);
          #else
            vec4 w = modelMatrix * vec4(position, 1.0);
            vN = normalize(mat3(modelMatrix) * n);
          #endif
          #ifdef USE_INSTANCING_COLOR
            vInstC = instanceColor;
          #endif
          vGlow = aGlow;
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `
        uniform sampler2D tVeins;
        uniform float uHasTex, uTime, uHush, uFocus, uOp, uGhost, uFogD;
        uniform vec3 uColor, uVoid;
        uniform vec4 uBounds;
        varying vec3 vObj; varying vec3 vN; varying vec3 vW;
        varying float vGlow;
        #ifdef USE_INSTANCING_COLOR
          varying vec3 vInstC;
        #endif
        void main(){
          #ifdef USE_INSTANCING_COLOR
            vec3 tint = vInstC;
          #else
            vec3 tint = uColor;
          #endif
          float u = clamp((vObj.y - uBounds.x) / max(0.001, uBounds.y - uBounds.x), 0.0, 1.0);
          float lat = clamp(vObj.x / uBounds.z, -1.0, 1.0);

          // flesh — the tradition's own quality of light, worn faintly
          vec3 base = vec3(0.043, 0.050, 0.074);
          base = mix(base, tint, 0.26 + 0.14 * u);
          base += tint * 0.10 * (0.3 + 0.7 * u);         // the concave face holds its color

          // the fal-drawn veins, tip-up plate: x centered, y base->tip
          if (uHasTex > 0.5) {
            vec2 tuv = vec2(0.5 + lat * 0.235, 0.065 + u * 0.875);
            vec3 tex = texture2D(tVeins, tuv).rgb;
            tex = max(tex - 0.05, 0.0) * 1.25;           // lift the veins off the plate's haze
            tex *= tex * 1.6;
            float lum = dot(tex, vec3(0.30, 0.55, 0.15));
            base = base * 0.55 + tex * (0.95 + 0.85 * uFocus);
            base += tint * lum * (1.0 + 1.1 * uFocus);
          } else {
            // procedural veins — the fallback law
            float mid = smoothstep(0.06, 0.005, abs(vObj.x)) * (1.0 - u * 0.35);
            float sec = pow(max(0.0, sin((abs(lat) * 5.5 - u * 6.0) * 3.14159)), 22.0)
                        * smoothstep(0.95, 0.35, abs(lat));
            base += tint * (mid * 0.7 + sec * 0.35) * (0.35 + 1.1 * uFocus);
            base += vec3(1.0, 0.82, 0.45) * (1.0 - u) * (1.0 - u) * 0.10;
          }

          // rim light in the tradition's color
          vec3 V = normalize(cameraPosition - vW);
          float fr = pow(1.0 - abs(dot(V, vN)), 2.4);
          base += tint * fr * (0.48 + 0.55 * uFocus);

          // presented petal breathes
          base *= 1.0 + uFocus * 0.16 * sin(uTime * 0.9 + u * 6.0);

          base = mix(base, tint * length(base) * 1.05, 0.22);   // let the tradition bleed through
          base = base / (1.0 + 0.35 * base);                    // soft knee — no hot stone

          float hush = mix(0.45, 1.0, uHush);
          base *= hush * (0.75 + 0.45 * vGlow);

          float a = uOp;
          if (uGhost > 0.5) {
            a *= vGlow * 0.55;
            base *= 0.5;
          }
          // manual exp2 fog into the void
          float d = length(cameraPosition - vW);
          float f = 1.0 - exp(-d * d * uFogD * uFogD);
          base = mix(base, uVoid, f * (uGhost > 0.5 ? 0.75 : 1.0));
          gl_FragColor = vec4(base, a);
        }`,
    });
    mat.__uni = uni;
    return mat;
  }

  /* ---------------------------------------------------------------------- *
     the node-light shader — the Hall's mark, verbatim math.
   * ---------------------------------------------------------------------- */
  function crowdMaterial(stateTex, texW, texH, sizeMul) {
    return new T3.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false, vertexColors: true,
      blending: T3.NormalBlending,
      uniforms: {
        uState: { value: stateTex }, uTexW: { value: texW }, uTexH: { value: texH },
        uPx: { value: C.renderer.getPixelRatio() },
        uTime: { value: 0 }, uFwd: { value: new T3.Vector3(0, 0, -1) },
        uSizeMul: { value: sizeMul || 1 }, uHushAll: { value: 1 },
        uIgnoreDim: { value: 0 },
      },
      vertexShader: `
        attribute float aSize; attribute float aFig; attribute float aBorn;
        uniform sampler2D uState; uniform float uTexW, uTexH, uPx, uTime, uSizeMul;
        uniform vec3 uFwd;
        varying vec3 vColor; varying float vLit, vBright, vDim, vBorn, vTw;
        void main(){
          vColor = color;
          float row = floor(aFig / uTexW);
          vec2 suv = vec2((mod(aFig, uTexW) + 0.5) / uTexW, (row + 0.5) / uTexH);
          vec4 st = texture2D(uState, suv);
          vLit = st.r; vBright = st.g; vDim = st.b;
          vBorn = aBorn;
          vec4 w;
          #ifdef USE_INSTANCING
            w = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            w = modelMatrix * vec4(position, 1.0);
          #endif
          // the eyes that notice your gaze
          vec3 toP = normalize(w.xyz - cameraPosition);
          float gaze = pow(max(dot(toP, uFwd), 0.0), 24.0);
          vTw = 0.5 + 0.5 * sin(uTime * (0.4 + fract(aFig * 0.618) * 0.7) + aFig * 6.2831);
          vBright = min(1.0, vBright + gaze * 0.45 + vTw * 0.10);
          vec4 mv = viewMatrix * w;
          float s = aSize * uSizeMul;
          gl_PointSize = min(uPx * s * (210.0 / max(4.0, -mv.z)), 42.0 * uPx);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uTime, uHushAll, uIgnoreDim;
        varying vec3 vColor; varying float vLit, vBright, vDim, vBorn, vTw;
        void main(){
          vec2 q = gl_PointCoord - 0.5;
          float d = length(q);
          if (d > 0.5) discard;
          float core = smoothstep(0.24, 0.05, d);
          float halo = smoothstep(0.5, 0.12, d);
          float born = smoothstep(vBorn, vBorn + 0.45, uTime);
          float a = (core * 0.9 + halo * 0.35) * (0.10 + 0.90 * vLit);
          a *= (1.0 - vDim * 0.82 * (1.0 - uIgnoreDim)) * born * uHushAll;
          vec3 c = vColor * (0.7 + core * 0.9)
                 + vec3(1.0, 0.93, 0.75) * vBright * core * 0.9;
          gl_FragColor = vec4(c, a * (0.75 + 0.25 * vTw));
        }`,
    });
  }

  /* ======================================================================= */
  C.buildLotus = function () {
    const M = C.M, Q = C.Q, S = C.scene;
    const L = C.lotus = {
      update, present, dismiss, neighbors,
      hoverSeat, setHover, pickSeat, pickCrowd, pickPresentedFig,
      presented: null, presenting: false, hovered: -1,
      figWorld, setBright, setDim, presentedFigs: [],
      heroReady: false,
    };

    /* ---- seats → instance matrices ---------------------------------------- */
    const geoReal = petalGeometry(20, 10);
    const geoGhost = petalGeometry(10, 5);
    const matReal = petalMaterial({});
    const matGhost = petalMaterial({ ghost: true });
    L.matReal = matReal; L.matGhost = matGhost;

    // the fal veins plate dresses every petal that loads it
    new T3.TextureLoader().load("assets/conclave/petal-veins.png", t => {
      t.encoding = T3.sRGBEncoding;
      t.wrapS = t.wrapT = T3.ClampToEdgeWrapping;
      [matReal, matGhost, L.matHero].forEach(m => {
        if (m) { m.__uni.tVeins.value = t; m.__uni.uHasTex.value = 1; }
      });
    });

    const N = M.N;
    const real = new T3.InstancedMesh(geoReal, matReal, N);
    const glowReal = new Float32Array(N).fill(1);
    geoReal.setAttribute("aGlow", new T3.InstancedBufferAttribute(glowReal, 1));
    const dummy = new T3.Object3D();
    const cc = new T3.Color();
    const seatCenters = [];
    for (let n = 0; n < N; n++) {
      const s = M.seats[n];
      seatMatrix(s, dummy);
      dummy.updateMatrix();
      real.setMatrixAt(n, dummy.matrix);
      cc.set(s.color).convertSRGBToLinear();
      real.setColorAt(n, cc);
      s.matrix = dummy.matrix.clone();
      const ctr = new T3.Vector3(0, 0.5, 0).applyMatrix4(dummy.matrix);
      seatCenters.push(ctr);
    }
    real.instanceMatrix.needsUpdate = true;
    if (real.instanceColor) real.instanceColor.needsUpdate = true;
    real.frustumCulled = false;
    S.add(real);
    L.real = real; L.glowReal = glowReal; L.seatCenters = seatCenters;

    /* ghosts — the spiral past the last recorded age */
    const NG = Q.ghosts;
    const ghost = new T3.InstancedMesh(geoGhost, matGhost, NG);
    const glowGhost = new Float32Array(NG);
    geoGhost.setAttribute("aGlow", new T3.InstancedBufferAttribute(glowGhost, 1));
    for (let k = 0; k < NG; k++) {
      const n = N + k;
      const sh = C.seatShape(n, N);
      const fake = { az: sh.az + (C.hash01("g" + k) - 0.5) * 0.04, R: sh.R, Y: sh.Y,
                     scale: sh.scale, lean: sh.lean, roll: (C.hash01("gr" + k) - 0.5) * 0.1 };
      seatMatrix(fake, dummy);
      dummy.updateMatrix();
      ghost.setMatrixAt(k, dummy.matrix);
      cc.set(0x36415f).convertSRGBToLinear();
      ghost.setColorAt(k, cc);
      glowGhost[k] = Math.max(0.06, 0.5 * Math.pow(1 - k / NG, 1.6));
    }
    ghost.instanceMatrix.needsUpdate = true;
    if (ghost.instanceColor) ghost.instanceColor.needsUpdate = true;
    ghost.frustumCulled = false;
    S.add(ghost);

    /* ---- the crowd: every figure a light on its petal --------------------- */
    const F = C.D.figures, NF = F.length;
    const texW = 2048, texH = Math.max(1, Math.ceil(NF / texW));
    const stateData = new Uint8Array(texW * texH * 4);
    for (let i = 0; i < NF; i++) stateData[i * 4] = 255;          // lit
    const stateTex = new T3.DataTexture(stateData, texW, texH, T3.RGBAFormat);
    stateTex.minFilter = stateTex.magFilter = T3.NearestFilter;
    stateTex.needsUpdate = true;
    L.state = { tex: stateTex, data: stateData, W: texW, H: texH };

    const pos = new Float32Array(NF * 3), col = new Float32Array(NF * 3);
    const size = new Float32Array(NF), fidx = new Float32Array(NF), born = new Float32Array(NF);
    const p = new T3.Vector3();
    const localOf = {};                                            // fi -> [u,v]
    for (const tid in M.figsOfTrad) {
      const seat = M.seatByTid[tid];
      if (!seat) continue;
      const list = M.figsOfTrad[tid], m = list.length;
      for (let k = 0; k < m; k++) {
        const fi = list[k];
        const u = 0.16 + 0.66 * Math.pow((k + 0.5) / m, 0.78);      // hubs at the throat
        const v = (C.hash01(F[fi].id) - 0.5) * 1.5 * (halfW(u) / W_MAX);
        localOf[fi] = [u, v];
        surf(u, v, p);
        p.z += 0.055;                                               // hover the concave face
        p.applyMatrix4(seat.matrix);
        pos[fi * 3] = p.x; pos[fi * 3 + 1] = p.y; pos[fi * 3 + 2] = p.z;
        if (F[fi].kind === "forgery") cc.set(C.D.tiers.forgery.gold);
        else cc.set(seat.color);
        cc.convertSRGBToLinear();
        col[fi * 3] = cc.r; col[fi * 3 + 1] = cc.g; col[fi * 3 + 2] = cc.b;
        size[fi] = 1.0 + 1.5 * Math.sqrt(M.degree[fi] / M.degMax);
        fidx[fi] = fi;
      }
    }
    const cg = new T3.BufferGeometry();
    cg.setAttribute("position", new T3.BufferAttribute(pos, 3));
    cg.setAttribute("color", new T3.BufferAttribute(col, 3));
    cg.setAttribute("aSize", new T3.BufferAttribute(size, 1));
    cg.setAttribute("aFig", new T3.BufferAttribute(fidx, 1));
    cg.setAttribute("aBorn", new T3.BufferAttribute(born, 1));
    const crowd = new T3.Points(cg, crowdMaterial(stateTex, texW, texH, 1));
    crowd.frustumCulled = false;
    S.add(crowd);
    L.crowd = crowd; L.crowdPos = pos; L.localOf = localOf;

    /* ---- the presented petal --------------------------------------------- */
    const grp = new T3.Group();
    grp.visible = false;
    S.add(grp);
    const matHero = petalMaterial({ focus: 1 });
    L.matHero = matHero;
    if (matReal.__uni.tVeins.value) {
      matHero.__uni.tVeins.value = matReal.__uni.tVeins.value;
      matHero.__uni.uHasTex.value = 1;
    }
    const heroParam = petalGeometry(36, 18);
    heroParam.setAttribute("aGlow",
      new T3.BufferAttribute(new Float32Array(heroParam.attributes.position.count).fill(1), 1));
    const hero = new T3.Mesh(heroParam, matHero);
    grp.add(hero);
    L.presentedGroup = grp; L.hero = hero;

    // the Meshy hero geometry, normalized into the parametric petal's frame
    if (T3.GLTFLoader) {
      new T3.GLTFLoader().load("assets/conclave/petal-hero.glb", g => {
        try {
          let geo = null;
          g.scene.traverse(o => { if (!geo && o.isMesh) geo = o.geometry; });
          if (!geo) return;
          geo = geo.clone();
          geo.computeBoundingBox();
          const bb = geo.boundingBox, sz = new T3.Vector3();
          bb.getSize(sz);
          // longest axis → Y (base at 0), thinnest → Z
          const axes = [["x", sz.x], ["y", sz.y], ["z", sz.z]].sort((a, b) => b[1] - a[1]);
          const mtx = new T3.Matrix4();
          if (axes[0][0] === "x") mtx.makeRotationZ(-Math.PI / 2);
          else if (axes[0][0] === "z") mtx.makeRotationX(Math.PI / 2);
          geo.applyMatrix4(mtx);
          geo.computeBoundingBox();
          const b2 = geo.boundingBox, s2 = new T3.Vector3();
          b2.getSize(s2);
          if (s2.x < s2.z) geo.applyMatrix4(new T3.Matrix4().makeRotationY(Math.PI / 2));
          geo.computeBoundingBox();
          const b3 = geo.boundingBox, s3 = new T3.Vector3();
          b3.getSize(s3);
          const k = 1 / Math.max(0.0001, s3.y);
          geo.applyMatrix4(new T3.Matrix4().makeScale(k, k, k));
          geo.computeBoundingBox();
          const b4 = geo.boundingBox;
          geo.applyMatrix4(new T3.Matrix4().makeTranslation(
            -(b4.min.x + b4.max.x) / 2, -b4.min.y, -(b4.min.z + b4.max.z) / 2));
          geo.computeVertexNormals();
          geo.setAttribute("aGlow",
            new T3.BufferAttribute(new Float32Array(geo.attributes.position.count).fill(1), 1));
          geo.computeBoundingBox();
          const bb5 = geo.boundingBox;
          matHero.__uni.uBounds.value.set(bb5.min.y, bb5.max.y,
            Math.max(Math.abs(bb5.min.x), Math.abs(bb5.max.x)), bb5.max.z - bb5.min.z);
          hero.geometry = geo;
          L.lightZ = bb5.max.z + 0.14;    // the pantheon constellates before the bud's face
          L.heroReady = true;
        } catch (e) { /* the parametric petal is the law */ }
      }, undefined, () => {});
    }

    /* the presented pantheon — its own kindled lights */
    const pGeo = new T3.BufferGeometry();
    const P_MAX = 40;
    L.pBuf = {
      pos: new Float32Array(P_MAX * 3), col: new Float32Array(P_MAX * 3),
      size: new Float32Array(P_MAX), fig: new Float32Array(P_MAX), born: new Float32Array(P_MAX),
    };
    pGeo.setAttribute("position", new T3.BufferAttribute(L.pBuf.pos, 3));
    pGeo.setAttribute("color", new T3.BufferAttribute(L.pBuf.col, 3));
    pGeo.setAttribute("aSize", new T3.BufferAttribute(L.pBuf.size, 1));
    pGeo.setAttribute("aFig", new T3.BufferAttribute(L.pBuf.fig, 1));
    pGeo.setAttribute("aBorn", new T3.BufferAttribute(L.pBuf.born, 1));
    pGeo.setDrawRange(0, 0);
    const pLights = new T3.Points(pGeo, crowdMaterial(stateTex, texW, texH, 2.1));
    pLights.material.uniforms.uIgnoreDim.value = 1;   // the petal's own lights never inherit the coliseum hush
    pLights.frustumCulled = false;
    grp.add(pLights);
    L.pLights = pLights;

    /* the inscription beneath the presented petal */
    L.inscription = null;    // sprite, rebuilt per presentation

    /* ---- helpers bound over the closure ---------------------------------- */
    let anim = null;         // the running entrance/return

    function seatMatrix(s, d) {
      d.position.set(Math.sin(s.az) * s.R, s.Y, -Math.cos(s.az) * s.R);
      d.rotation.set(0, 0, 0);
      d.rotation.order = "YXZ";
      d.rotation.y = -s.az;
      d.rotation.x = -s.lean;
      d.rotation.z = s.roll || 0;
      d.scale.setScalar(s.scale);
    }

    function figWorld(fi, out) {
      out.set(L.crowdPos[fi * 3], L.crowdPos[fi * 3 + 1], L.crowdPos[fi * 3 + 2]);
      // if this figure rides the presented petal, its light lives on the group
      if (L.presented && F[fi].tradition === L.presented.tid) {
        const lu = localOf[fi];
        if (lu) {
          surf(lu[0], lu[1], out);
          out.z = L.lightZ !== undefined ? L.lightZ : out.z + 0.055;
          out.applyMatrix4(grp.matrixWorld);
        }
      }
      return out;
    }

    function setState(fi, ch, v) {
      L.state.data[fi * 4 + ch] = Math.max(0, Math.min(255, Math.round(v * 255)));
      L.state.tex.needsUpdate = true;
    }
    function setBright(fi, v) { setState(fi, 1, v); }
    function setDim(fi, v) { setState(fi, 2, v); }

    /* screen-space picking (the Hall's pattern — no raycast storms) */
    const _pj = new T3.Vector3();
    function nearestSeat(x, y, maxPx) {
      let best = -1, bestD = maxPx * maxPx;
      const w2 = innerWidth / 2, h2 = innerHeight / 2;
      for (let n = 0; n < N; n++) {
        if (L.presented && L.presented.seat.n === n) continue;
        _pj.copy(seatCenters[n]).project(C.camera);
        if (_pj.z > 1) continue;
        const dx = _pj.x * w2 + w2 - x, dy = -_pj.y * h2 + h2 - y;
        const dd = dx * dx + dy * dy;
        if (dd < bestD) { bestD = dd; best = n; }
      }
      return best;
    }
    function hoverSeat(x, y) { return nearestSeat(x, y, 46); }
    function pickSeat(x, y) { return nearestSeat(x, y, 60); }
    function pickCrowd(x, y, maxPx) {
      let best = -1, bestD = (maxPx || 12) * (maxPx || 12);
      const w2 = innerWidth / 2, h2 = innerHeight / 2;
      for (let i = 0; i < NF; i++) {
        _pj.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).project(C.camera);
        if (_pj.z > 1) continue;
        const dx = _pj.x * w2 + w2 - x, dy = -_pj.y * h2 + h2 - y;
        const dd = dx * dx + dy * dy;
        if (dd < bestD) { bestD = dd; best = i; }
      }
      return best;
    }
    function pickPresentedFig(x, y) {
      if (!L.presented) return -1;
      let best = -1, bestD = 22 * 22;
      const w2 = innerWidth / 2, h2 = innerHeight / 2;
      const wp = new T3.Vector3();
      for (const fi of L.presentedFigs) {
        figWorld(fi, wp);
        _pj.copy(wp).project(C.camera);
        if (_pj.z > 1) continue;
        const dx = _pj.x * w2 + w2 - x, dy = -_pj.y * h2 + h2 - y;
        const dd = dx * dx + dy * dy;
        if (dd < bestD) { bestD = dd; best = fi; }
      }
      return best;
    }

    function setHover(n) {
      if (L.hovered === n) return;
      if (L.hovered >= 0) { glowReal[L.hovered] = 1; }
      L.hovered = n;
      if (n >= 0) glowReal[n] = 1.5;
      geoReal.attributes.aGlow.needsUpdate = true;
    }

    function neighbors(tid) {
      const s = M.seatByTid[tid];
      return {
        prev: s.n > 0 ? M.seats[s.n - 1].tid : null,
        next: s.n < N - 1 ? M.seats[s.n + 1].tid : null,
      };
    }

    /* ------------------------------------------------------------------ *
       THE ENTRANCE.
     * ------------------------------------------------------------------ */
    function present(tid, dir, instant) {
      dir = dir || 1;
      const seat = M.seatByTid[tid];
      if (!seat || (L.presented && L.presented.tid === tid)) return Promise.resolve();
      if (root.HALL && HALL.chunks) HALL.chunks.prefetch([tid]);

      const swapOut = L.presented ? dismissQuick(dir) : Promise.resolve();
      L.presenting = true;
      return swapOut.then(() => new Promise(res => {
        // hide the seat instance
        dummy.matrix.copy(seat.matrix);
        dummy.matrix.scale(new T3.Vector3(0.0001, 0.0001, 0.0001));
        real.setMatrixAt(seat.n, dummy.matrix);
        real.instanceMatrix.needsUpdate = true;

        // dress the hero
        const lin = new T3.Color(seat.color).convertSRGBToLinear();
        matHero.__uni.uColor.value.copy(lin);
        matHero.__uni.uOp.value = 1;
        if (!L.heroReady)
          matHero.__uni.uBounds.value.set(0, 1, W_MAX, 0.30);

        // its pantheon
        const list = M.figsOfTrad[tid] || [];
        L.presentedFigs = list.slice(0, P_MAX);
        const nowT = performance.now() / 1000;
        L.presentedFigs.forEach((fi, k) => {
          const lu = localOf[fi];
          surf(lu[0], lu[1], p);
          p.z = L.lightZ !== undefined ? L.lightZ : p.z + 0.055;
          L.pBuf.pos[k * 3] = p.x; L.pBuf.pos[k * 3 + 1] = p.y; L.pBuf.pos[k * 3 + 2] = p.z;
          if (F[fi].kind === "forgery") cc.set(C.D.tiers.forgery.gold); else cc.set(seat.color);
          cc.convertSRGBToLinear();
          L.pBuf.col[k * 3] = cc.r; L.pBuf.col[k * 3 + 1] = cc.g; L.pBuf.col[k * 3 + 2] = cc.b;
          L.pBuf.size[k] = (1.0 + 1.5 * Math.sqrt(M.degree[fi] / M.degMax)) * 0.62;
          L.pBuf.fig[k] = fi;
          L.pBuf.born[k] = nowT + (instant ? 0 : SWIRL * 0.75) + k * 0.06;
          setDim(fi, 0.9);                       // quiet its coliseum twin
        });
        ["position", "color", "aSize", "aFig", "aBorn"].forEach(a => {
          pGeo.attributes[a].needsUpdate = true;
        });
        pGeo.setDrawRange(0, L.presentedFigs.length);

        // the inscription
        if (L.inscription) { grp.remove(L.inscription); L.inscription.material.map.dispose(); }
        L.inscription = C.makeLabel(seat.name, C.fmtSpan(seat.period) +
          (seat.region ? "   ·   " + seat.region : ""), seat.color);
        L.inscription.position.set(0, -0.165, 0.10);
        L.inscription.scale.multiplyScalar(1 / PS);
        grp.add(L.inscription);

        // choreography frame
        const eye = C.rig.eye.clone();
        const fwd = C.rig.flat(), rightV = C.rig.right().multiplyScalar(dir);
        const up = new T3.Vector3(0, 1, 0);
        const HOLD = eye.clone().add(fwd.clone().multiplyScalar(HOLD_D)).add(up.clone().multiplyScalar(-1.15));
        const P0 = new T3.Vector3().setFromMatrixPosition(seat.matrix);
        L.presented = { tid, seat, HOLD, fwd, up };
        grp.visible = true;
        C.env.setDim(0.55);
        matReal.__uni.uHush.value = 1;           // eased in update
        L.hushGoal = 0.55;

        if (instant) {
          grp.position.copy(HOLD);
          grp.scale.setScalar(PS);
          faceEye(grp, eye);
          L.presenting = false;
          if (C.audio.started) C.audio.chime(seat.n, N);
          res();
          return;
        }

        C.audio.whoosh(SWIRL * 0.9);
        const b1 = P0.clone().add(up.clone().multiplyScalar(5));
        const b2 = HOLD.clone().add(rightV.clone().multiplyScalar(13)).add(fwd.clone().multiplyScalar(4));
        const b3 = HOLD.clone().add(rightV.clone().multiplyScalar(2.4));
        const FEINT = HOLD.clone().add(fwd.clone().multiplyScalar(3.8)).add(rightV.clone().multiplyScalar(1.6));

        anim = {
          t0: performance.now() / 1000, kind: "in", seat, res,
          tick(tt) {
            const T = Math.min(1, tt / SWIRL);
            let posn = new T3.Vector3(), sc, roll = 0;
            if (T < 0.62) {                       // two swirls in from the wing
              const q = ease(T / 0.62);
              posn = bez3(P0, b1, b2, b3, q);
              const swr = 5.2 * Math.pow(1 - q, 1.15);
              const ang = q * TAU * 2 * dir + Math.PI * 0.1;
              const envl = Math.pow(Math.sin(Math.PI * q), 0.7);
              posn.add(rightV.clone().multiplyScalar(Math.cos(ang) * swr * envl))
                  .add(up.clone().multiplyScalar(Math.sin(ang) * swr * envl * 0.85));
              sc = seat.scale + (PS - seat.scale) * q;
              roll = dir * (1 - q) * 2.2;
            } else if (T < 0.78) {                // away, like an opponent
              const q = ease((T - 0.62) / 0.16);
              posn.lerpVectors(b3, FEINT, q);
              sc = PS * (1 - 0.06 * Math.sin(Math.PI * q));
              roll = 0;
            } else {                              // soften forward to meet you
              const q = ease((T - 0.78) / 0.22);
              posn.lerpVectors(FEINT, HOLD, q);
              sc = PS * (1 + 0.02 * Math.sin(Math.PI * q));
              roll = 0;
            }
            grp.position.copy(posn);
            grp.scale.setScalar(sc);
            faceEye(grp, eye, roll);
            if (T >= 1) {
              grp.position.copy(HOLD); grp.scale.setScalar(PS); faceEye(grp, eye);
              L.presenting = false;
              C.audio.chime(seat.n, N);
              anim = null; res();
            }
          },
        };
      }));
    }

    function dismissQuick(dir) {
      return new Promise(res => {
        const prev = L.presented;
        if (!prev) { res(); return; }
        clearPresented();
        const from = grp.position.clone(), fromS = grp.scale.x;
        const slide = C.rig.right().multiplyScalar(-(dir || 1) * 8);
        anim = {
          t0: performance.now() / 1000, kind: "swap",
          tick(tt) {
            const T = Math.min(1, tt / 0.42), q = ease(T);
            grp.position.copy(from).add(slide.clone().multiplyScalar(q));
            grp.scale.setScalar(fromS * (1 - 0.5 * q));
            matHero.__uni.uOp.value = 1 - q;
            if (T >= 1) {
              grp.visible = false;
              matHero.__uni.uOp.value = 1;
              restoreSeat(prev.seat);
              anim = null; res();
            }
          },
        };
      });
    }

    function dismiss(instant) {
      return new Promise(res => {
        const prev = L.presented;
        if (!prev) { res(); return; }
        clearPresented();
        C.env.setDim(1);
        L.hushGoal = 1;
        if (instant) {
          grp.visible = false;
          restoreSeat(prev.seat);
          res(); return;
        }
        const from = grp.position.clone(), fromS = grp.scale.x;
        const to = new T3.Vector3().setFromMatrixPosition(prev.seat.matrix);
        const eye = C.rig.eye.clone();
        anim = {
          t0: performance.now() / 1000, kind: "out",
          tick(tt) {
            const T = Math.min(1, tt / RETURN), q = ease(T);
            grp.position.lerpVectors(from, to, q);
            grp.scale.setScalar(fromS + (prev.seat.scale - fromS) * q);
            matHero.__uni.uOp.value = 1 - q * 0.9;
            faceEye(grp, eye);
            if (T >= 1) {
              grp.visible = false;
              matHero.__uni.uOp.value = 1;
              restoreSeat(prev.seat);
              anim = null; res();
            }
          },
        };
      });
    }

    function clearPresented() {
      const prev = L.presented;
      if (!prev) return;
      L.presentedFigs.forEach(fi => setDim(fi, 0));
      L.presented = null;
      L.presentedFigs = [];
      pGeo.setDrawRange(0, 0);
    }

    function restoreSeat(seat) {
      real.setMatrixAt(seat.n, seat.matrix);
      real.instanceMatrix.needsUpdate = true;
    }

    function faceEye(g, eye, roll) {
      g.lookAt(eye.x, g.position.y * 0.35 + eye.y * 0.65, eye.z);
      g.rotateX(-0.38);                          // tilt the bowl of the petal to the gaze
      if (roll) g.rotateZ(roll);
    }

    function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    function bez3(p0, p1, p2, p3, t) {
      const it = 1 - t;
      return new T3.Vector3(
        it * it * it * p0.x + 3 * it * it * t * p1.x + 3 * it * t * t * p2.x + t * t * t * p3.x,
        it * it * it * p0.y + 3 * it * it * t * p1.y + 3 * it * t * t * p2.y + t * t * t * p3.y,
        it * it * it * p0.z + 3 * it * it * t * p1.z + 3 * it * t * t * p2.z + t * t * t * p3.z);
    }

    /* ---- per frame -------------------------------------------------------- */
    L.hushGoal = 1;
    function update(dt, t) {
      matReal.__uni.uTime.value = t;
      matGhost.__uni.uTime.value = t;
      matHero.__uni.uTime.value = t;
      const k = 1 - Math.pow(0.002, dt);
      matReal.__uni.uHush.value += (L.hushGoal - matReal.__uni.uHush.value) * k;
      matGhost.__uni.uHush.value = matReal.__uni.uHush.value;

      const cm = crowd.material.uniforms;
      cm.uTime.value = t;
      cm.uFwd.value.copy(C.rig.fwd());
      cm.uHushAll.value = 0.35 + 0.65 * matReal.__uni.uHush.value;
      const pm = pLights.material.uniforms;
      pm.uTime.value = t;
      pm.uFwd.value.copy(C.rig.fwd());

      if (anim) anim.tick(performance.now() / 1000 - anim.t0);
      else if (L.presented) {
        // the settled petal breathes on its stem of air
        const b = Math.sin(t * 0.6) * 0.05;
        grp.position.copy(L.presented.HOLD).add(new T3.Vector3(0, b, 0));
      }
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
