# KidGem acceptance tests and release gates

## Evidence standard
Claude must report commands run, actual outcomes, screenshots reviewed and unresolved failures. Never mark tests passed because a test file exists. If tools or credentials are unavailable, identify the exact unverified behavior and provide a reproducible manual check.

## Demo acceptance matrix
| ID | Scenario | Passing result |
|---|---|---|
| AC01 | New learner opens home and starts a lesson | Reaches a real activity without account/payment; grade/level is clear |
| AC02 | Learner opens My Path | Correct chapter order, current stage and one useful next action |
| AC03 | Complete each of the 12 lessons | Discover, guided task, playable game, six practice items, two challenges and summary work |
| AC04 | Submit wrong answer, request hint, retry | Specific explanation; assistance and first attempt remain recorded |
| AC05 | Score 5/6 independent practice and 2/2 challenges | Mastery awarded once; completion and mastery remain distinct |
| AC06 | Score 6/6 with hints or 1/2 challenge | No false mastery; targeted practice offered |
| AC07 | Replay/reset completed lesson repeatedly | No duplicate cosmetic currency or erased attempt history |
| AC08 | Reload or leave during a lesson | Resumes saved stage; unsupported storage displays a warning |
| AC09 | Switch local learner profile | No accidental progress/reward leakage between profiles |
| AC10 | Switch EN/FR/BN | Navigation persists and renders correctly; missing lesson translation is labeled |
| AC11 | Use keyboard only and touch only | All interactions work, including alternatives to drag/drop |
| AC12 | Enable reduced motion, mute audio and zoom | Tasks remain understandable; no overlap at 200% zoom or 320 px width |
| AC13 | Run an infinite or oversized robot loop | Interpreter stops safely with a useful explanation |
| AC14 | Open every catalogue card and footer link | No dead buttons, fake ready lessons, blank routes or invented contact details |
| AC15 | Visit a direct hash route under /kidgem/ and refresh | Correct screen loads and all assets resolve |
| AC16 | Validate content graph and lesson schema | No cycles, missing prerequisites, invalid answers or duplicate IDs |
| AC17 | Export, reset and import local records | Valid export restores correct profile; malformed import is rejected |
| AC18 | Advance controlled clock to review due date | Appropriate review appears; no punitive streak behavior |

## Meaningful automated tests
Unit-test scoring boundaries, hints/first-attempt classification, mastery, prerequisite graph cycles, next-step selection, reward idempotency and review dates. Component-test feedback and accessible command reordering. End-to-end tests cover new learner → full lesson → reload → next recommendation, profile isolation, locale switching and deployed base paths. Use deterministic question seeds. Avoid snapshot-only tests that merely freeze markup.

Run automated accessibility checks on home, path, lesson, summary and parent screens, then manually inspect focus order, feedback announcements, keyboard use and Bengali rendering. Review screenshots at phone, tablet and desktop widths. Explain any target missed and its effect; do not infer full accessibility conformance from one scanner.

## Production security and data gate
Authenticate real adults; enforce family isolation in API/database policies; verify account recovery, logout and membership revocation. Confirm that client-modified scores cannot award mastery or rewards. Verify protected publishing, draft isolation, sanitized content and absence of secrets in built assets. Demonstrate database restore, failed-write recovery, export and deletion. Test request rate limits and provider spending controls. All data practices must match the final notices and reviewed consent design.

## Content gate
Publish only independently checked answers and educator-reviewed objectives. French and Bengali content needs fluent review. Keep content versions reproducible. Confirm rights for illustrations, audio, fonts and passages. Clearly distinguish planned coverage from published coverage. Do not fabricate reviewers or approvals.

## Release stages
Demo ready: AC01–AC18 satisfied, documented draft-content limitations, successful clean build and local/deployment-path preview. Family beta ready: production security/data gate, reviewed release content, support route and owner configuration complete. Public launch ready: beta issues resolved, restore tested, performance measured, content discovery pages validated and domain/brand decisions confirmed. Complete Grades 1–8: separately audited coverage against the selected curriculum, with no unsupported claims.

## Handoff requirements
Deliver source, lockfile, README, configuration example, content schema, seed content, test commands and results, screenshots or inspection notes, deployment instructions, known limitations and a prioritized remaining-work list. Update STATUS.md with implemented, tested, blocked and next tasks. State explicitly whether the result is a local demo, public demo, production beta or full curriculum product.
