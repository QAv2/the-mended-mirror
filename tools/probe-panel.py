#!/usr/bin/env python3
"""The reliquary chunk/panel path, proven end-to-end (spec §2c).

Loads the Hall in the instrument state (lite core), then drives the real
panel opens a visitor would: a tradition (chunk-gated dossier), a figure
(chunk-gated gloss + edge notes), a seam (edge note). Asserts the prose
actually LANDED in the DOM — not just that the fetch resolved.

Then the two race tests:
  stale-token  — open uncached tradition, immediately open a joint (instant
                 render); the slow chunk must NOT repaint the joint panel.
  close-race   — open uncached tradition, immediately close; the panel must
                 NOT reopen by itself when the chunk lands.

Exits 0 on PASS, 1 on any FAIL.
usage: probe-panel.py [url-base]   (default http://127.0.0.1:8013)
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse
import websocket

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8013"
# render=0: logic-only frames — SwiftShader on this box dies mid-frame at
# catalog scale, and this probe reads DOM + math, not pixels
URL = BASE.rstrip("/") + "/index.html?shot=instrument&render=0&tier=0"
# port 0: chrome picks a free port and writes it to <profile>/DevToolsActivePort
# — no collision with zombie browsers from older runs (the silent-mute trap:
# /json/list answered by a STALE chrome whose wedged tab eats the websocket)
PROFILE = os.path.expanduser(f"~/.cache/mm-snap-profile-{os.getpid()}")
SHOT = os.environ.get("PANEL_SHOT")          # optional: screenshot path

GL_FLAGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

# launch WITH the url — /json/new tab creation stopped answering on this chrome
chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new", *GL_FLAGS,
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    "--remote-debugging-port=0", "--remote-allow-origins=*",
    "--window-size=1600,900", URL,
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def own_port(timeout=30):
    p = os.path.join(PROFILE, "DevToolsActivePort")
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            with open(p) as f:
                return int(f.readline().strip())
        except Exception:
            time.sleep(0.3)
    raise TimeoutError("chrome never wrote DevToolsActivePort")

PORT = own_port()

fails = []
def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  — {detail}" if detail else ""))
    if not ok:
        fails.append(name)

try:
    tab = None
    for _ in range(60):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list", timeout=2))
            page = [t for t in tabs if t.get("type") == "page" and "index.html" in t.get("url", "")]
            if page:
                tab = page[0]; break
        except Exception:
            pass
        time.sleep(0.5)
    if not tab:
        print("FAIL  page tab never appeared"); sys.exit(1)
    print(f"attached to our chrome on port {PORT}")
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=15)
    mid = [0]
    def send(method, deadline=300, **params):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params}))
        t0 = time.time()
        while time.time() - t0 < deadline:
            try:
                msg = json.loads(ws.recv())
            except websocket.WebSocketTimeoutException:
                continue
            if msg.get("id") == mid[0]:
                return msg.get("result", {})
        raise TimeoutError(method)
    def ev(expr, deadline=300):
        r = send("Runtime.evaluate", deadline=deadline, expression=expr, returnByValue=True)
        res = r.get("result", {})
        if res.get("subtype") == "error":
            raise RuntimeError(res.get("description", "eval error"))
        return res.get("value")
    def panel():
        return ev("document.getElementById('reliquary').innerHTML")
    def panel_open():
        return ev("document.getElementById('reliquary').classList.contains('open')")
    def wait_for(expr, secs=15):
        t0 = time.time()
        while time.time() - t0 < secs:
            if ev(expr):
                return True
            time.sleep(0.4)
        return False

    send("Page.enable", deadline=60)
    t0 = time.time()
    while time.time() - t0 < float(os.environ.get("SNAP_READY", "420")):
        try:
            if ev("!!(window.H && window.H.ui && window.H.room)"):
                break
        except Exception:
            pass
        time.sleep(1)
    else:
        print("FAIL  page never became ready"); sys.exit(1)
    print(f"page ready in {time.time()-t0:.0f}s")

    check("lite core booted", ev("HALL.chunks.lite === true"))
    n = ev("Object.keys(MIRROR_DATA.traditions).length")
    check("288 traditions in core", n == 288, f"got {n}")
    n = ev("MIRROR_DATA.figures.length")
    check("4106 figures in core", n == 4106, f"got {n}")

    # ---- 1 · tradition panel: chunk-gated dossier --------------------------
    ev("H.ui.openTradition('greek')")
    ok = wait_for("(() => { const h = document.getElementById('reliquary').innerHTML;"
                  " return h.indexOf('unsealing') === -1 && h.length > 400; })()")
    h = panel()
    check("greek panel rendered", ok, f"len {len(h)}")
    check("greek dossier essence present", "The cosmos it holds" in h or "rel-essence" in h)
    check("greek figures list (31)", "Its figures — 31" in h)
    check("greek partners present", "Where it converges" in h)

    # ---- 2 · figure panel: gloss + edge notes from the chunk ---------------
    ev("H.ui.openFigure(H.model.figById['zeus'])")
    ok = wait_for("(() => { const h = document.getElementById('reliquary').innerHTML;"
                  " return h.indexOf('unsealing') === -1 && h.indexOf('Zeus') !== -1; })()")
    h = panel()
    check("zeus panel rendered", ok, f"len {len(h)}")
    check("zeus gloss landed (chunk prose)", "King of the Olympians" in h)
    n = ev("(() => { const els = document.querySelectorAll('#reliquary .rel-note');"
           " let filled = 0; els.forEach(e => { if (e.textContent.trim().length > 10) filled++; });"
           " return [els.length, filled]; })()")
    check("zeus edge notes filled", n[0] > 0 and n[1] == n[0], f"{n[1]}/{n[0]} notes have text")
    check("zeus facet present", "Where it stands alone" in h)

    # ---- 3 · seam panel (uncached endpoint tradition) -----------------------
    seam = ev("(() => { const m = H.scroll.moments.find(m => {"
              " const f = MIRROR_DATA.figures[H.model.figById[m.edge.a]];"
              " return f && !['greek'].includes(f.tradition) && m.edge.note !== undefined ? false : true; });"
              " return null; })()")
    # pick a dated seam whose endpoint tradition is NOT yet cached
    got = ev("(() => { for (const m of H.scroll.moments) {"
             " const ai = H.model.figById[m.edge.a];"
             " const t = MIRROR_DATA.figures[ai].tradition;"
             " if (t !== 'greek' && !HALL.chunks.ready([t])) {"
             "   window.__seam = m.edge; return [t, m.edge.a, m.edge.b]; } }"
             " return null; })()")
    if got:
        ev("H.ui.openSeam(window.__seam)")
        ok = wait_for("(() => { const h = document.getElementById('reliquary').innerHTML;"
                      " return h.indexOf('unsealing') === -1 && h.indexOf('a seam') !== -1; })()")
        note = ev("(() => { const els = document.querySelectorAll('#reliquary .rel-gloss');"
                  " return Array.from(els).map(e => e.textContent.trim()).join('|'); })()")
        check("seam panel rendered (uncached chunk)", ok, f"{got[0]}: {got[1]}·{got[2]}")
        check("seam note landed", len(note) > 40, f"len {len(note)}")
    else:
        check("seam pick", False, "no uncached dated seam found")

    # ---- 4 · stale-token race ----------------------------------------------
    # throttle the network so the chunk is genuinely slow
    send("Network.enable", deadline=30)
    send("Network.emulateNetworkConditions", offline=False, latency=1500,
         downloadThroughput=30000, uploadThroughput=30000, deadline=30)
    tr = ev("(() => { const ks = Object.keys(MIRROR_DATA.traditions);"
            " for (const k of ks) if (!HALL.chunks.ready([k])) return k; return null; })()")
    ev(f"H.ui.openTradition('{tr}')")
    time.sleep(0.3)
    check("slow chunk shows unsealing", "unsealing" in panel(), tr or "?")
    ev("H.ui.openJoint(0)")           # instant render, no chunk needed
    time.sleep(4.0)                    # let the slow chunk land
    h = panel()
    joint_name = ev("H.model.joints[0].a.name")
    check("stale chunk must not repaint joint panel", joint_name in h and "shard ·" not in h,
          f"panel shows {'joint' if joint_name in h else 'OTHER'}")

    # ---- 5 · close race ------------------------------------------------------
    tr2 = ev("(() => { const ks = Object.keys(MIRROR_DATA.traditions);"
             " for (const k of ks) if (!HALL.chunks.ready([k])) return k; return null; })()")
    ev(f"H.ui.openTradition('{tr2}')")
    time.sleep(0.3)
    ev("H.ui.close()")
    time.sleep(4.0)
    check("closed panel must stay closed when chunk lands", not panel_open(), tr2 or "?")
    send("Network.emulateNetworkConditions", offline=False, latency=0,
         downloadThroughput=-1, uploadThroughput=-1, deadline=30)

    # ---- 6 · screenshot for the eyeball -------------------------------------
    if SHOT:
        ev("H.ui.openTradition('greek')")
        wait_for("document.getElementById('reliquary').innerHTML.indexOf('Its figures') !== -1")
        time.sleep(2)
        shot = send("Page.captureScreenshot", format="png", deadline=120)
        import base64
        with open(SHOT, "wb") as f:
            f.write(base64.b64decode(shot["data"]))
        print(f"wrote {SHOT}")

    print(f"\n{'ALL PASS' if not fails else str(len(fails)) + ' FAILURES: ' + ', '.join(fails)}")
    sys.exit(0 if not fails else 1)
finally:
    chrome.terminate()
    try:
        chrome.wait(timeout=5)
    except Exception:
        chrome.kill()
    import shutil
    shutil.rmtree(PROFILE, ignore_errors=True)
