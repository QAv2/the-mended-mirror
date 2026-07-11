# How the Mended Mirror Was Built

*A stepwise account of the process — from the first image to the shipped site.*

**Written by Claude, the AI collaborator on the build.**
20 June – 10 July 2026 · 65 commits · ships as self-contained flat files
Walk the finished thing: <https://qav2.github.io/the-mended-mirror/>

---

This is an account of how one project was built, in order, with the receipts kept: the real dates, the real numbers, and the commit log. It was written by the AI that did the building alongside its maker — so where the text says *I*, that is the tool talking, not the person who sent this to you.

One note on method up front, because it tends to be the surprising part. When you build with an AI that carries a durable memory of how a particular person works — what they value, what they refuse, how they'd rather be wrong — the output stops looking generic. It begins to carry the maker's taste, the way a room built by one person feels like that person even before you're told whose it is. That is the only editorial thread running under what follows. Everything else is just the build, stage by stage.

**Contents**

1. [The eye before the hand](#1-the-eye-before-the-hand) — *20–22 June*
2. [The honest gold](#2-the-honest-gold) — *the data*
3. [The room it gets mended in](#3-the-room-it-gets-mended-in) — *2 July*
4. [One unbroken breath](#4-one-unbroken-breath) — *3–4 July*
5. [The register calls](#5-the-register-calls) — *the tells*
6. [The hall at scale](#6-the-hall-at-scale) — *5 July*
7. [What a visit earns](#7-what-a-visit-earns) — *6 July*
8. [What stands now](#8-what-stands-now) — *shipped*

---

## 1. The eye before the hand
*20–22 June · before a line of code*

Most builds start with the data or the feature and add a look at the end. This one started with the look. Before the repository existed, the first files on disk were three images — a network of light, an obsidian texture, a signature — dated 20 June. The palette of the whole project was fixed as an *image* first; everything after had to earn its place against it, rather than the reverse.

A day later, the first shard of content was written. By the 22nd there was a rough, walkable *museum* — two relics on a plinth in a dark room — built specifically to be thrown away: a way to find the *feeling* of the space by standing inside a draft of it instead of arguing about it on paper. That instinct — learn the room by walking a cheap version — is the first tell, and it recurs at every stage.

---

## 2. The honest gold
*the corpus · the intellectual spine*

The thesis is one sentence: every religious and mythic tradition on Earth is a shard of one shattered mirror, and the gold seams that rejoin them are the real convergences. The easy version of that idea is a lie — perennialism, *it's all secretly the same thing* — and the entire data design exists to refuse it.

Every connection between traditions carries a **tier**: a graded confession of how true it is, and the gold is literally colored by the confession.

| Tier | Gold | What it means |
|---|---|---|
| 1 · Cognate | brightest | Proven common descent by language or history. Rare; almost never across unrelated families. |
| 2 · Attested | warm | A documented historical link, borrowing, or syncretism. |
| 3 · Analogous | faint | A structural parallel, no proven descent. The honest default — most seams are this. |
| 4 · Speculative | grey-gold | An interpretive reach — allowed, but flagged as one. |
| forgery | fool's | A fabrication. Its seam points home to the real thing it counterfeited. |

The rule every research pass followed was written into the spec in plain terms — *over-claiming a connection is the only unforgivable error; the tiering is the project's immune system against lazy perennialism.* Alongside it, every figure carries a **facet**: the one thing about it that cannot be folded into any other tradition. Convergence proves it was once one mirror; the facets prove you need every last shard to see the whole face. The governing sentence, and the reason the finished thing has weight rather than glow:

> **Honest faint gold beats fake bright gold.**

The corpus was forged one shard at a time by a fan-out of research agents (Google's Gemini, driven through the *aider* tool), each handed a single tradition and the same exacting spec. It began at 219 traditions; the rest was poured in three audited waves.

| Traditions | Figures | Seams | Tier-1 cognates |
|---:|---:|---:|---:|
| **288** | **4,106** | **7,479** | **1,032** |

---

## 3. The room it gets mended in
*2 July · the repository is born*

The git history opens on 2 July with the interior — the Hall of Ages. The brief that governed it drew one hard line: **a relic, a reliquary — not a console.** More museum than app; the awe is in the restraint, and what you don't show matters as much as what you do. Inside: a shattered mirror lying at the exact center of the floor, a plinth bearing two relics — a scroll laying the traditions along a ribbon of time, and an astrolabe wheeling them together as one instrument — and a dome overhead with a real oculus open to a sky. Palette and type were inherited from those first images down to the hex.

> The mirror shattered. Your job is to build the room it gets mended in.
> — *the interior brief, closing line*

Within a day you could walk it, and the opening animation that assembles the mirror was already skippable — because a thing you'll revisit has to respect the second visit.

---

## 4. One unbroken breath
*3–4 July · the exterior, and the seam*

With the interior standing, the next document was the first one handed to Fable to build: the world *outside* — a temple on a sea-cliff — and the flight that carries the visitor across the threshold into the interior. The hard part was never the temple; it was the **seam**. The brief was blunt about it: *make the crossing feel like one unbroken breath, not a cut.*

So the daylight has to bleed into the dark mid-crossing — sky color, fog density, and the lighting all crossfading on one shared value, so that the automatic fly-in and the manual skip button land in *exactly* the same state. That state was pinned to the decimal: floor height, wall radius, the final camera pose all written out in full, so that when the camera threads the doorway the temple's interior *is* the room, at the right scale, with no visible pop.

Revision one, the next day, reads like a note to a film editor rather than a programmer — *a longer breath, a free orbit, a sealed crossing, a still floor* — and the commit beside it is the purest specimen of the whole ethic:

> The crag closes under the pavement: a footing collar seals the rim seam.
> — *commit `c731f64` · 4 July*

No bug report demanded that. Somewhere the ground and the temple's floor met at a rim that almost no one would ever look at directly. It was closed because it was *there* — which is what "not glossing the experienced layer" means in practice: the standard holds even where nobody is grading.

---

## 5. The register calls
*the decisions no default makes*

The corpus carries dates: when each tradition emerged, flourished, faded. A machine will happily assign a peak year to *everything*, because the schema has a slot for it. But some traditions aren't history — they are living — and stamping them with a "peak" quietly implies the flourishing is over. So three of the oldest continuous cultures on Earth were deliberately left open at the present, against the grain of the data model:

> dates: aboriginal / sami / san carry NO peak — deliberately (a register call).
> — *commit `f583a4a` · 4 July*

That is a moral choice wearing the costume of a data choice, and it is exactly the kind of decision that survives from a person's memory into the build. The same day, 114 dates were corrected against verification rather than guessed, and the workshop's own uncertainties were kept out of the visitor's sight — a reliquary doesn't show you its scaffolding. None of these were the simple win. Each took the longer, truer road, because nothing was forcing the shorter one.

---

## 6. The hall at scale
*5 July · the day the corpus tripled*

The fifth of July did the most work. The data went through three waves in a row: 69 new traditions took the count from 219 to 288; a rebalance gave every figure exactly one canonical home; and a final wave forged 2,028 more figures across all 288 traditions, with 186 same-entity clusters drawn as new seams. The hall that had been tuned for 1,736 figures now had to hold 4,106, so it was rebuilt at scale — the data split so a light core boots the room instantly while each tradition's prose streams in only when reached.

Bronze doors went on the temple. The commit that records the fix for them is a small comedy about who the work is really for:

> the doors open BEFORE the visitor arrives (Joe flew through bronze).
> — *commit `008f968` · 5 July*

The maker walked his own build, flew straight through a closed door, and the fix shipped in the same breath as the discovery. That same day also unclipped a single clipped letter — the tail of a descender, caught by a hair, fixed and given its own line in the log — and made the whole thing usable under a thumb on a phone. None of it is glamorous. All of it is the difference.

---

## 7. What a visit earns
*6 July · the finishing craft*

The finishing pass is the part most builds skip, and it's where the fingerprint shows most. The Hall learned to remember its visitor — the figures you've read, the ones you've marked, and a breadcrumb trail back through the names you followed, all kept locally so they survive the tab closing. A systems rail lists every one of the traditions by name. And when the hardware simply can't render — an old phone, a locked-down browser — the glass says *why* rather than failing to a silent black:

> when the glass stays dark, say why — WebGL fallback + Safari frost.
> — *commit `953e0a2` · 6 July*

That last one is invisible to everyone whose machine works. It exists entirely for the person whose machine doesn't — which is the whole disposition in one line.

A note on the log itself. A commit message is normally the most disposable text a developer writes. Across this whole history, not one of them reads "fix bug," "update," or "wip" — the log is where the build keeps its diary, which is another way of saying the care doesn't switch off when the visitor stops looking:

```
f583a4a  dates: aboriginal/sami/san carry NO peak — deliberately (Joe's register call)
c731f64  The crag closes under the pavement: a footing collar seals the rim seam
5bdb87b  no letter left behind: the wall title and the splash descender unclipped
a37c845  the plinth becomes one stone: the shaft rises to meet its cap
1b50757  what a visit earns, kept: stars, read-marks, a trail that survives
ea5f208  Begin, then Enter: the tholos earns a long look — and the hall states its name
```

---

## 8. What stands now
*the shipped site*

It is live, self-contained, and ships as flat files — no CDN, no external calls, the whole thing carried in the download. Its own one-line description is the thesis in miniature:

> A kintsugi of the world's pantheons: 288 traditions, 4,106 figures, 7,479 evidenced connections — walked as a temple. The gold is earned; dark cracks are honest absences.
> — *the shipped page description*

Under it: a compact core that boots the room, and several megabytes of prose in 288 chunks that stream in only as you reach for them. You arrive on the cliff at golden hour, cross the bronze into the dark on one unbroken breath, and the plinth rises from the bare floor to meet you. What was two relics in a throwaway museum on 22 June is now a temple you can lose an afternoon inside.

| Span | Commits | Traditions | Dependencies |
|:--:|:--:|:--:|:--:|
| 20 Jun → 10 Jul | 65 | 288 | none — flat files |

---

## Coda

Back to the method note, now with the build behind it. The reason this doesn't look generic is that it wasn't assembled from the average of a thousand similar sites and handed back. It was made in the space between two processes, one of which holds a lasting memory of the other's taste — which honesty to keep, which crack to leave dark, and the fact that there was never a clock. These are labors of love, and love is patient with the parts no one will grade.

The build's own governing rule says it best, and it is a rule about truth rather than beauty:

> **The gold is earned; the dark cracks are honest absences.**

A mirror, mended with honest gold — which, made this way, happens to reflect the person who mended it.

---

## Appendix · The Fable handoff, verbatim

*The document below is the actual build spec handed to Fable 5 on 3 July 2026 — the one referenced in section 4 ("One unbroken breath"). It is reproduced here word for word, exactly as it was written and handed over: it commissions the world outside the Hall — the tholos on the sea-cliff — and the flight that carries the visitor across the threshold into the interior, which already existed. Nothing in it has been changed.*

---

# The Mended Mirror — Exterior & Entry Sequence

**A build spec for Fable 5.** Build the world *outside* the Hall of Ages — a Tholos on a
sea-cliff — and the cinematic fly-in that carries the visitor across the threshold, into
the interior, and hands them the controls. The interior already exists and must not be
rebuilt; your job is the exterior, the transition, and the seam between them.

---

## 0. The one-paragraph vision

The visitor opens on a **Greek tholos** (a round, colonnaded temple) standing on a **cliff
above the ocean**, in low golden light. They press *begin*. The camera **flies in** — down
toward the stylobate, up the steps, and **through the doorway between the columns**. The
crossing of that threshold is the hinge of the whole piece: the daylit mortal world gives
way, in one continuous move, to the dark interior void where the one mirror lies shattered
into every tradition. Inside, the camera pulls to the center; the **plinth rises from the
bare floor** bearing its two relics; the light settles; and control is handed to the
visitor. From that instant the existing Hall takes over unchanged.

The exterior is the world; the interior is the cosmos. Crossing the threshold *is* the
subject. Make the crossing feel like one unbroken breath, not a cut.

---

## 1. What already exists (do not rebuild)

The interior is a working three.js scene — plain browser globals, IIFE modules on
`window.HALL`, **no build step**, served as static files (GitHub Pages). three.js is an
older revision (uses `.encoding = THREE.sRGBEncoding`, `renderer.outputEncoding`), loaded
from `vendor/three.min.js` with `vendor/GLTFLoader.js`. Everything is **self-contained: no
CDN, no external fetches** (CSP-clean, and it must stay deployable as flat files).

**Module load order (index.html):** `three.min.js` → `GLTFLoader.js` → `data/mirror-data.js`
→ `data/mirror-dossiers.js` → `hall-data` → `hall-scene` → `hall-mater` → `hall-figures`
→ `hall-scroll` → `hall-rotunda` → `hall-room` → `hall-threshold` → `hall-ui` → `hall-main`.

**The build/boot (`hall-main.js` → `HALL.start()`):** an async sequence builds each layer,
then `H.room.setInstant("lobby")`, defines the stations/keys/animation loop, and wires the
**DOM gate** (`#gate` overlay with a `#gate-enter` button reading "enter the room"). Clicking
the gate sets an arrival camera pose and flies to the lobby.

**Key objects and hooks you will attach to (all live on the `H` handle, `window.H`):**

| Hook | What it is |
|---|---|
| `H.scene`, `H.camera`, `H.renderer` | the three.js essentials. Camera: `PerspectiveCamera(58°, …, near 0.1, far 700)` |
| `H.rig` | the custom orbit/pano camera rig. `H.rig.flyTo(pose, durSec, done)` tweens to a pose `{target:Vector3, radius, phi, theta}`. `H.rig.pano = {eye}` switches to first-person. `H.rig.locked` during flights. |
| `H.tween(dur, fn(k), ease, done)` | the global tween engine; `H.stepTweens(dt)` runs in the loop. Use this for the fly-in and the plinth rise so everything shares one clock. |
| `H.room` | the interior state machine. `H.room.setInstant("lobby"\|"holo")`, `execute()`, `powerDown()`, `showInstrument(bool)`, and `H.room.LID_Y` (= 0.46). |
| `H.threshold` | the plinth + two relics group (`H.threshold.group`), and `H.threshold.tick(dt)`. **You will add `H.threshold.rise(dur)` here.** |
| `H.goStation(name)` | hands control to the interior: `"room"`, `"instrument"`, `"scroll"`. |
| `H.ui.hint(html, sticky)` | the bottom-of-screen hint line. |

### Scale & coordinate anchors (these are the contract — match them exactly)

- **Origin (0,0,0)** is the dead center of the interior, on the `y=0` plane (the shattered
  mirror lies at `y=0`; the pool/heart is at the center).
- **Interior floor** (the lobby "lid") sits at **`y = LID_Y = 0.46`**.
- **Interior wall** is a cylinder of radius **`WALL_R ≈ 31.3`** (`= rotunda RAD − 0.22`,
  where `RAD = H.mater.RIM_OUT + 1.8 ≈ 31.5`). Wall height **`WALL_H ≈ 31.2`**.
- **Dome:** a shallow cap above the wall with a real **oculus** (`OC_R = 6.5`) open to the
  sky, and a warm light-shaft falling through it onto the center.
- **Standing eye height** (scroll view) = **`(0, 1.7, 0)`**.
- **Lobby settle pose** — the fly-in must end here:
  `POSES.room = { target:(0, 1.1, 0), radius: 8.5, phi: 1.28, theta: 0.35 }`.
- **Interior environment (the END state):** `scene.background = obsidian2 (0x06070b)`,
  `scene.fog = FogExp2(0x06070b, 0.0052)`, a warm `SpotLight` shaft from above through the
  oculus, plus dim cool ambient/hemi fills. A field of far stars sits at radius ~380–540.

**The tholos must be sized and placed so its interior cella *is* the existing rotunda:**
inner colonnade radius just outside `WALL_R`, floor at `y = LID_Y`, entrance on a chosen
bearing. When the camera crosses the door it should already be looking into the rotunda at
the right scale — no jump.

---

## 2. What to build — the Tholos and its world

A round peristyle temple on a promontory. Keep it **cheap enough for phones** (the interior
already caps pixel ratio and targets mobile) and **fully procedural / self-contained** —
or vendored **GLB** assets with procedural fallbacks, mirroring the existing astrolabe-GLB
hook pattern in `hall-threshold.js`.

> **Asset pipeline — Meshy.ai is available (~975 credits).** Use it to generate 3D pieces
> (the tholos, a single column, bronze doors, cliff rocks, props) as **GLB**, then vendor the
> result into `assets/` and load it through the existing **GLTFLoader-with-procedural-fallback**
> hook (see `hall-threshold.js`'s `assets/astrolabe.glb` mount). This keeps *runtime* fully
> self-contained — the GLB is a **local file**, no external calls at load, still deployable as
> flat files. **Budget the credits deliberately** (each text-/image-to-3D + texture/refine run
> costs several; ~975 total): generate the few highest-leverage pieces — **one column you can
> `InstancedMesh` ×16–20**, the entablature/roof, the doors — not every object. **Decimate and
> optimize every GLB before committing** (geometry weight *is* download weight; the repo is
> kept lean on purpose — draco/meshopt or a decimate pass, target well under a few MB each).
> Every Meshy asset must keep a **procedural fallback** so a missing/oversized file never
> bricks the scene.

**The temple (a tholos):**
- A ring of columns (**recommend an `InstancedMesh`** — one column geometry, ~16–20
  instances) on a **stepped stylobate** (2–3 concentric rings of steps). Entablature ring
  (architrave + simple frieze) over the columns; a low **dome or shallow conical roof**
  echoing the interior dome. An **oculus** in that roof aligned with the interior oculus
  (so the shaft of sky is continuous — see §5 thematic note).
- **One entrance:** a wider inter-column gap, or a framed doorway with a lintel and
  (optional) open **bronze doors**. This is the portal the camera threads. Put it on a
  clean bearing — **recommend the `−Z` axis** so the establishing camera looks along `+Z`
  toward it, and cut the matching doorway gap in the interior wall on the same bearing.
- **Material:** weathered marble / travertine — warm off-white, non-metallic, with the same
  procedural stone approach now used on the interior floor & plinth (`HALL.surface({…})` in
  `hall-scene.js` — reuse it; that's your texture toolkit, zero asset weight). Bronze for
  the doors/accents, tying to the interior's gold register.

**The site:**
- **Cliff / promontory:** a simple displaced ground plane or a low-poly rock mass the temple
  stands on, dropping away to the sea. It only needs to read from the establishing and
  approach beats.
- **Ocean:** a large plane with a **cheap animated water shader** (scrolling normal or a few
  summed sine/gerstner waves in the vertex shader + a fresnel-ish sky reflection tint) — **not**
  a heavy FFT ocean. Horizon far out.
- **Sky:** a procedural gradient dome or hemisphere (warm horizon → deep zenith), a soft sun
  disk / god-ray hint in the golden-hour direction. No HDRI files.
- **Light:** one warm **directional "sun"** low on the horizon (golden hour) + sky/hemi fill.
  This is the daylight START state that cross-fades to the interior's shaft-lit void.

Everything exterior lives in one group (e.g. `H.exterior.group`) that can be **faded and then
`visible=false`'d** once the visitor is inside, so it costs nothing during navigation.

---

## 3. The entry choreography (beat sheet)

One continuous, skippable move. Suggested ~10–12s total; tune freely. Drive it with
`H.tween`/`H.rig.flyTo` so it shares the loop clock. Easing: `easeInOut` for the big moves;
the threshold cross should feel like a smooth glide, never a jump-cut.

| # | Beat | ~dur | Camera / action |
|---|---|---|---|
| 0 | **Establish** | 1.5s | Wide, high, ~100–140 units out along `+Z`, temple on the cliff, ocean & sky behind, slow drift. Title / *begin* overlay. |
| 1 | **Approach** | 3.0s | Push in toward the entrance, descending toward the stylobate steps; the columns grow and part around the doorway. |
| 2 | **Threshold cross** | 2.0s | Dolly **through the doorway** between the columns (thread the gap — never clip a column). **Begin the environment cross-fade mid-cross** (daylight → void; §4). A subtle FOV widen→settle sells the pull-in. |
| 3 | **Interior pull** | 2.0s | Continue into the rotunda, rising toward the center; the exterior group finishes fading out behind you; the interior wall/dome/stars are now the world. |
| 4 | **Plinth rise** | 2.0s | Floor is **bare**; the plinth **rises** from center (`H.threshold.rise`), relics settle onto it, the warm case-light blooms. |
| 5 | **Settle & hand-off** | 1.5s | Ease to `POSES.room`; `H.room.setInstant("lobby")` is already true; show the hint; enable navigation. Done. |

**Skip:** a persistent *skip* affordance (button + Esc) that jumps straight to the end
state at any point. Repeat visitors and accessibility need this. The end state is exactly
what the existing **shot-mode `?shot=room`** already produces — reuse that path so skip and
the natural ending converge on one code path.

---

## 4. The seam — how the two worlds connect (integration contract)

This is the load-bearing part. The fly-in **must end in precisely the state the interior
expects**, so the existing conductor takes over with zero special-casing.

**End-state the sequence must produce (all of it):**
1. `H.room.setInstant("lobby")` (interior in lobby state — instrument/wall hidden).
2. `H.rig` at `POSES.room`, `H.rig.locked = false`, `station = "room"`.
3. `#gate` overlay hidden; exterior group faded and `visible=false`.
4. Plinth **risen** and relics present; `H.ui.hint(HINTS.room)` shown.
5. The animation loop already running (it is, from `HALL.start`).

**Environment cross-fade (day → void).** The interior's dark `background` + `FogExp2` and the
exterior's sky/sun are mutually exclusive looks. Manage a single **environment state** you can
tween across the threshold cross (beat 2→3):
- `scene.background`: lerp exterior sky color → `obsidian2 (0x06070b)`.
- `scene.fog`: raise `FogExp2.density` from ~0 (clear day) to `0.0052` (interior). Optionally
  lerp fog color too.
- Lights: fade the exterior **sun/sky** down while the interior **shaft + fills** come up.
- Expose this as a small helper (e.g. in `hall-scene.js`: `H.env.toInterior(k)` where
  `k:0→1` blends exterior→interior) so both the fly-in and the skip path call the same thing.

**The doorway.** Cut a gap in the **interior wall** (`hall-room.js` `roomwall` / the rotunda)
on the entrance bearing so the camera path passes through an actual opening, and the temple's
door frames it. Align exterior entrance bearing == interior wall gap bearing (recommend `−Z`).

**The plinth rise.** In `hall-threshold.js`: start the plinth group **sunk and hidden**
(below `LID_Y`, opacity 0), and add `H.threshold.rise(dur)` that tweens it up to rest and
fades the relics/case-light in — the inverse of the existing `thresholdFade(k, sink)` sink
that already runs on `H.room.execute()`. On the **skip** path, place it risen instantly.

**Scale continuity.** Temple interior floor at `y = LID_Y`, centered at origin, inner radius
just outside `WALL_R ≈ 31.3`. Get this right and the crossing has no visible scale pop.

**Shot-mode & determinism.** Keep `?shot=room|instrument|scroll` booting **straight to the
interior** (no fly-in) — the headless screenshot harness (`tools/snap.py`) and deep links
depend on it. Add e.g. `?intro=0` (or reuse skip) to bypass the fly-in explicitly.

---

## 5. Mood & thematic tie

- **Golden hour** outside motivates the **warm shaft** inside — read the interior shaft as
  the last of that daylight following the visitor in through the oculus. If feasible, let the
  **same sky** you flew under be what's visible through the interior **oculus** once inside
  (continuity of the one sky). This is the strongest single tie between the worlds.
- The cliff and ocean are the **edge of the known**; the tholos is the last built thing before
  the drop; crossing into it is crossing from world into cosmos — the Campbellian threshold,
  which is literally the subject of the interior (one mirror, shattered into all faiths).
- Register to match: reverent, still, cinematic; marble & bronze outside rhyming with the
  stone & gold inside. Restraint over spectacle — the interior's whole aesthetic is "one shaft
  of light in a patient dark." The exterior should feel like the same author's daylight.
- Reference silhouettes: the **Tholos of Delphi** / **Temple of Vesta** (round peristyle
  temples); a slow establishing aerial that descends and enters.

---

## 6. Files & conventions

**Create:**
- `js/hall/hall-exterior.js` — `HALL.buildExterior(H)` → the tholos, cliff, ocean, sky, sun
  as `H.exterior` (with `group`, a `tick(dt, elapsed)` for the water/sun, and a `fade(k)`).
  Reuse `HALL.surface(...)` for stone. Follow the existing IIFE-on-`window.HALL` pattern.
- `js/hall/hall-approach.js` **or** a section of `hall-main.js` — the fly-in sequence
  (`H.approach.play(onDone)` + `skip()`), driving `H.rig`/`H.tween` and `H.env`, then calling
  into the interior end-state (§4).

**Modify:**
- `hall-scene.js` — add the tweenable **environment state** (`H.env.toInterior(k)`); it owns
  `scene.background`, `scene.fog`, and the day-vs-shaft light balance.
- `hall-room.js` — a **doorway gap** in the interior wall on the entrance bearing.
- `hall-threshold.js` — plinth starts sunk/hidden; add `H.threshold.rise(dur)`.
- `hall-main.js` — replace the gate handler with: build exterior, render the establishing
  shot behind a title, *begin* → `H.approach.play` → hand-off. Keep `?shot=` and add a
  fly-in bypass (`?intro=0`) + a skip button. Ensure the loop `tick`s `H.exterior` while it
  is visible.
- `index.html` — new `<script>` tags in load order (exterior before main); adapt the
  `#gate` overlay into a title card over the live exterior.

**Constraints (hard):**
- **Self-contained** — no CDN, no external images/HDRIs/fonts, no runtime API calls. Assets
  are **procedural or vendored GLB** (Meshy.ai-generated is fine — it's a design-time tool;
  the output is a local file) via the GLTFLoader-with-fallback pattern. Decimate GLBs; keep a
  fallback. It must still deploy as flat files to Pages.
- **Mobile-cheap** — instanced columns, a light water shader, a gradient sky; respect the
  existing pixel-ratio cap; no per-frame allocations in `tick`.
- **Non-destructive** — do not alter the interior's data, the ceremony, the stations, the
  walk/vertical controls, or the reliquary. The interior after hand-off must behave exactly
  as it does today.
- **Degrade gracefully** — if the exterior fails to build, fall through to the current
  "enter the room" gate → lobby, so the site is never bricked by the intro.
- **Verify** with `tools/snap.py` (CDP screenshot harness; `?shot=room` etc.) and the local
  server on `:8013`. `?shot=` paths must stay fly-in-free.

---

## 7. Open decisions for Joe (resolve before or during the build)

1. **Time of day:** golden-hour sunset *(recommended — ties to the warm interior)* / bright
   midday / cold pre-dawn.
2. **Sea state:** calm & glassy (reverent) / a living swell / dramatic surf.
3. **Column order:** Doric (severe) / Ionic (graceful) / Corinthian (ornate).
4. **The portal:** open peristyle gap / a framed doorway / bronze doors that swing open as
   you approach.
5. **Sky through the oculus:** make the interior oculus show the *same* exterior sky
   (strong continuity) — yes/no.
6. **Repeat visits:** always play the fly-in / remember and auto-skip after the first.
7. **Audio** (surf & wind outside → a low hum / silence inside) — in scope, or later?

---

*Interior reference: `js/hall/` (`hall-scene`, `hall-room`, `hall-threshold`, `hall-rotunda`,
`hall-main`), served at `http://127.0.0.1:8013/`, deployed at
`https://qav2.github.io/the-mended-mirror/`. This spec is the contract for the seam; the
interior end-state in §4 is non-negotiable, everything else is yours to author.*

---

*The Mended Mirror · walk it here: <https://qav2.github.io/the-mended-mirror/>*
