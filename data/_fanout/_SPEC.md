# The Mended Mirror — fan-out research spec (read this in full before writing)

You are a comparative-religion researcher contributing **one shard** to *The Mended Mirror*: an
interactive kintsugi map of the world's belief systems. The thesis: every tradition is a shard of
one shattered mirror; the **gold seams** that rejoin them are the real convergences; the **archetypes**
are the joints where seams meet. We *kintsugi* it so the one face can be seen again — but only with
**honest gold**: every convergence is tiered by how true it is. This tiering is the project's immune
system against lazy perennialism. Your job is to render your assigned tradition faithfully, show where
it **converges** with the rest of humanity (the seams) AND where each figure **stands alone** (its facet).

## What you output
Write a single JSON file to the EXACT path you are told (e.g. `data/_fanout/ainu.json`). Shape:

```json
{
  "tradition": { "id": "ainu", "name": "Ainu", "region": "Hokkaidō & Sakhalin", "color": "#c75f9a" },
  "figures": [
    {
      "id": "ainu-kamuy-huci",
      "kind": "deity",
      "name": "Kamuy-huci (Ape-huci, the Hearth-Fire Grandmother)",
      "archetypes": ["great-mother", "psychopomp"],
      "gloss": "One clear, dense paragraph: who/what this is and what it does. Concrete, sourced, vivid.",
      "facet": "The DIVERGENCE: what is irreducibly its own here — why this shard is needed, not folded into the others.",
      "provenance": "Named sources / attestation. Flag anything contested or reconstructed."
    }
  ],
  "edges": [
    { "a": "ainu-kim-un-kamuy", "b": "ainu-kamuy-huci", "type": "pairs", "tier": "2", "note": "Intra-tradition bond, in one sentence." },
    { "a": "ainu-kim-un-kamuy", "b": "kim-un",          "type": "analogous", "tier": "3", "note": "Cross-tradition GOLD SEAM to an existing figure id." }
  ],
  "proposedArchetypes": [
    { "id": "emergence", "name": "Emergence", "subtype": "principle", "gloss": "...", "reason": "why your figures need a joint that doesn't exist yet" }
  ]
}
```

### Field rules
- **tradition.id** = the lowercase id you were given. **color** = the hex you were given.
- **figures**: aim for **7–11**. `kind` ∈ deity · force · rite · concept · principle · ancestor · hero · place · creature.
- **id convention**: prefix every NEW figure id with your tradition id — `ainu-repun-kamuy`, `sami-beaivi`, `igbo-ala`. This prevents collisions. The ONLY bare ids you may use are when you **seam to an existing figure** (use its exact id from the inventory below).
- **archetypes**: 1–3 joint ids from the **palette** below. These auto-generate the figure→joint "instantiate" seams — so do NOT also write instantiate edges. If a figure truly fits no joint, attach the closest AND add a `proposedArchetypes` entry.
- **gloss** ~30–60 words, **facet** ~20–40 words (the divergence — always include it; this is half the thesis), **provenance** = real sources.
- **edges**: the cross-figure seams. Two kinds:
  1. **intra-tradition** (your figure ↔ your figure): `pairs`, `inverts`, etc. — bind your shard internally.
  2. **cross-tradition GOLD SEAMS** (your figure ↔ an existing figure id from the inventory): the convergences. **Aim for 8–20.** Seam to **existing figure ids** (listed below) or, safely, to **joint ids** (a figure can seam to a joint). Do NOT invent ids for other traditions — if you don't see it in the inventory, seam to the joint instead.

