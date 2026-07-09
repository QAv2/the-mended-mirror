---
name: forge-cost-log
description: "Per-batch ledger of the voice-forge: what each batch produced and what it cost in Fable allotment — contingency data in case Fable ever goes API-only."
metadata:
  node_type: ledger
  started: 2026-07-09
---

# FORGE COST LOG — the Mirror Pantheon wave

**Why this exists (Joe, 2026-07-09):** each batch gets logged for content and for
Fable-allotment percentage, so we know what a batch is worth token-wise — per batch
and on running average — in case Fable becomes API-only and the work has to be priced.

**Method / honesty notes:**
- Token figures are **harness-reported actuals**: each agent's completion
  notification carries its true token count. (The original plan — transcript bytes
  ÷ 4 — is retired to fallback-only; actuals beat estimates.)
- Allotment-% readings are **Joe's**, from his usage window, dictated at batch
  boundaries (start → end). The % delta is the ground truth; the byte-estimates are
  the cross-check.
- Concurrency policy history (all Joe's calls, 2026-07-09): strictly serial (first
  Zarathushtra launch only) → two wide (max 2 live) → **two by two (max 4 live),
  current.** Batch A spans the first two regimes.

---

## Batch A — Zarathushtra + Quetzalcoatl — 2026-07-09 — IN FLIGHT
- **Content:** `voices/profiles/zoroastrian-zarathushtra.md` (WRITTEN — 499 lines,
  provenance table + flags returned) + `voices/profiles/aztec-quetzalcoatl.md`
  (forging) — builds + per-figure commits at close
- **Agents (harness-reported actuals):**
  - Zarathushtra forge — **DONE: 124,014 tokens · 36 tool uses · 20.3 min**
  - Quetzalcoatl forge — **DONE: 139,762 tokens · 26 tool uses · 22.6 min**
  - Zarathushtra verify — **DONE: 92,633 tokens · 31 tool uses · 15.6 min** —
    verdict SEAT-READY AFTER EDITS (every canon-tier quote confirmed verbatim);
    9 edits applied inline; **SEATED this commit**
  - Quetzalcoatl verify — running
- **Per-figure so far:** Zarathushtra forge+verify = **216,647 agent-tokens**
  (main-session inline overhead not counted)
- **Lanes:** Zarathushtra launched solo (pre-policy); Quetzalcoatl lane added when
  the two-wide call came in; ≤2 agents live at all times
- **Fable allotment % (Joe's reading):** start ␣␣% → end ␣␣% (Δ ␣␣)
- **Wall clock (batch):** — at close
- **Commits:** — at close
- **Notes:** forge flagged a data write-back item — his `mirror-data.js` record has
  `archetypes: []`; if archetype seatings are ever written back to the data layer,
  the Dualism seat needs the write.

## Batch B — Brigid + Mirror-Pantheon audit runs — 2026-07-09 — IN FLIGHT
- **Content:** `voices/profiles/celtic-brigid.md` + the audit's stage-2 verdict
  tables (folded into `_mirror-pantheon-audit.md` at close)
- **Agents (harness actuals):**
  - Brigid forge — running
  - Brigid verify — queued behind forge
  - Audit run 1 (17 seated first-seed voices, assessed from their own profiles) — running
  - Audit run 2 (T1 corpus batch, 11 candidates from `_pantheon-sweep-shortlist.md`) — launched at Z-seating
  - Audit run 3 (T2 batch + families) — queued for a free slot
- **Fable allotment % (Joe's reading):** start ␣␣% → end ␣␣% (Δ ␣␣)
- **Commits / wall clock:** — at close
- **Notes:** batches now overlap (rolling pipeline under the two-by-two policy);
  ledger keeps them as accounting units.

## Running averages
- — after batch A closes (per-figure est. tokens, per-batch Δ%, projected cost of a
  full 4-figure wave).
