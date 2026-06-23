#!/usr/bin/env python3
# ============================================================================
# THE MENDED MIRROR — the Forge.
# A local control panel (no terminal) for the solo shard-production loop.
# Launch:  ./mend gui      (opens http://127.0.0.1:8770 in your browser)
# Everything the loop does — make, build, eyeball, commit — is a button.
# Stdlib only. Binds to localhost. Reads DEEPSEEK_API_KEY from ~/.env.
# ============================================================================
import os, json, glob, subprocess, threading, webbrowser
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
FANOUT = os.path.join(ROOT, "data", "_fanout")
PORT = 8770

# --- load ~/.env so subprocesses inherit the API key ---
envf = os.path.expanduser("~/.env")
if os.path.exists(envf):
    for line in open(envf):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def done_ids():
    return {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(FANOUT, "*.json"))}

def candidates():
    return json.load(open(os.path.join(ROOT, "data", "_candidates.json")))

def status():
    d, done = candidates(), done_ids()
    by = Counter()
    for fam in d["families"]:
        for it in fam["items"]:
            if it.get("status") != "have" and it["id"] not in done:
                by[str(it.get("wave", "?"))] += 1
    return {"written": len(done), "remaining": sum(by.values()),
            "byWave": dict(sorted(by.items()))}

def queue(wave):
    d, done = candidates(), done_ids()
    rows = []
    for fam in d["families"]:
        for it in fam["items"]:
            if (it.get("status") != "have" and it["id"] not in done
                    and str(it.get("wave", "?")) == str(wave)):
                rows.append({"id": it["id"], "name": it["name"],
                             "family": fam["name"], "hue": fam["hue"],
                             "region": it.get("region", ""),
                             "anchor": it.get("anchor", "")})
    return rows

def shard_summary(wid):
    """Read a written shard and compute figures/seams/tiers/warnings."""
    p = os.path.join(FANOUT, wid + ".json")
    data = json.load(open(p))
    figs, edges = data.get("figures", []), data.get("edges", [])
    tiers = dict(sorted(Counter(str(e.get("tier")) for e in edges).items()))
    warns = []
    if not (7 <= len(figs) <= 11):
        warns.append(f"figure count {len(figs)} outside 7-11")
    missing = [f["id"] for f in figs if not f.get("facet")]
    if missing:
        warns.append(f"missing facet: {', '.join(missing)}")
    if tiers.get("1", 0) > 2:
        warns.append(f"{tiers['1']} tier-1 seams — tier 1 is proven descent only; likely over-claimed")
    name = data.get("tradition", {}).get("name", wid)
    return {"name": name, "figures": len(figs), "seams": len(edges),
            "tiers": tiers, "warnings": warns,
            "figureList": [{"name": f.get("name", ""), "kind": f.get("kind", "")} for f in figs]}

def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, env=os.environ)
    return r.returncode, (r.stdout or "") + (r.stderr or "")

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass  # quiet

    def _send(self, code, body, ctype="application/json"):
        b = body.encode() if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _json(self, obj, code=200): self._send(code, json.dumps(obj))

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        if self.path == "/" or self.path.startswith("/index"):
            return self._send(200, PAGE, "text/html; charset=utf-8")
        if self.path == "/api/status":
            return self._json(status())
        if self.path.startswith("/api/queue"):
            wave = "1"
            if "wave=" in self.path:
                wave = self.path.split("wave=")[1].split("&")[0]
            return self._json({"wave": wave, "items": queue(wave)})
        self._json({"error": "not found"}, 404)

    def do_POST(self):
        try:
            body = self._body()
        except Exception:
            body = {}
        if self.path == "/api/forge":
            return self.forge(body.get("id", ""))
        if self.path == "/api/commit":
            wid = body.get("id", "")
            rc, log = run(["git", "add", "-A"])
            rc, log2 = run(["git", "commit", "-m", f"mirror: add {wid} shard"])
            return self._json({"ok": rc == 0, "log": log + log2})
        if self.path == "/api/redo":
            wid = body.get("id", "")
            try:
                os.remove(os.path.join(FANOUT, wid + ".json"))
            except FileNotFoundError:
                pass
            return self.forge(wid)
        if self.path == "/api/openmap":
            subprocess.Popen(["xdg-open", os.path.join(ROOT, "index.html")])
            return self._json({"ok": True})
        self._json({"error": "not found"}, 404)

    def forge(self, wid):
        if not wid:
            return self._json({"ok": False, "stage": "input", "log": "no id"}, 400)
        # 1. generate
        rc, mklog = run(["python3", "gen-shard.py", wid])
        if rc != 0:
            return self._json({"ok": False, "stage": "make", "log": mklog})
        # 2. summary from the written file
        try:
            summary = shard_summary(wid)
        except Exception as e:
            return self._json({"ok": False, "stage": "parse", "log": str(e)})
        # 3. merge + sanity
        rc, mglog = run(["node", "merge.js"])
        rc2, snlog = run(["node", "sanity-check.js"])
        clean = "✗" not in snlog
        return self._json({"ok": clean, "stage": "build" if not clean else "done",
                           "summary": summary,
                           "log": mklog + "\n" + mglog + "\n" + snlog})

