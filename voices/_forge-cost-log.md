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

## Allotment readings (Joe's window — ground truth)

| When (2026-07-09) | Reading | Covers | In flight at reading |
|---|---|---|---|
| evening, mid-batch-B ("as of 4 minutes ago") | **15%** | The crashed Fable session + this pickup session, cumulative. (The Opus damage-control session between them drew no Fable.) | Zarathushtra already SEATED (7e7bd05); Brigid forge · audit run 1 · Quetzalcoatl verify · audit run 2 all running |

**Working estimates from reading #1 (rough — recalibrate at every new reading):**
15% bought: 5 seated figures (4 pre-crash + Zarathushtra), the crash's burned
fan-out, recovery + audit overhead, and 4 in-flight partials → ballpark
**~2.5–3% of allotment per figure, all-in, at current practice.** Projected
remainder of this wave (Quetzalcoatl close + Brigid + audit runs 2–3 + manifest):
**≈ +5–8%.** The next reading at batch-A close gives the first clean per-batch
delta; per-figure %-cost firms up from there.

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
- **Fable allotment %:** baseline 15% logged mid-flight — see Allotment readings table
- **Wall clock (batch):** — at close
- **Commits:** Zarathushtra seated in **7e7bd05**
- **Notes:** forge flagged a data write-back item — his `mirror-data.js` record has
  `archetypes: []`; if archetype seatings are ever written back to the data layer,
  the Dualism seat needs the write.

## Batch B — Brigid + Mirror-Pantheon audit runs — 2026-07-09 — IN FLIGHT
- **Content:** `voices/profiles/celtic-brigid.md` + the audit's stage-2 verdict
  tables (folded into `_mirror-pantheon-audit.md` at close)
- **Agents (harness actuals):**
  - Brigid forge — **DONE: 111,820 tokens · 39 tool uses · 19.2 min** — profile
    written (325 lines); AUDIT FINDING reported honestly: no reflexive native
    canon found (triplism and the goddess/saint doubling weighed, not inflated)
  - Brigid verify — launched at forge close
  - Audit run 1 — **DONE: 107,714 tokens · 32 tool uses · 19.8 min** — 17
    assessed: 7 members (T1 Amaterasu/Odin/Orpheus; T2 Anubis/Isis pending the
    officiant ruling, Yeshua, Krishna), 8 honor-roll, 2 NONE
  - Audit run 2 — **DONE: 89,249 tokens · 26 tool uses · 17.8 min** — 11
    assessed: 8 members (T1 Yama/Tezcatlipoca/Poimandres/Nichiren/Manifestation/
    Insān-al-Kāmil; T2 Zagreus/Mami Wata), 3 honor-roll, 2 NONE, al-Hakim
    declined by reverence
  - NEEDS-CHECK sweep (2 verdict-relevant facts + profile-grade verbatims) — launched
  - Audit run 3 (T2 batch + families) — queued for a free slot
- **Fable allotment %:** baseline 15% logged mid-flight — see Allotment readings table
- **Commits / wall clock:** — at close
- **Notes:** batches now overlap (rolling pipeline under the two-by-two policy);
  ledger keeps them as accounting units.

## Running averages
- — after batch A closes (per-figure est. tokens, per-batch Δ%, projected cost of a
  full 4-figure wave).