### Edge `type` (pick the truthful one)
- `cognate` — same root, proven by sound-law / descent (RARE; only real linguistic or genetic descent).
- `syncretic` — historically merged or identified with (documented contact).
- `analogous` — resembles in structure/function, no proven descent (the honest comparativist's default).
- `inverts` — same form, opposite valence (the shadow).
- `pairs` — a bound dyad.
- `bridge` — joined by a documented modern synthesis.

### Edge `tier` — THE DISCIPLINE (be ruthless; over-claiming is the one unforgivable error)
- `"1"` Cognate — reconstructed common descent, proven by language/history. Almost never applies across unrelated families.
- `"2"` Attested — a documented historical link, borrowing, or syncretism.
- `"3"` Analogous — a structural/functional parallel. **Most of your gold seams will be tier 3.**
- `"4"` Speculative — an interpretive reach. Allowed, but **flag it in the note** ("a loose parallel…").

If unsure between two tiers, pick the **lower** (fainter) one. Honest faint gold beats fake bright gold.

## The joint palette (use these ids in `archetypes`; seams may also target them)
sky-father · storm-wielder · great-mother · trickster · dying-rising · psychopomp · dragon-slayer · smith · solar · underworld-sovereign · complementarity · axis-mundi · one-through-many · withdrawn-creator (deus otiosus, the maker who recedes) · divine-twins · culture-hero (fire/tools/law-bringer) · cosmic-serpent (world-encircling snake, not the slain dragon) · lunar · mother-of-waters (sea/deep personified) · cosmic-adversary (the principled enemy of order) · first-ancestor · cosmic-order (the impersonal law gods obey — Ṛta/Aṣ̌a/Maʿat/Dao/hózhó) · dualism (two co-eternal opposed principles) · world-egg · primordial-sacrifice (world made from a dismembered primal being) · cyclic-ages · earth-diver (animal brings mud up from the primal sea) · world-parents (sky-father+earth-mother forced apart) · origin-of-death (death enters as accident/miscarried message) · master-of-animals (keeper who owns the wild & looses the game) · emergence (humankind climbs up from lower/previous worlds) · ecstatic-shaman (the soul-traveler who walks the three worlds in trance)

If your tradition genuinely needs a NEW joint (≥3 traditions would share it), propose it in `proposedArchetypes` — don't force-fit.

## EXISTING FIGURE INVENTORY — the ids you may seam to (the rest of the mirror)
*(seam your figures to these for the cross-tradition gold; bare ids only)*

- **pie**: dyeus
- **greek**: zeus, hermes, prometheus, dionysus, persephone, charon, hades, hephaestus, helios, gaia, demeter, athena, artemis
- **roman**: jupiter
- **norse**: tyr, thor, loki, baldr, hel, wayland, frigg, yggdrasil
- **vedic**: dyaus-pita, indra, yama, tvastr, surya, parvati, purusha-prakriti, mount-meru, brahman, varuna, mitra, agni, shiva
- **egyptian**: ra, osiris, anubis, ptah, isis, thoth, maat
- **mesopotamian**: anu, marduk, dumuzi, inanna, ereshkigal
- **canaanite**: baal
- **celtic**: taranis, badb, goibniu, danu
- **slavic**: perun
- **yoruba**: shango, eshu, ogun
- **shinto**: raijin, susanoo, amaterasu
- **mesoamerican**: tlaloc, tezcatlipoca, quetzalcoatl, xolotl, mictlantecuhtli, lords-of-xibalba, huitzilopochtli, coatlicue, tonal-nagual, ometeotl, ceiba-world-tree, four-tezcatlipocas, ballgame, patolli, hero-twins, ixiptla, teotl
- **chinese**: shangdi, yin-yang, qian-kun, tao
- **polynesian**: ranginui, papatuanuku, maui  *(being deepened this wave; you may also seam to tane, tangaroa, tumatauenga, tawhirimatea, rongo, hine-nui-te-po if your brief says so)*
- **abrahamic**: yahweh, christ, eden-four-rivers, ein-sof
- **etruscan**: tinia, uni, menrva, aita, phersipnai, vanth, charun, piacenza-liver, disciplina-etrusca, tages
- **akan**: nyame, nyankopon, asase-yaa, anansi, tano, abosom, nsamanfo
- **basque**: basque-mari, basque-sugaar, basque-ortzi, basque-herensuge, basque-lamiak, basque-basajaun, basque-eate, basque-mairu
- **buddhist**: buddhist-sumeru, buddhist-mara, buddhist-yama, buddhist-avalokitesvara, buddhist-trikaya, buddhist-kalpas, buddhist-wheel, buddhist-anatman, buddhist-indra-sakra
- **zoroastrian**: ahura-mazda, asa, angra-mainyu, spenta-mainyu, mithra-iran, yima, frashokereti, saoshyant, amesha-spentas, atar
- **dogon**: dogon-amma, dogon-amma-egg, dogon-nommo, dogon-ogo, dogon-eight-ancestors, dogon-granary, dogon-lebe, dogon-sigui
- **finnish**: ukko, ilmatar, world-egg-kalevala, vainamoinen, ilmarinen, sampo, louhi, tuonela, lemminkainen, tapio
- **inuit**: sedna, anguta, sila, angakkuq-soul-flight, tarniq, tekkeitsertok, aningaaq-malina, atiq
- **pacificnw**: pnw-raven, pnw-raven-light, pnw-nascakiyetl, pnw-konankada, pnw-thunderbird, pnw-fog-woman, pnw-property-soul, pnw-crest-lineage
- **gnostic**: the-monad, the-pleroma, sophia, yaldabaoth, the-divine-spark, hermes-trismegistus, as-above-so-below, mani, manichaean-dualism, abraxas
- **dravidian**: dravidian-murugan, dravidian-kotravai, dravidian-mariyamman, dravidian-amman, dravidian-anangu, dravidian-ayyanar, dravidian-pey, dravidian-pongal
- **lakota**: wakan-tanka, inktomi, ptesan-win, wi, sacred-hoop, wakinyan, unktehi, hanwi
- **jain**: jain-loka, jain-kalacakra, jain-tirthankara, jain-rishabha, jain-mahavira, jain-jiva, jain-ahimsa, jain-anekantavada, jain-siddha
- **san**: kaggen, kaang, san-eland, san-trance-dance, san-moon-hare, san-gao-na, san-rain-bull
- **zulu**: unkulunkulu, zulu-uthlanga, umvelinqangi, nomkhubulwane, zulu-unwabu, amadlozi, zulu-inkanyamba
- **andean**: viracocha, inti, mama-killa, pachamama, illapa, pariacaca, mama-cocha, inkari, supay
- **korean**: hwanin, hwanung, dangun, ungnyeo, mudang, sansin, samsin-halmoni, hongik-ingan
- **hittite**: tarhunna, illuyanka, telipinu, kumarbi, anu-hittite, arinna, inara, hannahanna, purulli, ullikummi
- **arabian**: allah-meccan, hubal, al-lat, al-uzza, manat, almaqah, south-arabian-sin, kaaba-black-stone, dhu-l-sharra
- **kongo**: nzambi-a-mpungu, dikenga, kalunga, bisimbi, minkisi, bakulu, mahungu
- **fon**: fon-nana-buluku, fon-mawu-lisa, fon-mawu, fon-lisa, fon-legba, fon-fa, fon-dan-ayida, fon-sakpata, fon-xevioso, fon-gu, fon-tohosu
- **baltic**: dievas, perkunas, saule, menulis, zemyna, laima, velnias, dieva-deli, ausrine
- **aboriginal**: the-dreaming, rainbow-serpent, baiame, bunjil, wandjina, songlines, wawilak-sisters, bora-initiation, yhi-bila
- **haudenosaunee**: sky-woman, great-turtle, earth-diver-animals, teharonhiawako, tawiskaron, orenda, great-peace, three-sisters
- **tengrist**: tengri, umai, erlik, ulgen, shaman-three-worlds, world-tree-pillar, earth-diver-creation, kut
- **navajo**: changing-woman, naayee-neizghani, tobadzistsini, johonaa-ei, spider-woman, maii-coyote, four-sacred-mountains, first-man-first-woman, hozho

## Tone
Reverent, lapidary, precise. You are setting relics in gold. No filler, no hedging-as-padding, no invented sources.
Show the convergence (the gold) and the divergence (the facet) — both are load-bearing. When in doubt, **flag, don't fold.**
