/* ============================================================================
   THE HALL OF AGES — the approach: one unbroken breath, from the world in.
   ----------------------------------------------------------------------------
   The camera opens wide over the water, crosses the colonnade, threads the
   bronze doors on the prophesied bearing, and the daylight dies behind it in
   one continuous move — no cut. Inside, the plinth rises from the bare floor,
   the light settles, and the rig takes the visitor's hand exactly at the
   lobby pose the conductor already knows. Skip and the natural ending are the
   same code path; the interior cannot tell which one delivered you.

   The rig owns the camera every frame, so the approach applies its pose from
   a tick that runs AFTER rig.update (the same seat the gyroscope uses); when
   it finishes it sets the rig to the identical transform and lets go.
   ============================================================================ */
(function (root) {
  "use strict";
  const HALL = root.HALL = root.HALL || {};

  /* HALL.buildApproach(H, endPose) — endPose is POSES.room, the contract. */
  HALL.buildApproach = function (H, endPose) {
    /* one dial: move DUR and the whole flight dilates — every absolute-time
       anchor below rides K, so the C1-smooth warp keeps its exact shape
       (11.6 was the original choreography; Joe asked for a longer breath) */
    const DUR = 14.3, K = DUR / 11.6;

    /* the settle must land exactly where the rig will stand next frame */
    const endPos = new THREE.Vector3()
      .setFromSpherical(new THREE.Spherical(endPose.radius, endPose.phi, endPose.theta))
      .add(endPose.target);

    /* ---------- the path (knots) and where the eye rests along it ---------- */
    const P = [
      new THREE.Vector3(-38.0, 24.0, -126.0),   // 0 establish — wide over the water
      new THREE.Vector3(-17.0, 11.5, -84.0),    // 1 the push
      new THREE.Vector3(-5.5, 4.6, -56.0),      // 2 descending toward the steps
      new THREE.Vector3(0, 2.9, -44.6),         // 3 on axis, over the krepis
      new THREE.Vector3(0, 2.5, -36.6),         // 4 between the columns
      new THREE.Vector3(0, 2.35, -31.9),        // 5 the portal itself
      new THREE.Vector3(0, 2.3, -27.0),         // 6 inside — the wall behind you now
      new THREE.Vector3(0, 2.35, -16.0),        // 7 the long glide to the center
      new THREE.Vector3(3.4, 2.6, -7.6),        // 8 beginning to curl
      new THREE.Vector3(7.1, 3.05, -0.6),       // 9 rounding the rising plinth
      endPos.clone(),                            // 10 the rig's own seat
    ];
    const G = [
      new THREE.Vector3(0, 13.0, -4),
      new THREE.Vector3(0, 10.0, -8),
      new THREE.Vector3(0, 6.0, -22),
      new THREE.Vector3(0, 3.6, -30),
      new THREE.Vector3(0, 2.6, -16),
      new THREE.Vector3(0, 2.1, -4),
      new THREE.Vector3(0, 1.9, 0),
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(0, 1.2, 0),
      endPose.target.clone(),
    ];
    const posCurve = new THREE.CatmullRomCurve3(P, false, "centripetal");
    const gazeCurve = new THREE.CatmullRomCurve3(G, false, "centripetal");

    /* ---------- the timewarp: seconds → knot parameter, C1-smooth ---------- */
    const ROWS_T = [0, 3.2 * K, 4.6 * K, 5.5 * K, 6.6 * K, 7.8 * K, 9.2 * K, 10.4 * K, DUR];
    const ROWS_U = [0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    function warp(t) {
      t = Math.max(0, Math.min(DUR, t));
      let i = ROWS_T.length - 2;
      for (let j = 0; j < ROWS_T.length - 1; j++) if (t <= ROWS_T[j + 1]) { i = j; break; }
      const t0 = ROWS_T[i], t1 = ROWS_T[i + 1], s = (t - t0) / (t1 - t0);
      const u0 = ROWS_U[i], u1 = ROWS_U[i + 1];
      // catmull tangents from the neighbouring rows (clamped at the ends)
      const um = i > 0 ? ROWS_U[i - 1] : u0, tp = i > 0 ? ROWS_T[i - 1] : t0 - (t1 - t0);
      const up = i < ROWS_U.length - 2 ? ROWS_U[i + 2] : u1, tn = i < ROWS_T.length - 2 ? ROWS_T[i + 2] : t1 + (t1 - t0);
      const m0 = (u1 - um) / (t1 - tp) * (t1 - t0);
      const m1 = (up - u0) / (tn - t0) * (t1 - t0);
      const s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * u0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * u1 + (s3 - s2) * m1;
    }
    /* the whole flight starts and ends at rest */
    const W_IN = 2.2 * K, W_OUT = 2.8 * K;
    function tEase(t) {
      if (t < W_IN) { const x = t / W_IN; return W_IN * x * x * (2 - x); }
      if (t > DUR - W_OUT) { const x = (DUR - t) / W_OUT; return DUR - W_OUT * x * x * (2 - x); }
      return t;
    }

    const smooth = HALL.smooth;
    const envK = t => smooth(4.4 * K, 6.8 * K, t);
    const fovAt = t => 58 + 5.5 * (smooth(4.0 * K, 5.4 * K, t) - smooth(5.6 * K, 7.8 * K, t));
    /* the world is struck BEHIND the closing doors (P4): the leaves are most
       of the way shut before the porthole cut — the doors motivate the cut */
    const PLINTH_T = 7.6 * K, PORTHOLE_T = 9.2 * K;

    /* ---------- state ---------- */
    let mode = "idle";            // idle | play | seek | done
    let tau = 0;
    let onDone = null;
    let plinthFired = false, portholeDone = false;
    let tw = null;
    const drift = { off: new THREE.Vector3(), gz: new THREE.Vector3() };
    const _pos = new THREE.Vector3(), _gz = new THREE.Vector3();
    let skipBtn = null;

    function applyAt(t, live) {
      const te = tEase(t);
      const u = Math.max(0, Math.min(1, warp(te)));
      const ug = Math.max(0, Math.min(1, warp(tEase(Math.min(DUR, t + 0.10 * K)))));
      posCurve.getPoint(u, _pos);
      gazeCurve.getPoint(ug, _gz);
      if (live && mode === "play") {
        // the visitor's own vantage — they held the orbit until *begin* —
        // dissolves into the flight's first breath, position and gaze both
        const d = 1 - smooth(0, 1.9 * K, t);
        _pos.addScaledVector(drift.off, d);
        _gz.lerp(drift.gz, d);
      }
      H.camera.position.copy(_pos);
      H.camera.lookAt(_gz);
      const f = fovAt(t);
      if (Math.abs(H.camera.fov - f) > 0.01) { H.camera.fov = f; H.camera.updateProjectionMatrix(); }
      H.env.toInterior(envK(t));
      if (H.doors) H.doors.drive(t, K);   // leaves swing open ahead, close behind
      if (live && mode === "play") {
        if (!plinthFired && t >= PLINTH_T) { plinthFired = true; H.threshold.rise(2.3 * K); }
        if (!portholeDone && t >= PORTHOLE_T) { portholeDone = true; H.exterior.setPorthole(true); }
      } else if (!live) {
        // static seek (shot mode): settle the imperative states to match t
        if (t >= PLINTH_T) H.threshold.setRisen(); else H.threshold.setSunk();
        H.exterior.setPorthole(t >= PORTHOLE_T);
      }
    }

    /* ---------- the hand-off (skip and the true ending converge here) ---------- */
    function finish() {
      mode = "done";
      tw = null;
      removeSkip();
      const rig = H.rig;
      rig.dTarget.copy(endPose.target); rig.target.copy(endPose.target);
      rig.dSph.radius = endPose.radius; rig.dSph.phi = endPose.phi; rig.dSph.theta = endPose.theta;
      rig.sph.copy(rig.dSph);
      rig.locked = false;
      H.camera.fov = 58; H.camera.updateProjectionMatrix();
      H.env.toInterior(1);
      H.threshold.setRisen();
      H.exterior.setPorthole(true);
      const cb = onDone; onDone = null;
      if (cb) cb();
    }

    function removeSkip() { if (skipBtn) { skipBtn.remove(); skipBtn = null; } }

    /* ---------- public ---------- */
    const api = {
      get playing() { return mode === "play"; },

      /* fly. instant=true jumps to the arrived state (one code path).
         Before this, the rig is the visitor's — the title state is simply the
         orbit rig seated outside (hall-main), so the flight departs from
         wherever they carried the camera. */
      play(cb, instant) {
        onDone = cb || null;
        if (instant) { H.rig.locked = true; applyAt(DUR, false); finish(); return; }
        mode = "play";
        H.rig.locked = true;
        plinthFired = false; portholeDone = false;
        drift.off.copy(H.camera.position).sub(P[0]);   // wherever their orbit left us…
        drift.gz.copy(H.rig.target);                   // …and whatever it was studying
        tau = 0;
        skipBtn = document.createElement("div");
        skipBtn.id = "skip-intro";
        skipBtn.innerHTML = "skip the approach <span>Esc</span>";
        skipBtn.addEventListener("click", api.skip);
        document.body.appendChild(skipBtn);
        tw = H.tween(DUR, k => { tau = k * DUR; }, x => x, finish);
      },

      /* fast-forward: the tween completes naturally next frame */
      skip() {
        if (mode === "play" && tw) { tw.t = tw.dur; return; }
        if (mode !== "done") { applyAt(DUR, false); finish(); }
      },

      /* static scrub for the screenshot harness (?shot=approach&k=…) */
      seek(k) {
        mode = "seek";
        H.rig.locked = true;
        tau = Math.max(0, Math.min(1, k)) * DUR;
      },

      /* runs AFTER rig.update — whoever holds the camera last, holds it.
         In the title state nothing runs here: the rig itself holds the
         camera, and the visitor holds the rig. */
      tick(dt, elapsed) {
        if (mode === "play") {
          applyAt(tau, true);
        } else if (mode === "seek") {
          applyAt(tau, false);
        }
      },
    };
    H.approach = api;
  };
})(typeof window !== "undefined" ? window : globalThis);
