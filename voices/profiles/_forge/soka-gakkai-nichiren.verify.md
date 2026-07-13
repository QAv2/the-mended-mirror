# Verify — soka-gakkai-nichiren.md (adversarial pass, 2026-07-12)

Verify layer run against the batch-I forge. Web budget 15/15 used, serial:
9 × `curl -k` to nichirenlibrary.org (TLS chain broken as briefed; every page
fetched whole to session scratchpad, tag-stripped, grepped byte-level) + 6 ×
WebSearch for the STD flags. Source of record: SGI rendering, WND I at
nichirenlibrary.org/en/wnd-1/Content/N — the same single rendering the forge
used. All nine claimed Content/N loci were re-fetched independently and every
one carries the text the provenance places there: **the citation attack found
zero wrong-book errors** (the forge's p. 269 claim for the beheading passage
was confirmed against the embedded page markers: marker `269` at byte 218136,
passage at byte 221084 of the stripped text).

The verify law held: **12-for-12.** Both refutations are quote-genus, and both
came from CONFIDENT claims (provenance rows marked "verbatim"), not from the
forge's self-declared flags. The declared flags themselves all resolved
CONFIRMED or confirmed-as-tiered.

**Severity counts: 2 REFUTATION · 3 OVERSTATEMENT · 0 TIER-SLIP · 1 minor
FACET-DEFECT · everything else CLEAN.**

---

## PRONG A — declared-flag verdicts

