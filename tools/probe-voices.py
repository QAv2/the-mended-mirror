#!/usr/bin/env python3
"""Voice-layer probe: boots the Conclave headless, confirms CONCLAVE_VOICES is
loaded, then opens every deep-profiled persona and asserts its system prompt
carries all four strata (identity → covenant → record → profile). Collects any
page exceptions along the way.

usage: probe-voices.py [wait-secs]     (server on :8013 must be running)
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse
import websocket

WAIT = float(sys.argv[1]) if len(sys.argv) > 1 else 90
URL = "http://127.0.0.1:8013/conclave.html"
PORT = int(os.environ.get("SNAP_PORT", "9457"))
PROFILE = os.path.expanduser(f"~/.cache/mm-snap-profile-{PORT}")

chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new",
    "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    f"--remote-debugging-port={PORT}", "--remote-allow-origins=*",
    "--window-size=1600,900", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

exceptions = []
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

    def pump(msg):
        if msg.get("method") == "Runtime.exceptionThrown":
            d = msg["params"]["exceptionDetails"]
            exceptions.append(d.get("text", "") + " " +
                              (d.get("exception", {}) or {}).get("description", "")[:200])

    def send(method, params=None):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params or {}}))
        t0 = time.time()
        while time.time() - t0 < 30:
            try:
                msg = json.loads(ws.recv())
            except websocket.WebSocketTimeoutException:
                continue
            pump(msg)
            if msg.get("id") == mid[0]:
                return msg
        return {}

    def ev(expr, deadline=30):
        r = send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
        return r.get("result", {}).get("result", {}).get("value")

    send("Runtime.enable")

    t0 = time.time()
    while time.time() - t0 < WAIT:
        if ev("!!(window.CONCLAVE && CONCLAVE.voice && CONCLAVE.M)"):
            break
        time.sleep(1.0)
    else:
        print("✗ conclave never became ready"); sys.exit(1)

    n = ev("window.CONCLAVE_VOICES ? Object.keys(CONCLAVE_VOICES.profiles).length : -1")
    print(f"== CONCLAVE_VOICES loaded: {n} deep profiles"
          if n and n > 0 else "✗ CONCLAVE_VOICES missing or empty")

    ids = ev("Object.keys(window.CONCLAVE_VOICES ? CONCLAVE_VOICES.profiles : {})") or []
    ok = 0
    for fid in ids:
        res = ev(f"""(function(){{
          const fi = CONCLAVE.M.figIndexById[{json.dumps(fid)}];
          if (fi === undefined) return "no-corpus-id";
          CONCLAVE.voice.close(); CONCLAVE.voice.open(fi);
          const s = (CONCLAVE.voice.persona || {{}}).system || "";
          const strata = ["met in the Conclave of Becoming", "THE GRACE GRAMMAR",
                          "WHAT THE RECORD HOLDS", "WORKED EXCHANGE", "Speak now as"];
          const missing = strata.filter(x => !s.includes(x));
          return missing.length ? ("missing: " + missing.join(", ")) : ("ok " + s.length);
        }})()""")
        tag = "✓" if isinstance(res, str) and res.startswith("ok") else "✗"
        if tag == "✓": ok += 1
        print(f"  {tag} {fid}: {res}")
    print(f"== {ok}/{len(ids)} personas weave all four strata")

    # give any async chunk loads a beat, then report exceptions
    time.sleep(2)
    ev("1")
    print(f"== page exceptions: {len(exceptions)}")
    for e in exceptions[:10]:
        print("   !", e)
    sys.exit(0 if (ok == len(ids) and not exceptions) else 1)
finally:
    chrome.terminate()
    try:
        chrome.wait(timeout=5)
    except Exception:
        chrome.kill()
