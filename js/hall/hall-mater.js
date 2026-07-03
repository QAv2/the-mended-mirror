/* ============================================================================
   THE HALL OF AGES — the mater: the shattered mirror, laid flat for mending.
   ----------------------------------------------------------------------------
   219 shards of dark glass in a radial fracture whose rings are ages.
   Gold ribbons live in the cracks where traditions truly converge — brightness
   is evidence tier, width is seam count. Dark cracks are honest absences.
   At the center, the pool: the one unbroken piece — the face the mirror shows
   when it is mended. Around the rim, the calendar; across it, the rule.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  HALL.buildMater = function (H) {
    const M = H.model, D = M.DATA;
    const group = new THREE.Group();
    H.scene.add(group);

    /* =========================================================================
       SHARDS — one merged extruded geometry, one custom shader.
       Per-shard state (lit / hover / select) lives in a 256×1 DataTexture.
       ========================================================================= */
    const stateW = 256;
    const shardState = new Uint8Array(stateW * 4);
    const shardTex = new THREE.DataTexture(shardState, stateW, 1, THREE.RGBAFormat);
    shardTex.magFilter = shardTex.minFilter = THREE.NearestFilter;
    shardTex.needsUpdate = true;

    const positions = [], normals = [], colors = [], shardIdx = [];
    const faceShard = [];                        // triangle index → shard index (picking)
    const tmpC = new THREE.Color();

    M.shards.forEach(s => {
      const shape = new THREE.Shape();
      s.poly.forEach((p, i) => { if (i === 0) shape.moveTo(p.x, p.z); else shape.lineTo(p.x, p.z); });
      shape.closePath();
      let geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.34, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.04, bevelSegments: 1, curveSegments: 1,
      });
      if (geo.index) geo = geo.toNonIndexed();
      // orient: shape-plane → xz, extrusion downward; then the shattered rest-tilt
      const m = new THREE.Matrix4()
        .makeTranslation(s.cx, s.tilt.dy, s.cz)
        .multiply(new THREE.Matrix4().makeRotationX(s.tilt.rx + Math.PI / 2))
        .multiply(new THREE.Matrix4().makeRotationZ(s.tilt.rz))
        .multiply(new THREE.Matrix4().makeTranslation(-s.cx, -s.cz, 0));
      geo.applyMatrix4(m);
      const pos = geo.attributes.position, nor = geo.attributes.normal;
      tmpC.set(D.traditions[s.trad].color).convertSRGBToLinear();
      for (let i = 0; i < pos.count; i++) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
        colors.push(tmpC.r, tmpC.g, tmpC.b);
        shardIdx.push(s.idx);
      }
      for (let f = 0; f < pos.count / 3; f++) faceShard.push(s.idx);
      geo.dispose();
    });

    const shardGeo = new THREE.BufferGeometry();
    shardGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    shardGeo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    shardGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    shardGeo.setAttribute("aShard", new THREE.Float32BufferAttribute(shardIdx, 1));

    const shardMat = new THREE.ShaderMaterial({
      fog: true, vertexColors: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uState: { value: shardTex },
        uStateW: { value: stateW },
        uTime: { value: 0 },
      }]),
      vertexShader: `
        attribute float aShard;
        varying vec3 vColor; varying vec3 vN; varying vec3 vW;
        varying float vLit; varying float vHover; varying float vSel;
        uniform sampler2D uState; uniform float uStateW;
        #include <fog_pars_vertex>
        void main(){
          vColor = color;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 st = texture2D(uState, vec2((aShard + 0.5) / uStateW, 0.5));
          vLit = st.r; vHover = st.g; vSel = st.b;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        varying vec3 vColor; varying vec3 vN; varying vec3 vW;
        varying float vLit; varying float vHover; varying float vSel;
        uniform float uTime;
        #include <fog_pars_fragment>
        void main(){
          vec3 N = normalize(vN);
          vec3 V = normalize(cameraPosition - vW);
          float topness = clamp(N.y, 0.0, 1.0);
          float lit = vLit;
          // dark glass: obsidian first, the tradition's color a stain within it
          float luma = dot(vColor, vec3(0.30, 0.55, 0.15));
          vec3 jewel = mix(vec3(luma) * vec3(0.55, 0.6, 0.7), vColor, 0.72);   // slightly slated
          vec3 glass = mix(vec3(0.008, 0.010, 0.015), jewel, (0.115 + 0.075 * lit) * mix(0.35, 1.0, topness));
          vec3 base = glass * (0.14 + 0.52 * lit) * mix(0.16, 1.0, topness);
          // glass spec from the shaft
          vec3 L = normalize(vec3(0.14, 1.0, 0.10));
          vec3 Hv = normalize(L + V);
          float spec = pow(max(dot(N, Hv), 0.0), 90.0) * (0.20 + 0.80 * lit) * 0.30;
          // silver-gold fresnel sheen — the glass remembers it is a mirror
          float fr = pow(1.0 - max(dot(N, V), 0.0), 3.0) * mix(0.10, 1.0, topness);
          vec3 sheen = mix(vec3(0.62, 0.68, 0.80), vec3(1.0, 0.85, 0.52), 0.35 + 0.45 * lit);
          vec3 col = base + spec * vec3(1.0, 0.95, 0.82) * mix(0.2, 1.0, topness) + fr * sheen * (0.035 + 0.16 * lit);
          col += vHover * (vColor * 0.30 + vec3(0.10, 0.09, 0.06));
          col += vSel * (fr * vec3(1.0, 0.83, 0.45) * 0.9 + vColor * 0.22 + vec3(0.04));
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
          #include <fog_fragment>
        }`,
    });
    shardMat.uniforms.uState.value = shardTex;   // merge() clones textures — reassign the live one
    const shardMesh = new THREE.Mesh(shardGeo, shardMat);
    shardMesh.userData.kind = "shards";
    shardMesh.userData.faceShard = faceShard;
    group.add(shardMesh);

    /* ghost reflection below — the black water */
    const ghostMat = new THREE.ShaderMaterial({
      fog: true, vertexColors: true, transparent: true, depthWrite: false, side: THREE.BackSide,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uState: { value: shardTex }, uStateW: { value: stateW },
      }]),
      vertexShader: `
        attribute float aShard;
        varying vec3 vColor; varying float vLit;
        uniform sampler2D uState; uniform float uStateW;
        #include <fog_pars_vertex>
        void main(){
          vColor = color;
          vec4 st = texture2D(uState, vec2((aShard + 0.5) / uStateW, 0.5));
          vLit = st.r;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vLit;
        #include <fog_pars_fragment>
        void main(){
          vec3 col = vColor * (0.012 + 0.035 * vLit);
          gl_FragColor = vec4(col, 0.55);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
          #include <fog_fragment>
        }`,
    });
    ghostMat.uniforms.uState.value = shardTex;
    const ghost = new THREE.Mesh(shardGeo, ghostMat);
    ghost.scale.y = -1;
    ghost.position.y = -1.1;
    group.add(ghost);

    /* =========================================================================
       GOLD RIBBONS — the kintsugi. Only where convergence is real.
       ========================================================================= */
    const mended = M.borders.filter(b => b.agg);
    const borderW = 512;
    const borderState = new Uint8Array(borderW * 4);
    const borderTex = new THREE.DataTexture(borderState, borderW, 1, THREE.RGBAFormat);
    borderTex.magFilter = borderTex.minFilter = THREE.NearestFilter;
    borderTex.needsUpdate = true;

    function ribbonGeo(widthScale, yLift) {
      const pos = [], col = [], idx = [], bidx = [];
      const c = new THREE.Color();
      mended.forEach((b, bi) => {
        const tier = D.tiers[b.agg.bestTier] || D.tiers["3"];
        c.set(tier.gold).convertSRGBToLinear();
        const bright = 0.55 + 0.45 * Math.min(1, b.agg.bestW / 2.6);
        const w = (0.075 + 0.030 * Math.log2(b.agg.count + 1)) * widthScale;
        const pts = b.pts;
        const base = pos.length / 3;
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
          let dx = p1.x - p0.x, dz = p1.z - p0.z;
          const len = Math.hypot(dx, dz) || 1; dx /= len; dz /= len;
          const px = -dz * w, pz = dx * w;
          pos.push(pts[i].x + px, yLift, pts[i].z + pz, pts[i].x - px, yLift, pts[i].z - pz);
          for (let k = 0; k < 2; k++) { col.push(c.r * bright, c.g * bright, c.b * bright); bidx.push(bi); }
        }
        for (let i = 0; i < pts.length - 1; i++) {
          const a = base + i * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      g.setAttribute("aBorder", new THREE.Float32BufferAttribute(bidx, 1));
      g.setIndex(idx);
      return g;
    }
    function ribbonMat(gain) {
      return new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, vertexColors: true,
        uniforms: { uState: { value: borderTex }, uStateW: { value: borderW }, uGain: { value: gain } },
        vertexShader: `
          attribute float aBorder;
          varying vec3 vColor; varying float vLit; varying float vFlash;
          uniform sampler2D uState; uniform float uStateW;
          void main(){
            vColor = color;
            vec4 st = texture2D(uState, vec2((aBorder + 0.5) / uStateW, 0.5));
            vLit = st.r; vFlash = st.g;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vColor; varying float vLit; varying float vFlash;
          uniform float uGain;
          void main(){
            vec3 col = vColor * vLit * uGain * (1.0 + vFlash * 2.4);
            col += vec3(1.0, 0.92, 0.70) * vFlash * vLit * 0.55;
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }`,
      });
    }
    const ribbonCore = new THREE.Mesh(ribbonGeo(1.0, 0.24), ribbonMat(1.35));
    const ribbonHalo = new THREE.Mesh(ribbonGeo(3.4, 0.21), ribbonMat(0.30));
    group.add(ribbonCore, ribbonHalo);

    /* =========================================================================
       THE POOL — the one unbroken piece at the center.
       ========================================================================= */
    const poolMat = new THREE.ShaderMaterial({
      fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uTime: { value: 0 }, uPulse: { value: 0 },
      }]),
      vertexShader: `
        varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        #include <fog_pars_vertex>
        void main(){
          vUv = uv; vN = normalize(mat3(modelMatrix) * normal);
          vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        uniform float uTime; uniform float uPulse;
        #include <fog_pars_fragment>
        void main(){
          vec3 N = normalize(vN);
          vec3 V = normalize(cameraPosition - vW);
          float r = length(vUv - 0.5) * 2.0;
          vec3 col = vec3(0.012, 0.014, 0.020);
          float fr = pow(1.0 - max(dot(N, V), 0.0), 2.5);
          col += fr * vec3(0.35, 0.38, 0.46) * 0.35;
          float shimmer = sin(r * 9.0 - uTime * 0.35) * 0.5 + 0.5;
          col += shimmer * (1.0 - r) * vec3(0.30, 0.24, 0.12) * 0.10;
          // the pulse — the mend completing, crossing the still face once
          float ring = smoothstep(0.09, 0.0, abs(r - uPulse)) * step(0.001, uPulse) * (1.0 - uPulse);
          col += ring * vec3(1.0, 0.84, 0.48) * 0.9;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
          #include <fog_fragment>
        }`,
    });
    const pool = new THREE.Mesh(new THREE.CircleGeometry(M.POOL_R - 0.14, 72), poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.03;
    pool.userData.kind = "pool";
    group.add(pool);

    const poolRim = new THREE.Mesh(
      new THREE.TorusGeometry(M.POOL_R - 0.10, 0.022, 10, 96),
      new THREE.MeshStandardMaterial({ color: HALL.COL.gold, metalness: 1.0, roughness: 0.32, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.75 })
    );
    poolRim.rotation.x = Math.PI / 2;
    poolRim.position.y = 0.05;
    group.add(poolRim);

    /* =========================================================================
       THE RIM — the calendar of ages engraved around the instrument's limb.
       Angle IS time: one turn from the deep past to now.
       ========================================================================= */
    const RIM_IN = M.R + 0.55, RIM_OUT = M.R + 3.2;
    const angleOfT = t => M.timeAngle.angleOfT(t);   // the shared hand — one mapping for rule, calendar, wall

    const rimCanvas = document.createElement("canvas");
    rimCanvas.width = rimCanvas.height = 2048;
    function drawRim() {
      const g = rimCanvas.getContext("2d");
      const CC = 1024, S = 1024 / (RIM_OUT + 0.4);   // world → px
      g.clearRect(0, 0, 2048, 2048);
      g.translate(CC, CC);
      // limb circles
      g.strokeStyle = "rgba(240,196,90,0.34)"; g.lineWidth = 2.5;
      g.beginPath(); g.arc(0, 0, RIM_IN * S, 0, TAU); g.stroke();
      g.beginPath(); g.arc(0, 0, RIM_OUT * S, 0, TAU); g.stroke();
      g.strokeStyle = "rgba(240,196,90,0.14)"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, 0, (RIM_IN + 0.55) * S, 0, TAU); g.stroke();
      // era boundaries + names + years
      M.ERAS.forEach((e, i) => {
        const t0 = M.time.yearToT(e.from), t1 = M.time.yearToT(e.to);
        const a0 = angleOfT(t0), a1 = angleOfT(t1);
        // boundary tick
        g.strokeStyle = "rgba(240,196,90,0.42)"; g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(Math.cos(a0) * RIM_IN * S, Math.sin(a0) * RIM_IN * S);
        g.lineTo(Math.cos(a0) * RIM_OUT * S, Math.sin(a0) * RIM_OUT * S);
        g.stroke();
        // year label at boundary
        const yr = e.from < 0 ? Math.abs(e.from).toLocaleString() + " BCE" : e.from + " CE";
        g.save();
        const upright = Math.sin(a0) > 0;
        g.translate(Math.cos(a0) * (RIM_IN - 0.75) * S, Math.sin(a0) * (RIM_IN - 0.75) * S);
        g.rotate(a0 + (upright ? -Math.PI / 2 : Math.PI / 2));
        g.fillStyle = "rgba(130,139,156,0.66)";
        g.font = "300 19px Spectral, Georgia, serif";
        g.textAlign = "center";
        g.fillText(yr, 0, 0);
        g.restore();
        // era name along the arc
        const name = e.name.toUpperCase();
        const aMid = (a0 + a1) / 2;
        const rText = (RIM_IN + RIM_OUT) / 2 * S;
        g.fillStyle = "rgba(240,196,90,0.66)";
        g.font = "26px Marcellus, Georgia, serif";
        const totalArc = (a1 - a0) * 0.72;
        const per = totalArc / Math.max(1, name.length - 1);
        const flip = Math.sin(aMid) > 0;               // lower half: keep glyphs upright
        for (let ch = 0; ch < name.length; ch++) {
          const a = flip ? (aMid + totalArc / 2 - per * ch) : (aMid - totalArc / 2 + per * ch);
          g.save();
          g.translate(Math.cos(a) * rText, Math.sin(a) * rText);
          g.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
          g.textAlign = "center";
          g.fillText(name[ch], 0, flip ? 0 : 9);
          g.restore();
        }
      });
      // NOW mark
      const aN = angleOfT(1);
      g.fillStyle = "rgba(255,228,154,0.95)";
      g.beginPath();
      g.arc(Math.cos(aN) * RIM_IN * S, Math.sin(aN) * RIM_IN * S, 7, 0, TAU);
      g.fill();
      // the door — the prophesied interval, sealed across the calendar's wrap.
      // The same arc the wall leaves open as its doorway.
      const DOOR = M.timeAngle.DOOR_A;
      g.strokeStyle = "rgba(240,196,90,0.30)"; g.lineWidth = 2.2;
      [aN, aN + DOOR].forEach(a => {
        g.beginPath();
        g.moveTo(Math.cos(a) * RIM_IN * S, Math.sin(a) * RIM_IN * S);
        g.lineTo(Math.cos(a) * RIM_OUT * S, Math.sin(a) * RIM_OUT * S);
        g.stroke();
      });
      g.strokeStyle = "rgba(240,196,90,0.15)"; g.lineWidth = 11;
      g.beginPath(); g.arc(0, 0, ((RIM_IN + RIM_OUT) / 2) * S, aN, aN + DOOR); g.stroke();
      const aDm = aN + DOOR / 2;
      g.save();
      g.translate(Math.cos(aDm) * (RIM_IN - 0.95) * S, Math.sin(aDm) * (RIM_IN - 0.95) * S);
      g.rotate(aDm + (Math.sin(aDm) > 0 ? -Math.PI / 2 : Math.PI / 2));
      g.fillStyle = "rgba(200,180,130,0.58)";
      g.font = "italic 300 19px Spectral, Georgia, serif";
      g.textAlign = "center";
      g.fillText("the prophesied", 0, 0);
      g.restore();
    }
    drawRim();
    const rimTex = new THREE.CanvasTexture(rimCanvas);
    rimTex.encoding = THREE.sRGBEncoding;
    rimTex.anisotropy = 8;
    const rimMesh = new THREE.Mesh(
      new THREE.CircleGeometry(RIM_OUT + 0.4, 128),
      new THREE.MeshBasicMaterial({ map: rimTex, transparent: true, depthWrite: false, fog: false, opacity: 0.9 })
    );
    rimMesh.rotation.x = -Math.PI / 2;
    rimMesh.position.y = 0.02;
    group.add(rimMesh);

    /* =========================================================================
       THE RULE — the instrument's pointer; drag it to travel time.
       ========================================================================= */
    const rule = new THREE.Group();
    rule.position.y = 0.42;
    const ruleMat = new THREE.MeshStandardMaterial({
      color: 0x7d5f20, metalness: 1.0, roughness: 0.68,
      emissive: 0x241a06, emissiveIntensity: 0.45,
    });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(RIM_OUT - 0.4, 0.03, 0.058), ruleMat);
    arm.position.x = (RIM_OUT - 0.4) / 2;
    rule.add(arm);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.06), ruleMat);
    tail.position.x = -1.3;
    rule.add(tail);
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 20), ruleMat);
    rule.add(pivot);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 14),
      new THREE.MeshStandardMaterial({ color: HALL.COL.gold, metalness: 1, roughness: 0.35, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.7 }));
    knob.position.x = RIM_IN + 1.3;
    rule.add(knob);
    // fat invisible grab handle
    const grab = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false }));
    grab.position.x = RIM_IN + 1.3;
    grab.userData.kind = "rule";
    rule.add(grab);
    group.add(rule);

    function setRuleYear(y) {
      const a = angleOfT(M.time.yearToT(y));
      rule.rotation.y = -a;
    }
    setRuleYear(M.NOW);

    /* =========================================================================
       STATE — per-shard / per-border lighting for a given year.
       ========================================================================= */
    const hoverV = new Float32Array(M.shards.length);
    const selV = new Float32Array(M.shards.length);
    const dimV = { value: 0 };   // focus dim on non-selected

    function litOfShard(s, year, tScrub) {
      if (year < s.from) return 0.028;
      const tBirth = M.time.yearToT(s.from);
      const k = Math.min(1, Math.max(0, (tScrub - tBirth) / 0.02));   // kindle over a sliver of the age-line
      const kindle = k * k * (3 - 2 * k);
      const alive = s.living || year <= s.to;
      const ember = alive ? 1.0 : 0.44;
      return 0.028 + kindle * (0.972 * ember);
    }

    const borderFlash = new Float32Array(mended.length);
    function applyYear(year, opts) {
      const tScrub = M.time.yearToT(year);
      const ceremony = opts && opts.ceremony;
      for (let i = 0; i < M.shards.length; i++) {
        const s = M.shards[i];
        const lit = litOfShard(s, year, tScrub);
        const dim = 1 - dimV.value * (selV[i] > 0 || hoverV[i] > 0 ? 0 : 0.62);
        let hov = hoverV[i];
        if (ceremony) {
          const dt = tScrub - M.time.yearToT(s.from);
          if (dt > 0 && dt < 0.04) hov = Math.max(hov, Math.exp(-dt / 0.008) * 0.8);   // the kindle
        }
        shardState[i * 4] = Math.round(255 * Math.min(1, lit * dim));
        shardState[i * 4 + 1] = Math.round(255 * Math.min(1, hov));
        shardState[i * 4 + 2] = Math.round(255 * selV[i]);
      }
      shardTex.needsUpdate = true;
      for (let i = 0; i < mended.length; i++) {
        const b = mended[i];
        const sa = M.shards[b.a], sb = M.shards[b.b];
        const born = Math.max(sa.from, sb.from);
        const tSeal = M.time.yearToT(born);
        let lit = Math.min(1, Math.max(0, (tScrub - tSeal) / 0.012));
        // seal flash during the ceremony
        if (opts && opts.ceremony) {
          const dt = tScrub - tSeal;
          borderFlash[i] = dt > 0 && dt < 0.03 ? Math.exp(-dt / 0.010) : 0;
        } else borderFlash[i] *= 0.9;
        const dim = 1 - dimV.value * 0.55;
        borderState[i * 4] = Math.round(255 * lit * dim);
        borderState[i * 4 + 1] = Math.round(255 * Math.min(1, borderFlash[i]));
      }
      borderTex.needsUpdate = true;
    }
    applyYear(M.NOW);

    /* ---------- expose ---------- */
    H.mater = {
      group, shardMesh, pool, poolMat, rule, grab, rimMesh,
      ribbonCore, ribbonHalo,
      hoverV, selV, dimV,
      mended,
      applyYear, setRuleYear, angleOfT,
      RIM_IN, RIM_OUT,
      tick(t) { shardMat.uniforms.uTime.value = t; poolMat.uniforms.uTime.value = t; },
      pulsePool() {
        poolMat.uniforms.uPulse.value = 0.001;
        H.tween(2.2, k => { poolMat.uniforms.uPulse.value = k; }, H.easeOut, () => { poolMat.uniforms.uPulse.value = 0; });
      },
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
