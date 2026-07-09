/* ============================================================================
   THE CONCLAVE OF BECOMING — the ground of the space.
   ----------------------------------------------------------------------------
   The void continued upward from the Hall's oculus. Builds:

     · renderer/camera in the Hall's blood (sRGB, ACESFilmic, tiered px)
     · the center-stand rig — you never walk; you TURN. Damped gaze with
       momentum, the coliseum law from Joe's note: "spin around the room,
       L/R (no 3d movement)."
     · the stone-and-starlight floor (canon: "both stone and starlight")
     · the hearth at the exact center (canon: Hestia's immutable anchor),
       with the Source Trinity turning slowly above it
     · the Loong — twin ribbons weaving an endless, non-binding knot overhead
     · the oculus set into the floor: the Hall of Ages seen from above,
       warm light rising. The way home.
     · stars + faint nebulae; the rite shaft (the rise-in passage)
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};
  const T3 = root.THREE;
  const TAU = Math.PI * 2;

  /* ---- quality tiers (the Hall's ladder) -------------------------------- */
  C.quality = function (renderer) {
    const gl = renderer.getContext();
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const mem = navigator.deviceMemory || 8;
    const coarse = matchMedia && matchMedia("(pointer:coarse)").matches;
    let tier = 2;
    if (coarse || mem <= 4 || maxTex < 8192) tier = 1;
    if (maxTex < 4096 || mem <= 2) tier = 0;
    const q = new URLSearchParams(location.search).get("tier");
    if (q !== null && q !== "") tier = Math.max(0, Math.min(2, +q));
    return [
      { tier: 0, px: 1.25, stars: 500,  ghosts: 150, tube: 130, motes: 14, sparks: 18 },
      { tier: 1, px: 1.5,  stars: 800,  ghosts: 300, tube: 200, motes: 20, sparks: 26 },
      { tier: 2, px: 2.0,  stars: 1400, ghosts: 460, tube: 280, motes: 26, sparks: 36 },
    ][tier];
  };

  C.buildScene = function () {
    const renderer = new T3.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(innerWidth, innerHeight);
    C.Q = C.quality(renderer);
    renderer.setPixelRatio(Math.min(devicePixelRatio, C.Q.px));
    renderer.outputEncoding = T3.sRGBEncoding;
    renderer.toneMapping = T3.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    document.getElementById("stage").appendChild(renderer.domElement);

    const scene = new T3.Scene();
    scene.background = new T3.Color(C.COL.void);
    scene.fog = new T3.FogExp2(C.COL.void, 0.0034);

    const camera = new T3.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1400);

    C.renderer = renderer; C.scene = scene; C.camera = camera;

    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    buildRig();
    buildEnv();
  };

  /* ======================================================================= *
     THE RIG — stand at the heart, turn among the family.
   * ======================================================================= */
  function buildRig() {
    const rig = C.rig = {
      eye: new T3.Vector3(0, 3.2, 0),
      theta: 0, phi: 1.42, dTheta: 0, dPhi: 1.42,
      fov: 58, dFov: 58,
      vel: 0,                      // spin momentum (rad/s)
      locked: false,
      flight: null,
      MIN_PHI: 0.30, MAX_PHI: 2.02,
      fwd() {
        const p = this.phi, t = this.theta;
        return new T3.Vector3(Math.sin(p) * Math.sin(t), Math.cos(p), -Math.sin(p) * Math.cos(t));
      },
      flat() {                     // horizontal forward
        const t = this.theta;
        return new T3.Vector3(Math.sin(t), 0, -Math.cos(t));
      },
      right() {
        const t = this.theta;
        return new T3.Vector3(Math.cos(t), 0, Math.sin(t));
      },
      turnTo(theta, phi, dur, done) {
        // unwrap so we take the short way round
        let d = theta - this.dTheta;
        d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI;
        this.flight = { t0: performance.now() / 1000, dur: dur || 0.9,
                        from: this.dTheta, to: this.dTheta + d,
                        fromP: this.dPhi, toP: (phi !== undefined ? phi : this.dPhi), done };
      },
      update(dt) {
        if (this.flight) {
          const f = this.flight, u = Math.min(1, (performance.now() / 1000 - f.t0) / f.dur);
          const e = C.ease(u);
          this.dTheta = f.from + (f.to - f.from) * e;
          this.dPhi = f.fromP + (f.toP - f.fromP) * e;
          if (u >= 1) { this.flight = null; if (f.done) f.done(); }
        } else if (!this.locked && Math.abs(this.vel) > 0.0004) {
          this.dTheta += this.vel * dt;
          this.vel *= Math.pow(0.10, dt);          // glide, then rest
        }
        this.dPhi = Math.max(this.MIN_PHI, Math.min(this.MAX_PHI, this.dPhi));
        const k = 1 - Math.pow(0.0001, dt);
        this.theta += (this.dTheta - this.theta) * k;
        this.phi += (this.dPhi - this.phi) * k;
        this.fov += (this.dFov - this.fov) * k;
        C.camera.fov = this.fov; C.camera.updateProjectionMatrix();
        C.camera.position.copy(this.eye);
        const look = this.eye.clone().add(this.fwd());
        C.camera.lookAt(look);
      },
    };
  }

  /* ======================================================================= *
     THE ENVIRONMENT
   * ======================================================================= */
  function buildEnv() {
    const S = C.scene, Q = C.Q;
    const env = C.env = { dim: 1, dimGoal: 1, pickables: [], update: envUpdate, setDim(v) { this.dimGoal = v; } };
    const loader = new T3.TextureLoader();

    /* ---- light ----------------------------------------------------------- */
    S.add(new T3.AmbientLight(0x1a2233, 1.35));
    const hearthLight = new T3.PointLight(0xff9a4a, 2.1, 46, 2);
    hearthLight.position.set(0, 1.1, 0);
    S.add(hearthLight);
    env.hearthLight = hearthLight;
    const oculusLight = new T3.PointLight(0xffe9bf, 1.1, 18, 2);
    oculusLight.position.set(0, 0.6, 8.5);
    S.add(oculusLight);
    env.oculusLight = oculusLight;

    /* ---- stars ------------------------------------------------------------ */
    {
      const n = Q.stars, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const cool = new T3.Color(0x9aa6c4), warmc = new T3.Color(0xd8c9a0), c = new T3.Color();
      for (let i = 0; i < n; i++) {
        const u = Math.random(), v = Math.random();
        const th = u * TAU, ph = Math.acos(2 * v - 1);
        let R = 620 + Math.random() * 260;
        let y = R * Math.cos(ph);
        if (y < 0 && Math.random() > 0.3) y = -y;      // thin the under-void
        pos[i * 3] = R * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = R * Math.sin(ph) * Math.sin(th);
        c.copy(cool).lerp(warmc, Math.random() * Math.random());
        const b = 0.5 + Math.random() * 0.5;
        col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
      }
      const g = new T3.BufferGeometry();
      g.setAttribute("position", new T3.BufferAttribute(pos, 3));
      g.setAttribute("color", new T3.BufferAttribute(col, 3));
      const m = new T3.PointsMaterial({ size: 1.7, sizeAttenuation: false,
        vertexColors: true, transparent: true, opacity: 0.75, fog: false, depthWrite: false });
      const stars = new T3.Points(g, m);
      stars.frustumCulled = false;
      S.add(stars);
      env.stars = stars;
    }

    /* ---- nebulae ----------------------------------------------------------- */
    {
      const tex = loader.load("assets/conclave/nebula.png", t => { t.encoding = T3.sRGBEncoding; });
      const mk = (sc, op, x, y, z, rot) => {
        const m = new T3.SpriteMaterial({ map: tex, transparent: true, opacity: op,
          blending: T3.AdditiveBlending, depthWrite: false, fog: false, rotation: rot });
        const sp = new T3.Sprite(m);
        sp.scale.set(sc, sc, 1); sp.position.set(x, y, z);
        S.add(sp); return sp;
      };
      env.nebulae = [
        mk(560, 0.34, -420, 300, -540, 0.4),
        mk(430, 0.26, 520, 180, 380, 2.3),
        mk(640, 0.20, 60, 520, 640, 4.1),
      ];
    }

    /* ---- the floor: stone and starlight ------------------------------------ */
    {
      const FLOOR_R = 40;
      const geo = new T3.RingGeometry(0.02, FLOOR_R, 128, 6);
      const uni = {
        tStone: { value: null }, uHasTex: { value: 0 },
        uTime: { value: 0 }, uFogD: { value: 0.0034 },
        uVoid: { value: new T3.Color(C.COL.void) },
        uEmber: { value: 0.5 },
      };
      loader.load("assets/conclave/floor-starlight.png", t => {
        t.encoding = T3.sRGBEncoding; t.wrapS = t.wrapT = T3.RepeatWrapping;
        uni.tStone.value = t; uni.uHasTex.value = 1;
      });
      const mat = new T3.ShaderMaterial({
        uniforms: uni, transparent: true, fog: false,
        vertexShader: `
          varying vec2 vUv; varying vec3 vW; varying vec3 vN;
          void main(){
            vUv = uv;
            vec4 w = modelMatrix * vec4(position,1.0);
            vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal);
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: `
          uniform sampler2D tStone; uniform float uHasTex, uTime, uFogD, uEmber;
          uniform vec3 uVoid;
          varying vec2 vUv; varying vec3 vW; varying vec3 vN;
          void main(){
            float r = length(vW.xz);
            vec3 base = vec3(0.030,0.034,0.048);
            if (uHasTex > 0.5) {
              vec3 s1 = texture2D(tStone, vUv*1.0 + vec2(uTime*0.0011, -uTime*0.0007)).rgb;
              vec3 s2 = texture2D(tStone, vUv*2.6 + vec2(-uTime*0.0018, uTime*0.0013)).rgb;
              base = s1*1.25 + s2*0.85*smoothstep(0.4,0.0,length(s1));  // stars adrift in the stone
            }
            // grazing sheen
            vec3 V = normalize(cameraPosition - vW);
            float fr = pow(1.0 - abs(dot(V, vN)), 3.0);
            base += vec3(0.10,0.12,0.17) * fr * 0.6;
            // hearth warmth at the center
            float warm = smoothstep(4.5, 0.4, r);
            base += vec3(1.0,0.44,0.16) * warm * (0.05 + 0.09*uEmber);
            // dissolve into the void at the rim
            float a = smoothstep(40.0, 27.0, r);
            // manual exp2 fog
            float d = length(cameraPosition - vW);
            float f = 1.0 - exp(-d*d*uFogD*uFogD);
            base = mix(base, uVoid, f);
            gl_FragColor = vec4(base, a);
          }`,
      });
      const floor = new T3.Mesh(geo, mat);
      floor.rotation.x = -Math.PI / 2;
      floor.renderOrder = -2;
      S.add(floor);
      env.floor = floor; env.floorU = uni;
    }

    /* ---- the hearth (Hestia's anchor) --------------------------------------- */
    {
      const g = new T3.Group();
      // the bowl — a lathe, never a fan
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        pts.push(new T3.Vector2(0.06 + u * 1.12, 0.30 * Math.pow(u, 1.7) + 0.02));
      }
      const bowl = new T3.Mesh(
        new T3.LatheGeometry(pts, 40),
        new T3.MeshStandardMaterial({ color: 0x2c2824, roughness: 0.92, metalness: 0.08 })
      );
      g.add(bowl);

      // ember glow sprites
      const embers = [];
      const etex = glowTexture("#ffd9a0", "#ff7a2a");
      for (let i = 0; i < 3; i++) {
        const m = new T3.SpriteMaterial({ map: etex, transparent: true,
          blending: T3.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.85 });
        const sp = new T3.Sprite(m);
        sp.position.set((i - 1) * 0.22, 0.42 + i * 0.07, (i % 2 - 0.5) * 0.2);
        sp.scale.set(1.2 + i * 0.5, 1.2 + i * 0.5, 1);
        g.add(sp); embers.push(sp);
      }
      // rising sparks
      const n = Q.sparks, pos = new Float32Array(n * 3), life = new Float32Array(n);
      for (let i = 0; i < n; i++) { life[i] = Math.random(); seedSpark(pos, i, true); }
      const sg = new T3.BufferGeometry();
      sg.setAttribute("position", new T3.BufferAttribute(pos, 3));
      const sm = new T3.PointsMaterial({ color: 0xffb066, size: 2.4, sizeAttenuation: false,
        transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false, fog: false });
      const sparks = new T3.Points(sg, sm);
      g.add(sparks);
      env.hearth = { group: g, embers, sparks, pos, life, n };
      S.add(g);
    }

    /* ---- the Source Trinity --------------------------------------------------- */
    {
      const g = new T3.Group();
      const mk = (hex, sc) => {
        const m = new T3.SpriteMaterial({ map: glowTexture("#ffffff", hex), transparent: true,
          blending: T3.AdditiveBlending, depthWrite: false, fog: false });
        const sp = new T3.Sprite(m); sp.scale.set(sc, sc, 1); g.add(sp); return sp;
      };
      env.trinity = {
        group: g,
        solar: mk("#ffd27a", 0.95),
        lunar: mk("#cfd8ea", 0.80),
        child: mk("#e8fff4", 0.55),
      };
      S.add(g);
    }

    /* ---- the Loong ------------------------------------------------------------- */
    {
      const ctrl = [];
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU;
        const R = 47 + 15 * Math.sin(k * 1.9 + 1.3);
        ctrl.push(new T3.Vector3(
          Math.sin(a) * R,
          35 + 10 * Math.sin(k * 2.45 + 0.5),
          -Math.cos(a) * R));
      }
      const curve = new T3.CatmullRomCurve3(ctrl, true, "centripetal", 0.7);
      const mkRibbon = (r, phase, opMul) => {
        const geo = new T3.TubeGeometry(curve, Q.tube, r, 7, true);
        const mat = new T3.ShaderMaterial({
          transparent: true, blending: T3.AdditiveBlending, depthWrite: false,
          side: T3.DoubleSide, fog: false,
          uniforms: { uTime: { value: 0 }, uPhase: { value: phase }, uOp: { value: opMul } },
          vertexShader: `
            varying float vU;
            void main(){ vU = uv.x;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `
            uniform float uTime, uPhase, uOp;
            varying float vU;
            void main(){
              float flow = pow(0.5 + 0.5*sin((vU*3.0 - uTime*0.055 + uPhase)*6.28318), 2.4);
              vec3 jade = vec3(0.42,0.72,0.55), gold = vec3(1.0,0.78,0.36);
              vec3 c = mix(jade, gold, 0.5 + 0.5*sin(vU*18.8 + uTime*0.25));
              float a = uOp * (0.09 + 0.42*flow);
              gl_FragColor = vec4(c*a, a);
            }`,
        });
        return new T3.Mesh(geo, mat);
      };
      const g = new T3.Group();
      const r1 = mkRibbon(0.52, 0.0, 1.0);
      const r2 = mkRibbon(0.34, 0.37, 0.8);
      r2.position.y = 1.1;
      g.add(r1); g.add(r2);
      S.add(g);
      env.loong = { group: g, mats: [r1.material, r2.material] };
    }

    /* ---- the oculus — the way home ------------------------------------------ */
    {
      const g = new T3.Group();
      g.position.set(0, 0, 8.5);
      const rim = new T3.Mesh(
        new T3.TorusGeometry(2.0, 0.085, 10, 72),
        new T3.MeshStandardMaterial({ color: 0xb8893a, roughness: 0.35, metalness: 1.0,
          emissive: 0xb8893a, emissiveIntensity: 0.35 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.04;
      g.add(rim);
      const glowU = { uTime: { value: 0 } };
      const glow = new T3.Mesh(
        new T3.RingGeometry(0.02, 1.92, 64, 4),
        new T3.ShaderMaterial({
          transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false,
          uniforms: glowU,
          vertexShader: `
            varying vec2 vP;
            void main(){ vP = position.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `
            uniform float uTime; varying vec2 vP;
            void main(){
              float r = length(vP) / 1.92;
              float breathe = 0.82 + 0.18*sin(uTime*0.5);
              float a = smoothstep(1.0, 0.15, r) * 0.5 * breathe;
              vec3 c = mix(vec3(1.0,0.87,0.60), vec3(1.0,0.65,0.32), r);
              gl_FragColor = vec4(c*a, a);
            }`,
        })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.03;
      g.add(glow);
      // the breath of the Hall rising
      const cone = new T3.Mesh(
        new T3.CylinderGeometry(0.9, 1.85, 7, 24, 1, true),
        new T3.ShaderMaterial({
          transparent: true, blending: T3.AdditiveBlending, depthWrite: false,
          side: T3.DoubleSide, fog: false, uniforms: glowU,
          vertexShader: `
            varying vec2 vUv;
            void main(){ vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `
            uniform float uTime; varying vec2 vUv;
            void main(){
              float v = smoothstep(0.0,0.25,vUv.y) * smoothstep(1.0,0.45,vUv.y);
              float flicker = 0.9 + 0.1*sin(uTime*0.21 + vUv.x*17.0);
              float a = v * 0.030 * flicker;
              gl_FragColor = vec4(1.0,0.87,0.62,1.0)*a;
            }`,
        })
      );
      cone.position.y = 3.5;
      g.add(cone);
      S.add(g);
      env.oculus = { group: g, glowU, rim, glow };
      env.pickables.push(rim, glow);
    }

    /* ---- the rite shaft (the passage up, seen only during arrival) ---------- */
    {
      const shaft = new T3.Mesh(
        new T3.CylinderGeometry(3.4, 3.4, 40, 28, 1, true),
        new T3.MeshBasicMaterial({ color: 0x04050a, side: T3.BackSide,
          transparent: true, opacity: 1, fog: false })
      );
      shaft.position.set(0, -20, 8.5);
      shaft.visible = false;
      S.add(shaft);
      env.shaft = shaft;
    }
  }

  /* a soft radial glow texture: white core -> tinted halo -> nothing */
  function glowTexture(inner, outer) {
    const s = 128, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0.0, inner);
    gr.addColorStop(0.25, outer);
    gr.addColorStop(1.0, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    const t = new T3.CanvasTexture(cv);
    t.encoding = T3.sRGBEncoding;
    return t;
  }
  C.glowTexture = glowTexture;

  function seedSpark(pos, i, scatter) {
    pos[i * 3] = (Math.random() - 0.5) * 0.8;
    pos[i * 3 + 1] = scatter ? Math.random() * 3 : 0.35;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }

  /* ---- per-frame -------------------------------------------------------- */
  function envUpdate(dt, t) {
    const env = C.env;
    env.dim += (env.dimGoal - env.dim) * (1 - Math.pow(0.001, dt));

    // hearth
    const fl = 0.72 + 0.28 * (Math.sin(t * 7.3) * 0.4 + Math.sin(t * 3.1 + 1.7) * 0.6) * 0.5 + 0.36;
    env.hearthLight.intensity = 1.7 + fl * 0.8;
    env.floorU.uEmber.value = fl;
    env.floorU.uTime.value = t;
    env.hearth.embers.forEach((sp, i) => {
      const w = 0.8 + 0.25 * Math.sin(t * (5.1 + i * 1.7) + i * 2.1);
      sp.material.opacity = 0.55 * w;
      sp.scale.setScalar((1.1 + i * 0.45) * (0.9 + 0.2 * w));
    });
    const hp = env.hearth;
    for (let i = 0; i < hp.n; i++) {
      hp.life[i] += dt * (0.22 + (i % 5) * 0.05);
      if (hp.life[i] > 1) { hp.life[i] = 0; seedSpark(hp.pos, i, false); }
      hp.pos[i * 3 + 1] = 0.35 + hp.life[i] * 4.2;
      hp.pos[i * 3] += Math.sin(t * 2 + i) * dt * 0.12;
    }
    hp.sparks.geometry.attributes.position.needsUpdate = true;
    hp.sparks.material.opacity = 0.5;

    // trinity — the dance of existence, a crown high over the heart
    const tr = env.trinity, R = 1.7, w = t * 0.21;
    tr.solar.position.set(Math.cos(w) * R, 8.6 + Math.sin(t * 0.33) * 0.2, Math.sin(w) * R);
    tr.lunar.position.set(Math.cos(w + Math.PI) * R, 8.6 - Math.sin(t * 0.33) * 0.2, Math.sin(w + Math.PI) * R);
    tr.child.position.set(Math.sin(w * 1.7) * 0.5, 9.3 + Math.cos(w * 1.3) * 0.35, Math.cos(w * 2.3) * 0.5);
    tr.child.material.color.setHSL((t * 0.03) % 1, 0.45, 0.8);

    // the loong turns, unbound
    env.loong.group.rotation.y = t * 0.012;
    env.loong.mats.forEach(m => { m.uniforms.uTime.value = t; });

    // oculus breath
    env.oculus.glowU.uTime.value = t;
    env.oculusLight.intensity = 0.9 + 0.25 * Math.sin(t * 0.5);

    // nebulae adrift
    env.nebulae.forEach((sp, i) => { sp.material.rotation += dt * 0.004 * (i % 2 ? -1 : 1); });
    env.stars.rotation.y = t * 0.0018;
  }
})(typeof window !== "undefined" ? window : globalThis);
