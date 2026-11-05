# BCSCP Exam Trainer

A timed, self-scoring practice app for the Board Certified Sterile Compounding Pharmacist (BCSCP) exam. It times every question, flags answers that were correct but slow (the fluency signal), and ranks which concepts to review.

## Features

- **175 questions** across six reasoning types: environment → category, scenario → testing, engineering specs, storage → BUD, sterilization/depyrogenation, and monitoring/personnel — plus NOT/EXCEPT and true-false formats.
- **Per-question + total timing**, with a configurable pace target (default 90 s/item, the real-exam rate).
- **Analytics dashboard**: score, pace verdict, projected full-exam time, per-section accuracy, a ranked "what to review" list, and a filterable per-question table.
- **Shuffled answer order** every run, so you train the reasoning rather than memorizing option letters.
- **Attempt history** with per-mode run counts and trend arrows, stored in the browser.
- **Backup & restore**: copy/export history as JSON, and import it on another device.
- **Light/dark theme.**

## Project structure

```
index.html       Standalone app shell (links the files below)
styles.css       All styles (design tokens + components)
app.js           App logic; loads questions.json at runtime
questions.json   The question bank (edit/expand here)
build.py         Inlines everything into dist/claude_artifact.html for Claude
```

## Run it locally

`fetch()` needs http, so serve the folder (don't open `index.html` as a `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

Push to GitHub, then enable **Settings → Pages → Deploy from branch → main / root**. The app is fully static, so it just works. On your own hosting the browser download/export restrictions that apply inside Claude artifacts do not apply — the JSON export becomes a real file.

## Publish as a Claude artifact

```bash
python3 build.py        # writes dist/claude_artifact.html (single inlined file)
```

Then publish that file as an artifact.

## Editing the question bank

`questions.json` is an array of objects:

```json
{
  "n": 1,
  "sec": "A",
  "secName": "Environment → Category",
  "topic": "Category from environment",
  "stem": "…question text…",
  "opts": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "correct": "A",
  "rationale": "…why…"
}
```

Add items with a new `n`, a section letter `A`–`F`, and a `topic` (used by the review ranking). The app shuffles option order at runtime, so author `opts`/`correct` in any order.

## Data & privacy

Attempt history lives in the browser's `localStorage` on the device you use — it is not synced or sent anywhere. Use **Copy history** / **Import file** to move it between devices. For automatic cross-device sync, the next step would be a small backend (e.g. Supabase); not implemented yet.

## Accuracy

Question content is anchored to USP <797> (2023), <800>, and related chapters. Domain-2 clinical items draw on ASPEN/INS references. Verify against current primary sources before relying on any single item.
