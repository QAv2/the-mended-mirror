#!/usr/bin/env python3
"""CDP screenshot harness for the Hall of Ages.
Launches headless Chrome, opens a URL, POLLS the page until the hall reports
built (H.room exists and the gate is past its build stages), waits a few
real frames, screenshots. Immune to virtual-time flakiness.

usage: snap.py <url> <out.png> [readyExpr] [settleSec]
"""
import json, subprocess, sys, time, urllib.request
import websocket

URL = sys.argv[1]
OUT = sys.argv[2]
READY = sys.argv[3] if len(sys.argv) > 3 else "!!(window.H && window.H.room)"
SETTLE = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
PORT = 9333

chrome = subprocess.Popen([
    "google-chrome", "--headless=new",
    "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    "--disable-gpu-sandbox", "--hide-scrollbars",
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
    # heavy frames under software GL (esp. under load) can take well over 30s to
    # encode — give captureScreenshot and the ready-polls generous headroom
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=180)
    mid = [0]
    def send(method, **params):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params}))
        while True:
            msg = json.loads(ws.recv())
            if msg.get("id") == mid[0]:
                return msg.get("result", {})
    def evaluate(expr):
        r = send("Runtime.evaluate", expression=expr, returnByValue=True)
        return r.get("result", {}).get("value")

    send("Page.enable")
    # poll until the hall reports built (up to 5 minutes of real time)
    t0 = time.time()
    while time.time() - t0 < 300:
        try:
            if evaluate(READY):
                break
        except Exception:
            pass
        time.sleep(1.0)
    else:
        print("TIMEOUT waiting for ready; screenshotting anyway", file=sys.stderr)
    state = evaluate("window.H && H.room ? H.room.state : '?'")
    time.sleep(SETTLE)   # let a few real frames render
    shot = send("Page.captureScreenshot", format="png")
    with open(OUT, "wb") as f:
        import base64
        f.write(base64.b64decode(shot["data"]))
    print(f"ready in {time.time()-t0:.1f}s · room.state={state} · wrote {OUT}")
finally:
    chrome.terminate()
    try: chrome.wait(timeout=5)
    except Exception: chrome.kill()
