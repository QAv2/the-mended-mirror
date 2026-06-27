#!/usr/bin/env python3
# ============================================================================
# THE MENDED MIRROR — save a shard pasted back from online Gemini.
# Reads the JSON from your clipboard (what you copied out of the Gemini web chat),
# strips any stray ```json fences, validates it, and writes data/_fanout/<id>.json.
# The ./mend wrapper then dates + builds it. Same validation the other paths get.
#
#   ./mend save <id>                 (reads the clipboard)
#   ./mend save <id> < somefile      (or pipe/redirect the JSON in on stdin)
# ============================================================================
import sys, os, json, subprocess
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
FANOUT = os.path.join(ROOT, "data", "_fanout")

def die(m): print("! " + m); sys.exit(1)

wid = sys.argv[1] if len(sys.argv) > 1 else die("usage: save-shard.py <id>")

# source the JSON: stdin if piped, else the X clipboard via xclip
if not sys.stdin.isatty():
    content = sys.stdin.read()
else:
    try:
        content = subprocess.check_output(
            ["xclip", "-selection", "clipboard", "-o"], text=True)
    except Exception as e:
        die(f"couldn't read the clipboard ({e}). Copy Gemini's JSON reply first, "
            f"or pipe it in:  ./mend save {wid} < file.json")

content = content.lstrip("﻿").strip()  # drop a UTF-8 BOM if one rode along
if not content:
    die("clipboard is empty — copy Gemini's JSON reply, then re-run.")

# strip accidental code fences
if content.startswith("```"):
    content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    if content.startswith("json"):
        content = content[4:].strip()
# tolerate leading/trailing prose: clip to the outermost { }
if not content.startswith("{") and "{" in content:
    content = content[content.index("{"): content.rindex("}") + 1]

try:
    data = json.loads(content)
except json.JSONDecodeError as e:
    bad = os.path.join(FANOUT, f"{wid}.RAW.txt")
    open(bad, "w").write(content)
    die(f"that wasn't valid JSON ({e}). Raw saved to {bad} — usually a trailing "
        f"comma or a stray sentence. Fix it there and rename to {wid}.json, or "
        f"re-copy a clean reply and run ./mend save {wid} again.")

# sanity: does the id inside match what we're saving as?
tid = (data.get("tradition") or {}).get("id")
if tid and tid != wid:
    print(f"  ⚠ JSON's tradition.id is '{tid}' but you're saving as '{wid}'. "
          f"Saving under '{wid}' anyway — check the brief if that's wrong.")

figs, edges = data.get("figures", []), data.get("edges", [])
out = os.path.join(FANOUT, f"{wid}.json")
json.dump(data, open(out, "w"), indent=2, ensure_ascii=False)

tiers = dict(sorted(Counter(e.get("tier") for e in edges).items()))
missing_facet = [f.get("id") for f in figs if not f.get("facet")]
print(f"✓ wrote {out}")
print(f"  figures {len(figs)} · seams {len(edges)} · tiers {tiers}")
if len(figs) < 7 or len(figs) > 11:
    print(f"  ⚠ figure count {len(figs)} is outside 7-11 — consider a redo")
if missing_facet:
    print(f"  ⚠ figures missing a facet: {missing_facet} — the facet is half the thesis")
if tiers.get("1", 0) > 2:
    print(f"  ⚠ {tiers['1']} tier-1 seams — tier 1 is proven descent ONLY; likely over-claimed")
