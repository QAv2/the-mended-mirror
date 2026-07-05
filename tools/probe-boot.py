#!/usr/bin/env python3
"""Boot timing probe: loads the hall with ?diag=1, waits for the gate to become
interactive, then dumps the DIAG breadcrumb log (which carries timestamps).

usage: probe-boot.py [extra-query] [wait-secs]
  e.g. probe-boot.py 'tier=0' 240
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse
import websocket

EXTRA = ("&" + sys.argv[1]) if len(sys.argv) > 1 else ""
WAIT = float(sys.argv[2]) if len(sys.argv) > 2 else 300
URL = f"http://127.0.0.1:8013/index.html?diag=1{EXTRA}"
PORT = int(os.environ.get("SNAP_PORT", "9453"))
PROFILE = os.path.expanduser(f"~/.cache/mm-snap-profile-{PORT}")

chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new",
    "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    f"--remote-debugging-port={PORT}", "--remote-allow-origins=*",
    "--window-size=1600,900", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    for _ in range(40):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=2); break
        except Exception:
            time.sleep(0.5)
    tab = json.load(urllib.request.urlopen(
        urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.urlencode({'': URL})[1:]}",
                               method="PUT"), timeout=10))
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=10)
    mid = [0]
    def ev(expr, deadline=30):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": "Runtime.evaluate",
                            "params": {"expression": expr, "returnByValue": True}}))
        t0 = time.time()
        while time.time() - t0 < deadline:
            try:
                msg = json.loads(ws.recv())
            except websocket.WebSocketTimeoutException:
                continue
            if msg.get("id") == mid[0]:
                return msg.get("result", {}).get("result", {}).get("value")
        return None

    t0 = time.time()
    gate_at = None
    world_at = None
    holo_at = None
    while time.time() - t0 < WAIT:
        diag = ev("(document.getElementById('diag')||{}).textContent || ''", deadline=20)
        if diag:
            if gate_at is None and "gate interactive" in diag:
                gate_at = time.time() - t0
                print(f"== gate interactive after {gate_at:.1f}s (wall clock incl. chrome spawn)")
            if world_at is None and "the sky" in diag:
                world_at = time.time() - t0
            if holo_at is None and "holodeck ready" in diag:
                holo_at = time.time() - t0
                break
        time.sleep(2.0)
    print("---- DIAG ----")
    print(ev("(document.getElementById('diag')||{}).textContent || '(no diag)'", deadline=30))
    err = ev("window.__err || ''")
    if world_at: print(f"== world done ~{world_at:.1f}s")
    if holo_at: print(f"== holodeck ready ~{holo_at:.1f}s")
finally:
    chrome.terminate()
    try:
        chrome.wait(timeout=5)
    except Exception:
        chrome.kill()
