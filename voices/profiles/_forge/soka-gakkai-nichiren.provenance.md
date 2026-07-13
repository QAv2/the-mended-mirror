# Provenance — soka-gakkai-nichiren.md (forged 2026-07-12, batch I)

Research run 2026-07-12. Web budget: 12 calls used of 12, serial — 2 failed
TLS handshakes on nichirenlibrary.org via WebFetch (server omits its
intermediate cert), then 10 successful fetches via `curl -k`, every page
saved whole to the session scratchpad and quote-verified locally at byte
level (whitespace/footnote-marker normalization only). ONE rendering used
throughout: the SGI translation, *The Writings of Nichiren Daishonin* vol. I
(WND1), at nichirenlibrary.org/en/wnd-1/Content/N.

Source keys (all fetched entire this session unless marked STD):

- **WND1-1** = On Attaining Buddhahood in This Lifetime (pp. 3–5), Content/1
- **WND1-30** = The Opening of the Eyes (pp. 220–98), Content/30
- **WND1-32** = Letter from Sado (pp. 301–), Content/32
- **WND1-45** = Reply to Kyō'ō (pp. 412–13), Content/45 (incl. SGI
  background note)
- **WND1-65** = Winter Always Turns to Spring (pp. 535–37), Content/65
- **WND1-93** = The Actions of the Votary of the Lotus Sutra (pp. 763–),
  Content/93
- **WND1-101** = The Real Aspect of the Gohonzon (pp. 831–33), Content/101
- **WND1-138** = On Persecutions Befalling the Sage (pp. 996–98), Content/138
- **WND1-154** = Reply to the Mother of Ueno (pp. 1072–74), Content/154
- **PANTH** = voices/_mirror-pantheon.md (ratified registry, T1 seat)
- **DOSSIER / CORE** = data/_dossier/soka-gakkai.json ·
  data/mirror-core.js (figure + edges: Lotus Sutra pairs T1; Daimoku T2;
  bodhisattva-ideal T2)
- **SEATED** = a seated profile in voices/profiles/ (in-repo, carries its
  own provenance)
- **STD** = standard biography/history, NOT web-verified this session →
  flagged below for the adversarial verify layer

"Verbatim" = exact wording fetched this session, quoted in marks in the
profile. "Content" = event/claim verified in fetched text, unmarked in the
profile. Tier vocabulary follows the brief: accepted canon (Gosho, WND
rendering) · self-testimony (his own uncorroborated account, tiered visibly
in the profile) · inherited doctrine · lineage tradition · modern echo · pop.

## Canon quotes and canon-backed claims

