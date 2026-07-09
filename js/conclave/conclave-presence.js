/* ============================================================================
   THE CONCLAVE OF BECOMING — the presence.
   ----------------------------------------------------------------------------
   "then here he stands in front of me, with the aesthetic of his worldview
    as the periphery, but whisps of gold that lead out of frame.. to the
    things he connects to.."

   Click a light on the presented petal and it LIFTS — comes to stand before
   you as a summoned presence: the Mirror's node light grown large (the
   placeholder body, by design), with slow-orbiting motes and a corona.

   GOLD WISPS arc from the presence toward the ACTUAL SEATS of its kin across
   the coliseum — one per seam, colored by tier honesty (the Hall's golds:
   cognate bright, speculative ash). Click a wisp and you travel: the kin's
   petal makes its entrance, the kin stands forth. The graph becomes a walk
   among family.

   THE MOUNT CONTRACT (for the embodiment sessions to come):
     C.presence.mountHook is a THREE.Group kept at the presence anchor,
     facing the visitor, 1 unit ≈ one standing height. A future session
     (Opus + the FotW pipeline: Meshy/fal → GLB, decimated, vendored) loads
     a character body via THREE.GLTFLoader (already vendored) and adds it to
     this group; set C.presence.embodied = true and the placeholder core
     dims itself. Expected states: idle / speak — drive them from
     C.voice's onSpeak hooks. Nothing else in the space needs to change.
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};
  const T3 = root.THREE;
  const TAU = Math.PI * 2;

  const WISP_CAP = 7;

  C.buildPresence = function () {
    const S = C.scene, M = C.M, F = C.D.figures;
    const P = C.presence = {
      current: null, embodied: false,
      summon, release, update, hoverWisp,
      anchor: new T3.Vector3(), below: new T3.Vector3(),
      mountHook: null, wisps: [],
    };

    const grp = new T3.Group();
    grp.visible = false;
    S.add(grp);
    P.group = grp;

    /* the placeholder body: the node light grown large */
    const coreTex = {};
    function coreFor(hex) {
      if (!coreTex[hex]) coreTex[hex] = C.glowTexture("#fff6e4", hex);
      return coreTex[hex];
    }
    const core = new T3.Sprite(new T3.SpriteMaterial({
      transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false }));
    grp.add(core);

    const corona = new T3.Sprite(new T3.SpriteMaterial({
      map: ringTexture(), transparent: true, blending: T3.AdditiveBlending,
      depthWrite: false, fog: false, opacity: 0.5 }));
    corona.scale.set(3.1, 3.1, 1);
    grp.add(corona);

    const glowLight = new T3.PointLight(0xffffff, 0.0, 12, 2);
    grp.add(glowLight);

    /* motes on two slow shells */
    const NM = C.Q.motes;
    const mpos = new Float32Array(NM * 3), mseed = [];
    for (let i = 0; i < NM; i++) mseed.push({
      r: 0.85 + (i % 2) * 0.5 + Math.random() * 0.15,
      a: Math.random() * TAU, b: Math.random() * TAU,
      va: 0.25 + Math.random() * 0.3, vb: 0.17 + Math.random() * 0.25,
    });
    const mgeo = new T3.BufferGeometry();
    mgeo.setAttribute("position", new T3.BufferAttribute(mpos, 3));
    const motes = new T3.Points(mgeo, new T3.PointsMaterial({
      color: 0xffffff, size: 2.6, sizeAttenuation: false, transparent: true,
      opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false, fog: false }));
    motes.frustumCulled = false;
    grp.add(motes);

    /* the mount for the body to come */
    const mount = new T3.Group();
    mount.name = "conclave-presence-mount";
    grp.add(mount);
    P.mountHook = mount;

    const wispGroup = new T3.Group();
    S.add(wispGroup);

    const ray = new T3.Raycaster();
    const ndc = new T3.Vector2();

    let anim = null, wispsLive = [];

    /* ------------------------------------------------------------------ */
    function summon(fi, instant) {
      return new Promise(res => {
        const f = F[fi];
        const seat = M.seatByTid[f.tradition];
        const lift0 = new T3.Vector3();
        C.lotus.figWorld(fi, lift0);

        // the presence stands between you and its petal, a step to your left
        const eye = C.rig.eye.clone();
        const fwd = C.rig.flat(), up = new T3.Vector3(0, 1, 0);
        P.anchor.copy(eye).add(fwd.clone().multiplyScalar(5.6))
          .add(up.clone().multiplyScalar(0.55))
          .add(C.rig.right().multiplyScalar(-1.25));
        P.below.copy(P.anchor).add(up.clone().multiplyScalar(-1.35));
        if (C.lotus.inscription) C.lotus.inscription.visible = false;

        P.current = { fi, tid: f.tradition, color: seat.color };
        const hex = seat.color;
        core.material.map = coreFor(hex);
        core.material.opacity = 1;
        const cLin = new T3.Color(hex);
        corona.material.color.set(cLin);
        motes.material.color.set(cLin).lerp(new T3.Color(1, 1, 1), 0.35);
        glowLight.color.set(cLin).lerp(new T3.Color(1, 0.9, 0.75), 0.5);

        // hide the petal copy of this light (born pushed past all clocks)
        const k = C.lotus.presentedFigs.indexOf(fi);
        if (k >= 0) {
          C.lotus.pBuf.born[k] = 1e9;
          C.lotus.pLights.geometry.attributes.aBorn.needsUpdate = true;
          P.current.pk = k;
        }
        C.lotus.setDim(fi, 0.9);

        grp.visible = true;
        C.audio.swell(seat.n, M.N);

        if (instant) {
          grp.position.copy(P.anchor);
          core.scale.set(2.0, 2.0, 1);
          glowLight.intensity = 0.9;
          buildWisps(fi);
          res(); return;
        }
        anim = {
          t0: performance.now() / 1000,
          tick(tt) {
            const T = Math.min(1, tt / 1.15);
            const q = C.ease(T);
            grp.position.lerpVectors(lift0, P.anchor, q);
            const s = 0.5 + q * 1.5;
            core.scale.set(s, s, 1);
            glowLight.intensity = q * 0.9;
            if (T >= 1) {
              anim = null;
              buildWisps(fi);
              res();
            }
          },
        };
      });
    }

    function release(instant) {
      return new Promise(res => {
        const cur = P.current;
        if (!cur) { res(); return; }
        clearWisps();
        C.audio.releaseSwell();
        const back = new T3.Vector3();
        C.lotus.figWorld(cur.fi, back);
        const from = grp.position.clone(), fromS = core.scale.x;
        const done = () => {
          grp.visible = false;
          // rekindle the petal copy
          if (cur.pk !== undefined && C.lotus.presentedFigs[cur.pk] === cur.fi) {
            C.lotus.pBuf.born[cur.pk] = performance.now() / 1000;
            C.lotus.pLights.geometry.attributes.aBorn.needsUpdate = true;
          }
          C.lotus.setDim(cur.fi, 0);
          if (C.lotus.inscription) C.lotus.inscription.visible = true;
          P.current = null;
          res();
        };
        if (instant) { done(); return; }
        anim = {
          t0: performance.now() / 1000,
          tick(tt) {
            const T = Math.min(1, tt / 0.8);
            const q = C.ease(T);
            grp.position.lerpVectors(from, back, q);
            const s = fromS * (1 - q * 0.8);
            core.scale.set(s, s, 1);
            glowLight.intensity = (1 - q) * 0.9;
            if (T >= 1) { anim = null; done(); }
          },
        };
      });
    }

    /* ---- the golden threads -------------------------------------------- */
    function buildWisps(fi) {
      clearWisps();
      const kin = (M.edgesByFig[F[fi].id] || []).slice()
        .sort((a, b) => (tierRank(a.tier) - tierRank(b.tier)))
        .slice(0, WISP_CAP);
      const up = new T3.Vector3(0, 1, 0);
      kin.forEach((e, i) => {
        const kfi = M.figIndexById[e.other];
        if (kfi === undefined) return;
        const target = new T3.Vector3();
        C.lotus.figWorld(kfi, target);
        const a = P.anchor.clone();
        const d = a.distanceTo(target);
        const side = (i % 2 ? 1 : -1) * (0.8 + (i % 3) * 0.5);
        const c1 = a.clone().add(up.clone().multiplyScalar(1.15 + i * 0.25))
          .add(C.rig.right().multiplyScalar(side));
        const c2 = a.clone().lerp(target, 0.55).add(up.clone().multiplyScalar(2.5 + d * 0.05));
        const curve = new T3.CubicBezierCurve3(a, c1, c2, target);
        const gold = C.COL.tierGold[e.tier] || C.COL.tierGold["4"];
        const geo = new T3.TubeGeometry(curve, 30, 0.030, 5, false);
        const mat = new T3.ShaderMaterial({
          transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false,
          uniforms: {
            uTime: { value: 0 }, uCol: { value: new T3.Color(gold) },
            uBorn: { value: performance.now() / 1000 + i * 0.12 }, uHot: { value: 0 },
          },
          vertexShader: `
            varying float vU;
            void main(){ vU = uv.x;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            uniform float uTime, uBorn, uHot; uniform vec3 uCol;
            varying float vU;
            void main(){
              float born = smoothstep(uBorn, uBorn + 0.9, uTime);
              float flow = pow(fract(vU * 2.0 - (uTime - uBorn) * 0.30), 3.0);
              float ends = smoothstep(0.0, 0.06, vU) * smoothstep(1.0, 0.93, vU);
              float a = born * ends * (0.10 + 0.55 * flow + uHot * 0.35);
              gl_FragColor = vec4(uCol * (0.8 + uHot * 0.6), a);
            }`,
        });
        const mesh = new T3.Mesh(geo, mat);
        mesh.__wisp = { fi: kfi, tier: e.tier, type: e.type,
          name: F[kfi].name, tid: F[kfi].tradition };
        wispGroup.add(mesh);
        wispsLive.push(mesh);

        // a glint where the thread lands
        const glint = new T3.Sprite(new T3.SpriteMaterial({
          map: coreFor(gold), transparent: true, blending: T3.AdditiveBlending,
          depthWrite: false, fog: false, opacity: 0.9 }));
        glint.scale.set(0.9, 0.9, 1);
        glint.position.copy(target);
        wispGroup.add(glint);
        wispsLive.push(glint);
      });
      P.wisps = wispsLive.filter(w => w.__wisp);
    }

    function clearWisps() {
      wispsLive.forEach(w => {
        wispGroup.remove(w);
        if (w.geometry) w.geometry.dispose();
        if (w.material && w.material.dispose) w.material.dispose();
      });
      wispsLive = [];
      P.wisps = [];
    }

    function tierRank(t) { return t === "forgery" ? 9 : (+t || 5); }

    function hoverWisp(x, y) {
      if (!P.wisps.length) return null;
      ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, C.camera);
      ray.params.Line = { threshold: 0.3 };
      const hits = ray.intersectObjects(P.wisps, false);
      P.wisps.forEach(w => { w.material.uniforms.uHot.value = 0; });
      if (hits.length) {
        const w = hits[0].object;
        w.material.uniforms.uHot.value = 1;
        return w.__wisp;
      }
      return null;
    }

    /* ---- per frame ------------------------------------------------------ */
    function update(dt, t) {
      if (anim) anim.tick(performance.now() / 1000 - anim.t0);
      if (!P.current || !grp.visible) return;
      // breathe
      const b = 1 + Math.sin(t * 1.1) * 0.05;
      if (!anim) core.scale.set(2.0 * b, 2.0 * b, 1);
      core.material.opacity = P.embodied ? 0.25 : 1;
      corona.material.rotation = t * 0.10;
      corona.scale.setScalar(3.1 * (1 + Math.sin(t * 0.7) * 0.06));
      for (let i = 0; i < NM; i++) {
        const m = mseed[i];
        m.a += dt * m.va; m.b += dt * m.vb;
        mpos[i * 3] = Math.cos(m.a) * m.r;
        mpos[i * 3 + 1] = Math.sin(m.b) * m.r * 0.75;
        mpos[i * 3 + 2] = Math.sin(m.a) * Math.cos(m.b) * m.r;
      }
      mgeo.attributes.position.needsUpdate = true;
      wispsLive.forEach(w => {
        if (w.material.uniforms) w.material.uniforms.uTime.value = t;
      });
      // when a voice speaks, the light leans into it
      if (C.voice && C.voice.speaking)
        glowLight.intensity = 0.9 + Math.sin(t * 9.0) * 0.25;
    }

    function ringTexture() {
      const s = 128, cv = document.createElement("canvas");
      cv.width = cv.height = s;
      const g = cv.getContext("2d");
      const gr = g.createRadialGradient(s / 2, s / 2, s * 0.28, s / 2, s / 2, s / 2);
      gr.addColorStop(0.0, "rgba(255,246,228,0)");
      gr.addColorStop(0.55, "rgba(255,236,200,0.55)");
      gr.addColorStop(0.75, "rgba(255,220,160,0.12)");
      gr.addColorStop(1.0, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, s, s);
      const t = new T3.CanvasTexture(cv);
      t.encoding = T3.sRGBEncoding;
      return t;
    }
  };

  /* ---- canvas sprite label (the Hall's makeLabel, in Conclave dress) ---- */
  C.makeLabel = function (title, sub, hex) {
    const SS = 2;
    const cv = document.createElement("canvas");
    const g = cv.getContext("2d");
    const font = `400 ${46 * SS}px Marcellus, Georgia, serif`;
    const subFont = `italic 300 ${26 * SS}px Spectral, Georgia, serif`;
    g.font = font;
    const wT = g.measureText(title).width;
    g.font = subFont;
    const wS = sub ? g.measureText(sub).width : 0;
    const W = Math.ceil(Math.max(wT, wS) + 48 * SS);
    const H = Math.ceil((sub ? 96 : 64) * SS);
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)"; ctx.shadowBlur = 8 * SS;
    ctx.font = font;
    const grad = ctx.createLinearGradient(0, 0, 0, 52 * SS);
    grad.addColorStop(0, "#fff1c8"); grad.addColorStop(0.68, "#e7b24a"); grad.addColorStop(1, "#a9772f");
    ctx.fillStyle = grad;
    ctx.fillText(title, W / 2, (sub ? 30 : 32) * SS);
    if (sub) {
      ctx.font = subFont;
      ctx.fillStyle = "rgba(196,205,224,0.85)";
      ctx.fillText(sub, W / 2, 70 * SS);
    }
    const tex = new T3.CanvasTexture(cv);
    tex.encoding = T3.sRGBEncoding;
    tex.minFilter = T3.LinearFilter;
    const sp = new T3.Sprite(new T3.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, fog: false }));
    const hWorld = 0.62;
    sp.scale.set(hWorld * (W / H), hWorld, 1);
    return sp;
  };
})(typeof window !== "undefined" ? window : globalThis);
