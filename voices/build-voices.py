#!/usr/bin/env python3
"""
THE CONCLAVE OF BECOMING — the voice forge.

Compiles the hand-written voice layer into its two surfaces:

    voices/covenant.md            (the shared ground, woven into every deep voice)
    voices/profiles/<id>.md       (one figure, one reference frame)
        │
        ├──►  data/conclave-voices.js     CONCLAVE_VOICES global, read by
        │                                 conclave-voice.js at persona build
        └──►  voices/voice-book.html      the reading surface — regenerate after
                                          every edit; the .md stays canonical

Run from anywhere:  python3 voices/build-voices.py
"""

import json, re, html, datetime, base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICES = ROOT / "voices"
PROFILES = VOICES / "profiles"
OUT_JS = ROOT / "data" / "conclave-voices.js"
OUT_BOOK = VOICES / "voice-book.html"
OUT_BOOK_SC = VOICES / "voice-book.selfcontained.html"
FONTS = ROOT / "fonts"

# The local book links its sibling seal file; the shareable self-contained book
# (which travels to any share path) links the DEPLOYED seal by absolute URL.
SEAL_HREF_LOCAL = "seal-2026-07-07.html"
SEAL_HREF_LIVE = "https://qav2.github.io/the-mended-mirror/share/amaterasu-c6c1e03c5899f8d56af262ff/"

_FONT_FACES = [
    ("Marcellus", "normal", 400, "marcellus-400.woff2"),
    ("Spectral", "italic", 300, "spectral-300i.woff2"),
    ("Spectral", "italic", 400, "spectral-400i.woff2"),
    ("Spectral", "normal", 300, "spectral-300.woff2"),
    ("Spectral", "normal", 400, "spectral-400.woff2"),
    ("Spectral", "normal", 500, "spectral-500.woff2"),
]


def selfcontained(page):
    """One portable file: inline the webfonts as base64 and repoint the seal link
    at the live deploy, so the book is safe to drop at any unlisted share path."""
    blocks = []
    for fam, style, wt, fn in _FONT_FACES:
        b64 = base64.b64encode((FONTS / fn).read_bytes()).decode()
        blocks.append(
            "@font-face{font-family:'%s';font-style:%s;font-weight:%d;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format('woff2');}" % (fam, style, wt, b64))
    page = page.replace(
        '<link rel="stylesheet" href="../fonts/fonts.css">',
        "<style>\n" + "\n".join(blocks) + "\n</style>", 1)
    page = page.replace('href="%s"' % SEAL_HREF_LOCAL, 'href="%s"' % SEAL_HREF_LIVE, 1)
    return page

# the seating order of the book — roughly the order a visitor is likely to seek them
BOOK_ORDER = [
    "christianity-christ", "zeus", "greek-hestia", "greek-poseidon", "athena",
    "prometheus",
    "buddhist-sakyamuni", "vaishnava-krishna", "shiva", "buddhist-avalokitesvara",
    "zoroastrian-zarathushtra",
    "norse-odin", "thor", "loki", "celtic-brigid", "chinese-folk-sun-wukong",
    "chinese-zhuangzi", "isis", "anubis", "inanna", "aztec-quetzalcoatl",
    "aztec-xolotl",
    "orphism-orpheus",
    "anansi", "amaterasu",
]

TRAD_LABEL = {
    "christianity": "Christianity", "greek": "Greek", "buddhist": "Buddhism",
    "vaishnava": "Vaishnavism", "vedic": "Vedic / Hindu", "norse": "Norse",
    "egyptian": "Egyptian", "orphism": "Orphism", "akan": "Akan",
    "shinto": "Shinto", "mesopotamian": "Mesopotamian",
    "chinese-folk": "Chinese Folk", "chinese": "Chinese / Daoist",
    "zoroastrian": "Zoroastrian", "aztec": "Aztec / Nahua", "celtic": "Celtic / Irish",
}


def parse_md(path):
    """frontmatter + body from a profile file."""
    text = path.read_text(encoding="utf-8")
    meta, body = {}, text
    m = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = text[m.end():]
    return meta, body.strip()


