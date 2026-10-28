# KidGem technical architecture

## Two explicit deployment modes
Demo: Vite, React and TypeScript with a pinned lockfile, static assets, hash routing and local device progress. This can be hosted on GitHub Pages. Production: retain the reusable frontend and content engine, add an authenticated API and relational database on a separately configured service. GitHub hosts source control; GitHub Pages is static hosting, not an account database or private backend. Do not place secrets or personal records in a public repository.

Version choice is made at implementation time from current stable official releases. Document versions and runtime requirements; do not blindly install a version number inferred from this planning pack. Prefer minimal dependencies. Use CSS variables and reusable React components; use a tested internationalization library if it simplifies typed dictionaries.

## Suggested repository structure
- src/app — router, app providers, error boundaries and layouts.
- src/components — accessible buttons, navigation, feedback, dialogs and lesson stages.
- src/features — profiles, pathways, lessons, games, progress, rewards and parent view.
- src/domain — pure scoring, mastery, prerequisite and recommendation functions.
- src/content — lessons, curriculum graph, locale dictionaries and validation schemas.
- src/services — interfaces and local/remote adapters for progress and profiles.
- public/assets — licensed local images, fonts and audio.
- tests — domain unit tests, component behavior and end-to-end flows.
- docs — this pack, architecture decisions, coverage and operational guides.
- .github/workflows — build/test and explicit deployment workflow.

## Demo data storage
Use IndexedDB for versioned local profiles, attempts and rewards, behind repository interfaces. A small preference can use localStorage. Handle blocked storage, quota errors and corrupt records with a visible warning and session-only fallback; never silently claim a save succeeded. Add export/import with schema validation and a reset confirmation. Demo profiles use nicknames and preset avatars; do not collect email, birthdate, photo or school. State that device users can access local records and clearing browser data may erase progress. A parent UI gate is a convenience in the demo, not secure authentication.

## Proposed production entities
| Entity | Key fields and relationships |
|---|---|
| Family | id, adult owner account, timezone, creation time |
| Membership | userId, familyId, role, invitation state |
| LearnerProfile | id, familyId, nickname, gradeBand, preferences |
| SubjectPlacement | learnerId, subjectId, level, override history |
| Skill | id, subject, prerequisites, curriculum references |
| LessonVersion | lessonId, version, locale, review status, content snapshot |
| Attempt | id, learnerId, lesson/version/item, sessionId, answer, firstAttempt, hintsUsed, correctness, timestamp |
| Progress | learnerId, skillId, derived evidence, resume stage, updatedAt |
| RewardEvent | id, learnerId, sourceKey unique, delta, reason |
| ConsentRecord | adultId, versioned notice, action, timestamp, applicable scope |
| ContentAudit | editorId, operation, lesson/version, timestamp |

Progress is derived from stored attempts; clients cannot directly assign mastered status in production. Award rewards in a transaction with a unique source key. Use idempotency keys for retried writes and an append-only event model for attempts. A migration maps local profile IDs to server IDs only after an adult opts in; imported results are labeled device-imported rather than independently verified server evidence.

## API behavior for production
Define validated, versioned contracts for profile list/create/update/delete; lesson catalogue/read; attempt submission; progress read; reward transactions; family export/delete; content draft/review/publish. Require authentication and resource-level family checks on every private endpoint. Never trust a familyId, role or learnerId merely because it is in a request. Content editors cannot access family records by default. Restrict publication to an explicit publishing role. Use an established authentication provider; do not invent password cryptography.

Test that family A cannot read, change, export or delete family B's data by replacing identifiers. Expired invitations and revoked memberships must fail. Cookies or tokens must follow the chosen provider's current guidance. Validate inputs, rate-limit sensitive endpoints, sanitize content and avoid logging answers containing personal text. Keep service-role keys and email/AI credentials on the backend. A frontend route guard is never the only authorization control.

## Quality and performance
Split game bundles by route and preload only the next small lesson assets. Avoid a 3D engine for an illustrative map. Responsive SVG/CSS is sufficient. Use error boundaries, loading/empty/offline states, timeouts and recoverable retries. Proposed budgets: initial core JS below 250 KB gzip, first lesson assets below 1 MB excluding optional audio. Measure and document exceptions rather than asserting compliance without results. Test on a mid-range phone and constrained network.

## GitHub workflow
README includes clean-clone install, dev, validation, test, build, preview and deploy commands. Commit the lockfile, content schemas, license choices, .gitignore and .env.example with placeholders only. CI uses a compatible pinned runtime, clean install, type checking, lint, content validation, meaningful tests and production build. Use least-privilege deployment permissions, protect production environments and avoid giving pull-request code production secrets.

The Pages workflow builds `dist` with the correct base path and publishes only static output. Validate that `/kidgem/#/lesson/...` and asset URLs work in preview. Supply the workflow but do not purchase services, create billable resources, push to an unknown remote or publish without owner authorization. Deployment credentials and hosting choice are owner configuration steps, not things Claude may fabricate.

## Operations for production
Document database migrations, rollback, backups and a restore rehearsal. Set hosting/API spending alerts and rate limits before enabling paid services. Provide error monitoring with data minimization, an incident contact and dependency update process. Test export/deletion across active data and documented backup retention. Final notices and child-data consent requirements depend on the actual markets and data flow; obtain qualified review before real family data is collected. Do not claim legal compliance based on this specification.
