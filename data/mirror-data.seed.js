/* ============================================================================
   THE MENDED MIRROR  —  seed dataset (working title; the name will earn itself)
   ----------------------------------------------------------------------------
   A kintsugi of the world's belief systems. Each pantheon is a shard of one
   broken mirror; the gold seams are the convergences that rejoin them. The
   archetypes are the joints where seams meet.

   Evidence is TIERED, always — convergence is only as gold as it is true:
     1 cognate     reconstructed common descent (proven by language/history)
     2 attested    documented historical link or syncretism
     3 analogous   structural / functional parallel (the comparativist's claim)
     4 speculative interpretive reach (flagged as such)
     forgery       fabricated — fool's gold; its seam points home to the real

   Convergence proves it was once one mirror. Divergence (each figure's `facet`)
   proves we need every shard to see the whole face. Both are load-bearing.
   ============================================================================ */
window.MIRROR_DATA = {
  meta: {
    workingTitle: "The Mended Mirror",
    subtitle: "a kintsugi of the world's pantheons",
    purpose: "mending the mirror — so the one face can be seen again",
    note: "Working title only. The seed is a vertical slice; the fan-out fills the rest of the human race."
  },

  tiers: {
    "1":       { name: "Cognate",     gold: "#ffd86b", weight: 2.6, desc: "Reconstructed common descent — proven by language or history. The brightest gold." },
    "2":       { name: "Attested",    gold: "#e6ad44", weight: 2.0, desc: "A documented historical link or syncretism." },
    "3":       { name: "Analogous",   gold: "#c19a52", weight: 1.4, desc: "A structural or functional parallel — the comparativist's honest claim." },
    "4":       { name: "Speculative", gold: "#8f8c79", weight: 0.9, desc: "An interpretive reach — flagged, not hidden." },
    "forgery": { name: "Forgery",     gold: "#6f7c4c", weight: 1.2, desc: "Fabricated — fool's gold. Its seam points home to the real thing it imitated." }
  },

  edgeTypes: {
    instantiates: { label: "instantiates",  desc: "This figure fulfils this archetype." },
    cognate:      { label: "cognate of",    desc: "Same root, proven by sound-law or descent." },
    syncretic:    { label: "syncretised",   desc: "Historically merged or identified with." },
    analogous:    { label: "parallels",     desc: "Resembles in structure or function, without proven descent." },
    bridge:       { label: "bridged to",    desc: "Joined by a documented modern synthesis." },
    inverts:      { label: "inverts",       desc: "The same form, opposite in valence — the shadow." },
    pairs:        { label: "paired with",   desc: "A bound dyad within or across traditions." },
    forgery:      { label: "points home to",desc: "A fabricated shard, its seam aimed back at the genuine line." }
  },

  /* ---- the shards ---- */
  traditions: {
    pie:          { name: "Proto-Indo-European", region: "reconstructed ancestor", color: "#d9c9a3" },
    greek:        { name: "Greek",               region: "Mediterranean",          color: "#6fa8c7" },
    roman:        { name: "Roman",               region: "Mediterranean",          color: "#a87fb0" },
    norse:        { name: "Norse / Germanic",    region: "Northern Europe",         color: "#8fb3c9" },
    vedic:        { name: "Vedic / Hindu",       region: "South Asia",              color: "#d99a4e" },
    egyptian:     { name: "Egyptian",            region: "Nile",                    color: "#37b0a0" },
    mesopotamian: { name: "Mesopotamian",        region: "Fertile Crescent",        color: "#c08a5a" },
    canaanite:    { name: "Canaanite / Levantine",region: "Levant",                 color: "#b5763f" },
    celtic:       { name: "Celtic",              region: "Western Europe",          color: "#7fae6a" },
    slavic:       { name: "Slavic",              region: "Eastern Europe",          color: "#cf6b52" },
    yoruba:       { name: "Yoruba",              region: "West Africa",             color: "#d8576a" },
    shinto:       { name: "Shinto",              region: "Japan",                   color: "#e0857f" },
    mesoamerican: { name: "Mesoamerican",        region: "Mexico & Maya lands",     color: "#54c08a" },
    chinese:      { name: "Chinese (I Ching / Tao)", region: "East Asia",           color: "#d65447" },
    polynesian:   { name: "Polynesian",          region: "Oceania",                 color: "#4fb0bf" },
    abrahamic:    { name: "Abrahamic",           region: "Near East → global",      color: "#e6dcae" },
    castaneda:    { name: "Castaneda (forged)",  region: "20th-c. fabrication",     color: "#6f7c4c" }
  },

  /* ---- the joints: where seams meet ---- */
  archetypes: [
    { id: "sky-father",   kind: "archetype", subtype: "character", name: "Sky-Father",
      gloss: "The bright daylit heaven as paternal sovereign — the sky that fathers the order of gods and kings." },
    { id: "storm-wielder",kind: "archetype", subtype: "character", name: "Storm-Wielder",
      gloss: "Thunder, lightning and rain as a warrior's weapon — the sky striking the earth." },
    { id: "great-mother", kind: "archetype", subtype: "character", name: "Great Mother",
      gloss: "Earth, fertility and sovereignty as the generative mother who gives life and takes it back." },
    { id: "trickster",    kind: "archetype", subtype: "character", name: "Trickster",
      gloss: "The boundary-crosser — shapeshifter, fire-thief, culture-bringer, holy fool: the chaos that creates." },
    { id: "dying-rising", kind: "archetype", subtype: "character", name: "Dying-and-Rising",
      gloss: "The god who descends into death and returns; vegetation, renewal, resurrection.",
      provenance: "A contested category: James Frazer over-extended it and Jonathan Z. Smith dismantled the loose version. Tiered carefully here, not assumed." },
    { id: "psychopomp",   kind: "archetype", subtype: "character", name: "Psychopomp",
      gloss: "The guide of souls across the threshold — the one who knows both sides of the door." },
    { id: "dragon-slayer",kind: "archetype", subtype: "character", name: "Dragon-Slayer",
      gloss: "Chaoskampf: order's champion against the chaos-serpent. Often the world is made by the killing of the monster." },
    { id: "smith",        kind: "archetype", subtype: "character", name: "Smith",
      gloss: "The divine craftsman — fire mastered into form; maker of the gods' tools and the world's order." },
    { id: "solar",        kind: "archetype", subtype: "character", name: "Solar",
      gloss: "The sun as deity and as the all-seeing eye of heaven." },
    { id: "underworld-sovereign", kind: "archetype", subtype: "character", name: "Underworld Sovereign",
      gloss: "The ruler of the land of the dead — keeper of what lies below." },
    { id: "complementarity", kind: "archetype", subtype: "principle", name: "Complementarity",
      gloss: "The two-that-are-one: paired opposites whose tension is the engine of reality — light/dark, known/unknown, creative/receptive." },
    { id: "axis-mundi",   kind: "archetype", subtype: "principle", name: "Axis & Quartered Cosmos",
      gloss: "The center that holds — world-tree or mountain joining the realms — and the four directions quartering the cosmos around it (the quincunx)." },
    { id: "one-through-many", kind: "archetype", subtype: "principle", name: "The One Through Many",
      gloss: "A single divine reality manifesting through countless vessels — the One that is also All.",
      provenance: "The mirror's own thesis. Stated outright by some traditions (Brahman, teōtl, the Dao); it is assembled here from them, not imposed on them." }
  ],

  /* ---- the figures: deities, forces, rites ---- */
  figures: [
    /* SKY-FATHER — the cognate flagship */
    { id: "dyeus", tradition: "pie", kind: "reconstruction", name: "Dyēus Ph₂tḗr", archetypes: ["sky-father"],
      gloss: "The reconstructed Proto-Indo-European 'Sky Father' — the ancestor from whom Zeus, Jupiter, Dyaus and Tyr descend by regular sound-law.",
      facet: "Not a myth but a reconstruction: proof, from language alone, that the mirror was once whole." },
    { id: "zeus", tradition: "greek", kind: "deity", name: "Zeus", archetypes: ["sky-father", "storm-wielder"],
      gloss: "King of the Olympians; sky, thunder, law and kingship." },
    { id: "jupiter", tradition: "roman", kind: "deity", name: "Jupiter", archetypes: ["sky-father", "storm-wielder"],
      gloss: "Iuppiter — sky-father and sovereign of the Roman state, 'best and greatest'; his name the literal cognate of Zeus-pater." },
    { id: "dyaus-pita", tradition: "vedic", kind: "deity", name: "Dyáuṣ Pitṛ́", archetypes: ["sky-father"],
      gloss: "The Vedic Sky Father — by name the exact cognate of Zeus-patēr and Jupiter, though already fading in the Rig Veda." },
    { id: "tyr", tradition: "norse", kind: "deity", name: "Týr", archetypes: ["sky-father"],
      gloss: "Týr (Tiwaz) — once the chief sky-god of the Germanic peoples, his very name the cognate of Dyēus.",
      facet: "The shard that faded: a sky-father demoted to a one-handed war-god — evidence of how a pantheon overwrites its own past." },
    { id: "anu", tradition: "mesopotamian", kind: "deity", name: "An / Anu", archetypes: ["sky-father"],
      gloss: "The remote sky-father at the head of the Sumerian pantheon — authority so high it barely acts." },
    { id: "ranginui", tradition: "polynesian", kind: "deity", name: "Ranginui", archetypes: ["sky-father"],
      gloss: "The Sky Father locked in embrace with Papatūānuku the Earth Mother until their children pried them apart.",
      facet: "Here the sky-father is a lover and a prisoner, not a king — and prying him loose is the birth of the world." },
    { id: "shangdi", tradition: "chinese", kind: "deity", name: "Shàngdì / Tiān", archetypes: ["sky-father"],
      gloss: "The supreme 'High God' and impersonal Heaven that grants and withdraws the mandate of kings." },

    /* STORM-WIELDER */
    { id: "thor", tradition: "norse", kind: "deity", name: "Þórr (Thor)", archetypes: ["storm-wielder", "dragon-slayer"],
      gloss: "Thunder-god with the hammer Mjölnir; defender of gods and men against giants and the world-serpent." },
    { id: "indra", tradition: "vedic", kind: "deity", name: "Indra", archetypes: ["storm-wielder", "dragon-slayer"],
      gloss: "Wielder of the vajra (thunderbolt), king of the gods, who slays the drought-serpent Vṛtra to release the waters." },
    { id: "perun", tradition: "slavic", kind: "deity", name: "Perun", archetypes: ["storm-wielder", "dragon-slayer"],
      gloss: "Slavic thunder-god — his name from PIE *Perkʷūnos — eternally striking the serpent Veles from his oak.",
      facet: "Among the best-preserved Indo-European storm names; the Baltic Perkūnas is his near-twin." },
    { id: "taranis", tradition: "celtic", kind: "deity", name: "Taranis", archetypes: ["storm-wielder"],
      gloss: "Gaulish 'Thunderer', wheel in hand — his name is simply the Celtic word for thunder." },
    { id: "shango", tradition: "yoruba", kind: "deity", name: "Ṣàngó", archetypes: ["storm-wielder"],
      gloss: "Òrìṣà of thunder and lightning — a deified king who hurls thunderstones from the sky.",
      facet: "A god who was once a human king: divinity earned by rule and remembered in storm." },
    { id: "baal", tradition: "canaanite", kind: "deity", name: "Baʿal Hadad", archetypes: ["storm-wielder", "dragon-slayer"],
      gloss: "Canaanite storm-and-rain god who defeats Yam, the chaos-sea, to win his kingship." },
    { id: "tlaloc", tradition: "mesoamerican", kind: "deity", name: "Tlāloc", archetypes: ["storm-wielder"],
      gloss: "Aztec god of rain, lightning and mountains — giver of water, and keeper of the drowned in a paradise of his own." },
    { id: "raijin", tradition: "shinto", kind: "deity", name: "Raijin", archetypes: ["storm-wielder"],
      gloss: "Japanese thunder-god, ringed by the drums he beats to make the storm." },
    { id: "susanoo", tradition: "shinto", kind: "deity", name: "Susanoo", archetypes: ["storm-wielder", "dragon-slayer", "trickster"],
      gloss: "Tempestuous storm-god, exiled brother of the sun, who slays the eight-headed serpent Yamata-no-Orochi." },

    /* DRAGON-SLAYER (non-storm) */
    { id: "marduk", tradition: "mesopotamian", kind: "deity", name: "Marduk", archetypes: ["dragon-slayer", "sky-father"],
      gloss: "Babylon's champion who splits the chaos-dragon Tiāmat and builds heaven and earth from her body.",
      facet: "Here the slaying is the creation — the cosmos is literally made from the monster's corpse." },
    { id: "ra", tradition: "egyptian", kind: "deity", name: "Ra", archetypes: ["solar", "dragon-slayer"],
      gloss: "The sun, who each night sails the underworld and slays the chaos-serpent Apophis to be reborn at dawn.",
      facet: "The dragon is killed every single night — order is never won once, only re-won at each sunrise." },
    { id: "yahweh", tradition: "abrahamic", kind: "deity", name: "YHWH", archetypes: ["dragon-slayer", "sky-father", "one-through-many"],
      gloss: "In the oldest Hebrew poetry, the storm-God who crushes the heads of Leviathan and Rahab — before becoming the sole God beyond all pantheons.",
      facet: "The shard that swallowed the others: a storm-and-dragon-slayer who became radical monotheism." },

    /* TRICKSTER */
    { id: "hermes", tradition: "greek", kind: "deity", name: "Hermes", archetypes: ["trickster", "psychopomp"],
      gloss: "Messenger, thief, god of boundaries, roads and luck — and the guide who walks the dead down to Hades." },
    { id: "loki", tradition: "norse", kind: "deity", name: "Loki", archetypes: ["trickster"],
      gloss: "Shapeshifting boundary-walker; companion and saboteur of the gods, father of monsters, the fuse of Ragnarök." },
    { id: "prometheus", tradition: "greek", kind: "deity", name: "Prometheus", archetypes: ["trickster", "smith"],
      gloss: "Titan who steals fire from heaven for humankind and is chained to a rock to be devoured for it, daily, forever.",
      facet: "The trickster as martyr — theft as the founding act of human civilization." },
    { id: "maui", tradition: "polynesian", kind: "deity", name: "Māui", archetypes: ["trickster"],
      gloss: "Demigod who snares the sun to slow the day, fishes whole islands from the sea, and steals fire for people." },
    { id: "eshu", tradition: "yoruba", kind: "deity", name: "Èṣù (Elegba)", archetypes: ["trickster", "psychopomp"],
      gloss: "Òrìṣà of the crossroads and divine messenger — no prayer or offering reaches the gods except through him.",
      facet: "Not a rogue but a required gate: the trickster as the indispensable translator between human and divine." },
    { id: "tezcatlipoca", tradition: "mesoamerican", kind: "deity", name: "Tezcatlipoca", archetypes: ["trickster", "sky-father"],
      gloss: "'Smoking Mirror' — the Black Tezcatlipoca of the North; god of night, sorcery, fate and the obsidian scrying-glass.",
      facet: "His attribute is an obsidian mirror that shows the soul its own hidden face. This whole mirror is his instrument." },

    /* DYING-AND-RISING */
    { id: "osiris", tradition: "egyptian", kind: "deity", name: "Osiris", archetypes: ["dying-rising", "underworld-sovereign"],
      gloss: "Murdered and dismembered, reassembled and risen to rule the dead — the template of resurrection for every Egyptian soul." },
    { id: "dionysus", tradition: "greek", kind: "deity", name: "Dionysus", archetypes: ["dying-rising"],
      gloss: "Twice-born god of the vine, ecstasy and the dissolving of the self — torn apart and reborn." },
    { id: "persephone", tradition: "greek", kind: "deity", name: "Persephone", archetypes: ["dying-rising", "great-mother"],
      gloss: "Carried into the underworld, returning each spring; her descent and return is the turning of the year." },
    { id: "dumuzi", tradition: "mesopotamian", kind: "deity", name: "Dumuzi (Tammuz)", archetypes: ["dying-rising"],
      gloss: "Shepherd-consort of Inanna, surrendered to the underworld and released for half the year — wept for across the ancient Near East." },
    { id: "inanna", tradition: "mesopotamian", kind: "deity", name: "Inanna (Ishtar)", archetypes: ["dying-rising", "great-mother"],
      gloss: "Queen of heaven who descends through seven gates into death, hangs as a corpse, and returns — love and war in one body." },
    { id: "baldr", tradition: "norse", kind: "deity", name: "Baldr", archetypes: ["dying-rising"],
      gloss: "The shining god whose death darkens the world; he returns only after Ragnarök, to rule the world reborn.",
      facet: "The only resurrection that waits for the end — renewal deferred past the apocalypse itself." },
    { id: "quetzalcoatl", tradition: "mesoamerican", kind: "deity", name: "Quetzalcōātl", archetypes: ["dying-rising", "trickster", "sky-father"],
      gloss: "The Feathered Serpent — White Tezcatlipoca of the West; culture-bringer who burns himself and rises as the morning star, vowing to return.",
      facet: "Sky and earth fused in one body — the feathers of heaven's bird on the serpent of the ground: opposites reconciled." },
    { id: "christ", tradition: "abrahamic", kind: "deity", name: "Christ", archetypes: ["dying-rising"],
      gloss: "In Christian belief, crucified and risen on the third day — death undone for all who follow.",
      facet: "The one case its tradition insists is literal history, not seasonal symbol — which is exactly the fault-line of the whole comparison." },

    /* PSYCHOPOMP */
    { id: "anubis", tradition: "egyptian", kind: "deity", name: "Anubis", archetypes: ["psychopomp"],
      gloss: "Jackal-headed guardian who embalms the dead and weighs the heart against the feather of truth." },
    { id: "charon", tradition: "greek", kind: "deity", name: "Charon", archetypes: ["psychopomp"],
      gloss: "The ferryman who carries the dead across the Styx — for a coin, and only for the buried." },
    { id: "hel", tradition: "norse", kind: "deity", name: "Hel", archetypes: ["psychopomp", "underworld-sovereign"],
      gloss: "Half-living, half-corpse goddess who keeps those who die of sickness and old age." },
    { id: "yama", tradition: "vedic", kind: "deity", name: "Yama", archetypes: ["psychopomp", "underworld-sovereign"],
      gloss: "The first man to die — who therefore became lord of the dead and judge of the road they walk." },
    { id: "xolotl", tradition: "mesoamerican", kind: "deity", name: "Xōlōtl", archetypes: ["psychopomp"],
      gloss: "Dog-headed twin of Quetzalcoatl who guides the sun, and the dead, through the underworld.",
      facet: "The dog who walks the dead home — which is why a dog was buried with the Aztec deceased." },
    { id: "badb", tradition: "celtic", kind: "deity", name: "The Mórrígan (Badb)", archetypes: ["psychopomp"],
      gloss: "Shape-shifting crow-goddess of battle, fate and death, who decides who falls and washes their bloodied arms at the ford." },

    /* UNDERWORLD SOVEREIGN */
    { id: "hades", tradition: "greek", kind: "deity", name: "Hades", archetypes: ["underworld-sovereign"],
      gloss: "The unseen one — lord of the dead and of the wealth that lies beneath the earth." },
    { id: "mictlantecuhtli", tradition: "mesoamerican", kind: "deity", name: "Mictlāntēcuhtli", archetypes: ["underworld-sovereign"],
      gloss: "Skeletal lord of Mictlan, the lowest underworld, where most of the dead complete a four-year journey to rest." },
    { id: "ereshkigal", tradition: "mesopotamian", kind: "deity", name: "Ereshkigal", archetypes: ["underworld-sovereign", "great-mother"],
      gloss: "Queen of the great below, sister of Inanna, before whom even gods must strip away every emblem of power." },
    { id: "lords-of-xibalba", tradition: "mesoamerican", kind: "deity", name: "Lords of Xibalba", archetypes: ["underworld-sovereign"],
      gloss: "One Death and Seven Death — the death-gods of the Maya underworld who summon the Hero Twins to the killing-game." },

    /* SMITH */
    { id: "hephaestus", tradition: "greek", kind: "deity", name: "Hephaestus", archetypes: ["smith"],
      gloss: "Lamed smith of Olympus who forges the gods' weapons — and shapes the first woman out of clay." },
    { id: "wayland", tradition: "norse", kind: "deity", name: "Völundr (Wayland)", archetypes: ["smith"],
      gloss: "Master-smith of legend — hamstrung and held captive, who forges out of his suffering a terrible revenge." },
    { id: "ptah", tradition: "egyptian", kind: "deity", name: "Ptah", archetypes: ["smith", "sky-father"],
      gloss: "Craftsman-creator of Memphis who thinks the world in his heart and speaks it into being with his tongue.",
      facet: "Creation as craft and word rather than battle — the artisan as the first cause." },
    { id: "goibniu", tradition: "celtic", kind: "deity", name: "Goibniu", archetypes: ["smith"],
      gloss: "Smith of the Túatha Dé Danann whose weapons never miss, and whose ale grants the gods their deathlessness." },
    { id: "ogun", tradition: "yoruba", kind: "deity", name: "Ògún", archetypes: ["smith"],
      gloss: "Òrìṣà of iron, war and the clearing of the path — patron of every craft that bites with metal.",
      facet: "The smith who is also the road-opener: iron as the tool that cuts the way into the future." },
    { id: "tvastr", tradition: "vedic", kind: "deity", name: "Tvaṣṭṛ", archetypes: ["smith"],
      gloss: "The divine artisan who shapes all forms in the womb and forges Indra's thunderbolt." },

    /* SOLAR */
    { id: "helios", tradition: "greek", kind: "deity", name: "Helios", archetypes: ["solar"],
      gloss: "The sun who sees and hears all things, driving his fiery chariot from edge to edge of the sky." },
    { id: "surya", tradition: "vedic", kind: "deity", name: "Sūrya", archetypes: ["solar"],
      gloss: "The sun-god, eye of the heavens, drawn across the day by seven horses." },
    { id: "amaterasu", tradition: "shinto", kind: "deity", name: "Amaterasu", archetypes: ["solar", "sky-father"],
      gloss: "The sun goddess from whom Japan's emperors descend; when she hides in her cave, all the world goes dark.",
      facet: "The sun as she — and as ancestral sovereign — overturning the usual male-solar pattern in a single stroke." },
    { id: "huitzilopochtli", tradition: "mesoamerican", kind: "deity", name: "Huītzilōpōchtli", archetypes: ["solar", "dragon-slayer"],
      gloss: "The Blue Tezcatlipoca of the South — sun-and-war god who must be fed hearts to keep the sun in motion.",
      facet: "The sun that demands blood: cosmic maintenance reimagined as the engine of an empire." },

    /* GREAT MOTHER */
    { id: "gaia", tradition: "greek", kind: "deity", name: "Gaia", archetypes: ["great-mother"],
      gloss: "The Earth herself — first mother, from whom sky, sea and the elder gods are born." },
    { id: "demeter", tradition: "greek", kind: "deity", name: "Demeter", archetypes: ["great-mother"],
      gloss: "Goddess of grain and harvest, whose grief for stolen Persephone is the world's first winter." },
    { id: "isis", tradition: "egyptian", kind: "deity", name: "Isis", archetypes: ["great-mother"],
      gloss: "Great of magic — who gathers the pieces of murdered Osiris, mothers the rightful king, and is adored from the Nile to Rome." },
    { id: "parvati", tradition: "vedic", kind: "deity", name: "Pārvatī / Devī", archetypes: ["great-mother"],
      gloss: "The Great Goddess in all her forms — gentle Parvati, fierce Durga, devouring Kali — the śakti that powers the gods.",
      facet: "One goddess who is every goddess: divinity that refuses to stay a single face." },
    { id: "frigg", tradition: "norse", kind: "deity", name: "Frigg", archetypes: ["great-mother"],
      gloss: "Queen of the Æsir, who knows the fate of all things and tells it to no one." },
    { id: "danu", tradition: "celtic", kind: "deity", name: "Danu", archetypes: ["great-mother"],
      gloss: "Ancestral mother of the Túatha Dé Danann — the very 'people of the goddess Danu'." },
    { id: "coatlicue", tradition: "mesoamerican", kind: "deity", name: "Cōātlīcue", archetypes: ["great-mother"],
      gloss: "'Serpent-Skirt' — earth-mother of the gods, wearing a necklace of hearts and hands; she who births life and eats it back.",
      facet: "The mother who is also the grave — birth and death worn on one terrible body." },
    { id: "papatuanuku", tradition: "polynesian", kind: "deity", name: "Papatūānuku", archetypes: ["great-mother"],
      gloss: "The Earth Mother, held apart from her sky-husband Ranginui so that light and life can fill the space between." },

    /* COMPLEMENTARITY (principles) */
    { id: "yin-yang", tradition: "chinese", kind: "principle", name: "Yīn–Yáng", archetypes: ["complementarity"],
      gloss: "The two interpenetrating principles — dark and light, receptive and creative — each holding the seed of the other; the root of the I Ching's sixty-four changes." },
    { id: "tonal-nagual", tradition: "mesoamerican", kind: "principle", name: "Tonal & Nagual", archetypes: ["complementarity", "one-through-many"],
      gloss: "In the grounded Toltec lineage William Douglas Horden learned from real Tarahumara shamans: the tonal, the island of the known; the nagual, the boundless unknown from which it rises.",
      facet: "The known and the unknown as one reality seen from two sides — Horden's life-work bridges it to the I Ching.",
      provenance: "Sourced to Horden's named lineage (Tarahumara shamans of the Copper Canyon; I Ching master Khigh Alx Dhiegh) — deliberately NOT to Castaneda's fabricated version (see the forgery node)." },
    { id: "purusha-prakriti", tradition: "vedic", kind: "principle", name: "Puruṣa & Prakṛti", archetypes: ["complementarity"],
      gloss: "Consciousness and nature — the still witness and the dancing world — whose interplay is the whole of manifest existence." },
    { id: "qian-kun", tradition: "chinese", kind: "principle", name: "Qián & Kūn", archetypes: ["complementarity", "sky-father", "great-mother"],
      gloss: "The Creative (pure yang, Heaven) and the Receptive (pure yin, Earth) — the first two trigrams and parents of the other six." },
    { id: "ometeotl", tradition: "mesoamerican", kind: "deity", name: "Ometēotl", archetypes: ["complementarity", "sky-father"],
      gloss: "The dual 'Two-God', lord-and-lady of the highest heaven, from whom the four Tezcatlipocas are born.",
      facet: "Not a father but a father-mother in one — the highest sovereignty imagined as an irreducible pair." },
    { id: "castaneda-tonal-nagual", tradition: "castaneda", kind: "forgery", name: "Castaneda's 'Tonal & Nagual'", archetypes: ["complementarity"],
      gloss: "The version most of the world knows — from Carlos Castaneda's Don Juan books. Richard de Mille documented it as fabrication: no Yaqui words in books about a Yaqui sorcerer, library records placing Castaneda at UCLA during his 'desert fieldwork', a 47-page glossary of plagiarised sources.",
      facet: "The forged shard, kept in deliberately so the real seam can be told from the fake. Its line points home to the grounded Toltec lineage it imitated.",
      provenance: "de Mille, The Don Juan Papers (1980); 'the greatest anthropological hoax since Piltdown Man'." },

    /* AXIS & QUARTERED COSMOS */
    { id: "yggdrasil", tradition: "norse", kind: "principle", name: "Yggdrasil", archetypes: ["axis-mundi"],
      gloss: "The world-ash whose roots and branches bind the nine worlds — the still center on which everything turns." },
    { id: "mount-meru", tradition: "vedic", kind: "principle", name: "Mount Meru", archetypes: ["axis-mundi"],
      gloss: "The golden world-mountain at the center of the universe, around which sun, moon and stars revolve." },
    { id: "ceiba-world-tree", tradition: "mesoamerican", kind: "principle", name: "The Ceiba (Yaxche)", archetypes: ["axis-mundi"],
      gloss: "The green world-tree at the center, with four coloured ceibas at the corners holding up the sky — roots in the underworld, crown in the heavens." },
    { id: "four-tezcatlipocas", tradition: "mesoamerican", kind: "principle", name: "The Four Tezcatlipocas", archetypes: ["axis-mundi", "complementarity"],
      gloss: "Black (North), Red/Xipe Totec (East), Blue/Huitzilopochtli (South), White/Quetzalcoatl (West) — the sons of the dual god who quarter the cosmos and hold its balance.",
      facet: "Sovereignty as four rival brothers in dynamic tension — order as a standoff, not a throne." },
    { id: "eden-four-rivers", tradition: "abrahamic", kind: "principle", name: "Eden: Tree & Four Rivers", archetypes: ["axis-mundi"],
      gloss: "The tree of life at the center of the garden, and four rivers running out to the four quarters of the earth." },

    /* THE BALLGAME COMPLEX */
    { id: "ballgame", tradition: "mesoamerican", kind: "rite", name: "The Ballgame (Ōllamaliztli)", archetypes: ["dragon-slayer"],
      gloss: "The rubber-ball game played on an I-shaped court: a cosmic contest of life against death, sun against underworld, enacted with human bodies — and sometimes settled with human blood.",
      facet: "Not a metaphor performed but a rite enacted: at this game the Hero Twins out-played death itself and rose as the sun and the moon.",
      provenance: "The cosmic ballgame and the Hero-Twins myth are firmly attested (Popol Vuh). A distinct game from patolli — the athletic court, not the four-directions board." },
    { id: "patolli", tradition: "mesoamerican", kind: "rite", name: "Patolli", archetypes: ["axis-mundi"],
      gloss: "The Aztec board game whose cross-shaped board is a quincunx — four arms aligned to the four cardinal directions around a center, a 52-space circuit matching the Calendar Round. Played for ruinous stakes under Macuilxōchitl, god of games, and consulted as an oracle.",
      facet: "The board IS the quartered cosmos: to play is to walk a token through the four directions of the world — and to read fate by doing so. The four-directions worldview made playable.",
      provenance: "Board-as-four-directions cosmogram is attested — Caso found the stone Pedregal board aligned exactly to the cardinal points; the 52-space circuit = the Calendar Round. Oracle/divination use is well-founded scholarship (Durán; Mexicolore). The modern 'four players each embody a direction' overlay is NOT pre-Columbian and is deliberately left out." },
    { id: "hero-twins", tradition: "mesoamerican", kind: "deity", name: "Hunahpú & Xbalanqué", archetypes: ["dragon-slayer", "dying-rising"],
      gloss: "The Hero Twins of the Popol Vuh, who beat the Lords of Xibalba at their own ballgame, are killed, return, and rise as the sun and the moon." },
    { id: "ixiptla", tradition: "mesoamerican", kind: "concept", name: "Ixiptla (teixiptla)", archetypes: ["one-through-many"],
      gloss: "A person or object that takes on the 'skin' of a god and becomes the living vessel through which teōtl — the one divine force — acts in the world.",
      facet: "The Aztec word for this mirror's own thesis: one force, countless eyes. The god plays through the human the way the player plays the game.",
      provenance: "From Nahuatl xip ('to flay / take the skin') + ixtli ('face / surface'). Bassett, The Fate of Earthly Things; Hvidtfeldt, Teōtl and Ixiptlatli." },

    /* THE ONE THROUGH MANY */
    { id: "teotl", tradition: "mesoamerican", kind: "principle", name: "Teōtl", archetypes: ["one-through-many"],
      gloss: "Not 'a god' but the single sacred energy that is everything, ceaselessly self-transforming — the gods are its faces, the ixiptla its vessels." },
    { id: "brahman", tradition: "vedic", kind: "principle", name: "Brahman / Ātman", archetypes: ["one-through-many", "complementarity"],
      gloss: "The one reality behind all — and the self within (Ātman) is identical to it. Tat tvam asi: thou art that.",
      facet: "States outright what the mirror only assembles: the many are one, and you are it." },
    { id: "tao", tradition: "chinese", kind: "principle", name: "The Dào", archetypes: ["one-through-many"],
      gloss: "The nameless way that gives rise to the one, the two, and the ten-thousand things — the source you can never stand outside of." },
    { id: "ein-sof", tradition: "abrahamic", kind: "principle", name: "Ein Sof", archetypes: ["one-through-many"],
      gloss: "In Kabbalah, the infinite-without-end, beyond name or attribute, from which the ten sefirot pour out to make a knowable God." },

    /* ---- ANCHOR DEEPENING: A-list seed deities the fan-out shards seam back to.
       The first vertical slice was thin; incoming traditions kept reaching for these
       (the Indo-Iranian split needs Varuna/Mitra/Agni; weaving needs Athena; the
       lunar reckoners need Thoth; cosmic-order needs Maʿat). Seated here so their gold
       seams land instead of dropping. ---- */
    { id: "varuna", tradition: "vedic", kind: "deity", name: "Váruṇa", archetypes: ["cosmic-order"],
      gloss: "The Vedic Ásura sovereign — guardian of ṛta, the cosmic order; lord of the encompassing night-sky and the cosmic waters, who binds the false with his noose and sees every deceit.",
      facet: "Sovereignty as moral surveillance, not storm: the god you cannot lie to. As the great Ásura he is the seam to Iran's Ahura — one word ennobled on one side of the mountains and demonised on the other." },
    { id: "mitra", tradition: "vedic", kind: "deity", name: "Mitrá", archetypes: ["complementarity", "solar"],
      gloss: "God of the covenant, the contract and the sworn bond — the daylight friend who holds agreements inviolable; with Varuna he forms the dual sovereignty Mitra-Váruṇa, day beside night.",
      facet: "The handshake made divine. His name travels west as Iran's Mithra and Rome's Mithras — the contract-god who hardens into a sun." },
    { id: "agni", tradition: "vedic", kind: "deity", name: "Agní", archetypes: ["psychopomp"],
      gloss: "The sacrificial fire made god — mouth of the gods and messenger between earth and heaven, who carries the offering up in smoke and the dead through the pyre; kindled new on every hearth and altar.",
      facet: "The go-between the whole rite depends on: no fire, no message reaches the gods. His Iranian brother is Ātar, the same tended flame." },
    { id: "thoth", tradition: "egyptian", kind: "deity", name: "Thoth (Ḏḥwty)", archetypes: ["lunar", "psychopomp", "culture-hero"],
      gloss: "Ibis-headed god of the moon, writing, measure and time — who reckons the calendar, records the weighing of every heart, and gave humankind the hieroglyphs; the gods' own scribe and arbiter.",
      facet: "Knowledge as the moon's office: he who measures the months also measures truth — the lunar reckoner the moon-gods of every desert are weighed against." },
    { id: "maat", tradition: "egyptian", kind: "deity", name: "Maʿat", archetypes: ["cosmic-order"],
      gloss: "Truth, balance and right-order made a goddess — the feather against which the dead heart is weighed, and the order Pharaoh exists to uphold against isfet, the chaos that would unmake the world.",
      facet: "The one office every cosmos keeps: the impersonal right-order even the gods must serve. She stands with ṛta, aṣ̌a, the Dao and hózhó — order as the grain of reality." },
    { id: "athena", tradition: "greek", kind: "deity", name: "Athena", archetypes: ["culture-hero"],
      gloss: "Grey-eyed goddess of wisdom, craft and strategic war — sprung full-armed from the head of Zeus; giver of the olive, the loom, the bridle and the laws of the city she names.",
      facet: "War as foresight and craft as civilisation: the mind's victory, not the storm's — the weaver-goddess every loom-giver across the world is measured against." },
    { id: "artemis", tradition: "greek", kind: "deity", name: "Artemis", archetypes: ["master-of-animals", "lunar"],
      gloss: "Virgin huntress of the wild — Pótnia Thērôn, 'Mistress of Animals', who runs with the deer she also looses the arrow at; lady of the moon, of the threshold of birth, and of all that is not tamed.",
      facet: "The wild kept wild: a goddess who guards the beasts and the unwed, fierce against any who trespass on either. Homer's oldest epithet for her is the Mistress of Animals herself." },
    { id: "shiva", tradition: "vedic", kind: "deity", name: "Śiva (Paśupati)", archetypes: ["master-of-animals", "complementarity", "cyclic-ages"],
      gloss: "The auspicious destroyer — ascetic on the mountain, lord of the dance whose tāṇḍava ends and remakes the age; as Paśupati, 'Lord of Animals', master of the beasts and the wild breath beneath civilisation.",
      facet: "Destruction as the hinge of renewal, and the wild owned rather than slain. With Śakti he is the two-in-one (Ardhanārīśvara); as Paśupati his seal looks back to the Indus, older than the Veda that names him." }
  ],

  /* ---- the explicit seams (cross-figure). instantiate-seams are generated from each figure's `archetypes`. ---- */
  edges: [
    /* ===== COGNATE (tier 1) — the flagship: one mirror, proven ===== */
    { a: "dyeus", b: "zeus",       type: "cognate", tier: "1", note: "Zeus < *Dyēus by regular sound-law — the same word, three thousand years apart." },
    { a: "dyeus", b: "jupiter",    type: "cognate", tier: "1", note: "Iu-piter < *Dyēus-ph₂tēr — 'Sky-father' preserved almost intact in the compound." },
    { a: "dyeus", b: "dyaus-pita", type: "cognate", tier: "1", note: "Dyáuṣ-pitṛ́ — the Vedic form that first proved the whole family is one." },
    { a: "dyeus", b: "tyr",        type: "cognate", tier: "1", note: "Týr < Tīwaz < *Dyēus — the sky-father's name survived even as his rank did not." },
    { a: "zeus",  b: "jupiter",    type: "cognate", tier: "1", note: "Siblings, not borrowings: both descend straight from *Dyēus-ph₂tēr." },

    /* ===== ATTESTED (tier 2) — documented merges & inheritances ===== */
    { a: "dionysus", b: "osiris",  type: "syncretic", tier: "2", note: "Herodotus flatly identified them; the dying-and-rising vine-god read as the Egyptian risen lord." },
    { a: "isis",     b: "demeter", type: "syncretic", tier: "2", note: "Identified across the Hellenistic world as the one great grieving mother-goddess." },
    { a: "anubis",   b: "hermes",  type: "syncretic", tier: "2", note: "Fused into a single deity, Hermanubis, in Greco-Roman Egypt — two guides of the dead become one." },
    { a: "baal",     b: "yahweh",  type: "syncretic", tier: "2", note: "Early Israelite religion adapts Canaanite storm-and-Chaoskampf imagery: Baʿal/Yam → YHWH/Leviathan." },
    { a: "indra",    b: "perun",   type: "analogous", tier: "2", note: "Both inherit the reconstructed PIE storm-god's serpent-slaying myth (*Perkʷūnos vs. the serpent)." },
    { a: "thor",     b: "perun",   type: "analogous", tier: "2", note: "Shared Indo-European thunderer pattern: hammer/axe, oak, and the serpent at the world's root." },

    /* ===== ANALOGOUS (tier 3) — the comparativist's honest claim ===== */
    { a: "marduk", b: "ra",      type: "analogous", tier: "3", note: "Independent Chaoskampf: order wrung from the serpent — once at creation (Tiāmat), nightly forever (Apophis)." },
    { a: "indra",  b: "susanoo", type: "analogous", tier: "3", note: "Storm-hero slays the many-headed/coiling serpent to free the waters / win the realm." },
    { a: "yahweh", b: "marduk",  type: "analogous", tier: "3", note: "The dragon-slaying storm-god who becomes the supreme ordering God of his city, then his world." },
    { a: "inanna", b: "persephone", type: "analogous", tier: "3", note: "Descent of a goddess into death and her cyclic return — the season written as a journey below." },
    { a: "osiris", b: "dumuzi",  type: "analogous", tier: "3", note: "The mourned god given to the underworld and released in part — wept for from the Nile to Sumer." },
    { a: "osiris", b: "christ",  type: "analogous", tier: "3", note: "Death, burial and rising to rule — but Frazer over-read this family; Christianity insists on history where Egypt meant renewal. Held at arm's length, honestly." },
    { a: "hermes", b: "eshu",    type: "analogous", tier: "3", note: "Messenger of the crossroads who alone can carry words between human and divine." },
    { a: "ra",     b: "huitzilopochtli", type: "analogous", tier: "3", note: "The sun whose daily survival must be paid for — by slaying (Ra) or by feeding (Huitzilopochtli)." },
    { a: "gaia",   b: "papatuanuku", type: "analogous", tier: "3", note: "The Earth as primal mother, pressed beneath the Sky until the two are forced apart." },
    { a: "yggdrasil", b: "mount-meru", type: "analogous", tier: "3", note: "The world-axis as cosmic tree / cosmic mountain — the still center binding the realms." },
    { a: "ceiba-world-tree", b: "mount-meru", type: "analogous", tier: "3", note: "Center-tree and center-mountain: the same quincunx of four quarters around a holy middle." },
    { a: "ceiba-world-tree", b: "eden-four-rivers", type: "analogous", tier: "3", note: "Tree at the center, four directions / four rivers running to the quarters of the world." },
    { a: "brahman", b: "teotl",  type: "analogous", tier: "3", note: "A single sacred reality of which all gods and things are passing faces." },
    { a: "brahman", b: "tao",    type: "analogous", tier: "3", note: "The one source behind the ten-thousand things, knowable only by ceasing to stand outside it." },
    { a: "teotl",   b: "ein-sof",type: "analogous", tier: "4", note: "The unconditioned ground from which a knowable, named divinity unfolds — a far reach across very different grammars." },

    /* ===== PAIRS — bound dyads ===== */
    { a: "ranginui", b: "papatuanuku", type: "pairs", tier: "2", note: "Sky-Father and Earth-Mother in unbroken embrace, until their children part them to make the lit world." },
    { a: "qian-kun", b: "ometeotl", type: "analogous", tier: "3", note: "The supreme principle as an irreducible male-female pair: Heaven/Earth, Lord/Lady." },
    { a: "ixiptla",  b: "teotl",  type: "pairs", tier: "2", note: "The mechanism of the One Through Many: teōtl acts in the world by 'wearing' an ixiptla." },
    { a: "mitra", b: "varuna", type: "pairs", tier: "1", note: "Mitra-Váruṇa: the bound dual sovereignty of Vedic religion — the near and the far, contract and cosmic law, invoked almost always as a single dvandva breath." },
    { a: "shiva", b: "parvati", type: "pairs", tier: "1", note: "Śiva and Śakti — the still ascetic and the dancing power, joined as Ardhanārīśvara, one body half-male and half-female: complementarity made flesh." },
    { a: "artemis", b: "shiva", type: "analogous", tier: "3", note: "Pótnia Thērôn and Paśupati — the Mistress and the Lord of Animals, the same archaic office of the one who owns the wild and its beasts, split into a goddess and a god." },

    /* ===== THE BALLGAME SUB-GRAPH ===== */
    { a: "hero-twins",       b: "ballgame", type: "pairs", tier: "1", note: "The Twins win their lives by out-playing death at the court — the founding match of the Popol Vuh." },
    { a: "hero-twins",       b: "lords-of-xibalba", type: "inverts", tier: "1", note: "Life against death across the same court — the cosmic contest with bodies as the pieces." },
    { a: "patolli",          b: "four-tezcatlipocas", type: "pairs", tier: "2", note: "The board's four arms are the four directional quarters the Tezcatlipocas govern — the cosmogram the game is played on." },
    { a: "patolli",          b: "ceiba-world-tree",   type: "analogous", tier: "3", note: "Quincunx: four directions around a green center — the board and the world-tree are the same diagram." },
    { a: "four-tezcatlipocas", b: "ceiba-world-tree", type: "pairs", tier: "2", note: "Four quarters around a green center — the directional gods and the world-tree are one diagram." },

    /* ===== INVERTS — same form, opposite charge (the shadow) ===== */
    { a: "loki", b: "prometheus", type: "inverts", tier: "3", note: "Two fire-and-boundary tricksters, mirror-opposite: Prometheus the punished benefactor, Loki the gift that curdles into catastrophe." },

    /* ===== BRIDGE — a documented modern synthesis (the lineage's own seam) ===== */
    { a: "tonal-nagual", b: "yin-yang", type: "bridge", tier: "2", note: "William Douglas Horden's The Toltec I Ching joins the Mesoamerican tonal/nagual to the Chinese yin/yang — a real synthesis from a real lineage, the join this whole project is named for." },

    /* ===== FORGERY — fool's gold, pointing home ===== */
    { a: "castaneda-tonal-nagual", b: "tonal-nagual", type: "forgery", tier: "forgery", note: "The famous version is fabricated. Its seam is aimed deliberately back at the grounded Toltec line it imitated — the fake set beside the real so the difference can be seen." }
  ]
};
