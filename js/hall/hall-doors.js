/* ============================================================================
   THE HALL OF AGES — the bronze doors (P4 · Route A).
   ----------------------------------------------------------------------------
   One pair of tall bronze leaves on the prophesied bearing (−Z) — the same
   doorway the lobby wall cuts and the strata wall leaves unwritten. They are
   INTERIOR-owned (they survive the porthole cut): on the exterior flight's
   final approach they swing open ahead of the camera, close behind it, and
   the world is struck BEHIND the closed leaves — the doors motivate the cut.
   In the room they stand closed: the way the world was. Click them and they
   open onto the night the crossing left behind.

   The leaf is procedural bronze relief — concentric rings, a meridian line,
   star bosses: the astrolabe's own language, no tradition favored. Drop a
   Meshy model at assets/doors-leaf.glb and the relief upgrades in place
   (geometry only — the bronze is ours); the procedural leaf is the fallback
   and the tier-0 build. The hall must never depend on the GLB existing.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  HALL.buildDoors = function (H) {
    const WALL_R = H.dims.RAD - 0.22;          // the lobby wall (room's measure)
    const DRUM_R = WALL_R + 0.85;              // the cella shell (exterior's measure, same seam)
    const DOOR_W = 4.4, DOOR_H = 8.9;          // the clear opening (bearing −Z)
    const LEAF_W = DOOR_W / 2 - 0.02, LEAF_H = DOOR_H - 0.25, LEAF_D = 0.13;

    const group = new THREE.Group();
    group.name = "doors";
    H.scene.add(group);

    /* GOLD (Joe's call, 2026-07-05) — the leaves join the kintsugi register:
       the hall's own gold, part-metal with a breath of emissive so the pair
       reads in the portal's shade. DoubleSide throughout: the right leaf is
       the left mirrored (scale −1), and doubled faces on a slab cost nothing. */
    const bronze = new THREE.MeshStandardMaterial({
      color: 0xb8923e, metalness: 0.9, roughness: 0.42,
      emissive: 0x2a1f08, emissiveIntensity: 0.6, side: THREE.DoubleSide,
    });
    const verdigris = new THREE.MeshStandardMaterial({
      color: HALL.COL.goldDeep, metalness: 0.85, roughness: 0.5,
      emissive: 0x1a1206, emissiveIntensity: 0.4, side: THREE.DoubleSide,
    });
    const goldEdge = new THREE.MeshStandardMaterial({
      color: HALL.COL.goldBright, metalness: 1, roughness: 0.3,
      emissive: HALL.COL.goldDeep, emissiveIntensity: 0.3, side: THREE.DoubleSide,
    });

    /* ---------- the procedural leaf: rings · meridian · stars ---------- */
    function proceduralLeaf() {
      const leaf = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(LEAF_W, LEAF_H, LEAF_D), bronze);
      leaf.add(slab);
      // border molding
      const bd = 0.055;
      [[LEAF_W - 0.12, bd, 1, (LEAF_H - 0.16) / 2], [LEAF_W - 0.12, bd, 1, -(LEAF_H - 0.16) / 2]].forEach(([w, h, s, y]) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.045), verdigris);
        bar.position.set(0, y, -LEAF_D / 2 - 0.02);
        leaf.add(bar);
      });
      [-(LEAF_W - 0.16) / 2, (LEAF_W - 0.16) / 2].forEach(x => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(bd, LEAF_H - 0.12, 0.045), verdigris);
        bar.position.set(x, 0, -LEAF_D / 2 - 0.02);
        leaf.add(bar);
      });
      // concentric rings on the upper half (the astrolabe's memory)
      [0.72, 0.52, 0.30].forEach((f, i) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(LEAF_W * 0.44 * f, 0.028, 6, 40),
          i === 1 ? goldEdge : verdigris
        );
        ring.position.set(0, LEAF_H * 0.22, -LEAF_D / 2 - 0.02);
        ring.scale.z = 0.4;                      // low relief, not a hoop
        leaf.add(ring);
      });
      // the meridian — one straight line the full height
      const mer = new THREE.Mesh(new THREE.BoxGeometry(0.05, LEAF_H - 0.3, 0.04), goldEdge);
      mer.position.set(0, 0, -LEAF_D / 2 - 0.025);
      leaf.add(mer);
      // star bosses on the lower half
      const bossGeo = new THREE.OctahedronGeometry(0.085, 0);
      const R = (x, y) => { const b = new THREE.Mesh(bossGeo, verdigris); b.position.set(x, y, -LEAF_D / 2 - 0.03); b.scale.z = 0.55; leaf.add(b); };
      [[-0.55, -1.2], [0.4, -1.7], [-0.2, -2.4], [0.62, -2.9], [-0.6, -3.3], [0.15, -3.8]].forEach(([x, y]) => R(x, y));
      return leaf;
    }

    /* ---------- the hinges: the pair, mirrored ---------- */
    const Z_HINGE = -(DRUM_R - 0.18);            // where the exterior portal seats them
    const hinges = [];
    [-1, 1].forEach(s => {
      const hinge = new THREE.Group();
      hinge.position.set(s * (DOOR_W / 2 + 0.02), 0, Z_HINGE);
      const carrier = new THREE.Group();          // leaf hangs off the hinge line
      carrier.position.set(-s * (LEAF_W / 2 + 0.02), (LEAF_H) / 2 + 0.05, 0);
      if (s === 1) carrier.scale.x = -1;          // the right leaf mirrors the left
      carrier.add(proceduralLeaf());
      hinge.add(carrier);
      group.add(hinge);
      hinges.push({ hinge, carrier, side: s });
    });

    /* fat invisible grab plate across the closed pair (the in-room click) */
    const grab = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W + 0.6, DOOR_H, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    grab.position.set(0, DOOR_H / 2, Z_HINGE);
    grab.userData.kind = "doors";
    group.add(grab);

    /* ---------- state: openK 0 (sealed) … 1 (standing open, inward) ---------- */
    const OPEN_ANGLE = 1.28;                      // matches the old standing-open leaves
    let openK = 0;
    let opened = false;                           // onOpen hook edge
    function apply(k) {
      openK = Math.max(0, Math.min(1, k));
      for (const h of hinges) h.hinge.rotation.y = h.side * OPEN_ANGLE * openK;
      if (openK > 0.5 && !opened) { opened = true; if (api.onOpen) api.onOpen(); }
      if (openK < 0.05) opened = false;
    }
    apply(0);

    let tw = null;
    function setOpen(k, dur) {
      if (tw) { tw.t = tw.dur = 1; tw = null; }   // let the old tween finish out
      if (!dur) { apply(k); return; }
      const from = openK;
      tw = H.tween(dur, u => apply(from + (k - from) * u), null, () => { tw = null; });
    }

    /* ---------- the engraved skin: the 2D design IS the intricacy ----------
       A gold door design (fal.ai FLUX, 2D-first — Joe's pipeline) lands at
       assets/doors-leaf.png and becomes the leaf: a clean slab whose front
       and back carry the design as albedo + bump. Every engraved line
       survives at full resolution, where 15k triangles of image-to-3D
       geometry smooth them away. When it loads, the GLB stands down. */
    let skinned2d = false;
    if (HALL.Q.glb) {
      new THREE.TextureLoader().load("assets/doors-leaf.png", tex => {
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = HALL.Q.aniso;
        const engraved = new THREE.MeshStandardMaterial({
          map: tex, bumpMap: tex, bumpScale: -0.05,     // dark engraving cuts IN
          color: 0xffffff, metalness: 0.85, roughness: 0.5,
          emissive: 0x120c04, emissiveIntensity: 0.5, side: THREE.DoubleSide,
        });
        /* the room side lives in the reveal's shade — it carries its own
           warmer glow so the craft reads from within (Joe's catch) */
        const engravedIn = engraved.clone();
        engravedIn.emissive = new THREE.Color(0x2a1e0a);
        engravedIn.emissiveIntensity = 0.9;
        engravedIn.map = tex; engravedIn.bumpMap = tex;
        const mkLeaf = () => {
          const leaf = new THREE.Group();
          leaf.add(new THREE.Mesh(new THREE.BoxGeometry(LEAF_W, LEAF_H, LEAF_D), bronze));
          const front = new THREE.Mesh(new THREE.PlaneGeometry(LEAF_W - 0.02, LEAF_H - 0.02), engraved);
          front.position.z = -LEAF_D / 2 - 0.006;
          front.rotation.y = Math.PI;                   // faces outward (−z)
          const back = new THREE.Mesh(new THREE.PlaneGeometry(LEAF_W - 0.02, LEAF_H - 0.02), engravedIn);
          back.position.z = LEAF_D / 2 + 0.006;         // the room sees the same craft
          leaf.add(front, back);
          return leaf;
        };
        skinned2d = true;
        for (const h of hinges) {
          h.carrier.remove(h.carrier.children[0]);
          h.carrier.add(mkLeaf());
        }
        DIAG.mark("gold doors: engraved 2D skin mounted");
      }, undefined, () => { /* no design yet — relief carries it */ });
    }

    /* ---------- the GLB skin: geometry upgrade, the gold stays ours ---------- */
    if (root.THREE && THREE.GLTFLoader && HALL.Q.glb) {
      try {
        new THREE.GLTFLoader().load("assets/doors-leaf.glb", gltf => {
          if (skinned2d) return;   // the engraved 2D design outranks the relief
          // the WHOLE scene is the leaf (Meshy splits its relief across
          // meshes — taking one renders stray bars); the gold stays ours
          const src = gltf.scene;
          let any = false;
          src.traverse(o => { if (o.isMesh) { o.material = bronze; any = true; } });
          if (!any) return;
          const bb = new THREE.Box3().setFromObject(src);
          const sz = bb.getSize(new THREE.Vector3());
          if (!(sz.x > 0 && sz.y > 0 && sz.z > 0)) return;
          const seat = new THREE.Group();
          // seat on origin, then stretch to the leaf's opening — the relief's
          // circles run to ellipses, which orbits always were
          src.position.set(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2);
          seat.add(src);
          seat.scale.set(LEAF_W / sz.x, LEAF_H / sz.y, Math.min(1, LEAF_D * 2.2 / sz.z));
          seat.rotation.y = Math.PI;                 // Meshy relief faces +z; the hall's leaves face −z (outward)
          for (const h of hinges) {
            const old = h.carrier.children[0];
            h.carrier.remove(old);
            h.carrier.add(h.side === -1 ? seat : seat.clone(true));
          }
          DIAG.mark("bronze doors: GLB relief mounted");
        }, undefined, () => { /* the procedural leaves stand */ });
      } catch (e) { /* file:// refusal — the procedural leaves stand */ }
    }

    /* ---------- expose ---------- */
    const api = {
      group, pickables: [grab],
      get openK() { return openK; },
      setOpen, apply,
      onOpen: null,                               // audio hook (H.doors.onOpen) — sound system unbuilt
      /* the flight's hand: t in flight-seconds, K the dial — opens ahead of
         the camera, closes behind it; the porthole cut hides BEHIND them.
         The camera crosses the leaf plane at ~5.5K (knot 5, the portal): the
         leaves are FULL open a beat before that, and stay open until the
         camera is well inside (Joe flew through bronze in rev 1 — the scrub
         verified the curve but misread the crossing). */
      drive(t, K) {
        apply(HALL.smooth(3.4 * K, 5.0 * K, t) - HALL.smooth(6.9 * K, 9.0 * K, t));
      },
    };
    H.doors = api;
  };
})(typeof window !== "undefined" ? window : globalThis);
