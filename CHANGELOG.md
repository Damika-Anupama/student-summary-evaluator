# Change Log

## v3.11.0 — The roster editor does something

###### Jul 24, 2026

The Students chip on every assignment card opened a real-looking
transfer list whose Save threw the result away. It was the last
prominent dead control in the demo.

- Pick who is on an assignment, move students either way, Save — and
  it holds. Reopening shows what you saved; Cancel discards
- The chip's count now comes from that roster, so the chip and the
  editor can't disagree. It previously showed a count of submission
  rows, which read "0 Students" on an assignment you had just created
  and enrolled nobody in
- The picker offers students you added on the Students page too, not
  just the fixture roster
- Rows are keyboard operable as checkboxes with proper labels. Fixed
  two latent a11y bugs found on the way: `aria-labelledby` pointed at
  ids containing spaces, and both select-all boxes announced
  "all items selected"

A roster is stored as one more field on the assignment record rather
than under its own key, so it inherits delete and reset behaviour
instead of needing its own.

Tests 329 → 359.

## v3.10.0 — Teachers can actually reply

###### Jul 24, 2026

The demo showed teachers the analytics and students their scores, but a
teacher could not leave feedback a student would ever see. That round
trip now works, which closes the product's story loop.

- Every submitted row in the **student profile drawer** has an inline
  remark composer. The drawer is the one teacher surface holding both
  halves of a remark's key — one student, and their per-assignment
  submissions. The dead "Send feedback" button, which only fired a
  snackbar, is now **"Leave a remark"**
- Students see remarks on their **history**, alongside the score
- Remarks are seeded from the demo feedback copy that had been sitting
  unused in the fixtures, so the feature looks alive on a first visit;
  teacher-written ones layer on top and **Reset demo data** returns to
  the shipped wording
- Remarks persist in the browser like the rest of the demo data, keyed
  by (student, assignment)

Also: raised the test timeout. One persistence test passed alone but
timed out under full-suite load — a real flake that would have hit CI
on a slower machine.

Tests 295 → 329.

## v3.9.0 — Your changes stay put

###### Jul 24, 2026

Assignments and students you create now survive a reload. Previously
they lived in one serverless function's memory and in React state, so
creating an assignment and navigating away lost it — the demo's most
visible broken promise.

- Anything you create, edit or delete is kept in the browser as an
  **overlay on the fixtures** — created records, patches to fixture
  records, and tombstones — so fixture updates still flow through and
  stored data stays small
- **Reset demo data** on the Settings page returns everything to the
  shipped fixtures, so the demo always has a clean starting state
- Ids are allocated client-side; the server counter restarts at the
  fixture maximum on every cold start and would hand back ids already
  in use in the browser
- A failed API call no longer discards what you typed, and the
  assignments grid falls back to the bundled fixtures instead of
  blanking
- Fixed a latent crash: the roster table read `student.address.city`
  unguarded, so a saved student missing that field would white-screen
  the page

Tests 249 → 295.

## v3.8.0 — Sharper feedback, and the bugs behind it

###### Jul 24, 2026

Ten student- and teacher-facing features that shipped without ever being
released — no version bump, no changelog entry — plus the correctness
pass that auditing them turned up. Test suite 164 → 249.

**New**

- Scored summaries now show **which source concepts were covered and
  which were missed**, a **readability signal** (Clear / Moderate /
  Dense) beside the word count, and can be **copied as plain text** or
  shared as a **permalink that replays the exact result** — scoring is
  deterministic, so the link reproduces the scores and concept
  breakdown
- **One-click sample summaries** (strong and weak) in the stepper, so a
  visitor can see the evaluator work without writing an essay first
- The score trend now leads with **personal best and average**
- **CSV downloads** for the class report (students and assignments) and
  for the assignments table
- AI insights **lead with the biggest class-wide gap**
- Assignment cards carry a **deadline status chip**

**Fixed**

- **Viewing an assignment created during the session showed a different
  assignment.** The list and detail API routes kept separate copies of
  the data; the detail route answered an unknown id with the first
  fixture. They now share one store, and an unknown id 404s