# ---------------------------------------------------------------- markdown → html
def md_html(md):
    """A small renderer for the subset these files use: #/## heads, lists,
    bold/italic, paragraphs. Anything fancier belongs in the source as prose."""
    out, para, in_list = [], [], False

    def flush_para():
        nonlocal para
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para = []

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    def inline(s):
        s = html.escape(s, quote=False)
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<![\w*])\*([^*\n]+?)\*(?![\w*])", r"<em>\1</em>", s)
        return s

    for raw in md.splitlines():
        line = raw.rstrip()
        if not line.strip():
            flush_para(); close_list(); continue
        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            flush_para(); close_list()
            lvl = len(m.group(1))
            out.append(f"<h{lvl+2} class='sec'>{inline(m.group(2))}</h{lvl+2}>")
            continue
        m = re.match(r"^\s*-\s+(.*)$", line)
        if m:
            flush_para()
            if not in_list:
                out.append("<ul>"); in_list = True
            out.append("<li>" + inline(m.group(1)) + "</li>")
            continue
        # continuation of a list item, indented under it
        if in_list and re.match(r"^\s{2,}\S", line):
            out[-1] = out[-1][:-5] + " " + inline(line.strip()) + "</li>"
            continue
        para.append(line.strip())
    flush_para(); close_list()
    return "\n".join(out)


# ---------------------------------------------------------------------- gather
covenant = (VOICES / "covenant.md").read_text(encoding="utf-8").strip()

profiles, order = {}, []
found = {p.stem: p for p in sorted(PROFILES.glob("*.md"))}
for pid in BOOK_ORDER + sorted(set(found) - set(BOOK_ORDER)):
    if pid not in found:
        print(f"  · (not yet written: {pid})")
        continue
    meta, body = parse_md(found[pid])
    fid = meta.get("id", pid)
    if fid != pid:
        print(f"  ! {pid}.md declares id {fid} — filename wins is NOT assumed; fix one")
    profiles[fid] = {
        "name": meta.get("name", fid),
        "tradition": meta.get("tradition", ""),
        "class": meta.get("class", "embodied"),
        "status": meta.get("status", "first-pass"),
        "body": body,
    }
    order.append(fid)

built = datetime.date.today().isoformat()

# ---------------------------------------------------------------------- data js
payload = {"built": built, "covenant": covenant, "profiles": profiles}
OUT_JS.write_text(
    "/* ============================================================================\n"
    "   THE CONCLAVE OF BECOMING — the deep voices (GENERATED, do not edit).\n"
    "   Source of truth: voices/covenant.md + voices/profiles/*.md\n"
    "   Rebuild:         python3 voices/build-voices.py\n"
    "   ============================================================================ */\n"
    "(function (root) {\n"
    '  "use strict";\n'
    "  root.CONCLAVE_VOICES = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n"
    '})(typeof window !== "undefined" ? window : globalThis);\n',
    encoding="utf-8",
)
print(f"  ✓ {OUT_JS.relative_to(ROOT)}  ({len(profiles)} profiles, {OUT_JS.stat().st_size//1024} KB)")

# -------------------------------------------------------------------- the book
def chapter(fid):
    p = profiles[fid]
    trad = TRAD_LABEL.get(p["tradition"], p["tradition"])
    return f"""
<article class="figure" id="{fid}">
  <header>
    <div class="trad">{html.escape(trad)} · <span class="cls">{p['class']}</span> · <span class="status">{p['status']}</span></div>
    <h2>{html.escape(p['name'])}</h2>
  </header>
  {md_html(p['body'])}
  <div class="totop"><a href="#top">⟡ the gathering</a></div>
</article>"""

toc = "\n".join(
    f'<a class="card" href="#{fid}"><span class="who">{html.escape(profiles[fid]["name"])}</span>'
    f'<span class="of">{html.escape(TRAD_LABEL.get(profiles[fid]["tradition"], profiles[fid]["tradition"]))}</span></a>'
    for fid in order
)

