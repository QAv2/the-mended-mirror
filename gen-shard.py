#!/usr/bin/env python3
# ============================================================================
# THE MENDED MIRROR — direct DeepSeek shard generator.
# Calls the DeepSeek API straight (no aider edit-format negotiation), feeds it
# the full _SPEC.md + a finished shard as exemplar + the candidate's brief, and
# writes raw validated JSON to data/_fanout/<id>.json.
#   python3 gen-shard.py <id>            (uses deepseek-chat)
#   python3 gen-shard.py <id> reasoner   (uses deepseek-reasoner for a hard one)
# Needs DEEPSEEK_API_KEY in the environment (it's in ~/.env).
# ============================================================================
import sys, os, json, glob, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
FANOUT = os.path.join(ROOT, "data", "_fanout")

def die(m): print("! " + m); sys.exit(1)

wid = sys.argv[1] if len(sys.argv) > 1 else die("usage: gen-shard.py <id> [reasoner]")
model = "deepseek-reasoner" if (len(sys.argv) > 2 and sys.argv[2] == "reasoner") else "deepseek-chat"
key = os.environ.get("DEEPSEEK_API_KEY") or die("DEEPSEEK_API_KEY not set (it lives in ~/.env)")

# --- look up the candidate brief ---
cands = json.load(open(os.path.join(ROOT, "data", "_candidates.json")))
hit = hue = None
for fam in cands["families"]:
    for it in fam["items"]:
        if it["id"] == wid:
            hit, hue = it, fam["hue"]
if not hit:
    die(f"'{wid}' not in _candidates.json — try: ./mend queue")

spec = open(os.path.join(FANOUT, "_SPEC.md")).read()
# pick the most recent finished shard (not this one) as the quality exemplar
ex_files = sorted((f for f in glob.glob(os.path.join(FANOUT, "*.json"))
                   if os.path.basename(f)[:-5] != wid),
                  key=os.path.getmtime, reverse=True)
exemplar = open(ex_files[0]).read() if ex_files else "{}"

system = (spec + "\n\n---\nYou output ONLY the raw JSON object for ONE shard. "
          "No markdown code fences, no commentary, no preamble. Your entire reply "
          "must start with { and end with }. It must parse as valid JSON.")
user = (
    f"Write the shard for: {hit['name']}\n"
    f"  tradition.id   = {wid}\n"
    f"  tradition.name = {hit['name']}\n"
    f"  region         = {hit.get('region','?')}\n"
    f"  color          = {hue}\n"
    f"  anchor motif   = {hit.get('anchor','')}\n\n"
    "Follow _SPEC.md EXACTLY: 7-11 figures (each with gloss, FACET, provenance), "
    "8-20 cross-tradition gold seams to EXISTING figure ids from the inventory in "
    "the spec, ruthless honest tiering (when unsure pick the LOWER tier; most seams "
    "should be tier 3 / analogous — over-claiming is the one unforgivable error).\n\n"
    "Here is a finished shard as your format + quality exemplar:\n\n" + exemplar
)

print(f"• generating '{wid}' ({hit['name']}) via {model} …")
req = urllib.request.Request(
    "https://api.deepseek.com/chat/completions",
    data=json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": user}],
        "temperature": 0.4,
        "max_tokens": 8000,
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
)
try:
    resp = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    die(f"DeepSeek API error {e.code}: {e.read().decode()[:300]}")

content = resp["choices"][0]["message"]["content"].strip()
usage = resp.get("usage", {})
# strip accidental ```json fences if the model added them anyway
if content.startswith("```"):
    content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    if content.startswith("json"):
        content = content[4:].strip()

try:
    data = json.loads(content)
except json.JSONDecodeError as e:
    bad = os.path.join(FANOUT, f"{wid}.RAW.txt")
    open(bad, "w").write(content)
    die(f"model returned invalid JSON ({e}). Raw saved to {bad} — eyeball it, "
        f"usually a trailing comma. Fix or just re-run: ./mend make {wid}")

def ensure_period(wid, hit):
    """Give the new tradition a timeline period in _temporal.json so it places on
    the time-axis and passes sanity. Heuristic from candidate date/living — Claude
    refines exact dates on return."""
    tpath = os.path.join(ROOT, "data", "_temporal.json")
    t = json.load(open(tpath))
    trs = t.setdefault("traditions", {})
    if wid in trs:
        return
    date = hit.get("date")
    if date is None:
        return
    frm = int(date)
    living = bool(hit.get("living", False))
    to = 2026 if living else frm + 500
    peak = frm + int((to - frm) * 0.4)
    cert = "reconstructed" if "reconstruct" in hit.get("region", "").lower() else "attested"
    trs[wid] = {"from": frm, "to": to, "peak": peak, "living": living,
                "certainty": cert,
                "note": (hit.get("anchor", "")[:110] + " (auto-dated; refine later)")}
    json.dump(t, open(tpath, "w"), indent=2, ensure_ascii=False)
    print(f"  · dated {wid}: {frm}→{to} (peak {peak}{', living' if living else ''})")

ensure_period(wid, hit)

# light shape check
figs, edges = data.get("figures", []), data.get("edges", [])
missing_facet = [f["id"] for f in figs if not f.get("facet")]
out = os.path.join(FANOUT, f"{wid}.json")
json.dump(data, open(out, "w"), indent=2, ensure_ascii=False)

from collections import Counter
tiers = dict(sorted(Counter(e.get("tier") for e in edges).items()))
print(f"✓ wrote {out}")
print(f"  figures {len(figs)} · seams {len(edges)} · tiers {tiers}")
print(f"  tokens: {usage.get('prompt_tokens','?')} in / {usage.get('completion_tokens','?')} out")
if len(figs) < 7 or len(figs) > 11:
    print(f"  ⚠ figure count {len(figs)} is outside 7-11 — consider a redo")
if missing_facet:
    print(f"  ⚠ figures missing a facet: {missing_facet} — the facet is half the thesis")
if tiers.get("1", 0) > 2:
    print(f"  ⚠ {tiers['1']} tier-1 seams — tier 1 is proven descent ONLY; likely over-claimed")
print(f"\n  next: ./mend build   (then eyeball index.html, then commit)")