- The view modal always displayed the **current time as the deadline**
  (it read a field the API never sent), and blanked the form whenever an
  assignment had no evaluation text
- **Deadline chips counted elapsed hours, not calendar days** — an
  assignment due later today read "Due in 1 day", and one overdue since
  yesterday morning could still read "Due today"
- **Exported CSV fields starting with `=`, `+`, `-` or `@` executed as
  formulas** when opened in Excel or Sheets. All three exports now route
  through one hardened builder, lead with a UTF-8 BOM so accented names
  survive, and still re-import cleanly
- A score of 50–54 was painted as a warning but read as a positive
  verdict; the two scales are now checked against each other at every
  score
- Share permalinks accepted a blank summary, failed silently on an
  unknown assignment, and could exceed the length a link survives; the
  permalink and deep-link handlers no longer race on load
- The **biggest-gap figure divided by the whole class**, counting
  students who never submitted, and clamped the result to a confident
  "100%"
- Score histograms went silently empty when their data failed to load —
  now an error state with a retry
- Notification and message timestamps were frozen strings ("12m ago")
  that never aged

**Also**

- The assignment picker and the heatmap's student names are now
  **keyboard operable**, matching the cells beside them
- API route tests had shipped as **public endpoints** (Next.js routes
  every file under `src/pages`); a guard test now fails the suite
  instead of the deploy
- CI runs the tests and a production build on every push
- Dropped three unused API routes and four unused stat cards

## v3.7.2 — Student standing at a glance

###### Jul 20, 2026

- The student home now opens with a standing strip — severity-colored
  average, submitted count, what's left to do, and a link to the
  progress page — before dropping into the practice stepper. Works both
  on /dashboard-student and when the role switcher embeds it on /

## v3.7.1 — Fully cross-linked analytics

###### Jul 20, 2026

- Heatmap column headers link to their assignment's analysis page
  (cells already open student profiles — both axes now navigate)
- Submission rows on assignment pages open the student drawer, with
  full keyboard support
- Detail pages verified on mobile and dark mode; sitemap updated to
  cover the report and the five assignment pages (14 URLs)

## v3.7.0 — Assignment detail pages

###### Jul 20, 2026

- New deep-linkable `/assignments/[id]` pages (SSG + hourly ISR) bring
  everything about one assignment together: reading passage, deadline
  status, class stats, content/wording distributions, AI insights, and
  a ranked submissions table with missing students called out
- Reachable from assignment card titles, ⌘K palette assignment entries,
  and a "Full analysis" link on the dashboard's insight panel
- Report tables scroll instead of overflowing on phones

## v3.6.1 — A clean document outline

###### Jul 20, 2026

Accessibility batch driven by a structured UX audit:

- Every page now has exactly one h1 with card titles as h2 sections —
  previously stat values, names, and legend labels rendered as h4/h6
  headings (a theme-level subtitle mapping fix cleaned this app-wide)
- The logo link has an accessible name; the side-nav role switcher is
  keyboard operable; the active nav item carries aria-current="page"
- Verified live on all 9 routes: one h1 each, zero nested headings,
  zero console errors

## v3.6.0 — Import and edit for real

###### Jul 20, 2026

- Students **Import** now works: client-side CSV parsing (quoted
  fields, CRLF, escaped quotes) that round-trips the app's own export
  format, fills sensible defaults, and reports imported/skipped counts
- Assignments can be **edited**: the card's Edit button opens a
  pre-filled modal (title, prompt, passage, deadline) backed by a new
  PUT handler on the demo API; changes show immediately in the grid
- Both were the last prominent "full version" stubs on the teacher side

## v3.5.0 — Printable class report

###### Jul 20, 2026

- New `/report` page: a print-first class report with the KPI summary,
  per-assignment averages, and the per-student roster on the shared
  score scale. Print / Save as PDF hides the screen controls for a
  clean document (PDF output verified — headers repeat across pages)
