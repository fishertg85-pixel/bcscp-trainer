#!/usr/bin/env python3
"""Inline styles.css, app.js, and questions.json into one file for publishing as a Claude artifact.
Standalone hosting (GitHub Pages) uses index.html + the separate files directly; this is only for Claude."""
import json, os
os.makedirs("dist", exist_ok=True)
styles = open("styles.css", encoding="utf-8").read()
app = open("app.js", encoding="utf-8").read()
data = open("questions.json", encoding="utf-8").read()
body_start = open("index.html", encoding="utf-8").read().split("<body>")[1].split("<script")[0].strip()
fonts = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">\n')
out = (fonts
       + '<title>BCSCP Exam Trainer</title>\n'
       + '<meta name="claude:viewport-fit-sides" content="cover">\n'
       + '<style>\n' + styles + '\n</style>\n'
       + body_start + '\n'
       + '<script>window.QUESTIONS = ' + data + ';</script>\n'
       + '<script>\n' + app + '\n</script>\n')
open("dist/claude_artifact.html", "w", encoding="utf-8").write(out)
print("Wrote dist/claude_artifact.html (", len(out), "bytes )")
