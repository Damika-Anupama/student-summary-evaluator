# Frontend Demo — Goals & Progress

This branch (`frontend-demo`) is the **frontend-only, deployable demo** of the Student
Summary Evaluator. It must run on Vercel with **no Django backend, no database, and no
external API keys** — all data is served from in-app demo fixtures.

## Goals

- [x] **G1 — Branch**: `frontend-demo` branch created and kept frontend-focused.
- [x] **G2 — Demo data layer**: Centralized fixtures; every Next.js API route under
      `src/pages/api/*` serves fixture data (Django `fetch`, Prisma, and OpenAI
      removed). Added `/api/summaryview` and pointed the stepper at it.
- [x] **G3 — Builds clean & standalone**: `next build` passes with no backend/DB/keys and
      no SSR warnings; verified all routes return 200 with fixture data via `next start`.
- [x] **G4 — UI/UX polish**: teacher persona; students/history/dashboard wired to fixtures;
      role toggle navigates to role home; fixed eager react-quill import; fixed broken
      score-range display and wired AI suggestions into the result modal; loading/empty
      states + console cleanup; removed dead `config.js`. Verified all read/write API
      routes and all routes return 200 via `next start`.
- [x] **G5 — Vercel deployment**: app moved to the **repo root**; deployed to production
      via Vercel CLI. **Live at https://student-summary-evaluator.vercel.app (HTTP 200).**
      Required bumping Next.js 15.5.4 → 15.5.18 (Vercel blocks the vulnerable version).
      Verified live via browse: dashboard data, charts, donut, submissions all correct.
- [~] **G6 — Docs**: README rewritten for the demo branch, and brought back in sync at
      v3.8.0 (see Iteration 4). Still open: the portfolio card link, which lives in
      another repo, needs switching to the live URL.

## Progress log

- Built demo data layer, removed backend deps, fixed SSR build, branded identity,
  rewrote students/history pages, fixed score modal + AI suggestions, added loading
  states, stripped branch to frontend-only, documented + pushed to `origin/frontend-demo`.
- Made page searches functional (students, assignments); added Demo badge + persona
  avatar; rewrote the student "Available Assignments" page from the Dropbox/Slack template.
- **Visual QA via gstack `/browse`** (headless Chromium) across teacher dashboard, student
  dashboard/stepper, assignments, history, and the full submit → score-modal flow. This
  caught and fixed three real bugs: Total Completion stuck at 0% (stale enrolled count),
  Overall Score sub-labels showing counts as "%", and the Score histogram off-by-one
  bucketing. All confirmed fixed live (completion 83.3%, "4 students", correct buckets).

## Iteration 2 — further improvements (live demo polish)

- [x] **P1 — Form feedback**: Settings (notifications, password) + Account "Save" now show
      confirmation snackbars.
- [x] **P2 — Richer demo data**: 8–9 summaries per assignment across all 10 students,
      scores spanning 50–95 (live: 10 enrolled, 80% completion, fuller charts + table).
- [x] **P3 — No dead controls**: removed the dead "Sync"/"Overview" buttons from score
      charts (added a descriptive subheader instead).
- [x] **P4 — Dead code**: removed the entire inert auth chain (guard/HOC/context/hook).
- [x] **P5 — A11y + meta**: meta description + OG tags + theme-color; aria-label on the
      mobile menu button. All redeployed and verified live.

## Working agreement

- Auto-commit each distinct change (author: repo owner; no AI attribution).
- Push to `origin/frontend-demo` roughly every 20 commits.
- Re-evaluate after each milestone; do not assume done until verified by a clean build
  and a working click-through.

## Progress log

- Created `frontend-demo` branch and defined goals.

## Iteration 4 — correctness pass (Jul 24, 2026, v3.8.0)

Ten features had been committed to the branch but never *released*: no
version bump and no changelog entry, so nothing recorded what was live.
(They had in fact auto-deployed on push — an early read of the live HTML
suggested otherwise, but that probe was grepping client-rendered pages
for strings that only ever exist after hydration. Worth remembering:
`/assignments` and the stepper render client-side, so `curl | grep`
proves nothing about them.) This iteration released and audited them.

Four parallel workstreams (pure utils, API/view correctness, stepper
hardening, UI polish) fixed 15 issues. The ones that mattered: viewing a
session-created assignment showed a *different* assignment, because the
list and detail API routes kept separate copies of the data; CSV exports
executed as formulas when opened in Excel; deadline chips counted
elapsed hours rather than calendar days; and the API route tests had
shipped as **public endpoints**, since Next.js routes every file under
`src/pages`. That last one now has a guard test.

Tests 164 → 249, across 25 → 34 files. Added CI (tests + build on every
push), which the repo had never had despite the suite existing.

README, changelog, deployment notes and this log now match the shipped
product. G6's remaining item — the portfolio card link — lives in
another repo and is still open.

## Iteration 5 — the three things that weren't real (Jul 24, 2026, v3.11.0)

Three releases, each verified on the live deploy:

- **v3.9.0** — created assignments and students survive a reload. They
  used to live in one serverless function's memory and in React state,
  so creating something and navigating away lost it. Now a browser-side
  overlay on the fixtures, with **Reset demo data** on Settings.
- **v3.10.0** — teachers can leave a remark on a submission and the
  student sees it on their history. Seeded from feedback copy that had
  been sitting unused in the fixtures since the beginning.
- **v3.11.0** — the roster editor saves. Its Save button had always
  thrown the result away; the card's count now comes from the roster
  rather than from a count of submission rows.

Tests 249 → 359. CI caught two things local runs did not: a test that
clicked a still-disabled button, and a 5s timeout that only failed
under parallel load. Both were real, and both predate this iteration in
kind — which is the argument for having added CI at all.

Still open: `/assignments` Import is a stub, and several teacher
actions (schedule a review, send a reminder, upload a picture) remain
snackbar-only.

## Iteration 3 — final outcome (Jul 20, 2026, v3.7.2)

Extended past v3.6.0 with deep-linkable assignment analysis pages
(SSG + ISR, reachable from cards, the palette, the insight panel, and
heatmap columns), submission rows opening student profiles, a student
standing strip, an updated 14-URL sitemap, and a full fresh-visitor
acceptance run across both personas — eight touchpoints, zero failures.
Final tally: 58 commits, tests 53 → 119, 14 interconnected pages.

## Iteration 3 — outcome (closed Jul 20, 2026 at v3.6.0)

The loop ran 40+ improve → test → deploy → verify cycles in one day:
v3.3.0 → v3.6.0, test suite 53 → 116, ~100ms static page loads. Ended
with zero dead controls (report, CSV import, assignment editing, and the
inbox all real), one canonical score scale, complete keyboard
operability, print-safe reporting, self-refreshing demo data, and the
README + social card matching the shipped product. Every change was
click-through verified on the live deploy; QA caught and fixed five
regressions the cycle itself introduced.

## Iteration 3 — live-QA loop (Jul 20, 2026, v3.4.0)

Continuous improve → test → deploy → verify-live cycle. Highlights:
interactive notifications, sortable students/history tables (shared
header component), student score trend chart, first-visit welcome
dialog, needs-attention/heatmap layout fixes found by dark-mode and
mobile QA, stepper word counter + error handling, submission-status
chips on student assignments, all-static page serving (~0.1s loads),
and a self-refreshing fixture timeline so demo dates never go stale.
Every change shipped with tests (53 → 97) and was click-through
verified on the live deploy.