- Reachable from the teacher side nav and the ⌘K palette, whose
  "Export class report" action now opens the real report instead of
  faking a download. Every action in the demo now does something real

## v3.4.3 — A working inbox

###### Jul 20, 2026

- The Messages icon is now a real inbox popover — school-context
  messages tied to the demo's story (a parent following up on the
  flagged student, a student thank-you, an office announcement), unread
  badge, per-message and mark-all read, fully keyboard operable. It was
  the last control that only fired a snackbar
- Welcome dialog actions stack full-width on phones instead of
  squeezing side by side with wrapped labels

## v3.4.2 — One score language, full keyboard reach

###### Jul 20, 2026

Final pass of the live-QA cycle. Verified clean: zero console errors on
all 8 routes, ~100ms page loads.

- One canonical four-tier score scale everywhere: the student history
  table no longer paints 80-84% orange while the teacher heatmap calls
  the same score healthy blue
- Keyboard access completed: heatmap cells show a focus ring, and
  notification + needs-attention rows are now tabbable and activate on
  Enter/Space (previously mouse-only)
- The home page prerenders the teacher dashboard instead of an empty
  shell (first paint + SEO); heatmap legend no longer clips at the card
  edge; the view-assignment modal only fetches when opened

## v3.4.1 — Consistency & correctness follow-ups

###### Jul 20, 2026

Continued live-QA cycle after the 3.4.0 release.

- Role-consistent demo persona: the account page and avatar menu now
  follow the active role (John Doe as student, Amara Perera as teacher)
- Subtle page-enter transition (disabled under prefers-reduced-motion)
- All four assignment modals are mobile-safe (were fixed 600px);
  the view modal's deadline picker is read-only as intended
- Skip-to-content link; every page has a real h1
- Notification preferences persist on-device (new useLocalStorageState)
- Score histograms color by the shared severity scale; Overall Score
  donut no longer paints "Best" orange and "Normal" green
- KPI weeks are rolling 7-day windows, so "submissions this week"
  can't read 0 right after a weekend; add-student dialog submits on
  Enter; score modal links to the progress page

## v3.4.0 — Live-QA-driven UI/UX pass

###### Jul 20, 2026

Iterative improvement cycle: every change tested, deployed, and verified
on the live site with a headless-browser click-through before moving on.

**Performance**

- All pages now statically generated (dropped `getServerSideProps`);
  the student assignments page uses hourly ISR for its deadline chips.
  Measured live: ~9.8s cold load → ~0.1s
- Fixture timeline shifts at load so the newest submission is always ~2
  days ago — demo dates, KPI week windows, and "live" activity stamps
  never go stale (they had drifted to "9 months ago")

**Teacher experience**

- Interactive notifications: unread badge, per-item mark-as-read, and a
  working "Mark all read"
- Students table: sortable columns (numeric grade sort, aria-sort)
- Needs-attention queue restructured — no more clipped chips at card
  width; cohort heatmap gains diagonal full-text column headers and
  correct per-student cell aria-labels
- Assignments page: skeleton-card loading, delete button properly
  right-aligned with a descriptive aria-label

**Student experience**

- Score trend chart on the grades page (overall/content/wording over
  time, delta chip, data-fitted y-axis)
- Grades history: sortable columns via a shared header component
- Assignments show "Submitted · N/100" chips with "Practice again"
  CTAs; unfinished work sorts first
- Submission stepper: live word counter, whitespace-only answers
  blocked, failed scoring no longer hangs the modal
- Score modal links onward to the progress page

**Onboarding**

- First-visit welcome dialog: explains the demo, offers Teacher or
  Student entry, never nags again

## v3.3.0 — Engineering hardening

###### Jun 30, 2026

Quality, testing, and resilience pass on top of the demo polish.

**Testing**

- Add a Vitest suite (53 tests): pure logic (score bucketing, deadline
  status, score summary), core demo-data functions (KPIs, student
  profile, cohort matrix), and React components (ErrorBoundary, KpiCard,
  grades table) via jsdom + Testing Library