| claim in profile | source | tier | verified |
|---|---|---|---|
| "like a tarnished mirror, but when polished, it is sure to become like a clear mirror, reflecting the essential nature of phenomena and the true aspect of reality." | WND1-1 | accepted canon (early letter, 1255) | verbatim; matches PANTH registry fact per brief's r11 order |
| "Arouse deep faith, and diligently polish your mirror day and night. How should you polish it? Only by chanting Nam-myoho-renge-kyo." | WND1-1 | accepted canon | verbatim |
| "if you think the Law is outside yourself, you are embracing not the Mystic Law but an inferior teaching." | WND1-1 | accepted canon | verbatim |
| "Never seek this Gohonzon outside yourself. The Gohonzon exists only within the mortal flesh of us ordinary people who embrace the Lotus Sutra and chant Nam-myoho-renge-kyo." | WND1-101 (1277, to Nichinyo) | accepted canon | verbatim; PANTH T1 fact confirmed at source |
| Mandala layout from his own hand: "the five characters" suspended in the center (profile paraphrase); "the devil king of the sixth heaven"; "the evil and treacherous Devadatta and the ignorant dragon king's daughter" (profile embeds lowercase t, exemplar convention); the Sun Goddess + Hachiman among guardians | WND1-101 | accepted canon (his own description of the object) | verbatim fragments; layout claims did NOT need lineage self-description — his letter carries them |
| "I, Nichiren, have inscribed my life in sumi ink, so believe in the Gohonzon with your whole heart." (context: inscribed for the gravely ill one-year-old Kyō'ō, daughter of Shijō Kingo; he prays for her "every moment of the day"; "her life may be as short-lived as dew") | WND1-45 (1273, from Sado) | accepted canon | verbatim + content; addressee/illness context from letter + SGI background note |
| Mandala depicts its original "as perfectly as a print matches its woodblock." | WND1-101 | accepted canon | verbatim |
| "I was the first to reveal" the great mandala; "never before known," 2,220+ years after the Buddha (informs "the first mandalas from your brush," Sado placement) | WND1-101 + WND1-45 ("never known, let alone inscribed, by anyone in the Former or Middle Day") | accepted canon; Sado dating of the FIRST inscriptions is lineage-sensitive | verbatim fragment; dating FLAGGED below |
| "You gentlemen have just toppled the pillar of Japan" said laughing at his own arrest; an officer "struck me in the face" with the fifth scroll of the Lotus Sutra he carried in his robe | WND1-93 (written 1276, his retrospective account) | accepted canon / self-testimony | verbatim + content |
| Tatsunokuchi: "a brilliant orb as bright as the moon burst forth from the direction of Enoshima"; executioner blinded/panicked | WND1-93 | self-testimony — his own account, written years later, no external corroboration; the profile tiers it visibly ("your own account, written years later, sole witness") per brief | verbatim |
| "this person named Nichiren was beheaded. It is his soul that has come to this island of Sado and, in the second month of the following year, snowbound, is writing this" | WND1-30, p. 269 (Kaimoku-shō, 1272) | accepted canon | verbatim (intervening footnote marker elided; continuity confirmed) |
| "I will be the pillar of Japan. I will be the eyes of Japan. I will be the great ship of Japan." (+ "This is my vow, and I will never forsake it!" unquoted) | WND1-30, pp. 280–81 | accepted canon | verbatim |
| "I, Nichiren, am the richest man in all of present-day Japan." | WND1-30 | accepted canon | verbatim |
| "Do not have doubts simply because heaven does not lend you protection." | WND1-30 | accepted canon | verbatim |
| Tsukahara hut: "four posts"; snow "piled up, never melting away"; on land where corpses were abandoned; straw coat, fur skin (also exchange's "island where they abandoned corpses") | WND1-93 | accepted canon | verbatim fragments + content |
| "the Mongols will surely attack us" (third remonstrance, 1274); three-attempts rule: "if after three attempts to warn the rulers... I would leave the country"; Minobu entered 5th month 1274; ravine: "I cannot see the sun in the daytime or the moon at night"; deep snow, no visitors; Mongols attacked 10th month 1274 (Iki, Tsushima) | WND1-93 | accepted canon | verbatim + content |
| "born poor and lowly to a chandāla family"; parents "subsisted on fish and fowl" (profile: "a family that lived by killing fish," "your own word... chandāla"); "as gold is wrapped in a filthy bag" | WND1-32 (1272) | accepted canon | verbatim fragment + content |
| Wound list: Izu exile 5/12/1261; Komatsubara 11/11/1264 — "wounded on the forehead and had his left hand broken"; led to execution 9/12/1271; Sado exile — listed by himself in third person with dates (PRESENCE scar/hand/clerk-cargo claim) | WND1-138 (1279) | accepted canon | content, near-verbatim |
| 27 years since first proclamation at Seichō-ji, 4/28/1253 (declaration date, "home at thirty-one") | WND1-138 | accepted canon | content |
| Atsuhara instruction: "be prepared for the worst, and not to expect good times, but take the bad times for granted" (to the Atsuhara farmers, 10/1/1279) | WND1-138 | accepted canon | verbatim |
| Winter line context: letter to the widowed lay nun Myōichi (husband dead; an ill son); "Those who believe in the Lotus Sutra are as if in winter, but winter always turns to spring" — profile deliberately does NOT quote it in marks; grief answer describes it as "a thing you wrote to a widow" and forbids using it as forecast | WND1-65 | accepted canon | letter fetched whole; wording confirmed ("seen or heard," not the oft-misquoted "heard or seen"); covenant-over-canon judgment recorded below |
| The dead husband's worries voiced for the widow (GOT WRONG: "a dead husband's worries imagined for his widow so she would know she was loved") | WND1-65 | accepted canon | content |
| Grief letter moves: offerings itemized — two strings of coins, polished rice, taros, pounded bean curd, konnyaku, persimmons, fifty citrons (VOICE receipt-first; "coins and citrons"); "I believe I can understand something of your feelings"; the mother's own story said back (pregnant at husband's death, chose to live, raised the boy "fourteen or fifteen years"); "he had a warm heart"; whole Lotus Sutra + daimoku recited for the boy's repose | WND1-154 (49th-day letter for Nanjō Shichirō Gorō, 1280) | accepted canon | verbatim + content |
| Nembutsu→hell of incessant suffering; errors of Zen, True Word, Precepts pressed in writing over his signature (intolerance answer's substance) | WND1-93 (multiple passages) + WND1-30 | accepted canon | content; the FOUR-PHRASE FORMULA as such is handled as heirs' compression — see flags |
| Reading enemies' funerals as verdicts ("punishment for their treachery" — deaths of Ōta et al.) — owned in intolerance answer as "the worst" | WND1-138 | accepted canon (the record's own ledger, r12) | content |
| Scripture as mirror (supports "the page became the mirror" spine): sutra passage as "the bright mirror... in which the present state of the country is reflected"; "the mirror of the Buddha's Law" | WND1-30 | accepted canon | content (not quoted in profile) |

## Inherited doctrine, registry, and echo tiers

| claim in profile | source | tier | verified |
|---|---|---|---|
| mappō frame; Tendai/Zhiyi's ichinen sanzen; ten worlds mutually possessed; title-as-seed compression; daimoku practice | DOSSIER + CORE edges (daimoku T2, Lotus T1) + WND1-1 content | inherited doctrine | in-repo + fetched |
| Devadatta promised Buddhahood in the Lotus Sutra (ch. 12) — intolerance answer's "promised Buddhahood in your own sutra" | Lotus Sutra Devadatta chapter (not fetched; uncontroversial doctrine) | inherited doctrine | STD — flag (low risk) |
| Reception frame: movement of Makiguchi → Toda → Ikeda named as the door; 1991 excommunication of the laity named as event, adjudicated never; lineages unadjudicated (votary/Jōgyō vs True Buddha quarrel left "in the corridor," named as the heirs' quarrel in KIN) | DOSSIER + brief's standing law | modern history, named-not-judged | in-repo; compliance is structural (no adjudication appears anywhere in the profile) |
| Makiguchi refused the wartime state talisman and died in prison (1944) — FRAME's "one echo you receive bareheaded" | STD modern history (corroborated by DOSSIER founding narrative) | modern echo, met in-frame | FLAG for verify (high confidence) |
| "A modern lay prophet of empire named his society for your pillar vow" = Tanaka Chigaku's Kokuchūkai ("Pillar of the Nation Society"); imperial-way/Nichirenist officers (Ishiwara Kanji) implied by "imperial officers marched on your sutra" | STD | modern echo | FLAG for verify — load-bearing for the militarist answer |
| Film chant (GOT WRONG): What's Love Got to Do with It (1993), hotel-room chanting scene; actress portrayed Tina Turner, SGI practitioner until her death (2023) | STD pop | pop, lightest tier | FLAG for verify (high confidence) |
| KIN characterizations of Śākyamuni (will not say "one," will not name what remains), Yama (mirror of record at the road's end), Amaterasu (wrapped mirror at Ise, never viewed), Avalokiteśvara (thirty-three forms, form follows the need) | SEATED profiles buddhist-sakyamuni.md, buddhist-yama.md, amaterasu.md, buddhist-avalokitesvara.md | hall-internal | in-repo; rule-13 census run against all four plus Uzume and Christ — no seated formula re-spent (Yama seam coined fresh: road's-end glass vs kettle-side glass) |

## Biography spine not verifiable from the fetched pages (STD → verify layer)

| claim in profile | status |
|---|---|
| 1257 Shōka earthquake flattening Kamakura "the year you turned thirty-five" (b. 1222); famine/plague sequence | STD — FLAG (dates standard; arithmetic mine) |
| Risshō Ankoku Ron 1260 handed to the RETIRED regent (Hōjō Tokiyori); "the reply was a mob, then exile to Izu" (Matsubagayatsu attack 1260 → Izu 1261) | submission + Izu exile corroborated by WND1-93/138; the mob attack itself STD — FLAG |
| 1268 Mongol state letter/envoys | WND1-93 SGI background note + STD — FLAG (light) |
| Sent up the mountain (Seichō-ji) at twelve; name Nichiren = sun + lotus, self-chosen at the 1253 declaration | STD — FLAG (1253 declaration itself verified WND1-138) |
| Second invasion 1281, "the second broke on a storm credited to the gods" (phrasing deliberately reports the ATTRIBUTION, not the meteorology; 1274 withdrawal cause left unclaimed) | STD — FLAG |
| Atsuhara 1279: farmers arrested and tortured, offered life for one recanting syllable (nembutsu), none recanted, THREE BROTHERS beheaded; execution date disputed (1279 vs 1280) — profile gives no date | STD/tradition consensus — FLAG; the pastoral instruction to them is verbatim (WND1-138) |
| Death at Ikegami, 10th month 1282, en route to hot springs; six senior disciples named; deathbed lecture on the Risshō Ankoku Ron — profile tiers it "Tradition has..." | STD/lineage tradition — FLAG (the tiering is already in the profile's own mouth) |
| Grave-rota collapse among the six; "within a decade the split was law" (Nikkō leaves Minobu 1289, Taiseki-ji 1290) | STD — FLAG |
| Ongi Kuden "set down under Nikkō's name; the earliest copies surface centuries late, and scholars contest it" | STD textual scholarship (earliest extant copy commonly dated 16th c.) — FLAG the "centuries late" wording |
| The four dictums exist as a FORMULA (shika kakugen) = "your heirs' compression; every charge is yours" — the profile deliberately does not quote the formula | STD — FLAG the compression claim's framing (each individual charge is canon-attested; see canon table) |
| Fifth scroll of the Lotus = the volume containing "Encouraging Devotion" (ch. 13), hence "the very volume that promises the votary blows" | strike-with-the-fifth-scroll is verbatim (WND1-93); the volume-contents gloss STD — FLAG |
| PRESENCE "in his fifties" (exile era 1271–82 = ages 49–61) | arithmetic mine — trivial |

## Declared inventions (authored voice, no canon claim)

- The spine and its landings: "the man became the page; the page became the
  mirror"; "It bills him"; "you signed its letters"; "Both were describing
  the same snow"; "heaven confirmed the diagnosis and never once paid the
  physician"; "It had theirs"; "none of it broke the glass"; "Be the
  letter"; "The life was always the reader's" — and all analogous landing
  lines. Voice-writing, not quotation.
- "Last seen in the mortal flesh of the one asking" — a move-line derived
  from the verified WND1-101 quote; handed to the performer as speech.
- KIN seam-lines (kettle-side glass; two custodies of one glass; his
  silence and your shout; the torn chapter as one of her forms) — hall
  seams, coined fresh this forge; none spends a seated coin.
- The worked-exchange visitor (hospital whistleblower) and every detail of
  their situation — invented at mortal scale per Score §6.2 to carry HIS
  wound (vindication-as-ruin; the followers who paid more).
- Exchange line "I carried their graves uphill for the rest of my life" —
  figurative (Minobu is a mountain; the graves are not literally there).
- "Joking at your own arrest" (PRESENCE) — grounded in the verbatim "How
  amusing! Look at Hei no Saemon gone mad!" — characterization, not quote.

## Judgment calls recorded for the verify layer

1. **Winter→spring under the covenant.** The letter promises believers'
   winters turn; the covenant forbids promised outcomes. Resolution: the
   voice may hand the sentence over only as biography and testimony (what
   he wrote to a widow; that HIS winters turned) — never as forecast. The
   grief answer encodes this explicitly.
2. **Eagle Peak verdicts.** WND1-154 assures the mother her son reached
   the pure land of Eagle Peak — a verdict on the dead, covenant-barred.
   The profile takes the letter's MOVES (receipt, "something of your
   feelings," her story said back) and drops the verdict, per the brief's
   covenant-overrides instruction.
3. **Punishment-arithmetic.** His canon reads enemies' deaths as
   punishment (WND1-138). Kept as owned confession in the intolerance
   answer; barred from live use by the VOICE never-list ("that arithmetic
   stays sheathed here").
4. **SG background notes** (e.g., "revealed his true identity as the
   Buddha of the Latter Day" at Tatsunokuchi) were treated as lineage
   self-description and never imported into the profile's own voice —
   lineages unadjudicated, per standing law.
5. **Tarnished-mirror quote span** opens mid-sentence at "like a tarnished
   mirror…" (source sentence begins "A mind now clouded by the illusions of
   the innate darkness of life is…"); the profile's lead-in paraphrases
   that opening outside the marks. Devadatta quote embedded with lowercase
   first letter (exemplar convention, christianity-christ.md John 17
   embedding).

## Verify pass + fixes applied (2026-07-12, orchestrator)

Adversarial verify: `soka-gakkai-nichiren.verify.md` — 21/23 quoted spans
byte-exact; citation attack zero wrong-book; **2 REFUTATIONS, both quote-genus,
both from rows this table marked "verbatim" — the verify law runs 12-for-12.**
All declared flags CONFIRMED (Atsuhara three brothers per the library's own
dictionary, datelessness correct; Makiguchi died in custody at the Tokyo
Detention House 18 Nov 1944, no transfer; Kokuchūkai named 1914 from the
pillar vow; four-dictums-as-heirs'-compression is exactly the scholarly
position; fifth-volume/Kanji at WND1-93's own footnote; Ongi Kuden earliest
copies 16th c.; first mandalas Sado by his own 1273 letters).

**Row corrections (supersede the rows above):**

1. ~~"this person named Nichiren was beheaded… is writing this" | verbatim~~ →
   the source continues **"…is writing this to send to his close disciples."**
   The undeclared terminal-clause drop + supplied period inside marks was
   REFUTED under r11. FIX APPLIED: quote extended to its true end — which
   strengthens the landing (the ghost writes letters, which is the profile).
2. ~~"the Mongols will surely attack us" (third remonstrance, 1274) |
   verbatim + content~~ → right words, WRONG SCENE: those words sit in the
   letter's earlier Sado reflection ("I see now that the Mongols will surely
   attack us…"); at the post-pardon audience WND1-93 prints **"They will
   surely come within this year."** FIX APPLIED: the audience's own sentence
   now stands in the marks — and the fleets came in the 10th month, within
   the year, to the syllable.

**Other fixes applied in-voice:** execution-carry softened to the attested
arrest-day carry ("the day they came for your head"); "at night" dropped from
the raid (hour unstated in the source); film-chant hotel-room staging dropped
(chant placed at no location: "on her knees until the night she walked out");
grief-letter modesty re-scoped to the claim of understanding ("of her grief
you claimed no fuller sight, and you had buried enough to claim more").

**Orchestrator's own rule-13 catch (missed by both forge and verify censuses —
both ran KIN-scale, not corpus-scale):** the Atsuhara non-turn closed on
"…a debt the answerer stands in front of. Stand in front of it." — colliding
with seated hephaestus.md's non-turn close ("This one is yours. You stand in
front of it, and you stay standing."). RECOINED in his ledger idiom, echoing
his own dictums-answer coin: "This question is not the visitor's account; it
is yours — entered in your own hand, over your signature, and it stays
entered. Answer it each time it is asked; ask nothing back." LESSON FOR ALL
FUTURE BRIEFS: the r13 census greps ALL seated profiles, not the KIN set.
