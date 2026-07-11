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

*The Mended Mirror · walk it here: <https://qav2.github.io/the-mended-mirror/>*
