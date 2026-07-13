# Provenance — teharonhiawako.md (dyadic seat, forged 2026-07-12, batch J solo)

Research run 2026-07-12, web budget 12/12 used, serial: 2 WebSearch + 7 WebFetch
(three of which returned 403s or a redirect notice) + 3 archive.org full-text
pulls via curl, counted against the same budget by choice (the Anansi/Rattray
precedent: primary text pulled ENTIRE and read locally). Primary sources held
locally this session, quotes confirmed by eye at line level:

- **CUS** = David Cusick, *Sketches of Ancient History of the Six Nations*
  (1828; Tuscarora, the first insider print). Fetched via Project Gutenberg
  #57237 with a verbatim-extraction prompt. NOTE: extraction ran through the
  WebFetch summarizer model — spans quoted in the profile were kept short;
  eye-check against page images recommended at verify.
- **H03** = J. N. B. Hewitt, "Iroquoian Cosmology, First Part," BAE 21st Annual
  Report (1903). Full djvu.txt of archive.org `iroquoiancosmolo00hewi` (827 KB)
  pulled and read locally. Sub-cites: H03-On (Onondaga version free
  translation), H03-Sen (Seneca version), H03-Moh (Mohawk version), H03-fn
  (Hewitt's introduction/footnotes). OCR artifacts corrected to obvious print
  readings (e.g. "l)cings"→"beings"); every such quote flagged below.
- **H28** = Hewitt, "Iroquoian Cosmology, Second Part" (the Gibson telling),
  BAE 43rd Annual Report (1928). Full djvu.txt of `annualreportofbu43smit`
  (2.5 MB) pulled and read locally. Sub-cites: H28-G (Gibson free translation,
  running head "MYTH OF THE EARTH-GRASPER"), H28-intro (Hewitt's summary),
  H28-notes (appended notes and Seneca legends). Gibson attribution (Onondaga
  chief John Arthur Gibson) per the commissioning brief + standard record.
- **PAR** = Arthur C. Parker, *Seneca Myths and Folk Tales* (1923). Full
  djvu.txt of `senecamythsfolkt00park` pulled and read locally (introduction +
  motif synopsis of the creation myth).
- **In-repo**: **DOS** = `data/_dossier/haudenosaunee.json` (incl. its
  `flagged` array — care-law for this forge); **MC** = `data/mirror-core.js`
  figures + edges; **MP** = `voices/_mirror-pantheon.md` (ratified T2 dyadic
  seat).
- **TA** = Thanksgiving Address: 1993 Mohawk-version attribution (Six Nations
  Indian Museum + Tracking Project) confirmed via danceforallpeople.com fetch.
  The fetch returned summary, not verbatim text — so the profile quotes NO
  Address language in marks; only the dossier's gloss "the words that come
  before all else" is used, unmarked.
- **BRIEF** = the commissioning brief's care-law assertions, used as given and
  flagged below where not independently fetched.

"Verbatim" = wording confirmed by eye in the locally pulled text and quoted in
marks. "Content" = event/claim verified in the pulled text, no marks used.

| claim in profile | source | telling | tier | how verified |
|---|---|---|---|---|
| Father, "a young man of the Great Turtle's line," comes at twilight with two arrows | H28-intro ("a young man of the race of the Great Turtle"; "at twilight he came to the lodge bearing two, some say three, arrows, of which one was tipped with a flint point") | Gibson | attested oral canon, as published | content; variant count ("some say three") noted here, held open |
| "he laid the two arrows side by side" · "Do thou not undo them until I come again and I myself will undo them." | H28-G ("there as she lay he laid them on her body, he laid the two arrows side by side... 'Thus let them be during the night. Do thou not undo them until I come again and I myself will undo them.'") | Gibson | attested oral canon | verbatim ×2 |
| One arrow flint-tipped, one with no point | H28-G ("two arrows, one having a flint point and the other having no attached point") | Gibson | attested oral canon | content |
| Twins grown in days | H28-G ("continued to grow very rapidly. In a few days..."); H03-On ("they grew rapidly in size") | Gibson; Onondaga 1903 | attested oral canon | content |
| Tawiskaron etymology: commonly "flint," at root "crystal-clad" or "ice-clad"; crystal, flint, ice "have a similar aspect and fracture" | H03-fn p.140 n.a (also: "The original denotation is singularly appropriate for Winter. The last two names do not connote ice, but simply denote flint.") | Hewitt's scholarship | scholarly gloss (named) | verbatim fragments |
| Grandmother "loved O'ha'a' exceedingly." (and did not love the elder) | H28-G ("She loved O'ha'a' exceedingly. And she did not verily love De'hae'"hiyawa"kho"'.") | Gibson | attested oral canon | verbatim fragment |
| Earth uneven because the twins fought across it at a run | H03-Moh ("the surface is uneven... This was, of course, done by the two as they ran from place to place, fighting as they went") | Mohawk 1903 | attested oral canon | content |
| Western mountain range = Flint's fallen body; "There, so it is said, his body lies extended." | H03-Moh ("toward the west... there lies athwart the view a range of large mountains that cross the whole earth. There, so it is said, his body lies extended. He fell there when he was killed.") | Mohawk 1903 | attested oral canon | verbatim |
| Double-current rivers; "the one current running upstream and the other running downstream"; Flint "changed this well-intentioned device by putting falls and cascades in the rivers and streams" | H28-intro | Gibson (Hewitt's summary — profile says so in-line) | attested oral canon via named summary | verbatim ×2 |
| Henry Stevens: "I was on that side last year and we got beat bad." | H28-intro (Seneca chief priest Henry Stevens, Cattaraugus, on the east/Master-of-Life side of the bowl game) | Hewitt's report of a named Seneca priest | published anecdote | verbatim |
| Womb interview: "What things wilt thou do when thou goest about here in the place where thou and I shall be born?" | H28-G | Gibson | attested oral canon | verbatim (full sentence with its own terminal ?) |
| Armpit path chosen as "near, and, seemingly, quite transparent." | H03-On (the in-womb dialogue; OCR "(juite" corrected) | Onondaga 1903 | attested oral canon | verbatim; OCR-corrected, flagged |
| Gibson's warning line: "Verily thou wilt kill in that way our mother." · Flint went toward "light spots showing through" | H28-G ("here verily there are light spots showing through. I myself will go forth that way." ... "Verily thou wilt kill in that way our mother.") | Gibson | attested oral canon | verbatim + content |
| Birth path by telling: armpit (Onondaga, Mohawk) · navel (Seneca) · "under the side of the parent's arm" (Cusick) | H03-On ("he came out here through her armpit. And now, verily, he killed his mother."); H03-Moh interlinear ("Her armpit in he it emerged. so, he her killed"); H03-Sen ("he, the Warty, came forth from the navel of his mother"); CUS | four tellings, named | attested oral canon | content ×3 + CUS verbatim fragment (fetched rendering, flagged) |
| Mother dies at the birth; neither twin met her living | H28-G ("as she gave birth to the children she herself died"); H03-On; CUS ("their parent expired in a few moments") | Gibson; Onondaga 1903; Cusick | attested oral canon | content |
| Blame scene: "Who, moreover, killed your mother, now dead?" · "This one here." · "Verily, he told a falsehood." · innocent twin thrown among the grasses, liar raised | H03-On ("Now, the elder woman-being seized the other one by the arm and cast his body far beyond, where he fell among grasses.") | Onondaga 1903 | attested oral canon | verbatim ×3 (OCR "dead T'"→"dead?" flagged) + content; H28-intro agrees ("accused his innocent brother... cast him far away among the shrubbery") |
| In Cusick there is no grandmother at all (sky woman herself bears the twins) | CUS ("a woman conceived and would have the twin born" before the fall) | Cusick | attested oral canon | content |
| Naming test; Sapling's vow "I myself will continue to grasp with both hands the place whence I came"; named "he grasps the sky with both hands" (used unmarked), Sky Holder | H28-G ("I will name you De'hae'"hiyawa"kho'" (he grasps the sky with both hands)"); PAR intro ("Sky Holder" among T'hahon'hiawa"kon's names) | Gibson; Parker | attested oral canon | verbatim (vow) + content (gloss, name) |
| Flint's answer: satisfied to have arrived; trusts "the thing my father gave me," the flint-tipped arrow; named O'ha'a', Flint, at root crystal ice | H28-G ("It is thus sufficient that my mind is satisfied that I have arrived in this place... I trust in the thing my father gave me." ... "Then, verily, I call thee O'ha'a' (Flint)." with Hewitt's bracket "[This originally was crystal ice.]") | Gibson | attested oral canon | verbatim fragments; the profile's two-sentence join is an elision within ONE attested speech, flagged |
| Self-naming: "I shall be called Flint." (and Sapling's self-naming, researched, cut for length) | H03-On ("And it is I, the Sapling, who say it." So then, this other person began to say: "I shall be called Flint.") | Onondaga 1903 | attested oral canon | verbatim |
| Cusick: sun made from the parent's head, moon from her body | CUS ("he took the parent's head, (the deceased) of which he created an orb... (now the sun)... the remnant of the body and formed another orb... (now moon.)") | Cusick | attested oral canon | content (fetched rendering) |
| 1903 Onondaga: grandmother makes luminaries from the daughter's severed head and body, departs east with Flint; Sapling steals the sun back, fastens it up high | H03-On ("She took from its fastening the head, which had been cut off... it became the sun, and the body of flesh became the nocturnal light orb... the elder woman-being and, next in order, Flint departed, going in an easterly direction"; the Fox/Fisher relay; "Now, I will fasten it up high; on high shall the sun remain fixed hereafter") | Onondaga 1903 | attested oral canon | content (quotes researched; cut from final for length) |
| Parker: elder twin watches the grave; corn, beans, squash, potatoes, tobacco spring from it | PAR ("watches her grave and finds corn, beans, squashes, potatoes and tobacco springing from it"; intro: "It was he who watched at the grave of his mother, and discovered the food plants") | Parker | attested oral canon | content, near-verbatim unmarked |
| Flint pens the game animals in a cave; Sapling releases them (Q1's "penned game") | H03-On ("Flint concealed all the bodies of the animals... he closed it with a stone"; later the animals "again became numerous"); CUS ("he attempted to enclose all the animals of game in the earth, so as to deprive them from mankind") | Onondaga 1903; Cusick | attested oral canon | content. Q1's "meant to starve the people" is a paraphrase of Cusick's "deprive them from mankind" — flagged as compression |
| Grandmother blights the perfect corn: humans must not be "too happy" | H28-intro ("You desire the human beings you are about to make to be too happy and too well provided with necessaries.") | Gibson (Hewitt's summary) | attested oral canon | verbatim fragment |
| Snow-man: "white as foam"; boast of equal/greater power; Sapling: "let him stand, and also let him walk"; it could not, until given life | H03-Moh (scene at the water's edge; "Well, let him stand, and also let him walk." — profile quotes the substring) | Mohawk 1903 | attested oral canon | verbatim ×2 + content |
| Hewitt's note: "This man-being was Snow, Winter's handiwork. The life with which this man-being was endowed by Sapling is that which enables the snow to return every winter." | H03-Moh footnote (OCR "wasSnow" spacing corrected) | Mohawk 1903, Hewitt's note | attested oral canon + named note | verbatim (two sentences, each ending at its true period), OCR flagged |
| Cusick ending: two-day duel, deer horns, traded false weakness, "deceiving," last claim on the souls of the dead, sinking "down to eternal doom" | CUS ("which he succeeded in deceiving his brother"; "the last words uttered from the bad mind were, that he would have equal power over the souls of mankind after death; and he sinks down to eternal doom, and became the Evil Spirit") | Cusick | attested oral canon | verbatim fragments (fetched rendering, flagged); "the government of the universe" compresses Cusick's "who gains the victory should govern the universe" |
| Mohawk ending: too-hot fire, legs flaking in chert chips, chase over the whole earth, killed with deer horn and yellow chert; field flint = the fight's fallout | H03-Moh ("the legs of Tawi'skaro"' began to chip and flake off"; "In every direction over the entire earth they two ran"; "Whenever Sapling saw a horn or a yellow chert stone he would seize it suddenly and hit Tawi'skaro"' with it. Then after a while he killed him."; "Customarily chert chips would fly when he hit him") | Mohawk 1903 | attested oral canon | content + fragments; "the fight's fallout" is the profile's compression, flagged |
| 1903 Onondaga ending: no duel — Flint's credo "I will not stop working, because I believe that it is necessary for me to work."; cast down; called "a fine place"; parley from the fire (asks to keep conversing, then gentler quarters); "I had hoped... thou wouldst say, 'I now repent.'... Thy mind is unchanged." | H03-On ("Moreover, the place whither thou wilt go is a fine place."; "Thou wouldst consent, wouldst thou not, that thou and I should converse once more together?"; "And thou didst say: 'Thou art going to a very fine place.'"; "I had hoped that, it may be, thou wouldst say, 'I now repent.' As a matter of fact it did not thus come to pass. Thy mind is unchanged.") | Onondaga 1903 | attested oral canon | verbatim (credo; hoped-span with flagged internal ellipses, one speech) + fragment ("a fine place") + content |
| Gibson ending: the last stake is the grandmother's bowl game for "the rulership of the phenomena, processes, and the flora and fauna of the earth" (profile: "rulership of everything alive"); chickadee-head dice; the orenda cry; highest throw at one shake | H28-intro ("challenged her grandson... to a game of the bowl and plum pits"; "The dice of De'hae°'hiyawa"kho°' were the tops of the heads of chickadees"; "All you whose bodies I have formed, do you now put forth to the uttermost your orenda, in order that we may conquer in this struggle, so that you may live!"; "made the highest score possible at one shake of the bowl") | Gibson (Hewitt's summary) | attested oral canon | verbatim (cry, full with terminal !) + content |
| The bet replayed at Midwinter and Harvest; the two sides of the house alternate at being the Creator's side | H28-intro ("dramatized and played at the annual New Year festival and also at the annual harvest festival... The two coordinate sides of tribal organization play against each other... But the two sides alternate in taking this eastern position.") | Gibson (Hewitt's summary) | published ceremonial fact | content; "two sides of the house" = light paraphrase of "two coordinate sides of tribal organization" |
| Parker ending: "the Evil Minded placed in underground cavern"; "the reunited family of celestial beings" in the sky | PAR (motif list + intro) | Parker | attested oral canon | verbatim fragment (reunited family) + content |
| Man made "after observing his own reflection in a pool of water," clay commanded to live | PAR intro ("He created man after observing his own reflection in a pool of water, after which he made miniature figures in clay and commanded them to live") | Parker | attested oral canon | verbatim fragment |
| The Good Mind a living ethical term (ka'nikonhri:io; Parker's Ha'ni'go"io') | DOS; PAR intro (name list); brief | living usage | published surface | in-repo + content |
| Ohén:ton Karihwatéhkwen, "the words that come before all else" | DOS (canon field); TA attribution (1993 Six Nations Indian Museum + Tracking Project) | living rite, public surface | published surface | in-repo gloss, unmarked; no Address text quoted (fetch returned summary only — deliberate abstention) |
| Great Law recited from wampum; wampum as words riding a made thing (mechanism answer) | DOS (canon field: "recited from wampum") | living rite, public surface | published surface | in-repo |
| Confederacy founding held open: oral c. 1142 vs archaeology c. 1450 | DOS flagged array | historiography | contested, held open | in-repo |
| Handsome Lake's Gaiwiio, 1799: later word, post-contact tier, Quaker/Christian influence; "the Punisher" read backward | DOS flagged array + cosmos field | Gaiwiio | post-contact, tiered | in-repo |
| "The Evil Mind" label = partly Christian-era framing; older telling has a co-creator brother | DOS flagged array; MC display name carries the gloss; MP seat text | record's own tiering | post-contact gloss, flagged by the record itself | in-repo |
| Corpus edges: twins invert (T2); Sky Woman pairs (T2) both twins; Loki analogous T3 (to Flint); Tezcatlipoca analogous T4 (skipped in profile per brief's license) | MC edges | corpus | as tiered | in-repo |
| Zarathushtra KIN = hall's seam, not corpus edge (named so in profile); his twin-spirits-met-in-choosing line consistent with the seated profile | brief; voices/profiles/zoroastrian-zarathushtra.md | hall | seam, declared | in-repo cross-read |
| Xolotl KIN: name = word for twin; brother's death made a star | voices/profiles/aztec-xolotl.md + aztec-quetzalcoatl.md (seated canon) | hall | seated cross-reference | in-repo cross-read |
| Loki KIN: cords and a serpent's drip | voices/profiles/loki.md (seated) | hall | seated cross-reference | in-repo cross-read |
| Peacemaker held close to the good twin in some published tellings — held open, tier by telling | brief's KIN-canon note; no telling fetched this session | (none named) | held open, NOT asserted | flagged: the profile deliberately asserts nothing beyond "some published tellings hold him close" |
| Grand Council has publicly asked for restraint about False Face masks | BRIEF (care-law assertion) | living governance | modern public fact | NOT independently fetched this session — flagged for verify (the mid-1990s Haudenosaunee Confederacy policy statement on masks is the expected anchor) |
| Four insider printings as the sovereignty answer's spine (Cusick 1828 · Hewitt 1903/1928 · Parker 1923 · John Mohawk 2005) | CUS/H03/H28/PAR fetched; John Mohawk, *Iroquois Creation Story* (2005) | publication history | bibliographic | first three verified by pull; the 2005 republication is brief-supplied bibliography, no quotes taken from it |

## Researched, verified, and cut for length (available to verify/rebuild)

"And now, verily, he killed his mother." (H03-On) · "He, Sapling, said
nothing." (H03-On, sun-theft scene; final word completes across an OCR line
break) · "At the end of 10 days then she will arise again." + the failed
resurrection promise scene (H28-G; the grief answer keeps the ten-days law,
paraphrased) · "up high"/"it shall continue to give light to the earth"
(H03-On) · Cusick's clay images that "became apes" + reptiles "injurious to
mankind" · H28-notes: otkon under-earth beings formed by O'ha'a' (The
Ice-clad), doomed beneath the surface until the earth's ending; the
Cleft-in-Twain half-ice winter being (Seneca legend in H28-notes) · the third
arrow against the White Fire Dragon (H28-intro) · father's seed gift (bean,
melon, squash, tobacco, corn — H28-intro; the profile routes crops through
Parker's grave-watch only, names the telling).

## Declared inventions (the profile's own moves, no canon claim intended)

The summons law itself ("no visitor laid you side by side...") — a craft
extension of the attested arrow scene · "the room acquires a west" · per-twin
prosody laws (river-sentence; knapped sentence) · "First grave; first garden" ·
"Watch is a kind of seed" · "weather off a grief with nowhere to land" ·
"memory's grip and arrival's trust" · "what speaks here lives the way snow
lives" (mechanism formula built on the attested snow-life note) · "Loved is on
the record" · Flint's exchange confession "I went toward a lit place in a
wall" (in-voice fusion of the attested "quite transparent" / "light spots
showing through" womb details) · "He hit me with my own stone" (in-voice, from
the attested chert-strike kill) · "the falls have drowned paddlers in every
generation" (consequence inferred from the attested falls-countermaking; the
tellings do not narrate drownings) · "two hundred printed years" (1828→now,
rounded) · the exchange scenario (visitor whose birth cost the mother —
chosen per §6.2: the figure's own wound at mortal scale).

## Unverifiable / flagged for the verify pass

1. All CUS quotes rode through a WebFetch extraction model (Gutenberg #57237);
   spans kept short; check against page images.
2. OCR-corrected spans: "dead?" (printed as OCR "dead T'"), "was Snow" (OCR
   "wasSnow"), "quite" (OCR "(juite"), commas in "grandmother, who, verily,"
   (OCR prints periods). All corrections are to obvious print readings.
3. The False Face restraint request stands on the brief's authority this
   session (see table).
4. The "I had hoped..." and "It is thus sufficient..." quotes elide within
   single attested speeches (ellipses shown in-profile); no cross-source
   splicing anywhere.
5. Teller names for the three 1903 versions (commonly given as John Buck,
   John Armstrong, Seth Newhouse) were NOT verified in-session and are
   therefore absent from the profile — versions are cited as "the 1903
   Onondaga/Seneca/Mohawk telling Hewitt printed."
6. Rule-12 inventory: Flint's charges (the mother, the falls, the penned
   game) face Q1/Q3; Sapling's (deceit, the kill, the euphemism-banishment)
   face Q2; the grandmother's (the blight, the crooked favor) are kept on her
   line in FRAME and not transferred to Flint.

## Sovereignty self-audit (what was declined, and why)

- **False Face Society**: existence acknowledged in one clause; no mask
  description, no rite content, no origin story — the Hadu'i material actually
  FOUND in H03 (the disease-origin note) was left entirely unused because it
  is medicine-society-adjacent. Declined by name in the profile (Q5), citing
  the Grand Council's public request as the brief gave it.
- **Condolence**: named as a closed door with living keepers; nothing beyond
  the published outline used — in fact nothing of its content used at all.
- **Wampum**: only the published surface (the Great Law is recited from
  wampum; words ride the strings) — no belt readings, no protocol detail.
- **Living politics and land**: refused explicitly in-profile ("cosmology, not
  a delegation"); the six nations named as alive with their own council fires.
- **Variant integrity**: no blending — birth path, blame, the mother's
  becoming, and the four endings are all given BY NAMED TELLING, and the
  profile legislates "Say which book you are standing in." The Huron/Wendat
  cognate telling (Iouskeha/Tawiscaron, via the Jesuit Relations) was excluded
  entirely as a different nation's telling, though Parker's intro mentions it.
- **No invented oral tradition**: every quotation is from a named published
  printing by a named hand (three of the four insider hands — Cusick, Hewitt,
  Parker — verified at the page this session); the Thanksgiving Address is
  deliberately NOT quoted because a verbatim rendering could not be secured
  within budget.
- **The seat's warrant**: the profile's sovereignty answer rests on the
  published record's own history — the door opened from inside four times —
  and keeps the depths closed by name, which is this forge's reading of the
  brief's care law, not a claim to speak for any living nation.

## Verify pass + fixes applied (2026-07-12, orchestrator)

Adversarial verify: `teharonhiawako.verify.md` — 30+ marked spans, zero
wrong-scene, zero mis-hung variants beyond one ambiguity; **2 REFUTATIONS,
both confident-claim genus, both in the FRAME AROUND the canon** (Gibson
mis-nationed against the very book cited — H28 prints "the Seneca Federal
chief"; recording years asserted from printing years). **SOVEREIGNTY:
COMPLIANT, ZERO DEFECTS** — the 1995 Grand Council mask policy located at a
primary reproduction (Akwesasne Notes, Spring 1995); the profile understated
its force and over-complied in behavior. Verify law **14-for-14**.

**Row corrections + additions (supersede/extend the table above):**

1. Teller: John Arthur Gibson was a SENECA Federal chief dictating IN
   Onondaga (H28 pp. 453–54); PRESENCE fixed ("the Seneca chief… gave Hewitt
   in Onondaga").
2. Dates: H03's three versions recorded 1889–1897 (Buck; Armstrong;
   Newhouse — tellers now verified at H03's own intro pp. 136–37), printed
   1903; Gibson dictated 1899, printed 1928. FRAME fixed.
3. ADDED ROWS — the grief keel's two spans, previously unrowed, both REAL:
   | "Come, do thou who liest here arise again." | H28-G | oral canon
   (Gibson telling) | verify-confirmed EXACT, speaker O'ha'a'/FLINT (scene
   chain confirmed); terminal period restored inside marks |
   | "She did not stir at all." | H28-G, same scene | oral canon | EXACT |
4. OCR flag-list extended (+4, same dirt-class, all compelled print
   readings): ".stop"→"stop" (credo, H03) · "weU"→"well" (falls, H28) ·
   "rumiing"→"running" (river, H28) · "'1 now repent.'"→"'I now repent.'"
   (H03).

**Fixes applied in-voice (19 edits):** R1 teller-nation · R2 dates · O1
"Four tellings" · O2 "(the 1903 Seneca telling)" · T1 Midwinter claim
anchored to Hewitt-as-witness · F1 non-turn recoined through the seat's own
uneven-floor plant ("no question crosses the floor to them — this one never
leaves the lodge"; NOTE: verify's suggested "ask nothing back" was itself
rejected as colliding with soka-gakkai-nichiren.md's fresh coin — r13 cuts
both ways on fixes) · F2 "one strike"→"one flake" ×4 (the verify's census
listed 3; the orchestrator's own sweep found the 4th at the Q1 TURN) · F3
"Two voices before one world" · F4 charges/record recoins · F5 three
scripted first-person lines set in marks per r14 · F6 "asked three times"
(the profile's own FRAME had the third ask) · F7 light-spots phrase named to
Gibson at the seam · F8 terminal period · mask-policy line upgraded to the
policy's real force · "kill-record"→"kills" (motif thinning per census).

Exchange 240 spoken words (verify recount ✓). The dyadic law held under
attack: tags consistent, no narrator leak, "we" only at canon joins, both
prosodies enacted. The spine survived: snow-life doctrine exact and tiered
to Hewitt's note; the crooked-blame architecture confirmed at source in
both directions.
