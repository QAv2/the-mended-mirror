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
| late evening, register ratified | **26%** | Everything through the ratified register (all commits to c0207c0); all lanes closed | nothing — wave complete |

**CALIBRATED from readings #1→#2 (Δ11 points):**
- The Δ11 bought: ≈684k agent-tokens landed after the baseline (the wave's
  1.04M minus the ~356k already spent at reading #1) plus the main session's
  own late work (audit assembly, manifest, renders, edits). → **≈60–65k
  agent-tokens per allotment point**, agents-only; implied total allotment
  ≈ 6–9M tokens-equivalent all-in.
- **The whole recovered wave cost ≈ 11–13 points all-in**: seated figures
  ≈ 2.5–3 points each (≈8 points for three), the full 37-docket audit +
  manifest ≈ 4 points.
- **Third-wave forecast at current practice: ≈ 22–26 points** for the nine
  queued seats' worth of voices (their audit is already paid — membership is
  verified; only forge+verify per figure remains). Running it now would land
  the total near **48–52%**.
- **Headroom after the wave: 74%.**
- The original +5–8% projection undershot by ~half — the audit's assembly and
  the manifest work were the unbudgeted mass. Carried forward as a lesson:
  budget the synthesis, not just the agents.

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
  - Quetzalcoatl verify — **DONE: 154,509 tokens · 42 tool uses · 29.0 min** —
    SEAT-READY AFTER EDITS; reached PRIMARY sources (Velázquez/UNAM codices);
    9 edits applied incl. exchange compression; **SEATED as 901ae40**
- **Per-figure:** Zarathushtra = **216,647** · Quetzalcoatl = **294,271**
  agent-tokens (Q's primary-source dives cost the extra; main-session inline
  overhead not counted)
- **BATCH A CLOSED at 901ae40** — 4 agents, **510,918 agent-tokens** total;
  commits 7e7bd05 (Zarathushtra) + 901ae40 (Quetzalcoatl)
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
  - Brigid verify — **DONE: 88,511 tokens · 20 tool uses · 14.3 min** — verdict
    SEAT-READY AFTER EDITS (CMT/Forester/Carmichael character-exact); 6 edits
    applied; no-unearned-mirror check passed; **SEATED as c0741ca**
- **Per-figure:** Brigid forge+verify = **200,331 agent-tokens**
  - Audit run 1 — **DONE: 107,714 tokens · 32 tool uses · 19.8 min** — 17
    assessed: 7 members (T1 Amaterasu/Odin/Orpheus; T2 Anubis/Isis pending the
    officiant ruling, Yeshua, Krishna), 8 honor-roll, 2 NONE
  - Audit run 2 — **DONE: 89,249 tokens · 26 tool uses · 17.8 min** — 11
    assessed: 8 members (T1 Yama/Tezcatlipoca/Poimandres/Nichiren/Manifestation/
    Insān-al-Kāmil; T2 Zagreus/Mami Wata), 3 honor-roll, 2 NONE, al-Hakim
    declined by reverence
  - NEEDS-CHECK sweep — **DONE: 52,742 tokens · 14 tool uses · 10.0 min** —
    both verdict-relevant facts HELD (Krishna's sahātmānam is in the Sanskrit;
    no Yorubaland dígí for Ọ̀ṣun); Nichiren mirror-bow located (Ongi Kuden ch.
    20, disputed-authorship note required)
- **BATCH B agents complete** — Brigid 200,331 + audit runs 276,586 +
  needs-check 52,742 = **529,659 agent-tokens**; commit c0741ca (Brigid)
  - Audit run 3 — **DONE: 79,623 tokens · 25 tool uses · 14.5 min** — 9 dockets:
    2 members (Xolotl T2; Haudenosaunee twins T2, first dyadic seat), Uzume
    officiant-pending, *Manu-*Yemo conditional on a third ruling
    (reconstruction-as-canon), 6 clean NONEs, Kalunga = tradition-anchor
- **Fable allotment %:** baseline 15% logged mid-flight — see Allotment readings table
- **Commits / wall clock:** — at close
- **Notes:** batches now overlap (rolling pipeline under the two-by-two policy);
  ledger keeps them as accounting units.

## Running averages (2026-07-09, wave complete)
- **Per figure (forge+verify): ≈237k agent-tokens** (Z 217k · Brigid 200k ·
  Q 294k). Q's premium bought primary-codex verification.
- **Audit: 4 agents, 329,328 tokens, 37 dockets ≈ 8.9k/docket** — membership
  auditing is ~25× cheaper per name than voice-forging.
- **Whole recovered wave (3 figures + full audit + sweep): 1,040,577
  agent-tokens** + main-session overhead.
- **Reading #2 requested at batch-A close** — Δ% vs the 15% baseline calibrates
  everything above into allotment terms.
- **Rulings ratified 2026-07-09** ("I'm good with all of your recommendations")
  — register FINAL at 23 seats; no further agent spend this wave.
