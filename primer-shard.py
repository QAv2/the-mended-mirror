#!/usr/bin/env python3
# ============================================================================
# THE MENDED MIRROR — online-Gemini primer.
# Assembles the FULL prompt for one shard (instruction + _SPEC.md + a finished
# shard as exemplar + the candidate's brief) and prints it to stdout. The ./mend
# wrapper pipes that into the clipboard so you can paste it straight into a
# Gemini web chat (gemini.google.com) when the CLI's free login isn't available.
#
#   ./mend primer <id>      (copies the prompt to your clipboard)
#
# Paste it into Gemini, let it reply with the raw JSON, copy that, then:
#   ./mend save <id>
# ============================================================================
import sys, os, json, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
FANOUT = os.path.join(ROOT, "data", "_fanout")

def die(m): sys.stderr.write("! " + m + "\n"); sys.exit(1)

wid = sys.argv[1] if len(sys.argv) > 1 else die("usage: primer-shard.py <id>")

cands = json.load(open(os.path.join(ROOT, "data", "_candidates.json")))
hit = hue = None
for fam in cands["families"]:
    for it in fam["items"]:
        if it["id"] == wid:
            hit, hue = it, fam["hue"]
if not hit:
    die(f"'{wid}' not in _candidates.json — try: ./mend queue")

spec = open(os.path.join(FANOUT, "_SPEC.md")).read()
ex_files = sorted((f for f in glob.glob(os.path.join(FANOUT, "*.json"))
                   if os.path.basename(f)[:-5] != wid),
                  key=os.path.getmtime, reverse=True)
exemplar = open(ex_files[0]).read() if ex_files else "{}"

print(
    "You are forging ONE shard for *The Mended Mirror*. Output ONLY the raw JSON "
    "object for this single shard — no markdown code fences, no commentary, no "
    "preamble. Your entire reply must start with { and end with } and parse as "
    "valid JSON. CRITICAL: inside any string value, use SINGLE quotes for inner "
    "quotation (e.g. the 'Seal of the Prophets') — never raw double-quotes, which "
    "break the JSON. Use straight ASCII quotes for the JSON itself, no smart quotes.\n\n"
    "Follow the spec below EXACTLY: 7-11 figures (each with gloss, a FACET, and real "
    "provenance), 8-20 cross-tradition gold seams to EXISTING figure ids or joint ids "
    "from the spec's inventory (NEVER invent an id for another tradition — seam to a "
    "joint instead), and ruthless honest tiering. Over-claiming is the one unforgivable "
    "error: most seams are tier 3 (analogous); tier 2 only for a DOCUMENTED historical "
    "link/syncretism; tier 1 almost never. But do not under-claim either — a documented "
    "syncretism or a literal same-god identity is tier 2, not tier 3.\n\n"
    "=== SPEC (_SPEC.md) ===\n\n" + spec + "\n\n"
    "=== A FINISHED SHARD, as your format + quality exemplar ===\n\n" + exemplar + "\n\n"
    "=== NOW WRITE THIS SHARD ===\n"
    f"  tradition.id   = {wid}\n"
    f"  tradition.name = {hit['name']}\n"
    f"  region         = {hit.get('region','?')}\n"
    f"  color          = {hue}\n"
    f"  anchor motif   = {hit.get('anchor','')}\n"
    "\nReply with the JSON object only."
)
