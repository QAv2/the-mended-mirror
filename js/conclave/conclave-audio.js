/* ============================================================================
   THE CONCLAVE OF BECOMING — the hymn.
   ----------------------------------------------------------------------------
   "The air hummed with a symphony of ten thousand creation hymns…
    overlapping prayers, epic poems, and nursery rhymes."

   All synthesized. No assets. Breathes in on the first gesture (autoplay law)
   and never demands attention:

     · the hymn    — five detuned formant voices in a slow cluster, each
                     swelling on its own clock: overlapping prayers, felt.
     · the hearth  — ember crackle at the center of everything.
     · the stars   — rare high shimmer.
     · entrances   — a swirl-whoosh; a settling chime whose pitch is drawn
                     from a pentatonic row by the tradition's age, so swiping
                     through the ages plays a melody.
     · summons     — a rising swell, one more voice joining the hymn;
                     replies land on a low root-and-fifth.

   M hushes everything. C.audio.start() is called by the conductor inside the
   first user gesture.
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};

  const A = C.audio = {
    started: false, muted: false, ctx: null,
    start, chime, whoosh, swell, releaseSwell, reply, toggleMute, update,
  };

  let ctx, master, hush, verbIn, voices = [], crackleTimer = 0, shimmerTimer = 4;
  let summonVoice = null;

  /* the pentatonic ladder the ages climb (A minor pentatonic, low to high) */
  const ROW = [];
  (function () {
    const base = 55;                       // A1
    const steps = [0, 3, 5, 7, 10];        // minor pentatonic
    for (let oct = 1; oct <= 4; oct++)
      for (const s of steps) ROW.push(base * Math.pow(2, oct + s / 12 - 1));
  })();

  function start() {
    if (A.started) return;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    ctx = A.ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();

    master = ctx.createGain(); master.gain.value = 0.0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 18; comp.ratio.value = 5;
    master.connect(comp); comp.connect(ctx.destination);

    hush = ctx.createGain(); hush.gain.value = 1.0; hush.connect(master);

    /* a small space: two feedback delays, gently detuned in time */
    verbIn = ctx.createGain(); verbIn.gain.value = 0.28;
    const d1 = ctx.createDelay(1), d2 = ctx.createDelay(1);
    d1.delayTime.value = 0.311; d2.delayTime.value = 0.473;
    const f1 = ctx.createGain(), f2 = ctx.createGain();
    f1.gain.value = 0.34; f2.gain.value = 0.31;
    const dampA = ctx.createBiquadFilter(), dampB = ctx.createBiquadFilter();
    dampA.type = "lowpass"; dampA.frequency.value = 1900;
    dampB.type = "lowpass"; dampB.frequency.value = 1500;
    verbIn.connect(d1); verbIn.connect(d2);
    d1.connect(dampA); dampA.connect(f1); f1.connect(d1); dampA.connect(hush);
    d2.connect(dampB); dampB.connect(f2); f2.connect(d2); dampB.connect(hush);

    /* ---- the hymn: five formant voices --------------------------------- */
    const roots = [55, 82.41, 110, 164.81, 220];       // A1 E2 A2 E3 A3
    for (let i = 0; i < 5; i++) {
      const g = ctx.createGain(); g.gain.value = 0.0;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.value = roots[i] * (1 + (i - 2) * 0.0011);
      const bp1 = ctx.createBiquadFilter(), bp2 = ctx.createBiquadFilter();
      bp1.type = "bandpass"; bp1.frequency.value = 620 + i * 90;  bp1.Q.value = 2.6;
      bp2.type = "bandpass"; bp2.frequency.value = 1040 + i * 60; bp2.Q.value = 3.2;
      const mix = ctx.createGain(); mix.gain.value = 0.5;
      o.connect(bp1); o.connect(bp2); bp1.connect(mix); bp2.connect(mix);
      mix.connect(g); g.connect(hush); g.connect(verbIn);
      o.start();
      voices.push({ o, g, phase: Math.random() * 6.28, rate: 0.028 + i * 0.009, amp: 0.016 + (i % 2) * 0.006 });
    }

    /* ---- the hearth: filtered crackle bed ------------------------------- */
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nd.length; i++) {                 // brown-ish
      last = (last + (Math.random() * 2 - 1) * 0.02) * 0.998;
      nd[i] = last * 3.5;
    }
    A._noise = nb;
    const wind = ctx.createBufferSource(); wind.buffer = nb; wind.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = "bandpass";
    wf.frequency.value = 240; wf.Q.value = 0.45;
    const wg = ctx.createGain(); wg.gain.value = 0.028;
    wind.connect(wf); wf.connect(wg); wg.connect(hush);
    wind.start();
    A._windGain = wg;

    /* fade the world in over six seconds */
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 2.4);
    A.started = true;
  }

  /* one ember pop */
  function crackle() {
    if (!A.started) return;
    const s = ctx.createBufferSource(); s.buffer = A._noise;
    s.playbackRate.value = 2.2 + Math.random() * 2.5;
    const f = ctx.createBiquadFilter(); f.type = "highpass";
    f.frequency.value = 900 + Math.random() * 1600;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.025, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05 + Math.random() * 0.07);
    s.connect(f); f.connect(g); g.connect(hush);
    s.start(t); s.stop(t + 0.2);
  }

  /* one high star, far away */
  function shimmer() {
    if (!A.started) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    const f0 = 1700 + Math.random() * 2400;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.986, t + 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.006 + Math.random() * 0.005, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 1.8);
    o.connect(g); g.connect(verbIn);
    o.start(t); o.stop(t + 2.0);
  }

  /* the settling chime — pitch by seat (age rank) */
  function chime(rank, N) {
    if (!A.started || A.muted) return;
    const idx = Math.max(0, Math.min(ROW.length - 1,
      Math.floor((rank / Math.max(1, N - 1)) * (ROW.length - 1))));
    const f0 = ROW[idx] * 2;                      // one octave up into bell range
    const t = ctx.currentTime;
    const car = ctx.createOscillator(); car.type = "sine"; car.frequency.value = f0;
    const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = f0 * 2.76;
    const mg = ctx.createGain(); mg.gain.setValueAtTime(f0 * 1.4, t);
    mg.gain.exponentialRampToValueAtTime(f0 * 0.02, t + 1.4);
    mod.connect(mg); mg.connect(car.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.10, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 2.6);
    car.connect(g); g.connect(hush); g.connect(verbIn);
    car.start(t); mod.start(t); car.stop(t + 2.8); mod.stop(t + 2.8);
  }

  /* the entrance wind — follows the swirl */
  function whoosh(dur) {
    if (!A.started || A.muted) return;
    const t = ctx.currentTime, d = dur || 2.4;
    const s = ctx.createBufferSource(); s.buffer = A._noise; s.loop = true;
    s.playbackRate.value = 0.9;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.1;
    f.frequency.setValueAtTime(180, t);
    f.frequency.exponentialRampToValueAtTime(900, t + d * 0.55);
    f.frequency.exponentialRampToValueAtTime(320, t + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.10, t + d * 0.4);
    g.gain.linearRampToValueAtTime(0.015, t + d * 0.8);
    g.gain.linearRampToValueAtTime(0.0, t + d);
    s.connect(f); f.connect(g); g.connect(hush);
    s.start(t); s.stop(t + d + 0.1);
  }

  /* a presence rises — one more voice joins the hymn while it stands */
  function swell(rank, N) {
    if (!A.started || A.muted) return;
    releaseSwell(true);
    const idx = Math.max(0, Math.min(ROW.length - 1,
      Math.floor((rank / Math.max(1, N - 1)) * (ROW.length - 1))));
    const f0 = ROW[idx];
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f0;
    const o2 = ctx.createOscillator(); o2.type = "sawtooth";
    o2.frequency.value = f0 * (1 + 0.0021);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.0;
    bp.frequency.setValueAtTime(220, t);
    bp.frequency.exponentialRampToValueAtTime(760, t + 2.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.055, t + 2.2);
    o.connect(bp); o2.connect(bp); bp.connect(g);
    g.connect(hush); g.connect(verbIn);
    o.start(t); o2.start(t);
    summonVoice = { o, o2, g, bp };
  }
  function releaseSwell(hard) {
    if (!summonVoice || !A.started) { summonVoice = null; return; }
    const v = summonVoice; summonVoice = null;
    const t = ctx.currentTime, d = hard ? 0.15 : 1.6;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setTargetAtTime(0.0, t, d / 3);
    v.o.stop(t + d + 0.4); v.o2.stop(t + d + 0.4);
  }

  /* a reply lands — low root and fifth */
  function reply() {
    if (!A.started || A.muted) return;
    const t = ctx.currentTime;
    [110, 164.81].forEach((f0, i) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f0;
      const g = ctx.createGain();
      const at = t + i * 0.14;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.05, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0006, at + 1.7);
      o.connect(g); g.connect(hush); g.connect(verbIn);
      o.start(at); o.stop(at + 1.9);
    });
  }

  function toggleMute() {
    A.muted = !A.muted;
    if (A.started)
      hush.gain.setTargetAtTime(A.muted ? 0.0 : 1.0, ctx.currentTime, 0.3);
    return A.muted;
  }

  /* called every frame by the conductor */
  function update(dt) {
    if (!A.started || A.muted) return;
    const t = ctx.currentTime;
    for (const v of voices) {
      v.phase += dt * v.rate * 6.28318;
      const w = Math.max(0, Math.sin(v.phase));
      v.g.gain.setTargetAtTime(v.amp * (0.25 + 0.75 * w * w), t, 0.4);
    }
    crackleTimer -= dt;
    if (crackleTimer <= 0) { crackle(); crackleTimer = 0.12 + Math.random() * 0.9; }
    shimmerTimer -= dt;
    if (shimmerTimer <= 0) { shimmer(); shimmerTimer = 5 + Math.random() * 11; }
  }
})(typeof window !== "undefined" ? window : globalThis);
