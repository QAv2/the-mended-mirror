/* ============================================================================
   THE CONCLAVE OF BECOMING — the conductor.
   ----------------------------------------------------------------------------
   One clock, three tiers, no chrome:

     GATE      — black; the name; "rise."
     RITE      — the ascent: up the shaft, through the ring, out under the
                 bloom, glide to the heart. Skippable with a second gesture.
     BLOOM     — the coliseum. Drag/swipe to turn (momentum), hover to
                 whisper a tradition's name, click a petal or any of its
                 lights to call it near. Click the warm ring in the floor
                 to sink home to the Hall of Ages.
     PETAL     — the presented petal. Swipe L/R for its neighbors in time
                 (each makes the entrance from the wing). Click a light to
                 call the figure forth. Esc steps back.
     PRESENCE  — the figure stands before you. Golden threads lead to its
                 kin: click one to travel. The communion line opens: speak.

   URL: ?shot=bloom|petal|presence [&petal=<id>] [&fig=<id>] [&th=<deg>]
        ?intro=0   ?tier=0|1|2   ?voice=live   ?render=0
   Probe: window.CONCLAVE.state, window.CONCLAVE.__shotReady
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};
  const T3 = root.THREE;

  const q0 = new URLSearchParams(location.search);
  const SHOT = q0.get("shot");
  const RENDER_OFF = q0.get("render") === "0";
  const INTRO = !SHOT && q0.get("intro") !== "0";

  let state = "gate";
  let busy = false;
  let rite = null;
  let hintShown = { bloom: false, petal: false, presence: false };
  const ui = {};

  Object.defineProperty(C, "state", { get: () => state });

  /* ======================== boot ======================================== */
  function boot() {
    C.buildScene();
    C.buildLotus();
    C.buildPresence();
    C.buildVoice();
    buildUI();
    bindInput();

    try { document.fonts && document.fonts.load('400 46px Marcellus') && document.fonts.load('italic 300 26px Spectral'); } catch (e) {}

    if (SHOT) { enterShot(); }
    else if (!INTRO) {
      ui.gate.classList.add("gone");
      setState("bloom");
      C.env.shaft.visible = false;
    }
    // else: the gate waits for the first gesture

    let last = performance.now() / 1000;
    (function frame() {
      if (!RENDER_OFF) requestAnimationFrame(frame);
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - last);
      last = now;
      if (rite) rite(now);
      C.rig.update(dt);
      C.lotus.update(dt, now);
      C.presence.update(dt, now);
      C.env.update(dt, now);
      C.audio.update(dt);
      updatePins();
      C.renderer.render(C.scene, C.camera);
    })();
    if (RENDER_OFF) {          // probe mode: a few frames, then rest
      for (let i = 0; i < 3; i++) C.renderer.render(C.scene, C.camera);
    }
  }

  function setState(s) {
    state = s;
    document.body.dataset.state = s;
    if (s !== "presence") { hidePresBlock(); ui.speak.classList.add("hidden"); ui.echo.textContent = ""; }
    hint(s);
  }

  /* ======================== the rite ===================================== */
  function beginRite() {
    if (state !== "gate") return;
    setState("rite");
    C.audio.start();
    ui.gate.classList.add("gone");
    C.env.shaft.visible = true;

    const rig = C.rig;
    rig.locked = true;
    const t0 = performance.now() / 1000;
    const A = 4.4, B = 2.8;                       // ascent, glide
    rite = now => {
      const t = now - t0;
      if (t < A) {                                // up the shaft, eyes on the ring
        const u = ease(t / A);
        rig.eye.set(0, -24 + u * 27.6, 8.5);      // -24 → 3.6
        rig.theta = rig.dTheta = Math.PI;         // facing the ring's far rim… gaze up
        rig.phi = rig.dPhi = 0.20 + u * 0.42;
        const breach = smooth01((rig.eye.y - (-1)) / 2.5);
        C.env.shaft.material.opacity = 1 - breach;
      } else if (t < A + B) {                     // out under the bloom, glide to the heart
        const u = ease((t - A) / B);
        rig.eye.set(0, 3.6 - u * 0.4, 8.5 - u * 8.5);
        const th = Math.PI + u * Math.PI;         // swing round to face the ancients
        rig.theta = rig.dTheta = th;
        rig.phi = rig.dPhi = 0.67 + u * 0.75;
      } else {
        rig.eye.set(0, 3.2, 0);
        rig.theta = rig.dTheta = 0;
        rig.phi = rig.dPhi = 1.42;
        rig.locked = false;
        rite = null;
        C.env.shaft.visible = false;
        setState("bloom");
      }
    };
  }
  function skipRite() {
    if (!rite) return;
    const rig = C.rig;
    rig.eye.set(0, 3.2, 0);
    rig.theta = rig.dTheta = 0;
    rig.phi = rig.dPhi = 1.42;
    rig.locked = false;
    rite = null;
    C.env.shaft.visible = false;
    setState("bloom");
  }

  /* ======================== shot harness ================================ */
  function enterShot() {
    ui.gate.classList.add("gone");
    C.env.shaft.visible = false;
    const th = q0.get("th");
    if (th !== null) C.rig.theta = C.rig.dTheta = (+th || 0) * Math.PI / 180;
    const ph = q0.get("phi");
    if (ph !== null) C.rig.phi = C.rig.dPhi = +ph;
    const tid = q0.get("petal") || (C.M.seats[0] && C.M.seats[0].tid);
    const figQ = q0.get("fig");

    const finish = () => {
      // wait for the veins plate (or 3s), then a few settled frames
      const t0 = performance.now();
      (function poll() {
        const texOk = C.lotus.matReal.__uni.uHasTex.value === 1;
        if (texOk || performance.now() - t0 > 3000) {
          let n = 0;
          (function settle() {
            if (++n < 14) return requestAnimationFrame(settle);
            C.__shotReady = true;
          })();
        } else setTimeout(poll, 120);
      })();
    };

    if (SHOT === "petal" || SHOT === "presence") {
      setState("petal");
      C.lotus.present(tid, 1, true).then(() => {
        if (SHOT === "presence") {
          let fi = figQ !== null ? C.M.figIndexById[figQ] : undefined;
          if (fi === undefined) fi = (C.M.figsOfTrad[tid] || [])[0];
          if (fi !== undefined) {
            setState("presence");
            C.presence.summon(fi, true).then(() => { C.voice.open(fi); finish(); });
            return;
          }
        }
        finish();
      });
    } else { setState("bloom"); finish(); }
  }

  /* ======================== interaction ================================= */
  let pDown = null, dragging = false, dragDx = 0, pinch0 = 0;

  function bindInput() {
    const el = C.renderer.domElement;

    addEventListener("pointerdown", e => {
      if (e.target === ui.input) return;
      if (state === "gate") { beginRite(); return; }
      if (state === "rite") { skipRite(); return; }
      pDown = { x: e.clientX, y: e.clientY, t: performance.now() };
      dragging = false; dragDx = 0;
      C.rig.vel = 0;
      C.audio.start();                    // first gesture anywhere wakes the hymn
    });

    addEventListener("pointermove", e => {
      if (state === "gate" || state === "rite") return;
      if (pDown && !dragging &&
          Math.hypot(e.clientX - pDown.x, e.clientY - pDown.y) > 6) dragging = true;

      if (dragging && pDown) {
        const dx = e.movementX || 0, dy = e.movementY || 0;
        if (state === "bloom") {
          C.rig.dTheta -= dx * 0.0026;
          C.rig.dPhi -= dy * 0.0022;
          C.rig.vel = -dx * 0.0026 * 60;
        } else if (state === "petal") {
          dragDx += dx;
          C.rig.dPhi -= dy * 0.0012;
        } else if (state === "presence") {
          C.rig.dTheta -= dx * 0.0006;    // breathing-room parallax only
          C.rig.dPhi -= dy * 0.0006;
        }
        hideWhisper();
        return;
      }

      // hover whispers
      if (state === "bloom") {
        const n = C.lotus.hoverSeat(e.clientX, e.clientY);
        C.lotus.setHover(n);
        if (n >= 0) whisper(C.M.seats[n].name, C.M.seats[n].color, e.clientX, e.clientY);
        else hideWhisper();
      } else if (state === "petal") {
        const fi = C.lotus.pickPresentedFig(e.clientX, e.clientY);
        if (fi >= 0) { whisper(C.D.figures[fi].name, C.lotus.presented.seat.color, e.clientX, e.clientY);
          C.lotus.setBright(fi, 1); dimOthers(fi); }
        else { hideWhisper(); dimOthers(-1); }
      } else if (state === "presence") {
        const w = C.presence.hoverWisp(e.clientX, e.clientY);
        if (w) {
          const tn = (C.D.traditions[w.tid] || {}).name || w.tid;
          whisper(`${w.name} · ${tn}`, C.COL.tierGold[w.tier] || "#c9b37a", e.clientX, e.clientY);
        } else hideWhisper();
      }
    });

    addEventListener("pointerup", e => {
      if (!pDown) return;
      const wasDrag = dragging, dx = dragDx;
      const quick = performance.now() - pDown.t < 420;
      pDown = null; dragging = false; dragDx = 0;
      if (state === "petal" && wasDrag && Math.abs(dx) > 70) {
        neighborSwipe(dx < 0 ? +1 : -1);
        return;
      }
      if (!wasDrag && quick) click(e.clientX, e.clientY);
      ui.hint.classList.add("gone");
    });

    addEventListener("wheel", e => {
      if (state === "bloom")
        C.rig.dFov = Math.max(44, Math.min(62, C.rig.dFov + e.deltaY * 0.012));
    }, { passive: true });

    // pinch = the wheel of touch
    addEventListener("touchmove", e => {
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY);
        if (pinch0) C.rig.dFov = Math.max(44, Math.min(62, C.rig.dFov - (d - pinch0) * 0.05));
        pinch0 = d;
      }
    }, { passive: true });
    addEventListener("touchend", () => { pinch0 = 0; });

    addEventListener("keydown", e => {
      if (e.target === ui.input) {
        if (e.key === "Escape") { ui.input.blur(); stepBack(); }
        return;
      }
      if (state === "gate") { beginRite(); return; }
      if (state === "rite") { skipRite(); return; }
      switch (e.key) {
        case "ArrowLeft":
          if (state === "bloom") C.rig.vel = 1.5;
          else if (state === "petal") neighborSwipe(-1);
          break;
        case "ArrowRight":
          if (state === "bloom") C.rig.vel = -1.5;
          else if (state === "petal") neighborSwipe(+1);
          break;
        case "ArrowUp": C.rig.dPhi -= 0.09; break;
        case "ArrowDown": C.rig.dPhi += 0.09; break;
        case "Escape": stepBack(); break;
        case "Enter":
          if (state === "presence") { ui.speak.classList.remove("hidden"); ui.input.focus(); }
          break;
        case "m": case "M": C.audio.toggleMute(); break;
      }
    });

    ui.speak.addEventListener("submit", e => {
      e.preventDefault();
      const v = ui.input.value;
      ui.input.value = "";
      C.voice.say(v);
    });
  }

  function click(x, y) {
    if (busy) return;
    if (state === "bloom") {
      // the way home first
      const hit = rayPick(x, y, C.env.pickables);
      if (hit) { goHome(); return; }
      let tid = null, focus = -1;
      const fi = C.lotus.pickCrowd(x, y, 12);
      if (fi >= 0) { tid = C.D.figures[fi].tradition; focus = fi; }
      else {
        const n = C.lotus.pickSeat(x, y);
        if (n >= 0) tid = C.M.seats[n].tid;
      }
      if (tid) presentPetal(tid, +1, focus);
    } else if (state === "petal") {
      const fi = C.lotus.pickPresentedFig(x, y);
      if (fi >= 0) summonFig(fi);
      else stepBack();
    } else if (state === "presence") {
      const w = rayWisp(x, y);
      if (w) { travel(w.fi); return; }
      const fi = C.lotus.pickPresentedFig(x, y);
      if (fi >= 0 && (!C.presence.current || fi !== C.presence.current.fi))
        travel(fi);                           // another light on the same petal
      else stepBack();
    }
  }

  const _ray = new T3.Raycaster(), _ndc = new T3.Vector2();
  function rayPick(x, y, objs) {
    _ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    _ray.setFromCamera(_ndc, C.camera);
    const h = _ray.intersectObjects(objs, false);
    return h.length ? h[0].object : null;
  }
  function rayWisp(x, y) {
    return C.presence.hoverWisp(x, y);
  }

  /* ======================== verbs ======================================= */
  function presentPetal(tid, dir, focusFi) {
    busy = true;
    hideWhisper();
    setState("petal");
    C.lotus.present(tid, dir).then(() => {
      busy = false;
      showInscribed(tid);
      if (focusFi >= 0) C.lotus.setBright(focusFi, 1);   // the light you followed, found
    });
  }

  function neighborSwipe(dir) {
    if (busy || !C.lotus.presented) return;
    const nb = C.lotus.neighbors(C.lotus.presented.tid);
    const tid = dir > 0 ? nb.next : nb.prev;
    if (!tid) return;
    busy = true;
    hideWhisper();
    C.lotus.present(tid, dir).then(() => { busy = false; showInscribed(tid); });
  }

  function summonFig(fi) {
    busy = true;
    hideWhisper();
    setState("presence");
    C.presence.summon(fi).then(() => {
      busy = false;
      C.voice.open(fi);
      ui.speak.classList.remove("hidden");
    });
  }

  function travel(kinFi) {
    if (busy) return;
    busy = true;
    hideWhisper();
    const kinTid = C.D.figures[kinFi].tradition;
    const here = C.lotus.presented ? C.lotus.presented.tid : null;
    C.voice.close();
    hidePresBlock();
    C.presence.release(true).then(() => {
      const go = () => C.lotus.present(kinTid, +1).then(() => {
        showInscribed(kinTid);
        return C.presence.summon(kinFi);
      }).then(() => {
        busy = false;
        C.voice.open(kinFi);
      });
      if (kinTid === here) {
        // same petal — just stand the kin forth
        C.presence.summon(kinFi).then(() => { busy = false; C.voice.open(kinFi); });
      } else go();
    });
  }

  function stepBack() {
    if (busy) return;
    if (state === "presence") {
      busy = true;
      C.voice.close();
      hidePresBlock();
      ui.speak.classList.add("hidden");
      C.presence.release().then(() => { busy = false; setState("petal"); });
    } else if (state === "petal") {
      busy = true;
      C.lotus.dismiss().then(() => { busy = false; setState("bloom"); });
    }
  }

  function goHome() {
    ui.veil.classList.add("down");
    whisper("the Hall of Ages", "#e7b24a", innerWidth / 2, innerHeight * 0.8);
    setTimeout(() => { location.href = "index.html"; }, 900);
  }

  function dimOthers(exceptFi) {
    // gentle: only the hovered light brightens; the rest stand as they are
    if (dimOthers.__last >= 0 && dimOthers.__last !== exceptFi)
      C.lotus.setBright(dimOthers.__last, 0);
    dimOthers.__last = exceptFi;
  }
  dimOthers.__last = -1;

  /* ======================== DOM ========================================= */
  function buildUI() {
    ui.gate = document.getElementById("gate");
    ui.veil = document.getElementById("veil");
    ui.whisper = document.getElementById("whisper");
    ui.hint = document.getElementById("hint");
    ui.pres = document.getElementById("presblock");
    ui.presName = ui.pres.querySelector("h2");
    ui.presMeta = ui.pres.querySelector(".meta");
    ui.presGloss = ui.pres.querySelector(".gloss");
    ui.presSpeech = ui.pres.querySelector(".speech");
    ui.speak = document.getElementById("speak");
    ui.input = ui.speak.querySelector("input");
    ui.echo = document.getElementById("echo");

    C.ui = {
      presenceIntro(p, gloss) {
        ui.presName.textContent = p.name;
        ui.presMeta.textContent =
          `${p.kind} · ${p.tradName}${p.span ? " · " + p.span : ""}`;
        ui.presGloss.textContent = gloss || "";
        ui.presSpeech.textContent = "";
        ui.pres.classList.remove("hidden");
      },
      presenceSpeak(text) {
        ui.presSpeech.classList.remove("said");
        void ui.presSpeech.offsetWidth;            // restart the fade
        ui.presSpeech.textContent = text;
        ui.presSpeech.classList.add("said");
      },
      communeEcho(text) {
        ui.echo.textContent = "— " + text;
        ui.echo.classList.remove("said");
        void ui.echo.offsetWidth;
        ui.echo.classList.add("said");
      },
    };
  }

  function showInscribed(tid) {
    if (!hintShown.petal) hint("petal");
  }

  function whisper(text, color, x, y) {
    ui.whisper.textContent = text;
    ui.whisper.style.color = color || "#c4cde0";
    ui.whisper.style.left = Math.min(innerWidth - 30, x + 16) + "px";
    ui.whisper.style.top = (y - 26) + "px";
    ui.whisper.classList.add("on");
  }
  function hideWhisper() { ui.whisper.classList.remove("on"); }

  function hidePresBlock() { ui.pres.classList.add("hidden"); }

  const HINTS = {
    bloom: "drag to turn the bloom · touch a light to call its petal near",
    petal: "swipe for its neighbors in time · touch a light to call them forth",
    presence: "speak, or follow a golden thread",
  };
  function hint(kind) {
    if (!HINTS[kind] || hintShown[kind] || SHOT) return;
    hintShown[kind] = true;
    ui.hint.textContent = HINTS[kind];
    ui.hint.classList.remove("gone");
    clearTimeout(hint.__t);
    hint.__t = setTimeout(() => ui.hint.classList.add("gone"), 9000);
  }

  /* pinned blocks: the presence text stands beneath the summoned light */
  const _pv = new T3.Vector3();
  function updatePins() {
    if (!ui.pres || ui.pres.classList.contains("hidden")) return;
    _pv.copy(C.presence.below).project(C.camera);
    if (_pv.z > 1) { ui.pres.style.opacity = 0; return; }
    ui.pres.style.opacity = 1;
    ui.pres.style.left = (_pv.x * 0.5 + 0.5) * innerWidth + "px";
    ui.pres.style.top = (-_pv.y * 0.5 + 0.5) * innerHeight + "px";
  }

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function smooth01(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  /* the tuner's door — drive the space from the console or the snap harness */
  C.__debug = {
    present: (tid, dir) => presentPetal(tid, dir || 1, -1),
    swipe: dir => neighborSwipe(dir),
    summon: fi => summonFig(typeof fi === "string" ? C.M.figIndexById[fi] : fi),
    travel: fi => travel(typeof fi === "string" ? C.M.figIndexById[fi] : fi),
    back: () => stepBack(),
    busy: () => busy,
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
