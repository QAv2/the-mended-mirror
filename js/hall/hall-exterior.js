/* ============================================================================
   THE HALL OF AGES — the exterior: a tholos on a sea-crag, in the last light.
   ----------------------------------------------------------------------------
   The world the visitor arrives from. A round Doric temple stands on a
   promontory over open water; its cella IS the existing rotunda — the drum
   wraps the lobby wall, the stylobate floor is the lobby lid, the doorway is
   cut on the prophesied bearing (−Z), so the door you walk in through and the
   one unwritten interval on the strata wall are the same door.

   Everything here is procedural (canvas stone via HALL.surface, shader sky &
   sea) — zero asset weight, still deployable as flat files. A GLB dropped by
   a later pass can replace any piece; the procedural build is the fallback.

   Day lives here; night belongs to the interior. H.exterior.setNight(k)
   carries the sun down; the same sky you flew under darkens into the void
   the stars already lived in — one sky, crossed once.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};
  const TAU = Math.PI * 2;

  /* async: yields a frame between the temple's great pieces so the gate
     stays live while the world raises, and narrates each piece to ?diag=1 */
  HALL.buildExterior = async function (H) {
    const room = H.room;
    const LID_Y = room.LID_Y;                 // temple floor = the lobby lid
    const WALL_R = room.WALL_R;               // the cella's inner face (lobby wall)
    const DIAG_ = root.DIAG || { mark() {} };
    const Y = t => {
      if (H.__narrate) H.__narrate("raising the temple · " + t);
      else DIAG_.mark("raising the temple · " + t);
      if (H.__rt) { H.renderer.render(H.scene, H.camera); DIAG_.mark("survived render · " + t); }
      return H.__yield ? H.__yield() : new Promise(r => requestAnimationFrame(r));
    };

    /* ---------- the temple's measures (derived from the interior) ---------- */
    const DRUM_R = WALL_R + 0.85;             // outer masonry shell of the cella
    const DRUM_TOP = room.WALL_H + 2.2;       // drum rises past the interior cornice
    const COL_R = DRUM_R + 3.2;               // colonnade ring centerline
    const N_COL = 20;                         // Delphi's number
    const COL_H = 22;                         // to the architrave
    const STYLO_R = COL_R + 3.4;              // top step outer radius
    const STEP_H = 0.71, STEP_W = 1.75;       // krepis
    const ESPL_Y = LID_Y - 3 * STEP_H;        // the paved ground the temple stands on
    const SEA_Y = -24;                        // the water, far below the cliff edge
    const DOOR_W = 4.4, DOOR_H = 8.9;         // the clear opening (bearing −Z)
    const DOOR_HALF_A = (DOOR_W / 2 + 0.55) / DRUM_R;  // structural gap incl. jambs

    /* the sun of the golden hour — low, warm, raking across the colonnade */
    const SUN_DIR = new THREE.Vector3(0.721, 0.164, 0.673).normalize();

    const group = new THREE.Group();
    group.name = "exterior";
    H.scene.add(group);

    /* ---------- materials (exterior set — faded as one) ---------- */
    const EXT_MATS = [];
    function reg(m) { EXT_MATS.push(m); return m; }

    const marbleSurf = HALL.surface({ base: "#cfc7b6", dark: "#a9a08e", lite: "#eae4d6", grain: 0.55, size: 1024 });
    [marbleSurf.map, marbleSurf.bumpMap, marbleSurf.roughnessMap].filter(Boolean).forEach(t => t.repeat.set(4, 2));
    const marble = reg(new THREE.MeshStandardMaterial({
      map: marbleSurf.map, bumpMap: marbleSurf.bumpMap, bumpScale: 0.02,
      roughnessMap: marbleSurf.roughnessMap, roughness: 0.62, metalness: 0.0,
    }));
    const marbleFlat = reg(marble.clone());          // for lathe/instanced pieces
    marbleFlat.bumpScale = 0.012;

    const rockSurf = HALL.surface({ base: "#4d473d", dark: "#332e26", lite: "#645c4d", grain: 1.3, size: 1024 });
    [rockSurf.map, rockSurf.bumpMap, rockSurf.roughnessMap].filter(Boolean).forEach(t => t.repeat.set(5, 3));
    const rock = reg(new THREE.MeshStandardMaterial({
      map: rockSurf.map, bumpMap: rockSurf.bumpMap, bumpScale: 0.05,
      roughnessMap: rockSurf.roughnessMap, roughness: 0.95, metalness: 0.0,
      flatShading: true,
    }));

    
    const goldTrim = reg(new THREE.MeshStandardMaterial({
      color: HALL.COL.gold, metalness: 1, roughness: 0.3,
      emissive: HALL.COL.goldDeep, emissiveIntensity: 0.25,
    }));

    /* ---------- the crag and its paved crown ---------- */
    await Y("the crag");
    (function crag() {
      const DEPTH = 32, TOP_R = 46.5, BOT_R = 60;
      const geo = new THREE.CylinderGeometry(TOP_R, BOT_R, DEPTH, HALL.segN(96, 48), 7, true);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const th = Math.atan2(z, x), r = Math.hypot(x, z);
        const down = 0.5 - y / DEPTH;                       // 0 at rim … 1 at base
        // layered angular noise — a sea-carved face, calm at the paved rim
        const n = Math.sin(th * 7 + 1.7) * 0.45 + Math.sin(th * 13 + y * 0.55) * 0.3
                + Math.sin(th * 23 + y * 1.3 + 4.2) * 0.25;
        const k = 1 + n * 0.11 * (0.25 + down * 0.75);
        p.setX(i, Math.cos(th) * r * k);
        p.setZ(i, Math.sin(th) * r * k);
        p.setY(i, y + Math.sin(th * 9 + r) * 0.35 * down);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, rock);
      m.position.y = ESPL_Y - DEPTH / 2 + 0.05;
      m.name = "crag";
      group.add(m);
      group.userData.crag = m;

      // the crown's noise wanders the rim in and out while the esplanade
      // edge is a clean circle — where the rim strayed outward, a sliver of
      // open sea showed between pavement and rock (Joe's catch). A footing
      // collar tucked under the pavement and flared past the rim's widest
      // wander closes the seam from every angle. Child of the crag, so the
      // porthole and holodeck rules carry it for free.
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(45.6, 48.8, 4.3, 96, 1, true), rock);
      collar.position.y = (ESPL_Y - 0.05 - 4.3 / 2) - (ESPL_Y - DEPTH / 2 + 0.05);
      collar.name = "cragcollar";
      m.add(collar);

      // the esplanade — worn paving, rings and radial joints
      const c = document.createElement("canvas");
      const EP = HALL.texSize(1024, 512), EK = EP / 1024;
      c.width = c.height = EP;
      const g = c.getContext("2d");
      g.scale(EK, EK);   // paint in the 1024 frame at any resolution
      g.fillStyle = "#b7ac94"; g.fillRect(0, 0, 1024, 1024);
      // mottle
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * 1024, y = Math.random() * 1024, r2 = 14 + Math.random() * 60;
        g.globalAlpha = 0.05;
        g.fillStyle = Math.random() < 0.5 ? "#9d9179" : "#cbc1aa";
        g.beginPath(); g.arc(x, y, r2, 0, TAU); g.fill();
      }
      g.globalAlpha = 1;
      // ring joints + radial joints, cut around the center
      g.strokeStyle = "rgba(58,52,40,0.42)"; g.lineWidth = 2.5;
      for (let r2 = 90; r2 < 780; r2 += 86) { g.beginPath(); g.arc(512, 512, r2, 0, TAU); g.stroke(); }
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * TAU;
        g.beginPath();
        g.moveTo(512 + Math.cos(a) * 90, 512 + Math.sin(a) * 90);
        g.lineTo(512 + Math.cos(a) * 800, 512 + Math.sin(a) * 800);
        g.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
      // ring-grid, not a fan (CircleGeometry) — fans sparkle radially in
      // motion; see the lobby lid
      const esp = new THREE.Mesh(
        new THREE.RingGeometry(0.02, TOP_R - 0.4, HALL.segN(96, 48), 12),
        reg(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 }))
      );
      esp.rotation.x = -Math.PI / 2;
      esp.position.y = ESPL_Y;
      group.add(esp);
      group.userData.esplanade = esp;
    })();

    /* ---------- the krepis: three great steps ----------
       risers are open cylinders and treads ring-grids — a cylinder CAP is a
       triangle fan, and a fan's per-wedge UV derivatives disco-ball at a
       graze under a moving camera (see the lobby lid) */
    await Y("the krepis");
    const steps = new THREE.Group();
    const STEP_SEG = HALL.segN(128, 64);
    for (let i = 0; i < 3; i++) {
      const r = STYLO_R + i * STEP_W;
      const topY = LID_Y - i * STEP_H;
      const riser = new THREE.Mesh(new THREE.CylinderGeometry(r, r, STEP_H, STEP_SEG, 1, true), marble);
      riser.position.y = topY - STEP_H / 2;
      steps.add(riser);
      // the exposed annulus only: tucked under the ring above (or, for the
      // top step, starting just past the lid's edge inside the drum cavity)
      const rIn = i === 0 ? WALL_R + 0.62 : STYLO_R + (i - 1) * STEP_W - 0.02;
      const tread = new THREE.Mesh(new THREE.RingGeometry(rIn, r, STEP_SEG, 3), marble);
      tread.rotation.x = -Math.PI / 2;
      tread.position.y = topY;
      steps.add(tread);
    }
    group.add(steps);

    /* the ambulatory floor between the drum and the colonnade edge */
    const ambu = new THREE.Mesh(new THREE.RingGeometry(WALL_R + 0.6, STYLO_R - 0.02, STEP_SEG, 3), marble);
    ambu.rotation.x = -Math.PI / 2;
    ambu.position.y = LID_Y + 0.012;
    group.add(ambu);

    /* ---------- the colonnade: one fluted Doric column, twenty times ---------- */
    await Y("the colonnade");
    const colParts = [];
    (function colonnade() {
      const SH_H = COL_H - 1.06;             // shaft; capital takes the rest
      const RB = 1.55, RT = 1.26, FLUTES = 20, DEPTH = 0.055;
      // fluted, tapered shaft with a whisper of entasis
      const RAD_SEG = FLUTES * Math.max(3, Math.round(6 * (HALL.Q ? HALL.Q.segs : 1))), H_SEG = 6;
      const pos = [], norm = [], uv = [], idx = [];
      for (let iy = 0; iy <= H_SEG; iy++) {
        const t = iy / H_SEG;
        const rr = (RB + (RT - RB) * t) + RB * 0.03 * Math.sin(t * Math.PI);
        for (let ia = 0; ia <= RAD_SEG; ia++) {
          const th = (ia / RAD_SEG) * TAU;
          const scoop = Math.pow(0.5 - 0.5 * Math.cos(FLUTES * th), 0.65);
          const r = rr * (1 - DEPTH * scoop);
          pos.push(Math.sin(th) * r, t * SH_H, Math.cos(th) * r);
          norm.push(0, 0, 0);
          uv.push((ia / RAD_SEG) * 6, t * 5);
        }
      }
      for (let iy = 0; iy < H_SEG; iy++) {
        for (let ia = 0; ia < RAD_SEG; ia++) {
          const a = iy * (RAD_SEG + 1) + ia, b = a + RAD_SEG + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const shaftGeo = new THREE.BufferGeometry();
      shaftGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      shaftGeo.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
      shaftGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      shaftGeo.setIndex(idx);
      shaftGeo.computeVertexNormals();

      // echinus: the cushion; abacus: the slab
      const echGeo = new THREE.LatheGeometry([
        new THREE.Vector2(RT - 0.02, 0), new THREE.Vector2(RT + 0.06, 0.16),
        new THREE.Vector2(RT + 0.3, 0.34), new THREE.Vector2(RT + 0.52, 0.5),
        new THREE.Vector2(RT + 0.62, 0.62),
      ], HALL.segN(40, 20));
      const abGeo = new THREE.BoxGeometry((RT + 0.68) * 2, 0.44, (RT + 0.68) * 2);

      const mkInst = (geo, y, alignSquare) => {
        const im = new THREE.InstancedMesh(geo, marbleFlat, N_COL);
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
        for (let i = 0; i < N_COL; i++) {
          const th = -Math.PI / 2 + (i + 0.5) * TAU / N_COL;   // the door bisects a bay
          q.setFromAxisAngle(up, alignSquare ? (Math.PI / 2 - th) : 0);
          m4.compose(new THREE.Vector3(Math.cos(th) * COL_R, y, Math.sin(th) * COL_R), q, new THREE.Vector3(1, 1, 1));
          im.setMatrixAt(i, m4);
        }
        im.instanceMatrix.needsUpdate = true;
        group.add(im);
        colParts.push(im);
        return im;
      };
      mkInst(shaftGeo, LID_Y, false);
      mkInst(echGeo, LID_Y + SH_H, false);
      const ab = mkInst(abGeo, 0, true);
      // the abacus is a box (origin at center) — lift it onto the echinus
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
      for (let i = 0; i < N_COL; i++) {
        ab.getMatrixAt(i, m4); m4.decompose(v, q, s);
        v.y = LID_Y + SH_H + 0.62 + 0.22;
        m4.compose(v, q, s); ab.setMatrixAt(i, m4);
      }
      ab.instanceMatrix.needsUpdate = true;
    })();

    /* ---------- the entablature: architrave, triglyph frieze, cornice ---------- */
    await Y("the entablature");
    const entab = new THREE.Group();
    (function entablature() {
      const Y0 = LID_Y + COL_H;
      const ARCH_H = 1.75, FRI_H = 1.95, COR_H = 0.55, DRIP_H = 0.3;
      const R_OUT = COL_R + 1.75, R_IN = COL_R - 1.75;
      const ESEG = HALL.segN(128, 64);
      // architrave — plain band, outer and inner faces + soffit
      const archOut = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT, R_OUT, ARCH_H, ESEG, 1, true), marble);
      archOut.position.y = Y0 + ARCH_H / 2;
      const archIn = new THREE.Mesh(new THREE.CylinderGeometry(R_IN, R_IN, ARCH_H, HALL.segN(96, 48), 1, true),
        reg(new THREE.MeshStandardMaterial({ map: marbleSurf.map, roughness: 0.7, metalness: 0, side: THREE.BackSide })));
      archIn.position.y = Y0 + ARCH_H / 2;
      const soffit = new THREE.Mesh(new THREE.RingGeometry(R_IN, R_OUT, ESEG, 1), marble);
      soffit.rotation.x = Math.PI / 2;
      soffit.position.y = Y0 + 0.01;
      entab.add(archOut, archIn, soffit);

      // frieze — triglyphs and metopes painted round a band
      const c = document.createElement("canvas");
      const FW = HALL.texSize(4096, 1024), FK = FW / 4096;
      c.width = FW; c.height = Math.max(40, Math.round(160 * FK));
      const g = c.getContext("2d");
      g.scale(FK, FK);   // paint in the 4096×160 frame at any resolution
      g.fillStyle = "#cbc2b0"; g.fillRect(0, 0, 4096, 160);
      const PAIRS = N_COL * 2;                       // one over each column, one between
      for (let i = 0; i < PAIRS; i++) {
        const x0 = (i / PAIRS) * 4096, w = 4096 / PAIRS, tw = w * 0.42;
        // triglyph block — slightly proud, cool shadowed channels
        g.fillStyle = "#b6ac97"; g.fillRect(x0, 8, tw, 144);
        g.fillStyle = "rgba(52,46,36,0.55)";
        [0.18, 0.5, 0.82].forEach(f => g.fillRect(x0 + tw * f - 3.5, 14, 7, 132));
        g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(x0, 8, 2.5, 144);
        // metope — a breath darker, weathered
        g.fillStyle = "rgba(96,88,72,0.16)"; g.fillRect(x0 + tw, 12, w - tw, 136);
      }
      // taenia — a thin gold line under the frieze (the temple remembers the seams)
      g.fillStyle = "rgba(190,150,70,0.5)"; g.fillRect(0, 152, 4096, 5);
      const friTex = new THREE.CanvasTexture(c);
      friTex.encoding = THREE.sRGBEncoding; friTex.anisotropy = HALL.Q.aniso; friTex.wrapS = THREE.RepeatWrapping;
      const frieze = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT + 0.05, R_OUT + 0.05, FRI_H, ESEG, 1, true),
        reg(new THREE.MeshStandardMaterial({ map: friTex, roughness: 0.72, metalness: 0 })));
      frieze.position.y = Y0 + ARCH_H + FRI_H / 2;
      entab.add(frieze);

      // cornice + drip, then the cap the sky sees
      const cor = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT + 0.55, R_OUT + 0.35, COR_H, ESEG, 1, true), marble);
      cor.position.y = Y0 + ARCH_H + FRI_H + COR_H / 2;
      const drip = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT + 0.75, R_OUT + 0.75, DRIP_H, ESEG, 1, true), marble);
      drip.position.y = Y0 + ARCH_H + FRI_H + COR_H + DRIP_H / 2;
      const cap = new THREE.Mesh(new THREE.RingGeometry(R_IN, R_OUT + 0.75, ESEG, 1), marble);
      cap.rotation.x = -Math.PI / 2;
      cap.position.y = Y0 + ARCH_H + FRI_H + COR_H + DRIP_H;
      entab.add(cor, drip, cap);
      entab.userData.topY = cap.position.y;
      entab.userData.R_IN = R_IN;
    })();
    group.add(entab);

    /* ---------- the ring roof: colonnade up to the drum ---------- */
    const ringRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(DRUM_R + 0.35, COL_R + 2.45, 3.0, HALL.segN(128, 64), 1, true),
      marble
    );
    ringRoof.position.y = entab.userData.topY + 1.5;
    group.add(ringRoof);

    /* ---------- the drum: the cella seen from the world ---------- */
    await Y("the drum");
    const drumGroup = new THREE.Group();
    (function drum() {
      // coursing canvas — quiet ashlar masonry
      const c = document.createElement("canvas");
      const DW = HALL.texSize(2048, 512), DK = DW / 2048;
      c.width = DW; c.height = DW / 4;
      const g = c.getContext("2d");
      g.scale(DK, DK);   // paint in the 2048×512 frame at any resolution
      g.fillStyle = "#c8bfae"; g.fillRect(0, 0, 2048, 512);
      for (let y = 0; y < 512; y += 46) {
        g.fillStyle = "rgba(70,62,50,0.30)"; g.fillRect(0, y, 2048, 2);
        const off = (y / 46) % 2 ? 64 : 0;
        for (let x = off; x < 2048; x += 128) {
          g.fillStyle = "rgba(70,62,50,0.16)"; g.fillRect(x, y, 1.6, 46);
        }
      }
      for (let i = 0; i < 260; i++) {
        g.globalAlpha = 0.05;
        g.fillStyle = Math.random() < 0.5 ? "#ada490" : "#d9d1c0";
        const x = Math.random() * 2048, y = Math.random() * 512;
        g.fillRect(x, y, 30 + Math.random() * 90, 8 + Math.random() * 26);
      }
      g.globalAlpha = 1;
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = HALL.Q.aniso; tex.wrapS = THREE.RepeatWrapping;
      const drumMat = reg(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0 }));

      const H_DRUM = DRUM_TOP - LID_Y;
      const T0 = Math.PI + DOOR_HALF_A, TL = TAU - 2 * DOOR_HALF_A;
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R, DRUM_R, H_DRUM, HALL.segN(128, 64), 1, true, T0, TL), drumMat);
      shell.position.y = LID_Y + H_DRUM / 2;
      drumGroup.add(shell);
      // transom — the drum continues above the door lintel
      const TR_H = DRUM_TOP - (DOOR_H + 0.45);
      const trans = new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R, DRUM_R, TR_H, 12, 1, true, Math.PI - DOOR_HALF_A, 2 * DOOR_HALF_A), drumMat);
      trans.position.y = DOOR_H + 0.45 + TR_H / 2;
      // remap uv so the coursing lines up with the shell
      (function () {
        const p = trans.geometry.attributes.position, u = trans.geometry.attributes.uv;
        for (let i = 0; i < p.count; i++) {
          const th = Math.atan2(p.getX(i), p.getZ(i));
          let d = th - T0; d = ((d % TAU) + TAU) % TAU;
          u.setXY(i, d / TL, (p.getY(i) + trans.position.y - LID_Y) / H_DRUM);
        }
        u.needsUpdate = true;
      })();
      drumGroup.add(trans);
      group.add(drumGroup);
    })();

    /* ---------- the dome and its oculus (the sky's own door) ---------- */
    await Y("the dome");
    const domeGroup = new THREE.Group();
    (function dome() {
      const R_D = 60, OC_R = 7.2;
      const phiEdge = Math.asin(DRUM_R / R_D), phiOc = Math.asin(OC_R / R_D);
      const yc = DRUM_TOP - R_D * Math.cos(phiEdge);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(R_D, HALL.segN(128, 64), HALL.segN(24, 12), 0, TAU, phiOc, phiEdge - phiOc), marble);
      cap.position.y = yc;
      domeGroup.add(cap);
      // stepped rings, the Pantheon's memory
      [0.44, 0.36, 0.27].forEach(phi => {
        const r = R_D * Math.sin(phi), y = yc + R_D * Math.cos(phi);
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.22, r + 0.22, 0.5, HALL.segN(128, 64), 1, true), marble);
        ring.position.y = y - 0.1;
        domeGroup.add(ring);
      });
      // the oculus collar and its gold lip — aligned over the interior's oculus
      const yOc = yc + R_D * Math.cos(phiOc);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(OC_R, OC_R, 0.75, HALL.segN(96, 48), 1, true), marble);
      collar.position.y = yOc + 0.2;
      const lip = new THREE.Mesh(new THREE.TorusGeometry(OC_R, 0.14, 10, 96), goldTrim);
      lip.rotation.x = Math.PI / 2;
      lip.position.y = yOc + 0.62;
      domeGroup.add(collar, lip);
      group.add(domeGroup);
    })();

    /* ---------- the portal: jambs, lintel (the leaves live in hall-doors) ---------- */
    await Y("the portal");
    const portal = new THREE.Group();
    (function portalBuild() {
      const zFace = -(DRUM_R + 0.22);                 // proud of the drum
      const jw = 0.62, jd = 0.5;
      [-1, 1].forEach(s => {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(jw, DOOR_H + 0.6, jd), marble);
        jamb.position.set(s * (DOOR_W / 2 + jw / 2 - 0.06), (DOOR_H + 0.6) / 2, zFace);
        portal.add(jamb);
        // the reveal — the passage's thickness, wall to drum
        const rev = new THREE.Mesh(new THREE.BoxGeometry(0.5, DOOR_H, 1.9), marble);
        rev.position.set(s * (DOOR_W / 2 + 0.25), DOOR_H / 2, -(WALL_R + (DRUM_R - WALL_R) / 2));
        portal.add(rev);
      });
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 2 * jw + 0.5, 0.92, jd + 0.3), marble);
      lintel.position.set(0, DOOR_H + 0.46, zFace);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 2 * jw + 1.1, 0.34, jd + 0.55), marble);
      cornice.position.set(0, DOOR_H + 1.09, zFace);
      portal.add(lintel, cornice);
      // the reveal's ceiling
      const soffit = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.9, 0.5, 1.9), marble);
      soffit.position.set(0, DOOR_H + 0.22, -(WALL_R + (DRUM_R - WALL_R) / 2));
      portal.add(soffit);
      // the sill underfoot — the one slab the crossing actually touches
      const sill = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 1.2, 0.14, 2.6), marble);
      sill.position.set(0, LID_Y - 0.045, -(WALL_R + 0.35));
      portal.add(sill);
      // the bronze leaves themselves live in hall-doors (interior-owned: they
      // survive the porthole cut and serve as the in-room door)
      group.add(portal);
    })();

    /* ---------- the sea ---------- */
    await Y("the sea");
    const oceanUniforms = {
      uTime: { value: 0 },
      uSunDir: { value: SUN_DIR.clone() },
      uSunCol: { value: new THREE.Color(0xfff0cf).convertSRGBToLinear() },
      uSunI: { value: 1.0 },
      uDeep: { value: new THREE.Color(0x0e2e38).convertSRGBToLinear() },
      uSkyHi: { value: new THREE.Color(0x9fb8c8).convertSRGBToLinear() },
      uHaze: { value: new THREE.Color(0xe6c493).convertSRGBToLinear() },
      uOpacity: { value: 1.0 },
    };
    const ocean = new THREE.Mesh(
      new THREE.RingGeometry(2, 660, HALL.segN(150, 80), HALL.segN(56, 32)),
      new THREE.ShaderMaterial({
        uniforms: oceanUniforms, fog: false,
        vertexShader: `
          uniform float uTime;
          varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 p = position;                       // plane is rotated flat; local xy → world xz
            vec2 xz = vec2(p.x, -p.y);
            float t = uTime;
            vec2 D1 = normalize(vec2(1.0, 0.35)), D2 = normalize(vec2(-0.7, 1.0)), D3 = normalize(vec2(0.4, -1.0));
            float a1 = dot(D1, xz) * 0.185 + t * 0.62;
            float a2 = dot(D2, xz) * 0.33  + t * 0.94;
            float a3 = dot(D3, xz) * 0.70  + t * 1.46;
            float h = 0.32*sin(a1) + 0.18*sin(a2) + 0.11*sin(a3);
            float dhx = 0.32*0.185*D1.x*cos(a1) + 0.18*0.33*D2.x*cos(a2) + 0.11*0.70*D3.x*cos(a3);
            float dhz = 0.32*0.185*D1.y*cos(a1) + 0.18*0.33*D2.y*cos(a2) + 0.11*0.70*D3.y*cos(a3);
            p.z += h;                                // local z = world y (pre-rotation)
            vN = normalize(vec3(-dhx, 1.0, -dhz));
            vec4 w = modelMatrix * vec4(p, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: `
          uniform float uTime; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform float uSunI;
          uniform vec3 uDeep; uniform vec3 uSkyHi; uniform vec3 uHaze; uniform float uOpacity;
          varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 N = normalize(vN);
            N.xz += 0.05 * vec2(sin(vW.x*0.9 + uTime*1.7 + vW.z*0.6), sin(vW.z*1.1 - uTime*1.3));
            N = normalize(N);
            vec3 V = normalize(cameraPosition - vW);
            float F = 0.05 + 0.95 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
            vec3 col = mix(uDeep, uSkyHi, F * 0.8);
            vec3 Rd = reflect(-V, N);
            float gl = pow(max(dot(Rd, uSunDir), 0.0), 520.0) * 2.4 + pow(max(dot(Rd, uSunDir), 0.0), 24.0) * 0.16;
            col += uSunCol * gl * uSunI;
            float d = length(vW.xz - cameraPosition.xz);
            col = mix(col, uHaze, smoothstep(110.0, 560.0, d));
            gl_FragColor = vec4(col, uOpacity);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }`,
      })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = SEA_Y;
    ocean.name = "ocean";
    group.add(ocean);

    /* ---------- the one sky (it persists; night is only its far side) ---------- */
    await Y("the sky");
    const skyUniforms = {
      uSunDir: { value: SUN_DIR.clone() },
      uZen: { value: new THREE.Color(0x33506e).convertSRGBToLinear() },
      uMid: { value: new THREE.Color(0x7e9cb4).convertSRGBToLinear() },
      uHor: { value: new THREE.Color(0xf2bf7e).convertSRGBToLinear() },
      uSunCol: { value: new THREE.Color(0xfff0cf).convertSRGBToLinear() },
      uSunI: { value: 1.0 },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(600, HALL.segN(48, 24), HALL.segN(24, 12)),
      new THREE.ShaderMaterial({
        uniforms: skyUniforms, side: THREE.BackSide, fog: false, depthWrite: false,
        vertexShader: `
          varying vec3 vW;
          void main(){ vW = (modelMatrix * vec4(position,1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 uSunDir; uniform vec3 uZen; uniform vec3 uMid; uniform vec3 uHor;
          uniform vec3 uSunCol; uniform float uSunI;
          varying vec3 vW;
          void main(){
            vec3 dir = normalize(vW);
            float h = clamp(dir.y, -0.08, 1.0);
            vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.22, h));
            col = mix(col, uZen, smoothstep(0.18, 0.75, h));
            float s = max(dot(dir, uSunDir), 0.0);
            col += uSunCol * (smoothstep(0.9993, 0.99985, s) * 1.5
                            + pow(s, 260.0) * 0.6 + pow(s, 9.0) * 0.16) * uSunI;
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }`,
      })
    );
    sky.name = "sky";
    H.scene.add(sky);

    /* ---------- the lights of the world ---------- */
    const sun = new THREE.DirectionalLight(0xffd9a4, 2.35);
    sun.position.copy(SUN_DIR).multiplyScalar(300);
    sun.target.position.set(0, 0, 0);
    group.add(sun, sun.target);
    const dayHemi = new THREE.HemisphereLight(0xa9c2dc, 0x8a7758, 0.8);
    group.add(dayHemi);
    const moon = new THREE.DirectionalLight(0x8fa3c8, 0.0);      // rises as the sun dies
    moon.position.set(-100, 120, -160);
    group.add(moon);

    /* ---------- palettes: the same world, before and after the crossing ---------- */
    const PAL = {
      day: {
        zen: new THREE.Color(0x33506e).convertSRGBToLinear(),
        mid: new THREE.Color(0x7e9cb4).convertSRGBToLinear(),
        hor: new THREE.Color(0xf2bf7e).convertSRGBToLinear(),
        deep: new THREE.Color(0x0e2e38).convertSRGBToLinear(),
        skyHi: new THREE.Color(0x9fb8c8).convertSRGBToLinear(),
        haze: new THREE.Color(0xe6c493).convertSRGBToLinear(),
        sunCol: new THREE.Color(0xfff0cf).convertSRGBToLinear(),
      },
      night: {
        zen: new THREE.Color(HALL.COL.obsidian2).convertSRGBToLinear(),   // the void, exactly
        mid: new THREE.Color(0x080a11).convertSRGBToLinear(),
        hor: new THREE.Color(0x0c101b).convertSRGBToLinear(),
        deep: new THREE.Color(0x04060a).convertSRGBToLinear(),
        skyHi: new THREE.Color(0x121724).convertSRGBToLinear(),
        haze: new THREE.Color(0x06070b).convertSRGBToLinear(),
        sunCol: new THREE.Color(0x8fa3c8).convertSRGBToLinear(),          // the moon keeps a cold sliver
      },
    };
    let nightK = 0;
    function setNight(k) {
      nightK = k;
      const d = PAL.day, n = PAL.night;
      const lerp = (u, a, b) => u.value.copy(a).lerp(b, k);
      lerp(skyUniforms.uZen, d.zen, n.zen);
      lerp(skyUniforms.uMid, d.mid, n.mid);
      lerp(skyUniforms.uHor, d.hor, n.hor);
      lerp(skyUniforms.uSunCol, d.sunCol, n.sunCol);
      skyUniforms.uSunI.value = Math.pow(1 - k, 1.6);
      lerp(oceanUniforms.uDeep, d.deep, n.deep);
      lerp(oceanUniforms.uSkyHi, d.skyHi, n.skyHi);
      lerp(oceanUniforms.uHaze, d.haze, n.haze);
      lerp(oceanUniforms.uSunCol, d.sunCol, n.sunCol);
      oceanUniforms.uSunI.value = 0.06 + Math.pow(1 - k, 1.6) * 0.94;
      sun.intensity = 2.35 * Math.pow(1 - k, 1.5);
      dayHemi.intensity = 0.8 * (1 - k);
      moon.intensity = 0.34 * smooth(0.45, 1, k);
    }

    /* ---------- fade / porthole / tick ---------- */
    function fade(k) {
      for (const m of EXT_MATS) {
        m.transparent = k < 0.999;
        m.opacity = k;
      }
      oceanUniforms.uOpacity.value = k;
      ocean.material.transparent = k < 0.999;
    }

    /* the crossing seals behind the visitor (Joe: the door should disappear
       once we're through — Route B, no leaves, the world simply ends): inside,
       NOTHING of the temple or the sea survives, and the −Z doorway is a dark
       gap onto the night. Only the sky stays — at night it IS the void the
       interior already trusts, so the gap reads as darkness, not a hole. */
    function setPorthole(on) {
      [drumGroup, entab, ringRoof, domeGroup, group.userData.crag,
       portal, ocean, steps, ambu, group.userData.esplanade, ...colParts]
        .forEach(o => { if (o) o.visible = !on; });
    }

    function tick(dt, elapsed) {
      if (!group.visible) return;
      oceanUniforms.uTime.value = elapsed;
    }

    const smooth = HALL.smooth;

    H.exterior = {
      group, tick, fade, setNight, setPorthole,
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
