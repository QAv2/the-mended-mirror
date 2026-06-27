# The Mended Mirror — operating manual for the agent

You are helping Joe forge **shards** for *The Mended Mirror*: a project that treats the
world's religious & mythic traditions as one shattered mirror, and the **gold seams** that
rejoin them as the real convergences (the kintsugi metaphor). Each shard = one tradition,
written as a JSON file. This file is your brief. Read it fully before acting.

## The one rule that matters most

**Over-claiming a connection is the only unforgivable error.** A seam's `tier` must be honest:

- `"1"` cognate — proven common descent by language/history. **Almost never** across unrelated families.
- `"2"` attested — a *documented* historical link, borrowing, or syncretism (real contact).
- `"3"` analogous — a structural/functional parallel, no proven descent. **This is the default; most seams are tier 3.**
- `"4"` speculative — an interpretive reach. Allowed, but you MUST flag it in the note ("a loose parallel…").

If unsure between two tiers, **pick the lower one.** Honest faint gold beats fake bright gold.
But honesty cuts **both ways** — do not bury a genuinely *documented* syncretism (e.g. "X was
identified with Y in the Roman world", "X is literally the same god as Y") at tier 3. If the
historical record documents the contact, it is tier 2. Reaching down is as dishonest as reaching up.

When you finish a shard, **report the tier spread** to Joe so he can eyeball it. He is the
honesty check. Never commit a shard until Joe has looked and approved.

## The loop (one shard at a time)

All commands run from this directory (`~/the-mended-mirror/`). `./mend` is the wrapper.

1. **Pick the next shard.** Run `./mend queue` to see what's left in Wave 1, or use the id Joe names.
2. **Get the brief:** `./mend brief <id>` → prints region / date / living / color / anchor motif.
3. **Read the spec:** open `data/_fanout/_SPEC.md` in full. It contains the figure-shape rules,
   the **existing figure inventory** (the only ids you may seam to), and the **joint palette**
   (archetype ids). Do not skim — the inventory and palette are load-bearing.
4. **Read an exemplar:** open the most recent finished shard, e.g. `data/_fanout/isis-cult.json`,
   to match format and quality.
5. **Write `data/_fanout/<id>.json`** following `_SPEC.md` EXACTLY:
   - 7–11 figures. Each has `id` (prefixed with the tradition id), `kind`, `name`, 1–3 `archetypes`
     (joint ids from the palette), a ~30–60w `gloss`, a ~20–40w `facet` (the *divergence* — this is
     half the thesis, never omit it), and real `provenance` (actual sources).
   - **Edges** = the seams. Two kinds: intra-tradition (`yourid` ↔ `yourid`, type `pairs`/`inverts`
     to bind the shard) and **cross-tradition GOLD SEAMS** (your figure ↔ an **existing** figure id
     from the inventory, OR a joint id). Aim for **8–20 gold seams.**
   - **Never invent an id for another tradition.** If the figure you want isn't in the inventory,
     seam to a **joint id** instead (a figure may seam to a joint). Inventing an id means the build
     silently drops that seam.
   - Pick the truthful edge `type`: `cognate` / `syncretic` / `analogous` / `inverts` / `pairs` / `bridge`.
6. **Seed its date:** `./mend date <id>` (writes the timeline entry — a missing one is a hard build failure).
7. **Build & sanity-check:** `./mend build`. It must end with **✓ clean**. If it reports `✗`, the
   usual cause is a seam pointing at an id that doesn't exist — fix the bad `b` id (or repoint it at
   a joint) and rebuild. Do not proceed until clean.
8. **Report to Joe:** figure count, seam count, and the tier spread (e.g. `{2: 5, 3: 14}`). Note any
   tier-4 reaches you flagged. **Stop here and wait for Joe.**
9. **On Joe's approval only:** `git add -A && git commit -m "mirror: add <id> shard"`.

## Gotchas

- The temporal date set by `./mend date` is a rough heuristic flagged "auto-dated; refine later" —
  that's expected; exact dates are fixed later in a corpus-wide audit. Don't worry about precision.
- A wall of tier-3 seams is not automatically "safe" — check whether any are documented contacts
  that deserve tier 2 (see the both-ways rule above).
- Don't write `instantiate` edges for figure→archetype — listing the archetype in a figure's
  `archetypes` array auto-generates those. Only write real seams.
- If a tradition genuinely needs a NEW joint (≥3 traditions would share it), add it to
  `proposedArchetypes` rather than force-fitting an existing one.

## Status check anytime

`./mend status` → how many shards done / remaining by wave. Wave 1 is the current scope.
