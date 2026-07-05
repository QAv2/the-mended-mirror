/* ============================================================================
   THE HALL OF AGES — scene, camera, atmosphere.
   The void the mirror shattered into: no walls, a starfield of dust, one great
   shaft of light falling on the instrument. Custom orbit rig (damped, clamped,
   tweenable) — museum-docent navigation: you cannot get lost.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  const COL = HALL.COL = {
    obsidian: 0x0b0d12, obsidian2: 0x06070b,
    gold: 0xf0c45a, goldBright: 0xffe49a, goldDeep: 0xb8893a,
    silver: 0xcdd2dc, silverDim: 0x828b9c,
    parchment: 0xe9dcc0, fools: 0x6f7c4c,
  };

  /* ---------- the quality tier: ONE knob, like the flight's K ----------
     Chosen once from what the device declares (texture ceiling, memory,
     touch), overridable with ?tier=0|1|2 for testing. Everything that costs
     — canvas resolutions, segment counts, dust, pixelRatio, whether GLBs are
     fetched at all — reads these factors. Tier 2 is EXACTLY the hall as it
     shipped; lower tiers only take away. */
  HALL.quality = function (renderer) {
    const maxTex = renderer.capabilities.maxTextureSize;
    const mem = navigator.deviceMemory || 4;
    const coarse = matchMedia("(pointer:coarse)").matches;
    let tier = 2;
    if (coarse || mem <= 4 || maxTex < 8192) tier = 1;
    if (maxTex < 4096 || mem <= 2) tier = 0;
    const o = new URLSearchParams(location.search).get("tier");
    if (o !== null && o !== "") tier = Math.max(0, Math.min(2, +o || 0));
    const Q = [
      { tier: 0, tex: 0.25, segs: 0.5,  dust: 220, stars: 500,  px: 1.25, glb: false, aniso: 2, bumps: false, fullLights: false },
      { tier: 1, tex: 0.5,  segs: 0.75, dust: 450, stars: 800,  px: 1.5,  glb: true,  aniso: 4, bumps: true,  fullLights: true },
      { tier: 2, tex: 1,    segs: 1,    dust: 900, stars: 1400, px: 2,    glb: true,  aniso: 8, bumps: true,  fullLights: true },
    ][tier];
    Q.maxTex = maxTex;
    return Q;
  };
  /* tier-scaled helpers — safe before buildScene (fall back to full) */
  const q = () => HALL.Q || { tex: 1, segs: 1, aniso: 8 };
  HALL.texSize = (base, floor) => Math.max(floor || 256, Math.round(base * q().tex));
  HALL.segN = (base, floor) => Math.max(floor || 8, Math.round(base * q().segs));

  /* ---------- procedural stone / sealed-concrete surfaces ----------
     Canvas-built (self-contained, zero asset weight): cloudy mottling from
     blurred value-noise octaves + aggregate speckle, paired with matching bump
     and roughness maps so a point light plays across the surface like a real
     sealed floor — not a flat-shaded plane. Returns THREE textures set to
     RepeatWrapping; the caller sets .repeat for the surface's scale. */
  HALL.surface = function (opts) {
    opts = opts || {};
    const S = HALL.texSize(opts.size || 1024, 256);
    const base = opts.base || "#63666b";
    const dark = opts.dark || "#484b50";
    const lite = opts.lite || "#7d8086";
    const grain = opts.grain === undefined ? 1 : opts.grain;   // aggregate speckle density

    function pad(fill) {
      const c = document.createElement("canvas"); c.width = c.height = S;
      const g = c.getContext("2d"); g.fillStyle = fill; g.fillRect(0, 0, S, S);
      return { c, g };
    }
    // layered blurred value-noise — cheap organic mottling, no per-pixel loop
    function octaves(g, lo, hi) {
      [[5, 30], [11, 15], [23, 7], [47, 3]].forEach(([cells, blur], oi) => {
        g.save(); g.filter = "blur(" + blur + "px)";
        const cell = S / cells, amp = [0.55, 0.4, 0.3, 0.22][oi];
        for (let y = -1; y <= cells; y++) for (let x = -1; x <= cells; x++) {
          const v = Math.random();
          g.globalAlpha = amp * Math.abs(v - 0.5);
          g.fillStyle = v < 0.5 ? lo : hi;
          g.fillRect(x * cell, y * cell, cell * 1.5, cell * 1.5);
        }
        g.restore();
      });
      g.globalAlpha = 1;
    }
    function speckle(g, n, a, b) {
      for (let i = 0; i < n; i++) {
        const x = Math.random() * S, y = Math.random() * S, r = Math.random() * 1.5 + 0.3;
        g.fillStyle = Math.random() < 0.5 ? a : b;
        g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      }
    }

    const mk = (c, srgb) => {
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = q().aniso || 8;
      if (srgb) t.encoding = THREE.sRGBEncoding;
      return t;
    };
    const A = pad(base); octaves(A.g, dark, lite);
    if (grain) speckle(A.g, (S * S / 320) * grain,
      "rgba(24,26,30,0.20)", "rgba(206,210,218,0.13)");
    /* tier 0 runs on the color map alone — the bump/roughness pair costs a
       heavier shader permutation than a weak GPU (or SwiftShader) can carry */
    if (HALL.Q && !HALL.Q.bumps) return { map: mk(A.c, true), bumpMap: null, roughnessMap: null };
    const B = pad("#7c7c7c"); octaves(B.g, "#5a5a5a", "#9a9a9a");
    if (grain) speckle(B.g, (S * S / 300) * grain, "rgba(18,18,18,0.5)", "rgba(240,240,240,0.42)");
    const R = pad("#9a9a9a"); octaves(R.g, "#6f6f6f", "#c6c6c6");
    return { map: mk(A.c, true), bumpMap: mk(B.c, false), roughnessMap: mk(R.c, false) };
  };

  HALL.buildScene = function (H) {
    const app = document.getElementById("app");

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(innerWidth, innerHeight);
    // the ONE quality knob — everything that costs reads HALL.Q from here on
    HALL.Q = HALL.quality(renderer);
    DIAG.mark("quality tier " + HALL.Q.tier + " — tex×" + HALL.Q.tex + " segs×" + HALL.Q.segs +
              " dust " + HALL.Q.dust + " px≤" + HALL.Q.px + (HALL.Q.glb ? "" : " (GLBs skipped)"));
    renderer.setPixelRatio(Math.min(devicePixelRatio, HALL.Q.px));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    app.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.obsidian2);
    scene.fog = new THREE.FogExp2(COL.obsidian2, 0.0052);

    const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 700);
    camera.position.set(0, 3.4, 58);

    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    /* ---------- light: restraint. one great shaft + cold whisper ---------- */
    scene.add(new THREE.AmbientLight(0x28324a, 0.20));
    const hemi = new THREE.HemisphereLight(0x2c3550, 0x05060a, 0.20);
    scene.add(hemi);

    // the shaft — warm gold, falling through the oculus onto the plinth/mirror
    const shaft = new THREE.SpotLight(0xffe9bf, 1.55, 260, 0.30, 0.55, 1.05);
    shaft.position.set(5, 95, 4);
    shaft.target.position.set(0, 0, 0);
    scene.add(shaft, shaft.target);

    // a cool distant fill so silhouettes never go fully dead
    const fill = new THREE.DirectionalLight(0x39435e, 0.5);
    fill.position.set(-60, 40, -80);
    scene.add(fill);

    // a dim warmth for the plinth at the room's center
    const thresholdGlow = new THREE.PointLight(0xffd98a, 1.05, 13, 2.0);
    thresholdGlow.position.set(0, 3.1, 1.6);
    scene.add(thresholdGlow);

    /* ---------- the dust (motes drifting in the shaft) ---------- */
    const dust = (function () {
      const N = HALL.Q.dust, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const r = 4 + Math.pow(Math.random(), 0.6) * 24;   // motes stay inside the room
        const a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = 0.5 + Math.random() * 26;
        pos[i * 3 + 2] = Math.sin(a) * r;
        seed[i] = Math.random() * 100;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
        vertexShader: `
          attribute float aSeed; uniform float uTime; uniform float uPx;
          varying float vA;
          void main(){
            vec3 p = position;
            p.x += sin(uTime*0.05 + aSeed)*1.4;
            p.y += sin(uTime*0.035 + aSeed*1.7)*0.9;
            p.z += cos(uTime*0.045 + aSeed*0.6)*1.4;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uPx * (26.0 / max(6.0, -mv.z));
            vA = 0.5 + 0.5*sin(uTime*0.3 + aSeed*3.1);
          }`,
        fragmentShader: `
          varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.05, d) * 0.075 * (0.4 + 0.6*vA);
            gl_FragColor = vec4(0.95, 0.83, 0.55, 1.0) * a;
          }`,
      });
      const pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return { mat: m };
    })();

    /* ---------- far stars (the void is not empty, only patient) ---------- */
    (function () {
      const N = HALL.Q.stars, pos = new Float32Array(N * 3), cl = new Float32Array(N * 3);
      const c1 = new THREE.Color(0x9aa6c4), c2 = new THREE.Color(0xd8c9a0);
      for (let i = 0; i < N; i++) {
        // sphere shell far out
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u), R = 380 + Math.random() * 160;
        pos[i * 3] = s * Math.cos(a) * R;
        pos[i * 3 + 1] = Math.abs(u) * R * (Math.random() < 0.85 ? 1 : -0.35); // mostly above
        pos[i * 3 + 2] = s * Math.sin(a) * R;
        const c = Math.random() < 0.72 ? c1 : c2;
        const b = 0.25 + Math.random() * 0.75;
        cl[i * 3] = c.r * b; cl[i * 3 + 1] = c.g * b; cl[i * 3 + 2] = c.b * b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(cl, 3));
      const m = new THREE.PointsMaterial({
        size: 1.6, sizeAttenuation: false, vertexColors: true,
        transparent: true, opacity: 0.75, depthWrite: false, fog: false,
      });
      const pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      scene.add(pts);
      H.starsMat = m;           // daylight puts the stars away; night returns them
    })();

    /* ---------- the visible shaft (a vast, faint god-ray cone) ---------- */
    (function () {
      const geo = new THREE.CylinderGeometry(3.2, 34, 118, 48, 1, true);
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide, fog: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          varying vec2 vUv; varying vec3 vW;
          void main(){ vUv = uv; vW = (modelMatrix*vec4(position,1.0)).xyz;
            gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          varying vec2 vUv; varying vec3 vW; uniform float uTime;
          void main(){
            float v = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            float flicker = 0.9 + 0.1*sin(uTime*0.21 + vUv.x*17.0);
            float a = v * 0.028 * flicker;
            gl_FragColor = vec4(1.0, 0.87, 0.62, 1.0) * a;
          }`,
      });
      const cone = new THREE.Mesh(geo, mat);
      cone.name = "shaftcone";
      cone.scale.set(0.32, 0.36, 0.32);       // sized to fall through the oculus
      cone.position.set(1.2, 21.5, 0.9);
      cone.rotation.z = 0.05; cone.rotation.x = -0.03;
      scene.add(cone);
      H.shaftMat = mat;
    })();

    /* ---------- tween engine ---------- */
    const tweens = [];
    function tween(dur, fn, ease, done) {
      const tw = { t: 0, dur, fn, ease: ease || easeInOut, done };
      tweens.push(tw);
      return tw;
    }
    function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
    function stepTweens(dt) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        tw.t += dt;
        const k = Math.min(1, tw.t / tw.dur);
        tw.fn(tw.ease(k));
        if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
      }
    }

    /* ---------- orbit rig ---------- */
    const rig = {
      target: new THREE.Vector3(0, 1.2, 0),
      sph: new THREE.Spherical(9, 1.25, 0.0),      // radius, phi(from +Y), theta
      dTarget: new THREE.Vector3(0, 1.2, 0),       // damped goals
      dSph: new THREE.Spherical(9, 1.25, 0.0),
      min: 2.5, max: 120, minPhi: 0.14, maxPhi: 1.52,
      locked: false,                                // during flights
      panMode: "orbit",                             // station-specific behavior
      panClamp: null,                               // {x0,x1,y0,y1,z} for the wall
      pano: null,                                   // {eye} — stand inside a room and look
      update(dt) {
        const k = 1 - Math.pow(0.0001, dt);         // damping toward goals
        this.sph.radius += (this.dSph.radius - this.sph.radius) * k;
        this.sph.phi += (this.dSph.phi - this.sph.phi) * k;
        this.sph.theta += (this.dSph.theta - this.sph.theta) * k;
        if (this.pano) {
          // first-person: the camera stands at the eye and the sphericals are gaze
          camera.position.copy(this.pano.eye);
          const dir = new THREE.Vector3().setFromSpherical(
            new THREE.Spherical(1, this.sph.phi, this.sph.theta));
          camera.lookAt(this.pano.eye.clone().add(dir));
          return;
        }
        this.target.lerp(this.dTarget, k);
        const off = new THREE.Vector3().setFromSpherical(this.sph);
        camera.position.copy(this.target).add(off);
        camera.lookAt(this.target);
      },
      clampGoals() {
        this.dSph.radius = Math.max(this.min, Math.min(this.max, this.dSph.radius));
        this.dSph.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.dSph.phi));
        if (this.panClamp) {
          this.dTarget.x = Math.max(this.panClamp.x0, Math.min(this.panClamp.x1, this.dTarget.x));
          this.dTarget.y = Math.max(this.panClamp.y0, Math.min(this.panClamp.y1, this.dTarget.y));
        }
      },
      /* flight: tween target+spherical to a named pose */
      flyTo(pose, dur, done) {
        this.locked = true;
        const t0 = this.dTarget.clone(), s0 = new THREE.Spherical().copy(this.dSph);
        // unwrap theta so we take the short way round
        let dTheta = pose.theta - s0.theta;
        dTheta = ((dTheta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        tween(dur || 2.4, k => {
          this.dTarget.lerpVectors(t0, pose.target, k);
          this.dSph.radius = s0.radius + (pose.radius - s0.radius) * k;
          this.dSph.phi = s0.phi + (pose.phi - s0.phi) * k;
          this.dSph.theta = s0.theta + dTheta * k;
          this.target.copy(this.dTarget);
          this.sph.copy(this.dSph);
        }, null, () => { this.locked = false; if (done) done(); });
      },
    };

    /* ---------- pointer input ---------- */
    const el = renderer.domElement;
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, down: false, button: 0, moved: 0, dragging: null };
    el.addEventListener("contextmenu", e => e.preventDefault());
    el.addEventListener("pointerdown", e => {
      pointer.down = true; pointer.button = e.button; pointer.moved = 0;
      pointer.x = e.clientX; pointer.y = e.clientY;
      el.setPointerCapture(e.pointerId);
      if (H.onPointerDown) H.onPointerDown(e);
    });
    el.addEventListener("pointermove", e => {
      const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
      pointer.nx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ny = -(e.clientY / innerHeight) * 2 + 1;
      if (pointer.down && !rig.locked) {
        pointer.moved += Math.abs(dx) + Math.abs(dy);
        if (pointer.dragging && H.onDrag) {
          H.onDrag(e);
        } else if (rig.pano) {
          // grab the room: drag right, the wall slides right
          if (H.rotunda && H.rotunda.gyro.active) {
            H.rotunda.gyro.yawOffset += dx * 0.0026;
          } else {
            rig.dSph.theta += dx * 0.0026;
            rig.dSph.phi -= dy * 0.0024;
            rig.clampGoals();
          }
        } else if (pointer.button === 2 || e.shiftKey || rig.panMode === "pan") {
          // pan in the view plane
          const scale = rig.sph.radius * 0.0011;
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
          const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
          rig.dTarget.addScaledVector(right, -dx * scale);
          rig.dTarget.addScaledVector(up, dy * scale);
          rig.clampGoals();
        } else {
          rig.dSph.theta -= dx * 0.0042;
          rig.dSph.phi -= dy * 0.0036;
          rig.clampGoals();
        }
      }
      pointer.x = e.clientX; pointer.y = e.clientY;
      if (H.onPointerMove) H.onPointerMove(e);
    });
    el.addEventListener("pointerup", e => {
      pointer.down = false;
      const was = pointer.dragging; pointer.dragging = null;
      if (H.onPointerUp) H.onPointerUp(e, pointer.moved < 7 && !was);
    });
    el.addEventListener("wheel", e => {
      e.preventDefault();
      if (rig.locked) { if (H.onWheelLocked) H.onWheelLocked(); return; }
      const f = Math.pow(1.0011, e.deltaY);
      rig.dSph.radius *= f;
      rig.clampGoals();
    }, { passive: false });

    // touch pinch
    let pinchD = 0;
    el.addEventListener("touchstart", e => { if (e.touches.length === 2) pinchD = touchDist(e); }, { passive: true });
    el.addEventListener("touchmove", e => {
      if (e.touches.length === 2 && pinchD) {
        const d = touchDist(e);
        rig.dSph.radius *= pinchD / d;
        pinchD = d; rig.clampGoals();
      }
    }, { passive: true });
    function touchDist(e) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.hypot(dx, dy) || 1;
    }

    /* ---------- the environment: one dial from the daylit world to the void ----------
       k = 0 is golden hour outside; k = 1 is EXACTLY the interior as it ships today
       (obsidian fog and background, the shaft at full). Untouched unless the
       exterior exists, so the interior contract cannot drift. */
    const ENV = {
      day: { fog: 0.00045, fogCol: new THREE.Color(0xc9b493), bg: new THREE.Color(0x87a2b8) },
      night: { fog: 0.0052, fogCol: new THREE.Color(COL.obsidian2), bg: new THREE.Color(COL.obsidian2) },
    };
    const env = {
      k: 1,
      toInterior(k) {
        env.k = k;
        scene.fog.density = ENV.day.fog + (ENV.night.fog - ENV.day.fog) * k;
        if (k >= 1) {          // land EXACTLY on the void — the porthole trick
          scene.fog.color.copy(ENV.night.fogCol);       // needs sky == obsidian2,
          scene.background.copy(ENV.night.bg);          // and lerp(…,1) drifts a ulp
        } else if (k <= 0) {
          scene.fog.color.copy(ENV.day.fogCol);
          scene.background.copy(ENV.day.bg);
        } else {
          scene.fog.color.copy(ENV.day.fogCol).lerp(ENV.night.fogCol, k);
          scene.background.copy(ENV.day.bg).lerp(ENV.night.bg, k);
        }
        shaft.intensity = 1.55 * k;
        if (H.starsMat) H.starsMat.opacity = 0.75 * k;
        if (H.exterior) H.exterior.setNight(k);
      },
      setDay() { env.toInterior(0); },
    };

    /* ---------- expose ---------- */
    H.renderer = renderer; H.scene = scene; H.camera = camera;
    H.rig = rig; H.pointer = pointer;
    H.tween = tween; H.easeOut = easeOut; H.easeInOut = easeInOut;
    H.stepTweens = stepTweens;
    H.lights = { shaft, hemi, thresholdGlow };
    H.env = env;
    H.dustMat = dust.mat;
  };
})(typeof window !== "undefined" ? window : globalThis);
