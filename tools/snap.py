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
READY = sys.argv[3] if len(sys.argv) > 3 else "!!(window.H && window.H.__shotReady)"
SETTLE = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0

# a dedicated per-run profile: never touch the desktop profile, and never
# collide with a zombie snap chrome (port 0 + DevToolsActivePort — a stale
# browser on a fixed port answers /json and eats the websocket in silence)
PROFILE = os.path.expanduser(f"~/.cache/mm-snap-profile-{os.getpid()}")

# Software GL by default. SNAP_GL=gl-egl opts into hardware — the UHD 610
# survives the lobby-first boot's light first frame (verified 2026-07-05;
# the old build-everything first frame used to GPU-hang it).
if os.environ.get("SNAP_GL") == "gl-egl":
    GL_FLAGS = ["--use-angle=gl-egl"]
else:
    GL_FLAGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new",
    *GL_FLAGS,
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    "--remote-debugging-port=0", "--remote-allow-origins=*",
    f"--window-size={os.environ.get('SNAP_WIN', '1600,900')}", URL,
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

try:
    PORT = own_port()
    tab = None
    for _ in range(60):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list", timeout=2))
            page = [t for t in tabs if t.get("type") == "page" and t.get("url", "").startswith("http")]
            if page:
                tab = page[0]; break
        except Exception:
            pass
        time.sleep(0.5)
    if not tab:
        print("no page tab appeared", file=sys.stderr); sys.exit(1)
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
    shot = send("Page.captureScreenshot", format="png",
                deadline=float(os.environ.get("SNAP_SHOT_DEADLINE", "300")))
    with open(OUT, "wb") as f:
        import base64
        f.write(base64.b64decode(shot["data"]))
    print(f"ready in {time.time()-t0:.1f}s · room.state={state} · wrote {OUT}")
finally:
    chrome.terminate()
    try: chrome.wait(timeout=5)
    except Exception: chrome.kill()
    import shutil
    shutil.rmtree(PROFILE, ignore_errors=True)
