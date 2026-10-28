# GemKid — status

**Result type: public demo, live at https://alamgircanb.github.io/gemkid/ (local-progress demo).** Not a production beta: no accounts, no backend, no reviewed content.
Last updated: 2026-10-28.

## Milestones

| Milestone | State |
|---|---|
| 1. Foundation + first complete lesson (save/resume, next recommendation) | Done |
| 2. All 12 demo lessons, six reusable games, mastery, rewards, review, parent view | Done |
| 3. GitHub CI + Pages workflow, `/gemkid/` base path | Done — CI green and deployed on 2026-10-28 |
| 4. Design/accessibility review | Partly done (see docs/ACCESSIBILITY.md) |
| 5. Production backend, accounts, content publishing (doc 05, phases 4–5) | Not started |

## Checks actually run (sandbox, 2026-10-28)

| Check | Command | Result |
|---|---|---|
| Content validation | `node scripts/validate-content.ts` | Pass — 12 lessons, 19 skills, 36 chapters, 96 assessment items; all answers evaluate, robot references reach goals, patterns repeat, graph acyclic |
| Unit tests | `node --test "tests/unit/**/*.test.ts"` | **45 passed, 0 failed** |
| Type check | `tsc --noEmit` (TypeScript 7.0.2 available in sandbox, with React/Node types fetched from DefinitelyTyped) | Pass (0 errors) |
| End-to-end | Playwright 1.63, Chromium, against a production bundle served at `/gemkid/` | **31 passed** (26 desktop + 5 phone-emulation), including every game played to completion with buttons only |
| Visual review | Screenshots at 390 / 768 / 1280 px incl. Bengali interface | Reviewed; header overflow and duplicated hint text fixed |
| Bundle size | esbuild minified JS | 147 KB gzip (budget 250 KB) |

### GitHub Actions (2026-10-28, run 40692366839)

- Type check, ESLint, content validation, unit tests, Vite build: **pass**.
- Playwright on GitHub (built app under `/gemkid/`), including the **axe-core scan** of home, explore, dashboard, path, lesson, summary and parent screens: **32 passed**.
- Deploy to GitHub Pages: **success**.

The first run exposed two issues (radio inputs not clickable by the newer Playwright; logo link name mismatch flagged by axe); both were fixed.

### Still not done

- No `package-lock.json` is committed yet (this sandbox cannot reach the npm registry). CI uses `npm install` until one is added — run `npm install` locally and commit the lockfile.
- Real screen readers, real 200 %/400 % browser zoom, real devices and Bengali font rendering on phones.

## Acceptance matrix (document 07)

| ID | State | Evidence |
|---|---|---|
| AC01 | Pass | e2e “new learner → full lesson” |
| AC02 | Pass | Path screen, recommendation + “Why this next?”; unit tests for recommender |
| AC03 | Pass | e2e plays all 12 lessons end to end; `games.spec.ts` completes all six games across their lessons |
| AC04 | Pass | e2e wrong answer + hint; attempts keep `firstAttempt` and `hintsUsed` |
| AC05 | Pass | e2e + unit: 5/6 + 2/2 → mastery awarded once |
| AC06 | Pass | unit: 6/6 with hints or 1/2 challenge → no mastery; e2e 4/6 → “Needs another try” |
| AC07 | Pass | e2e replay keeps 25 gems; unit idempotency; storage-level unique key |
| AC08 | Pass | e2e reload mid-lesson and after answering; storage-unavailable warning e2e; failed-write unit test |
| AC09 | Pass | e2e + unit profile isolation |
| AC10 | Pass | e2e EN→FR→BN, persistence, English-only lesson notice |
| AC11 | Partial | keyboard-only ordering e2e passes; touch tested via phone emulation only; no drag anywhere |
| AC12 | Partial | no overflow at 320/768/1280; reduced motion + large text; real zoom not tested |
| AC13 | Pass | e2e oversized loop stops at 120 steps with message; unit limits |
| AC14 | Pass | e2e opens every catalogue and footer link; planned chapters not linked |
| AC15 | Pass | e2e direct hash routes + refresh under /gemkid/, no 4xx assets (on local server) |
| AC16 | Pass | validator + unit tests for cycles, missing prereqs, bad answers, duplicate IDs, fake publication |
| AC17 | Pass | e2e export → delete → import; malformed import rejected |
| AC18 | Pass | e2e with controlled clock; unit schedule tests |

## Known limitations / next tasks

1. Commit a `package-lock.json` (run `npm install` on a machine with npm access).
2. Manual accessibility passes listed above.
3. Educator review of all 12 lessons; fluent French and Bengali review of lessons and interface dictionaries (docs/COVERAGE.md).
4. Manual screen-reader and real-zoom passes; Bengali font check on devices.
5. Write alternative item versions for the 8 lessons that lack them.
6. Owner decisions (doc 09): licence, domain/brand clearance, curriculum jurisdiction, backend provider, support contact.
7. Phase 4 (accounts/backend) and Phase 5 (content publishing) per docs/08_CLAUDE_PHASE_PROMPTS.md.