- Two real bugs caught and fixed by tests: a perfect score of 100 was
  dropped from the Overall donut, and empty scores were counted as 0

**Resilience & quality**

- Add an error boundary so a component crash shows a fallback instead of
  white-screening; graceful empty states for all async-data panels
- Custom 500 page; baseline security headers; robots.txt + sitemap.xml

**Performance & hygiene**

- No-flash dark mode on load + OS-preference detection
- Trim web fonts; remove 7 unused deps (incl. the React-19-incompatible
  react-quill/react-draggable); cut audited vulnerabilities 19 → 6

**UX**

- Deep-link "Start summary" to the chosen assignment; student grades
  summary cards; bulk-select export on the students table; keyboard
  access for clickable rows/cells

## v3.2.0 — Mission Control demo polish

###### Jun 30, 2026

UI/UX overhaul of the frontend-only demo (deployed on Vercel).

**Features**

- Add a full dark mode: mode-aware palette and components, a top-nav
  sun/moon toggle, system-preference detection, and no white flash on
  first load
- Make "Add Student" and "Create Assignment" genuinely functional with
  validation and feedback; wire the Add/Remove Students roster to real
  demo data
- Add live, color-coded deadline status on student assignments and
  visual score dials on the result modal

**Fixes**

- Fix the Create Assignment modal crashing on React 19 (react-quill's
  removed findDOMNode); replace the editor with a plain text field
- Fix create success never firing on a 201 response
- Replace placeholder/fake data (hardcoded student counts, fake roster
  names, US states) with the real demo data
- Wire every dead control (account menu, Import/Export, View all, Send
  feedback, Edit) to a real action or feedback

**Quality**

- Add validation to the password form and a custom 500 page
- Accessibility: aria-labels on icon-only buttons
- Define a brand secondary color (was falling back to MUI purple)
- Trim the web-font payload and drop ~307KB of unused template assets

## v3.0.0

###### Feb 24, 2023

- Update dependencies
- Update design system
- Refactor components
- Replace authentication

## v2.1.0

###### Sep 15, 2022

- Integrate Zalter Authentication
- Update dependencies

## v2.0.0

###### Nov 8, 2021

- Migrate to Next.js
- Update design system

## v1.0.0

###### Aug 7, 2020

- Add `eslint`
- Add `Feather Icons`
- Add `Formik` for login/register pages
- Implement `react-router` v6 routing method
- Remove extra views
- Remove `node-sass` dependency
- Update all components to match the PRO version style
- Update dependencies
- Update folder structure to remove folder depth
- Update theme configuration

## v0.4.0

###### Jul 24, 2019

- Adjust theme colors
- Implement `useStyle` hook instead of `withStyles` HOC
- Implement a custom Route component to wrap views in layouts
- Remove `services` and `data` folders, each component has its own data
- Remove unused `.scss` files from `assets` folder
- Replace `.jsx` with `.js`
- Replace Class Components with Function Components
- Replace custom components (Portlet) with Material-UI built-in components
- Replace dependency `classnames` with `clsx`
- Update dependencies
- Update the layout to match the PRO version

## v0.3.0

###### May 13, 2019

- Implement `jsconfig.json` file and removed `.env` to match React v16.8.6 absolute paths
- Update chart styles and options
- Update Dashboard view top widgets styles and structure
- Update few icons to match @material-ui v4 updates
- Update React version to 16.8.6 to support React Hooks
- Update to @material-ui to 4.0.0-beta

## v0.2.0

###### May 11, 2019

- Add docs for IE11 polyfill
- Fix `DisplayMode` component size, when used as a flex child it could grow/shrink
- Fix `ProductCard` component description height
- Fix `Typography` view responsiveness for small devices
- Fix charts responsiveness
- Remove "status" from `ProductCard` component since it was not part of released design
- Remove `auth` service folder since it won't be implemented for this version
- Remove `authGuard` since it won't be used in this version
- Remove unused components from shared components
- Remove unused scss from assets
- Update README.md

## v0.1.0

###### May 2, 2019

### Initial commit
