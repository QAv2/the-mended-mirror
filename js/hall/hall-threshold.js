/* ============================================================================
   THE HALL OF AGES — the threshold: one plinth, two relics, center of the room.
   The plinth stands directly over the pool — the relics rest on the mirror's
   unbroken heart without knowing it. Choose a relic and the room executes:
   the astrolabe reveals the instrument in the floor; the scroll wraps the
   ages around the wall. (The holodeck dissolve itself lives in hall-room.)
   The astrolabe here is procedural UNTIL a real model is dropped at
   assets/astrolabe.glb — then it is swapped in automatically (needs http://
   or a browser that permits file:// XHR; the fallback always works).
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  HALL.buildThreshold = function (H) {
    const group = new THREE.Group();
    group.position.set(0, H.room ? H.room.LID_Y : 0.46, 0);
    H.scene.add(group);

    /* ---------- the plinth (the museum's altar, kept) ---------- */
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0e1118, roughness: 0.5, metalness: 0.5 });
    const plinthTopMat = new THREE.MeshStandardMaterial({ color: 0x0e1116, roughness: 0.6, metalness: 0.35 });
    const PL_H = 0.95;
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.9), plinthMat);
    base.position.y = 0.09;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.72, PL_H - 0.3, 8), plinthMat);
    column.position.y = 0.09 + (PL_H - 0.3) / 2;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 1.5), plinthTopMat);
    cap.position.y = PL_H;
    const capInlay = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.012, 8, 48),
      new THREE.MeshStandardMaterial({ color: HALL.COL.gold, roughness: 0.25, metalness: 1.0, emissive: HALL.COL.goldDeep, emissiveIntensity: 0.25 })
    );
    capInlay.rotation.x = Math.PI / 2;
    capInlay.position.y = PL_H + 0.085;
    group.add(base, column, cap, capInlay);
    const TOP_Y = PL_H + 0.08;

    /* ---------- relic 1 · the scroll ---------- */
    const scroll = new THREE.Group();
    scroll.position.set(-0.42, TOP_Y, 0);
    scroll.userData = { kind: "relic", which: "scroll", label: "The Scroll of Ages", cap: "stand inside the ages" };
    group.add(scroll);
    const parchMat = new THREE.MeshStandardMaterial({ color: 0xd9c6a2, roughness: 0.9 });
    const parchDeep = new THREE.MeshStandardMaterial({ color: 0xc9b78f, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 24), parchMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.11;
    scroll.add(body);
    [0.31, -0.31].forEach(x => {
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 24), parchDeep);
      core.rotation.z = Math.PI / 2; core.position.set(x, 0.11, 0);
      scroll.add(core);
    });
    const tongueGeo = new THREE.PlaneGeometry(0.30, 0.34, 12, 4);
    {
      const p = tongueGeo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, -0.05 * Math.cos((p.getX(i) / 0.15) * 0.8));
      tongueGeo.computeVertexNormals();
    }
    const tongue = new THREE.Mesh(tongueGeo, new THREE.MeshStandardMaterial({ color: HALL.COL.parchment, roughness: 0.8, side: THREE.DoubleSide }));
    tongue.rotation.x = -Math.PI / 2;
    tongue.position.set(0.45, 0.03, 0);
    scroll.add(tongue);
    // pickable bubble
    const scrollGrab = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    scrollGrab.position.y = 0.1;
    scrollGrab.userData = scroll.userData;
    scroll.add(scrollGrab);

    /* ---------- relic 2 · the astrolabe (procedural, GLB-replaceable) ---------- */
    const astro = new THREE.Group();
    astro.position.set(0.46, TOP_Y + 0.02, 0);
    astro.userData = { kind: "relic", which: "astrolabe", label: "The Astrolabe of Ages", cap: "let the pantheons wheel" };
    group.add(astro);

    const proc = new THREE.Group();
    astro.add(proc);
    proc.rotation.x = -Math.PI / 2 + 0.5;
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc7972f, roughness: 0.28, metalness: 1.0, emissive: 0x3a2a08, emissiveIntensity: 0.35 });
    const brassDark = new THREE.MeshStandardMaterial({ color: 0x7a5c1e, roughness: 0.45, metalness: 1.0 });
    proc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.025, 48), brassMat));
    const limb = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.022, 12, 48), brassMat);
    limb.rotation.x = Math.PI / 2; limb.position.y = 0.012; proc.add(limb);
    [[0.20, 0.006], [0.135, 0.005]].forEach(([r, t]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 48), brassDark);
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.014; proc.add(ring);
    });
    for (let i = 0; i < 24; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.03), brassDark);
      const a = (i / 24) * Math.PI * 2;
      t.position.set(Math.cos(a) * 0.232, 0.016, Math.sin(a) * 0.232);
      t.rotation.y = -a; proc.add(t);
    }
    const rete = new THREE.Group();
    rete.position.y = 0.02;
    proc.add(rete);
    [[0.175, 0.01, 48], [0.085, 0.008, 40]].forEach(([r, t, s]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, s), brassMat);
      ring.rotation.x = Math.PI / 2; rete.add(ring);
    });
    const ecl = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.007, 8, 40), brassMat);
    ecl.rotation.x = Math.PI / 2; ecl.position.x = 0.05; rete.add(ecl);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3, r = 0.10 + (i % 2) * 0.05;
      const armM = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.006, 0.006), brassMat);
      armM.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      armM.rotation.y = -a; rete.add(armM);
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8),
        new THREE.MeshStandardMaterial({ color: HALL.COL.goldBright, emissive: HALL.COL.gold, emissiveIntensity: 0.7, metalness: 1, roughness: 0.2 }));
      star.position.set(Math.cos(a) * (r + 0.03), 0.005, Math.sin(a) * (r + 0.03));
      rete.add(star);
    }
    const ruleBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.004, 0.012), brassMat);
    ruleBar.position.y = 0.03; proc.add(ruleBar);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 12), brassMat);
    pin.position.y = 0.03; proc.add(pin);

    const astroGrab = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    astroGrab.position.y = 0.15;
    astroGrab.userData = astro.userData;
    astro.add(astroGrab);

    // a small warm case-light over the plinth top so the relics read
    const caseLight = new THREE.PointLight(0xffe0a6, 1.0, 5.5, 2.0);
    caseLight.position.set(0.3, 2.0, 1.7);
    group.add(caseLight);

    /* >>> MOUNT-HOOK · assets/astrolabe.glb <<<
       Drop the Meshy model there; it replaces the procedural relic, normalized
       to the same footprint. Silent fallback if unreachable. Metallic PBR needs
       reflections to live, so the model gets its own environment map — scoped
       to the relic only; the hall's obsidian register stays untouched. */
    if (root.THREE && THREE.GLTFLoader) {
      try {
        new THREE.GLTFLoader().load("assets/astrolabe.glb", gltf => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = 0.62 / Math.max(size.x, size.y, size.z);
          model.scale.setScalar(scale);
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          model.position.y += (box.max.y - box.min.y) / 2 + 0.02;
          // tiny procedural equirect environment: obsidian below, a warm gold
          // key above, a cool silver counter — just enough sky for brass to live
          const EW = 128, EH = 64;
          const px = new Uint8Array(EW * EH * 4);
          for (let y = 0; y < EH; y++) {
            for (let x = 0; x < EW; x++) {
              const v = y / (EH - 1);                       // 0 top … 1 bottom
              const u = x / EW;
              let r = 8, g = 9, b = 13;                     // the void
              const sky = Math.max(0, 1 - v * 1.9);
              r += sky * 26; g += sky * 30; b += sky * 44;  // cool high sheen
              const dGold = Math.min(Math.abs(u - 0.22), 1 - Math.abs(u - 0.22));
              const gold = Math.exp(-((dGold * 6.5) ** 2)) * Math.exp(-(((v - 0.18) * 3.4) ** 2));
              r += gold * 235; g += gold * 180; b += gold * 90;
              const dCool = Math.min(Math.abs(u - 0.74), 1 - Math.abs(u - 0.74));
              const cool = Math.exp(-((dCool * 7.5) ** 2)) * Math.exp(-(((v - 0.30) * 3.8) ** 2));
              r += cool * 70; g += cool * 90; b += cool * 130;
              const i = (y * EW + x) * 4;
              px[i] = Math.min(255, r); px[i + 1] = Math.min(255, g);
              px[i + 2] = Math.min(255, b); px[i + 3] = 255;
            }
          }
          const envTex = new THREE.DataTexture(px, EW, EH, THREE.RGBAFormat);
          envTex.mapping = THREE.EquirectangularReflectionMapping;
          envTex.magFilter = THREE.LinearFilter;
          envTex.minFilter = THREE.LinearFilter;
          envTex.needsUpdate = true;
          model.traverse(o => {
            if (o.isMesh && o.material && o.material.isMeshStandardMaterial) {
              o.material.envMap = envTex;
              o.material.envMapIntensity = 0.85;
              if (o.material.metalness > 0.85) o.material.metalness = 0.85;
              o.material.needsUpdate = true;
            }
          });
          proc.visible = false;
          astro.add(model);
        }, undefined, () => { /* keep the procedural relic */ });
      } catch (e) { /* file:// XHR refusal — the procedural relic stands in */ }
    }

    H.threshold = {
      group, astro, scroll, rete, caseLight,
      pickables: [astroGrab, scrollGrab],
      tick(dt) { rete.rotation.y += dt * 0.25; },
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