PAGE = r"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Mended Mirror — the Forge</title>
<style>
 :root{--bg:#0c0b10;--panel:#15131c;--panel2:#1b1825;--ink:#e7e2d6;--muted:#9d97a8;
   --gold:#d4af52;--gold2:#f0dca0;--gdim:#8a7330;--line:#2a2733;--green:#6aa06a;--red:#c0566a;--seam:#c98a3d}
 *{box-sizing:border-box}
 body{margin:0;background:radial-gradient(1100px 560px at 50% -8%,#1a1726,#0c0b10 60%);
   color:var(--ink);font:15px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:34px 18px 80px}
 .wrap{max-width:1080px;margin:0 auto}
 h1{font-family:Georgia,serif;font-size:30px;margin:0 0 2px;
   background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}
 .sub{color:var(--muted);font-style:italic;font-family:Georgia,serif;margin:0 0 22px}
 .bar{display:flex;gap:18px;align-items:center;background:var(--panel);border:1px solid var(--line);
   border-radius:10px;padding:12px 18px;margin-bottom:18px;flex-wrap:wrap}
 .stat{font-size:14px}.stat b{color:var(--gold2);font-size:18px}
 .tabs{margin-left:auto;display:flex;gap:6px}
 .tab{background:#241f17;border:1px solid var(--gdim);color:var(--gold);border-radius:18px;padding:4px 14px;cursor:pointer;font-size:13px}
 .tab.on{background:var(--gold);color:#1a140a;font-weight:600}
 .btn{background:var(--gold);color:#1a140a;border:0;border-radius:7px;padding:7px 16px;font-weight:600;cursor:pointer;font-size:14px}
 .btn:hover{background:var(--gold2)} .btn:disabled{opacity:.5;cursor:default}
 .btn.ghost{background:transparent;border:1px solid var(--gdim);color:var(--gold)}
 .btn.green{background:var(--green);color:#0c160c} .btn.red{background:transparent;border:1px solid var(--red);color:var(--red)}
 .row{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 18px;margin:10px 0;
   display:flex;gap:14px;align-items:flex-start;transition:border-color .2s}
 .row .swatch{width:10px;align-self:stretch;border-radius:6px;min-height:38px}
 .row .meta{flex:1;min-width:0}
 .row .name{font-family:Georgia,serif;font-size:18px;color:var(--gold2)}
 .row .fam{color:var(--muted);font-size:12px}
 .row .anchor{color:#cdd6e3;font-size:13.5px;margin-top:3px}
 .row .act{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
 .result{margin-top:12px;border-top:1px dashed var(--gdim);padding-top:12px;width:100%}
 .pill{display:inline-block;border-radius:14px;padding:2px 10px;font-size:12px;margin:0 5px 5px 0;border:1px solid var(--line)}
 .t1{background:#3a1f24;border-color:var(--red);color:#e89aa6}
 .t2{background:#2a2417;color:#e7c97a;border-color:var(--gdim)}
 .t3{background:#1a2417;color:#9ecb8a;border-color:#3c5a30}
 .t4{background:#221b2a;color:#c0a6d0;border-color:#5a3c6c}
 .warn{background:#3a1f24;border:1px solid var(--red);color:#f0b6bf;border-radius:7px;padding:8px 12px;margin:8px 0;font-size:13px}
 .spin{display:inline-block;width:15px;height:15px;border:2px solid var(--gdim);border-top-color:var(--gold);
   border-radius:50%;animation:s .7s linear infinite;vertical-align:-2px;margin-right:7px}
 @keyframes s{to{transform:rotate(360deg)}}
 .figs{color:#b9b3c4;font-size:13px;margin-top:6px}
 .log{background:#08090d;border:1px solid var(--line);border-radius:7px;padding:10px 12px;margin-top:8px;
   font-family:Menlo,Consolas,monospace;font-size:11.5px;color:#7f8a9a;white-space:pre-wrap;max-height:160px;overflow:auto;display:none}
 .logtoggle{color:var(--muted);font-size:12px;cursor:pointer;text-decoration:underline;margin-top:6px;display:inline-block}
 .empty{color:var(--muted);text-align:center;padding:40px;font-style:italic}
 .note{color:var(--muted);font-size:12.5px;margin:6px 0 0}
</style></head><body><div class="wrap">
 <h1>The Mended Mirror — the Forge</h1>
 <p class="sub">Set each shard in gold. Click Forge, judge the seams, keep or redo. Honest gold only.</p>
 <div class="bar">
   <div class="stat"><b id="s-written">–</b> shards set</div>
   <div class="stat"><b id="s-remaining">–</b> remaining</div>
   <div class="stat" id="s-wave" style="color:var(--muted)"></div>
   <button class="btn ghost" onclick="openMap()">Open the map ↗</button>
   <div class="tabs" id="tabs"></div>
 </div>
 <div id="list"></div>
</div>
<script>
let WAVE="1";
const $=s=>document.querySelector(s);
const esc=t=>(t||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

async function refresh(){
  const st=await (await fetch("/api/status")).json();
  $("#s-written").textContent=st.written;
  $("#s-remaining").textContent=st.remaining;
  $("#s-wave").textContent="by wave: "+Object.entries(st.byWave).map(([k,v])=>"w"+k+"="+v).join("  ");
  $("#tabs").innerHTML=["1","2","3"].map(w=>`<div class="tab ${w===WAVE?'on':''}" onclick="setWave('${w}')">Wave ${w}</div>`).join("");
  loadQueue();
}
function setWave(w){WAVE=w;refresh();}
async function loadQueue(){
  const q=await (await fetch("/api/queue?wave="+WAVE)).json();
  if(!q.items.length){$("#list").innerHTML=`<div class="empty">Wave ${WAVE} is fully set in gold. 🌕</div>`;return;}
  $("#list").innerHTML=q.items.map(it=>row(it)).join("");
}
function row(it){
  return `<div class="row" id="row-${it.id}">
    <div class="swatch" style="background:${it.hue}"></div>
    <div class="meta">
      <div class="name">${esc(it.name)}</div>
      <div class="fam">${esc(it.family)} · ${esc(it.region)}</div>
      <div class="anchor">${esc(it.anchor)}</div>
      <div class="result" id="res-${it.id}" style="display:none"></div>
    </div>
    <div class="act">
      <button class="btn" id="btn-${it.id}" onclick="forge('${it.id}')">⚒ Forge</button>
    </div>
  </div>`;
}
async function forge(id,redo){
  const btn=$("#btn-"+id), res=$("#res-"+id);
  btn.disabled=true; btn.innerHTML='<span class="spin"></span>Forging…';
  res.style.display="block";
  res.innerHTML='<span class="note">DeepSeek is setting the relics in gold — ~30–60s…</span>';
  const r=await (await fetch(redo?"/api/redo":"/api/forge",{method:"POST",
     headers:{"Content-Type":"application/json"},body:JSON.stringify({id})})).json();
  renderResult(id,r);
}
function tierPills(t){
  return Object.entries(t).map(([k,v])=>`<span class="pill t${k}">tier ${k}: ${v}</span>`).join("");
}
function renderResult(id,r){
  const btn=$("#btn-"+id), res=$("#res-"+id);
  if(!r.ok){
    btn.disabled=false; btn.innerHTML="⚒ Forge";
    res.innerHTML=`<div class="warn">Forge failed at <b>${r.stage}</b>. ${r.stage==='build'?'A seam points at an id not in the inventory — redo usually fixes it.':''}</div>`
      +logBlock(r.log)
      +`<button class="btn red" onclick="forge('${id}',true)">↻ Redo</button>`;
    return;
  }
  btn.style.display="none";
  const s=r.summary;
  const warnHtml=(s.warnings&&s.warnings.length)
    ? `<div class="warn">⚠ ${s.warnings.map(esc).join(" · ")} — consider a redo to keep the gold honest.</div>` : "";
  res.innerHTML=`
    <div><b style="color:var(--gold2)">${esc(s.name)}</b> — ${s.figures} figures · ${s.seams} seams</div>
    <div style="margin-top:6px">${tierPills(s.tiers)}</div>
    <div class="figs">${s.figureList.map(f=>esc(f.name)).join(" · ")}</div>
    ${warnHtml}
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn ghost" onclick="openMap()">View on map ↗</button>
      <button class="btn green" onclick="commit('${id}')">✓ Keep &amp; commit</button>
      <button class="btn red" onclick="forge('${id}',true)">↻ Redo</button>
    </div>
    ${logBlock(r.log)}`;
}
function logBlock(log){
  const lid="log-"+Math.random().toString(36).slice(2);
  return `<span class="logtoggle" onclick="var e=document.getElementById('${lid}');e.style.display=e.style.display==='block'?'none':'block'">show raw log</span>
    <div class="log" id="${lid}">${esc(log)}</div>`;
}
async function commit(id){
  const res=$("#res-"+id);
  res.innerHTML='<span class="note"><span class="spin"></span>Committing…</span>';
  const r=await (await fetch("/api/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})})).json();
  const row=$("#row-"+id);
  row.style.borderColor="var(--green)";
  row.querySelector(".meta").innerHTML='<div class="name" style="color:var(--green)">✓ set in gold &amp; committed</div>';
  row.querySelector(".act").innerHTML="";
  setTimeout(()=>{row.style.transition="opacity .5s";row.style.opacity="0";setTimeout(refresh,500)},900);
}
async function openMap(){await fetch("/api/openmap",{method:"POST"});}
refresh();
</script></body></html>"""

if __name__ == "__main__":
    import socket
    url = f"http://127.0.0.1:{PORT}"
    # idempotent: if the Forge is already running, just open the browser and exit
    s = socket.socket()
    s.settimeout(0.3)
    if s.connect_ex(("127.0.0.1", PORT)) == 0:
        s.close()
        print(f"⚒  Forge already lit → {url} (opening browser)")
        webbrowser.open(url)
        raise SystemExit
    s.close()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    print(f"⚒  The Forge is lit → {url}")
    print("   (leave this terminal open; close it to stop the server)")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n⚒  Forge banked.")
