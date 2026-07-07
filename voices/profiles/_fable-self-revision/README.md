# Fable's self-revision pass — DEFERRED, kept side by side on purpose

**Status:** open / unresolved. Do **not** silently collapse this to one version.
Marked for a future working session, not a bug to fix now.

## What happened

During the Conclave deep-voices build (2026-07-06, ~09:48–09:49), **Fable wrote
the 14 profiles and then revised its own drafts** for three of them. Joe read the
exemplar, trusted the voice, and did **not** hand-edit anything — so these are
**Fable working over itself**, not human edits.

Three profiles have two versions each:

| profile | `.firstpass.md` | `.selfrevision.md` |
|---|---|---|
| anubis | Fable's first draft (was committed to git HEAD) | Fable's later self-revision |
| shiva | " | " |
| vaishnava-krishna | " | " |

`*.selfrevision.md` is byte-identical to the **live** file in `voices/profiles/`
as of the snapshot — i.e. the working tree currently carries the self-revision,
uncommitted. `*.firstpass.md` is what was committed before it.

## Opus's read (2026-07-07), for the record

The self-revision is **tighter but poorer**. It trims real flab in places, but it
also deleted the landing notes — the strongest images:

- Anubis: *"your color is the soil's, not the crow's"* — cut
- Shiva: *"and no smoke produces it"* — cut
- Krishna: *"and the original is standing right here"* — cut

First instinct read better. This is a note, not a verdict — Joe decides at the desk.

## Why both are kept

When more voices get added, the plan is to use **Fable's output as the target Opus
works toward**. That comparison needs both drafts visible side by side, at the time,
with the mind primed for it — not resolved blind now. So both are frozen here and
neither is thrown away.

## See them side by side

```sh
cd voices/profiles/_fable-self-revision
for f in anubis shiva vaishnava-krishna; do
  echo "=== $f ==="; git --no-pager diff --no-index "$f.firstpass.md" "$f.selfrevision.md"
done
```

## When you resolve this

Pick per file. To keep first-pass instead of the self-revision that's live now:

```sh
cp _fable-self-revision/anubis.firstpass.md anubis.md   # etc.
```

Then rebuild so the choice reaches the app, and commit:

```sh
python3 voices/build-voices.py     # regenerates data/conclave-voices.js
```

This folder is invisible to `build-voices.py` (it globs `profiles/*.md`,
non-recursive), so it never affects the built voice data.