| # | flag | verdict | evidence |
|---|---|---|---|
| A1 | Atsuhara: three brothers; execution date | **CONFIRMED** (profile's no-date handling correct) | WND1-138's own SGI background (fetched): "Twenty believers, all farmers, were arrested on the twenty-first day of the ninth month, 1279, on false charges, and three of them were later beheaded. In spite of these persecutions, not one of the twenty farmers abandoned their faith." Brothers + names: nichirenlibrary's own dictionary entry "three martyrs of Atsuhara" — Jinshirō, Yagorō, Yarokurō, brothers, tortured, urged to recant, none did. Execution date genuinely disputed: 10/15 (trad.) vs 8th day 4th month 1280 (other account; cf. Stone, "The Atsuhara Affair"). Profile dates the persecution "Atsuhara, 1279" (arrests ✓) and gives the beheading no date ✓. |
| A2 | Makiguchi 1944 prison death | **CONFIRMED** | Died 18 Nov 1944, age 73, of malnutrition, in the Tokyo Detention House (Sugamo) — in custody, no release or outside transfer preceding death (moved only to the facility's own infirmary). "Dying in prison for the refusal" is exact at profile altitude. Sources: tmakiguchi.org biography; sokaglobal.org founding-presidents page; en.wikipedia.org/wiki/Tsunesaburō_Makiguchi. |
| A3 | Kokuchūkai named from the pillar vow | **CONFIRMED** | Tanaka Chigaku's lay society took the name Kokuchūkai ("Pillar of the Nation Society") in 1914; the name is drawn from the Kaimoku-shō's "I will be the pillar of Japan." Ishiwara Kanji converted through it. Profile's "a modern lay prophet of empire named his society for your pillar vow" holds at every joint. Sources: en.wikipedia.org/wiki/Kokuchūkai; en.wikipedia.org/wiki/Tanaka_Chigaku. |
| A4 | Film-chant details | **CONFIRMED except one staging detail → see O3** | Film (What's Love Got to Do with It, 1993) depicts the chant and credits it with her turnaround ✓; violent-marriage walkout ✓; Bassett played Tina Turner ✓; Turner practiced Nichiren/SGI Buddhism to her death (2023) ✓. NOT confirmed: the chant happening "on her knees in a hotel room" — sourced beats put the chanting at a friend's house/home altar and the Dallas hotel walkout chant-free (Ike asleep → flees to the Ramada). Sources: en.wikipedia.org/wiki/What's_Love_Got_to_Do_with_It_(1993_film); watchmojo.com right-and-wrong article; rogerebert.com review. |
| A5 | Four-dictums formula status | **CONFIRMED — profile's framing is exactly the scholarly position** | The tetrad (shika kakugen) was "summed up by his later followers… drawn from various passages in his work" (en.wikipedia.org/wiki/Nichiren_Buddhism; nichirenlibrary dictionary "four dictums"). Each individual charge is his: two of the four byte-verified this session in one WND1-93 sentence ("believers in Nembutsu are doomed to the hell of incessant suffering"; True Word prayers "will only bring about the country's military defeat"). Profile: "the formula is your heirs' compression; every charge is yours, in writing" — no later catechism in his mouth ✓. |
| A6 | Fifth volume contains Kanji (ch. 13) | **CONFIRMED at the source itself** | WND1-93 footnote (fetched): "The fifth volume includes chapters twelve to fifteen; the thirteenth, or 'Encouraging Devotion,' chapter says the votary of the Lotus Sutra will be attacked with swords and staves." Profile's "the very volume that promises the votary blows" ✓. |
| A7 | Ongi Kuden dating/authenticity framing | **CONFIRMED-STD (as tiered)** | Purported 1278 lectures recorded by Nikkō; earliest extant copies 16th c. (oldest ms commonly dated 1539) = "centuries late" ✓; authenticity contested by modern textual scholarship (Stone et al.); treasured by SG ✓. Profile quotes nothing from it and tiers it aloud ("the book you hold at arm's length — the arm honest, the fondness real") — compliant. Not web-verified this session (settled scholarship; searches spent on higher-risk flags). |
| A8 | Ikegami deathbed lecture | **CONFIRMED AS TIERED** | Death at Ikegami, 10th month 1282, en route to the Hitachi hot springs; six senior disciples named — standard across lineages. The deathbed Risshō Ankoku Ron lecture is lineage tradition, and the profile already carries it as "Tradition has your last strength spent…" — correct tier, no change. |
| A9 | Matsubagayatsu mob | **CONFIRMED-STD** | Ron submitted 1260 (his own statement, fetched WND1-93: "I wrote in the first year of Bunnō (1260)"); Izu exile 5/12/1261 byte-verified at WND1-138. The 8/27/1260 Matsubagayatsu attack by nembutsu adherents is textbook-standard; profile's modest "the reply was a mob, then exile to Izu" ✓. ("Handed to the retired regent" — Hōjō Tokiyori — standard ✓.) |
| A10 | First-mandala Sado dating | **CONFIRMED** | His own Sado-period letters carry it: WND1-45 (1273, from Sado): "The Gohonzon was never known, let alone inscribed, by anyone in the Former or Middle Day of the Law"; WND1-101: "I was the first to reveal… this great mandala." WND1-45 background: he began inscribing only after Tatsunokuchi. Earliest extant mandalas are Sado-period. Profile places "the first mandalas from your brush" on Sado ✓. |

---

## PRONG B — findings

### REFUTATION 1 — the beheading quote: undeclared terminal clause elision inside marks
**Profile (STORY, lines 156–158):**
> "this person named Nichiren was beheaded. It is his soul that has come to this island of Sado and, in the second month of the following year, snowbound, is writing this."

**Source (WND1-30, p. 269, fetched):**
> …this person named Nichiren was beheaded. It is his soul that has come to this island of Sado and, in the second month of the following year, snowbound, is writing this **to send to his close disciples**.

The marks close at "writing this." with a supplied period — printing a
sentence-end no translation prints. The provenance row claims "verbatim
(intervening footnote marker elided; continuity confirmed)" and declares the
footnote elision but NOT this clause drop. Under r11 (verbatim or the marks
come off) this is the dropped-clause genus, on the profile's single most
load-bearing self-quote, under an explicit exactness frame.
**Minimal in-voice fix (recommend a):** (a) extend the quote to its true end —
"…snowbound, is writing this to send to his close disciples." The restored
clause strengthens the profile's own landing: the voice that narrates its own
death and keeps talking is talking TO SOMEONE — the ghost writes letters,
which is the whole profile. (b) Alternatively close the marks after "writing
this" with the period outside. Fix the provenance row either way.

### REFUTATION 2 — the Mongols quote: right words, wrong scene (wrong-locus genus)
**Profile (STORY, lines 170–172):**
> Pardoned, returned, heard one last time — "the Mongols will surely attack us" — and unheeded, you kept your own rule: thrice refused, withdraw.

**Source (WND1-93, fetched):** at the post-pardon audience the profile is
staging (8th day, 4th month, 1274 — Hei no Saemon asks when the Mongols will
invade), what he actually says is:
> I replied: "They will surely come within this year. …I have already expressed my opinion on this matter, but it has not been heeded."

The profile's quoted words DO exist verbatim in the same letter — but in the
earlier, pre-pardon Sado reflection (byte 46553 vs the audience at 52608 of
the fetched text): "**I see now that** the Mongols will surely attack us, and
it is equally certain that believers in Nembutsu are doomed to the hell of
incessant suffering." The provenance row runs the two together — "'the
Mongols will surely attack us' (third remonstrance, 1274) … verbatim +
content" — which is refuted as written: at the third remonstrance the source
prints different words. Same class as last run's worst catch (right quote,
wrong locus), one letter's width instead of one book's.
**Minimal in-voice fix:** swap the marks' contents to the audience's own
sentence — heard one last time — "They will surely come within this year" —
which is sharper anyway: the fleets came in the 10th month, within the year,
to the syllable. Fix the provenance row to match.

### OVERSTATEMENT 1 — "you carried it to your own execution" (PRESENCE, lines 18–20)
**Profile:** "inside it, where other monks carry amulets, the fifth scroll of the Lotus Sutra — you carried it to your own execution, and an officer once beat you across the face with it."
**Source (WND1-93):** "Shō-bō, Hei no Saemon's chief retainer, rushed up, snatched the scroll of the fifth volume of the Lotus Sutra from inside my robes, and struck me in the face with it three times." — attested: carried in-robes at the ARREST raid, where it was snatched; nothing attests he still carried it on the midnight ride to Tatsunokuchi.
**Minimal fix:** "you carried it into the night they came for your head, and an officer beat you across the face with it" — or simply "you carried it to your own arrest…". (The beating clause is fully attested; only the execution-ground carry is inference.)

### OVERSTATEMENT 2 — "When they came for you at night" (STORY, line 143)
**Source (WND1-93):** the raid's hour is unstated ("On the twelfth day of the ninth month… I was arrested…"); the attested night events are custody and the ride ("That night of the twelfth, I was placed under the custody of the lord of the province of Musashi and around midnight was taken out of Kamakura to be executed"). Historically the raid is usually placed in daylight.
**Minimal fix:** drop "at night" — "When they came for you, you laughed at the commander…" The beach scene two sentences later already owns the night.

### OVERSTATEMENT 3 — the film chant "on her knees in a hotel room" (GOT WRONG, lines 319–321)
**Profile:** "A famous film of this age shows a woman chanting Nam-myoho-renge-kyo on her knees in a hotel room and walking out of a violent marriage…"
**Sources consulted:** the film's synopses place the chanting at a friend's house and her home altar; the Dallas hotel sequence is chant-free in every account found (limo beating → Ike asleep → she flees to the Ramada with 36 cents). The hotel-room staging of the chant itself could not be sourced this session.
**Minimal fix:** drop the room — "shows a woman chanting Nam-myoho-renge-kyo on her knees until the night she walked out of a violent marriage" — everything else in the item (real singer, practiced to her death, lightest tier, warm) verified. (If a re-watch of the film confirms a hotel-room chant beat, the line may stand; no consulted source carries it.)

### FACET-DEFECT (minor) — grief answer's "only… no more" (HARD QUESTIONS, lines 266–268)
**Profile:** "You told a mother once, of her dead son, only: 'I believe I can understand something of your feelings' — SOMETHING; no more, and you had buried enough to claim it."
**Source (WND1-154, fetched):** the quote is exact ("How much more deeply, then, must his mother or his wife grieve! I believe I can understand something of your feelings."). But the letter did tell her much more — the forty-ninth-day Eagle Peak assurances the covenant rightly bars and the forge rightly dropped (judgment call 2, confirmed: ZERO Eagle Peak / pure-land / reunion residue survives anywhere in the profile — the only grep hit is the prohibition line itself). As written, "only… no more" reads as a description of the letter's whole contents and quietly overstates its austerity. The modesty was in the CLAIM OF UNDERSTANDING, not in the letter.
**Minimal fix:** attach the modesty to the claim — e.g., "Of her grief itself you claimed only: 'I believe I can understand something of your feelings' — SOMETHING; you claimed no fuller sight of it, and you had buried enough to claim more."

---

## PRONG B — quote battery (every string in marks, re-verified independently)

21 of 23 distinct quoted spans byte-exact against the fetched pages (the
profile's 24th span is the sumi-ink line quoted twice). The two failures are
R1 and R2 above. Whitespace/typographic-apostrophe normalization only.

| span (profile) | source | verdict |
|---|---|---|
| "as gold is wrapped in a filthy bag" | WND1-32: "My spirit dwells in this body as the moon is reflected in muddy water, or as gold is wrapped in a filthy bag." | CLEAN (contiguous fragment; lead-in paraphrase outside marks) |
| "like a tarnished mirror, but when polished, it is sure to become like a clear mirror, reflecting the essential nature of phenomena and the true aspect of reality." | WND1-1, character-exact; mid-sentence open declared (source opens "A mind now clouded by the illusions of the innate darkness of life is…", paraphrased outside the marks) | CLEAN |
| "Arouse deep faith, and diligently polish your mirror day and night. How should you polish it? Only by chanting Nam-myoho-renge-kyo." | WND1-1, character-exact, adjacent to the previous span with nothing elided | CLEAN |
| "if you think the Law is outside yourself, you are embracing not the Mystic Law but an inferior teaching." | WND1-1: "Even though you chant and believe in Myoho-renge-kyo, if you think the Law is outside yourself…" — the lowercase "if" is genuine mid-sentence source text, not an embed convention | CLEAN |
| "Never seek this Gohonzon outside yourself. The Gohonzon exists only within the mortal flesh of us ordinary people who embrace the Lotus Sutra and chant Nam-myoho-renge-kyo." | WND1-101, character-exact | CLEAN (registry T1 fact re-confirmed at source) |
| "the devil king of the sixth heaven" | WND1-101, exact | CLEAN |
| "the evil and treacherous Devadatta and the ignorant dragon king's daughter" | WND1-101: "The evil and treacherous Devadatta and the ignorant dragon king's daughter form a group." — lowercase embed declared (exemplar convention) | CLEAN |
| "I, Nichiren, have inscribed my life in sumi ink, so believe in the Gohonzon with your whole heart." (×2: MIRROR + mechanism answer) | WND1-45, character-exact | CLEAN |
| "as perfectly as a print matches its woodblock." | WND1-101: "…depicts Shakyamuni Buddha… and the Buddhas who were Shakyamuni's emanations as perfectly as a print matches its woodblock." Profile's "depicts its original" compresses faithfully | CLEAN |
| "You gentlemen have just toppled the pillar of Japan" | WND1-93, exact, at the arrest scene; "laughed at the commander" fairly characterizes the source's "I, Nichiren, said in a loud voice, 'How amusing! Look at Hei no Saemon gone mad!'" | CLEAN |
| "a brilliant orb as bright as the moon burst forth from the direction of Enoshima," | WND1-93 continues ", shooting across the sky from southeast to northwest" — the comma inside the profile's marks is genuine source punctuation at the cut | CLEAN |
| "this person named Nichiren was beheaded. …is writing this." | WND1-30 p. 269 | **REFUTATION — see R1** |
| "four posts" | WND1-93: "One room with four posts, it stood on some land where corpses were abandoned" (corpse-field claim confirmed in the same sentence) | CLEAN |
| "piled up, never melting away" | WND1-93: "The snow fell and piled up, never melting away." | CLEAN |
| "I will be the pillar of Japan. I will be the eyes of Japan. I will be the great ship of Japan" | WND1-30 pp. 280–81, exact; quote closed at a true sentence end; vow-line left unquoted as declared | CLEAN |
| "I was the first to reveal" | WND1-101: "…I was the first to reveal as the banner of propagation of the Lotus Sutra this great mandala…" | CLEAN |
| "I, Nichiren, am the richest man in all of present-day Japan." | WND1-30, character-exact ("in all of" — the "of" is genuine) | CLEAN |
| "the Mongols will surely attack us" | WND1-93 — words exist verbatim, WRONG SCENE | **REFUTATION — see R2** |
| "I cannot see the sun in the daytime or the moon at night." | WND1-93, character-exact | CLEAN |
| "every moment of the day" | WND1-45: "…I have been praying to the gods of the sun and moon for her every moment of the day." | CLEAN |
| "be prepared for the worst, and not to expect good times, but take the bad times for granted" | WND1-138: "Tell them to be prepared for the worst, and not to expect good times, but take the bad times for granted." — contiguous and exact after "Tell them to"; the "what you actually told them" staging is supported by the source's own background gloss ("he urges believers in the Atsuhara area to be prepared for the worst") | CLEAN |
| "Do not have doubts simply because heaven does not lend you protection." | WND1-30, character-exact | CLEAN |
| "I believe I can understand something of your feelings" | WND1-154, character-exact (framing note → FACET-DEFECT above) | CLEAN as quote |

**Unmarked content spot-checks, all confirmed at source:** the offering
itemization (two strings of coins, polished rice, taros, pounded bean curd,
konnyaku, persimmons, fifty citrons) opens the Ueno letter BEFORE any doctrine
(byte 4097 vs first sutra citation at 5071 — "the receipt before the doctrine"
is the letter's real shape); "fourteen or fifteen years" raising the children;
"he had a warm heart"; Kyō'ō an infant "then only one year old" (background),
"her life may be as short-lived as dew"; "subsisted on fish and fowl"; "born
poor and lowly to a chandāla family"; wound list third-person with dates
(forehead wound + left hand broken, 11/11/1264; Izu 5/12/1261); 27 years since
Seichō-ji (4/28/1253); scattered scrolls "all over the matting and wooden
floors"; straw coat / fur skin; three-warnings rule; five characters
"suspended in the center"; Sun Goddess among "the guardian deities of Japan"
at WND1-101 (the first grep missed her because the page marker splits the
words: "the Sun 832Goddess" — she is there, with Hachiman); Minobu entered 5th
month 1274, Mongols attacked 10th month 1274; winter line present as "Those
who believe in the Lotus Sutra are as if in winter, but winter always turns to
spring" and correctly NEVER quoted in marks by the profile — carried as
testimony-to-a-widow only, per the forge's judgment call 1; the widow's-letter
thread imports the husband's-worries move without the letter's afterlife
verdicts.

---

## PRONG B — frame, covenant, corpus, kin

- **Reception frame: COMPLIANT.** No ruling anywhere on True-Buddha vs
  votary-Jōgyō (KIN: "that quarrel is your heirs'; leave it in the corridor");
  no Gohonzon-transmission verdict (the schism answer refuses the bench in so
  many words); 1991 named as event, judged never; SGI's lineage
  self-description ("revealed his true identity as the Buddha of the Latter
  Day" in the fetched WND1-45 background) correctly NOT imported — the
  profile's Tatsunokuchi carries no identity-revelation claim; the mandala
  layout is sourced from HIS OWN letter rather than any lineage's explanation,
  which exceeds the brief's requirement. Post-1282 carried as echo throughout.
  NOTE (no action): the grave-rota collapse is carried mainly in Nikkō-line
  documents; the profile's collective phrasing ("the six could not keep a
  grave-tending rota") blames no lineage and is the most neutral wording
  available.
- **Covenant/facets: COMPLIANT.** Frontmatter exact; nine sections in exact
  order; grief answer at the care floor with the Eagle Peak verdict fully
  dropped (zero residue — the only "reunion/pure land" hit in the file is the
  prohibition line itself); mechanism honesty from home ground with the
  no-trapped-ghost stone in place; rule 14 clean (hard questions in second
  person, I only inside canon marks and in the exchange); worked exchange
  spoken reply 244 words (≤250), drawing only on profile-taught material, the
  graves-uphill line declared as figurative invention in the provenance.
  Length 382 lines vs "≈250–380" — inside the tilde; note only.
- **Corpus/KIN: CLEAN.** data/mirror-core.js edges exactly as claimed and no
  others: lotus-sutra pairs T1, daimoku pairs T2, bodhisattva-ideal pairs T2.
  All four KIN voices seated; their characterizations check against their own
  files (Śākyamuni "will not say 'one'… will not name what remains" — his
  profile's own law; Amaterasu's wrapped, never-viewed Ise mirror; Yama's
  road's-end mirror; Avalokiteśvara's thirty-three forms / form-follows-need).
  The Amaterasu-on-the-scroll claim carries a verified source (WND1-101, Sun
  Goddess among the guardian deities; "Tenshō Daijin" is the brief's own
  equivalence and the name inscribed on extant mandalas). Reciprocity gap
  (amaterasu.md contains no Nichiren content) — standing polish item, same
  class as the Athena gap, not a defect of this profile.
- **Rule-13 census: CLEAN.** "Pillar" elsewhere is Shiva's endless liṅga-column
  and Wukong's world-pillars — different coins; no seated profile spends
  mirror-polishing (Prometheus's "first polish" is a cognition coin; Wukong's
  "he polishes the mirror" is a Zhuangzi characterization — neither collides
  with the canon-quoted polish, which the registry assigns to this seat);
  Yama's coins ("the judge is you"; "the mirror faces backward only") are not
  re-spent — the kettle-side/road's-end seam is coined fresh; Avalokiteśvara's
  "form follows the cry/need" is not re-spent ("whatever form the drowning
  require" + the torn-chapter line are fresh).

---

## Verdict

**SEAT AFTER FIXES.** Six one-line edits, no section re-forge: R1 (extend or
re-close the beheading quote — extension recommended; the restored clause is
in-voice and strengthens the landing), R2 (swap to "They will surely come
within this year" — sharper than what it replaces), O1–O3 (drop three
unattested staging details), F1 (re-attach the "only" to the claim of
understanding). Update the two provenance rows (WND1-30 beheading span; the
Mongols row's "third remonstrance" attribution) when the fixes land.

Web sources used for Prong A (beyond nichirenlibrary.org fetches):
tmakiguchi.org · sokaglobal.org · en.wikipedia.org (Tsunesaburō Makiguchi;
Kokuchūkai; Tanaka Chigaku; Nichiren Buddhism; What's Love Got to Do with It
(1993 film)) · nichirenlibrary.org dictionary ("three martyrs of Atsuhara";
"four dictums") · princeton.edu (Stone, "The Atsuhara Affair") ·
watchmojo.com · rogerebert.com.
