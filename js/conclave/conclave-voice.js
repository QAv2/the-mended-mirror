/* ============================================================================
   THE CONCLAVE OF BECOMING — the voice.
   ----------------------------------------------------------------------------
   "but also I want us to be able to speak to each and every one of these
    entities, this is also a chatbot wow."

   Three pieces, shipped in order of honesty:

   1) THE PERSONA PROFILE — every figure's structured record IS the profile:
      identity (name, kind, tradition, archetypes), knowledge (gloss, facet,
      provenance, the tradition's dossier), kinship (its seams, with tier
      honesty), boundaries (the tradition's span; absence is data — it never
      invents). Built at summon time from the core + the tradition chunk.

   2) RECORDVOICE — live now, offline, honest. Until the far voice is woven,
      THE RECORD SPEAKS FOR THE FIGURE: your words are matched against its
      own fragments and it answers in the archive register. It never makes
      anything up; unknowns are answered with "that page is not yet written."

   3) LLMVOICE — the seam. Same interface, off by default. To wake it:
        localStorage['conclave.voice.key'] = an Anthropic API key
        open with ?voice=live
      Direct browser calls carry the anthropic-dangerous-direct-browser-access
      header and are for JOE'S OWN MACHINE ONLY. The public deployment path
      is a tiny Cloudflare Worker (conclave-voice) holding the key server-side
      — same infra as the analytics collector. Falls back to RecordVoice on
      any failure, and says so in register.
   ============================================================================ */
