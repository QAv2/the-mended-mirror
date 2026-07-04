#!/usr/bin/env python3
"""CDP screenshot harness for the Hall of Ages.
Launches headless Chrome, opens a URL, POLLS the page until the hall reports
built (H.room exists and the gate is past its build stages), waits a few
real frames, screenshots. Immune to virtual-time flakiness.

usage: snap.py <url> <out.png> [readyExpr] [settleSec]
"""
import json, os, subprocess, sys, time, urllib.request
import websocket

URL = sys.argv[1]
OUT = sys.argv[2]
READY = sys.argv[3] if len(sys.argv) > 3 else "!!(window.H && window.H.room)"
SETTLE = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
PORT = int(os.environ.get("SNAP_PORT", "9333"))

# a dedicated profile: never touch (or copy!) the desktop profile — a locked
# default profile makes chrome clone ~160MB into /tmp per launch and stalls CDP
PROFILE = os.path.expanduser("~/.cache/mm-snap-profile") + f"-{PORT}"

# Software GL by default. SNAP_GL=gl-egl opts into hardware — but NB: the
# Hall's first frame GPU-HANGS the UHD 610 on this box (i915 preemption
# reset, context lost), so hardware is only for machines that can chew it.
if os.environ.get("SNAP_GL") == "gl-egl":
    GL_FLAGS = ["--use-angle=gl-egl"]
else:
    GL_FLAGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new",
    *GL_FLAGS,
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    f"--remote-debugging-port={PORT}", "--remote-allow-origins=*",
    f"--window-size=1600,900", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def cdp_http(path):
    return json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}{path}"))

try:
    # wait for the debugger endpoint
    for _ in range(60):
        try:
            cdp_http("/json/version"); break
        except Exception:
            time.sleep(0.5)
    tab = json.load(urllib.request.urlopen(
        urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.urlencode({'': URL})[1:]}",
                               method="PUT")))
    # Under software GL the renderer blocks synchronously for long stretches
    # (shader compiles, canvas uploads) — a single blocking recv() would die
    # there. Instead: short per-recv timeouts inside an overall deadline, so a
    # response that arrives late still lands.
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=15)
    mid = [0]
    def send(method, deadline=240, **params):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params}))
        t0 = time.time()
        while time.time() - t0 < deadline:
            try:
                msg = json.loads(ws.recv())
            except websocket.WebSocketTimeoutException:
                continue                      # renderer busy — keep waiting
            if msg.get("id") == mid[0]:
                return msg.get("result", {})
        raise TimeoutError(f"{method} unanswered after {deadline}s")
    def evaluate(expr, deadline=240):
        r = send("Runtime.evaluate", deadline=deadline, expression=expr, returnByValue=True)
        return r.get("result", {}).get("value")

    send("Page.enable", deadline=60)
    # poll until the hall reports built
    READY_BUDGET = float(os.environ.get("SNAP_READY", "420"))
    t0 = time.time()
    while time.time() - t0 < READY_BUDGET:
        try:
            if evaluate(READY, deadline=READY_BUDGET - (time.time() - t0)):
                break
        except Exception:
            pass
        time.sleep(1.0)
    else:
        print("TIMEOUT waiting for ready; screenshotting anyway", file=sys.stderr)
    state = evaluate("window.H && H.room ? H.room.state : '?'")
    time.sleep(SETTLE)   # let a few real frames render
    shot = send("Page.captureScreenshot", format="png", deadline=300)
    with open(OUT, "wb") as f:
        import base64
        f.write(base64.b64decode(shot["data"]))
    print(f"ready in {time.time()-t0:.1f}s · room.state={state} · wrote {OUT}")
finally:
    chrome.terminate()
    try: chrome.wait(timeout=5)
    except Exception: chrome.kill()
