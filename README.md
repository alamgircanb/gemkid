# GemKid — Play. Learn. Grow.

GemKid is a learning portal **demo** for Grades 1–8: math, logic and brain games, coding, algorithms, English, French and Bengali. Children follow a visible path, see one clear next step, learn through a fixed cycle (Discover → Guided try → Play → Practice → Challenge → Reflect → Summary) and get feedback that teaches.

> **Status: public demo, not a production product.** The app runs fully in the browser with device-only progress (IndexedDB). It has 12 complete **draft** lessons that have not been reviewed by educators or fluent-language reviewers. There are no accounts, no backend and no cloud sync. See [STATUS.md](STATUS.md).

## What is in the demo

| Track | Lessons (draft) | Game |
|---|---|---|
| Math (Grade 3) | Equal groups · Multiplication arrays | Gem Groups |
| Logic (beginner) | Pattern bridges · Gem detective (deduction) | Pattern Bridge · Treasure Search (clues) |
| Coding (beginner) | Robot sequences · Repeat loops | Robot Route (bounded command interpreter) |
| Algorithms (beginner) | Step ordering · Linear search | Step Workshop · Treasure Search |
| English (Grade 3) | Sentence order · Passage comprehension | Sentence Workshop · Word Garden |
| French / Bengali (beginner) | Greetings · First letters অ আ ই ক | Word Garden |

Each lesson has a worked explanation, 2 guided tasks, a playable game, 6 practice items, 2 transfer challenges and a reflection — 96 assessment items in total, most with alternative versions for “fresh set” retakes.

Also included: learner profiles (nickname + preset gem avatar), dashboard with a Continue card, subject paths (list and optional map view), chapter pages, mastery and review scheduling (2/7/21 days), cosmetic-only gems and ranks, a Parent Zone (evidence, level changes, export/import/reset/delete), settings (EN/FR/বাংলা interface, theme, motion, contrast, text size, opt-in read-aloud) and honest planned-coverage labels for Grades 1–8.

## Requirements

- Node.js **22.18 or newer** (unit tests and the content validator run TypeScript directly with Node’s built-in type stripping).
- npm 10+.

## Commands

```bash
npm ci                 # clean install from the lockfile
npm run dev            # dev server at http://localhost:5173/gemkid/
npm run validate       # content schema, answers, IDs, solvability, prerequisite graph
npm test               # unit tests (node:test) for scoring, mastery, graph, recommendations, rewards, review, robot, store, i18n
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run build          # production build into dist/ (base path /gemkid/)
npm run preview        # serve dist/ at http://127.0.0.1:4173/gemkid/
npx playwright install chromium   # once
npm run test:e2e       # end-to-end + accessibility tests (builds and serves under /gemkid/)
npm run check          # typecheck + lint + validate + unit tests + build
```

For a custom domain at the root, build with `VITE_BASE=/ npm run build`.

## Deploying to GitHub Pages

1. Push to `main` on `github.com/alamgircanb/gemkid`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time owner step).
3. The workflow `.github/workflows/ci.yml` runs type check, lint, content validation, unit tests, build and Playwright tests, then deploys `dist/` to Pages. The site will be at `https://alamgircanb.github.io/gemkid/`.

Rollback: re-run the deploy job of an earlier successful workflow run (Actions → choose run → Re-run jobs), or `git revert` the bad commit and push.

## Project structure

```
src/app         router (hash-based), layout, store (state + persistence), error boundary
src/components  artwork (Lumi mascot, shapes, robot), shared UI
src/features    lesson player, item views, accessible order builder, robot editor, six games
src/domain      pure logic: answers, mastery, prerequisite graph, recommendations, rewards, review, robot interpreter
src/content     curriculum graph, chapters, 12 lessons, validator
src/services    IndexedDB adapter, memory fallback, export/import validation, disabled analytics
src/i18n        typed EN/FR/BN dictionaries
tests/unit      node:test unit tests
tests/e2e       Playwright tests mapped to acceptance IDs AC01–AC18
docs            build pack specifications + coverage, assets, accessibility, decisions
```

## Honesty rules this codebase follows

- Draft lessons are labelled “Draft demo”; planned topics are labelled “Planned” and are never linked to fake activities.
- No invented reviewers, testimonials, statistics, curriculum alignment or domain ownership.
- Mastery ≠ completion; scores are learning evidence, never ability or IQ labels.
- Gems buy decorations only; awards are idempotent per lesson version.
- Learner code is interpreted by a bounded command language — never `eval`.

## Licence

No open-source licence has been chosen yet (owner decision). Fonts (Nunito, Noto Sans Bengali) are under the SIL Open Font License; see [docs/ASSETS.md](docs/ASSETS.md).
