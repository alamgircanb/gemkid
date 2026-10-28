# Implementation decisions (2026-10-28)

Material choices made while building the first milestone, following the build pack defaults unless noted.

1. **Stack**: Vite + React + TypeScript, no router or state library — a ~40-line hash router and a small store keep dependencies minimal. Runtime dependencies are React, React DOM and two OFL font packages.
2. **Hash routing + `/kidgem/` base** for GitHub Pages; `VITE_BASE` overrides for a custom domain.
3. **Unit tests use Node’s built-in `node:test`** with native TypeScript type stripping (Node ≥ 22.18) instead of Vitest — zero extra dependencies, and the pure domain/store code needs no DOM. Component behaviour (feedback, accessible reordering) is covered by Playwright tests against the real built app.
4. **Persistence**: IndexedDB v1 schema (`profiles`, `progress`, `attempts`, `rewards`) behind a `DataStore` interface; a memory store is the visible session-only fallback. Rewards have a unique `(profileId, sourceKey)` key, so awards are idempotent in storage as well as in logic.
5. **Mastery evidence** uses the first submission per item version per session, unassisted (no hints). Retakes use alternative item versions; an identical version counts again only after 24 hours. Best and latest sessions are kept separately. Resetting progress keeps attempts and gems by default.
6. **Prerequisites not taught in the demo** (e.g. counting objects) are treated as prior knowledge assumed by placement, and are labelled “not taught in this demo yet”. Lessons whose prerequisites are taught in the demo show “Suggested first: …” and the recommender offers a bridge lesson.
7. **Default placements** for new profiles are the levels that have demo lessons (Grade 3 math and English; beginner elsewhere), independent of the learner’s school grade. Parents can change them; changes are recorded.
8. **Drafts are playable** in this demo build (`DEMO_MODE`), clearly labelled “Draft demo”. Planned chapters are visible and never link to activities.
9. **Robot coding** uses a data-only command language (forward/left/right/repeat) with limits: 24 blocks, repeat ≤ 20, nesting ≤ 2, 120 steps. No `eval`/`Function`; ESLint forbids them.
10. **Parent Zone gate** is a multiplication question, explicitly labelled as not secure.
11. **Read-aloud** is opt-in and uses the browser’s speech voices; no Bengali voice is promised.
12. **Sandbox limitation**: the build environment could not reach the npm registry, so the lockfile, type check, lint, Vite build and axe scan were not run locally (see STATUS.md). The app was bundled with a preinstalled esbuild for local end-to-end testing.