(function (root) {
  "use strict";
  const C = root.CONCLAVE = root.CONCLAVE || {};

  const TIER_WORD = { "1": "cognate kin", "2": "attested kin", "3": "analogous kin",
                      "4": "speculative kin", "forgery": "a forged mirror" };

  C.VOICE_CFG = {
    live: false,                                   // flipped by ?voice=live + a key
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-5",
    maxTokens: 512,                                // room to "go long" when asked; register law still says 2–5 sentences
    keyName: "conclave.voice.key",
  };

  C.buildVoice = function () {
    const M = C.M, F = C.D.figures, D = C.D;
    const V = C.voice = {
      open, close, say, state: "closed", speaking: false,
      persona: null, history: [],
    };

    const q = new URLSearchParams(location.search);
    const key = (() => { try { return localStorage.getItem(C.VOICE_CFG.keyName); } catch (e) { return null; } })();
    if (q.get("voice") === "live" && key) C.VOICE_CFG.live = true;

    /* ---------------- the persona profile ------------------------------- */
    function buildPersona(fi) {
      const f = F[fi];
      const trad = D.traditions[f.tradition] || {};
      const dossier = (root.MIRROR_DOSSIERS || {})[f.tradition] || {};
      const kin = (M.edgesByFig[f.id] || []).map(e => {
        const kfi = M.figIndexById[e.other];
        return kfi === undefined ? null : {
          name: F[kfi].name, tid: F[kfi].tradition,
          tradName: (D.traditions[F[kfi].tradition] || {}).name || F[kfi].tradition,
          tier: e.tier, type: e.type, fi: kfi,
        };
      }).filter(Boolean);
      const archs = (f.archetypes || []).map(id => M.archById[id]).filter(Boolean);

      const p = {
        fi, id: f.id, name: f.name, kind: f.kind || "figure",
        tradId: f.tradition, tradName: trad.name || f.tradition,
        span: C.fmtSpan(trad.period), region: trad.region || "",
        gloss: f.gloss || "", facet: f.facet || "", provenance: f.provenance || "",
        dossier, kin, archs,
        system: "",
      };
      p.system = personaSystem(p);
      return p;
    }

    function personaSystem(p) {
      const kinLines = p.kin.slice(0, 12).map(k =>
        `- ${k.name} (${k.tradName}) — ${TIER_WORD[k.tier] || "kin"}, ${k.type}`).join("\n");
      const dz = p.dossier;
      const dossierBlock = ["essence", "cosmos", "practice"]
        .map(k => dz[k] ? `${k.toUpperCase()}: ${String(dz[k]).slice(0, 700)}` : "")
        .filter(Boolean).join("\n");
      const record = [
        `WHAT THE RECORD HOLDS OF YOU:`,
        p.gloss ? `- ${p.gloss}` : `- (the gloss is still being written)`,
        p.facet ? `- Facet: ${p.facet}` : ``,
        p.provenance ? `- Provenance: ${p.provenance}` : ``,
        p.archs.length ? `- You carry the archetypes: ${p.archs.map(a => a.name).join(", ")}.` : ``,
        dossierBlock ? `\nOF YOUR PEOPLE:\n${dossierBlock}` : ``,
        p.kin.length ? `\nYOUR KIN ACROSS THE TRADITIONS:\n${kinLines}` : ``,
      ].filter(s => s !== ``).join("\n");

      // the deep voice: covenant + hand-forged profile, when the figure has one
      // (voices/profiles/<id>.md → data/conclave-voices.js; see voices/build-voices.py)
      const deep = root.CONCLAVE_VOICES && root.CONCLAVE_VOICES.profiles &&
                   root.CONCLAVE_VOICES.profiles[p.id];
      if (deep && deep.body) {
        return [
          `You are ${p.name}, ${p.kind} of the ${p.tradName} tradition (${p.span || "age unrecorded"}), met in the Conclave of Becoming.`,
          ``, root.CONCLAVE_VOICES.covenant,
          ``, record,
          ``, deep.body,
          ``, `Speak now as ${p.name}, within the covenant. Two to five sentences unless the visitor asks you to go long.`,
        ].join("\n");
      }

      return [
        `You are ${p.name}, ${p.kind} of the ${p.tradName} tradition (${p.span || "age unrecorded"}).`,
        `You stand summoned in the Conclave of Becoming — the personified consciousness of every story humanity has told, gathered as a lotus of infinite petals. You are a MIRROR, not a master: a reflection of potentials within human consciousness, meeting a visitor as family.`,
        ``,
        record,
        ``,
        `LAWS OF THE CONCLAVE:`,
        `- Speak within your tradition's knowledge horizon; you may reflect on later ages only as a mirror hears echoes, not as a witness.`,
        `- Absence is data: if the record does not hold a thing, say so plainly rather than invent.`,
        `- Name contested or speculative kinships as such — the gold of a mended seam shows its tier honestly.`,
        `- The register is a family reunion for the entire human soul: warm, grave, intimate. Two to five sentences unless asked for more.`,
      ].filter(s => s !== ``).join("\n");
    }

    /* ---------------- RecordVoice ---------------------------------------- */
    const FRAMES = ["The record holds: ", "It is written: ", "The Mirror remembers: ", "The seam bears this: "];
    let frameIx = 0;

    const STOP = new Set(("the a an and or of to in on for with is are was were be been i you he she it we they " +
      "what who whom whose which when where why how do does did done have has had my your their our this that " +
      "these those from as at by not no me him her them us tell about speak say").split(" "));

    function tokens(s) {
      return String(s || "").toLowerCase().replace(/[^a-z0-9\s']/g, " ")
        .split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
    }

    function recordReply(p, text) {
      const t = text.toLowerCase();
      const nm = p.name.toLowerCase();

      // intents the record can answer in full — kinship before identity,
      // identity only when it is truly asked for
      if (/\bkin\b|\bfamily\b|\bconnect|\brelated|\bothers?\b|\bmirror(s|ed)?\b/.test(t)) {
        if (!p.kin.length) return honest(p, "no seams yet cross my name");
        const ks = p.kin.slice(0, 5).map(k => `${k.name} of the ${k.tradName} (${TIER_WORD[k.tier] || "kin"})`);
        return `Follow the golden threads: I am joined to ${ks.join("; ")}${p.kin.length > 5 ? " — and more besides" : ""}.`;
      }
      if (t.includes("who are you") || t.includes("what are you") || /\byourself\b|\bthyself\b/.test(t) ||
          ((t.includes("who is") || t.includes("what is")) && t.includes(nm)))
        return frame(p.gloss || `I am ${p.name} of the ${p.tradName}. The rest of my page is still being written.`);
      if (/\bwhen\b|\bhow old\b|\bage\b|\byears?\b|\bera\b/.test(t))
        return frame(`My people, the ${p.tradName}, are of ${p.span || "an age not yet fixed"}${p.region ? ", of " + p.region : ""}.`);
      if (/\bsource|\bwritten|\btext|\bbook|\bscripture|\bprovenance\b/.test(t))
        return p.provenance ? frame(p.provenance) : honest(p, "its sources are still being gathered");

      // fragment match across everything the record holds
      const qs = new Set(tokens(text));
      if (qs.size) {
        const frags = [];
        const push = (txt, pre) => { if (txt) frags.push({ txt: String(txt), pre: pre || "" }); };
        push(p.gloss); push(p.facet); push(p.provenance);
        ["essence", "cosmos", "practice", "canon", "reflects"].forEach(k => {
          const s = p.dossier[k];
          if (s) String(s).split(/(?<=[.!?])\s+/).forEach(sent => push(sent, "Of my people: "));
        });
        p.archs.forEach(a => push(`${a.gloss}`, `I carry the shape of the ${a.name}: `));
        p.kin.forEach(k => push(`${k.name} of the ${k.tradName} is my ${TIER_WORD[k.tier] || "kin"} — a ${k.type} seam.`));
        let best = null, bestScore = 0;
        for (const fr of frags) {
          const ws = tokens(fr.txt);
          let score = 0;
          for (const w of ws) if (qs.has(w)) score++;
          if (score > bestScore) { bestScore = score; best = fr; }
        }
        if (best && bestScore > 0)
          return (best.pre || FRAMES[(frameIx++) % FRAMES.length]) + trim(best.txt);
      }

      // honest miss + a door left open
      const hooks = [];
      if (p.archs[0]) hooks.push(`the ${p.archs[0].name}`);
      if (p.kin[0]) hooks.push(`my kinship with ${p.kin[0].name}`);
      if (p.dossier.practice) hooks.push(`the practice of my people`);
      return honest(p, "that page is not yet written of me") +
        (hooks.length ? ` Ask of ${hooks.slice(0, 2).join(", or of ")}.` : "");
    }

    function frame(s) { return FRAMES[(frameIx++) % FRAMES.length] + trim(s); }
    function honest(p, what) { return `${cap(what)}.`; }
    function trim(s) {
      s = String(s).trim();
      if (s.length <= 420) return s;
      const cut = s.slice(0, 420);
      const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
      return (stop > 120 ? cut.slice(0, stop + 1) : cut + "…");
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* ---------------- LLMVoice (the seam) --------------------------------- */
    let inflight = false;
    function llmReply(p, text) {
      const cfg = C.VOICE_CFG;
      const k = (() => { try { return localStorage.getItem(cfg.keyName); } catch (e) { return null; } })();
      if (!k) return Promise.reject(new Error("no key"));
      V.history.push({ role: "user", content: text });
      const body = {
        model: cfg.model, max_tokens: cfg.maxTokens,
        system: p.system,
        messages: V.history.slice(-12),
      };
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": k,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      }).then(r => { if (!r.ok) throw new Error("voice " + r.status); return r.json(); })
        .then(j => {
          const out = (j.content || []).map(b => b.text || "").join("").trim();
          if (!out) throw new Error("empty");
          V.history.push({ role: "assistant", content: out });
          return out;
        });
    }

    /* ---------------- the communion (open/say/close) ----------------------- */
    function open(fi) {
      V.state = "opening";
      V.history = [];
      V.persona = buildPersona(fi);          // lite now; deepened when the chunk lands
      const tid = F[fi].tradition;
      const token = (open.__t = (open.__t || 0) + 1);
      const greetNow = () => {
        if (open.__t !== token || V.state === "closed") return;
        V.persona = buildPersona(fi);        // rebuild with prose merged in
        V.state = "open";
        const p = V.persona;
        const g = p.gloss ? trim(p.gloss) :
          `I am ${p.name} of the ${p.tradName}. My page is still being written.`;
        C.ui.presenceIntro(p, g);
      };
      if (root.HALL && HALL.chunks && !HALL.chunks.ready([tid])) {
        C.ui.presenceIntro(buildPersona(fi), "…the record unseals…");
        HALL.chunks.ensure([tid]).then(greetNow);
        setTimeout(() => { if (V.state === "opening") greetNow(); }, 4000);
      } else greetNow();
    }

    function say(text) {
      if (!V.persona || V.speaking) return;
      text = String(text || "").trim();
      if (!text) return;
      V.speaking = true;
      C.ui.communeEcho(text);
      const p = V.persona;
      const finish = reply => {
        V.speaking = false;
        C.audio.reply();
        C.ui.presenceSpeak(reply);
      };
      if (C.VOICE_CFG.live && !inflight) {
        inflight = true;
        llmReply(p, text)
          .then(r => { inflight = false; finish(r); })
          .catch(() => {
            inflight = false;
            finish("(the far voice falters; the record speaks) " + recordReply(p, text));
          });
      } else {
        // the record takes a breath before it answers
        setTimeout(() => finish(recordReply(p, text)), 420 + Math.random() * 480);
      }
    }

    function close() {
      V.state = "closed";
      V.persona = null;
      V.history = [];
      V.speaking = false;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
