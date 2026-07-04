#!/usr/bin/env python3
"""The seam contract, proven mechanically.

Loads the Hall, runs the approach's instant path (the same code path the
natural ending and the skip converge on), then asserts the interior is in
EXACTLY the state the conductor expects:

  rig  == POSES.room (target 0,1.1,0 · radius 8.5 · phi 1.28 · theta 0.35)
  env  == interior   (fog 0.0052 obsidian2 · background obsidian2 · shaft 1.55)
  room == lobby      (plinth risen & lit, stars back, fov 58, rig unlocked)

Then round-trips instrument → room to prove the exterior hooks don't disturb
the holodeck. Exits 0 on PASS, 1 on any FAIL.

usage: probe-contract.py [url-base]   (default http://127.0.0.1:8013)
env: SNAP_CHROME, SNAP_GL as in snap.py
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse
import websocket

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8013"
URL = BASE.rstrip("/") + "/index.html"
PORT = int(os.environ.get("SNAP_PORT", "9451"))
PROFILE = os.path.expanduser(f"~/.cache/mm-snap-profile-{PORT}")

if os.environ.get("SNAP_GL") == "gl-egl":
    GL_FLAGS = ["--use-angle=gl-egl"]
else:
    GL_FLAGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

chrome = subprocess.Popen([
    os.environ.get("SNAP_CHROME", "google-chrome"), "--headless=new", *GL_FLAGS,
    "--disable-gpu-sandbox", "--hide-scrollbars",
    f"--user-data-dir={PROFILE}", "--no-first-run", "--disable-extensions",
    f"--remote-debugging-port={PORT}", "--remote-allow-origins=*",
    "--window-size=1280,720", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

fails = []
def check(name, got, want, tol=None):
    ok = (abs(got - want) <= tol) if tol is not None else (got == want)
    print(f"{'PASS' if ok else 'FAIL'}  {name}: got {got!r} want {want!r}")
    if not ok:
        fails.append(name)

try:
    for _ in range(40):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=2); break
        except Exception:
            time.sleep(0.5)
    tab = json.load(urllib.request.urlopen(
        urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.urlencode({'': URL})[1:]}",
                               method="PUT"), timeout=10))
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

    send("Page.enable", deadline=60)
    t0 = time.time()
    while time.time() - t0 < float(os.environ.get("SNAP_READY", "420")):
        try:
            if ev("!!(window.H && window.H.room && window.H.approach)"):
                break
        except Exception:
            pass
        time.sleep(1)
    else:
        print("FAIL  page never became ready"); sys.exit(1)
    print(f"page ready in {time.time()-t0:.0f}s (intro mode: {ev('H.approach.mode')})")

    # run the arrival through the same instant path skip uses
    ev("window.__arrived = 0; H.approach.play(() => { window.__arrived = 1; }, true)")
    t0 = time.time()
    while time.time() - t0 < 30 and not ev("window.__arrived"):
        time.sleep(0.5)
    check("arrived callback fired", ev("window.__arrived"), 1)

    S = ev("""(() => ({
      tgt: [H.rig.dTarget.x, H.rig.dTarget.y, H.rig.dTarget.z],
      radius: H.rig.dSph.radius, phi: H.rig.dSph.phi, theta: H.rig.dSph.theta,
      locked: H.rig.locked, fov: H.camera.fov,
      fogD: H.scene.fog.density, fogC: H.scene.fog.color.getHexString(),
      bg: H.scene.background.getHexString(),
      shaft: H.lights.shaft.intensity, stars: H.starsMat.opacity,
      state: H.room.state,
      plinthY: H.threshold.group.position.y, plinthVis: H.threshold.group.visible,
      caseL: H.threshold.caseLight.intensity,
      extVis: H.exterior.group.visible, skyVis: H.exterior.sky.visible,
      nightK: H.exterior.nightK,
    }))()""")
    check("rig target x", S["tgt"][0], 0, 1e-6)
    check("rig target y", S["tgt"][1], 1.1, 1e-6)
    check("rig target z", S["tgt"][2], 0, 1e-6)
    check("rig radius", S["radius"], 8.5, 1e-6)
    check("rig phi", S["phi"], 1.28, 1e-6)
    check("rig theta", S["theta"], 0.35, 1e-6)
    check("rig unlocked", S["locked"], False)
    check("camera fov", S["fov"], 58, 1e-6)
    check("fog density", S["fogD"], 0.0052, 1e-9)
    check("fog color", S["fogC"], "06070b")
    check("background", S["bg"], "06070b")
    check("shaft intensity", S["shaft"], 1.55, 1e-6)
    check("stars opacity", S["stars"], 0.75, 1e-6)
    check("room state", S["state"], "lobby")
    check("plinth risen y", S["plinthY"], 0.46, 1e-6)
    check("plinth visible", S["plinthVis"], True)
    check("case light", S["caseL"], 1.0, 1e-6)
    check("exterior visible (door view)", S["extVis"], True)
    check("sky persists", S["skyVis"], True)
    check("night complete", S["nightK"], 1, 1e-6)

    # round-trip: execute the holodeck, come back — the hooks must restore
    ev("H.goStation('instrument')")
    time.sleep(1)
    for _ in range(60):
        if ev("H.room.state") == "holo" and not ev("H.rig.locked"):
            break
        time.sleep(1)
    R1 = ev("(() => ({ state: H.room.state, ext: H.exterior.group.visible }))()")
    check("holo reached", R1["state"], "holo")
    check("exterior hidden in holo", R1["ext"], False)
    ev("H.skipCeremony ? H.skipCeremony() : 0; H.goStation('room')")
    time.sleep(1)
    for _ in range(60):
        if ev("H.room.state") == "lobby" and not ev("H.rig.locked"):
            break
        time.sleep(1)
    R2 = ev("""(() => ({ state: H.room.state, ext: H.exterior.group.visible,
      plinthY: H.threshold.group.position.y,
      drum: (() => { let v = null; H.exterior.group.traverse(o => {}); return H.exterior.group.visible; })() }))()""")
    check("lobby restored", R2["state"], "lobby")
    check("exterior restored (door view)", R2["ext"], True)
    check("plinth back", R2["plinthY"], 0.46, 1e-6)

    print(f"\n{'ALL PASS' if not fails else str(len(fails)) + ' FAILURES: ' + ', '.join(fails)}")
    sys.exit(0 if not fails else 1)
finally:
    chrome.terminate()
    try:
        chrome.wait(timeout=5)
    except Exception:
        chrome.kill()