book = f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>The Voices of the Conclave — first pass</title>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>
  :root {{
    --void:#06070b; --ink:#e8e2d4; --dim:#9a937f; --faint:#6b6557;
    --gold:#ffd86b; --gold2:#e6ad44; --goldDeep:#b8893a; --seam:#2a2416;
  }}
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  html {{ scroll-behavior:smooth; }}
  body {{ background:var(--void); color:var(--ink);
         font:400 17px/1.72 'Spectral', Georgia, serif;
         padding:0 20px 12vh; }}
  .wrap {{ max-width:46rem; margin:0 auto; }}
  h1,h2,h3,h4 {{ font-family:'Marcellus', serif; font-weight:400; }}

  .masthead {{ text-align:center; padding:11vh 0 6vh; }}
  .masthead .mark {{ color:var(--goldDeep); letter-spacing:.55em; font-size:12px;
                     text-transform:uppercase; }}
  .masthead h1 {{ font-size:clamp(30px,5.4vw,46px); color:var(--gold);
                  letter-spacing:.06em; margin:.45em 0 .3em; }}
  .masthead .sub {{ color:var(--dim); font-style:italic; }}
  .masthead .built {{ color:var(--faint); font-size:13px; margin-top:1.2em;
                      letter-spacing:.12em; }}
  .masthead .sealed {{ margin-top:1.5em; }}
  .masthead .sealed a {{ color:var(--gold2); font-size:12px; letter-spacing:.22em;
                         text-transform:uppercase; text-decoration:none;
                         border-bottom:1px solid var(--seam); padding-bottom:3px;
                         transition:color .25s, border-color .25s; }}
  .masthead .sealed a:hover {{ color:var(--gold); border-color:var(--goldDeep); }}

  .note {{ border:1px solid var(--seam); background:#0a0c12; border-radius:10px;
           padding:1.4em 1.6em; color:var(--dim); font-size:15.5px; margin:0 0 4em; }}
  .note b {{ color:var(--ink); font-weight:500; }}
  .note code {{ font:13px/1 ui-monospace,monospace; color:var(--gold2);
                background:#11131c; padding:2px 7px; border-radius:5px; }}

  .toc {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
          gap:10px; margin:0 0 6em; }}
  .toc .card {{ border:1px solid var(--seam); border-radius:9px; padding:.85em 1em;
                text-decoration:none; transition:border-color .25s, background .25s; }}
  .toc .card:hover {{ border-color:var(--goldDeep); background:#0a0c12; }}
  .toc .who {{ display:block; color:var(--gold); font-family:'Marcellus',serif;
               font-size:15.5px; }}
  .toc .of  {{ display:block; color:var(--faint); font-size:12.5px;
               letter-spacing:.14em; text-transform:uppercase; margin-top:3px; }}

  .covenant {{ margin:0 0 6em; }}
  .covenant h2 {{ color:var(--gold); font-size:26px; margin-bottom:.6em; }}

  article.figure {{ border-top:1px solid var(--seam); padding:4.5em 0 2em; }}
  article.figure header .trad {{ color:var(--goldDeep); font-size:12px;
      letter-spacing:.3em; text-transform:uppercase; }}
  article.figure header .cls, article.figure header .status {{ color:var(--faint); }}
  article.figure header h2 {{ color:var(--gold); font-size:clamp(24px,3.6vw,32px);
      margin:.25em 0 1em; }}

  .sec {{ color:var(--gold2); font-size:13.5px; letter-spacing:.34em;
          text-transform:uppercase; margin:2.4em 0 .8em; }}
  h3.sec {{ font-size:13.5px; }} h4.sec {{ font-size:12.5px; color:var(--goldDeep); }}
  p {{ margin:.85em 0; }}
  ul {{ margin:.85em 0 .85em 1.15em; list-style:none; }}
  li {{ margin:.5em 0; padding-left:1em; position:relative; }}
  li::before {{ content:"·"; color:var(--goldDeep); position:absolute; left:0; }}
  strong {{ color:var(--gold); font-weight:500; }}
  em {{ color:var(--ink); }}
  p + p {{ text-indent:0; }}

  .totop {{ margin-top:2.5em; }}
  .totop a {{ color:var(--faint); font-size:12.5px; letter-spacing:.22em;
              text-decoration:none; text-transform:uppercase; }}
  .totop a:hover {{ color:var(--gold2); }}

  @media print {{ body {{ background:#fff; color:#111; }} }}
</style></head>
<body><div class="wrap" id="top">

<div class="masthead">
  <div class="mark">the mended mirror · the conclave of becoming</div>
  <h1>The Voices of the Conclave</h1>
  <div class="sub">first pass — {len(order)} presences, one covenant</div>
  <div class="built">forged {built} · source: voices/*.md · rebuild: python3 voices/build-voices.py</div>
  <div class="sealed"><a href="seal-2026-07-07.html">⟡ the seal of the first seed · 7 july 2026</a></div>
</div>

<div class="note">
  <b>What this is.</b> The deep-voice layer for the Conclave's LLM seam. Each profile below is
  woven into that figure's system prompt (identity line → covenant → the corpus record →
  the profile), so a summoned presence speaks from its own reference frame toward the
  mirror — never as a caricature, never as oneness mush. Figures without a profile fall
  back to the record-built persona unchanged. <b>To hear one live:</b> set
  <code>localStorage['conclave.voice.key']</code> to an Anthropic key and open the Conclave with
  <code>?voice=live</code>. The <code>.md</code> files are canonical; this page is the reading surface.
</div>

<nav class="toc">{toc}</nav>

<section class="covenant">
{md_html(covenant)}
</section>

{''.join(chapter(fid) for fid in order)}

</div></body></html>
"""
OUT_BOOK.write_text(book, encoding="utf-8")
print(f"  ✓ {OUT_BOOK.relative_to(ROOT)}  ({OUT_BOOK.stat().st_size//1024} KB)")

OUT_BOOK_SC.write_text(selfcontained(book), encoding="utf-8")
print(f"  ✓ {OUT_BOOK_SC.relative_to(ROOT)}  ({OUT_BOOK_SC.stat().st_size//1024} KB, self-contained)")
