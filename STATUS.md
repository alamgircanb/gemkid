# KidGem — status

**Result type: public-demo-ready source (local-progress demo).** Not a production beta: no accounts, no backend, no reviewed content.
Last updated: 2026-10-28.

## Milestones

| Milestone | State |
|---|---|
| 1. Foundation + first complete lesson (save/resume, next recommendation) | Done |
| 2. All 12 demo lessons, six reusable games, mastery, rewards, review, parent view | Done |
| 3. GitHub CI + Pages workflow, `/kidgem/` base path | Written; local base-path behaviour tested; **not yet run on GitHub** |
| 4. Design/accessibility review | Partly done (see docs/ACCESSIBILITY.md) |
| 5. Production backend, accounts, content publishing (doc 05, phases 4–5) | Not started |

## Checks actually run (sandbox, 2026-10-28)

| Check | Command | Result |
|---|---|---|
| Content validation | `node scripts/validate-content.ts` | Pass — 12 lessons, 19 skills, 36 chapters, 96 assessment items; all answers evaluate, robot references reach goals, patterns repeat, graph acyclic |
| Unit tests | `node --test "tests/unit/**/*.test.ts"` | **45 passed, 0 failed** |
| Type check | `tsc --noEmit` (TypeScript 7.0.2 available in sandbox, with React/Node types fetched from DefinitelyTyped) | Pass (0 errors) |
| End-to-end | Playwright 1.63, Chromium, against a production bundle served at `/kidgem/` | **31 passed** (26 desktop + 5 phone-emulation), including every game played to completion with buttons only |
| Visual review | Screenshots at 390 / 768 / 1280 px incl. Bengali interface | Reviewed; header overflow and duplicated hint text fixed |
| Bundle size | esbuild minified JS | 147 KB gzip (budget 250 KB) |

### Not run in the sandbox (npm registry was blocked)

- `npm install` / **lockfile** (`package-lock.json` is not committed yet) — CI falls back to `npm install` until one is committed.
- **Vite** dev server and `vite build` — the app was bundled with a preinstalled esbuild for testing instead.
- **ESLint** (`npm run lint`).
- **axe-core** scan (`tests/e2e/a11y.spec.ts`).
- Real screen readers, real 200 %/400 % browser zoom, real devices, Noto Sans Bengali rendering.

These all run in GitHub Actions on the first push; check the Actions tab.

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
| AC15 | Pass | e2e direct hash routes + refresh under /kidgem/, no 4xx assets (on local server) |
| AC16 | Pass | validator + unit tests for cycles, missing prereqs, bad answers, duplicate IDs, fake publication |
| AC17 | Pass | e2e export → delete → import; malformed import rejected |
| AC18 | Pass | e2e with controlled clock; unit schedule tests |

## Known limitations / next tasks

1. Push to `github.com/alamgircanb/kidgem`, enable **Settings → Pages → Source: GitHub Actions**, confirm the workflow is green, then commit the `package-lock.json` that `npm install` produces.
2. Fix anything CI reports from lint/axe (not run locally).
3. Educator review of all 12 lessons; fluent French and Bengali review of lessons and interface dictionaries (docs/COVERAGE.md).
4. Manual screen-reader and real-zoom passes; Bengali font check on devices.
5. Write alternative item versions for the 8 lessons that lack them.
6. Owner decisions (doc 09): licence, domain/brand clearance, curriculum jurisdiction, backend provider, support contact.
7. Phase 4 (accounts/backend) and Phase 5 (content publishing) per docs/08_CLAUDE_PHASE_PROMPTS.md.
