#!/usr/bin/env python3
# ============================================================================
# THE MENDED MIRROR — standalone temporal seeder.
# Gives a tradition a timeline period in data/_temporal.json so it places on the
# time-axis and PASSES sanity (a missing period is a hard ✗, not a warning).
#
# gen-shard.py (the DeepSeek path) does this inline. The Gemini-CLI path writes
# the shard JSON itself and never calls gen-shard.py, so it calls this instead:
#
#     python3 seed-temporal.py <id>        (or: ./mend date <id>)
#
# Same heuristic as gen-shard.ensure_period(): from = candidate date, to = 2026
# if living else from+500, peak = from + 0.4*span. Flagged "auto-dated; refine
# later" — Claude sets exact dates in the corpus final audit. Idempotent: if the
# tradition is already dated, it leaves the existing entry untouched.
# ============================================================================
import sys, os, json

ROOT = os.path.dirname(os.path.abspath(__file__))

def die(m): print("! " + m); sys.exit(1)

wid = sys.argv[1] if len(sys.argv) > 1 else die("usage: seed-temporal.py <id>")

cands = json.load(open(os.path.join(ROOT, "data", "_candidates.json")))
hit = None
for fam in cands["families"]:
    for it in fam["items"]:
        if it["id"] == wid:
            hit = it
if not hit:
    die(f"'{wid}' not in _candidates.json — try: ./mend queue")

tpath = os.path.join(ROOT, "data", "_temporal.json")
t = json.load(open(tpath))
trs = t.setdefault("traditions", {})
if wid in trs:
    print(f"· {wid} already dated ({trs[wid].get('from')}→{trs[wid].get('to')}) — left as-is")
    sys.exit(0)

date = hit.get("date")
if date is None:
    die(f"'{wid}' has no date in _candidates.json — add one or date it by hand in {tpath}")

frm = int(date)
living = bool(hit.get("living", False))
to = 2026 if living else frm + 500
peak = frm + int((to - frm) * 0.4)
cert = "reconstructed" if "reconstruct" in hit.get("region", "").lower() else "attested"
trs[wid] = {"from": frm, "to": to, "peak": peak, "living": living,
            "certainty": cert,
            "note": (hit.get("anchor", "")[:110] + " (auto-dated; refine later)")}
json.dump(t, open(tpath, "w"), indent=2, ensure_ascii=False)
print(f"✓ dated {wid}: {frm}→{to} (peak {peak}{', living' if living else ''}) — refine later")
