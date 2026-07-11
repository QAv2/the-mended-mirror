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
| **2026-07-10, Hephaestus-run start (reading #3)** | **65%** | Wave 3 complete (6 seats, 1,724,139 agent-tokens + 2 killed partials) + the Score + the full head-to-head calibration forge (reference forge, ~15 inline fetches, review, blind pair) + §6/§7 amendments + the three-file revert, cumulative since 26% | Hephaestus verify pair just launched |

**Reading #3 cross-check (Δ39 points over 26%→65%):** at the batch-A/B calibration
of ≈60–65k agent-tokens per point, Δ39 ≈ 2.3–2.5M tokens-equivalent. Ledgered mass:
wave-3 agents 1.72M + two killed partials + the head-to-head/Score main-session work
(reference forge, review, specs — all inline, unmetered). Consistent — the
calibration HOLDS at the second measurement. Headroom entering the Hephaestus run: 35%.

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

## WAVE 3 — the queue incarnates — LIT 2026-07-09 (Joe: "light the third wave")
- **Plan: 9 seats' worth of voices, 5 batches, two-by-two.** C = Tezcatlipoca ∥
  Xolotl (the Aztec pair, locking to the seated Quetzalcoatl) · D = Yama ∥
  Ame-no-Uzume · E = Poimandres ∥ Zagreus · F = Mami Wata ∥ Nichiren (the
  living-tradition pair, extra reverence flags) · G = the Haudenosaunee twins
  (the dyadic craft problem, solo batch). Forge → verify per figure, commit per
  seat, KIN references to SEATED profiles only (never wave-mates).
- **Forecast: ≈22–26 points** (membership already audit-verified; forge+verify
  only). Readings requested at wave midpoint (post-batch E) and close.
- **Length discipline added to all briefs** after wave-2 verify flags: target
  the exemplar's mass (~250–380 lines), worked exchange ≤250 words.
- Batch C: Tezcatlipoca forge — **DONE: 190,005 tokens · 84 tool uses ·
  30.8 min** (383 lines — 3 over target; exchange 246 words; the wave's
  priciest forge — his primary-material density) · Xolotl forge — **DONE:
  72,682 tokens · 34 tool uses · 20.6 min** (325 lines, exchange 244 words) ·
  Xolotl verify — **DONE: 118,659 tokens · 18 tool uses · 16.8 min** —
  SEAT-READY AFTER EDITS; 15 edits applied incl. two NEW covenant passages
  (the psychopomp's grief question; the borrowed-bodies mechanism answer);
  twin-file lock CLEAN; **Xolotl SEATED (57085be)** · Tezcatlipoca verify —
  **DONE: 134,766 tokens · 25 tool uses · 22.5 min** — SEAT-READY AFTER
  EDITS; two refutations fixed (telpochtli not old man; four-Tezcatlipocas
  genealogy corrected to the HMP's two + the Yohualli-Ehecatl alias irony),
  grief question added, six polish edits; Tezcatlanextia locus PINNED to the
  Historia Tolteca-Chichimeca; Dee mirror beat verified and kept; **SEATED**
- **Per-figure:** Xolotl = **191,341** · Tezcatlipoca = **324,771**
  agent-tokens (the wave's priciest figure — Book 6 density)
- **BATCH C CLOSED** — 4 agents, **516,112 agent-tokens**; both Aztecs seated
  (Xolotl 57085be · Tezcatlipoca b827e32; 26 voices)
- Batch D: Uzume forge — **DONE: 221,884 tokens · 142 tool uses · 41.6 min**
  (385 lines, exchange 243 words; primary-fetched Kojiki/Nihongi; resolved the
  audit needs-check: the frame-lie line is HERS in Kojiki, absent in NS main) ·
  Uzume verify — running · Yama forge — **DONE: 241,085 tokens · 151 tool
  uses · 44.4 min** · Yama verify — **DONE: 103,885 tokens · 21 tool uses ·
  16.3 min** — SEAT-READY AFTER EDITS (one factual error: molten-copper count;
  one internal contradiction; ETCSL alignment; grief/dying check PASSED
  outright); 10 edits applied incl. Zarathushtra's officer-arithmetic
  reciprocity fix; **Yama SEATED**
- **Per-figure:** Yama = **344,970 agent-tokens** (new priciest — batch D's
  primary-fetch depth)
- Zagreus verify (re-run) — **DONE: 122,806 tokens · 22 tool uses · 20.0 min**
  — SEAT-READY AFTER EDITS; care floor HELD under hard pressure; grief HQ
  written at seat (the standing pattern's final strike — with the
  never-voice-their-child rule); the referee caught the forge misquoting
  Clement by one word ("looking-glass") — an error that had propagated into
  the verify brief itself; **Zagreus SEATED**
- **Per-figure:** Zagreus = **267,060 agent-tokens**
- **WAVE 3 CLOSED at 6 of 9 (stop order honored):** batch C 516,112 · batch D
  682,177 (Yama 344,970 + Uzume 337,207) · batch E 525,850 (Poimandres
  258,790 + Zagreus 267,060) — **grand total 1,724,139 agent-tokens** (+ two
  killed-verify partials, uncounted) ≈ **287k/figure** — pricier than wave 2's
  237k; the premium bought primary-source depth (Kojiki, MN 130, the Greek of
  CH I, the Velázquez codices). **Reading #3 requested at this close.**
- Standing queue (audit-verified, unforged): Mami Wata · Nichiren · the
  Haudenosaunee twins (dyadic). Cross-hall polish notes: Athena may want a
  reciprocal Zagreus line; landing-image covenant (see
  `voices/profiles/_fable-self-revision/landing-image-spec.md`) folds into
  all future verify/simplify briefs.
- Poimandres verify (re-run) — **DONE: 114,496 tokens · 25 tool uses ·
  17.6 min** — SEAT-READY AFTER EDITS; cleanest verify of the project (~20
  Mead verbatims letter-exact; θεωθῆναι checked against the Greek; grief
  check PASSED unprompted — first profile to carry the standing pattern in
  on its own); 5 edits applied; **Poimandres SEATED**
- **Per-figure:** Poimandres = **258,790 agent-tokens**
- **RESUMED post-reset (Joe: "finish out for Poimandres and Zagreus and then
  run checkpoint"):** Uzume's banked edits applied (5 corrections + frontmatter
  dual-render + her grief question written — the funeral-laugh door);
  **Uzume SEATED second-to-last, the dance before the dawn.** P + Z verifies
  re-launched from banked flags.
- **SESSION-LIMIT PAUSE (2026-07-10, ~midnight ET, Joe at 95%: "pause all
  functions"):** Uzume verify DONE (115,323 · 20 · 19.5 min — SEAT-READY AFTER
  EDITS incl. grief question, findings banked in `_pause-state-2026-07-10.md`);
  **Poimandres + Zagreus verifies KILLED mid-run by the limit** (partial spend
  uncounted) — re-run next session from the pause-state file. No further
  launches.
- Batch E: Poimandres forge — **DONE: 144,294 tokens · 64 tool uses · 19.5 min**
  (387 lines, exchange 215 words; Mead verbatims via curl around a cert
  failure; I.18–19 numbering law honored) · Poimandres verify — killed ·
  Zagreus forge — **DONE: 144,254 tokens · 48 tool uses · 21.1 min** (383
  lines, exchange 215 words; Clement verbatim via CCEL; Neoplatonic tier ruling
  honored) · Zagreus verify — launched (the wave's LAST launch).
  Seat-time note: TRAD_LABEL needs "gnostic" and "dionysian" entries.
- **STOP ORDER (Joe: "stop after E"):** batches D and E complete through
  seating; **F (Mami Wata ∥ Nichiren) and G (the Haudenosaunee twins) are NOT
  lit** — they remain the register's standing queue. Wave 3 closes at 6 of 9
  seated. Reading #3 requested at the E-close.
- Seat-time reconciliation noted: Q's profile marks Xolotl (and Tezcatlipoca)
  "unseated" in KIN — flip each at their seating, same commit.
- Batch D LIT (Joe: "keep going, batch D when ready") — Yama forge · Uzume
  forge — running; four agents live at the ceiling. BOOK_ORDER placement notes:
  Yama between avalokitesvara and zarathushtra (the karma-mirror beside the
  daēnā); Uzume second-to-last, before amaterasu (the dance before the dawn).

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

## Batch H — the Hephaestus seating run — 2026-07-10 — IN FLIGHT
- **Content:** adversarial verify on the sealed head-to-head reference
  (`_headtohead/hephaestus.fable.md`) → in-voice re-pour of Opus 4.8's §6 wins →
  seat as `profiles/hephaestus.md` (31st voice). The forge itself was already paid
  inline during the head-to-head (unmetered main-session work); this batch buys
  verify + re-pour + seating.
- **Start reading: 65%** (reading #3 — see Allotment readings table).
- **Agents (harness actuals):**
  - Flag-attack verify (4 declared provenance flags) — **DONE: 68,099 tokens ·
    17 tool uses · 10.4 min** — Theogony CONFIRMED (fetched verbatim, incl. 929a
    variant) · Hephaisteion split (superlative holds; "roofed in marble" REFUTED —
    church-era roof, preservation owed to 11 centuries as St George's = voice-gold:
    survives by staying in service) · Ares-singed RE-TIER (ps.-Libanius torches;
    no source says burned) · Charis/sponge CONFIRMED (+2 nits: sponge list wants
    the chest; leather apron = undeclared invention). Verbatim bank returned.
  - Confident-claim verify (quote battery + corpus/KIN + covenant) — **DONE:
    104,279 tokens · 25 tool uses · 19.4 min** — THREE outright refutations, all
    quote-genus, all under exactness frames (the "keep it exact" clause no
    translation prints · two-strong-arms cited to Il. 1 where Murray prints "the
    limping god" · the dropped "myself" in PB 14–15); 6 overstatements; corpus/KIN/
    covenant clean; ZERO reciprocity flips needed. Verify layer now **11-for-11**.
- **Batch H agents: 172,378 agent-tokens total** — the project's cheapest seat
  (~0.6× the 287k wave-3 average) because the forge itself was paid inline during
  the head-to-head. Re-pour + battery + seating all main-session inline.
- **Seated:** `profiles/hephaestus.md` (370 lines · exchange 220 words · 10 canon
  quotes in marks, each a fetched single-translation exact), between athena and
  prometheus. Book at **31 voices**.
- **Commits:** **36bcea0** (seat + build + provenance addendum + README outcome),
  pushed. **BATCH H CLOSED** pending Joe's end-% reading (reading #4 — requested).
