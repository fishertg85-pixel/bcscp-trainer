# BCSCP Exam Trainer

A timed, self-scoring practice app for the Board Certified Sterile Compounding Pharmacist (BCSCP) exam. It times every question, flags answers that were correct but slow (the fluency signal), and ranks which concepts to review. Built as a dashboard shell (left nav + top bar + live session-stats panel) in a low-brightness, ADHD-friendly palette.

## Features

- **314 questions** across ten topic areas (environment → category, scenario → testing, engineering specs, storage → BUD, sterilization/depyrogenation, monitoring & personnel, integrated vignettes, records & documentation, safety culture & QA, therapeutics & PN) — including scenario vignettes and NOT/EXCEPT and true-false formats.
- **Four practice modes** from the left nav:
  - *Quick session* — a short random set to warm up.
  - *Exam simulation* — a timed 150-item (or short 50-item) mock with a 3 h 45 m countdown, sampled toward the real blueprint weighting (Domain 1 60% / Domain 2 15% / Domain 3 25%), no feedback until the end, then a readiness verdict and a rough scaled-score estimate.
  - *By domain* — target one or more sections.
  - *Flashcards* — rapid recall on the high-yield numbers (BUDs, ACPH, ISO limits, action levels, pressures, sterilization params, filters, access devices), with a "review the ones I missed" loop.
- **Live session-stats panel**: progress bar plus correct / wrong / skipped / accuracy updating as you answer (time-remaining countdown in exam mode).
- **Per-question + total timing**, with a configurable pace target (default 90 s/item, the real-exam rate).
- **Analytics**: score, pace verdict, projected full-exam time, per-domain and per-section accuracy, a ranked "what to review" list, a filterable per-question table, and attempt history with per-mode run counts and trend arrows.
- **Shuffled answer order** every run (vignettes kept grouped), so you train the reasoning rather than memorizing option letters.
- **Backup & restore**: copy/export history as JSON, and import it on another device.
- **Low-brightness dark-default theme** with a softened light option; reduced-motion aware.

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
