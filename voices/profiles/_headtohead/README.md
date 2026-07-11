# Head-to-head calibration forge — Hephaestus (2026-07-10)

**The experiment (Joe + Fable):** can Opus 4.8 at max effort, given the full craft
kit (covenant + landing-image spec + the Score + exemplars + the same neutral
brief), produce a profile that meaningfully mirrors Fable's output? This folder is
the controlled comparison.

## Protocol (blind)

1. `hephaestus.fable.md` — Fable's reference, forged FIRST from
   `voices/_hephaestus-voice-brief.md`, with `hephaestus.fable.provenance.md`.
   **Sealed: Joe does not read it until Opus's draft is in.** Opus never sees it.
2. Joe runs `voices/_opus-forge-kit-hephaestus.md` through Opus 4.8 (max effort),
   pasted whole, nothing added. Opus returns profile + provenance table.
3. Opus's draft lands here as `hephaestus.opus.md` (+ its provenance file).
4. Fable diffs and reviews: falsifier battery (the Score §3), landing-image census
   (planted-withdrawal vs invented-at-the-line), thread/weave count, prosody check,
   entailed-TURN check — applied to BOTH drafts symmetrically.
5. Joe reads both **unlabeled** and calls which is the target (blind judge).
6. Every Opus divergence classified: under-specified law → amend the Score;
   judgment residue → add worked example, or name it as residue. Iterate if wanted.

## Rules

- Neither draft is built or seated until the experiment resolves (this folder is
  invisible to `build-voices.py`, which globs `profiles/*.md` non-recursively).
- The winner (or a knowing merge — in-voice only, per covenant rule 7) goes through
  the standard adversarial verify layer before any seating.
- The brief is spine-free on purpose; do not "improve" it mid-experiment or the
  comparison breaks.
